import React, { useState, useEffect } from 'react'

/* ─── Local prestige tokens — dark, high-contrast ────────────────────────── */
const T = {
  bg:      '#F0F7EE',
  surface: '#E4EFE1',
  card:    '#FFFFFF',
  border:  '#C4D8BE',
  border2: '#C4D8BE',
  text:    '#1A2E18',
  text2:   '#3A5835',
  text3:   '#6A8864',
  bg2:     '#D5E6CF',   // bar track
  green:   '#2D6E1C',
  greenBg: 'rgba(45,110,28,0.10)',
  amber:   '#B06C10',
  amberBg: 'rgba(176,108,16,0.10)',
  red:     '#C03020',
  redBg:   'rgba(192,48,32,0.10)',
}

/* ─── Tier config — each tier now has distinct prestige treatment ─────────── */
const TIER_CONFIG = {
  Platinum: {
    // Bright warm gold — max contrast on dark gradient
    color:     '#9A7010',
    dimColor:  '#7A5808',
    cardBg:    'linear-gradient(135deg,#FFFCF0,#FFF8E0)',
    border:    '#C4D8BE',
    leftBar:   '#B89030',
    shadow:    '0 2px 12px rgba(180,148,32,0.12)',
    numColor:  '#8A6008',
    badgeBg:   'rgba(180,148,32,0.10)',
    badgeBdr:  'rgba(180,148,32,0.32)',
    icon:      '✦',
    min:2000, next:null,    label:'Platinum',
  },
  Gold: {
    color:     '#885808',
    dimColor:  '#6A4408',
    cardBg:    '#FEFFF8',
    border:    '#C4D8BE',
    leftBar:   '#A07818',
    shadow:    '0 1px 8px rgba(150,118,24,0.08)',
    numColor:  '#784F05',
    badgeBg:   'rgba(150,118,24,0.10)',
    badgeBdr:  'rgba(150,118,24,0.26)',
    icon:      '◆',
    min:1400, next:2000,    label:'Gold',
  },
  Silver: {
    color:     '#3A5870',
    dimColor:  '#2A4860',
    cardBg:    '#FFFFFF',
    border:    '#C4D8BE',
    leftBar:   '#5A7898',
    shadow:    'none',
    numColor:  '#2A4858',
    badgeBg:   'rgba(70,110,150,0.10)',
    badgeBdr:  'rgba(70,110,150,0.24)',
    icon:      '●',
    min:700,  next:1400,    label:'Silver',
  },
  Bronze: {
    color:     '#7A4418',
    dimColor:  '#622E0A',
    cardBg:    '#FFFFFF',
    border:    '#C4D8BE',
    leftBar:   '#9A5825',
    shadow:    'none',
    numColor:  '#6A3A10',
    badgeBg:   'rgba(140,80,35,0.10)',
    badgeBdr:  'rgba(140,80,35,0.24)',
    icon:      '○',
    min:0,    next:700,     label:'Bronze',
  },
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
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

const POINT_CATEGORIES = [
  { key:'years',      label:'Years as STH',       rate:'200 pts/year',  icon:'📅' },
  { key:'giving',     label:'Annual Giving',       rate:'1 pt per $1',   icon:'💰' },
  { key:'packages',   label:'Ticket Packages',     rate:'100 pts/pkg',   icon:'🎟️' },
  { key:'attendance', label:'Post-Season / Bowls', rate:'150 pts/event', icon:'🏆' },
]

const calcPoints = ct => ({
  years:      ct.years * 200,
  giving:     ct.giving,
  packages:   ct.packages * 100,
  attendance: ct.attendance * 150,
})

/* ─── Near-upgrade logic ─────────────────────────────────────────────────── */
const NEAR_THRESHOLD = 350
const nearUpgrade = ct => {
  const cfg = TIER_CONFIG[ct.tier]
  return cfg.next ? (cfg.next - ct.points) <= NEAR_THRESHOLD : false
}

const upgradeActions = ct => {
  const cfg = TIER_CONFIG[ct.tier]
  if(!cfg.next) return []
  const gap = cfg.next - ct.points
  return [
    { action:'Add Annual Giving',         label:`Give $${Math.ceil(gap*0.4)} = ${Math.ceil(gap*0.4)} pts` },
    { action:'Add Ticket Package',        label:'+1 pkg = 100 pts' },
    { action:'Attend Post-Season Event',  label:'+1 event = 150 pts' },
  ]
}

/* ─── Countdown ──────────────────────────────────────────────────────────── */
function CountdownBadge() {
  const [secs, setSecs] = useState(14*86400 + 6*3600 + 22*60 + 8)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s-1 : 0), 1000)
    return () => clearInterval(t)
  }, [])
  const d=Math.floor(secs/86400), h=Math.floor((secs%86400)/3600)
  const m=Math.floor((secs%3600)/60), s=secs%60
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderRadius:12,background:T.redBg,border:`1px solid ${T.red}38`}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:T.red,boxShadow:`0 0 6px ${T.red}`,flexShrink:0,animation:'ppPulse 1s ease-in-out infinite'}}/>
      <div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.red,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600}}>Priority Renewal Window Opens</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:600,color:T.text,letterSpacing:'0.04em',marginTop:2}}>
          {d}d {String(h).padStart(2,'0')}h {String(m).padStart(2,'0')}m {String(s).padStart(2,'0')}s
        </div>
      </div>
    </div>
  )
}

