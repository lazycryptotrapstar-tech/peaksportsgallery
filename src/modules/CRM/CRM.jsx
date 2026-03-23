import React, { useState } from 'react'
import { useSchool } from '../../context/SchoolContext'
import {
  ShoppingCart, Trophy, ArrowLeft, Edit2,
  RefreshCw, ExternalLink, Sparkles, Zap,
  Shield, ChevronRight, Send, Check
} from 'lucide-react'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

// ── CONTACT DATA ─────────────────────────────────────────────────
const WOFFORD_CONTACTS = {
  TICKETS: [
    { id:1, name:'Scott Kull',          email:'kullsr@wofford.edu',                 title:'Director of Athletics',        purchase_count:8, last_purchase_date:'2024-11-15', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:82 },
    { id:2, name:'Nayef Samhat',        email:'samhatnr@wofford.edu',               title:'President',                    purchase_count:4, last_purchase_date:'2024-10-20', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'warm', score:74 },
    { id:3, name:'Shawn Watson',        email:'watsonsc@wofford.edu',               title:'Head Football Coach',          purchase_count:6, last_purchase_date:'2025-01-10', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:91 },
    { id:4, name:'Kevin Giltner',       email:'giltnerkj@wofford.edu',              title:'Head Basketball Coach',        purchase_count:5, last_purchase_date:'2025-02-14', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'hot',  score:88 },
    { id:5, name:'Calhoun Kennedy Jr.', email:'kennedycl@wofford.edu',              title:'VP Philanthropy & Engagement', purchase_count:2, last_purchase_date:'2024-09-01', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'hot',  score:79 },
  ],
  SPONSORSHIP: [
    { id:6, name:'Hub City Tap House',   email:'manager@hubcitytap.com',            title:'Owner',              business_type:'restaurant', sponsor_status:'prospect', status:'hot',  score:85 },
    { id:7, name:'Spartanburg Regional', email:'marketing@spartanburgregional.com', title:'Marketing Director', business_type:'healthcare', sponsor_status:'current',  renewal_date:'2026-06-01', annual_value:8000, status:'warm', score:77 },
    { id:8, name:'R.J. Rockers Brewing', email:'info@rjrockers.com',                title:'Owner',              business_type:'restaurant', sponsor_status:'lapsed',   status:'warm', score:68 },
    { id:9, name:'Beacon Drive-In',      email:'hello@beacondrivein.com',           title:'Manager',            business_type:'restaurant', sponsor_status:'prospect', status:'cold', score:44 },
  ],
}

const SCORE_COLOR = (s) => s >= 80 ? '#3CDB7A' : s >= 60 ? '#F5C842' : '#f97316'
const STATUS_LABEL = { hot:'Hot Lead', warm:'Warm', cold:'Cold' }

const parseDraft = (raw) => {
  if (!raw) return { angle:'', reason:'', subject:'', body:'', followUp:'' }
  const lines = raw.split('\n')
  let angle='', reason='', subject='', body='', followUp='', inBody=false
  for (const line of lines) {
    if (line.startsWith('SELECTED ANGLE:'))     { angle   = line.replace('SELECTED ANGLE:','').trim(); inBody=false }
    else if (line.startsWith('REASON:'))        { reason  = line.replace('REASON:','').trim();         inBody=false }
    else if (line.startsWith('SUBJECT:'))       { subject = line.replace('SUBJECT:','').trim();        inBody=false }
    else if (line.startsWith('BODY:'))          { inBody  = true }
    else if (line.startsWith('FOLLOW-UP NOTE')) { followUp= line.replace('FOLLOW-UP NOTE FOR REP:','').trim(); inBody=false }
    else if (inBody)                            { body += (body?'\n':'')+line }
  }
  return { angle, reason, subject, body:body.trim(), followUp }
}

