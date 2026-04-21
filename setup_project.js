// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Sales Agent landing restructure
//   • Shrink campaign tiles (~40% smaller)
//   • Side-by-side layout: campaigns (left) + phone preview (right)
//   • Phone auto-cycles through 4 scripted campaign conversations
//   • Remove redundant subtitle; add link caption under phone
//
// Touches only: DemoSalesAgent.jsx
// Does NOT touch: DemoCore.js, live chat flow, Supabase, webhooks
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const AGENT_FILE = path.join('src', 'demo', 'DemoSalesAgent.jsx');

// ───────────────────────────────────────────────────────────────────────────
// Edit 1 — Insert PREVIEW_CAMPAIGNS constant after `const CAMPAIGNS = ...`
// ───────────────────────────────────────────────────────────────────────────

const E1_OLD = `const CAMPAIGNS = CAMPAIGNS_AGENT.map(c=>({...c, svg:CAMPAIGN_SVGS[c.id]}))`;
const E1_NEW = `const CAMPAIGNS = CAMPAIGNS_AGENT.map(c=>({...c, svg:CAMPAIGN_SVGS[c.id]}))

// Scripted conversations for the auto-playing phone preview.
// Demo content only — live chat still uses CAMPAIGNS_AGENT via DemoCore.
const PREVIEW_CAMPAIGNS = [
  {
    label: 'Ticket Sales',
    bubbles: [
      {side:'bot',  text:"Hey! Grip here — your Peak Mountaineers ticket rep. Big game at Peak Sports Stadium coming up. What sports are you into?"},
      {side:'user', text:"I'm interested in football!"},
      {side:'bot',  text:"Perfect — the Riverside Hawks rivalry game is coming up. Want me to check availability near the 50?"},
    ],
  },
  {
    label: 'Sponsorship',
    bubbles: [
      {side:'bot',  text:"Hi — Grip here. I noticed your business supports local athletics. Open to exploring a partnership with Peak?"},
      {side:'user', text:"What tiers do you offer?"},
      {side:'bot',  text:"Bronze, Silver, Gold, and Presenting. Silver at $6,000 would be a strong fit for your size — want the full breakdown?"},
    ],
  },
  {
    label: 'Hospitality',
    bubbles: [
      {side:'bot',  text:"Welcome back! You've been a Champions Club member for 3 seasons. Priority booking just opened for the Hawks rivalry game."},
      {side:'user', text:"What's left in the suite?"},
      {side:'bot',  text:"Two seats in Champions Club Box 4 — food and premium parking included. $380 each. Shall I hold them?"},
    ],
  },
  {
    label: 'Alumni Outreach',
    bubbles: [
      {side:'bot',  text:"Hey Peak alum! Your class is planning the 25-year reunion around homecoming. Got a minute to see group options?"},
      {side:'user', text:"Seating for 12 — any blocks left?"},
      {side:'bot',  text:"Section 205 has a block of 14 with tailgate passes and a pre-game meet-up. Want me to reserve them?"},
    ],
  },
]`;

// ───────────────────────────────────────────────────────────────────────────
// Edit 2 — Add cycleIndex state after chatStep state
// ───────────────────────────────────────────────────────────────────────────

const E2_OLD = `  const [chatStep, setChatStep] = useState(0)`;
const E2_NEW = `  const [chatStep, setChatStep] = useState(0)
  const [cycleIndex, setCycleIndex] = useState(0)`;

// ───────────────────────────────────────────────────────────────────────────
// Edit 3 — Replace animation useEffect to advance cycleIndex on loop
// ───────────────────────────────────────────────────────────────────────────

const E3_OLD = `  // ── Phone-preview animation — cycles through 3 chat bubbles on landing ───
  useEffect(() => {
    if (campaign) return
    const timings = [600, 2000, 2000, 2800]
    const id = setTimeout(() => setChatStep(s => (s + 1) % 4), timings[chatStep])
    return () => clearTimeout(id)
  }, [chatStep, campaign])`;

