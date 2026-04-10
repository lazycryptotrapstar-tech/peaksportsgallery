import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../../context/UserContext'
import {
  ShoppingCart, Trophy, Star, Users, Edit2, RefreshCw,
  ExternalLink, Zap, ChevronRight, Search, Plus, X,
  UserPlus, Pin, ChevronDown, ChevronUp, MousePointerClick,
  Copy, Check, Building2, TrendingUp
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/peak-outreach'

const CAMPAIGN_TYPES = [
  { id: 'CLIENT_UPDATE',  label: 'Client Update',   desc: 'Progress update to a school or rep',      icon: Users      },
  { id: 'PARTNER_REACH',  label: 'Partner Reach',   desc: 'Outreach to a partner or vendor',         icon: Trophy     },
  { id: 'PROSPECT_INTRO', label: 'Prospect Intro',  desc: 'First contact with a prospective school', icon: Star       },
  { id: 'TEAM_INTERNAL',  label: 'Team / Internal', desc: 'Message to a colleague or stakeholder',   icon: ShoppingCart },
]

const TOUCH_LABELS = { 1: 'The Moment', 2: 'The Identity', 3: 'The Door' }

const parseDraft = (raw) => {
  if (!raw) return { subject: '', body: '' }
  const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i)
  const bodyMatch    = raw.match(/BODY:\s*([\s\S]+)/i)
  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    body:    bodyMatch    ? bodyMatch[1].trim()    : raw.trim(),
  }
}

const CSS = () => `
  .eo-shell { background:#F7F9FC; min-height:100%; font-family:'DM Sans',sans-serif; color:#0F172A; }
  .eo-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:1px solid #E2E8F0; background:#fff; color:#334155; cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.12s; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
  .eo-btn:hover { border-color:#EFA02066; color:#EFA020; }
  .eo-btn-primary { background:#EFA020; border-color:#EFA020; color:#fff !important; box-shadow:0 2px 8px #EFA02040; }
  .eo-btn-primary:hover { opacity:0.9; }
  .eo-label { font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:#64748B; font-weight:600; }
  .eo-input { width:100%; padding:9px 12px; border-radius:8px; border:1px solid #E2E8F0; background:#fff; color:#0F172A; font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.12s, box-shadow 0.12s; }
  .eo-input:focus { border-color:#EFA020; box-shadow:0 0 0 3px #EFA02018; }
  .eo-textarea { width:100%; min-height:72px; padding:9px 12px; border-radius:8px; border:1px solid #E2E8F0; background:#fff; color:#0F172A; font-size:13px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; resize:vertical; line-height:1.6; }
  .eo-textarea:focus { border-color:#EFA020; box-shadow:0 0 0 3px #EFA02018; }
  .eo-row { display:flex; align-items:center; padding:10px 12px 10px 0; border-radius:10px; border:1px solid #E2E8F0; background:#fff; cursor:pointer; transition:all 0.12s; gap:10px; width:100%; text-align:left; position:relative; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
  .eo-row::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#E2E8F0; border-radius:10px 0 0 10px; transition:background 0.12s; }
  .eo-row:hover { border-color:#EFA02044; box-shadow:0 2px 8px rgba(0,0,0,0.06); transform:translateY(-1px); }
  .eo-row:hover::before { background:#EFA020; }
  .eo-row.active { border-color:#EFA02066; box-shadow:0 2px 12px #EFA02020; }
  .eo-row.active::before { background:#EFA020; }
  .eo-row.pinned::before { background:#EFA020; }
  .eo-cam-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; border:1px solid #E2E8F0; background:#fff; color:#64748B; cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.12s; }
  .eo-cam-pill:hover { border-color:#EFA02044; color:#EFA020; }
  .eo-cam-pill.active { background:#EFA020; border-color:#EFA020; color:#fff; }
  .eo-touch-btn { width:36px; height:36px; border-radius:8px; border:1px solid #E2E8F0; background:#fff; color:#64748B; cursor:pointer; font-weight:700; font-size:13px; transition:all 0.12s; }
  .eo-touch-btn.active { background:#EFA020; border-color:#EFA020; color:#fff; box-shadow:0 2px 6px #EFA02040; }
  .eo-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .eo-modal { background:#fff; border-radius:16px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.18); border:1px solid rgba(0,0,0,0.06); }
  .eo-tab { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:8px; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; transition:all 0.12s; white-space:nowrap; }
  .eo-tab.active { background:#EFA020; border-color:#EFA020; color:#fff; box-shadow:0 2px 8px #EFA02040; }
  .eo-tab:not(.active):hover { border-color:#EFA02044; color:#EFA020; }
  .pin-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:5px; display:flex; align-items:center; justify-content:center; transition:all 0.12s; opacity:0.25; flex-shrink:0; margin-left:8px; }
  .pin-btn:hover,.pin-btn.pinned { opacity:1; }
  .cold-toggle { display:flex; align-items:center; gap:8px; padding:9px 14px; border-radius:8px; border:1px dashed #E2E8F0; background:transparent; color:#64748B; cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; width:100%; transition:all 0.12s; }
  .cold-toggle:hover { border-color:#EFA02044; color:#EFA020; }
  .gen-btn-loading { animation:gen-pulse 1.5s ease-in-out infinite; }
  @keyframes gen-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
  @keyframes eo-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .draft-appear { animation:fadeIn 0.25s ease both; }
  @media(max-width:900px) {
    .eo-layout { grid-template-columns:1fr !important; }
    .eo-panel { display:none !important; }
    .eo-panel.has-contact { display:flex !important; position:fixed !important; inset:auto 0 0 0 !important; border-radius:20px 20px 0 0 !important; max-height:82vh !important; overflow-y:auto !important; z-index:100; flex-direction:column; }
  }
`

