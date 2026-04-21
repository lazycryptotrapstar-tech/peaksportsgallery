import React, { useState, useRef, useEffect } from 'react'
import { DEMO_SCHOOL } from './DemoConstants'
import { DEMO_CONTACTS } from './DemoContacts'
// ── LOCKED CORE — import functional logic only, do not duplicate here ────────
import { score, sendChatMessage, buildSystemPrompt, CAMPAIGNS_AGENT } from './DemoCore'

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

const scoreColor = s => s>=80?T.green:s>=60?T.amber:T.red

// Campaign SVG icons (UI only — openers and logic live in DemoCore)
const CAMPAIGN_SVGS = {
  TICKETS:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  SPONSORSHIP: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  HOSPITALITY: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m10 0h3a2 2 0 0 0 2-2v-3"/></svg>,
  ALUMNI:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
}
const CAMPAIGNS = CAMPAIGNS_AGENT.map(c=>({...c, svg:CAMPAIGN_SVGS[c.id]}))

// Scripted conversations for the auto-playing phone preview.
// Demo content only — live chat still uses CAMPAIGNS_AGENT via DemoCore.
const PREVIEW_CAMPAIGNS = [
  {
    label: 'Ticket Sales',
    bubbles: [
      {side:'bot',  text:"Hey! Grip here — your Peak Mountaineers ticket rep. Big game at Peak Sports Stadium coming up. What sports are you into?"},
      {side:'user', text:"I'm interested in football!"},
      {side:'bot',  text:"Perfect — the Riverside Hawks rivalry game is coming up. Want me to check availability near the 50?"},
    ],
  },
  {
    label: 'Sponsorship',
    bubbles: [
      {side:'bot',  text:"Hi — Grip here. I noticed your business supports local athletics. Open to exploring a partnership with Peak?"},
      {side:'user', text:"What tiers do you offer?"},
      {side:'bot',  text:"Bronze, Silver, Gold, and Presenting. Silver at $6,000 would be a strong fit for your size — want the full breakdown?"},
    ],
  },
  {
    label: 'Hospitality',
    bubbles: [
      {side:'bot',  text:"Welcome back! You've been a Champions Club member for 3 seasons. Priority booking just opened for the Hawks rivalry game."},
      {side:'user', text:"What's left in the suite?"},
      {side:'bot',  text:"Two seats in Champions Club Box 4 — food and premium parking included. $380 each. Shall I hold them?"},
    ],
  },
  {
    label: 'Alumni Outreach',
    bubbles: [
      {side:'bot',  text:"Hey Peak alum! Your class is planning the 25-year reunion around homecoming. Got a minute to see group options?"},
      {side:'user', text:"Seating for 12 — any blocks left?"},
      {side:'bot',  text:"Section 205 has a block of 14 with tailgate passes and a pre-game meet-up. Want me to reserve them?"},
    ],
  },
]

