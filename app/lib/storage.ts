import { ref, uploadBytes, getDownloadURL, UploadResult } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Upload file to Firebase Storage
 * Returns download URL and file metadata
 */
export async function uploadResumeFile(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized")
  }

  // Create storage path: resumes/{userId}/{timestamp}-{filename}
  const timestamp = Date.now()
  const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `resumes/${userId}/${timestamp}-${fileName}`
  const storageRef = ref(storage, storagePath)

  // Convert File to ArrayBuffer then to Uint8Array
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  // Upload file
  const snapshot: UploadResult = await uploadBytes(storageRef, bytes, {
    contentType: file.type,
  })

  // Get download URL
  const url = await getDownloadURL(snapshot.ref)

  return {
    url,
    path: storagePath,
  }
}

