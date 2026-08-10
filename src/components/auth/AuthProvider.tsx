'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAnonymous: boolean
  isLinked: boolean
  userId: string | null
  linkWithEmail: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAnonymous: false,
  isLinked: false,
  userId: null,
  linkWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)
  const signInAttemptedRef = useRef(false)

  const isAnonymous = user?.is_anonymous ?? false
  const isLinked = !!user && !user.is_anonymous
  const userId = user?.id ?? null

  const setAuth = useAppStore((s) => s.setAuth)
  const syncHistoryToCloud = useAppStore((s) => s.syncHistoryToCloud)

  // Update Zustand store whenever auth state changes
  useEffect(() => {
    setAuth(userId, isLinked)

    // A Google OAuth callback remounts the app with an already-linked session,
    // so migration cannot depend on observing an in-memory false -> true edge.
    // The cloud write is idempotent and reloads server history after it finishes.
    if (userId && isLinked) {
      syncHistoryToCloud()
    }
  }, [userId, isLinked, setAuth, syncHistoryToCloud])

  const linkWithEmail = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email })
    if (error) throw error
    // Note: user becomes permanent after clicking the confirmation link in email
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }
    const supabase = createClient()
    // Use a regular OAuth sign-in instead of manual identity linking. A linked
    // Google identity can only belong to one user, so linkIdentity blocks the
    // same account on a second device. The callback migration preserves any
    // local anonymous history after the OAuth session replaces the temp user.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  useEffect(() => {
    // If Supabase is not configured, skip auth entirely
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      // If no session, sign in anonymously (once only)
      if (!currentSession && !signInAttemptedRef.current) {
        signInAttemptedRef.current = true
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error('[auth] Anonymous sign-in failed:', error.message)
          } else {
            setSession(data.session)
            setUser(data.session?.user ?? null)
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        // After sign-out, automatically re-sign-in anonymously (zero-friction UX)
        if (event === 'SIGNED_OUT') {
          supabase.auth.signInAnonymously().then(({ data, error }) => {
            if (error) {
              console.error('[auth] Re-anonymous sign-in failed:', error.message)
            } else {
              setSession(data.session)
              setUser(data.session?.user ?? null)
            }
          })
        }

        if (!initializedRef.current) {
          initializedRef.current = true
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAnonymous,
    isLinked,
    userId,
    linkWithEmail,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