const E3_NEW = `  // ── Phone-preview animation — cycles bubbles AND rotates campaigns ─────
  useEffect(() => {
    if (campaign) return
    const timings = [600, 2000, 2000, 2800]
    const id = setTimeout(() => {
      const nextStep = (chatStep + 1) % 4
      setChatStep(nextStep)
      if (nextStep === 0) setCycleIndex(c => (c + 1) % PREVIEW_CAMPAIGNS.length)
    }, timings[chatStep])
    return () => clearTimeout(id)
  }, [chatStep, campaign])`;

// ───────────────────────────────────────────────────────────────────────────
// Edit 4 — Remove "Start a live conversation with Grip" subtitle
// ───────────────────────────────────────────────────────────────────────────

const E4_OLD = `        <p style={{fontSize:13,color:T.text3,marginBottom:22}}>Start a live conversation with Grip</p>

        {/* Hero stats — AI vs Manual */}`;
const E4_NEW = `        {/* Hero stats — AI vs Manual */}`;

// ───────────────────────────────────────────────────────────────────────────
// Edit 5 — Replace Campaign tiles + Phone preview block with side-by-side
// ───────────────────────────────────────────────────────────────────────────

const E5_OLD = `        {/* Campaign tiles */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:14,maxWidth:580,margin:'0 auto 36px'}}>
          {CAMPAIGNS.map(cam=>(
            <button key={cam.id} className="dcamp" onClick={()=>selectCampaign(cam)}
              style={{background:T.card,borderRadius:15,padding:'22px 22px 18px',border:\`1.5px solid \${T.border}\`,boxShadow:T.shSm,cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:10,position:'relative',overflow:'hidden',transition:'all 0.18s ease'}}>
              <div style={{width:42,height:42,borderRadius:11,background:T.goldBg,display:'flex',alignItems:'center',justifyContent:'center',color:T.gold}}>{cam.svg}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:17,fontWeight:700,color:T.text}}>{cam.label}</div>
              <div style={{fontSize:11.5,color:T.text3,lineHeight:1.45}}>{cam.sub}</div>
              <svg style={{position:'absolute',right:16,bottom:16,width:18,height:18,color:T.text3,transition:'all 0.15s'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          ))}
        </div>

        {/* Phone preview */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
          <div style={{width:290,background:'#1A1512',borderRadius:42,padding:13,boxShadow:'0 24px 64px rgba(20,16,13,0.28),0 6px 20px rgba(20,16,13,0.16),inset 0 0 0 1px rgba(255,255,255,0.07)'}}>
            <div style={{background:T.surface,borderRadius:31,overflow:'hidden'}}>
              <div style={{height:26,background:'#1A1512',borderRadius:'0 0 16px 16px',margin:'0 auto',width:76}}/>
              <div style={{background:T.green,padding:'11px 14px',display:'flex',alignItems:'center',gap:9}}>
                <div style={{width:28,height:28,borderRadius:7,background:'rgba(196,136,42,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:11,color:T.gold,flexShrink:0}}>G</div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.90)'}}>Ticket Sales</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.60)',display:'flex',alignItems:'center',gap:4}}>
                    Peak
                    <span style={{margin:'0 2px',opacity:.4}}>·</span>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/>
                    <span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600,letterSpacing:'0.03em'}}>LIVE</span>
                  </div>
                </div>
              </div>
              <div style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,minHeight:180,background:T.bg}}>
                {/* Bot bubble 1 — visible when chatStep >= 1 */}
                <div style={{display:'flex',gap:7,alignItems:'flex-end',opacity:chatStep>=1?1:0,transform:chatStep>=1?'translateY(0)':'translateY(6px)',transition:'opacity 0.45s ease, transform 0.45s ease'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Inter',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:T.card,border:\`1px solid \${T.border}\`,color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Hey! Grip here — your Peak Mountaineers ticket rep. Big game at Peak Sports Stadium coming up. What sports are you into?</div>
                </div>
                {/* User bubble — visible when chatStep >= 2 */}
                <div style={{display:'flex',justifyContent:'flex-end',opacity:chatStep>=2?1:0,transform:chatStep>=2?'translateY(0)':'translateY(6px)',transition:'opacity 0.45s ease, transform 0.45s ease'}}>
                  <div style={{maxWidth:'70%',padding:'8px 11px',borderRadius:'13px 13px 3px 13px',background:T.green,color:'white',fontSize:11,lineHeight:1.45}}>I'm interested in football!</div>
                </div>
                {/* Bot bubble 2 — visible when chatStep >= 3 */}
                <div style={{display:'flex',gap:7,alignItems:'flex-end',opacity:chatStep>=3?1:0,transform:chatStep>=3?'translateY(0)':'translateY(6px)',transition:'opacity 0.45s ease, transform 0.45s ease'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Inter',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:T.card,border:\`1px solid \${T.border}\`,color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Perfect — the Riverside Hawks rivalry game is coming up. Want me to check availability near the 50?</div>
                </div>
              </div>
              <div style={{background:'white',margin:'0 12px 12px',borderRadius:10,padding:'8px 10px',display:'flex',alignItems:'center',gap:8}}>
                <div style={{flex:1,fontSize:11,color:T.text3}}>Message Grip…</div>
                <div style={{width:26,height:26,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>`;

