import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    
    // 1. Verify Secret
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) {
      console.error("❌ Configuration Error: LEMONSQUEEZY_WEBHOOK_SECRET is missing.")
      return NextResponse.json({ error: "Server config error" }, { status: 500 })
    }

    // 2. Validate Header
    const signatureHeader = request.headers.get("x-signature")
    if (!signatureHeader) {
      console.error("❌ Missing x-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // 3. Calculate Hash
    const hmac = crypto.createHmac("sha256", secret)
    const digestString = hmac.update(text).digest("hex")
    const signatureHeaderString = signatureHeader

    // 4. Robust Comparison (Fixes the 500 Crash issue)
    const digestBuffer = Buffer.from(digestString, "utf8")
    const signatureBuffer = Buffer.from(signatureHeaderString, "utf8")

    // Check lengths first to avoid crypto.timingSafeEqual throwing an error
    if (digestBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
      console.error("❌ Signature Mismatch!")
      console.log(`   Secret Used: ${secret.substring(0, 3)}... (Length: ${secret.length})`)
      console.log(`   Calculated:  ${digestString}`)
      console.log(`   Received:    ${signatureHeaderString}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 5. Process Payload

    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    
    // FIX: Check for both 'userId' AND 'user_id'
    const customData = payload.meta.custom_data || {}
    const userId = customData.userId || customData.user_id

    console.log(`🔔 Webhook Verified: ${eventName} for User: ${userId}`)

    if (eventName === "order_created" || eventName === "subscription_created") {
      if (userId) {
         try {
           // 6. DB Write (Protected from crashing the whole webhook)
           await adminDb.collection("users").doc(userId).set({ 
             isPremium: true,
             premiumSince: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           }, { merge: true })
           
           console.log(`✅ DATABASE UPDATED: Premium active for ${userId}`)
         } catch (dbError) {
           console.error("❌ Firestore Write Error:", dbError)
           // Return 200 anyway so Lemon Squeezy stops retrying (since logic failed, not connection)
           return NextResponse.json({ error: "Database error" }, { status: 200 })
         }
      } else {
         console.warn("⚠️ User ID missing in webhook metadata")
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error("❌ Critical Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 })
  }
}