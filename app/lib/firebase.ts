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
    (varName) => !process.env[varName]
  )

  if (missingVars.length > 0) {
    console.error(
      `Missing required Firebase environment variables: ${missingVars.join(", ")}`
    )
    // Don't throw - allow app to load but auth won't work
  } else {
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
      db = getFirestore(app)
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      // Don't throw - allow app to load but auth won't work
    }
  }
}

export { app, auth, db }

