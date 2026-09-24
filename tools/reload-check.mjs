// Prüft, ob Szenen nach dem Neuladen mitten drin sauber weiterlaufen (Ausritt mit Mert, Mira suchen).
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
page.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message); });
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) { errs++; console.log('console:', m.text()); } });
await page.goto('http://localhost:8080/index.html'); await page.waitForTimeout(800);
await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(800);
await page.click('#t-new'); await page.waitForTimeout(100);
await page.click('#e-go'); await page.click('#st-skip'); await page.waitForTimeout(100); await page.click('#h-go');
await page.waitForTimeout(500);
// Spielstand: Kapitel 4, Ausritt läuft (Schritt 2), Mira verschwunden
await page.evaluate(async () => {
  const g = window.ponyhof, S = g.S;
  const { QUESTS } = await import('/src/data/quests.js');
  const { WILD_HORSES } = await import('/src/data/horses.js');
  const { makeHorseRecord } = await import('/src/horses.js');
  for (const q of QUESTS) if (q.main && q.chapter <= 3) S.quests[q.id] = { state: 'done' };
  S.quests.h_brief = { state: 'done' };
  S.quests.h_ausritt = { state: 'active', step: 1, p: 0, got: [] };
  S.quests.h_mira = { state: 'active', step: 1, p: 0, got: [] };
  S.flags.miraLost = true;
  const d = WILD_HORSES[0];
  S.horses.push(makeHorseRecord({ id: d.id, name: d.name, coat: d.coat, mane: d.mane, marking: d.marking, socks: d.socks, personality: d.personality }));
  g.saveNow();
});
await page.reload(); await page.waitForTimeout(800);
await page.click('#t-cont'); await page.waitForTimeout(1500);
const r1 = await page.evaluate(() => { const g = window.ponyhof; return { escort: !!g.escort, mertVisible: g.npcById('mert').visible, mira: [g.pets.mira.x, g.pets.mira.y, g.pets.mira.mode], ch: g.quests.chapter?.() }; });
console.log('nach Laden', JSON.stringify(r1));
// Mira finden
await page.evaluate(async () => {
  const g = window.ponyhof; g.dialog.show = async () => {}; g.dialog.choice = async () => 0; g.fade = async () => {};
  const m = g.pets.mira; const P = g.player; const f = g.world.nearestFree(m.x + 1, m.y); P.x = f.x; P.y = f.y; g.renderer.follow(P.x, P.y, 0, true);
});
await page.waitForTimeout(300);
const lab = await page.evaluate(() => { const f = window.ponyhof.findInteraction(); if (f) { window.ponyhof.focus = f; window.ponyhof.interact(); } return f?.label; });
await page.waitForTimeout(2500);
// Aussichtspunkt erreichen
await page.evaluate(() => { const g = window.ponyhof, P = g.player; const f = g.world.nearestFree(106.5, 10, {}); P.x = f.x; P.y = f.y; g.renderer.follow(P.x, P.y, 0, true); });
await page.waitForTimeout(8000);
const r2 = await page.evaluate(() => { const g = window.ponyhof; return { mira: g.S.quests.h_mira, ausritt: g.S.quests.h_ausritt, escort: !!g.escort, miraLost: g.S.flags.miraLost }; });
console.log('Interaktion:', lab, JSON.stringify(r2));
console.log('errors', errs);
await browser.close();
