"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function DashboardNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Get user initials from Firebase user (displayName or email)
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

  const initials = getUserInitials()

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-semibold text-foreground text-lg">
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Generate
            </Link>
            <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              History
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8 bg-secondary">
            <AvatarFallback className="text-xs font-medium bg-secondary text-secondary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
