// app/lib/history.ts
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  doc,
  getDoc 
} from "firebase/firestore"
import { db } from "./firebase"

export interface HistoryEntry {
  id?: string
  userId: string
  type: "resume" | "sop" | "cover-letter"
  input: string
  output?: string
  createdAt: Timestamp | Date
  title?: string
}

export async function saveHistoryEntry(
  userId: string,
  type: "resume" | "sop" | "cover-letter",
  input: string,
  output?: string
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized")
  try {
    const docRef = await addDoc(collection(db, "history"), {
      userId,
      type,
      input,
      output: output || "",
      createdAt: serverTimestamp(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving history entry:", error)
    throw error
  }
}

export async function getUserHistory(userId: string): Promise<HistoryEntry[]> {
  if (!db) throw new Error("Firestore not initialized")
  try {
    const q = query(
      collection(db, "history"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    const entries: HistoryEntry[] = []
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as HistoryEntry)
    })
    return entries
  } catch (error) {
    console.error("Error fetching user history:", error)
    throw error
  }
}

// CRITICAL FOR PREVIEW PAGE
export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  if (!db) return null
  try {
    const docRef = doc(db, "history", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HistoryEntry
    }
    return null
  } catch (error) {
    console.error("Error fetching history entry:", error)
    return null
  }
}