import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useSchool } from '../../context/SchoolContext'
import {
  ShoppingCart, Trophy, Star, Users, Edit2,
  RefreshCw, ExternalLink, Zap, ChevronRight, Search,
  Plus, X, UserPlus, Building2, Ticket, Users2, Pin,
  ChevronDown, ChevronUp, MousePointerClick, Copy, Check
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

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

const CAMPAIGNS = [
  { id: 'TICKETS',     label: 'Ticket Sales',   icon: ShoppingCart },
  { id: 'SPONSORSHIP', label: 'Sponsorship',     icon: Trophy       },
  { id: 'HOSPITALITY', label: 'Hospitality',     icon: Star         },
  { id: 'ALUMNI',      label: 'Alumni Outreach', icon: Users        },
]

const TABS = [
  { id: 'tickets',   label: 'Ticket Holders', icon: Ticket,    },
  { id: 'prospects', label: 'Prospects',       icon: Building2, },
  { id: 'groups',    label: 'Group Buyers',    icon: Users2,    },
]

const CATEGORY_LABEL = {
  business: 'Business', professional_services: 'Professional Services',
  financial: 'Financial', healthcare: 'Healthcare', retail: 'Retail',
  property: 'Property', community: 'Community', youth_sports: 'Youth Sports',
  group_mbb: 'MBB Group', group_wbb: 'WBB Group', group_fb: 'FB Group', group_vball: 'Volleyball Group',
}

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

const CSS = (primary) => `
  .crm-shell { background:var(--pb-bg); min-height:100%; font-family:'DM Sans',Inter,sans-serif; color:var(--pb-text); }
  .crm-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.15s; }
  .crm-btn:hover { border-color:${primary}; color:${primary}; }
  .crm-btn-primary { background:${primary}; border-color:${primary}; color:#fff !important; }
  .crm-btn-primary:hover { opacity:0.88; }
  .crm-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.09em; text-transform:uppercase; color:var(--pb-muted); }
  .crm-input { width:100%; padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.15s; }
  .crm-input:focus { border-color:${primary}; }
  .crm-textarea { width:100%; min-height:72px; padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; resize:vertical; line-height:1.6; }
  .crm-textarea:focus { border-color:${primary}; }
  .crm-select { padding:9px 13px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:12px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; box-sizing:border-box; }
  .crm-row { display:flex; align-items:center; padding:11px 14px; border-radius:11px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.15s; gap:10px; width:100%; text-align:left; }
  .crm-row:hover { border-color:${primary}44; background:var(--pb-surface2); transform:translateX(2px); }
  .crm-row.active { border-color:${primary}; background:${primary}0a; box-shadow:0 0 0 1px ${primary}33; }
  .crm-row.pinned { border-color:${primary}55; }
  .crm-score { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
  .crm-touch-btn { width:36px; height:36px; border-radius:9px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-weight:700; font-size:13px; transition:all 0.15s; }
  .crm-touch-btn.active { background:${primary}; border-color:${primary}; color:#fff; }
  .crm-cam-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:20px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.15s; }
  .crm-cam-pill.active { background:${primary}; border-color:${primary}; color:#fff; }
  .crm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .crm-modal { background:var(--pb-surface); border-radius:20px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:28px; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
  .crm-tab { display:flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; border:1.5px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-muted); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; transition:all 0.15s; white-space:nowrap; }
  .crm-tab.active { background:${primary}; border-color:${primary}; color:#fff; }
  .crm-tab:not(.active):hover { border-color:${primary}44; color:var(--pb-text); }
  .pin-btn { background:none; border:none; cursor:pointer; padding:3px; border-radius:5px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; opacity:0.3; flex-shrink:0; }
  .pin-btn:hover,.pin-btn.pinned { opacity:1; }
  .cold-toggle { display:flex; align-items:center; gap:8px; padding:9px 14px; border-radius:10px; border:1px dashed var(--pb-border); background:transparent; color:var(--pb-muted); cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; width:100%; transition:all 0.15s; }
  .cold-toggle:hover { border-color:${primary}44; color:var(--pb-text); }
  .gen-btn-loading { animation: gen-pulse 1.5s ease-in-out infinite; }
  @keyframes gen-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
  @keyframes crm-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .draft-appear { animation: fadeSlideIn 0.3s ease both; }
  @media (max-width:900px) {
    .crm-layout { grid-template-columns:1fr !important; }
    .crm-panel { display:none !important; }
    .crm-panel.has-contact { display:flex !important; position:fixed !important; inset:auto 0 0 0 !important; border-radius:20px 20px 0 0 !important; max-height:80vh !important; overflow-y:auto !important; z-index:100; flex-direction:column; }
  }
  @media (max-width:640px) {
    .crm-stats-grid { grid-template-columns:1fr 1fr !important; }
    .crm-tabs { overflow-x:auto; padding-bottom:4px; }
    .crm-modal { padding:20px !important; }
    .crm-modal-fields { grid-template-columns:1fr !important; }
  }
`

const TouchBadges = ({ contactId, touchMap }) => {
  const touches = touchMap[contactId] || new Set()
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
      {[1, 2, 3].map(t => {
        const done = touches.has(String(t))
        return (
          <div key={t} style={{
            width: 18, height: 18, borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700,
            background: done ? 'rgba(60,219,122,0.15)' : 'rgba(0,0,0,0.05)',
            border: done ? '1px solid rgba(60,219,122,0.4)' : '1px solid rgba(0,0,0,0.08)',
            color: done ? '#3CDB7A' : '#bbb',
          }}>T{t}</div>
        )
      })}
    </div>
  )
}

