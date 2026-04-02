import React, { useState, useMemo } from 'react'
import { DS } from './DemoApp'
import { DEMO_CONTACTS } from './DemoContacts'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

const score = ct => {
  let s = 30
  s += Math.min((ct.purchase_count||0)*10, 40)
  if (ct.status==='hot')  s+=20
  if (ct.status==='warm') s+=10
  if (ct.status==='cold') s-=10
  if ((ct.last_year||0)>=2025) s+=10
  else if ((ct.last_year||0)>=2023) s+=5
  return Math.min(100, Math.max(0, s))
}

const scoreColor = s => s>=80?DS.green:s>=60?DS.amber:DS.red
const scoreLabel = {hot:'Hot Lead',warm:'Warm',cold:'Cold'}

const parseDraft = raw => {
  if (!raw) return {angle:'',reason:'',subject:'',body:'',followUp:''}
  const lines = raw.split('\n')
  let angle='',reason='',subject='',body='',followUp='',inBody=false
  for (const l of lines) {
    if (l.startsWith('SELECTED ANGLE:'))      {angle=l.replace('SELECTED ANGLE:','').trim();inBody=false}
    else if (l.startsWith('REASON:'))          {reason=l.replace('REASON:','').trim();inBody=false}
    else if (l.startsWith('SUBJECT:'))         {subject=l.replace('SUBJECT:','').trim();inBody=false}
    else if (l.startsWith('BODY:'))            {inBody=true}
    else if (l.startsWith('FOLLOW-UP NOTE'))   {followUp=l.replace('FOLLOW-UP NOTE FOR REP:','').trim();inBody=false}
    else if (inBody)                           {body+=(body?'\n':'')+l}
  }
  return {angle,reason,subject,body:body.trim(),followUp}
}

const CAMPAIGNS = [
  {id:'TICKETS',     label:'Ticket Reactivation', sub:'Lapsed buyers · Season renewals · Group sales',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>},
  {id:'SPONSORSHIP', label:'Sponsorship Outreach', sub:'Local businesses · Corporate partners · Prospects',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:21,height:21}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
]

const Btn = ({children,onClick,primary,style={}}) => (
  <button onClick={onClick} style={{
    display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',
    background:primary?DS.gold:'transparent',color:primary?'white':DS.text2,
    border:primary?'none':`1px solid ${DS.border}`,borderRadius:10,
    fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:'pointer',
    boxShadow:primary?'0 2px 8px rgba(196,136,42,0.28)':'none',
    transition:'all 0.15s',
    ...style,
  }}>{children}</button>
)

