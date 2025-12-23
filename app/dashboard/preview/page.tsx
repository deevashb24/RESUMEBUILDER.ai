"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { SimpleResumeLayout } from "@/components/layouts/demo"
import { getHistoryEntry } from "@/lib/history"
import { getResume, ParsedResumeData } from "@/lib/resume" // Import getResume for fallback

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
        let foundData: ParsedResumeData | null = null

        // STRATEGY 1: Try fetching from History (Primary for "View" button)
        const historyEntry = await getHistoryEntry(id)
        
        if (historyEntry?.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            // CRITICAL FIX: Extract 'parsedData' if it's nested inside the history wrapper
            foundData = parsed.parsedData || parsed
          } catch (e) {
            console.error("Failed to parse history JSON", e)
          }
        }

        // STRATEGY 2: If not found in History, try Resumes collection (Fallback for Dashboard redirect)
        if (!foundData) {
          const resumeEntry = await getResume(id)
          if (resumeEntry) {
            // If it has generated content, prefer that. Otherwise use the raw parsed data.
            // We use 'as any' here because generatedContent is flexible
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
           <div className="flex flex-col items-center gap-2">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
             <p>Loading resume preview...</p>
           </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Not Found</h3>
            <p>We couldn't find the data for this resume. It might have been deleted or permissions may be incorrect.</p>
          </div>
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