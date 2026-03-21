import React, { useState } from 'react'
import { SCHOOL_LIST } from '../../data/schools'
import { useSchool } from '../../context/SchoolContext'

export default function Gallery() {
  const { school, activeSchoolId, switchSchool } = useSchool()
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? SCHOOL_LIST.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.conference.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase())
      )
    : SCHOOL_LIST

  return (
    <div style={{
      background: '#ffffff',
      borderBottom: '2px solid var(--color-border, #e8dfc8)',
      padding: '10px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* Simple Genius wordmark */}
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: '#111', letterSpacing: '-0.3px', flexShrink: 0 }}>
            Simple<span style={{ color: 'var(--color-accent, #886E4C)' }}> Genius.</span>
          </span>
          <span style={{ color: '#e0e0e0', flexShrink: 0 }}>|</span>
          {/* Active school pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: school.colors.primary,
            border: `1px solid ${school.colors.accent}`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>{school.emoji}</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: 'white', whiteSpace: 'nowrap' }}>
              {school.short}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: school.colors.accent2, opacity: 0.9 }}>
              {school.conference}
            </span>
          </div>
        </div>

        {/* Switch button */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            minWidth: 44, minHeight: 44, padding: '0 14px',
            borderRadius: 10, border: '1px solid #e0e0e0',
            background: '#f9f9f9', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#666',
            transition: 'all 0.15s ease',
          }}
        >
          Switch School {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded picker */}
      {expanded && (
        <div style={{ marginTop: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search schools, conference, city..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px 10px 34px',
                borderRadius: 10, border: '1px solid #e0e0e0',
                fontSize: 14, fontFamily: 'Inter, Arial, sans-serif',
                outline: 'none', background: '#fafafa',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          </div>

          {/* School cards */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 6, WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none', scrollbarWidth: 'none',
          }}>
            {filtered.map(s => {
              const active = s.id === activeSchoolId
              return (
                <button
                  key={s.id}
                  onClick={() => { switchSchool(s.id); setExpanded(false); setSearch('') }}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', minHeight: 48, borderRadius: 12,
                    border: `2px solid ${active ? s.colors.accent : '#e0e0e0'}`,
                    background: active ? s.colors.primary : 'white',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, color: active ? 'white' : '#111', lineHeight: 1.2 }}>
                      {s.short}
                    </p>
                    <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: active ? s.colors.accent2 : '#94a3b8' }}>
                      {s.conference} · {s.tier}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <p style={{ margin: '6px 0 0', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8', textAlign: 'right' }}>
            {filtered.length} of {SCHOOL_LIST.length} schools
          </p>
        </div>
      )}
    </div>
  )
}
