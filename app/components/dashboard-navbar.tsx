"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Sparkles, ShieldCheck, Globe } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"
import { useLanguage } from "@/lib/language-context"
import { languages } from "@/lib/translations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserButton } from "@clerk/nextjs"

export function DashboardNavbar() {
  const { user, logout, isPremium } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()

  const [showPricing, setShowPricing] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix: Ensure component is mounted to prevent hydration mismatch with the Dialog
  useEffect(() => {
    setMounted(true)
  }, [])



  if (!mounted) return null

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
              {/* FIXED: Replaced hardcoded "Generate" with translation */}
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.generate}
              </Link>
              {/* FIXED: Replaced hardcoded "History" with translation */}
              <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.history}
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-r border-border pr-4 mr-2">
                  <Globe className="w-4 h-4" />
                  <span>{languages[language]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-1"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border-border">
                {Object.entries(languages).map(([code, name]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLanguage(code as any)}
                    className={language === code ? "bg-primary/5 font-bold text-primary" : ""}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Premium Status / Upgrade Button */}
            {!isPremium ? (
              <Button
                onClick={() => setShowPricing(true)}
                size="sm"
                className="hidden md:flex bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t.nav.upgrade}
              </Button>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 cursor-default select-none">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.nav.pro}
              </div>
            )}

            <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>

            {/* Avatar */}
            <div className="relative">
              <UserButton />
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
          {language === 'hi' ? 'सहायता प्राप्त करें' : 'Get Help'}
        </span>
      </button>

      {/* --- Modals & Popups --- */}

      {/* 1. Pricing Modal */}
      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />

    </>
  )
}