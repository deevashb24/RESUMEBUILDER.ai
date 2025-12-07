"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User as FirebaseUser, onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "./firebase"

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only subscribe if auth is available (client-side)
    if (!auth) {
      setLoading(false)
      return
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    // Placeholder for login - can be implemented with signInWithEmailAndPassword
    // For now, just log (you can implement Google sign-in or email/password later)
    console.log("Login called with:", email)
    // Example: await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

