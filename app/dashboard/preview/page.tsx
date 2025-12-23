"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { SimpleResumeLayout } from "@/components/layouts/demo"
import { getHistoryEntry } from "@/lib/history"
import { getResume, ParsedResumeData } from "@/lib/resume"

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")

  const [data, setData] = useState<ParsedResumeData | null>(null)
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

        // 1. Try fetching from History
        const historyEntry = await getHistoryEntry(id)
        
        if (historyEntry?.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            // CRITICAL FIX: Unwrap the data if it's nested
            foundData = parsed.parsedData || parsed
          } catch (e) {
            console.error("Failed to parse history JSON", e)
          }
        }

        // 2. Fallback: Try fetching from Resumes collection
        if (!foundData) {
          const resumeEntry = await getResume(id)
          if (resumeEntry) {
            // Check generatedContent first, then raw parsedData
            const content = (resumeEntry as any).generatedContent
            if (content && content.parsedData) {
               foundData = content.parsedData
            } else {
               foundData = resumeEntry.parsedData
            }
          }
        }

        setData(foundData)
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
          No resume data found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="max-w-5xl mx-auto py-8 px-4">
         <div className="bg-white shadow-lg rounded-lg overflow-hidden min-h-[800px]">
            <SimpleResumeLayout data={data} />
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