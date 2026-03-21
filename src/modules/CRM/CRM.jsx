import React, { useState } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { Mail, RefreshCw, Check, Edit2 } from 'lucide-react'

const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL

const CAMPAIGNS = [
  { id: 'ticket',      label: 'Ticket Sales',    color: '#886E4C' },
  { id: 'sponsorship', label: 'Sponsorship',      color: '#7c3aed' },
  { id: 'hospitality', label: 'Hospitality',      color: '#d97706' },
  { id: 'alumni',      label: 'Alumni Outreach',  color: '#0891b2' },
  { id: 'renewal',     label: 'Renewal',          color: '#16a34a' },
]

const CONTACTS = [
  { id: 1,  name: 'Nayef Samhat',           title: 'President',                          tier: 'Platinum', status: 'hot',  tags: ['Administration', 'Decision Maker'] },
  { id: 2,  name: 'Christopher Carpenter',  title: 'Board of Trustees Chairman',         tier: 'Platinum', status: 'warm', tags: ['Administration', 'Alumni'] },
  { id: 3,  name: 'Timothy Schmitz',        title: 'Willimon Family Provost',            tier: 'Gold',     status: 'warm', tags: ['Administration'] },
  { id: 4,  name: 'Calhoun L. Kennedy Jr.', title: 'VP Philanthropy & Engagement',       tier: 'Gold',     status: 'hot',  tags: ['Sponsorship', 'Philanthropy'] },
  { id: 5,  name: 'Shawn Watson',           title: 'Head Football Coach',                tier: 'Gold',     status: 'hot',  tags: ['Athletics', 'Football'] },
  { id: 6,  name: 'Kevin Giltner',          title: 'Head Basketball Coach',             tier: 'Gold',     status: 'hot',  tags: ['Athletics', 'Basketball'] },
  { id: 7,  name: 'Shawn Tyler',            title: 'Director of Sales — TSP',           tier: 'Gold',     status: 'hot',  tags: ['Key Contact', 'Sponsor'] },
  { id: 8,  name: 'Devin Foster',           title: 'Ticketing — TSP',                   tier: 'Gold',     status: 'hot',  tags: ['Key Contact', 'Ticketing'] },
  { id: 9,  name: 'Scott Kull',             title: 'Director of Athletics',             tier: 'Platinum', status: 'warm', tags: ['Admin', 'Decision Maker', 'VIP'] },
]

const STATUS_COLOR = { hot: '#ef4444', warm: '#f59e0b', cold: '#94a3b8' }
const TIER_COLOR = { Platinum: '#7c3aed', Gold: '#d97706', Standard: '#94a3b8' }

const buildEmailPrompt = (school, contact, campaign) => `
You are an expert sales copywriter for ${school.name} ${school.mascot} athletics, powered by Peak Sports MGMT.

Write a personalized sales email to ${contact.name}, ${contact.title}.

CAMPAIGN: ${campaign.label}
SCHOOL: ${school.name} | ${school.conference}
FROM: ${school.agent.name} | ${school.agent.email}

EMAIL REQUIREMENTS:
- Subject line first (format: Subject: ...)
- 3-4 short paragraphs max
- Lead with value, not a pitch
- Reference their role specifically
- One clear call to action at the end
- Warm but professional tone
- No fluff, no generic phrases

Use Challenger Sale methodology: teach something, tailor to their situation, take control with a clear next step.
`

