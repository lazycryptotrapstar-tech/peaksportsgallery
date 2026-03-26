import React, { useState, useRef, useEffect } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { Send, ShoppingCart, Trophy, Star, Users } from 'lucide-react'
import { getContacts } from '../../data/contacts'

const N8N_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/2e28cfe9-961f-48fb-a548-3f0306448996/chat'

// ── Compute score (mirrors CRM logic) ─────────────────────────────────────────
const computeScore = (ct) => {
  let s = 30
  s += Math.min((ct.purchase_count || 0) * 10, 40)
  if (ct.status === 'hot')  s += 20
  if (ct.status === 'warm') s += 10
  if (ct.status === 'cold') s -= 10
  if ((ct.last_year || 0) >= 2025) s += 10
  else if ((ct.last_year || 0) >= 2023) s += 5
  return Math.min(100, Math.max(0, s))
}

const SCORE_COLOR = (s) => s >= 80 ? '#3CDB7A' : s >= 60 ? '#F5C842' : '#f97316'

// ── System prompt ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (school, campaignId) => `You are ${school.mascotName}, the AI-powered revenue agent for ${school.name} ${school.mascot} athletics, operated by Peak Sports MGMT.

SCHOOL: ${school.name} | ${school.conference} | ${school.location}
FOOTBALL: ${school.venue?.football?.name} (${school.venue?.football?.capacity?.toLocaleString()} cap)
BASKETBALL: ${school.venue?.basketball?.name} (${school.venue?.basketball?.capacity?.toLocaleString()} cap)
RIVALS: ${school.rivals?.join(', ')}
VIP: ${school.vip?.join(', ')}

SALES METHOD: Challenger Sale + Gap Selling
1. TEACH first — share an insight they haven't considered
2. TAILOR — personalize to their situation
3. TAKE CONTROL — guide toward a decision
4. Find the GAP — distance between where they are and where they want to be
5. Always close toward a SPECIFIC next step

RULES:
- Ask ONE qualifying question at a time
- Reference ${school.name}-specific details in every response
- Handle objections with empathy first, then reframe
- Keep responses under 4 sentences unless presenting options
- Be warm, direct, and confident — never robotic

${campaignId === 'TICKETS' ? `CAMPAIGN: Ticket Sales
GOAL: Sell tickets, season plans, flex plans, or group packages
- The ${school.rivals?.[0]} rivalry game is always the anchor — use it for urgency
- Break down season tickets to per-game cost
- Groups of 10+: lead with the experience, not the price
OBJECTIONS:
- "Too expensive" → "What's your budget per game? I can work with that."
- "I'll wait" → "The ${school.rivals?.[0]} game usually sells out — want me to hold something?"` : ''}

${campaignId === 'SPONSORSHIP' ? `CAMPAIGN: Sponsorship Sales
GOAL: Sell corporate sponsorship packages to local businesses
- Open with an insight: most businesses underestimate the CPM of college athletics vs digital ads
- Always ask: what's your primary marketing goal — awareness, leads, or community presence?
- Present 2-3 options after qualifying, let them choose
PACKAGES: Bronze $2-3k | Silver $5-8k | Gold $12-20k | Presenting $35-50k` : ''}

${campaignId === 'HOSPITALITY' ? `CAMPAIGN: Hospitality & Suites
GOAL: Sell VIP experiences — ${school.vip?.join(', ')}
- Lead with STATUS and EXPERIENCE, not price
- "We only have X spots left" — create real scarcity
- Ask: football, basketball, or both? How many guests?` : ''}

