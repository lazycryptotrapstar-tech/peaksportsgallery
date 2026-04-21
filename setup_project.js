/* ═══════════════════════════════════════════════════════════════════════════
   setup_project.js — Demo sidebar: Grip.ai → Peak.ai wordmark + logo swap
   ─────────────────────────────────────────────────────────────────────────
   Uses three independent single-line replacements to be immune to
   CRLF vs LF line-ending differences on Windows.
═══════════════════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'demo', 'DemoApp.jsx');

/* ─── Three independent single-line replacements ──────────────────────────
   Each anchor is unique within DemoApp.jsx, so order does not matter
   and no multi-line template literal is needed.
──────────────────────────────────────────────────────────────────────────*/

const replacements = [
  {
    label: 'Logo tile (gold "A" → /peak_logo.png)',
    old: `<div style={{width:36,height:36,borderRadius:9,background:'rgba(196,136,42,0.18)',border:'1.5px solid rgba(196,136,42,0.32)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:T.gold,flexShrink:0}}>A</div>`,
    new: `<img src="/peak_logo.png" alt="Peak" style={{width:36,height:36,borderRadius:10,objectFit:'contain',background:'white',padding:3,flexShrink:0}}/>`,
  },
  {
    label: 'Wordmark (Grip.ai → Peak.ai)',
    old: `<div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'rgba(255,255,255,0.90)',lineHeight:1.2}}>Grip<span style={{color:T.gold}}>.ai</span></div>`,
    new: `<div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:'white',lineHeight:1.1}}>Peak<span style={{color:T.gold}}>.ai</span></div>`,
  },
  {
    label: 'Subtitle (Peak University · Demo → World Conference)',
    old: `<div style={{fontSize:11,color:'rgba(255,255,255,0.32)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Peak University · Demo</div>`,
    new: `<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Peak University · World Conference</div>`,
  },
];

function run() {
  if (!fs.existsSync(FILE)) {
    console.error(`❌ File not found: ${FILE}`);
    process.exit(1);
  }

  let src = fs.readFileSync(FILE, 'utf8');

  // Idempotency check — already applied?
  if (src.includes('<img src="/peak_logo.png" alt="Peak"') &&
      src.includes('>Peak<span style={{color:T.gold}}>.ai</span>')) {
    console.log('ℹ️  Change already applied. Nothing to do.');
    return;
  }

  // Pre-flight: verify every anchor exists exactly once before writing anything
  for (const r of replacements) {
    const count = src.split(r.old).length - 1;
    if (count === 0) {
      console.error(`❌ Anchor not found: ${r.label}`);
      console.error(`   Expected string: ${r.old.slice(0, 90)}...`);
      process.exit(1);
    }
    if (count > 1) {
      console.error(`❌ Anchor matched ${count} times (expected 1): ${r.label}`);
      process.exit(1);
    }
  }

  // All anchors verified — apply every replacement
  for (const r of replacements) {
    src = src.replace(r.old, r.new);
  }

  fs.writeFileSync(FILE, src, 'utf8');

  console.log('✅ Updated src/demo/DemoApp.jsx');
  for (const r of replacements) console.log(`   • ${r.label}`);
  console.log('');
  console.log('Next: npm run dev   →   then hard-refresh the browser (Ctrl+Shift+R)');
}

run();