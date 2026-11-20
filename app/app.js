// Leonida Trophy Guide — store + UI. One page, three views (checklist, guide, roadmap),
// progress saved in localStorage, export/import as a JSON file. No network at run time:
// the only fetch is the app's own data/trophies.json, and source links are data, opened
// only when the reader follows one.
const STORE_KEY = 'gta6-trophy-guide-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers';
const DEMO_EARNED = [2, 3, 4, 5, 6, 8, 9, 16, 21, 33, 44, 53];

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const guideListEl = $('guideList');
const timelineEl = $('timeline');
const sourceListEl = $('sourceList');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    if (saved && Array.isArray(saved.earned)) return new Set(saved.earned.filter((n) => trophies.some((t) => t.name === n)));
  } catch { /* corrupted save: start fresh */ }
  if (params.has('demo')) return new Set(DEMO_EARNED.map((id) => trophies.find((t) => t.id === id).name));
  return new Set();
}
let earned = loadStore();
let hideSpoilers = params.has('spoilers') ? params.get('spoilers') !== '0' : localStorage.getItem(SPOILER_KEY) === '1';
let activeKind = params.get('kind') ?? 'all';
let activeGrade = 'all';
let activeTab = params.get('tab') ?? 'checklist';
let query = '';

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ game: data.game, earned: [...earned] }));
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? '1' : '0');
}

function isSpoilerHidden(t) {
  return hideSpoilers && t.kind === 'story' && !earned.has(t.name);
}

function applyFilters(list) {
  return list.filter((t) => {
    if (activeKind === 'missable' && !t.missable) return false;
    if (activeKind === 'online') return false;
    if (activeKind !== 'all' && activeKind !== 'missable' && activeKind !== 'online' && t.kind !== activeKind) return false;
    if (activeGrade !== 'all' && t.grade !== activeGrade) return false;
    if ($('hideEarned').checked && earned.has(t.name)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function gradeBadge(t) {
  const label = { platinum: 'PLAT', gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' }[t.grade];
  return `<span class="badge ${t.grade}">${label}</span>`;
}

function sourceLinks(t) {
  return t.sources.map((s) => {
    if (!s.url) return `<span class="src-name">${s.name}</span>`;
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    return a.outerHTML;
  }).join(' &middot; ');
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = `card ${t.grade}${earned.has(t.name) ? ' earned' : ''}${t.missable ? ' missable' : ''}`;
  const hidden = isSpoilerHidden(t);
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', hidden ? 'Mark hidden story trophy earned' : `Mark ${t.name} earned`);
  box.addEventListener('change', () => { toggleEarned(t, box.checked); });
  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = hidden
    ? `<h3>Hidden story trophy</h3><p class="desc">Earn this trophy to reveal its name and description. (Spoiler setting is on.)</p>`
    : `<h3>${t.name}${t.missable ? ' <span class="missable-flag">MISSABLE</span>' : ''}${t.hidden ? ' <span class="hidden-flag">HIDDEN</span>' : ''}</h3>
       <p class="desc">${t.description}</p>
       ${t.count ? `<p class="count">Target: ${t.count.toLocaleString('en-US')}</p>` : ''}`;
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.innerHTML = `${gradeBadge(t)}<span class="kind">${t.kind}</span><span class="stage">Roadmap stage ${t.stage}</span>`;
  li.append(box, body, meta);
  return li;
}

function renderChecklist() {
  const list = applyFilters(trophies);
  rowsEl.replaceChildren(...list.map(trophyCard));
  $('emptyOnline').hidden = activeKind !== 'online';
  $('emptyMissable').hidden = !(activeKind === 'missable');
  $('emptyNone').hidden = !(list.length === 0 && activeKind !== 'online');
  document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === activeKind));
  $('grade').value = activeGrade;
  $('progressText').textContent = `${earned.size} of ${trophies.length} earned — ${Math.round((earned.size / trophies.length) * 100)}% to platinum`;
  $('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
}

function renderGuide() {
  const list = applyFilters(trophies);
  guideListEl.replaceChildren();
  for (const t of list) {
    const item = document.createElement('div');
    item.className = 'acc';
    item.dataset.tid = String(t.id);
    const hidden = isSpoilerHidden(t);
    const open = params.get('open') === String(t.id);
    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'acc-head';
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    head.innerHTML = `${gradeBadge(t)}<span class="acc-name">${hidden ? 'Hidden story trophy' : t.name}</span>${t.missable ? '<span class="missable-flag">MISSABLE</span>' : ''}<span class="acc-chev">▾</span>`;
    const panel = document.createElement('div');
    panel.className = 'acc-panel';
    panel.hidden = !open;
    panel.innerHTML = hidden
      ? `<p class="desc">Guide hidden until earned — the spoiler setting is on.</p>`
      : `<p class="desc">${t.description}</p><p class="guide">${t.guide}</p><p class="sources">Sources: ${sourceLinks(t)}</p>`;
    head.addEventListener('click', () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      head.setAttribute('aria-expanded', String(willOpen));
    });
    item.append(head, panel);
    guideListEl.append(item);
  }
  if (list.length === 0) guideListEl.innerHTML = '<p class="callout">No trophies match these filters.</p>';
}

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story (60–80 hours)', text: 'Chapters 1–5, all story trophies, and the one thing you must not miss: the Chapter 1 balcony meditation for Positive Mental Attitude (after Down to Earth). Scan vehicles and study animals as you travel — progress already counts toward 100%.' },
  { n: 2, title: 'Stage 2 — 100% completion checklist (~100 hours)', text: 'After the credits the checklist unlocks under Progress, Stats, 100% Completion. Lenient targets: 200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges, 300 stunts. Only robberies, underwater discoveries, shooting ranges, drone races and Bret\u2019s quests need everything.' },
  { n: 3, title: 'Stage 3 — Strangers & Freaks and cleanup (~10 hours)', text: 'Finish the 8 stranger strands and the character questlines (Andy, Kenton, Billy, Randy, Tyrone, Bret), then sweep the miscellaneous trophies: UFO easter egg, bike kicks, cockpit escapes, the blue Banshee through the showroom window.' },
  { n: 4, title: 'Stage 4 — Platinum', text: 'Vice Got a Price! pops when the other 54 are done. No extra step, no online trophy, no second playthrough.' },
];

function renderRoadmap() {
  timelineEl.replaceChildren();
  for (const s of STAGES) {
    const li = document.createElement('li');
    li.className = 'stage';
    const mine = trophies.filter((t) => t.stage === s.n);
    li.innerHTML = `<h3>${s.title}</h3><p>${s.text}</p>`;
    const chips = document.createElement('p');
    chips.className = 'stage-trophies';
    chips.innerHTML = mine.map((t) => `<span class="mini-chip ${earned.has(t.name) ? 'done' : ''}" title="${t.description}">${t.missable ? '⚠ ' : ''}${isSpoilerHidden(t) ? 'Hidden story trophy' : t.name}</span>`).join(' ');
    li.append(chips);
    timelineEl.append(li);
  }
}

function renderSources() {
  sourceListEl.replaceChildren();
  for (const s of data.sources) {
    const li = document.createElement('li');
    if (!s.url) { li.textContent = s.name; }
    else {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.rel = 'noopener';
      li.append(a);
    }
    sourceListEl.append(li);
  }
}

function toggleEarned(t, on) {
  if (on) earned.add(t.name); else earned.delete(t.name);
  saveStore();
  renderChecklist();
  renderGuide();
  renderRoadmap();
}

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  for (const v of ['checklist', 'guide', 'roadmap', 'sources']) $('view-' + v).hidden = v !== tab;
  if (tab === 'guide') renderGuide();
  if (tab === 'roadmap') renderRoadmap();
  if (tab === 'sources') renderSources();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: data.game, exportedAt: new Date().toISOString(), earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  $('ioStatus').textContent = `Exported ${earned.size} earned trophies to gta6-trophy-progress.json.`;
}

async function importProgress(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = names.filter((n) => trophies.some((t) => t.name === n));
    earned = new Set(known);
    saveStore();
    renderChecklist(); renderGuide(); renderRoadmap();
    $('ioStatus').textContent = `Imported ${known.length} earned trophies${names.length - known.length ? ` (${names.length - known.length} unknown names skipped)` : ''}.`;
  } catch {
    $('ioStatus').textContent = 'Import failed: that file is not a trophy-progress export from this guide.';
  }
}

