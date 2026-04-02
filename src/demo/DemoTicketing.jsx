import React, { useState, useEffect } from 'react'
import { DS } from './DemoConstants'

// ── Color constants ───────────────────────────────────────────────────────────
const C = {
  gold: DS.gold, green: '#0A3D1F', greenMid: '#1A5C22', greenLight: '#2D7A3A',
  lime: '#C4882A', bg: DS.bg, card: DS.card,
}

// ── Sports config ─────────────────────────────────────────────────────────────
const SPORTS = [
  { id:'football',   label:'Football',      icon:'🏈', venue:'Peak Sports Stadium',   cap:12000 },
  { id:'basketball', label:'Basketball',    icon:'🏀', venue:'Simple Genius Arena',    cap:4500  },
  { id:'volleyball', label:'Volleyball',    icon:'🏐', venue:'Simple Genius Arena',    cap:2200  },
  { id:'softball',   label:'Softball',      icon:'🥎', venue:'Wildcat Softball Complex',cap:1800 },
  { id:'baseball',   label:'Baseball',      icon:'⚾', venue:'Wildcat Baseball Park',  cap:2400  },
  { id:'events',     label:'Special Events',icon:'🎤', venue:'Peak Sports Stadium',    cap:12000 },
]

const PRICE_MAP = {
  football:   { home:42, away:28, north_ez:18, south_ez:18, corner:24, upper:15 },
  basketball: { home:55, away:35, north_ez:22, south_ez:22, corner:30, upper:18 },
  volleyball: { home:18, away:12, north_ez:10, south_ez:10, corner:12, upper:8  },
  softball:   { home:14, away:10, north_ez:8,  south_ez:8,  corner:10, upper:6  },
  baseball:   { home:16, away:12, north_ez:10, south_ez:10, corner:12, upper:8  },
  events:     { home:85, away:65, north_ez:45, south_ez:45, corner:55, upper:35 },
}

const CONCESSIONS = [
  {id:'c1',name:'Hot Dog Combo',   price:12,icon:'🌭',desc:'Dog + chips + drink'},
  {id:'c2',name:'Nachos',          price:10,icon:'🧀',desc:'Loaded stadium nachos'},
  {id:'c3',name:'Craft Beer',      price:9, icon:'🍺',desc:'Local Wildcat Brewing'},
  {id:'c4',name:'Soft Drink',      price:5, icon:'🥤',desc:'Fountain + free refill'},
  {id:'c5',name:'Wildcat Burger',  price:14,icon:'🍔',desc:'Signature game-day burger'},
  {id:'c6',name:'Popcorn',         price:7, icon:'🍿',desc:'Butter or kettle corn'},
]

const BUNDLES = [
  {min:1, max:3, pct:0,   label:''},
  {min:4, max:7, pct:0.08,label:'Group Discount — 8% off'},
  {min:8, max:11,pct:0.12,label:'Group Discount — 12% off'},
  {min:12,max:99,pct:0.18,label:'Group Rate — 18% off'},
]
const getBundle = qty => BUNDLES.find(b=>qty>=b.min&&qty<=b.max)

// ── Stadium map helpers ───────────────────────────────────────────────────────
const toRad = d => d * Math.PI / 180
const cx=255, cy=258
const ovalPt = (rx,ry,deg) => [cx+rx*Math.cos(toRad(deg)), cy+ry*Math.sin(toRad(deg))]

const makePath = (a1,a2,iRx,iRy,oRx,oRy) => {
  const p1=ovalPt(iRx,iRy,a1),p2=ovalPt(iRx,iRy,a2)
  const p3=ovalPt(oRx,oRy,a2),p4=ovalPt(oRx,oRy,a1)
  const lg=(a2-a1)>180?1:0
  return `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${iRx} ${iRy} 0 ${lg} 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} L${p3[0].toFixed(1)} ${p3[1].toFixed(1)} A${oRx} ${oRy} 0 ${lg} 0 ${p4[0].toFixed(1)} ${p4[1].toFixed(1)}Z`
}

const getZone = a => {
  const n=((a%360)+360)%360
  if(n>250&&n<290) return 'north_ez'
  if(n>70&&n<110)  return 'south_ez'
  if(n>135&&n<225) return 'home'
  if(n>315||n<45)  return 'away'
  return 'corner'
}

