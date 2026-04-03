import React, { useState, useMemo } from 'react'
import { DS } from './DemoConstants'
import { DEMO_CONTACTS } from './DemoContacts'

/* ─── Local dark tokens — matches Priority color system ─────────────────────── */
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

const WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

/* ─── Scoring (unchanged) ─────────────────────────────────────────────────── */
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
const scoreColor = s => s>=80?T.green:s>=60?T.amber:T.red

/* ─── Draft parser (unchanged) ────────────────────────────────────────────── */
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

/* ─── Shared style tokens ─────────────────────────────────────────────────── */
const LABEL = {fontSize:10,fontWeight:600,letterSpacing:'0.09em',textTransform:'uppercase',color:T.text3,fontFamily:"'JetBrains Mono',monospace",display:'block',marginBottom:5}
const CARD  = {background:T.card,borderRadius:13,border:`1px solid ${T.border}`,boxShadow:T.shSm}

const CAMPAIGNS = [
  {id:'TICKETS',    label:'Ticket Reactivation', short:'Tickets'},
  {id:'SPONSORSHIP',label:'Sponsorship Outreach', short:'Sponsors'},
]

/* ─── Status helpers ──────────────────────────────────────────────────────── */
const statusAccent = s => s==='hot'?T.red:s==='warm'?T.amber:T.text3
const statusBg     = s => s==='hot'?`${T.red}15`:s==='warm'?`${T.amber}15`:`${T.text3}10`
const STAGES = ['cold','warm','hot','vip']

