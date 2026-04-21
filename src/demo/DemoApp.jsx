import React, { useState } from 'react'
import { DS, DEMO_SCHOOL } from './DemoConstants'

/* ─── Local dark tokens — shell-level, matches all demo modules ─────────────── */
const T = {
  bg:          '#F0F7EE',
  sidebar:     '#152E10',
  sidebarActive:'rgba(239,160,32,0.12)',
  gold:        '#EFA020',
  psGreen:     '#2D6E1C',
}
import DemoCRM from './DemoCRM'
import DemoSalesAgent from './DemoSalesAgent'
import DemoTicketing from './DemoTicketing'
import DemoAnalytics from './DemoAnalytics'
import DemoInsights from './DemoInsights'
import DemoPriority from './DemoPriority'

const NAV = [
  {id:'agent',    label:'Sales Agent',    sub:'AI Chat',          svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
  {id:'crm',      label:'CRM Outreach',   sub:'AI Emails · Leads',svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/><path d="M6 4v5"/><path d="M18 4v5"/></svg>},
  {id:'priority', label:'Priority Points', sub:'Donor Rankings',  svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>},
  {id:'ticketing',label:'Ticket Hub',     sub:'Marketplace',      svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l3-3 3 3M2 15l3 3 3-3M14 9l3-3 3 3M14 15l3 3 3-3"/><rect x="5" y="8" width="4" height="8" rx="1"/><rect x="15" y="8" width="4" height="8" rx="1"/></svg>},
  {id:'analytics',label:'Analytics',     sub:'Revenue · AI Data', svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
]


function DemoAnalyticsShell() {
  const [subTab, setSubTab] = React.useState('revenue')
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Sub-tab bar */}
      <div style={{display:'flex',gap:0,borderBottom:`1px solid rgba(45,110,28,0.15)`,background:'#E4EFE1',padding:'0 20px',flexShrink:0}}>
        {[{id:'revenue',label:'Revenue Analytics'},{id:'ai',label:'AI vs Manual'}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{
            padding:'12px 18px',border:'none',background:'none',cursor:'pointer',
            fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,
            color:subTab===t.id?T.gold:'#6A8864',
            borderBottom:subTab===t.id?`2px solid ${T.gold}`:'2px solid transparent',
            marginBottom:-1,transition:'all 0.15s ease',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {subTab==='revenue' ? <DemoAnalytics/> : <DemoInsights/>}
      </div>
    </div>
  )
}

export default function DemoApp() {
  const [tab, setTab] = useState('agent')
  const views = {agent:<DemoSalesAgent/>,crm:<DemoCRM/>,priority:<DemoPriority/>,ticketing:<DemoTicketing/>,analytics:<DemoAnalyticsShell/>}

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(45,110,28,0.20);border-radius:3px}
        .dnb{background:transparent;border:none;cursor:pointer;width:100%;text-align:left;padding:0}
        .dnb:hover .dnb-inner{background:rgba(239,160,32,0.07)!important}
        .dct{transition:all 0.18s ease}
        .dct:hover{box-shadow:0 4px 14px rgba(45,110,28,0.12)!important;transform:translateY(-1px)!important;border-color:rgba(45,110,28,0.3)!important}
        .dcamp:hover{box-shadow:0 4px 14px rgba(0,0,0,0.25)!important;border-color:rgba(239,160,32,0.38)!important;transform:translateY(-2px)!important}
        .dstat:hover{box-shadow:0 4px 14px rgba(0,0,0,0.25)!important;transform:translateY(-2px)!important}
        @keyframes tp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(.8)}}
        @keyframes dfu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dspin{to{transform:rotate(360deg)}}
        @keyframes dbounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .dview{animation:dfu 0.28s ease both}
        @media (max-width:768px){
          .demo-sidebar{display:none!important}
          .demo-mobile-nav{display:flex!important}
          :root{--mobile-nav-h:64px}
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="demo-sidebar" style={{width:222,flexShrink:0,background:T.sidebar,display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid rgba(255,255,255,0.05)'}}>

        

        {/* User */}
        <div style={{padding:'14px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src="/peak_logo.png" alt="Peak" style={{width:36,height:36,borderRadius:10,objectFit:'contain',background:'white',padding:3,flexShrink:0}}/>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:18,color:'white',lineHeight:1.1}}>Peak<span style={{color:T.gold}}>.ai</span></div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Peak University · World Conference</div>
            </div>
          </div>
          <div style={{marginTop:10,display:'inline-flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:600,letterSpacing:'0.10em',textTransform:'uppercase',color:T.gold,padding:'4px 9px 4px 7px',borderRadius:20,background:'rgba(196,136,42,0.11)',border:'1px solid rgba(196,136,42,0.24)'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:T.gold,boxShadow:'0 0 6px rgba(196,136,42,0.8)',animation:'tp 2.2s ease-in-out infinite'}}/>
            Platinum Member
          </div>
        </div>

        <div style={{height:1,background:'rgba(255,255,255,0.05)',margin:'14px 0 8px'}}/>

        {/* Nav */}
        <nav style={{padding:'0 9px',display:'flex',flexDirection:'column',gap:1}}>
          {NAV.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} className="dnb" onClick={()=>setTab(item.id)}>
                <div className="dnb-inner" style={{display:'flex',alignItems:'center',gap:11,padding:'9px 10px 9px 12px',borderRadius:9,borderLeft:`3px solid ${active?T.gold:'transparent'}`,background:active?T.sidebarActive:'transparent',transition:'all 0.15s ease'}}>
                  <span style={{color:active?T.gold:'rgba(255,255,255,0.30)',flexShrink:0,display:'flex',transition:'color 0.15s'}}>{item.svg}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:active?600:500,color:active?'rgba(255,255,255,0.94)':'rgba(255,255,255,0.40)',lineHeight:1.2,transition:'color 0.15s'}}>{item.label}</div>
                    <div style={{fontSize:10.5,color:active?'rgba(196,136,42,0.65)':'rgba(255,255,255,0.20)',marginTop:1,transition:'color 0.15s'}}>{item.sub}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{marginTop:'auto',padding:'12px 16px 16px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:'rgba(255,255,255,0.16)',letterSpacing:'0.07em',textAlign:'center',lineHeight:1.7}}>
            Powered by Simple Genius AI<br/>© 2026 Peak Sports MGMT
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main key={tab} className="dview" style={{flex:1,overflow:'hidden',position:'relative',background:T.bg}}>
        <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'var(--mobile-nav-h,0px)'}}>
          {views[tab]}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="demo-mobile-nav" style={{display:'none',position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:T.sidebar,borderTop:'1px solid rgba(255,255,255,0.08)',padding:'8px 0 calc(8px + env(safe-area-inset-bottom,0px))',flexDirection:'row'}}>
        {NAV.map(item=>{
          const active = tab===item.id
          return (
            <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,border:'none',background:'none',cursor:'pointer',padding:'4px 4px 0',minWidth:44}}>
              <span style={{color:active?T.gold:'rgba(255,255,255,0.28)',display:'flex',transition:'color 0.15s'}}>{item.svg}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,fontWeight:600,color:active?T.gold:'rgba(255,255,255,0.28)',letterSpacing:'0.02em',lineHeight:1.2,transition:'color 0.15s'}}>{item.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
