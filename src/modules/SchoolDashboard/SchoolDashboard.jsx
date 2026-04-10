import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useUser } from '../../context/UserContext'
import { TrendingUp, Mail, Users, Zap, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react'

const T = {
  bg:      '#F7F9FC',
  surface: '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#0F172A',
  text2:   '#334155',
  muted:   '#64748B',
  green:   '#16a34a',
  greenBg: '#dcfce7',
  amber:   '#d97706',
  amberBg: '#fef3c7',
  red:     '#dc2626',
  gold:    '#9A6C10',
  sh:      '0 1px 3px rgba(0,0,0,0.05)',
  shMd:    '0 4px 16px rgba(0,0,0,0.08)',
}

const MODULE_LABELS = {
  crm:       { label: 'CRM',       color: '#16a34a' },
  priority:  { label: 'Priority',  color: '#9A6C10' },
  analytics: { label: 'Analytics', color: '#0891b2' },
  ticketing: { label: 'Ticketing', color: '#1A6A8A' },
  agent:     { label: 'Agent',     color: '#7c3aed' },
}

const timeAgo = (ts) => {
  if (!ts) return 'No activity'
  const diff = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: color || T.text, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{label}</div>
    </div>
  )
}

function KpiTile({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '10px 12px', background: T.surface, borderRadius: 9, border: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: color || T.text, lineHeight: 1 }}>{value ?? '—'}</div>
    </div>
  )
}

