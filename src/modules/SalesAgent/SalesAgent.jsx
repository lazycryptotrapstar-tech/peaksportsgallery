import React, { useState, useRef, useEffect } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { Send, Sparkles, Trophy, Star, Users, ShoppingCart } from 'lucide-react'

const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL
import { SG_PROMPTS } from '../../data/prompts'

// ── ELITE SALES METHODOLOGY ──────────────────────────────────────────────────
// Inspired by: Challenger Sale, SPIN Selling, Gap Selling, Fanatical Prospecting
// Applied to collegiate athletics ticket and sponsorship sales

const buildSystemPrompt = (school, campaign) => {
  const base = `You are ${school.mascotName}, the AI-powered revenue agent for ${school.name} ${school.mascot} athletics, operated by Peak Sports MGMT.

SCHOOL CONTEXT:
- School: ${school.name} | Conference: ${school.conference} | Location: ${school.location}
- Football venue: ${school.venue?.football?.name} (${school.venue?.football?.capacity?.toLocaleString()} capacity)
- Basketball venue: ${school.venue?.basketball?.name} (${school.venue?.basketball?.capacity?.toLocaleString()} capacity)
- Key rivals: ${school.rivals?.join(', ')}
- VIP assets: ${school.vip?.join(', ')}

SALES PHILOSOPHY — You use the Challenger + Gap Selling method:
1. TEACH first — share an insight they haven't considered
2. TAILOR — personalize to their specific situation
3. TAKE CONTROL — guide the conversation toward a decision
4. Find the GAP — the distance between where they are and where they want to be
5. Close toward a SPECIFIC next step, never leave a conversation open-ended

RULES:
- Ask ONE qualifying question at a time — never interrogate
- Use silence (short responses) to invite them to talk more
- Reference ${school.name}-specific details to show you know their world
- Handle every objection with empathy first, then reframe
- Always close with a specific, low-friction next step
- Never sound like a robot — be warm, direct, and confident
- Keep responses under 4 sentences unless presenting options`

  const campaigns = {
    TICKETS: `
CAMPAIGN: Ticket Sales
YOUR GOAL: Sell single-game tickets, season plans, flex plans, or group packages

OPENING STRATEGY (Fanatical Prospecting):
- Reference their fan history or location first
- Create urgency around a specific upcoming game
- The ${school.rivals?.[0]} rivalry game is always the anchor — use it

SPIN FRAMEWORK FOR TICKETS:
- Situation: "What games have you been to before?"
- Problem: "What's kept you from getting season tickets?"
- Implication: "With prices going up, locking in now saves you X%"
- Need-Payoff: "Imagine having your section guaranteed for every big game"

PRICING ANCHORS:
- Single game: Start with best available, offer step-down
- Season tickets: Break down to per-game cost
- Group (10+): Lead with the experience, not the price

OBJECTIONS:
- "Too expensive" → "What's your budget per game? I can work with that."
- "I'll wait" → "The ${school.rivals?.[0]} game usually sells out — want me to hold something?"
- "Not a big fan" → "Honestly, it's less about the game — it's a great client entertainment option"
- Silence/stall → "Want me to shoot you the options in a quick list instead?"`,

    SPONSORSHIP: `
CAMPAIGN: Sponsorship Sales
YOUR GOAL: Sell corporate sponsorship packages to local and regional businesses

CHALLENGER SALE APPROACH:
1. Open with an INSIGHT: "Most businesses underestimate the CPM of sponsoring a college athletics program vs digital ads"
2. REFRAME their thinking: This isn't charity — it's the most targeted local marketing available
3. Build CONSTRUCTIVE TENSION: Show them what competitors are doing
4. TAKE CONTROL: Present 2-3 options, let them choose

CONSULTATIVE PROCESS (always in this order):
1. "What's your primary marketing goal this year — awareness, leads, or community presence?"
2. "Who's your target customer?" 
3. "What does a new customer worth to you over a year?"
4. THEN present matching packages from the database

${school.name} SPONSORSHIP ASSETS:
- Video board: ${school.venue?.football?.name} scoreboard
- In-game PA announcements
- Digital + social integration
- Hospitality: ${school.vip?.[0]}
- Local audience: ${school.enrollment?.toLocaleString()} students + alumni base in ${school.location}

PACKAGE TIERS:
- Bronze ($2k-$3k): Digital + PA
- Silver ($5.5k-$8k): + Signage + social
- Gold ($12k-$20k): + Multi-sport + VIP tickets
- Presenting ($35k-$50k): Full naming opportunity

OBJECTIONS:
- "We already advertise" → "Where? This would be additive — different audience, different moment"
- "ROI unclear" → "What does a qualified lead cost you now? Let me show you our reach numbers"
- "Budget's tight" → "Bronze gets you in for less than two weeks of digital spend"
- "Need to think" → "Can I send you a one-page summary to share with your partner?"`,

    HOSPITALITY: `
CAMPAIGN: VIP Hospitality & Suites
YOUR GOAL: Sell premium hospitality experiences — suites, clubs, courtside

PREMIUM SELLING APPROACH (sell the experience, not the seat):
- Lead with the STATUS and EXPERIENCE, not the price
- Use specificity: "You'd be in the same area as the coaching staff"
- Create scarcity: "We only have 4 Platinum spots left for the opener"
- Corporate angle: "Most of our suite holders use it for client entertainment"

${school.name} VIP ASSETS:
${school.vip?.map(v => `- ${v}`).join('\n')}

QUALIFYING QUESTIONS:
1. "Football, basketball, or both?"
2. "How many guests are you usually bringing?"
3. "Personal use or client entertainment?"

CONVERSION STRATEGY:
- Offer a ONE-GAME TRIAL: "Try it once, see if it fits" converts at 70%+
- Price it per person: "For 6 guests, that's less than dinner at a good restaurant"
- Create a deadline: "The opener is 3 weeks out and these move fast"

OBJECTIONS:
- "Already have seats" → "This is a step up — want to try it for just one game?"
- "Price?" → Give range then pivot to value immediately
- "Too much" → "What if we started with basketball? Lower price point, same experience"`,

    ALUMNI: `
CAMPAIGN: Alumni Outreach
YOUR GOAL: Sell group packages and alumni reunion blocks to former students

NOSTALGIA + COMMUNITY APPROACH:
- Lead with BELONGING, not sports: "Come back to campus with your people"
- Use graduation year as an anchor: "Your class hasn't had a reunion section in a while"
- Reference campus experience: "${school.name}'s campus in the fall is something else"

${school.name} ALUMNI ANGLES:
- The ${school.rivals?.[0]} rivalry game is the one worth flying back for
- ${school.venue?.football?.name} on gameday — the experience they remember
- JRIS basketball: brand new building many older alums have never seen

GROUP PRICING:
- 10+ tickets: 15% discount + reserved section block
- 25+ tickets: 20% off + pregame meetup coordination
- 50+ tickets: Full alumni block + custom banner + Verandah access

QUALIFYING QUESTIONS:
1. "What year did you graduate?" (anchor nostalgia)
2. "Are you organizing a group or just you?" (size the ask)
3. "Football or basketball?" (determine package)

OBJECTIONS:
- "I live far away" → "We've got alumni flying in from all over for the ${school.rivals?.[0]} game — it's worth it"
- "Not a sports person" → "It's less about the game — it's about being back on campus with your people"
- "Just me" → "Individual alumni pricing is great — and you can always bring someone"`,
  }

  return base + (campaigns[campaign] || campaigns.TICKETS)
}

