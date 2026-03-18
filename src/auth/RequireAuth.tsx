import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

// This component protects a route so only logged-in users can see it.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth()
  const location = useLocation()

  // While Supabase is still telling us if we have a user, show nothing.
  if (!authReady) return null

  // If not logged in, send the user to the sign-in page.
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

