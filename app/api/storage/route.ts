import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 })
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
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
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
