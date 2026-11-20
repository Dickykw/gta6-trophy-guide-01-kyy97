// Leonida Trophy Guide — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide is plain static files in app/ (index.html, app.js, style.css and
// data/trophies.json — the 55 official PS5 trophies, each with a cited guide in our own
// words). No build step, no network at run time: index.html opens in desktop Chrome with
// the network off and loads only files under app/.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside this file
// to /output (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader) and writes
// /output/dossier.json with buildDossier from the kit's vendored library. Leave
// vendor/makefun-frontend.ts untouched — the scorer rebuilds the dossier with its own
// byte-identical copy and requires the two to match.
//
// Deterministic by construction: the copy is a plain file copy and buildDossier is a pure
// function of the copied tree, so two runs write the same bytes. Run it with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The trophy file is the heart of the entry: refuse to hand in an entry whose list is
// incomplete, instead of silently shipping a broken guide.
const trophyData = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const guided = trophyData.trophies.filter((t) => typeof t.guide === 'string' && t.guide.trim().length > 0);
if (trophyData.trophies.length !== 55 || guided.length !== 55) {
  throw new Error(`expected 55 trophies with guides, found ${trophyData.trophies.length} trophies and ${guided.length} guides`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Screenshots are part of the entry too: the gate wants 3 or 4, so check the count here
// and fail loudly instead of handing in an entry with the wrong number.
const shotCount = readdirSync(join(here, 'screenshots')).filter((f) => !f.startsWith('.')).length;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotCount}`);
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files: app/
// counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`gta6-trophy-guide-01: handed in ${guided.length} guided trophies and ${shotCount} screenshots to ${out}`);
