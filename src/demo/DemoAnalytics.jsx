import React, { useState, useEffect, useRef } from 'react'
import { DS } from './DemoConstants'

/* ─── Local dark tokens — matches Priority / CRM / Sales color system ───────── */
const T = {
  bg:      '#060C1A',
  surface: '#0A1220',
  card:    '#0F1829',
  border:  '#1C2840',
  text:    '#EAF0FF',
  text2:   '#B8C0D4',
  text3:   '#8892AA',
  bg2:     '#162035',
  green:   '#4D9828',
  greenBg: 'rgba(77,152,40,0.12)',
  red:     '#E05252',
  redBg:   'rgba(224,82,82,0.12)',
  amber:   '#EFA020',
  amberBg: 'rgba(239,160,32,0.12)',
  blue:    '#00AACC',
  gold:    '#EFA020',
  goldBg:  'rgba(239,160,32,0.10)',
  goldBdr: 'rgba(239,160,32,0.30)',
  shSm:    '0 1px 4px rgba(0,0,0,0.3)',
}

// Animated counter hook
function useCountUp(target, duration=1200, trigger=true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const steps = 60
    const inc = target / steps
    const ms = duration / steps
    const timer = setInterval(() => {
      start += inc
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, ms)
    return () => clearInterval(timer)
  }, [target, trigger])
  return val
}

