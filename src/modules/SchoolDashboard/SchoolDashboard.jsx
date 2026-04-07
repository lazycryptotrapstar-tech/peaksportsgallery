import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useUser } from '../../context/UserContext'

/* ─── Token set ──────────────────────────────────────────────────────────── */
const T = {
  bg:      '#F0F7EE',
  surface: '#E4EFE1',
  card:    '#FFFFFF',
  border:  '#C4D8BE',
  text:    '#1A2E18',
  text2:   '#3A5835',
  text3:   '#6A8864',
  green:   '#2D6E1C',
  greenBg: 'rgba(45,110,28,0.10)',
  amber:   '#B06C10',
  amberBg: 'rgba(176,108,16,0.10)',
  red:     '#C03020',
  gold:    '#9A6C10',
  shSm:    '0 1px 6px rgba(0,0,0,0.07)',
  shMd:    '0 4px 16px rgba(0,0,0,0.10)',
}

/* ─── Module badge ───────────────────────────────────────────────────────── */
const MODULE_LABELS = {
  crm:       { label: 'CRM',      color: T.green },
  priority:  { label: 'Priority', color: T.gold },
  analytics: { label: 'Analytics',color: T.text3 },
  ticketing: { label: 'Ticketing',color: '#1A6A8A' },
  agent:     { label: 'Agent',    color: T.amber },
}

/* ─── Stat tile ──────────────────────────────────────────────────────────── */
function StatTile({ label, value, sub, accent }) {
  return (
    <div style={{flex:1,minWidth:0,padding:'12px 14px',background:T.surface,borderRadius:10,border:`1px solid ${T.border}`}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:accent||T.text,lineHeight:1,marginBottom:2}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:T.text3}}>{sub}</div>}
    </div>
  )
}

