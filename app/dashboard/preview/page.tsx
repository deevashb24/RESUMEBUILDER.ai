"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-renderer"
import { LetterPreview } from "@/components/letter-preview"
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Lock, CheckCircle, LayoutTemplate } from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"
import Image from "next/image"

// --- 1. DEFINE LAYOUT OPTIONS (ALL 4) ---
const LAYOUT_OPTIONS = [
  {
    id: "demo",
    name: "Professional",
    imageSrc: "/images/layouts/demo.png" // Ensure this file exists in public/images/layouts/
  },
  {
    id: "modern",
    name: "Modern Sidebar",
    imageSrc: "/images/layouts/modern.png"
  },
  {
    id: "minimal",
    name: "Minimalist",
    imageSrc: "/images/layouts/minimal.png"
  },
  {
    id: "creative",
    name: "Creative Bold",
    imageSrc: "/images/layouts/creative.png"
  },
]

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const { isPremium, unlockedGenerations } = useAuth()

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState<string>("resume")

  // --- STATE FOR LAYOUT SELECTION ---
  const [selectedLayout, setSelectedLayout] = useState<string>("demo")

  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

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
        // Default layout from DB, fallback to 'demo'
        let initialLayout = "demo"

        // 1. Try History
        const historyEntry = await getHistoryEntry(id!)
        if (historyEntry && historyEntry.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            if (parsed.type) type = parsed.type
            if (parsed.layoutId) initialLayout = parsed.layoutId
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
        // Only set layout if we haven't selected one manually yet
        setSelectedLayout(initialLayout)

      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [id])

  if (loading) return <div className="p-12 text-center text-gray-500">Preparing preview...</div>
  if (!data) return <div className="p-12 text-center text-gray-500">Document not found.</div>

  const isLetter = docType === "cover-letter" || docType === "sop"

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">

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

      {/* --- LAYOUT SELECTOR (RESUMES ONLY) --- */}
      {!isLetter && (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
            <LayoutTemplate className="w-5 h-5" />
            <h3>Choose Layout</h3>
          </div>

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
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[210/297] bg-gray-100 w-full">
                  {/* Placeholder if image missing, or actual image */}
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    {/* Note: This text hides if the image loads successfully */}
                    <span>Preview</span>
                  </div>
                  {/* UNCOMMENT BELOW WHEN YOU HAVE IMAGES */}
                  {/* <Image 
                     src={option.imageSrc} 
                     alt={option.name} 
                     fill 
                     className="object-cover object-top"
                   /> 
                   */}
                </div>

                {/* Footer Label */}
                <div className={`p-2 text-center text-xs font-medium border-t transition-colors
                  ${selectedLayout === option.id ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-white text-gray-600 border-gray-100"}`}>
                  {option.name}
                </div>

                {/* Selected Checkmark Badge */}
                {selectedLayout === option.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CONTENT PREVIEW --- */}
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center">
        <div className={`bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 relative ${isLetter ? 'max-w-[210mm]' : 'w-full'}`}>

          {/* RENDERER */}
          <div ref={componentRef} className={!isUnlocked ? "opacity-95" : ""}>
            {isLetter ? (
              <LetterPreview data={data} />
            ) : (
              <ResumeRenderer layoutId={selectedLayout} data={data} showWatermark={!isUnlocked} />
            )}
          </div>

          {/* Locked Overlay Hint */}
          {!isUnlocked && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Optional: Add watermark text here if desired */}
            </div>
          )}
        </div>
      </div>

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