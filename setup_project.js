// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Phone-first hero layout (Option B)
//   • Large centered phone (260→340px) as the visual centerpiece
//   • Campaign tiles become slim pill-row below the phone
//   • Hero stats move to bottom as closing proof
//   • Top Contact card removed from landing
//
// Touches only: DemoSalesAgent.jsx
// Does NOT touch: DemoCore.js, live chat flow, PREVIEW_CAMPAIGNS data
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const AGENT_FILE = path.join('src', 'demo', 'DemoSalesAgent.jsx');

// ───────────────────────────────────────────────────────────────────────────
// Single large edit: replace the entire `if (!campaign) return (...)` body
// ───────────────────────────────────────────────────────────────────────────

const OLD = `  if (!campaign) return (
    <div style={INNER}>
      <div style={{marginBottom:6}}>
        <div style={{...LABEL,marginBottom:5}}>Sales Agent · Peak</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:800,color:T.text,letterSpacing:'-0.03em',textAlign:'center'}}>Choose a Campaign</div>
      </div>
      <div style={{textAlign:'center'}}>
        {/* Hero stats — AI vs Manual */}
        <div style={{display:'flex',gap:10,maxWidth:580,margin:'0 auto 28px',flexWrap:'wrap'}}>
          {[
            {big:'4.4×',  label:'More emails sent',   sub:'vs manual reps'},
            {big:'+138%',      label:'Response-rate lift', sub:'vs 8% baseline'},
            {big:'3.4×',  label:'Revenue generated',  sub:'$97.2k vs $28.4k'},
          ].map((s,i)=>(
            <div key={i} style={{flex:'1 1 150px',background:T.card,border:\`1px solid \${T.border}\`,borderRadius:12,padding:'13px 14px 11px',boxShadow:T.shSm,textAlign:'left',borderLeft:\`3px solid \${T.gold}\`}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:'-0.025em',marginBottom:5}}>{s.big}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text2,marginBottom:2,lineHeight:1.3}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.sub}</div>
            </div>
          ))}
        </div>`;

// Since we're replacing the whole landing block, we need to match from the
// `if (!campaign) return (` opening all the way to the matching `  )`.
// Safest approach: anchor on a signature chunk that appears exactly once.
// The Hero stats block above is distinctive enough — we'll anchor on a unique
// substring and then extend through to the end of the landing block.
//
// Actually, cleanest: anchor on the full block with careful start+end markers.
// Start marker: the opening `if (!campaign) return (`
// End marker:   the closing `  )` followed by blank line + `// ── Chat view`
//
// But matching a multiline anchor including 130+ lines is risky if anything
// has drifted. So we'll use a different approach: do the replacement as
// TWO surgical edits:
//   Edit A: replace just the inner <div style={{textAlign:'center'}}> ... </div>
//           with the new phone-first content (everything between the title and
//           the closing </div></div>)
//
// The outer wrapper stays unchanged, only the inner content changes.

// Re-plan: anchor on the content from the {/* Hero stats ... */} comment
// through the closing of the Top Contact conditional. Replace with new content.

const INNER_OLD = `        {/* Hero stats — AI vs Manual */}
        <div style={{display:'flex',gap:10,maxWidth:580,margin:'0 auto 28px',flexWrap:'wrap'}}>
          {[
            {big:'4.4×',  label:'More emails sent',   sub:'vs manual reps'},
            {big:'+138%',      label:'Response-rate lift', sub:'vs 8% baseline'},
            {big:'3.4×',  label:'Revenue generated',  sub:'$97.2k vs $28.4k'},
          ].map((s,i)=>(
            <div key={i} style={{flex:'1 1 150px',background:T.card,border:\`1px solid \${T.border}\`,borderRadius:12,padding:'13px 14px 11px',boxShadow:T.shSm,textAlign:'left',borderLeft:\`3px solid \${T.gold}\`}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:'-0.025em',marginBottom:5}}>{s.big}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text2,marginBottom:2,lineHeight:1.3}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Campaigns + phone preview — side-by-side on desktop, stacked on mobile */}
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
        </div>

        {/* Top contact */}
        {topContact && (
          <div style={{maxWidth:580,margin:'0 auto',padding:'14px 18px',borderRadius:14,border:\`1px solid \${T.border}\`,background:T.card,boxShadow:T.shSm,display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{...LABEL,marginBottom:8}}>Top Contact · Peak</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:14,flexShrink:0}}>{topInitials}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{topContact.name}</div>
                  <div style={{fontSize:12,color:T.text3,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{topContact.title}</div>
                </div>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{...LABEL,marginBottom:3}}>Score</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:600,color:scoreColor(topScore)}}>{topScore}</div>
            </div>
          </div>
        )}`;

