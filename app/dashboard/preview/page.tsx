"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getHistoryEntry } from "@/lib/history"
import { getResume } from "@/lib/resume"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

const ResumeRenderer = dynamic(() => import("@/components/resume-renderer").then(mod => mod.ResumeRenderer), { ssr: false })
const LetterPreview = dynamic(() => import("@/components/letter-preview").then(mod => mod.LetterPreview), { ssr: false })
const PricingModal = dynamic(() => import("@/components/pricing-modal").then(mod => mod.PricingModal), { ssr: false })

const LAYOUT_OPTIONS = [
  { id: "demo", name: "Professional", desc: "Two-column" },
  { id: "iitk", name: "IIT Kanpur", desc: "Academic" },
  { id: "modern", name: "Modern", desc: "Sidebar" },
  { id: "minimal", name: "Minimalist", desc: "Clean" },
]

type TabId = "design" | "content"

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams?.get("id")
  const { user, isPremium, unlockedGenerations } = useAuth()
  const supabase = createClient()

  const [data, setData] = useState<any>(null)
  const [docType, setDocType] = useState("resume")
  const [selectedLayout, setSelectedLayout] = useState("demo")
  const [dataSource, setDataSource] = useState<"history" | "resume" | null>(null)
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [editIndex, setEditIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("design")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle")
  const [pageCount, setPageCount] = useState(1)

  const [pageMode, setPageMode] = useState<"single" | "multi">("single")
  const [scale, setScale] = useState(1)
  const [dismissedPageModeSuggestion, setDismissedPageModeSuggestion] = useState(false)

  // Load pageMode from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const saved = localStorage.getItem(`pageMode_${id}`)
      if (saved === "single" || saved === "multi") {
        setPageMode(saved)
      }
    }
  }, [id])

  const handlePageModeToggle = (mode: "single" | "multi") => {
    setPageMode(mode)
    if (typeof window !== "undefined" && id) {
      localStorage.setItem(`pageMode_${id}`, mode)
    }
    // Reset dismiss state so they see recommendations if they overflow again
    if (mode === "single") {
      setDismissedPageModeSuggestion(false)
    }
  }

  const componentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSpecificallyUnlocked = id ? unlockedGenerations?.includes(id) : false
  const isUnlocked = true // BYPASS: isPremium || isSpecificallyUnlocked

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: data?.personalInfo?.fullName || "Document",
  })

  const onDownloadClick = () => {
    if (!isUnlocked) { setShowPricing(true); return }
    handlePrint()
  }

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Save to DB (Debounced)
  const saveToDatabase = (dataToSave: any) => {
    if (!id || !user) return
    setAutoSaveStatus("saving")

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (dataSource === "resume") {
          const updatePayload: any = { parsedData: dataToSave }
          if (hasGeneratedContent) {
            const { data: resumeData } = await supabase.from("resumes").select("generatedContent").eq("id", id).single()
            if (resumeData?.generatedContent) {
              updatePayload.generatedContent = { ...resumeData.generatedContent, parsedData: dataToSave }
            }
          }
          await supabase.from("resumes").update(updatePayload).eq("id", id)
        } else if (dataSource === "history") {
          const { data: historySnap } = await supabase.from("history").select("output").eq("id", id).single()
          if (historySnap?.output) {
            const jsonOutput = JSON.parse(historySnap.output)
            if (jsonOutput.parsedData) jsonOutput.parsedData = dataToSave
            else Object.assign(jsonOutput, dataToSave)
            await supabase.from("history").update({ output: JSON.stringify(jsonOutput) }).eq("id", id)
          }
        }
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus("idle"), 3000)
      } catch {
        setAutoSaveStatus("idle")
      }
    }, 1000)
  }

  const handleUpdateContent = (pathStr: string, newValue: any) => {
    if (!data) return
    const newData = structuredClone(data)
    const parts = pathStr.split(".")
    let current = newData
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = isNaN(Number(parts[i + 1])) ? {} : []
      current = current[parts[i]]
    }
    let finalValue = newValue
    if (typeof newValue === "string" && (newValue.trim().startsWith("[") || newValue.trim().startsWith("{"))) {
      try { finalValue = JSON.parse(newValue) } catch {}
    }
    current[parts[parts.length - 1]] = finalValue
    setData(newData)
    const hist = editHistory.slice(0, editIndex + 1)
    hist.push(newData)
    setEditHistory(hist)
    setEditIndex(hist.length - 1)
    saveToDatabase(newData)
  }

  const handleUndo = () => {
    if (editIndex > 0) {
      const prev = editHistory[editIndex - 1]
      setEditIndex(editIndex - 1)
      setData(prev)
      saveToDatabase(prev)
    }
  }

  const handleRedo = () => {
    if (editIndex < editHistory.length - 1) {
      const next = editHistory[editIndex + 1]
      setEditIndex(editIndex + 1)
      setData(next)
      saveToDatabase(next)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); handleUndo() }
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y")) { e.preventDefault(); handleRedo() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [editIndex, editHistory])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !id) return
    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split(".").pop()
      const storagePath = `resumes/${id}/profile_pic_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from("resumes").upload(storagePath, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(storagePath)
      const url = urlData.publicUrl
      const updatedData = { ...data, personal: { ...data.personal, picture: url } }
      setData(updatedData)
      const hist = editHistory.slice(0, editIndex + 1)
      hist.push(updatedData)
      setEditHistory(hist)
      setEditIndex(hist.length - 1)
      await saveToDatabase(updatedData)
    } catch { alert("Photo upload failed.") }
    finally { setUploadingPhoto(false) }
  }

  const userId = user?.id || null
  useEffect(() => {
    async function loadData() {
      if (!id) { setLoading(false); return }
      if (!data) setLoading(true)
      try {
        let foundData: any = null
        let type = "resume"; let initialLayout = "demo"
        let source: "history" | "resume" | null = null; let hasGen = false

        const historyEntry = await getHistoryEntry(id)
        if (historyEntry?.output) {
          try {
            const parsed = JSON.parse(historyEntry.output)
            if (parsed.type) type = parsed.type
            if (parsed.layoutId) initialLayout = parsed.layoutId
            foundData = parsed.parsedData || parsed
            source = "history"
          } catch {}
        }
        if (!foundData) {
          const resumeEntry = await getResume(id)
          if (resumeEntry) {
            const content = (resumeEntry as any).generatedContent
            if (content) { if (content.type) type = content.type; foundData = content.parsedData || resumeEntry.parsedData; hasGen = true }
            else { foundData = resumeEntry.parsedData }
            if (resumeEntry.layoutId) initialLayout = resumeEntry.layoutId
            source = "resume"
          }
        }
        if (foundData?.personal && !foundData.personal.picture && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture)) {
          foundData.personal.picture = user.user_metadata?.avatar_url || user.user_metadata?.picture
        }
        setData(foundData)
        if (!data) { setEditHistory([foundData]); setEditIndex(0) }
        setDocType(type)
        setSelectedLayout(prev => (!data ? initialLayout : prev))
        setDataSource(source)
        setHasGeneratedContent(hasGen)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [id, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0f10" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,138,0,0.2)", borderTopColor: "#ff8a00" }} />
          <p className="text-sm" style={{ color: "rgba(225,227,228,0.5)" }}>Preparing preview…</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0f10" }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: "#e1e3e4" }}>Document not found.</p>
          <Link href="/history">
            <button className="px-6 py-2 rounded-xl text-sm font-bold" style={{ background: "#ff8a00", color: "#000" }}>← Back to Library</button>
          </Link>
        </div>
      </div>
    )
  }

  const isLetter = docType === "cover-letter" || docType === "sop"
  const glassPanel = { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.1)" }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#0c0f10", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top AppBar */}
      <header className="flex justify-between items-center h-16 px-8 flex-shrink-0 sticky top-0 z-50" style={{ ...glassPanel, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="flex items-center gap-4">
          <Link href="/history" className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: "rgba(225,227,228,0.5)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Library
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span className="text-sm font-semibold capitalize" style={{ color: "#e1e3e4" }}>
            {docType.replace("-", " ")} Studio
          </span>
        </div>

        <Link href="/" className="text-lg font-black tracking-tight transition-transform hover:scale-105" style={{ background: "linear-gradient(to right, #ff8a00, #ffb77f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          ResumeBuilder.ai
        </Link>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <button onClick={handleUndo} disabled={editIndex <= 0} title="Undo (⌘Z)" className="p-2 rounded-lg transition-all" style={{ color: editIndex <= 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </button>
          <button onClick={handleRedo} disabled={editIndex >= editHistory.length - 1} title="Redo (⌘⇧Z)" className="p-2 rounded-lg transition-all" style={{ color: editIndex >= editHistory.length - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          </button>

          {/* Photo upload (resume only) */}
          {!isLetter && (
            <>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/jpg" onChange={handlePhotoUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(225,227,228,0.8)" }}>
                {uploadingPhoto
                  ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                }
                {data?.personal?.picture ? "Change Photo" : "Add Photo"}
              </button>
            </>
          )}

          <button onClick={onDownloadClick} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all" style={{ background: isUnlocked ? "#ff8a00" : "rgba(255,138,0,0.3)", color: isUnlocked ? "#000" : "rgba(0,0,0,0.5)", boxShadow: isUnlocked ? "0 0 20px rgba(255,138,0,0.3)" : "none" }}>
            {isUnlocked
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 11V7A5 5 0 0 0 7 7v4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/></svg>
            }
            {isUnlocked ? "Export to PDF" : "Unlock to Download"}
          </button>
        </div>
      </header>

      {/* Main Studio */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 flex-shrink-0 flex flex-col h-full z-10 overflow-hidden" style={glassPanel}>
          {/* Tabs */}
          <div className="flex border-b px-5 pt-5 gap-1 flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {(["design", "content"] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-semibold capitalize transition-all rounded-t-lg"
                style={{
                  color: activeTab === tab ? "#ff8a00" : "rgba(225,227,228,0.45)",
                  borderBottom: activeTab === tab ? "2px solid #ff8a00" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-7">
            {activeTab === "design" ? (
              <>
                {/* Layout (resume only) */}
                {!isLetter && (
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "rgba(221,193,174,0.6)" }}>Layout Structure</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {LAYOUT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedLayout(opt.id)}
                          className="aspect-video rounded-lg flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium cursor-pointer"
                          style={{
                            background: selectedLayout === opt.id ? "rgba(255,138,0,0.12)" : "rgba(255,255,255,0.04)",
                            border: selectedLayout === opt.id ? "1px solid #ff8a00" : "1px solid rgba(255,255,255,0.08)",
                            color: selectedLayout === opt.id ? "#ff8a00" : "rgba(225,227,228,0.5)",
                          }}
                        >
                          {opt.name}
                          <span className="text-[9px]" style={{ color: "rgba(225,227,228,0.3)" }}>{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Pagination Mode (resume only) */}
                {!isLetter && (
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "rgba(221,193,174,0.6)" }}>Pagination Mode</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handlePageModeToggle("single")}
                        className="p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer"
                        style={{
                          background: pageMode === "single" ? "rgba(255,138,0,0.08)" : "rgba(255,255,255,0.02)",
                          border: pageMode === "single" ? "1px solid rgba(255,138,0,0.4)" : "1px solid rgba(255,255,255,0.05)",
                          boxShadow: pageMode === "single" ? "0 0 15px rgba(255,138,0,0.05)" : "none"
                        }}
                      >
                        <div className="p-2 rounded-lg" style={{ background: pageMode === "single" ? "rgba(255,138,0,0.15)" : "rgba(255,255,255,0.04)", color: pageMode === "single" ? "#ff8a00" : "rgba(225,227,228,0.4)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/></svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: pageMode === "single" ? "#ff8a00" : "#e1e3e4" }}>Single Page</div>
                          <div className="text-[9px]" style={{ color: "rgba(225,227,228,0.4)" }}>Scales and shrinks contents to fit on a single A4</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePageModeToggle("multi")}
                        className="p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer"
                        style={{
                          background: pageMode === "multi" ? "rgba(255,138,0,0.08)" : "rgba(255,255,255,0.02)",
                          border: pageMode === "multi" ? "1px solid rgba(255,138,0,0.4)" : "1px solid rgba(255,255,255,0.05)",
                          boxShadow: pageMode === "multi" ? "0 0 15px rgba(255,138,0,0.05)" : "none"
                        }}
                      >
                        <div className="p-2 rounded-lg" style={{ background: pageMode === "multi" ? "rgba(255,138,0,0.15)" : "rgba(255,255,255,0.04)", color: pageMode === "multi" ? "#ff8a00" : "rgba(225,227,228,0.4)" }}>
                          <div className="flex gap-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="12" height="16" rx="1"/></svg>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: pageMode === "multi" ? "#ff8a00" : "#e1e3e4" }}>Multi-page (Smart Pagination)</div>
                          <div className="text-[9px]" style={{ color: "rgba(225,227,228,0.4)" }}>Flows naturally across multiple sheets without scaling</div>
                        </div>
                      </button>
                    </div>
                  </section>
                )}

              </>
            ) : (
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "rgba(221,193,174,0.6)" }}>Content Fields</h3>
                {data?.personal && (
                  <div className="space-y-2">
                    {Object.entries(data.personal as Record<string, string>).filter(([k]) => k !== "picture").map(([key, val]) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "rgba(221,193,174,0.5)" }}>{key}</label>
                        <input
                          defaultValue={val as string}
                          onBlur={(e) => handleUpdateContent(`personal.${key}`, e.target.value)}
                          className="w-full text-sm rounded-lg px-3 py-2 input-ghost"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs pt-2" style={{ color: "rgba(225,227,228,0.3)" }}>Click any field on the preview to edit inline.</p>
              </section>
            )}
          </div>
        </aside>

        {/* Right: Preview Canvas */}
        <section className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-6" style={{ background: "rgba(12,15,16,0.5)" }}>
          {/* Auto-save indicator */}
          <div className="w-full max-w-[794px] flex justify-end mb-3">
            <span className="text-xs flex items-center gap-1.5" style={{ color: autoSaveStatus === "saved" ? "#4ade80" : "rgba(225,227,228,0.35)" }}>
              {autoSaveStatus === "saving"
                ? <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…</>
                : autoSaveStatus === "saved"
                ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
                : null
              }
            </span>
          </div>

          {/* Page Mode Overflow Suggestion Notification */}
          {!isLetter && pageMode === "single" && scale < 0.99 && !dismissedPageModeSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[794px] mb-6 p-4 rounded-2xl flex items-center justify-between gap-4 text-sm relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255, 138, 0, 0.08) 0%, rgba(255, 183, 127, 0.03) 100%)",
                border: "1px solid rgba(255, 138, 0, 0.25)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(8px)"
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                <div>
                  <h4 className="font-bold text-[#ff8a00] mb-0.5">Multi-page layout suggested</h4>
                  <p className="text-[12px] leading-relaxed text-[#e1e3e4]/80">
                    Your content has exceeded a single page. We've automatically scaled text sizes down to fit, but it may look compressed when printed. Switch to Multi-page Mode for a full-size, elegant multi-page layout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handlePageModeToggle("multi")}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-[#ff8a00] text-[#000] hover:scale-105"
                  style={{
                    boxShadow: "0 0 12px rgba(255, 138, 0, 0.3)"
                  }}
                >
                  Switch to Multi-page
                </button>
                <button
                  onClick={() => setDismissedPageModeSuggestion(true)}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
                  title="Dismiss suggestion"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* Multi-Page Canvas — grows to accommodate N pages */}
          <div
            ref={componentRef}
            className="relative"
            style={{ width: 794 }}
          >
            {/* Page count badge */}
            {!isLetter && pageCount > 1 && (
              <div
                className="absolute -top-8 right-0 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full z-20"
                style={{ background: "rgba(255,138,0,0.12)", border: "1px solid rgba(255,138,0,0.3)", color: "#ff8a00" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                {pageCount} pages
              </div>
            )}

            {isLetter
              ? (
                <div
                  style={{
                    width: 794,
                    minHeight: 1123,
                    background: "white",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
                  }}
                >
                  <LetterPreview data={data} />
                </div>
              )
              : <ResumeRenderer
                  layoutId={selectedLayout}
                  data={data}
                  showWatermark={!isUnlocked}
                  onUpdate={handleUpdateContent}
                  onPageCountChange={setPageCount}
                  pageMode={pageMode}
                  onScaleChange={setScale}
                />
            }
          </div>

          {/* Locked overlay */}
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center gap-3 p-6 rounded-2xl text-center max-w-sm"
              style={{ background: "rgba(255,138,0,0.06)", border: "1px solid rgba(255,138,0,0.2)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff8a00">
                <path d="M17 11V7A5 5 0 0 0 7 7v4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
              </svg>
              <p className="text-sm font-semibold" style={{ color: "#e1e3e4" }}>Upgrade to download this document</p>
              <button onClick={() => setShowPricing(true)} className="px-6 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#ff8a00", color: "#000" }}>
                Unlock Document
              </button>
            </motion.div>
          )}
          <div className="h-20 w-full flex-shrink-0" />
        </section>
      </main>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} generationId={id || undefined} />
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0f10" }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,138,0,0.2)", borderTopColor: "#ff8a00" }} />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}