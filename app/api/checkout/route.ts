import { NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js"
import { configureLemonSqueezy } from "@/lib/lemonsqueezy"

export async function POST(request: NextRequest) {
  configureLemonSqueezy()
  
  try {
    const { userId, userEmail } = await request.json()
    
    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID

    if (!storeId || !variantId) {
      return NextResponse.json({ error: "Server config missing" }, { status: 500 })
    }

    // Create a checkout session
    const checkout = await createCheckout(
      storeId,
      variantId,
      {
        checkoutData: {
          email: userEmail,
          custom: {
            userId: userId // CRITICAL: This lets us identify the user in the webhook
          }
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
          receiptButtonText: "Go to Dashboard",
        }
      }
    )

    return NextResponse.json({ url: checkout.data?.data.attributes.url })

  } catch (error: any) {
    console.error("Checkout Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}