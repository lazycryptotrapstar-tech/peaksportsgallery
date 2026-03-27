import React, { useState, useRef, useEffect } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { MEMBERSHIP_TIERS, getBundleDeal } from '../../data/tiers'
import { ShieldCheck, CheckCircle2, QrCode, MessageCircle, X, Send } from 'lucide-react'

const N8N_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/sales-agent'

// ── Venue section data ────────────────────────────────────────────────────────
const FOOTBALL_SECTIONS = [
  { id: 'HC1', label: 'HC1', zone: 'home_chairback', name: 'Home Chairback A', price: 27, status: 'HIGH', desc: 'Home sideline · Chairback · 40-50 yd line' },
  { id: 'HC2', label: 'HC2', zone: 'home_chairback', name: 'Home Chairback B', price: 27, status: 'MED',  desc: 'Home sideline · Chairback · 50 yd center' },
  { id: 'HC3', label: 'HC3', zone: 'home_chairback', name: 'Home Chairback C', price: 27, status: 'HIGH', desc: 'Home sideline · Chairback · 30-40 yd' },
  { id: 'HB1', label: 'HB1', zone: 'home_bleacher',  name: 'Home Bleacher A',  price: 15, status: 'HIGH', desc: 'Home sideline · Bleacher · 20-40 yd' },
  { id: 'HB2', label: 'HB2', zone: 'home_bleacher',  name: 'Home Bleacher B',  price: 15, status: 'MED',  desc: 'Home sideline · Bleacher · 5-20 yd' },
  { id: 'VIP', label: 'VIP', zone: 'vip',            name: 'VIP / Hospitality', price: 85, status: 'LOW', desc: 'Premium hospitality suite · 50 yd line view' },
  { id: 'EZ1', label: 'EZ1', zone: 'end_zone',       name: 'End Zone A',       price: 10, status: 'HIGH', desc: 'North end zone · Video board end' },
  { id: 'EZ2', label: 'EZ2', zone: 'end_zone',       name: 'End Zone B',       price: 10, status: 'MED',  desc: 'South end zone · Donor tailgate area' },
  { id: 'VIS', label: 'VIS', zone: 'visitor',        name: 'Visitor Side',     price: 12, status: 'HIGH', desc: 'Visitor sideline bleacher' },
]

const BASKETBALL_SECTIONS = [
  { id: 'CS',  label: 'CS',   zone: 'courtside',  name: 'Courtside',       price: 65,  status: 'LOW',  desc: 'Courtside chairback · Best seats in the house' },
  { id: 'CL1', label: 'CL-A', zone: 'club',       name: 'Club Level A',    price: 45,  status: 'MED',  desc: 'Premium lower bowl · Full kitchen access' },
  { id: 'CL2', label: 'CL-B', zone: 'club',       name: 'Club Level B',    price: 45,  status: 'HIGH', desc: 'Premium lower bowl · Center court' },
  { id: 'SUI', label: 'SUITE',zone: 'suite',       name: 'Corner Suite',    price: 120, status: 'LOW',  desc: 'Open-air corner suite · Theater box seating' },
  { id: 'LB1', label: 'LB1',  zone: 'lower_bowl', name: 'Lower Bowl A',    price: 25,  status: 'HIGH', desc: 'Lower bowl general · Home sideline' },
  { id: 'LB2', label: 'LB2',  zone: 'lower_bowl', name: 'Lower Bowl B',    price: 25,  status: 'MED',  desc: 'Lower bowl general · Behind basket' },
  { id: 'UL',  label: 'UL',   zone: 'upper',      name: 'Upper Level',     price: 18,  status: 'HIGH', desc: 'Upper level sideline · Wide angle view' },
  { id: 'STU', label: 'STU',  zone: 'student',    name: 'Student Section', price: 0,   status: 'MED',  desc: 'Student section · Free with ID' },
]

const ZONE_LABELS = {
  home_chairback: 'Home Chairback', home_bleacher: 'Home Bleacher',
  vip: 'VIP / Hospitality', end_zone: 'End Zone', visitor: 'Visitor Side',
  courtside: 'Courtside', club: 'Club Level', suite: 'Corner Suites',
  lower_bowl: 'Lower Bowl', upper: 'Upper Level', student: 'Student Section',
}

