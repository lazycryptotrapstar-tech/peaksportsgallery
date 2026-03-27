import React, { useState, useRef, useEffect } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { Send, ShoppingCart, Trophy, Star, Users } from 'lucide-react'
import { getContacts } from '../../data/contacts'

const N8N_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/sales-agent'

// ── Score ─────────────────────────────────────────────────────────────────────
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

// ── Build school context block injected into chatInput ───────────────────────
// n8n system prompt reads this block and becomes that school's agent
const buildSchoolContext = (school, campaignId) => {
  return `[SCHOOL_CONTEXT]
SCHOOL: ${school.name}
SHORT: ${school.short}
MASCOT: ${school.mascot}
AGENT_NAME: ${school.mascotName}
CONFERENCE: ${school.conference}
LOCATION: ${school.location}
FOOTBALL_VENUE: ${school.venue?.football?.name || 'home stadium'}
BASKETBALL_VENUE: ${school.venue?.basketball?.name || 'home arena'}
RIVALS: ${(school.rivals || []).join(', ')}
VIP_ASSETS: ${(school.vip || []).join(', ')}
CAMPAIGN: ${campaignId}
[/SCHOOL_CONTEXT]`
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: 'TICKETS',
    label: 'Ticket Sales',
    icon: ShoppingCart,
    getOpener: (s) => `Hey! ${s.mascotName} here — your ${s.name} ${s.mascot} ticket rep. Big games coming up at ${s.venue?.football?.name || 'our stadium'}. What sports are you into this season?`,
  },
  {
    id: 'SPONSORSHIP',
    label: 'Sponsorship',
    icon: Trophy,
    getOpener: (s) => `Hey! ${s.mascotName} here from ${s.name} athletics. Quick question — what's your primary marketing goal this year? Brand awareness, lead generation, or community presence?`,
  },
  {
    id: 'HOSPITALITY',
    label: 'Hospitality',
    icon: Star,
    getOpener: (s) => `Good to connect. You have first access to ${s.vip?.[0] || 'our VIP experience'} this season. Are you thinking football, basketball, or both — and how many guests?`,
  },
  {
    id: 'ALUMNI',
    label: 'Alumni',
    icon: Users,
    getOpener: (s) => `${s.emoji} Once a ${s.mascot?.replace(/s$/i, '')}, always a ${s.mascot?.replace(/s$/i, '')}. We're building alumni sections for ${s.name} home games this season. What year did you graduate?`,
  },
]

