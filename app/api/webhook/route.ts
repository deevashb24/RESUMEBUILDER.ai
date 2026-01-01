import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore" // Changed to setDoc for safety

export async function POST(request: NextRequest) {
  try {
    // 1. Capture Raw Body for Signature Verification
    const text = await request.text()
    
    // 2. Verify Secret Exists
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) {
      console.error("❌ Missing LEMONSQUEEZY_WEBHOOK_SECRET in .env")
      return NextResponse.json({ error: "Server config error" }, { status: 500 })
    }

    // 3. Verify Signature
    const hmac = crypto.createHmac("sha256", secret)
    const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8")
    const signatureHeader = request.headers.get("x-signature")
    
    if (!signatureHeader) {
      console.error("❌ Missing x-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const signature = Buffer.from(signatureHeader, "utf8")

    if (!crypto.timingSafeEqual(digest, signature)) {
      console.error("❌ Invalid Signature. Check your Webhook Secret.")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 4. Parse & Process
    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data
    const userId = customData?.userId

    console.log(`🔔 Webhook Received: ${eventName}`)
    console.log(`👤 User ID from Payload:`, userId)

    if (eventName === "order_created" || eventName === "subscription_created") {
      if (userId) {
         // Using setDoc with merge:true is safer than updateDoc
         // It works even if the document is missing some fields
         await setDoc(doc(db, "users", userId), { 
           isPremium: true,
           premiumSince: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         }, { merge: true })
         
         console.log(`✅ SUCCESS: User ${userId} upgraded to Premium in Firestore.`)
      } else {
        console.error("⚠️ Webhook received but NO userId found in custom_data.")
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error("❌ Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
  }
}