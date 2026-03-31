import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useSchool } from '../../context/SchoolContext'
import {
  ShoppingCart, Trophy, Star, Users, ArrowLeft, Edit2,
  RefreshCw, ExternalLink, Zap, ChevronRight, Search,
  SlidersHorizontal, Plus, X, FileText, Send, UserPlus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getContacts } from '../../data/contacts'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

// ── Scoring ───────────────────────────────────────────────────────────────────
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

// ── Pipeline stages ───────────────────────────────────────────────────────────
const STAGES = [
  { id: 'prospect',   label: 'Prospect',   color: '#94a3b8', desc: 'New — not yet contacted' },
  { id: 'contacted',  label: 'Contacted',  color: '#3b82f6', desc: 'T1 sent' },
  { id: 'followup',   label: 'Follow-up',  color: '#f59e0b', desc: 'T2 sent' },
  { id: 'hot',        label: 'Hot',        color: '#3CDB7A', desc: 'Engaged — ready to close' },
  { id: 'closed',     label: 'Closed',     color: '#8b5cf6', desc: 'Deal won' },
]

const CAMPAIGNS = [
  { id: 'TICKETS',     label: 'Ticket Sales',       icon: ShoppingCart },
  { id: 'SPONSORSHIP', label: 'Sponsorship',         icon: Trophy       },
  { id: 'HOSPITALITY', label: 'Hospitality',         icon: Star         },
  { id: 'ALUMNI',      label: 'Alumni Outreach',     icon: Users        },
]

// ── Determine pipeline stage from contact data + touch history ────────────────
const getStage = (ct, touchMap) => {
  if (ct.pipeline_stage) return ct.pipeline_stage
  const touches = touchMap[ct.id] || new Set()
  if (ct.status === 'hot') return 'hot'
  if (touches.has('2') || touches.has('3')) return 'followup'
  if (touches.has('1')) return 'contacted'
  if (ct.contact_type === 'prospect') return 'prospect'
  return 'prospect'
}

// ── Parse AI draft ────────────────────────────────────────────────────────────
const parseDraft = (raw) => {
  if (!raw) return { angle: '', reason: '', subject: '', body: '', followUp: '' }
  const lines = raw.split('\n')
  let angle = '', reason = '', subject = '', body = '', followUp = '', inBody = false
  for (const line of lines) {
    if (line.startsWith('SELECTED ANGLE:'))     { angle    = line.replace('SELECTED ANGLE:', '').trim(); inBody = false }
    else if (line.startsWith('REASON:'))        { reason   = line.replace('REASON:', '').trim();         inBody = false }
    else if (line.startsWith('SUBJECT:'))       { subject  = line.replace('SUBJECT:', '').trim();        inBody = false }
    else if (line.startsWith('BODY:'))          { inBody   = true }
    else if (line.startsWith('FOLLOW-UP NOTE')) { followUp = line.replace('FOLLOW-UP NOTE FOR REP:', '').trim(); inBody = false }
    else if (inBody)                            { body += (body ? '\n' : '') + line }
  }
  return { angle, reason, subject, body: body.trim(), followUp }
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = (primary) => `
  .crm-shell { background:var(--pb-bg); min-height:100%; font-family:'DM Sans',Inter,sans-serif; color:var(--pb-text); }
  .crm-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.15s; }
  .crm-btn:hover { border-color:${primary}; color:${primary}; }
  .crm-btn-primary { background:${primary}; border-color:${primary}; color:#fff !important; }
  .crm-btn-primary:hover { opacity:0.9; }
  .crm-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${primary}; }
  .crm-input { width:100%; padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.15s; }
  .crm-input:focus { border-color:${primary}; }
  .crm-textarea { width:100%; min-height:80px; padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; resize:vertical; line-height:1.6; }
  .crm-textarea:focus { border-color:${primary}; }
  .crm-select { padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:12px; font-family:'Space Mono',monospace; outline:none; cursor:pointer; width:100%; box-sizing:border-box; }
  .crm-select:focus { border-color:${primary}; }
  .crm-row { display:flex; align-items:center; padding:13px 16px; border-radius:11px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.15s; gap:12px; width:100%; text-align:left; }
  .crm-row:hover { border-color:${primary}44; background:var(--pb-surface2); transform:translateX(2px); }
  .crm-row.active { border-color:${primary}; background:var(--pb-surface2); }
  .crm-score { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:#fff; }
  .crm-touch-btn { width:38px; height:38px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-weight:700; font-size:14px; transition:all 0.15s; }
  .crm-touch-btn.active { background:${primary}; border-color:${primary}; color:#fff; }
  .crm-stage-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-family:'Space Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
  .crm-cam-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:20px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-family:'Space Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.15s; }
  .crm-cam-pill.active { background:${primary}; border-color:${primary}; color:#fff; }
  .crm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .crm-modal { background:var(--pb-surface); border-radius:20px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:28px; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
  @keyframes crm-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @media (max-width: 640px) {
    .crm-stats-grid { grid-template-columns: 1fr 1fr !important; }
    .crm-pipeline-grid { grid-template-columns: 1fr !important; }
    .crm-modal { padding: 20px !important; }
    .crm-modal-fields { grid-template-columns: 1fr !important; }
    .crm-contact-panel { position:fixed !important; inset:auto 0 0 0 !important; border-radius:20px 20px 0 0 !important; max-height:80vh !important; overflow-y:auto !important; z-index:100; }
  }
`

// ── Touch badges ──────────────────────────────────────────────────────────────
const TouchBadges = ({ contactId, touchMap }) => {
  const touches = touchMap[contactId] || new Set()
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
      {[1, 2, 3].map(t => {
        const done = touches.has(String(t)) || touches.has(t)
        return (
          <div key={t} style={{
            width: 20, height: 20, borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Mono', monospace", fontSize: 8, fontWeight: 700,
            background: done ? 'rgba(60,219,122,0.15)' : 'rgba(0,0,0,0.06)',
            border: done ? '1px solid rgba(60,219,122,0.4)' : '1px solid rgba(0,0,0,0.1)',
            color: done ? '#3CDB7A' : '#bbb',
          }}>T{t}</div>
        )
      })}
    </div>
  )
}

