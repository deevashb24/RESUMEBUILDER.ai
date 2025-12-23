"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { SimpleResumeLayout } from "@/components/layouts/demo"
import { getHistoryEntry } from "@/lib/history"
import { ParsedResumeData } from "@/lib/resume"

function PreviewContent() {
  const searchParams = useSearchParams()
  
  // FIX: Use optional chaining (?.) to safely handle if searchParams is null
  const id = searchParams?.get("id")

  const [data, setData] = useState<ParsedResumeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (id) {
        setLoading(true)
        // Correctly fetch from the 'history' collection we setup
        const entry = await getHistoryEntry(id)
        if (entry && entry.output) {
          try {
            setData(JSON.parse(entry.output))
          } catch (e) {
            console.error("Failed to parse history data", e)
          }
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Loading preview...
         </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No data found. Please generate a resume first.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[800px] my-8">
       <SimpleResumeLayout data={data} />
    </div>
  )
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="p-6 md:p-8">
        {/* Suspense is required when using useSearchParams in Next.js */}
        <Suspense fallback={<div>Loading...</div>}>
          <PreviewContent />
        </Suspense>
      </main>
    </div>
  )
}