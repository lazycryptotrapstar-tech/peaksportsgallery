import React from 'react'
import { useSchool } from '../../context/SchoolContext'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const revenueData = [
  { month: 'Aug', tickets: 12400, sponsorship: 8500 },
  { month: 'Sep', tickets: 28600, sponsorship: 12000 },
  { month: 'Oct', tickets: 34200, sponsorship: 18500 },
  { month: 'Nov', tickets: 41800, sponsorship: 22000 },
  { month: 'Dec', tickets: 18200, sponsorship: 8000 },
  { month: 'Jan', tickets: 22400, sponsorship: 14000 },
  { month: 'Feb', tickets: 31600, sponsorship: 19500 },
  { month: 'Mar', tickets: 29200, sponsorship: 16000 },
]

const sportData = [
  { sport: 'Football', tickets: 334, revenue: 35200 },
  { sport: 'Basketball', tickets: 214, revenue: 23500 },
  { sport: 'Baseball', tickets: 86, revenue: 7900 },
  { sport: 'Volleyball', tickets: 42, revenue: 3200 },
  { sport: 'Soccer', tickets: 38, revenue: 2800 },
]

const campaignData = [
  { name: 'Ticket Sales', value: 45 },
  { name: 'Sponsorship', value: 28 },
  { name: 'Hospitality', value: 16 },
  { name: 'Alumni', value: 11 },
]

export default function Analytics() {
  const { school } = useSchool()
  const ac = school.colors.accent
  const ac2 = school.colors.accent2

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: school.colors.primary, border: `1px solid ${ac}44`, borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ margin: '0 0 6px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, color: 'white' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: 0, fontSize: 12, color: p.color || ac }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: ac, marginBottom: 6 }}>{school.name} · Analytics</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: '#111', margin: 0 }}>Performance Dashboard</h2>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Ticket Revenue', value: '$74,700', sub: `${school.short} · YTD`, dark: true },
          { label: 'Sponsorship Revenue', value: '$48,500', sub: 'Packages closed', dark: true },
          { label: 'Tickets Sold', value: '745', sub: '+22% vs last season' },
          { label: 'Active Sponsors', value: '12', sub: '3 up for renewal' },
        ].map((k, i) => (
          <div key={i} style={{
            padding: '20px',
            borderRadius: 16,
            background: k.dark ? school.colors.primary : 'white',
            border: `1px solid ${k.dark ? 'transparent' : school.colors.border}`,
          }}>
            <p style={{ margin: '0 0 6px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', color: k.dark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{k.label}</p>
            <p style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: k.dark ? ac2 : ac }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: k.dark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ padding: '24px', borderRadius: 20, background: 'white', border: `1px solid ${school.colors.border}` }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#111' }}>Revenue Over Time</h3>
          <p style={{ margin: '0 0 20px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8' }}>Ticket Sales vs Sponsorship · YTD</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v/1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tickets" name="Tickets" fill={ac} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sponsorship" name="Sponsorship" fill={ac2 || '#C7B37F'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: '24px', borderRadius: 20, background: 'white', border: `1px solid ${school.colors.border}` }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#111' }}>Tickets by Sport</h3>
          <p style={{ margin: '0 0 20px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8' }}>{school.name} · Season</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sportData} layout="vertical" margin={{ top: 4, right: 8, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sport" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tickets" name="Tickets" fill={ac} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div style={{ padding: '24px', borderRadius: 20, background: 'white', border: `1px solid ${school.colors.border}` }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#111' }}>Campaign Performance</h3>
          <p style={{ margin: '0 0 20px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8' }}>Revenue contribution by campaign type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaignData.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{c.name}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: ac, fontWeight: 700 }}>{c.value}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${ac}, ${ac2 || ac}88)`, width: `${c.value}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px', borderRadius: 20, background: school.colors.primary, border: 'none' }}>
          <h3 style={{ margin: '0 0 20px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: 'white' }}>Season Summary</h3>
          {[
            { label: 'Open Rate', value: '38%', prev: '21%' },
            { label: 'Response Rate', value: '19%', prev: '8%' },
            { label: 'Conversion Rate', value: '5.3%', prev: '1.8%' },
            { label: 'Avg Deal Size', value: '$4,200', prev: '$1,800' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: ac2 || '#C7B37F' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{s.prev} manual</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
