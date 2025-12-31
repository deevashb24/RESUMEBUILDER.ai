import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Upload file to Firebase Storage
 */
export async function uploadResumeFile(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized")
  }

  const timestamp = Date.now()
  const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `resumes/${userId}/${timestamp}-${fileName}`
  const storageRef = ref(storage, storagePath)

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  const snapshot: UploadResult = await uploadBytes(storageRef, bytes, {
    contentType: file.type,
  })

  const url = await getDownloadURL(snapshot.ref)

  return {
    url,
    path: storagePath,
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteResumeFile(path: string): Promise<void> {
  if (!storage) return
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file from storage:", error)
  }
}