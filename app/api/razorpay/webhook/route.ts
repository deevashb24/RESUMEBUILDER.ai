import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Verify Razorpay's HMAC-SHA256 signature on the raw request body */
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  return hmac.digest("hex") === signature;
}

/**
 * Notify the user by updating a `notifications` field in their DB row.
 * If you wire up a real email provider (Resend, Nodemailer, etc.) later,
 * just add the API call here — the webhook already calls this on every event.
 */
async function notifyUser(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  subject: string,
  body: string
) {
  const notification = {
    subject,
    body,
    sentAt: new Date().toISOString(),
    read: false,
  };

  // Append to the notifications array in the user's row
  const { data: user } = await supabase
    .from("users")
    .select("notifications")
    .eq("id", userId)
    .single();

  const existing: any[] = user?.notifications || [];

  await supabase
    .from("users")
    .update({ notifications: [...existing, notification] })
    .eq("id", userId);

  // 👇 Drop-in: replace this log with Resend / SendGrid / Nodemailer call
  console.log(`📧 [NOTIFY → ${userId}] ${subject}`);
  console.log(`   ${body}`);
}

// ─────────────────────────────────────────────────────────────
// POST /api/razorpay/webhook
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Config or signature missing" }, { status: 400 });
    }

    if (!verifySignature(rawBody, signature, secret)) {
      console.warn("⚠️ Razorpay webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event: string = payload.event;
    const supabase = createAdminClient();

    console.log(`🔔 Razorpay event received: ${event}`);

    // ── 1. SUBSCRIPTION ACTIVATED ────────────────────────────────
    if (event === "subscription.activated") {
      const sub = payload.payload.subscription.entity;
      const userId = sub.notes?.userId;
      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      const periodEnd = sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : null;

      await supabase.from("users").upsert({
        id: userId,
        isPremium: true,
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "active",
          planId: sub.plan_id,
          subscriptionId: sub.id,
          periodEnd,
          type: "razorpay",
        },
      });

      await notifyUser(
        supabase,
        userId,
        "🎉 Your Pro subscription is now active!",
        `Welcome to Pro! Your subscription is active until ${periodEnd ? new Date(periodEnd).toLocaleDateString() : "your next billing date"}. Enjoy unlimited resumes and AI generations.`
      );
    }

    // ── 2. SUBSCRIPTION CHARGED (renewal) ────────────────────────
    else if (event === "subscription.charged") {
      const sub = payload.payload.subscription.entity;
      const userId = sub.notes?.userId;
      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      const periodEnd = sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : null;

      await supabase.from("users").upsert({
        id: userId,
        isPremium: true,
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "active",
          planId: sub.plan_id,
          subscriptionId: sub.id,
          periodEnd,
          type: "razorpay",
        },
      });

      await notifyUser(
        supabase,
        userId,
        "✅ Subscription renewed successfully",
        `Your Pro plan has been renewed. You're covered until ${periodEnd ? new Date(periodEnd).toLocaleDateString() : "next billing date"}. Thank you!`
      );
    }

    // ── 3. SUBSCRIPTION CANCELLED ─────────────────────────────────
    else if (event === "subscription.cancelled") {
      const sub = payload.payload.subscription.entity;
      const userId = sub.notes?.userId;
      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      // Keep isPremium = true until period actually ends, but mark as cancelled
      await supabase.from("users").update({
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "cancelled",
          planId: sub.plan_id,
          subscriptionId: sub.id,
          periodEnd: sub.current_end
            ? new Date(sub.current_end * 1000).toISOString()
            : null,
          type: "razorpay",
        },
      }).eq("id", userId);

      await notifyUser(
        supabase,
        userId,
        "😢 Your subscription has been cancelled",
        `Your Pro subscription has been cancelled. You can still use Pro features until the end of your current billing period. We'd love to have you back anytime!`
      );
    }

    // ── 4. SUBSCRIPTION HALTED (payment failure) ──────────────────
    else if (event === "subscription.halted") {
      const sub = payload.payload.subscription.entity;
      const userId = sub.notes?.userId;
      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      await supabase.from("users").update({
        isPremium: false,
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "past_due",
          planId: sub.plan_id,
          subscriptionId: sub.id,
          periodEnd: null,
          type: "razorpay",
        },
      }).eq("id", userId);

      await notifyUser(
        supabase,
        userId,
        "⚠️ Action required: Payment failed",
        `We couldn't collect your subscription payment and your Pro access has been paused. Please update your payment method to restore access.`
      );
    }

    // ── 5. SUBSCRIPTION COMPLETED (all cycles done) ───────────────
    else if (event === "subscription.completed") {
      const sub = payload.payload.subscription.entity;
      const userId = sub.notes?.userId;
      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      await supabase.from("users").update({
        isPremium: false,
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "inactive",
          planId: sub.plan_id,
          subscriptionId: sub.id,
          periodEnd: null,
          type: "razorpay",
        },
      }).eq("id", userId);

      await notifyUser(
        supabase,
        userId,
        "👋 Your subscription has ended",
        `Your Pro subscription has completed all its billing cycles. Renew anytime from the dashboard to continue enjoying unlimited access.`
      );
    }

    // ── 6. ONE-TIME PAYMENT CAPTURED ─────────────────────────────
    else if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const notes = payment.notes || {};
      const userId = notes.userId;
      const planType = notes.planType;
      const generationId = notes.generationId;

      if (!userId) return NextResponse.json({ status: "ok — no userId" });

      // One-time document unlock
      if (planType === "one-time" && generationId) {
        const { data: user } = await supabase
          .from("users")
          .select("unlockedGenerations")
          .eq("id", userId)
          .single();

        const currentUnlocks: string[] = user?.unlockedGenerations || [];

        await supabase.from("users").update({
          unlockedGenerations: Array.from(new Set([...currentUnlocks, generationId])),
          updatedAt: new Date().toISOString(),
        }).eq("id", userId);

        await notifyUser(
          supabase,
          userId,
          "🔓 Your document has been unlocked!",
          `Payment received. Your resume/document is now unlocked for download. Thank you for your purchase!`
        );
      }

      // Subscription payment captured (used by subscription flow internally)
      if (planType === "monthly" || planType === "quarterly") {
        await notifyUser(
          supabase,
          userId,
          "✅ Payment received",
          `We received your payment for the ${planType} Pro plan. Your access will be updated shortly.`
        );
      }
    }

    // ── 7. PAYMENT FAILED ─────────────────────────────────────────
    else if (event === "payment.failed") {
      const payment = payload.payload.payment.entity;
      const notes = payment.notes || {};
      const userId = notes.userId;

      if (userId) {
        await notifyUser(
          supabase,
          userId,
          "❌ Payment failed",
          `Your payment of ₹${(payment.amount / 100).toFixed(2)} failed. Please try again or use a different payment method.`
        );
      }
    }

    return NextResponse.json({ status: "ok", event });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}