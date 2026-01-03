
import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy"
import { db } from "@/lib/firebase"
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore"

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text()
        const signature = req.headers.get("x-signature") || ""
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ""

        if (!verifyWebhookSignature(rawBody, signature, secret)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const { meta, data } = payload
        const eventName = meta.event_name

        // 1. Handle Subscription Events (Created/Updated/Cancelled)
        if (eventName.startsWith("subscription_")) {
            const userId = meta.custom_data?.userId
            const attributes = data.attributes
            const subscriptionId = data.id

            if (userId) {
                const userRef = doc(db, "users", userId)

                await updateDoc(userRef, {
                    isPremium: attributes.status === "active",
                    subscription: {
                        status: attributes.status,
                        planId: attributes.product_name, // e.g. "Pro Monthly"
                        periodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
                        lemonSqueezySubscriptionId: subscriptionId,
                        customerPortalUrl: attributes.urls.customer_portal,
                    }
                })
            }
        }

        // 2. Handle One-Time Orders (Pay-per-generation)
        if (eventName === "order_created") {
            const userId = meta.custom_data?.userId
            const generationId = meta.custom_data?.generationId // If unlocking specific doc
            const attributes = data.attributes

            if (userId && generationId && attributes.status === "paid") {
                // Unlock specific history item
                const historyRef = doc(db, "users", userId, "history", generationId)
                // We can check if it exists or just update
                // Using startAfter/etc usually for history, but here we assume direct ID access

                // Wait, history stored in subcollection? Let's verify history path in next step.
                // Assuming structure /users/{uid}/history/{genId} based on implementation_plan

                await updateDoc(historyRef, {
                    isUnlocked: true,
                    unlockedAt: new Date().toISOString(),
                    paymentId: data.id
                })
            }
        }

        return NextResponse.json({ received: true })

    } catch (err: any) {
        console.error("Webhook error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
