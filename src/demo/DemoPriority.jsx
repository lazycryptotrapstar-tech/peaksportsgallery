import React, { useState, useEffect } from 'react'
import { DS } from './DemoConstants'

// ── Demo priority point data ──────────────────────────────────────────────────
const PRIORITY_CONTACTS = [
  { id:'p001', name:'Linda Carter',    tier:'Platinum', points:2840, years:12, giving:1200, packages:4, attendance:8, eligible:'Champions Club · Row A-C',    upgrade:null },
  { id:'p002', name:'David Carter',    tier:'Platinum', points:2720, years:11, giving:1000, packages:4, attendance:7, eligible:'Champions Club · Row A-D',    upgrade:null },
  { id:'p003', name:'Nicole Miller',   tier:'Platinum', points:2580, years:10, giving:900,  packages:3, attendance:8, eligible:'Champions Club · Row A-F',    upgrade:null },
  { id:'p004', name:'James Wilson',    tier:'Platinum', points:2440, years:9,  giving:1100, packages:4, attendance:6, eligible:'Champions Club · Row B',      upgrade:null },
  { id:'p005', name:'Megan Turner',    tier:'Platinum', points:2380, years:10, giving:800,  packages:3, attendance:7, eligible:'Champions Club · Row B-C',    upgrade:null },
  { id:'p006', name:'Robert Harris',   tier:'Gold',     points:1960, years:8,  giving:600,  packages:3, attendance:6, eligible:'Gold Section · Row D-F',      upgrade:'Need 440 pts for Platinum' },
  { id:'p007', name:'Sarah Johnson',   tier:'Gold',     points:1840, years:7,  giving:500,  packages:3, attendance:5, eligible:'Gold Section · Row D-G',      upgrade:'Need 560 pts for Platinum' },
  { id:'p008', name:'Michael Brown',   tier:'Gold',     points:1720, years:6,  giving:600,  packages:2, attendance:6, eligible:'Gold Section · Row E',        upgrade:'Need 680 pts for Platinum' },
  { id:'p009', name:'Jennifer Davis',  tier:'Gold',     points:1680, years:7,  giving:400,  packages:2, attendance:5, eligible:'Gold Section · Row E-F',      upgrade:'Need 720 pts for Platinum' },
  { id:'p010', name:'William Taylor',  tier:'Gold',     points:1560, years:6,  giving:350,  packages:2, attendance:5, eligible:'Gold Section · Row F',        upgrade:'Need 840 pts for Platinum' },
  { id:'p011', name:'Emily Anderson',  tier:'Silver',   points:1080, years:4,  giving:200,  packages:2, attendance:4, eligible:'Silver Section · Row G-H',    upgrade:'Need 320 pts for Gold' },
  { id:'p012', name:'Christopher Lee', tier:'Silver',   points:980,  years:4,  giving:150,  packages:2, attendance:3, eligible:'Silver Section · Row H',      upgrade:'Need 420 pts for Gold' },
  { id:'p013', name:'Amanda Martinez', tier:'Silver',   points:920,  years:3,  giving:200,  packages:2, attendance:4, eligible:'Silver Section · Row H-I',    upgrade:'Need 480 pts for Gold' },
  { id:'p014', name:'Kevin Thompson',  tier:'Silver',   points:860,  years:3,  giving:100,  packages:2, attendance:3, eligible:'Silver Section · Row I',      upgrade:'Need 540 pts for Gold' },
  { id:'p015', name:'Jessica White',   tier:'Silver',   points:800,  years:3,  giving:150,  packages:1, attendance:4, eligible:'Silver Section · Row I-J',    upgrade:'Need 600 pts for Gold' },
  { id:'p016', name:'Brian Jackson',   tier:'Bronze',   points:480,  years:2,  giving:0,    packages:1, attendance:2, eligible:'General Seating · Row J+',    upgrade:'Need 320 pts for Silver' },
  { id:'p017', name:'Ashley Garcia',   tier:'Bronze',   points:420,  years:2,  giving:0,    packages:1, attendance:1, eligible:'General Seating · Row K+',    upgrade:'Need 380 pts for Silver' },
  { id:'p018', name:'Daniel Robinson', tier:'Bronze',   points:380,  years:1,  giving:50,   packages:1, attendance:2, eligible:'General Seating · Row K+',    upgrade:'Need 420 pts for Silver' },
  { id:'p019', name:'Rachel Clark',    tier:'Bronze',   points:320,  years:1,  giving:0,    packages:1, attendance:1, eligible:'General Seating · Row L+',    upgrade:'Need 480 pts for Silver' },
  { id:'p020', name:'Tyler Lewis',     tier:'Bronze',   points:280,  years:1,  giving:0,    packages:1, attendance:1, eligible:'General Seating · Row L+',    upgrade:'Need 520 pts for Silver' },
]