/* ─── Animated bar ───────────────────────────────────────────────────────── */
function PointBar({ value, max, color, height=6, delay=0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW((value/max)*100), 200+delay)
    return () => clearTimeout(t)
  }, [value, max])
  return (
    <div style={{height,borderRadius:height/2,background:T.bg2,overflow:'hidden',flex:1}}>
      <div style={{height:'100%',width:`${w}%`,background:color,borderRadius:height/2,transition:'width 0.75s cubic-bezier(0.4,0,0.2,1)'}}/>
    </div>
  )
}

/* ─── Tier progress bar ──────────────────────────────────────────────────── */
function TierProgressBar({ contact }) {
  const cfg = TIER_CONFIG[contact.tier]
  const [w, setW] = useState(0)
  useEffect(() => {
    const range = cfg.next ? cfg.next - cfg.min : contact.points - cfg.min
    const pos   = contact.points - cfg.min
    const t = setTimeout(() => setW(Math.min(100,(pos/range)*100)), 300)
    return () => clearTimeout(t)
  }, [contact])
  const gap = cfg.next ? cfg.next - contact.points : 0
  const nextLabel = cfg.next ? Object.keys(TIER_CONFIG).find(k=>TIER_CONFIG[k].min===cfg.next) : null

  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:6}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}}>Tier Progress</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:cfg.color,fontWeight:600}}>
            {nextLabel ? `${gap.toLocaleString()} pts to ${nextLabel}` : '🏆 Top Tier'}
          </div>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.text3}}>
          {cfg.min.toLocaleString()} → {cfg.next ? cfg.next.toLocaleString() : '★'}
        </div>
      </div>
      <div style={{height:8,borderRadius:4,background:T.bg2,overflow:'hidden',position:'relative'}}>
        <div style={{
          height:'100%',width:`${w}%`,
          background:`linear-gradient(90deg,${cfg.dimColor}99,${cfg.numColor})`,
          borderRadius:4,transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)',position:'relative',
        }}>
          <div style={{position:'absolute',right:0,top:'50%',transform:'translate(50%,-50%)',width:12,height:12,borderRadius:'50%',background:cfg.numColor,border:`2px solid ${T.card}`,boxShadow:`0 0 0 2px ${cfg.numColor}55`}}/>
        </div>
      </div>
    </div>
  )
}

