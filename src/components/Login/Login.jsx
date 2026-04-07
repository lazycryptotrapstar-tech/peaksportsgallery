import React, { useState } from 'react'
import { useUser } from '../../context/UserContext'

export default function Login() {
  const { login, loading, error } = useUser()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    await login(email, password)
  }

  const ready = email.trim() && password && !loading

  return (
    <div style={{
      minHeight:'100vh',
      background:'#060C1A',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:"'DM Sans',Inter,sans-serif",
      padding:24,
    }}>
      <div style={{width:'100%',maxWidth:400}}>

        {/* Logo / brand block */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:13,
            color:'rgba(255,255,255,0.35)',
            letterSpacing:'0.18em',
            textTransform:'uppercase',
            marginBottom:12,
          }}>Peak Sports MGMT</div>
          <div style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:44,
            fontWeight:800,
            color:'#FFFFFF',
            letterSpacing:'-0.02em',
            lineHeight:1,
            marginBottom:8,
          }}>The Playbook</div>
          <div style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:10,
            color:'#EFA020',
            letterSpacing:'0.12em',
            textTransform:'uppercase',
          }}>AI Revenue Intelligence · Staff Portal</div>
        </div>

        {/* Card */}
        <div style={{
          background:'#0F1829',
          border:'1px solid #1C2840',
          borderRadius:20,
          padding:'36px 32px',
        }}>
          <div style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:9,
            color:'#EFA020',
            letterSpacing:'0.14em',
            textTransform:'uppercase',
            marginBottom:6,
          }}>Staff Sign In</div>
          <div style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:24,
            fontWeight:800,
            color:'#EAF0FF',
            letterSpacing:'-0.02em',
            marginBottom:28,
          }}>Welcome back</div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{marginBottom:14}}>
              <label style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:9,
                color:'#8892AA',
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                display:'block',
                marginBottom:6,
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                style={{
                  width:'100%',
                  padding:'11px 14px',
                  borderRadius:10,
                  border:'1px solid #1C2840',
                  background:'#060C1A',
                  color:'#EAF0FF',
                  fontSize:14,
                  fontFamily:"'DM Sans',sans-serif",
                  outline:'none',
                  boxSizing:'border-box',
                  transition:'border-color 0.15s',
                }}
                onFocus={e=>e.target.style.borderColor='#EFA020'}
                onBlur={e=>e.target.style.borderColor='#1C2840'}
              />
            </div>

            {/* Password */}
            <div style={{marginBottom:20}}>
              <label style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:9,
                color:'#8892AA',
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                display:'block',
                marginBottom:6,
              }}>Password</label>
              <div style={{position:'relative'}}>
                <input
                  type={showPw?'text':'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width:'100%',
                    padding:'11px 40px 11px 14px',
                    borderRadius:10,
                    border:'1px solid #1C2840',
                    background:'#060C1A',
                    color:'#EAF0FF',
                    fontSize:14,
                    fontFamily:"'DM Sans',sans-serif",
                    outline:'none',
                    boxSizing:'border-box',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor='#EFA020'}
                  onBlur={e=>e.target.style.borderColor='#1C2840'}
                />
                <button
                  type="button"
                  onClick={()=>setShowPw(!showPw)}
                  style={{
                    position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',
                    color:'#8892AA',fontSize:12,padding:0,
                  }}
                >{showPw?'Hide':'Show'}</button>
              </div>
            </div>

            {/* Error */}
            {error&&(
              <div style={{
                padding:'10px 14px',borderRadius:8,marginBottom:16,
                background:'rgba(224,82,82,0.10)',
                border:'1px solid rgba(224,82,82,0.25)',
                color:'#E05252',fontSize:13,
                fontFamily:"'DM Sans',sans-serif",
              }}>{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!ready}
              style={{
                width:'100%',padding:'14px',borderRadius:12,border:'none',
                background: ready ? '#EFA020' : '#1C2840',
                color: ready ? '#060C1A' : '#4A5568',
                fontFamily:"'Syne',sans-serif",
                fontWeight:800,fontSize:17,
                letterSpacing:'-0.01em',
                cursor: ready ? 'pointer' : 'not-allowed',
                transition:'all 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Access The Playbook →'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign:'center',marginTop:20,
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:9,color:'#3A4A60',letterSpacing:'0.08em',
        }}>
          Need access? Contact dee@simplegenius.io
        </p>
      </div>
    </div>
  )
}
