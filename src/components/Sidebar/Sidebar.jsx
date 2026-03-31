import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { supabase } from '../../lib/supabase'

const TABS = [
  { id: 'agent',     label: 'Sales Agent',    sub: 'AI Chat',         icon: '🤖' },
  { id: 'crm',       label: 'CRM Outreach',   sub: 'AI Emails · Leads', icon: '📧' },
  { id: 'ticketing', label: 'Ticket Hub',      sub: 'Marketplace',     icon: '🎟️' },
  { id: 'analytics', label: 'Analytics',       sub: 'Performance',     icon: '📊' },
  { id: 'insights',  label: 'AI Productivity', sub: 'AI vs Manual',    icon: '⚡' },
  { id: 'stack',     label: 'Tech Stack',      sub: 'Infrastructure',  icon: '🔧' },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { school } = useSchool()
  const c = school.colors

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // fallback — reload to clear session
      window.location.href = '/'
    }
  }

  // Top contact display name
  const repName = school.agent?.name || 'Rep'
  const initials = repName.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div style={{
      width: 220,
      height: '100%',
      background: c.primary,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid rgba(255,255,255,0.06)`,
      flexShrink: 0,
    }}>

      {/* Rep profile */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `${c.accent}22`,
            border: `1px solid ${c.accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, flexShrink: 0,
          }}>
            {school.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {repName}
            </p>
            <p style={{
              margin: 0,
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: c.accent,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {school.short} · {school.conference}
            </p>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                border: 'none',
                background: active ? `${c.accent}18` : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
                transition: 'all 0.15s',
                borderLeft: active ? `3px solid ${c.accent}` : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{tab.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {tab.label}
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  color: active ? c.accent : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.06em',
                }}>
                  {tab.sub}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div style={{
        padding: '12px 8px',
        borderTop: `1px solid rgba(255,255,255,0.08)`,
      }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 13 }}>🚪</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.55)',
          }}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  )
}
