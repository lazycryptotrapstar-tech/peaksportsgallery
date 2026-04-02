import React, { useState, useEffect } from 'react'
import { DS, DEMO_SCHOOL } from './DemoConstants'

const SECTIONS = [
  {id:'HC1',label:'Home Chairback A',zone:'Home Chairback',price:27,status:'HIGH',desc:'Home sideline · 40-50 yd line'},
  {id:'HC2',label:'Home Chairback B',zone:'Home Chairback',price:27,status:'MED', desc:'Home sideline · 50 yd center'},
  {id:'HB1',label:'Home Bleacher A', zone:'Home Bleacher', price:15,status:'HIGH',desc:'Home sideline · 20-40 yd'},
  {id:'HB2',label:'Home Bleacher B', zone:'Home Bleacher', price:15,status:'MED', desc:'Home sideline · 5-20 yd'},
  {id:'VIP',label:'VIP / Hospitality',zone:'VIP',          price:85,status:'LOW', desc:'Premium suite · 50 yd line view'},
  {id:'EZ1',label:'End Zone A',      zone:'End Zone',      price:10,status:'HIGH',desc:'North end zone · Video board end'},
  {id:'VIS',label:'Visitor Side',    zone:'Visitor',       price:12,status:'HIGH',desc:'Visitor sideline bleacher'},
]

const SC = {HIGH:DS.red, MED:DS.amber, LOW:DS.green}
const SL = {HIGH:'Selling Fast', MED:'Limited', LOW:'Available'}

function SectionCard({ sec, active, onClick, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 50)
    return () => clearTimeout(t)
  }, [])
  return (
    <button onClick={onClick} style={{
      textAlign:'left', borderRadius:14, width:'100%',
      border:`2px solid ${active?DS.gold:DS.borderLight}`,
      background:active?'#16110C':DS.card,
      cursor:'pointer', overflow:'hidden',
      boxShadow:active?`0 6px 24px rgba(196,136,42,0.22)`:DS.shSm,
      transform: visible ? (active?'translateY(-2px)':'translateY(0)') : 'translateY(10px)',
      opacity: visible ? 1 : 0,
      transition:'opacity 0.3s ease, transform 0.3s ease, border-color 0.18s, box-shadow 0.18s, background 0.18s',
    }}>
      <div style={{height:3,background:active?DS.gold:DS.borderLight,transition:'background 0.18s'}}/>
      <div style={{padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,alignItems:'flex-start',gap:8}}>
          <div style={{minWidth:0}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:active?'white':DS.text,lineHeight:1.2}}>{sec.label}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:active?'rgba(245,232,196,0.7)':DS.text3,marginTop:2}}>{sec.zone}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:active?DS.goldPale:DS.gold}}>${sec.price}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:active?'rgba(255,255,255,0.35)':DS.text4}}>/ ticket</div>
          </div>
        </div>
        <div style={{fontSize:11.5,color:active?'rgba(255,255,255,0.5)':DS.text3,marginBottom:8,lineHeight:1.4}}>{sec.desc}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:5,background:`${SC[sec.status]}18`,color:SC[sec.status]}}>{SL[sec.status]}</span>
          {active && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.35)',letterSpacing:'0.05em'}}>✓ SELECTED</span>}
        </div>
      </div>
    </button>
  )
}

