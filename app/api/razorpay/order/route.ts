
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const { userId, planType } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Determine amount based on planType
        // Default (subscription) = ₹499.00 -> 49900 paise
        // One-time = ₹199.99 -> ~19999 paise
        let amount = 49900;
        let description = "Pro Subscription (Lifetime)";

        if (planType === 'one-time') {
            amount = 19999; // 199.99 INR
            description = "Single Document Unlock";
        }

        const options = {
            amount: amount,
            currency: "INR",
            receipt: userId,
            notes: { userId, planType },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ orderId: order.id, amount: order.amount, description });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
