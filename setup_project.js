// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Bundle #1 + #2 + #3
//   1. Animated phone preview on Sales Agent landing
//   2. Example AI draft on CRM empty state
//   3. AI vs Manual hero stats on Sales Agent landing
//
// Touches only: DemoSalesAgent.jsx, DemoCRM.jsx
// Does NOT touch: DemoCore.js, n8n webhooks, Supabase
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const AGENT_FILE = path.join('src', 'demo', 'DemoSalesAgent.jsx');
const CRM_FILE   = path.join('src', 'demo', 'DemoCRM.jsx');

// ───────────────────────────────────────────────────────────────────────────
// DemoSalesAgent edits
// ───────────────────────────────────────────────────────────────────────────

// Edit 1: Add chatStep state right after the sessionId useState
const AGENT_1_OLD = `  const [sessionId] = useState(()=>\`demo-\${Date.now()}\`)`;
const AGENT_1_NEW = `  const [sessionId] = useState(()=>\`demo-\${Date.now()}\`)
  const [chatStep, setChatStep] = useState(0)`;

// Edit 2: Add animation useEffect after the existing scrollIntoView useEffect
const AGENT_2_OLD = `  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:'smooth'}) },[messages,isTyping])`;
const AGENT_2_NEW = `  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:'smooth'}) },[messages,isTyping])

  // ── Phone-preview animation — cycles through 3 chat bubbles on landing ───
  useEffect(() => {
    if (campaign) return
    const timings = [600, 2000, 2000, 2800]
    const id = setTimeout(() => setChatStep(s => (s + 1) % 4), timings[chatStep])
    return () => clearTimeout(id)
  }, [chatStep, campaign])`;

// Edit 3: Insert hero stats between subtitle and campaign tiles
const AGENT_3_OLD = `        <p style={{fontSize:13,color:T.text3,marginBottom:30}}>Start a live conversation with Grip</p>

        {/* Campaign tiles */}`;
const AGENT_3_NEW = `        <p style={{fontSize:13,color:T.text3,marginBottom:22}}>Start a live conversation with Grip</p>

        {/* Hero stats — AI vs Manual */}
        <div style={{display:'flex',gap:10,maxWidth:580,margin:'0 auto 28px',flexWrap:'wrap'}}>
          {[
            {big:'4.4\u00d7',  label:'More emails sent',   sub:'vs manual reps'},
            {big:'+138%',      label:'Response-rate lift', sub:'vs 8% baseline'},
            {big:'3.4\u00d7',  label:'Revenue generated',  sub:'$97.2k vs $28.4k'},
          ].map((s,i)=>(
            <div key={i} style={{flex:'1 1 150px',background:T.card,border:\`1px solid \${T.border}\`,borderRadius:12,padding:'13px 14px 11px',boxShadow:T.shSm,textAlign:'left',borderLeft:\`3px solid \${T.gold}\`}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:'-0.025em',marginBottom:5}}>{s.big}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text2,marginBottom:2,lineHeight:1.3}}>{s.label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.text3,letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Campaign tiles */}`;

// Edit 4: Replace phone chat area with animated version.
// Anchor: the chat container opening through the input bar opening.
const AGENT_4_OLD = `              <div style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,minHeight:180,background:T.bg}}>
                <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Syne',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:T.card,border:\`1px solid \${T.border}\`,color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Hey! Grip here — your Peak Mountaineers ticket rep. Big game at Peak Sports Stadium coming up. What sports are you into?</div>
                </div>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <div style={{maxWidth:'70%',padding:'8px 11px',borderRadius:'13px 13px 3px 13px',background:T.green,color:'white',fontSize:11,lineHeight:1.45}}>I'm interested in football!</div>
                </div>
                <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(196,136,42,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:T.gold,fontFamily:"'Syne',sans-serif"}}>A</div>
                  <div style={{maxWidth:'78%',padding:'8px 11px',borderRadius:'13px 13px 13px 3px',background:T.card,border:\`1px solid \${T.border}\`,color:T.text,fontSize:11,lineHeight:1.45,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>Perfect — the Riverside Hawks rivalry game is coming up. Want me to check availability near the 50?</div>
                </div>
              </div>`;

// NOTE: This already-applied version uses 'Inter' (after our previous swap).
// We also handle that variant below.
const AGENT_4_OLD_INTER = AGENT_4_OLD.replaceAll("'Syne',sans-serif", "'Inter',sans-serif");

const AGENT_4_NEW = `              <div style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,minHeight:180,background:T.bg}}>
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
              </div>`;

// ───────────────────────────────────────────────────────────────────────────
// DemoCRM edit — replace the empty state with an example draft
// ───────────────────────────────────────────────────────────────────────────

const CRM_1_OLD_PART1 = `          {/* Empty state */}
          {!selectedContact&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:16,background:T.goldBg,border:\`1px solid \${T.goldBdr}\`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:14}}>📧</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:T.text,marginBottom:6}}>Select a Contact</div>
              <div style={{fontSize:13,color:T.text3,maxWidth:260,lineHeight:1.6}}>Tap any contact to generate an AI-personalized email draft instantly.</div>
            </div>
          )}`;

const CRM_1_OLD_INTER = CRM_1_OLD_PART1.replaceAll("'Syne',sans-serif", "'Inter',sans-serif");

