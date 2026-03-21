import React from 'react'
import { useSchool } from '../../context/SchoolContext'

const STACK = [
  { layer: 'Frontend',    tech: 'React + Vite',           detail: 'Component-based · Fast builds · Vercel deployment' },
  { layer: 'Styling',     tech: 'CSS Custom Properties',  detail: 'Dynamic theme switching via CSS vars · No rebuild required' },
  { layer: 'Database',    tech: 'Supabase (PostgreSQL)',  detail: 'Real-time · Row-level security · REST + realtime APIs' },
  { layer: 'AI Agent',    tech: 'n8n + OpenAI',           detail: 'Webhook-driven · Challenger Sale methodology · School-specific prompts' },
  { layer: 'Email',       tech: 'Resend',                 detail: 'DMARC compliant · AI-drafted · Rep approve-before-send workflow' },
  { layer: 'Hosting',     tech: 'Vercel',                 detail: 'Auto-deploy on git push · Edge network · Custom domain' },
  { layer: 'Auth',        tech: 'Supabase Auth',          detail: 'JWT · Row-level security · Per-school data isolation' },
  { layer: 'Analytics',   tech: 'Custom + Supabase',      detail: 'Real transactions · Live KPIs · No third-party tracking' },
]

export default function TechStack() {
  const { school } = useSchool()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: school.colors.accent, marginBottom: 6 }}>Infrastructure</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: '#111', margin: 0 }}>Tech Stack</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Built for production · Modular · Scales with your portfolio</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STACK.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 16, background: 'white', border: `1px solid ${school.colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 140, flexShrink: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: school.colors.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.layer}</p>
            </div>
            <div style={{ width: 2, height: 40, background: school.colors.border, flexShrink: 0 }} />
            <div>
              <p style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: '#111' }}>{item.tech}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: '24px', borderRadius: 20, background: school.colors.primary }}>
        <p style={{ margin: '0 0 12px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: 'white' }}>Production Ready</p>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          Every component is modular and independently deployable. Adding a new school requires only a new entry in the schools config — no code changes. Adding a new service module (NIL, Facilities, etc.) means adding one new folder under /modules. The platform is designed to grow with your portfolio.
        </p>
      </div>
    </div>
  )
}
