import React, { useState } from 'react'
import { useSchool } from '../../context/SchoolContext'

// ── Real data from Kyle's Time & Score report ─────────────────────────────────
const DATA = {
  // FY totals — current vs goal
  fy: [
    { year: 'FY23', total: 138140,  goal: null,   label: 'FY 2022-23' },
    { year: 'FY24', total: 321648,  goal: 321500,  label: 'FY 2023-24' },
    { year: 'FY25', total: 621880,  goal: 371500,  label: 'FY 2024-25' },
  ],

  // Revenue by category FY25
  categories: [
    { label: 'MFB Ticket Sales',       current: 98995,  goal: 90000,  color: '#3CDB7A' },
    { label: 'MFB Parking',            current: 32129,  goal: 20000,  color: '#3CDB7A' },
    { label: 'MFB Premium — Porch',    current: 14633,  goal: 15000,  color: '#F5C842' },
    { label: 'Basketball Tickets',     current: 20466,  goal: 30000,  color: '#F5C842' },
    { label: 'Volleyball Tickets',     current: 4691,   goal: 2500,   color: '#3CDB7A' },
    { label: 'Crowdfunding',           current: 64158,  goal: 150000, color: '#f97316' },
    { label: 'Corporate Partners',     current: 143200, goal: null,   color: '#886E4C' },
  ],

  // Football ticket revenue YoY
  footballYoY: [
    { year: '2022', tickets: 14643, revenue: 64615 },
    { year: '2023', tickets: 13472, revenue: 67084 },
    { year: '2024', tickets: 33569, revenue: 91917 },
  ],

  // 2025 season ticket sales
  seasonTickets2025: [
    { type: 'Reserved Season',  sold: 1102, revenue: 34805 },
    { type: 'Parking — Lot B',  sold: 173,  revenue: 17334 },
    { type: 'Parking — Lot C',  sold: 9,    revenue: 669   },
  ],

  // Game-by-game attendance (2025 football)
  gameAttendance: [
    { game: 'Game 1', attendance: 4786 },
    { game: 'Game 2', attendance: 4378 },
    { game: 'Game 3', attendance: 4735 },
    { game: 'Game 4', attendance: 5349 },
    { game: 'Game 5', attendance: 4554 },
  ],

  // Basketball revenue trend
  basketball: [
    { season: '22-23', revenue: 13250 },
    { season: '23-24', revenue: 19786 },
    { season: '24-25', revenue: 20466 },
    { season: '25-26', revenue: 8414  }, // season tickets only so far
  ],

  // Attendance totals
  attendance: {
    mbb:      9340,
    wbb:      7620,
    football: 23802,
  },
}

