import React, { useState, useEffect, useMemo } from 'react'
import { DS } from './DemoConstants'

/* ─── Local color aliases (maps new DS tokens to component-level names) ───── */
const C = {
  gold:        '#9A6C10',
  goldBg:      'rgba(154,108,16,0.08)',
  goldBorder:  'rgba(154,108,16,0.25)',
  green:       '#2D6E1C',
  bg:          '#E4EFE1',
  bgDeep:      '#060C1A',   // KEEP DARK — stadium maps only
  pageBg:      '#F0F7EE',   // page-level backgrounds
  card:        '#FFFFFF',
  cardHover:   '#F4FAF2',
  border:      '#C4D8BE',
  borderLight: '#C4D8BE',
  text:        '#1A2E18',
  text2:       '#3A5835',
  text3:       '#6A8864',
  muted:       '#8AAA84',
  primaryBdr:  '#2D6E1C',
  primary:     '#2D6E1C',
  primarySub:  'rgba(45,110,28,0.10)',
  error:       '#C03020',
  info:        '#1A6A8A',
}
const F = {
  head: "'Syne',sans-serif",
  body: "'DM Sans',sans-serif",
  mono: "'JetBrains Mono',monospace",
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARC MATH  (verbatim from original)
═══════════════════════════════════════════════════════════════════════════ */
const toRad = d => d * Math.PI / 180
const ovalPt = (cx,cy,rx,ry,deg) => [cx+rx*Math.cos(toRad(deg)), cy+ry*Math.sin(toRad(deg))]
const arcPath = (cx,cy,a1,a2,iRx,iRy,oRx,oRy) => {
  const p1=ovalPt(cx,cy,iRx,iRy,a1),p2=ovalPt(cx,cy,iRx,iRy,a2)
  const p3=ovalPt(cx,cy,oRx,oRy,a2),p4=ovalPt(cx,cy,oRx,oRy,a1)
  const lg=(a2-a1)>180?1:0
  return `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${iRx} ${iRy} 0 ${lg} 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} L${p3[0].toFixed(1)} ${p3[1].toFixed(1)} A${oRx} ${oRy} 0 ${lg} 0 ${p4[0].toFixed(1)} ${p4[1].toFixed(1)}Z`
}
const circlePath = (cx,cy,a1,a2,iR,oR) => arcPath(cx,cy,a1,a2,iR,iR,oR,oR)

/* ═══════════════════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════════════════ */
const SPORTS = [
  {id:'football',   label:'Football',       icon:'🏈', venue:'Peak Sports Stadium',     cap:12000},
  {id:'basketball', label:'Basketball',     icon:'🏀', venue:'Simple Genius Arena',      cap:4500},
  {id:'volleyball', label:'Volleyball',     icon:'🏐', venue:'Simple Genius Arena',      cap:2200},
  {id:'softball',   label:'Softball',       icon:'🥎', venue:'Peak Softball Complex', cap:1800},
  {id:'baseball',   label:'Baseball',       icon:'⚾', venue:'Peak Baseball Park',    cap:2400},
  {id:'events',     label:'Special Events', icon:'🎤', venue:'Peak Sports Stadium',      cap:12000},
]

const CONCESSIONS = [
  {id:'c1',name:'Hot Dog Combo',  price:12,icon:'🌭',desc:'Dog + chips + drink'},
  {id:'c2',name:'Nachos',         price:10,icon:'🧀',desc:'Loaded stadium nachos'},
  {id:'c3',name:'Craft Beer',     price:9, icon:'🍺',desc:'Local Peak Brewing'},
  {id:'c4',name:'Soft Drink',     price:5, icon:'🥤',desc:'Fountain + free refill'},
  {id:'c5',name:'Peak Burger', price:14,icon:'🍔',desc:'Signature game-day burger'},
  {id:'c6',name:'Popcorn',        price:7, icon:'🍿',desc:'Butter or kettle corn'},
]

const BUNDLES = [
  {min:1,  max:3,  pct:0,   label:''},
  {min:4,  max:7,  pct:.08, label:'Group Discount — 8% off'},
  {min:8,  max:11, pct:.12, label:'Group Discount — 12% off'},
  {min:12, max:99, pct:.18, label:'Group Rate — 18% off'},
]
const getBundle = qty => BUNDLES.find(b=>qty>=b.min&&qty<=b.max)

const GAMES = [
  { id:'g1', sport:'football',   opponent:'Ridgemont State Bears',     record:'8-3',
    dayLabel:'Sat', dateLabel:'APR 19', time:'6:00 PM', venue:'Peak Sports Stadium',
    urgency:{hot:true,pct:8},   priceFrom:28, badge:{label:'HOMECOMING',    color:C.gold} },
  { id:'g2', sport:'basketball', opponent:'Crestwood Valley Panthers', record:'19-8',
    dayLabel:'Fri', dateLabel:'APR 18', time:'7:30 PM', venue:'Simple Genius Arena',
    urgency:{hot:true,pct:3},   priceFrom:18, badge:{label:'SELLOUT ALERT', color:C.error} },
  { id:'g3', sport:'softball',   opponent:'Bayshore FC',               record:'12-4',
    dayLabel:'Thu', dateLabel:'APR 24', time:'7:00 PM', venue:'Peak Softball Complex',
    urgency:{hot:true,pct:12},  priceFrom:8,  badge:{label:'SENIOR NIGHT',  color:C.info} },
  { id:'g4', sport:'volleyball', opponent:'Clearwater Waves',          record:'22-5',
    dayLabel:'Wed', dateLabel:'APR 23', time:'7:00 PM', venue:'Simple Genius Arena',
    urgency:{hot:false,pct:55}, priceFrom:12, badge:null },
  { id:'g5', sport:'baseball',   opponent:'Pinecrest Thunder',         record:'14-11',
    dayLabel:'Tue', dateLabel:'APR 22', time:'6:00 PM', venue:'Peak Baseball Park',
    urgency:{hot:false,pct:78}, priceFrom:10, badge:null },
  { id:'g6', sport:'football',   opponent:'Lakewood Tech Falcons',     record:'5-6',
    dayLabel:'Sat', dateLabel:'MAY 3',  time:'2:00 PM', venue:'Peak Sports Stadium',
    urgency:{hot:false,pct:42}, priceFrom:22, badge:{label:'SENIOR DAY', color:C.green} },
  { id:'g7', sport:'basketball', opponent:'North Summit Eagles',       record:'16-11',
    dayLabel:'Sat', dateLabel:'APR 26', time:'5:00 PM', venue:'Simple Genius Arena',
    urgency:{hot:false,pct:61}, priceFrom:15, badge:null },
]

const zoneLabel = z => ({
  home:'Home Sideline',away:'Away Sideline',north_ez:'North End Zone',
  south_ez:'South End Zone',corner:'Corner Section',
  lower:'Lower Bowl',club:'Club Level',upper:'Upper Deck',
  baseline_e:'East Baseline',baseline_w:'West Baseline',
  home_side:'Home Sideline',away_side:'Away Sideline',
  infield:'Infield Reserved',outfield:'Outfield Reserved',berm:'Berm Seating',
  vip:'Suite / VIP',foul_left:'3B Foul Territory',foul_right:'1B Foul Territory',
}[z]||z)

const urgencyColor = pct => pct<=5?C.error:pct<=20?C.gold:C.green

/* ═══════════════════════════════════════════════════════════════════════════
   MAP WRAPPER + INFO BAR
═══════════════════════════════════════════════════════════════════════════ */
const MapWrap = ({children}) => (
  <div style={{background:C.bgDeep,borderRadius:14,overflow:'hidden',border:`1px solid ${C.border}`,width:'100%',maxHeight:'clamp(260px,44vh,400px)',display:'flex',flexDirection:'column'}}>
    {children}
  </div>
)

function MapInfoBar({section,activeId}){
  return(
    <div style={{borderTop:`1px solid ${C.border}`,padding:'8px 14px',minHeight:48,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,background:'rgba(0,0,0,0.3)',flexShrink:0}}>
      {section?(
        <>
          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
            <div style={{width:32,height:32,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.head,fontWeight:900,fontSize:11,flexShrink:0,background:section.id===activeId?C.gold:'rgba(255,255,255,0.08)',color:section.id===activeId?C.bgDeep:'white'}}>
              {section.level==='upper'?'U':section.level==='club'?'C':'L'}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Section {section.label}</div>
              <div style={{fontSize:10,color:C.text3,fontWeight:600,marginTop:1}}>{zoneLabel(section.zone)}</div>
            </div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:10,color:C.muted,lineHeight:1,marginBottom:2}}>From</div>
            <div style={{fontFamily:F.mono,fontWeight:700,fontSize:17,color:section.sold?C.muted:C.gold}}>{section.sold?'SOLD OUT':`$${section.price}`}</div>
          </div>
        </>
      ):(
        <div style={{fontSize:11,color:C.text3,fontWeight:600,margin:'0 auto'}}>Tap a section to see details and pricing</div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. FOOTBALL MAP — 24 lower + 30 upper arc sections
═══════════════════════════════════════════════════════════════════════════ */
const FOOT_CX=280,FOOT_CY=185
// Horizontal field: 0°=right(east) 90°=bottom(home) 180°=left(end) 270°=top(away)
const getZoneFoot=a=>{const n=((a%360)+360)%360;if(n>148&&n<212)return 'north_ez';if(n>328||n<32)return 'south_ez';if(n>58&&n<122)return 'home';if(n>238&&n<302)return 'away';return 'corner'}
const footZoneFill=(zone,level,active,hover,sold)=>{
  if(active)return C.gold;if(sold)return 'rgba(255,255,255,0.05)';if(hover)return level==='upper'?'#2a5a8e':'#1a7040'
  if(level==='upper'){const m={home:'#1e3f6e',away:'#1a3560',north_ez:'#1a3458',south_ez:'#1a3458',corner:'#182f54'};return m[zone]||'#1a3252'}
  const m={home:'#0a5028',away:'#1a4a3a',north_ez:'#1e6b44',south_ez:'#1e7044',corner:'#226040'};return m[zone]||'#1e6040'
}
const buildFootSections=()=>{
  const lb={iRx:168,iRy:85,oRx:222,oRy:120},ud={iRx:230,iRy:126,oRx:266,oRy:153},gap=1.5
  const lower=Array.from({length:24},(_,i)=>{
    const step=360/24,a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2,zone=getZoneFoot(mid)
    return{id:`L${101+i}`,label:String(101+i),zone,level:'lower',sold:[4,11,18].includes(i),
      price:{home:42,away:28,north_ez:18,south_ez:18,corner:24}[zone]||28,
      path:arcPath(FOOT_CX,FOOT_CY,a1,a2,lb.iRx,lb.iRy,lb.oRx,lb.oRy),
      lx:ovalPt(FOOT_CX,FOOT_CY,(lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[0],
      ly:ovalPt(FOOT_CX,FOOT_CY,(lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[1]}
  })
  const upper=Array.from({length:30},(_,i)=>{
    const step=360/30,a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2,zone=getZoneFoot(mid)
    return{id:`U${201+i}`,label:String(201+i),zone,level:'upper',sold:[2,14,22,28].includes(i),price:15,
      path:arcPath(FOOT_CX,FOOT_CY,a1,a2,ud.iRx,ud.iRy,ud.oRx,ud.oRy),
      lx:ovalPt(FOOT_CX,FOOT_CY,(ud.iRx+ud.oRx)/2,(ud.iRy+ud.oRy)/2,mid)[0],
      ly:ovalPt(FOOT_CX,FOOT_CY,(ud.iRx+ud.oRx)/2,(ud.iRy+ud.oRy)/2,mid)[1]}
  })
  return{lower,upper,all:[...lower,...upper]}
}

function FootballMap({activeSection,onSelect}){
  const [hov,setHov]=useState(null)
  const {lower,upper,all}=useMemo(buildFootSections,[])
  const actSec=all.find(s=>s.id===activeSection),hovSec=all.find(s=>s.id===hov),disp=actSec||hovSec
  return(
    <MapWrap>
      <div style={{padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:7.5,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Football · Peak Sports Stadium</div>
          <div style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text}}>Select Your Section</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[{c:'#0a5028',l:'Lower'},{c:'#1e3f6e',l:'Upper'},{c:'rgba(255,255,255,0.06)',l:'Sold'}].map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:8,height:8,borderRadius:2,background:it.c,border:`1px solid ${C.border}`}}/>
              <span style={{fontFamily:F.mono,fontSize:8,color:C.text3}}>{it.l}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 560 370" style={{width:'100%',flex:1,minHeight:0,display:'block'}} preserveAspectRatio="xMidYMid meet">
        <rect width="560" height="370" fill={C.bgDeep}/>
        {upper.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={footZoneFill(s.zone,'upper',s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1" style={{transition:'fill 0.12s'}}/>
            <text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill="rgba(255,255,255,0.55)" fontSize="5" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text>
          </g>
        ))}
        {lower.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={footZoneFill(s.zone,'lower',s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1.2" style={{transition:'fill 0.12s'}}/>
            <text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill={s.id===activeSection?C.bgDeep:'rgba(255,255,255,0.85)'} fontSize="6.5" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text>
          </g>
        ))}
        {/* Horizontal field — long axis left↔right */}
        <ellipse cx={FOOT_CX} cy={FOOT_CY} rx="155" ry="75" fill="#1a5230" stroke="#226640" strokeWidth="1.5"/>
        {/* Yard lines — vertical stripes across the field */}
        {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(i=>(<line key={i} x1={FOOT_CX+i*14} y1={FOOT_CY-68} x2={FOOT_CX+i*14} y2={FOOT_CY+68} stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>))}
        {/* Midfield vertical line */}
        <line x1={FOOT_CX} y1={FOOT_CY-68} x2={FOOT_CX} y2={FOOT_CY+68} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
        {/* Hash marks */}
        {[-4,-2,0,2,4].map(i=>(<g key={i}><line x1={FOOT_CX+i*28} y1={FOOT_CY-24} x2={FOOT_CX+i*28} y2={FOOT_CY-18} stroke="rgba(255,255,255,0.14)" strokeWidth="0.8"/><line x1={FOOT_CX+i*28} y1={FOOT_CY+18} x2={FOOT_CX+i*28} y2={FOOT_CY+24} stroke="rgba(255,255,255,0.14)" strokeWidth="0.8"/></g>))}
        {/* Goal posts — horizontal field: posts at left & right ends */}
        {[{dx:-148,s:-1},{dx:148,s:1}].map((gp,gi)=>(
          <g key={gi}>
            <line x1={FOOT_CX+gp.dx} y1={FOOT_CY} x2={FOOT_CX+gp.dx+gp.s*18} y2={FOOT_CY} stroke="rgba(255,215,60,0.65)" strokeWidth="1.5"/>
            <line x1={FOOT_CX+gp.dx+gp.s*18} y1={FOOT_CY-12} x2={FOOT_CX+gp.dx+gp.s*18} y2={FOOT_CY+12} stroke="rgba(255,215,60,0.65)" strokeWidth="1.2"/>
            <line x1={FOOT_CX+gp.dx+gp.s*18} y1={FOOT_CY-12} x2={FOOT_CX+gp.dx+gp.s*32} y2={FOOT_CY-12} stroke="rgba(255,215,60,0.65)" strokeWidth="1.2"/>
            <line x1={FOOT_CX+gp.dx+gp.s*18} y1={FOOT_CY+12} x2={FOOT_CX+gp.dx+gp.s*32} y2={FOOT_CY+12} stroke="rgba(255,215,60,0.65)" strokeWidth="1.2"/>
          </g>
        ))}
        <text x={FOOT_CX} y={FOOT_CY+4} fill="rgba(255,255,255,0.07)" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="4" style={{userSelect:'none'}}>FIELD</text>
        <text x={FOOT_CX} y="13" fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>AWAY SIDELINE</text>
        <text x={FOOT_CX} y="363" fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>HOME SIDELINE</text>
        <text x="10" y={FOOT_CY+4} fill="rgba(255,255,255,0.18)" fontSize="6" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 10 ${FOOT_CY})`} letterSpacing="1" style={{userSelect:'none'}}>END ZONE</text>
        <text x="550" y={FOOT_CY+4} fill="rgba(255,255,255,0.18)" fontSize="6" fontWeight="bold" textAnchor="middle" transform={`rotate(90 550 ${FOOT_CY})`} letterSpacing="1" style={{userSelect:'none'}}>END ZONE</text>
      </svg>
      <MapInfoBar section={disp&&{...disp,id:disp.id}} activeId={activeSection}/>
    </MapWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. BASKETBALL / VOLLEYBALL MAP — 22 lower + 12 club + 28 upper
═══════════════════════════════════════════════════════════════════════════ */
const BB_CX=280,BB_CY=205
const getZoneBB=a=>{const n=((a%360)+360)%360;if(n>330||n<30)return 'baseline_e';if(n>150&&n<210)return 'baseline_w';if(n>240&&n<300)return 'home_side';if(n>60&&n<120)return 'away_side';return 'corner'}
const bbFill=(zone,level,active,hover,sold)=>{
  if(active)return C.gold;if(sold)return 'rgba(255,255,255,0.05)';const h=hover?0.15:0
  if(level==='lower'){const m={home_side:`rgba(30,80,140,${0.85+h})`,away_side:`rgba(26,70,130,${0.8+h})`,baseline_e:`rgba(30,80,130,${0.8+h})`,baseline_w:`rgba(30,80,130,${0.8+h})`,corner:`rgba(24,60,110,${0.8+h})`};return m[zone]||`rgba(26,72,132,${0.8+h})`}
  if(level==='club')return `rgba(139,32,32,${0.85+h})`;return `rgba(34,100,44,${0.85+h})`
}
const buildBBSections=()=>{
  const lb={iRx:128,iRy:76,oRx:182,oRy:116},cl={iRx:186,iRy:120,oRx:222,oRy:152},up={iRx:226,iRy:156,oRx:264,oRy:192},gap=1.5
  const lower=Array.from({length:22},(_,i)=>{
    const step=360/22,a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2,zone=getZoneBB(mid)
    return{id:`BBL${i}`,label:String(1+i),zone,level:'lower',sold:[3,10,18].includes(i),
      price:{home_side:55,away_side:45,baseline_e:35,baseline_w:35,corner:42}[zone]||42,
      path:arcPath(BB_CX,BB_CY,a1,a2,lb.iRx,lb.iRy,lb.oRx,lb.oRy),
      lx:ovalPt(BB_CX,BB_CY,(lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[0],
      ly:ovalPt(BB_CX,BB_CY,(lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[1]}
  })
  const club=Array.from({length:12},(_,i)=>{
    const step=360/12,a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2,zone=getZoneBB(mid)
    return{id:`BBC${i}`,label:String(107+i*3),zone,level:'club',sold:[2,8].includes(i),price:85,
      path:arcPath(BB_CX,BB_CY,a1,a2,cl.iRx,cl.iRy,cl.oRx,cl.oRy),
      lx:ovalPt(BB_CX,BB_CY,(cl.iRx+cl.oRx)/2,(cl.iRy+cl.oRy)/2,mid)[0],
      ly:ovalPt(BB_CX,BB_CY,(cl.iRx+cl.oRx)/2,(cl.iRy+cl.oRy)/2,mid)[1]}
  })
  const upper=Array.from({length:28},(_,i)=>{
    const step=360/28,a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2
    return{id:`BBU${i}`,label:String(301+i),zone:'upper',level:'upper',sold:[2,14,22].includes(i),price:18,
      path:arcPath(BB_CX,BB_CY,a1,a2,up.iRx,up.iRy,up.oRx,up.oRy),
      lx:ovalPt(BB_CX,BB_CY,(up.iRx+up.oRx)/2,(up.iRy+up.oRy)/2,mid)[0],
      ly:ovalPt(BB_CX,BB_CY,(up.iRx+up.oRx)/2,(up.iRy+up.oRy)/2,mid)[1]}
  })
  return{lower,club,upper,all:[...lower,...club,...upper]}
}

function BasketballMap({activeSection,onSelect,sport}){
  const [hov,setHov]=useState(null)
  const {lower,club,upper,all}=useMemo(buildBBSections,[])
  const actSec=all.find(s=>s.id===activeSection),hovSec=all.find(s=>s.id===hov),disp=actSec||hovSec
  const isVol=sport==='volleyball'
  return(
    <MapWrap>
      <div style={{padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:7.5,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>{isVol?'Volleyball':'Basketball'} · Simple Genius Arena</div>
          <div style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text}}>Select Your Section</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[{c:'rgba(30,80,140,0.85)',l:'Lower'},{c:'rgba(139,32,32,0.85)',l:'Club'},{c:'rgba(34,100,44,0.85)',l:'Upper'}].map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:8,height:8,borderRadius:2,background:it.c}}/>
              <span style={{fontFamily:F.mono,fontSize:8,color:C.text3}}>{it.l}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 560 400" style={{width:'100%',flex:1,minHeight:0,display:'block'}} preserveAspectRatio="xMidYMid meet">
        <rect width="560" height="400" fill={C.bgDeep}/>
        {upper.map(s=>(<g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}><path d={s.path} fill={bbFill(s.zone,'upper',s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1" style={{transition:'fill 0.12s'}}/><text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill="rgba(255,255,255,0.5)" fontSize="5" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text></g>))}
        {club.map(s=>(<g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}><path d={s.path} fill={bbFill(s.zone,'club',s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1" style={{transition:'fill 0.12s'}}/><text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill="rgba(255,255,255,0.7)" fontSize="5.5" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text></g>))}
        {lower.map(s=>(<g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}><path d={s.path} fill={bbFill(s.zone,'lower',s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1.2" style={{transition:'fill 0.12s'}}/><text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill={s.id===activeSection?C.bgDeep:'rgba(255,255,255,0.9)'} fontSize="6" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text></g>))}
        <rect x={BB_CX-100} y={BB_CY-52} width="200" height="104" fill={isVol?'#C4882A':'#C8962A'} rx="4" opacity="0.9"/>
        <rect x={BB_CX-100} y={BB_CY-52} width="200" height="104" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="4"/>
        <line x1={BB_CX} y1={BB_CY-52} x2={BB_CX} y2={BB_CY+52} stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <circle cx={BB_CX} cy={BB_CY} r="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <circle cx={BB_CX-80} cy={BB_CY} r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <circle cx={BB_CX+80} cy={BB_CY} r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="3,2"/>
        {isVol&&<line x1={BB_CX} y1={BB_CY-52} x2={BB_CX} y2={BB_CY+52} stroke="white" strokeWidth="2.5"/>}
        <text x={BB_CX} y={BB_CY+4} fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>{isVol?'NET':'COURT'}</text>
        <text x="18" y={BB_CY+4} fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 18 ${BB_CY})`} letterSpacing="1" style={{userSelect:'none'}}>HOME</text>
        <text x="542" y={BB_CY+4} fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold" textAnchor="middle" transform={`rotate(90 542 ${BB_CY})`} letterSpacing="1" style={{userSelect:'none'}}>AWAY</text>
      </svg>
      <MapInfoBar section={disp} activeId={activeSection}/>
    </MapWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. BASEBALL MAP
═══════════════════════════════════════════════════════════════════════════ */
const HP_CX=295,HP_CY=420
const buildBaseSections=()=>[
  {id:'101',label:'101',a1:320,a2:348,iR:68,oR:130,zone:'infield',sold:false,price:18,level:'infield'},
  {id:'102',label:'102',a1:295,a2:320,iR:68,oR:130,zone:'infield',sold:false,price:16,level:'infield'},
  {id:'103',label:'103',a1:268,a2:295,iR:68,oR:130,zone:'infield',sold:false,price:16,level:'infield'},
  {id:'104',label:'104',a1:244,a2:268,iR:68,oR:130,zone:'infield',sold:true, price:18,level:'infield'},
  {id:'105',label:'105',a1:218,a2:244,iR:60,oR:125,zone:'foul_left',sold:false,price:14,level:'infield'},
  {id:'201',label:'201',a1:328,a2:350,iR:130,oR:210,zone:'outfield',sold:false,price:12,level:'outfield'},
  {id:'202',label:'202',a1:308,a2:328,iR:130,oR:210,zone:'outfield',sold:false,price:12,level:'outfield'},
  {id:'203',label:'203',a1:287,a2:308,iR:130,oR:210,zone:'outfield',sold:false,price:14,level:'outfield'},
  {id:'204',label:'204',a1:266,a2:287,iR:130,oR:210,zone:'outfield',sold:false,price:14,level:'outfield'},
  {id:'205',label:'205',a1:245,a2:266,iR:130,oR:210,zone:'outfield',sold:false,price:12,level:'outfield'},
  {id:'206',label:'206',a1:220,a2:245,iR:130,oR:210,zone:'outfield',sold:false,price:12,level:'outfield'},
  {id:'RF_BERM',label:'RF Berm',a1:328,a2:356,iR:210,oR:275,zone:'berm',sold:false,price:10,level:'berm'},
  {id:'CF_BERM',label:'CF Berm',a1:248,a2:328,iR:210,oR:275,zone:'berm',sold:false,price:8, level:'berm'},
  {id:'LF_BERM',label:'LF Berm',a1:218,a2:248,iR:210,oR:275,zone:'berm',sold:false,price:10,level:'berm'},
  {id:'SUITE_1B',label:'1B Suite',a1:350,a2:360,iR:65,oR:115,zone:'vip',sold:false,price:120,level:'vip'},
  {id:'SUITE_3B',label:'3B Suite',a1:210,a2:218,iR:65,oR:115,zone:'vip',sold:false,price:120,level:'vip'},
].map(s=>({...s,path:circlePath(HP_CX,HP_CY,s.a1,s.a2,s.iR,s.oR),lx:HP_CX+((s.iR+s.oR)/2)*Math.cos(toRad((s.a1+s.a2)/2)),ly:HP_CY+((s.iR+s.oR)/2)*Math.sin(toRad((s.a1+s.a2)/2))}))
const baseFill=(level,active,hover,sold)=>{
  if(active)return C.gold;if(sold)return 'rgba(255,255,255,0.05)';const h=hover?0.15:0
  const m={infield:`rgba(26,90,50,${0.85+h})`,outfield:`rgba(22,72,42,${0.8+h})`,foul_left:`rgba(26,90,50,${0.8+h})`,berm:`rgba(16,56,32,${0.75+h})`,vip:`rgba(150,100,20,${0.85+h})`}
  return m[level]||`rgba(22,72,42,${0.8+h})`
}

function BaseballMap({activeSection,onSelect}){
  const [hov,setHov]=useState(null)
  const sections=useMemo(buildBaseSections,[])
  const actSec=sections.find(s=>s.id===activeSection),hovSec=sections.find(s=>s.id===hov),disp=actSec||hovSec
  const d=70,b1x=HP_CX+d*Math.sin(toRad(45)),b1y=HP_CY-d*Math.cos(toRad(45)),b3x=HP_CX-d*Math.sin(toRad(45)),b3y=b1y,b2x=HP_CX,b2y=HP_CY-d*Math.sqrt(2)
  return(
    <MapWrap>
      <div style={{padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:7.5,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Baseball · Peak Baseball Park</div>
          <div style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text}}>Select Your Section</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[{c:'rgba(26,90,50,0.85)',l:'Infield'},{c:'rgba(22,72,42,0.8)',l:'Outfield'},{c:'rgba(16,56,32,0.75)',l:'Berm'}].map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:2,background:it.c}}/><span style={{fontFamily:F.mono,fontSize:8,color:C.text3}}>{it.l}</span></div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 590 500" style={{width:'100%',flex:1,minHeight:0,display:'block'}} preserveAspectRatio="xMidYMid meet">
        <rect width="590" height="500" fill={C.bgDeep}/>
        <path d={`M${HP_CX},${HP_CY} L${HP_CX+300*Math.cos(toRad(335))},${HP_CY+300*Math.sin(toRad(335))} A300 300 0 0 0 ${HP_CX+300*Math.cos(toRad(215))},${HP_CY+300*Math.sin(toRad(215))} Z`} fill="rgba(20,60,20,0.3)"/>
        <line x1={HP_CX} y1={HP_CY} x2={HP_CX+290*Math.cos(toRad(315))} y2={HP_CY+290*Math.sin(toRad(315))} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,3"/>
        <line x1={HP_CX} y1={HP_CY} x2={HP_CX+290*Math.cos(toRad(225))} y2={HP_CY+290*Math.sin(toRad(225))} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,3"/>
        {sections.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={baseFill(s.level,s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1" style={{transition:'fill 0.12s'}}/>
            {s.id!=='CF_BERM'&&<text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill="rgba(255,255,255,0.8)" fontSize={s.level==='berm'?6:6.5} fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text>}
            {s.id==='CF_BERM'&&<text x={HP_CX} y={HP_CY-240} fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>CF BERM</text>}
          </g>
        ))}
        <circle cx={HP_CX} cy={(b1y+b2y)/2} r="42" fill="#1a6030" opacity="0.8"/>
        <polygon points={`${HP_CX},${HP_CY} ${b1x.toFixed(0)},${b1y.toFixed(0)} ${b2x},${b2y.toFixed(0)} ${b3x.toFixed(0)},${b3y.toFixed(0)}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        {[[HP_CX,HP_CY],[b1x,b1y],[b2x,b2y],[b3x,b3y]].map(([x,y],i)=>(<rect key={i} x={x-4} y={y-4} width="8" height="8" fill="white" opacity="0.8" rx="1"/>))}
        <circle cx={HP_CX} cy={(HP_CY+b2y)/2} r="6" fill="rgba(200,160,100,0.6)"/>
        <text x={HP_CX} y={HP_CY+50} fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>ENTRANCE</text>
        <text x="295" y="14" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" letterSpacing="1" style={{userSelect:'none'}}>CENTER FIELD</text>
      </svg>
      <MapInfoBar section={disp} activeId={activeSection}/>
    </MapWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. SOFTBALL MAP
═══════════════════════════════════════════════════════════════════════════ */
const SFT_CX=290,SFT_CY=400
const buildSoftSections=()=>[
  {id:'101',label:'101',a1:300,a2:330,iR:55,oR:110,zone:'infield',sold:false,price:14,level:'infield'},
  {id:'102',label:'102',a1:275,a2:300,iR:55,oR:110,zone:'infield',sold:false,price:12,level:'infield'},
  {id:'103',label:'103',a1:252,a2:275,iR:55,oR:110,zone:'infield',sold:false,price:12,level:'infield'},
  {id:'104',label:'104',a1:230,a2:252,iR:55,oR:110,zone:'infield',sold:false,price:14,level:'infield'},
  {id:'105',label:'105',a1:208,a2:230,iR:50,oR:100,zone:'infield',sold:true, price:12,level:'infield'},
  {id:'106',label:'106 — Student',a1:330,a2:350,iR:50,oR:95,zone:'foul_right',sold:false,price:8, level:'student'},
  {id:'107',label:'107 — Group',  a1:190,a2:208,iR:50,oR:90,zone:'foul_left', sold:false,price:10,level:'group'},
  {id:'BERM',label:'Berm Seating',a1:230,a2:310,iR:110,oR:195,zone:'berm',sold:false,price:8,level:'berm'},
  {id:'BERM_SIDE',label:'Right Berm',a1:310,a2:345,iR:110,oR:175,zone:'berm',sold:false,price:8,level:'berm'},
  {id:'PRESS',label:'Press Box',a1:205,a2:220,iR:112,oR:150,zone:'outfield',sold:false,price:16,level:'press'},
].map(s=>({...s,path:circlePath(SFT_CX,SFT_CY,s.a1,s.a2,s.iR,s.oR),lx:SFT_CX+((s.iR+s.oR)/2)*Math.cos(toRad((s.a1+s.a2)/2)),ly:SFT_CY+((s.iR+s.oR)/2)*Math.sin(toRad((s.a1+s.a2)/2))}))
const softFill=(level,active,hover,sold)=>{
  if(active)return C.gold;if(sold)return 'rgba(255,255,255,0.05)';const h=hover?0.15:0
  const m={infield:`rgba(26,90,50,${0.85+h})`,student:`rgba(70,130,180,${0.8+h})`,group:`rgba(200,80,20,${0.8+h})`,berm:`rgba(60,130,60,${0.75+h})`,press:`rgba(80,60,130,${0.8+h})`,outfield:`rgba(22,72,42,${0.8+h})`}
  return m[level]||`rgba(26,90,50,${0.8+h})`
}

function SoftballMap({activeSection,onSelect}){
  const [hov,setHov]=useState(null)
  const sections=useMemo(buildSoftSections,[])
  const actSec=sections.find(s=>s.id===activeSection),hovSec=sections.find(s=>s.id===hov),disp=actSec||hovSec
  const d=55,b1x=SFT_CX+d*Math.sin(toRad(45)),b1y=SFT_CY-d*Math.cos(toRad(45)),b3x=SFT_CX-d*Math.sin(toRad(45)),b3y=b1y,b2x=SFT_CX,b2y=SFT_CY-d*Math.sqrt(2)
  return(
    <MapWrap>
      <div style={{padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:7.5,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Softball · Peak Softball Complex</div>
          <div style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text}}>Select Your Section</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[{c:'rgba(26,90,50,0.85)',l:'Reserved'},{c:'rgba(60,130,60,0.75)',l:'Berm'},{c:'rgba(70,130,180,0.8)',l:'Student'}].map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:2,background:it.c}}/><span style={{fontFamily:F.mono,fontSize:8,color:C.text3}}>{it.l}</span></div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 580 480" style={{width:'100%',flex:1,minHeight:0,display:'block'}} preserveAspectRatio="xMidYMid meet">
        <rect width="580" height="480" fill={C.bgDeep}/>
        <path d={`M${SFT_CX},${SFT_CY} L${SFT_CX+220*Math.cos(toRad(345))},${SFT_CY+220*Math.sin(toRad(345))} A220 220 0 0 0 ${SFT_CX+220*Math.cos(toRad(205))},${SFT_CY+220*Math.sin(toRad(205))} Z`} fill="rgba(20,60,20,0.25)"/>
        <line x1={SFT_CX} y1={SFT_CY} x2={SFT_CX+220*Math.cos(toRad(315))} y2={SFT_CY+220*Math.sin(toRad(315))} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeDasharray="4,3"/>
        <line x1={SFT_CX} y1={SFT_CY} x2={SFT_CX+220*Math.cos(toRad(225))} y2={SFT_CY+220*Math.sin(toRad(225))} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeDasharray="4,3"/>
        {sections.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)} onMouseEnter={()=>!s.sold&&setHov(s.id)} onMouseLeave={()=>setHov(null)} style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={softFill(s.level,s.id===activeSection,s.id===hov,s.sold)} stroke={C.bgDeep} strokeWidth="1" style={{transition:'fill 0.12s'}}/>
            <text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)} fill="rgba(255,255,255,0.8)" fontSize={s.label.length>5?5.5:6.5} fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label.split(' — ')[0]}</text>
          </g>
        ))}
        <circle cx={SFT_CX} cy={(b1y+b2y)/2} r="32" fill="#1a6030" opacity="0.8"/>
        <polygon points={`${SFT_CX},${SFT_CY} ${b1x.toFixed(0)},${b1y.toFixed(0)} ${b2x},${b2y.toFixed(0)} ${b3x.toFixed(0)},${b3y.toFixed(0)}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        {[[SFT_CX,SFT_CY],[b1x,b1y],[b2x,b2y],[b3x,b3y]].map(([x,y],i)=>(<rect key={i} x={x-4} y={y-4} width="8" height="8" fill="white" opacity="0.8" rx="1"/>))}
        <circle cx={SFT_CX} cy={(SFT_CY+b2y)/2} r="5" fill="rgba(200,160,100,0.6)"/>
        <text x={SFT_CX} y={SFT_CY+46} fill="rgba(255,255,255,0.18)" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>ENTRANCE</text>
      </svg>
      <MapInfoBar section={disp} activeId={activeSection}/>
    </MapWrap>
  )
}

/* ─── Stadium dispatcher ──────────────────────────────────────────────────── */
function StadiumMap({sport,activeSection,onSelect}){
  switch(sport){
    case 'basketball': case 'volleyball': return <BasketballMap activeSection={activeSection} onSelect={onSelect} sport={sport}/>
    case 'baseball':   return <BaseballMap   activeSection={activeSection} onSelect={onSelect}/>
    case 'softball':   return <SoftballMap   activeSection={activeSection} onSelect={onSelect}/>
    default:           return <FootballMap   activeSection={activeSection} onSelect={onSelect}/>
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEAT PICKER  (dark header, white grid — intentional for readability)
═══════════════════════════════════════════════════════════════════════════ */
function SeatPicker({sectionId,selectedSeats,onSelect}){
  const rows=['A','B','C','D','E','F','G','H']
  const taken={C3:1,E7:1,F1:1,B9:1}
  const toggle=id=>{
    if(selectedSeats.includes(id))onSelect(selectedSeats.filter(s=>s!==id))
    else if(selectedSeats.length<8)onSelect([...selectedSeats,id])
  }
  return(
    <div style={{background:C.card,borderRadius:14,overflow:'hidden',border:`1px solid ${C.border}`,animation:'fadeIn 0.25s ease'}}>
      <div style={{padding:'10px 14px',background:C.green,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${C.primaryBdr}`}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:8,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Seat Selection</div>
          <div style={{fontFamily:F.head,fontWeight:700,fontSize:14,color:C.text}}>Section {sectionId}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          {[{c:C.gold,l:'Selected'},{c:'rgba(255,255,255,0.15)',l:'Available'},{c:'rgba(255,255,255,0.06)',l:'Sold'}].map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:2,background:it.c}}/><span style={{fontSize:9,color:C.text3,fontFamily:F.mono}}>{it.l}</span></div>
          ))}
        </div>
      </div>
      {/* Scrollable grid — horizontal scroll keeps tap targets comfortable */}
      <div style={{background:'white',overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
        <div style={{padding:'10px 12px',minWidth:'max-content'}}>
          <div style={{textAlign:'center',marginBottom:6,padding:'5px',borderRadius:6,background:'#f8f8f8',fontSize:9.5,fontWeight:700,color:'#999',letterSpacing:'0.1em',minWidth:420}}>↑ BACK OF SECTION ↑</div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {rows.map(row=>(
              <div key={row} style={{display:'flex',alignItems:'center',gap:4}}>
                {/* Row label — bigger for thumb orientation */}
                <div style={{width:28,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:'#1A5C22',color:'white',fontFamily:F.mono,fontSize:11,fontWeight:700,flexShrink:0}}>{row}</div>
                <div style={{display:'flex',gap:3}}>
                  {Array.from({length:12},(_,i)=>{
                    const id=`${row}${i+1}`,isTaken=taken[id],isSel=selectedSeats.includes(id)
                    return(
                      <button key={id} disabled={isTaken} onClick={()=>toggle(id)} style={{
                        width:32,height:32,flexShrink:0,borderRadius:5,
                        border:`1.5px solid ${isSel?C.gold:isTaken?'#eee':'#e2e8f0'}`,
                        background:isSel?C.gold:isTaken?'#f5f5f5':'white',
                        color:isSel?'#0A3D1F':isTaken?'#ccc':'#374151',
                        fontFamily:F.mono,fontSize:10,fontWeight:700,
                        cursor:isTaken?'not-allowed':'pointer',
                        transform:isSel?'scale(1.08)':'scale(1)',
                        transition:'all 0.12s',
                      }}>{i+1}</button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:6,padding:'5px',borderRadius:6,background:'#f0fdf4',fontSize:9.5,fontWeight:700,color:'#2D7A3A',letterSpacing:'0.1em',minWidth:420}}>← FIELD SIDE →</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEAT VIEW PREVIEW
═══════════════════════════════════════════════════════════════════════════ */
function SeatView({section,onClose,onConfirm}){
  const W=800,H=460,nL=20,nR=780,nY=360,fL=110,fR=690,fY=178
  const xN=y=>nL+(y/120)*(nR-nL),xF=y=>fL+(y/120)*(fR-fL),blendY=t=>nY+t*(fY-nY)
  return(
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:12,background:'rgba(0,0,0,0.92)',animation:'fadeIn 0.2s ease'}}>
      <div style={{width:'100%',maxWidth:720,borderRadius:20,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.7)',background:C.bgDeep,border:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontFamily:F.mono,fontSize:8,color:C.gold,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Seat View Preview</div>
            <div style={{fontFamily:F.head,fontWeight:700,fontSize:16,color:C.text}}>Section {section?.label} · Row G · Seat 14</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.08)',border:'none',cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700}}>×</button>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block',maxHeight:'50vh'}}>
          <defs>
            <linearGradient id="sv_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#100b04"/><stop offset="100%" stopColor="#1a1208"/></linearGradient>
            <linearGradient id="sv_fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a3520"/><stop offset="100%" stopColor="#6b5538"/></linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#sv_bg)"/>
          {[60,190,340,460,610,740].map((x,i)=>(<g key={i}><rect x={x-18} y="60" width="36" height="10" rx="2" fill="rgba(255,255,210,0.5)"/><ellipse cx={x} cy="65" rx="32" ry="16" fill="rgba(255,255,180,0.06)"/></g>))}
          <rect x="0" y="80" width={W} height="100" fill="#0e3d28" opacity="0.9"/>
          {[0,1,2,3,4,5].map(r=>(<rect key={r} x="0" y={82+r*14} width={W} height="12" fill={r%2===0?'#0e3d28':'#1a1208'} opacity="0.9"/>))}
          {Array.from({length:90}).map((_,i)=>(<circle key={i} cx={5+i*9} cy={90+(i%5)*10+Math.sin(i)*2} r={2+i%2} fill={['#886E4C','#fff','#3498db','#e74c3c','#2ecc71'][i%5]} opacity="0.55"/>))}
          <polygon points={`${xN(0)},${nY} ${xN(120)},${nY} ${xF(120)},${fY} ${xF(0)},${fY}`} fill="url(#sv_fd)"/>
          {[1,2,3,4,5,6,7,8,9].map(i=>{const yard=10+i*10;return(<line key={i} x1={xN(yard)} y1={nY} x2={xF(yard)} y2={fY} stroke={i===5?'rgba(255,255,255,0.55)':'rgba(255,255,255,0.22)'} strokeWidth={i===5?2.2:1.2}/>)})}
          <line x1={xN(0)} y1={nY} x2={xN(120)} y2={nY} stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/>
          <line x1={xF(0)} y1={fY} x2={xF(120)} y2={fY} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
          <line x1={xN(0)} y1={nY} x2={xF(0)} y2={fY} stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          <line x1={xN(120)} y1={nY} x2={xF(120)} y2={fY} stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          {[[20,20],[30,30],[40,40],[50,50],[40,60],[30,70],[20,80]].map(([lbl,yard])=>(<text key={yard} x={(xN(yard)+xF(yard))/2} y={(nY+fY)/2+10} fill="rgba(255,255,255,0.28)" fontSize="12" fontWeight="900" textAnchor="middle">{lbl}</text>))}
          {[2,118].map((yard,gi)=>{const gx=(xN(yard)+xF(yard)*2)/3,gy=blendY(0.6),s=0.65;return(<g key={gi}><line x1={gx} y1={gy+20*s} x2={gx} y2={gy-8*s} stroke="rgba(255,215,60,0.85)" strokeWidth="3"/><line x1={gx-20*s} y1={gy-8*s} x2={gx+20*s} y2={gy-8*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.2"/><line x1={gx-20*s} y1={gy-8*s} x2={gx-20*s} y2={gy-30*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.2"/><line x1={gx+20*s} y1={gy-8*s} x2={gx+20*s} y2={gy-30*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.2"/></g>)})}
          {[0,1,2,3,4].map(row=>{const y=nY+12+row*16,xl=-18-row*28,xr=W+18+row*28,nSeats=28+row*4,sw=(xr-xl)/nSeats;return(<g key={row}><rect x={xl} y={y} width={xr-xl} height="13" fill="#2a1e0e" rx="2"/>{Array.from({length:nSeats}).map((_,si)=>{const sx=xl+si*sw+1.5,isOurs=row===0&&si===Math.floor(nSeats/2)-2;return(<rect key={si} x={sx} y={y+1.5} width={sw-3} height="10" rx="2" fill={isOurs?C.gold:['#2a1e0e','#4a3520','#1a1208'][si%3]} opacity={isOurs?1:0.85} stroke={isOurs?'rgba(255,255,255,0.6)':'none'} strokeWidth={isOurs?1:0}/>)})}</g>)})}
          {(()=>{const nSeats=28,sw=(W+40)/nSeats,sx=-20+(Math.floor(nSeats/2)-2)*sw+sw/2,sy=nY+12+8;return(<g><line x1={sx} y1={sy-5} x2={sx} y2={sy-22} stroke={C.gold} strokeWidth="2" strokeDasharray="3,2"/><circle cx={sx} cy={sy-28} r="13" fill={C.gold} opacity="0.95"/><text x={sx} y={sy-23} fill="#0A3D1F" fontSize="12" fontWeight="900" textAnchor="middle">★</text><text x={sx} y={sy-44} fill={C.gold} fontSize="10" fontWeight="bold" textAnchor="middle">YOU</text></g>)})()}
          <rect x="12" y={H-52} width="205" height="42" rx="9" fill="rgba(0,0,0,0.65)"/>
          <text x="26" y={H-31} fill={C.gold} fontSize="10.5" fontWeight="bold">Section {section?.label} · Row G · Seat 14</text>
          <text x="26" y={H-14} fill="rgba(255,255,255,0.38)" fontSize="9">Home sideline · ~30 yds from field</text>
        </svg>
        <div style={{padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:18}}>
            {[{label:'Row',val:'G'},{label:'Seat',val:'14'},{label:'Level',val:'Lower Bowl'}].map((it,i)=>(
              <div key={i}><div style={{fontSize:9,color:C.text3,fontWeight:600,marginBottom:2,fontFamily:F.mono}}>{it.label}</div><div style={{fontFamily:F.head,fontWeight:700,fontSize:18,color:'white'}}>{it.val}</div></div>
            ))}
          </div>
          <button onClick={onConfirm} style={{padding:'10px 20px',borderRadius:12,background:C.green,color:'white',fontFamily:F.head,fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>Select These Seats →</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW — EVENT LIST  (StubHub-style)
═══════════════════════════════════════════════════════════════════════════ */
function ListView({onSelect}){
  const [sport,setSport]=useState('all')
  const sports=['all',...Array.from(new Set(GAMES.map(g=>g.sport)))]
  const filtered=sport==='all'?GAMES:GAMES.filter(g=>g.sport===sport)
  return(
    <div style={{minHeight:'100vh',background:C.pageBg,fontFamily:F.body}}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:'20px 16px 0'}}>
        <p style={{color:C.muted,fontFamily:F.mono,fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',margin:'0 0 4px'}}>PEAK UNIVERSITY MOUNTAINEERS</p>
        <h1 style={{fontFamily:F.head,fontSize:32,fontWeight:800,color:C.text,margin:'0 0 16px',letterSpacing:'-0.03em'}}>Ticket Hub</h1>
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:14,scrollbarWidth:'none'}}>
          {sports.map(sp=>{
            const info=SPORTS.find(s=>s.id===sp)
            return(
              <button key={sp} onClick={()=>setSport(sp)} style={{flexShrink:0,padding:'6px 13px',borderRadius:20,border:sport===sp?`1.5px solid ${C.green}`:`1.5px solid ${C.border}`,background:sport===sp?C.primarySub:'transparent',color:sport===sp?C.green:C.text3,fontFamily:F.body,fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.15s'}}>
                {sp==='all'?'All Events':`${info?.icon} ${info?.label}`}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{padding:'10px 16px 4px'}}>
        <span style={{color:C.muted,fontFamily:F.mono,fontSize:10,letterSpacing:'0.08em'}}>{filtered.length} UPCOMING EVENT{filtered.length!==1?'S':''}</span>
      </div>
      <div style={{padding:'4px 12px 100px',display:'flex',flexDirection:'column',gap:9}}>
        {filtered.map(game=><GameCard key={game.id} game={game} onSelect={onSelect}/>)}
      </div>
    </div>
  )
}

function GameCard({game,onSelect}){
  const [hov,setHov]=useState(false)
  const uc=urgencyColor(game.urgency.pct)
  const sp=SPORTS.find(s=>s.id===game.sport)
  return(
    <div onClick={()=>onSelect(game)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?C.cardHover:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'all 0.14s'}}>
      {game.badge&&(
        <div style={{background:`${game.badge.color}14`,borderBottom:`1px solid ${game.badge.color}3A`,padding:'4px 14px',display:'flex',alignItems:'center',gap:6}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:game.badge.color,display:'inline-block',flexShrink:0}}/>
          <span style={{fontFamily:F.mono,fontSize:9.5,fontWeight:700,color:game.badge.color,letterSpacing:'0.1em'}}>{game.badge.label}</span>
        </div>
      )}
      <div style={{display:'flex',alignItems:'stretch',padding:'13px 14px'}}>
        <div style={{minWidth:62,marginRight:13,paddingRight:13,borderRight:`1px solid ${C.borderLight}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontFamily:F.body,fontSize:10,color:C.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{game.dayLabel}</span>
          <span style={{fontFamily:F.head,fontSize:15,fontWeight:800,color:C.text,lineHeight:1.1,textAlign:'center'}}>{game.dateLabel}</span>
          <span style={{fontFamily:F.mono,fontSize:9.5,color:C.text3,marginTop:3}}>{game.time}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>
            <span style={{fontSize:13}}>{sp?.icon}</span>
            <span style={{fontFamily:F.mono,fontSize:9.5,color:C.muted,letterSpacing:'0.08em',textTransform:'uppercase'}}>{sp?.label}</span>
          </div>
          <p style={{fontFamily:F.head,fontSize:15,fontWeight:700,color:C.text,margin:'0 0 2px',lineHeight:1.25,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {game.opponent}<span style={{fontFamily:F.body,fontWeight:400,color:C.text3,fontSize:11}}> ({game.record})</span>
          </p>
          <p style={{fontFamily:F.body,fontSize:12,color:C.text3,margin:'0 0 6px'}}>{game.venue}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {game.urgency.hot&&(
              <span style={{display:'flex',alignItems:'center',gap:4,background:`${C.error}15`,border:`1px solid ${C.error}40`,borderRadius:10,padding:'2px 7px'}}>
                <span style={{fontSize:9}}>🔥</span><span style={{fontFamily:F.mono,fontSize:9,color:C.error,fontWeight:700}}>SELLING FAST</span>
              </span>
            )}
            {game.urgency.pct<=20&&(
              <span style={{display:'flex',alignItems:'center',gap:4,background:`${uc}12`,border:`1px solid ${uc}38`,borderRadius:10,padding:'2px 7px'}}>
                <span style={{fontFamily:F.mono,fontSize:9,color:uc,fontWeight:600}}>Less than {game.urgency.pct}% remaining</span>
              </span>
            )}
          </div>
        </div>
        <div style={{marginLeft:10,display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'center',gap:2}}>
          <span style={{fontFamily:F.mono,fontSize:9,color:C.muted}}>from</span>
          <span style={{fontFamily:F.head,fontSize:17,fontWeight:800,color:C.gold}}>${game.priceFrom}</span>
          <span style={{color:C.muted,fontSize:16}}>›</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW — QUANTITY PICKER
═══════════════════════════════════════════════════════════════════════════ */
function QuantityView({game,onConfirm,onBack}){
  const [qty,setQty]=useState(2)
  const sp=SPORTS.find(s=>s.id===game.sport)
  return(
    <div style={{minHeight:'100vh',background:C.pageBg,fontFamily:F.body,display:'flex',flexDirection:'column'}}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:'14px 16px'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:C.text2,fontFamily:F.body,fontSize:14,cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:5}}>‹ All Events</button>
      </div>
      <div style={{background:C.pageBg,borderBottom:`1px solid ${C.borderLight}`,padding:'11px 16px',display:'flex',alignItems:'center',gap:11}}>
        <span style={{fontSize:20}}>{sp?.icon}</span>
        <div>
          <p style={{fontFamily:F.head,fontSize:14,fontWeight:700,color:C.text,margin:0}}>Mountaineers vs {game.opponent}</p>
          <p style={{fontFamily:F.mono,fontSize:10,color:C.text3,margin:'2px 0 0'}}>{game.dayLabel} {game.dateLabel} · {game.time}</p>
        </div>
        {game.badge&&<span style={{marginLeft:'auto',fontFamily:F.mono,fontSize:9,color:game.badge.color,border:`1px solid ${game.badge.color}44`,background:`${game.badge.color}14`,borderRadius:8,padding:'3px 8px',flexShrink:0}}>{game.badge.label}</span>}
      </div>
      <div style={{flex:1,padding:'28px 20px',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <h2 style={{fontFamily:F.head,fontSize:28,fontWeight:800,color:C.text,margin:'0 0 6px',textAlign:'center'}}>How many tickets?</h2>
        <p style={{fontFamily:F.body,fontSize:14,color:C.text3,margin:'0 0 28px',textAlign:'center'}}>Seats will be together in the same section</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,width:'100%',maxWidth:320,marginBottom:20}}>
          {[1,2,3,4,5,6].map(n=>(
            <button key={n} onClick={()=>setQty(n)} style={{aspectRatio:'1',borderRadius:12,border:qty===n?`2px solid ${C.gold}`:`1.5px solid ${C.border}`,background:qty===n?C.goldBg:C.card,color:qty===n?C.gold:C.text2,fontFamily:F.head,fontSize:22,fontWeight:800,cursor:'pointer',transition:'all 0.13s'}}>{n}</button>
          ))}
        </div>
        {qty>=4&&(
          <div style={{background:'linear-gradient(135deg,#16110C,#2D1A00)',border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:'10px 16px',marginBottom:20,width:'100%',maxWidth:320,display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:14}}>🎉</span>
            <div>
              <div style={{fontFamily:F.head,fontWeight:700,fontSize:12,color:C.gold}}>{getBundle(qty)?.label}</div>
              <div style={{fontFamily:F.mono,fontSize:9,color:C.text3,marginTop:1}}>Auto-applied at checkout</div>
            </div>
          </div>
        )}
        <p style={{fontFamily:F.body,fontSize:12,color:C.muted,textAlign:'center',marginBottom:32}}>Need more than 6? Contact Group Sales →</p>
        <button onClick={()=>onConfirm(qty)} style={{width:'100%',maxWidth:320,padding:'15px 24px',borderRadius:12,border:'none',background:C.green,color:'white',fontFamily:F.head,fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 0 20px ${C.gold}44`}}>
          Find {qty} {qty===1?'Ticket':'Tickets'} →
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW — SELECT SEATS  (map + seat picker + concessions + live cart)
═══════════════════════════════════════════════════════════════════════════ */
function SelectView({game,quantity,onConfirm,onBack}){
  const [activeSection,setSection]=useState(null)
  const [selectedSeats,setSeats]=useState([])
  const [showSeatView,setSeatView]=useState(false)
  const [concessions,setCons]=useState({})
  const [loaded,setLoaded]=useState(false)
  const sp=SPORTS.find(s=>s.id===game.sport)

  useEffect(()=>{const t=setTimeout(()=>setLoaded(true),80);return()=>clearTimeout(t)},[])

  const allSections=useMemo(()=>{
    switch(game.sport){
      case 'basketball': case 'volleyball': return buildBBSections().all
      case 'baseball':   return buildBaseSections()
      case 'softball':   return buildSoftSections()
      default:           return buildFootSections().all
    }
  },[game.sport])

  const secObj=allSections.find(s=>s.id===activeSection)
  const bundle=getBundle(selectedSeats.length)
  const tickSub=secObj?secObj.price*selectedSeats.length:0
  const disc=tickSub*(bundle?.pct||0)
  const concTotal=Object.entries(concessions).reduce((sum,[id,q])=>{const item=CONCESSIONS.find(c=>c.id===id);return sum+(item?item.price*q:0)},0)
  const concCount=Object.values(concessions).reduce((a,b)=>a+b,0)
  const fees=secObj&&selectedSeats.length>0?selectedSeats.length*2.50:0
  const total=tickSub-disc+concTotal+fees
  const adj=(id,d)=>setCons(prev=>{const n={...prev},cur=n[id]||0,nv=Math.max(0,cur+d);if(nv===0)delete n[id];else n[id]=nv;return n})

  return(
    <div style={{fontFamily:F.body,display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:C.pageBg}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .sv-layout{display:flex;flex:1;overflow:hidden;min-height:0}
        .sv-main{flex:1;overflow-y:auto;padding:12px 14px 60px;min-width:0}
        .sv-cart{width:268px;flex-shrink:0;border-left:1px solid ${C.border};overflow-y:auto;background:${C.card}}
        @media(max-width:768px){.sv-layout{flex-direction:column}.sv-cart{width:100%!important;border-left:none!important;border-top:1px solid ${C.border};max-height:260px}}
      `}</style>

      {showSeatView&&secObj&&<SeatView section={secObj} onClose={()=>setSeatView(false)} onConfirm={()=>setSeatView(false)}/>}

      {/* Header */}
      <div style={{padding:'11px 14px 8px',flexShrink:0,background:C.card,borderBottom:`1px solid ${C.border}`,opacity:loaded?1:0,transform:loaded?'none':'translateY(-4px)',transition:'opacity 0.35s,transform 0.35s'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:C.text2,fontFamily:F.body,fontSize:13,cursor:'pointer',padding:0,marginBottom:6,display:'flex',alignItems:'center',gap:4}}>‹ Change Quantity</button>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <span style={{fontSize:18}}>{sp?.icon}</span>
          <div>
            <div style={{fontFamily:F.head,fontSize:18,fontWeight:700,color:C.text}}>Mountaineers vs {game.opponent}</div>
            <div style={{fontFamily:F.mono,fontSize:10,color:C.text3,marginTop:1}}>{game.dayLabel} {game.dateLabel} · {game.time} · {game.venue}</div>
          </div>
          <div style={{marginLeft:'auto',background:C.goldBg,border:`1px solid ${C.goldBorder}`,borderRadius:8,padding:'4px 10px',textAlign:'center',flexShrink:0}}>
            <div style={{fontFamily:F.mono,fontSize:8,color:C.muted}}>QTY</div>
            <div style={{fontFamily:F.head,fontSize:15,fontWeight:800,color:C.gold}}>{quantity}</div>
          </div>
        </div>
      </div>

      <div className="sv-layout">
        {/* ── Main column ──────────────────────────────────────────────── */}
        <div className="sv-main">
          {selectedSeats.length>=4&&(
            <div style={{padding:'9px 13px',borderRadius:10,marginBottom:10,background:'linear-gradient(135deg,#16110C,#2D1A00)',border:`1px solid ${C.goldBorder}`,display:'flex',alignItems:'center',gap:8,animation:'fadeIn 0.3s ease'}}>
              <span style={{fontSize:14}}>🎉</span>
              <div>
                <div style={{fontFamily:F.head,fontWeight:700,fontSize:12,color:C.gold}}>{bundle?.label}</div>
                {secObj&&<div style={{fontFamily:F.mono,fontSize:9.5,color:C.text3,marginTop:1}}>Saving ${disc.toFixed(2)} on {selectedSeats.length} tickets</div>}
              </div>
            </div>
          )}
          <div style={{marginBottom:10}}>
            <StadiumMap sport={game.sport} activeSection={activeSection} onSelect={s=>{setSection(s.id);setSeats([])}}/>
          </div>
          {secObj&&(
            <button onClick={()=>setSeatView(true)} style={{width:'100%',padding:'9px',borderRadius:10,marginBottom:10,border:`1px solid ${C.goldBorder}`,background:C.goldBg,color:C.gold,fontFamily:F.body,fontWeight:600,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview View from Section {secObj.label}
            </button>
          )}
          {secObj&&(<div style={{marginBottom:14}}><SeatPicker sectionId={secObj.label} selectedSeats={selectedSeats} onSelect={setSeats}/></div>)}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
              <div style={{fontFamily:F.head,fontSize:14,fontWeight:700,color:C.text}}>Food & Drinks</div>
              <div style={{fontFamily:F.mono,fontSize:8,padding:'2px 7px',borderRadius:20,background:C.goldBg,color:C.gold,border:`1px solid ${C.goldBorder}`}}>OPTIONAL</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(135px,1fr))',gap:7}}>
              {CONCESSIONS.map((item,i)=>{
                const q=concessions[item.id]||0
                return(
                  <div key={item.id} style={{background:C.card,borderRadius:10,padding:'10px 11px',border:`1px solid ${q>0?C.gold:C.border}`,transition:'border-color 0.15s',opacity:loaded?1:0,transitionDelay:`${i*0.04}s`}}>
                    <div style={{fontSize:17,marginBottom:4}}>{item.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:1}}>{item.name}</div>
                    <div style={{fontSize:10,color:C.text3,marginBottom:7}}>{item.desc}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontFamily:F.mono,fontSize:11,fontWeight:600,color:C.gold}}>${item.price}</span>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {q>0&&<button onClick={()=>adj(item.id,-1)} style={{width:19,height:19,borderRadius:'50%',border:`1px solid ${C.border}`,background:C.bg,color:C.text2,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>}
                        {q>0&&<span style={{fontFamily:F.mono,fontSize:11,fontWeight:600,color:C.text,minWidth:10,textAlign:'center'}}>{q}</span>}
                        <button onClick={()=>adj(item.id,1)} style={{width:19,height:19,borderRadius:'50%',border:`1px solid ${q>0?C.gold:C.border}`,background:q>0?C.gold:C.bg,color:q>0?'white':C.text2,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.13s'}}>+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Cart column ──────────────────────────────────────────────── */}
        <div className="sv-cart">
          <div style={{padding:'12px 14px',background:C.card,position:'sticky',top:0,borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontFamily:F.head,fontWeight:700,fontSize:14,color:C.text}}>Order Summary</div>
            <div style={{fontFamily:F.mono,fontSize:8,color:C.muted,marginTop:1,letterSpacing:'0.06em'}}>PEAK · {game.sport.toUpperCase()}</div>
          </div>
          <div style={{padding:'12px 14px'}}>
            {!secObj?(
              <div style={{textAlign:'center',padding:'22px 0'}}>
                <div style={{fontSize:26,marginBottom:6}}>🏟️</div>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>Select a Section</div>
                <div style={{fontSize:10.5,color:C.text3}}>Tap any section on the map</div>
              </div>
            ):selectedSeats.length===0?(
              <div style={{padding:'10px 12px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:12,color:C.text}}>Section {secObj.label}</div>
                <div style={{fontSize:10.5,color:C.text3,marginTop:1}}>{zoneLabel(secObj.zone)} · ${secObj.price}/seat</div>
                <div style={{fontSize:11,color:C.text3,marginTop:5}}>→ Pick seats in the grid below the map</div>
              </div>
            ):(
              <>
                <div style={{padding:'9px 11px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:12,color:C.text}}>Section {secObj.label}</div>
                  <div style={{fontSize:10,color:C.gold,marginTop:2,fontFamily:F.mono}}>{selectedSeats.join(', ')}</div>
                </div>
                {bundle?.pct>0&&<div style={{fontSize:10.5,color:C.green,fontWeight:600,marginBottom:7}}>✓ {bundle.label}</div>}
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                    <span style={{color:C.text2}}>{selectedSeats.length} seats × ${secObj.price}</span><span style={{fontWeight:600,color:C.text}}>${tickSub.toFixed(2)}</span>
                  </div>
                  {disc>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.green,fontWeight:600,marginBottom:4}}><span>Group discount</span><span>−${disc.toFixed(2)}</span></div>}
                  {concTotal>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.text2,marginBottom:4}}><span>Food ({concCount} items)</span><span>${concTotal.toFixed(2)}</span></div>}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.text3,marginBottom:8}}><span>Facility fee</span><span>${fees.toFixed(2)}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:`2px solid ${C.gold}`,paddingTop:8,marginBottom:10}}>
                    <span style={{fontFamily:F.head,fontWeight:700,fontSize:13,color:C.text}}>Total</span>
                    <span style={{fontFamily:F.mono,fontWeight:600,fontSize:19,color:C.gold}}>${total.toFixed(2)}</span>
                  </div>
                </div>
                {Object.entries(concessions).length>0&&(
                  <div style={{marginBottom:8}}>
                    {Object.entries(concessions).map(([id,q])=>{const item=CONCESSIONS.find(c=>c.id===id);return item?(<div key={id} style={{display:'flex',justifyContent:'space-between',fontSize:10.5,color:C.text2,marginBottom:2}}><span>{item.icon} {item.name} ×{q}</span><span>${(item.price*q).toFixed(2)}</span></div>):null})}
                  </div>
                )}
                <button
                  onClick={()=>secObj&&selectedSeats.length>0&&onConfirm({section:secObj,seats:selectedSeats,concessions,total,disc,concTotal,fees})}
                  style={{width:'100%',padding:'11px',borderRadius:10,border:'none',background:C.bgDeep,color:C.gold,fontFamily:F.head,fontWeight:700,fontSize:13,cursor:'pointer',marginBottom:7,transition:'opacity 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                >
                  Complete Purchase →
                </button>
                <div style={{display:'flex',alignItems:'center',gap:5,padding:'7px 9px',borderRadius:7,background:C.bg}}>
                  <svg style={{width:11,height:11,color:C.gold,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span style={{fontSize:10,color:C.text3}}>Secure · Official Peak tickets</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW — CONFIRMATION
═══════════════════════════════════════════════════════════════════════════ */
function ConfirmView({game,orderData,onDone}){
  const sp=SPORTS.find(s=>s.id===game.sport)
  const orderNum=`PU-${Math.floor(Math.random()*90000+10000)}`
  return(
    <div style={{padding:'28px 16px',maxWidth:480,margin:'0 auto',fontFamily:F.body,background:C.pageBg}}>
      <style>{`@keyframes successPop{from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{background:C.card,borderRadius:20,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
        <div style={{padding:'32px 24px',textAlign:'center',background:C.pageBg}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(239,160,32,0.18)',border:`2px solid ${C.goldBorder}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',animation:'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both'}}>
            <svg style={{width:24,height:24}} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{fontFamily:F.head,fontSize:30,fontWeight:800,color:'white',marginBottom:4}}>You're In!</div>
          <div style={{fontFamily:F.mono,fontSize:9.5,color:C.muted,letterSpacing:'0.1em'}}>{sp?.icon} GO MOUNTAINEERS!</div>
        </div>
        <div style={{padding:'20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
            {[
              {label:'Section',value:orderData.section.label},
              {label:'Seats',  value:orderData.seats.slice(0,4).join(', ')+(orderData.seats.length>4?'...':'')},
              {label:'Food',   value:Object.keys(orderData.concessions).length>0?`${Object.values(orderData.concessions).reduce((a,b)=>a+b,0)} items`:'None'},
              {label:'Total',  value:`$${orderData.total.toFixed(2)}`,gold:true},
            ].map((it,i)=>(
              <div key={i} style={{padding:'10px 12px',borderRadius:8,background:C.bg}}>
                <div style={{fontFamily:F.mono,fontSize:8.5,color:C.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:3}}>{it.label}</div>
                <div style={{fontFamily:F.mono,fontWeight:600,fontSize:13,color:it.gold?C.gold:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.value}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'10px',borderRadius:8,background:'#0D2008',border:`1px solid ${C.primaryBdr}`,marginBottom:12,fontSize:11.5,color:C.green,textAlign:'center'}}>📧 Confirmation + mobile tickets sent</div>
          <div style={{fontFamily:F.mono,fontSize:9,color:C.muted,textAlign:'center',marginBottom:12}}>ORDER #{orderNum}</div>
          <button onClick={onDone} style={{width:'100%',padding:12,borderRadius:10,border:'none',background:C.bgDeep,color:C.gold,fontFamily:F.head,fontWeight:700,fontSize:14,cursor:'pointer'}}>← Browse More Events</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function DemoTicketing(){
  const [view,     setView]     = useState('list')
  const [game,     setGame]     = useState(null)
  const [quantity, setQuantity] = useState(2)
  const [orderData,setOrderData]= useState(null)

  const handleSelectGame = g  => { setGame(g);  setView('quantity') }
  const handleSelectQty  = q  => { setQuantity(q); setView('select') }
  const handleConfirm    = d  => { setOrderData(d); setView('confirm') }
  const handleReset      = () => { setView('list'); setGame(null); setOrderData(null); setQuantity(2) }

  return(
    <div style={{fontFamily:F.body,background:C.pageBg,minHeight:'100%'}}>
      {view==='list'    &&<ListView    onSelect={handleSelectGame}/>}
      {view==='quantity'&&<QuantityView game={game} onConfirm={handleSelectQty} onBack={handleReset}/>}
      {view==='select'  &&<SelectView  game={game} quantity={quantity} onConfirm={handleConfirm} onBack={()=>setView('quantity')}/>}
      {view==='confirm' &&<ConfirmView game={game} orderData={orderData} onDone={handleReset}/>}
    </div>
  )
}
