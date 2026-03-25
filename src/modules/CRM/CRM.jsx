import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useSchool } from '../../context/SchoolContext'
import {
  ShoppingCart, Trophy, ArrowLeft, Edit2,
  RefreshCw, ExternalLink, Zap,
  ChevronRight, Search, SlidersHorizontal
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PLAYBOOK_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/playbook'
import { getContacts } from '../../data/contacts'

// ── Scoring ───────────────────────────────────────────────────────────────────
const computeScore = (ct) => {
  let s = 30
  s += Math.min(ct.purchase_count * 10, 40)
  if (ct.status === 'hot')  s += 20
  if (ct.status === 'warm') s += 10
  if (ct.status === 'cold') s -= 10
  if (ct.last_year >= 2025) s += 10
  else if (ct.last_year >= 2023) s += 5
  return Math.min(100, Math.max(0, s))
}

const SCORE_COLOR  = (s) => s >= 80 ? '#3CDB7A' : s >= 60 ? '#F5C842' : '#f97316'
const STATUS_LABEL = { hot: 'Hot Lead', warm: 'Warm', cold: 'Cold' }
const STATUS_RANK  = { hot: 0, warm: 1, cold: 2 }

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
  .pb-shell { background:var(--pb-bg); min-height:100%; font-family:'DM Sans',Inter,sans-serif; color:var(--pb-text); }
  .pb-card { background:var(--pb-surface); border:1px solid var(--pb-border); border-radius:16px; }
  .pb-card-2 { background:var(--pb-surface2); border:1px solid var(--pb-border); border-radius:12px; }
  .pb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.15s; }
  .pb-btn:hover { border-color:${primary}; color:${primary}; }
  .pb-btn-primary { background:${primary}; border-color:${primary}; color:#fff !important; }
  .pb-btn-primary:hover { opacity:0.9; }
  .pb-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${primary}; }
  .pb-score { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#fff; }
  .pb-contact-row { display:flex; align-items:center; padding:14px 18px; border-radius:12px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.15s; gap:14px; width:100%; text-align:left; }
  .pb-contact-row:hover { border-color:${primary}; background:var(--pb-surface2); transform:translateX(2px); }
  .pb-campaign-card { padding:28px 24px; border-radius:20px; border:1px solid var(--pb-border); background:var(--pb-surface); cursor:pointer; transition:all 0.2s; text-align:left; }
  .pb-campaign-card:hover { border-color:${primary}; transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.12); }
  .pb-touch-btn { width:40px; height:40px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-weight:700; font-size:15px; transition:all 0.15s; }
  .pb-touch-btn.active { background:${primary}; border-color:${primary}; color:#fff; }
  .pb-input { width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); font-size:14px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; }
  .pb-input:focus { border-color:${primary}; }
  .pb-textarea { width:100%; min-height:180px; padding:12px 14px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); font-size:14px; font-family:'DM Sans',sans-serif; line-height:1.7; resize:vertical; outline:none; box-sizing:border-box; }
  .pb-textarea:focus { border-color:${primary}; }
  .pb-sport-pill { padding:6px 16px; border-radius:20px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-muted); cursor:pointer; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; transition:all 0.15s; white-space:nowrap; }
  .pb-sport-pill.active { background:${primary}; border-color:${primary}; color:#fff; }
  .pb-search-wrap { position:relative; flex:1; }
  .pb-search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; }
  .pb-search-input { width:100%; padding:10px 14px 10px 38px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface); color:var(--pb-text); font-size:14px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.15s; }
  .pb-search-input:focus { border-color:${primary}; }
  .pb-search-input::placeholder { color:var(--pb-muted); opacity:0.6; }
  .pb-sort-select { padding:9px 12px; border-radius:10px; border:1px solid var(--pb-border); background:var(--pb-surface2); color:var(--pb-text); font-size:12px; font-family:'Space Mono',monospace; outline:none; cursor:pointer; }
  .pb-sort-select:focus { border-color:${primary}; }
  .pb-section-divider { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--pb-muted); padding:10px 4px 6px; opacity:0.7; }
  @keyframes pb-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
