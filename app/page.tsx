"use client"

import { useAuth } from "@/lib/auth-context"
import ResumeBuilderLanding from "@/components/landing/resume-builder-landing"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-orange-500/10 border-b-orange-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="text-sm text-slate-500 tracking-wide">Loading ResumeBuilder.ai…</p>
      </div>
    )
  }

  return <ResumeBuilderLanding isLoggedIn={!!user} />
}