export default function SalesAgent() {
  const { school } = useSchool()
  const c = school.colors
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [messages, setMessages]             = useState([])
  const [input, setInput]                   = useState('')
  const [isTyping, setIsTyping]             = useState(false)
  const sessionRef  = useRef(`${school.id}-${Date.now()}`)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Reset on school change
  useEffect(() => {
    setActiveCampaign(null)
    setMessages([])
    setInput('')
    sessionRef.current = `${school.id}-${Date.now()}`
  }, [school.id])

  const startCampaign = (cam) => {
    setActiveCampaign(cam)
    setMessages([{ role: 'assistant', content: cam.getOpener(school), ts: Date.now() }])
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeCampaign || isTyping) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: text, ts: Date.now() }])
    setInput('')
    setIsTyping(true)
    try {
      // Inject school context as prefix on first message (sessionId is new each campaign)
      // n8n reads [SCHOOL_CONTEXT] block and adapts the agent persona
      const contextBlock = buildSchoolContext(school, activeCampaign.id)
      const payload = {
        chatInput: `${contextBlock}\n\nUSER MESSAGE: ${text}`,
        sessionId: sessionRef.current,
      }
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const reply =
        data?.output ||
        data?.text ||
        data?.message ||
        data?.response ||
        (Array.isArray(data?.content) ? data.content[0]?.text : null) ||
        "I'm having trouble connecting right now. Try again in a moment."
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch (err) {
      console.error('SalesAgent error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue — try again in a moment.", ts: Date.now() }])
    } finally {
      setIsTyping(false)
    }
  }

  // Top contact
  const topContact = (() => {
    const list = getContacts(school.id, 'TICKETS')
    if (!list.length) return null
    return [...list].sort((a, b) => computeScore(b) - computeScore(a))[0]
  })()

  const fanScore    = topContact ? computeScore(topContact) : 0
  const fanInitials = topContact?.name
    ? topContact.name.split(' ').map(n => n[0]).slice(0, 2).join('')
    : school.short.slice(0, 2).toUpperCase()

  // ── CAMPAIGN SELECTOR ─────────────────────────────────────────────────────
  if (!activeCampaign) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', background: c.bg, padding: '28px 20px 48px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.accent, margin: '0 0 8px' }}>
              Sales Agent · {school.short}
            </p>
            <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 'clamp(26px,5vw,36px)', color: c.primary, margin: '0 0 6px' }}>
              Choose a Campaign
            </h2>
            <p style={{ color: c.accent, fontSize: 13, opacity: 0.7, margin: 0 }}>
              Start a live conversation with {school.mascotName}
            </p>
          </div>

          {/* Campaign pills — flex wrap so all 4 always show */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
            {CAMPAIGNS.map(cam => {
              const Icon = cam.icon
              return (
                <button
                  key={cam.id}
                  onClick={() => startCampaign(cam)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 28,
                    border: `1.5px solid ${c.accent}`,
                    background: 'white', cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.primary; e.currentTarget.style.borderColor = c.primary }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = c.accent }}
                >
                  <Icon size={14} color={c.accent} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: c.primary }}>
                    {cam.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Phone preview — fixed size */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <PhonePreview school={school} />
          </div>

          {/* Top contact card */}
          {topContact && (
            <div style={{
              padding: '14px 18px', borderRadius: 16,
              border: `1px solid ${c.border}`, background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
                  Top Contact · {school.short}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
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
      overflowY: 'auto',
      background: c.bg,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 12px 48px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 390,
        background: '#000',
        borderRadius: 'clamp(24px,6vw,52px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 8px #1a1a1a, 0 0 0 10px #333',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 620,
        flexShrink: 0,
      }}>

        {/* Notch */}
        <div style={{ background: '#000', padding: '8px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>9:41</span>
          <div style={{ width: 110, height: 28, background: '#000', borderRadius: 18, border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
          </div>
          <div style={{ width: 14, height: 9, borderRadius: 3, border: '1.5px solid rgba(255,255,255,0.5)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 1.5, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
          </div>
        </div>

        {/* Chat header */}
        <div style={{ padding: '10px 16px 12px', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
              {school.emoji}
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.1 }}>
                {activeCampaign.label}
              </p>
              <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent }}>
                {school.name} · <span style={{ color: '#3CDB7A' }}>● LIVE</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveCampaign(null)}
            style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${c.accent}44`, background: 'transparent', cursor: 'pointer', fontSize: 11, color: c.accent, fontFamily: "'Inter',sans-serif" }}
          >
            ← Back
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: c.bg }}>
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
                fontSize: 13, lineHeight: 1.6,
                fontFamily: "'Inter',sans-serif",
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {school.emoji}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: 'white', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c.accent, animation: `saBounce 1.2s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px 18px', background: 'white', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={`Message ${school.mascotName}...`}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: `1px solid ${c.border}`, fontSize: 13, fontFamily: "'Inter',sans-serif", outline: 'none', background: c.bg, color: c.primary }}
            />
            <button
              onClick={sendMessage}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: c.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Send size={16} color="white" />
            </button>
          </div>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: c.accent, textAlign: 'center', marginTop: 6, opacity: 0.5 }}>
            {school.mascotName} · {school.name} · Simple Genius
          </p>
        </div>

        {/* Home bar */}
        <div style={{ background: '#000', paddingBottom: 8, paddingTop: 4, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 110, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>

      <style>{`@keyframes saBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

// ── Phone preview (selector screen only) ─────────────────────────────────────
function PhonePreview({ school }) {
  const c = school.colors
  return (
    <div style={{
      width: 250,
      background: '#000',
      borderRadius: 38,
      boxShadow: '0 20px 52px rgba(0,0,0,0.3), 0 0 0 8px #1a1a1a, 0 0 0 10px #333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 460,
      flexShrink: 0,
    }}>
      <div style={{ background: '#000', padding: '10px 20px 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 88, height: 22, background: '#000', borderRadius: 14, border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </div>
      <div style={{ padding: '8px 14px 10px', background: c.primary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: `${c.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{school.emoji}</div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: 'white' }}>Ticket Sales</p>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 8, color: c.accent }}>{school.name} · <span style={{ color: '#3CDB7A' }}>● LIVE</span></p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '12px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{school.emoji}</div>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 12px 4px', background: 'white', fontSize: 10, lineHeight: 1.5, color: c.primary, maxWidth: '82%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Hey! {school.mascotName} here — your {school.short} ticket rep. Big game coming up at {school.venue?.football?.name || 'our stadium'}. What games are you thinking about?
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 4px 12px', background: c.primary, fontSize: 10, lineHeight: 1.5, color: 'white', maxWidth: '70%' }}>
            I'm interested in the football season!
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{school.emoji}</div>
          <div style={{ padding: '8px 10px', borderRadius: '12px 12px 12px 4px', background: 'white', fontSize: 10, lineHeight: 1.5, color: c.primary, maxWidth: '82%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Perfect timing — the {school.rivals?.[0] || 'rivalry'} game is coming up. Want me to check availability?
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 12px 12px', background: 'white', borderTop: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ flex: 1, padding: '6px 10px', borderRadius: 18, background: c.bg, fontSize: 10, color: c.accent, border: `1px solid ${c.border}` }}>Message {school.mascotName}...</div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={11} color="white" />
          </div>
        </div>
      </div>
      <div style={{ background: '#000', paddingBottom: 6, paddingTop: 3, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
      </div>
    </div>
  )
}
