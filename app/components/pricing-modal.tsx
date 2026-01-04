
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
      // 1. Determine Variant ID
      let variantId = ""
      if (type === 'monthly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_MONTHLY!
      if (type === 'quarterly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_QUARTERLY!
      if (type === 'one-time') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ONETIME!

      // 2. Call our API Route
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          variantId: variantId
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error("Checkout Failed:", data.error)
        alert("Failed to start checkout. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleRazorpayCheckout = async (planType: 'subscription' | 'one-time' = 'subscription') => {
    if (!user) return
    setLoading('razorpay')

    try {
      // 1. Create Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, planType }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to create order")

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: "INR",
        name: "ResumeBuilder.ai",
        description: data.description || "Pro Subscription",
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

          <div className="grid md:grid-cols-2 gap-8 mt-6">

            {/* LEFT COLUMN: Free Plan (Dashboard) OR Pro Plan (Unlock) */}
            {!generationId ? (
              // --- DASHBOARD MODE: Free Plan ---
              <div className="border rounded-2xl p-8 flex flex-col justify-between bg-white hover:shadow-lg transition-shadow duration-300">
                <div>
                  <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                    Basic
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Free Plan</h3>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">/forever</span>
                  </div>
                  <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                    Good for getting started with basic resume needs.
                  </p>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm">Basic Resume Templates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm">Export to TXT</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mr-3">
                        <span className="text-[10px] font-bold text-yellow-600">!</span>
                      </div>
                      <span className="text-gray-600 text-sm">ResumeBuilder.ai Watermark</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mr-3">
                        <span className="text-[10px] font-bold text-red-600">x</span>
                      </div>
                      <span className="text-gray-600 text-sm">No AI Writer Access</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Button variant="outline" className="w-full py-6 text-lg" disabled>
                    Current Plan
                  </Button>
                </div>
              </div>
            ) : (
              // --- UNLOCK MODE: Pro Plan (Left side for comparison) ---
              <div className="border-2 border-primary/20 rounded-2xl p-8 relative bg-primary/5 flex flex-col justify-between shadow-sm">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  RECOMMENDED
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Pro Subscription</h3>
                  <p className="text-sm text-primary font-medium mt-1">Unlock Everything</p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm text-gray-700">Unlimited Resumes & Cover Letters</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm text-gray-700"><strong>120 Generations</strong> / month</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm text-gray-700">AI Score & Content Fixer</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button
                    onClick={() => handleCheckout('monthly')}
                    disabled={!!loading}
                    className="w-full py-6"
                  >
                    {loading === 'monthly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Monthly - $9.99/mo
                  </Button>

                  {/* UPI OPTION */}
                  <div className="relative text-center text-xs text-muted-foreground my-2">
                    <span className="bg-primary/5 px-2 relative z-10">OR</span>
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/20"></div></div>
                  </div>

                  <Button
                    onClick={() => handleRazorpayCheckout('subscription')}
                    disabled={!!loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all py-6"
                  >
                    {loading === 'razorpay' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay with UPI (₹499)
                  </Button>
                </div>
              </div>
            )}


            {/* RIGHT COLUMN: Pro Plan (Dashboard) OR Single Unlock (Unlock) */}
            {!generationId ? (
              // --- DASHBOARD MODE: Pro Plan (Highlighted) ---
              <div className="border-2 border-primary rounded-2xl p-8 relative bg-white shadow-xl transform scale-105 z-10 flex flex-col justify-between">
                <div className="absolute top-0 inset-x-0 -mt-10 flex justify-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md uppercase tracking-wide">
                    Most Popular
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Pro Subscription</h3>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">₹499</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                  </div>
                  <p className="mt-4 text-gray-500 text-sm">
                    Everything you need to land your dream job.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="text-indigo-800 font-bold block text-sm">120 Generations Cap</span>
                      <span className="text-indigo-600 text-xs">Per month refresh</span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="p-1 bg-green-100 rounded-full mr-3 shrink-0">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">Unlimited PDF Downloads</span>
                    </li>
                    <li className="flex items-start">
                      <div className="p-1 bg-green-100 rounded-full mr-3 shrink-0">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">No Watermarks</span>
                    </li>
                    <li className="flex items-start">
                      <div className="p-1 bg-green-100 rounded-full mr-3 shrink-0">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">GPT-4 AI Writer</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <Button
                    onClick={() => handleCheckout('monthly')}
                    disabled={!!loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg"
                  >
                    {loading === 'monthly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Pro ($9.99/mo)
                  </Button>

                  <div className="text-center text-xs text-gray-400 font-medium my-2">- OR -</div>

                  <Button
                    onClick={() => handleRazorpayCheckout('subscription')}
                    disabled={!!loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all py-6"
                  >
                    {loading === 'razorpay' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay with UPI (₹499)
                  </Button>
                </div>
              </div>
            ) : (
              // --- UNLOCK MODE: Single Unlock (Right side) ---
              <div className="border rounded-2xl p-8 flex flex-col justify-between bg-white">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Single Unlock</h3>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">₹199</span>
                    <span className="text-2xl font-bold tracking-tight">.99</span>
                    <span className="ml-1 text-lg font-medium text-gray-500">/once</span>
                  </div>
                  <p className="mt-4 text-gray-500 text-sm">
                    Just need this one document? We got you.
                  </p>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm">Unlock ONLY this document</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm">Unlimited downloads for this item</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm">Remove Watermark</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <Button
                    onClick={() => handleCheckout('one-time')}
                    disabled={!!loading}
                    variant="outline"
                    className="w-full py-6"
                  >
                    {loading === 'one-time' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay via Stripe ($2.99)
                  </Button>

                  <Button
                    onClick={() => handleRazorpayCheckout('one-time')}
                    disabled={!!loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all py-6"
                  >
                    {loading === 'razorpay' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay via UPI (₹199.99)
                  </Button>
                </div>
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}