// ── Add Prospect Modal ────────────────────────────────────────────────────────
function AddProspectModal({ school, onClose, onAdd }) {
  const c = school.colors
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '',
    sport: 'Football', campaign: 'TICKETS', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.email.trim()) { setError('Email is required'); return }
    setSaving(true)
    try {
      const newContact = {
        school_id: school.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        title: `Prospect | ${form.sport}`,
        contact_type: 'prospect',
        status: 'warm',
        tags: [form.campaign],
        purchase_count: 0,
        is_lapsed_season: false,
        is_alumni: false,
        current_touch: 0,
        notes: form.notes.trim() || null,
        pipeline_stage: 'prospect',
        campaign: form.campaign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { data, error: err } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
      if (err) throw err
      onAdd({ ...newContact, id: data?.[0]?.id || `temp-${Date.now()}`, sport: form.sport, last_year: 0 })
      onClose()
    } catch (err) {
      setError('Could not save — check Supabase connection')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 4 }}>New Prospect</p>
            <h3 style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--pb-text)', letterSpacing: '0.04em' }}>Add Contact</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="crm-modal-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Name *</p>
              <input className="crm-input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Email *</p>
              <input className="crm-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Phone</p>
              <input className="crm-input" placeholder="(000) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>City</p>
              <input className="crm-input" placeholder="City, State" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Sport Interest</p>
              <select className="crm-select" value={form.sport} onChange={e => set('sport', e.target.value)}>
                <option>Football</option>
                <option>Basketball</option>
                <option>Volleyball</option>
                <option>Multi-Sport</option>
              </select>
            </div>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Campaign</p>
              <select className="crm-select" value={form.campaign} onChange={e => set('campaign', e.target.value)}>
                {CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="crm-label" style={{ marginBottom: 5 }}>Notes</p>
            <textarea className="crm-textarea" placeholder="How did you meet them? What did they say? Any details that help draft a better email..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="crm-btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Saving...' : <><UserPlus size={15} /> Add to Pipeline</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main CRM ──────────────────────────────────────────────────────────────────
export default function CRM() {
  const { school } = useSchool()
  const c = school.colors
  const primary = c.accent

  // ── View state ──────────────────────────────────────────────────────────────
  const [view, setView]             = useState('pipeline') // pipeline | draft
  const [selectedContact, setSelectedContact] = useState(null)
  const [campaign, setCampaign]     = useState('TICKETS')
  const [touch, setTouch]           = useState(1)
  const [parsed, setParsed]         = useState(null)
  const [drafting, setDrafting]     = useState(false)
  const [editMode, setEditMode]     = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [notes, setNotes]           = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // ── Pipeline filters ────────────────────────────────────────────────────────
  const [search, setSearch]         = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [camFilter, setCamFilter]   = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // ── Touch history ───────────────────────────────────────────────────────────
  const [touchMap, setTouchMap] = useState({})

  // ── Extra prospects added this session ──────────────────────────────────────
  const [newProspects, setNewProspects] = useState([])

  const fetchTouchHistory = useCallback(async (schoolId) => {
    try {
      const { data } = await supabase
        .from('sequences')
        .select('contact_id, touch_number')
        .eq('school_id', schoolId)
      if (!data) return
      const map = {}
      data.forEach(row => {
        if (!map[row.contact_id]) map[row.contact_id] = new Set()
        map[row.contact_id].add(String(row.touch_number))
      })
      setTouchMap(map)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { fetchTouchHistory(school.id) }, [school.id, fetchTouchHistory])

  // ── All contacts — merge Vivenue + new prospects ────────────────────────────
  const allContacts = useMemo(() => {
    const vivenue = getContacts(school.id, 'TICKETS')
      .concat(getContacts(school.id, 'SPONSORSHIP'))
    const seen = new Set()
    const deduped = []
    for (const ct of vivenue) {
      if (!seen.has(ct.id)) { seen.add(ct.id); deduped.push(ct) }
    }
    return [...newProspects, ...deduped]
  }, [school.id, newProspects])

  // ── Filtered + staged contacts ──────────────────────────────────────────────
  const contacts = useMemo(() => {
    let list = allContacts
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(ct =>
        (ct.name || '').toLowerCase().includes(q) ||
        (ct.email || '').toLowerCase().includes(q) ||
        (ct.title || '').toLowerCase().includes(q)
      )
    }
    if (camFilter !== 'all') {
      list = list.filter(ct =>
        (ct.tags || []).includes(camFilter) ||
        ct.campaign === camFilter ||
        (camFilter === 'TICKETS' && ct.contact_type === 'ticket_buyer')
      )
    }
    return list
  }, [allContacts, search, camFilter])

  // ── Group by pipeline stage ─────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const g = {}
    STAGES.forEach(s => { g[s.id] = [] })
    contacts.forEach(ct => {
      const stage = getStage(ct, touchMap)
      if (g[stage]) g[stage].push(ct)
      else g['prospect'].push(ct)
    })
    // Sort each group by score desc
    Object.keys(g).forEach(k => {
      g[k].sort((a, b) => computeScore(b) - computeScore(a))
    })
    return g
  }, [contacts, touchMap])

  const visibleStages = stageFilter === 'all'
    ? STAGES
    : STAGES.filter(s => s.id === stageFilter)

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allContacts.length,
    hot:      allContacts.filter(ct => ct.status === 'hot').length,
    prospects: newProspects.length,
    contacted: Object.values(touchMap).filter(t => t.size > 0).length,
  }), [allContacts, newProspects, touchMap])

  // ── Generate AI draft ────────────────────────────────────────────────────────
  const requestDraft = async (ct, t, cam) => {
    setDrafting(true); setParsed(null)
    try {
      const res = await fetch(PLAYBOOK_WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: school.id, campaign: cam, touch: t,
          contact: {
            id: ct.id, name: ct.name, email: ct.email, phone: ct.phone || '',
            title: ct.title || '', purchase_count: ct.purchase_count || 0,
            status: ct.status || 'warm', last_year: ct.last_year || 0,
            sport: ct.sport || 'Football', tags: ct.tags || '',
            membership_tier: ct.membership_tier || '',
            notes: notes || '',
          },
        }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft || '')
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
      setView('draft')
      // Mark touch optimistically
      setTouchMap(prev => {
        const updated = { ...prev }
        if (!updated[ct.id]) updated[ct.id] = new Set()
        else updated[ct.id] = new Set(updated[ct.id])
        updated[ct.id].add(String(t))
        return updated
      })
    } catch {
      setParsed({ angle: 'Connection Error', reason: 'Check n8n webhook', subject: '', body: 'Could not connect to AI.', followUp: '' })
      setView('draft')
    } finally {
      setDrafting(false)
    }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode ? editedSubject : parsed?.subject || '')
    const body = encodeURIComponent(editMode ? editedBody : parsed?.body || '')
    window.open(`mailto:${selectedContact.email}?subject=${subj}&body=${body}`)
  }

  const saveNotes = async () => {
    if (!selectedContact) return
    setSavingNotes(true)
    try {
      await supabase.from('contacts').update({ notes, updated_at: new Date().toISOString() }).eq('id', selectedContact.id)
    } catch (e) { console.error(e) }
    finally { setSavingNotes(false) }
  }

  const vars = { '--pb-bg': c.bg, '--pb-surface': '#ffffff', '--pb-surface2': c.bg, '--pb-border': c.border, '--pb-text': c.primary, '--pb-muted': c.accent }
  const initials = (name) => (name || '??').split(' ').map(n => n[0]).slice(0, 2).join('')

  // ── DRAFT VIEW ───────────────────────────────────────────────────────────────
  if (view === 'draft' && selectedContact) {
    return (
      <div className="crm-shell" style={vars}>
        <style>{CSS(primary)}</style>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 24px' }}>
          <button className="crm-btn" onClick={() => setView('pipeline')} style={{ marginBottom: 16 }}>
            <ArrowLeft size={15} /> Back to Pipeline
          </button>

          {drafting ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>{school.emoji}</div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--pb-text)', marginBottom: 8, letterSpacing: '0.04em' }}>Drafting for {selectedContact.name}...</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: primary, animation: `crm-bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          ) : parsed && (
            <>
              {/* Angle banner */}
              <div style={{ padding: '13px 16px', borderRadius: 12, background: `${primary}18`, border: `1px solid ${primary}44`, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Zap size={16} color={primary} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p className="crm-label" style={{ marginBottom: 3 }}>{parsed.angle}</p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--pb-muted)', lineHeight: 1.5 }}>{parsed.reason}</p>
                </div>
              </div>

              {/* Email card */}
              <div style={{ background: '#fff', border: '1px solid var(--pb-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--pb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--pb-muted)' }}>
                      <span style={{ color: 'var(--pb-text)', fontWeight: 600 }}>To:</span> {selectedContact.name} · <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{selectedContact.email}</span>
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--pb-muted)', fontFamily: "'Space Mono',monospace" }}>
                      Touch {touch} of 3 · {campaign}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="crm-btn" onClick={() => requestDraft(selectedContact, touch, campaign)} style={{ padding: '6px 12px', fontSize: 11 }}>
                      <RefreshCw size={12} /> Regenerate
                    </button>
                    <button className="crm-btn" onClick={() => setEditMode(!editMode)} style={{ padding: '6px 12px', fontSize: 11, ...(editMode ? { background: primary, borderColor: primary, color: '#fff' } : {}) }}>
                      <Edit2 size={12} /> {editMode ? 'Preview' : 'Edit'}
                    </button>
                  </div>
                </div>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--pb-border)' }}>
                  <p className="crm-label" style={{ marginBottom: 6 }}>Subject</p>
                  {editMode
                    ? <input className="crm-input" value={editedSubject} onChange={e => setEditedSubject(e.target.value)} />
                    : <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pb-text)' }}>{parsed.subject}</p>
                  }
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <p className="crm-label" style={{ marginBottom: 8 }}>Body</p>
                  {editMode
                    ? <textarea className="crm-textarea" style={{ minHeight: 200 }} value={editedBody} onChange={e => setEditedBody(e.target.value)} />
                    : <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--pb-text)', whiteSpace: 'pre-wrap' }}>{parsed.body}</div>
                  }
                </div>
              </div>

              {parsed.followUp && (
                <div style={{ padding: '12px 16px', borderRadius: 11, background: '#f0fdf4', border: '1px solid #86efac', marginBottom: 18 }}>
                  <p style={{ margin: '0 0 3px', fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Rep Note</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>{parsed.followUp}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="crm-btn crm-btn-primary" onClick={openInEmail} style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '0.05em' }}>
                  <ExternalLink size={18} /> Open in Email
                </button>
                {touch < 3 && (
                  <button className="crm-btn" onClick={() => { const n = touch + 1; setTouch(n); requestDraft(selectedContact, n, campaign) }} style={{ padding: '14px 20px', borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17 }}>
                    Next Touch <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── PIPELINE VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="crm-shell" style={vars}>
      <style>{CSS(primary)}</style>
      {showAddModal && (
        <AddProspectModal
          school={school}
          onClose={() => setShowAddModal(false)}
          onAdd={(ct) => setNewProspects(prev => [ct, ...prev])}
        />
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 5 }}>CRM · {school.short}</p>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,48px)', color: 'var(--pb-text)', margin: 0, letterSpacing: '0.03em' }}>Sales Pipeline</h2>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Prospect
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="crm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Contacts', value: stats.total },
            { label: 'Hot Leads',      value: stats.hot },
            { label: 'Contacted',      value: stats.contacted },
            { label: 'Prospects Added', value: stats.prospects },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid var(--pb-border)' }}>
              <p className="crm-label" style={{ marginBottom: 4 }}>{s.label}</p>
              <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: primary, letterSpacing: '0.03em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={13} color={c.accent} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="crm-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Stage filter */}
          <select className="crm-select" style={{ width: 'auto' }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {/* Campaign filter */}
          <select className="crm-select" style={{ width: 'auto' }} value={camFilter} onChange={e => setCamFilter(e.target.value)}>
            <option value="all">All Campaigns</option>
            {CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* ── Two-column layout: pipeline list + contact panel ── */}
        <div className="crm-pipeline-grid" style={{ display: 'grid', gridTemplateColumns: selectedContact ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>

          {/* ── Pipeline stages ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visibleStages.map(stage => {
              const stageContacts = grouped[stage.id] || []
              if (stageContacts.length === 0 && stageFilter === 'all') return null
              return (
                <div key={stage.id}>
                  {/* Stage header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: `2px solid ${stage.color}33` }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {stage.label}
                    </p>
                    <div style={{ padding: '1px 8px', borderRadius: 20, background: `${stage.color}18`, fontFamily: "'Space Mono',monospace", fontSize: 9, color: stage.color, fontWeight: 700 }}>
                      {stageContacts.length}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-muted)', opacity: 0.7 }}>{stage.desc}</p>
                  </div>

                  {/* Contact rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stageContacts.map(ct => {
                      const score = computeScore(ct)
                      const isActive = selectedContact?.id === ct.id
                      return (
                        <button
                          key={ct.id}
                          className={`crm-row${isActive ? ' active' : ''}`}
                          onClick={() => {
                            setSelectedContact(ct)
                            setNotes(ct.notes || '')
                            setCampaign(ct.campaign || 'TICKETS')
                            setParsed(null)
                            setView('pipeline')
                          }}
                        >
                          {/* Avatar */}
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: isActive ? `${primary}22` : c.border, border: `1px solid ${primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: primary, flexShrink: 0 }}>
                            {initials(ct.name)}
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--pb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.email}</p>
                          </div>
                          {/* Touch badges */}
                          <TouchBadges contactId={ct.id} touchMap={touchMap} />
                          {/* Score */}
                          <div className="crm-score" style={{ background: SCORE_COLOR(score), flexShrink: 0 }}>{score}</div>
                          <ChevronRight size={14} color={primary} style={{ flexShrink: 0 }} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Contact detail panel ── */}
          {selectedContact && (
            <div className="crm-contact-panel" style={{ position: 'sticky', top: 16 }}>
              <div style={{ background: '#fff', border: '1px solid var(--pb-border)', borderRadius: 18, overflow: 'hidden' }}>
                {/* Panel header */}
                <div style={{ padding: '16px 18px', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: 'white' }}>
                      {initials(selectedContact.name)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', letterSpacing: '0.04em', lineHeight: 1.1 }}>{selectedContact.name}</p>
                      <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent }}>{selectedContact.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Score + stage */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="crm-score" style={{ background: SCORE_COLOR(computeScore(selectedContact)) }}>{computeScore(selectedContact)}</div>
                    <div>
                      <p className="crm-label" style={{ marginBottom: 2 }}>Score</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--pb-muted)' }}>{selectedContact.title}</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <TouchBadges contactId={selectedContact.id} touchMap={touchMap} />
                    </div>
                  </div>

                  {/* Campaign selector */}
                  <div>
                    <p className="crm-label" style={{ marginBottom: 8 }}>Campaign</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {CAMPAIGNS.map(cam => {
                        const Icon = cam.icon
                        return (
                          <button key={cam.id} className={`crm-cam-pill${campaign === cam.id ? ' active' : ''}`} onClick={() => setCampaign(cam.id)}>
                            <Icon size={10} /> {cam.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Touch selector */}
                  <div>
                    <p className="crm-label" style={{ marginBottom: 8 }}>Touch</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3].map(t => (
                        <button key={t} className={`crm-touch-btn${touch === t ? ' active' : ''}`} onClick={() => setTouch(t)}>{t}</button>
                      ))}
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--pb-muted)', alignSelf: 'center', marginLeft: 4 }}>
                        {touch === 1 ? 'The Moment' : touch === 2 ? 'The Identity' : 'The Door'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p className="crm-label" style={{ margin: 0 }}>Notes</p>
                      {notes !== (selectedContact.notes || '') && (
                        <button onClick={saveNotes} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: primary, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                          {savingNotes ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>
                    <textarea
                      className="crm-textarea"
                      placeholder="Call notes, what they said, context for the AI..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Generate draft */}
                  <button
                    className="crm-btn crm-btn-primary"
                    onClick={() => requestDraft(selectedContact, touch, campaign)}
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '0.05em' }}
                  >
                    <Zap size={16} /> Generate Draft
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
