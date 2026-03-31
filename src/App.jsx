import React, { useState } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { SchoolProvider } from './context/SchoolContext'
import Login from './components/Login/Login'
import Gallery from './components/Gallery/Gallery'
import Sidebar from './components/Sidebar/Sidebar'
import SalesAgent from './modules/SalesAgent/SalesAgent'
import Ticketing from './modules/Ticketing/Ticketing'
import CRM from './modules/CRM/CRM'
import Analytics from './modules/Analytics/Analytics'
import Insights from './modules/Analytics/Insights'
import TechStack from './modules/TechStack/TechStack'

function AppShell() {
  const [activeTab, setActiveTab] = useState('agent')

  const renderTab = () => {
    switch (activeTab) {
      case 'agent':     return <SalesAgent />
      case 'ticketing': return <Ticketing />
      case 'crm':       return <CRM />
      case 'analytics': return <Analytics />
      case 'insights':  return <Insights />
      case 'stack':     return <TechStack />
      default:          return <SalesAgent />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Gallery />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="desktop-sidebar">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }} className="fade-in">
          {renderTab()}
        </main>
      </div>
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <style>{`
        .desktop-sidebar { display: flex; }
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-nav { display: flex; }
        }
      `}</style>
    </div>
  )
}

function MobileNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'agent',     label: 'Agent',       emoji: '🤖' },
    { id: 'crm',       label: 'CRM',         emoji: '📧' },
    { id: 'ticketing', label: 'Tickets',     emoji: '🎟️' },
    { id: 'analytics', label: 'Analytics',   emoji: '📊' },
    { id: 'insights',  label: 'AI vs Manual',emoji: '⚡' },
  ]
  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '1px solid #e8eaed',
      padding: '8px 0 12px', zIndex: 40,
      justifyContent: 'space-around', alignItems: 'center',
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer',
            minWidth: 44, minHeight: 44,
          }}>
          <span style={{ fontSize: 18 }}>{tab.emoji}</span>
          <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: activeTab === tab.id ? 'var(--color-accent)' : '#94a3b8' }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

// ── Login gate — checks for authenticated user before rendering the app ────────
function AppGate() {
  const { user } = useUser()
  if (!user) return <Login />
  return (
    <SchoolProvider>
      <AppShell />
    </SchoolProvider>
  )
}

// ── Root — UserProvider must wrap everything so Login can access it ────────────
export default function App() {
  return (
    <UserProvider>
      <AppGate />
    </UserProvider>
  )
}