export default function CRM() {
  const { school } = useSchool()
  const [activeCampaign, setActiveCampaign] = useState('ticket')
  const [selectedContact, setSelectedContact] = useState(null)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedEmail, setEditedEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const campaign = CAMPAIGNS.find(c => c.id === activeCampaign)
  const filtered = filterStatus === 'all' ? CONTACTS : CONTACTS.filter(c => c.status === filterStatus)

  const draftEmail = async (contact) => {
    setSelectedContact(contact)
    setGeneratedEmail('')
    setApproved(false)
    setEditMode(false)
    setLoading(true)
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a ${campaign.label} sales email to ${contact.name}, ${contact.title} at ${school.name}`,
          systemPrompt: buildEmailPrompt(school, contact, campaign),
        }),
      })
      const data = await res.json()
      const email = data.output || data.message || data.text || '[Could not generate email — check n8n connection]'
      setGeneratedEmail(email)
      setEditedEmail(email)
    } catch {
      setGeneratedEmail('[Connection error — check n8n webhook]')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: school.colors.accent, marginBottom: 6 }}>CRM Outreach</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: '#111', margin: 0 }}>AI-Powered Outreach</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Select a contact and let {school.mascotName} draft a personalized email</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Contacts', value: '9', sub: `${school.short} roster` },
          { label: 'Hot Leads', value: '5', sub: 'Ready to close', accent: true },
          { label: 'AI Drafted', value: '47', sub: 'This season' },
          { label: 'Response Rate', value: '19%', sub: '+138% vs manual', accent: true },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: 16, background: s.accent ? school.colors.primary : 'white', border: `1px solid ${s.accent ? 'transparent' : school.colors.border}` }}>
            <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', color: s.accent ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{s.label}</p>
            <p style={{ margin: '0 0 2px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: s.accent ? school.colors.accent2 : school.colors.accent }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: s.accent ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: campaign + contacts */}
        <div>
          {/* Campaign pills */}
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Campaign</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CAMPAIGNS.map(c => (
              <button key={c.id} onClick={() => setActiveCampaign(c.id)}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, transition: 'all 0.15s ease', background: activeCampaign === c.id ? c.color : '#f1f5f9', color: activeCampaign === c.id ? 'white' : '#64748b' }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['all', 'hot', 'warm', 'cold'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: filterStatus === s ? school.colors.accent : '#f1f5f9', color: filterStatus === s ? 'white' : '#64748b' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Contact list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(contact => {
              const selected = selectedContact?.id === contact.id
              return (
                <div key={contact.id} onClick={() => draftEmail(contact)}
                  style={{
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${selected ? school.colors.accent : school.colors.border}`,
                    background: selected ? school.colors.primary : 'white',
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: selected ? school.colors.accent : school.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, color: selected ? 'white' : school.colors.accent, flexShrink: 0 }}>
                      {contact.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: selected ? 'white' : '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: selected ? 'rgba(255,255,255,0.6)' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.title}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[contact.status], display: 'block' }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: selected ? school.colors.accent2 : TIER_COLOR[contact.tier] }}>{contact.tier}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: email panel */}
        <div style={{ borderRadius: 20, border: `1px solid ${school.colors.border}`, overflow: 'hidden', background: 'white' }}>
          {!selectedContact ? (
            <div style={{ padding: '60px 32px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: school.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                <Mail size={28} color={school.colors.accent} />
              </div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#111', margin: '0 0 6px' }}>Select a Contact</p>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>{school.mascotName} will draft a personalized email based on their role and your selected campaign</p>
            </div>
          ) : (
            <div>
              {/* Email header */}
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${school.colors.border}`, background: school.colors.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#111' }}>To: {selectedContact.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>From: {school.agent.name} · {school.agent.email}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Campaign: {campaign.label}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {generatedEmail && !loading && (
                      <>
                        <button onClick={() => { setEditMode(!editMode) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${school.colors.border}`, background: 'white', cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
                          <Edit2 size={14} /> {editMode ? 'Preview' : 'Edit'}
                        </button>
                        <button onClick={() => draftEmail(selectedContact)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${school.colors.border}`, background: 'white', cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
                          <RefreshCw size={14} /> Regenerate
                        </button>
                        <button onClick={() => setApproved(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: approved ? '#16a34a' : school.colors.primary, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                          <Check size={14} /> {approved ? 'Approved!' : 'Approve & Send'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Email body */}
              <div style={{ padding: '24px', minHeight: 300 }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 40, height: 40, border: `3px solid ${school.colors.bg}`, borderTop: `3px solid ${school.colors.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748b', fontSize: 14 }}>{school.mascotName} is personalizing your email...</p>
                  </div>
                ) : editMode ? (
                  <textarea
                    value={editedEmail}
                    onChange={e => setEditedEmail(e.target.value)}
                    style={{ width: '100%', minHeight: 300, padding: '12px', border: `1px solid ${school.colors.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', fontFamily: "'Inter', sans-serif", whiteSpace: 'pre-wrap' }}>
                    {generatedEmail}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
