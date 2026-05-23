import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { auth } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"


/**
 * POST /api/history
 * Saves a history entry using the service_role admin client,
 * now properly authenticated with Clerk server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, jobDescription, output, isUnlocked } = body

    if (!output) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload = {
      ...(body.id ? { id: body.id } : {}),
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
 * GET /api/history?id=xxx
 * Fetches all history for a user using the admin client (bypasses RLS),
 * now properly authenticated with Clerk server-side to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .eq("id", id)
        .eq("userId", userId) // SECURITY FIX: Enforce ownership
        .single()

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: "Not found" }, { status: 404 })
        console.error("Supabase fetch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("userId", userId) // Ensure it only gets the logged-in user's history
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
