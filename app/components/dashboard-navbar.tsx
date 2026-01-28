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

            {/* Language Selector (Mock with simple dropdown style) */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-r border-border pr-4 mr-2">
              <span>EN</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>

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

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 z-50 bg-black text-white hover:bg-gray-800 transition-all rounded-full p-3 shadow-xl hover:scale-110 group">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Get Help
        </span>
      </button>

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