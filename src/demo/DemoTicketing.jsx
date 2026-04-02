import React, { useState, useEffect } from 'react'
import { DS, DEMO_SCHOOL } from './DemoConstants'

// ── Stadium sections with SVG positions ──────────────────────────────────────
const SECTIONS = [
  // Home sideline - chairback (premium)
  { id:'HC1', label:'HC1', name:'Home Chairback', zone:'chairback', price:42, capacity:280, sold:240, desc:'Home sideline · 40-50 yd · Chairback seating',
    svgPath:'M 120,140 L 200,140 L 200,165 L 120,165 Z', textPos:[160,155] },
  { id:'HC2', label:'HC2', name:'Home Chairback', zone:'chairback', price:42, capacity:280, sold:210, desc:'Home sideline · 20-40 yd · Chairback seating',
    svgPath:'M 60,140 L 120,140 L 120,165 L 60,165 Z', textPos:[90,155] },
  { id:'HC3', label:'HC3', name:'Home Chairback', zone:'chairback', price:42, capacity:280, sold:220, desc:'Home sideline · 50-yd center · Chairback seating',
    svgPath:'M 200,140 L 260,140 L 260,165 L 200,165 Z', textPos:[230,155] },
  // Home sideline - bleacher
  { id:'HB1', label:'HB1', name:'Home Bleacher', zone:'bleacher', price:22, capacity:420, sold:310, desc:'Home sideline · 30-50 yd · Bleacher',
    svgPath:'M 110,165 L 210,165 L 210,190 L 110,190 Z', textPos:[160,180] },
  { id:'HB2', label:'HB2', name:'Home Bleacher', zone:'bleacher', price:22, capacity:420, sold:280, desc:'Home sideline · 10-30 yd · Bleacher',
    svgPath:'M 60,165 L 110,165 L 110,190 L 60,190 Z', textPos:[85,180] },
  { id:'HB3', label:'HB3', name:'Home Bleacher', zone:'bleacher', price:22, capacity:420, sold:290, desc:'Home sideline · 50-70 yd · Bleacher',
    svgPath:'M 210,165 L 260,165 L 260,190 L 210,190 Z', textPos:[235,180] },
  // Visitor sideline
  { id:'VIS', label:'VIS', name:'Visitor Side', zone:'visitor', price:18, capacity:380, sold:180, desc:'Visitor sideline bleacher',
    svgPath:'M 60,60 L 260,60 L 260,90 L 60,90 Z', textPos:[160,77] },
  // End zones
  { id:'EZ1', label:'EZ1', name:'East End Zone', zone:'endzone', price:14, capacity:300, sold:200, desc:'East end zone · Video board end',
    svgPath:'M 260,90 L 310,90 L 310,165 L 260,165 Z', textPos:[285,130] },
  { id:'EZ2', label:'EZ2', name:'West End Zone', zone:'endzone', price:14, capacity:300, sold:190, desc:'West end zone · Student section end',
    svgPath:'M 10,90 L 60,90 L 60,165 L 10,165 Z', textPos:[35,130] },
  // VIP / Suite
  { id:'VIP', label:'VIP', name:'Suite Level', zone:'vip', price:120, capacity:80, sold:45, desc:'Premium suites · 50-yd view · All-inclusive',
    svgPath:'M 130,105 L 190,105 L 190,140 L 130,140 Z', textPos:[160,124] },
]

const ZONE_COLOR = {
  chairback: { base:'#1B4332', hover:'#2D6A4F', active:'#C4882A', text:'#fff' },
  bleacher:  { base:'#2D6A4F', hover:'#40916C', active:'#C4882A', text:'#fff' },
  visitor:   { base:'#1A3A5C', hover:'#2563A8', active:'#C4882A', text:'#fff' },
  endzone:   { base:'#374151', hover:'#4B5563', active:'#C4882A', text:'#fff' },
  vip:       { base:'#7C4A00', hover:'#A65E00', active:'#C4882A', text:'#fff' },
}

