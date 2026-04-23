import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Using Service Role Key to bypass RLS, fallback to anon if missing
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) return NextResponse.json({ error: "Server config error" }, { status: 500 })

    // Verify Signature
    const hmac = crypto.createHmac("sha256", secret)
    const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8")
    const signature = Buffer.from(request.headers.get("x-signature") || "", "utf8")

    if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data || {}
    const userId = customData.userId || customData.user_id
    // Check for specific unlock
    const generationId = customData.generationId || customData.generation_id

    if ((eventName === "order_created" || eventName === "subscription_created") && userId) {
      const supabase = getAdminClient()

      if (generationId) {
        // Case 1: One-Time Unlock
        const { data: user } = await supabase.from('users').select('unlockedGenerations').eq('id', userId).single()
        const currentUnlocks = user?.unlockedGenerations || []

        await supabase.from("users").update({
          unlockedGenerations: Array.from(new Set([...currentUnlocks, generationId]))
        }).eq('id', userId)

        console.log(`🔓 LemonSqueezy: Unlocked ${generationId} for ${userId}`);
      } else {
        // Case 2: Subscription -> Grant Premium
        await supabase.from("users").upsert({
          id: userId,
          isPremium: true,
          premiumSince: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        console.log(`💎 LemonSqueezy: Premium Granted to ${userId}`);
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
  }
}