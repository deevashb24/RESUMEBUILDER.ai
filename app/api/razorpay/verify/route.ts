import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/razorpay/verify
 *
 * Called client-side immediately after Razorpay's handler() fires.
 * Verifies the payment signature, then immediately writes the unlock to
 * Supabase — this removes the race with the async webhook.
 *
 * Body:
 *   razorpay_payment_id  — from handler response
 *   razorpay_order_id    — from handler response
 *   razorpay_signature   — from handler response
 *   userId               — clerk user id
 *   planType             — 'one-time' | 'monthly' | 'quarterly'
 *   generationId?        — present for one-time unlocks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      planType,
      generationId,
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ── 1. Verify HMAC signature ────────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("⚠️ Razorpay verify: invalid signature for payment", razorpay_payment_id);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 401 });
    }

    // ── 2. Signature is valid — update Supabase immediately ────────────
    const supabase = createAdminClient();

    if (planType === "one-time" && generationId) {
      // One-time document unlock
      const { data: user } = await supabase
        .from("users")
        .select("unlockedGenerations")
        .eq("id", userId)
        .single();

      const currentUnlocks: string[] = user?.unlockedGenerations || [];
      const newUnlocks = Array.from(new Set([...currentUnlocks, generationId]));

      const { error, count } = await supabase
        .from("users")
        .update({
          unlockedGenerations: newUnlocks,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", userId)
        .select() // needed for count to be populated

      if (error) {
        console.error("Supabase unlock error:", error);
        return NextResponse.json({ error: "DB update failed", detail: error.message }, { status: 500 });
      }

      // count === 0 means the userId row doesn't exist in the users table yet
      if (count === 0) {
        console.error(`⚠️ Verify: userId=${userId} not found in users table — user may not be synced`);
        // Try upserting to create the row with the unlock
        const { error: upsertError } = await supabase
          .from("users")
          .upsert({
            id: userId,
            unlockedGenerations: [generationId],
            updatedAt: new Date().toISOString(),
          });
        if (upsertError) {
          console.error("Supabase upsert error:", upsertError);
          return NextResponse.json({ error: "DB upsert failed", detail: upsertError.message }, { status: 500 });
        }
      }

      console.log(`🔓 Verified & unlocked generationId=${generationId} for userId=${userId}`);
      return NextResponse.json({ unlocked: true, generationId });
    }

    if (planType === "monthly" || planType === "quarterly") {
      // Subscription — grant premium immediately (webhook will also fire with subscription details)
      const { error } = await supabase
        .from("users")
        .upsert({
          id: userId,
          isPremium: true,
          updatedAt: new Date().toISOString(),
        });

      if (error) {
        console.error("Supabase premium grant error:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`💎 Verified & granted premium for userId=${userId} (${planType})`);
      return NextResponse.json({ unlocked: true, premium: true });
    }

    return NextResponse.json({ unlocked: false, reason: "Unknown planType" });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
