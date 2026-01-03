"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Sparkles, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"
import { UserProfilePopup } from "@/components/user-profile-popup" // Import new component

export function DashboardNavbar() {
  const { user, logout, isPremium } = useAuth()
  const router = useRouter()

  const [showPricing, setShowPricing] = useState(false)
  const [showProfile, setShowProfile] = useState(false) // Toggle for profile popup

  const handleLogout = async () => {
    try {
      setShowProfile(false)
      await logout()
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getUserInitials = () => {
    if (!user) return "JD"
    // Use display name if available, otherwise email
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return "JD"
  }

  return (
    <>
      <nav className="border-b border-border bg-card relative z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-semibold text-foreground text-lg">
              ResumeBuilder<span className="text-primary">.ai</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Generate
              </Link>
              <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* Premium Status / Upgrade Button */}
            {!isPremium ? (
              <Button
                onClick={() => setShowPricing(true)}
                size="sm"
                className="hidden md:flex bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 cursor-default select-none">
                <ShieldCheck className="w-3.5 h-3.5" />
                PRO
              </div>
            )}

            <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>

            {/* Avatar - Now clickable! */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="rounded-full ring-offset-2 hover:ring-2 hover:ring-blue-500 transition-all focus:outline-none"
              >
                <Avatar className="h-9 w-9 bg-secondary border border-gray-200">
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Modals & Popups --- */}

      {/* 1. Pricing Modal */}
      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />

      {/* 2. User Profile Popup */}
      <UserProfilePopup
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
      />
    </>
  )
}