function AnimatedBar({ pct, color, delay=0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div style={{height:8,borderRadius:4,background:T.bg2,overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${width}%`,background:color,borderRadius:4,transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)'}}/>
    </div>
  )
}

function KPICard({ label, value, delta, accent, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{
      background:T.card, borderRadius:13, padding:'15px 17px',
      border:`1px solid ${T.border}`,
      boxShadow:T.shSm,
      position:'relative', overflow:'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition:'opacity 0.35s ease, transform 0.35s ease',
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:accent,borderRadius:'3px 0 0 3px'}}/>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:600,color:T.text,lineHeight:1,letterSpacing:'-0.02em',marginBottom:5}}>{value}</div>
      <div style={{fontSize:11,color:accent,fontWeight:600}}>{delta}</div>
    </div>
    </div>
  )
}

export default function DemoAnalytics() {
  const [period, setPeriod] = useState('FY25')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t) }, [])

  const CARD = {background:T.card,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shSm}

  const kpis = [
    {label:'Total Revenue FY25', value:'$621,880', delta:'+$250k vs goal', accent:T.gold},
    {label:'Football Tickets',   value:'33,569',   delta:'+149% YoY',      accent:T.green},
    {label:'Total Attendance',   value:'40,762',   delta:'All sports FY25', accent:T.blue},
    {label:'AI Emails Drafted',  value:'1,840',    delta:'vs 420 manual',  accent:T.amber},
  ]

  const categories = [
    {label:'Ticket Sales',       fy25:248600, goal:180000},
    {label:'Corporate Sponsors', fy25:184200, goal:140000},
    {label:'Hospitality / VIP',  fy25:96400,  goal:60000},
    {label:'Alumni / Donations', fy25:58200,  goal:40000},
    {label:'Camps & Clinics',    fy25:34480,  goal:20000},
  ]
  const maxVal = Math.max(...categories.map(c=>Math.max(c.fy25,c.goal)))

  const fbGames = [
    {opp:'Eastfield Bears',att:5840,rev:38200,won:true},
    {opp:'Northgate Lions',att:6120,rev:42800,won:true},
    {opp:'Riverside Hawks ★',att:7200,rev:56400,won:false},
    {opp:'Franklin Eagles', att:5300,rev:35100,won:true},
    {opp:'Central Cougars', att:5640,rev:37800,won:true},
    {opp:'Valley Storm',    att:3480,rev:24200,won:false},
  ]

  return (
    <div style={{height:'100%',overflowY:'auto',WebkitOverflowScrolling:'touch',background:T.bg}}>
    <div style={{padding:'28px 20px 40px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .da-kpis { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 11px; margin-bottom: 20px; }
        .da-game-grid { display: grid; grid-template-columns: 1fr 90px 100px 52px; gap: 10px; padding: 10px 14px; }
        .da-game-head { display: grid; grid-template-columns: 1fr 90px 100px 52px; gap: 10px; padding: 8px 14px; }
        @media (max-width: 768px) {
          .da-kpis { grid-template-columns: 1fr 1fr !important; }
          .da-game-grid { grid-template-columns: 1fr 70px 52px !important; }
          .da-game-head { grid-template-columns: 1fr 70px 52px !important; }
          .da-hide-mob { display: none !important; }
          .da-period { flex-wrap: wrap; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display:'flex',alignItems:'flex-start',justifyContent:'space-between',
        marginBottom:24,flexWrap:'wrap',gap:12,
        opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',
        transition:'opacity 0.4s ease,transform 0.4s ease',
      }}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,marginBottom:5}}>Performance · Midland</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:T.text,letterSpacing:'-0.025em',lineHeight:1.1}}>Revenue Analytics</div>
        </div>
        <div className="da-period" style={{display:'flex',gap:6}}>
          {['FY23','FY24','FY25'].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{
              padding:'7px 14px',borderRadius:8,
              border:`1px solid ${period===p?T.gold:T.border}`,
              background:period===p?T.gold:T.card,
              color:period===p?'white':T.text2,
              fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',
              transition:'all 0.18s ease',
              transform:period===p?'scale(1.02)':'scale(1)',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="da-kpis">
        {kpis.map((k,i)=><KPICard key={i} {...k} index={i}/>)}
      </div>

      {/* Revenue by category */}
      <div style={{...CARD,padding:'20px 22px',marginBottom:16}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:T.text,marginBottom:2}}>Revenue by Category</div>
        <div style={{fontSize:11.5,color:T.text3,marginBottom:18}}>FY25 actual vs goal</div>
        {categories.map((c,i)=>(
          <div key={i} style={{marginBottom:14,opacity:loaded?1:0,transform:loaded?'none':'translateX(-8px)',transition:`opacity 0.4s ease ${i*0.08}s,transform 0.4s ease ${i*0.08}s`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:12.5,fontWeight:600,color:T.text}}>{c.label}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.gold,fontWeight:600}}>${(c.fy25/1000).toFixed(0)}k</span>
            </div>
            <AnimatedBar pct={(c.fy25/maxVal)*100} color={T.gold} delay={i*80}/>
            <div style={{fontSize:10.5,color:T.text3,marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>
              Goal: ${(c.goal/1000).toFixed(0)}k · {Math.round((c.fy25/c.goal)*100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Football breakdown */}
      <div style={{...CARD,padding:'20px 0',overflow:'hidden'}}>
        <div style={{padding:'0 20px 14px'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:T.text,marginBottom:2}}>Football Game Breakdown</div>
          <div style={{fontSize:11.5,color:T.text3}}>★ Rivalry game</div>
        </div>
        <div className="da-game-head" style={{borderBottom:`1px solid ${T.border}`,background:T.bg}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>Opponent</div>
          <div className="da-hide-mob" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>Attendance</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>Revenue</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>W/L</div>
        </div>
        {fbGames.map((g,i)=>(
          <div key={i} className="da-game-grid" style={{
            borderBottom:`1px solid ${T.border}`,
            background:i%2===0?'transparent':T.bg,
            opacity:loaded?1:0,
            transition:`opacity 0.35s ease ${0.3+i*0.05}s`,
          }}>
            <div style={{fontSize:13,fontWeight:600,color:T.text,alignSelf:'center'}}>{g.opp}</div>
            <div className="da-hide-mob" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.text2,alignSelf:'center'}}>{g.att.toLocaleString()}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.gold,fontWeight:600,alignSelf:'center'}}>${(g.rev/1000).toFixed(1)}k</div>
            <div style={{alignSelf:'center'}}>
              <span style={{display:'inline-flex',alignItems:'center',height:22,padding:'0 8px',borderRadius:20,background:g.won?T.greenBg:T.redBg,color:g.won?T.green:T.red,fontSize:10.5,fontWeight:700}}>{g.won?'W':'L'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}
