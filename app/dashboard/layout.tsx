"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // FIX: Move the side effect (redirect) into useEffect
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // If not loading and no user, we are redirecting. Return null to prevent flash.
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">{children}</main>
    </div>
  )
}