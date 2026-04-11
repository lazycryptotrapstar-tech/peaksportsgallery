import React, { useState, useEffect, useMemo } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { useUser } from '../../context/UserContext'
import { supabase } from '../../lib/supabase'
import {
  Zap, Mail, UserPlus, FileText, TrendingUp,
  Calendar, Award, Target, ChevronRight, Flame
} from 'lucide-react'

const ACTION_LABELS = {
  draft_generated:   { label: 'Draft Generated',    icon: Zap,       color: '#7c3aed' },
  email_opened:      { label: 'Email Opened',        icon: Mail,      color: '#2563eb' },
  contact_worked:    { label: 'Contact Worked',      icon: FileText,  color: '#0891b2' },
  contact_added:     { label: 'Contact Added',       icon: UserPlus,  color: '#16a34a' },
  note_saved:        { label: 'Note Saved',          icon: FileText,  color: '#d97706' },
  touch_1:           { label: 'Touch 1 Sent',        icon: Mail,      color: '#16a34a' },
  touch_2:           { label: 'Touch 2 Sent',        icon: Mail,      color: '#d97706' },
  touch_3:           { label: 'Touch 3 Sent',        icon: Mail,      color: '#dc2626' },
}

const fmt = (n) => n?.toLocaleString() || '0'

const dayKey = (date) => date.toISOString().split('T')[0]

const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dayKey(d))
  }
  return days
}

const getStreakDays = (activityByDay) => {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    if (activityByDay[key]?.length > 0) streak++
    else if (i > 0) break
  }
  return streak
}

