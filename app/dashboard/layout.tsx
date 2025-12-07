"use client"

import type React from "react"
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

  // Redirect if not authenticated
  if (!loading && !user) {
    router.replace("/")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">{children}</main>
    </div>
  )
}
