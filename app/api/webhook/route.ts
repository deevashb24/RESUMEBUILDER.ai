import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
    const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8")
    const signature = Buffer.from(request.headers.get("x-signature") || "", "utf8")

    // 1. Verify the request comes from Lemon Squeezy (Security)
    if (!crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data
    const userId = customData?.userId

    // 2. Handle Payment Success
    if (eventName === "order_created" || eventName === "subscription_created") {
      if (userId) {
         // Upgrade the user in Firebase
         await updateDoc(doc(db, "users", userId), { 
           isPremium: true,
           premiumSince: new Date().toISOString()
         })
         console.log(`User ${userId} upgraded to Premium`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error("Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
  }
}