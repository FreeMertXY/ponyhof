// Übergang testen: alter Spielstand (v2) mit fertigem Teil 1 → „Fortsetzen“ → Teil 2 startet von selbst.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
p.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')); });
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) { errs++; console.log('console:', m.text()); } });
await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(1000);
await p.evaluate(async () => {
  localStorage.clear();
  const P2 = await import('/src/part2.js');
  const S = P2.makePart2State({});
  // so sah ein Spielstand nach Teil 1 aus
  for (const k of ['season', 'part2', 'photos', 'cloverRewards', 'album2Rewarded']) delete S[k];
  for (const k of ['clovers', 'notes', 'recipes', 'stars']) delete S.collected[k];
  for (const id of Object.keys(S.quests)) if (/^(j\d|s2_)/.test(id)) delete S.quests[id];
  for (const k of ['part2', 'farmshop', 'igelhaus', 'arena', 'school', 'winterlights', 'tulips', 'cottage', 'cottageStyle']) delete S.farm[k];
  S.version = 2;
  S.player.x = 40; S.player.y = 60; // irgendwo im Flüsterwald
  S.player.riding = true;
  localStorage.setItem('ponyhof.save', JSON.stringify({ v: 2, t: Date.now(), data: S }));
});
await p.reload(); await p.waitForTimeout(1200);
await p.screenshot({ path: 'screenshots/p2t-title.png' });
console.log('Titel-Buttons', await p.evaluate(() => [...document.querySelectorAll('#screen button')].map((x) => x.id + ':' + x.textContent.trim()).join(' | ')));
await p.click('#t-cont');
for (let i = 0; i < 30 && !(await p.$('#st-next')); i++) await p.waitForTimeout(250);
await p.screenshot({ path: 'screenshots/p2t-intro.png' });
let n = 0;
while (await p.$('#st-next')) { await p.click('#st-next'); n++; await p.waitForTimeout(400); if (n > 8) break; }
await p.waitForTimeout(3500);
await p.screenshot({ path: 'screenshots/p2t-start.png' });
const st = await p.evaluate(() => { const g = window.ponyhof; return { state: g.state, cut: g.cutscene, season: g.S.season, part2: g.S.part2, active: g.quests.active().map((q) => q.id), tracked: g.S.tracked, pos: [g.player.x.toFixed(1), g.player.y.toFixed(1)], riding: g.player.riding, foal: g.S.horses.find((h) => h.id === 'foal')?.name, version: g.S.version, ch: g.quests.chapter() }; });
console.log('Introkarten', n, JSON.stringify(st));
// nochmal laden: kein zweites Intro
await p.reload(); await p.waitForTimeout(1200);
await p.click('#t-cont'); await p.waitForTimeout(2500);
console.log('2. Laden', await p.evaluate(() => JSON.stringify({ state: window.ponyhof.state, intro: !!document.querySelector('#st-next'), season: window.ponyhof.S.season })));
console.log('errors', errs);
await b.close();
