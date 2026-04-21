/* ═══════════════════════════════════════════════════════════════════════════
   setup_project.js — Remove "PS | Peak | Demo" header bar from Demo sidebar
   ─────────────────────────────────────────────────────────────────────────
   Strips the entire {/* Header */} block from src/demo/DemoApp.jsx.
   Uses a regex anchored on the comment markers so it's immune to CRLF/LF.
═══════════════════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'demo', 'DemoApp.jsx');

/* Regex explanation:
   - Matches the {/* Header *∕} comment (escaped)
   - Then any whitespace/newlines
   - Then the opening <div …borderBottom…> … </div></div> closing the header
   - Stops before the next {/* User *∕} comment
   [\s\S]*? is a non-greedy "any character including newline"
   This survives CRLF, LF, or any indentation differences. */
const HEADER_REGEX = /\{\/\* Header \*\/\}[\s\S]*?(?=\s*\{\/\* User \*\/\})/;

function run() {
  if (!fs.existsSync(FILE)) {
    console.error(`❌ File not found: ${FILE}`);
    process.exit(1);
  }

  const src = fs.readFileSync(FILE, 'utf8');

  // Idempotency — already removed?
  if (!src.includes('{/* Header */}')) {
    console.log('ℹ️  Header block already removed. Nothing to do.');
    return;
  }

  const match = src.match(HEADER_REGEX);
  if (!match) {
    console.error('❌ Could not locate the {/* Header */} block.');
    console.error('   The file may have been edited since this script was generated.');
    process.exit(1);
  }

  // Safety: the block we're removing should contain the unique PS+Peak+Demo markers
  const block = match[0];
  const expectedMarkers = ['>PS<', '>M<', '>Demo<'];
  const missing = expectedMarkers.filter(m => !block.includes(m));
  if (missing.length) {
    console.error(`❌ Safety check failed. Expected markers missing from matched block: ${missing.join(', ')}`);
    console.error('   Aborting to prevent removing the wrong section.');
    process.exit(1);
  }

  const updated = src.replace(HEADER_REGEX, '');
  fs.writeFileSync(FILE, updated, 'utf8');

  console.log('✅ Removed {/* Header */} block from src/demo/DemoApp.jsx');
  console.log(`   • Deleted ${block.split('\n').length} lines containing PS | Peak | Demo bar`);
  console.log('');
  console.log('Next: git add . && git commit -m "demo: remove top header bar" && git push');
}

run();