import React, { useState, useEffect } from 'react'

/* ─── UI tokens — safe to edit ───────────────────────────────────────────── */
const T = {
  bg:      '#F0F7EE',
  surface: '#E4EFE1',
  card:    '#FFFFFF',
  border:  '#C4D8BE',
  text:    '#1A2E18',
  text2:   '#3A5835',
  text3:   '#6A8864',
  bg2:     '#D5E6CF',
  green:   '#2D6E1C',
  greenBg: 'rgba(45,110,28,0.10)',
  amber:   '#B06C10',
  amberBg: 'rgba(176,108,16,0.10)',
  red:     '#C03020',
  gold:    '#9A6C10',
  goldBg:  'rgba(154,108,16,0.08)',
  goldBdr: 'rgba(154,108,16,0.25)',
  shSm:    '0 1px 6px rgba(0,0,0,0.07)',
}

/* ─── Animated number counter ────────────────────────────────────────────── */
function AnimatedNumber({ value, duration=1200 }) {
  const [display, setDisplay] = useState('0')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    const num = parseFloat(value.toString().replace(/[^0-9.]/g, ''))
    if (isNaN(num)) { setDisplay(value); return }
    let start = 0
    const steps = 50
    const inc = num / steps
    const ms = duration / steps
    const timer = setInterval(() => {
      start += inc
      if (start >= num) { setDisplay(value); clearInterval(timer) }
      else {
        const rounded = num > 100 ? Math.floor(start).toLocaleString() : start.toFixed(0)
        setDisplay(rounded)
      }
    }, ms)
    return () => clearInterval(timer)
  }, [visible, value, duration])

  return <span>{visible ? display : '0'}</span>
}

/* ─── Metric card ─────────────────────────────────────────────────────────── */
function MetricCard({ label, manual, ai, badge, green, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div style={{
      background:T.card, borderRadius:14, padding:'20px',
      border:`1px solid ${T.border}`, boxShadow:T.shSm,
      opacity:visible?1:0,
      transform:visible?'translateY(0) scale(1)':'translateY(12px) scale(0.98)',
      transition:'opacity 0.4s ease,transform 0.4s ease',
    }}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,marginBottom:14}}>{label}</div>
      <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.text3,textDecoration:'line-through',textDecorationColor:T.border}}>{manual}</span>
        <span style={{color:T.text3,fontSize:14}}>→</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.text,letterSpacing:'-0.025em'}}>
          <AnimatedNumber value={ai}/>
        </span>
      </div>
      <div style={{
        display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,
        marginTop:10,padding:'3px 10px',borderRadius:20,
        background:green?T.greenBg:T.goldBg,
        color:green?T.green:T.gold,
      }}>{badge}</div>
    </div>
  )
}