const TIER_CONFIG = {
  Platinum: { color:'#C4882A', bg:'rgba(196,136,42,0.12)', border:'rgba(196,136,42,0.30)', min:2000, label:'Platinum' },
  Gold:     { color:'#B8860B', bg:'rgba(184,134,11,0.10)', border:'rgba(184,134,11,0.25)', min:1400, label:'Gold' },
  Silver:   { color:'#708090', bg:'rgba(112,128,144,0.10)', border:'rgba(112,128,144,0.25)', min:700, label:'Silver' },
  Bronze:   { color:'#8B4513', bg:'rgba(139,69,19,0.10)', border:'rgba(139,69,19,0.20)', min:0, label:'Bronze' },
}

const POINT_CATEGORIES = [
  { key:'years',      label:'Years as STH',         rate:'200 pts/year',  icon:'📅' },
  { key:'giving',     label:'Annual Giving',         rate:'1 pt/$1 given', icon:'💰' },
  { key:'packages',   label:'Ticket Packages',       rate:'100 pts/pkg',   icon:'🎟️' },
  { key:'attendance', label:'Post-Season / Bowls',   rate:'150 pts/event', icon:'🏆' },
]

const calcPoints = ct => ({
  years:      ct.years * 200,
  giving:     ct.giving,
  packages:   ct.packages * 100,
  attendance: ct.attendance * 150,
})

// ── Countdown to renewal window ───────────────────────────────────────────────
function CountdownBadge() {
  const [secs, setSecs] = useState(14 * 86400 + 6 * 3600 + 22 * 60 + 8)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'10px 16px', borderRadius:12,
      background:'rgba(184,28,28,0.08)', border:'1px solid rgba(184,28,28,0.20)',
    }}>
      <div style={{width:8,height:8,borderRadius:'50%',background:DS.red,boxShadow:`0 0 6px ${DS.red}`,flexShrink:0,animation:'tp 1s ease-in-out infinite'}}/>
      <div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.red,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600}}>Priority Renewal Window Opens</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:600,color:DS.text,letterSpacing:'0.04em',marginTop:2}}>
          {d}d {String(h).padStart(2,'0')}h {String(m).padStart(2,'0')}m {String(s).padStart(2,'0')}s
        </div>
      </div>
    </div>
  )
}

// ── Animated bar ──────────────────────────────────────────────────────────────
function PointBar({ value, max, color, delay=0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value/max)*100), 200+delay); return ()=>clearTimeout(t) }, [value])
  return (
    <div style={{height:6,borderRadius:3,background:DS.bg2,overflow:'hidden',flex:1}}>
      <div style={{height:'100%',width:`${w}%`,background:color,borderRadius:3,transition:'width 0.7s cubic-bezier(0.4,0,0.2,1)'}}/>
    </div>
  )
}

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  const colors = {1:'#FFD700',2:'#C0C0C0',3:'#CD7F32'}
  return (
    <div style={{
      width:28,height:28,borderRadius:'50%',flexShrink:0,
      background: rank<=3 ? colors[rank] : DS.bg2,
      border:`1px solid ${rank<=3?colors[rank]:DS.border}`,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
      color: rank<=3 ? (rank===1?'#7A5400':'#555') : DS.text3,
    }}>{rank}</div>
  )
}

