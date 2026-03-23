import React from 'react'
import { useSchool } from '../../context/SchoolContext'

const STACK = [
  { layer: 'Frontend',   tech: 'React + Vite',          detail: 'Component-based · Fast builds · Vercel auto-deploy' },
  { layer: 'Styling',    tech: 'CSS Custom Properties', detail: 'Dynamic school theme switching · No rebuild required' },
  { layer: 'Database',   tech: 'Supabase (PostgreSQL)',  detail: 'Real-time · Row-level security · Multi-school isolation' },
  { layer: 'AI Agent',   tech: 'n8n + OpenAI GPT-4o',   detail: 'Webhook-driven · Simple Genius methodology · School-specific prompts' },
  { layer: 'Email',      tech: 'Mailto / Resend',        detail: 'Rep approve-before-send · Opens native email client' },
  { layer: 'Hosting',    tech: 'Vercel',                 detail: 'Auto-deploy on git push · Edge network · playbook.simplegenius.io' },
  { layer: 'Auth',       tech: 'Supabase Auth',          detail: 'Role-based — Rep sees one school, Peak Sports sees all' },
  { layer: 'Workflow',   tech: 'Railway (n8n)',          detail: 'Always-on AI workflow engine · Persistent Railway deployment' },
]

export default function TechStack() {
  const { school } = useSchool()
  const c = school.colors

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.accent, marginBottom: 6 }}>Infrastructure</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: c.primary, margin: 0 }}>Tech Stack</h2>
        <p style={{ color: c.accent, fontSize: 14, marginTop: 6, opacity: 0.8 }}>Built for production · Modular · Scales with your portfolio</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STACK.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '18px 24px', borderRadius: 16,
            background: 'white', border: `1px solid ${c.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: 140, flexShrink: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.layer}</p>
            </div>
            <div style={{ width: 2, height: 36, background: c.border, flexShrink: 0 }} />
            <div>
              <p style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: c.primary }}>{item.tech}</p>
              <p style={{ margin: 0, fontSize: 13, color: c.accent, opacity: 0.8 }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: '28px 32px', borderRadius: 20, background: c.primary }}>
        <p style={{ margin: '0 0 10px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: 'white' }}>Production Ready</p>
        <p style={{ margin: 0, fontSize: 14, color: `${c.accent2 || '#C7B37F'}`, lineHeight: 1.7, opacity: 0.9 }}>
          Every component is modular and independently deployable. Adding a new school requires only a new entry in the schools config — no code changes. Adding a new service module means adding one new folder under /modules. The platform is designed to grow with your portfolio.
        </p>
      </div>
    </div>
  )
}