const E5_NEW = `        {/* Campaigns + phone preview — side-by-side on desktop, stacked on mobile */}
        <div className="sa-split" style={{display:'flex',gap:20,alignItems:'flex-start',justifyContent:'center',flexWrap:'wrap',maxWidth:900,margin:'0 auto 28px'}}>

          {/* Campaigns column (2×2 grid) */}
          <div style={{flex:'1 1 360px',maxWidth:440,minWidth:0}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
              {CAMPAIGNS.map(cam=>(
                <button key={cam.id} className="dcamp" onClick={()=>selectCampaign(cam)}
                  style={{background:T.card,borderRadius:13,padding:'13px 13px 11px',border:\`1.5px solid \${T.border}\`,boxShadow:T.shSm,cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:5,position:'relative',overflow:'hidden',transition:'all 0.18s ease'}}>
                  <div style={{width:30,height:30,borderRadius:8,background:T.goldBg,display:'flex',alignItems:'center',justifyContent:'center',color:T.gold,marginBottom:3}}>{cam.svg}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.2}}>{cam.label}</div>
                  <div style={{fontSize:10.5,color:T.text3,lineHeight:1.4}}>{cam.sub}</div>
                  <svg style={{position:'absolute',right:10,bottom:10,width:13,height:13,color:T.text3,transition:'all 0.15s'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Phone preview column */}
          <div style={{flex:'0 0 auto',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:260,background:'#1A1512',borderRadius:38,padding:11,boxShadow:'0 24px 64px rgba(20,16,13,0.28),0 6px 20px rgba(20,16,13,0.16),inset 0 0 0 1px rgba(255,255,255,0.07)'}}>
              <div style={{background:T.surface,borderRadius:28,overflow:'hidden'}}>
                <div style={{height:22,background:'#1A1512',borderRadius:'0 0 14px 14px',margin:'0 auto',width:66}}/>

                {/* Header — label cycles with campaign */}
                <div style={{background:T.green,padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:26,height:26,borderRadius:7,background:'rgba(196,136,42,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:11,color:T.gold,flexShrink:0}}>G</div>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:11.5,fontWeight:600,color:'rgba(255,255,255,0.90)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'opacity 0.35s',opacity:chatStep===0?0.5:1}}>{PREVIEW_CAMPAIGNS[cycleIndex].label}</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.60)',display:'flex',alignItems:'center',gap:4}}>
                      Peak
                      <span style={{margin:'0 2px',opacity:.4}}>·</span>
                      <div style={{width:5,height:5,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/>
                      <span style={{color:'#2ECC71',fontSize:8.5,fontWeight:600,letterSpacing:'0.03em'}}>LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Chat area — bubbles rendered from PREVIEW_CAMPAIGNS[cycleIndex] */}
                <div style={{padding:'12px 10px',display:'flex',flexDirection:'column',gap:9,minHeight:180,background:T.bg}}>
                  {PREVIEW_CAMPAIGNS[cycleIndex].bubbles.map((b,i)=>{
                    const visible = chatStep > i
                    const isBot = b.side==='bot'
                    return (
                      <div key={\`\${cycleIndex}-\${i}\`} style={{
                        display:'flex', gap:isBot?6:0,
                        justifyContent:isBot?'flex-start':'flex-end',
                        alignItems:isBot?'flex-end':'center',
                        opacity:visible?1:0,
                        transform:visible?'translateY(0)':'translateY(6px)',
                        transition:'opacity 0.45s ease, transform 0.45s ease',
                      }}>
                        {isBot && (
                          <div style={{width:20,height:20,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8.5,fontWeight:700,color:T.gold,fontFamily:"'Inter',sans-serif",flexShrink:0}}>A</div>
                        )}
                        <div style={{
                          maxWidth:isBot?'80%':'72%',
                          padding:'7px 10px',fontSize:10.5,lineHeight:1.45,
                          background:isBot?T.card:T.green,
                          color:isBot?T.text:'white',
                          border:isBot?\`1px solid \${T.border}\`:'none',
                          boxShadow:isBot?'0 1px 4px rgba(0,0,0,0.08)':'none',
                          borderRadius:isBot?'13px 13px 13px 3px':'13px 13px 3px 13px',
                        }}>{b.text}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{background:'white',margin:'0 10px 10px',borderRadius:10,padding:'7px 9px',display:'flex',alignItems:'center',gap:7}}>
                  <div style={{flex:1,fontSize:10.5,color:T.text3}}>Message Grip…</div>
                  <div style={{width:24,height:24,borderRadius:6,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Link caption — ties preview to clickable tiles */}
            <div style={{marginTop:12,textAlign:'center',fontSize:11.5,color:T.text3,maxWidth:240,lineHeight:1.45}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:T.gold,letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:700}}>Preview</span>
              <span style={{margin:'0 6px',color:T.border}}>·</span>
              Tap a campaign to chat live
            </div>
          </div>
        </div>`;

