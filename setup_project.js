/* ═══════════════════════════════════════════════════════════════════════════
   setup_project.js — Demo sidebar: Grip.ai → Peak.ai wordmark + logo swap
   ─────────────────────────────────────────────────────────────────────────
   Changes ONLY the "User" block inside src/demo/DemoApp.jsx:
     • Gold "A" tile        → <img src="/peak_logo.png">
     • "Grip.ai" wordmark   → "Peak.ai" (sized up to match Playbook)
     • "Peak University · Demo" → "Peak University · World Conference"

   DOES NOT touch:
     • DemoCore.js (AI webhook logic)
     • The "PS | Peak | Demo" top header bar
     • Any nav item, any other module file
     • The mobile bottom nav

   Run:
     1. Save this file into the project root:
        C:\Users\dnbch\OneDrive\Documents\Simple Genius\Peak Sports\peaksportsgallery
     2. node setup_project.js
     3. git add . && git commit -m "demo: Peak.ai wordmark + logo" && git push
═══════════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const FILE = path.join('src', 'demo', 'DemoApp.jsx');

/* ─── Exact block to replace (12-space indent, matches DemoApp.jsx) ─────── */
const OLD = `            <div style={{width:36,height:36,borderRadius:9,background:'rgba(196,136,42,0.18)',border:'1.5px solid rgba(196,136,42,0.32)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:T.gold,flexShrink:0}}>A</div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'rgba(255,255,255,0.90)',lineHeight:1.2}}>Grip<span style={{color:T.gold}}>.ai</span></div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.32)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Peak University · Demo</div>
            </div>`;

const NEW = `            <img src="/peak_logo.png" alt="Peak" style={{width:36,height:36,borderRadius:10,objectFit:'contain',background:'white',padding:3,flexShrink:0}}/>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:'white',lineHeight:1.1}}>Peak<span style={{color:T.gold}}>.ai</span></div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Peak University · World Conference</div>
            </div>`;

function run() {
  if (!fs.existsSync(FILE)) {
    console.error(`❌ File not found: ${FILE}`);
    console.error(`   Make sure you're running this from the project root:`);
    console.error(`   C:\\Users\\dnbch\\OneDrive\\Documents\\Simple Genius\\Peak Sports\\peaksportsgallery`);
    process.exit(1);
  }

  const src = fs.readFileSync(FILE, 'utf8');

  // Idempotency check — if already applied, exit quietly
  if (src.includes('<img src="/peak_logo.png" alt="Peak"') &&
      src.includes('>Peak<span style={{color:T.gold}}>.ai</span>')) {
    console.log('ℹ️  Change already applied. Nothing to do.');
    return;
  }

  const count = src.split(OLD).length - 1;

  if (count === 0) {
    console.error('❌ Could not find the expected block in DemoApp.jsx.');
    console.error('   The file may have been edited since this script was generated.');
    console.error('   Open src/demo/DemoApp.jsx and look for the {/* User */} comment block.');
    process.exit(1);
  }

  if (count > 1) {
    console.error(`❌ Expected exactly 1 match, found ${count}. Aborting to prevent corruption.`);
    process.exit(1);
  }

  const updated = src.replace(OLD, NEW);
  fs.writeFileSync(FILE, updated, 'utf8');

  console.log('✅ Updated src/demo/DemoApp.jsx');
  console.log('   • Logo tile: gold "A" → /peak_logo.png');
  console.log('   • Wordmark:  Grip.ai  → Peak.ai');
  console.log('   • Subtitle:  Peak University · Demo → Peak University · World Conference');
  console.log('');
  console.log('Next steps:');
  console.log('   npm run dev            # verify locally at localhost:5173');
  console.log('   git add .');
  console.log('   git commit -m "demo: Peak.ai wordmark + logo in sidebar"');
  console.log('   git push               # Vercel auto-deploys demo.simplegenius.io');
}

run();
