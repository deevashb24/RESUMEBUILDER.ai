"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { GenerationOptions } from "@/components/generation-options"

export default function DashboardPage() {
  const [selectedOption, setSelectedOption] = useState<"resume" | "sop" | "cover-letter">("resume")

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
          <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base">
            Generate
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
