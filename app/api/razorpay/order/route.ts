
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const { userId, planType, generationId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // --- BRANCH 1: ONE-TIME PAYMENT (Uses Orders API) ---
        if (planType === 'one-time') {
            const amount = 19999; // ₹199.99
            const description = "Single Document Unlock";

            const options = {
                amount: amount,
                currency: "INR",
                receipt: "rcpt_" + Date.now(),
                notes: {
                    userId,
                    planType,
                    generationId: generationId || "" // IMPORTANT: Pass generationId for specific unlock
                },
            };

            const order = await razorpay.orders.create(options);
            return NextResponse.json({
                orderId: order.id,
                amount: order.amount,
                description,
                mode: 'payment'
            });
        }

        // --- BRANCH 2: SUBSCRIPTION (Uses Subscriptions API) ---
        let planId = "";
        if (planType === 'monthly') planId = process.env.RAZORPAY_PLAN_ID_MONTHLY!;
        if (planType === 'quarterly') planId = process.env.RAZORPAY_PLAN_ID_QUARTERLY!;

        if (!planId || planId.includes("YourMonthlyId")) {
            console.error("RAZORPAY PLAN ID MISSING for:", planType);
            return NextResponse.json({ error: "Server misconfiguration: Missing Plan ID" }, { status: 500 });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // 10 years (indefinite)
            notes: {
                userId: userId,
                planType: planType
            }
        });

        return NextResponse.json({
            subscriptionId: subscription.id,
            description: `Pro Subscription (${planType})`,
            mode: 'subscription'
        });

    } catch (error) {
        console.error("Razorpay Order/Sub Error:", error);
        return NextResponse.json({ error: "Failed to create order/subscription" }, { status: 500 });
    }
}
