"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, loading, loginWithGoogle, loginWithApple, loginWithEmail } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await loginWithGoogle()
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await loginWithApple()
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Apple")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      await loginWithEmail(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in with email")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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

          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">ResumeAI</CardTitle>
              <CardDescription className="text-center">
                {showSignIn ? "Choose your sign-in method" : "Get started with your account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showSignIn ? (
                <Button
                  onClick={() => setShowSignIn(true)}
                  className="w-full"
                  size="lg"
                >
                  Sign in
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    Continue with Google
                  </Button>

                  <Button
                    onClick={handleAppleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    Continue with Apple
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Signing in..." : "Continue with Email"}
                    </Button>
                  </form>
                </>
              )}
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
