"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-renderer"
import { LetterPreview } from "@/components/letter-preview"
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Lock } from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "@/lib/auth-context" // Auth to check premium
import { PricingModal } from "@/components/pricing-modal" // Pricing Modal

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const { isPremium } = useAuth() // Get Payment Status

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState<string>("resume")
  const [layoutId, setLayoutId] = useState<string>("demo")
  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false) // Modal State

  const componentRef = useRef<HTMLDivElement>(null)

  // --- ACCESS CONTROL ---
  const [isUnlocked, setIsUnlocked] = useState(false)

  // --- PRINT / DOWNLOAD HANDLER ---
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: data?.personalInfo?.fullName || "Document",
  })

  const onDownloadClick = () => {
    // 1. CHECK PAYMENT STATUS (Premium OR specifically unlocked)
    if (!isUnlocked) {
      setShowPricing(true) // Open Payment Modal if not paid
      return
    }
    // 2. DOWNLOAD IF UNLOCKED
    handlePrint()
  }

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
        let unlocked = isPremium // Default to premium status

        const historyEntry = await getHistoryEntry(id!)
        if (historyEntry) {
          if (historyEntry.isUnlocked) unlocked = true // Check specific unlock
          if (historyEntry.output) {
            try {
              const parsed = JSON.parse(historyEntry.output)
              if (parsed.type) type = parsed.type
              if (parsed.layoutId) layout = parsed.layoutId
              foundData = parsed.parsedData || parsed
            } catch (e) { console.error(e) }
          }
        }

        // If not found in history, check resumes (fallback or source)
        if (!foundData) {
          const resumeEntry = await getResume(id!)
          if (resumeEntry) {
            if (resumeEntry.isUnlocked) unlocked = true
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
        setIsUnlocked(unlocked || isPremium) // Double check premium

      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [id, isPremium]) // Re-run if premium status changes

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading preview... </div>
  if (!data) return <div className="p-8 text-center text-muted-foreground">No data found.</div>

  const isLetter = docType === "cover-letter" || docType === "sop"

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- HEADER --- */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/history" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="font-semibold text-gray-700 capitalize">
              {docType.replace("-", " ")} Preview
            </h2>
          </div>

          <Button
            onClick={onDownloadClick}
            className={`gap-2 ${!isUnlocked ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-900"}`}
          >
            {isUnlocked ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isUnlocked ? "Download PDF" : "Unlock & Download"}
          </Button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center">
        <div className={`bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 relative ${isLetter ? 'max-w-[210mm]' : 'w-full'}`}>
          {/* BLUR OVERLAY IF LOCKED (Optional) - User didn't strictly ask for blur logic in preview but "locked state" */}
          {/* But we allow preview, just not download. */}

          <div ref={componentRef} className={!isUnlocked ? "pointer-events-none select-none" : ""}>
            {isLetter ? (
              <LetterPreview data={data} />
            ) : (
              <ResumeRenderer layoutId={layoutId} data={data} />
            )}
          </div>
        </div>
      </div>

      {/* --- PRICING MODAL --- */}
      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        generationId={id || undefined}
      />
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