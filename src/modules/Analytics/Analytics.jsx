import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const revenueData = [
  { month:'Aug', tickets:12400, sponsorship:8500 },
  { month:'Sep', tickets:28600, sponsorship:12000 },
  { month:'Oct', tickets:34200, sponsorship:18500 },
  { month:'Nov', tickets:41800, sponsorship:22000 },
  { month:'Dec', tickets:18200, sponsorship:8000 },
  { month:'Jan', tickets:22400, sponsorship:14000 },
  { month:'Feb', tickets:31600, sponsorship:19500 },
  { month:'Mar', tickets:29200, sponsorship:16000 },
]

const sportData = [
  { sport:'Football',   tickets:334, revenue:35200 },
  { sport:'Basketball', tickets:214, revenue:23500 },
  { sport:'Baseball',   tickets:86,  revenue:7900  },
  { sport:'Volleyball', tickets:42,  revenue:3200  },
  { sport:'Soccer',     tickets:38,  revenue:2800  },
]

const campaignData = [
  { name:'Ticket Sales',  value:45 },
  { name:'Sponsorship',   value:28 },
  { name:'Hospitality',   value:16 },
  { name:'Alumni',        value:11 },
]

export default function Analytics() {
  const { school } = useSchool()
  const c = school.colors

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: c.primary, border: `1px solid ${c.accent}44`, borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ margin: '0 0 6px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, color: 'white' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: 0, fontSize: 12, color: p.color || c.accent }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    )
  }

  const Card = ({ children, style = {} }) => (
    <div style={{ padding: '24px', borderRadius: 20, background: 'white', border: `1px solid ${c.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', ...style }}>
      {children}
    </div>
  )

  const ChartTitle = ({ title, sub }) => (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: c.primary }}>{title}</h3>
      <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: c.accent }}>{sub}</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.accent, marginBottom: 6 }}>{school.name} · Analytics</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: c.primary, margin: 0 }}>Performance Dashboard</h2>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label:'Ticket Revenue',      value:'$74,700', sub:`${school.short} · YTD`,    dark:true  },
          { label:'Sponsorship Revenue', value:'$48,500', sub:'Packages closed',           dark:true  },
          { label:'Tickets Sold',        value:'745',     sub:'+22% vs last season',       dark:false },
          { label:'Active Sponsors',     value:'12',      sub:'3 up for renewal',          dark:false },
        ].map((k, i) => (
          <div key={i} style={{ padding: '20px', borderRadius: 16, background: k.dark ? c.primary : 'white', border: `1px solid ${k.dark ? 'transparent' : c.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 6px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', color: k.dark ? 'rgba(255,255,255,0.4)' : c.accent }}>{k.label}</p>
            <p style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: k.dark ? (c.accent2 || '#C7B37F') : c.accent }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: k.dark ? 'rgba(255,255,255,0.4)' : c.accent, opacity: 0.7 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <ChartTitle title="Revenue Over Time" sub="Ticket Sales vs Sponsorship · YTD" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: c.accent }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: c.accent }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v/1000)}k`} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="tickets" name="Tickets" fill={c.accent} radius={[4,4,0,0]} />
              <Bar dataKey="sponsorship" name="Sponsorship" fill={c.accent2 || '#C7B37F'} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Tickets by Sport" sub={`${school.name} · Season`} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sportData} layout="vertical" margin={{ top: 4, right: 8, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: c.accent }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sport" tick={{ fontSize: 12, fill: c.primary }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="tickets" name="Tickets" fill={c.accent} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Campaign performance + season summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <Card>
          <ChartTitle title="Campaign Performance" sub="Revenue contribution by campaign type" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {campaignData.map((cam, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.primary }}>{cam.name}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: c.accent, fontWeight: 700 }}>{cam.value}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: c.bg, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${c.accent}, ${c.accent2 || c.accent}88)`, width: `${cam.value}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ padding: '24px', borderRadius: 20, background: c.primary }}>
          <h3 style={{ margin: '0 0 20px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: 'white' }}>Season Summary</h3>
          {[
            { label:'Open Rate',       value:'38%',    prev:'21%'   },
            { label:'Response Rate',   value:'19%',    prev:'8%'    },
            { label:'Conversion Rate', value:'5.3%',   prev:'1.8%'  },
            { label:'Avg Deal Size',   value:'$4,200', prev:'$1,800'},
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: c.accent2 || '#C7B37F' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{s.prev} manual</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
