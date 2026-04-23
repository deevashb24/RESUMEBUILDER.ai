"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/utils/supabase/client"
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
    const supabase = createClient()

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
            if (user) {
                try {
                    const { data } = await supabase.from('users').select('preferredLanguage, preferred_language').eq('id', user.id).single()
                    if (data && (data.preferredLanguage || data.preferred_language)) {
                        const lang = (data.preferredLanguage || data.preferred_language) as Language
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
        if (user) {
            // We don't need heavy debounce here as language switch is rare, 
            // but strictly separating UI from DB logic makes it snappy.
            supabase.from('users').update({ preferredLanguage: lang }).eq('id', user.id)
                .then(({ error }: any) => { if (error) console.error("Failed to save language:", error) })
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
