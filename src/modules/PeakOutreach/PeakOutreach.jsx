import { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';

const WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/peak-outreach';

const CAMPAIGN_TYPES = [
  { id: 'CLIENT_UPDATE',  label: 'Client Update',   desc: 'Progress report or platform update to a school rep' },
  { id: 'PARTNER_REACH',  label: 'Partner Reach',   desc: 'Outreach to a new or existing partner or vendor' },
  { id: 'PROSPECT_INTRO', label: 'Prospect Intro',  desc: 'First contact with a prospective school or AD' },
  { id: 'TEAM_INTERNAL',  label: 'Team / Internal', desc: 'Message to a colleague or internal stakeholder' },
];

const s = {
  page:         { padding: '32px', maxWidth: 780, margin: '0 auto' },
  headline:     { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#1A2E18', letterSpacing: '-0.03em', marginBottom: 4 },
  sub:          { fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6A8864', marginBottom: 32 },
  section:      { marginBottom: 22 },
  label:        { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: '#6A8864', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  campaignGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  touchRow:     { display: 'flex', gap: 8 },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input:        { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #C4D8BE', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E18', background: '#fff', boxSizing: 'border-box', outline: 'none' },
  textarea:     { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #C4D8BE', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E18', background: '#fff', boxSizing: 'border-box', minHeight: 100, resize: 'vertical', outline: 'none' },
  generateBtn:  { padding: '12px 28px', borderRadius: 8, background: '#2D6E1C', color: '#fff', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  draftCard:    { background: '#fff', borderRadius: 12, border: '1.5px solid #C4D8BE', padding: 24, marginTop: 32 },
  draftHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  draftLabel:   { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: '#6A8864', textTransform: 'uppercase' },
  draftText:    { fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E18', lineHeight: 1.75, whiteSpace: 'pre-wrap' },
  subjectLine:  { fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2D6E1C', background: '#F0F7EE', padding: '8px 12px', borderRadius: 6, marginBottom: 16 },
};

const campaignBtn = (active) => ({
  padding: '12px 16px', borderRadius: 8,
  border: `1.5px solid ${active ? '#2D6E1C' : '#C4D8BE'}`,
  background: active ? '#2D6E1C' : '#fff',
  color: active ? '#fff' : '#1A2E18',
  cursor: 'pointer', textAlign: 'left', width: '100%',
});

const touchBtn = (active) => ({
  padding: '8px 20px', borderRadius: 6,
  border: `1.5px solid ${active ? '#2D6E1C' : '#C4D8BE'}`,
  background: active ? '#2D6E1C' : '#fff',
  color: active ? '#fff' : '#1A2E18',
  cursor: 'pointer',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
});

const copyBtn = (copied) => ({
  padding: '7px 18px', borderRadius: 6,
  background: copied ? '#2D6E1C' : '#F0F7EE',
  color: copied ? '#fff' : '#2D6E1C',
  border: '1.5px solid #2D6E1C',
  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
});

// Parse SUBJECT and BODY out of the raw draft string
const parseDraft = (raw) => {
  if (!raw) return { subject: '', body: raw };
  const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch    = raw.match(/BODY:\s*([\s\S]+)/i);
  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    body:    bodyMatch    ? bodyMatch[1].trim()    : raw.trim(),
  };
};

export default function PeakOutreach() {
  const { user } = useContext(UserContext);

  const [campaign,        setCampaign]        = useState('CLIENT_UPDATE');
  const [touch,           setTouch]           = useState(1);
  const [contactName,     setContactName]     = useState('');
  const [contactTitle,    setContactTitle]    = useState('');
  const [contactCompany,  setContactCompany]  = useState('');
  const [context,         setContext]         = useState('');
  const [loading,         setLoading]         = useState(false);
  const [draft,           setDraft]           = useState(null);
  const [copied,          setCopied]          = useState(false);
  const [error,           setError]           = useState('');

  const generate = async () => {
    if (!contactName.trim() || !context.trim()) {
      setError('Contact name and context are required.');
      return;
    }
    setError('');
    setLoading(true);
    setDraft(null);
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
      });
      const data = await res.json();
      const raw = data.draft || data.body || data.text || '';
      setDraft(parseDraft(raw));
    } catch (e) {
      setError('Something went wrong. Check the webhook connection.');
      console.error(e);
    }
    setLoading(false);
  };

  const copy = () => {
    if (!draft) return;
    const full = draft.subject
      ? `Subject: ${draft.subject}\n\n${draft.body}`
      : draft.body;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setDraft(null);
    setContactName('');
    setContactTitle('');
    setContactCompany('');
    setContext('');
    setTouch(1);
    setCampaign('CLIENT_UPDATE');
  };

  return (
    <div style={s.page}>
      <div style={s.headline}>My Outreach</div>
      <div style={s.sub}>Generate a draft email in your voice — client updates, partner reach, prospect intros.</div>

      {/* Campaign Type */}
      <div style={s.section}>
        <span style={s.label}>Campaign Type</span>
        <div style={s.campaignGrid}>
          {CAMPAIGN_TYPES.map(c => (
            <button key={c.id} style={campaignBtn(campaign === c.id)} onClick={() => setCampaign(c.id)}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, display: 'block' }}>
                {c.label}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, display: 'block', marginTop: 2, color: campaign === c.id ? 'rgba(255,255,255,0.75)' : '#6A8864' }}>
                {c.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Touch */}
      <div style={s.section}>
        <span style={s.label}>Touch</span>
        <div style={s.touchRow}>
          {[1, 2, 3].map(t => (
            <button key={t} style={touchBtn(touch === t)} onClick={() => setTouch(t)}>
              Touch {t}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={s.section}>
        <span style={s.label}>Recipient</span>
        <div style={s.row2}>
          <input style={s.input} placeholder="Name *" value={contactName} onChange={e => setContactName(e.target.value)} />
          <input style={s.input} placeholder="Title / Role" value={contactTitle} onChange={e => setContactTitle(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <input style={s.input} placeholder="Company / School" value={contactCompany} onChange={e => setContactCompany(e.target.value)} />
        </div>
      </div>

      {/* Context */}
      <div style={s.section}>
        <span style={s.label}>Context &amp; Goal *</span>
        <textarea
          style={s.textarea}
          placeholder="What's the purpose of this email? What do you want them to know or do?"
          value={context}
          onChange={e => setContext(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#C03020', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button style={s.generateBtn} onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Draft'}
      </button>

      {draft && (
        <div style={s.draftCard}>
          <div style={s.draftHeader}>
            <span style={s.draftLabel}>Generated Draft</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={copyBtn(copied)} onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
              <button style={{ ...copyBtn(false), color: '#6A8864', borderColor: '#C4D8BE' }} onClick={reset}>New Draft</button>
            </div>
          </div>
          {draft.subject && (
            <div style={s.subjectLine}>Subject: {draft.subject}</div>
          )}
          <div style={s.draftText}>{draft.body}</div>
        </div>
      )}
    </div>
  );
}
