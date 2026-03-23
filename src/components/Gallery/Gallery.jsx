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
      borderBottom: '1px solid #e8e8e8',
      padding: '6px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Top row — thin header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Peak Sports logo */}
          <img
            src="/peak_logo.png"
            alt="Peak Sports MGMT"
            style={{ height: 28, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
          <span style={{ color: '#ddd', flexShrink: 0 }}>|</span>
          {/* Active school pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: school.colors.primary,
            border: `1px solid ${school.colors.accent}`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12 }}>{school.emoji}</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, color: 'white', whiteSpace: 'nowrap' }}>
              {school.short}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: school.colors.accent2, opacity: 0.9, display: 'none' }} className="conf-label">
              {school.conference}
            </span>
          </div>
        </div>

        {/* Switch button — compact */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            height: 30, padding: '0 12px',
            borderRadius: 8, border: '1px solid #e0e0e0',
            background: '#f9f9f9', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#666',
            transition: 'all 0.15s ease', flexShrink: 0,
          }}
        >
          Switch {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded picker */}
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search schools..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px 8px 32px',
                borderRadius: 8, border: '1px solid #e0e0e0',
                fontSize: 13, fontFamily: 'Inter, Arial, sans-serif',
                outline: 'none', background: '#fafafa',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🔍</span>
          </div>

          {/* School cards */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
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
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', minHeight: 40, borderRadius: 10,
                    border: `2px solid ${active ? s.colors.accent : '#e0e0e0'}`,
                    background: active ? s.colors.primary : 'white',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{s.emoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: active ? 'white' : '#111', lineHeight: 1.2 }}>
                      {s.short}
                    </p>
                    <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: active ? s.colors.accent2 : '#94a3b8' }}>
                      {s.conference}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
