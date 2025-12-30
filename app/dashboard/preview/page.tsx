"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ResumeRenderer } from "@/components/resume-renderer" // Use the Renderer!
import { LetterPreview } from "@/components/letter-preview" // NEW
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState<string>("resume") // Track the type
  const [layoutId, setLayoutId] = useState<string>("demo")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let foundData: any = null
        let type = "resume"
        let layout = "demo"

        // 1. Try fetching from History
        const historyEntry = await getHistoryEntry(id)
        
        if (historyEntry?.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            
            // Check if this is our new format { type, parsedData, ... }
            if (parsed.type) type = parsed.type
            if (parsed.layoutId) layout = parsed.layoutId

            // Unwrap data
            foundData = parsed.parsedData || parsed
          } catch (e) {
            console.error("Failed to parse history JSON", e)
          }
        }

        // 2. Fallback: Fetch from Resumes collection
        if (!foundData) {
          const resumeEntry = await getResume(id)
          if (resumeEntry) {
            const content = (resumeEntry as any).generatedContent
            if (content) {
               if (content.type) type = content.type
               foundData = content.parsedData || resumeEntry.parsedData
            } else {
               foundData = resumeEntry.parsedData
            }
          }
        }

        setData(foundData)
        setDocType(type)
        setLayoutId(layout)

      } catch (err) {
        console.error("Error loading preview data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
           Loading preview...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No data found.
        </div>
      </div>
    )
  }

  // --- RENDER LOGIC ---
  const isLetter = docType === "cover-letter" || docType === "sop"

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center">
         <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${isLetter ? 'max-w-[210mm]' : 'w-full'}`}>
            
            {/* If Letter/SOP, use LetterPreview. Else use ResumeRenderer */}
            {isLetter ? (
              <LetterPreview data={data} />
            ) : (
              <ResumeRenderer layoutId={layoutId} data={data} />
            )}

         </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PreviewContent />
    </Suspense>
  )
}