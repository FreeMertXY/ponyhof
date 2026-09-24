// Kompletter automatischer Durchlauf bis zum Finale (im echten Browser).
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
page.on('console', (m) => { if ((m.type() === 'error') && !m.text().includes('CERT')) { errs++; console.log('console:', m.text()); } });
page.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 4).join(' | ')); });
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(1000);
await page.evaluate(() => localStorage.clear());
await page.reload(); await page.waitForTimeout(1000);
await page.click('#t-new'); await page.waitForTimeout(100);
await page.click('#e-go'); await page.click('#st-skip'); await page.waitForTimeout(100); await page.click('#h-go');
await page.waitForTimeout(500);
const shot = async (n) => { await page.waitForTimeout(350); await page.screenshot({ path: `screenshots/w-${n}.png` }); };
// Schnellmodus einbauen
await page.evaluate(() => {
  const g = window.ponyhof;
  g.dialog.show = async () => {};
  g.dialog.choice = async () => 0;
  g.screens.askName = async (t, d) => d;
  g.fade = async () => {};
  const w = g.wait.bind(g); g.wait = (s) => w(Math.min(s, 0.03));
  window.T = {
    g,
    tp(x, y) { const P = g.player; const f = g.world.nearestFree(x, y, { riding: P.riding }); P.x = f.x; P.y = f.y; P.vx = P.vy = 0; P.speed = 0; g.renderer.follow(P.x, P.y, 0, true); },
    async talk(id) { const n = g.npcById(id); this.tp(n.x + 1, n.y); await g.talkTo(id); await this.idle(); },
    idle() { return new Promise((r) => { const chk = () => (g.pending.length || g.cutscene || g.dialog.open ? setTimeout(chk, 50) : r()); setTimeout(chk, 60); }); },
    step(q) { const s = g.S.quests[q]; return s ? `${s.state}:${s.step}` : 'none'; },
    async race() {
      await this.idle();
      while (g.race && g.race.phase !== 'done') {
        if (g.race.phase === 'run') { const [x, y] = g.race.track[g.race.next]; g.player.x = x + 0.5; g.player.y = y + 0.5; }
        await new Promise((r) => setTimeout(r, 120));
      }
      await this.idle();
    },
    async tame(id) {
      g.inv.add('apple', 12);
      const h = g.horseEntity(id);
      if (g.player.riding) g.player.dismount();
      for (let i = 0; i < 40 && !g.S.horses.some((x) => x.id === id); i++) {
        this.tp(h.x + 1.4, h.y);
        h.tame && (h.tame.nervous = 0, h.tame.fleeing = 0);
        await g.offerTame(h);
        await new Promise((r) => setTimeout(r, 40));
      }
      await this.idle();
      return g.S.horses.some((x) => x.id === id);
    },
  };
});
const ev = (fn, ...a) => page.evaluate(fn, ...a);
const log = async (label) => console.log(label, await ev(() => JSON.stringify({ active: window.ponyhof.quests.active().map((q) => q.id + '@' + window.ponyhof.S.quests[q.id].step), farm: window.ponyhof.S.farm, coins: window.ponyhof.S.player.coins })));