const primary = '#EFA020'

function AddContactModal({ onClose, onAdd, userId }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', title: '', organization: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      const record = {
        name:         form.name.trim(),
        email:        form.email.trim() || null,
        phone:        form.phone.trim() || null,
        title:        form.title.trim() || null,
        organization: form.organization.trim() || null,
        notes:        form.notes.trim() || null,
        contact_type: 'prospect',
        is_pinned:    false,
        created_by:   userId,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }
      const { data, error: err } = await supabase.from('peak_contacts').insert([record]).select()
      if (err) throw err
      onAdd({ ...record, id: data?.[0]?.id || `temp-${Date.now()}` })
      onClose()
    } catch (err) { setError('Could not save — check connection'); console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div className="eo-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="eo-modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="eo-label" style={{ marginBottom: 4 }}>New Contact</p>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Add Contact</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><p className="eo-label" style={{ marginBottom: 5 }}>Name *</p><input className="eo-input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><p className="eo-label" style={{ marginBottom: 5 }}>Title</p><input className="eo-input" placeholder="CEO, AD, etc." value={form.title} onChange={e => set('title', e.target.value)} /></div>
          </div>
          <div><p className="eo-label" style={{ marginBottom: 5 }}>Organization</p><input className="eo-input" placeholder="School, company, or department" value={form.organization} onChange={e => set('organization', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><p className="eo-label" style={{ marginBottom: 5 }}>Email</p><input className="eo-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><p className="eo-label" style={{ marginBottom: 5 }}>Phone</p><input className="eo-input" placeholder="(000) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          </div>
          <div><p className="eo-label" style={{ marginBottom: 5 }}>Notes</p><textarea className="eo-textarea" placeholder="Context, relationship notes, how you know them..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0, padding: '8px 12px', background: '#fef2f2', borderRadius: 6 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="eo-btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="eo-btn eo-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Saving...' : <><UserPlus size={14} /> Add Contact</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExecutiveOutreach() {
  const { user } = useUser()

  const [contacts,       setContacts]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [campaign,       setCampaign]       = useState('CLIENT_UPDATE')
  const [touch,          setTouch]          = useState(1)
  const [notes,          setNotes]          = useState('')
  const [savingNotes,    setSavingNotes]    = useState(false)
  const [parsed,         setParsed]         = useState(null)
  const [drafting,       setDrafting]       = useState(false)
  const [editMode,       setEditMode]       = useState(false)
  const [editedSubject,  setEditedSubject]  = useState('')
  const [editedBody,     setEditedBody]     = useState('')
  const [search,         setSearch]         = useState('')
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [showCold,       setShowCold]       = useState(false)
  const [copied,         setCopied]         = useState(false)
  const [newContacts,    setNewContacts]    = useState([])

  // ── Fetch peak_contacts ───────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await supabase.from('peak_contacts').select('*').order('name')
        if (data) setContacts(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  // ── Pin ───────────────────────────────────────────────────────────────
  const togglePin = async (e, ct) => {
    e.stopPropagation()
    const newVal = !ct.is_pinned
    setContacts(prev => prev.map(c => c.id === ct.id ? { ...c, is_pinned: newVal } : c))
    setNewContacts(prev => prev.map(c => c.id === ct.id ? { ...c, is_pinned: newVal } : c))
    if (selectedContact?.id === ct.id) setSelectedContact(prev => ({ ...prev, is_pinned: newVal }))
    await supabase.from('peak_contacts').update({ is_pinned: newVal }).eq('id', ct.id)
  }

  // ── Save notes ────────────────────────────────────────────────────────
  const saveNotes = async () => {
    if (!selectedContact) return
    setSavingNotes(true)
    try { await supabase.from('peak_contacts').update({ notes, updated_at: new Date().toISOString() }).eq('id', selectedContact.id) }
    catch (e) { console.error(e) }
    finally { setSavingNotes(false) }
  }

  // ── All contacts merged ───────────────────────────────────────────────
  const allContacts = [...newContacts, ...contacts.filter(c => !newContacts.find(n => n.id === c.id))]

  const filtered = allContacts.filter(ct => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (ct.name || '').toLowerCase().includes(q) ||
           (ct.organization || '').toLowerCase().includes(q) ||
           (ct.email || '').toLowerCase().includes(q)
  })

  const pinned = filtered.filter(ct => ct.is_pinned)
  const unpinned = filtered.filter(ct => !ct.is_pinned)
  const active = unpinned.filter(ct => ct.contact_type !== 'cold')
  const cold   = unpinned.filter(ct => ct.contact_type === 'cold')

  // ── Generate draft ────────────────────────────────────────────────────
  const requestDraft = async (ct, t, cam) => {
    setDrafting(true); setParsed(null); setEditMode(false)
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id:         user?.id,
          campaign_type:   cam,
          contact_name:    ct.name,
          contact_title:   ct.title   || '',
          contact_company: ct.organization || '',
          context:         notes || ct.notes || '',
          touch:           t,
        }),
      })
      const data = await res.json()
      const raw  = data.draft || data.body || data.text || ''
      const p    = parseDraft(raw)
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
    } catch {
      setParsed({ subject: 'Connection Error', body: 'Could not connect to the workflow. Check the n8n webhook.' })
    } finally { setDrafting(false) }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode ? editedSubject : parsed?.subject || '')
    const body = encodeURIComponent(editMode ? editedBody   : parsed?.body    || '')
    window.open(`mailto:${selectedContact?.email}?subject=${subj}&body=${body}`)
  }

  const copyDraft = () => {
    const full = `Subject: ${editMode ? editedSubject : parsed?.subject}\n\n${editMode ? editedBody : parsed?.body}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = (name) => (name || '??').split(' ').map(n => n[0]).slice(0, 2).join('')

  // ── Contact row ───────────────────────────────────────────────────────
  const ContactRow = ({ ct }) => {
    const isActive = selectedContact?.id === ct.id
    const subtitle = ct.title && ct.organization ? `${ct.title} · ${ct.organization}` : ct.organization || ct.email || 'No details'
    return (
      <button
        className={`eo-row${isActive ? ' active' : ''}${ct.is_pinned ? ' pinned' : ''}`}
        onClick={() => { setSelectedContact(ct); setNotes(ct.notes || ''); setParsed(null); setEditMode(false) }}
      >
        <button className={`pin-btn${ct.is_pinned ? ' pinned' : ''}`} onClick={e => togglePin(e, ct)}>
          <Pin size={12} color={primary} fill={ct.is_pinned ? primary : 'none'} />
        </button>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: isActive ? `${primary}18` : '#F1F5F9', border: `1px solid ${isActive ? primary + '33' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: isActive ? primary : '#475569', flexShrink: 0 }}>
          {initials(ct.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.name}</p>
          <p style={{ margin: '1px 0 0', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
        </div>
        <ChevronRight size={13} color={isActive ? primary : '#CBD5E1'} style={{ flexShrink: 0, marginRight: 10 }} />
      </button>
    )
  }

  // ── Panel ─────────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (!selectedContact) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, gap: 16, padding: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MousePointerClick size={26} color="#CBD5E1" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#334155' }}>Select a contact</p>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>Pick a contact to draft an email in your voice.</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Pin contacts', 'Your voice', 'Inline draft'].map(tip => (
            <span key={tip} style={{ padding: '4px 10px', borderRadius: 6, background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: 10, color: '#64748B', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{tip}</span>
          ))}
        </div>
      </div>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', background: '#152E10', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${primary}20`, border: `1px solid ${primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0 }}>
              {initials(selectedContact.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact.name}</p>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: `${primary}cc`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedContact.title && selectedContact.organization ? `${selectedContact.title} · ${selectedContact.organization}` : selectedContact.organization || selectedContact.email || ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button className="pin-btn" style={{ opacity: 1 }} onClick={e => togglePin(e, selectedContact)}>
              <Pin size={15} color={selectedContact.is_pinned ? primary : 'rgba(255,255,255,0.35)'} fill={selectedContact.is_pinned ? primary : 'none'} />
            </button>
            <button onClick={() => { setSelectedContact(null); setParsed(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}><X size={15} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Contact info */}
          {(selectedContact.phone || selectedContact.email) && (
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedContact.phone && <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#334155', fontWeight: 600 }}>{selectedContact.phone}</p>}
              {selectedContact.email && <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#64748B' }}>{selectedContact.email}</p>}
            </div>
          )}

          {/* Campaign type */}
          <div>
            <p className="eo-label" style={{ marginBottom: 8 }}>Campaign Type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {CAMPAIGN_TYPES.map(cam => {
                const Icon = cam.icon
                return (
                  <button key={cam.id} className={`eo-cam-pill${campaign === cam.id ? ' active' : ''}`} onClick={() => setCampaign(cam.id)}>
                    <Icon size={9} /> {cam.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Touch */}
          <div>
            <p className="eo-label" style={{ marginBottom: 8 }}>Touch</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[1, 2, 3].map(t => (
                <button key={t} className={`eo-touch-btn${touch === t ? ' active' : ''}`} onClick={() => setTouch(t)}>{t}</button>
              ))}
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#64748B', marginLeft: 4, fontWeight: 600 }}>
                · {TOUCH_LABELS[touch]?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Context / notes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="eo-label" style={{ margin: 0 }}>Context & Notes</p>
              {notes !== (selectedContact.notes || '') && (
                <button onClick={saveNotes} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: primary, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
                  {savingNotes ? 'Saving...' : '↑ Save'}
                </button>
              )}
            </div>
            <textarea className="eo-textarea" placeholder="What's the purpose? What do you want them to know or do? Any relationship context..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Generate */}
          <button
            className={`eo-btn eo-btn-primary${drafting ? ' gen-btn-loading' : ''}`}
            onClick={() => requestDraft(selectedContact, touch, campaign)}
            disabled={drafting}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800 }}
          >
            {drafting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: `eo-bounce 1s ${i*0.15}s infinite` }} />)}
                </div>
                Generating draft...
              </div>
            ) : (
              <><Zap size={15} /> Generate Draft</>
            )}
          </button>

          {/* Draft */}
          {parsed && !drafting && (
            <div className="draft-appear" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '9px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
                  <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>TOUCH {touch} · {campaign.replace('_', ' ')}</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="eo-btn" onClick={() => requestDraft(selectedContact, touch, campaign)} style={{ padding: '4px 10px', fontSize: 10 }}><RefreshCw size={10} /> Redo</button>
                    <button className="eo-btn" onClick={() => setEditMode(!editMode)} style={{ padding: '4px 10px', fontSize: 10, ...(editMode ? { background: primary, borderColor: primary, color: '#fff' } : {}) }}><Edit2 size={10} /> {editMode ? 'Preview' : 'Edit'}</button>
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                  <p className="eo-label" style={{ marginBottom: 5 }}>Subject Line</p>
                  {editMode
                    ? <input className="eo-input" style={{ fontSize: 13 }} value={editedSubject} onChange={e => setEditedSubject(e.target.value)} />
                    : <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{parsed.subject}</p>
                  }
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p className="eo-label" style={{ marginBottom: 8 }}>Email Body</p>
                  {editMode
                    ? <textarea className="eo-textarea" style={{ minHeight: 180, fontSize: 13 }} value={editedBody} onChange={e => setEditedBody(e.target.value)} />
                    : <div style={{ fontSize: 13, lineHeight: 1.85, color: '#1e293b', whiteSpace: 'pre-wrap' }}>{parsed.body}</div>
                  }
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="eo-btn eo-btn-primary" onClick={openInEmail} style={{ flex: 1, justifyContent: 'center', padding: '11px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800 }}>
                  <ExternalLink size={14} /> Open in Email
                </button>
                <button className="eo-btn" onClick={copyDraft} style={{ padding: '11px 14px', borderRadius: 10 }} title="Copy">
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
                {touch < 3 && (
                  <button className="eo-btn" onClick={() => { const n = touch + 1; setTouch(n); requestDraft(selectedContact, n, campaign) }} style={{ padding: '11px 12px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, gap: 4 }}>
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

  return (
    <div className="eo-shell">
      <style>{CSS()}</style>
      {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} onAdd={ct => setNewContacts(prev => [ct, ...prev])} userId={user?.id} />}

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="eo-label" style={{ marginBottom: 5 }}>Executive Outreach · Peak Sports MGMT</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>My Outreach</h2>
          </div>
          <button className="eo-btn eo-btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '10px 18px' }}>
            <Plus size={15} /> Add Contact
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Contacts', value: allContacts.length,   note: 'in your list' },
            { label: 'Pinned',         value: pinned.length,         note: 'working now' },
            { label: 'Active',         value: active.length + pinned.length, note: 'warm contacts' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 11, border: '1px solid #E2E8F0', padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: primary, borderRadius: '11px 0 0 11px' }} />
              <p className="eo-label" style={{ marginBottom: 4 }}>{s.label}</p>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#94a3b8' }}>{s.note}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="eo-input" style={{ paddingLeft: 34 }} placeholder="Search by name, organization, or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Two-column layout */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: primary, animation: `eo-bounce 1s ${i*0.15}s infinite` }} />)}
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#94a3b8' }}>Loading contacts</p>
          </div>
        ) : (
          <div className="eo-layout" style={{ display: 'grid', gridTemplateColumns: parsed ? '380px 1fr' : '1fr 460px', gap: 16, alignItems: 'start' }}>

            {/* Contact list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

              {/* Pinned */}
              {pinned.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, paddingBottom: 6, borderBottom: `2px solid ${primary}25` }}>
                    <Pin size={10} color={primary} fill={primary} />
                    <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pinned</p>
                    <span style={{ padding: '1px 7px', borderRadius: 4, background: `${primary}15`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: primary, fontWeight: 700 }}>{pinned.length}</span>
                  </div>
                  {pinned.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                  <div style={{ height: 1, background: '#E2E8F0', margin: '6px 0 10px' }} />
                </>
              )}

              {/* Active contacts */}
              {active.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, paddingBottom: 6, borderBottom: '2px solid #16a34a25' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                    <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contacts</p>
                    <span style={{ padding: '1px 7px', borderRadius: 4, background: '#dcfce7', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#16a34a', fontWeight: 700 }}>{active.length}</span>
                  </div>
                  {active.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                </>
              )}

              {/* Empty state */}
              {pinned.length === 0 && active.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <Building2 size={28} color="#E2E8F0" style={{ marginBottom: 10 }} />
                  <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155', fontSize: 14 }}>No contacts yet</p>
                  <p style={{ margin: '0 0 16px', fontSize: 12, color: '#94a3b8' }}>Add contacts to start generating outreach in your voice.</p>
                  <button className="eo-btn eo-btn-primary" onClick={() => setShowAddModal(true)} style={{ justifyContent: 'center' }}>
                    <Plus size={13} /> Add First Contact
                  </button>
                </div>
              )}

              {/* Cold toggle */}
              {cold.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button className="cold-toggle" onClick={() => setShowCold(!showCold)}>
                    {showCold ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showCold ? 'Hide' : 'Show'} {cold.length} cold contacts
                  </button>
                  {showCold && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                      {cold.map(ct => <ContactRow key={ct.id} ct={ct} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className={`eo-panel${selectedContact ? ' has-contact' : ''}`} style={{
              position: 'sticky', top: 16,
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 14, overflow: 'hidden',
              height: 'calc(100vh - 100px)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {renderPanel()}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
