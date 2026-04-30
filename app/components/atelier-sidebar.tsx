"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"
import { useClerk } from "@clerk/nextjs"
import { useLanguage } from "@/lib/language-context"

const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z"/>
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
      </svg>
    ),
  },
]

export function AtelierSidebar() {
  const { user, isPremium, subscription } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const { openUserProfile } = useClerk()
  const [showPricing, setShowPricing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const userEmail = user?.email || ""
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <>
      <aside
        className="h-screen w-72 fixed left-0 top-0 flex flex-col justify-between py-8 px-6 border-r z-40"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* TOP: Logo + Nav */}
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group px-2">
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none" style={{ color: "#e1e3e4" }}>
                ResumeBuilder<span style={{ color: "#ff8a00" }}>.ai</span>
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href === "/dashboard" && pathname?.startsWith("/dashboard"))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 px-4 py-3 transition-all duration-200 group rounded-lg"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                    color: isActive ? "#ff8a00" : "rgba(225,227,228,0.5)",
                    borderRight: isActive ? "2px solid #ff8a00" : "2px solid transparent",
                    borderRadius: isActive ? "0.5rem 0 0 0.5rem" : "0.5rem",
                  }}
                >
                  <span
                    className="transition-transform duration-200"
                    style={{ transform: "scale(1)" }}
                  >
                    {link.icon}
                  </span>
                  <span className="font-medium text-[15px]">{link.label}</span>

                  {/* Active glow track */}
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(to right, transparent, rgba(255,138,0,0.06))",
                        borderRadius: "0.5rem",
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM: Upgrade + User Profile */}
        <div className="flex flex-col gap-4">
          {/* Upgrade CTA (only if free) */}
          {!isPremium && (
            <div
              className="p-5 rounded-xl border relative overflow-hidden group cursor-pointer"
              style={{
                borderColor: "rgba(255,138,0,0.3)",
                background: "rgba(255,138,0,0.05)",
              }}
              onClick={() => setShowPricing(true)}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,138,0,0.15), transparent)" }}
              />
              <h4 className="font-bold text-sm mb-1" style={{ color: "#e1e3e4" }}>Unlock Your Potential</h4>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(225,227,228,0.55)" }}>
                Premium templates and advanced ATS scoring.
              </p>
              <button
                className="w-full py-2 rounded-lg font-semibold text-sm transition-all"
                style={{
                  background: "#ff8a00",
                  color: "#000",
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* User Card — click anywhere to open profile */}
          <button
            onClick={() => openUserProfile()}
            className="glass-panel p-4 rounded-xl flex items-center gap-3 relative overflow-hidden w-full text-left group transition-all duration-200 hover:border-orange-500/30"
            style={{ cursor: "pointer" }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-[40px] pointer-events-none"
              style={{ background: "#ff8a00", opacity: 0.12 }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "rgba(255,138,0,0.04)" }} />

            {/* Single Avatar */}
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border"
                  style={{
                    background: "linear-gradient(135deg, #ff8a00, #ffb77f)",
                    color: "#000",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              {isPremium && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "#ff8a00" }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="#000">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Name + Plan + Date */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sm leading-tight truncate" style={{ color: "#e1e3e4" }}>
                {userName}
              </span>
              <span
                className="text-[11px] font-bold tracking-[0.1em] uppercase mt-0.5"
                style={{ color: isPremium ? "#ff8a00" : "rgba(221,193,174,0.6)" }}
              >
                {isPremium ? "Premium" : "Free Plan"}
              </span>
              {isPremium && subscription?.periodEnd && (
                <span className="text-[10px] mt-0.5" style={{ color: "rgba(221,193,174,0.45)" }}>
                  Renews {new Date(subscription.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              {!isPremium && (
                <span className="text-[10px] mt-0.5" style={{ color: "rgba(221,193,174,0.35)" }}>
                  Click to manage account
                </span>
              )}
            </div>

            {/* Chevron hint */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: "#e1e3e4" }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </aside>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  )
}
