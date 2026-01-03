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

export interface Subscription {
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
  planId: string | null;
  periodEnd: string | null;
  lemonSqueezySubscriptionId?: string;
  customerPortalUrl?: string;
}

interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  isPremium: boolean
  subscription: Subscription | null
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
  const [subscription, setSubscription] = useState<Subscription | null>(null)

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
              // Auto-update premium & subscription status
              const isPremium = data.isPremium === true

              // Parse detailed subscription info
              const subscription = data.subscription || {
                status: 'inactive',
                planId: null,
                periodEnd: null
              }

              // Check if subscription is actually active (expired?)
              const now = new Date()
              const periodEnd = subscription.periodEnd ? new Date(subscription.periodEnd.seconds * 1000) : null
              const isActive = isPremium || (subscription.status === 'active' && periodEnd && periodEnd > now)

              setIsPremium(!!isActive)
              setSubscription(subscription)
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

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized.")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    provider.addScope("profile")
    provider.addScope("email")
    try {
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") throw new Error("Popup blocked.")
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
    <AuthContext.Provider value={{ user, loading, isPremium, subscription, loginWithGoogle, loginWithApple, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}