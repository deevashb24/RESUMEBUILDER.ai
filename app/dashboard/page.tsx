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
import { GenerationProgress } from "@/components/generation-progress"
import { generateContent, GenerationType } from "@/actions/generate-content"
import { ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [selectedOption, setSelectedOption] = useState<GenerationType>("resume")
  const [jobDescription, setJobDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>("demo")
  const [recommendedLayout, setRecommendedLayout] = useState<string | null>(null)
  
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
      setSelectedLayout("demo")
    } catch (err: any) {
      setError(err.message || "Failed to upload/parse resume")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!user || !parsedResume || !jobDescription.trim()) {
      setError("Please upload a resume and provide a job description")
      return
    }

    setIsGenerating(true)
    setGenerationFinished(false)
    setError(null)

    try {
      let resumeId: string
      // Always save parsed resume first
      if (uploadedFile) {
        const { url, path } = await uploadResumeFile(user.uid, uploadedFile)
        resumeId = await saveParsedResume(user.uid, parsedResume, url, path)
      } else {
        resumeId = await saveParsedResume(user.uid, parsedResume)
      }

      let generatedData: any
      let stats: any
      let finalIdForPreview: string = resumeId // Default

      // === BRANCH LOGIC ===
      if (selectedOption === "resume") {
        // --- RESUME PATH ---
        const response = await fetch("/api/tailor-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeData: parsedResume, jobDescription })
        })

        if (!response.ok) throw new Error("Resume generation failed")
        const result = await response.json()
        generatedData = result.data
        stats = result.stats

        // Save to Resumes Collection
        const resumeContent = {
          layoutId: selectedLayout,
          parsedData: generatedData,
          jobDescription,
          generatedAt: new Date().toISOString(),
          stats
        }
        await saveGeneratedResume(user.uid, resumeId, selectedLayout || "demo", jobDescription, resumeContent)
        
        // For resumes, we view the Resume ID
        finalIdForPreview = resumeId
      } else {
        // --- SOP / LETTER PATH ---
        const resumeTextString = JSON.stringify(parsedResume)
        const resultString = await generateContent(resumeTextString, jobDescription, selectedOption)
        const result = JSON.parse(resultString)
        generatedData = result
        stats = result.stats
        // For letters, we DO NOT use saveGeneratedResume. We rely on History.
      }

      // === SAVE HISTORY & SET PREVIEW ID ===
      const finalHistoryContent = {
        type: selectedOption,
        layoutId: selectedLayout,
        parsedData: generatedData, 
        jobDescription,
        generatedAt: new Date().toISOString(),
        stats
      }

      const historyId = await saveHistoryEntry(
        user.uid, 
        selectedOption, 
        jobDescription, 
        JSON.stringify(finalHistoryContent)
      )

      // FIX: If it's a letter/SOP, we MUST view the History Entry, not the Resume ID
      if (selectedOption !== 'resume') {
        finalIdForPreview = historyId
      }

      setGenerationStats(stats)
      setGenerationFinished(true)
      setResumeIdToView(finalIdForPreview)

    } catch (err: any) {
      console.error("Error generating:", err)
      setError(err.message || "Failed to generate content")
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

      {/* Upload & JD */}
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
            <CardTitle className="text-lg font-semibold">Job Description / Requirements</CardTitle>
            <CardDescription className="text-sm">Paste the JD or Program Details here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={selectedOption === 'sop' ? "Paste university program details..." : "Paste job description..."}
              className="min-h-32 resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Layout - ONLY for Resumes */}
      {parsedResume && selectedOption === "resume" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
             <CardTitle className="text-lg font-semibold">Choose Layout</CardTitle>
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

      {/* GENERATE SECTION */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate</CardTitle>
          <CardDescription className="text-sm">Create your document</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {isGenerating ? (
            <div className="space-y-4">
               {/* Updated Component with Type */}
               <GenerationProgress 
                  isFinished={generationFinished} 
                  finalStats={generationStats} 
                  generationType={selectedOption} 
               />
               
               {generationFinished && (
                 <Button onClick={handleViewResult} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
                    View Result <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               )}
            </div>
          ) : (
            <>
              <GenerationOptions selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
              <Button
                onClick={handleGenerate}
                disabled={!parsedResume || !jobDescription.trim()}
                className="w-full h-11 bg-primary text-primary-foreground font-medium text-base"
              >
                Generate {selectedOption === 'sop' ? 'SOP' : selectedOption === 'cover-letter' ? 'Cover Letter' : 'Resume'}
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  )
}