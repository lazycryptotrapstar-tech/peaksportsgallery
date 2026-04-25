// ═══════════════════════════════════════════════════════════════════════════
// setup_project.js — Replace "Devin" with "Grip" in CRM sample draft
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'demo', 'DemoCRM.jsx');

const OLD = `Go Mountaineers,
Devin`;
const NEW = `Go Mountaineers,
Grip`;

function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function run() {
  if (!fs.existsSync(FILE)) {
    console.error('Missing: ' + FILE);
    process.exit(1);
  }

  const src = readNormalized(FILE);

  if (src.includes(NEW) && !src.includes(OLD)) {
    console.log('Already replaced. Nothing to do.');
    return;
  }

  const count = src.split(OLD).length - 1;
  if (count !== 1) {
    console.error('Expected exactly 1 match, found ' + count + '. Aborting.');
    process.exit(1);
  }

  const updated = src.replace(OLD, NEW);
  fs.writeFileSync(FILE, updated, 'utf8');

  console.log('Updated ' + FILE);
  console.log('  Sample draft signature: Devin -> Grip');
  console.log('');
  console.log('Next: git add . && git commit -m "demo: replace Devin with Grip in sample draft" && git push');
}

run();