/* ─── Animated bar — fixed: no hooks inside .map() ───────────────────────── */
function Bar({ height, index, label }) {
  const [barH, setBarH] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setBarH(height), 300 + index * 60)
    return () => clearTimeout(t)
  }, [height, index])
  return (
    <div style={{flex:1,display:'flex',alignItems:'flex-end',gap:2,position:'relative',minWidth:0}}>
      {/* Manual bar — static height for comparison */}
      <div style={{flex:1,height:18,borderRadius:'3px 3px 0 0',background:T.surface,border:`1px solid ${T.border}`}}/>
      {/* AI bar — animated */}
      <div style={{flex:1,height:barH,borderRadius:'3px 3px 0 0',background:T.green,transition:'height 0.65s cubic-bezier(0.4,0,0.2,1)'}}/>
      <div style={{position:'absolute',bottom:-18,left:'50%',transform:'translateX(-50%)',fontSize:9,color:T.text3,fontFamily:"'JetBrains Mono',monospace",whiteSpace:'nowrap'}}>{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function DemoInsights() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const CARD = {background:T.card,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shSm}

  const metrics = [
    {label:'Emails Sent',          manual:'420',     ai:'1,840',   badge:'4.4× more volume', green:false},
    {label:'Response Rate',        manual:'8%',      ai:'19%',     badge:'+138% lift',        green:true},
    {label:'Revenue Generated',    manual:'$28,400', ai:'$97,200', badge:'3.4× more revenue', green:false},
    {label:'Hours Saved / Season', manual:'—',       ai:'312 hrs', badge:'per season',        green:true},
  ]

  // Bar heights in px — manual bars are rendered at fixed 18px for contrast
  const bars = [
    {h:64,  label:'W1'},
    {h:72,  label:'W2'},
    {h:82,  label:'W3'},
    {h:88,  label:'W4'},
    {h:96,  label:'W5'},
    {h:105, label:'W6'},
    {h:112, label:'W7'},
    {h:118, label:'W8'},
  ]

  // Breakdown rows
  const breakdown = [
    {label:'Ticket Reactivation',  manual:180, ai:820,  pct:78},
    {label:'Sponsorship Outreach', manual:140, ai:620,  pct:69},
    {label:'Alumni Engagement',    manual:60,  ai:280,  pct:82},
    {label:'VIP / Priority',       manual:40,  ai:120,  pct:58},
  ]

  return (
    <div style={{height:'100%',overflowY:'auto',WebkitOverflowScrolling:'touch',background:T.bg}}>
    <div style={{padding:'28px 20px 60px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .di-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
        .di-breakdown{display:grid;grid-template-columns:1fr 80px 80px 100px;gap:10px;align-items:center}
        @media(max-width:640px){
          .di-grid{grid-template-columns:1fr !important}
          .di-breakdown{grid-template-columns:1fr 60px 60px !important}
          .di-hide-mob{display:none !important}
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display:'flex',alignItems:'flex-end',justifyContent:'space-between',
        marginBottom:24,flexWrap:'wrap',gap:12,
        opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',
        transition:'opacity 0.4s ease,transform 0.4s ease',
      }}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,marginBottom:5}}>Data Insights · Peak</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',lineHeight:1.05}}>AI vs Manual Outreach</div>
        </div>
        <div style={{fontSize:12,color:T.text3,textAlign:'right',lineHeight:1.8}}>
          Same reps · Same time period<br/>With and without Simple Genius
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="di-grid">
        {metrics.map((m,i)=><MetricCard key={i} {...m} index={i}/>)}
      </div>

      {/* ── Bar chart ───────────────────────────────────────────────────── */}
      <div style={{...CARD,padding:'22px 24px',marginBottom:16}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:T.text,marginBottom:2}}>Weekly Outreach Volume</div>
        <div style={{fontSize:12,color:T.text3,marginBottom:16}}>Emails sent per week — Manual vs Simple Genius AI</div>

        {/* Legend */}
        <div style={{display:'flex',gap:16,marginBottom:18}}>
          {[
            {bg:T.surface,border:`1px solid ${T.border}`,label:'Manual (avg 18/wk)'},
            {bg:T.green,label:'Simple Genius AI'},
          ].map((l,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:T.text2}}>
              <div style={{width:10,height:10,borderRadius:2,background:l.bg,border:l.border||'none',flexShrink:0}}/>
              {l.label}
            </div>
          ))}
        </div>

        {/* Bars */}
        <div style={{position:'relative',height:160,display:'flex',alignItems:'flex-end',gap:6,paddingBottom:28}}>
          <div style={{position:'absolute',bottom:28,left:0,right:0,height:1,background:T.border}}/>
          {bars.map((b,i)=>(
            <Bar key={i} height={b.h} index={i} label={b.label}/>
          ))}
        </div>
      </div>

      {/* ── Campaign breakdown table ─────────────────────────────────────── */}
      <div style={{...CARD,padding:'22px 24px',overflow:'hidden'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:T.text,marginBottom:2}}>Campaign Breakdown</div>
        <div style={{fontSize:12,color:T.text3,marginBottom:16}}>Emails sent by campaign type — FY25</div>

        {/* Table header */}
        <div className="di-breakdown" style={{padding:'8px 12px',background:T.surface,borderRadius:8,marginBottom:8}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>Campaign</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>Manual</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>AI</div>
          <div className="di-hide-mob" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em'}}>AI Response Rate</div>
        </div>

        {/* Rows */}
        {breakdown.map((row,i)=>(
          <div key={i} className="di-breakdown" style={{
            padding:'11px 12px',
            borderRadius:8,
            background:i%2===0?'transparent':T.bg,
            marginBottom:4,
          }}>
            <div style={{fontSize:13,fontWeight:600,color:T.text}}>{row.label}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.text3}}>{row.manual}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:T.green}}>{row.ai}</div>
            <div className="di-hide-mob" style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{flex:1,height:5,borderRadius:3,background:T.surface,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${row.pct}%`,background:T.green,borderRadius:3}}/>
              </div>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.green,fontWeight:600,flexShrink:0}}>{row.pct}%</span>
            </div>
          </div>
        ))}

        {/* Summary row */}
        <div className="di-breakdown" style={{padding:'12px 14px',borderRadius:8,background:T.greenBg,border:`1px solid rgba(45,110,28,0.2)`,marginTop:10}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.green}}>Total FY25</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.text2,fontWeight:600}}>420</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:T.green}}>1,840</div>
          <div className="di-hide-mob" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.green,fontWeight:600}}>19% avg response</div>
        </div>
      </div>
    </div>
    </div>
  )
}