// ── CSS ───────────────────────────────────────────────────────────
const CSS = (primary) => `
  .pb-shell { background:var(--pb-bg); min-height:100%; font-family:'DM Sans',Inter,sans-serif; color:var(--pb-text); }
  .pb-card { background:var(--pb-surface); border:1px solid var(--pb-border); border-radius:16px; }
  .pb-card-2 { background:var(--pb-surface2); border:1px solid var(--pb-border); border-radius:12px; }
  .pb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.15s; }
  .pb-btn:hover { border-color:${primary}; color:${primary}; }
  .pb-btn-primary { background:${primary}; border-color:${primary}; color:#000 !important; }
  .pb-btn-primary:hover { opacity:0.9; }
  .pb-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${primary}; }
  .pb-score { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:13px; font-weight:700; }
  .pb-contact-row { display:flex; align-items:center; padding:14px 18px; border-radius:12px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.15s; gap:14px; }
  .pb-contact-row:hover { border-color:${primary}; background:var(--pb-surface2); transform:translateX(2px); }
  .pb-campaign-card { padding:28px 24px; border-radius:20px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.2s; text-align:left; }
  .pb-campaign-card:hover { border-color:${primary}; transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
  .pb-touch-btn { width:40px; height:40px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-weight:700; font-size:15px; transition:all 0.15s; }
  .pb-touch-btn.active { background:${primary}; border-color:${primary}; color:#000; }
  .pb-input { width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); font-size:14px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; }
  .pb-input:focus { border-color:${primary}; }
  .pb-textarea { width:100%; min-height:180px; padding:12px 14px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); font-size:14px; font-family:'DM Sans',sans-serif; line-height:1.7; resize:vertical; outline:none; box-sizing:border-box; }
  .pb-textarea:focus { border-color:${primary}; }
  @keyframes pb-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
  @keyframes pb-spin { to { transform:rotate(360deg); } }
`

