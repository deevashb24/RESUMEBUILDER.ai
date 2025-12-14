"use client"

import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

// Initialize Firebase app (avoid re-initialization in dev/hot reload)
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

// Required Firebase environment variables
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const

/**
 * Validates that all required Firebase environment variables are present
 * @returns Object with isValid flag and missing variables array
 */
function validateFirebaseConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar]
    if (!value || value.trim() === "") {
      missing.push(envVar)
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  }
}

// Only initialize on client-side
if (typeof window !== "undefined") {
  // Validate environment variables first
  const validation = validateFirebaseConfig()
  
  // Debug logging (only in development or if explicitly enabled)
  const isDebugMode = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_FIREBASE === "true"
  
  if (isDebugMode) {
    console.log("Firebase Config Check:")
    REQUIRED_ENV_VARS.forEach((envVar) => {
      const value = process.env[envVar]
      const status = value && value.trim() !== "" ? "✓ Present" : "✗ Missing"
      console.log(`${envVar}:`, status)
    })
  }
  
  if (!validation.isValid) {
    const errorMessage = `Missing required Firebase environment variables: ${validation.missing.join(", ")}. Please check your .env.local file or Vercel environment variables.`
    console.error("❌ Firebase Configuration Error:", errorMessage)
    
    if (isDebugMode) {
      console.error("\n📝 To fix this:")
      console.error("1. Create a .env.local file in the root directory")
      console.error("2. Add the following variables:")
      validation.missing.forEach((envVar) => {
        console.error(`   ${envVar}=your_value_here`)
      })
      console.error("3. Or add them to your Vercel project settings under Environment Variables")
    }
    
    // Don't throw - allow app to load but auth won't work
    // This prevents the entire app from crashing
  } else {
    // All environment variables are present, proceed with initialization
    const firebaseConfig: FirebaseOptions = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    }

    try {
      // Check if Firebase is already initialized (prevents "Firebase: Error (app/already-initialized))
      const existingApps = getApps()
      if (existingApps.length === 0) {
        app = initializeApp(firebaseConfig)
        if (isDebugMode) {
          console.log("✅ Firebase initialized successfully")
        }
      } else {
        app = getApp()
        if (isDebugMode) {
          console.log("✅ Using existing Firebase app instance")
        }
      }
      
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
    } catch (error: any) {
      console.error("❌ Error initializing Firebase:", error)
      
      if (error.code === "app/already-initialized") {
        console.warn("Firebase already initialized, using existing instance")
        try {
          app = getApp()
          auth = getAuth(app)
          db = getFirestore(app)
          storage = getStorage(app)
        } catch (fallbackError) {
          console.error("❌ Failed to get existing Firebase app:", fallbackError)
        }
      } else if (error.code === "app/invalid-app-argument") {
        console.error("❌ Invalid Firebase configuration. Please check your environment variables.")
      } else {
        console.error("❌ Firebase initialization failed. Auth/Storage/Firestore features will not work.")
        if (isDebugMode) {
          console.error("Error details:", error)
        }
      }
    }
  }
}

export { app, auth, db, storage }

