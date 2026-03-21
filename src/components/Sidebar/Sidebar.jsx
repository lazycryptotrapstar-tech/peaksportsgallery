import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { MEMBERSHIP_TIERS } from '../../data/tiers'
import { Sparkles, ShoppingCart, Mail, TrendingUp, Network, BarChart2 } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'agent',     label: 'Sales Agent',   sub: 'AI Chat · CRM',        icon: Sparkles },
  { id: 'ticketing', label: 'Ticket Hub',    sub: 'Marketplace',           icon: ShoppingCart },
  { id: 'crm',       label: 'CRM Outreach',  sub: 'AI Emails · Leads',     icon: Mail },
  { id: 'analytics', label: 'Analytics',     sub: 'Performance',           icon: TrendingUp },
  { id: 'insights',  label: 'AI Productivity', sub: 'AI vs Manual',        icon: BarChart2 },
  { id: 'stack',     label: 'Tech Stack',    sub: 'Infrastructure',         icon: Network },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { school, memberTier } = useSchool()
  const tier = MEMBERSHIP_TIERS[memberTier]

  return (
    <div style={{
      width: 256,
      minWidth: 256,
      height: '100vh',
      background: school.colors.primary,
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      borderRight: `1px solid ${school.colors.accent}33`,
    }}>
      {/* Logo area */}
      <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid ${school.colors.accent}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${school.colors.accent}22`,
            border: `1px solid ${school.colors.accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {school.emoji}
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: 'white', lineHeight: 1.1 }}>
              {school.mascotName}<span style={{ color: school.colors.accent2 }}>.</span><span style={{ color: school.colors.accent }}>ai</span>
            </p>
            <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {school.name} · {school.conference}
            </p>
          </div>
        </div>

        {/* Status + tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: school.colors.accent,
            boxShadow: `0 0 6px ${school.colors.accent}`,
          }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: tier.color, fontWeight: 700 }}>
            {tier.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 2, borderRadius: 10,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? `${school.colors.accent}22` : 'transparent',
                borderLeft: active ? `3px solid ${school.colors.accent}` : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} color={active ? school.colors.accent : 'rgba(255,255,255,0.4)'} />
              <div>
                <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: active ? 700 : 500, fontSize: 13, color: active ? 'white' : 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>
                  {item.label}
                </p>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: active ? school.colors.accent : 'rgba(255,255,255,0.25)' }}>
                  {item.sub}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${school.colors.accent}22` }}>
        <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          POWERED BY PEAK SPORTS MGMT
        </p>
      </div>
    </div>
  )
}
