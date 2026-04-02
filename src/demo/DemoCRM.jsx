import React, { useState, useMemo } from 'react'
import { DS } from './DemoConstants'
import { DEMO_CONTACTS } from './DemoContacts'

const WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

const score = ct => {
  let s = 30
  s += Math.min((ct.purchase_count||0)*10, 40)
  if(ct.status==='hot')  s+=20
  if(ct.status==='warm') s+=10
  if(ct.status==='cold') s-=10
  if((ct.last_year||0)>=2025) s+=10
  else if((ct.last_year||0)>=2023) s+=5
  return Math.min(100,Math.max(0,s))
}

const scoreColor = s => s>=80?DS.green:s>=60?DS.amber:DS.red

const parseDraft = raw => {
  if(!raw) return {angle:'',reason:'',subject:'',body:'',followUp:''}
  const lines = raw.split('\n')
  let angle='',reason='',subject='',body='',followUp='',inBody=false
  for(const l of lines){
    if(l.startsWith('SELECTED ANGLE:'))     {angle=l.replace('SELECTED ANGLE:','').trim();inBody=false}
    else if(l.startsWith('REASON:'))        {reason=l.replace('REASON:','').trim();inBody=false}
    else if(l.startsWith('SUBJECT:'))       {subject=l.replace('SUBJECT:','').trim();inBody=false}
    else if(l.startsWith('BODY:'))          {inBody=true}
    else if(l.startsWith('FOLLOW-UP NOTE')) {followUp=l.replace('FOLLOW-UP NOTE FOR REP:','').trim();inBody=false}
    else if(inBody)                         {body+=(body?'\n':'')+l}
  }
  return {angle,reason,subject,body:body.trim(),followUp}
}

const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:DS.text3,fontFamily:"'JetBrains Mono',monospace",display:'block',marginBottom:5}
const CARD  = {background:DS.card,borderRadius:13,border:`1px solid ${DS.borderLight}`,boxShadow:DS.shSm}

const CAMPAIGNS = [
  {id:'TICKETS',    label:'Ticket Reactivation', short:'Tickets'},
  {id:'SPONSORSHIP',label:'Sponsorship Outreach', short:'Sponsors'},
]