// ───────────────────────────────────────────────────────────────────────────
// Runner
// ───────────────────────────────────────────────────────────────────────────

function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function applyEdit(src, oldStr, newStr, label) {
  const count = src.split(oldStr).length - 1;
  if (count === 0) return { src, ok: false, reason: 'anchor not found' };
  if (count > 1)   return { src, ok: false, reason: 'anchor matched ' + count + ' times' };
  return { src: src.replace(oldStr, newStr), ok: true };
}

function run() {
  if (!fs.existsSync(AGENT_FILE)) { console.error('Missing: ' + AGENT_FILE); process.exit(1); }

  let src = readNormalized(AGENT_FILE);

  // Idempotency
  if (src.includes('PREVIEW_CAMPAIGNS') && src.includes('sa-split') && src.includes('cycleIndex')) {
    console.log('Restructure already applied. Nothing to do.');
    return;
  }

  const edits = [
    ['#1 PREVIEW_CAMPAIGNS constant',     E1_OLD, E1_NEW],
    ['#2 cycleIndex state',                E2_OLD, E2_NEW],
    ['#3 animation useEffect rewrite',     E3_OLD, E3_NEW],
    ['#4 remove subtitle',                 E4_OLD, E4_NEW],
    ['#5 side-by-side layout + cycling',   E5_OLD, E5_NEW],
  ];

  for (const [label, oldStr, newStr] of edits) {
    const res = applyEdit(src, oldStr, newStr, label);
    if (!res.ok) {
      console.error('FAIL: ' + label + '  (' + res.reason + ')');
      console.error('Aborting — no files written.');
      process.exit(1);
    }
    src = res.src;
  }

  fs.writeFileSync(AGENT_FILE, src, 'utf8');

  console.log('Updated ' + AGENT_FILE);
  console.log('  + PREVIEW_CAMPAIGNS with 4 scripted conversations');
  console.log('  + cycleIndex state');
  console.log('  + animation advances through campaigns every ~7.4s');
  console.log('  - removed redundant subtitle');
  console.log('  + side-by-side layout (tiles left, phone right)');
  console.log('  + smaller campaign tiles');
  console.log('  + link caption under phone');
  console.log('');
  console.log('Next: npm run dev  →  verify at localhost:5173');
  console.log('Then: git add . && git commit -m "demo: sales agent landing restructure" && git push');
}

run();