/* ─── School client card ─────────────────────────────────────────────────── */
function SchoolCard({ school, stats, onSelect, selected }) {
  const isActive = selected?.id === school.id
  const statusColor = school.tier === 'TOP' ? T.green : school.tier === 'MID' ? T.amber : T.text3

  return (
    <div
      onClick={()=>onSelect(isActive ? null : school)}
      style={{
        background: T.card,
        borderRadius: 14,
        border: `1px solid ${isActive ? T.green : T.border}`,
        boxShadow: isActive ? T.shMd : T.shSm,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        borderLeft: `4px solid ${statusColor}`,
      }}
    >
      {/* Card header */}
      <div style={{padding:'16px 18px 14px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:0}}>
          {/* School avatar */}
          <div style={{width:44,height:44,borderRadius:11,background:T.surface,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
            {school.emoji || '🏫'}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:T.text,lineHeight:1.2}}>{school.name}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.text3,marginTop:2}}>{school.conference} · {school.location}</div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:20,textTransform:'uppercase',letterSpacing:'0.06em',background:statusColor+'15',color:statusColor,border:`1px solid ${statusColor}30`}}>
            {school.tier || 'ACTIVE'}
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3}}>
            {stats?.lastActivity || 'No activity'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'flex',gap:8,padding:'0 18px 14px'}}>
        <StatTile label="Emails Sent"    value={stats?.emailsSent    ?? '—'} accent={T.green}/>
        <StatTile label="Response Rate"  value={stats?.responseRate  ?? '—'} sub={stats?.responseRateSub}  accent={T.amber}/>
        <StatTile label="Revenue"        value={stats?.revenue       ?? '—'} accent={T.gold}/>
      </div>

      {/* Rep + modules row */}
      <div style={{padding:'10px 18px 14px',borderTop:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        {/* Rep */}
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:24,height:24,borderRadius:6,background:T.surface,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:10,color:T.text2}}>
            {school.agent?.name?.[0] || '?'}
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:T.text,lineHeight:1.2}}>{school.agent?.name || 'No rep assigned'}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3}}>{school.agent?.title || ''}</div>
          </div>
        </div>

        {/* Active modules */}
        <div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end'}}>
          {(stats?.modules || []).map(mod => {
            const m = MODULE_LABELS[mod]
            if (!m) return null
            return (
              <span key={mod} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,padding:'2px 6px',borderRadius:4,textTransform:'uppercase',letterSpacing:'0.05em',background:`${m.color}12`,color:m.color,border:`1px solid ${m.color}25`}}>
                {m.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Expanded detail — only when selected */}
      {isActive && (
        <div style={{padding:'14px 18px 16px',borderTop:`1px solid ${T.border}`,background:T.surface}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Sequence Activity</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
            <StatTile label="T1 Sent"  value={stats?.t1Sent  ?? '—'} accent={T.text2}/>
            <StatTile label="T2 Sent"  value={stats?.t2Sent  ?? '—'} accent={T.text2}/>
            <StatTile label="T3 Sent"  value={stats?.t3Sent  ?? '—'} accent={T.text2}/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>Notes</div>
          <div style={{fontSize:12,color:T.text2,lineHeight:1.6,minHeight:32,padding:'8px 10px',background:T.card,borderRadius:8,border:`1px solid ${T.border}`}}>
            {stats?.notes || 'No notes yet.'}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function SchoolDashboard() {
  const { user } = useUser()
  const [schools,  setSchools]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .neq('id', 'demo')   // exclude demo school from client dashboard
        .order('name')

      if (!error && data) setSchools(data)
    } catch (e) {
      console.error('SchoolDashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  // Placeholder stats — will be replaced with real Supabase queries
  // Each school gets a stats object. Swap in real data per school here.
  const getStats = (school) => ({
    emailsSent:    school.id === 'wofford' ? '1,840' : '—',
    responseRate:  school.id === 'wofford' ? '19%'   : '—',
    responseRateSub: school.id === 'wofford' ? '+138% vs manual' : null,
    revenue:       school.id === 'wofford' ? '$97.2k' : '—',
    t1Sent:        school.id === 'wofford' ? '820'   : '—',
    t2Sent:        school.id === 'wofford' ? '640'   : '—',
    t3Sent:        school.id === 'wofford' ? '380'   : '—',
    lastActivity:  school.id === 'wofford' ? 'Today' : 'Not started',
    modules:       school.id === 'wofford' ? ['crm','priority','analytics'] : [],
    notes:         school.id === 'wofford' ? 'Wofford live on CRM. Devin active. Priority points in review.' : '',
  })

  const filtered = schools.filter(s => {
    if (filter === 'active') return getStats(s).emailsSent !== '—'
    if (filter === 'inactive') return getStats(s).emailsSent === '—'
    return true
  })

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:T.bg}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.text3}}>Loading schools…</div>
    </div>
  )

  return (
    <div style={{height:'100%',overflowY:'auto',WebkitOverflowScrolling:'touch',background:T.bg}}>
    <div style={{padding:'28px 24px 80px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.text3,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Peak Sports MGMT</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:6}}>School Dashboard</div>
        <div style={{fontSize:13,color:T.text3}}>Client overview · {schools.length} school{schools.length!==1?'s':''} in portfolio</div>
      </div>

      {/* ── Summary stats ───────────────────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <div style={{background:T.card,borderRadius:13,border:`1px solid ${T.border}`,boxShadow:T.shSm,padding:'14px 16px',borderLeft:`3px solid ${T.green}`}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Total Schools</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.text}}>{schools.length}</div>
        </div>
        <div style={{background:T.card,borderRadius:13,border:`1px solid ${T.border}`,boxShadow:T.shSm,padding:'14px 16px',borderLeft:`3px solid ${T.amber}`}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Active</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.amber}}>{schools.filter(s=>getStats(s).emailsSent!=='—').length}</div>
        </div>
        <div style={{background:T.card,borderRadius:13,border:`1px solid ${T.border}`,boxShadow:T.shSm,padding:'14px 16px',borderLeft:`3px solid ${T.gold}`}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Onboarding</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.gold}}>{schools.filter(s=>getStats(s).emailsSent==='—').length}</div>
        </div>
      </div>

      {/* ── Filter pills ────────────────────────────────────────────────── */}
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {['all','active','inactive'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'5px 14px',borderRadius:20,
            border:`1.5px solid ${filter===f?T.green:T.border}`,
            background:filter===f?T.greenBg:'transparent',
            color:filter===f?T.green:T.text3,
            fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
            cursor:'pointer',transition:'all 0.14s',textTransform:'capitalize',
          }}>{f === 'all' ? `All (${schools.length})` : f === 'active' ? `Active (${schools.filter(s=>getStats(s).emailsSent!=='—').length})` : `Onboarding (${schools.filter(s=>getStats(s).emailsSent==='—').length})`}</button>
        ))}
      </div>

      {/* ── School cards ────────────────────────────────────────────────── */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:T.text3,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
            No schools found
          </div>
        ) : filtered.map(school => (
          <SchoolCard
            key={school.id}
            school={school}
            stats={getStats(school)}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* ── Add school placeholder ───────────────────────────────────────── */}
      <div style={{marginTop:16,padding:'20px',borderRadius:14,border:`2px dashed ${T.border}`,textAlign:'center',cursor:'pointer',transition:'all 0.15s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=T.green}
        onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
      >
        <div style={{fontSize:20,marginBottom:6}}>＋</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:T.text3}}>Add New School</div>
        <div style={{fontSize:11,color:T.text3,marginTop:2}}>Insert a row in Supabase schools table to onboard</div>
      </div>
    </div>
    </div>
  )
}
