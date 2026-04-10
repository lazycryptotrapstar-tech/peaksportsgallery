import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'

export default function Login() {
  const { login, error, loading } = useUser()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [remember,   setRemember]   = useState(true)
  const [showPass,   setShowPass]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resetMode,  setResetMode]  = useState(false)
  const [resetSent,  setResetSent]  = useState(false)
  const { resetPassword } = useUser()

  // ── Load remembered email on mount ───────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('playbook_remembered_email')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(email.trim(), password)
    if (ok) {
      if (remember) localStorage.setItem('playbook_remembered_email', email.trim())
      else          localStorage.removeItem('playbook_remembered_email')
    }
    setSubmitting(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await resetPassword(email.trim())
    if (ok) setResetSent(true)
    setSubmitting(false)
  }

  const s = {
    shell: {
      minHeight: '100vh', background: '#0E1A0C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 20,
    },
    card: {
      width: '100%', maxWidth: 400,
      background: '#fff', borderRadius: 20,
      padding: '40px 36px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
    },
    logoIcon: {
      width: 40, height: 40, borderRadius: 10,
      background: '#F0F7EE', border: '1px solid #C4D8BE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    },
    headline: {
      fontFamily: "'Syne', sans-serif", fontWeight: 800,
      fontSize: 22, color: '#0F172A', margin: '0 0 4px',
      letterSpacing: '-0.02em',
    },
    sub: { fontSize: 13, color: '#64748B', margin: 0 },
    label: {
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5,
      fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: '#64748B', display: 'block', marginBottom: 6,
    },
    input: {
      width: '100%', padding: '11px 14px', borderRadius: 9,
      border: '1.5px solid #E2E8F0', background: '#F8FAFC',
      color: '#0F172A', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
      outline: 'none', boxSizing: 'border-box', transition: 'all 0.12s',
    },
    inputFocus: { borderColor: '#2D6E1C', boxShadow: '0 0 0 3px rgba(45,110,28,0.12)', background: '#fff' },
    field: { marginBottom: 16 },
    passWrap: { position: 'relative' },
    showBtn: {
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
      fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    rememberRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20,
    },
    checkRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
    checkLabel: { fontSize: 13, color: '#334155', fontWeight: 500 },
    forgotBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 12, color: '#2D6E1C', fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
    },
    submitBtn: {
      width: '100%', padding: '13px', borderRadius: 10,
      background: '#2D6E1C', border: 'none', color: '#fff',
      fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15,
      cursor: 'pointer', transition: 'all 0.12s',
      boxShadow: '0 4px 12px rgba(45,110,28,0.35)',
      letterSpacing: '-0.01em',
    },
    error: {
      padding: '10px 14px', borderRadius: 8,
      background: '#fef2f2', border: '1px solid #fecaca',
      color: '#dc2626', fontSize: 12, marginBottom: 16,
    },
    success: {
      padding: '10px 14px', borderRadius: 8,
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      color: '#16a34a', fontSize: 12, marginBottom: 16,
    },
  }

  const [focused, setFocused] = useState(null)

  return (
    <div style={s.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #F8FAFC inset !important; }
      `}</style>

      <div style={s.card}>

        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>🏔️</div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: '#0F172A', lineHeight: 1.1 }}>
              The<span style={{ color: '#2D6E1C' }}>Playbook</span>
            </p>
            <p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#94a3b8', letterSpacing: '0.08em' }}>
              PEAK SPORTS MGMT
            </p>
          </div>
        </div>

        {!resetMode ? (
          <>
            <p style={s.headline}>Welcome back</p>
            <p style={{ ...s.sub, marginBottom: 28 }}>Sign in to your account</p>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input
                  style={{ ...s.input, ...(focused === 'email' ? s.inputFocus : {}) }}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.passWrap}>
                  <input
                    style={{ ...s.input, paddingRight: 56, ...(focused === 'pass' ? s.inputFocus : {}) }}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused(null)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" style={s.showBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Remember me + forgot */}
              <div style={s.rememberRow}>
                <label style={s.checkRow} onClick={() => setRemember(!remember)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: `2px solid ${remember ? '#2D6E1C' : '#CBD5E1'}`,
                    background: remember ? '#2D6E1C' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s', flexShrink: 0,
                  }}>
                    {remember && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={s.checkLabel}>Remember my email</span>
                </label>
                <button type="button" style={s.forgotBtn} onClick={() => setResetMode(true)}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: submitting || loading ? 0.7 : 1, cursor: submitting || loading ? 'not-allowed' : 'pointer' }}
                disabled={submitting || loading}
              >
                {submitting || loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={s.headline}>Reset password</p>
            <p style={{ ...s.sub, marginBottom: 28 }}>We'll send a reset link to your email.</p>

            {error    && <div style={s.error}>{error}</div>}
            {resetSent && <div style={s.success}>Check your inbox — a reset link is on its way.</div>}

            {!resetSent && (
              <form onSubmit={handleReset}>
                <div style={s.field}>
                  <label style={s.label}>Email</label>
                  <input
                    style={{ ...s.input, ...(focused === 'reset' ? s.inputFocus : {}) }}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('reset')}
                    onBlur={() => setFocused(null)}
                    autoComplete="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer', marginBottom: 12 }}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <button
              type="button"
              style={{ ...s.forgotBtn, display: 'block', marginTop: 8 }}
              onClick={() => { setResetMode(false); setResetSent(false) }}
            >
              ← Back to sign in
            </button>
          </>
        )}

        <p style={{ margin: '24px 0 0', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#CBD5E1', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Powered by Simple Genius AI Solutions
        </p>
      </div>
    </div>
  )
}
