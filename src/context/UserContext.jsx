import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id)
      else { setUser(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (authId) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('user_profiles')
        .select('id, auth_id, name, email, role, school_id, active, modules, title')
        .eq('auth_id', authId)
        .eq('active', true)
        .single()

      if (err || !data) {
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

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(), password,
      })
      if (err) { setError('Invalid email or password. Try again.'); setLoading(false); return false }
      return true
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

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
      setError('Something went wrong. Try again.')
      return false
    }
  }

  const canSeeAllSchools = user?.role === 'admin' || user?.role === 'peak_staff'
  const allowedSchoolId  = canSeeAllSchools ? null : user?.school_id || null
  const hasModule = (mod) => {
    if (canSeeAllSchools) return true
    return (user?.modules || []).includes(mod)
  }

  return (
    <UserContext.Provider value={{
      user, loading, error,
      login, logout, resetPassword,
      canSeeAllSchools, allowedSchoolId, hasModule,
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