const STATUS_COLOR = { HIGH: '#ef4444', MED: '#f59e0b', LOW: '#22c55e' }
const STATUS_LABEL = { HIGH: 'Selling Fast', MED: 'Limited', LOW: 'Available' }

// ── AI Chat Bubble ────────────────────────────────────────────────────────────
function ChatBubble({ school, sport, selectedSection, qty }) {
  const c = school.colors
  const [open, setOpen]         = useState(false)
  const [visible, setVisible]   = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [pulsing, setPulsing]   = useState(false)
  const sessionRef  = useRef(`th-${school.id}-${Date.now()}`)
  const messagesEnd = useRef(null)
  const initialized = useRef(false)

  // Show bubble after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setPulsing(true), 800)
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  // Scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Send opener when first opened
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true
      const opener = selectedSection
        ? `Hey! I'm ${school.mascotName}, your ${school.name} ticket assistant. I see you're looking at ${selectedSection.name} — great choice! Want help finding the best deal for ${qty} ticket${qty > 1 ? 's' : ''}?`
        : `Hey! I'm ${school.mascotName}, your ${school.name} ticket assistant. Looking for ${sport} tickets? I can help you find the best seats for your budget!`
      setMessages([{ role: 'assistant', content: opener, ts: Date.now() }])
    }
  }, [open])

  // Update opener context when section changes and chat is closed
  useEffect(() => {
    if (!open) initialized.current = false
  }, [selectedSection?.id])

  const buildContext = () => {
    const sectionCtx = selectedSection
      ? `VIEWING: ${selectedSection.name} · $${selectedSection.price}/ticket · ${selectedSection.desc}`
      : 'VIEWING: Browsing sections (none selected yet)'
    return `[SCHOOL_CONTEXT]
SCHOOL: ${school.name}
AGENT_NAME: ${school.mascotName}
CONFERENCE: ${school.conference}
LOCATION: ${school.location}
FOOTBALL_VENUE: ${school.venue?.football?.name || 'home stadium'}
BASKETBALL_VENUE: ${school.venue?.basketball?.name || 'home arena'}
RIVALS: ${(school.rivals || []).join(', ')}
VIP_ASSETS: ${(school.vip || []).join(', ')}
CAMPAIGN: TICKETS
CONTEXT: Fan is on the Ticket Hub browsing ${sport} tickets
${sectionCtx}
QUANTITY_SELECTED: ${qty}
PRICING (use exact numbers):
Football Season: $211 Bench Back / $135 Bench
Football Single Game: $40 Bench Back / $30 Bench
Football Groups: $15/ticket (min 10)
MBB Season: $340 Premium / $240 Scholarship / $190 Reserved
MBB Single Game: $22 Premium / $18 Reserved
[/SCHOOL_CONTEXT]`
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: text, ts: Date.now() }])
    setInput('')
    setIsTyping(true)

    const attemptFetch = async (attempt = 1) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)
      try {
        const res = await fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatInput: `${buildContext()}\n\nUSER MESSAGE: ${text}`,
            sessionId: sessionRef.current,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const reply = data?.output || data?.text || data?.message || data?.response || null
        if (!reply && attempt < 2) return attemptFetch(2)
        setMessages(prev => [...prev, { role: 'assistant', content: reply || "Try again in a moment.", ts: Date.now() }])
      } catch {
        clearTimeout(timeout)
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500))
          return attemptFetch(2)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue — try again in a moment.", ts: Date.now() }])
      } finally {
        setIsTyping(false)
      }
    }
    await attemptFetch()
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes thBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes thPulse { 0%,100%{box-shadow:0 0 0 0 ${c.accent}66} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes thSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1000,
          width: 320, height: 460,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'thSlideUp 0.25s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {school.emoji}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.1 }}>{school.mascotName}</p>
                <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent }}>Ticket Assistant · <span style={{ color: '#3CDB7A' }}>● LIVE</span></p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, background: c.bg }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 2 }}>
                    {school.emoji}
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  background: msg.role === 'user' ? c.primary : 'white',
                  color: msg.role === 'user' ? 'white' : c.primary,
                  fontSize: 13, lineHeight: 1.55,
                  fontFamily: "'Inter',sans-serif",
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{school.emoji}</div>
                <div style={{ padding: '8px 12px', borderRadius: '14px 14px 14px 3px', background: 'white', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c.accent, animation: `thBounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', background: 'white', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about tickets..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: `1px solid ${c.border}`, fontSize: 13, fontFamily: "'Inter',sans-serif", outline: 'none', background: c.bg, color: c.primary }}
              />
              <button onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: c.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: c.primary, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: pulsing && !open ? 'thPulse 2s 3' : 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        {!open && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#3CDB7A', border: '2px solid white',
          }} />
        )}
      </button>
    </>
  )
}

// ── Main Ticketing component ──────────────────────────────────────────────────
export default function Ticketing() {
  const { school, memberTier } = useSchool()
  const [sport, setSport] = useState('football')
  const [filterZone, setFilterZone] = useState('all')
  const [selectedSection, setSelectedSection] = useState(null)
  const [qty, setQty] = useState(2)
  const [stage, setStage] = useState('browse')

  const sections = sport === 'football' ? FOOTBALL_SECTIONS : BASKETBALL_SECTIONS
  const venueInfo = school.venue?.[sport]
  const tier = MEMBERSHIP_TIERS[memberTier]
  const bundle = getBundleDeal(qty)
  const totalDiscount = Math.max(tier.discount, bundle.discount || 0)

  const zones = [...new Set(sections.filter(s => s.price > 0).map(s => s.zone))]
  const filtered = filterZone === 'all'
    ? sections.filter(s => s.price > 0)
    : sections.filter(s => s.zone === filterZone && s.price > 0)

  const subtotal = selectedSection ? selectedSection.price * qty : 0
  const discountAmt = Math.round(subtotal * totalDiscount * 100) / 100
  const fees = (2.50 + 1.50) * (selectedSection ? qty : 0)
  const total = subtotal - discountAmt + fees

  if (stage === 'success') return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '40px 32px', textAlign: 'center', background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent})` }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={30} color="white" />
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 32, color: 'white' }}>Purchase Complete!</h2>
          <p style={{ margin: '6px 0 0', fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>GO {school.mascot.toUpperCase()}! {school.emoji}</p>
        </div>
        <div style={{ padding: '32px', background: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Venue', value: venueInfo?.name },
              { label: 'Section', value: selectedSection?.label },
              { label: 'Tickets', value: `${qty} tickets` },
              { label: 'Total Paid', value: `$${total.toFixed(2)}`, accent: true },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: 12, background: school.colors.bg }}>
                <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: school.colors.accent }}>{item.label}</p>
                <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: item.accent ? school.colors.accent : '#111' }}>{item.value}</p>
              </div>
            ))}
          </div>
          <QrCode size={72} style={{ display: 'block', margin: '0 auto 16px', color: '#e0e0e0' }} />
          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Confirmation sent · Tickets delivered to your email</p>
          <button onClick={() => { setStage('browse'); setSelectedSection(null); setQty(2) }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: school.colors.primary, color: 'white', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            ← Back to Tickets
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: school.colors.accent, marginBottom: 6 }}>{school.name} · Ticket Marketplace</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: '#111', margin: 0 }}>Ticket Hub</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{venueInfo?.name} · {venueInfo?.capacity?.toLocaleString()} capacity</p>
      </div>

      {/* Sport selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['football', 'basketball'].map(s => (
          <button key={s} onClick={() => { setSport(s); setSelectedSection(null); setFilterZone('all') }}
            style={{
              padding: '10px 20px', borderRadius: 12, border: `2px solid ${sport === s ? school.colors.accent : '#e0e0e0'}`,
              background: sport === s ? school.colors.primary : 'white', color: sport === s ? 'white' : '#111',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
            {s === 'football' ? '🏈' : '🏀'} {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bundle banner */}
      {qty >= 4 && (
        <div style={{
          background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent}cc)`,
          borderRadius: 16, padding: '12px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: 'white' }}>{bundle.label}{bundle.badge ? ` — ${bundle.badge}` : ''}</p>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{bundle.msg}</p>
            </div>
          </div>
          {selectedSection && discountAmt > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 14px' }}>
              <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 900, fontSize: 18, color: 'white' }}>Saving ${discountAmt.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* Zone filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterZone('all')}
          style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterZone === 'all' ? school.colors.accent : '#f1f5f9', color: filterZone === 'all' ? 'white' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          All Sections
        </button>
        {zones.map(z => (
          <button key={z} onClick={() => setFilterZone(z)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterZone === z ? school.colors.accent : '#f1f5f9', color: filterZone === z ? 'white' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {ZONE_LABELS[z] || z}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
        {/* Section cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(sec => {
            const active = selectedSection?.id === sec.id
            return (
              <button key={sec.id} onClick={() => setSelectedSection(active ? null : sec)}
                style={{
                  textAlign: 'left', borderRadius: 16, border: `2px solid ${active ? school.colors.accent : '#e8eaed'}`,
                  background: active ? school.colors.primary : 'white', cursor: 'pointer',
                  overflow: 'hidden', transition: 'all 0.2s ease',
                  boxShadow: active ? `0 8px 32px ${school.colors.accent}40` : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}>
                <div style={{ height: 4, background: active ? school.colors.accent : '#e8eaed' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: active ? 'white' : '#111' }}>{sec.name}</p>
                      <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: active ? school.colors.accent2 : school.colors.accent }}>{ZONE_LABELS[sec.zone]}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: active ? school.colors.accent2 : school.colors.accent }}>${sec.price}</p>
                      <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: active ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>per ticket</p>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: active ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: 1.5 }}>{sec.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLOR[sec.status]}15`, color: STATUS_COLOR[sec.status] }}>
                      {STATUS_LABEL[sec.status]}
                    </span>
                    {active && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>✓ SELECTED</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Order panel */}
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #e8eaed', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}>
          <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent}bb)` }}>
            <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: 'white' }}>Order Summary</p>
            <p style={{ margin: '2px 0 0', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{school.name.toUpperCase()} · {sport.toUpperCase()}</p>
          </div>
          <div style={{ padding: '20px 24px', background: 'white' }}>
            {!selectedSection ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: school.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>{school.emoji}</div>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: '#111', margin: '0 0 4px' }}>Select a Section</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Choose from the sections on the left</p>
              </div>
            ) : (
              <div>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: school.colors.bg, border: `1px solid ${school.colors.border}`, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: school.colors.accent }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111' }}>{selectedSection.name}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', paddingLeft: 14 }}>{selectedSection.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: tier.bg, border: `1px solid ${tier.color}40`, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.label.toUpperCase()}</span>
                  </div>
                  {tier.discount > 0 && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: tier.color }}>-{(tier.discount * 100).toFixed(0)}% off</span>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: school.colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Quantity</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => setQty(n)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, background: qty === n ? school.colors.primary : '#f1f5f9', color: qty === n ? 'white' : '#64748b', transition: 'all 0.15s ease' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: '#64748b' }}>{qty}x {selectedSection.label}</span>
                    <span style={{ fontWeight: 700, color: '#111' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#16a34a', fontWeight: 700 }}>
                      <span>{totalDiscount === tier.discount ? tier.label : bundle.label} discount</span>
                      <span>-${discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#94a3b8' }}>
                    <span>Facility fee ({qty}x)</span><span>${(2.50 * qty).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                    <span>Processing ({qty}x)</span><span>${(1.50 * qty).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `3px solid ${school.colors.primary}`, paddingTop: 12, marginTop: 12 }}>
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: '#111' }}>Total</span>
                    <div style={{ textAlign: 'right' }}>
                      {discountAmt > 0 && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>${(subtotal + fees).toFixed(2)}</p>}
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 32, color: school.colors.accent }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStage('success')}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: school.colors.primary, color: 'white', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 10, transition: 'opacity 0.2s ease' }}>
                  Purchase Tickets →
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#f8fafc' }}>
                  <ShieldCheck size={16} color={school.colors.accent} />
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>Secure checkout · Official {school.short} tickets</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat Bubble — appears after 4 seconds, context-aware */}
      <ChatBubble
        school={school}
        sport={sport}
        selectedSection={selectedSection}
        qty={qty}
      />
    </div>
  )
}
