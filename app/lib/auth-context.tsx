"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore" // Import Firestore methods
import { auth, db } from "./firebase" // Import db

interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  isPremium: boolean // NEW: Add this property
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false) // NEW: State for premium

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    if (!auth) {
      console.warn("⚠️ Firebase Auth is not initialized.")
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          // 1. Set the Auth User
          setUser(firebaseUser)

          if (firebaseUser) {
            // 2. CHECK DATABASE for User Document
            try {
              if (db) {
                const userRef = doc(db, "users", firebaseUser.uid)
                const userSnap = await getDoc(userRef)

                if (userSnap.exists()) {
                  // User exists, check premium status
                  const data = userSnap.data()
                  setIsPremium(data.isPremium === true)
                } else {
                  // User is NEW -> Create DB Entry
                  await setDoc(userRef, {
                    email: firebaseUser.email,
                    createdAt: new Date().toISOString(),
                    isPremium: false,
                    provider: "google/email",
                  })
                  setIsPremium(false)
                }
              }
            } catch (dbError) {
              console.error("❌ Error fetching/creating user profile:", dbError)
              // Fail safe: assume not premium
              setIsPremium(false)
            }
          } else {
            // User logged out
            setIsPremium(false)
          }

          setLoading(false)
        },
        (error: AuthError) => {
          console.error("❌ Auth state change error:", error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error: any) {
      console.error("❌ Error setting up auth listener:", error)
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized.")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    provider.addScope("profile")
    provider.addScope("email")
    
    try {
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") {
        throw new Error("Popup blocked. Please allow popups.")
      }
      throw error
    }
  }

  const loginWithApple = async () => {
    if (!auth) throw new Error("Firebase auth not initialized.")
    const provider = new OAuthProvider("apple.com")
    await signInWithPopup(auth, provider)
  }

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized.")
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        // If user not found, try to create account (simple logic for now)
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        throw error
      }
    }
  }

  const logout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      setUser(null)
      setIsPremium(false)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        isPremium, // Expose this to the app
        loginWithGoogle, 
        loginWithApple, 
        loginWithEmail, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}