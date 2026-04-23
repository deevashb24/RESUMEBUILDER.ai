"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInButton } from "@clerk/nextjs"
import { FileText, BookOpen, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Redirect if already logged in (handled by useEffect, but show loading during redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Welcome to ResumeAI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Sign in to get started
          </p>

          <Card className="max-w-md mx-auto mt-8 border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-bold">ResumeAI</CardTitle>
              <CardDescription className="text-center">
                Get started with your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SignInButton mode="modal">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg h-12 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  size="lg"
                >
                  Sign in
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Resume</h3>
            <p className="text-sm text-muted-foreground">
              Create professional resumes tailored to specific job descriptions
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">SOP</h3>
            <p className="text-sm text-muted-foreground">
              Generate compelling Statements of Purpose for applications
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Cover Letter</h3>
            <p className="text-sm text-muted-foreground">
              Write personalized cover letters that stand out
            </p>
          </div>
        </div>
      </div>


    </div>
  )
}
