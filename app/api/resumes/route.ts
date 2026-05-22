import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { auth } from "@clerk/nextjs/server"

/**
 * POST /api/resumes
 * Create a new resume record.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { parsedData, fileUrl, filePath, layoutId, name } = body

    if (!parsedData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload = {
      userId,
      parsedData,
      fileUrl: fileUrl || null,
      filePath: filePath || null,
      layoutId: layoutId || "demo",
      name: name || parsedData.name || parsedData.personal?.name || "Untitled Resume",
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error("Resumes insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error: any) {
    console.error("Resumes API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/resumes
 * Update an existing resume record.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, userId: _ignoredUserId, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('resumes')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .eq('userId', userId) // SECURITY FIX: Ensure the user owns this resume

    if (error) {
      console.error("Resumes update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Resumes PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/resumes?id=xxx
 * Fetch a single resume.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('userId', userId) // SECURITY FIX: Enforce ownership
      .single()

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: "Not found" }, { status: 404 })
      console.error("Resumes fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Resumes GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/resumes?id=xxx
 * Delete a resume.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('userId', userId) // SECURITY FIX: Enforce ownership

    if (error) {
      console.error("Resumes delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Resumes DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
