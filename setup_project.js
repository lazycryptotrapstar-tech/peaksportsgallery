// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Trim sidebar subtitle
// ───────────────────────────────────────────────────────────────────────────
// Changes the subtitle under "Peak.ai" from
//   "Peak University · World Conference"  ->  "Peak University"
// so it fits the 222px sidebar without ellipsis truncation.
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'demo', 'DemoApp.jsx');

const OLD = ">Peak University · World Conference<";
const NEW = ">Peak University<";

function run() {
  if (!fs.existsSync(FILE)) {
    console.error("File not found: " + FILE);
    process.exit(1);
  }

  const src = fs.readFileSync(FILE, 'utf8');

  if (src.includes(NEW) && !src.includes(OLD)) {
    console.log("Already trimmed. Nothing to do.");
    return;
  }

  const count = src.split(OLD).length - 1;
  if (count !== 1) {
    console.error("Expected exactly 1 match for subtitle, found " + count + ". Aborting.");
    process.exit(1);
  }

  const updated = src.replace(OLD, NEW);
  fs.writeFileSync(FILE, updated, 'utf8');

  console.log("Updated " + FILE);
  console.log("  Subtitle: 'Peak University \u00b7 World Conference' -> 'Peak University'");
  console.log("");
  console.log("Next: git add . && git commit -m \"demo: trim sidebar subtitle\" && git push");
}

run();
