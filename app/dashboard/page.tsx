"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { GenerationOptions } from "@/components/generation-options"
import { LayoutSelector } from "@/components/layout-selector"
import { useAuth } from "@/lib/auth-context"
import { useGeneration } from "@/lib/generation-context" // Use the context
import { GenerationProgress } from "@/components/generation-progress"
import { ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Get everything from Global Context
  const {
    selectedOption, setSelectedOption,
    jobDescription, setJobDescription,
    uploadedFile,
    parsedResume,
    isUploading,
    isGenerating,
    generationFinished,
    processUpload,
    generationStats,
    resumeIdToView,
    error,
    handleFileSelect,
    handleGenerate,
    resetGeneration // To reset view if they come back
  } = useGeneration()

  // Reset "View Result" state when mounting dashboard so they can generate again
  useEffect(() => {
    if (!isGenerating && generationFinished) {
       // Optional: Keep the result visible or reset? 
       // For now, we let them see the state.
    }
  }, [])

  if (!authLoading && !user) {
    router.replace("/")
    return null
  }
  if (authLoading) return <div className="p-8 text-center">Loading...</div>

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
            {/* Note: In this version handleFileSelect does both select + upload process automatically for simplicity based on your previous request, or you can separate them in the context */}
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onUpload={processUpload} // Context handles upload on select now
              uploadedFile={uploadedFile} 
              isUploading={isUploading} 
              isParsed={!!parsedResume}
            />
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
             {/* Simplified for now, context can hold layout state if needed */}
             <div className="text-sm text-muted-foreground">Default Professional Layout Selected</div>
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
          
          {isGenerating || generationFinished ? (
            <div className="space-y-4">
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