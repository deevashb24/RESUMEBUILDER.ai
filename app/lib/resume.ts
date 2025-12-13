import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface ParsedResumeData {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
}

export interface ResumeRecord {
  id?: string
  userId: string
  layoutId?: string
  parsedData: ParsedResumeData
  jobDescription?: string
  fileUrl?: string
  filePath?: string
  createdAt: any
  updatedAt: any
}

/**
 * Save parsed resume data to Firestore
 */
export async function saveParsedResume(
  userId: string,
  parsedData: ParsedResumeData,
  fileUrl?: string,
  filePath?: string
): Promise<string> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  const resumeRef = doc(collection(db, "resumes"))
  const resumeId = resumeRef.id

  await setDoc(resumeRef, {
    userId,
    parsedData,
    fileUrl: fileUrl || null,
    filePath: filePath || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return resumeId
}

/**
 * Save final generated resume
 */
export async function saveGeneratedResume(
  userId: string,
  resumeId: string,
  layoutId: string,
  jobDescription: string,
  content: any
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  const resumeRef = doc(db, "resumes", resumeId)

  await setDoc(
    resumeRef,
    {
      layoutId,
      jobDescription,
      content,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/**
 * Get resume by ID
 */
export async function getResume(resumeId: string): Promise<ResumeRecord | null> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  const resumeRef = doc(db, "resumes", resumeId)
  const snapshot = await getDoc(resumeRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as ResumeRecord
}

