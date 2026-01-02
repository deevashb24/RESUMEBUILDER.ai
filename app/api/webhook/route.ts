import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { adminDb } from "@/lib/firebase-admin" // <--- IMPORT ADMIN DB

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    
    // 1. Verify Secret
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) return NextResponse.json({ error: "Server config error" }, { status: 500 })

    // 2. Verify Signature
    const hmac = crypto.createHmac("sha256", secret)
    const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8")
    const signature = Buffer.from(request.headers.get("x-signature") || "", "utf8")

    if (!crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 3. Process Payload
    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    const userId = payload.meta.custom_data?.userId

    console.log(`🔔 Webhook: ${eventName} for User: ${userId}`)

    if (eventName === "order_created" || eventName === "subscription_created") {
      if (userId) {
         // 4. USE ADMIN SDK TO WRITE (Bypasses Rules)
         await adminDb.collection("users").doc(userId).set({ 
           isPremium: true,
           premiumSince: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         }, { merge: true })
         
         console.log(`✅ SUCCESS: Premium activated for ${userId}`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error("❌ Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
  }
}