function AddProspectModal({ school, onClose, onAdd }) {
  const primary = school.colors.accent
  const [form, setForm] = useState({ name: '', email: '', phone: '', organization: '', sport: 'Football', campaign: 'TICKETS', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      const newContact = {
        school_id: school.id, name: form.name.trim(),
        email: form.email.trim().toLowerCase() || null,
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        title: `Prospect | ${form.sport}`,
        contact_type: 'prospect', status: 'warm',
        tags: [form.campaign], purchase_count: 0,
        is_lapsed_season: false, is_alumni: false, current_touch: 0,
        notes: form.notes.trim() || null, pipeline_stage: 'prospect',
        campaign: form.campaign, is_pinned: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      const { data, error: err } = await supabase.from('contacts').insert([newContact]).select()
      if (err) throw err
      onAdd({ ...newContact, id: data?.[0]?.id || `temp-${Date.now()}`, sport: form.sport, last_year: 0 })
      onClose()
    } catch (err) { setError('Could not save — check Supabase connection'); console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div className="crm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 4 }}>New Prospect</p>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--pb-text)' }}>Add Contact</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="crm-modal-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><p className="crm-label" style={{ marginBottom: 5 }}>Name *</p><input className="crm-input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><p className="crm-label" style={{ marginBottom: 5 }}>Email</p><input className="crm-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><p className="crm-label" style={{ marginBottom: 5 }}>Phone</p><input className="crm-input" placeholder="(000) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><p className="crm-label" style={{ marginBottom: 5 }}>Organization</p><input className="crm-input" placeholder="Company / Church / School" value={form.organization} onChange={e => set('organization', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Sport</p>
              <select className="crm-select" style={{ width: '100%' }} value={form.sport} onChange={e => set('sport', e.target.value)}>
                <option>Football</option><option>Basketball</option><option>Volleyball</option><option>Multi-Sport</option>
              </select>
            </div>
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Campaign</p>
              <select className="crm-select" style={{ width: '100%' }} value={form.campaign} onChange={e => set('campaign', e.target.value)}>
                {CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div><p className="crm-label" style={{ marginBottom: 5 }}>Notes</p><textarea className="crm-textarea" placeholder="Context for the AI..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
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

export default function CRM() {
  const { school } = useSchool()
  const c = school.colors
  const primary = c.accent

  const [activeTab, setActiveTab]             = useState('tickets')
  const [selectedContact, setSelectedContact] = useState(null)
  const [campaign, setCampaign]               = useState('TICKETS')
  const [touch, setTouch]                     = useState(1)
  const [parsed, setParsed]                   = useState(null)
  const [drafting, setDrafting]               = useState(false)
  const [editMode, setEditMode]               = useState(false)
  const [editedSubject, setEditedSubject]     = useState('')
  const [editedBody, setEditedBody]           = useState('')
  const [notes, setNotes]                     = useState('')
  const [savingNotes, setSavingNotes]         = useState(false)
  const [search, setSearch]                   = useState('')
  const [camFilter, setCamFilter]             = useState('all')
  const [showAddModal, setShowAddModal]       = useState(false)
  const [allContacts, setAllContacts]         = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [touchMap, setTouchMap]               = useState({})
  const [newProspects, setNewProspects]       = useState([])
  const [showCold, setShowCold]               = useState(false)
  const [copied, setCopied]                   = useState(false)

  // ── Fetch contacts ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoadingContacts(true)
      try {
        const { data, error } = await supabase
          .from('contacts').select('*').eq('school_id', school.id).order('name')
        if (!error && data) setAllContacts(data)
      } catch (e) { console.error(e) }
      finally { setLoadingContacts(false) }
    }
    fetch()
  }, [school.id])

  // ── Touch history ─────────────────────────────────────────────────────────
  const fetchTouchHistory = useCallback(async (schoolId) => {
    try {
      const { data } = await supabase.from('sequences').select('contact_id, touch_number').eq('school_id', schoolId)
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

  // ── Pin ───────────────────────────────────────────────────────────────────
  const togglePin = async (e, ct) => {
    e.stopPropagation()
    const newVal = !ct.is_pinned
    setAllContacts(prev => prev.map(c => c.id === ct.id ? { ...c, is_pinned: newVal } : c))
    if (selectedContact?.id === ct.id) setSelectedContact(prev => ({ ...prev, is_pinned: newVal }))
    await supabase.from('contacts').update({ is_pinned: newVal, updated_at: new Date().toISOString() }).eq('id', ct.id)
  }

  // ── Tab + filter ──────────────────────────────────────────────────────────
  const tabContacts = useMemo(() => {
    const base = [...newProspects, ...allContacts]
    if (activeTab === 'tickets')   return base.filter(ct => ct.contact_type === 'ticket_buyer' && !ct.business_category?.startsWith('group_'))
    if (activeTab === 'groups')    return base.filter(ct => ct.contact_type === 'ticket_buyer' && ct.business_category?.startsWith('group_'))
    if (activeTab === 'prospects') return base.filter(ct => ct.contact_type === 'prospect' || ct.contact_type === 'sponsor')
    return base
  }, [allContacts, newProspects, activeTab])

  const filteredContacts = useMemo(() => {
    let list = tabContacts
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(ct =>
        (ct.name || '').toLowerCase().includes(q) ||
        (ct.email || '').toLowerCase().includes(q) ||
        (ct.organization || '').toLowerCase().includes(q)
      )
    }
    if (camFilter !== 'all') {
      list = list.filter(ct =>
        (ct.tags || []).includes(camFilter) || ct.campaign === camFilter ||
        (camFilter === 'TICKETS' && ct.contact_type === 'ticket_buyer')
      )
    }
    return list
  }, [tabContacts, search, camFilter])

  const { pinned, queue, cold } = useMemo(() => {
    const sorted = [...filteredContacts].sort((a, b) => computeScore(b) - computeScore(a))
    const pinned  = sorted.filter(ct => ct.is_pinned)
    const unpinned = sorted.filter(ct => !ct.is_pinned)
    const queue   = unpinned.filter(ct => ct.status === 'hot' || ct.status === 'warm')
    const cold    = unpinned.filter(ct => !ct.status || ct.status === 'cold' || ct.status === 'prospect')
    return { pinned, queue, cold }
  }, [filteredContacts])

  const tabCounts = useMemo(() => {
    const base = [...newProspects, ...allContacts]
    return {
      tickets:   base.filter(ct => ct.contact_type === 'ticket_buyer' && !ct.business_category?.startsWith('group_')).length,
      groups:    base.filter(ct => ct.contact_type === 'ticket_buyer' && ct.business_category?.startsWith('group_')).length,
      prospects: base.filter(ct => ct.contact_type === 'prospect' || ct.contact_type === 'sponsor').length,
    }
  }, [allContacts, newProspects])

  const stats = useMemo(() => ({
    queue:     pinned.length + queue.length,
    pinned:    pinned.length,
    contacted: Object.values(touchMap).filter(t => t.size > 0).length,
    cold:      cold.length,
  }), [pinned, queue, cold, touchMap])

  // ── Generate draft ────────────────────────────────────────────────────────
  const requestDraft = async (ct, t, cam) => {
    setDrafting(true); setParsed(null); setEditMode(false)
    try {
      const res = await fetch(PLAYBOOK_WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: school.id, campaign: cam, touch: t,
          contact: {
            id: ct.id, name: ct.name, email: ct.email, phone: ct.phone || '',
            title: ct.title || ct.organization || '', purchase_count: ct.purchase_count || 0,
            status: ct.status || 'warm', last_year: ct.last_year || 0,
            sport: ct.sport || 'Football', tags: ct.tags || '',
            membership_tier: ct.membership_tier || '',
            notes: notes || ct.notes_devin || '',
          },
        }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft || '')
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
      setTouchMap(prev => {
        const updated = { ...prev }
        if (!updated[ct.id]) updated[ct.id] = new Set()
        else updated[ct.id] = new Set(updated[ct.id])
        updated[ct.id].add(String(t))
        return updated
      })
    } catch {
      setParsed({ angle: 'Connection Error', reason: 'Check n8n webhook', subject: '', body: 'Could not connect to AI.', followUp: '' })
    } finally { setDrafting(false) }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode ? editedSubject : parsed?.subject || '')
    const body = encodeURIComponent(editMode ? editedBody : parsed?.body || '')
    window.open(`mailto:${selectedContact?.email}?subject=${subj}&body=${body}`)
  }

  const copyDraft = () => {
    const full = `Subject: ${editMode ? editedSubject : parsed?.subject}\n\n${editMode ? editedBody : parsed?.body}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveNotes = async () => {
    if (!selectedContact) return
    setSavingNotes(true)
    try { await supabase.from('contacts').update({ notes, updated_at: new Date().toISOString() }).eq('id', selectedContact.id) }
    catch (e) { console.error(e) }
    finally { setSavingNotes(false) }
  }

  const vars = {
    '--pb-bg': c.bg || '#F0F7EE', '--pb-surface': '#ffffff',
    '--pb-surface2': c.bg || '#F0F7EE', '--pb-border': c.border || '#C4D8BE',
    '--pb-text': c.primary || '#1A2E18', '--pb-muted': c.accent || '#6A8864',
  }
  const initials = (name) => (name || '??').split(' ').map(n => n[0]).slice(0, 2).join('')

  // ── Contact row ───────────────────────────────────────────────────────────
  const ContactRow = ({ ct }) => {
    const score = computeScore(ct)
    const isActive = selectedContact?.id === ct.id
    const subtitle = ct.organization || ct.email || ''
    return (
      <button
        className={`crm-row${isActive ? ' active' : ''}${ct.is_pinned ? ' pinned' : ''}`}
        onClick={() => {
          setSelectedContact(ct)
          setNotes(ct.notes || '')
          setCampaign(ct.campaign || 'TICKETS')
          setParsed(null)
          setEditMode(false)
        }}
      >
        <button className={`pin-btn${ct.is_pinned ? ' pinned' : ''}`} onClick={e => togglePin(e, ct)} title={ct.is_pinned ? 'Unpin' : 'Pin'}>
          <Pin size={12} color={primary} fill={ct.is_pinned ? primary : 'none'} />
        </button>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: isActive ? `${primary}18` : 'var(--pb-surface2)', border: `1px solid ${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: primary, flexShrink: 0 }}>
          {initials(ct.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--pb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
        </div>
        <TouchBadges contactId={ct.id} touchMap={touchMap} />
        <div className="crm-score" style={{ background: SCORE_COLOR(score) }}>{score}</div>
        <ChevronRight size={13} color={isActive ? primary : 'var(--pb-muted)'} style={{ flexShrink: 0 }} />
      </button>
    )
  }

  // ── PANEL content ─────────────────────────────────────────────────────────
  const renderPanel = () => {
    // Empty state
    if (!selectedContact) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, gap: 12, padding: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${primary}12`, border: `1px solid ${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MousePointerClick size={24} color={`${primary}66`} />
        </div>
        <p style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--pb-text)' }}>Select a contact</p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--pb-muted)', textAlign: 'center', lineHeight: 1.6 }}>Click any contact in the list to view details and generate a draft email.</p>
      </div>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Panel header */}
        <div style={{ padding: '14px 16px', background: c.primary || '#152E10', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0 }}>
              {initials(selectedContact.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: 'white', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact.name}</p>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: c.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact.organization || selectedContact.email || ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="pin-btn" style={{ opacity: 1 }} onClick={e => togglePin(e, selectedContact)}>
              <Pin size={15} color={selectedContact.is_pinned ? c.accent : 'rgba(255,255,255,0.4)'} fill={selectedContact.is_pinned ? c.accent : 'none'} />
            </button>
            <button onClick={() => { setSelectedContact(null); setParsed(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2 }}><X size={15} /></button>
          </div>
        </div>

        {/* Scrollable panel body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Score + info */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="crm-score" style={{ background: SCORE_COLOR(computeScore(selectedContact)) }}>{computeScore(selectedContact)}</div>
            <div style={{ flex: 1 }}>
              <p className="crm-label" style={{ marginBottom: 1 }}>Score</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--pb-muted)' }}>
                {selectedContact.contact_type === 'ticket_buyer'
                  ? `${selectedContact.purchase_count || 0} seasons · ${selectedContact.sport || 'Football'}`
                  : CATEGORY_LABEL[selectedContact.business_category] || 'Prospect'}
              </p>
            </div>
            <TouchBadges contactId={selectedContact.id} touchMap={touchMap} />
          </div>

          {/* Contact info */}
          {(selectedContact.phone || selectedContact.email) && (
            <div style={{ padding: '9px 12px', background: 'var(--pb-bg)', borderRadius: 9, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {selectedContact.phone && <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--pb-text)' }}>{selectedContact.phone}</p>}
              {selectedContact.email && <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--pb-muted)' }}>{selectedContact.email}</p>}
            </div>
          )}

          {/* Devin's previous notes */}
          {selectedContact.notes_devin && (
            <div>
              <p className="crm-label" style={{ marginBottom: 5 }}>Previous Activity</p>
              <div style={{ padding: '9px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                {selectedContact.notes_devin}
              </div>
            </div>
          )}

          {/* Campaign */}
          <div>
            <p className="crm-label" style={{ marginBottom: 7 }}>Campaign</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {CAMPAIGNS.map(cam => {
                const Icon = cam.icon
                return (
                  <button key={cam.id} className={`crm-cam-pill${campaign === cam.id ? ' active' : ''}`} onClick={() => setCampaign(cam.id)}>
                    <Icon size={9} /> {cam.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Touch */}
          <div>
            <p className="crm-label" style={{ marginBottom: 7 }}>Touch</p>
            <div style={{ display: 'flex', gap: 7 }}>
              {[1, 2, 3].map(t => (
                <button key={t} className={`crm-touch-btn${touch === t ? ' active' : ''}`} onClick={() => setTouch(t)}>{t}</button>
              ))}
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--pb-muted)', alignSelf: 'center', marginLeft: 2 }}>
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
            <textarea className="crm-textarea" placeholder="Call notes, context for the AI..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Generate button */}
          <button
            className={`crm-btn crm-btn-primary${drafting ? ' gen-btn-loading' : ''}`}
            onClick={() => requestDraft(selectedContact, touch, campaign)}
            disabled={drafting}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 11, fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, position: 'relative' }}
          >
            {drafting ? (
              <>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: `crm-bounce 1.1s ${i*0.18}s infinite` }} />
                  ))}
                </div>
                <span style={{ marginLeft: 8 }}>Generating draft...</span>
              </>
            ) : (
              <><Zap size={15} /> Generate Draft</>
            )}
          </button>

          {/* ── Draft output — inline ── */}
          {parsed && !drafting && (
            <div className="draft-appear" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Angle */}
              <div style={{ padding: '10px 12px', borderRadius: 10, background: `${primary}10`, border: `1px solid ${primary}30`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Zap size={13} color={primary} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p className="crm-label" style={{ marginBottom: 2, color: primary }}>{parsed.angle}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-text)', lineHeight: 1.5 }}>{parsed.reason}</p>
                </div>
              </div>

              {/* Email card */}
              <div style={{ background: '#fff', border: '1px solid var(--pb-border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--pb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--pb-muted)' }}>Touch {touch} · {campaign}</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="crm-btn" onClick={() => requestDraft(selectedContact, touch, campaign)} style={{ padding: '4px 10px', fontSize: 10 }}><RefreshCw size={10} /> Redo</button>
                    <button className="crm-btn" onClick={() => setEditMode(!editMode)} style={{ padding: '4px 10px', fontSize: 10, ...(editMode ? { background: primary, borderColor: primary, color: '#fff' } : {}) }}><Edit2 size={10} /> {editMode ? 'Preview' : 'Edit'}</button>
                  </div>
                </div>

                {/* Subject */}
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--pb-border)' }}>
                  <p className="crm-label" style={{ marginBottom: 4 }}>Subject</p>
                  {editMode
                    ? <input className="crm-input" style={{ fontSize: 12 }} value={editedSubject} onChange={e => setEditedSubject(e.target.value)} />
                    : <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--pb-text)' }}>{parsed.subject}</p>
                  }
                </div>

                {/* Body */}
                <div style={{ padding: '10px 12px' }}>
                  <p className="crm-label" style={{ marginBottom: 6 }}>Body</p>
                  {editMode
                    ? <textarea className="crm-textarea" style={{ minHeight: 160, fontSize: 12 }} value={editedBody} onChange={e => setEditedBody(e.target.value)} />
                    : <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--pb-text)', whiteSpace: 'pre-wrap' }}>{parsed.body}</div>
                  }
                </div>
              </div>

              {/* Follow-up note */}
              {parsed.followUp && (
                <div style={{ padding: '9px 12px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #86efac' }}>
                  <p style={{ margin: '0 0 2px', fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Rep Note</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#166534', lineHeight: 1.6 }}>{parsed.followUp}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="crm-btn crm-btn-primary" onClick={openInEmail} style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800 }}>
                  <ExternalLink size={14} /> Open in Email
                </button>
                <button className="crm-btn" onClick={copyDraft} style={{ padding: '10px 14px', borderRadius: 10 }}>
                  {copied ? <Check size={14} color="#3CDB7A" /> : <Copy size={14} />}
                </button>
                {touch < 3 && (
                  <button className="crm-btn" onClick={() => { const n = touch + 1; setTouch(n); requestDraft(selectedContact, n, campaign) }} style={{ padding: '10px 12px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12 }}>
                    T{touch + 1} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="crm-shell" style={vars}>
      <style>{CSS(primary)}</style>
      {showAddModal && <AddProspectModal school={school} onClose={() => setShowAddModal(false)} onAdd={(ct) => setNewProspects(prev => [ct, ...prev])} />}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 5 }}>CRM · {school.short || school.name}</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: 'var(--pb-text)', margin: 0, letterSpacing: '-0.02em' }}>Sales Pipeline</h2>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}><Plus size={15} /> Add Prospect</button>
        </div>

        {/* Tabs */}
        <div className="crm-tabs" style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} className={`crm-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setSelectedContact(null); setSearch(''); setShowCold(false); setParsed(null) }}>
                <Icon size={13} />
                {tab.label}
                <span style={{ padding: '1px 7px', borderRadius: 20, background: activeTab === tab.id ? 'rgba(255,255,255,0.22)' : `${primary}15`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: activeTab === tab.id ? '#fff' : primary }}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="crm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'My Queue',  value: stats.queue,     note: 'active contacts' },
            { label: 'Pinned',    value: stats.pinned,    note: 'working now' },
            { label: 'Contacted', value: stats.contacted, note: 'touches sent' },
            { label: 'Cold',      value: stats.cold,      note: 'not yet warm' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', borderRadius: 11, background: '#fff', border: '1px solid var(--pb-border)' }}>
              <p className="crm-label" style={{ marginBottom: 3 }}>{s.label}</p>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 700, color: primary }}>{s.value}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--pb-muted)' }}>{s.note}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} color={primary} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="crm-input" style={{ paddingLeft: 32 }} placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="crm-select" value={camFilter} onChange={e => setCamFilter(e.target.value)}>
            <option value="all">All Campaigns</option>
            {CAMPAIGNS.map(cam => <option key={cam.id} value={cam.id}>{cam.label}</option>)}
          </select>
        </div>

        {/* Two-column layout — always shown */}
        {loadingContacts ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--pb-muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>Loading contacts...</div>
        ) : (
          <div className="crm-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

            {/* Contact list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

              {/* Pinned */}
              {pinned.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, paddingBottom: 6, borderBottom: `2px solid ${primary}25` }}>
                    <Pin size={10} color={primary} fill={primary} />
                    <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pinned</p>
                    <span style={{ padding: '1px 7px', borderRadius: 20, background: `${primary}15`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: primary, fontWeight: 700 }}>{pinned.length}</span>
                  </div>
                  {pinned.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                  <div style={{ height: 1, background: 'var(--pb-border)', margin: '6px 0 10px' }} />
                </>
              )}

              {/* Active queue */}
              {queue.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, paddingBottom: 6, borderBottom: '2px solid #3CDB7A25' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3CDB7A' }} />
                    <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: '#3CDB7A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Queue</p>
                    <span style={{ padding: '1px 7px', borderRadius: 20, background: '#3CDB7A15', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3CDB7A', fontWeight: 700 }}>{queue.length}</span>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-muted)' }}>Hot & warm contacts</p>
                  </div>
                  {queue.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                </>
              )}

              {pinned.length === 0 && queue.length === 0 && !loadingContacts && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--pb-muted)', fontSize: 13 }}>No active contacts. Show cold contacts below to get started.</div>
              )}

              {/* Cold toggle */}
              {cold.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button className="cold-toggle" onClick={() => setShowCold(!showCold)}>
                    {showCold ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {showCold ? 'Hide' : 'Show'} {cold.length} cold contacts
                  </button>
                  {showCold && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                      <p style={{ margin: '0 0 6px', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--pb-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Pin contacts to move them into your active queue
                      </p>
                      {cold.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel — always visible */}
            <div className={`crm-panel${selectedContact ? ' has-contact' : ''}`} style={{
              position: 'sticky', top: 16,
              background: '#fff', border: '1px solid var(--pb-border)',
              borderRadius: 16, overflow: 'hidden',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex', flexDirection: 'column',
            }}>
              {renderPanel()}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
