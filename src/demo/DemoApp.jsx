import React, { useState } from 'react'
import { DS, DEMO_SCHOOL } from './DemoConstants'
import DemoCRM from './DemoCRM'
import DemoSalesAgent from './DemoSalesAgent'
import DemoTicketing from './DemoTicketing'
import DemoAnalytics from './DemoAnalytics'
import DemoInsights from './DemoInsights'

const NAV = [
  {id:'agent',    label:'Sales Agent',   sub:'AI Chat',          svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
  {id:'crm',      label:'CRM Outreach',  sub:'AI Emails · Leads',svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/><path d="M6 4v5"/><path d="M18 4v5"/></svg>},
  {id:'ticketing',label:'Ticket Hub',    sub:'Marketplace',      svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l3-3 3 3M2 15l3 3 3-3M14 9l3-3 3 3M14 15l3 3 3-3"/><rect x="5" y="8" width="4" height="8" rx="1"/><rect x="15" y="8" width="4" height="8" rx="1"/></svg>},
  {id:'analytics',label:'Analytics',    sub:'Performance',      svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
  {id:'insights', label:'AI Productivity',sub:'AI vs Manual',   svg:<svg style={{width:17,height:17}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>},
]

export default function DemoApp() {
  const [tab, setTab] = useState('agent')
  const views = {agent:<DemoSalesAgent/>,crm:<DemoCRM/>,ticketing:<DemoTicketing/>,analytics:<DemoAnalytics/>,insights:<DemoInsights/>}

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:DS.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#DDD0B8;border-radius:3px}
        .dnb{background:transparent;border:none;cursor:pointer;width:100%;text-align:left;padding:0}
        .dnb:hover .dnb-inner{background:rgba(196,136,42,0.07)!important}
        .dct{transition:all 0.18s ease}
        .dct:hover{box-shadow:0 4px 14px rgba(28,18,8,0.10)!important;transform:translateY(-1px)!important;border-color:#DDD0B8!important}
        .dcamp:hover{box-shadow:0 4px 14px rgba(28,18,8,0.10)!important;border-color:rgba(196,136,42,0.38)!important;transform:translateY(-2px)!important}
        .dstat:hover{box-shadow:0 4px 14px rgba(28,18,8,0.10)!important;transform:translateY(-2px)!important}
        @keyframes tp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(.8)}}
        @keyframes dfu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dspin{to{transform:rotate(360deg)}}
        @keyframes dbounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .dview{animation:dfu 0.28s ease both}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{width:222,flexShrink:0,background:DS.sidebar,display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid rgba(255,255,255,0.05)'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 16px 13px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:26,height:26,borderRadius:6,background:DS.psGreen,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:'white',letterSpacing:'-0.03em',flexShrink:0}}>PS</div>
            <div style={{width:1,height:14,background:'rgba(255,255,255,0.12)'}}/>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(255,255,255,0.10)',border:'1px solid rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.65)',fontFamily:"'Syne',sans-serif",flexShrink:0}}>M</div>
              <span style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.60)'}}>Midland</span>
            </div>
          </div>
          <div style={{fontSize:10.5,color:'rgba(255,255,255,0.28)',padding:'3px 9px',borderRadius:20,border:'1px solid rgba(255,255,255,0.09)'}}>Demo</div>
        </div>

        {/* User */}
        <div style={{padding:'14px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:9,background:'rgba(196,136,42,0.18)',border:'1.5px solid rgba(196,136,42,0.32)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:DS.gold,flexShrink:0}}>A</div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'rgba(255,255,255,0.90)',lineHeight:1.2}}>Ace<span style={{color:DS.gold}}>.ai</span></div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.32)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Midland University · Demo</div>
            </div>
          </div>
          <div style={{marginTop:10,display:'inline-flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:600,letterSpacing:'0.10em',textTransform:'uppercase',color:DS.gold,padding:'4px 9px 4px 7px',borderRadius:20,background:'rgba(196,136,42,0.11)',border:'1px solid rgba(196,136,42,0.24)'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:DS.gold,boxShadow:'0 0 6px rgba(196,136,42,0.8)',animation:'tp 2.2s ease-in-out infinite'}}/>
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
                <div className="dnb-inner" style={{display:'flex',alignItems:'center',gap:11,padding:'9px 10px 9px 12px',borderRadius:9,borderLeft:`3px solid ${active?DS.gold:'transparent'}`,background:active?DS.sidebarActive:'transparent',transition:'all 0.15s ease'}}>
                  <span style={{color:active?DS.gold:'rgba(255,255,255,0.30)',flexShrink:0,display:'flex',transition:'color 0.15s'}}>{item.svg}</span>
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
      <main key={tab} className="dview" style={{flex:1,overflow:'hidden',position:'relative',background:DS.bg}}>
        <div style={{position:'absolute',inset:0,overflowY:'auto'}}>
          {views[tab]}
        </div>
      </main>
    </div>
  )
}
