import React, { createContext, useContext, useState, useEffect } from 'react'
import { SCHOOLS } from '../data/schools'
import { applyTheme } from '../lib/theme'
import { useUser } from './UserContext'

const SchoolContext = createContext(null)

export function SchoolProvider({ children }) {
  const { allowedSchoolId, canSeeAllSchools } = useUser()

  // Reps are locked to their school. Admins/staff default to wofford.
  const defaultSchool = allowedSchoolId || 'wofford'
  const [activeSchoolId, setActiveSchoolId] = useState(defaultSchool)
  const [memberTier, setMemberTier] = useState('platinum')

  // If user changes (e.g. different login), reset to their allowed school
  useEffect(() => {
    setActiveSchoolId(defaultSchool)
  }, [defaultSchool])

  const school = SCHOOLS[activeSchoolId] || SCHOOLS.wofford

  useEffect(() => {
    applyTheme(school.colors)
  }, [activeSchoolId])

  const switchSchool = (id) => {
    // Reps cannot switch — they are locked to their school_id
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
