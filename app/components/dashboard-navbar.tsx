"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { LogOut, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal" // Import the modal

export function DashboardNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showPricing, setShowPricing] = useState(false) // State to control modal

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getUserInitials = () => {
    if (!user) return "JD"
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
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            {/* UPGRADE BUTTON */}
            {/* You can hide this if user.isPremium is true later */}
            <Button 
              onClick={() => setShowPricing(true)}
              size="sm"
              className="hidden md:flex bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>

            <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>

            <Avatar className="h-8 w-8 bg-secondary">
              <AvatarFallback className="text-xs font-medium bg-secondary text-secondary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* The Pricing Modal Component */}
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
      />
    </>
  )
}