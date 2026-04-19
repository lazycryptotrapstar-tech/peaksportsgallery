import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { useUser } from '../../context/UserContext'
import {
  ShoppingCart, Trophy, Star, Users, Edit2,
  RefreshCw, ExternalLink, Zap, ChevronRight, Search,
  Plus, X, UserPlus, Building2, Ticket, Users2, Pin,
  ChevronDown, ChevronUp, MousePointerClick, Copy, Check,
  TrendingUp
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'

// ── Silent activity logger ────────────────────────────────────────────────────
const logActivity = async ({ schoolId, userId, action, contactId, contactName, metadata }) => {
  try {
    await supabase.from('activity_log').insert([{
      school_id:    schoolId,
      user_id:      userId,
      action,
      contact_id:   contactId   || null,
      contact_name: contactName || null,
      metadata:     metadata    || null,
      created_at:   new Date().toISOString(),
    }])
  } catch (e) { /* silent — never block the UI */ }
}

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

const SCORE_COLOR  = (s) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626'
const SCORE_BG     = (s) => s >= 80 ? '#dcfce7' : s >= 60 ? '#fef3c7' : '#fee2e2'
const STATUS_COLOR = (status) => status === 'hot' ? '#16a34a' : status === 'warm' ? '#d97706' : '#94a3b8'

const CAMPAIGNS = [
  { id: 'TICKETS',     label: 'Ticket Sales',   icon: ShoppingCart },
  { id: 'SPONSORSHIP', label: 'Sponsorship',     icon: Trophy       },
  { id: 'HOSPITALITY', label: 'Hospitality',     icon: Star         },
  { id: 'ALUMNI',      label: 'Alumni Outreach', icon: Users        },
]

const TABS = [
  { id: 'tickets',   label: 'Ticket Holders', icon: Ticket    },
  { id: 'prospects', label: 'Prospects',       icon: Building2 },
  { id: 'groups',    label: 'Group Buyers',    icon: Users2    },
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
  .crm-shell { background:var(--pb-bg); min-height:100%; font-family:'Geist','Geist',sans-serif; color:var(--pb-text); }

  .crm-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text2); cursor:pointer; font-size:12px; font-family:'Geist',sans-serif; font-weight:600; transition:all 0.12s; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
  .crm-btn:hover { border-color:${primary}66; color:${primary}; background:#fff; }
  .crm-btn-primary { background:${primary}; border-color:${primary}; color:#fff !important; box-shadow:0 2px 8px ${primary}40; }
  .crm-btn-primary:hover { opacity:0.9; box-shadow:0 4px 12px ${primary}50; }

  .crm-label { font-family:'Geist Mono',monospace; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:var(--pb-muted); font-weight:600; }

  .crm-input { width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-text); font-size:13px; font-family:'Geist',sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.12s, box-shadow 0.12s; }
  .crm-input:focus { border-color:${primary}; box-shadow:0 0 0 3px ${primary}18; }

  .crm-textarea { width:100%; min-height:72px; padding:9px 12px; border-radius:8px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-text); font-size:13px; font-family:'Geist',sans-serif; outline:none; box-sizing:border-box; resize:vertical; line-height:1.6; transition:border-color 0.12s, box-shadow 0.12s; }
  .crm-textarea:focus { border-color:${primary}; box-shadow:0 0 0 3px ${primary}18; }

  .crm-select { padding:8px 12px; border-radius:8px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-text); font-size:12px; font-family:'Geist Mono',monospace; outline:none; cursor:pointer; box-sizing:border-box; transition:border-color 0.12s; }
  .crm-select:focus { border-color:${primary}; }

  .crm-row { display:flex; align-items:center; padding:10px 12px 10px 0; border-radius:10px; border:1px solid var(--pb-border); background:#fff; cursor:pointer; transition:all 0.12s; gap:10px; width:100%; text-align:left; position:relative; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
  .crm-row::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--row-status-color, #e2e8f0); border-radius:10px 0 0 10px; transition:all 0.12s; }
  .crm-row:hover { border-color:${primary}44; box-shadow:0 2px 8px rgba(0,0,0,0.06); transform:translateY(-1px); }
  .crm-row:hover::before { background:${primary}; }
  .crm-row.active { border-color:${primary}66; background:#fff; box-shadow:0 2px 12px ${primary}20; }
  .crm-row.active::before { background:${primary}; }
  .crm-row.pinned::before { background:${primary}; }

  .crm-avatar { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Geist',sans-serif; font-weight:800; font-size:12px; flex-shrink:0; margin-left:12px; }

  .crm-score { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Geist Mono',monospace; font-size:11px; font-weight:700; flex-shrink:0; }

  .crm-touch-btn { width:36px; height:36px; border-radius:8px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-muted); cursor:pointer; font-weight:700; font-size:13px; transition:all 0.12s; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
  .crm-touch-btn:hover { border-color:${primary}44; }
  .crm-touch-btn.active { background:${primary}; border-color:${primary}; color:#fff; box-shadow:0 2px 6px ${primary}40; }

  .crm-cam-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-muted); cursor:pointer; font-family:'Geist Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.12s; }
  .crm-cam-pill:hover { border-color:${primary}44; color:${primary}; }
  .crm-cam-pill.active { background:${primary}; border-color:${primary}; color:#fff; box-shadow:0 2px 6px ${primary}30; }

  .crm-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .crm-modal { background:#fff; border-radius:16px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.06); }

  .crm-tab { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:8px; border:1px solid var(--pb-border); background:#fff; color:var(--pb-muted); cursor:pointer; font-family:'Geist',sans-serif; font-size:13px; font-weight:600; transition:all 0.12s; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
  .crm-tab.active { background:${primary}; border-color:${primary}; color:#fff; box-shadow:0 2px 8px ${primary}40; }
  .crm-tab:not(.active):hover { border-color:${primary}44; color:${primary}; }

  .pin-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:5px; display:flex; align-items:center; justify-content:center; transition:all 0.12s; opacity:0.25; flex-shrink:0; margin-left:8px; }
  .pin-btn:hover,.pin-btn.pinned { opacity:1; }

  .cold-toggle { display:flex; align-items:center; gap:8px; padding:9px 14px; border-radius:8px; border:1px dashed var(--pb-border); background:transparent; color:var(--pb-muted); cursor:pointer; font-family:'Geist Mono',monospace; font-size:9.5px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; width:100%; transition:all 0.12s; }
  .cold-toggle:hover { border-color:${primary}44; color:${primary}; background:${primary}05; }

  .stat-card { padding:16px 18px; border-radius:12px; background:#fff; border:1px solid var(--pb-border); box-shadow:0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03); position:relative; overflow:hidden; }
  .stat-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:${primary}; border-radius:12px 0 0 12px; }

  .section-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-bottom:8px; }

  .gen-btn-loading { animation:gen-pulse 1.5s ease-in-out infinite; }
  @keyframes gen-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
  @keyframes crm-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .draft-appear { animation:fadeSlideIn 0.25s ease both; }

  @media (max-width:900px) {
    .crm-layout { grid-template-columns:1fr !important; }
    .crm-panel { display:none !important; }
    .crm-panel.has-contact { display:flex !important; position:fixed !important; inset:auto 0 0 0 !important; border-radius:20px 20px 0 0 !important; max-height:82vh !important; overflow-y:auto !important; z-index:100; flex-direction:column; }
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
            width: 19, height: 19, borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Geist Mono',monospace", fontSize: 8, fontWeight: 700,
            background: done ? '#dcfce7' : '#f1f5f9',
            border: done ? '1px solid #86efac' : '1px solid #e2e8f0',
            color: done ? '#16a34a' : '#94a3b8',
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
      const newId = data?.[0]?.id
      onAdd({ ...newContact, id: newId || `temp-${Date.now()}`, sport: form.sport, last_year: 0 })
      // Log contact added — fire and forget
      if (newId) {
        supabase.from('activity_log').insert([{
          school_id: school.id, user_id: null,
          action: 'contact_added', contact_id: newId, contact_name: form.name.trim(),
          created_at: new Date().toISOString(),
        }]).then(() => {})
      }
      onClose()
    } catch (err) { setError('Could not save — check Supabase connection'); console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div className="crm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 4 }}>New Prospect</p>
            <h3 style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Add Contact</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="crm-modal-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><p className="crm-label" style={{ marginBottom: 6 }}>Name *</p><input className="crm-input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><p className="crm-label" style={{ marginBottom: 6 }}>Email</p><input className="crm-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><p className="crm-label" style={{ marginBottom: 6 }}>Phone</p><input className="crm-input" placeholder="(000) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><p className="crm-label" style={{ marginBottom: 6 }}>Organization</p><input className="crm-input" placeholder="Company / Church / School" value={form.organization} onChange={e => set('organization', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p className="crm-label" style={{ marginBottom: 6 }}>Sport</p>
              <select className="crm-select" style={{ width: '100%' }} value={form.sport} onChange={e => set('sport', e.target.value)}>
                <option>Football</option><option>Basketball</option><option>Volleyball</option><option>Multi-Sport</option>
              </select>
            </div>
            <div>
              <p className="crm-label" style={{ marginBottom: 6 }}>Campaign</p>
              <select className="crm-select" style={{ width: '100%' }} value={form.campaign} onChange={e => set('campaign', e.target.value)}>
                {CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div><p className="crm-label" style={{ marginBottom: 6 }}>Notes</p><textarea className="crm-textarea" placeholder="Context for the AI..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0, padding: '8px 12px', background: '#fef2f2', borderRadius: 6 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="crm-btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Saving...' : <><UserPlus size={14} /> Add to Pipeline</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CRM() {
  const { school } = useSchool()
  const { user } = useUser()
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

  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true)
      try {
        const { data, error } = await supabase
          .from('contacts').select('*').eq('school_id', school.id).order('name')
        if (!error && data) setAllContacts(data)
      } catch (e) { console.error(e) }
      finally { setLoadingContacts(false) }
    }
    fetchContacts()
  }, [school.id])

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

  const togglePin = async (e, ct) => {
    e.stopPropagation()
    const newVal = !ct.is_pinned
    setAllContacts(prev => prev.map(c => c.id === ct.id ? { ...c, is_pinned: newVal } : c))
    if (selectedContact?.id === ct.id) setSelectedContact(prev => ({ ...prev, is_pinned: newVal }))
    await supabase.from('contacts').update({ is_pinned: newVal, updated_at: new Date().toISOString() }).eq('id', ct.id)
  }

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
    const pinned   = sorted.filter(ct => ct.is_pinned)
    const unpinned = sorted.filter(ct => !ct.is_pinned)
    const queue    = unpinned.filter(ct => ct.status === 'hot' || ct.status === 'warm')
    const cold     = unpinned.filter(ct => !ct.status || ct.status === 'cold' || ct.status === 'prospect')
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
      logActivity({ schoolId: school.id, userId: user?.id, action: 'draft_generated', contactId: ct.id, contactName: ct.name, metadata: { touch: t, campaign: cam } })
      logActivity({ schoolId: school.id, userId: user?.id, action: `touch_${t}`, contactId: ct.id, contactName: ct.name })
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
    logActivity({ schoolId: school.id, userId: user?.id, action: 'email_opened', contactId: selectedContact?.id, contactName: selectedContact?.name })
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
    try {
      await supabase.from('contacts').update({ notes, updated_at: new Date().toISOString() }).eq('id', selectedContact.id)
      logActivity({ schoolId: school.id, userId: user?.id, action: 'note_saved', contactId: selectedContact?.id, contactName: selectedContact?.name })
    }
    catch (e) { console.error(e) }
    finally { setSavingNotes(false) }
  }

  // Cooler, more neutral enterprise palette
  const vars = {
    '--pb-bg':      '#F7F9FC',
    '--pb-surface': '#FFFFFF',
    '--pb-surface2':'#F1F5F9',
    '--pb-border':  '#E2E8F0',
    '--pb-text':    c.primary || '#0F172A',
    '--pb-text2':   '#334155',
    '--pb-muted':   '#64748B',
  }

  const initials = (name) => (name || '??').split(' ').map(n => n[0]).slice(0, 2).join('')

  // ── Contact row ───────────────────────────────────────────────────────────
  const ContactRow = ({ ct }) => {
    const score    = computeScore(ct)
    const isActive = selectedContact?.id === ct.id
    const subtitle = ct.organization || ct.email || ''
    const statusColor = STATUS_COLOR(ct.status)

    return (
      <button
        className={`crm-row${isActive ? ' active' : ''}${ct.is_pinned ? ' pinned' : ''}`}
        style={{ '--row-status-color': statusColor }}
        onClick={() => {
          setSelectedContact(ct)
          setNotes(ct.notes || '')
          setCampaign(ct.campaign || 'TICKETS')
          setParsed(null)
          setEditMode(false)
          logActivity({ schoolId: school.id, userId: user?.id, action: 'contact_worked', contactId: ct.id, contactName: ct.name })
        }}
      >
        <button className={`pin-btn${ct.is_pinned ? ' pinned' : ''}`} onClick={e => togglePin(e, ct)} title={ct.is_pinned ? 'Unpin' : 'Pin to queue'}>
          <Pin size={12} color={primary} fill={ct.is_pinned ? primary : 'none'} />
        </button>

        {/* Avatar */}
        <div className="crm-avatar" style={{
          background: isActive ? `${primary}15` : '#F1F5F9',
          border: `1px solid ${isActive ? primary + '33' : '#E2E8F0'}`,
          color: isActive ? primary : '#475569',
        }}>
          {initials(ct.name)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>{ct.name}</p>
          <p style={{ margin: '1px 0 0', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
        </div>

        {/* Touch badges */}
        <TouchBadges contactId={ct.id} touchMap={touchMap} />

        {/* Score */}
        <div className="crm-score" style={{
          background: SCORE_BG(score),
          color: SCORE_COLOR(score),
          boxShadow: score >= 80 ? `0 0 8px ${SCORE_COLOR(score)}30` : 'none',
          border: `1px solid ${SCORE_COLOR(score)}30`,
        }}>{score}</div>

        <ChevronRight size={13} color={isActive ? primary : '#CBD5E1'} style={{ flexShrink: 0, marginRight: 10 }} />
      </button>
    )
  }

  // ── Section header ────────────────────────────────────────────────────────
  const SectionHeader = ({ color, label, count, meta }) => (
    <div className="section-header" style={{ borderBottom: `1px solid ${color}22` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <span style={{ padding: '1px 7px', borderRadius: 4, background: `${color}15`, fontFamily: "'Geist Mono',monospace", fontSize: 9, color, fontWeight: 700 }}>{count}</span>
      {meta && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{meta}</p>}
    </div>
  )

  // ── PANEL ─────────────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (!selectedContact) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, gap: 16, padding: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MousePointerClick size={26} color="#CBD5E1" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontFamily: "'Geist',sans-serif", fontWeight: 700, fontSize: 15, color: '#334155' }}>No contact selected</p>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>Select a contact from the list to view details and generate a personalized draft.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {['Pin contacts', 'Generate drafts', 'Track touches'].map(tip => (
            <span key={tip} style={{ padding: '4px 10px', borderRadius: 6, background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: 10, color: '#64748B', fontFamily: "'Geist Mono',monospace", fontWeight: 600 }}>{tip}</span>
          ))}
        </div>
      </div>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', background: c.primary || '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.accent}20`, border: `1px solid ${c.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0 }}>
              {initials(selectedContact.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 15, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact.name}</p>
              <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: `${c.accent}cc`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact.organization || selectedContact.email || ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button className="pin-btn" style={{ opacity: 1 }} onClick={e => togglePin(e, selectedContact)}>
              <Pin size={15} color={selectedContact.is_pinned ? c.accent : 'rgba(255,255,255,0.35)'} fill={selectedContact.is_pinned ? c.accent : 'none'} />
            </button>
            <button onClick={() => { setSelectedContact(null); setParsed(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, borderRadius: 6, transition: 'color 0.12s' }}><X size={15} /></button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div className="crm-score" style={{
              background: SCORE_BG(computeScore(selectedContact)),
              color: SCORE_COLOR(computeScore(selectedContact)),
              border: `1px solid ${SCORE_COLOR(computeScore(selectedContact))}30`,
              boxShadow: computeScore(selectedContact) >= 80 ? `0 0 12px ${SCORE_COLOR(computeScore(selectedContact))}25` : 'none',
              width: 40, height: 40, fontSize: 13,
            }}>{computeScore(selectedContact)}</div>
            <div style={{ flex: 1 }}>
              <p className="crm-label" style={{ marginBottom: 2 }}>Engagement Score</p>
              <p style={{ margin: 0, fontSize: 12, color: '#334155', fontWeight: 500 }}>
                {selectedContact.contact_type === 'ticket_buyer'
                  ? `${selectedContact.purchase_count || 0} seasons · ${selectedContact.sport || 'Football'}`
                  : CATEGORY_LABEL[selectedContact.business_category] || 'Prospect'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <TouchBadges contactId={selectedContact.id} touchMap={touchMap} />
              {selectedContact.status && (
                <span style={{ padding: '2px 7px', borderRadius: 4, background: STATUS_COLOR(selectedContact.status) + '15', color: STATUS_COLOR(selectedContact.status), fontSize: 9, fontFamily: "'Geist Mono',monospace", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {selectedContact.status}
                </span>
              )}
            </div>
          </div>

          {/* Contact info */}
          {(selectedContact.phone || selectedContact.email) && (
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedContact.phone && (
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#334155', fontWeight: 600 }}>{selectedContact.phone}</p>
              )}
              {selectedContact.email && (
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#64748B' }}>{selectedContact.email}</p>
              )}
            </div>
          )}

          {/* Previous activity */}
          {selectedContact.notes_devin && (
            <div>
              <p className="crm-label" style={{ marginBottom: 6 }}>Previous Activity</p>
              <div style={{ padding: '10px 12px', background: '#fefce8', border: '1px solid #fde047', borderRadius: 8, fontSize: 12, color: '#713f12', lineHeight: 1.65 }}>
                {selectedContact.notes_devin}
              </div>
            </div>
          )}

          {/* Campaign */}
          <div>
            <p className="crm-label" style={{ marginBottom: 8 }}>Campaign</p>
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
            <p className="crm-label" style={{ marginBottom: 8 }}>Sequence Touch</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[1, 2, 3].map(t => (
                <button key={t} className={`crm-touch-btn${touch === t ? ' active' : ''}`} onClick={() => setTouch(t)}>{t}</button>
              ))}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 9, color: '#64748B', marginLeft: 4, fontWeight: 600 }}>
                {touch === 1 ? '· THE MOMENT' : touch === 2 ? '· THE IDENTITY' : '· THE DOOR'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="crm-label" style={{ margin: 0 }}>Call Notes</p>
              {notes !== (selectedContact.notes || '') && (
                <button onClick={saveNotes} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: primary, fontFamily: "'Geist',sans-serif", fontWeight: 700 }}>
                  {savingNotes ? 'Saving...' : '↑ Save'}
                </button>
              )}
            </div>
            <textarea className="crm-textarea" placeholder="Call notes, what they said, context for the AI..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Generate button */}
          <button
            className={`crm-btn crm-btn-primary${drafting ? ' gen-btn-loading' : ''}`}
            onClick={() => requestDraft(selectedContact, touch, campaign)}
            disabled={drafting}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 10, fontFamily: "'Geist',sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            {drafting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: `crm-bounce 1s ${i*0.15}s infinite` }} />)}
                </div>
                Generating draft...
              </div>
            ) : (
              <><Zap size={15} /> Generate Draft</>
            )}
          </button>

          {/* Draft output */}
          {parsed && !drafting && (
            <div className="draft-appear" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Angle tag */}
              <div style={{ padding: '10px 14px', borderRadius: 10, background: `${primary}08`, border: `1px solid ${primary}25`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <TrendingUp size={13} color={primary} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p className="crm-label" style={{ marginBottom: 2, color: primary }}>{parsed.angle}</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#334155', lineHeight: 1.55 }}>{parsed.reason}</p>
                </div>
              </div>

              {/* Email card */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Toolbar */}
                <div style={{ padding: '9px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                  <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>TOUCH {touch} · {campaign}</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="crm-btn" onClick={() => requestDraft(selectedContact, touch, campaign)} style={{ padding: '4px 10px', fontSize: 10 }}><RefreshCw size={10} /> Redo</button>
                    <button className="crm-btn" onClick={() => setEditMode(!editMode)} style={{ padding: '4px 10px', fontSize: 10, ...(editMode ? { background: primary, borderColor: primary, color: '#fff' } : {}) }}><Edit2 size={10} /> {editMode ? 'Preview' : 'Edit'}</button>
                  </div>
                </div>

                {/* Subject */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                  <p className="crm-label" style={{ marginBottom: 5 }}>Subject Line</p>
                  {editMode
                    ? <input className="crm-input" style={{ fontSize: 13 }} value={editedSubject} onChange={e => setEditedSubject(e.target.value)} />
                    : <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{parsed.subject}</p>
                  }
                </div>

                {/* Body */}
                <div style={{ padding: '12px 14px' }}>
                  <p className="crm-label" style={{ marginBottom: 8 }}>Email Body</p>
                  {editMode
                    ? <textarea className="crm-textarea" style={{ minHeight: 180, fontSize: 13 }} value={editedBody} onChange={e => setEditedBody(e.target.value)} />
                    : <div style={{ fontSize: 13, lineHeight: 1.85, color: '#1e293b', whiteSpace: 'pre-wrap' }}>{parsed.body}</div>
                  }
                </div>
              </div>

              {/* Rep note */}
              {parsed.followUp && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: '0 0 3px', fontFamily: "'Geist Mono',monospace", fontSize: 8.5, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Rep Note</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#166534', lineHeight: 1.6 }}>{parsed.followUp}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="crm-btn crm-btn-primary" onClick={openInEmail} style={{ flex: 1, justifyContent: 'center', padding: '11px', borderRadius: 10, fontFamily: "'Geist',sans-serif", fontSize: 13, fontWeight: 800 }}>
                  <ExternalLink size={14} /> Open in Email
                </button>
                <button className="crm-btn" onClick={copyDraft} style={{ padding: '11px 14px', borderRadius: 10 }} title="Copy to clipboard">
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
                {touch < 3 && (
                  <button className="crm-btn" onClick={() => { const n = touch + 1; setTouch(n); requestDraft(selectedContact, n, campaign) }} style={{ padding: '11px 12px', borderRadius: 10, fontFamily: "'Geist',sans-serif", fontWeight: 700, fontSize: 12, gap: 4 }}>
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

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="crm-label" style={{ marginBottom: 6 }}>CRM · {school.short || school.name}</p>
            <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>Sales Pipeline</h2>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '10px 18px' }}>
            <Plus size={15} /> Add Prospect
          </button>
        </div>

        {/* Tabs */}
        <div className="crm-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} className={`crm-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setSelectedContact(null); setSearch(''); setShowCold(false); setParsed(null) }}>
                <Icon size={13} />
                {tab.label}
                <span style={{ padding: '1px 7px', borderRadius: 4, background: activeTab === tab.id ? 'rgba(255,255,255,0.22)' : '#F1F5F9', fontFamily: "'Geist Mono',monospace", fontSize: 9, fontWeight: 700, color: activeTab === tab.id ? '#fff' : '#64748B' }}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="crm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'My Queue',  value: stats.queue,     note: 'active contacts' },
            { label: 'Pinned',    value: stats.pinned,    note: 'priority' },
            { label: 'Contacted', value: stats.contacted, note: 'touches sent' },
            { label: 'Cold',      value: stats.cold,      note: 'not yet warm' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="crm-label" style={{ marginBottom: 6 }}>{s.label}</p>
              <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 28, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#94a3b8', fontFamily: "'Geist',sans-serif" }}>{s.note}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="crm-input" style={{ paddingLeft: 34 }} placeholder="Search by name, email, or organization..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="crm-select" value={camFilter} onChange={e => setCamFilter(e.target.value)}>
            <option value="all">All Campaigns</option>
            {CAMPAIGNS.map(cam => <option key={cam.id} value={cam.id}>{cam.label}</option>)}
          </select>
        </div>

        {loadingContacts ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: primary, animation: `crm-bounce 1s ${i*0.15}s infinite` }} />)}
            </div>
            <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loading contacts</p>
          </div>
        ) : (
          <div className="crm-layout" style={{ display: 'grid', gridTemplateColumns: parsed ? '380px 1fr' : '1fr 460px', gap: 16, alignItems: 'start' }}>

            {/* Contact list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

              {pinned.length > 0 && (
                <>
                  <SectionHeader color={primary} label="Pinned" count={pinned.length} />
                  {pinned.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                  <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0 12px' }} />
                </>
              )}

              {queue.length > 0 && (
                <>
                  <SectionHeader color="#16a34a" label="Active Queue" count={queue.length} meta="Hot & warm contacts" />
                  {queue.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                </>
              )}

              {pinned.length === 0 && queue.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155', fontSize: 14 }}>Queue is empty</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Show cold contacts below to start warming them up.</p>
                </div>
              )}

              {cold.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <button className="cold-toggle" onClick={() => setShowCold(!showCold)}>
                    {showCold ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showCold ? 'Hide' : 'Show'} {cold.length} cold contacts
                    {!showCold && <span style={{ marginLeft: 'auto', opacity: 0.6 }}>Pin to activate →</span>}
                  </button>
                  {showCold && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                      {cold.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className={`crm-panel${selectedContact ? ' has-contact' : ''}`} style={{
              position: 'sticky', top: 16,
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              overflow: 'hidden',
              height: 'calc(100vh - 100px)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
            }}>
              {renderPanel()}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