export default function DemoPriority() {
  const [selected, setSelected] = useState(null)
  const [filterTier, setFilterTier] = useState('All')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const filtered = filterTier==='All'
    ? PRIORITY_CONTACTS
    : PRIORITY_CONTACTS.filter(c=>c.tier===filterTier)

  const totals = {
    Platinum: PRIORITY_CONTACTS.filter(c=>c.tier==='Platinum').length,
    Gold:     PRIORITY_CONTACTS.filter(c=>c.tier==='Gold').length,
    Silver:   PRIORITY_CONTACTS.filter(c=>c.tier==='Silver').length,
    Bronze:   PRIORITY_CONTACTS.filter(c=>c.tier==='Bronze').length,
  }

  const CARD = {background:DS.card,borderRadius:13,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}
  const LABEL = {fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3}

  return (
    <div style={{padding:'28px 20px 60px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .pp-layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 20px; align-items: start; }
        .pp-list-item { transition: all 0.15s ease; cursor: pointer; }
        .pp-list-item:hover { transform: translateX(2px); box-shadow: 0 4px 14px rgba(28,18,8,0.10) !important; }
        .pp-list-item.active { border-color: ${DS.gold} !important; }
        .pp-tier-filter { display: flex; gap: 6px; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .pp-layout { grid-template-columns: 1fr !important; }
          .pp-detail { position: fixed !important; inset: auto 0 0 0 !important; border-radius: 20px 20px 0 0 !important; z-index: 60; max-height: 80vh; overflow-y: auto; box-shadow: 0 -8px 30px rgba(0,0,0,0.2) !important; animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1); }
          @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
          .pp-kpis { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        marginBottom:20,
        opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',
        transition:'opacity 0.4s ease,transform 0.4s ease',
      }}>
        <div style={{...LABEL,marginBottom:5}}>Priority Points · Midland</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:DS.text,letterSpacing:'-0.025em',lineHeight:1.1}}>Priority Point System</div>
        <div style={{fontSize:13,color:DS.text3,marginTop:3}}>Automated donor tier ranking · Replaces manual spreadsheets</div>
      </div>

      {/* Countdown + KPIs */}
      <div style={{marginBottom:18,opacity:loaded?1:0,transition:'opacity 0.5s ease 0.1s'}}>
        <CountdownBadge/>
      </div>

      <div className="pp-kpis" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:18}}>
        {Object.entries(TIER_CONFIG).map(([tier,cfg],i)=>(
          <div key={tier} style={{
            ...CARD,padding:'13px 15px',position:'relative',overflow:'hidden',
            opacity:loaded?1:0,transform:loaded?'none':'translateY(8px)',
            transition:`opacity 0.35s ease ${i*0.07}s,transform 0.35s ease ${i*0.07}s`,
            cursor:'pointer',
          }} onClick={()=>setFilterTier(filterTier===tier?'All':tier)}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:cfg.color,borderRadius:'3px 0 0 3px'}}/>
            <div style={{...LABEL,color:cfg.color,marginBottom:6}}>{tier}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:600,color:DS.text}}>{totals[tier]}</div>
            <div style={{fontSize:11,color:DS.text3,marginTop:3}}>{tier==='Platinum'?'≥2,000':tier==='Gold'?'1,400–1,999':tier==='Silver'?'700–1,399':'< 700'} pts</div>
          </div>
        ))}
      </div>

      {/* Tier filter */}
      <div className="pp-tier-filter" style={{marginBottom:16}}>
        {['All','Platinum','Gold','Silver','Bronze'].map(t=>{
          const cfg = t==='All' ? null : TIER_CONFIG[t]
          const active = filterTier===t
          return (
            <button key={t} onClick={()=>setFilterTier(t)} style={{
              padding:'6px 14px',borderRadius:20,
              border:`1px solid ${active?(cfg?.color||DS.gold):DS.border}`,
              background:active?(cfg?.bg||DS.goldBg):'transparent',
              color:active?(cfg?.color||DS.gold):DS.text2,
              fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
              cursor:'pointer',transition:'all 0.15s ease',
            }}>{t} {t!=='All'?`(${totals[t]})`:`(${PRIORITY_CONTACTS.length})`}</button>
          )
        })}
      </div>

      <div className="pp-layout">
        {/* Leaderboard */}
        <div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {filtered.map((ct,i)=>{
              const cfg = TIER_CONFIG[ct.tier]
              const active = selected?.id===ct.id
              const maxPts = PRIORITY_CONTACTS[0].points
              return (
                <div key={ct.id}
                  className={`pp-list-item${active?' active':''}`}
                  onClick={()=>setSelected(active?null:ct)}
                  style={{
                    ...CARD,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,
                    borderLeft:`3px solid ${active?DS.gold:'transparent'}`,
                    background:active?DS.goldPale:DS.card,
                    opacity:loaded?1:0,
                    transition:`opacity 0.3s ease ${i*0.03}s,transform 0.15s ease,box-shadow 0.15s ease`,
                  }}>
                  <RankBadge rank={PRIORITY_CONTACTS.indexOf(ct)+1}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:DS.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct.name}</span>
                      <span style={{
                        fontSize:9.5,fontWeight:700,padding:'2px 7px',borderRadius:20,
                        background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`,
                        flexShrink:0,letterSpacing:'0.05em',textTransform:'uppercase',
                      }}>{ct.tier}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <PointBar value={ct.points} max={maxPts} color={cfg.color} delay={i*30}/>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:600,color:cfg.color,flexShrink:0}}>{ct.points.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{flexShrink:0,display:'flex',alignItems:'center'}}>
                    <svg style={{width:14,height:14,color:active?DS.gold:DS.text4,transform:active?'rotate(90deg)':'none',transition:'transform 0.2s ease'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="pp-detail" style={{...CARD,overflow:'hidden'}}>
            {/* Header */}
            <div style={{padding:'16px 18px',background:'#16110C',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:'white',lineHeight:1.2}}>{selected.name}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2,letterSpacing:'0.06em'}}>
                  Rank #{PRIORITY_CONTACTS.indexOf(selected)+1} · {selected.tier}
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',padding:4}}>
                <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{padding:'16px 18px'}}>
              {/* Total points */}
              <div style={{textAlign:'center',padding:'16px 0',marginBottom:16,background:DS.bg,borderRadius:10}}>
                <div style={{...LABEL,marginBottom:6}}>Total Priority Points</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:36,fontWeight:600,color:TIER_CONFIG[selected.tier].color,letterSpacing:'-0.02em',lineHeight:1}}>
                  {selected.points.toLocaleString()}
                </div>
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:5,marginTop:8,
                  fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,letterSpacing:'0.06em',textTransform:'uppercase',
                  background:TIER_CONFIG[selected.tier].bg,color:TIER_CONFIG[selected.tier].color,border:`1px solid ${TIER_CONFIG[selected.tier].border}`,
                }}>{selected.tier} Member</div>
              </div>

              {/* Point breakdown */}
              <div style={{...LABEL,marginBottom:10}}>Point Breakdown</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
                {POINT_CATEGORIES.map((cat,i)=>{
                  const pts = calcPoints(selected)[cat.key]
                  return (
                    <div key={cat.key} style={{
                      display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
                      borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,
                    }}>
                      <span style={{fontSize:16,flexShrink:0}}>{cat.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:DS.text}}>{cat.label}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.text3,marginTop:1}}>{cat.rate}</div>
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:600,color:TIER_CONFIG[selected.tier].color,flexShrink:0}}>+{pts.toLocaleString()}</div>
                    </div>
                  )
                })}
              </div>

              {/* Seat eligibility */}
              <div style={{...LABEL,marginBottom:8}}>Seat Eligibility</div>
              <div style={{padding:'12px 14px',borderRadius:10,background:DS.greenBg,border:'1px solid rgba(10,110,56,0.2)',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <svg style={{width:14,height:14,color:DS.green,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span style={{fontSize:12,fontWeight:600,color:DS.green}}>{selected.eligible}</span>
                </div>
              </div>

              {/* Upgrade path */}
              {selected.upgrade && (
                <div style={{padding:'12px 14px',borderRadius:10,background:DS.amberBg,border:`1px solid rgba(186,118,10,0.2)`,marginBottom:14}}>
                  <div style={{...LABEL,color:DS.amber,marginBottom:3}}>Upgrade Path</div>
                  <div style={{fontSize:12,color:DS.amber,fontWeight:500}}>{selected.upgrade}</div>
                </div>
              )}

              {/* CTA */}
              <button style={{
                width:'100%',padding:'12px',borderRadius:10,border:`1px solid ${DS.gold}`,
                background:'transparent',color:DS.gold,
                fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:'pointer',
                transition:'all 0.15s ease',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background=DS.gold;e.currentTarget.style.color='white'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=DS.gold}}
              >
                Generate Renewal Outreach →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