const INNER_NEW = `        {/* PHONE — the hero, centered and large */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:28}}>
          <div style={{width:340,background:'#1A1512',borderRadius:48,padding:14,boxShadow:'0 28px 72px rgba(20,16,13,0.32),0 8px 24px rgba(20,16,13,0.18),inset 0 0 0 1px rgba(255,255,255,0.07)'}}>
            <div style={{background:T.surface,borderRadius:36,overflow:'hidden'}}>
              <div style={{height:26,background:'#1A1512',borderRadius:'0 0 16px 16px',margin:'0 auto',width:82}}/>

              {/* Header — label cycles with campaign */}
              <div style={{background:T.green,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:'rgba(196,136,42,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:14,color:T.gold,flexShrink:0}}>G</div>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600,color:'rgba(255,255,255,0.92)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'opacity 0.35s',opacity:chatStep===0?0.5:1}}>{PREVIEW_CAMPAIGNS[cycleIndex].label}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.62)',display:'flex',alignItems:'center',gap:5,marginTop:1}}>
                    Peak
                    <span style={{margin:'0 2px',opacity:.4}}>·</span>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#2ECC71',animation:'tp 1.5s ease-in-out infinite'}}/>
                    <span style={{color:'#2ECC71',fontSize:9.5,fontWeight:600,letterSpacing:'0.03em'}}>LIVE</span>
                  </div>
                </div>
              </div>

              {/* Chat area — bubbles rendered from PREVIEW_CAMPAIGNS[cycleIndex] */}
              <div style={{padding:'16px 14px',display:'flex',flexDirection:'column',gap:11,minHeight:240,background:T.bg}}>
                {PREVIEW_CAMPAIGNS[cycleIndex].bubbles.map((b,i)=>{
                  const visible = chatStep > i
                  const isBot = b.side==='bot'
                  return (
                    <div key={\`\${cycleIndex}-\${i}\`} style={{
                      display:'flex', gap:isBot?7:0,
                      justifyContent:isBot?'flex-start':'flex-end',
                      alignItems:isBot?'flex-end':'center',
                      opacity:visible?1:0,
                      transform:visible?'translateY(0)':'translateY(7px)',
                      transition:'opacity 0.45s ease, transform 0.45s ease',
                    }}>
                      {isBot && (
                        <div style={{width:24,height:24,borderRadius:7,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:T.gold,fontFamily:"'Inter',sans-serif",flexShrink:0}}>A</div>
                      )}
                      <div style={{
                        maxWidth:isBot?'82%':'74%',
                        padding:'9px 12px',fontSize:12.5,lineHeight:1.45,
                        background:isBot?T.card:T.green,
                        color:isBot?T.text:'white',
                        border:isBot?\`1px solid \${T.border}\`:'none',
                        boxShadow:isBot?'0 1px 4px rgba(0,0,0,0.08)':'none',
                        borderRadius:isBot?'14px 14px 14px 4px':'14px 14px 4px 14px',
                      }}>{b.text}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{background:'white',margin:'0 12px 12px',borderRadius:11,padding:'9px 11px',display:'flex',alignItems:'center',gap:9}}>
                <div style={{flex:1,fontSize:12,color:T.text3}}>Message Grip…</div>
                <div style={{width:28,height:28,borderRadius:7,background:T.surface,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Caption — ties preview to action below */}
          <div style={{marginTop:16,textAlign:'center',maxWidth:320,lineHeight:1.5}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.gold,letterSpacing:'0.12em',textTransform:'uppercase',fontWeight:700,marginBottom:4}}>Live Preview</div>
            <div style={{fontSize:13,color:T.text2}}>Pick a campaign below to chat live with Grip</div>
          </div>
        </div>

        {/* Campaign pills — slim row of 4 */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',maxWidth:720,margin:'0 auto 44px'}}>
          {CAMPAIGNS.map(cam=>(
            <button key={cam.id} className="dcamp" onClick={()=>selectCampaign(cam)}
              style={{background:T.card,borderRadius:11,padding:'10px 14px 10px 11px',border:\`1.5px solid \${T.border}\`,boxShadow:T.shSm,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:9,flex:'1 1 150px',maxWidth:200,transition:'all 0.18s ease'}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.goldBg,display:'flex',alignItems:'center',justifyContent:'center',color:T.gold,flexShrink:0}}>{cam.svg}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,color:T.text,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',flex:1}}>{cam.label}</div>
            </button>
          ))}
        </div>

        {/* Proof section — AI vs Manual, moved to bottom */}
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:T.text3}}>By the numbers · AI vs Manual</div>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}}>
            {[
              {big:'4.4×',  label:'More emails sent',   sub:'vs manual reps'},
              {big:'+138%', label:'Response-rate lift', sub:'vs 8% baseline'},
              {big:'3.4×',  label:'Revenue generated',  sub:'$97.2k vs $28.4k'},
            ].map((s,i)=>(
              <div key={i} style={{flex:'1 1 180px',maxWidth:240,background:T.card,border:\`1px solid \${T.border}\`,borderRadius:12,padding:'14px 16px 12px',boxShadow:T.shSm,textAlign:'center'}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:'-0.025em',marginBottom:5}}>{s.big}</div>
                <div style={{fontSize:12,fontWeight:600,color:T.text2,marginBottom:2,lineHeight:1.3}}>{s.label}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>`;