export default function CRM() {
  const { school } = useSchool()
  const c = school.colors
  const primary = c.accent

  const [stage, setStage]               = useState('campaign')
  const [campaign, setCampaign]         = useState(null)
  const [contact, setContact]           = useState(null)
  const [touch, setTouch]               = useState(1)
  const [parsed, setParsed]             = useState(null)
  const [loading, setLoading]           = useState(false)
  const [editMode, setEditMode]         = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody]     = useState('')

  const contacts = campaign ? (WOFFORD_CONTACTS[campaign] || []) : []

  const requestDraft = async (ct, t) => {
    setLoading(true); setStage('drafting'); setParsed(null)
    try {
      const res = await fetch(PLAYBOOK_WEBHOOK, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ school_id:school.id, campaign, touch:t, contact:ct }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft || '')
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
      setStage('review')
    } catch {
      setParsed({ angle:'Connection Error', reason:'Check n8n webhook', subject:'', body:'Could not connect to AI.', followUp:'' })
      setStage('review')
    } finally { setLoading(false) }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode ? editedSubject : parsed?.subject || '')
    const body = encodeURIComponent(editMode ? editedBody   : parsed?.body    || '')
    window.open(`mailto:${contact.email}?subject=${subj}&body=${body}`)
  }

  const reset = () => { setStage('campaign'); setCampaign(null); setContact(null); setTouch(1); setParsed(null); setEditMode(false) }

  const vars = {
    '--pb-bg':      c.primary,
    '--pb-surface': 'rgba(255,255,255,0.05)',
    '--pb-surface2':'rgba(255,255,255,0.09)',
    '--pb-border':  'rgba(255,255,255,0.1)',
    '--pb-text':    '#f0f0f0',
    '--pb-muted':   'rgba(255,255,255,0.4)',
  }

  const avatarBg = (name) => {
    const initials = name.split(' ').map(n=>n[0]).slice(0,2).join('')
    return { bg: `${primary}22`, initials }
  }

  return (
    <div className="pb-shell" style={vars}>
      <style>{CSS(primary)}</style>

      {/* ── CAMPAIGN SELECTOR ─────────────────────────── */}
      {stage === 'campaign' && (
        <div style={{ maxWidth:800, margin:'0 auto', padding:'48px 28px' }}>
          <p className="pb-label" style={{ marginBottom:8 }}>The Playbook · {school.short}</p>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(40px,6vw,60px)', color:'#fff', margin:'0 0 6px', letterSpacing:'0.03em' }}>
            Choose a Campaign
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:40 }}>
            Select your outreach type to load contacts and start drafting
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:40 }}>
            {[
              { id:'TICKETS',     label:'Ticket Reactivation',  sub:'Lapsed buyers · Season renewals · Group sales',      icon:ShoppingCart, count:WOFFORD_CONTACTS.TICKETS.length     },
              { id:'SPONSORSHIP', label:'Sponsorship Outreach', sub:'Local businesses · Current partners · Prospects',    icon:Trophy,       count:WOFFORD_CONTACTS.SPONSORSHIP.length },
            ].map(cam => {
              const Icon = cam.icon
              return (
                <button key={cam.id} className="pb-campaign-card" onClick={() => { setCampaign(cam.id); setStage('contacts') }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${primary}22`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                    <Icon size={22} color={primary} />
                  </div>
                  <p style={{ margin:'0 0 6px', fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:'#fff', letterSpacing:'0.04em' }}>{cam.label}</p>
                  <p style={{ margin:'0 0 18px', fontFamily:"'Space Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.35)' }}>{cam.sub}</p>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:`${primary}22` }}>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:primary, fontWeight:700 }}>{cam.count} contacts</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { label:'Total Contacts', value:'9' },
              { label:'Hot Leads',      value:'5' },
              { label:'AI Emails Sent', value:'47' },
            ].map(s => (
              <div key={s.label} className="pb-card-2" style={{ padding:'16px 18px' }}>
                <p className="pb-label" style={{ marginBottom:6 }}>{s.label}</p>
                <p style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:primary, letterSpacing:'0.03em' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT LIST ──────────────────────────────── */}
      {stage === 'contacts' && (
        <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
          <button className="pb-btn" onClick={reset} style={{ marginBottom:28 }}>
            <ArrowLeft size={15} /> Back to Campaigns
          </button>

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="pb-label" style={{ marginBottom:6 }}>{campaign === 'TICKETS' ? 'Ticket Reactivation' : 'Sponsorship Outreach'}</p>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(32px,5vw,48px)', color:'#fff', margin:0, letterSpacing:'0.03em' }}>
                {school.short} Contacts
              </h2>
            </div>
            <div>
              <p className="pb-label" style={{ marginBottom:8, textAlign:'right' }}>Touch</p>
              <div style={{ display:'flex', gap:8 }}>
                {[1,2,3].map(t => (
                  <button key={t} className={`pb-touch-btn${touch===t?' active':''}`} onClick={() => setTouch(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:6, textAlign:'right' }}>
                {touch===1?'The Moment':touch===2?'The Identity':'The Door'}
              </p>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {contacts.map(ct => {
              const av = avatarBg(ct.name)
              return (
                <button key={ct.id} className="pb-contact-row" onClick={() => { setContact(ct); requestDraft(ct, touch) }}>
                  {/* Avatar */}
                  <div style={{ width:44, height:44, borderRadius:12, background:av.bg, border:`1px solid ${primary}33`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:primary, flexShrink:0, letterSpacing:'0.05em' }}>
                    {av.initials}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ct.name}</p>
                    <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ct.title}</p>
                  </div>
                  {/* Score */}
                  <div className="pb-score" style={{ background:`${SCORE_COLOR(ct.score)}18`, color:SCORE_COLOR(ct.score), flexShrink:0 }}>
                    {ct.score}
                  </div>
                  {/* Status */}
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, background:`${SCORE_COLOR(ct.score)}18`, flexShrink:0 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:SCORE_COLOR(ct.score), display:'inline-block' }} />
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:SCORE_COLOR(ct.score), fontWeight:700 }}>{STATUS_LABEL[ct.status]}</span>
                  </div>
                  <ChevronRight size={16} color={primary} style={{ flexShrink:0 }} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DRAFTING ──────────────────────────────────── */}
      {stage === 'drafting' && (
        <div style={{ maxWidth:800, margin:'0 auto', padding:'80px 28px', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`${primary}22`, border:`1px solid ${primary}44`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:32 }}>
            {school.emoji}
          </div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:'#fff', marginBottom:8, letterSpacing:'0.04em' }}>
            {school.mascotName} is drafting...
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:36 }}>
            Scoring {contact?.name} · Selecting angle · Writing Touch {touch}
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:primary, animation:`pb-bounce 1.2s ${i*0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* ── DRAFT REVIEW ──────────────────────────────── */}
      {stage === 'review' && parsed && (
        <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 28px' }}>
          <button className="pb-btn" onClick={() => setStage('contacts')} style={{ marginBottom:24 }}>
            <ArrowLeft size={15} /> Back to Contacts
          </button>

          {/* Angle badge */}
          <div style={{ padding:'14px 18px', borderRadius:14, background:`${primary}18`, border:`1px solid ${primary}33`, marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${primary}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
              <Zap size={16} color={primary} />
            </div>
            <div>
              <p className="pb-label" style={{ marginBottom:4 }}>{parsed.angle}</p>
              <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>{parsed.reason}</p>
            </div>
          </div>

          {/* Email card */}
          <div className="pb-card" style={{ marginBottom:16, overflow:'hidden' }}>
            {/* Card header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
              <div>
                <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.6)' }}>
                  <span style={{ color:'#fff', fontWeight:600 }}>To:</span> {contact?.name} · <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11 }}>{contact?.email}</span>
                </p>
                <p style={{ margin:'4px 0 0', fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                  Touch {touch} of 3 · {touch===1?'The Moment':touch===2?'The Identity':'The Door'}
                </p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="pb-btn" onClick={() => requestDraft(contact, touch)} style={{ padding:'7px 14px', fontSize:12 }}>
                  <RefreshCw size={13} /> Regenerate
                </button>
                <button className="pb-btn" onClick={() => setEditMode(!editMode)}
                  style={{ padding:'7px 14px', fontSize:12, ...(editMode ? { background:primary, borderColor:primary, color:'#000' } : {}) }}>
                  <Edit2 size={13} /> {editMode ? 'Preview' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Subject */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <p className="pb-label" style={{ marginBottom:6 }}>Subject</p>
              {editMode
                ? <input className="pb-input" value={editedSubject} onChange={e => setEditedSubject(e.target.value)} />
                : <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#fff' }}>{parsed.subject}</p>
              }
            </div>

            {/* Body */}
            <div style={{ padding:'20px' }}>
              <p className="pb-label" style={{ marginBottom:10 }}>Body</p>
              {editMode
                ? <textarea className="pb-textarea" value={editedBody} onChange={e => setEditedBody(e.target.value)} />
                : <div style={{ fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,0.75)', whiteSpace:'pre-wrap' }}>{parsed.body}</div>
              }
            </div>
          </div>

          {/* Follow-up note */}
          {parsed.followUp && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(60,219,122,0.08)', border:'1px solid rgba(60,219,122,0.2)', marginBottom:20 }}>
              <p style={{ margin:'0 0 4px', fontFamily:"'Space Mono',monospace", fontSize:10, color:'#3CDB7A', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>Rep Note</p>
              <p style={{ margin:0, fontSize:13, color:'rgba(60,219,122,0.85)', lineHeight:1.6 }}>{parsed.followUp}</p>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:12 }}>
            <button className="pb-btn pb-btn-primary" onClick={openInEmail}
              style={{ flex:1, justifyContent:'center', padding:'16px', borderRadius:14, fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:'0.06em' }}>
              <ExternalLink size={20} /> Open in Email
            </button>
            {touch < 3 && (
              <button className="pb-btn" onClick={() => { const next=touch+1; setTouch(next); requestDraft(contact, next) }}
                style={{ padding:'16px 22px', borderRadius:14, fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:'0.04em' }}>
                Next Touch <ChevronRight size={18} />
              </button>
            )}
          </div>

          <button onClick={reset} style={{ width:'100%', marginTop:12, padding:'10px', border:'none', background:'none', cursor:'pointer', fontSize:13, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',sans-serif" }}>
            ← Start over
          </button>
        </div>
      )}
    </div>
  )
}