document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
document.querySelectorAll('#kindChips .chip').forEach((c) => c.addEventListener('click', () => { activeKind = c.dataset.kind; renderChecklist(); if (activeTab === 'guide') renderGuide(); }));
$('grade').addEventListener('change', (e) => { activeGrade = e.target.value; renderChecklist(); if (activeTab === 'guide') renderGuide(); });
$('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderChecklist(); if (activeTab === 'guide') renderGuide(); });
$('spoilers').addEventListener('change', (e) => { hideSpoilers = e.target.checked; saveStore(); renderChecklist(); if (activeTab === 'guide') renderGuide(); if (activeTab === 'roadmap') renderRoadmap(); });
$('hideEarned').addEventListener('change', () => { renderChecklist(); if (activeTab === 'guide') renderGuide(); });
$('export').addEventListener('click', exportProgress);
$('import').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
$('reset').addEventListener('click', () => { earned = new Set(); saveStore(); renderChecklist(); renderGuide(); renderRoadmap(); $('ioStatus').textContent = 'Progress reset.'; });

$('spoilers').checked = hideSpoilers;
if (params.get('tab') === 'guide' && params.get('open')) query = '';
renderChecklist();
setTab(['checklist', 'guide', 'roadmap', 'sources'].includes(activeTab) ? activeTab : 'checklist');
if (activeTab === 'guide' && params.get('open')) {
  document.querySelector(`.acc[data-tid="${params.get('open')}"]`)?.scrollIntoView({ block: 'start' });
}