const zoneFill = (zone,level,isActive,isHover,sold) => {
  if(isActive) return C.gold
  if(sold)     return 'rgba(255,255,255,0.06)'
  if(level==='upper') {
    const map={home:'#1e3f6e',away:'#1a3560',north_ez:'#1a3458',south_ez:'#1a3458',corner:'#182f54'}
    return isHover?'#2a5a8e':(map[zone]||'#1a3252')
  }
  const map={home:'#0a5028',away:'#1a4a3a',north_ez:'#1e6b44',south_ez:'#1e7044',corner:'#226040'}
  return isHover?'#1a7040':(map[zone]||'#1e6040')
}

const lb={iRx:102,iRy:136,oRx:162,oRy:200}
const ud={iRx:170,iRy:208,oRx:228,oRy:258}
const gap=1.4
const soldLower=new Set([4,11,19])
const soldUpper=new Set([2,14,22,28])

const buildSections = (sport) => {
  const prices = PRICE_MAP[sport]||PRICE_MAP.football
  const lower = Array.from({length:26},(_,i)=>{
    const step=360/26
    const a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2
    const zone=getZone(mid)
    return {id:String(101+i),label:String(101+i),zone,mid,sold:soldLower.has(i),level:'lower',
      price:prices[zone]||prices.home,
      path:makePath(a1,a2,lb.iRx,lb.iRy,lb.oRx,lb.oRy),
      lx:ovalPt((lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[0],
      ly:ovalPt((lb.iRx+lb.oRx)/2,(lb.iRy+lb.oRy)/2,mid)[1]}
  })
  const upper = Array.from({length:32},(_,i)=>{
    const step=360/32
    const a1=i*step+gap/2,a2=(i+1)*step-gap/2,mid=(a1+a2)/2
    const zone=getZone(mid)
    return {id:String(201+i),label:String(201+i),zone,mid,sold:soldUpper.has(i),level:'upper',
      price:prices.upper||15,
      path:makePath(a1,a2,ud.iRx,ud.iRy,ud.oRx,ud.oRy),
      lx:ovalPt((ud.iRx+ud.oRx)/2,(ud.iRy+ud.oRy)/2,mid)[0],
      ly:ovalPt((ud.iRx+ud.oRx)/2,(ud.iRy+ud.oRy)/2,mid)[1]}
  })
  return [...lower,...upper]
}

const zoneLabel = z=>({home:'Home Sideline',away:'Away Sideline',north_ez:'North End Zone',south_ez:'South End Zone',corner:'Corner Section'}[z]||z)

// ── Stadium Map component ─────────────────────────────────────────────────────
function StadiumMap({activeSection,onSelect,sport}) {
  const [hovered,setHovered] = useState(null)
  const sections = buildSections(sport)
  const lower = sections.filter(s=>s.level==='lower')
  const upper = sections.filter(s=>s.level==='upper')
  const activeSec = sections.find(s=>s.id===activeSection)
  const hovSec    = sections.find(s=>s.id===hovered)
  const display   = activeSec||hovSec

  return (
    <div style={{background:'#120d06',borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{padding:'12px 16px 8px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:C.lime,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:3}}>Interactive Seating Chart</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'white'}}>Select Your Section</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {[{c:'#0a5028',l:'Lower Bowl'},{c:'#1e3f6e',l:'Upper Deck'},{c:'rgba(255,255,255,0.06)',l:'Sold Out'}].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end'}}>
              <div style={{width:10,height:10,borderRadius:2,background:item.c,border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}/>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.4)'}}>{item.l}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 510 520" style={{width:'100%',display:'block'}}>
        <rect width="510" height="520" fill="#120d06"/>
        <ellipse cx={cx} cy={cy} rx="245" ry="270" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>

        {upper.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)}
            onMouseEnter={()=>!s.sold&&setHovered(s.id)}
            onMouseLeave={()=>setHovered(null)}
            style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={zoneFill(s.zone,s.level,s.id===activeSection,s.id===hovered,s.sold)}
              stroke="#120d06" strokeWidth="1.2" style={{transition:'fill 0.15s ease'}}/>
            <text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)}
              fill={s.sold?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.6)'}
              fontSize="5.5" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text>
          </g>
        ))}

        {lower.map(s=>(
          <g key={s.id} onClick={()=>!s.sold&&onSelect(s)}
            onMouseEnter={()=>!s.sold&&setHovered(s.id)}
            onMouseLeave={()=>setHovered(null)}
            style={{cursor:s.sold?'default':'pointer'}}>
            <path d={s.path} fill={zoneFill(s.zone,s.level,s.id===activeSection,s.id===hovered,s.sold)}
              stroke="#120d06" strokeWidth="1.5" style={{transition:'fill 0.15s ease'}}/>
            <text x={s.lx.toFixed(1)} y={(s.ly+3).toFixed(1)}
              fill={s.id===activeSection?C.green:s.sold?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.85)'}
              fontSize="7" fontWeight="bold" textAnchor="middle" style={{userSelect:'none',pointerEvents:'none'}}>{s.label}</text>
          </g>
        ))}

        {/* Field */}
        <ellipse cx={cx} cy={cy} rx="95" ry="130" fill="#1a5230" stroke="#226640" strokeWidth="1.5"/>
        {[-4,-3,-2,-1,0,1,2,3,4].map(i=>(
          <line key={i} x1={cx+i*20} y1={cy-118} x2={cx+i*20} y2={cy+118} stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>
        ))}
        <line x1={cx-85} y1={cy} x2={cx+85} y2={cy} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
        {[-3,-2,-1,0,1,2,3].map(i=>(
          <g key={i}>
            <line x1={cx+i*20-8} y1={cy-30} x2={cx+i*20+8} y2={cy-30} stroke="rgba(255,255,255,0.15)" strokeWidth="0.7"/>
            <line x1={cx+i*20-8} y1={cy+30} x2={cx+i*20+8} y2={cy+30} stroke="rgba(255,255,255,0.15)" strokeWidth="0.7"/>
          </g>
        ))}
        {/* Goal posts */}
        {[{y:-128,dir:-1},{y:128,dir:1}].map((gp,gi)=>(
          <g key={gi}>
            <line x1={cx} y1={cy+gp.y} x2={cx} y2={cy+gp.y-gp.dir*20} stroke="rgba(255,215,60,0.7)" strokeWidth="1.5"/>
            <line x1={cx-14} y1={cy+gp.y-gp.dir*20} x2={cx+14} y2={cy+gp.y-gp.dir*20} stroke="rgba(255,215,60,0.7)" strokeWidth="1.2"/>
            <line x1={cx-14} y1={cy+gp.y-gp.dir*20} x2={cx-14} y2={cy+gp.y-gp.dir*38} stroke="rgba(255,215,60,0.7)" strokeWidth="1.2"/>
            <line x1={cx+14} y1={cy+gp.y-gp.dir*20} x2={cx+14} y2={cy+gp.y-gp.dir*38} stroke="rgba(255,215,60,0.7)" strokeWidth="1.2"/>
          </g>
        ))}
        <text x={cx} y={cy+5} fill="rgba(255,255,255,0.1)" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="3" style={{userSelect:'none'}}>FIELD</text>
        <text x={cx} y="18" fill="rgba(255,255,255,0.22)" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>NORTH</text>
        <text x={cx} y="510" fill="rgba(255,255,255,0.22)" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2" style={{userSelect:'none'}}>SOUTH</text>
        <text x="14" y={cy+4} fill="rgba(255,255,255,0.22)" fontSize="8" fontWeight="bold" textAnchor="middle" style={{userSelect:'none'}} transform={`rotate(-90 14 ${cy})`} letterSpacing="1">HOME</text>
        <text x="496" y={cy+4} fill="rgba(255,255,255,0.22)" fontSize="8" fontWeight="bold" textAnchor="middle" style={{userSelect:'none'}} transform={`rotate(90 496 ${cy})`} letterSpacing="1">AWAY</text>
      </svg>

      {/* Info bar */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'10px 16px',minHeight:56,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,background:'rgba(0,0,0,0.3)'}}>
        {display ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
              <div style={{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:12,flexShrink:0,background:display.id===activeSection?C.lime:'rgba(255,255,255,0.08)',color:display.id===activeSection?C.green:'white'}}>
                {display.level==='upper'?'U':'L'}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Section {display.id}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:600,marginTop:2}}>{zoneLabel(display.zone)}</div>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontWeight:600,lineHeight:1,marginBottom:2}}>From</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:display.sold?'#666':C.lime}}>
                {display.sold?'SOLD OUT':`$${display.price}`}
              </div>
            </div>
          </>
        ) : (
          <div style={{fontSize:12,color:'rgba(255,255,255,0.25)',fontWeight:600,margin:'0 auto'}}>Tap a section to see details</div>
        )}
      </div>
    </div>
  )
}

