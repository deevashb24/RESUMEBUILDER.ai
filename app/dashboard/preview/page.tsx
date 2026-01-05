"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-renderer"
import { LetterPreview } from "@/components/letter-preview"
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const { isPremium, unlockedGenerations } = useAuth() // Real-time access check

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState<string>("resume")
  const [layoutId, setLayoutId] = useState<string>("demo")
  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)

  const componentRef = useRef<HTMLDivElement>(null)

  // --- ACCESS CONTROL LOGIC ---
  const isSpecificallyUnlocked = id ? unlockedGenerations?.includes(id) : false
  const isUnlocked = isPremium || isSpecificallyUnlocked

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: data?.personalInfo?.fullName || "Document",
  })

  const onDownloadClick = () => {
    if (!isUnlocked) {
      setShowPricing(true)
      return
    }
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

        // 1. Try History
        const historyEntry = await getHistoryEntry(id!)
        if (historyEntry && historyEntry.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            if (parsed.type) type = parsed.type
            if (parsed.layoutId) layout = parsed.layoutId
            foundData = parsed.parsedData || parsed
          } catch (e) { console.error(e) }
        }

        // 2. Fallback to Resume DB
        if (!foundData) {
          const resumeEntry = await getResume(id!)
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

      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [id])

  if (loading) return <div className="p-12 text-center text-gray-500">Preparing preview...</div>
  if (!data) return <div className="p-12 text-center text-gray-500">Document not found.</div>

  const isLetter = docType === "cover-letter" || docType === "sop"

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- HEADER --- */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/history" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                {docType.replace("-", " ")} Preview
                {isUnlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
              </h2>
            </div>
          </div>

          <Button
            onClick={onDownloadClick}
            className={`gap-2 transition-all ${isUnlocked
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-amber-500 hover:bg-amber-600 text-white"}`}
          >
            {isUnlocked ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isUnlocked ? "Download PDF" : "Unlock to Download"}
          </Button>
        </div>
      </div>

      {/* --- CONTENT PREVIEW --- */}
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center pb-24">
        <div className={`bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 relative ${isLetter ? 'max-w-[210mm]' : 'w-full'}`}>
          <div ref={componentRef} className={!isUnlocked ? "opacity-95" : ""}>
            {isLetter ? (
              <LetterPreview data={data} />
            ) : (
              <ResumeRenderer layoutId={layoutId} data={data} showWatermark={!isUnlocked} />
            )}
          </div>

          {/* Overlay Hint if Locked (Optional Visual Cue) */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-white/10 pointer-events-none flex items-center justify-center">
              {/* We rely on the top bar button, but you could put a centered lock icon here */}
            </div>
          )}
        </div>
      </div>

      {/* --- PRICING MODAL --- */}
      {/* Pass the ID so the One-Time payment knows which doc to unlock */}
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