export default function Productivity() {
  const { school } = useSchool()
  const { user } = useUser()
  const c = school.colors
  const primary = c.accent

  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('week') // week | month | all

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('activity_log')
          .select('*')
          .eq('school_id', school.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (period === 'week') {
          const since = new Date()
          since.setDate(since.getDate() - 7)
          query = query.gte('created_at', since.toISOString())
        } else if (period === 'month') {
          const since = new Date()
          since.setDate(since.getDate() - 30)
          query = query.gte('created_at', since.toISOString())
        }

        const { data } = await query
        setLogs(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    if (user?.id) fetchLogs()
  }, [school.id, user?.id, period])

  const stats = useMemo(() => {
    const drafts    = logs.filter(l => l.action === 'draft_generated').length
    const emails    = logs.filter(l => l.action === 'email_opened').length
    const contacted = logs.filter(l => l.action === 'contact_worked')
    const added     = logs.filter(l => l.action === 'contact_added').length
    const t1        = logs.filter(l => l.action === 'touch_1').length
    const t2        = logs.filter(l => l.action === 'touch_2').length
    const t3        = logs.filter(l => l.action === 'touch_3').length
    const uniqueContacts = new Set(contacted.map(l => l.contact_id)).size

    return { drafts, emails, uniqueContacts, added, t1, t2, t3, touches: t1 + t2 + t3 }
  }, [logs])

  const activityByDay = useMemo(() => {
    const map = {}
    logs.forEach(l => {
      const key = dayKey(new Date(l.created_at))
      if (!map[key]) map[key] = []
      map[key].push(l)
    })
    return map
  }, [logs])

  const streak     = useMemo(() => getStreakDays(activityByDay), [activityByDay])
  const last7      = getLast7Days()
  const maxDay     = Math.max(...last7.map(d => activityByDay[d]?.length || 0), 1)
  const recentLogs = logs.slice(0, 12)

  const vars = {
    '--pb-bg':      '#F7F9FC',
    '--pb-surface': '#FFFFFF',
    '--pb-border':  '#E2E8F0',
    '--pb-text':    '#0F172A',
    '--pb-muted':   '#64748B',
  }

  const periodLabel = period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'All time'

  return (
    <div style={{ ...vars, background: 'var(--pb-bg)', minHeight: '100%', fontFamily: "'Geist',sans-serif", padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');
        .prod-card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05); position:relative; overflow:hidden; }
        .prod-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:${primary}; border-radius:12px 0 0 12px; }
        .period-btn { padding:6px 14px; border-radius:7px; border:1px solid #E2E8F0; background:#fff; color:#64748B; cursor:pointer; font-family:'Geist Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.12s; }
        .period-btn.active { background:${primary}; border-color:${primary}; color:#fff; }
        .activity-row { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:8px; border:1px solid #F1F5F9; background:#fff; }
        .activity-row:hover { border-color:#E2E8F0; background:#FAFBFC; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontFamily: "'Geist Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
              Productivity · {school.short || school.name}
            </p>
            <h2 style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
              My Activity
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['week', 'month', 'all'].map(p => (
              <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                {p === 'week' ? '7D' : p === 'month' ? '30D' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Streak + period banner */}
        <div style={{ padding: '14px 18px', borderRadius: 12, background: `${primary}10`, border: `1px solid ${primary}25`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Flame size={22} color={primary} />
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
              {streak} day streak
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
              {streak > 0 ? `Keep it going — you've been active ${streak} day${streak > 1 ? 's' : ''} in a row.` : 'No activity logged today yet. Generate a draft to start your streak.'}
            </p>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Drafts Generated', value: stats.drafts,         icon: Zap,       color: '#7c3aed' },
            { label: 'Emails Sent',      value: stats.emails,         icon: Mail,      color: '#2563eb' },
            { label: 'Contacts Worked',  value: stats.uniqueContacts, icon: Target,    color: '#0891b2' },
            { label: 'Contacts Added',   value: stats.added,          icon: UserPlus,  color: '#16a34a' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="prod-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9.5, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#64748B' }}>{s.label}</p>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={s.color} />
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 30, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{fmt(s.value)}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#94a3b8' }}>{periodLabel}</p>
              </div>
            )
          })}
        </div>

        {/* Touch breakdown + activity chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Touch breakdown */}
          <div className="prod-card" style={{ padding: '18px' }}>
            <p style={{ margin: '0 0 16px', fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Touch Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Touch 1 — The Moment', value: stats.t1, color: '#16a34a', total: stats.touches },
                { label: 'Touch 2 — The Identity', value: stats.t2, color: '#d97706', total: stats.touches },
                { label: 'Touch 3 — The Door', value: stats.t3, color: '#dc2626', total: stats.touches },
              ].map(t => (
                <div key={t.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#334155', fontWeight: 500 }}>{t.label}</p>
                    <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 12, fontWeight: 700, color: t.color }}>{t.value}</p>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.total > 0 ? (t.value / t.total) * 100 : 0}%`, background: t.color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Total touches</p>
                <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{stats.touches}</p>
              </div>
            </div>
          </div>

          {/* 7-day activity chart */}
          <div className="prod-card" style={{ padding: '18px' }}>
            <p style={{ margin: '0 0 16px', fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Daily Activity — Last 7 Days</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {last7.map(day => {
                const count = activityByDay[day]?.length || 0
                const height = maxDay > 0 ? Math.max((count / maxDay) * 72, count > 0 ? 8 : 0) : 0
                const isToday = day === dayKey(new Date())
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', height: 72, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{
                        width: '100%', height: `${height}px`,
                        background: count > 0 ? (isToday ? primary : `${primary}66`) : '#F1F5F9',
                        borderRadius: 4, transition: 'height 0.3s ease',
                        border: isToday ? `1px solid ${primary}` : 'none',
                      }} />
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 8, color: isToday ? primary : '#94a3b8', fontWeight: isToday ? 700 : 500 }}>
                      {new Date(day + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="prod-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ margin: 0, fontFamily: "'Geist',sans-serif", fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Recent Activity</p>
            <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{periodLabel}</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontFamily: "'Geist Mono',monospace", fontSize: 11 }}>Loading activity...</p>
          ) : recentLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <TrendingUp size={28} color="#E2E8F0" style={{ marginBottom: 10 }} />
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>No activity logged yet for this period.</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#cbd5e1' }}>Start generating drafts to see your activity here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recentLogs.map(log => {
                const def = ACTION_LABELS[log.action] || { label: log.action, icon: FileText, color: '#64748B' }
                const Icon = def.icon
                const time = new Date(log.created_at)
                return (
                  <div key={log.id} className="activity-row">
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${def.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color={def.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{def.label}</p>
                      {log.contact_name && (
                        <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>{log.contact_name}</p>
                      )}
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: 9, color: '#94a3b8', flexShrink: 0 }}>
                      {time.toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {time.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
