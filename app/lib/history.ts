import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore"
import { db } from "./firebase"

export interface HistoryEntry {
  id: string
  userId: string
  type: "resume" | "cover-letter" | "sop"
  title: string
  jobDescription: string
  output: string // This is the stringified JSON of the generated content
  createdAt: string // We convert Timestamp to ISO string for the UI
  stats?: any
}

/**
 * Save a new entry to the history collection
 */
export async function saveHistoryEntry(
  userId: string,
  type: string,
  jobDescription: string,
  output: string
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized")

  // Try to extract a meaningful title from the JSON output
  let title = "Generated Document"
  try {
    const parsed = JSON.parse(output)
    // Check various places where the name might be stored depending on doc type
    if (parsed.personalInfo?.fullName) {
      title = parsed.personalInfo.fullName
    } else if (parsed.parsedData?.personal?.name) {
      title = parsed.parsedData.personal.name
    } else if (parsed.personal?.name) {
      title = parsed.personal.name
    }
  } catch (e) {
    // If parsing fails, stick with default title
    console.log("Could not parse output for title generation")
  }

  try {
    const docRef = await addDoc(collection(db, "history"), {
      userId,
      type,
      title,
      jobDescription,
      output,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving history entry:", error)
    throw error
  }
}

/**
 * Fetch all history entries for a specific user
 * (Required for the History Page)
 */
export async function getHistory(userId: string): Promise<HistoryEntry[]> {
  if (!db) return []

  try {
    const q = query(
      collection(db, "history"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      
      // Safety check for converting Firestore Timestamp to ISO String
      let createdAt = new Date().toISOString()
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate().toISOString()
      } else if (data.createdAt) {
        // Fallback if it's already a date or string
        createdAt = new Date(data.createdAt).toISOString()
      }

      return {
        id: doc.id,
        userId: data.userId,
        type: data.type || "resume",
        title: data.title || "Untitled",
        jobDescription: data.jobDescription || "",
        output: data.output || "{}",
        createdAt,
        stats: data.stats
      } as HistoryEntry
    })
  } catch (error) {
    console.error("Error fetching history:", error)
    return []
  }
}

/**
 * Fetch a single history entry by ID
 * (Required for the Preview Page)
 */
export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  if (!db) return null
  try {
    const docRef = doc(db, "history", id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      
      let createdAt = new Date().toISOString()
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate().toISOString()
      }

      return {
        id: docSnap.id,
        userId: data.userId,
        type: data.type || "resume",
        title: data.title || "Untitled",
        jobDescription: data.jobDescription || "",
        output: data.output || "{}",
        createdAt,
        stats: data.stats
      } as HistoryEntry
    }
    return null
  } catch (error) {
    console.error("Error fetching history entry:", error)
    return null
  }
}