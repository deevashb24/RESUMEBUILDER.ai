import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const { userId, planType, generationId } = await req.json();

        if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // --- BRANCH 1: ONE-TIME PAYMENT (Unlock) ---
        if (planType === 'one-time') {
            const amount = 19999; // ₹199.99 (in paise)

            const options = {
                amount: amount,
                currency: "INR",
                receipt: "rcpt_" + Date.now(),
                notes: {
                    userId,
                    planType: 'one-time',
                    generationId: generationId || "" // Store as 'generationId'
                },
            };

            const order = await razorpay.orders.create(options);
            return NextResponse.json({
                orderId: order.id,
                amount: order.amount,
                description: "Single Document Unlock",
                mode: 'payment'
            });
        }

        // --- BRANCH 2: SUBSCRIPTION ---
        let planId = "";
        if (planType === 'monthly') planId = process.env.RAZORPAY_PLAN_ID_MONTHLY!;
        if (planType === 'quarterly') planId = process.env.RAZORPAY_PLAN_ID_QUARTERLY!;

        if (!planId) return NextResponse.json({ error: "Missing Plan ID" }, { status: 500 });

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120,
            notes: { userId, planType }
        });

        return NextResponse.json({
            subscriptionId: subscription.id,
            description: `Pro Subscription (${planType})`,
            mode: 'subscription'
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}