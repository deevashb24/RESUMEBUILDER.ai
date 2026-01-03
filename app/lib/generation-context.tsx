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

  // Actions
  handleFileSelect: (file: File | null) => Promise<void>
  processUpload: () => Promise<void> // ✅ EXPOSED NOW
  handleGenerate: () => Promise<void>
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
  const [selectedLayout, setSelectedLayout] = useState<string | null>("demo")

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationFinished, setGenerationFinished] = useState(false)
  const [generationStats, setGenerationStats] = useState<any>(null)
  const [resumeIdToView, setResumeIdToView] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // --- ACTIONS ---

  const handleFileSelect = async (file: File | null) => {
    if (!user) return

    // 1. Handle REMOVAL
    if (!file) {
      if (storagePath) await deleteResumeFile(storagePath)
      if (currentResumeId) await deleteResume(currentResumeId)

      setUploadedFile(null)
      setParsedResume(null)
      setStoragePath(null)
      setCurrentResumeId(null)
      return
    }

    // 2. Handle NEW SELECTION (But don't upload yet)
    if (storagePath) await deleteResumeFile(storagePath)
    if (currentResumeId) await deleteResume(currentResumeId)

    setUploadedFile(file)
    setParsedResume(null)
    setError(null)
  }

  // Helper to trigger the actual upload/parse logic (Called by UI button)
  const processUpload = async () => {
    if (!user || !uploadedFile) return
    setIsUploading(true)
    setError(null)

    try {
      const { url, path } = await uploadResumeFile(user.uid, uploadedFile)
      setStoragePath(path)

      const formData = new FormData()
      formData.append("file", uploadedFile)

      const parseResponse = await fetch("/api/parse-resume", { method: "POST", body: formData })
      if (!parseResponse.ok) throw new Error("Failed to parse resume")

      const { data: parsedData } = await parseResponse.json()
      setParsedResume(parsedData)

      const newResumeId = await saveParsedResume(user.uid, parsedData, url, path)
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
      let resumeId = currentResumeId
      if (!resumeId) {
        if (uploadedFile) {
          const { url, path } = await uploadResumeFile(user.uid, uploadedFile)
          resumeId = await saveParsedResume(user.uid, parsedResume, url, path)
        } else {
          resumeId = await saveParsedResume(user.uid, parsedResume)
        }
      }

      let generatedData: any
      let stats: any
      let finalIdForPreview: string = resumeId!

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
          layoutId: selectedLayout,
          parsedData: generatedData,
          jobDescription,
          generatedAt: new Date().toISOString(),
          stats
        }
        await saveGeneratedResume(user.uid, resumeId!, selectedLayout || "demo", jobDescription, resumeContent, isPremium)

        finalIdForPreview = resumeId!
      } else {
        const resumeTextString = JSON.stringify(parsedResume)
        const resultString = await generateContent(resumeTextString, jobDescription, selectedOption)
        const result = JSON.parse(resultString)
        generatedData = result
        stats = result.stats
      }

      const finalHistoryContent = {
        type: selectedOption,
        layoutId: selectedLayout,
        parsedData: generatedData,
        jobDescription,
        generatedAt: new Date().toISOString(),
        stats
      }

      const historyId = await saveHistoryEntry(
        user.uid,
        selectedOption,
        jobDescription,
        JSON.stringify(finalHistoryContent),
        isPremium
      )

      if (selectedOption !== 'resume') {
        finalIdForPreview = historyId
      }

      setGenerationStats(stats)
      setGenerationFinished(true)
      setResumeIdToView(finalIdForPreview)

    } catch (err: any) {
      console.error("Error generating:", err)
      setError(err.message || "Failed to generate content")
      setIsGenerating(false)
    }
  }

  const resetGeneration = () => {
    setGenerationFinished(false)
    setResumeIdToView(null)
    setGenerationStats(null)
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
      handleFileSelect,
      processUpload, // ✅ Passed to consumers
      handleGenerate,
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