/* ─── Rank badge ─────────────────────────────────────────────────────────── */
function RankBadge({ rank }) {
  const m = {1:'#FFD700',2:'#C0C0C0',3:'#CD7F32'}
  return (
    <div style={{
      width:26,height:26,borderRadius:'50%',flexShrink:0,
      background: rank<=3 ? m[rank] : T.bg2,
      border:`1px solid ${rank<=3?m[rank]:T.border}`,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
      color: rank<=3 ? (rank===1?'#7A5400':'#555') : T.text3,
    }}>{rank}</div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function DemoPriority() {
  const [selected,   setSelected]   = useState(null)
  const [filterTier, setFilterTier] = useState('All')
  const [loaded,     setLoaded]     = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const filtered = filterTier==='Near Upgrade'
    ? PRIORITY_CONTACTS.filter(nearUpgrade)
    : filterTier==='All'
      ? PRIORITY_CONTACTS
      : PRIORITY_CONTACTS.filter(c=>c.tier===filterTier)

  const totals = {
    Platinum: PRIORITY_CONTACTS.filter(c=>c.tier==='Platinum').length,
    Gold:     PRIORITY_CONTACTS.filter(c=>c.tier==='Gold').length,
    Silver:   PRIORITY_CONTACTS.filter(c=>c.tier==='Silver').length,
    Bronze:   PRIORITY_CONTACTS.filter(c=>c.tier==='Bronze').length,
  }
  const nearCount = PRIORITY_CONTACTS.filter(nearUpgrade).length
  const totalPts  = PRIORITY_CONTACTS.reduce((s,c)=>s+c.points,0)
  const avgPts    = Math.round(totalPts / PRIORITY_CONTACTS.length)

  return (
    <div style={{height:'100%',overflowY:'auto',WebkitOverflowScrolling:'touch',background:T.bg}}>
    <div style={{padding:'24px 18px 80px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @keyframes ppPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(1.3)}}
        @keyframes ppSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .pp-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start}
        .pp-list-item{transition:all 0.15s ease;cursor:pointer}
        .pp-list-item:hover{transform:translateX(2px)}
        .pp-tier-filter{display:flex;gap:6px;flex-wrap:wrap}
        @media(max-width:768px){
          .pp-layout{grid-template-columns:1fr !important}
          .pp-detail{position:fixed !important;inset:auto 0 0 0 !important;border-radius:20px 20px 0 0 !important;z-index:60;max-height:82vh;overflow-y:auto;box-shadow:0 -8px 30px rgba(0,0,0,0.5) !important;animation:ppSlideUp 0.3s cubic-bezier(0.4,0,0.2,1)}
          .pp-kpis{grid-template-columns:1fr 1fr !important}
        }
      `}</style>

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div style={{marginBottom:18,opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',transition:'opacity 0.4s,transform 0.4s'}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.text3,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Priority Points · Peak</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:4}}>Priority Point System</div>
        <div style={{fontSize:13,color:T.text3}}>Automated donor tier ranking · Replaces manual spreadsheets</div>
      </div>

      {/* Countdown */}
      <div style={{marginBottom:16,opacity:loaded?1:0,transition:'opacity 0.5s ease 0.1s'}}>
        <CountdownBadge/>
      </div>

      {/* ══ KPI cards — tier-colored with opaque prestige palette ═══════════ */}
      <div className="pp-kpis" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:10}}>
        {Object.entries(TIER_CONFIG).map(([tier,cfg],i)=>(
          <div key={tier}
            onClick={()=>setFilterTier(filterTier===tier?'All':tier)}
            style={{
              background: filterTier===tier ? cfg.cardBg : T.card,
              borderRadius:12,
              border:`1px solid ${filterTier===tier ? cfg.border : T.border}`,
              borderLeft:`3px solid ${cfg.leftBar}`,
              boxShadow: filterTier===tier ? cfg.shadow : 'none',
              padding:'12px 14px',
              opacity:loaded?1:0,transform:loaded?'none':'translateY(8px)',
              transition:`opacity 0.35s ease ${i*0.07}s,transform 0.35s ease ${i*0.07}s,background 0.2s,border 0.2s`,
              cursor:'pointer',
            }}>
            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:6}}>
              <span style={{fontSize:10,color:cfg.color}}>{cfg.icon}</span>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:cfg.color,letterSpacing:'0.08em',textTransform:'uppercase'}}>{tier}</div>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:700,color:cfg.numColor,lineHeight:1,marginBottom:4}}>{totals[tier]}</div>
            <div style={{fontSize:10,color:T.text3}}>{tier==='Platinum'?'≥2,000':tier==='Gold'?'1,400–1,999':tier==='Silver'?'700–1,399':'< 700'} pts</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:T.amber,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:2}}>Near Upgrade</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:T.amber}}>{nearCount} contacts</div>
          </div>
          <div style={{marginLeft:'auto',fontSize:11,color:T.text3}}>within {NEAR_THRESHOLD} pts</div>
        </div>
        <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:TIER_CONFIG.Gold.numColor,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:2}}>Avg Points</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:T.text}}>{avgPts.toLocaleString()}</div>
          </div>
          <div style={{marginLeft:'auto',fontSize:11,color:T.text3}}>{totalPts.toLocaleString()} total</div>
        </div>
      </div>

      {/* ══ Filter pills ════════════════════════════════════════════════════ */}
      <div className="pp-tier-filter" style={{marginBottom:16}}>
        {['All','Platinum','Gold','Silver','Bronze'].map(t=>{
          const cfg  = t==='All' ? null : TIER_CONFIG[t]
          const active = filterTier===t
          return(
            <button key={t} onClick={()=>setFilterTier(t)} style={{
              padding:'5px 13px',borderRadius:20,
              border:`1.5px solid ${active?(cfg?.leftBar||T.amber):T.border}`,
              background:active?(cfg?.badgeBg||`${T.amber}15`):'transparent',
              color:active?(cfg?.color||T.amber):T.text3,
              fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
              cursor:'pointer',transition:'all 0.14s',
            }}>{t} {t!=='All'?`(${totals[t]})`:`(${PRIORITY_CONTACTS.length})`}</button>
          )
        })}
        <button onClick={()=>setFilterTier(filterTier==='Near Upgrade'?'All':'Near Upgrade')} style={{
          padding:'5px 13px',borderRadius:20,display:'flex',alignItems:'center',gap:5,
          border:`1.5px solid ${filterTier==='Near Upgrade'?T.amber:T.border}`,
          background:filterTier==='Near Upgrade'?T.amberBg:'transparent',
          color:filterTier==='Near Upgrade'?T.amber:T.text3,
          fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
          cursor:'pointer',transition:'all 0.14s',
        }}>⬆ Near Upgrade ({nearCount})</button>
      </div>

      {/* ══ Main layout ═════════════════════════════════════════════════════ */}
      <div className="pp-layout">

        {/* ── Leaderboard ─────────────────────────────────────────────────── */}
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>
            {filtered.length} members{filterTier!=='All'?` · ${filterTier}`:''}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {filtered.map((ct,i)=>{
              const cfg    = TIER_CONFIG[ct.tier]
              const active = selected?.id===ct.id
              const maxPts = PRIORITY_CONTACTS[0].points
              const near   = nearUpgrade(ct)
              const rank   = PRIORITY_CONTACTS.indexOf(ct)+1
              const isPremium = ct.tier==='Platinum' || ct.tier==='Gold'

              return(
                <div key={ct.id}
                  className={`pp-list-item${active?' active':''}`}
                  onClick={()=>setSelected(active?null:ct)}
                  style={{
                    borderRadius:12,overflow:'hidden',
                    background: T.card,
                    border:`1px solid ${active ? cfg.border : isPremium ? cfg.border : T.border}`,
                    borderLeft:`${isPremium?'4px':'3px'} solid ${near ? T.amber : cfg.leftBar}`,
                    boxShadow: active ? cfg.shadow : isPremium ? cfg.shadow : 'none',
                    opacity:loaded?1:0,
                    transition:`opacity 0.3s ease ${i*0.03}s,transform 0.15s ease,box-shadow 0.15s ease`,
                  }}>
                  <div style={{padding:'12px 12px 12px 11px',display:'flex',alignItems:'center',gap:11}}>
                    <RankBadge rank={rank}/>

                    {/* Tier avatar — premium tiers get distinct treatment */}
                    <div style={{
                      width:38,height:38,borderRadius:10,flexShrink:0,
                      background: cfg.badgeBg,
                      border:`1.5px solid ${cfg.badgeBdr}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:12,
                      color: cfg.numColor,
                      boxShadow: isPremium ? `0 0 12px ${cfg.dimColor}30` : 'none',
                    }}>
                      {ct.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                    </div>

                    <div style={{flex:1,minWidth:0}}>
                      {/* Name row */}
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4,flexWrap:'wrap'}}>
                        <span style={{
                          fontSize:13,fontWeight:700,
                          color: isPremium ? cfg.numColor : T.text,
                          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                        }}>{ct.name}</span>
                        {/* Tier badge */}
                        <span style={{
                          fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:20,letterSpacing:'0.06em',
                          textTransform:'uppercase',flexShrink:0,
                          background:cfg.badgeBg,color:cfg.color,border:`1px solid ${cfg.badgeBdr}`,
                        }}>{cfg.icon} {ct.tier}</span>
                        {near&&<span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:20,background:T.amberBg,color:T.amber,border:`1px solid ${T.amber}40`,flexShrink:0}}>⬆ Near Upgrade</span>}
                      </div>

                      {/* Point bar */}
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <PointBar value={ct.points} max={maxPts} color={cfg.numColor} delay={i*30}/>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:cfg.numColor,flexShrink:0,textShadow:isPremium?`0 0 8px ${cfg.numColor}60`:'none'}}>
                          {ct.points.toLocaleString()}
                        </span>
                      </div>

                      {/* Data chips */}
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        {[
                          `📅 ${ct.years}yr`,
                          ct.giving>0 ? `💰 $${ct.giving.toLocaleString()}` : null,
                          `🎟 ${ct.packages} pkg`,
                          `🏆 ${ct.attendance} events`,
                        ].filter(Boolean).map((chip,ci)=>(
                          <span key={ci} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,background:T.surface,border:`1px solid ${T.border2}`,borderRadius:4,padding:'1px 6px'}}>{chip}</span>
                        ))}
                      </div>
                    </div>

                    <svg style={{width:13,height:13,color:active?cfg.color:T.text3,transform:active?'rotate(90deg)':'none',transition:'transform 0.2s',flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Detail panel ────────────────────────────────────────────────── */}
        {selected&&(()=>{
          const cfg = TIER_CONFIG[selected.tier]
          const isPremium = selected.tier==='Platinum' || selected.tier==='Gold'
          const initials = selected.name.split(' ').map(n=>n[0]).slice(0,2).join('')
          return(
            <div className="pp-detail" style={{background:T.card,borderRadius:13,border:`1px solid ${T.border}`,overflow:'hidden',position:'sticky',top:16}}>
              {/* Header — tier-gradient for premium */}
              <div style={{
                padding:'18px 18px',
                background: T.surface,
                borderBottom:`1px solid ${isPremium ? cfg.border : T.border}`,
                display:'flex',alignItems:'center',justifyContent:'space-between',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{
                    width:44,height:44,borderRadius:11,flexShrink:0,
                    background:cfg.badgeBg,border:`1.5px solid ${cfg.badgeBdr}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:15,color:cfg.numColor,
                    boxShadow:isPremium?`0 0 16px ${cfg.dimColor}40`:'none',
                  }}>{initials}</div>
                  <div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:15,color:T.text,lineHeight:1.2}}>{selected.name}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,marginTop:2,letterSpacing:'0.06em'}}>
                      Rank #{PRIORITY_CONTACTS.indexOf(selected)+1} · {selected.tier}
                    </div>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:T.surface,border:'none',cursor:'pointer',color:T.text2,display:'flex',alignItems:'center',justifyContent:'center',padding:7,borderRadius:7}}>
                  <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div style={{padding:'16px 18px'}}>
                {/* Total points hero */}
                <div style={{
                  textAlign:'center',padding:'16px 0 18px',marginBottom:14,
                  background: T.surface,
                  borderRadius:10,border:`1px solid ${isPremium ? cfg.border : T.border}`,
                }}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:6}}>Total Priority Points</div>
                  <div style={{
                    fontFamily:"'JetBrains Mono',monospace",fontSize:44,fontWeight:700,
                    color:cfg.numColor,letterSpacing:'-0.02em',lineHeight:1,
                    textShadow: isPremium ? `0 0 24px ${cfg.numColor}50` : 'none',
                  }}>
                    {selected.points.toLocaleString()}
                  </div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:10,fontSize:10,fontWeight:700,padding:'4px 12px',borderRadius:20,letterSpacing:'0.07em',textTransform:'uppercase',background:cfg.badgeBg,color:cfg.color,border:`1px solid ${cfg.badgeBdr}`}}>
                    {cfg.icon} {selected.tier} Member
                  </div>
                </div>

                {/* Tier progress */}
                <TierProgressBar contact={selected}/>

                {/* Point breakdown */}
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,marginBottom:10}}>Point Breakdown</div>
                <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
                  {POINT_CATEGORIES.map((cat,i)=>{
                    const pts = calcPoints(selected)[cat.key]
                    const pct = selected.points>0 ? Math.round((pts/selected.points)*100) : 0
                    return(
                      <div key={cat.key} style={{padding:'10px 12px',borderRadius:9,background:T.surface,border:`1px solid ${T.border2}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{fontSize:14,flexShrink:0}}>{cat.icon}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:600,color:T.text}}>{cat.label}</div>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,marginTop:1}}>{cat.rate}</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:cfg.numColor}}>+{pts.toLocaleString()}</div>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3}}>{pct}%</div>
                          </div>
                        </div>
                        <PointBar value={pts} max={selected.points} color={cfg.numColor} height={4} delay={i*80}/>
                      </div>
                    )
                  })}
                </div>

                {/* Seat eligibility */}
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,marginBottom:8}}>Seat Eligibility</div>
                <div style={{padding:'11px 14px',borderRadius:10,background:T.greenBg,border:'1px solid rgba(74,152,40,0.25)',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <svg style={{width:13,height:13,color:T.green,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span style={{fontSize:12,fontWeight:600,color:T.green}}>{selected.eligible}</span>
                  </div>
                </div>

                {/* Upgrade path */}
                {selected.upgrade&&(
                  <div style={{padding:'12px 14px',borderRadius:10,background:T.amberBg,border:`1px solid ${T.amber}30`,marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:700,letterSpacing:'0.09em',textTransform:'uppercase',color:T.amber}}>Upgrade Path</div>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.amber,fontWeight:700}}>{selected.upgrade}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5}}>
                      {upgradeActions(selected).map((a,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 9px',borderRadius:7,background:T.card,border:`1px solid ${T.border}`}}>
                          <span style={{fontSize:11,color:T.text2}}>{a.action}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.amber,fontWeight:600}}>{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )
        })()}
      </div>
    </div>
    </div>
  )
}
