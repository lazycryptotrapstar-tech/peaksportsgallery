// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Remove "PS | Peak | Demo" header bar from Demo sidebar
// ───────────────────────────────────────────────────────────────────────────
// Strips the JSX "Header" comment block from src/demo/DemoApp.jsx.
// Uses a regex anchored on the JSX comment markers so it survives CRLF/LF
// line endings on Windows.
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'demo', 'DemoApp.jsx');

// Regex: find the JSX "Header" comment, then capture everything up to the
// "User" comment. [\s\S]*? is non-greedy "any char including newline".
// Anchored on the JSX comment markers — not on line endings — so this is
// immune to CRLF vs LF and to indentation shifts.
const HEADER_REGEX = /\{\/\* Header \*\/\}[\s\S]*?(?=\s*\{\/\* User \*\/\})/;

function run() {
  if (!fs.existsSync(FILE)) {
    console.error('File not found: ' + FILE);
    process.exit(1);
  }

  const src = fs.readFileSync(FILE, 'utf8');

  // Already removed?
  if (!src.includes('{/* Header */}')) {
    console.log('Change already applied. Nothing to do.');
    return;
  }

  const match = src.match(HEADER_REGEX);
  if (!match) {
    console.error('Could not locate the Header JSX comment block.');
    process.exit(1);
  }

  // Safety net: the matched block must contain the unique PS|M|Demo markers
  const block = match[0];
  const expectedMarkers = ['>PS<', '>M<', '>Demo<'];
  const missing = expectedMarkers.filter(m => !block.includes(m));
  if (missing.length) {
    console.error('Safety check failed. Missing markers: ' + missing.join(', '));
    console.error('Aborting to prevent removing the wrong section.');
    process.exit(1);
  }

  const updated = src.replace(HEADER_REGEX, '');
  fs.writeFileSync(FILE, updated, 'utf8');

  console.log('Removed Header block from src/demo/DemoApp.jsx');
  console.log('Deleted ' + block.split('\n').length + ' lines (PS | Peak | Demo bar)');
  console.log('');
  console.log('Next: git add . && git commit -m "demo: remove top header bar" && git push');
}

run();
