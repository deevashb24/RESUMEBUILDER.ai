"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Language, translations } from "@/lib/translations"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof translations['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [language, setLanguageState] = useState<Language>('en')

    // 1. Initial Load: Check Local Storage first for speed
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("preferredLanguage") as Language
            if (stored && translations[stored]) {
                setLanguageState(stored)
            }
        }
    }, [])

    // 2. Sync with Firestore when User Logs In
    useEffect(() => {
        const fetchUserLanguage = async () => {
            if (user && db) {
                try {
                    const docRef = doc(db, "users", user.uid)
                    const docSnap = await getDoc(docRef)
                    if (docSnap.exists() && docSnap.data().preferredLanguage) {
                        const lang = docSnap.data().preferredLanguage as Language
                        if (translations[lang]) {
                            setLanguageState(lang)
                            localStorage.setItem("preferredLanguage", lang) // Sync back to local
                        }
                    }
                } catch (error) {
                    console.error("Error fetching language preference:", error)
                }
            }
        }
        fetchUserLanguage()
    }, [user])

    // 3. Update Function (Debounced Firestore Write)
    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("preferredLanguage", lang) // Instant UI update

        // Debounced or direct Write if user is logged in
        if (user && db) {
            // We don't need heavy debounce here as language switch is rare, 
            // but strictly separating UI from DB logic makes it snappy.
            setDoc(doc(db, "users", user.uid), { preferredLanguage: lang }, { merge: true })
                .catch(err => console.error("Failed to save language:", err))
        }
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] || translations['en'] }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) throw new Error("useLanguage must be used within a LanguageProvider")
    return context
}
