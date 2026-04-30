"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useGeneration } from "@/lib/generation-context"
import { GenerationProgress } from "@/components/generation-progress"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-context"

const LAYOUT_OPTIONS = [
  { id: "demo", name: "Professional", desc: "Classic two-column" },
  { id: "iitk", name: "IIT Kanpur", desc: "Academic classic" },
  { id: "modern", name: "Modern", desc: "Sidebar accent" },
  { id: "minimal", name: "Minimalist", desc: "Clean & airy" },
]

const DOC_TYPES = [
  {
    id: "resume",
    label: "Resume",
    desc: "ATS-optimized, tailored to the JD",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    desc: "Personalized, compelling narrative",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    id: "sop",
    label: "SOP",
    desc: "Statement of purpose for admissions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
]

function AtelierDropzone({ onFileSelect, onUpload, uploadedFile, isUploading, isParsed }: any) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0])
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading || !!uploadedFile,
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileSelect(null)
  }

  if (uploadedFile) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ borderColor: isParsed ? "rgba(22,163,74,0.4)" : "rgba(255,138,0,0.3)", background: isParsed ? "rgba(22,163,74,0.05)" : "rgba(255,138,0,0.05)" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isParsed ? "rgba(22,163,74,0.15)" : "rgba(255,138,0,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isParsed ? "#16a34a" : "#ff8a00"} strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#e1e3e4" }}>{uploadedFile.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(225,227,228,0.5)" }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {isParsed ? (
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#16a34a" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Parsed
            </div>
          ) : !isUploading && (
            <button onClick={handleRemove} className="p-1 rounded-full transition-colors" style={{ color: "rgba(225,227,228,0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {!isParsed && (
          <button
            onClick={(e) => { e.stopPropagation(); if (onUpload) onUpload() }}
            disabled={isUploading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: isUploading ? "rgba(255,138,0,0.3)" : "#ff8a00",
              color: isUploading ? "rgba(0,0,0,0.5)" : "#000",
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Analyzing Resume…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                Upload & Analyze
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300"
      style={{
        borderColor: isDragActive ? "#ff8a00" : "rgba(255,255,255,0.12)",
        background: isDragActive ? "rgba(255,138,0,0.05)" : "transparent",
      }}
    >
      <input {...getInputProps()} />
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300"
        style={{ background: "rgba(255,138,0,0.1)", color: "#ff8a00" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
      </div>
      <p className="font-semibold text-sm mb-1" style={{ color: "#e1e3e4" }}>
        {isDragActive ? "Drop it here" : "Drag & drop your resume"}
      </p>
      <p className="text-xs" style={{ color: "rgba(225,227,228,0.45)" }}>PDF or DOCX · Max 5MB</p>
      <div
        className="mt-4 inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all"
        style={{ background: "rgba(255,255,255,0.07)", color: "#e1e3e4", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        Browse Files
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const {
    selectedOption, setSelectedOption,
    jobDescription, setJobDescription,
    uploadedFile, parsedResume, isUploading, isGenerating,
    generationFinished, processUpload, generationStats,
    resumeIdToView, error, handleFileSelect, handleGenerate,
    selectedLayout, setSelectedLayout,
  } = useGeneration()

  useEffect(() => {
    if (!authLoading && !user) router.replace("/")
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,138,0,0.2)", borderTopColor: "#ff8a00" }} />
      </div>
    )
  }

  const handleViewResult = () => {
    if (resumeIdToView) router.push(`/dashboard/preview?id=${resumeIdToView}`)
  }

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"

  const panelStyle = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.09)",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b relative" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute bottom-0 left-0 h-px w-1/4"
          style={{ background: "linear-gradient(to right, #ff8a00, transparent)" }}
        />
        <div>
          <h2 className="text-4xl font-black tracking-tight leading-tight mb-2" style={{ color: "#e1e3e4", letterSpacing: "-0.04em" }}>
            Dashboard
          </h2>
          <p className="text-lg" style={{ color: "rgba(221,193,174,0.8)" }}>
            Welcome back, {userName}. Let's craft something exceptional.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!parsedResume || !jobDescription.trim() || isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
          style={{
            background: (!parsedResume || !jobDescription.trim() || isGenerating) ? "rgba(255,138,0,0.3)" : "#ff8a00",
            color: (!parsedResume || !jobDescription.trim() || isGenerating) ? "rgba(0,0,0,0.4)" : "#000",
            boxShadow: (!parsedResume || !jobDescription.trim() || isGenerating) ? "none" : "0 0 20px rgba(255,138,0,0.3)",
            cursor: (!parsedResume || !jobDescription.trim() || isGenerating) ? "not-allowed" : "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Generate {selectedOption === "sop" ? "SOP" : selectedOption === "cover-letter" ? "Cover Letter" : "Resume"}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2" style={{ background: "rgba(147,0,10,0.3)", border: "1px solid rgba(255,180,171,0.2)", color: "#ffb4ab" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Step 1: Document Type Selector */}
      <div className="grid grid-cols-3 gap-4">
        {DOC_TYPES.map((type) => {
          const isActive = selectedOption === type.id
          return (
            <button
              key={type.id}
              onClick={() => setSelectedOption(type.id as any)}
              className="p-5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden"
              style={{
                background: isActive ? "rgba(255,138,0,0.08)" : "rgba(255,255,255,0.03)",
                border: isActive ? "1px solid rgba(255,138,0,0.5)" : "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
              }}
            >
              {isActive && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,138,0,0.06), transparent)" }} />
              )}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors"
                style={{ background: isActive ? "rgba(255,138,0,0.2)" : "rgba(255,255,255,0.05)", color: isActive ? "#ff8a00" : "rgba(225,227,228,0.5)" }}
              >
                {type.icon}
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: isActive ? "#e1e3e4" : "rgba(225,227,228,0.7)" }}>{type.label}</p>
              <p className="text-xs" style={{ color: "rgba(225,227,228,0.4)" }}>{type.desc}</p>
              {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: "#ff8a00", boxShadow: "0 0 6px #ff8a00" }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Step 2: Upload + Job Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="rounded-xl p-6" style={panelStyle}>
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2" style={{ color: "#e1e3e4" }}>
            <span style={{ color: "#ff8a00" }}>01</span> Your Profile
          </h3>
          <p className="text-xs mb-4" style={{ color: "rgba(221,193,174,0.6)" }}>Upload your current resume for AI analysis</p>
          <AtelierDropzone
            onFileSelect={handleFileSelect}
            onUpload={processUpload}
            uploadedFile={uploadedFile}
            isUploading={isUploading}
            isParsed={!!parsedResume}
          />
        </div>

        {/* JD Card */}
        <div className="rounded-xl p-6" style={panelStyle}>
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2" style={{ color: "#e1e3e4" }}>
            <span style={{ color: "#ff8a00" }}>02</span> Target Role
          </h3>
          <p className="text-xs mb-4" style={{ color: "rgba(221,193,174,0.6)" }}>Paste the job description to tailor your document</p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here. Our AI will extract keywords, responsibilities, and requirements to craft a perfectly tailored document..."
            className="w-full h-52 resize-none rounded-xl p-4 text-sm leading-relaxed input-ghost"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Step 3: Layout Selector (Resume only, after parse) */}
      <AnimatePresence>
        {parsedResume && selectedOption === "resume" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl p-6"
            style={panelStyle}
          >
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2" style={{ color: "#e1e3e4" }}>
              <span style={{ color: "#ff8a00" }}>03</span> Choose Template
            </h3>
            <p className="text-xs mb-5" style={{ color: "rgba(221,193,174,0.6)" }}>Select the layout structure for your resume</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LAYOUT_OPTIONS.map((option) => {
                const isActive = selectedLayout === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedLayout(option.id)}
                    className="rounded-xl overflow-hidden transition-all duration-300 group relative"
                    style={{
                      border: isActive ? "2px solid #ff8a00" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isActive ? "0 0 20px rgba(255,138,0,0.2)" : "none",
                      background: isActive ? "rgba(255,138,0,0.05)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* Preview area */}
                    <div className="aspect-[210/297] flex items-center justify-center relative overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                      {/* Mini resume lines mock */}
                      <div className="w-[65%] space-y-1.5 p-3">
                        <div className="h-2 rounded-sm w-4/5" style={{ background: isActive ? "rgba(255,138,0,0.6)" : "rgba(255,255,255,0.15)" }} />
                        <div className="h-1 rounded-sm w-3/5" style={{ background: "rgba(255,255,255,0.08)" }} />
                        <div className="mt-2 h-px w-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-1 rounded-sm" style={{ width: `${[90,70,85,60][i]}%`, background: "rgba(255,255,255,0.08)" }} />
                        ))}
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#ff8a00" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                    <div
                      className="p-2.5 text-center"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: isActive ? "rgba(255,138,0,0.08)" : "transparent" }}
                    >
                      <p className="text-xs font-bold" style={{ color: isActive ? "#ff8a00" : "rgba(225,227,228,0.6)" }}>{option.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(225,227,228,0.35)" }}>{option.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Generation Progress / Result */}
      <AnimatePresence>
        {(isGenerating || generationFinished) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden"
            style={panelStyle}
          >
            {/* Dark wrapper for the GenerationProgress component */}
            <div className="p-6">
              <div>
                <GenerationProgress
                  isFinished={generationFinished}
                  finalStats={generationStats}
                  generationType={selectedOption}
                />
              </div>

              {generationFinished && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleViewResult}
                  className="w-full mt-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 group"
                  style={{
                    background: "linear-gradient(135deg, #ff8a00, #ffb77f)",
                    color: "#000",
                    boxShadow: "0 0 30px rgba(255,138,0,0.3)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  View Your {selectedOption === "sop" ? "SOP" : selectedOption === "cover-letter" ? "Cover Letter" : "Resume"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big Generate button (main CTA) — only before generation */}
      {!isGenerating && !generationFinished && (
        <button
          onClick={handleGenerate}
          disabled={!parsedResume || !jobDescription.trim()}
          className="w-full py-5 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 group relative overflow-hidden"
          style={{
            background: (!parsedResume || !jobDescription.trim())
              ? "rgba(255,138,0,0.15)"
              : "linear-gradient(135deg, #ff8a00 0%, #ffb77f 100%)",
            color: (!parsedResume || !jobDescription.trim()) ? "rgba(255,183,127,0.4)" : "#000",
            cursor: (!parsedResume || !jobDescription.trim()) ? "not-allowed" : "pointer",
            boxShadow: (!parsedResume || !jobDescription.trim()) ? "none" : "0 0 40px rgba(255,138,0,0.25)",
            border: "1px solid rgba(255,138,0,0.2)",
          }}
        >
          {(parsedResume && jobDescription.trim()) && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(255,255,255,0.1)" }} />
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Generate Tailored {selectedOption === "sop" ? "SOP" : selectedOption === "cover-letter" ? "Cover Letter" : "Resume"}
        </button>
      )}
    </motion.div>
  )
}