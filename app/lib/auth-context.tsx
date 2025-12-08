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
} from "firebase/auth"
import { auth } from "./firebase"

interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only subscribe if auth is available (client-side)
    if (typeof window === "undefined" || !auth) {
      setLoading(false)
      return
    }

    try {
      // Subscribe to auth state changes
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser)
          setLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setLoading(false)
        }
      )

      // Cleanup subscription on unmount
      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase auth not initialized. Please check your environment variables.")
    }
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const loginWithApple = async () => {
    if (!auth) {
      throw new Error("Firebase auth not initialized. Please check your environment variables.")
    }
    const provider = new OAuthProvider("apple.com")
    await signInWithPopup(auth, provider)
  }

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase auth not initialized. Please check your environment variables.")
    }
    try {
      // Try to sign in
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      // If user not found, try to create account
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
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
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, loginWithApple, loginWithEmail, logout }}
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

