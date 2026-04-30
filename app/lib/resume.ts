import { createClient as createBrowserClient } from "@/utils/supabase/client"

// --- 1. DATA STRUCTURES ---

export interface ResumeItem {
  id: string
  isVisible: boolean
  isGenerated?: boolean
}

export interface ResumeSection extends ResumeItem {
  title: string
  items: string[]
  content?: string
}

export interface ExperienceItem extends ResumeItem {
  company: string
  role: string
  start: string
  end: string
  location?: string
  bullets: string[]
}

export interface ProjectItem extends ResumeItem {
  title: string
  tech: string[]
  bullets: string[]
  link?: string
  date?: string
}

export interface EducationItem extends ResumeItem {
  school: string
  degree: string
  field: string
  start: string
  end: string
  gpa?: string
}

export interface SkillSet {
  languages: string[]
  frameworks: string[]
  tools: string[]
  concepts: string[]
}

export interface ParsedResumeData {
  name?: string
  personal: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    summary: string
    picture?: string // Optional URL for profile picture
  }
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  skills: SkillSet
  customSections: ResumeSection[]
  layoutOverrides?: Record<string, any>
}

export interface SavedResume {
  id: string
  userId: string
  parsedData: ParsedResumeData
  fileUrl?: string
  filePath?: string
  layoutId?: string
  jobDescription?: string
  createdAt: string
  updatedAt: string
  isUnlocked?: boolean
  unlockedAt?: string
  paymentId?: string
}

// --- 2. HELPER FUNCTIONS ---

// ✅ FIXED: This export is required by your API route
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const initialResumeData: ParsedResumeData = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "", summary: "" },
  experience: [],
  education: [],
  projects: [],
  skills: { languages: [], frameworks: [], tools: [], concepts: [] },
  customSections: []
}

// --- 3. DATABASE FUNCTIONS ---

/**
 * Save a parsed resume to Supabase via API
 */
export async function saveParsedResume(
  userId: string,
  parsedData: ParsedResumeData,
  fileUrl?: string,
  filePath?: string
): Promise<string> {
  try {
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        parsedData,
        fileUrl,
        filePath,
        layoutId: "demo",
        name: parsedData.name || parsedData.personal.name || "Untitled Resume"
      }),
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Failed to save parsed resume")
    return result.id
  } catch (error) {
    console.error("Error saving parsed resume:", error)
    throw error
  }
}

/**
 * Save a generated/tailored resume via API
 */
export async function saveGeneratedResume(
  userId: string,
  resumeId: string,
  layoutId: string,
  jobDescription: string,
  content: any,
  isUnlocked: boolean = false
): Promise<void> {
  try {
    const response = await fetch("/api/resumes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: resumeId,
        layoutId,
        jobDescription,
        generatedContent: content,
        isGenerated: true,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date().toISOString() : null,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || "Failed to save generated resume")
    }
  } catch (error) {
    console.error("Error saving generated resume:", error)
    throw error
  }
}

/**
 * Get a single resume by ID via API
 */
export async function getResume(resumeId: string): Promise<SavedResume | null> {
  try {
    const response = await fetch(`/api/resumes?id=${resumeId}`)
    const result = await response.json()

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(result.error || "Failed to fetch resume")
    }

    const data = result.data
    return {
      ...data,
      isUnlocked: data.isUnlocked || false,
    } as SavedResume
  } catch (error) {
    console.error("Error fetching resume:", error)
    throw error
  }
}

/**
 * Delete a resume document from Supabase via API
 */
export async function deleteResume(resumeId: string): Promise<void> {
  try {
    const response = await fetch(`/api/resumes?id=${resumeId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || "Failed to delete resume doc")
    }
  } catch (error) {
    console.error("Error deleting resume doc:", error)
  }
}