const CONCESSIONS = [
  { id:'c1', name:'Hot Dog Combo',      price:12, icon:'🌭', desc:'Dog + chips + drink' },
  { id:'c2', name:'Nachos',             price:10, icon:'🧀', desc:'Loaded stadium nachos' },
  { id:'c3', name:'Craft Beer',         price:9,  icon:'🍺', desc:'Local Wildcat Brewing' },
  { id:'c4', name:'Soft Drink',         price:5,  icon:'🥤', desc:'Fountain drink + refill' },
  { id:'c5', name:'Wildcat Burger',     price:14, icon:'🍔', desc:'Signature game-day burger' },
  { id:'c6', name:'Popcorn',            price:7,  icon:'🍿', desc:'Butter or kettle corn' },
]

const BUNDLE_DISCOUNTS = [
  { min:1,  max:3,  pct:0,    label:'' },
  { min:4,  max:7,  pct:0.08, label:'Group Discount — 8% off' },
  { min:8,  max:11, pct:0.12, label:'Group Discount — 12% off' },
  { min:12, max:99, pct:0.18, label:'Group Rate — 18% off' },
]

const getDiscount = qty => BUNDLE_DISCOUNTS.find(b => qty >= b.min && qty <= b.max)

const availPct = s => Math.round(((s.capacity - s.sold) / s.capacity) * 100)
const sectionColor = (s, isActive, isHover) => {
  const zc = ZONE_COLOR[s.zone]
  if (isActive) return zc.active
  if (isHover) return zc.hover
  const pct = availPct(s)
  if (pct < 15) return '#4B5563' // nearly sold out — grey
  return zc.base
}

// ── Availability badge ────────────────────────────────────────────────────────
const AvailBadge = ({ section }) => {
  const pct = availPct(section)
  const color = pct < 15 ? DS.red : pct < 35 ? DS.amber : DS.green
  const label = pct < 15 ? 'Almost Gone' : pct < 35 ? 'Limited' : 'Available'
  return <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:5,background:`${color}18`,color,display:'inline-block'}}>{label} · {section.capacity - section.sold} left</span>
}

