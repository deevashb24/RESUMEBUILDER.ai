import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase"

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
}

export interface SavedResume {
  id: string
  userId: string
  parsedData: ParsedResumeData
  fileUrl?: string
  filePath?: string
  layoutId?: string
  jobDescription?: string
  createdAt: Timestamp
  updatedAt: Timestamp
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
 * Save a parsed resume to Firestore
 */
export async function saveParsedResume(
  userId: string,
  parsedData: ParsedResumeData,
  fileUrl?: string,
  filePath?: string
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized")

  try {
    const docRef = await addDoc(collection(db, "resumes"), {
      userId,
      parsedData,
      fileUrl: fileUrl || null,
      filePath: filePath || null,
      layoutId: "demo",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      name: parsedData.name || parsedData.personal.name || "Untitled Resume"
    })
    return docRef.id
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
  if (!db) throw new Error("Firestore not initialized")

  try {
    const docRef = doc(db, "resumes", resumeId)
    await updateDoc(docRef, {
      layoutId,
      jobDescription,
      generatedContent: content,
      updatedAt: serverTimestamp(),
      isGenerated: true,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date().toISOString() : null
    })
  } catch (error) {
    console.error("Error saving generated resume:", error)
    throw error
  }
}

/**
 * Get a single resume by ID
 */
export async function getResume(resumeId: string): Promise<SavedResume | null> {
  if (!db) return null

  try {
    const docRef = doc(db, "resumes", resumeId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        isUnlocked: docSnap.data().isUnlocked || false,
      } as SavedResume
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching resume:", error)
    throw error
  }
}

/**
 * Delete a resume document from Firestore
 */
export async function deleteResume(resumeId: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, "resumes", resumeId))
  } catch (error) {
    console.error("Error deleting resume doc:", error)
  }
}