// Kapitel 1
await ev(async () => {
  const g = T.g; const rec = g.S.horses[0];
  g.careAction(rec, 'pet'); g.careAction(rec, 'feed', 'carrot');
  await T.talk('hilde');
});
await log('nach Pflege');
await ev(async () => {
  const g = T.g;
  await T.talk('hilde'); // Samen
  for (let i = 0; i < 3; i++) g.gardenAction(i);
  for (let i = 0; i < 3; i++) g.gardenAction(i);
  g.growCrops(10, false);
  for (let i = 0; i < 3; i++) g.gardenAction(i);
  await T.talk('hilde');
});
await ev(() => T.tp(95, 86)); await shot('01-garden');
await ev(async () => { T.tp(126, 96); await new Promise((r) => setTimeout(r, 700)); await T.talk('theo'); });
await shot('02-village');
await ev(async () => {
  const g = T.g;
  await T.talk('berta');
  T.tp(23, 74); await new Promise((r) => setTimeout(r, 700));
  g.findKitten(); await T.idle();
});
await shot('03-forest-kitten');
await ev(async () => { await T.talk('berta'); await T.talk('theo'); await T.talk('mert'); await T.idle(); });
await log('Kapitel 1 fertig');
await ev(() => T.tp(81, 89)); await shot('04-stable-repaired');
// Kapitel 2
await ev(async () => {
  const g = T.g;
  await T.talk('luise');
  for (const p of g.world.pickups.filter((p) => p.k === 'lavender').slice(0, 10)) g.collectPickup(p);
  await T.talk('luise');
  await T.talk('paula');
  T.tp(160, 157); await new Promise((r) => setTimeout(r, 500));
  await T.talk('kuno');
  await T.talk('hilde');
});
await ev(() => T.tp(73, 49)); await shot('05-lavender');
await ev(async () => { const h = T.g.horseEntity('kleeblatt'); T.tp(h.x + 3, h.y); });
await shot('06-wild-horse');
const tamed = await ev(async () => { const ok = await T.tame('kleeblatt'); await T.talk('hilde'); return ok; });
console.log('kleeblatt gezähmt', tamed);
await ev(async () => { const g = T.g; await T.talk('ben'); if (!g.player.riding) { T.tp(g.horseEntity(g.S.ridingHorse).x, g.horseEntity(g.S.ridingHorse).y); g.toggleRide(); } await T.talk('ben'); });
await shot('07-race-start');
await ev(() => T.race());
await ev(async () => { await T.talk('hilde'); await T.idle(); });
await log('Kapitel 2 fertig');
await ev(() => T.tp(82, 99)); await shot('08-paddock');
// Kapitel 3
await ev(async () => { await T.talk('mia'); T.tp(88, 67); T.g.startParcours(); });
await shot('09-parcours');
await ev(async () => { await T.race(); await T.talk('mia'); await T.talk('mia'); await T.race(); });
await ev(async () => {
  const g = T.g;
  await T.talk('berta');
  g.inv.add('apple', 2); g.inv.add('carrot', 2); g.inv.add('bread', 1); g.inv.add('juice', 1);
  T.tp(41.5, 146.5); await new Promise((r) => setTimeout(r, 500));
});
await shot('10-island');
await ev(async () => { const g = T.g; await g.picnic(); await T.idle(); await T.talk('luise'); g.inv.add('poppy', 5); g.inv.add('sunflower', 3); await T.talk('luise'); await T.talk('hilde'); await T.idle(); });
await log('Kapitel 3 fertig');
await ev(() => T.tp(103, 99)); await shot('11-flowergarden');
// Kapitel 4
await ev(async () => { await T.talk('hilde'); const h = T.g.horseEntity('nebel'); T.tp(h.x + 3, h.y); });
await shot('12-mountains-nebel');
console.log('nebel', await ev(async () => { const ok = await T.tame('nebel'); await T.talk('hilde'); return ok; }));
await ev(async () => { const g = T.g; await T.talk('mia'); if (!g.player.riding) { const h = g.horseEntity(g.S.ridingHorse); T.tp(h.x, h.y); g.toggleRide(); } await T.talk('mia'); });
await shot('13-race3');
await ev(() => T.race());
await ev(async () => { await T.talk('hilde'); for (const id of ['berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno']) await T.talk(id); await T.talk('hilde'); });
await ev(async () => { const g = T.g; g.inv.add('daisy', 5); g.inv.add('poppy', 3); g.inv.add('lavender', 3); await T.talk('hilde'); await T.idle(); });
await log('Kapitel 4 fertig');
await ev(() => T.tp(85, 114)); await shot('14-festwiese');
// Finale
await ev(async () => { const g = T.g; T.tp(g.npcById('hilde').x + 1, g.npcById('hilde').y); g.talkTo('hilde'); });
await page.waitForTimeout(1500);
await shot('15-fest');
await ev(async () => {
  const g = T.g;
  for (let i = 0; i < 200 && !g.race; i++) await new Promise((r) => setTimeout(r, 100));
  while (g.race && g.race.phase !== 'done') {
    if (g.race.phase === 'run') { const [x, y] = g.race.track[g.race.next]; g.player.x = x + 0.5; g.player.y = y + 0.5; }
    await new Promise((r) => setTimeout(r, 120));
  }
});
await page.waitForTimeout(2500);
await shot('16-sunset');
await page.waitForTimeout(4000);
await shot('17-fireworks');
for (let i = 0; i < 60; i++) { const has = await page.$('#st-next'); if (has) break; await page.waitForTimeout(500); }
await shot('18-credits1');
for (let i = 0; i < 10 && (await page.$('#st-next')); i++) { await page.click('#st-next'); await page.waitForTimeout(400); if (i === 0) await shot('19-credits-family'); }
await shot('20-stats');
await page.click('#cr-go');
await page.waitForTimeout(2500);
await shot('21-after');
console.log(await ev(() => JSON.stringify({ state: T.g.state, ending: T.g.S.ending, horses: T.g.S.horses.map((h) => h.name), mem: T.g.S.memories.map((m) => m.type) })));
console.log('errors', errs);
await browser.close();
