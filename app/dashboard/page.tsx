"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { GenerationOptions } from "@/components/generation-options"
import { LayoutSelector } from "@/components/layout-selector"
import { useAuth } from "@/lib/auth-context"
import { uploadResumeFile } from "@/lib/storage"
import { saveParsedResume, saveGeneratedResume, ParsedResumeData } from "@/lib/resume"
import { saveHistoryEntry } from "@/lib/history"
import { LAYOUTS } from "@/lib/layouts"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"resume" | "sop" | "cover-letter">("resume")
  const [jobDescription, setJobDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [recommendedLayout, setRecommendedLayout] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  if (!loading && !user) {
    router.replace("/")
    return null
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleFileSelect = async (file: File | null) => {
    if (!file || !user) return

    setUploadedFile(file)
    setError(null)
    setIsUploading(true)

    try {
      // Upload file to Firebase Storage
      const { url, path } = await uploadResumeFile(user.uid, file)

      // Parse resume with AI
      const formData = new FormData()
      formData.append("file", file)

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      })

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        throw new Error(errorData.error || "Failed to parse resume")
      }

      const { data: parsedData } = await parseResponse.json()
      setParsedResume(parsedData)

      // Save parsed resume to Firestore
      await saveParsedResume(user.uid, parsedData, url, path)

      // Get layout recommendation if job description exists
      if (jobDescription.trim()) {
        const layoutResponse = await fetch("/api/recommend-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription,
            resumeData: parsedData,
          }),
        })

        if (layoutResponse.ok) {
          const { layoutId } = await layoutResponse.json()
          setRecommendedLayout(layoutId)
          setSelectedLayout(layoutId)
        }
      } else {
        // Default to demo layout if no job description
        setSelectedLayout("demo")
      }
    } catch (err: any) {
      console.error("Error uploading/parsing file:", err)
      setError(err.message || "Failed to upload and parse resume")
      setUploadedFile(null)
      setParsedResume(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleJobDescriptionChange = async (value: string) => {
    setJobDescription(value)

    // Get layout recommendation when job description changes
    if (value.trim() && parsedResume) {
      try {
        const layoutResponse = await fetch("/api/recommend-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription: value,
            resumeData: parsedResume,
          }),
        })

        if (layoutResponse.ok) {
          const { layoutId } = await layoutResponse.json()
          setRecommendedLayout(layoutId)
          // Auto-select recommended layout if none selected
          if (!selectedLayout) {
            setSelectedLayout(layoutId)
          }
        }
      } catch (err) {
        console.error("Error getting layout recommendation:", err)
      }
    }
  }

  const handleGenerate = async () => {
    if (!user || !parsedResume || !selectedLayout || !jobDescription.trim()) {
      setError("Please upload a resume, select a layout, and provide a job description")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Save parsed resume if not already saved
      let resumeId: string
      if (uploadedFile) {
        const { url, path } = await uploadResumeFile(user.uid, uploadedFile)
        resumeId = await saveParsedResume(user.uid, parsedResume, url, path)
      } else {
        resumeId = await saveParsedResume(user.uid, parsedResume)
      }

      // Generate final resume content (merge parsed data + layout + job description)
      const resumeContent = {
        layoutId: selectedLayout,
        parsedData: parsedResume,
        jobDescription,
        generatedAt: new Date().toISOString(),
      }

      // Save generated resume
      await saveGeneratedResume(
        user.uid,
        resumeId,
        selectedLayout,
        jobDescription,
        resumeContent
      )

      // Save to history
      await saveHistoryEntry(
        user.uid,
        selectedOption,
        jobDescription,
        JSON.stringify(resumeContent)
      )

      // Redirect to preview page
      router.push(`/dashboard/preview?id=${resumeId}`)
    } catch (err: any) {
      console.error("Error generating resume:", err)
      setError(err.message || "Failed to generate resume")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload Resume Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upload Resume</CardTitle>
            <CardDescription className="text-sm">
              Drag and drop your resume or click to browse (PDF or DOCX)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              uploadedFile={uploadedFile}
              isUploading={isUploading}
            />
            {parsedResume && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Resume parsed successfully! Found: {parsedResume.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Description Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Job Description</CardTitle>
            <CardDescription className="text-sm">
              Paste the job description you're applying for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste job description here…"
              className="min-h-32 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground"
              value={jobDescription}
              onChange={(e) => handleJobDescriptionChange(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Layout Selection Card */}
      {parsedResume && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Choose Layout</CardTitle>
            <CardDescription className="text-sm">
              Select a resume layout. AI recommendation is highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LayoutSelector
              selectedLayout={selectedLayout}
              onSelectLayout={setSelectedLayout}
              recommendedLayout={recommendedLayout}
            />
          </CardContent>
        </Card>
      )}

      {/* Generation Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate</CardTitle>
          <CardDescription className="text-sm">Choose what you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GenerationOptions
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !parsedResume || !selectedLayout || !jobDescription.trim()}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
          >
            {isGenerating ? "Generating..." : "Generate Resume"}
          </Button>
          {(!parsedResume || !selectedLayout || !jobDescription.trim()) && (
            <p className="text-xs text-muted-foreground text-center">
              {!parsedResume && "• Upload a resume"}
              {!selectedLayout && " • Select a layout"}
              {!jobDescription.trim() && " • Add a job description"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
