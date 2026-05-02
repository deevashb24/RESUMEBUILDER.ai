/**
 * Upload file to Supabase Storage via Server API
 */
export async function uploadResumeFile(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("userId", userId)

  const response = await fetch("/api/storage", {
    method: "POST",
    body: formData
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to upload file")
  }

  return {
    url: data.url,
    path: data.path,
  }
}

/**
 * Delete file from Supabase Storage via Server API
 */
export async function deleteResumeFile(path: string): Promise<void> {
  try {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(path)}`, {
      method: "DELETE"
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to delete file")
    }
  } catch (error) {
    console.error("Error deleting file from storage:", error)
  }
}