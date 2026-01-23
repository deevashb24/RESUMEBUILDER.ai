"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { GenerationOptions } from "@/components/generation-options"
import { useAuth } from "@/lib/auth-context"
import { useGeneration } from "@/lib/generation-context"
import { GenerationProgress } from "@/components/generation-progress"
import { ArrowRight, CheckCircle, LayoutTemplate } from "lucide-react"
import Image from "next/image"

// --- LAYOUT DEFINITIONS ---
const LAYOUT_OPTIONS = [
  { id: "demo", name: "Professional", imageSrc: "/images/layouts/demo.png" },
  { id: "iitk", name: "IIT Kanpur (Classic)", imageSrc: "/images/layouts/iitk.png" },
  { id: "modern", name: "Modern Sidebar", imageSrc: "/images/layouts/modern.png" },
  { id: "minimal", name: "Minimalist", imageSrc: "/images/layouts/minimal.png" },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

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
    selectedLayout, setSelectedLayout // <--- Layout State from Context
  } = useGeneration()

  // Reset view logic if user returns
  useEffect(() => {
    if (!isGenerating && generationFinished) {
      // Optional: You can reset generation state here if needed
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

      {/* --- 1. UPLOAD & JD SECTION --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upload Document</CardTitle>
            <CardDescription className="text-sm">Drag and drop your previous resume (PDF/DOCX)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              onUpload={processUpload}
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

      {/* --- 2. LAYOUT SELECTOR (New Feature) --- */}
      {/* Only show if Parsed Resume exists AND we are generating a Resume (not SOP/Letter) */}
      {parsedResume && selectedOption === "resume" && (
        <Card className="border-0 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-gray-500" />
              Choose Layout
            </CardTitle>
            <CardDescription className="text-sm">Select the design for your generated resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LAYOUT_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSelectedLayout(option.id)}
                  className={`relative group cursor-pointer rounded-xl border-2 transition-all overflow-hidden bg-white
                    ${selectedLayout === option.id
                      ? "border-blue-600 ring-2 ring-blue-100 shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                >
                  {/* Image Preview Container (A4 Ratio) */}
                  <div className="relative aspect-[210/297] bg-gray-50 w-full">
                    {/* Text Fallback if Image fails/missing */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-medium z-0">
                      {option.name}
                    </div>
                    {/* Uncomment this when you add images to /public/images/layouts/ */}
                    {/* <Image 
                       src={option.imageSrc} 
                       alt={option.name} 
                       fill 
                       className="object-cover object-top z-10 transition-opacity"
                     /> 
                     */}
                  </div>

                  {/* Footer Label */}
                  <div className={`p-2 text-center text-xs font-medium border-t transition-colors
                    ${selectedLayout === option.id ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-white text-gray-600 border-gray-100"}`}>
                    {option.name}
                  </div>

                  {/* Checkmark Badge */}
                  {selectedLayout === option.id && (
                    <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white rounded-full p-1 shadow-md">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- 3. GENERATE SECTION --- */}
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