export default function DemoTicketing() {
  const s = DEMO_SCHOOL
  const [view, setView] = useState('map') // 'map' | 'field'
  const [selectedSection, setSelectedSection] = useState(null)
  const [hoveredSection, setHoveredSection] = useState(null)
  const [qty, setQty] = useState(2)
  const [concessions, setConcessions] = useState({})
  const [stage, setStage] = useState('browse') // 'browse' | 'checkout' | 'success'
  const [loaded, setLoaded] = useState(false)
  const [sport, setSport] = useState('football')

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t) }, [])

  const discount = getDiscount(qty)
  const ticketSubtotal = selectedSection ? selectedSection.price * qty : 0
  const discountAmt = ticketSubtotal * (discount?.pct || 0)
  const concessionTotal = Object.entries(concessions).reduce((sum, [id, q]) => {
    const item = CONCESSIONS.find(c => c.id === id)
    return sum + (item ? item.price * q : 0)
  }, 0)
  const fees = selectedSection ? qty * 2.5 : 0
  const total = ticketSubtotal - discountAmt + concessionTotal + fees

  const adjustConcession = (id, delta) => {
    setConcessions(prev => {
      const next = { ...prev }
      const cur = next[id] || 0
      const newVal = Math.max(0, cur + delta)
      if (newVal === 0) delete next[id]
      else next[id] = newVal
      return next
    })
  }

  const concessionCount = Object.values(concessions).reduce((a, b) => a + b, 0)

  // Success screen
  if (stage === 'success') return (
    <div style={{padding:'40px 20px',maxWidth:520,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:DS.card,borderRadius:20,overflow:'hidden',boxShadow:DS.shLg}}>
        <div style={{padding:'40px 32px',textAlign:'center',background:'#16110C'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(196,136,42,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',animation:'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both'}}>
            <svg style={{width:30,height:30}} viewBox="0 0 24 24" fill="none" stroke={DS.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <style>{`@keyframes successPop{from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}`}</style>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:'white',marginBottom:4}}>You're In!</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em'}}>GO WILDCATS! 🐱</div>
        </div>
        <div style={{padding:'28px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
            {[
              {label:'Section', value:selectedSection?.name},
              {label:'Seats',   value:`${qty} tickets`},
              {label:'Food & Drinks', value:concessionCount>0?`${concessionCount} items`:'None'},
              {label:'Total',   value:`$${total.toFixed(2)}`, gold:true},
            ].map((item,i)=>(
              <div key={i} style={{padding:'12px 14px',borderRadius:10,background:DS.bg}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:3}}>{item.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:15,color:item.gold?DS.gold:DS.text}}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'14px',borderRadius:10,background:'#f0fdf4',border:'1px solid rgba(10,110,56,0.2)',marginBottom:16,fontSize:12,color:DS.green,textAlign:'center'}}>
            📧 Confirmation + mobile tickets sent to your email
          </div>
          <button onClick={()=>{setStage('browse');setSelectedSection(null);setQty(2);setConcessions({})}}
            style={{width:'100%',padding:13,borderRadius:10,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer'}}>← Back to Tickets</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{`
        .dt3-layout { display: flex; flex: 1; overflow: hidden; min-height: 0; }
        .dt3-main   { flex: 1; overflow-y: auto; padding: 20px 20px 40px; min-width: 0; }
        .dt3-cart   { width: 300px; flex-shrink: 0; border-left: 1px solid ${DS.borderLight}; overflow-y: auto; background: ${DS.card}; }
        .dt3-section-btn { transition: all 0.12s ease; cursor: pointer; }
        .dt3-section-btn:hover { filter: brightness(1.15); }
        @media (max-width: 768px) {
          .dt3-layout { flex-direction: column; }
          .dt3-cart   { width: 100% !important; border-left: none !important; border-top: 1px solid ${DS.borderLight}; max-height: 320px; }
          .dt3-map-wrap { height: 220px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{padding:'16px 20px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:10,marginBottom:14,
          opacity:loaded?1:0,transform:loaded?'none':'translateY(-6px)',transition:'opacity 0.4s ease,transform 0.4s ease'}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,marginBottom:4}}>Midland · Ticket Marketplace</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:700,color:DS.text,letterSpacing:'-0.02em',lineHeight:1.1}}>Ticket Hub</div>
          </div>
          {/* View toggle */}
          <div style={{display:'flex',gap:0,background:DS.bg2,borderRadius:10,padding:3,border:`1px solid ${DS.borderLight}`}}>
            {[{id:'map',label:'Stadium Map',icon:'🏟️'},{id:'field',label:'Field View',icon:'🏈'}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{
                padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',
                background:view===v.id?DS.card:'transparent',
                color:view===v.id?DS.text:DS.text3,
                fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
                boxShadow:view===v.id?DS.shSm:'none',
                transition:'all 0.15s ease',display:'flex',alignItems:'center',gap:5,
              }}><span>{v.icon}</span>{v.label}</button>
            ))}
          </div>
        </div>

        {/* Sport selector */}
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {['football','basketball'].map(sp=>(
            <button key={sp} onClick={()=>{setSport(sp);setSelectedSection(null)}} style={{
              padding:'6px 14px',borderRadius:8,
              border:`1.5px solid ${sport===sp?DS.gold:DS.border}`,
              background:sport===sp?DS.gold:'transparent',
              color:sport===sp?'white':DS.text2,
              fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',
              transition:'all 0.15s ease',
            }}>{sp==='football'?'🏈':'🏀'} {sp.charAt(0).toUpperCase()+sp.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="dt3-layout">
        {/* MAIN — stadium map or field view */}
        <div className="dt3-main">

          {/* Bundle banner */}
          {qty >= 4 && (
            <div style={{
              padding:'10px 16px',borderRadius:10,marginBottom:14,
              background:`linear-gradient(135deg, #16110C, #2D1A00)`,
              border:`1px solid ${DS.goldBorder}`,
              display:'flex',alignItems:'center',gap:10,
              animation:'fadeIn 0.3s ease',
            }}>
              <span style={{fontSize:18}}>🎉</span>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:DS.gold}}>{discount?.label}</div>
                {selectedSection && <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:1}}>Saving ${discountAmt.toFixed(2)} on {qty} tickets</div>}
              </div>
            </div>
          )}

          {/* STADIUM MAP VIEW */}
          {view === 'map' && (
            <div>
              <div className="dt3-map-wrap" style={{
                height:300,background:'#0A1F0E',borderRadius:16,overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:16,
                position:'relative',boxShadow:'inset 0 2px 20px rgba(0,0,0,0.4)',
              }}>
                {/* Field */}
                <svg viewBox="0 0 320 260" style={{width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg">
                  {/* Field background */}
                  <defs>
                    <linearGradient id="fieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A4A1A"/>
                      <stop offset="100%" stopColor="#0F3010"/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  {/* Playing field */}
                  <rect x="10" y="90" width="300" height="80" fill="url(#fieldGrad)" rx="2"/>
                  {/* Field lines */}
                  {[60,110,160,210,260].map((x,i)=>(
                    <line key={i} x1={x} y1="92" x2={x} y2="168" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                  ))}
                  <line x1="160" y1="90" x2="160" y2="170" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                  {/* Hash marks */}
                  {[80,110,140,160,180,210,240].map((x,i)=>(
                    <React.Fragment key={i}>
                      <line x1={x} y1="118" x2={x} y2="122" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
                      <line x1={x} y1="138" x2={x} y2="142" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
                    </React.Fragment>
                  ))}
                  {/* End zones */}
                  <rect x="10" y="90" width="50" height="80" fill="rgba(196,136,42,0.15)" rx="1"/>
                  <rect x="260" y="90" width="50" height="80" fill="rgba(196,136,42,0.15)" rx="1"/>
                  <text x="35" y="135" fill="rgba(196,136,42,0.6)" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" transform="rotate(-90,35,135)">MIDLAND</text>
                  <text x="285" y="135" fill="rgba(196,136,42,0.6)" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" transform="rotate(90,285,135)">MIDLAND</text>

                  {/* Goal posts */}
                  <line x1="160" y1="88" x2="160" y2="78" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="150" y1="78" x2="170" y2="78" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="150" y1="74" x2="150" y2="78" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="170" y1="74" x2="170" y2="78" stroke="#C4882A" strokeWidth="1.5"/>

                  {/* Sections */}
                  {SECTIONS.map(sec=>{
                    const isActive = selectedSection?.id === sec.id
                    const isHover = hoveredSection === sec.id
                    const fill = sectionColor(sec, isActive, isHover)
                    return (
                      <g key={sec.id}
                        className="dt3-section-btn"
                        onClick={()=>setSelectedSection(isActive?null:sec)}
                        onMouseEnter={()=>setHoveredSection(sec.id)}
                        onMouseLeave={()=>setHoveredSection(null)}
                      >
                        <path d={sec.svgPath} fill={fill} stroke={isActive?'#C4882A':'rgba(255,255,255,0.12)'} strokeWidth={isActive?1.5:0.5} rx="2"
                          style={{transition:'fill 0.15s ease, stroke 0.15s ease'}}
                          filter={isActive?'url(#glow)':undefined}
                        />
                        <text x={sec.textPos[0]} y={sec.textPos[1]}
                          fill={isActive?'#16110C':'rgba(255,255,255,0.7)'}
                          fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="600"
                          pointerEvents="none"
                        >{sec.label}</text>
                      </g>
                    )
                  })}

                  {/* "PEAK SPORTS STADIUM" text */}
                  <text x="160" y="250" fill="rgba(255,255,255,0.15)" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" letterSpacing="2">PEAK SPORTS STADIUM · 12,000</text>
                </svg>

                {/* Legend */}
                <div style={{position:'absolute',top:10,right:10,display:'flex',flexDirection:'column',gap:4}}>
                  {Object.entries(ZONE_COLOR).map(([zone,zc])=>(
                    <div key={zone} style={{display:'flex',alignItems:'center',gap:5,background:'rgba(0,0,0,0.6)',borderRadius:5,padding:'3px 7px'}}>
                      <div style={{width:8,height:8,borderRadius:2,background:zc.base,flexShrink:0}}/>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(255,255,255,0.6)',textTransform:'capitalize'}}>{zone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected section info */}
              {selectedSection ? (
                <div style={{
                  background:DS.card,borderRadius:12,padding:'14px 16px',
                  border:`1.5px solid ${DS.gold}`,marginBottom:14,
                  boxShadow:`0 4px 20px rgba(196,136,42,0.15)`,
                  animation:'fadeIn 0.2s ease',
                }}>
                  <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:DS.text,marginBottom:3}}>{selectedSection.name} — {selectedSection.label}</div>
                      <div style={{fontSize:12,color:DS.text3,marginBottom:6}}>{selectedSection.desc}</div>
                      <AvailBadge section={selectedSection}/>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:22,color:DS.gold}}>${selectedSection.price}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.text3}}>per ticket</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{background:DS.bg2,borderRadius:12,padding:'16px',border:`1px dashed ${DS.border}`,textAlign:'center',marginBottom:14}}>
                  <div style={{fontSize:20,marginBottom:6}}>👆</div>
                  <div style={{fontSize:13,fontWeight:600,color:DS.text2}}>Tap a section on the map to select seats</div>
                  <div style={{fontSize:11.5,color:DS.text3,marginTop:3}}>Sections highlighted in gold are your selection</div>
                </div>
              )}

              {/* Section cards grid */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
                {SECTIONS.map((sec,i)=>{
                  const active = selectedSection?.id===sec.id
                  const pct = availPct(sec)
                  return (
                    <button key={sec.id} onClick={()=>setSelectedSection(active?null:sec)}
                      style={{
                        textAlign:'left',padding:'10px 12px',borderRadius:10,
                        border:`1.5px solid ${active?DS.gold:DS.borderLight}`,
                        background:active?DS.goldPale:DS.card,
                        cursor:'pointer',
                        transition:'all 0.15s ease',
                        opacity:pct<5?0.5:1,
                      }}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:3}}>
                        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:DS.text}}>{sec.label}</span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:600,color:DS.gold}}>${sec.price}</span>
                      </div>
                      <div style={{fontSize:10.5,color:DS.text3,marginBottom:5,lineHeight:1.3}}>{sec.name}</div>
                      <div style={{height:3,borderRadius:2,background:DS.bg2,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${100-pct}%`,background:pct<15?DS.red:pct<35?DS.amber:DS.green,borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:9.5,color:DS.text3,marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>{sec.capacity-sec.sold} left</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* FIELD VIEW */}
          {view === 'field' && (
            <div>
              <div style={{
                height:300,borderRadius:16,overflow:'hidden',
                background:'linear-gradient(180deg, #87CEEB 0%, #87CEEB 40%, #228B22 40%, #228B22 100%)',
                position:'relative',marginBottom:16,
                boxShadow:'inset 0 -4px 20px rgba(0,0,0,0.3)',
                border:`1px solid ${DS.borderLight}`,
              }}>
                {/* Sky gradient */}
                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#4FC3F7 0%,#87CEEB 35%,#90EE90 35%,#228B22 100%)'}}/>

                {/* Stadium bowl silhouette */}
                <svg viewBox="0 0 400 200" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="fieldGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D8A2D"/>
                      <stop offset="100%" stopColor="#1A5C1A"/>
                    </linearGradient>
                  </defs>

                  {/* Stands - left */}
                  <path d="M 0,100 L 0,200 L 130,200 L 130,120 L 80,100 Z" fill="#1A3A1A" opacity="0.9"/>
                  {/* Stand rows left */}
                  {[0,8,16,24,32,40,48].map((dy,i)=>(
                    <line key={i} x1="0" y1={105+dy} x2={115-dy*0.3} y2={120+dy*0.2} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                  ))}

                  {/* Stands - right */}
                  <path d="M 400,100 L 400,200 L 270,200 L 270,120 L 320,100 Z" fill="#1A3A1A" opacity="0.9"/>
                  {[0,8,16,24,32,40,48].map((dy,i)=>(
                    <line key={i} x1="400" y1={105+dy} x2={285+dy*0.3} y2={120+dy*0.2} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                  ))}

                  {/* Playing field */}
                  <ellipse cx="200" cy="175" rx="160" ry="45" fill="url(#fieldGrad2)"/>
                  {/* Field lines */}
                  {[-80,-40,0,40,80].map((dx,i)=>(
                    <line key={i} x1={200+dx} y1="135" x2={200+dx} y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
                  ))}
                  <line x1="200" y1="135" x2="200" y2="200" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>

                  {/* Scoreboard */}
                  <rect x="155" y="28" width="90" height="50" fill="#1A1A1A" rx="4"/>
                  <rect x="158" y="31" width="84" height="30" fill="#111" rx="2"/>
                  <text x="200" y="43" fill={DS.gold} fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">MIDLAND</text>
                  <text x="178" y="55" fill="white" fontSize="10" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="700">21</text>
                  <text x="200" y="55" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">VS</text>
                  <text x="222" y="55" fill="white" fontSize="10" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="700">14</text>
                  <text x="200" y="70" fill="rgba(255,255,255,0.5)" fontSize="6" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">3RD · 8:42</text>

                  {/* Goal posts */}
                  <line x1="200" y1="130" x2="200" y2="108" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="188" y1="108" x2="212" y2="108" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="188" y1="100" x2="188" y2="108" stroke="#C4882A" strokeWidth="1.5"/>
                  <line x1="212" y1="100" x2="212" y2="108" stroke="#C4882A" strokeWidth="1.5"/>

                  {/* Crowd dots */}
                  {Array.from({length:60}).map((_,i)=>(
                    <circle key={i} cx={10+Math.random()*110} cy={100+Math.random()*80} r="1.5" fill={`hsl(${Math.random()*30+20},60%,${40+Math.random()*30}%)`} opacity="0.7"/>
                  ))}
                  {Array.from({length:60}).map((_,i)=>(
                    <circle key={i+60} cx={280+Math.random()*110} cy={100+Math.random()*80} r="1.5" fill={`hsl(${Math.random()*30+20},60%,${40+Math.random()*30}%)`} opacity="0.7"/>
                  ))}
                </svg>

                {/* Label overlay */}
                <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.5)',letterSpacing:'0.1em',textAlign:'center',whiteSpace:'nowrap'}}>
                  PEAK SPORTS STADIUM · VIEW FROM SECTION HC1
                </div>
              </div>

              {/* Section selector in field view */}
              <div style={{background:DS.card,borderRadius:12,padding:'14px 16px',border:`1px solid ${DS.borderLight}`,marginBottom:14}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Select Your Section</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {SECTIONS.map(sec=>{
                    const active = selectedSection?.id===sec.id
                    return (
                      <button key={sec.id} onClick={()=>setSelectedSection(active?null:sec)} style={{
                        padding:'5px 11px',borderRadius:7,
                        border:`1px solid ${active?DS.gold:DS.border}`,
                        background:active?DS.gold:'transparent',
                        color:active?'white':DS.text2,
                        fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:600,
                        cursor:'pointer',transition:'all 0.13s',
                      }}>{sec.label} ${sec.price}</button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── CONCESSIONS ── */}
          <div style={{marginTop:4}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:DS.text}}>Add Food & Drinks</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,padding:'2px 8px',borderRadius:20,background:DS.goldBg,color:DS.gold,border:`1px solid ${DS.goldBorder}`}}>OPTIONAL</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8}}>
              {CONCESSIONS.map((item,i)=>{
                const qty_c = concessions[item.id] || 0
                return (
                  <div key={item.id} style={{
                    background:DS.card,borderRadius:10,padding:'12px 12px',
                    border:`1px solid ${qty_c>0?DS.gold:DS.borderLight}`,
                    transition:'all 0.15s ease',
                    opacity:loaded?1:0,transform:loaded?'none':'translateY(6px)',
                    transitionDelay:`${i*0.04}s`,
                  }}>
                    <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:700,color:DS.text,marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:11,color:DS.text3,marginBottom:8}}>{item.desc}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:DS.gold}}>${item.price}</span>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        {qty_c > 0 && (
                          <button onClick={()=>adjustConcession(item.id,-1)} style={{width:22,height:22,borderRadius:'50%',border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text2,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>−</button>
                        )}
                        {qty_c > 0 && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:DS.text,minWidth:12,textAlign:'center'}}>{qty_c}</span>}
                        <button onClick={()=>adjustConcession(item.id,1)} style={{width:22,height:22,borderRadius:'50%',border:`1px solid ${qty_c>0?DS.gold:DS.border}`,background:qty_c>0?DS.gold:DS.bg,color:qty_c>0?'white':DS.text2,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,transition:'all 0.13s'}}>+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── CART / ORDER PANEL ── */}
        <div className="dt3-cart">
          <div style={{padding:'16px 18px',background:'#16110C',position:'sticky',top:0}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:'white'}}>Order Summary</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:2,letterSpacing:'0.06em'}}>MIDLAND · {sport.toUpperCase()}</div>
          </div>

          <div style={{padding:'16px 18px'}}>
            {!selectedSection ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:24,marginBottom:8}}>🏟️</div>
                <div style={{fontSize:13,fontWeight:600,color:DS.text,marginBottom:3}}>Select a Section</div>
                <div style={{fontSize:11.5,color:DS.text3}}>Choose from the map or list</div>
              </div>
            ) : (
              <>
                {/* Section */}
                <div style={{padding:'10px 12px',borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{selectedSection.name}</div>
                  <div style={{fontSize:11.5,color:DS.text3,marginTop:1}}>{selectedSection.label} · ${selectedSection.price}/ticket</div>
                </div>

                {/* Qty */}
                <div style={{marginBottom:12}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:7}}>Tickets</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:32,height:32,borderRadius:8,border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text,fontWeight:700,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:DS.text,minWidth:24,textAlign:'center'}}>{qty}</span>
                    <button onClick={()=>setQty(qty+1)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${DS.gold}`,background:DS.gold,color:'white',fontWeight:700,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                    <span style={{fontSize:11,color:DS.text3}}>× ${selectedSection.price}</span>
                  </div>
                  {discount?.pct > 0 && (
                    <div style={{marginTop:6,fontSize:11,color:DS.green,fontWeight:600}}>✓ {discount.label}</div>
                  )}
                </div>

                {/* Price breakdown */}
                <div style={{borderTop:`1px solid ${DS.borderLight}`,paddingTop:12,marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}>
                    <span style={{color:DS.text2}}>{qty} tickets</span>
                    <span style={{fontWeight:600,color:DS.text}}>${ticketSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.green,fontWeight:600,marginBottom:5}}>
                      <span>Group discount</span><span>−${discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {concessionTotal > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text2,marginBottom:5}}>
                      <span>Food & drinks ({concessionCount})</span><span>${concessionTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text3,marginBottom:10}}>
                    <span>Facility fee</span><span>${fees.toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:`2px solid ${DS.gold}`,paddingTop:10}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:DS.text}}>Total</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:22,color:DS.gold,transition:'all 0.2s ease'}}>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Concession summary */}
                {concessionCount > 0 && (
                  <div style={{marginBottom:12}}>
                    {Object.entries(concessions).map(([id,q])=>{
                      const item = CONCESSIONS.find(c=>c.id===id)
                      return item ? (
                        <div key={id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text2,marginBottom:3}}>
                          <span>{item.icon} {item.name} ×{q}</span>
                          <span>${(item.price*q).toFixed(2)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                <button onClick={()=>setStage('success')} style={{
                  width:'100%',padding:'13px',borderRadius:10,border:'none',
                  background:'#16110C',color:DS.gold,
                  fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,
                  cursor:'pointer',marginBottom:8,
                  transition:'opacity 0.15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                >
                  Complete Purchase →
                </button>
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,background:DS.bg}}>
                  <svg style={{width:12,height:12,color:DS.gold,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span style={{fontSize:11,color:DS.text3}}>Secure · Official Midland tickets</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
