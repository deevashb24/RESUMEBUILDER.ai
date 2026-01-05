import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !secret) return NextResponse.json({ error: "Config/Sig missing" }, { status: 400 });

        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(rawBody);
        if (hmac.digest("hex") !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

        const payload = JSON.parse(rawBody);
        const event = payload.event;

        // 1. Handle Recurring Subscription
        if (event === "subscription.charged" || event === "subscription.activated") {
            const sub = payload.payload.subscription.entity;
            const userId = sub.notes?.userId;
            if (userId) {
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
                console.log(`✅ Subscription Active: ${userId}`);
            }
        }

        // 2. Handle One-Time Unlock
        else if (event === "payment.captured") {
            const payment = payload.payload.payment.entity;
            const notes = payment.notes || {};

            if (notes.userId && notes.planType === 'one-time') {
                const generationId = notes.generationId;
                if (generationId) {
                    await adminDb.collection("users").doc(notes.userId).update({
                        unlockedGenerations: FieldValue.arrayUnion(generationId)
                    });
                    console.log(`🔓 Unlocked Doc ${generationId} for ${notes.userId}`);
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}