${campaignId === 'ALUMNI' ? `CAMPAIGN: Alumni Outreach
GOAL: Sell group packages to former students
- Lead with BELONGING — "Come back to campus with your people"
- Use graduation year as nostalgia anchor
- The ${school.rivals?.[0]} rivalry game is the one worth coming back for` : ''}`

// ── Campaigns ──────────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: 'TICKETS',
    label: 'Ticket Sales',
    sub: 'Live inventory · Real-time pricing',
    icon: ShoppingCart,
    getOpener: (s) => `${s.emoji} Hey! ${s.mascotName} here — your ${s.name} ${s.mascot} ticket rep. Big games coming up at ${s.venue?.football?.name}. What sports are you into this season?`,
  },
  {
    id: 'SPONSORSHIP',
    label: 'Sponsorship Sales',
    sub: 'Corporate partners · Package builder',
    icon: Trophy,
    getOpener: (s) => `Hey! ${s.mascotName} here from ${s.name} athletics. Quick question before anything else — what's your primary marketing goal this year? Brand awareness, lead generation, or community presence?`,
  },
  {
    id: 'HOSPITALITY',
    label: 'Hospitality & Suites',
    sub: 'VIP access · Priority booking',
    icon: Star,
    getOpener: (s) => `Good to connect. You have first access to ${s.vip?.[0]} this season. Are you thinking football, basketball, or both — and how many guests are you typically bringing?`,
  },
  {
    id: 'ALUMNI',
    label: 'Alumni Outreach',
    sub: 'Class reunion · Group seating',
    icon: Users,
    getOpener: (s) => `${s.emoji} Once a ${s.mascot?.slice(0,-1)}, always a ${s.mascot?.slice(0,-1)}. We're building alumni sections for ${s.name} home games this season. What year did you graduate?`,
  },
]

