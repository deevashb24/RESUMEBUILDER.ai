"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, CreditCard } from "lucide-react"
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

  // Safety Check: Render Loading or Sign-In state if user is not loaded
  if (!user && open) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm bg-white border border-border shadow-2xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view pricing.</p>
        </DialogContent>
      </Dialog>
    )
  }

  // If not open, returning null is fine
  if (!user) return null

  // --- 1. LEMON SQUEEZY CHECKOUT ---
  const handleCheckout = async (type: 'monthly' | 'quarterly' | 'one-time') => {
    if (!user) return
    setLoading(type)

    try {
      let variantId = ""
      if (type === 'monthly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_MONTHLY!
      if (type === 'quarterly') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_QUARTERLY!
      if (type === 'one-time') variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ONETIME!

      // FIX: Pass generationId if this is a one-time purchase
      const payload: any = {
        userId: user.id,
        userEmail: user.email,
        variantId: variantId,
        redirectUrl: window.location.href
      }

      if (type === 'one-time' && generationId) {
        payload.generationId = generationId
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  // --- 2. RAZORPAY CHECKOUT ---
  const handleRazorpayCheckout = async (planType: 'monthly' | 'quarterly' | 'one-time') => {
    if (!user) return
    setLoading('razorpay')

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          planType,
          // FIX: Explicitly pass generationId for one-time unlock
          generationId: planType === 'one-time' ? generationId : undefined
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to create order")

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        name: "ResumeBuilder.ai",
        description: data.description || "Pro Subscription",
        handler: function (response: any) {
          alert("Payment Successful! Access granted.")
          window.location.reload()
        },
        prefill: { email: user.email || undefined },
        theme: { color: "#000000" },
        modal: { ondismiss: function () { setLoading(null) } }
      }

      if (data.subscriptionId) {
        options.subscription_id = data.subscriptionId;
      } else {
        options.order_id = data.orderId;
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
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div
        onClick={() => setSelectedPlan('monthly')}
        className={`p-3 border rounded-xl cursor-pointer transition-all text-center flex flex-col justify-center items-center shadow-sm hover:shadow-md ${selectedPlan === 'monthly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'}`}
      >
        <div className="text-xs font-semibold text-foreground/80">Monthly</div>
        <div className="text-lg font-bold text-foreground mt-1">$9.99<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
        <div className="text-[10px] text-muted-foreground mt-1 px-2 py-0.5 bg-secondary rounded-full">Global</div>
      </div>

      <div
        onClick={() => setSelectedPlan('quarterly')}
        className={`p-3 border rounded-xl cursor-pointer transition-all text-center relative flex flex-col justify-center items-center shadow-sm hover:shadow-md ${selectedPlan === 'quarterly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'}`}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">BEST VALUE</div>
        <div className="text-xs font-semibold text-foreground/80 mt-1">Quarterly</div>
        <div className="text-lg font-bold text-foreground mt-1">$19.99<span className="text-xs font-normal text-muted-foreground">/3mo</span></div>
        <div className="text-[10px] text-muted-foreground mt-1 px-2 py-0.5 bg-secondary rounded-full">Global</div>
      </div>
    </div>
  )

  return (
    <>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white border border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="p-6 pb-2 text-center">
            <DialogTitle className="text-2xl font-bold text-foreground flex justify-center items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Upgrade Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">Unlock the full power of AI Document Builder</DialogDescription>
          </div>

          <div className="p-6 pt-2 space-y-5">
            {/* Subscription Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Pro Subscription</h4>
                <span className="h-px flex-1 bg-slate-200"></span>
              </div>

              <PlanSelection />

              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 shrink-0" /><span className="text-slate-700"><strong>Unlimited</strong> Resumes & Downloads</span></li>
                <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 shrink-0" /><span className="text-slate-700"><strong>120 Generations</strong> / month</span></li>
              </ul>

              <div className="space-y-2">
                <Button onClick={() => handleCheckout(selectedPlan)} disabled={!!loading} className="w-full h-11 text-sm font-medium bg-gradient-to-tr from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-lg shadow-gray-200/50 transition-all hover:scale-[1.01]">
                  {loading === selectedPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Subscribe via Lemon Squeezy
                </Button>
                <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                  {/* Simple CSS Icons for Visa/Mastercard/Amex */}
                  <div className="h-5 w-8 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-500">VISA</div>
                  <div className="h-5 w-8 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-500">MC</div>
                </div>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-muted-foreground">Or pay via UPI</span></div>
              </div>

              <Button onClick={() => handleRazorpayCheckout(selectedPlan)} disabled={!!loading} variant="outline" className="w-full h-10 text-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300">
                {loading === 'razorpay' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Pay via Razorpay UPI - {selectedPlan === 'monthly' ? '₹499' : '₹999'}
              </Button>
            </div>

            {/* One-Time Unlock Section */}
            {generationId && (
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-orange-900 text-sm">Single Document Unlock</h4>
                    <p className="text-xs text-orange-700/80">One-time payment. No subscription.</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-orange-900 text-lg">₹199</span>
                    <span className="text-[10px] text-orange-700/60 uppercase">/ $2.99</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleCheckout('one-time')} disabled={!!loading} className="w-full h-9 text-xs bg-white text-orange-900 border border-orange-200 hover:bg-orange-100 hover:border-purple-300 shadow-sm">
                    Card ($2.99)
                  </Button>
                  <Button onClick={() => handleRazorpayCheckout('one-time')} disabled={!!loading} className="w-full h-9 text-xs bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 hover:text-orange-900 shadow-sm">
                    UPI (₹199)
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button onClick={onClose} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors p-2">
                No thanks, I'll continue on the free plan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}