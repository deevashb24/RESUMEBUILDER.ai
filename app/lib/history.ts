import { createClient as createBrowserClient } from "@/utils/supabase/client"

export interface HistoryEntry {
  id: string
  userId: string
  type: "resume" | "cover-letter" | "sop"
  title: string
  jobDescription: string
  output: string // This is the stringified JSON of the generated content
  createdAt: string // ISO string for the UI
  stats?: any
  isUnlocked?: boolean
  unlockedAt?: string
  paymentId?: string
}

/**
 * Save a new entry to the history collection
 */
export async function saveHistoryEntry(
  userId: string,
  type: string,
  jobDescription: string,
  output: string,
  isUnlocked: boolean = false
): Promise<string> {
  const supabase = createBrowserClient()

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
    const payload = {
      userId,
      type,
      title,
      jobDescription,
      output,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
      .from('history')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error
    return data.id
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
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error

    return data.map(doc => ({
      ...doc,
      type: doc.type || "resume",
      title: doc.title || "Untitled",
      jobDescription: doc.jobDescription || "",
      output: doc.output || "{}",
    })) as HistoryEntry[]
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
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return {
      ...data,
      type: data.type || "resume",
      title: data.title || "Untitled",
      jobDescription: data.jobDescription || "",
      output: data.output || "{}",
    } as HistoryEntry
  } catch (error) {
    console.error("Error fetching history entry:", error)
    return null
  }
}