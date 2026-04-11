import React, { useState } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { SchoolProvider } from './context/SchoolContext'
import Login from './components/Login/Login'
import Sidebar from './components/Sidebar/Sidebar'
import SalesAgent from './modules/SalesAgent/SalesAgent'
import CRM from './modules/CRM/CRM'
import Analytics from './modules/Analytics/Analytics'
import Insights from './modules/Analytics/Insights'
import SchoolDashboard from './modules/SchoolDashboard/SchoolDashboard'
import ExecutiveOutreach from './modules/ExecutiveOutreach/ExecutiveOutreach'
import Productivity from './modules/Productivity/Productivity'

/* ─── Loading screen ─────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight:'100vh',background:'#060C1A',
      display:'flex',alignItems:'center',justifyContent:'center',
      flexDirection:'column',gap:16,
    }}>
      <div style={{
        width:40,height:40,borderRadius:'50%',
        border:'3px solid #1C2840',
        borderTop:'3px solid #EFA020',
        animation:'spin 0.8s linear infinite',
      }}/>
      <div style={{
        fontFamily:"'Geist Mono',monospace",
        fontSize:10,color:'#4A5A70',
        letterSpacing:'0.12em',textTransform:'uppercase',
      }}>Loading Playbook…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── Main app shell ─────────────────────────────────────────────────────── */
function AppShell() {
  const { hasModule, canSeeAllSchools } = useUser()
  const [activeTab, setActiveTab] = useState('crm')

  React.useEffect(() => {
    if (canSeeAllSchools) setActiveTab('outreach')
  }, [canSeeAllSchools])

  const renderTab = () => {
    switch(activeTab) {
      case 'crm':          return hasModule('crm')      ? <CRM/>              : <AccessDenied/>
      case 'analytics':    return hasModule('analytics') ? <Analytics/>        : <AccessDenied/>
      case 'insights':     return hasModule('analytics') ? <Insights/>         : <AccessDenied/>
      case 'agent':        return hasModule('agent')     ? <SalesAgent/>       : <AccessDenied/>
      case 'productivity': return !canSeeAllSchools      ? <Productivity/>     : <AccessDenied/>
      case 'dashboard':    return canSeeAllSchools       ? <SchoolDashboard/>  : <AccessDenied/>
      case 'outreach':     return canSeeAllSchools       ? <ExecutiveOutreach/>: <AccessDenied/>
      default:             return canSeeAllSchools       ? <ExecutiveOutreach/>: <CRM/>
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'var(--color-bg,#060C1A)'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(45,110,28,0.20);border-radius:3px}
        .desktop-sidebar{display:flex}
        .mobile-nav{display:none}
        @media(max-width:768px){
          .desktop-sidebar{display:none}
          .mobile-nav{display:flex}
        }
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn 0.25s ease both}
      `}</style>

      <div className="desktop-sidebar">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab}/>
      </div>

      <main key={activeTab} className="fade-in" style={{
        flex:1,overflow:'hidden',position:'relative',
        background:'var(--color-bg,#F0F7EE)',
      }}>
        <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'var(--mobile-nav-h,0px)'}}>
          {renderTab()}
        </div>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab}/>
    </div>
  )
}

/* ─── Access denied ──────────────────────────────────────────────────────── */
function AccessDenied() {
  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'center',
      height:'100%',flexDirection:'column',gap:12,
    }}>
      <div style={{fontSize:32}}>🔒</div>
      <div style={{fontFamily:"'Geist',sans-serif",fontWeight:700,fontSize:18,color:'#1A2E18'}}>Module not activated</div>
      <div style={{fontSize:13,color:'#6A8864'}}>Contact dee@simplegenius.io to enable this module</div>
    </div>
  )
}

/* ─── Mobile nav ─────────────────────────────────────────────────────────── */
function MobileNav({ activeTab, onTabChange }) {
  const { hasModule } = useUser()
  const tabs = [
    { id:'crm',       label:'CRM',      emoji:'📧', mod:'crm' },
    { id:'analytics', label:'Analytics',emoji:'📊', mod:'analytics' },
    { id:'agent',     label:'Agent',    emoji:'🤖', mod:'agent' },
  ].filter(t => hasModule(t.mod))

  return (
    <nav className="mobile-nav" style={{
      position:'fixed',bottom:0,left:0,right:0,
      background:'#152E10',borderTop:'1px solid rgba(255,255,255,0.08)',
      padding:'8px 0 calc(8px + env(safe-area-inset-bottom,0px))',
      zIndex:50,flexDirection:'row',justifyContent:'space-around',alignItems:'center',
    }}>
      {tabs.map(tab=>(
        <button key={tab.id} onClick={()=>onTabChange(tab.id)} style={{
          flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,
          border:'none',background:'none',cursor:'pointer',padding:'4px 4px 0',minWidth:44,
        }}>
          <span style={{fontSize:18}}>{tab.emoji}</span>
          <span style={{
            fontFamily:"'Geist',sans-serif",fontSize:9.5,fontWeight:600,
            color:activeTab===tab.id?'#EFA020':'rgba(255,255,255,0.28)',
            letterSpacing:'0.02em',transition:'color 0.15s',
          }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ─── Auth gate ──────────────────────────────────────────────────────────── */
function AppGate() {
  const { user, loading } = useUser()
  if (loading) return <LoadingScreen/>
  if (!user)   return <Login/>
  return (
    <SchoolProvider>
      <AppShell/>
    </SchoolProvider>
  )
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <UserProvider>
      <AppGate/>
    </UserProvider>
  )
}
