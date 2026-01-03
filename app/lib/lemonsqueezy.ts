import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  listSubscriptions,
} from "@lemonsqueezy/lemonsqueezy.js"
import crypto from "crypto"

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  if (!apiKey) {
    console.error("LEMONSQUEEZY_API_KEY is not defined")
    return
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
  })
}

export async function createCheckoutUrl(
  storeId: string,
  variantId: string,
  user: { email: string; id: string },
  redirectUrl: string,
  customData?: Record<string, any>
) {
  configureLemonSqueezy()

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      custom: {
        userId: user.id,
        ...customData,
      },
    },
    productOptions: {
      redirectUrl,
    },
  })

  return checkout.data?.data.attributes.url
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(rawBody).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}