import React, { useState } from 'react'
import { useUser } from '../../context/UserContext'

const SCREEN = { LOGIN: 'login', RESET: 'reset', RESET_SENT: 'reset_sent' }

// ── Wrap defined OUTSIDE component to prevent re-render focus loss ────────────
function Wrap({ children }) {
  return (
    <div style={{minHeight:'100vh',background:'#060C1A',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',Inter,sans-serif",padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,color:'rgba(255,255,255,0.35)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:12}}>Peak Sports MGMT</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:'#FFFFFF',letterSpacing:'-0.02em',lineHeight:1,marginBottom:8}}>The Playbook</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#EFA020',letterSpacing:'0.12em',textTransform:'uppercase'}}>AI Revenue Intelligence · Staff Portal</div>
        </div>
        {children}
        <p style={{textAlign:'center',marginTop:20,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#3A4A60',letterSpacing:'0.08em'}}>Need access? Contact dee@simplegenius.io</p>
      </div>
    </div>
  )
}

export default function Login() {
  const { login, resetPassword, loading, error } = useUser()
  const [screen,   setScreen]   = useState(SCREEN.LOGIN)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    await login(email, password)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    const ok = await resetPassword(email)
    if (ok) { setResetMsg(email); setScreen(SCREEN.RESET_SENT) }
  }

  const ready = email.trim() && password && !loading

  // ── Reset sent ──────────────────────────────────────────────────────────────
  if (screen === SCREEN.RESET_SENT) return (
    <Wrap>
      <div style={{background:'#0F1829',border:'1px solid #1C2840',borderRadius:20,padding:'36px 32px',textAlign:'center'}}>
        <div style={{fontSize:36,marginBottom:16}}>📬</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:'#EAF0FF',marginBottom:10}}>Check your email</div>
        <div style={{fontSize:13,color:'#8892AA',lineHeight:1.6,marginBottom:24}}>
          We sent a password reset link to<br/>
          <span style={{color:'#EFA020',fontWeight:600}}>{resetMsg}</span>
        </div>
        <button onClick={()=>setScreen(SCREEN.LOGIN)} style={{background:'none',border:'none',cursor:'pointer',color:'#EFA020',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>← Back to sign in</button>
      </div>
    </Wrap>
  )

  // ── Forgot password ─────────────────────────────────────────────────────────
  if (screen === SCREEN.RESET) return (
    <Wrap>
      <div style={{background:'#0F1829',border:'1px solid #1C2840',borderRadius:20,padding:'36px 32px'}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#EFA020',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:6}}>Reset Password</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:'#EAF0FF',marginBottom:8}}>Forgot your password?</div>
        <div style={{fontSize:13,color:'#8892AA',marginBottom:24,lineHeight:1.6}}>Enter your email and we'll send you a reset link.</div>
        <form onSubmit={handleReset}>
          <div style={{marginBottom:20}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#8892AA',letterSpacing:'0.1em',textTransform:'uppercase',display:'block',marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" autoFocus
              style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #1C2840',background:'#060C1A',color:'#EAF0FF',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box',transition:'border-color 0.15s'}}
              onFocus={e=>e.target.style.borderColor='#EFA020'} onBlur={e=>e.target.style.borderColor='#1C2840'}/>
          </div>
          {error&&<div style={{padding:'10px 14px',borderRadius:8,marginBottom:16,background:'rgba(224,82,82,0.10)',border:'1px solid rgba(224,82,82,0.25)',color:'#E05252',fontSize:13}}>{error}</div>}
          <button type="submit" disabled={!email.trim()||loading} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:email.trim()&&!loading?'#EFA020':'#1C2840',color:email.trim()&&!loading?'#060C1A':'#4A5568',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,cursor:email.trim()&&!loading?'pointer':'not-allowed',transition:'all 0.15s',marginBottom:14}}>
            {loading?'Sending…':'Send Reset Link →'}
          </button>
          <button type="button" onClick={()=>setScreen(SCREEN.LOGIN)} style={{width:'100%',padding:'10px',borderRadius:10,border:'1px solid #1C2840',background:'none',color:'#8892AA',fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:'pointer'}}>← Back to sign in</button>
        </form>
      </div>
    </Wrap>
  )

  // ── Login ───────────────────────────────────────────────────────────────────
  return (
    <Wrap>
      <div style={{background:'#0F1829',border:'1px solid #1C2840',borderRadius:20,padding:'36px 32px'}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#EFA020',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:6}}>Staff Sign In</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:'#EAF0FF',marginBottom:28}}>Welcome back</div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#8892AA',letterSpacing:'0.1em',textTransform:'uppercase',display:'block',marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" autoFocus
              style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #1C2840',background:'#060C1A',color:'#EAF0FF',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box',transition:'border-color 0.15s'}}
              onFocus={e=>e.target.style.borderColor='#EFA020'} onBlur={e=>e.target.style.borderColor='#1C2840'}/>
          </div>
          <div style={{marginBottom:8}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#8892AA',letterSpacing:'0.1em',textTransform:'uppercase',display:'block',marginBottom:6}}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                style={{width:'100%',padding:'11px 40px 11px 14px',borderRadius:10,border:'1px solid #1C2840',background:'#060C1A',color:'#EAF0FF',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box',transition:'border-color 0.15s'}}
                onFocus={e=>e.target.style.borderColor='#EFA020'} onBlur={e=>e.target.style.borderColor='#1C2840'}/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#8892AA',fontSize:12,padding:0}}>
                {showPw?'Hide':'Show'}
              </button>
            </div>
          </div>
          <div style={{textAlign:'right',marginBottom:20}}>
            <button type="button" onClick={()=>setScreen(SCREEN.RESET)} style={{background:'none',border:'none',cursor:'pointer',color:'#EFA020',fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:0}}>
              Forgot password?
            </button>
          </div>
          {error&&<div style={{padding:'10px 14px',borderRadius:8,marginBottom:16,background:'rgba(224,82,82,0.10)',border:'1px solid rgba(224,82,82,0.25)',color:'#E05252',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>{error}</div>}
          <button type="submit" disabled={!ready} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:ready?'#EFA020':'#1C2840',color:ready?'#060C1A':'#4A5568',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,letterSpacing:'-0.01em',cursor:ready?'pointer':'not-allowed',transition:'all 0.15s'}}>
            {loading?'Signing in…':'Access The Playbook →'}
          </button>
        </form>
      </div>
    </Wrap>
  )
}
