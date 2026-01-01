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
import { doc, onSnapshot, setDoc } from "firebase/firestore" // CHANGED: Import onSnapshot
import { auth, db } from "./firebase"

interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  isPremium: boolean
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    if (!auth) {
      setLoading(false)
      return
    }

    let unsubscribeFirestore: () => void; // To clean up listener

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser)

        // Clean up previous listener if user switches
        if (unsubscribeFirestore) {
          unsubscribeFirestore()
        }

        if (firebaseUser && db) {
          const userRef = doc(db, "users", firebaseUser.uid)

          // --- REAL-TIME LISTENER LOGIC ---
          unsubscribeFirestore = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              // Auto-update premium status instantly
              setIsPremium(data.isPremium === true)
            } else {
              // Create profile if missing
              await setDoc(userRef, {
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
                isPremium: false,
                provider: "google/email",
              })
              setIsPremium(false)
            }
          }, (error) => {
             console.error("Firestore Listener Error:", error)
          })
          
        } else {
          setIsPremium(false)
        }
        
        setLoading(false)
      }
    )

    // Clean up both listeners on unmount
    return () => {
      unsubscribeAuth()
      if (unsubscribeFirestore) unsubscribeFirestore()
    }
  }, [])

  // ... (Keep existing login/logout functions exactly as they are) ...
  
  const loginWithGoogle = async () => { /* ... */ }
  const loginWithApple = async () => { /* ... */ }
  const loginWithEmail = async (email: string, password: string) => { /* ... */ }
  const logout = async () => { /* ... */ }

  return (
    <AuthContext.Provider value={{ user, loading, isPremium, loginWithGoogle, loginWithApple, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}