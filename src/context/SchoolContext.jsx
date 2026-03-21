import React, { createContext, useContext, useState, useEffect } from 'react'
import { SCHOOLS } from '../data/schools'
import { applyTheme } from '../lib/theme'

const SchoolContext = createContext(null)

export function SchoolProvider({ children }) {
  const [activeSchoolId, setActiveSchoolId] = useState('wofford')
  const [memberTier, setMemberTier] = useState('platinum')

  const school = SCHOOLS[activeSchoolId] || SCHOOLS.wofford

  // Apply theme whenever school changes
  useEffect(() => {
    applyTheme(school.colors)
  }, [activeSchoolId])

  const switchSchool = (id) => {
    if (SCHOOLS[id]) setActiveSchoolId(id)
  }

  return (
    <SchoolContext.Provider value={{ school, activeSchoolId, switchSchool, memberTier, setMemberTier }}>
      {children}
    </SchoolContext.Provider>
  )
}

export const useSchool = () => {
  const ctx = useContext(SchoolContext)
  if (!ctx) throw new Error('useSchool must be used inside SchoolProvider')
  return ctx
}
