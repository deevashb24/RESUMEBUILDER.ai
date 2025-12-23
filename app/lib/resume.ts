import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore"
import { db } from "./firebase"

// --- 1. ELITE DATA STRUCTURES ---

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
  // We keep 'name' at the top level for Dashboard compatibility
  name?: string 
  personal: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    summary: string
  }
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  skills: SkillSet
  // The magic field that prevents "Field Work" from disappearing
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
}

// --- 2. HELPER FUNCTIONS ---

export const generateId = () => Math.random().toString(36).substr(2, 9)

export const initialResumeData: ParsedResumeData = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "", summary: "" },
  experience: [],
  education: [],
  projects: [],
  skills: { languages: [], frameworks: [], tools: [], concepts: [] },
  customSections: [] 
}

// --- 3. DATABASE FUNCTIONS (The missing part!) ---

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
      layoutId: "demo", // Default layout
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Ensure dashboard can display a name even if nested in personal
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
  content: any
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")

  try {
    const docRef = doc(db, "resumes", resumeId)
    await updateDoc(docRef, {
      layoutId,
      jobDescription,
      generatedContent: content,
      updatedAt: serverTimestamp(),
      isGenerated: true
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
      } as SavedResume
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching resume:", error)
    throw error
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 309fc92652cb5bf88e0dbff43426a04c00dfa87a
