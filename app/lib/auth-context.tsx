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
import { doc, onSnapshot, setDoc } from "firebase/firestore"
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
  unlockedGenerations: string[] // <--- ADDED THIS
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
  const [unlockedGenerations, setUnlockedGenerations] = useState<string[]>([]) // <--- ADDED STATE

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    if (!auth) {
      setLoading(false)
      return
    }

    let unsubscribeFirestore: () => void;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser)

        if (unsubscribeFirestore) {
          unsubscribeFirestore()
        }

        if (firebaseUser && db) {
          const userRef = doc(db, "users", firebaseUser.uid)

          unsubscribeFirestore = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()

              // 1. Premium Logic
              const isPremiumBool = data.isPremium === true

              // 2. Subscription Logic
              const subData = data.subscription || {
                status: 'inactive',
                planId: null,
                periodEnd: null
              }

              // Check expiry
              const now = new Date()
              // Handle Firestore Timestamp or ISO string
              let periodEndDates: Date | null = null
              if (subData.periodEnd) {
                if (typeof subData.periodEnd === 'string') {
                  periodEndDates = new Date(subData.periodEnd)
                } else if (subData.periodEnd.seconds) {
                  periodEndDates = new Date(subData.periodEnd.seconds * 1000)
                }
              }

              const isActive = isPremiumBool || (subData.status === 'active' && periodEndDates && periodEndDates > now)

              // 3. One-Time Unlocks Logic (CRITICAL FIX)
              const unlocked = data.unlockedGenerations || []

              setIsPremium(!!isActive)
              setSubscription(subData)
              setUnlockedGenerations(unlocked) // <--- UPDATE STATE

            } else {
              // Create profile if missing
              await setDoc(userRef, {
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
                isPremium: false,
                unlockedGenerations: [], // <--- Initialize Empty
                provider: "google/email",
              })
              setIsPremium(false)
              setUnlockedGenerations([])
            }
          }, (error) => {
            console.error("Firestore Listener Error:", error)
          })

        } else {
          setIsPremium(false)
          setUnlockedGenerations([])
        }

        setLoading(false)
      }
    )

    return () => {
      unsubscribeAuth()
      if (unsubscribeFirestore) unsubscribeFirestore()
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
      setSubscription(null)
      setUnlockedGenerations([])
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPremium,
      subscription,
      unlockedGenerations, // <--- EXPOSE TO APP
      loginWithGoogle,
      loginWithApple,
      loginWithEmail,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}