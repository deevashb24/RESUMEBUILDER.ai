import { createClient as createBrowserClient } from "@/utils/supabase/client"

/**
 * Upload file to Supabase Storage
 */
export async function uploadResumeFile(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = createBrowserClient()

  const timestamp = Date.now()
  const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `resumes/${userId}/${timestamp}-${fileName}`

  const { error } = await supabase.storage
    .from('resumes')
    .upload(storagePath, file, { contentType: file.type })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from('resumes').getPublicUrl(storagePath)

  return {
    url: data.publicUrl,
    path: storagePath,
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteResumeFile(path: string): Promise<void> {
  const supabase = createBrowserClient()
  try {
    await supabase.storage.from('resumes').remove([path])
  } catch (error) {
    console.error("Error deleting file from storage:", error)
  }
}