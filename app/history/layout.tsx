"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AtelierSidebar } from "@/components/atelier-sidebar"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0c0f10" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(255,138,0,0.2)", borderTopColor: "#ff8a00" }}
            />
          </div>
          <p className="text-sm" style={{ color: "rgba(225,227,228,0.5)", letterSpacing: "0.05em" }}>
            Loading workspace…
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen atelier-workspace flex" style={{ background: "#0c0f10" }}>
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-20%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            background: "#ff8a00",
            opacity: 0.04,
            filter: "blur(150px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-20%",
            right: "-10%",
            width: "40vw",
            height: "40vw",
            background: "#0566d9",
            opacity: 0.03,
            filter: "blur(120px)",
          }}
        />
      </div>

      <AtelierSidebar />

      <main
        className="flex-1 relative z-10 overflow-y-auto"
        style={{ marginLeft: "288px", minHeight: "100vh" }}
      >
        <div className="p-10 max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}