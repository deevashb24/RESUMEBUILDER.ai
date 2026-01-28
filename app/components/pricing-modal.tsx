"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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

  // Safety Check: Prevent crash if user is not loaded
  if (!user) return null

  // --- 1. LEMON SQUEEZY CHECKOUT ---
  const handleCheckout = async (type: 'monthly' | 'quarterly' | 'one-time') => {
    // ... existing ...
  }

  // --- 2. RAZORPAY CHECKOUT ---
  const handleRazorpayCheckout = async (planType: 'monthly' | 'quarterly' | 'one-time') => {
    // ... existing ...
  }

  const PlanSelection = () => (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div
        onClick={() => setSelectedPlan('monthly')}
        className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${selectedPlan === 'monthly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="text-xs font-semibold text-gray-900">Monthly</div>
        <div className="text-xs font-bold text-gray-900">$9.99/mo</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">(Lemon Squeezy)</div>
      </div>

      <div
        onClick={() => setSelectedPlan('quarterly')}
        className={`p-2 border rounded-lg cursor-pointer transition-all text-center relative ${selectedPlan === 'quarterly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">SAVE 33%</div>
        <div className="text-xs font-semibold text-gray-900 pt-1">Quarterly</div>
        <div className="text-xs font-bold text-gray-900">$19.99/3mo</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">(Lemon Squeezy)</div>
      </div>
    </div>
  )

  return (
    <>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm bg-white border border-border shadow-2xl p-0 overflow-hidden">
          <div className="p-4 pb-0 text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">Upgrade Plan</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">Unlock the full power of AI Document Builder</DialogDescription>
          </div>

          <div className="p-4 pt-3 space-y-3">
            {/* Subscription Section */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Pro Subscription</span>
              </div>
              <PlanSelection />

              <ul className="space-y-2 mb-3 bg-gray-50 p-3 rounded-lg">
                <li className="flex items-start text-xs"><Check className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" /><span className="text-gray-700"><strong>Unlimited</strong> Resumes & Downloads</span></li>
                <li className="flex items-start text-xs"><Check className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" /><span className="text-gray-700"><strong>120 Generations</strong> / month</span></li>
              </ul>

              <Button onClick={() => handleCheckout(selectedPlan)} disabled={!!loading} className="w-full h-10 text-sm bg-gray-900 hover:bg-gray-800 text-white">
                {loading === selectedPlan && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Subscribe via Lemon Squeezy
              </Button>

              <div className="text-center text-[10px] text-gray-400 font-medium my-1.5">- OR -</div>

              <Button onClick={() => handleRazorpayCheckout(selectedPlan)} disabled={!!loading} className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md text-white">
                {loading === 'razorpay' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Pay via UPI (Razorpay) - {selectedPlan === 'monthly' ? '₹499' : '₹999'}
              </Button>
            </div>

            {/* One-Time Unlock Section */}
            {generationId && (
              <div className="border-t pt-2 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="leading-tight">
                    <h4 className="font-bold text-gray-900 text-xs">Single Unlock</h4>
                    <p className="text-[10px] text-gray-500">One-time payment.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleCheckout('one-time')} disabled={!!loading} variant="outline" className="w-full h-8 text-[10px]">
                    Card / PayPal ($2.99)
                  </Button>
                  <Button onClick={() => handleRazorpayCheckout('one-time')} disabled={!!loading} variant="secondary" className="w-full h-8 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border">
                    UPI (₹199)
                  </Button>
                </div>
              </div>
            )}


            <div className="text-center pt-1">
              <button onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-600 underline">No thanks, I'll stay on the free plan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}