export default function SalesAgent() {
  const { school } = useSchool()
  const c = school.colors
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [messages, setMessages]             = useState([])
  const [input, setInput]                   = useState('')
  const [isTyping, setIsTyping]             = useState(false)
  const [sessionId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset when school changes
  useEffect(() => {
    setActiveCampaign(null)
    setMessages([])
    setInput('')
  }, [school.id])

  const selectCampaign = (campaign) => {
    setActiveCampaign(campaign)
    setMessages([{ role: 'assistant', content: campaign.getOpener(school), ts: Date.now() }])
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeCampaign) return
    const userMsg = { role: 'user', content: input, ts: Date.now() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: input,
          sessionId: `${school.id}-${activeCampaign.id}-${sessionId}`,
          // Pass school + campaign context as separate fields n8n can use
          school_id:   school.id,
          school_name: school.name,
          campaign:    activeCampaign.id,
          systemPrompt: buildSystemPrompt(school, activeCampaign.id),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      // Try all known response field names n8n might return
      const reply =
        data?.output ||
        data?.text ||
        data?.message ||
        data?.response ||
        data?.answer ||
        (Array.isArray(data?.content) ? data.content[0]?.text : null) ||
        (typeof data === 'string' ? data : null) ||
        "I'm having trouble connecting right now. Try again in a moment."

      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch (err) {
      console.error('SalesAgent webhook error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Connection issue — try again in a moment.",
        ts: Date.now()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // ── Top contact for this school ───────────────────────────────────────────
  const topContact = (() => {
    const contacts = getContacts(school.id, 'TICKETS')
    if (!contacts.length) return null
    return contacts
      .map(ct => ({ ...ct, _score: computeScore(ct) }))
      .sort((a, b) => b._score - a._score)[0]
  })()

  const fanInitials = topContact?.name
    ? topContact.name.split(' ').map(n => n[0]).slice(0, 2).join('')
    : school.short.slice(0, 2)

  const fanScore = topContact ? computeScore(topContact) : 0

  // ── CAMPAIGN SELECTOR ────────────────────────────────────────────────────
  if (!activeCampaign) {
    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        background: c.bg,
        padding: '24px 20px 40px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

          {/* Header */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.accent, marginBottom: 6, margin: '0 0 6px' }}>
              Sales Agent · {school.short}
            </p>
            <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,38px)', color: c.primary, margin: '0 0 4px' }}>
              Choose a Campaign
            </h2>
            <p style={{ color: c.accent, fontSize: 13, opacity: 0.75, margin: 0 }}>
              Tap a campaign to start a live conversation with {school.mascotName}
            </p>
          </div>

          {/* Campaign pills */}
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none', paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4, width: 'max-content' }}>
              {CAMPAIGNS.map(cam => {
                const Icon = cam.icon
                return (
                  <button key={cam.id} onClick={() => selectCampaign(cam)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '10px 18px', borderRadius: 28,
                      border: `1.5px solid ${c.accent}`,
                      background: 'white', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.primary }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white' }}>
                    <Icon size={15} color={c.accent} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: c.primary }}>{cam.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Phone preview — fixed size, not oversized */}
          <PhoneFrame school={school} />

          {/* Top contact card */}
          {topContact && (
            <div style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, margin: '0 0 8px' }}>
                  Top Contact · {school.short}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                    {fanInitials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: c.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topContact.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: c.accent, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topContact.title}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: '0 0 2px', fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent, textTransform: 'uppercase' }}>Score</p>
                <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 28, color: SCORE_COLOR(fanScore) }}>
                  {fanScore}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  // ── CHAT VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '16px 12px 24px',
      background: c.bg,
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 390,
        background: '#000',
        borderRadius: 'clamp(24px, 6vw, 52px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 8px #1a1a1a, 0 0 0 10px #333',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'min(680px, calc(100vh - 140px))',
      }}>
        {/* Notch */}
        <div style={{ background: '#000', padding: '8px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>9:41</span>
          <div style={{ width: 120, height: 30, background: '#000', borderRadius: 20, border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 16, height: 10, borderRadius: 3, border: '1.5px solid rgba(255,255,255,0.5)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Chat header */}
        <div style={{ padding: '10px 20px 12px', background: c.primary, borderBottom: `1px solid ${c.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {school.emoji}
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1.1 }}>{activeCampaign.label}</p>
              <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent }}>
                {school.name} · <span style={{ color: '#3CDB7A' }}>● LIVE</span>
              </p>
            </div>
          </div>
          <button onClick={() => setActiveCampaign(null)}
            style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${c.accent}44`, background: 'transparent', cursor: 'pointer', fontSize: 11, color: c.accent, fontFamily: "'Inter',sans-serif" }}>
            ← Back
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: c.bg }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>
                  {school.emoji}
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? c.primary : 'white',
                color: msg.role === 'user' ? 'white' : c.primary,
                fontSize: 13, lineHeight: 1.6, fontFamily: "'Inter',sans-serif",
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{school.emoji}</div>
              <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: 'white', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c.accent, animation: `sagBounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 20px', background: 'white', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message ${school.mascotName}...`}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: `1px solid ${c.border}`, fontSize: 13, fontFamily: "'Inter',sans-serif", outline: 'none', background: c.bg, color: c.primary }}
            />
            <button onClick={sendMessage}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: c.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={16} color="white" />
            </button>
          </div>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: c.accent, textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
            {school.mascotName} · {school.name} · Simple Genius
          </p>
        </div>

        {/* Home indicator */}
        <div style={{ background: '#000', paddingBottom: 8, paddingTop: 4, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 120, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>

      <style>{`@keyframes sagBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

// ── Preview phone (campaign selector) ─────────────────────────────────────────
function PhoneFrame({ school }) {
  const c = school.colors
  return (
    <div style={{
      width: 260,
      background: '#000',
      borderRadius: 40,
      boxShadow: '0 20px 52px rgba(0,0,0,0.3), 0 0 0 8px #1a1a1a, 0 0 0 10px #333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 480,
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{ background: '#000', padding: '10px 20px 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 90, height: 22, background: '#000', borderRadius: 14, border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </div>
      {/* Header */}
      <div style={{ padding: '8px 16px 10px', background: c.primary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{school.emoji}</div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: 'white' }}>Ticket Sales</p>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 8, color: c.accent }}>{school.name} · <span style={{ color: '#3CDB7A' }}>● LIVE</span></p>
          </div>
        </div>
      </div>
      {/* Preview messages */}
      <div style={{ flex: 1, padding: '12px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{school.emoji}</div>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 12px 4px', background: 'white', fontSize: 10, lineHeight: 1.5, color: c.primary, maxWidth: '80%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Hey! {school.mascotName} here — your {school.short} ticket rep. Big game coming up at {school.venue?.football?.name}. What games are you thinking about?
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 4px 12px', background: c.primary, fontSize: 10, lineHeight: 1.5, color: 'white', maxWidth: '70%' }}>
            I'm interested in the football season!
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{school.emoji}</div>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 12px 4px', background: 'white', fontSize: 10, lineHeight: 1.5, color: c.primary, maxWidth: '80%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Perfect timing — the {school.rivals?.[0]} rivalry game is coming up. Want me to check availability near the 50?
          </div>
        </div>
      </div>
      {/* Input preview */}
      <div style={{ padding: '8px 12px 14px', background: 'white', borderTop: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ flex: 1, padding: '6px 10px', borderRadius: 18, background: c.bg, fontSize: 10, color: c.accent, border: `1px solid ${c.border}` }}>Message {school.mascotName}...</div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={11} color="white" />
          </div>
        </div>
      </div>
      {/* Home bar */}
      <div style={{ background: '#000', paddingBottom: 6, paddingTop: 3, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
      </div>
    </div>
  )
}
