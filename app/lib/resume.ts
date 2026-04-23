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
 * Save a parsed resume to Supabase
 */
export async function saveParsedResume(
  userId: string,
  parsedData: ParsedResumeData,
  fileUrl?: string,
  filePath?: string
): Promise<string> {
  const supabase = createBrowserClient()

  try {
    const payload = {
      userId,
      parsedData,
      fileUrl: fileUrl || null,
      filePath: filePath || null,
      layoutId: "demo",
      name: parsedData.name || parsedData.personal.name || "Untitled Resume"
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error saving parsed resume:", error)
    throw error
  }
}

/**
 * Save a generated/tailored resume
 */
export async function saveGeneratedResume(
  userId: string,
  resumeId: string,
  layoutId: string,
  jobDescription: string,
  content: any,
  isUnlocked: boolean = false
): Promise<void> {
  const supabase = createBrowserClient()

  try {
    const payload = {
      layoutId,
      jobDescription,
      generatedContent: content,
      isGenerated: true,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }

    const { error } = await supabase
      .from('resumes')
      .update(payload)
      .eq('id', resumeId)

    if (error) throw error
  } catch (error) {
    console.error("Error saving generated resume:", error)
    throw error
  }
}

/**
 * Get a single resume by ID
 */
export async function getResume(resumeId: string): Promise<SavedResume | null> {
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

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
 * Delete a resume document from Supabase
 */
export async function deleteResume(resumeId: string): Promise<void> {
  const supabase = createBrowserClient()
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting resume doc:", error)
  }
}