function SchoolCard({ school, stats, loading, expanded, onToggle }) {
  const hasActivity  = (stats?.drafts || 0) > 0
  const statusColor  = hasActivity ? T.green : T.amber

  return (
    <div style={{
      background: T.surface,
      borderRadius: 12,
      border: `1px solid ${expanded ? '#16a34a66' : T.border}`,
      boxShadow: expanded ? T.shMd : T.sh,
      overflow: 'hidden',
      transition: 'all 0.15s',
      borderLeft: `4px solid ${statusColor}`,
    }}>

      {/* ── Compact row — always visible ── */}
      <div
        onClick={onToggle}
        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        {/* Logo / emoji */}
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
          {school.logo_url
            ? <img src={school.logo_url} alt={school.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : school.emoji || '🏫'
          }
        </div>

        {/* School name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: T.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{school.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.muted, marginTop: 1 }}>{school.conference} · {stats?.repName || 'No rep'}</div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
          <MiniStat label="Drafts"   value={loading ? '...' : stats?.drafts}   color="#7c3aed" />
          <MiniStat label="Touches"  value={loading ? '...' : stats?.touches}  color={T.green} />
          <MiniStat label="Worked"   value={loading ? '...' : stats?.contacted} color="#0891b2" />
        </div>

        {/* Status + last activity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em', background: hasActivity ? T.greenBg : T.amberBg, color: statusColor }}>
            {hasActivity ? 'Active' : 'Onboarding'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={8} color={T.muted} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: T.muted }}>
              {loading ? '...' : timeAgo(stats?.lastActivity)}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div style={{ flexShrink: 0, color: T.muted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.border}`, background: '#F8FAFC', padding: '16px 18px 18px' }}>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
            <KpiTile label="Drafts Generated"  value={loading ? '...' : stats?.drafts}        color="#7c3aed" />
            <KpiTile label="Total Touches"      value={loading ? '...' : stats?.touches}       color={T.green} />
            <KpiTile label="Contacts Worked"    value={loading ? '...' : stats?.contacted}     color="#0891b2" />
            <KpiTile label="Contacts Loaded"    value={loading ? '...' : stats?.contactsTotal} color={T.text2} />
          </div>

          {/* Touch breakdown */}
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Touch Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            <KpiTile label="Touch 1 — The Moment"   value={loading ? '...' : stats?.t1} color={T.green} />
            <KpiTile label="Touch 2 — The Identity" value={loading ? '...' : stats?.t2} color={T.amber} />
            <KpiTile label="Touch 3 — The Door"     value={loading ? '...' : stats?.t3} color={T.red}   />
          </div>

          {/* This week */}
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>This Week</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            <KpiTile label="Drafts"      value={loading ? '...' : stats?.draftsWeek}  color="#7c3aed" />
            <KpiTile label="Touches"     value={loading ? '...' : stats?.touchesWeek} color={T.green} />
            <KpiTile label="Active Days" value={loading ? '...' : stats?.activeDays}  color="#0891b2" />
          </div>

          {/* Rep + modules row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F1F5F9', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: T.text2, flexShrink: 0 }}>
                {stats?.repName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{stats?.repName || 'No rep assigned'}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.muted }}>{stats?.repTitle || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {(stats?.modules || []).map(mod => {
                const m = MODULE_LABELS[mod]
                if (!m) return null
                return (
                  <span key={mod} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em', background: `${m.color}12`, color: m.color, border: `1px solid ${m.color}25` }}>
                    {m.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SchoolDashboard() {
  const { user } = useUser()
  const [schools,       setSchools]       = useState([])
  const [statsMap,      setStatsMap]      = useState({})
  const [loading,       setLoading]       = useState(true)
  const [statsLoading,  setStatsLoading]  = useState(true)
  const [expandedId,    setExpandedId]    = useState(null)
  const [filter,        setFilter]        = useState('all')

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true)
      try {
        const { data } = await supabase.from('schools').select('*').neq('id', 'demo').order('name')
        if (data) setSchools(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchSchools()
  }, [])

  useEffect(() => {
    if (schools.length === 0) return
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const schoolIds = schools.map(s => s.id)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const [logsRes, logsWeekRes, contactsRes, repsRes] = await Promise.all([
          supabase.from('activity_log').select('school_id, action, contact_id, created_at').in('school_id', schoolIds),
          supabase.from('activity_log').select('school_id, action').in('school_id', schoolIds).gte('created_at', weekAgo.toISOString()),
          supabase.from('contacts').select('school_id').in('school_id', schoolIds),
          supabase.from('user_profiles').select('school_id, name, title, modules').eq('role', 'rep').in('school_id', schoolIds),
        ])

        const logs     = logsRes.data     || []
        const logsWeek = logsWeekRes.data || []
        const contacts = contactsRes.data || []
        const reps     = repsRes.data     || []

        const map = {}
        schools.forEach(school => {
          const sid   = school.id
          const sLogs = logs.filter(l => l.school_id === sid)
          const sWeek = logsWeek.filter(l => l.school_id === sid)
          const rep   = reps.find(r => r.school_id === sid)
          const lastLog = [...sLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
          const activeDaySet = new Set(sWeek.map(l => l.created_at?.split('T')[0]))

          map[sid] = {
            drafts:        sLogs.filter(l => l.action === 'draft_generated').length,
            touches:       sLogs.filter(l => ['touch_1','touch_2','touch_3'].includes(l.action)).length,
            contacted:     new Set(sLogs.filter(l => l.action === 'contact_worked').map(l => l.contact_id)).size,
            t1:            sLogs.filter(l => l.action === 'touch_1').length,
            t2:            sLogs.filter(l => l.action === 'touch_2').length,
            t3:            sLogs.filter(l => l.action === 'touch_3').length,
            contactsTotal: contacts.filter(c => c.school_id === sid).length,
            contactsAdded: sLogs.filter(l => l.action === 'contact_added').length,
            draftsWeek:    sWeek.filter(l => l.action === 'draft_generated').length,
            touchesWeek:   sWeek.filter(l => ['touch_1','touch_2','touch_3'].includes(l.action)).length,
            activeDays:    activeDaySet.size,
            lastActivity:  lastLog?.created_at || null,
            repName:       rep?.name    || school.agent?.name  || null,
            repTitle:      rep?.title   || school.agent?.title || null,
            modules:       rep?.modules || [],
          }
        })
        setStatsMap(map)
      } catch (e) { console.error(e) }
      finally { setStatsLoading(false) }
    }
    fetchStats()
  }, [schools])

  const activeCount  = schools.filter(s => (statsMap[s.id]?.drafts || 0) > 0).length
  const onboardCount = schools.length - activeCount

  const totals = {
    drafts:  Object.values(statsMap).reduce((a, s) => a + (s.drafts  || 0), 0),
    touches: Object.values(statsMap).reduce((a, s) => a + (s.touches || 0), 0),
  }

  const filtered = schools.filter(s => {
    if (filter === 'active')     return (statsMap[s.id]?.drafts || 0) > 0
    if (filter === 'onboarding') return (statsMap[s.id]?.drafts || 0) === 0
    return true
  })

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: T.bg, flexDirection: 'column', gap: 12 }}>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: `bounce 1s ${i*0.15}s infinite` }} />)}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: T.muted }}>Loading schools…</div>
    </div>
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.bg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ padding: '24px 24px 80px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Peak Sports MGMT</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 4 }}>School Dashboard</div>
          <div style={{ fontSize: 13, color: T.muted }}>{schools.length} school{schools.length !== 1 ? 's' : ''} in portfolio</div>
        </div>

        {/* Portfolio KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Portfolio',     value: schools.length,                           color: T.text,    icon: Users      },
            { label: 'Active',        value: activeCount,                              color: T.green,   icon: TrendingUp },
            { label: 'Total Drafts',  value: statsLoading ? '...' : totals.drafts,    color: '#7c3aed', icon: Zap        },
            { label: 'Total Touches', value: statsLoading ? '...' : totals.touches,   color: T.green,   icon: Mail       },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ background: T.surface, borderRadius: 11, border: `1px solid ${T.border}`, padding: '12px 14px', boxShadow: T.sh, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.color, borderRadius: '11px 0 0 11px' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                  <Icon size={12} color={s.color} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[
            { key: 'all',        label: `All (${schools.length})` },
            { key: 'active',     label: `Active (${activeCount})` },
            { key: 'onboarding', label: `Onboarding (${onboardCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 13px', borderRadius: 6,
              border: `1.5px solid ${filter === f.key ? T.green : T.border}`,
              background: filter === f.key ? T.greenBg : 'transparent',
              color: filter === f.key ? T.green : T.muted,
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.12s',
            }}>{f.label}</button>
          ))}
        </div>

        {/* School cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(school => (
            <SchoolCard
              key={school.id}
              school={school}
              stats={statsMap[school.id] || {}}
              loading={statsLoading}
              expanded={expandedId === school.id}
              onToggle={() => toggleExpand(school.id)}
            />
          ))}
        </div>

        {/* Add school */}
        <div style={{ marginTop: 14, padding: '16px', borderRadius: 12, border: `2px dashed ${T.border}`, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: T.muted }}>+ Add New School</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Insert a row in the Supabase schools table to onboard</div>
        </div>

      </div>
    </div>
  )
}
