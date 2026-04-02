import React, { useState } from 'react'
import { DS } from './DemoConstants'

export default function DemoAnalytics() {
  const [period, setPeriod] = useState('FY25')
  const INNER = {padding:'34px 38px',maxWidth:1080}
  const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,fontFamily:"'JetBrains Mono',monospace"}
  const CARD  = {background:DS.card,borderRadius:14,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}

  const kpis = [
    {label:'Total Revenue FY25', value:'$621,880', delta:'+$250k vs goal', up:true, accent:DS.gold},
    {label:'Football Tickets',   value:'33,569',   delta:'+149% YoY',      up:true, accent:DS.green},
    {label:'Total Attendance',   value:'40,762',   delta:'All sports FY25', up:true, accent:DS.blue},
    {label:'AI Emails Drafted',  value:'1,840',    delta:'vs 420 manual',  up:true, accent:DS.amber},
  ]

  const categories = [
    {label:'Ticket Sales',      fy25:248600, goal:180000},
    {label:'Corporate Sponsors',fy25:184200, goal:140000},
    {label:'Hospitality / VIP', fy25:96400,  goal:60000},
    {label:'Alumni / Donations',fy25:58200,  goal:40000},
    {label:'Camps & Clinics',   fy25:34480,  goal:20000},
  ]

  const maxVal = Math.max(...categories.map(c=>Math.max(c.fy25,c.goal)))

  const fbGames = [
    {opp:'Eastfield Bears',att:5840,rev:38200,won:true},
    {opp:'Northgate Lions',att:6120,rev:42800,won:true},
    {opp:'Riverside Hawks*',att:7200,rev:56400,won:false},
    {opp:'Franklin Eagles',att:5300,rev:35100,won:true},
    {opp:'Central Cougars',att:5640,rev:37800,won:true},
    {opp:'Valley Storm',   att:3480,rev:24200,won:false},
  ]

  return (
    <div style={INNER}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:30,flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{...LABEL,marginBottom:5}}>Performance · Midland</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>Revenue Analytics</div>
        </div>
        <div style={{display:'flex',gap:6}}>
          {['FY23','FY24','FY25'].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${period===p?DS.gold:DS.border}`,background:period===p?DS.gold:DS.card,color:period===p?'white':DS.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',transition:'all 0.15s'}}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:13,marginBottom:22}}>
        {kpis.map((k,i)=>(
          <div key={i} className="dstat" style={{...CARD,padding:'17px 19px 16px',position:'relative',overflow:'hidden',cursor:'default',transition:'all 0.18s ease'}}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:k.accent,borderRadius:'3px 0 0 3px'}}/>
            <div style={{...LABEL,marginBottom:9}}>{k.label}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:600,color:DS.text,lineHeight:1,letterSpacing:'-0.02em'}}>{k.value}</div>
            <div style={{fontSize:11,color:k.up?DS.green:DS.red,marginTop:6,fontWeight:600}}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Revenue by category */}
      <div style={{...CARD,padding:'22px 24px',marginBottom:18}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:DS.text,marginBottom:3}}>Revenue by Category</div>
        <div style={{fontSize:11.5,color:DS.text3,marginBottom:20}}>FY25 actual vs goal</div>
        {categories.map((c,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:12.5,fontWeight:600,color:DS.text}}>{c.label}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:DS.gold,fontWeight:600}}>${(c.fy25/1000).toFixed(0)}k</span>
            </div>
            <div style={{height:8,borderRadius:4,background:DS.bg2,overflow:'hidden',position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${(c.goal/maxVal)*100}%`,background:DS.borderLight,borderRadius:4}}/>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${(c.fy25/maxVal)*100}%`,background:DS.gold,borderRadius:4,transition:'width 0.6s ease'}}/>
            </div>
            <div style={{fontSize:10.5,color:DS.text3,marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>Goal: ${(c.goal/1000).toFixed(0)}k · {Math.round((c.fy25/c.goal)*100)}% of goal</div>
          </div>
        ))}
      </div>

      {/* Football game breakdown */}
      <div style={{...CARD,padding:'22px 24px'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:DS.text,marginBottom:3}}>Football Game Breakdown</div>
        <div style={{fontSize:11.5,color:DS.text3,marginBottom:18}}>* = Rivalry game</div>
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 100px 120px 60px',gap:12,padding:'8px 12px',borderBottom:`1px solid ${DS.borderLight}`}}>
            {['Opponent','Attendance','Revenue','Result'].map(h=>(
              <div key={h} style={{...LABEL}}>{h}</div>
            ))}
          </div>
          {fbGames.map((g,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 100px 120px 60px',gap:12,padding:'10px 12px',borderBottom:`1px solid ${DS.borderLight}`,background:i%2===0?'transparent':DS.bg}}>
              <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{g.opp}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:DS.text2}}>{g.att.toLocaleString()}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:DS.gold,fontWeight:600}}>${(g.rev/1000).toFixed(1)}k</div>
              <div style={{display:'inline-flex',alignItems:'center',height:22,padding:'0 8px',borderRadius:20,background:g.won?DS.greenBg:DS.redBg,color:g.won?DS.green:DS.red,fontSize:10.5,fontWeight:700,width:'fit-content'}}>{g.won?'W':'L'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
