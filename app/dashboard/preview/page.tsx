"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-renderer"
import { LetterPreview } from "@/components/letter-preview"
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, Download, Lock, CheckCircle, LayoutTemplate, Camera, Loader2
} from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "@/lib/auth-context"
import { PricingModal } from "@/components/pricing-modal"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import Image from "next/image"

// --- LAYOUT OPTIONS ---
const LAYOUT_OPTIONS = [
  { id: "demo", name: "Professional", imageSrc: "/images/layouts/demo.png" },
  { id: "iitk", name: "IIT Kanpur (Classic)", imageSrc: "/images/layouts/iitk.png" }, // <--- ADDED
  { id: "modern", name: "Modern Sidebar", imageSrc: "/images/layouts/modern.png" },
  { id: "minimal", name: "Minimalist", imageSrc: "/images/layouts/minimal.png" },
  { id: "creative", name: "Creative Bold", imageSrc: "/images/layouts/creative.png" },
]

function PreviewContent() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const { user, isPremium, unlockedGenerations } = useAuth()

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState<string>("resume")
  const [selectedLayout, setSelectedLayout] = useState<string>("demo")

  // Track Data Source & Structure
  const [dataSource, setDataSource] = useState<'history' | 'resume' | null>(null)
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false) // <--- NEW FLAG

  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const componentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // --- IMAGE UPLOAD LOGIC (FIXED PERSISTENCE) ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !id) return

    setUploadingPhoto(true)
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `resumes/${id}/profile_pic_${Date.now()}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      // 2. Update Local State (Immediate Feedback)
      const updatedData = {
        ...data,
        personal: {
          ...data.personal,
          picture: url
        }
      }
      setData(updatedData)

      // 3. Persist to Firestore based on Source
      if (dataSource === 'resume') {
        // CASE A: Resume Document
        const updatePayload: any = {
          "parsedData.personal.picture": url // Always update the source
        }

        // CRITICAL FIX: Explicitly update generated content if it exists
        if (hasGeneratedContent) {
          updatePayload["generatedContent.parsedData.personal.picture"] = url
        }

        await updateDoc(doc(db, "resumes", id), updatePayload)

      } else if (dataSource === 'history') {
        // CASE B: History Snapshot
        const historyRef = doc(db, "history", id)
        const historySnap = await getDoc(historyRef)

        if (historySnap.exists()) {
          const historyData = historySnap.data()
          if (historyData.output) {
            try {
              const jsonOutput = JSON.parse(historyData.output)
              let updated = false

              // Path 1: parsedData.personal.picture (The generated result)
              if (jsonOutput.parsedData?.personal) {
                jsonOutput.parsedData.personal.picture = url
                updated = true
              }
              // Path 2: personal.picture (Direct structure)
              else if (jsonOutput.personal) {
                jsonOutput.personal.picture = url
                updated = true
              }

              if (updated) {
                await updateDoc(historyRef, {
                  output: JSON.stringify(jsonOutput)
                })
              }
            } catch (err) {
              console.error("Failed to parse/update history JSON", err)
            }
          }
        }
      }

    } catch (error) {
      console.error("Photo upload failed:", error)
      alert("Failed to upload photo. Please try again.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  // --- LOAD DATA ---
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
        let initialLayout = "demo"
        let source: 'history' | 'resume' | null = null
        let hasGen = false

        // 1. Try History
        const historyEntry = await getHistoryEntry(id!)
        if (historyEntry && historyEntry.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            if (parsed.type) type = parsed.type
            if (parsed.layoutId) initialLayout = parsed.layoutId
            foundData = parsed.parsedData || parsed
            source = 'history'
          } catch (e) { console.error(e) }
        }

        // 2. Fallback to Resume DB
        if (!foundData) {
          const resumeEntry = await getResume(id!)
          if (resumeEntry) {
            const content = (resumeEntry as any).generatedContent
            if (content) {
              // We are viewing Generated Content
              if (content.type) type = content.type
              foundData = content.parsedData || resumeEntry.parsedData
              hasGen = true // <--- Mark as having Generated Content
            } else {
              // We are viewing Raw Parsed Content
              foundData = resumeEntry.parsedData
            }
            if (resumeEntry.layoutId) initialLayout = resumeEntry.layoutId
            source = 'resume'
          }
        }

        // --- SMART DEFAULT ---
        // Only use Profile Pic if Resume has NO picture at all
        if (foundData && foundData.personal && !foundData.personal.picture && user?.photoURL) {
          foundData.personal.picture = user.photoURL
        }

        setData(foundData)
        setDocType(type)
        setSelectedLayout(initialLayout)
        setDataSource(source)
        setHasGeneratedContent(hasGen) // <--- Save flag

      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [id, user])

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

          <div className="flex items-center gap-3">
            {/* --- PHOTO UPLOAD (Only for Resumes) --- */}
            {!isLetter && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {data?.personal?.picture ? "Change Photo" : "Add Photo"}
                </Button>
              </>
            )}

            {/* --- DOWNLOAD BUTTON --- */}
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
      </div>

      {/* --- LAYOUT SELECTOR --- */}
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
                <div className="relative aspect-[210/297] bg-gray-100 w-full">
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    <span>{option.name}</span>
                  </div>
                  {/* UNCOMMENT FOR IMAGES */}
                  {/* <Image src={option.imageSrc} alt={option.name} fill className="object-cover object-top" /> */}
                </div>
                <div className={`p-2 text-center text-xs font-medium border-t transition-colors
                  ${selectedLayout === option.id ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-white text-gray-600 border-gray-100"}`}>
                  {option.name}
                </div>
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
          <div ref={componentRef} className={!isUnlocked ? "opacity-95" : ""}>
            {isLetter ? (
              <LetterPreview data={data} />
            ) : (
              <ResumeRenderer layoutId={selectedLayout} data={data} showWatermark={!isUnlocked} />
            )}
          </div>
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