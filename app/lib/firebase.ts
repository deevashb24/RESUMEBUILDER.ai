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

// Only initialize on client-side
if (typeof window !== "undefined") {
  
  // 1. Explicitly define config so the bundler can see the variables
  const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // 2. Validate the config object values, NOT process.env keys
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
    
  // Debug logging
  const isDebugMode = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_FIREBASE === "true"
  
  if (missingKeys.length > 0) {
    const errorMessage = `Missing required Firebase environment variables: ${missingKeys.join(", ")}. Please check your .env.local file.`
    console.error("❌ Firebase Configuration Error:", errorMessage)
    
    // Don't throw - allow app to load but auth won't work
  } else {
    // All environment variables are present, proceed with initialization
    try {
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
        console.error("❌ Firebase initialization failed.")
        if (isDebugMode) {
          console.error("Error details:", error)
        }
      }
    }
  }
}

export { app, auth, db, storage }
