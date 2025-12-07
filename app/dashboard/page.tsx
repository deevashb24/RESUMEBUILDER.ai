"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { GenerationOptions } from "@/components/generation-options"
import { useAuth } from "@/lib/auth-context"
import { saveHistoryEntry } from "@/lib/history"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"resume" | "sop" | "cover-letter">("resume")
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push("/")
    return null
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!user) return
    
    setIsGenerating(true)
    try {
      // Placeholder for actual generation logic
      // For now, just save to history
      const input = jobDescription || "No job description provided"
      const output = `Generated ${selectedOption} content...` // Placeholder
      
      await saveHistoryEntry(user.uid, selectedOption, input, output)
      
      // You can add success notification here
      console.log("Generation saved to history")
      
      // Reset form
      setJobDescription("")
    } catch (error) {
      console.error("Error generating:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload Resume Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upload Resume</CardTitle>
            <CardDescription className="text-sm">Drag and drop your resume or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>

        {/* Job Description Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Job Description</CardTitle>
            <CardDescription className="text-sm">Paste the job description you're applying for</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste job description here…"
              className="min-h-32 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Generation Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate</CardTitle>
          <CardDescription className="text-sm">Choose what you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GenerationOptions selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
