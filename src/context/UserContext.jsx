import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user,    setUser]    = useState(null)   // full profile from user_profiles
  const [loading, setLoading] = useState(true)   // true on mount while session is checked
  const [error,   setError]   = useState(null)

  // ── On mount — restore session from Supabase Auth ────────────────────────────
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch user profile from user_profiles table ───────────────────────────────
  const fetchProfile = async (authId) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('user_profiles')
        .select('id, auth_id, name, email, role, school_id, active, modules')
        .eq('auth_id', authId)
        .eq('active', true)
        .single()

      if (err || !data) {
        // Profile missing or inactive — sign out
        await supabase.auth.signOut()
        setError('Your account is not active. Contact dee@simplegenius.io')
        setUser(null)
      } else {
        setUser(data)
        setError(null)
      }
    } catch {
      setUser(null)
      setError('Something went wrong loading your profile.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login with email + password ───────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (err) {
        setError('Invalid email or password. Try again.')
        setLoading(false)
        return false
      }

      // Profile fetch is handled by onAuthStateChange
      return true
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
      return false
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ── Reset password — sends magic link to email ─────────────────────────────
  const resetPassword = async (email) => {
    setError(null)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      )
      if (err) { setError(err.message); return false }
      return true
    } catch {
      setError("Something went wrong. Try again.")
      return false
    }
  }

  // ── Access rules ──────────────────────────────────────────────────────────────
  const canSeeAllSchools = user?.role === 'admin' || user?.role === 'peak_staff'
  const allowedSchoolId  = canSeeAllSchools ? null : user?.school_id || null
  const hasModule = (mod) => {
    if (canSeeAllSchools) return true
    return (user?.modules || []).includes(mod)
  }

  return (
    <UserContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      canSeeAllSchools,
      allowedSchoolId,
      hasModule,
      resetPassword,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
