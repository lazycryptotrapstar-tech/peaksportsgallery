import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser]       = useState(null)   // { id, name, email, role, school_id }
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Persist login across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem('playbook_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { localStorage.removeItem('playbook_user') }
    }
  }, [])

  const login = async (email) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('id, name, email, role, school_id, active')
        .eq('email', email.toLowerCase().trim())
        .eq('active', true)
        .single()

      if (err || !data) {
        setError('No account found for that email. Contact Dee to get access.')
        return false
      }

      localStorage.setItem('playbook_user', JSON.stringify(data))
      setUser(data)
      return true
    } catch {
      setError('Something went wrong. Try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('playbook_user')
    setUser(null)
  }

  // Access rules
  const canSeeAllSchools = user && (user.role === 'admin' || user.role === 'peak_staff')
  const allowedSchoolId  = user?.school_id || null   // null = all schools

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout, canSeeAllSchools, allowedSchoolId }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
