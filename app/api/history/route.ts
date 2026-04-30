import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"

/**
 * POST /api/history
 * Saves a history entry using the service_role admin client,
 * which bypasses RLS entirely — no auth session required on the DB side.
 * The userId is passed in the body and must come from a verified Clerk session
 * on the client side.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, jobDescription, output, isUnlocked } = body

    if (!userId || !output) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload = {
      userId,
      type: type || "resume",
      title: title || "Generated Document",
      jobDescription: jobDescription || "",
      output,
      isUnlocked: isUnlocked ?? false,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from("history")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error: any) {
    console.error("History API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/history?userId=xxx
 * Fetches all history for a user using the admin client (bypasses RLS).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const id = searchParams.get("id")

    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: "Not found" }, { status: 404 })
        console.error("Supabase fetch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data })
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("History GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
