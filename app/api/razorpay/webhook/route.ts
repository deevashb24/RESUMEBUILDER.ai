
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Verify signature
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(rawBody);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;

        if (event === "payment.captured") {
            const payment = payload.payload.payment.entity;
            const userId = payment.notes?.userId;

            if (userId) {
                console.log(`Processing Razorpay payment for User: ${userId}`);

                await adminDb.collection("users").doc(userId).set({
                    isPremium: true,
                    paymentMethod: "Razorpay/UPI",
                    updatedAt: new Date().toISOString(),
                    subscription: {
                        status: "active",
                        planId: "lifetime_razorpay", // Tracking it distinctly
                        periodEnd: null, // Lifetime
                    }
                }, { merge: true });

                console.log(`Successfully upgraded user ${userId} to Premium`);
            } else {
                console.warn("Payment captured but no userId found in notes");
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
