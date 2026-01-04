import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

        // Verify signature
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(rawBody);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;
        console.log(`🔔 Razorpay Payload Event: ${event}`);

        // --- CASE 1: SUBSCRIPTION SUCCEEDED (Recurring) ---
        if (event === "subscription.charged" || event === "subscription.activated") {
            const sub = payload.payload.subscription.entity;
            const userId = sub.notes?.userId;

            if (userId) {
                console.log(`✅ Subscription Recurred for User: ${userId}`);
                await adminDb.collection("users").doc(userId).set({
                    isPremium: true,
                    updatedAt: new Date().toISOString(),
                    subscription: {
                        status: "active",
                        planId: sub.plan_id,
                        periodEnd: sub.current_end,
                        type: 'razorpay'
                    }
                }, { merge: true });
            }
        }

        // --- CASE 2: ONE-TIME PAYMENT (Single Unlock) ---
        else if (event === "payment.captured") {
            const payment = payload.payload.payment.entity;
            const notes = payment.notes || {};
            const userId = notes.userId;
            const planType = notes.planType;

            // Only process 'one-time' here (Subscriptions are handled above)
            if (userId && planType === 'one-time') {
                const generationId = notes.generationId;

                if (generationId) {
                    console.log(`🔓 Unlocking Generation ${generationId} for User ${userId}`);
                    await adminDb.collection("users").doc(userId).update({
                        unlockedGenerations: FieldValue.arrayUnion(generationId)
                    });
                } else {
                    console.warn(`⚠️ Payment captured but Usage: generationId missing for user ${userId}`);
                }
            } else {
                console.log(`ℹ️ Payment captured ignored (likely subscription payment). Plan: ${planType}`);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
