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
import { GenerationProgress } from "@/components/generation-progress" // IMPORT THE NEW COMPONENT
import { ArrowRight } from "lucide-react"

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
  
  // New States for Progress Logic
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationFinished, setGenerationFinished] = useState(false)
  const [generationStats, setGenerationStats] = useState<any>(null)
  const [resumeIdToView, setResumeIdToView] = useState<string | null>(null)
  
  const [error, setError] = useState<string | null>(null)

  if (!loading && !user) {
    router.replace("/")
    return null
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  // ... (handleFileSelect and handleJobDescriptionChange remain exactly the same as before) ...
  // For brevity, I am not repeating them here, but you should keep them in the file!
  const handleFileSelect = async (file: File | null) => {
    if (!file || !user) return
    setUploadedFile(file)
    setError(null)
    setIsUploading(true)
    try {
      const { url, path } = await uploadResumeFile(user.uid, file)
      const formData = new FormData()
      formData.append("file", file)
      const parseResponse = await fetch("/api/parse-resume", { method: "POST", body: formData })
      if (!parseResponse.ok) throw new Error("Failed to parse resume")
      const { data: parsedData } = await parseResponse.json()
      setParsedResume(parsedData)
      await saveParsedResume(user.uid, parsedData, url, path)
      
      // Auto-recommend layout
      if (jobDescription.trim()) {
         // ... (Layout logic same as before)
      } else {
        setSelectedLayout("demo")
      }
    } catch (err: any) {
      setError(err.message || "Failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleJobDescriptionChange = async (value: string) => {
     setJobDescription(value)
     // ... (Keep existing layout logic)
  }

  // UPDATED GENERATE FUNCTION
  const handleGenerate = async () => {
    if (!user || !parsedResume || !selectedLayout || !jobDescription.trim()) {
      setError("Please upload a resume, select a layout, and provide a job description")
      return
    }

    if (selectedOption !== "resume") {
      setError("Coming Soon! SOP and Cover Letter generation are currently under development.")
      return
    }

    setIsGenerating(true)
    setGenerationFinished(false)
    setError(null)

    try {
      let resumeId: string
      if (uploadedFile) {
        const { url, path } = await uploadResumeFile(user.uid, uploadedFile)
        resumeId = await saveParsedResume(user.uid, parsedResume, url, path)
      } else {
        resumeId = await saveParsedResume(user.uid, parsedResume)
      }

      // 1. Call the AI API (Now returns stats!)
      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: parsedResume, jobDescription })
      })

      if (!response.ok) throw new Error("Generation failed")
      
      const { data: tailoredResume, stats } = await response.json()

      // 2. Set Stats to show "Success" UI
      setGenerationStats(stats)
      setGenerationFinished(true)
      setResumeIdToView(resumeId)

      // 3. Save to Database
      const resumeContent = {
        layoutId: selectedLayout,
        parsedData: tailoredResume,
        jobDescription,
        generatedAt: new Date().toISOString(),
        stats // Save stats to history too if you want!
      }

      await saveGeneratedResume(user.uid, resumeId, selectedLayout, jobDescription, resumeContent)
      await saveHistoryEntry(user.uid, selectedOption, jobDescription, JSON.stringify(resumeContent))

    } catch (err: any) {
      console.error("Error generating resume:", err)
      setError(err.message || "Failed to generate resume")
      setIsGenerating(false)
    }
  }

  const handleViewResult = () => {
    if (resumeIdToView) {
        router.push(`/dashboard/preview?id=${resumeIdToView}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mb-20">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-600 font-medium">{error}</CardContent>
        </Card>
      )}

      {/* 1. Upload & JD Section (Same as before) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upload Resume</CardTitle>
            <CardDescription className="text-sm">Drag and drop your resume (PDF/DOCX)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleFileSelect} uploadedFile={uploadedFile} isUploading={isUploading} />
            {parsedResume && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">✓ Resume parsed: {parsedResume.personal?.name || "Found"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Job Description</CardTitle>
            <CardDescription className="text-sm">Paste the job description here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste job description..."
              className="min-h-32 resize-none"
              value={jobDescription}
              onChange={(e) => handleJobDescriptionChange(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* 2. Layout Section (Same as before) */}
      {parsedResume && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
             <CardTitle className="text-lg font-semibold">Choose Layout</CardTitle>
             <CardDescription className="text-sm">AI recommendation highlighted.</CardDescription>
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

      {/* 3. GENERATION SECTION (Updated with Progress) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate</CardTitle>
          <CardDescription className="text-sm">Create your tailored resume</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* If Generating or Finished, show Progress Component */}
          {isGenerating ? (
            <div className="space-y-4">
               <GenerationProgress isFinished={generationFinished} finalStats={generationStats} />
               
               {/* Show "View Result" button only when finished */}
               {generationFinished && (
                 <Button 
                   onClick={handleViewResult} 
                   className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 animate-in fade-in slide-in-from-bottom-2"
                 >
                    View Tailored Resume <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               )}
            </div>
          ) : (
            <>
              <GenerationOptions selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
              <Button
                onClick={handleGenerate}
                disabled={!parsedResume || !selectedLayout || !jobDescription.trim()}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                Generate Resume
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  )
}