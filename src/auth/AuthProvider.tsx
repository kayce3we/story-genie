import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

type AuthContextValue = {
  user: User | null
  authReady: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// This component keeps track of the logged-in user (or null).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // This effect asks Supabase for the current session once on page load.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // This function signs a user up with email + password.
  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return error ? error.message : null
  }

  // This function signs a user in with email + password.
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  // This function signs the current user out.
  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, authReady, signUp, signIn, signOut }),
    [user, authReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// This hook lets any component read auth state easily.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

