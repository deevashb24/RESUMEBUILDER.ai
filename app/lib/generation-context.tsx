"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { uploadResumeFile, deleteResumeFile } from "@/lib/storage"
import { saveParsedResume, saveGeneratedResume, deleteResume, ParsedResumeData } from "@/lib/resume"
import { saveHistoryEntry } from "@/lib/history"
import { generateContent, GenerationType } from "@/actions/generate-content"
import { useAuth } from "@/lib/auth-context"

interface GenerationContextType {
  // State
  selectedOption: GenerationType
  setSelectedOption: (type: GenerationType) => void
  jobDescription: string
  setJobDescription: (text: string) => void
  uploadedFile: File | null
  parsedResume: ParsedResumeData | null
  isUploading: boolean
  isGenerating: boolean
  generationFinished: boolean
  generationStats: any
  resumeIdToView: string | null
  error: string | null

  // Layout State (Exposed)
  selectedLayout: string
  setSelectedLayout: (layoutId: string) => void

  // Persistence State
  isSaved: boolean
  isSaving: boolean
  savedHistoryId: string | null

  // Actions
  handleFileSelect: (file: File | null) => Promise<void>
  processUpload: () => Promise<void>
  handleGenerate: () => Promise<void>
  saveToHistory: () => Promise<void>
  resetGeneration: () => void
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined)

export function GenerationProvider({ children }: { children: ReactNode }) {
  const { user, isPremium } = useAuth()

  // State
  const [selectedOption, setSelectedOption] = useState<GenerationType>("resume")
  const [jobDescription, setJobDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Tracking IDs for cleanup
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null)

  // Layout State (Defaults to 'demo')
  const [selectedLayout, setSelectedLayout] = useState<string>("demo")

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationFinished, setGenerationFinished] = useState(false)
  const [generationStats, setGenerationStats] = useState<any>(null)
  const [resumeIdToView, setResumeIdToView] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Persistence state — tracks whether the finished generation has been committed to History
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedHistoryId, setSavedHistoryId] = useState<string | null>(null)
  // Store the finished generation payload so saveToHistory can use it without re-generating
  const [pendingHistoryPayload, setPendingHistoryPayload] = useState<{ resumeId?: string; type: string; layoutId: string; parsedData: any; jobDescription: string; stats: any } | null>(null)

  // --- ACTIONS ---

  const handleFileSelect = async (file: File | null) => {
    if (!user) return

    // 1. Handle REMOVAL of previous file
    if (!file) {
      if (storagePath) await deleteResumeFile(storagePath)
      if (currentResumeId) await deleteResume(currentResumeId)

      setUploadedFile(null)
      setParsedResume(null)
      setStoragePath(null)
      setCurrentResumeId(null)
      return
    }

    // 2. Handle NEW SELECTION (Cleanup old, set new)
    if (storagePath) await deleteResumeFile(storagePath)
    if (currentResumeId) await deleteResume(currentResumeId)

    setUploadedFile(file)
    setParsedResume(null)
    setError(null)
  }

  // Trigger Upload & Parsing
  const processUpload = async () => {
    if (!user || !uploadedFile) return
    setIsUploading(true)
    setError(null)

    try {
      const { url, path } = await uploadResumeFile(user.id, uploadedFile)
      setStoragePath(path)

      const formData = new FormData()
      formData.append("file", uploadedFile)

      const parseResponse = await fetch("/api/parse-resume", { method: "POST", body: formData })
      if (!parseResponse.ok) throw new Error("Failed to parse resume")

      const { data: parsedData } = await parseResponse.json()
      setParsedResume(parsedData)

      const newResumeId = await saveParsedResume(user.id, parsedData, url, path)
      setCurrentResumeId(newResumeId)

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to upload/parse resume")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!user || !parsedResume || !jobDescription.trim()) {
      setError("Please upload a resume and provide a job description")
      return
    }

    setIsGenerating(true)
    setGenerationFinished(false)
    setError(null)

    try {
      // Ensure we have a resume ID
      let resumeId = currentResumeId
      if (!resumeId) {
        if (uploadedFile) {
          const { url, path } = await uploadResumeFile(user.id, uploadedFile)
          resumeId = await saveParsedResume(user.id, parsedResume, url, path)
        } else {
          resumeId = await saveParsedResume(user.id, parsedResume)
        }
      }

      let generatedData: any
      let stats: any
      let finalIdForPreview: string = resumeId!

      // --- GENERATION LOGIC ---
      if (selectedOption === "resume") {
        const response = await fetch("/api/tailor-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeData: parsedResume, jobDescription })
        })

        if (!response.ok) throw new Error("Resume generation failed")
        const result = await response.json()
        generatedData = result.data
        stats = result.stats

        const resumeContent = {
          layoutId: selectedLayout, // <--- SAVES SELECTED LAYOUT
          parsedData: generatedData,
          jobDescription,
          generatedAt: new Date().toISOString(),
          stats
        }
        await saveGeneratedResume(user.id, resumeId!, selectedLayout || "demo", jobDescription, resumeContent, isPremium)

        finalIdForPreview = resumeId!
      } else {
        // Cover Letter / SOP
        const resumeTextString = JSON.stringify(parsedResume)
        const resultString = await generateContent(resumeTextString, jobDescription, selectedOption)
        const result = JSON.parse(resultString)
        generatedData = result
        stats = result.stats
      }

      // Store pending payload — history save is now explicit (user-initiated)
      setPendingHistoryPayload({
        resumeId: finalIdForPreview,
        type: selectedOption,
        layoutId: selectedLayout,
        parsedData: generatedData,
        jobDescription,
        stats,
      })
      setIsSaved(false)
      setSavedHistoryId(null)

      setGenerationStats(stats)
      setGenerationFinished(true)
      setResumeIdToView(finalIdForPreview)

    } catch (err: any) {
      console.error("Error generating:", err)
      setError(err.message || "Failed to generate content")
      setIsGenerating(false)
    }
  }

  /**
   * Explicitly commit the current finished generation to History (cloud storage).
   * Called only when the user clicks "Save to History".
   */
  const saveToHistory = async () => {
    if (!user || !pendingHistoryPayload || isSaved || isSaving) return
    setIsSaving(true)
    try {
      const finalHistoryContent = {
        ...pendingHistoryPayload,
        generatedAt: new Date().toISOString(),
      }
      const historyId = await saveHistoryEntry(
        user.id,
        pendingHistoryPayload.type,
        pendingHistoryPayload.jobDescription,
        JSON.stringify(finalHistoryContent),
        isPremium,
        pendingHistoryPayload.resumeId
      )
      setSavedHistoryId(historyId)
      setIsSaved(true)
    } catch (err: any) {
      console.error("Failed to save to history:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const resetGeneration = () => {
    setGenerationFinished(false)
    setResumeIdToView(null)
    setGenerationStats(null)
    setIsSaved(false)
    setIsSaving(false)
    setSavedHistoryId(null)
    setPendingHistoryPayload(null)
  }

  return (
    <GenerationContext.Provider value={{
      selectedOption, setSelectedOption,
      jobDescription, setJobDescription,
      uploadedFile,
      parsedResume,
      isUploading,
      isGenerating,
      generationFinished,
      generationStats,
      resumeIdToView,
      error,
      selectedLayout, setSelectedLayout,
      isSaved, isSaving, savedHistoryId,
      handleFileSelect,
      processUpload,
      handleGenerate,
      saveToHistory,
      resetGeneration
    }}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (context === undefined) {
    throw new Error("useGeneration must be used within a GenerationProvider")
  }
  return context
}