export default function DemoCRM() {
  const [stage,setStage]               = useState('campaign')
  const [campaign,setCampaign]         = useState(null)
  const [contact,setContact]           = useState(null)
  const [touch,setTouch]               = useState(1)
  const [parsed,setParsed]             = useState(null)
  const [editMode,setEditMode]         = useState(false)
  const [editedSubject,setEditedSubject] = useState('')
  const [editedBody,setEditedBody]     = useState('')
  const [search,setSearch]             = useState('')
  const [sortBy,setSortBy]             = useState('priority')
  const [loading,setLoading]           = useState(false)

  const contacts = useMemo(() => {
    let list = [...DEMO_CONTACTS]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c=>(c.name||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q)||(c.city||'').toLowerCase().includes(q))
    }
    if (sortBy==='priority') list.sort((a,b)=>{const rd=({hot:0,warm:1,cold:2}[a.status]??1)-({hot:0,warm:1,cold:2}[b.status]??1);return rd!==0?rd:score(b)-score(a)})
    else if (sortBy==='name') list.sort((a,b)=>(a.name||'').localeCompare(b.name||''))
    else if (sortBy==='seasons') list.sort((a,b)=>(b.purchase_count||0)-(a.purchase_count||0))
    return list
  },[search,sortBy])

  const grouped = useMemo(()=>{
    if (sortBy!=='priority'||search.trim()) return null
    const g={hot:[],warm:[],cold:[]}
    contacts.forEach(c=>{const k=c.status||'warm';if(g[k])g[k].push(c)})
    return g
  },[contacts,sortBy,search])

  const stats = {
    total: DEMO_CONTACTS.length,
    hot:   DEMO_CONTACTS.filter(c=>c.status==='hot').length,
    contacted: 0,
    prospects: 0,
  }

  const requestDraft = async (ct, t) => {
    setLoading(true); setParsed(null)
    try {
      const res = await fetch(PLAYBOOK_WEBHOOK, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          school_id:'demo', campaign, touch:t,
          contact:{id:ct.id,name:ct.name,email:ct.email,phone:ct.phone||'',title:ct.title||'',purchase_count:ct.purchase_count||0,status:ct.status||'warm',last_year:ct.last_year||0,sport:ct.sport||'Football',tags:ct.tags||'',city:ct.city||'',membership_tier:ct.membership_tier||''},
        }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft||'')
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
      setStage('review')
    } catch {
      setParsed({angle:'Connection Error',reason:'Check n8n webhook',subject:'',body:'Could not connect.',followUp:''})
      setStage('review')
    } finally { setLoading(false) }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode?editedSubject:parsed?.subject||'')
    const body = encodeURIComponent(editMode?editedBody:parsed?.body||'')
    window.open(`mailto:${contact.email}?subject=${subj}&body=${body}`)
  }

  const reset = () => { setStage('campaign');setCampaign(null);setContact(null);setTouch(1);setParsed(null);setEditMode(false);setSearch('');setSortBy('priority') }

  const INNER = {padding:'34px 38px',maxWidth:1080}
  const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,fontFamily:"'JetBrains Mono',monospace"}
  const CARD  = {background:DS.card,borderRadius:13,padding:'17px 19px 16px',border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm,transition:'all 0.18s ease'}

  // ── CAMPAIGN SELECTOR ──────────────────────────────────────────────────────
  if (stage==='campaign') return (
    <div style={INNER}>
      <div style={{marginBottom:30}}>
        <div style={{...LABEL,marginBottom:5}}>CRM · Midland</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>Choose a Campaign</div>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:13,marginBottom:30}}>
        {[
          {label:'Total Contacts',num:stats.total,accent:DS.gold},
          {label:'Hot Leads',     num:stats.hot,  accent:DS.red},
          {label:'Contacted',     num:stats.contacted,accent:DS.green},
          {label:'Prospects Added',num:stats.prospects,accent:DS.blue},
        ].map((s,i)=>(
          <div key={i} className="dstat" style={{...CARD,position:'relative',overflow:'hidden',cursor:'default'}}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:s.accent,borderRadius:'3px 0 0 3px'}}/>
            <div style={{...LABEL,marginBottom:9}}>{s.label}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:29,fontWeight:600,color:DS.text,lineHeight:1,letterSpacing:'-0.02em'}}>{s.num}</div>
          </div>
        ))}
      </div>

      {/* Campaign tiles */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {CAMPAIGNS.map(cam=>(
          <button key={cam.id} className="dcamp" onClick={()=>{setCampaign(cam.id);setStage('contacts')}}
            style={{...CARD,textAlign:'left',display:'flex',flexDirection:'column',gap:10,cursor:'pointer',position:'relative',overflow:'hidden',background:DS.card,border:`1.5px solid ${DS.borderLight}`}}>
            <div style={{width:42,height:42,borderRadius:11,background:DS.goldPale,display:'flex',alignItems:'center',justifyContent:'center',color:DS.gold}}>{cam.icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:DS.text}}>{cam.label}</div>
            <div style={{fontSize:11.5,color:DS.text3,lineHeight:1.45}}>{cam.sub}</div>
            <svg style={{position:'absolute',right:16,bottom:16,width:18,height:18,color:DS.text4}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        ))}
      </div>
    </div>
  )

  // ── CONTACTS LIST ──────────────────────────────────────────────────────────
  if (stage==='contacts') return (
    <div style={INNER}>
      <Btn onClick={reset} style={{marginBottom:20}}>
        <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </Btn>

      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{...LABEL,marginBottom:5}}>{campaign==='TICKETS'?'Ticket Reactivation':'Sponsorship Outreach'}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:DS.text,letterSpacing:'-0.025em'}}>Midland Contacts</div>
        </div>
        <div>
          <div style={{...LABEL,marginBottom:6,textAlign:'right'}}>Touch</div>
          <div style={{display:'flex',gap:6}}>
            {[1,2,3].map(t=>(
              <button key={t} onClick={()=>setTouch(t)} style={{width:38,height:38,borderRadius:8,border:`1px solid ${touch===t?DS.gold:DS.border}`,background:touch===t?DS.gold:DS.card,color:touch===t?'white':DS.text2,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:14,cursor:'pointer',transition:'all 0.15s'}}>{t}</button>
            ))}
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:DS.text3,marginTop:5,textAlign:'right'}}>
            {touch===1?'The Moment':touch===2?'The Identity':'The Door'}
          </div>
        </div>
      </div>

      {/* Search + sort */}
      <div style={{display:'flex',gap:10,marginBottom:18,alignItems:'center'}}>
        <div style={{flex:1,position:'relative'}}>
          <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',width:15,height:15,color:DS.text3,pointerEvents:'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
            style={{width:'100%',height:41,background:DS.card,border:`1px solid ${DS.border}`,borderRadius:10,padding:'0 14px 0 38px',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:DS.text,outline:'none',boxShadow:DS.shSm}}
            onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}
          />
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{height:41,padding:'0 28px 0 13px',background:DS.card,border:`1px solid ${DS.border}`,borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:DS.text,boxShadow:DS.shSm,cursor:'pointer',outline:'none',appearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A7E5A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 10px center'}}>
          <option value="priority">Priority</option>
          <option value="seasons">Most Seasons</option>
          <option value="name">A → Z</option>
        </select>
      </div>

      {/* Pipeline header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>
        <span style={{...LABEL}}>Prospect</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,fontWeight:600,background:DS.goldPale,color:DS.gold,padding:'2px 8px',borderRadius:20}}>{contacts.length}</span>
        <span style={{marginLeft:'auto',fontSize:11.5,color:DS.text4}}>New — not yet contacted</span>
      </div>

      {/* Contact rows */}
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {(grouped ? ['hot','warm','cold'] : [null]).map(key => {
          const list = key ? (grouped[key]||[]) : contacts
          if (list.length===0) return null
          return (
            <div key={key||'all'}>
              {key && <div style={{...LABEL,padding:'10px 4px 6px',opacity:.7}}>{key==='hot'?'🔥 Hot Leads':key==='warm'?'⚡ Warm':'❄️ Lapsed'} ({list.length})</div>}
              {list.map(ct => {
                const sc = score(ct)
                const initials = ct.name.split(' ').map(n=>n[0]).slice(0,2).join('')
                return (
                  <div key={ct.id} className="dct"
                    onClick={()=>{setContact(ct);setStage('drafting');requestDraft(ct,touch)}}
                    style={{background:DS.card,borderRadius:12,padding:'13px 16px',display:'flex',alignItems:'center',gap:13,boxShadow:DS.shSm,border:`1px solid ${DS.borderLight}`,cursor:'pointer'}}>
                    <div style={{width:36,height:36,borderRadius:9,background:DS.goldPale,color:DS.gold,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,flexShrink:0}}>{initials}</div>
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontSize:13.5,fontWeight:600,color:DS.text,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct.name}</div>
                      <div style={{fontSize:11.5,color:DS.text3,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct.email}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                      {[1,2,3].map(t=>(
                        <div key={t} style={{width:22,height:22,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,background:DS.bg2,border:`1px solid ${DS.borderLight}`,color:DS.text3}}>T{t}</div>
                      ))}
                    </div>
                    <div style={{minWidth:38,height:28,borderRadius:8,background:DS.greenBg,color:DS.green,fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 8px',marginLeft:4}}>{sc}</div>
                    <svg style={{width:16,height:16,color:DS.text4,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── DRAFTING ───────────────────────────────────────────────────────────────
  if (stage==='drafting'||loading) return (
    <div style={{...INNER,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center'}}>
      <div style={{width:64,height:64,borderRadius:'50%',background:DS.goldPale,border:`1.5px solid ${DS.goldBorder}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>🐱</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:DS.text,marginBottom:6}}>Ace is drafting...</div>
      <div style={{fontSize:13,color:DS.text3,marginBottom:30}}>Scoring {contact?.name} · Selecting angle · Writing Touch {touch}</div>
      <div style={{display:'flex',justifyContent:'center',gap:8}}>
        {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:'50%',background:DS.gold,animation:`dbounce 1.2s ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  )

  // ── DRAFT REVIEW ───────────────────────────────────────────────────────────
  if (stage==='review'&&parsed) return (
    <div style={INNER}>
      <Btn onClick={()=>setStage('contacts')} style={{marginBottom:20}}>
        <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </Btn>

      {/* Angle banner */}
      <div style={{padding:'14px 18px',borderRadius:12,background:DS.goldBg,border:`1px solid ${DS.goldBorder}`,marginBottom:20,display:'flex',alignItems:'flex-start',gap:12}}>
        <div style={{width:34,height:34,borderRadius:8,background:DS.goldPale,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
          <svg style={{width:16,height:16,color:DS.gold}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div style={{...LABEL,color:DS.gold,marginBottom:4}}>{parsed.angle}</div>
          <div style={{fontSize:13,color:DS.text2,lineHeight:1.5}}>{parsed.reason}</div>
        </div>
      </div>

      {/* Email card */}
      <div style={{...CARD,marginBottom:16,overflow:'hidden',padding:0}}>
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${DS.borderLight}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,background:DS.bg}}>
          <div>
            <div style={{fontSize:13,color:DS.text3}}><span style={{color:DS.text,fontWeight:600}}>To:</span> {contact?.name} · <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{contact?.email}</span></div>
            <div style={{fontSize:12,color:DS.text3,marginTop:3}}>Touch {touch} of 3 · {touch===1?'The Moment':touch===2?'The Identity':'The Door'}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>requestDraft(contact,touch)}>↺ Regenerate</Btn>
            <Btn onClick={()=>setEditMode(!editMode)} primary={editMode}>{editMode?'Preview':'Edit'}</Btn>
          </div>
        </div>
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${DS.borderLight}`}}>
          <div style={{...LABEL,marginBottom:6}}>Subject</div>
          {editMode
            ? <input value={editedSubject} onChange={e=>setEditedSubject(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none'}} onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}/>
            : <div style={{fontSize:15,fontWeight:600,color:DS.text}}>{parsed.subject}</div>
          }
        </div>
        <div style={{padding:20}}>
          <div style={{...LABEL,marginBottom:10}}>Body</div>
          {editMode
            ? <textarea value={editedBody} onChange={e=>setEditedBody(e.target.value)} style={{width:'100%',minHeight:180,padding:'12px 14px',borderRadius:8,border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,resize:'vertical',outline:'none'}} onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}/>
            : <div style={{fontSize:14,lineHeight:1.85,color:DS.text,whiteSpace:'pre-wrap'}}>{parsed.body}</div>
          }
        </div>
      </div>

      {parsed.followUp && (
        <div style={{padding:'12px 16px',borderRadius:10,background:DS.greenBg,border:`1px solid rgba(10,110,56,0.2)`,marginBottom:20}}>
          <div style={{...LABEL,color:DS.green,marginBottom:4}}>Rep Note</div>
          <div style={{fontSize:13,color:'#0a4024',lineHeight:1.6}}>{parsed.followUp}</div>
        </div>
      )}

      <div style={{display:'flex',gap:12}}>
        <Btn primary onClick={openInEmail} style={{flex:1,justifyContent:'center',padding:'14px',borderRadius:12,fontFamily:"'Syne',sans-serif",fontSize:18,letterSpacing:'0.02em'}}>
          <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in Email
        </Btn>
        {touch<3 && (
          <Btn onClick={()=>{const n=touch+1;setTouch(n);setStage('drafting');requestDraft(contact,n)}} style={{padding:'14px 20px',borderRadius:12,fontFamily:"'Syne',sans-serif",fontSize:16}}>
            Next Touch →
          </Btn>
        )}
      </div>
      <button onClick={reset} style={{width:'100%',marginTop:10,padding:'10px',border:'none',background:'none',cursor:'pointer',fontSize:13,color:DS.text3,fontFamily:"'DM Sans',sans-serif"}}>← Start over</button>
    </div>
  )

  return null
}
