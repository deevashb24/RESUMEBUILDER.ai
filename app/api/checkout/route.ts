import { NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js"
import { configureLemonSqueezy } from "@/lib/lemonsqueezy"

export async function POST(request: NextRequest) {
  configureLemonSqueezy()

  try {
    const body = await request.json()
    const { userId, userEmail, variantId, redirectUrl, generationId } = body 

    const finalVariantId = variantId || process.env.LEMONSQUEEZY_VARIANT_ID;

    if (!process.env.LEMONSQUEEZY_STORE_ID || !finalVariantId) {
      return NextResponse.json({ error: "Missing Store/Variant ID" }, { status: 500 })
    }

    const checkoutData: any = {
      email: userEmail,
      custom: {
        userId: userId
      }
    }

    // FIX: Add generationId to custom data if present
    if (generationId) {
      checkoutData.custom.generationId = generationId
    }

    const checkout = await createCheckout(
      parseInt(process.env.LEMONSQUEEZY_STORE_ID),
      parseInt(finalVariantId as string),
      {
        checkoutData,
        productOptions: {
          redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          receiptButtonText: "Go to Dashboard",
        }
      }
    )

    if (checkout.error) {
      console.error("Lemon Squeezy API Error:", checkout.error)
      return NextResponse.json({ error: checkout.error.message || "Failed to create checkout" }, { status: 500 })
    }

    if (!checkout.data?.data?.attributes?.url) {
      console.error("Lemon Squeezy did not return a URL:", checkout)
      return NextResponse.json({ error: "Lemon Squeezy did not return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url: checkout.data.data.attributes.url })

  } catch (error: any) {
    console.error("Checkout Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}