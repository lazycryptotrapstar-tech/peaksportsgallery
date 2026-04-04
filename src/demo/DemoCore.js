/* ═══════════════════════════════════════════════════════════════════════════
   DemoCore.js — LOCKED FUNCTIONAL LOGIC
   ─────────────────────────────────────────────────────────────────────────
   DO NOT MODIFY THIS FILE when making UI/visual changes to the demo.
   All webhook URLs, AI logic, scoring, and draft parsing live here.
   Changes to this file affect live AI functionality — CRM email generation
   and Sales Agent chat. Test thoroughly before committing any edits.
   ─────────────────────────────────────────────────────────────────────────
   Safe to edit in: DemoCRM.jsx, DemoSalesAgent.jsx (UI/styles only)
   Requires review: DemoCore.js, n8n workflows, Supabase school record
═══════════════════════════════════════════════════════════════════════════ */

import { DEMO_SCHOOL } from './DemoConstants'

/* ─── Webhook endpoints ───────────────────────────────────────────────────── */
export const WEBHOOK_PLAYBOOK    = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'
export const WEBHOOK_SALES_AGENT = 'https://n8n-production-f9c2.up.railway.app/webhook/sales-agent'

/* ─── Contact scoring ─────────────────────────────────────────────────────── */
export const score = ct => {
  let s = 30
  s += Math.min((ct.purchase_count||0)*10, 40)
  if(ct.status==='hot')  s+=20
  if(ct.status==='warm') s+=10
  if(ct.status==='cold') s-=10
  if((ct.last_year||0)>=2025) s+=10
  else if((ct.last_year||0)>=2023) s+=5
  return Math.min(100, Math.max(0, s))
}

/* ─── Score color thresholds ──────────────────────────────────────────────── */
// Note: returns string key, not hex — consuming component maps to T token
export const scoreLevel = s => s>=80 ? 'green' : s>=60 ? 'amber' : 'red'

/* ─── Draft parser — reads structured n8n output ─────────────────────────── */
export const parseDraft = raw => {
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

/* ─── CRM: request email draft from n8n playbook webhook ─────────────────── */
export const requestDraft = async ({ campaign, touch, contact }) => {
  const ct = contact
  const res = await fetch(WEBHOOK_PLAYBOOK, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      school_id:'demo',
      campaign,
      touch,
      contact:{
        id:ct.id,
        name:ct.name,
        email:ct.email,
        phone:ct.phone||'',
        title:ct.title||'',
        purchase_count:ct.purchase_count||0,
        status:ct.status||'warm',
        last_year:ct.last_year||0,
        sport:ct.sport||'Football',
        tags:Array.isArray(ct.tags)?ct.tags.join(','):ct.tags||'',
        city:ct.city||'',
        membership_tier:ct.membership_tier||'',
      },
    }),
  })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const raw = data.draft||data.output||data.text||data.message||data.response||''
  if(!raw) throw new Error('Empty response from webhook')
  return parseDraft(raw)
}

/* ─── Sales Agent: system prompt builder ─────────────────────────────────── */
export const buildSystemPrompt = (s, campId) =>
`You are ${s.mascotName}, the AI-powered revenue agent for ${s.name} ${s.mascot} athletics, operated by Peak Sports MGMT.
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

/* ─── Sales Agent: send chat message to n8n ──────────────────────────────── */
export const sendChatMessage = async ({ input, sessionId, campaign }) => {
  const s = DEMO_SCHOOL
  const res = await fetch(WEBHOOK_SALES_AGENT, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      chatInput: input,
      sessionId: `${s.id}-${campaign.id}-${sessionId}`,
      school_id: s.id,
      school_name: s.name,
      campaign: campaign.id,
      systemPrompt: buildSystemPrompt(s, campaign.id),
    }),
  })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.output||data?.text||data?.message||data?.response||'Try again in a moment.'
}

/* ─── Sales Agent: campaign openers ──────────────────────────────────────── */
export const CAMPAIGNS_AGENT = [
  {id:'TICKETS',    label:'Ticket Sales',     sub:'Live inventory · Real-time pricing',
   opener:s=>`${s.emoji} Hey! Grip here — your ${s.name} ticket rep. Big games coming up at ${s.venue?.football?.name}. What sports are you into this season?`},
  {id:'SPONSORSHIP',label:'Sponsorship',      sub:'Corporate partners · Package builder',
   opener:s=>`Hey! Grip here from ${s.name} athletics. Quick question — what's your primary marketing goal this year? Brand awareness, leads, or community presence?`},
  {id:'HOSPITALITY',label:'Hospitality',      sub:'VIP access · Priority booking',
   opener:s=>`You have first access to ${s.vip?.[0]} this season. Are you thinking football, basketball, or both — and how many guests?`},
  {id:'ALUMNI',     label:'Alumni Outreach',  sub:'Class reunion · Group seating',
   opener:s=>`${s.emoji} Once a Mountaineer, always a Mountaineer. We're building alumni sections for ${s.name} home games this season. What year did you graduate?`},
]

/* ─── CRM campaign definitions ────────────────────────────────────────────── */
export const CAMPAIGNS_CRM = [
  {id:'TICKETS',    label:'Ticket Reactivation', short:'Tickets'},
  {id:'SPONSORSHIP',label:'Sponsorship Outreach', short:'Sponsors'},
]
