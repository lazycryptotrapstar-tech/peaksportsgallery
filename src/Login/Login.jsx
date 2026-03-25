import React, { useState } from 'react'
import { useUser } from '../../context/UserContext'

export default function Login() {
  const { login, loading, error } = useUser()
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    await login(email)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', Inter, sans-serif",
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img
            src="/peak_logo.png"
            alt="Peak Sports MGMT"
            style={{ height: 36, objectFit: 'contain', marginBottom: 20 }}
          />
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 42,
            color: '#ffffff',
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: 8,
          }}>
            The Playbook
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: '#888',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            AI Sales Platform · Peak Sports MGMT
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 20,
          padding: '36px 32px',
        }}>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            color: '#C9A84C',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Sign In
          </p>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            color: '#ffffff',
            letterSpacing: '0.04em',
            marginBottom: 24,
          }}>
            Enter Your Email
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid #3a3a3a',
                background: '#111',
                color: '#ffffff',
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 16,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#3a3a3a'}
            />

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.3)',
                color: '#f97316',
                fontSize: 13,
                marginBottom: 16,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: loading || !email.trim() ? '#2a2a2a' : '#C9A84C',
                color: loading || !email.trim() ? '#666' : '#0a0a0a',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: '0.06em',
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Checking...' : 'Access The Playbook'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: '#444',
          letterSpacing: '0.08em',
        }}>
          Need access? Contact dee@simplegenius.io
        </p>
      </div>
    </div>
  )
}
