import React, { useState } from 'react'
import { useSchool } from '../../context/SchoolContext'

// ── West Georgia FY data from Kyle's Time & Score report ─────────────────────
const DATA = {
  fy: [
    { year: 'FY24', total: 321648, goal: 321500, label: 'FY 2023-24' },
    { year: 'FY25', total: 621880, goal: 371500, label: 'FY 2024-25' },
  ],
  categories: [
    { label: 'MFB Ticket Sales',    current: 98995,  goal: 90000,  },
    { label: 'MFB Parking',         current: 32129,  goal: 20000,  },
    { label: 'MFB Premium — Porch', current: 14633,  goal: 15000,  },
    { label: 'Basketball Tickets',  current: 20466,  goal: 30000,  },
    { label: 'Volleyball Tickets',  current: 4691,   goal: 2500,   },
    { label: 'Crowdfunding',        current: 64158,  goal: 150000, },
    { label: 'Corporate Partners',  current: 143200, goal: null,   },
  ],
  footballYoY: [
    { year: '2023', tickets: 13472, revenue: 67084 },
    { year: '2024', tickets: 33569, revenue: 91917 },
  ],
  seasonTickets2025: [
    { type: 'Reserved Season', sold: 1102, revenue: 34805 },
    { type: 'Parking — Lot B', sold: 173,  revenue: 17334 },
    { type: 'Parking — Lot C', sold: 9,    revenue: 669   },
  ],
  gameAttendance: [
    { game: 'Game 1', attendance: 4786 },
    { game: 'Game 2', attendance: 4378 },
    { game: 'Game 3', attendance: 4735 },
    { game: 'Game 4', attendance: 5349 },
    { game: 'Game 5', attendance: 4554 },
  ],
  basketball: [
    { season: '22-23', revenue: 13250 },
    { season: '23-24', revenue: 19786 },
    { season: '24-25', revenue: 20466 },
    { season: '25-26', revenue: 8414, note: 'Season tickets only' },
  ],
  attendance: { mbb: 9340, wbb: 7620, football: 23802 },
}