// buildSystemPrompt imported from DemoCore
const _buildSystemPrompt = (s, campId) => `You are ${s.mascotName}, the AI-powered revenue agent for ${s.name} ${s.mascot} athletics, operated by Peak Sports MGMT.
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
  const [chatStep, setChatStep] = useState(0)
  const [cycleIndex, setCycleIndex] = useState(0)
  const msgEnd = useRef(null)

  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:'smooth'}) },[messages,isTyping])

  // ── Phone-preview animation — cycles bubbles AND rotates campaigns ─────
  useEffect(() => {
    if (campaign) return
    const timings = [600, 2000, 2000, 2800]
    const id = setTimeout(() => {
      const nextStep = (chatStep + 1) % 4
      setChatStep(nextStep)
      if (nextStep === 0) setCycleIndex(c => (c + 1) % PREVIEW_CAMPAIGNS.length)
    }, timings[chatStep])
    return () => clearTimeout(id)
  }, [chatStep, campaign])

  const topContact = [...DEMO_CONTACTS].sort((a,b)=>score(b)-score(a))[0]
  const topScore = topContact ? score(topContact) : 0
  const topInitials = topContact?.name.split(' ').map(n=>n[0]).slice(0,2).join('')||'AC'

  const selectCampaign = cam => {
    setCampaign(cam)
    setMessages([{role:'assistant',content:cam.opener(s),ts:Date.now()}])
  }

  // ── sendMessage — calls DemoCore.sendChatMessage (do not modify) ──────────
  const sendMessage = async () => {
    if (!input.trim()||!campaign) return
    const userMsg = {role:'user',content:input,ts:Date.now()}
    setMessages(prev=>[...prev,userMsg])
    setInput('')
    setIsTyping(true)
    try {
      const reply = await sendChatMessage({input, sessionId, campaign})
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
        <div style={{...LABEL,marginBottom:5}}>Sales Agent · Peak</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',textAlign:'center'}}>Choose a Campaign</div>
      </div>
      <div style={{textAlign:'center'}}>
        {/* Hero stats — AI vs Manual */}
        <div style={{display:'flex',gap:10,maxWidth:580,margin:'0 auto 28px',flexWrap:'wrap'}}>
          {[
            {big:'4.4×',  label:'More emails sent',   sub:'vs manual reps'},
            {big:'+138%',      label:'Response-rate lift', sub:'vs 8% baseline'},
            {big:'3.4×',  label:'Revenue generated',  sub:'$97.2k vs $28.4k'},
          ].map((s,i)=>(
            <div key={i} style={{flex:'1 1 150px',background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'13px 14px 11px',boxShadow:T.shSm,textAlign:'left',borderLeft:`3px solid ${T.gold}`}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:'-0.025em',marginBottom:5}}>{s.big}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text2,marginBottom:2,lineHeight:1.3}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Campaigns + phone preview — side-by-side on desktop, stacked on mobile */}
        <div className="sa-split" style={{display:'flex',gap:20,alignItems:'flex-start',justifyContent:'center',flexWrap:'wrap',maxWidth:900,margin:'0 auto 28px'}}>

          {/* Campaigns column (2×2 grid) */}
          <div style={{flex:'1 1 360px',maxWidth:440,minWidth:0}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
              {CAMPAIGNS.map(cam=>(
                <button key={cam.id} className="dcamp" onClick={()=>selectCampaign(cam)}
                  style={{background:T.card,borderRadius:13,padding:'13px 13px 11px',border:`1.5px solid ${T.border}`,boxShadow:T.shSm,cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:5,position:'relative',overflow:'hidden',transition:'all 0.18s ease'}}>
                  <div style={{width:30,height:30,borderRadius:8,background:T.goldBg,display:'flex',alignItems:'center',justifyContent:'center',color:T.gold,marginBottom:3}}>{cam.svg}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.2}}>{cam.label}</div>
                  <div style={{fontSize:10.5,color:T.text3,lineHeight:1.4}}>{cam.sub}</div>
                  <svg style={{position:'absolute',right:10,bottom:10,width:13,height:13,color:T.text3,transition:'all 0.15s'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Phone preview column */}
          <div style={{flex:'0 0 auto',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:260,background:'#1A1512',borderRadius:38,padding:11,boxShadow:'0 24px 64px rgba(20,16,13,0.28),0 6px 20px rgba(20,16,13,0.16),inset 0 0 0 1px rgba(255,255,255,0.07)'}}>
              <div style={{background:T.surface,borderRadius:28,overflow:'hidden'}}>
                <div style={{height:22,background:'#1A1512',borderRadius:'0 0 14px 14px',margin:'0 auto',width:66}}/>

                {/* Header — label cycles with campaign */}
                <div style={{background:T.green,padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:26,height:26,borderRadius:7,background:'rgba(196,136,42,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:11,color:T.gold,flexShrink:0}}>G</div>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:11.5,fontWeight:600,color:'rgba(255,255,255,0.90)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'opacity 0.35s',opacity:chatStep===0?0.5:1}}>{PREVIEW_CAMPAIGNS[cycleIndex].label}</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.60)',display:'flex',alignItems:'center',gap:4}}>
                      Peak
                      <span style={{margin:'0 2px',opacity:.4}}>·</span>
                      <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/>
                      <span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600,letterSpacing:'0.03em'}}>LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Chat area — bubbles rendered from PREVIEW_CAMPAIGNS[cycleIndex] */}
                <div style={{padding:'12px 10px',display:'flex',flexDirection:'column',gap:9,minHeight:180,background:T.bg}}>
                  {PREVIEW_CAMPAIGNS[cycleIndex].bubbles.map((b,i)=>{
                    const visible = chatStep > i
                    const isBot = b.side==='bot'
                    return (
                      <div key={`${cycleIndex}-${i}`} style={{
                        display:'flex', gap:isBot?6:0,
                        justifyContent:isBot?'flex-start':'flex-end',
                        alignItems:isBot?'flex-end':'center',
                        opacity:visible?1:0,
                        transform:visible?'translateY(0)':'translateY(6px)',
                        transition:'opacity 0.45s ease, transform 0.45s ease',
                      }}>
                        {isBot && (
                          <div style={{width:20,height:20,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8.5,fontWeight:700,color:T.gold,fontFamily:"'Inter',sans-serif",flexShrink:0}}>A</div>
                        )}
                        <div style={{
                          maxWidth:isBot?'80%':'72%',
                          padding:'7px 10px',fontSize:10.5,lineHeight:1.45,
                          background:isBot?T.card:T.green,
                          color:isBot?T.text:'white',
                          border:isBot?`1px solid ${T.border}`:'none',
                          boxShadow:isBot?'0 1px 4px rgba(0,0,0,0.08)':'none',
                          borderRadius:isBot?'13px 13px 13px 3px':'13px 13px 3px 13px',
                        }}>{b.text}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{background:'white',margin:'0 10px 10px',borderRadius:10,padding:'7px 9px',display:'flex',alignItems:'center',gap:7}}>
                  <div style={{flex:1,fontSize:10.5,color:T.text3}}>Message Grip…</div>
                  <div style={{width:24,height:24,borderRadius:6,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Link caption — ties preview to clickable tiles */}
            <div style={{marginTop:12,textAlign:'center',fontSize:11.5,color:T.text3,maxWidth:240,lineHeight:1.45}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.gold,letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:700}}>Preview</span>
              <span style={{margin:'0 6px',color:T.border}}>·</span>
              Tap a campaign to chat live
            </div>
          </div>
        </div>

        {/* Top contact */}
        {topContact && (
          <div style={{maxWidth:580,margin:'0 auto',padding:'14px 18px',borderRadius:14,border:`1px solid ${T.border}`,background:T.card,boxShadow:T.shSm,display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{...LABEL,marginBottom:8}}>Top Contact · Peak</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:14,flexShrink:0}}>{topInitials}</div>
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
        <div style={{padding:'10px 20px 12px',background:T.green,borderBottom:`1px solid rgba(255,255,255,0.12)`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(196,136,42,0.22)',border:'1px solid rgba(196,136,42,0.32)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:14,color:T.gold}}>G</div>
            <div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:15,color:'white',lineHeight:1.1}}>{campaign.label}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.60)',display:'flex',alignItems:'center',gap:4}}>
                {s.name} · <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/><span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600}}>LIVE</span>
              </div>
            </div>
          </div>
          <button onClick={()=>{setCampaign(null);setMessages([])}} style={{padding:'5px 12px',borderRadius:8,border:'1px solid rgba(196,136,42,0.3)',background:'transparent',cursor:'pointer',fontSize:11,color:'rgba(255,255,255,0.85)',fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12,background:T.bg}}>
          {messages.map((msg,i)=>(
            <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',gap:8}}>
              {msg.role==='assistant' && (
                <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.gold,fontFamily:"'Inter',sans-serif",flexShrink:0,marginTop:2}}>G</div>
              )}
              <div style={{maxWidth:'78%',padding:'9px 13px',borderRadius:msg.role==='user'?'16px 16px 3px 16px':'16px 16px 16px 3px',background:msg.role==='user'?T.green:T.card,color:msg.role==='user'?'white':T.text,border:msg.role==='user'?'none':`1px solid ${T.border}`,fontSize:13,lineHeight:1.55,fontFamily:"'DM Sans',sans-serif",boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div style={{display:'flex',gap:8}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.gold,fontFamily:"'Inter',sans-serif",flexShrink:0}}>G</div>
              <div style={{padding:'9px 13px',borderRadius:'16px 16px 16px 3px',background:T.card,border:`1px solid ${T.border}`,display:'flex',gap:4,alignItems:'center'}}>
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
              placeholder="Message Grip…"
              style={{flex:1,padding:'10px 14px',borderRadius:24,border:`1px solid ${T.border}`,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',background:T.bg,color:T.text}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
            />
            <button onClick={sendMessage} style={{width:40,height:40,borderRadius:'50%',border:'none',background:T.surface,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:T.text3,textAlign:'center',marginTop:7,letterSpacing:'0.05em'}}>Grip · Peak University · Simple Genius</div>
        </div>

        {/* Home bar */}
        <div style={{background:'#000',paddingBottom:8,paddingTop:4,display:'flex',justifyContent:'center',flexShrink:0}}>
          <div style={{width:120,height:5,borderRadius:3,background:'rgba(255,255,255,0.25)'}}/>
        </div>
      </div>
    </div>
  )
}