// ── Seat picker ───────────────────────────────────────────────────────────────
function SeatPicker({sectionId,selectedSeats,onSelect}) {
  const rows = ['A','B','C','D','E','F','G','H']
  const takenMap = {C3:true,E7:true,F1:true,B9:true}
  const toggle = id => {
    if(selectedSeats.includes(id)) onSelect(selectedSeats.filter(s=>s!==id))
    else if(selectedSeats.length<8) onSelect([...selectedSeats,id])
  }
  return (
    <div style={{background:DS.card,borderRadius:14,overflow:'hidden',border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm,animation:'fadeIn 0.25s ease'}}>
      <div style={{padding:'12px 16px',background:'#1A5C22',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:C.lime,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Seat Selection</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'white'}}>Section {sectionId}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:3}}>
          {[{c:C.gold,l:'Selected'},{c:'rgba(255,255,255,0.15)',l:'Available'},{c:'rgba(255,255,255,0.06)',l:'Sold'}].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end'}}>
              <div style={{width:8,height:8,borderRadius:2,background:item.c,flexShrink:0}}/>
              <span style={{fontSize:9,color:'rgba(255,255,255,0.5)',fontFamily:"'JetBrains Mono',monospace"}}>{item.l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'12px 14px',background:'white'}}>
        <div style={{textAlign:'center',marginBottom:8,padding:'6px',borderRadius:8,background:'#f8f8f8',fontSize:10,fontWeight:700,color:'#999',letterSpacing:'0.1em'}}>↑ BACK OF SECTION ↑</div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {rows.map(row=>(
            <div key={row} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:24,height:26,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:'#1A5C22',color:'white',fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,flexShrink:0}}>{row}</div>
              <div style={{display:'flex',gap:2,flex:1,flexWrap:'wrap'}}>
                {Array.from({length:12},(_,i)=>{
                  const id=`${row}${i+1}`
                  const taken=takenMap[id]
                  const sel=selectedSeats.includes(id)
                  return (
                    <button key={id} disabled={taken} onClick={()=>toggle(id)} style={{
                      flex:'1 0 0',minWidth:0,height:26,borderRadius:5,
                      border:`2px solid ${sel?C.gold:taken?'#eee':'#e2e8f0'}`,
                      background:sel?C.gold:taken?'#f8f8f8':'white',
                      color:sel?C.green:taken?'#ccc':'#374151',
                      fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
                      cursor:taken?'not-allowed':'pointer',
                      transform:sel?'scale(1.08)':'scale(1)',
                      transition:'all 0.12s ease',
                    }}>{i+1}</button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:8,padding:'6px',borderRadius:8,background:'#f0fdf4',fontSize:10,fontWeight:700,color:'#2D7A3A',letterSpacing:'0.1em'}}>← FIELD SIDE →</div>
      </div>
    </div>
  )
}

// ── Seat view ─────────────────────────────────────────────────────────────────
function SeatView({section,onClose,onConfirm}) {
  const W=800,H=460
  const nL=20,nR=780,nY=360,fL=110,fR=690,fY=178
  const xN=y=>nL+(y/120)*(nR-nL)
  const xF=y=>fL+(y/120)*(fR-fL)
  const blendY=t=>nY+t*(fY-nY)
  const blendX=(yard,t)=>xN(yard)+t*(xF(yard)-xN(yard))
  return (
    <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.88)',animation:'fadeIn 0.2s ease'}}>
      <div style={{width:'100%',maxWidth:750,borderRadius:24,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.5)',background:C.green}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:C.lime,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:3}}>Seat View Preview</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:'white'}}>Section {section?.id} · Row G · Seat 14</div>
          </div>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700}}>×</button>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
          <defs>
            <linearGradient id="sv_sky2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#100b04"/><stop offset="100%" stopColor="#1a1208"/>
            </linearGradient>
            <linearGradient id="sv_field2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a3520"/><stop offset="100%" stopColor="#6b5538"/>
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#sv_sky2)"/>
          {[60,190,340,460,610,740].map((x,i)=>(
            <g key={i}>
              <line x1={x} y1="0" x2={x} y2="68" stroke="rgba(200,200,180,0.08)" strokeWidth="4"/>
              <rect x={x-20} y="62" width="40" height="11" rx="3" fill="rgba(255,255,210,0.5)"/>
              <ellipse cx={x} cy="67" rx="35" ry="18" fill="rgba(255,255,180,0.06)"/>
            </g>
          ))}
          <rect x="0" y="82" width={W} height="96" fill="#0e3d28" opacity="0.9"/>
          {[0,1,2,3,4,5,6].map(r=>(<rect key={r} x="0" y={84+r*12} width={W} height="10" fill={r%2===0?'#0e3d28':'#1a1208'} opacity="0.9"/>))}
          {Array.from({length:100}).map((_,i)=>(<circle key={i} cx={4+i*8} cy={92+(i%5)*9+Math.sin(i)*3} r={2+i%2} fill={['#886E4C','#fff','#3498db','#e74c3c','#2ecc71'][i%5]} opacity="0.55"/>))}
          <polygon points={`${nL},${nY} ${nR},${nY} ${fR},${fY} ${fL},${fY}`} fill="url(#sv_field2)"/>
          {[1,3,5,7,9].map(i=>{const y1=10+i*10,y2=10+(i+1)*10;return(<polygon key={i} points={`${xN(y1)},${nY} ${xN(y2)},${nY} ${xF(y2)},${fY} ${xF(y1)},${fY}`} fill="rgba(0,0,0,0.06)"/>)})}
          {[1,2,3,4,5,6,7,8,9].map(i=>{const yard=10+i*10;return(<line key={i} x1={xN(yard)} y1={nY} x2={xF(yard)} y2={fY} stroke={i===5?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.25)'} strokeWidth={i===5?2.5:1.5}/>)})}
          <line x1={xN(0)} y1={nY} x2={xF(0)} y2={fY} stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"/>
          <line x1={xN(120)} y1={nY} x2={xF(120)} y2={fY} stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"/>
          <line x1={xN(0)} y1={nY} x2={xN(120)} y2={nY} stroke="rgba(255,255,255,0.7)" strokeWidth="3"/>
          <line x1={xF(0)} y1={fY} x2={xF(120)} y2={fY} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
          {[[20,20],[30,30],[40,40],[50,50],[40,60],[30,70],[20,80]].map(([lbl,yard])=>(<text key={yard} x={(xN(yard)+xF(yard))/2} y={(nY+fY)/2+10} fill="rgba(255,255,255,0.3)" fontSize="13" fontWeight="900" textAnchor="middle">{lbl}</text>))}
          {/* Goal posts */}
          {[2,118].map((yard,gi)=>{const gx=(xN(yard)+xF(yard)*2)/3,gy=blendY(0.6),s=0.7;return(<g key={gi}><line x1={gx} y1={gy+22*s} x2={gx} y2={gy-8*s} stroke="rgba(255,215,60,0.85)" strokeWidth="3.5"/><line x1={gx-22*s} y1={gy-8*s} x2={gx+22*s} y2={gy-8*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.5"/><line x1={gx-22*s} y1={gy-8*s} x2={gx-22*s} y2={gy-34*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.5"/><line x1={gx+22*s} y1={gy-8*s} x2={gx+22*s} y2={gy-34*s} stroke="rgba(255,215,60,0.85)" strokeWidth="2.5"/></g>)})}
          {/* Near seat rows */}
          {[0,1,2,3,4].map(row=>{const y=nY+14+row*17,xl=-20-row*30,xr=W+20+row*30,nSeats=28+row*4,sw=(xr-xl)/nSeats;return(<g key={row}><rect x={xl} y={y} width={xr-xl} height="14" fill="#2a1e0e" rx="2"/>{Array.from({length:nSeats}).map((_,si)=>{const sx=xl+si*sw+1.5,isOurs=row===0&&si===Math.floor(nSeats/2)-2;return(<rect key={si} x={sx} y={y+1.5} width={sw-3} height="11" rx="2" fill={isOurs?C.gold:['#2a1e0e','#4a3520','#1a1208'][si%3]} opacity={isOurs?1:0.85} stroke={isOurs?'rgba(255,255,255,0.6)':'none'} strokeWidth={isOurs?1:0}/>)})}</g>)})}
          {/* YOU HERE */}
          {(()=>{const nSeats=28,sw=(W+40)/nSeats,sx=-20+(Math.floor(nSeats/2)-2)*sw+sw/2,sy=nY+14+8;return(<g><line x1={sx} y1={sy-6} x2={sx} y2={sy-24} stroke={C.gold} strokeWidth="2" strokeDasharray="3,2"/><circle cx={sx} cy={sy-30} r="14" fill={C.gold} opacity="0.95"/><text x={sx} y={sy-25} fill={C.green} fontSize="13" fontWeight="900" textAnchor="middle">★</text><text x={sx} y={sy-48} fill={C.gold} fontSize="11" fontWeight="bold" textAnchor="middle">YOU</text></g>)})()}
          <rect x="12" y={H-58} width="220" height="46" rx="10" fill="rgba(0,0,0,0.65)"/>
          <text x="28" y={H-34} fill={C.gold} fontSize="11" fontWeight="bold">Section {section?.id} · Row G · Seat 14</text>
          <text x="28" y={H-16} fill="rgba(255,255,255,0.4)" fontSize="10">{section?.zone==='home'?'~30 yds from near end zone':section?.zone?.includes('ez')?'End zone view — 15 yds out':'Midfield · Home sideline'}</text>
        </svg>
        <div style={{padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,borderTop:'1px solid rgba(255,255,255,0.1)',flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:20}}>
            {[{label:'Row',val:'G'},{label:'Seat',val:'14'},{label:'Level',val:'Lower Bowl'}].map((item,i)=>(
              <div key={i}><div style={{fontSize:10,color:'rgba(255,255,255,0.35)',fontWeight:600,marginBottom:2}}>{item.label}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:'white'}}>{item.val}</div></div>
            ))}
          </div>
          <button onClick={onConfirm} style={{padding:'12px 24px',borderRadius:14,background:C.lime,color:C.green,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,border:'none',cursor:'pointer',transition:'opacity 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Select These Seats →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Ticketing component ──────────────────────────────────────────────────
export default function DemoTicketing() {
  const [sport,setSport]             = useState('football')
  const [activeSection,setSection]   = useState(null)
  const [selectedSeats,setSeats]     = useState([])
  const [showSeatView,setSeatView]   = useState(false)
  const [concessions,setConcessions] = useState({})
  const [stage,setStage]             = useState('browse') // browse | success
  const [loaded,setLoaded]           = useState(false)

  useEffect(()=>{ const t=setTimeout(()=>setLoaded(true),80); return()=>clearTimeout(t) },[])

  // Reset section when sport changes
  useEffect(()=>{ setSection(null); setSeats([]) },[sport])

  const sections = buildSections(sport)
  const secObj = sections.find(s=>s.id===activeSection)
  const bundle = getBundle(selectedSeats.length)
  const ticketSub = secObj ? secObj.price * selectedSeats.length : 0
  const discountAmt = ticketSub * (bundle?.pct||0)
  const concTotal = Object.entries(concessions).reduce((sum,[id,q])=>{
    const item=CONCESSIONS.find(c=>c.id===id); return sum+(item?item.price*q:0)
  },0)
  const concCount = Object.values(concessions).reduce((a,b)=>a+b,0)
  const fees = secObj&&selectedSeats.length>0 ? selectedSeats.length*2.5 : 0
  const total = ticketSub - discountAmt + concTotal + fees

  const adj=(id,d)=>setConcessions(prev=>{const n={...prev},cur=n[id]||0,nv=Math.max(0,cur+d);if(nv===0)delete n[id];else n[id]=nv;return n})

  const sportInfo = SPORTS.find(s=>s.id===sport)||SPORTS[0]

  if(stage==='success') return (
    <div style={{padding:'40px 20px',maxWidth:500,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:DS.card,borderRadius:20,overflow:'hidden',boxShadow:DS.shLg}}>
        <div style={{padding:'40px 32px',textAlign:'center',background:'#120d06'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(196,136,42,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',animation:'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both'}}>
            <svg style={{width:30,height:30}} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <style>{`
            @keyframes successPop{from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}
            @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
          `}</style>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:'white',marginBottom:4}}>You're In!</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em'}}>{sportInfo.icon} GO WILDCATS!</div>
        </div>
        <div style={{padding:'24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            {[
              {label:'Section',value:`${secObj?.id} · ${zoneLabel(secObj?.zone||'home')}`},
              {label:'Seats',  value:selectedSeats.slice(0,4).join(', ')+(selectedSeats.length>4?'...':'')},
              {label:'Food',   value:concCount>0?`${concCount} items`:'None added'},
              {label:'Total',  value:`$${total.toFixed(2)}`,gold:true},
            ].map((item,i)=>(
              <div key={i} style={{padding:'12px',borderRadius:10,background:DS.bg}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:3}}>{item.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:14,color:item.gold?DS.gold:DS.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px',borderRadius:10,background:'#f0fdf4',border:'1px solid rgba(10,110,56,0.2)',marginBottom:14,fontSize:12,color:DS.green,textAlign:'center'}}>
            📧 Confirmation + mobile tickets sent to your email
          </div>
          <button onClick={()=>{setStage('browse');setSection(null);setSeats([]);setConcessions({})}}
            style={{width:'100%',padding:13,borderRadius:10,border:'none',background:'#120d06',color:C.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer'}}>← Back to Tickets</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <style>{`
        .dt4-layout{display:flex;flex:1;overflow:hidden;min-height:0}
        .dt4-main  {flex:1;overflow-y:auto;padding:16px 16px 40px;min-width:0}
        .dt4-cart  {width:290px;flex-shrink:0;border-left:1px solid ${DS.borderLight};overflow-y:auto;background:${DS.card}}
        .dt4-sports{display:flex;gap:6px;flex-wrap:wrap}
        @media(max-width:768px){
          .dt4-layout{flex-direction:column}
          .dt4-cart  {width:100%!important;border-left:none!important;border-top:1px solid ${DS.borderLight};max-height:280px}
          .dt4-sports button{font-size:11px!important;padding:5px 10px!important}
        }
      `}</style>

      {showSeatView && secObj && (
        <SeatView section={secObj} onClose={()=>setSeatView(false)} onConfirm={()=>{setSeatView(false)}}/>
      )}

      {/* Top bar */}
      <div style={{padding:'16px 16px 10px',flexShrink:0,opacity:loaded?1:0,transform:loaded?'none':'translateY(-6px)',transition:'opacity 0.4s ease,transform 0.4s ease'}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,marginBottom:4}}>Midland · Ticket Marketplace</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:700,color:DS.text,letterSpacing:'-0.02em',marginBottom:10}}>Ticket Hub</div>

        {/* Sport selector */}
        <div className="dt4-sports">
          {SPORTS.map(sp=>(
            <button key={sp.id} onClick={()=>setSport(sp.id)} style={{
              padding:'6px 12px',borderRadius:8,display:'flex',alignItems:'center',gap:5,
              border:`1.5px solid ${sport===sp.id?DS.gold:DS.border}`,
              background:sport===sp.id?DS.gold:'transparent',
              color:sport===sp.id?'white':DS.text2,
              fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',
              transition:'all 0.15s ease',
            }}><span>{sp.icon}</span>{sp.label}</button>
          ))}
        </div>
      </div>

      <div className="dt4-layout">
        {/* Main content */}
        <div className="dt4-main">

          {/* Bundle banner */}
          {selectedSeats.length>=4 && (
            <div style={{padding:'10px 14px',borderRadius:10,marginBottom:12,background:'linear-gradient(135deg,#16110C,#2D1A00)',border:`1px solid ${DS.goldBorder}`,display:'flex',alignItems:'center',gap:10,animation:'fadeIn 0.3s ease'}}>
              <span style={{fontSize:16}}>🎉</span>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:DS.gold}}>{bundle?.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:1}}>Saving ${discountAmt.toFixed(2)} on {selectedSeats.length} tickets</div>
              </div>
            </div>
          )}

          {/* Stadium Map */}
          <div style={{marginBottom:12}}>
            <StadiumMap activeSection={activeSection} onSelect={s=>{setSection(s.id);setSeats([])}} sport={sport}/>
          </div>

          {/* Seat view button */}
          {secObj && (
            <button onClick={()=>setSeatView(true)} style={{
              width:'100%',padding:'10px',borderRadius:10,marginBottom:12,
              border:`1px solid ${DS.goldBorder}`,background:DS.goldBg,
              color:DS.gold,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,
              cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              transition:'all 0.15s',
            }}>
              <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview View from Section {secObj.id}
            </button>
          )}

          {/* Seat picker */}
          {secObj && (
            <div style={{marginBottom:16}}>
              <SeatPicker sectionId={secObj.id} selectedSeats={selectedSeats} onSelect={setSeats}/>
            </div>
          )}

          {/* Concessions */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:DS.text}}>Food & Drinks</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,padding:'2px 8px',borderRadius:20,background:DS.goldBg,color:DS.gold,border:`1px solid ${DS.goldBorder}`}}>OPTIONAL</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
              {CONCESSIONS.map((item,i)=>{
                const q=concessions[item.id]||0
                return (
                  <div key={item.id} style={{background:DS.card,borderRadius:10,padding:'11px 12px',border:`1px solid ${q>0?DS.gold:DS.borderLight}`,transition:'border-color 0.15s',opacity:loaded?1:0,transitionDelay:`${i*0.04}s`}}>
                    <div style={{fontSize:18,marginBottom:5}}>{item.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:700,color:DS.text,marginBottom:1}}>{item.name}</div>
                    <div style={{fontSize:11,color:DS.text3,marginBottom:8}}>{item.desc}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:DS.gold}}>${item.price}</span>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        {q>0&&<button onClick={()=>adj(item.id,-1)} style={{width:20,height:20,borderRadius:'50%',border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text2,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>}
                        {q>0&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:DS.text,minWidth:10,textAlign:'center'}}>{q}</span>}
                        <button onClick={()=>adj(item.id,1)} style={{width:20,height:20,borderRadius:'50%',border:`1px solid ${q>0?DS.gold:DS.border}`,background:q>0?DS.gold:DS.bg,color:q>0?'white':DS.text2,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.13s'}}>+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="dt4-cart">
          <div style={{padding:'14px 16px',background:'#120d06',position:'sticky',top:0}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'white'}}>Order Summary</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:1,letterSpacing:'0.06em'}}>MIDLAND · {sport.toUpperCase()}</div>
          </div>
          <div style={{padding:'14px 16px'}}>
            {!secObj ? (
              <div style={{textAlign:'center',padding:'24px 0'}}>
                <div style={{fontSize:28,marginBottom:8}}>🏟️</div>
                <div style={{fontSize:13,fontWeight:600,color:DS.text,marginBottom:3}}>Select a Section</div>
                <div style={{fontSize:11.5,color:DS.text3}}>Click any section on the map</div>
              </div>
            ) : selectedSeats.length===0 ? (
              <div style={{textAlign:'center',padding:'16px 0'}}>
                <div style={{padding:'10px 12px',borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.text}}>Section {secObj.id}</div>
                  <div style={{fontSize:11.5,color:DS.text3,marginTop:1}}>{zoneLabel(secObj.zone)} · ${secObj.price}/seat</div>
                </div>
                <div style={{fontSize:12,color:DS.text3}}>Now pick your seats below</div>
              </div>
            ) : (
              <>
                <div style={{padding:'10px 12px',borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.text}}>Section {secObj.id} · {zoneLabel(secObj.zone)}</div>
                  <div style={{fontSize:11,color:DS.gold,marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>{selectedSeats.join(', ')}</div>
                </div>
                {bundle?.pct>0&&(
                  <div style={{fontSize:11,color:DS.green,fontWeight:600,marginBottom:8}}>✓ {bundle.label}</div>
                )}
                <div style={{borderTop:`1px solid ${DS.borderLight}`,paddingTop:10,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                    <span style={{color:DS.text2}}>{selectedSeats.length} seats × ${secObj.price}</span>
                    <span style={{fontWeight:600,color:DS.text}}>${ticketSub.toFixed(2)}</span>
                  </div>
                  {discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.green,fontWeight:600,marginBottom:4}}><span>Group discount</span><span>−${discountAmt.toFixed(2)}</span></div>}
                  {concTotal>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text2,marginBottom:4}}><span>Food ({concCount} items)</span><span>${concTotal.toFixed(2)}</span></div>}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text3,marginBottom:8}}><span>Facility fee</span><span>${fees.toFixed(2)}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:`2px solid ${DS.gold}`,paddingTop:8,marginBottom:12}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:DS.text}}>Total</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:20,color:DS.gold}}>${total.toFixed(2)}</span>
                  </div>
                </div>
                {Object.entries(concessions).length>0&&(
                  <div style={{marginBottom:10}}>
                    {Object.entries(concessions).map(([id,q])=>{const item=CONCESSIONS.find(c=>c.id===id);return item?(<div key={id} style={{display:'flex',justifyContent:'space-between',fontSize:11,color:DS.text2,marginBottom:2}}><span>{item.icon} {item.name} ×{q}</span><span>${(item.price*q).toFixed(2)}</span></div>):null})}
                  </div>
                )}
                <button onClick={()=>setStage('success')} style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:'#120d06',color:C.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:8,transition:'opacity 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  Complete Purchase →
                </button>
                <div style={{display:'flex',alignItems:'center',gap:5,padding:'7px 10px',borderRadius:8,background:DS.bg}}>
                  <svg style={{width:12,height:12,color:DS.gold,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span style={{fontSize:10.5,color:DS.text3}}>Secure · Official Midland tickets</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
