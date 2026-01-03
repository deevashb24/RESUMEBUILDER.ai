
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createCheckoutUrl } from "@/lib/lemonsqueezy"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import Script from "next/script"

interface PricingModalProps {
  open: boolean
  onClose: () => void
  generationId?: string // If defined, we are buying just this one
}

export function PricingModal({ open, onClose, generationId }: PricingModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null) // 'monthly', 'quarterly', 'one-time'

  const handleCheckout = async (type: 'monthly' | 'quarterly' | 'one-time') => {
    if (!user) return
    setLoading(type)

    try {
      const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID!
      let variantId = ""

      // TODO: Replace with actual Environment Variables provided by user or config
      if (type === 'monthly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_MONTHLY!
      if (type === 'quarterly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_QUARTERLY!
      if (type === 'one-time') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ONETIME!

      // If one-time, pass generationId in custom data
      const customData = type === 'one-time' && generationId ? { generationId } : {}

      const redirectUrl = window.location.href // Return to current page

      const checkoutUrl = await createCheckoutUrl(storeId, variantId, { email: user.email!, id: user.uid }, redirectUrl, customData)

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        console.error("No checkout URL returned")
        // Optionally show user feedback here
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleRazorpayCheckout = async () => {
    if (!user) return
    setLoading('razorpay')

    try {
      // 1. Create Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to create order")

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: "INR",
        name: "ResumeBuilder.ai",
        description: "Pro Subscription (Lifetime)",
        order_id: data.orderId,
        handler: function (response: any) {
          // In a real app, you might want to verify the payment on the backend here too
          // But for now, we rely on the webhook to handle the actual database update
          // We can optimistically reload or show success
          alert("Payment Successful! Your account will be upgraded shortly.")
          window.location.reload()
        },
        prefill: {
          email: user.email || undefined,
        },
        theme: {
          color: "#000000",
        },
      }

      const rzp1 = new window.Razorpay(options)
      rzp1.open()

    } catch (error) {
      console.error("Razorpay Error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-white border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Unlock Your Content</DialogTitle>
            <DialogDescription className="text-center text-lg">
              Choose a plan that works for you
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Subscription Option */}
            <div className="border rounded-xl p-6 relative bg-primary/5 border-primary/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Best Value
              </div>
              <h3 className="text-xl font-bold">Pro Subscription</h3>
              <p className="text-muted-foreground text-sm mt-1">Unlimited access to all tools</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Unlimited Resume Generations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Cover Letter & SOP Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Instant PDF Downloads</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => handleCheckout('monthly')}
                  disabled={!!loading}
                  className="w-full"
                >
                  {loading === 'monthly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Monthly - $9.99/mo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCheckout('quarterly')}
                  disabled={!!loading}
                  className="w-full"
                >
                  {loading === 'quarterly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Quarterly - $19.99/3mo (Save 33%)
                </Button>
              </div>
            </div>

            {/* One-Time Option */}
            <div className="border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">Single Unlock</h3>
                <p className="text-muted-foreground text-sm mt-1">Pay only for what you need</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlock ONLY this document</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited downloads for this item</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="text-2xl font-bold mb-1">$2.99 <span className="text-sm font-normal text-muted-foreground">/ one-time</span></div>
                <Button
                  onClick={() => handleCheckout('one-time')}
                  disabled={!!loading}
                  className="w-full"
                  variant="secondary"
                >
                  {loading === 'one-time' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Unlock This Resume ($2.99)
                </Button>

                {/* UPI OPTION */}
                <div className="relative text-center text-xs text-muted-foreground my-1">
                  <span className="bg-white px-2 relative z-10">OR</span>
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                </div>

                <Button
                  onClick={handleRazorpayCheckout}
                  disabled={!!loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading === 'razorpay' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pay with UPI / Paytm (₹499)
                </Button>

              </div>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}