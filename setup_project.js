// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Swap Syne to Inter across the demo
// ───────────────────────────────────────────────────────────────────────────
// Changes:
//   1. DemoApp.jsx Google Fonts @import URL  (Syne -> Inter)
//   2. Every inline 'Syne',sans-serif  ->  'Inter',sans-serif  (7 files)
//
// Inter weights loaded: 400, 500, 600, 700, 800 — covers every usage.
// Font-weights, sizes, and letter-spacing values are NOT touched.
// Only the font family string changes.
//
// Single-line replacements only (CRLF-safe). Pre-flight verifies every
// anchor before writing anything — all-or-nothing.
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const DEMO_APP   = path.join('src', 'demo', 'DemoApp.jsx');
const DEMO_FILES = [
  path.join('src', 'demo', 'DemoApp.jsx'),
  path.join('src', 'demo', 'DemoCRM.jsx'),
  path.join('src', 'demo', 'DemoSalesAgent.jsx'),
  path.join('src', 'demo', 'DemoTicketing.jsx'),
  path.join('src', 'demo', 'DemoAnalytics.jsx'),
  path.join('src', 'demo', 'DemoInsights.jsx'),
  path.join('src', 'demo', 'DemoPriority.jsx'),
];

// The Google Fonts @import URL swap — current Syne spec to new Inter spec.
const IMPORT_OLD = "family=Syne:wght@600;700;800";
const IMPORT_NEW = "family=Inter:wght@400;500;600;700;800";

// The inline fontFamily swap — one simple substring replacement.
const FONT_OLD = "'Syne',sans-serif";
const FONT_NEW = "'Inter',sans-serif";

function pluralize(n, word) {
  return n + " " + word + (n === 1 ? "" : "s");
}

function run() {
  // ── Pre-flight: every target file must exist and contain expected content
  const plan = [];
  for (const file of DEMO_FILES) {
    if (!fs.existsSync(file)) {
      console.error("File not found: " + file);
      process.exit(1);
    }
    const src = fs.readFileSync(file, 'utf8');
    const fontCount = src.split(FONT_OLD).length - 1;
    const importCount = file === DEMO_APP
      ? src.split(IMPORT_OLD).length - 1
      : 0;
    plan.push({ file, src, fontCount, importCount });
  }

  // ── Idempotency: if Inter is already in place and no Syne remains, exit
  const totalSyne = plan.reduce((n, p) => n + p.fontCount, 0);
  const appPlan = plan.find(p => p.file === DEMO_APP);
  const alreadyInter = appPlan.src.includes(IMPORT_NEW) && totalSyne === 0;
  if (alreadyInter) {
    console.log("Already using Inter. Nothing to do.");
    return;
  }

  // ── Safety: DemoApp.jsx must contain exactly one @import URL match
  if (appPlan.importCount !== 1) {
    console.error(
      "Expected exactly 1 Google Fonts @import URL in DemoApp.jsx, found " +
      appPlan.importCount + ". Aborting."
    );
    process.exit(1);
  }

  // ── Safety: each file should have at least one Syne usage (except when
  //   DemoApp.jsx has already been partially updated — rare, but possible)
  const emptyFiles = plan.filter(p => p.fontCount === 0);
  if (emptyFiles.length && !alreadyInter) {
    console.warn("Note: the following files have no 'Syne' usages:");
    for (const p of emptyFiles) console.warn("  - " + p.file);
    console.warn("(Continuing — may already be partially applied.)");
  }

  // ── Apply all changes
  for (const p of plan) {
    let updated = p.src;

    if (p.file === DEMO_APP && p.importCount === 1) {
      updated = updated.replace(IMPORT_OLD, IMPORT_NEW);
    }

    if (p.fontCount > 0) {
      updated = updated.split(FONT_OLD).join(FONT_NEW);
    }

    if (updated !== p.src) {
      fs.writeFileSync(p.file, updated, 'utf8');
      const parts = [];
      if (p.file === DEMO_APP && p.importCount === 1) parts.push("@import URL");
      if (p.fontCount > 0) parts.push(pluralize(p.fontCount, "fontFamily"));
      console.log("Updated " + p.file + "  (" + parts.join(", ") + ")");
    } else {
      console.log("No changes needed: " + p.file);
    }
  }

  console.log("");
  console.log("Font swap complete. Syne -> Inter.");
  console.log("Next: git add . && git commit -m \"demo: swap Syne -> Inter\" && git push");
}

run();
