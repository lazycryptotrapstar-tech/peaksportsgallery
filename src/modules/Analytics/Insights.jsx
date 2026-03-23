import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const weekly = [
  { week:'Wk1', manual:24,  ai:98,  mRev:1800,  aRev:6200  },
  { week:'Wk2', manual:28,  ai:112, mRev:2100,  aRev:7800  },
  { week:'Wk3', manual:22,  ai:134, mRev:1600,  aRev:9400  },
  { week:'Wk4', manual:31,  ai:156, mRev:2400,  aRev:11200 },
  { week:'Wk5', manual:26,  ai:178, mRev:1900,  aRev:13600 },
  { week:'Wk6', manual:29,  ai:198, mRev:2200,  aRev:15800 },
  { week:'Wk7', manual:33,  ai:221, mRev:2500,  aRev:17400 },
  { week:'Wk8', manual:35,  ai:244, mRev:2700,  aRev:19200 },
]

const funnel = [
  { stage:'Contacted', manual:420, ai:1840 },
  { stage:'Opened',    manual:88,  ai:698  },
  { stage:'Replied',   manual:34,  ai:349  },
  { stage:'Converted', manual:14,  ai:97   },
]

export default function Insights() {
  const { school } = useSchool()
  const c = school.colors
  const AC = c.accent
  const MC = '#cbd5e1'

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: c.primary, border: `1px solid ${AC}44`, borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: 'white' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ margin: 0, fontSize: 12, color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    )
  }

  const Card = ({ children, title, sub }) => (
    <div style={{ padding: '24px', borderRadius: 20, background: 'white', border: `1px solid ${c.border}`, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {title && <h3 style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: c.primary }}>{title}</h3>}
      {sub && <p style={{ margin: '0 0 16px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: c.accent }}>{sub}</p>}
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: AC, marginBottom: 6 }}>Data Insights</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,48px)', color: c.primary, margin: 0 }}>AI vs Manual Outreach</h2>
        <p style={{ color: c.accent, fontSize: 14, marginTop: 6, opacity: 0.8 }}>Same reps, same time period — with and without Simple Genius</p>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label:'Emails Sent',       m:'420',     a:'1,840',  lift:'4.4x more'  },
          { label:'Response Rate',     m:'8%',      a:'19%',    lift:'+138%'       },
          { label:'Revenue Generated', m:'$28,400', a:'$97,200',lift:'3.4x more'  },
          { label:'Hours Saved',       m:'—',       a:'312 hrs',lift:'per season'  },
        ].map((k, i) => (
          <div key={i} style={{ padding: '18px', borderRadius: 16, background: 'white', border: `1px solid ${c.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 10px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', color: c.accent }}>{k.label}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#94a3b8' }}>MANUAL</p>
                <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: '#94a3b8' }}>{k.m}</p>
              </div>
              <span style={{ color: c.border, fontSize: 16, marginBottom: 2 }}>→</span>
              <div>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: AC }}>SIMPLE GENIUS</p>
                <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: AC }}>{k.a}</p>
              </div>
            </div>
            <div style={{ background: `${AC}15`, borderRadius: 8, padding: '4px 10px', display: 'inline-block' }}>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: AC, fontWeight: 700 }}>{k.lift}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      <Card title="Weekly Outreach Volume" sub="Emails sent per week — Manual vs Simple Genius AI">
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: MC }} />
            <span style={{ fontSize: 12, color: c.accent, fontWeight: 600 }}>Manual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: AC }} />
            <span style={{ fontSize: 12, color: AC, fontWeight: 600 }}>Simple Genius AI</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 700, fill: c.accent }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: c.accent }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="manual" name="Manual" fill={MC} radius={[4,4,0,0]} />
            <Bar dataKey="ai" name="Simple Genius AI" fill={AC} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue chart */}
      <Card title="Revenue Generated Weekly" sub="Dollars closed per week">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 700, fill: c.accent }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: c.accent }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v/1000)}k`} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="mRev" name="Manual" stroke={MC} strokeWidth={2} strokeDasharray="5 3" dot={false} />
            <Line type="monotone" dataKey="aRev" name="Simple Genius AI" stroke={AC} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Funnel */}
      <Card title="Conversion Funnel" sub="Contacted → Opened → Replied → Converted">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {funnel.map((row, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: c.primary }}>{row.stage}</span>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8' }}>Manual: {row.manual}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: AC, fontWeight: 700 }}>AI: {row.ai}</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 24, borderRadius: 12, overflow: 'hidden', background: c.bg }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 12, background: MC, opacity: 0.5, width: `${row.manual / funnel[0].ai * 100}%` }} />
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 12, background: AC, opacity: 0.9, width: `${row.ai / funnel[0].ai * 100}%`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: 11 }}>{Math.round(row.ai / funnel[0].ai * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { label:'TIME SAVINGS',       value:'312', unit:'hrs', sub:'~39 working days returned per rep per season'  },
          { label:'CONVERSION LIFT',    value:'+138',unit:'%',   sub:'8% manual → 19% with Simple Genius'           },
          { label:'REVENUE MULTIPLIER', value:'3.4', unit:'x',   sub:'$28k manual → $97k with Simple Genius'        },
        ].map((s, i) => (
          <div key={i} style={{ borderRadius: 20, padding: '20px', background: c.primary }}>
            <p style={{ margin: '0 0 8px', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ margin: '0 0 6px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 36, color: 'white' }}>
              {s.value}<span style={{ fontSize: 18, color: c.accent2 || c.accent }}>{s.unit}</span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