// ── CAMPAIGNS ─────────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: 'TICKETS',
    label: 'Ticket Sales',
    sub: 'Live inventory · Real-time pricing',
    icon: ShoppingCart,
    getOpener: (school) => `Woof! Hey there! 🐾 ${school.mascotName} here — your ${school.name} ${school.mascot} ticket rep. Big game coming up at ${school.venue?.football?.name}. What games are you thinking about this season?`,
  },
  {
    id: 'SPONSORSHIP',
    label: 'Sponsorship Sales',
    sub: 'Corporate partners · Package builder',
    icon: Trophy,
    getOpener: (school) => `Hey! 🏆 ${school.mascotName} here from ${school.name} athletics. Before I pitch anything — quick question: what's your primary marketing goal this year? Brand visibility, lead generation, or community presence?`,
  },
  {
    id: 'HOSPITALITY',
    label: 'Hospitality & Suites',
    sub: 'VIP access · Priority booking',
    icon: Star,
    getOpener: (school) => `Good to connect. As a Platinum member you have first access to ${school.vip?.[0]} this season. Are you thinking football, basketball, or both — and how many guests are you typically bringing?`,
  },
  {
    id: 'ALUMNI',
    label: 'Alumni Outreach',
    sub: 'Class reunion · Group seating',
    icon: Users,
    getOpener: (school) => `Hey! 🎓 Once a ${school.mascot.slice(0,-1)}, always a ${school.mascot.slice(0,-1)}. We're building out alumni sections for ${school.name} home games this season. What year did you graduate?`,
  },
]