`

// ── Touch badge component ─────────────────────────────────────────────────────
// Shows T1 T2 T3 pills — green if drafted, gray if not
const TouchBadges = ({ contactId, touchMap }) => {
  const touches = touchMap[contactId] || new Set()
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
      {[1, 2, 3].map(t => {
        const done = touches.has(String(t)) || touches.has(t)
        return (
          <div key={t} style={{
            width: 22, height: 22,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            fontWeight: 700,
            background:   done ? 'rgba(60,219,122,0.15)' : 'rgba(0,0,0,0.06)',
            border:       done ? '1px solid rgba(60,219,122,0.4)' : '1px solid rgba(0,0,0,0.1)',
            color:        done ? '#3CDB7A' : '#bbb',
            letterSpacing: '0.04em',
          }}>
            T{t}
          </div>
        )
      })}
    </div>
  )
}

export default function CRM() {
  const { school } = useSchool()
  const c = school.colors
  const primary = c.accent

  const [stage, setStage]                 = useState('campaign')
  const [campaign, setCampaign]           = useState(null)
  const [contact, setContact]             = useState(null)
  const [touch, setTouch]                 = useState(1)
  const [parsed, setParsed]               = useState(null)
  const [editMode, setEditMode]           = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody]       = useState('')
  const [sportFilter, setSportFilter]     = useState('All')
  const [search, setSearch]               = useState('')
  const [sortBy, setSortBy]               = useState('priority')

  // ── Touch history state ───────────────────────────────────────────────────
  // touchMap: { [contact_id]: Set<touch_number> }
  const [touchMap, setTouchMap]   = useState({})
  const [touchLoading, setTouchLoading] = useState(false)

  // Fetch sequences for current school + campaign whenever campaign is selected
  const fetchTouchHistory = useCallback(async (schoolId, camp) => {
    if (!schoolId || !camp) return
    setTouchLoading(true)
    try {
      const { data, error } = await supabase
        .from('sequences')
        .select('contact_id, touch_number')
        .eq('school_id', schoolId)
        .eq('campaign', camp)

      if (error || !data) return

      // Build map: contact_id → Set of touch numbers drafted
      const map = {}
      data.forEach(row => {
        if (!map[row.contact_id]) map[row.contact_id] = new Set()
        map[row.contact_id].add(String(row.touch_number))
      })
      setTouchMap(map)
    } catch (e) {
      console.error('Touch history fetch error:', e)
    } finally {
      setTouchLoading(false)
    }
  }, [])

  // Re-fetch whenever school or campaign changes
  useEffect(() => {
    if (campaign) fetchTouchHistory(school.id, campaign)
    else setTouchMap({})
  }, [school.id, campaign, fetchTouchHistory])

  const allContacts = useMemo(() =>
    campaign ? getContacts(school.id, campaign) : []
  , [campaign, school.id])

  const contacts = useMemo(() => {
    let list = allContacts
    if (campaign === 'TICKETS' && sportFilter !== 'All') {
      list = list.filter(ct => (ct.sport || '').includes(sportFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(ct =>
        (ct.name  || '').toLowerCase().includes(q) ||
        (ct.email || '').toLowerCase().includes(q) ||
        (ct.city  || '').toLowerCase().includes(q)
      )
    }
    list = [...list]
    if (sortBy === 'priority') {
      list.sort((a, b) => {
        const rd = (STATUS_RANK[a.status] ?? 1) - (STATUS_RANK[b.status] ?? 1)
        return rd !== 0 ? rd : computeScore(b) - computeScore(a)
      })
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'seasons') {
      list.sort((a, b) => (b.purchase_count || 0) - (a.purchase_count || 0))
    }
    return list
  }, [allContacts, sportFilter, search, sortBy, campaign])

  const grouped = useMemo(() => {
    if (sortBy !== 'priority' || search.trim()) return null
    const g = { hot: [], warm: [], cold: [] }
    contacts.forEach(ct => { const k = ct.status || 'warm'; if (g[k]) g[k].push(ct) })
    return g
  }, [contacts, sortBy, search])

  const stats = useMemo(() => {
    const all = getContacts(school.id, 'TICKETS')
    return { total: all.length, hot: all.filter(ct => ct.status === 'hot').length, lapsed: all.filter(ct => ct.status === 'cold').length }
  }, [school.id])

  const sportCounts = useMemo(() => {
    if (campaign !== 'TICKETS') return {}
    const all = getContacts(school.id, 'TICKETS')
    return { All: all.length, Football: all.filter(ct => ct.sport?.includes('Football')).length, Volleyball: all.filter(ct => ct.sport?.includes('Volleyball')).length }
  }, [school.id, campaign])

  const requestDraft = async (ct, t) => {
    setStage('drafting'); setParsed(null)
    try {
      const res = await fetch(PLAYBOOK_WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: school.id, campaign, touch: t,
          contact: {
            id: ct.id, name: ct.name, email: ct.email, phone: ct.phone || '',
            title: ct.title || '', purchase_count: ct.purchase_count || 0,
            status: ct.status || 'warm', last_year: ct.last_year || 0,
            sport: ct.sport || 'Football', tags: ct.tags || '',
            city: ct.city || '', membership_tier: ct.membership_tier || '',
          },
        }),
      })
      const data = await res.json()
      const p = parseDraft(data.draft || '')
      setParsed(p); setEditedSubject(p.subject); setEditedBody(p.body)
      setStage('review')

      // Update touch map optimistically — mark this touch as drafted
      setTouchMap(prev => {
        const updated = { ...prev }
        if (!updated[ct.id]) updated[ct.id] = new Set()
        else updated[ct.id] = new Set(updated[ct.id])
        updated[ct.id].add(String(t))
        return updated
      })
    } catch {
      setParsed({ angle: 'Connection Error', reason: 'Check n8n webhook', subject: '', body: 'Could not connect to AI.', followUp: '' })
      setStage('review')
    }
  }

  const openInEmail = () => {
    const subj = encodeURIComponent(editMode ? editedSubject : parsed?.subject || '')
    const body = encodeURIComponent(editMode ? editedBody   : parsed?.body    || '')
    window.open(`mailto:${contact.email}?subject=${subj}&body=${body}`)
  }

  const reset = () => {
    setStage('campaign'); setCampaign(null); setContact(null)
    setTouch(1); setParsed(null); setEditMode(false)
    setSportFilter('All'); setSearch(''); setSortBy('priority')
    setTouchMap({})
  }

  const vars = { '--pb-bg': c.bg, '--pb-surface': '#ffffff', '--pb-surface2': c.bg, '--pb-border': c.border, '--pb-text': c.primary, '--pb-muted': c.accent }
  const avatarBg = (name) => ({ bg: c.border, initials: (name || '??').split(' ').map(n => n[0]).slice(0, 2).join('') })

  // ── Contact row ───────────────────────────────────────────────────────────
  const ContactRow = ({ ct }) => {
    const av    = avatarBg(ct.name)
    const score = computeScore(ct)
    const meta  = [ct.city, ct.last_year ? `Last: ${ct.last_year}` : null].filter(Boolean).join(' · ')
    return (
      <button className="pb-contact-row" onClick={() => { setContact(ct); requestDraft(ct, touch) }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: av.bg, border: `1px solid ${primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: primary, flexShrink: 0, letterSpacing: '0.05em' }}>
          {av.initials}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--pb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--pb-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ct.title}</p>
          {meta ? <p style={{ margin: 0, fontSize: 11, color: 'var(--pb-muted)', opacity: 0.7, fontFamily: "'Space Mono',monospace" }}>{meta}</p> : null}
        </div>
        {/* Touch history badges */}
        <TouchBadges contactId={ct.id} touchMap={touchMap} />
        {/* Score */}
        <div className="pb-score" style={{ background: SCORE_COLOR(score), flexShrink: 0 }}>{score}</div>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: SCORE_COLOR(score), flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#fff', fontWeight: 700 }}>{STATUS_LABEL[ct.status] || 'Warm'}</span>
        </div>
        <ChevronRight size={16} color={primary} style={{ flexShrink: 0 }} />
      </button>
    )
  }

  return (
    <div className="pb-shell" style={vars}>
      <style>{CSS(primary)}</style>

      {/* ── CAMPAIGN SELECTOR ──────────────────────────────────── */}
      {stage === 'campaign' && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px' }}>
          <p className="pb-label" style={{ marginBottom: 8 }}>The Playbook · {school.short}</p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,6vw,60px)', color: 'var(--pb-text)', margin: '0 0 6px', letterSpacing: '0.03em' }}>Choose a Campaign</h1>
          <p style={{ color: 'var(--pb-muted)', fontSize: 14, marginBottom: 40 }}>Select your outreach type to load contacts and start drafting</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            {[
              { id: 'TICKETS',     label: 'Ticket Reactivation',  sub: 'Lapsed buyers · Season renewals · Group sales',   icon: ShoppingCart, count: getContacts(school.id, 'TICKETS').length     },
              { id: 'SPONSORSHIP', label: 'Sponsorship Outreach', sub: 'Local businesses · Current partners · Prospects', icon: Trophy,       count: getContacts(school.id, 'SPONSORSHIP').length },
            ].map(cam => {
              const Icon = cam.icon
              return (
                <button key={cam.id} className="pb-campaign-card" onClick={() => { setCampaign(cam.id); setStage('contacts') }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon size={22} color={primary} /></div>
                  <p style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'var(--pb-text)', letterSpacing: '0.04em' }}>{cam.label}</p>
                  <p style={{ margin: '0 0 18px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--pb-muted)' }}>{cam.sub}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${primary}22` }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: primary, fontWeight: 700 }}>{cam.count} contacts</span>
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[{ label: 'Total Contacts', value: stats.total }, { label: 'Hot Leads', value: stats.hot }, { label: 'Lapsed Buyers', value: stats.lapsed }].map(s => (
              <div key={s.label} className="pb-card-2" style={{ padding: '16px 18px' }}>
                <p className="pb-label" style={{ marginBottom: 6 }}>{s.label}</p>
                <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: primary, letterSpacing: '0.03em' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT LIST ───────────────────────────────────────── */}
      {stage === 'contacts' && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 24px' }}>
          <button className="pb-btn" onClick={reset} style={{ marginBottom: 20 }}><ArrowLeft size={15} /> Back to Campaigns</button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="pb-label" style={{ marginBottom: 6 }}>{campaign === 'TICKETS' ? 'Ticket Reactivation' : 'Sponsorship Outreach'}</p>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,48px)', color: 'var(--pb-text)', margin: 0, letterSpacing: '0.03em' }}>{school.short} Contacts</h2>
            </div>
            <div>
              <p className="pb-label" style={{ marginBottom: 8, textAlign: 'right' }}>Touch</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map(t => <button key={t} className={`pb-touch-btn${touch === t ? ' active' : ''}`} onClick={() => setTouch(t)}>{t}</button>)}
              </div>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--pb-muted)', marginTop: 6, textAlign: 'right' }}>
                {touch === 1 ? 'The Moment' : touch === 2 ? 'The Identity' : 'The Door'}
              </p>
            </div>
          </div>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
            <div className="pb-search-wrap">
              <Search size={14} color={c.accent} />
              <input className="pb-search-input" placeholder="Search by name, email, or city…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <SlidersHorizontal size={14} color={c.accent} />
              <select className="pb-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="seasons">Most Seasons</option>
                <option value="name">A → Z</option>
              </select>
            </div>
          </div>

          {/* Sport pills */}
          {campaign === 'TICKETS' && sportCounts.Football > 0 && sportCounts.Volleyball > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {['All', 'Football', 'Volleyball'].map(f => (
                <button key={f} className={`pb-sport-pill${sportFilter === f ? ' active' : ''}`} onClick={() => setSportFilter(f)}>
                  {f} ({sportCounts[f] ?? 0})
                </button>
              ))}
            </div>
          )}

          {/* Touch history legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--pb-muted)', margin: 0 }}>
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''} · Touch {touch} · {touch === 1 ? 'The Moment' : touch === 2 ? 'The Identity' : 'The Door'}
            </p>
            {touchLoading && (
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--pb-muted)', opacity: 0.6 }}>Loading history…</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(60,219,122,0.15)', border: '1px solid rgba(60,219,122,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: '#3CDB7A', fontWeight: 700 }}>T1</span>
              </div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--pb-muted)' }}>= drafted</span>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--pb-muted)', fontFamily: "'Space Mono',monospace", fontSize: 12 }}>No contacts match your search</div>
          ) : grouped ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[{ key: 'hot', label: `🔥 Hot Leads (${grouped.hot.length})` }, { key: 'warm', label: `⚡ Warm (${grouped.warm.length})` }, { key: 'cold', label: `❄️ Lapsed (${grouped.cold.length})` }].map(({ key, label }) =>
                grouped[key].length > 0 ? (
                  <div key={key}>
                    <div className="pb-section-divider">{label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                      {grouped[key].map(ct => <ContactRow key={ct.id} ct={ct} />)}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map(ct => <ContactRow key={ct.id} ct={ct} />)}
            </div>
          )}
        </div>
      )}

      {/* ── DRAFTING ───────────────────────────────────────────── */}
      {stage === 'drafting' && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 28px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${primary}22`, border: `1px solid ${primary}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>{school.emoji}</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--pb-text)', marginBottom: 8, letterSpacing: '0.04em' }}>{school.mascotName} is drafting...</h2>
          <p style={{ color: 'var(--pb-muted)', fontSize: 14, marginBottom: 36 }}>Scoring {contact?.name} · Selecting angle · Writing Touch {touch}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: primary, animation: `pb-bounce 1.2s ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {/* ── DRAFT REVIEW ───────────────────────────────────────── */}
      {stage === 'review' && parsed && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 24px' }}>
          <button className="pb-btn" onClick={() => setStage('contacts')} style={{ marginBottom: 16 }}><ArrowLeft size={15} /> Back to Contacts</button>
          <div style={{ padding: '14px 18px', borderRadius: 14, background: `${primary}22`, border: `1px solid ${primary}55`, marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Zap size={16} color={primary} /></div>
            <div>
              <p className="pb-label" style={{ marginBottom: 4 }}>{parsed.angle}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--pb-muted)', lineHeight: 1.5 }}>{parsed.reason}</p>
            </div>
          </div>
          <div className="pb-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--pb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--pb-muted)' }}><span style={{ color: 'var(--pb-text)', fontWeight: 600 }}>To:</span> {contact?.name} · <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{contact?.email}</span></p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--pb-muted)' }}>Touch {touch} of 3 · {touch === 1 ? 'The Moment' : touch === 2 ? 'The Identity' : 'The Door'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="pb-btn" onClick={() => requestDraft(contact, touch)} style={{ padding: '7px 14px', fontSize: 12 }}><RefreshCw size={13} /> Regenerate</button>
                <button className="pb-btn" onClick={() => setEditMode(!editMode)} style={{ padding: '7px 14px', fontSize: 12, ...(editMode ? { background: primary, borderColor: primary, color: c.bg } : {}) }}><Edit2 size={13} /> {editMode ? 'Preview' : 'Edit'}</button>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--pb-border)' }}>
              <p className="pb-label" style={{ marginBottom: 6 }}>Subject</p>
              {editMode ? <input className="pb-input" value={editedSubject} onChange={e => setEditedSubject(e.target.value)} /> : <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pb-text)' }}>{parsed.subject}</p>}
            </div>
            <div style={{ padding: '20px' }}>
              <p className="pb-label" style={{ marginBottom: 10 }}>Body</p>
              {editMode ? <textarea className="pb-textarea" value={editedBody} onChange={e => setEditedBody(e.target.value)} /> : <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--pb-text)', whiteSpace: 'pre-wrap' }}>{parsed.body}</div>}
            </div>
          </div>
          {parsed.followUp && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #86efac', marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Rep Note</p>
              <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>{parsed.followUp}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="pb-btn pb-btn-primary" onClick={openInEmail} style={{ flex: 1, justifyContent: 'center', padding: '16px', borderRadius: 14, fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.06em' }}><ExternalLink size={20} /> Open in Email</button>
            {touch < 3 && (
              <button className="pb-btn" onClick={() => { const next = touch + 1; setTouch(next); requestDraft(contact, next) }} style={{ padding: '16px 22px', borderRadius: 14, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '0.04em' }}>Next Touch <ChevronRight size={18} /></button>
            )}
          </div>
          <button onClick={reset} style={{ width: '100%', marginTop: 12, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--pb-muted)', fontFamily: "'DM Sans',sans-serif" }}>← Start over</button>
        </div>
      )}
    </div>
  )
}