// ───────────────────────────────────────────────────────────────────────────
// Runner
// ───────────────────────────────────────────────────────────────────────────

function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function run() {
  if (!fs.existsSync(AGENT_FILE)) { console.error('Missing: ' + AGENT_FILE); process.exit(1); }

  let src = readNormalized(AGENT_FILE);

  // Idempotency — the new layout includes this distinctive comment
  if (src.includes('PHONE — the hero, centered and large') && src.includes('Proof section — AI vs Manual')) {
    console.log('Phone-first restructure already applied. Nothing to do.');
    return;
  }

  const count = src.split(INNER_OLD).length - 1;
  if (count === 0) {
    console.error('FAIL: landing block anchor not found.');
    console.error('The file may have been edited since the last script ran.');
    process.exit(1);
  }
  if (count > 1) {
    console.error('FAIL: landing block anchor matched ' + count + ' times (expected 1).');
    process.exit(1);
  }

  src = src.replace(INNER_OLD, INNER_NEW);
  fs.writeFileSync(AGENT_FILE, src, 'utf8');

  console.log('Updated ' + AGENT_FILE);
  console.log('  + phone grown 260 → 340px, centered as hero');
  console.log('  + bubble font 10.5 → 12.5px');
  console.log('  + campaign tiles collapsed to slim pill row');
  console.log('  + hero stats moved to bottom as proof');
  console.log('  - Top Contact card removed from landing');
  console.log('');
  console.log('Next: npm run dev → verify at localhost:5173');
  console.log('Then: git add . && git commit -m "demo: phone-first hero landing" && git push');
}

run();
