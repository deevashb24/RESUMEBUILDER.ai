"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getResume, ParsedResumeData } from "@/lib/resume"
import { ResumeRenderer } from "@/components/resume-renderer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"

export default function ResumePreviewPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resumeId = searchParams?.get("id") || null
  
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null)
  const [layoutId, setLayoutId] = useState<string>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
      return
    }

    if (resumeId && user) {
      loadResume()
    }
  }, [resumeId, user, loading])

  const loadResume = async () => {
    if (!resumeId) return

    try {
      setIsLoading(true)
      const resume = await getResume(resumeId)

      if (!resume) {
        setError("Resume not found")
        return
      }

      if (resume.userId !== user?.uid) {
        setError("Unauthorized access")
        return
      }

      setResumeData(resume.parsedData)
      setLayoutId(resume.layoutId || "demo")
    } catch (err: any) {
      console.error("Error loading resume:", err)
      setError(err.message || "Failed to load resume")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // TODO: Implement PDF download using react-to-pdf or similar
    window.print()
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading resume...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <ResumeRenderer layoutId={layoutId} data={resumeData} />
        </div>
      </div>
    </div>
  )
}

