import { NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js"
import { configureLemonSqueezy } from "@/lib/lemonsqueezy"

export async function POST(request: NextRequest) {
  configureLemonSqueezy()
  
  try {
    const body = await request.json()
    const { userId, userEmail } = body
    
    // 1. Validate Env Vars
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID

    if (!storeId || !variantId) {
      const msg = "Missing LEMONSQUEEZY_STORE_ID or LEMONSQUEEZY_VARIANT_ID in .env.local"
      console.error(msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // 2. Validate User Data
    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Missing userId or userEmail" }, { status: 400 })
    }

    console.log("Creating checkout for:", { storeId, variantId, userEmail })

    // 3. Create Checkout (Convert IDs to numbers to be safe)
    const checkout = await createCheckout(
      parseInt(storeId), 
      parseInt(variantId), 
      {
        checkoutData: {
          email: userEmail,
          custom: {
            userId: userId
          }
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
          receiptButtonText: "Go to Dashboard",
        }
      }
    )

    // 4. Validate Response
    if (!checkout.data?.data?.attributes?.url) {
      console.error("Lemon Squeezy Response Error:", JSON.stringify(checkout, null, 2))
      return NextResponse.json({ error: "Lemon Squeezy did not return a checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: checkout.data.data.attributes.url })

  } catch (error: any) {
    // 5. DEEP LOGGING
    console.error("CRITICAL CHECKOUT ERROR:", error)
    
    // Check if it's an API error from Lemon Squeezy
    if (error.errors && Array.isArray(error.errors)) {
      console.error("API Error Details:", JSON.stringify(error.errors, null, 2))
      return NextResponse.json({ error: error.errors[0]?.detail || "Lemon Squeezy API Error" }, { status: 500 })
    }

    return NextResponse.json({ error: error.message || "Unknown Server Error" }, { status: 500 })
  }
}