export default function DemoCRM() {
  const [campaign,setCampaign]       = useState('TICKETS')
  const [touch,setTouch]             = useState(1)
  const [search,setSearch]           = useState('')
  const [sortBy,setSortBy]           = useState('priority')
  const [selectedContact,setContact] = useState(null)
  const [parsed,setParsed]           = useState(null)
  const [loading,setLoading]         = useState(false)
  const [editMode,setEditMode]       = useState(false)
  const [editedSubject,setEditedSubject] = useState('')
  const [editedBody,setEditedBody]   = useState('')
  const [mobileView,setMobileView]   = useState('contacts') // 'contacts' | 'draft'

  const contacts = useMemo(()=>{
    let list = [...DEMO_CONTACTS]
    if(search.trim()){
      const q = search.toLowerCase()
      list = list.filter(c=>(c.name||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q))
    }
    if(sortBy==='priority') list.sort((a,b)=>{const rd=({hot:0,warm:1,cold:2}[a.status]??1)-({hot:0,warm:1,cold:2}[b.status]??1);return rd!==0?rd:score(b)-score(a)})
    else if(sortBy==='name') list.sort((a,b)=>(a.name||'').localeCompare(b.name||''))
    else if(sortBy==='seasons') list.sort((a,b)=>(b.purchase_count||0)-(a.purchase_count||0))
    return list
  },[search,sortBy])

  const stats = {
    total: DEMO_CONTACTS.length,
    hot:   DEMO_CONTACTS.filter(c=>c.status==='hot').length,
    warm:  DEMO_CONTACTS.filter(c=>c.status==='warm').length,
  }

  const requestDraft = async (ct, t) => {
    setContact(ct)
    setParsed(null)
    setLoading(true)
    setEditMode(false)
    setMobileView('draft')
    try {
      const res = await fetch(WEBHOOK, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          school_id:'demo', campaign, touch:t,
          contact:{
            id:ct.id, name:ct.name, email:ct.email, phone:ct.phone||'',
            title:ct.title||'', purchase_count:ct.purchase_count||0,
            status:ct.status||'warm', last_year:ct.last_year||0,
            sport:ct.sport||'Football', tags:ct.tags||'',
            city:ct.city||'', membership_tier:ct.membership_tier||'',
          },
        }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft||'')
      setParsed(p)
      setEditedSubject(p.subject)
      setEditedBody(p.body)
    } catch(e) {
      setParsed({angle:'Connection Error',reason:'Check n8n — make sure demo.simplegenius.io is whitelisted in Railway CORS settings.',subject:'',body:'Could not connect to AI.',followUp:''})
    } finally {
      setLoading(false)
    }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode?editedSubject:parsed?.subject||'')
    const body = encodeURIComponent(editMode?editedBody:parsed?.body||'')
    window.open(`mailto:${selectedContact?.email}?subject=${subj}&body=${body}`)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:DS.bg}}>
      <style>{`
        @media (max-width: 768px) {
          .crm-split { flex-direction: column !important; }
          .crm-left  { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid ${DS.borderLight} !important; }
          .crm-right { width: 100% !important; }
          .crm-stats { grid-template-columns: 1fr 1fr !important; }
          .crm-header-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .crm-touch-row { flex-wrap: wrap !important; gap: 8px !important; }
          .mobile-back { display: flex !important; }
          .mobile-contacts-hide { display: none !important; }
          .mobile-draft-hide { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-back { display: none !important; }
          .crm-left { display: flex !important; }
          .crm-right { display: flex !important; }
        }
        .crm-contact-row { transition: all 0.15s ease; cursor: pointer; }
        .crm-contact-row:hover { background: ${DS.bg2} !important; }
        .crm-contact-row.active { background: ${DS.goldPale} !important; border-left: 3px solid ${DS.gold} !important; }
      `}</style>

      {/* ── TOP HEADER ── */}
      <div style={{padding:'20px 24px 0',flexShrink:0}}>
        <div className="crm-header-row" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <span style={{...LABEL,display:'inline',marginBottom:0}}>CRM · Midland</span>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:DS.text,letterSpacing:'-0.025em',lineHeight:1.1,marginTop:4}}>Sales Pipeline</div>
          </div>
          {/* Campaign pills */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {CAMPAIGNS.map(c=>(
              <button key={c.id} onClick={()=>{setCampaign(c.id);setContact(null);setParsed(null)}}
                style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${campaign===c.id?DS.gold:DS.border}`,background:campaign===c.id?DS.gold:'transparent',color:campaign===c.id?'white':DS.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',transition:'all 0.15s'}}>
                {c.short}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="crm-stats" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:16}}>
          {[
            {label:'Total Contacts',num:stats.total,accent:DS.gold},
            {label:'Hot Leads',     num:stats.hot,  accent:DS.red},
            {label:'Warm',          num:stats.warm, accent:DS.amber},
          ].map((s,i)=>(
            <div key={i} style={{...CARD,padding:'12px 16px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:s.accent,borderRadius:'3px 0 0 3px'}}/>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:DS.text3,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:600,color:DS.text}}>{s.num}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPLIT PANEL ── */}
      <div className="crm-split" style={{display:'flex',flex:1,overflow:'hidden',minHeight:0}}>

        {/* LEFT — Contact list */}
        <div className={`crm-left ${mobileView==='draft'?'mobile-contacts-hide':''}`}
          style={{width:340,flexShrink:0,display:'flex',flexDirection:'column',borderRight:`1px solid ${DS.borderLight}`,overflow:'hidden'}}>

          {/* Search + sort */}
          <div style={{padding:'0 14px 12px',flexShrink:0}}>
            <div style={{position:'relative',marginBottom:8}}>
              <svg style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:14,height:14,color:DS.text3,pointerEvents:'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
                style={{width:'100%',height:36,background:DS.card,border:`1px solid ${DS.border}`,borderRadius:8,padding:'0 12px 0 34px',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:DS.text,outline:'none',boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}/>
            </div>

            {/* Touch selector */}
            <div className="crm-touch-row" style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:DS.text3,letterSpacing:'0.08em',textTransform:'uppercase'}}>Touch:</span>
              {[1,2,3].map(t=>(
                <button key={t} onClick={()=>setTouch(t)} style={{width:30,height:30,borderRadius:6,border:`1px solid ${touch===t?DS.gold:DS.border}`,background:touch===t?DS.gold:DS.card,color:touch===t?'white':DS.text2,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:12,cursor:'pointer',transition:'all 0.13s'}}>{t}</button>
              ))}
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:DS.text3}}>{touch===1?'The Moment':touch===2?'The Identity':'The Door'}</span>
            </div>
          </div>

          {/* Contact rows */}
          <div style={{flex:1,overflowY:'auto',padding:'0 14px 14px'}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:DS.text3,letterSpacing:'0.08em',textTransform:'uppercase',padding:'6px 0 8px'}}>
              {contacts.length} contacts
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {contacts.map(ct=>{
                const sc = score(ct)
                const initials = ct.name.split(' ').map(n=>n[0]).slice(0,2).join('')
                const active = selectedContact?.id===ct.id
                return (
                  <div key={ct.id}
                    className={`crm-contact-row${active?' active':''}`}
                    onClick={()=>requestDraft(ct,touch)}
                    style={{background:active?DS.goldPale:DS.card,borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,border:`1px solid ${active?DS.gold:DS.borderLight}`,borderLeft:`3px solid ${active?DS.gold:'transparent'}`}}>
                    <div style={{width:32,height:32,borderRadius:8,background:active?DS.gold:DS.goldPale,color:active?'white':DS.gold,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,flexShrink:0}}>{initials}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:DS.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct.name}</div>
                      <div style={{fontSize:11,color:DS.text3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginTop:1}}>{ct.email}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
                      <div style={{minWidth:30,height:22,borderRadius:6,background:`${scoreColor(sc)}18`,color:scoreColor(sc),fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px'}}>{sc}</div>
                      <div style={{fontSize:9,fontWeight:600,color:ct.status==='hot'?DS.red:ct.status==='warm'?DS.amber:DS.text3,textTransform:'uppercase',letterSpacing:'0.05em'}}>{ct.status}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — Draft panel */}
        <div className={`crm-right ${mobileView==='contacts'&&!selectedContact?'mobile-draft-hide':''}`}
          style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* Mobile back button */}
          <div className="mobile-back" style={{padding:'10px 16px',borderBottom:`1px solid ${DS.borderLight}`,flexShrink:0,alignItems:'center',gap:8,background:DS.card}}>
            <button onClick={()=>{setMobileView('contacts')}} style={{display:'flex',alignItems:'center',gap:6,border:'none',background:'none',cursor:'pointer',color:DS.text2,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:0}}>
              <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to contacts
            </button>
          </div>

          {/* Empty state */}
          {!selectedContact && (
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:14}}>📧</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:DS.text,marginBottom:6}}>Select a Contact</div>
              <div style={{fontSize:13,color:DS.text3,maxWidth:260}}>Click any contact on the left to generate an AI email draft instantly.</div>
            </div>
          )}

          {/* Loading state */}
          {selectedContact && loading && (
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:DS.goldPale,border:`1.5px solid ${DS.goldBorder}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:22}}>🐱</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:DS.text,marginBottom:6}}>Ace is drafting…</div>
              <div style={{fontSize:13,color:DS.text3,marginBottom:24}}>Writing Touch {touch} for {selectedContact.name}</div>
              <div style={{display:'flex',gap:8}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:DS.gold,animation:`dbounce 1.2s ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}

          {/* Draft content */}
          {selectedContact && !loading && parsed && (
            <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>

              {/* Contact info bar */}
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,background:DS.goldBg,border:`1px solid ${DS.goldBorder}`,marginBottom:14}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{selectedContact.name}</div>
                  <div style={{fontSize:11,color:DS.text3,marginTop:1}}>{selectedContact.email} · Touch {touch} of 3 · {touch===1?'The Moment':touch===2?'The Identity':'The Door'}</div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  {[1,2,3].map(t=>(
                    <button key={t} onClick={()=>{setTouch(t);requestDraft(selectedContact,t)}}
                      style={{width:28,height:28,borderRadius:6,border:`1px solid ${touch===t?DS.gold:DS.border}`,background:touch===t?DS.gold:DS.card,color:touch===t?'white':DS.text2,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:11,cursor:'pointer',transition:'all 0.13s'}}>
                      T{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle banner */}
              {parsed.angle && (
                <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderRadius:10,background:DS.goldBg,border:`1px solid ${DS.goldBorder}`,marginBottom:14}}>
                  <svg style={{width:14,height:14,color:DS.gold,flexShrink:0,marginTop:2}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:600,color:DS.gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>{parsed.angle}</div>
                    <div style={{fontSize:12,color:DS.text2,lineHeight:1.5}}>{parsed.reason}</div>
                  </div>
                </div>
              )}

              {/* Email card */}
              <div style={{...CARD,marginBottom:12,overflow:'hidden'}}>
                {/* Toolbar */}
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${DS.borderLight}`,display:'flex',alignItems:'center',gap:8,background:DS.bg,flexWrap:'wrap'}}>
                  <button onClick={()=>requestDraft(selectedContact,touch)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:7,border:`1px solid ${DS.border}`,background:DS.card,color:DS.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer'}}>
                    ↺ Regenerate
                  </button>
                  <button onClick={()=>setEditMode(!editMode)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:7,border:`1px solid ${editMode?DS.gold:DS.border}`,background:editMode?DS.gold:'transparent',color:editMode?'white':DS.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer'}}>
                    {editMode?'Preview':'Edit'}
                  </button>
                </div>

                {/* Subject */}
                <div style={{padding:'12px 14px',borderBottom:`1px solid ${DS.borderLight}`}}>
                  <div style={{...LABEL}}>Subject</div>
                  {editMode
                    ? <input value={editedSubject} onChange={e=>setEditedSubject(e.target.value)} style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}/>
                    : <div style={{fontSize:14,fontWeight:600,color:DS.text}}>{parsed.subject}</div>
                  }
                </div>

                {/* Body */}
                <div style={{padding:'12px 14px'}}>
                  <div style={{...LABEL}}>Body</div>
                  {editMode
                    ? <textarea value={editedBody} onChange={e=>setEditedBody(e.target.value)} style={{width:'100%',minHeight:160,padding:'10px 12px',borderRadius:7,border:`1px solid ${DS.border}`,background:DS.bg,color:DS.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,resize:'vertical',outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor=DS.gold} onBlur={e=>e.target.style.borderColor=DS.border}/>
                    : <div style={{fontSize:13,lineHeight:1.8,color:DS.text,whiteSpace:'pre-wrap'}}>{parsed.body}</div>
                  }
                </div>
              </div>

              {/* Rep note */}
              {parsed.followUp && (
                <div style={{padding:'10px 14px',borderRadius:10,background:DS.greenBg,border:`1px solid rgba(10,110,56,0.2)`,marginBottom:14}}>
                  <div style={{...LABEL,color:DS.green}}>Rep Note</div>
                  <div style={{fontSize:12,color:'#0a4024',lineHeight:1.6}}>{parsed.followUp}</div>
                </div>
              )}

              {/* Send button */}
              <button onClick={openInEmail} style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:'#16110C',color:DS.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open in Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