const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n}`
const fmtFull = (n) => `$${n.toLocaleString()}`

// ── Reusable bar chart row ────────────────────────────────────────────────────
const BarRow = ({ label, value, max, color, sublabel }) => {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#555', flexShrink: 0, marginLeft: 8 }}>{sublabel}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, bg }) => (
  <div style={{ padding: '16px', borderRadius: 14, background: bg || '#fff', border: '1px solid #e8eaed' }}>
    <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono',monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent || '#886E4C' }}>{label}</p>
    <p style={{ margin: '0 0 2px', fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontFamily: "'Space Mono',monospace" }}>{sub}</p>}
  </div>
)

// ── Section header ────────────────────────────────────────────────────────────
const SectionHead = ({ title, sub, accent }) => (
  <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f1f5f9' }}>
    <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono',monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: accent }}>{sub}</p>
    <h3 style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#111', letterSpacing: '0.03em' }}>{title}</h3>
  </div>
)

export default function Analytics() {
  const { school } = useSchool()
  const accent = school.colors.accent
  const primary = school.colors.primary

  const [fyView, setFyView] = useState('revenue') // revenue | tickets

  const maxFY = Math.max(...DATA.fy.map(f => f.total))
  const maxAttend = Math.max(...DATA.gameAttendance.map(g => g.attendance))
  const maxBball = Math.max(...DATA.basketball.map(b => b.revenue))
  const maxFbRev = Math.max(...DATA.footballYoY.map(f => f.revenue))

  const fy25 = DATA.fy[2]
  const fy24 = DATA.fy[1]
  const yoyGrowth = (((fy25.total - fy24.total) / fy24.total) * 100).toFixed(0)

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100%', padding: '0 0 60px' }}>
      <style>{`
        .an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .an-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .an-card { background: #fff; border-radius: 16px; border: 1px solid #e8eaed; padding: 20px; }
        @media (max-width: 640px) {
          .an-grid-2 { grid-template-columns: 1fr !important; }
          .an-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: primary, padding: '20px 20px 24px' }}>
        <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Analytics · {school.short}
        </p>
        <h2 style={{ margin: '0 0 16px', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(28px,6vw,42px)', color: 'white', letterSpacing: '0.03em' }}>
          Revenue Performance
        </h2>

        {/* Top KPIs */}
        <div className="an-grid-3">
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono',monospace", fontSize: 8, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>FY25 Total</p>
            <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'white', lineHeight: 1 }}>{fmt(fy25.total)}</p>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#3CDB7A' }}>+{yoyGrowth}% vs FY24</p>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono',monospace", fontSize: 8, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>vs Goal</p>
            <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#3CDB7A', lineHeight: 1 }}>
              +{fmt(fy25.total - fy25.goal)}
            </p>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Goal: {fmt(fy25.goal)}</p>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono',monospace", fontSize: 8, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attd. Total</p>
            <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'white', lineHeight: 1 }}>
              {(DATA.attendance.mbb + DATA.attendance.wbb + DATA.attendance.football).toLocaleString()}
            </p>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>All sports combined</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── FY Revenue Trend ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="Year-Over-Year Revenue" sub="3-Year Trend" accent={accent} />
          {DATA.fy.map((fy, i) => (
            <div key={fy.year} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: '#111' }}>{fy.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: i === 2 ? '#3CDB7A' : accent }}>{fmtFull(fy.total)}</span>
                  {fy.goal && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#94a3b8', marginLeft: 6 }}>/ {fmtFull(fy.goal)} goal</span>}
                </div>
              </div>
              <div style={{ position: 'relative', height: 10, borderRadius: 5, background: '#f1f5f9', overflow: 'visible' }}>
                {fy.goal && (
                  <div style={{ position: 'absolute', left: `${Math.min(100, (fy.goal / maxFY) * 100)}%`, top: -4, bottom: -4, width: 2, background: '#cbd5e1', borderRadius: 1, zIndex: 2 }} />
                )}
                <div style={{ height: '100%', width: `${(fy.total / maxFY) * 100}%`, borderRadius: 5, background: i === 2 ? '#3CDB7A' : accent, transition: 'width 0.6s ease' }} />
              </div>
              {fy.goal && fy.total > fy.goal && (
                <p style={{ margin: '3px 0 0', fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#3CDB7A' }}>✓ Over goal by {fmtFull(fy.total - fy.goal)}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── FY25 Revenue by Category ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="FY25 Revenue by Category" sub="Current vs Goal" accent={accent} />
          {DATA.categories.map(cat => {
            const pct = cat.goal ? Math.min(100, (cat.current / cat.goal) * 100) : 100
            const over = cat.goal && cat.current > cat.goal
            return (
              <div key={cat.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'DM Sans',sans-serif" }}>{cat.label}</span>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: over ? '#3CDB7A' : '#555' }}>{fmtFull(cat.current)}</span>
                    {cat.goal && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#94a3b8' }}> / {fmtFull(cat.goal)}</span>}
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: cat.color }} />
                </div>
                {cat.goal && (
                  <p style={{ margin: '2px 0 0', fontFamily: "'Space Mono',monospace", fontSize: 8, color: '#94a3b8' }}>
                    {pct.toFixed(0)}% of goal {over ? '✓' : ''}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Football Ticket Sales YoY ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="Football Ticket Sales" sub="2022 → 2024" accent={accent} />

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['revenue', 'tickets'].map(v => (
              <button key={v} onClick={() => setFyView(v)}
                style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${fyView === v ? accent : '#e0e0e0'}`, background: fyView === v ? primary : 'white', color: fyView === v ? 'white' : '#555', fontFamily: "'Space Mono',monospace", fontSize: 9, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.08em' }}>
                {v === 'revenue' ? 'Revenue' : 'Tickets Sold'}
              </button>
            ))}
          </div>

          {DATA.footballYoY.map((yr, i) => {
            const val = fyView === 'revenue' ? yr.revenue : yr.tickets
            const max = fyView === 'revenue' ? maxFbRev : Math.max(...DATA.footballYoY.map(f => f.tickets))
            const pct = (val / max) * 100
            return (
              <div key={yr.year} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: '#111' }}>{yr.year} Season</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: i === 2 ? '#3CDB7A' : accent }}>
                    {fyView === 'revenue' ? fmtFull(val) : val.toLocaleString()}
                    {fyView === 'tickets' && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, marginLeft: 4 }}>tickets</span>}
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 5, background: i === 2 ? '#3CDB7A' : accent }} />
                </div>
              </div>
            )
          })}

          {/* 2024 note */}
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(60,219,122,0.08)', border: '1px solid rgba(60,219,122,0.2)', marginTop: 4 }}>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#16a34a' }}>
              2024 saw a 2.5× increase in tickets sold vs 2023 — driven by expanded single-game sales strategy
            </p>
          </div>
        </div>

        {/* ── Game-by-Game Attendance ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="Football Game Attendance" sub="2025 Season" accent={accent} />
          {DATA.gameAttendance.map((g, i) => {
            const pct = (g.attendance / maxAttend) * 100
            const isHigh = g.attendance === maxAttend
            return (
              <div key={g.game} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'DM Sans',sans-serif" }}>{g.game}</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: isHigh ? '#3CDB7A' : '#555' }}>
                    {g.attendance.toLocaleString()} {isHigh ? '↑ Best' : ''}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: isHigh ? '#3CDB7A' : accent }} />
                </div>
              </div>
            )
          })}
          <div className="an-grid-2" style={{ marginTop: 14 }}>
            <StatCard label="Avg Attendance" value={Math.round(DATA.gameAttendance.reduce((s,g) => s + g.attendance, 0) / DATA.gameAttendance.length).toLocaleString()} sub="Per game" accent={accent} />
            <StatCard label="Total Gates" value={DATA.gameAttendance.reduce((s,g) => s + g.attendance, 0).toLocaleString()} sub="5-game total" accent={accent} />
          </div>
        </div>

        {/* ── Basketball & Volleyball ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="Basketball Ticket Revenue" sub="4-Year Trend" accent={accent} />
          {DATA.basketball.map((yr, i) => {
            const pct = (yr.revenue / maxBball) * 100
            const isCurrent = i === DATA.basketball.length - 1
            return (
              <div key={yr.season} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: '#111' }}>{yr.season}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isCurrent && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: 4 }}>Season tix only</span>}
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: accent }}>{fmtFull(yr.revenue)}</span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: accent }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Attendance Summary ── */}
        <div className="an-card" style={{ marginBottom: 14 }}>
          <SectionHead title="Total Attendance" sub="All Sports" accent={accent} />
          <div className="an-grid-3">
            <StatCard label="Football" value={DATA.attendance.football.toLocaleString()} sub="5 home games" accent={accent} />
            <StatCard label="Men's Bball" value={DATA.attendance.mbb.toLocaleString()} sub="Full season" accent={accent} />
            <StatCard label="Women's Bball" value={DATA.attendance.wbb.toLocaleString()} sub="Full season" accent={accent} />
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: `${primary}08`, border: `1px solid ${accent}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grand Total</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: primary, letterSpacing: '0.02em' }}>
                {(DATA.attendance.mbb + DATA.attendance.wbb + DATA.attendance.football).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Data source note ── */}
        <p style={{ textAlign: 'center', fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#94a3b8', marginTop: 8 }}>
          Source: Time & Score Athletics Revenue Report · Peak Sports MGMT · Updated Nov 2024
        </p>

      </div>
    </div>
  )
}
