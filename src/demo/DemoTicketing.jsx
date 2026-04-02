import React, { useState } from 'react'
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

const STATUS_COLOR = {HIGH:DS.red, MED:DS.amber, LOW:DS.green}
const STATUS_LABEL = {HIGH:'Selling Fast', MED:'Limited', LOW:'Available'}

export default function DemoTicketing() {
  const s = DEMO_SCHOOL
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(2)
  const [sport, setSport] = useState('football')
  const [stage, setStage] = useState('browse')

  const subtotal = selected ? selected.price * qty : 0
  const fees     = selected ? 4 * qty : 0
  const total    = subtotal + fees

  const INNER = {padding:'34px 38px',maxWidth:1100}
  const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,fontFamily:"'JetBrains Mono',monospace"}
  const CARD  = {background:DS.card,borderRadius:14,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}

  if (stage==='success') return (
    <div style={{...INNER,maxWidth:520}}>
      <div style={{...CARD,overflow:'hidden'}}>
        <div style={{padding:'40px 32px',textAlign:'center',background:'#16110C'}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(196,136,42,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke={DS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:'white'}}>Purchase Complete!</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:6,letterSpacing:'0.08em'}}>GO WILDCATS! {s.emoji}</div>
        </div>
        <div style={{padding:32,background:DS.card}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
            {[{label:'Venue',value:s.venue.football.name},{label:'Section',value:selected?.label},{label:'Tickets',value:`${qty} tickets`},{label:'Total Paid',value:`$${total.toFixed(2)}`,gold:true}].map((item,i)=>(
              <div key={i} style={{padding:'14px',borderRadius:10,background:DS.bg}}>
                <div style={{...LABEL,marginBottom:3}}>{item.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:18,color:item.gold?DS.gold:DS.text}}>{item.value}</div>
              </div>
            ))}
          </div>
          <p style={{textAlign:'center',fontSize:12,color:DS.text3,marginBottom:20}}>Confirmation sent · Tickets delivered to your email</p>
          <button onClick={()=>{setStage('browse');setSelected(null);setQty(2)}} style={{width:'100%',padding:14,borderRadius:10,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:'pointer'}}>← Back to Tickets</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={INNER}>
      <div style={{marginBottom:24}}>
        <div style={{...LABEL,marginBottom:5}}>{s.name} · Ticket Marketplace</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>Ticket Hub</div>
        <div style={{fontSize:13,color:DS.text3,marginTop:3}}>{s.venue.football.name} · {s.venue.football.capacity.toLocaleString()} capacity</div>
      </div>

      {/* Sport toggle */}
      <div style={{display:'flex',gap:8,marginBottom:22}}>
        {['football','basketball'].map(sp=>(
          <button key={sp} onClick={()=>{setSport(sp);setSelected(null)}} style={{padding:'9px 20px',borderRadius:10,border:`2px solid ${sport===sp?DS.gold:DS.border}`,background:sport===sp?DS.gold:DS.card,color:sport===sp?'white':DS.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:'pointer',transition:'all 0.15s'}}>
            {sp==='football'?'🏈':'🏀'} {sp.charAt(0).toUpperCase()+sp.slice(1)}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 300px',gap:22,alignItems:'start'}}>
        {/* Section cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10}}>
          {SECTIONS.map(sec=>{
            const active = selected?.id===sec.id
            return (
              <button key={sec.id} onClick={()=>setSelected(active?null:sec)}
                style={{textAlign:'left',borderRadius:14,border:`2px solid ${active?DS.gold:DS.borderLight}`,background:active?'#16110C':DS.card,cursor:'pointer',overflow:'hidden',transition:'all 0.18s ease',boxShadow:active?`0 6px 24px rgba(196,136,42,0.22)`:DS.shSm,transform:active?'translateY(-2px)':'none'}}>
                <div style={{height:3,background:active?DS.gold:DS.borderLight}}/>
                <div style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:active?'white':DS.text}}>{sec.label}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:active?DS.goldPale:DS.text3,marginTop:1}}>{sec.zone}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:20,color:active?DS.goldPale:DS.gold}}>${sec.price}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:active?'rgba(255,255,255,0.35)':DS.text4}}>per ticket</div>
                    </div>
                  </div>
                  <div style={{fontSize:11.5,color:active?'rgba(255,255,255,0.55)':DS.text3,marginBottom:8,lineHeight:1.45}}>{sec.desc}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:5,background:`${STATUS_COLOR[sec.status]}18`,color:STATUS_COLOR[sec.status]}}>{STATUS_LABEL[sec.status]}</span>
                    {active&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.4)'}}>✓ SELECTED</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Order panel */}
        <div style={{...CARD,overflow:'hidden',position:'sticky',top:20}}>
          <div style={{padding:'18px 20px',background:'#16110C'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:'white'}}>Order Summary</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:'rgba(255,255,255,0.35)',marginTop:2,letterSpacing:'0.06em'}}>MIDLAND · {sport.toUpperCase()}</div>
          </div>
          <div style={{padding:'18px 20px',background:DS.card}}>
            {!selected ? (
              <div style={{padding:'28px 0',textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:10}}>🎟️</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:DS.text,marginBottom:4}}>Select a Section</div>
                <div style={{fontSize:12,color:DS.text3}}>Choose from the sections</div>
              </div>
            ) : (
              <div>
                <div style={{padding:'10px 12px',borderRadius:8,background:DS.bg,border:`1px solid ${DS.borderLight}`,marginBottom:14}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{selected.label}</div>
                  <div style={{fontSize:11.5,color:DS.text3,marginTop:2}}>{selected.desc}</div>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{...LABEL,marginBottom:7}}>Quantity</div>
                  <div style={{display:'flex',gap:6}}>
                    {[1,2,3,4,5,6].map(n=>(
                      <button key={n} onClick={()=>setQty(n)} style={{width:34,height:34,borderRadius:7,border:`1px solid ${qty===n?DS.gold:DS.border}`,background:qty===n?DS.gold:DS.bg,color:qty===n?'white':DS.text2,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13,cursor:'pointer',transition:'all 0.13s'}}>{n}</button>
                    ))}
                  </div>
                </div>
                <div style={{borderTop:`1px solid ${DS.borderLight}`,paddingTop:12,marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>
                    <span style={{color:DS.text2}}>{qty}× {selected.label}</span>
                    <span style={{fontWeight:600,color:DS.text}}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.text3,marginBottom:10}}>
                    <span>Facility + processing</span><span>${fees.toFixed(2)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:`2px solid ${DS.gold}`,paddingTop:10}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:DS.text}}>Total</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:26,color:DS.gold}}>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={()=>setStage('success')} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:'pointer',marginBottom:8,transition:'opacity 0.15s'}}>
                  Purchase Tickets →
                </button>
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,background:DS.bg}}>
                  <svg style={{width:14,height:14,color:DS.gold,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span style={{fontSize:11.5,color:DS.text3}}>Secure checkout · Official Midland tickets</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
