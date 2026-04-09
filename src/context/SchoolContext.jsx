import React, { createContext, useContext, useState, useEffect } from 'react'
import { SCHOOLS } from '../data/schools'
import { applyTheme } from '../lib/theme'
import { useUser } from './UserContext'
import { supabase } from '../lib/supabase'

const SchoolContext = createContext(null)

export function SchoolProvider({ children }) {
  const { allowedSchoolId, canSeeAllSchools } = useUser()

  const defaultSchool = allowedSchoolId || 'wofford'
  const [activeSchoolId, setActiveSchoolId] = useState(defaultSchool)
  const [memberTier, setMemberTier]         = useState('platinum')
  const [logoUrl, setLogoUrl]               = useState(null)

  useEffect(() => {
    setActiveSchoolId(defaultSchool)
  }, [defaultSchool])

  // ── Fetch logo_url from Supabase whenever school changes ──────────────────
  useEffect(() => {
    const fetchSchoolExtras = async () => {
      try {
        const { data } = await supabase
          .from('schools')
          .select('logo_url')
          .eq('id', activeSchoolId)
          .single()
        setLogoUrl(data?.logo_url || null)
      } catch {
        setLogoUrl(null)
      }
    }
    fetchSchoolExtras()
  }, [activeSchoolId])

  // Merge static school data with Supabase-sourced logo
  const baseSchool = SCHOOLS[activeSchoolId] || SCHOOLS.wofford
  const school = { ...baseSchool, logo_url: logoUrl }

  useEffect(() => {
    applyTheme(school.colors)
  }, [activeSchoolId])

  const switchSchool = (id) => {
    if (!canSeeAllSchools) return
    if (SCHOOLS[id]) setActiveSchoolId(id)
  }

  return (
    <SchoolContext.Provider value={{
      school,
      activeSchoolId,
      switchSchool,
      memberTier,
      setMemberTier,
      canSwitchSchool: canSeeAllSchools,
    }}>
      {children}
    </SchoolContext.Provider>
  )
}

export const useSchool = () => {
  const ctx = useContext(SchoolContext)
  if (!ctx) throw new Error('useSchool must be used inside SchoolProvider')
  return ctx
}
