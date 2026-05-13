"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs"
import { createClient } from "@/utils/supabase/client"

export interface Subscription {
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
  planId: string | null;
  periodEnd: string | null;
  lemonSqueezySubscriptionId?: string;
  customerPortalUrl?: string;
}

interface AuthContextValue {
  user: any | null
  loading: boolean
  isPremium: boolean
  subscription: Subscription | null
  unlockedGenerations: string[]
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerkAuth()

  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [unlockedGenerations, setUnlockedGenerations] = useState<string[]>([])

  const supabase = createClient()

  const refreshUserData = useCallback(async (userId: string, emailStr?: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        const isPremiumBool = data.isPremium === true || data.is_premium === true
        const subData: Subscription = {
          status: data.subscription?.status || data.subscription_status || 'inactive',
          planId: data.subscription?.planId || data.subscription_plan_id || null,
          periodEnd: data.subscription?.periodEnd || data.subscription_period_end || null,
          lemonSqueezySubscriptionId: data.subscription?.lemonSqueezySubscriptionId || data.lemon_squeezy_subscription_id,
          customerPortalUrl: data.subscription?.customerPortalUrl || data.customer_portal_url
        }

        const now = new Date()
        let periodEndDates: Date | null = null
        if (subData.periodEnd) {
          periodEndDates = new Date(subData.periodEnd)
        }

        const isActive = isPremiumBool || (subData.status === 'active' && periodEndDates && periodEndDates > now)
        const unlocked = data.unlockedGenerations || data.unlocked_generations || []

        setIsPremium(!!isActive)
        setSubscription(subData)
        setUnlockedGenerations(unlocked)
      } else {
        if (emailStr) {
          try {
            await fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, email: emailStr }),
            })
          } catch (e) {
            console.error("Failed to sync user:", e)
          }
        }
        setIsPremium(false)
        setUnlockedGenerations([])
      }
    } catch (err) {
      console.error("Error fetching user data from Supabase:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true)
      return
    }

    if (clerkUser?.id) {
      const emailStr = clerkUser.primaryEmailAddress?.emailAddress
      refreshUserData(clerkUser.id, emailStr)

      const realtimeChannel = supabase
        .channel(`public:users:changes:${clerkUser.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${clerkUser.id}` }, () => {
          refreshUserData(clerkUser.id, emailStr)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(realtimeChannel)
      }
    } else {
      setIsPremium(false)
      setSubscription(null)
      setUnlockedGenerations([])
      setLoading(false)
    }
  }, [clerkUser, isLoaded, refreshUserData, supabase])

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    user_metadata: {
      full_name: clerkUser.fullName,
      avatar_url: clerkUser.imageUrl,
      name: clerkUser.fullName,
      picture: clerkUser.imageUrl
    }
  } : null

  const logout = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPremium,
      subscription,
      unlockedGenerations,
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