const CRM_1_NEW = `          {/* Empty state — example draft preview */}
          {!selectedContact&&(
            <div style={{flex:1,overflowY:'auto',padding:'22px 20px 40px'}}>
              <div style={{maxWidth:640,margin:'0 auto'}}>

                {/* Sample badge */}
                <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:T.goldBg,border:\`1px solid \${T.goldBdr}\`,fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:700,color:T.gold,letterSpacing:'0.09em',textTransform:'uppercase'}}>
                    ✨ Sample Draft · Click a contact for a live one
                  </div>
                </div>

                {/* Angle banner */}
                <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 14px',borderRadius:10,background:T.goldBg,border:\`1px dashed \${T.goldBdr}\`,marginBottom:14}}>
                  <svg style={{width:14,height:14,color:T.gold,flexShrink:0,marginTop:2}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:700,color:T.gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>Loyalty Reactivation</div>
                    <div style={{fontSize:12,color:T.text2,lineHeight:1.6}}>12-year season ticket holder · lapsed 2 seasons · Platinum status intact</div>
                  </div>
                </div>

                {/* Email card */}
                <div style={{...CARD,overflow:'hidden',borderStyle:'dashed',marginBottom:18}}>
                  <div style={{padding:'12px 14px',borderBottom:\`1px solid \${T.border}\`}}>
                    <div style={{...LABEL}}>Subject</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.text,lineHeight:1.4}}>Big game coming up — thought of you first</div>
                  </div>
                  <div style={{padding:'14px 14px 16px'}}>
                    <div style={{...LABEL}}>Body</div>
                    <div style={{fontSize:14,lineHeight:1.8,color:T.text,whiteSpace:'pre-wrap'}}>{\`Hey Linda,

The Riverside Hawks rivalry game is this Saturday, and tickets are selling fast. Your Platinum Member status gets you first pick — so I held back 2 seats in Section 108 at the same price you had last year (\$85 each).

Let me know by Friday and I'll lock them in.

Go Mountaineers,
Devin\`}</div>
                  </div>
                </div>

                <div style={{textAlign:'center',fontSize:12,color:T.text3,lineHeight:1.6}}>
                  👈 Pick any contact from the list to generate a live, personalized draft
                </div>
              </div>
            </div>
          )}`;

// ───────────────────────────────────────────────────────────────────────────
// Runner
// ───────────────────────────────────────────────────────────────────────────

function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function applyEdit(src, oldStr, newStr, label) {
  const count = src.split(oldStr).length - 1;
  if (count === 0) return { src, ok: false, reason: 'anchor not found' };
  if (count > 1)  return { src, ok: false, reason: 'anchor matched ' + count + ' times' };
  return { src: src.replace(oldStr, newStr), ok: true };
}

function tryApplyWithFallback(src, primaryOld, fallbackOld, newStr, label) {
  // Try primary first
  let res = applyEdit(src, primaryOld, newStr, label);
  if (res.ok) return res;
  // Try fallback (for already-swapped-to-Inter content)
  if (fallbackOld) {
    res = applyEdit(src, fallbackOld, newStr, label);
    if (res.ok) return res;
  }
  return res;
}

function run() {
  if (!fs.existsSync(AGENT_FILE)) { console.error('Missing: ' + AGENT_FILE); process.exit(1); }
  if (!fs.existsSync(CRM_FILE))   { console.error('Missing: ' + CRM_FILE);   process.exit(1); }

  let agentSrc = readNormalized(AGENT_FILE);
  let crmSrc   = readNormalized(CRM_FILE);

  // ── Idempotency check
  if (agentSrc.includes('chatStep') && agentSrc.includes('Hero stats — AI vs Manual') && crmSrc.includes('Sample Draft')) {
    console.log('All three changes already applied. Nothing to do.');
    return;
  }

  // ── Apply agent edits in order
  const edits = [
    ['Agent #1 chatStep useState',            () => applyEdit(agentSrc, AGENT_1_OLD, AGENT_1_NEW)],
    ['Agent #2 animation useEffect',          () => applyEdit(agentSrc, AGENT_2_OLD, AGENT_2_NEW)],
    ['Agent #3 hero stats',                   () => applyEdit(agentSrc, AGENT_3_OLD, AGENT_3_NEW)],
    ['Agent #4 animated phone bubbles',       () => tryApplyWithFallback(agentSrc, AGENT_4_OLD, AGENT_4_OLD_INTER, AGENT_4_NEW)],
  ];

  for (const [label, fn] of edits) {
    const res = fn();
    if (!res.ok) {
      console.error('FAIL: ' + label + '  (' + res.reason + ')');
      console.error('Aborting — no files written.');
      process.exit(1);
    }
    agentSrc = res.src;
  }

  // ── Apply CRM edit
  const crmRes = tryApplyWithFallback(crmSrc, CRM_1_OLD_PART1, CRM_1_OLD_INTER, CRM_1_NEW);
  if (!crmRes.ok) {
    console.error('FAIL: CRM empty-state replacement  (' + crmRes.reason + ')');
    console.error('Aborting — no files written.');
    process.exit(1);
  }
  crmSrc = crmRes.src;

  // ── All edits succeeded — write both files
  fs.writeFileSync(AGENT_FILE, agentSrc, 'utf8');
  fs.writeFileSync(CRM_FILE,   crmSrc,   'utf8');

  console.log('Updated ' + AGENT_FILE);
  console.log('  + chatStep state');
  console.log('  + phone animation effect');
  console.log('  + hero stats row');
  console.log('  + animated phone bubbles');
  console.log('Updated ' + CRM_FILE);
  console.log('  + example draft in empty state');
  console.log('');
  console.log('Next:');
  console.log('  npm run dev    (verify locally)');
  console.log('  git add . && git commit -m "demo: animated phone + hero stats + example draft" && git push');
}

run();
