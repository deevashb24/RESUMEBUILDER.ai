"use client"

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Initialize Firebase app (avoid re-initialization in dev/hot reload)
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

// Only initialize on client-side
if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Debug logging (only in development or if explicitly enabled)
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_FIREBASE === "true") {
    console.log("Firebase Config Check:")
    console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Present" : "✗ Missing")
    console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Present" : "✗ Missing")
    console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Present" : "✗ Missing")
    console.log("Storage Bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓ Present" : "✗ Missing")
    console.log("Messaging Sender ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓ Present" : "✗ Missing")
    console.log("App ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓ Present" : "✗ Missing")
  }

  // Validate required environment variables
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.trim() === ""
  )

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing required Firebase environment variables: ${missingVars.join(", ")}`
    )
    console.error("Please check your Vercel dashboard or .env.local file")
    // Don't throw - allow app to load but auth won't work
  } else {
    try {
      // Check if Firebase is already initialized (prevents "Firebase: Error (app/already-initialized))
      const existingApps = getApps()
      if (existingApps.length === 0) {
        app = initializeApp(firebaseConfig)
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_FIREBASE === "true") {
          console.log("✅ Firebase initialized successfully")
        }
      } else {
        app = getApp()
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_FIREBASE === "true") {
          console.log("✅ Using existing Firebase app instance")
        }
      }
      
      auth = getAuth(app)
      db = getFirestore(app)
    } catch (error: any) {
      console.error("❌ Error initializing Firebase:", error)
      if (error.code === "app/already-initialized") {
        console.warn("Firebase already initialized, using existing instance")
        app = getApp()
        auth = getAuth(app)
        db = getFirestore(app)
      } else {
        // Don't throw - allow app to load but auth won't work
        console.error("Firebase initialization failed. Auth features will not work.")
      }
    }
  }
}

export { app, auth, db }

