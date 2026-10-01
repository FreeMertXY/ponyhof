// Schnelltest Teil 2: Direktstart, Intro, Jahreszeiten-Screenshots
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
p.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')); });
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) { errs++; console.log('console:', m.text()); } });
await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(1000);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
await p.screenshot({ path: 'screenshots/p2-title.png' });
await p.click('#t-p2'); await p.waitForTimeout(2500);
for (let i = 0; i < 4; i++) { await p.screenshot({ path: `screenshots/p2-intro-${i}.png` }); await p.click('#st-next'); await p.waitForTimeout(400); }
await p.waitForTimeout(3000);
const st = await p.evaluate(() => { const g = window.ponyhof; return { state: g.state, season: g.S.season, part2: g.S.part2, active: g.quests.active().map((q) => q.id), npcs: g.npcs.filter((n) => n.visible).map((n) => n.id) }; });
console.log(JSON.stringify(st));
await p.screenshot({ path: 'screenshots/p2-autumn-farm.png' });
for (const season of ['winter', 'spring', 'summer']) {
  await p.evaluate(async (season) => { const g = window.ponyhof; g.dialog.show = async () => {}; await (await import('/src/part2.js')).changeSeason(g, season); }, season);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `screenshots/p2-${season}-farm.png` });
}
console.log('errors', errs);
await b.close();
