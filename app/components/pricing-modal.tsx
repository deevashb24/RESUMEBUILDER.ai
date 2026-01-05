
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
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly')

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
          variantId: variantId,
          redirectUrl: window.location.href // STAY ON SAME PAGE
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

  const handleRazorpayCheckout = async (planType: 'monthly' | 'quarterly' | 'one-time') => {
    if (!user) return
    setLoading('razorpay')

    try {
      // 1. Create Order OR Subscription
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          planType,
          generationId: generationId || undefined // Pass if we are unlocking specific doc
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to create order")

      // 2. Initialize Razorpay
      // Determine if it's a Subscription or One-Time
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        name: "ResumeBuilder.ai",
        description: data.description || "Pro Subscription",
        handler: function (response: any) {
          alert("Payment Successful! Access granted.")
          window.location.reload()
        },
        prefill: {
          email: user.email || undefined,
        },
        theme: {
          color: "#000000",
        },
        // Modal specific options
        modal: {
          ondismiss: function () {
            setLoading(null)
          }
        }
      }

      // Attach ID based on mode
      if (data.subscriptionId) {
        options.subscription_id = data.subscriptionId; // Recurring
      } else {
        options.order_id = data.orderId; // One-time
        options.amount = data.amount;
        options.currency = "INR";
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

  const PlanSelection = () => (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div
        onClick={() => setSelectedPlan('monthly')}
        className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${selectedPlan === 'monthly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="text-xs font-semibold text-gray-900">Monthly</div>
        <div className="text-xs font-bold text-gray-900">$9.99/mo</div>
      </div>

      <div
        onClick={() => setSelectedPlan('quarterly')}
        className={`p-2 border rounded-lg cursor-pointer transition-all text-center relative ${selectedPlan === 'quarterly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
          SAVE 33%
        </div>
        <div className="text-xs font-semibold text-gray-900 pt-1">Quarterly</div>
        <div className="text-xs font-bold text-gray-900">$19.99/3mo</div>
      </div>
    </div>
  )

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm bg-white border border-border shadow-2xl p-0 overflow-hidden">
          <div className="p-4 pb-0 text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">Upgrade Plan</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Unlock the full power of AI Document Builder
            </DialogDescription>
          </div>

          <div className="p-4 pt-3 space-y-3">

            {/* 1. PLAN SELECTION (Always visible for Pro) */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Pro Subscription</span>
              </div>

              <PlanSelection />

              <ul className="space-y-2 mb-3 bg-gray-50 p-3 rounded-lg">
                <li className="flex items-start text-xs">
                  <Check className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                  <span className="text-gray-700"><strong>Unlimited</strong> Resumes & Downloads</span>
                </li>
                <li className="flex items-start text-xs">
                  <Check className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                  <span className="text-gray-700"><strong>120 Generations</strong> / month</span>
                </li>
                <li className="flex items-start text-xs">
                  <Check className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                  <span className="text-gray-700">Detailed AI Scoring & Fixer</span>
                </li>
              </ul>

              <Button
                onClick={() => handleCheckout(selectedPlan)}
                disabled={!!loading}
                className="w-full h-10 text-sm bg-gray-900 hover:bg-gray-800 text-white"
              >
                {loading === selectedPlan && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {selectedPlan === 'monthly' ? 'Subscribe Monthly ($9.99)' : 'Subscribe Quarterly ($19.99)'}
              </Button>

              <div className="text-center text-[10px] text-gray-400 font-medium my-1.5">- OR -</div>

              <Button
                onClick={() => handleRazorpayCheckout(selectedPlan)}
                disabled={!!loading}
                className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md text-white"
              >
                {loading === 'razorpay' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Pay via UPI (Razorpay) - {selectedPlan === 'monthly' ? '₹499' : '₹999'}
              </Button>
            </div>

            {/* 2. SPECIFIC UNLOCK OPTION (Only if generationId exists) */}
            {generationId && (
              <div className="border-t pt-2 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="leading-tight">
                    <h4 className="font-bold text-gray-900 text-xs">Single Unlock</h4>
                    <p className="text-[10px] text-gray-500">One-time payment.</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-gray-900 text-sm">₹199</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleCheckout('one-time')}
                    disabled={!!loading}
                    variant="outline"
                    className="w-full h-8 text-[10px]"
                  >
                    Stripe ($2.99)
                  </Button>
                  <Button
                    onClick={() => handleRazorpayCheckout('one-time')}
                    disabled={!!loading}
                    variant="secondary"
                    className="w-full h-8 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border"
                  >
                    UPI (₹199)
                  </Button>
                </div>
              </div>
            )}

            {/* CLOSE LINK */}
            <div className="text-center pt-1">
              <button onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-600 underline">
                No thanks, I'll stay on the free plan
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}