// DemoInsights.jsx
import React from 'react'
import { DS } from './DemoApp'

export default function DemoInsights() {
  const INNER = {padding:'34px 38px',maxWidth:1080}
  const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,fontFamily:"'JetBrains Mono',monospace"}
  const CARD  = {background:DS.card,borderRadius:14,padding:'21px 22px',border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm,transition:'all 0.18s ease'}
  const bars  = [64,72,82,88,96,105,112,118]

  const metrics = [
    {label:'Emails Sent',     manual:'420',     ai:'1,840',   badge:'4.4× more',   green:false},
    {label:'Response Rate',   manual:'8%',      ai:'19%',     badge:'+138% lift',  green:true},
    {label:'Revenue Generated',manual:'$28,400',ai:'$97,200', badge:'3.4× more',   green:false},
    {label:'Hours Saved',     manual:'—',       ai:'312 hrs', badge:'per season',  green:true},
  ]

  return (
    <div style={INNER}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:30,flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{...LABEL,marginBottom:5}}>Data Insights · Midland</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>AI vs Manual Outreach</div>
        </div>
        <div style={{fontSize:12,color:DS.text3,textAlign:'right',lineHeight:1.6}}>Same reps, same time period<br/>with and without Simple Genius</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:13,marginBottom:22}}>
        {metrics.map((m,i)=>(
          <div key={i} className="dstat" style={CARD}>
            <div style={{...LABEL,marginBottom:14}}>{m.label}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:10}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:DS.text3,textDecoration:'line-through',textDecorationColor:DS.border}}>{m.manual}</span>
              <span style={{color:DS.text4}}>→</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:600,color:DS.text,letterSpacing:'-0.025em'}}>{m.ai}</span>
            </div>
            <div style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,marginTop:9,padding:'3px 10px',borderRadius:20,background:m.green?DS.greenBg:DS.goldPale,color:m.green?DS.green:DS.gold}}>{m.badge}</div>
          </div>
        ))}
      </div>

      <div style={{...CARD}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:DS.text,marginBottom:3}}>Weekly Outreach Volume</div>
        <div style={{fontSize:11.5,color:DS.text3,marginBottom:18}}>Emails sent per week — Manual vs Simple Genius AI</div>
        <div style={{display:'flex',gap:16,marginBottom:18}}>
          {[{bg:DS.bg2,border:`1px solid ${DS.border}`,label:'Manual'},{bg:DS.gold,label:'Simple Genius AI'}].map((l,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:DS.text2}}>
              <div style={{width:8,height:8,borderRadius:2,background:l.bg,border:l.border||'none',flexShrink:0}}/>
              {l.label}
            </div>
          ))}
        </div>
        <div style={{position:'relative',height:140,display:'flex',alignItems:'flex-end',gap:12,paddingBottom:24}}>
          <div style={{position:'absolute',bottom:24,left:0,right:0,height:1,background:DS.borderLight}}/>
          {bars.map((h,i)=>(
            <div key={i} style={{flex:1,display:'flex',alignItems:'flex-end',gap:3,position:'relative'}}>
              <div style={{flex:1,height:11,borderRadius:'4px 4px 0 0',background:DS.bg2,border:`1px solid ${DS.border}`}}/>
              <div style={{flex:1,height:h,borderRadius:'4px 4px 0 0',background:DS.gold}}/>
              <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',fontSize:9.5,color:DS.text3,whiteSpace:'nowrap',fontFamily:"'JetBrains Mono',monospace"}}>Wk{i+1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