const fmt     = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n}`
const fmtFull = (n) => `$${n.toLocaleString()}`
const fmtK    = (n) => n >= 1000 ? `${(n/1000).toFixed(0)}k` : `${n}`

const GREEN  = '#16a34a'
const AMBER  = '#d97706'
const RED    = '#dc2626'
const PURPLE = '#7c3aed'
const BORDER = '#E2E8F0'
const BG     = '#F7F9FC'
const TEXT   = '#0F172A'
const MUTED  = '#64748B'
const MONO   = "'Geist Mono', monospace"
const SANS   = "'Geist', sans-serif"
const SYNE   = "'Geist', sans-serif"

const label = (txt) => ({
  fontFamily: MONO, fontSize: 9.5, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED,
})

const categoryColor = (cat) => {
  if (!cat.goal) return '#64748B'
  const pct = cat.current / cat.goal
  if (pct >= 1) return GREEN
  if (pct >= 0.75) return AMBER
  return RED
}

export default function Analytics() {
  const { school } = useSchool()
  const accent  = school.colors.accent
  const primary = school.colors.primary

  const [fyView, setFyView] = useState('revenue')

  const fy25 = DATA.fy[1]
  const fy24 = DATA.fy[0]
  const yoyGrowth  = (((fy25.total - fy24.total) / fy24.total) * 100).toFixed(0)
  const vsGoal     = fy25.total - fy25.goal
  const maxFY      = Math.max(...DATA.fy.map(f => f.total))
  const maxAttend  = Math.max(...DATA.gameAttendance.map(g => g.attendance))
  const maxBball   = Math.max(...DATA.basketball.map(b => b.revenue))
  const maxFbRev   = Math.max(...DATA.footballYoY.map(f => f.revenue))
  const maxFbTix   = Math.max(...DATA.footballYoY.map(f => f.tickets))
  const totalAttend = DATA.attendance.mbb + DATA.attendance.wbb + DATA.attendance.football

  return (
    <div style={{ background: BG, minHeight: '100%', fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .an-card { background:#fff; border-radius:14px; border:1px solid ${BORDER}; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .an-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .an-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .an-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        @media(max-width:640px) {
          .an-grid-2,.an-grid-3,.an-grid-4 { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: primary, padding: '24px 24px 28px' }}>
        <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Analytics · West Georgia · Wolves
        </p>
        <h2 style={{ margin: '0 0 20px', fontFamily: SYNE, fontSize: 'clamp(26px,5vw,38px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Revenue Performance
        </h2>

        {/* Narrative headline */}
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 16 }}>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>
            Revenue grew <strong style={{ color: accent }}>{yoyGrowth}%</strong> year over year, exceeding the FY25 goal by <strong style={{ color: accent }}>{fmtFull(vsGoal)}</strong>. Football ticket sales and corporate partnerships drove the majority of gains.
          </p>
        </div>

        {/* KPI row */}
        <div className="an-grid-3">
          {[
            { label: 'FY25 Total',   value: fmt(fy25.total),  sub: `+${yoyGrowth}% vs FY24`,          subColor: '#4ade80' },
            { label: 'vs Goal',      value: `+${fmt(vsGoal)}`, sub: `Goal: ${fmt(fy25.goal)}`,         subColor: '#4ade80' },
            { label: 'Attn. Total',  value: totalAttend.toLocaleString(), sub: 'All sports combined',  subColor: 'rgba(255,255,255,0.5)' },
          ].map(k => (
            <div key={k.label} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p style={{ margin: '0 0 2px', fontFamily: MONO, fontSize: 8, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.label}</p>
              <p style={{ margin: '0 0 1px', fontFamily: SYNE, fontSize: 24, fontWeight: 800, color: 'white', lineHeight: 1 }}>{k.value}</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 9, color: k.subColor }}>{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px 60px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Year-over-Year */}
        <div className="an-card">
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <p style={label()}>FY24 → FY25</p>
            <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>Year-Over-Year Revenue</h3>
          </div>

          {DATA.fy.map((fy, i) => {
            const pct    = (fy.total / maxFY) * 100
            const isBest = i === DATA.fy.length - 1
            const overGoal = fy.goal && fy.total > fy.goal
            return (
              <div key={fy.year} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: TEXT }}>{fy.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {fy.goal && <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}>/ {fmtFull(fy.goal)} goal</span>}
                    <span style={{ fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: isBest ? GREEN : accent }}>{fmtFull(fy.total)}</span>
                  </div>
                </div>
                <div style={{ height: 12, borderRadius: 6, background: '#F1F5F9', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: isBest ? GREEN : accent, transition: 'width 0.6s ease' }} />
                  {fy.goal && (
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(fy.goal / maxFY) * 100}%`, width: 2, background: 'rgba(0,0,0,0.15)', borderRadius: 2 }} />
                  )}
                </div>
                {overGoal && (
                  <p style={{ margin: '3px 0 0', fontFamily: MONO, fontSize: 8, color: GREEN }}>✓ Over goal by {fmtFull(fy.total - fy.goal)}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Revenue by Category */}
        <div className="an-card">
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <p style={label()}>Current vs Goal</p>
            <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>FY25 Revenue by Category</h3>
          </div>

          {DATA.categories.map(cat => {
            const color = categoryColor(cat)
            const pct   = cat.goal ? Math.min(100, (cat.current / cat.goal) * 100) : 100
            const over  = cat.goal && cat.current > cat.goal
            return (
              <div key={cat.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: SANS }}>{cat.label}</span>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: over ? GREEN : TEXT, fontWeight: 700 }}>{fmtFull(cat.current)}</span>
                    {cat.goal && <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}> / {fmtFull(cat.goal)}</span>}
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: color, transition: 'width 0.6s ease' }} />
                </div>
                {cat.goal && (
                  <p style={{ margin: '3px 0 0', fontFamily: MONO, fontSize: 8, color: MUTED }}>
                    {pct.toFixed(0)}% of goal {over ? <span style={{ color: GREEN }}>✓</span> : ''}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Football ticket sales YoY */}
        <div className="an-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <div>
              <p style={label()}>2023 → 2024</p>
              <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>Football Ticket Sales</h3>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['revenue', 'tickets'].map(v => (
                <button key={v} onClick={() => setFyView(v)} style={{
                  padding: '5px 12px', borderRadius: 6,
                  border: `1px solid ${fyView === v ? accent : BORDER}`,
                  background: fyView === v ? accent : '#fff',
                  color: fyView === v ? '#fff' : MUTED,
                  fontFamily: MONO, fontSize: 9, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {v === 'revenue' ? 'Revenue' : 'Tickets'}
                </button>
              ))}
            </div>
          </div>

          {DATA.footballYoY.map((yr, i) => {
            const val  = fyView === 'revenue' ? yr.revenue : yr.tickets
            const max  = fyView === 'revenue' ? maxFbRev : maxFbTix
            const pct  = (val / max) * 100
            const best = i === DATA.footballYoY.length - 1
            return (
              <div key={yr.year} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: TEXT }}>{yr.year} Season</span>
                  <span style={{ fontFamily: SYNE, fontSize: 20, fontWeight: 800, color: best ? GREEN : accent }}>
                    {fyView === 'revenue' ? fmtFull(val) : `${val.toLocaleString()} tickets`}
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 5, background: best ? GREEN : accent }} />
                </div>
              </div>
            )
          })}

          <div style={{ padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: 4 }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 9, color: GREEN }}>
              2024 saw a 2.5× increase in tickets sold vs 2023 — driven by expanded single-game sales strategy
            </p>
          </div>
        </div>

        {/* Game attendance */}
        <div className="an-card">
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <p style={label()}>2025 Season</p>
            <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>Football Game Attendance</h3>
          </div>

          {DATA.gameAttendance.map(g => {
            const pct    = (g.attendance / maxAttend) * 100
            const isHigh = g.attendance === maxAttend
            return (
              <div key={g.game} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: SANS }}>{g.game}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: isHigh ? GREEN : MUTED, fontWeight: 700 }}>
                    {g.attendance.toLocaleString()}{isHigh ? ' ↑' : ''}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: isHigh ? GREEN : accent }} />
                </div>
              </div>
            )
          })}

          <div className="an-grid-2" style={{ marginTop: 14 }}>
            {[
              { label: 'Avg Attendance', value: Math.round(DATA.gameAttendance.reduce((s,g) => s + g.attendance, 0) / DATA.gameAttendance.length).toLocaleString(), sub: 'Per game' },
              { label: 'Total Gates',    value: DATA.gameAttendance.reduce((s,g) => s + g.attendance, 0).toLocaleString(), sub: '5-game total' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                <p style={{ margin: '0 0 2px', fontFamily: SYNE, fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 9, color: MUTED }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Basketball trend */}
        <div className="an-card">
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <p style={label()}>4-Year Trend</p>
            <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>Basketball Ticket Revenue</h3>
          </div>

          {DATA.basketball.map((yr, i) => {
            const pct  = (yr.revenue / maxBball) * 100
            const last = i === DATA.basketball.length - 1
            return (
              <div key={yr.season} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: TEXT }}>{yr.season}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {yr.note && (
                      <span style={{ fontFamily: MONO, fontSize: 8, color: AMBER, background: '#fef3c7', padding: '1px 6px', borderRadius: 4 }}>{yr.note}</span>
                    )}
                    <span style={{ fontFamily: SYNE, fontSize: 20, fontWeight: 800, color: accent }}>{fmtFull(yr.revenue)}</span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: accent, opacity: last ? 0.5 : 1 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Attendance summary */}
        <div className="an-card">
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${BORDER}` }}>
            <p style={label()}>All Sports</p>
            <h3 style={{ margin: '3px 0 0', fontFamily: SYNE, fontSize: 22, fontWeight: 800, color: TEXT }}>Total Attendance</h3>
          </div>

          <div className="an-grid-3" style={{ marginBottom: 14 }}>
            {[
              { label: 'Football',      value: DATA.attendance.football.toLocaleString(), sub: '5 home games' },
              { label: "Men's Bball",   value: DATA.attendance.mbb.toLocaleString(),      sub: 'Full season'  },
              { label: "Women's Bball", value: DATA.attendance.wbb.toLocaleString(),      sub: 'Full season'  },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                <p style={{ margin: '0 0 2px', fontFamily: SYNE, fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 9, color: MUTED }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 18px', borderRadius: 10, background: `${primary}08`, border: `1px solid ${accent}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grand Total</span>
            <span style={{ fontFamily: SYNE, fontSize: 32, fontWeight: 800, color: primary }}>{totalAttend.toLocaleString()}</span>
          </div>
        </div>

        {/* Source note */}
        <p style={{ textAlign: 'center', fontFamily: MONO, fontSize: 9, color: '#CBD5E1' }}>
          Source: Time & Score Athletics Revenue Report · West Georgia Wolves · Peak Sports MGMT · Updated Nov 2024
        </p>

      </div>
    </div>
  )
}
