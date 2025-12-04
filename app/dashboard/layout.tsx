import type React from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">{children}</main>
    </div>
  )
}
