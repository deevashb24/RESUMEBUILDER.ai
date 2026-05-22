import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    // Ignore userId from client, use the verified one

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const timestamp = Date.now()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storagePath = `resumes/${userId}/${timestamp}-${fileName}`

    // Convert file to array buffer for upload via node server
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, { 
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from('resumes').getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path: storagePath
    })

  } catch (error: any) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    // SECURITY FIX: Ensure the user is only deleting their own files
    if (!path.startsWith(`resumes/${userId}/`)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to delete this file" }, { status: 403 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.storage.from('resumes').remove([path])

    if (error) {
      console.error("Storage delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Storage delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