/* ─── Pipeline stage bar ──────────────────────────────────────────────────── */
function PipelineBar({status}){
  const idx = STAGES.indexOf(status)
  return(
    <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
      {STAGES.map((stage,i)=>{
        const isActive=i===idx,isPast=i<idx
        const col=stage==='hot'?T.red:stage==='warm'?T.amber:stage==='vip'?T.gold:T.text3
        return(
          <React.Fragment key={stage}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,zIndex:1}}>
              <div style={{
                width:isActive?14:10,height:isActive?14:10,borderRadius:'50%',
                background:isActive||isPast?col:T.border,
                border:isActive?`2.5px solid ${col}`:isPast?`1.5px solid ${col}`:'none',
                boxShadow:isActive?`0 0 0 4px ${col}25`:'none',
                transition:'all 0.2s',
              }}/>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:isActive?col:isPast?col:T.text3,textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:isActive?700:400}}>
                {stage}
              </div>
            </div>
            {i<STAGES.length-1&&(
              <div style={{flex:1,height:2,borderRadius:1,background:isPast?col:T.border,margin:'0 2px 14px',transition:'background 0.2s'}}/>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function DemoCRM() {
  const [campaign,setCampaign]           = useState('TICKETS')
  const [touch,setTouch]                 = useState(1)
  const [search,setSearch]               = useState('')
  const [sortBy,setSortBy]               = useState('priority')
  const [statusFilter,setStatusFilter]   = useState('all')
  const [selectedContact,setContact]     = useState(null)
  const [parsed,setParsed]               = useState(null)
  const [loading,setLoading]             = useState(false)
  const [editMode,setEditMode]           = useState(false)
  const [editedSubject,setEditedSubject] = useState('')
  const [editedBody,setEditedBody]       = useState('')
  const [mobileView,setMobileView]       = useState('contacts')

  const allCounts = useMemo(()=>({
    all:  DEMO_CONTACTS.length,
    hot:  DEMO_CONTACTS.filter(c=>c.status==='hot').length,
    warm: DEMO_CONTACTS.filter(c=>c.status==='warm').length,
    cold: DEMO_CONTACTS.filter(c=>c.status==='cold').length,
  }),[])

  const contacts = useMemo(()=>{
    let list = [...DEMO_CONTACTS]
    if(statusFilter!=='all') list=list.filter(c=>c.status===statusFilter)
    if(search.trim()){
      const q=search.toLowerCase()
      list=list.filter(c=>(c.name||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q))
    }
    if(sortBy==='priority') list.sort((a,b)=>{const rd=({hot:0,warm:1,cold:2}[a.status]??1)-({hot:0,warm:1,cold:2}[b.status]??1);return rd!==0?rd:score(b)-score(a)})
    else if(sortBy==='name')    list.sort((a,b)=>(a.name||'').localeCompare(b.name||''))
    else if(sortBy==='seasons') list.sort((a,b)=>(b.purchase_count||0)-(a.purchase_count||0))
    return list
  },[search,sortBy,statusFilter])

  const stats = {
    total: DEMO_CONTACTS.length,
    hot:   allCounts.hot,
    warm:  allCounts.warm,
  }

  /* ── requestDraft (unchanged) ─────────────────────────────────────────── */
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
            sport:ct.sport||'Football', tags:Array.isArray(ct.tags)?ct.tags.join(','):ct.tags||'',
            city:ct.city||'', membership_tier:ct.membership_tier||'',
          },
        }),
      })
      const data = await res.json()
      const raw = data.draft||data.output||data.text||data.message||data.response||''
      if(!raw) throw new Error('Empty response from webhook')
      const p = parseDraft(raw)
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

  /* ── Contact record helpers ───────────────────────────────────────────── */
  const initials = ct => ct.name.split(' ').map(n=>n[0]).slice(0,2).join('')

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:T.bg,overflow:'hidden'}}>
      <style>{`
        @keyframes dbounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .crm-split{display:flex;flex:1;overflow:hidden;min-height:0}
        .crm-contact-row{transition:background 0.13s,border-color 0.13s;cursor:pointer}
        .crm-contact-row:hover .crm-card-bg{background:${T.surface} !important}
        @media(max-width:768px){
          .crm-split{flex-direction:column !important;overflow-y:auto !important;overflow-x:hidden !important}
          .crm-left{width:100% !important;border-right:none !important;border-bottom:1px solid ${T.border} !important;overflow:visible !important;height:auto !important;flex-shrink:0 !important}
          .crm-right{width:100% !important;min-height:60vh !important}
          .crm-contact-list{max-height:none !important;overflow-y:visible !important}
          .crm-stats{grid-template-columns:1fr 1fr !important}
          .crm-header-row{flex-direction:column !important;align-items:flex-start !important;gap:10px !important}
          .mobile-back{display:flex !important}
          .mobile-contacts-hide{display:none !important}
          .mobile-draft-hide{display:none !important}
        }
        @media(min-width:769px){
          .mobile-back{display:none !important}
          .crm-left{display:flex !important}
          .crm-right{display:flex !important}
        }
      `}</style>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{padding:'18px 20px 0',flexShrink:0}}>
        <div className="crm-header-row" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.text3,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:3}}>CRM · Peak</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',lineHeight:1.05}}>Sales Pipeline</div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {CAMPAIGNS.map(c=>(
              <button key={c.id} onClick={()=>{setCampaign(c.id);setContact(null);setParsed(null)}}
                style={{padding:'6px 14px',borderRadius:20,border:`1.5px solid ${campaign===c.id?T.gold:T.border}`,background:campaign===c.id?T.gold:'transparent',color:campaign===c.id?'white':T.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',transition:'all 0.15s'}}>
                {c.short}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="crm-stats" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:14}}>
          {[
            {label:'Total',  num:stats.total, accent:T.gold},
            {label:'Hot',    num:stats.hot,   accent:T.red},
            {label:'Warm',   num:stats.warm,  accent:T.amber},
          ].map((s,i)=>(
            <div key={i} style={{...CARD,padding:'10px 14px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:s.accent,borderRadius:'3px 0 0 3px'}}/>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:3}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.text}}>{s.num}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SPLIT PANEL ═════════════════════════════════════════════════════ */}
      <div className="crm-split">

        {/* ── LEFT: Contact list ─────────────────────────────────────────── */}
        <div className={`crm-left ${mobileView==='draft'?'mobile-contacts-hide':''}`}
          style={{width:340,flexShrink:0,display:'flex',flexDirection:'column',borderRight:`1px solid ${T.border}`,overflow:'hidden'}}>

          <div style={{padding:'0 14px 10px',flexShrink:0}}>
            {/* Search */}
            <div style={{position:'relative',marginBottom:10}}>
              <svg style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:13,height:13,color:T.text3,pointerEvents:'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
                style={{width:'100%',height:36,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:'0 12px 0 33px',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:T.text,outline:'none',boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>

            {/* Status filter pills */}
            <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:2,marginBottom:10,scrollbarWidth:'none'}}>
              {[
                {key:'all',  label:`All ${allCounts.all}`},
                {key:'hot',  label:`🔥 Hot ${allCounts.hot}`},
                {key:'warm', label:`◎ Warm ${allCounts.warm}`},
                {key:'cold', label:`Cold ${allCounts.cold}`},
              ].map(f=>(
                <button key={f.key} onClick={()=>setStatusFilter(f.key)} style={{
                  flexShrink:0,padding:'4px 11px',borderRadius:20,
                  border:`1.5px solid ${statusFilter===f.key?T.gold:T.border}`,
                  background:statusFilter===f.key?T.goldBg:'transparent',
                  color:statusFilter===f.key?T.gold:T.text3,
                  fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,
                  cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.14s',
                }}>{f.label}</button>
              ))}
            </div>

            {/* Touch selector + sort */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.text3,letterSpacing:'0.08em',textTransform:'uppercase'}}>Touch</span>
                {[1,2,3].map(t=>(
                  <button key={t} onClick={()=>setTouch(t)} style={{
                    width:28,height:28,borderRadius:7,
                    border:`1.5px solid ${touch===t?T.gold:T.border}`,
                    background:touch===t?T.gold:T.card,
                    color:touch===t?'white':T.text2,
                    fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:11,
                    cursor:'pointer',transition:'all 0.13s',
                  }}>{t}</button>
                ))}
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3}}>
                  {touch===1?'Moment':touch===2?'Identity':'Door'}
                </span>
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{
                background:T.card,border:`1px solid ${T.border}`,borderRadius:7,
                padding:'4px 8px',color:T.text2,fontSize:11,
                fontFamily:"'JetBrains Mono',monospace",cursor:'pointer',outline:'none',
              }}>
                <option value="priority">Priority</option>
                <option value="name">Name</option>
                <option value="seasons">Seasons</option>
              </select>
            </div>
          </div>

          {/* Contact list */}
          <div className='crm-contact-list' style={{flex:1,overflowY:'auto',padding:'0 14px 14px'}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.08em',textTransform:'uppercase',padding:'4px 0 8px'}}>
              {contacts.length} contact{contacts.length!==1?'s':''}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {contacts.map(ct=>{
                const sc=score(ct)
                const ini=initials(ct)
                const active=selectedContact?.id===ct.id
                const accent=statusAccent(ct.status)
                return(
                  <div key={ct.id} className="crm-contact-row"
                    onClick={()=>requestDraft(ct,touch)}
                    style={{borderRadius:11,overflow:'hidden',border:`1px solid ${active?T.gold:T.border}`,boxShadow:active?`0 0 0 2px ${T.gold}25`:'none',transition:'all 0.13s'}}>
                    <div className="crm-card-bg" style={{display:'flex',alignItems:'stretch',background:active?T.goldBg:T.card,padding:'11px 11px 11px 0',gap:10,transition:'background 0.13s'}}>
                      {/* Urgency bar */}
                      <div style={{width:4,flexShrink:0,background:accent,borderRadius:'0 2px 2px 0',opacity:active?1:0.7}}/>
                      {/* Avatar */}
                      <div style={{
                        width:36,height:36,borderRadius:9,flexShrink:0,
                        background:active?T.gold:ct.status==='hot'?`${T.red}20`:ct.status==='warm'?`${T.amber}18`:T.goldBg,
                        color:active?'white':ct.status==='hot'?T.red:ct.status==='warm'?T.amber:T.gold,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,
                      }}>{ini}</div>
                      {/* Info */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                          <div style={{fontSize:14,fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct.name}</div>
                          {ct.status==='hot'&&<span style={{fontSize:10,animation:'pulse 2s infinite',flexShrink:0}}>🔥</span>}
                        </div>
                        <div style={{fontSize:11,color:T.text3,marginBottom:5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          {ct.title||ct.email}
                        </div>
                        {/* Chips */}
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {(ct.purchase_count||0)>0&&(
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,background:T.bg,border:`1px solid ${T.border}`,borderRadius:4,padding:'1px 6px'}}>
                              {ct.purchase_count} seasons
                            </span>
                          )}
                          {(ct.last_year||0)>0&&(
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,background:T.bg,border:`1px solid ${T.border}`,borderRadius:4,padding:'1px 6px'}}>
                              {ct.last_year}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Score */}
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0,gap:6}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:scoreColor(sc)}}>{sc}</div>
                        <div style={{width:36,height:3,borderRadius:2,background:T.border,overflow:'hidden'}}>
                          <div style={{width:`${sc}%`,height:'100%',background:scoreColor(sc),borderRadius:2}}/>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Draft panel ─────────────────────────────────────────── */}
        <div className={`crm-right ${mobileView==='contacts'&&!selectedContact?'mobile-draft-hide':''}`}
          style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* Mobile back */}
          <div className="mobile-back" style={{padding:'10px 16px',borderBottom:`1px solid ${T.border}`,flexShrink:0,alignItems:'center',gap:8,background:T.card}}>
            <button onClick={()=>setMobileView('contacts')} style={{display:'flex',alignItems:'center',gap:6,border:'none',background:'none',cursor:'pointer',color:T.text2,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:0}}>
              <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              All Contacts
            </button>
          </div>

          {/* Empty state */}
          {!selectedContact&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:16,background:T.goldBg,border:`1px solid ${T.goldBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:14}}>📧</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:T.text,marginBottom:6}}>Select a Contact</div>
              <div style={{fontSize:13,color:T.text3,maxWidth:260,lineHeight:1.6}}>Tap any contact to generate an AI-personalized email draft instantly.</div>
            </div>
          )}

          {/* Loading */}
          {selectedContact&&loading&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:T.goldBg,border:`1.5px solid ${T.goldBdr}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>🏔️</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:T.text,marginBottom:6}}>Grip is drafting…</div>
              <div style={{fontSize:13,color:T.text3,marginBottom:24}}>Writing Touch {touch} for {selectedContact.name}</div>
              <div style={{display:'flex',gap:8}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:T.gold,animation:`dbounce 1.2s ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}

          {/* Draft content */}
          {selectedContact&&!loading&&parsed&&(
            <div style={{flex:1,overflowY:'auto',padding:'16px 18px 32px'}}>

              {/* ── Contact record (Salesforce-style) ──────────────────── */}
              <div style={{...CARD,marginBottom:14,overflow:'hidden'}}>
                {/* Record header */}
                <div style={{padding:'14px 16px',background:T.bg,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{
                    width:48,height:48,borderRadius:12,flexShrink:0,
                    background:T.gold,color:'white',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,
                  }}>{initials(selectedContact)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:T.text,marginBottom:2}}>{selectedContact.name}</div>
                    <div style={{fontSize:11,color:T.text3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{selectedContact.title||selectedContact.email}</div>
                  </div>
                  {/* Status badge */}
                  <div style={{
                    padding:'4px 10px',borderRadius:8,flexShrink:0,
                    background:statusBg(selectedContact.status),
                    border:`1px solid ${statusAccent(selectedContact.status)}40`,
                    color:statusAccent(selectedContact.status),
                    fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:10,textTransform:'uppercase',
                  }}>
                    {selectedContact.status==='hot'?'🔥 ':''}{selectedContact.status}
                  </div>
                </div>
                {/* Stat grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
                  {[
                    {label:'Score',   value:score(selectedContact), color:scoreColor(score(selectedContact))},
                    {label:'Seasons', value:selectedContact.purchase_count||0},
                    {label:'Last Yr', value:selectedContact.last_year||'—'},
                    {label:'City',    value:selectedContact.city||'—'},
                  ].map((item,i)=>(
                    <div key={i} style={{padding:'10px 12px',borderRight:i<3?`1px solid ${T.border}`:'none'}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:T.text3,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>{item.label}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:item.color||T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {/* Pipeline bar */}
                <div style={{padding:'12px 16px 8px',borderTop:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Pipeline Stage</div>
                  <PipelineBar status={selectedContact.status}/>
                </div>
              </div>

              {/* ── Touch selector ─────────────────────────────────────── */}
              <div style={{display:'flex',gap:6,marginBottom:14}}>
                {[1,2,3].map(t=>(
                  <button key={t} onClick={()=>{setTouch(t);requestDraft(selectedContact,t)}}
                    style={{
                      flex:1,padding:'10px 8px',borderRadius:10,
                      border:`1.5px solid ${touch===t?T.gold:T.border}`,
                      background:touch===t?T.goldBg:T.card,
                      cursor:'pointer',transition:'all 0.13s',textAlign:'center',
                    }}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13,color:touch===t?T.gold:T.text2,marginBottom:2}}>T{t}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:touch===t?T.gold:T.text3,letterSpacing:'0.04em'}}>
                      {t===1?'The Moment':t===2?'The Identity':'The Door'}
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Angle banner ────────────────────────────────────────── */}
              {parsed.angle&&(
                <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 14px',borderRadius:10,background:T.goldBg,border:`1px solid ${T.goldBdr}`,marginBottom:14}}>
                  <svg style={{width:14,height:14,color:T.gold,flexShrink:0,marginTop:2}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:700,color:T.gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>{parsed.angle}</div>
                    <div style={{fontSize:12,color:T.text2,lineHeight:1.6}}>{parsed.reason}</div>
                  </div>
                </div>
              )}

              {/* ── Email card ──────────────────────────────────────────── */}
              <div style={{...CARD,marginBottom:12,overflow:'hidden'}}>
                {/* Toolbar */}
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:8,background:T.bg,flexWrap:'wrap'}}>
                  <button onClick={()=>requestDraft(selectedContact,touch)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:7,border:`1px solid ${T.border}`,background:T.card,color:T.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',transition:'opacity 0.13s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.75'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                    ↺ Regenerate
                  </button>
                  <button onClick={()=>setEditMode(!editMode)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:7,border:`1px solid ${editMode?T.gold:T.border}`,background:editMode?T.gold:'transparent',color:editMode?'white':T.text2,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,cursor:'pointer',transition:'all 0.13s'}}>
                    {editMode?'✓ Preview':'✎ Edit'}
                  </button>
                </div>
                {/* Subject */}
                <div style={{padding:'12px 14px',borderBottom:`1px solid ${T.border}`}}>
                  <div style={{...LABEL}}>Subject</div>
                  {editMode
                    ?<input value={editedSubject} onChange={e=>setEditedSubject(e.target.value)} style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid ${T.border}`,background:T.bg,color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
                    :<div style={{fontSize:14,fontWeight:600,color:T.text,lineHeight:1.4}}>{parsed.subject}</div>
                  }
                </div>
                {/* Body */}
                <div style={{padding:'12px 14px'}}>
                  <div style={{...LABEL}}>Body</div>
                  {editMode
                    ?<textarea value={editedBody} onChange={e=>setEditedBody(e.target.value)} style={{width:'100%',minHeight:160,padding:'10px 12px',borderRadius:7,border:`1px solid ${T.border}`,background:T.bg,color:T.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,resize:'vertical',outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
                    :<div style={{fontSize:14,lineHeight:1.8,color:T.text,whiteSpace:'pre-wrap'}}>{parsed.body}</div>
                  }
                </div>
              </div>

              {/* Rep note */}
              {parsed.followUp&&(
                <div style={{padding:'11px 14px',borderRadius:10,background:T.greenBg,border:`1px solid rgba(10,110,56,0.2)`,marginBottom:14}}>
                  <div style={{...LABEL,color:T.green}}>Rep Note</div>
                  <div style={{fontSize:12,color:T.green,lineHeight:1.65}}>{parsed.followUp}</div>
                </div>
              )}

              {/* Send */}
              <button onClick={openInEmail} style={{width:'100%',padding:'14px',borderRadius:11,border:'none',background:T.bg,color:T.gold,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'opacity 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open in Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