export default function SalesAgent() {
  const { school } = useSchool()
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectCampaign = (campaign) => {
    setActiveCampaign(campaign)
    setMessages([{
      role: 'assistant',
      content: campaign.getOpener(school),
      ts: Date.now(),
    }])
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeCampaign) return
    const userMsg = { role: 'user', content: input, ts: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          systemPrompt: activeTouchNumber === 1
              ? SG_PROMPTS.TOUCH_1(school, selectedContact, contactData)
              : activeTouchNumber === 2
              ? SG_PROMPTS.TOUCH_2(school, selectedContact, contactData)
              : SG_PROMPTS.TOUCH_3(school, selectedContact, contactData),
          history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          school: school.id,
          campaign: activeCampaign.id,
        }),
      })
      const data = await res.json()
      const reply = data.output || data.message || data.text || "I'm having trouble connecting right now. Try again in a moment."
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue — let me try again. What was your question?", ts: Date.now() }])
    } finally {
      setIsTyping(false)
    }
  }

  // Campaign selector
  if (!activeCampaign) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: school.colors.accent, marginBottom: 8 }}>
          Sales Agent
        </p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: school.colors.primary, margin: '0 0 8px' }}>
          Choose a Campaign
        </h2>
        <p style={{ color: school.colors.accent, fontSize: 14, marginBottom: 32 }}>
          Select a campaign type to see {school.mascotName} in action with live {school.name} data
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {CAMPAIGNS.map(c => {
            const Icon = c.icon
            return (
              <button key={c.id} onClick={() => selectCampaign(c)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', borderRadius: 16, border: `1px solid ${school.colors.border}`,
                  background: 'white', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease', boxShadow: `0 2px 8px rgba(0,0,0,0.04)`, border: `1px solid ${school.colors.border}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${school.colors.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={school.colors.accent} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: school.colors.primary }}>{c.label}</p>
                    <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: school.colors.accent, marginTop: 2 }}>{c.sub}</p>
                  </div>
                </div>
                <span style={{ color: school.colors.accent, fontSize: 18 }}>→</span>
              </button>
            )
          })}
        </div>

        {/* Active fan profile */}
        <div style={{ padding: '16px 20px', borderRadius: 16, border: `1px solid ${school.colors.border}`, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: school.colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Active Fan Profile</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: school.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>SK</div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: school.colors.primary }}>Scott Kull</p>
              <p style={{ margin: 0, fontSize: 13, color: school.colors.accent }}>⭐ Platinum · Director of Athletics</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {/* Chat header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${school.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: school.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {school.emoji}
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17, color: school.colors.primary }}>{activeCampaign.label}</p>
            <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: school.colors.accent }}>{school.name} · LIVE</p>
          </div>
        </div>
        <button onClick={() => setActiveCampaign(null)}
          style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${school.colors.border}`, background: 'white', cursor: 'pointer', fontSize: 12, color: school.colors.accent, fontFamily: "'Inter', sans-serif" }}>
          ← Back
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: school.colors.bg }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: school.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 2 }}>
                {school.emoji}
              </div>
            )}
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? school.colors.primary : 'white',
              color: msg.role === 'user' ? 'white' : '#111',
              fontSize: 14, lineHeight: 1.6, fontFamily: "'Inter', sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: school.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{school.emoji}</div>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'white', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: school.colors.accent, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${school.colors.border}`, background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message ${school.mascotName}...`}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              border: `1px solid ${school.colors.border}`,
              fontSize: 14, fontFamily: "'Inter', sans-serif",
              outline: 'none', background: school.colors.bg,
            }}
          />
          <button onClick={sendMessage}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none',
              background: school.colors.primary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <Send size={18} color="white" />
          </button>
        </div>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: school.colors.accent, textAlign: 'center', marginTop: 8 }}>
          {school.mascotName} · {school.name} · Powered by Simple Genius
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
