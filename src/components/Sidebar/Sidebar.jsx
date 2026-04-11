import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { useUser } from '../../context/UserContext'
import { MEMBERSHIP_TIERS } from '../../data/tiers'
import { Sparkles, Mail, BarChart2, LayoutDashboard, LogOut, PenSquare, TrendingUp } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'crm',       label: 'CRM Outreach',  sub: 'AI Emails · Leads', icon: Mail,        mod: 'crm' },
  { id: 'productivity', label: 'Productivity', sub: 'My Activity',    icon: TrendingUp,  mod: 'crm' },
  { id: 'analytics', label: 'Analytics',    sub: 'Performance',       icon: BarChart2, mod: 'analytics' },
  { id: 'agent',     label: 'Sales Agent',  sub: 'AI Chat',           icon: Sparkles,  mod: 'agent' },
]

const STAFF_NAV = [
  { id: 'outreach',  label: 'Outreach',          sub: 'Contacts & Drafts', icon: PenSquare,     mod: null },
  { id: 'dashboard', label: 'School Dashboard', sub: 'Client Overview', icon: LayoutDashboard, mod: null },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { school, memberTier } = useSchool()
  const { user, logout, canSeeAllSchools, hasModule } = useUser()
  const tier = MEMBERSHIP_TIERS[memberTier] || MEMBERSHIP_TIERS.bronze

  const accent  = school?.colors?.accent  || '#EFA020'
  const accent2 = school?.colors?.accent2 || '#EFA020'
  const primary = school?.colors?.primary || '#152E10'

  const visibleNav = NAV_ITEMS.filter(item => (item.mod === null || hasModule(item.mod)) && !(canSeeAllSchools && item.id === 'crm'))

  // Footer label — title if set, otherwise role label
  const footerLabel = user?.title
    || (user?.role === 'admin' ? 'Admin'
      : user?.role === 'peak_staff' ? 'Peak Staff'
      : user?.school_id || 'Rep')

  return (
    <div style={{
      width: 256, minWidth: 256, height: '100vh',
      background: primary,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0,
      overflowY: 'auto',
      borderRight: `1px solid ${accent}33`,
    }}>

      {/* ── Logo / School ─────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${accent}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>

          {/* School logo or emoji fallback */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${accent}44`, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: school?.logo_url ? '#000' : `${accent}22`,
          }}>
            {school?.logo_url
              ? <img src={school.logo_url} alt={school?.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 20 }}>{school?.emoji || '🏔️'}</span>
            }
          </div>

          <div>
            <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 18, color: 'white', lineHeight: 1.1 }}>
              {school?.mascotName || 'Grip'}<span style={{ color: accent2 }}>.</span><span style={{ color: accent }}>ai</span>
            </p>
            <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {school?.name} · {school?.conference}
            </p>
          </div>
        </div>


      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>

        {canSeeAllSchools && STAFF_NAV.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 4, borderRadius: 10,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active ? `${accent}22` : `${accent}11`,
              borderLeft: active ? `3px solid ${accent}` : `3px solid ${accent}44`,
              transition: 'all 0.15s ease',
            }}>
              <Icon size={18} color={active ? accent : `${accent}99`} />
              <div>
                <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: active ? 700 : 600, fontSize: 13, color: active ? 'white' : 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: active ? accent : `${accent}77` }}>{item.sub}</p>
              </div>
            </button>
          )
        })}

        {canSeeAllSchools && <div style={{ height: 1, background: `${accent}22`, margin: '6px 4px 10px' }} />}

        {visibleNav.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 2, borderRadius: 10,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active ? `${accent}22` : 'transparent',
              borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}>
              <Icon size={18} color={active ? accent : 'rgba(255,255,255,0.4)'} />
              <div>
                <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: active ? 700 : 500, fontSize: 13, color: active ? 'white' : 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: active ? accent : 'rgba(255,255,255,0.25)' }}>{item.sub}</p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 16px', borderTop: `1px solid ${accent}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}22`, border: `1px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 11, color: accent, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {footerLabel}
            </p>
          </div>
        </div>

        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 9,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,82,82,0.12)'; e.currentTarget.style.borderColor = 'rgba(224,82,82,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <LogOut size={14} color='rgba(255,255,255,0.4)' />
          <span style={{ fontFamily: "'Geist',sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Sign out</span>
        </button>

        <p style={{ margin: '10px 0 0', fontFamily: "'Geist Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.15)', textAlign: 'center', letterSpacing: '0.06em' }}>
          POWERED BY PEAK SPORTS MGMT
        </p>
      </div>
    </div>
  )
}
