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
 * Save a new entry to the history collection via API
 */
export async function saveHistoryEntry(
  userId: string,
  type: string,
  jobDescription: string,
  output: string,
  isUnlocked: boolean = false
): Promise<string> {
  // Try to extract a meaningful title from the JSON output
  let title = "Generated Document"
  try {
    const parsed = JSON.parse(output)
    if (parsed.personalInfo?.fullName) {
      title = parsed.personalInfo.fullName
    } else if (parsed.parsedData?.personal?.name) {
      title = parsed.parsedData.personal.name
    } else if (parsed.personal?.name) {
      title = parsed.personal.name
    }
  } catch (e) {
    console.log("Could not parse output for title generation")
  }

  try {
    const response = await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        jobDescription,
        output,
        isUnlocked,
      }),
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Failed to save history")
    return result.id
  } catch (error) {
    console.error("Error saving history entry:", error)
    throw error
  }
}

/**
 * Fetch all history entries for a specific user — direct Supabase call (no API hop)
 */
export async function getHistory(userId: string): Promise<HistoryEntry[]> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("history")
      .select("id, userId, type, title, jobDescription, createdAt, stats, isUnlocked, unlockedAt, paymentId")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })

    if (error) throw error

    return (data || []).map((doc: any) => ({
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
 * Fetch a single history entry by ID — direct Supabase call (no API hop)
 */
export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
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