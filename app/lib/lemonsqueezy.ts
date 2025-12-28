import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js"

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