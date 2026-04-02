import React, { useState, useEffect } from 'react'
import { DS } from './DemoConstants'

function AnimatedNumber({ value, prefix='', suffix='', duration=1200 }) {
  const [display, setDisplay] = useState('0')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    // Handle non-numeric like "312 hrs"
    const num = parseFloat(value.toString().replace(/[^0-9.]/g, ''))
    if (isNaN(num)) { setDisplay(value); return }
    let start = 0
    const steps = 50
    const inc = num / steps
    const ms = duration / steps
    const timer = setInterval(() => {
      start += inc
      if (start >= num) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        const rounded = num > 100 ? Math.floor(start).toLocaleString() : start.toFixed(0)
        setDisplay(`${prefix}${rounded}${suffix}`)
      }
    }, ms)
    return () => clearInterval(timer)
  }, [visible])

  return <span>{visible ? display : `${prefix}0${suffix}`}</span>
}

function MetricCard({ label, manual, ai, badge, green, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      background: DS.card, borderRadius: 14,
      padding: '20px 20px', border: `1px solid ${DS.borderLight}`,
      boxShadow: DS.shSm,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,marginBottom:14}}>{label}</div>
      <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:DS.text3,textDecoration:'line-through',textDecorationColor:DS.border}}>{manual}</span>
        <span style={{color:DS.text4,fontSize:14}}>→</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:600,color:DS.text,letterSpacing:'-0.025em'}}>
          <AnimatedNumber value={ai}/>
        </span>
      </div>
      <div style={{
        display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,
        marginTop:10,padding:'3px 10px',borderRadius:20,
        background: green ? DS.greenBg : DS.goldPale,
        color: green ? DS.green : DS.gold,
        transition: 'transform 0.2s ease',
      }}>{badge}</div>
    </div>
  )
}

export default function DemoInsights() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const CARD = {background:DS.card,borderRadius:14,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}
  const bars = [64,72,82,88,96,105,112,118]

  const metrics = [
    {label:'Emails Sent',         manual:'420',     ai:'1,840',   badge:'4.4× more',  green:false},
    {label:'Response Rate',       manual:'8%',      ai:'19%',     badge:'+138% lift', green:true},
    {label:'Revenue Generated',   manual:'$28,400', ai:'$97,200', badge:'3.4× more',  green:false},
    {label:'Hours Saved / Season',manual:'—',       ai:'312 hrs', badge:'per season', green:true},
  ]

  return (
    <div style={{padding:'28px 20px 40px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .di-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        @media (max-width: 600px) {
          .di-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display:'flex',alignItems:'flex-end',justifyContent:'space-between',
        marginBottom:24,flexWrap:'wrap',gap:12,
        opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',
        transition:'opacity 0.4s ease,transform 0.4s ease',
      }}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,marginBottom:5}}>Data Insights · Midland</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:DS.text,letterSpacing:'-0.025em',lineHeight:1.1}}>AI vs Manual Outreach</div>
        </div>
        <div style={{fontSize:12,color:DS.text3,textAlign:'right',lineHeight:1.6}}>Same reps, same time period<br/>with and without Simple Genius</div>
      </div>

      {/* Metric cards */}
      <div className="di-grid">
        {metrics.map((m,i)=><MetricCard key={i} {...m} index={i}/>)}
      </div>

      {/* Chart */}
      <div style={{...CARD,padding:'20px 22px'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:DS.text,marginBottom:2}}>Weekly Outreach Volume</div>
        <div style={{fontSize:11.5,color:DS.text3,marginBottom:16}}>Emails sent per week — Manual vs Simple Genius AI</div>

        <div style={{display:'flex',gap:16,marginBottom:16}}>
          {[{bg:DS.bg2,border:`1px solid ${DS.border}`,label:'Manual'},{bg:DS.gold,label:'Simple Genius AI'}].map((l,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:DS.text2}}>
              <div style={{width:8,height:8,borderRadius:2,background:l.bg,border:l.border||'none',flexShrink:0}}/>
              {l.label}
            </div>
          ))}
        </div>

        <div style={{position:'relative',height:140,display:'flex',alignItems:'flex-end',gap:8,paddingBottom:24}}>
          <div style={{position:'absolute',bottom:24,left:0,right:0,height:1,background:DS.borderLight}}/>
          {bars.map((h,i)=>{
            const [barH, setBarH] = useState(0)
            useEffect(()=>{
              const t = setTimeout(()=>setBarH(h), 300+i*60)
              return ()=>clearTimeout(t)
            },[])
            return (
              <div key={i} style={{flex:1,display:'flex',alignItems:'flex-end',gap:2,position:'relative',minWidth:0}}>
                <div style={{flex:1,height:11,borderRadius:'3px 3px 0 0',background:DS.bg2,border:`1px solid ${DS.border}`}}/>
                <div style={{flex:1,height:barH,borderRadius:'3px 3px 0 0',background:DS.gold,transition:'height 0.6s cubic-bezier(0.4,0,0.2,1)'}}/>
                <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',fontSize:9,color:DS.text3,fontFamily:"'JetBrains Mono',monospace",whiteSpace:'nowrap'}}>W{i+1}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
