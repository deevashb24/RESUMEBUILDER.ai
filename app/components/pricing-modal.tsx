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

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order. Please check Razorpay keys.")
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        name: "ResumeBuilder.ai",
        description: data.description || "Pro Subscription",
        callback_url: "https://resumebuilderai.in/api/razorpay/webhook",
        redirect: true,
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
      rzp1.on('payment.failed', function (response: any) {
        console.error("Razorpay Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      rzp1.open()

    } catch (error: any) {
      console.error("Razorpay Error:", error)
      alert(error.message || "Payment setup failed. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const PlanSelection = () => (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div
        onClick={() => setSelectedPlan('monthly')}
        className={`p-3 border rounded-xl cursor-pointer transition-all text-center flex flex-col justify-center items-center shadow-sm hover:shadow-md ${selectedPlan === 'monthly' ? 'border-[#ff8a00] bg-[#ff8a00]/10 ring-1 ring-[#ff8a00]' : 'border-[#323536] bg-[#1d2021] hover:border-[#ff8a00]/50'}`}
      >
        <div className="text-xs font-semibold text-gray-400">Monthly</div>
        <div className="text-lg font-bold text-white mt-1">$9.99<span className="text-xs font-normal text-gray-500">/mo</span></div>
        <div className="text-[10px] text-gray-400 mt-1 px-2 py-0.5 bg-[#323536] rounded-full">Global</div>
      </div>

      <div
        onClick={() => setSelectedPlan('quarterly')}
        className={`p-3 border rounded-xl cursor-pointer transition-all text-center relative flex flex-col justify-center items-center shadow-sm hover:shadow-md ${selectedPlan === 'quarterly' ? 'border-[#ff8a00] bg-[#ff8a00]/10 ring-1 ring-[#ff8a00]' : 'border-[#323536] bg-[#1d2021] hover:border-[#ff8a00]/50'}`}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#ff8a00] text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">BEST VALUE</div>
        <div className="text-xs font-semibold text-gray-400 mt-1">Quarterly</div>
        <div className="text-lg font-bold text-white mt-1">$19.99<span className="text-xs font-normal text-gray-500">/3mo</span></div>
        <div className="text-[10px] text-gray-400 mt-1 px-2 py-0.5 bg-[#323536] rounded-full">Global</div>
      </div>
    </div>
  )

  return (
    <>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-[#111415] border border-[#323536] shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="p-6 pb-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white flex justify-center items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#ff8a00]" />
              Upgrade Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 mt-2">Unlock the full power of AI Document Builder</DialogDescription>
          </div>

          <div className="p-6 pt-2 space-y-5">
            {/* Subscription Section */}
            <div className="bg-[#1d2021] p-4 rounded-xl border border-[#323536]">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff8a00]">Pro Subscription</h4>
                <span className="h-px flex-1 bg-[#323536]"></span>
              </div>

              <PlanSelection />

              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm"><Check className="h-4 w-4 text-[#ff8a00] mr-2 shrink-0" /><span className="text-gray-300"><strong>Unlimited</strong> Resumes & Downloads</span></li>
                <li className="flex items-center text-sm"><Check className="h-4 w-4 text-[#ff8a00] mr-2 shrink-0" /><span className="text-gray-300"><strong>120 Generations</strong> / month</span></li>
              </ul>

              <div className="space-y-2">
                <Button onClick={() => handleCheckout(selectedPlan)} disabled={!!loading} className="w-full h-11 text-sm font-bold bg-[#ff8a00] hover:bg-[#e07a00] text-black shadow-lg shadow-[#ff8a00]/20 transition-all hover:scale-[1.01]">
                  {loading === selectedPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />}
                  Subscribe via Lemon Squeezy
                </Button>
                <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                  {/* Simple CSS Icons for Visa/Mastercard/Amex */}
                  <div className="h-5 w-8 bg-[#323536] rounded flex items-center justify-center text-[8px] font-bold text-gray-400">VISA</div>
                  <div className="h-5 w-8 bg-[#323536] rounded flex items-center justify-center text-[8px] font-bold text-gray-400">MC</div>
                </div>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#323536]"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1d2021] px-2 text-gray-500">Or pay via UPI</span></div>
              </div>

              <Button onClick={() => handleRazorpayCheckout(selectedPlan)} disabled={!!loading} variant="outline" className="w-full h-10 text-sm border-[#323536] text-gray-300 bg-transparent hover:bg-[#323536] hover:text-white">
                {loading === 'razorpay' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Pay via Razorpay UPI - {selectedPlan === 'monthly' ? '₹499.99' : '₹999.99'}
              </Button>
            </div>

            {/* One-Time Unlock Section */}
            {generationId && (
              <div className="bg-[#ff8a00]/10 p-4 rounded-xl border border-[#ff8a00]/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#ff8a00] text-sm">Single Document Unlock</h4>
                    <p className="text-xs text-[#ff8a00]/80">One-time payment. No subscription.</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-[#ff8a00] text-lg">₹50.00</span>
                    <span className="text-[10px] text-[#ff8a00]/60 uppercase">/ $2.99</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleCheckout('one-time')} disabled={!!loading} className="w-full h-9 text-xs bg-black text-[#ff8a00] border border-[#ff8a00]/50 hover:bg-[#ff8a00]/20 shadow-sm">
                    Card ($2.99)
                  </Button>
                  <Button onClick={() => handleRazorpayCheckout('one-time')} disabled={!!loading} className="w-full h-9 text-xs bg-[#ff8a00]/20 text-[#ff8a00] border border-[#ff8a00]/50 hover:bg-[#ff8a00]/30 shadow-sm">
                    UPI (₹50.00)
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button onClick={onClose} className="text-xs font-medium text-gray-500 hover:text-white hover:underline transition-colors p-2">
                No thanks, I'll continue on the free plan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}