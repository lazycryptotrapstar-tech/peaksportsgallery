import React, { useState, useRef, useEffect } from 'react'
import { DS, DEMO_SCHOOL } from './DemoConstants'

/* ─── Local dark tokens — matches Priority / CRM color system ───────────────── */
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
  amber:   '#EFA020',
  amberBg: 'rgba(239,160,32,0.12)',
  red:     '#E05252',
  gold:    '#EFA020',
  goldBg:  'rgba(239,160,32,0.10)',
  goldBdr: 'rgba(239,160,32,0.30)',
  shSm:    '0 1px 4px rgba(0,0,0,0.3)',
}
import { DEMO_CONTACTS } from './DemoContacts'

const N8N_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/sales-agent'

const score = ct => {
  let s = 30
  s += Math.min((ct.purchase_count||0)*10,40)
  if(ct.status==='hot') s+=20
  if(ct.status==='warm') s+=10
  if(ct.status==='cold') s-=10
  if((ct.last_year||0)>=2025) s+=10
  else if((ct.last_year||0)>=2023) s+=5
  return Math.min(100,Math.max(0,s))
}

const scoreColor = s => s>=80?T.green:s>=60?T.amber:T.red

const CAMPAIGNS = [
  {id:'TICKETS',label:'Ticket Sales',sub:'Live inventory · Real-time pricing',
   opener:s=>`${s.emoji} Hey! Ace here — your ${s.name} ticket rep. Big games coming up at ${s.venue?.football?.name}. What sports are you into this season?`,
   svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>},
  {id:'SPONSORSHIP',label:'Sponsorship',sub:'Corporate partners · Package builder',
   opener:s=>`Hey! Ace here from ${s.name} athletics. Quick question — what's your primary marketing goal this year? Brand awareness, leads, or community presence?`,
   svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
  {id:'HOSPITALITY',label:'Hospitality',sub:'VIP access · Priority booking',
   opener:s=>`You have first access to ${s.vip?.[0]} this season. Are you thinking football, basketball, or both — and how many guests?`,
   svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m10 0h3a2 2 0 0 0 2-2v-3"/></svg>},
  {id:'ALUMNI',label:'Alumni Outreach',sub:'Class reunion · Group seating',
   opener:s=>`${s.emoji} Once a Wildcat, always a Wildcat. We're building alumni sections for ${s.name} home games this season. What year did you graduate?`,
   svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>},
]

const buildSystemPrompt = (s, campId) => `You are ${s.mascotName}, the AI-powered revenue agent for ${s.name} ${s.mascot} athletics, operated by Peak Sports MGMT.
SCHOOL: ${s.name} | ${s.conference} | ${s.location}
FOOTBALL: ${s.venue?.football?.name} (${s.venue?.football?.capacity?.toLocaleString()} cap)
BASKETBALL: ${s.venue?.basketball?.name} (${s.venue?.basketball?.capacity?.toLocaleString()} cap)
RIVALS: ${s.rivals?.join(', ')}
VIP: ${s.vip?.join(', ')}
SALES METHOD: Challenger Sale + Gap Selling. Teach, Tailor, Take Control. Ask ONE question at a time. Keep responses under 4 sentences unless presenting options.
${campId==='TICKETS'?`CAMPAIGN: Ticket Sales. GOAL: Sell tickets, season plans, flex plans, group packages. The ${s.rivals?.[0]} rivalry game is the anchor. Break down season tickets to per-game cost.`:''}
${campId==='SPONSORSHIP'?`CAMPAIGN: Sponsorship Sales. GOAL: Corporate sponsorship packages. Packages: Bronze $2-3k | Silver $5-8k | Gold $12-20k | Presenting $35-50k.`:''}
${campId==='HOSPITALITY'?`CAMPAIGN: Hospitality & Suites. GOAL: Sell VIP experiences. Lead with status and experience.`:''}
${campId==='ALUMNI'?`CAMPAIGN: Alumni Outreach. GOAL: Group packages to former students. Lead with belonging.`:''}`

export default function DemoSalesAgent() {
  const s = DEMO_SCHOOL
  const [campaign, setCampaign] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(()=>`demo-${Date.now()}`)
  const msgEnd = useRef(null)

  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:'smooth'}) },[messages,isTyping])

  const topContact = [...DEMO_CONTACTS].sort((a,b)=>score(b)-score(a))[0]
  const topScore = topContact ? score(topContact) : 0
  const topInitials = topContact?.name.split(' ').map(n=>n[0]).slice(0,2).join('')||'AC'

  const selectCampaign = cam => {
    setCampaign(cam)
    setMessages([{role:'assistant',content:cam.opener(s),ts:Date.now()}])
  }

  const sendMessage = async () => {
    if (!input.trim()||!campaign) return
    const userMsg = {role:'user',content:input,ts:Date.now()}
    setMessages(prev=>[...prev,userMsg])
    setInput('')
    setIsTyping(true)
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          chatInput: input,
          sessionId: `${s.id}-${campaign.id}-${sessionId}`,
          school_id: s.id, school_name: s.name, campaign: campaign.id,
          systemPrompt: buildSystemPrompt(s, campaign.id),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const reply = data?.output||data?.text||data?.message||data?.response||'Try again in a moment.'
      setMessages(prev=>[...prev,{role:'assistant',content:reply,ts:Date.now()}])
    } catch {
      setMessages(prev=>[...prev,{role:'assistant',content:'Connection issue — try again in a moment.',ts:Date.now()}])
    } finally { setIsTyping(false) }
  }

  const INNER = {padding:'34px 38px',maxWidth:1080}
  const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,fontFamily:"'JetBrains Mono',monospace"}

  // ── Campaign selector ──────────────────────────────────────────────────────
  if (!campaign) return (
    <div style={INNER}>
      <div style={{marginBottom:6}}>
        <div style={{...LABEL,marginBottom:5}}>Sales Agent · Midland</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:T.text,letterSpacing:'-0.025em',textAlign:'center'}}>Choose a Campaign</div>
      </div>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:13,color:T.text3,marginBottom:30}}>Start a live conversation with Ace</p>

        {/* Campaign tiles */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:14,maxWidth:580,margin:'0 auto 36px'}}>
          {CAMPAIGNS.map(cam=>(
            <button key={cam.id} className="dcamp" onClick={()=>selectCampaign(cam)}
              style={{background:T.card,borderRadius:15,padding:'22px 22px 18px',border:`1.5px solid ${T.border}`,boxShadow:T.shSm,cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:10,position:'relative',overflow:'hidden',transition:'all 0.18s ease'}}>
              <div style={{width:42,height:42,borderRadius:11,background:T.goldBg,display:'flex',alignItems:'center',justifyContent:'center',color:T.gold}}>{cam.svg}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:T.text}}>{cam.label}</div>
              <div style={{fontSize:11.5,color:T.text3,lineHeight:1.45}}>{cam.sub}</div>
              <svg style={{position:'absolute',right:16,bottom:16,width:18,height:18,color:T.text3,transition:'all 0.15s'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          ))}
        </div>

        {/* Phone preview */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
          <div style={{width:290,background:'#1A1512',borderRadius:42,padding:13,boxShadow:'0 24px 64px rgba(20,16,13,0.28),0 6px 20px rgba(20,16,13,0.16),inset 0 0 0 1px rgba(255,255,255,0.07)'}}>
            <div style={{background:'#F2E8D3',borderRadius:31,overflow:'hidden'}}>
              <div style={{height:26,background:'#1A1512',borderRadius:'0 0 16px 16px',margin:'0 auto',width:76}}/>
              <div style={{background:T.surface,padding:'11px 14px',display:'flex',alignItems:'center',gap:9}}>
                <div style={{width:28,height:28,borderRadius:7,background:'rgba(196,136,42,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:T.gold,flexShrink:0}}>A</div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.90)'}}>Ticket Sales</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:4}}>
                    Midland
                    <span style={{margin:'0 2px',opacity:.4}}>·</span>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/>
                    <span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600,letterSpacing:'0.03em'}}>LIVE</span>
                  </div>
                </div>
              </div>
              <div style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,minHeight:180,background:T.bg}}>
                <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Syne',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:'white',color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Hey! Ace here — your Midland Wildcats ticket rep. Big game at Peak Sports Stadium coming up. What sports are you into?</div>
                </div>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <div style={{maxWidth:'70%',padding:'8px 11px',borderRadius:'13px 13px 3px 13px',background:T.surface,color:'rgba(255,255,255,0.88)',fontSize:11,lineHeight:1.45}}>I'm interested in football!</div>
                </div>
                <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Syne',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:'white',color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Perfect — the Riverside Hawks rivalry game is coming up. Want me to check availability near the 50?</div>
                </div>
              </div>
              <div style={{background:'white',margin:'0 12px 12px',borderRadius:10,padding:'8px 10px',display:'flex',alignItems:'center',gap:8}}>
                <div style={{flex:1,fontSize:11,color:'#9A8264'}}>Message Ace…</div>
                <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top contact */}
        {topContact && (
          <div style={{maxWidth:580,margin:'0 auto',padding:'14px 18px',borderRadius:14,border:`1px solid ${T.border}`,background:T.card,boxShadow:T.shSm,display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{...LABEL,marginBottom:8}}>Top Contact · Midland</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:14,flexShrink:0}}>{topInitials}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{topContact.name}</div>
                  <div style={{fontSize:12,color:T.text3,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{topContact.title}</div>
                </div>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{...LABEL,marginBottom:3}}>Score</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:600,color:scoreColor(topScore)}}>{topScore}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── Chat view ──────────────────────────────────────────────────────────────
  return (
    <div style={{height:'100%',display:'flex',justifyContent:'center',alignItems:'flex-start',padding:'16px 12px 24px',background:T.bg,boxSizing:'border-box',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:390,background:'#000',borderRadius:'clamp(24px,6vw,52px)',boxShadow:'0 24px 64px rgba(0,0,0,0.45),0 0 0 8px #1a1a1a,0 0 0 10px #333',overflow:'hidden',display:'flex',flexDirection:'column',height:'min(680px,calc(100vh - 140px))'}}>

        {/* Notch */}
        <div style={{background:'#000',padding:'8px 20px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'rgba(255,255,255,0.6)',fontWeight:700}}>9:41</span>
          <div style={{width:120,height:30,background:'#000',borderRadius:20,border:'2px solid rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:'rgba(255,255,255,0.3)'}}/>
          </div>
          <div style={{width:16,height:10,borderRadius:3,border:'1.5px solid rgba(255,255,255,0.5)',position:'relative'}}>
            <div style={{position:'absolute',inset:2,background:'rgba(255,255,255,0.5)',borderRadius:1}}/>
          </div>
        </div>

        {/* Chat header */}
        <div style={{padding:'10px 20px 12px',background:T.surface,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(196,136,42,0.22)',border:'1px solid rgba(196,136,42,0.32)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:T.gold}}>A</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'white',lineHeight:1.1}}>{campaign.label}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:4}}>
                {s.name} · <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/><span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600}}>LIVE</span>
              </div>
            </div>
          </div>
          <button onClick={()=>{setCampaign(null);setMessages([])}} style={{padding:'5px 12px',borderRadius:8,border:'1px solid rgba(196,136,42,0.3)',background:'transparent',cursor:'pointer',fontSize:11,color:T.gold,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12,background:T.bg}}>
          {messages.map((msg,i)=>(
            <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',gap:8}}>
              {msg.role==='assistant' && (
                <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.gold,fontFamily:"'Syne',sans-serif",flexShrink:0,marginTop:2}}>A</div>
              )}
              <div style={{maxWidth:'78%',padding:'9px 13px',borderRadius:msg.role==='user'?'16px 16px 3px 16px':'16px 16px 16px 3px',background:msg.role==='user'?T.surface:'white',color:msg.role==='user'?'rgba(255,255,255,0.88)':T.text,fontSize:13,lineHeight:1.55,fontFamily:"'DM Sans',sans-serif",boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div style={{display:'flex',gap:8}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.gold,fontFamily:"'Syne',sans-serif",flexShrink:0}}>A</div>
              <div style={{padding:'9px 13px',borderRadius:'16px 16px 16px 3px',background:'white',display:'flex',gap:4,alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:T.gold,animation:`dbounce 1.2s ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={msgEnd}/>
        </div>

        {/* Input */}
        <div style={{padding:'12px 16px 20px',background:T.surface,borderTop:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{display:'flex',gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()}
              placeholder="Message Ace…"
              style={{flex:1,padding:'10px 14px',borderRadius:24,border:`1px solid ${T.border}`,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',background:T.bg,color:T.text}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
            />
            <button onClick={sendMessage} style={{width:40,height:40,borderRadius:'50%',border:'none',background:T.surface,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:T.text3,textAlign:'center',marginTop:7,letterSpacing:'0.05em'}}>Ace · Midland University · Simple Genius</div>
        </div>

        {/* Home bar */}
        <div style={{background:'#000',paddingBottom:8,paddingTop:4,display:'flex',justifyContent:'center',flexShrink:0}}>
          <div style={{width:120,height:5,borderRadius:3,background:'rgba(255,255,255,0.25)'}}/>
        </div>
      </div>
    </div>
  )
}
