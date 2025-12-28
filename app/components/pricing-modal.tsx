"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Globe } from "lucide-react"
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
        body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex flex-col items-center gap-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <span>Go Global with Pro</span>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mt-2">
          <div className="text-center mb-6">
             <span className="text-4xl font-black text-gray-900">$19</span>
             <span className="text-gray-500 font-medium">/lifetime</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            {["Unlimited AI Resumes", "Global Payments Accepted", "Premium Templates", "ATS Score Checker"].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-700">
                <div className="bg-blue-100 rounded-full p-0.5"><Check className="w-3 h-3 text-blue-600" /></div>
                {item}
              </li>
            ))}
          </ul>

          <Button onClick={handleUpgrade} disabled={loading} className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin" /> : "Unlock Pro Features"}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-3">Secure payment via Lemon Squeezy</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}