export default function DemoTicketing() {
  const s = DEMO_SCHOOL
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(2)
  const [sport, setSport] = useState('football')
  const [stage, setStage] = useState('browse')
  const [loaded, setLoaded] = useState(false)
  const [showOrder, setShowOrder] = useState(false) // mobile order panel toggle

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const subtotal = selected ? selected.price * qty : 0
  const fees = selected ? 4 * qty : 0
  const total = subtotal + fees

  const CARD = {background:DS.card,borderRadius:14,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}

  if (stage==='success') return (
    <div style={{padding:'28px 20px',maxWidth:520,margin:'0 auto'}}>
      <div style={{...CARD,overflow:'hidden'}}>
        <div style={{padding:'36px 28px',textAlign:'center',background:'#16110C'}}>
          <div style={{
            width:52,height:52,borderRadius:'50%',
            background:'rgba(196,136,42,0.2)',display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 14px',
            animation:'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <svg style={{width:26,height:26}} viewBox="0 0 24 24" fill="none" stroke={DS.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <style>{`@keyframes successPop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}`}</style>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:'white'}}>Purchase Complete!</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:5,letterSpacing:'0.08em'}}>GO WILDCATS! {s.emoji}</div>
        </div>
        <div style={{padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
            {[{label:'Venue',value:s.venue.football.name},{label:'Section',value:selected?.label},{label:'Tickets',value:`${qty} tickets`},{label:'Total Paid',value:`$${total.toFixed(2)}`,gold:true}].map((item,i)=>(
              <div key={i} style={{padding:'12px 14px',borderRadius:10,background:DS.bg}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:3}}>{item.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:16,color:item.gold?DS.gold:DS.text}}>{item.value}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setStage('browse');setSelected(null);setQty(2);setShowOrder(false)}} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer'}}>← Back to Tickets</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{padding:'28px 20px 40px',maxWidth:1080,margin:'0 auto',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        .dt-layout { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 20px; align-items: start; }
        .dt-sections { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 10px; }
        .dt-order-panel { position: sticky; top: 20px; }
        .dt-mobile-order-btn { display: none !important; }
        .dt-mobile-order-overlay { display: none !important; }
        @media (max-width: 768px) {
          .dt-layout { grid-template-columns: 1fr !important; }
          .dt-order-panel { display: none !important; }
          .dt-mobile-order-btn { display: flex !important; }
          .dt-sections { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{marginBottom:20,opacity:loaded?1:0,transform:loaded?'none':'translateY(-8px)',transition:'opacity 0.4s ease,transform 0.4s ease'}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,marginBottom:5}}>{s.name} · Ticket Marketplace</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>Ticket Hub</div>
        <div style={{fontSize:13,color:DS.text3,marginTop:3}}>{s.venue.football.name} · {s.venue.football.capacity.toLocaleString()} capacity</div>
      </div>

      {/* Sport toggle */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['football','basketball'].map(sp=>(
          <button key={sp} onClick={()=>{setSport(sp);setSelected(null);setShowOrder(false)}} style={{
            padding:'9px 18px',borderRadius:10,
            border:`2px solid ${sport===sp?DS.gold:DS.border}`,
            background:sport===sp?DS.gold:DS.card,
            color:sport===sp?'white':DS.text2,
            fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:'pointer',
            transition:'all 0.18s ease',
            transform:sport===sp?'scale(1.02)':'scale(1)',
          }}>
            {sp==='football'?'🏈':'🏀'} {sp.charAt(0).toUpperCase()+sp.slice(1)}
          </button>
        ))}
      </div>

      <div className="dt-layout">
        {/* Section grid */}
        <div>
          <div className="dt-sections">
            {SECTIONS.map((sec,i)=>(
              <SectionCard key={sec.id} sec={sec} active={selected?.id===sec.id} index={i}
                onClick={()=>{setSelected(selected?.id===sec.id?null:sec);setShowOrder(true)}}/>
            ))}
          </div>
        </div>

        {/* Desktop order panel */}
        <div className="dt-order-panel">
          <OrderPanel selected={selected} qty={qty} setQty={setQty} total={total} subtotal={subtotal} fees={fees} setStage={setStage} s={s} sport={sport} DS={DS}/>
        </div>
      </div>

      {/* Mobile — sticky order button */}
      {selected && (
        <div className="dt-mobile-order-btn" style={{position:'fixed',bottom:72,left:16,right:16,zIndex:40}}>
          <button onClick={()=>setShowOrder(true)} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,0.25)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            View Order · ${total.toFixed(2)}
          </button>
        </div>
      )}

      {/* Mobile order overlay */}
      {showOrder && selected && (
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)'}} onClick={()=>setShowOrder(false)}/>
          <div style={{position:'relative',background:DS.card,borderRadius:'20px 20px 0 0',padding:'20px 20px calc(20px + env(safe-area-inset-bottom,0px))',maxHeight:'80vh',overflowY:'auto',boxShadow:'0 -8px 30px rgba(0,0,0,0.2)',animation:'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)'}}>
            <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
            <div style={{width:36,height:4,borderRadius:2,background:DS.border,margin:'0 auto 16px'}}/>
            <OrderPanel selected={selected} qty={qty} setQty={setQty} total={total} subtotal={subtotal} fees={fees} setStage={setStage} s={s} sport={sport} DS={DS} onClose={()=>setShowOrder(false)}/>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderPanel({ selected, qty, setQty, total, subtotal, fees, setStage, s, sport, DS, onClose }) {
  const CARD = {background:DS.card,borderRadius:14,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}
  return (
    <div style={{...CARD,overflow:'hidden'}}>
      <div style={{padding:'16px 18px',background:'#16110C'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:'white'}}>Order Summary</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:2,letterSpacing:'0.06em'}}>MIDLAND · {sport.toUpperCase()}</div>
      </div>
      <div style={{padding:'16px 18px'}}>
        {!selected ? (
          <div style={{padding:'24px 0',textAlign:'center'}}>
            <div style={{fontSize:28,marginBottom:8}}>🎟️</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:DS.text,marginBottom:3}}>Select a Section</div>
            <div style={{fontSize:12,color:DS.text3}}>Choose from the sections</div>
          </div>
        ) : (
          <div>
            <div style={{padding:'10px 12px',borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{selected.label}</div>
              <div style={{fontSize:11.5,color:DS.text3,marginTop:2}}>{selected.desc}</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:DS.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:7}}>Quantity</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[1,2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>setQty(n)} style={{
                    width:34,height:34,borderRadius:7,
                    border:`1px solid ${qty===n?DS.gold:DS.border}`,
                    background:qty===n?DS.gold:DS.bg,
                    color:qty===n?'white':DS.text2,
                    fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13,cursor:'pointer',
                    transition:'all 0.13s ease',
                    transform:qty===n?'scale(1.08)':'scale(1)',
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{borderTop:`1px solid ${DS.borderLight}`,paddingTop:12,marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13}}>
                <span style={{color:DS.text2}}>{qty}× {selected.label}</span>
                <span style={{fontWeight:600,color:DS.text}}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text3,marginBottom:10}}>
                <span>Facility + processing</span><span>${fees.toFixed(2)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:`2px solid ${DS.gold}`,paddingTop:10}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:DS.text}}>Total</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:24,color:DS.gold,transition:'all 0.2s ease'}}>${total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={()=>{setStage('success');onClose&&onClose()}} style={{
              width:'100%',padding:13,borderRadius:10,border:'none',
              background:'#16110C',color:DS.gold,
              fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer',
              marginBottom:8,transition:'opacity 0.15s,transform 0.15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}
            >Purchase Tickets →</button>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,background:DS.bg}}>
              <svg style={{width:13,height:13,color:DS.gold,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{fontSize:11,color:DS.text3}}>Secure · Official Midland tickets</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
