"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Zap } from "lucide-react" // Ensure you have lucide-react installed
import { useAuth } from "@/lib/auth-context"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) return
    setLoading(true)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userId: user.uid, 
            userEmail: user.email 
        }),
      })
      
      const data = await res.json()

      // FIX: Check for error first
      if (!res.ok || data.error) {
        alert(`Checkout Error: ${data.error}`)
        console.error("Full Error:", data)
        return
      }
      
      if (data.url) {
          window.location.href = data.url
      } else {
          alert("Error: No checkout URL received from Lemon Squeezy.")
      }
    } catch (e: any) {
      console.error(e)
      alert("Network or Server Error. Check console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center flex flex-col items-center gap-2 pt-4">
            <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="w-8 h-8 text-blue-600 fill-blue-600" />
            </div>
            <span>Upgrade to Pro</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 mt-2">
          <div className="text-center mb-8">
             <span className="text-5xl font-black text-slate-900">$19</span>
             <span className="text-slate-500 font-medium text-lg">/lifetime</span>
          </div>
          
          <div className="space-y-4 mb-8 pl-4">
            {[
                "Unlimited AI Resume Generations", 
                "Premium 'Harvard' Templates", 
                "Deep ATS Keyword Analysis", 
                "Cover Letter Generator (Beta)"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-700">
                <div className="bg-green-100 rounded-full p-1">
                    <Check className="w-3 h-3 text-green-700 stroke-[3px]" />
                </div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleUpgrade} 
            disabled={loading} 
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Unlock Pro Access"}
          </Button>
          
          <p className="text-xs text-center text-slate-400 mt-4">
            Secure payment via Lemon Squeezy • 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}