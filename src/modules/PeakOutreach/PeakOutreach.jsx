import { useState } from 'react'
import { useUser } from '../../context/UserContext'

const WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/peak-outreach'

const CAMPAIGN_TYPES = [
  { id: 'CLIENT_UPDATE',  label: 'Client Update',   desc: 'Progress report or platform update to a school rep' },
  { id: 'PARTNER_REACH',  label: 'Partner Reach',   desc: 'Outreach to a new or existing partner or vendor' },
  { id: 'PROSPECT_INTRO', label: 'Prospect Intro',  desc: 'First contact with a prospective school or AD' },
  { id: 'TEAM_INTERNAL',  label: 'Team / Internal', desc: 'Message to a colleague or internal stakeholder' },
]

const parseDraft = (raw) => {
  if (!raw) return { subject: '', body: '' }
  const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i)
  const bodyMatch    = raw.match(/BODY:\s*([\s\S]+)/i)
  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    body:    bodyMatch    ? bodyMatch[1].trim()    : raw.trim(),
  }
}

export default function PeakOutreach() {
  const { user } = useUser()

  const [campaign,       setCampaign]       = useState('CLIENT_UPDATE')
  const [touch,          setTouch]          = useState(1)
  const [contactName,    setContactName]    = useState('')
  const [contactTitle,   setContactTitle]   = useState('')
  const [contactCompany, setContactCompany] = useState('')
  const [context,        setContext]        = useState('')
  const [loading,        setLoading]        = useState(false)
  const [draft,          setDraft]          = useState(null)
  const [copied,         setCopied]         = useState(false)
  const [error,          setError]          = useState('')

  const generate = async () => {
    if (!contactName.trim() || !context.trim()) {
      setError('Contact name and context are required.')
      return
    }
    setError('')
    setLoading(true)
    setDraft(null)
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id:         user?.id,
          campaign_type:   campaign,
          contact_name:    contactName.trim(),
          contact_title:   contactTitle.trim(),
          contact_company: contactCompany.trim(),
          context:         context.trim(),
          touch,
        }),
      })
      const data = await res.json()
      const raw = data.draft || data.body || data.text || ''
      setDraft(parseDraft(raw))
    } catch (e) {
      setError('Something went wrong. Check the webhook connection.')
    }
    setLoading(false)
  }

  const copy = () => {
    if (!draft) return
    const full = draft.subject ? `Subject: ${draft.subject}\n\n${draft.body}` : draft.body
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setDraft(null)
    setContactName('')
    setContactTitle('')
    setContactCompany('')
    setContext('')
    setTouch(1)
    setCampaign('CLIENT_UPDATE')
  }

  const accent = '#2D6E1C'
  const lbl = { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: '#6A8864', textTransform: 'uppercase', marginBottom: 8, display: 'block' }
  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #C4D8BE', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E18', background: '#fff', boxSizing: 'border-box', outline: 'none' }

  return (
    <div style={{ padding: '32px', maxWidth: 780, margin: '0 auto' }}>

      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#1A2E18', letterSpacing: '-0.03em', marginBottom: 4 }}>My Outreach</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6A8864', marginBottom: 32 }}>Generate a draft in your voice — client updates, partner reach, prospect intros.</div>

      {/* Campaign Type */}
      <div style={{ marginBottom: 22 }}>
        <span style={lbl}>Campaign Type</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {CAMPAIGN_TYPES.map(c => (
            <button key={c.id} onClick={() => setCampaign(c.id)} style={{ padding: '12px 16px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%', border: 'none', background: campaign === c.id ? accent : '#fff', outline: `1.5px solid ${campaign === c.id ? accent : '#C4D8BE'}` }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, display: 'block', color: campaign === c.id ? '#fff' : '#1A2E18' }}>{c.label}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, display: 'block', marginTop: 2, color: campaign === c.id ? 'rgba(255,255,255,0.75)' : '#6A8864' }}>{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Touch */}
      <div style={{ marginBottom: 22 }}>
        <span style={lbl}>Touch</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map(t => (
            <button key={t} onClick={() => setTouch(t)} style={{ padding: '8px 20px', borderRadius: 6, cursor: 'pointer', border: 'none', background: touch === t ? accent : '#fff', outline: `1.5px solid ${touch === t ? accent : '#C4D8BE'}`, color: touch === t ? '#fff' : '#1A2E18', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600 }}>
              Touch {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div style={{ marginBottom: 22 }}>
        <span style={lbl}>Recipient</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
          <input style={inp} placeholder="Name *" value={contactName} onChange={e => setContactName(e.target.value)} />
          <input style={inp} placeholder="Title / Role" value={contactTitle} onChange={e => setContactTitle(e.target.value)} />
        </div>
        <input style={inp} placeholder="Company / School" value={contactCompany} onChange={e => setContactCompany(e.target.value)} />
      </div>

      {/* Context */}
      <div style={{ marginBottom: 22 }}>
        <span style={lbl}>Context & Goal *</span>
        <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} placeholder="What's the purpose of this email? What do you want them to know or do?" value={context} onChange={e => setContext(e.target.value)} />
      </div>

      {error && <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#C03020', marginBottom: 12 }}>{error}</div>}

      <button onClick={generate} disabled={loading} style={{ padding: '12px 28px', borderRadius: 8, background: accent, color: '#fff', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Generating...' : 'Generate Draft'}
      </button>

      {draft && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #C4D8BE', padding: 24, marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={lbl}>Generated Draft</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={copy} style={{ padding: '7px 18px', borderRadius: 6, background: copied ? accent : '#F0F7EE', color: copied ? '#fff' : accent, border: `1.5px solid ${accent}`, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={reset} style={{ padding: '7px 18px', borderRadius: 6, background: '#F0F7EE', color: '#6A8864', border: '1.5px solid #C4D8BE', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                New Draft
              </button>
            </div>
          </div>
          {draft.subject && (
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: accent, background: '#F0F7EE', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
              Subject: {draft.subject}
            </div>
          )}
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E18', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {draft.body}
          </div>
        </div>
      )}
    </div>
  )
}
