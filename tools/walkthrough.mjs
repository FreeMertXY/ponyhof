// Kompletter automatischer Durchlauf aller Kapitel und Nebenaufgaben im echten Browser.
// Jede Aufgabe wird über die echten Interaktionen gelöst (Teleport zum Ort + „E“-Aktion).
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('CERT') && !m.text().includes('Failed to load resource')) { errs++; console.log('console:', m.text()); } });
page.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 4).join(' | ')); });
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(1000);
await page.evaluate(() => localStorage.clear());
await page.reload(); await page.waitForTimeout(1000);
await page.click('#t-new'); await page.waitForTimeout(100);
await page.click('#e-go'); await page.click('#st-skip'); await page.waitForTimeout(100); await page.click('#h-go');
await page.waitForTimeout(500);
const shot = async (n) => { await page.waitForTimeout(300); await page.screenshot({ path: `screenshots/w-${n}.png` }); };
const SIDE = process.env.SIDE !== '0';

await page.evaluate((SIDE) => {
  const g = window.ponyhof;
  g.dialog.show = async () => {};
  window.nextChoice = null;
  g.dialog.choice = async () => { const c = window.nextChoice ?? 0; window.nextChoice = null; return c; };
  g.screens.askName = async (t, d) => d;
  g.fade = async () => {};
  const w = g.wait.bind(g); g.wait = (s) => w(Math.min(s, 0.03));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.T = {
    g, log: [],
    tp(x, y) { const P = g.player; const f = g.world.nearestFree(x, y, { riding: P.riding }); P.x = f.x; P.y = f.y; P.vx = P.vy = 0; P.speed = 0; P.face = 'down'; g.renderer.follow(P.x, P.y, 0, true); },
    idle() { return new Promise((r) => { let n = 0; const chk = () => (++n < 600 && (g.pending.length || g.cutscene || g.dialog.open) ? setTimeout(chk, 50) : r()); setTimeout(chk, 60); }); },
    async talk(id) { const n = g.npcById(id); this.tp(n.x + 1, n.y); await sleep(30); await g.talkTo(id); await this.idle(); },
    // Interaktion über den echten Fokus auslösen
    async use(label, x, y) {
      if (x !== undefined) this.tp(x, y);
      await sleep(80);
      const f = g.findInteraction();
      if (!f || !f.label.includes(label)) throw new Error(`Interaktion „${label}“ nicht gefunden bei ${g.player.x.toFixed(1)},${g.player.y.toFixed(1)} (gefunden: ${f?.label})`);
      g.focus = f; g.interact();
      await this.idle();
    },
    async mount() { if (!g.player.riding) { const h = g.horseEntity(g.S.ridingHorse); this.tp(h.x, h.y); g.toggleRide(); await sleep(30); } },
    async race() {
      await this.idle();
      while (g.race && g.race.phase !== 'done') {
        if (g.race.phase === 'run') { const [x, y] = g.race.track[g.race.next]; g.player.x = x + 0.5; g.player.y = y + 0.5; }
        await sleep(100);
      }
      await this.idle();
    },
    async tame(id) {
      g.inv.add('apple', 12);
      const h = g.horseEntity(id);
      if (g.player.riding) g.player.dismount();
      for (let i = 0; i < 40 && !g.S.horses.some((x) => x.id === id); i++) {
        this.tp(h.x + 1.4, h.y); h.tame && (h.tame.nervous = 0, h.tame.fleeing = 0);
        await g.offerTame(h); await sleep(30);
      }
      await this.idle();
      if (!g.S.horses.some((x) => x.id === id)) throw new Error('Zähmen fehlgeschlagen: ' + id);
    },
    give(items) { for (const [id, n] of Object.entries(items || {})) if (g.inv.count(id) < n) g.inv.add(id, n - g.inv.count(id)); },
    async solve(q) {
      const Q = g.quests, step = Q.step(q), S = g.S;
      if (!step) return;
      const t = step.type;
      if (t === 'talk') return this.talk(step.npc);
      if (t === 'deliver') { this.give(step.items); return this.talk(step.npc); }
      if (t === 'reach') { const tg = Q.stepTarget(q); this.tp(tg.x, tg.y); await sleep(300); Q.checkPassive(); return; }
      if (t === 'talkAll') { for (const n of step.npcs) await this.talk(n); return; }
      if (t === 'tame') return this.tame(step.horse);
      if (t === 'friendship') { S.horses[0].pts = 60; Q.checkPassive(); return; }
      if (t === 'album') { for (const sp of ['rabbit', 'frog', 'crab', 'deer', 'fox', 'seal']) S.album[sp] = { day: 1 }; Q.checkPassive(); return; }
      const ev = step.ev;
      const P = g.player;
      switch (ev) {
        case 'pet_horse': g.careAction(S.horses[0], 'pet'); return;
        case 'feed_horse': g.inv.add('carrot', 1); g.careAction(S.horses[0], 'feed', 'carrot'); return;
        case 'plant': case 'water': case 'harvest': {
          if (P.riding) P.dismount();
          g.inv.add('seed_carrot', 3);
          for (let i = 0; i < 3; i++) { const pl = g.world.gardenPlots[i]; this.tp(pl.x + 0.5, pl.y + 1.3); P.face = 'up'; await this.use(ev === 'plant' ? 'Säen' : ev === 'water' ? 'Gießen' : 'Ernten'); if (ev === 'water' && i === 2) g.growCrops(10, false); }
          return;
        }
        case 'find_kitten': return this.use('Krümel', g.world && 21.5, 74.8);
        case 'tame': return this.tame('kleeblatt');
        case 'race': { const npc = step.target.npc; await this.mount(); await this.talk(npc); return this.race(); }
        case 'parcours': { await this.mount(); await this.use('Parcours', 88.5, 67); return this.race(); }
        case 'picnic': { this.give(step.needs); await this.mount(); this.tp(41.5, 146.8); return this.use('Picknick'); }
        case 'telescope': { if (P.riding) P.dismount(); return this.use('Fernrohr', 106.5, 7.4); }
        case 'read_letter': { if (P.riding) P.dismount(); return this.use('Rosa Brief', 66.5, 88.9); }
        case 'dock_date': return this.use('Mert treffen', 54.5, 141.8);
        case 'find_mira': return this.use('Mira rufen', 125.8, 48.5);
        case 'ride_lookout': { await this.mount(); this.tp(106.5, 20); await sleep(200); this.tp(106.5, 11); await sleep(600); return this.idle(); }
        case 'kittens': { if (P.riding) P.dismount(); return this.use('Im Heu', 87.5, 86.2); }
        case 'mira_trick': { if (P.riding) P.dismount(); const m = g.pets.mira; for (let i = 0; i < 3; i++) { this.tp(m.x + 0.6, m.y); window.nextChoice = 2; g.petAnimal(m); await this.idle(); } return; }
        case 'dog_show': { if (P.riding) P.dismount(); return this.use('Hundeshow', 132.5, 101.4); }
        case 'find_flamingo': return this.use('Elsternnest', 31.5, 48.4);
        case 'give_manni': { if (P.riding) P.dismount(); const m = g.pets.manni; m.x = 90.5; m.y = 91.5; return this.use('Flamingo geben', 91.3, 91.5); }
        case 'heartstone': { for (const p of g.world.pickups.filter((x) => x.k === 'heartstone')) { await this.mount(); this.tp(p.x, p.y); await sleep(120); } return; }
        case 'stargaze': { if (P.riding) P.dismount(); window.nextChoice = 0; return this.use('Sterne', 86.5, 128.4); }
        default: throw new Error('Unbekanntes Ereignis ' + ev);
      }
    },
  };
}, SIDE);

const ev = (fn, ...a) => page.evaluate(fn, ...a);
const status = () => ev(() => { const g = window.ponyhof; return { ch: g.quests.chapter(), active: g.quests.active().map((q) => q.id + '@' + g.S.quests[q.id].step), farm: Object.entries(g.S.farm).filter(([, v]) => v).map(([k]) => k).join(','), coins: g.S.player.coins }; });

let guard = 0, lastCh = 0;
const shotsAt = { 4: 'kap4', 5: 'kap5', 6: 'kap6' };
while (guard++ < 200) {
  const st = await status();
  if (st.ch !== lastCh) { console.log(`Kapitel ${st.ch}:`, JSON.stringify(st)); if (shotsAt[st.ch]) await shot(shotsAt[st.ch]); lastCh = st.ch; }
  const done = await ev(() => window.ponyhof.quests.isActive('k4_fest'));
  if (done) break;
  const res = await ev(async (SIDE) => {
    const g = window.ponyhof, Q = g.quests;
    try {
      if (SIDE) for (const q of Q.available()) { await T.talk(q.giver); }
      const act = Q.active().filter((q) => q.id !== 'k4_fest');
      const q = act.find((x) => x.main) || act[0];
      if (!q) return 'keine Aufgabe';
      const before = JSON.stringify(g.S.quests[q.id]);
      await T.solve(q);
      await T.idle();
      const after = JSON.stringify(g.S.quests[q.id]);
      return before === after ? 'KEIN FORTSCHRITT bei ' + q.id + ' ' + JSON.stringify(Q.step(q)) : 'ok ' + q.id;
    } catch (e) { return 'FEHLER ' + e.message; }
  }, SIDE);
  if (!res.startsWith('ok')) { console.log(res); if (res.startsWith('FEHLER') || res.startsWith('KEIN')) { await shot('fehler'); break; } }
}
// Nebenaufgaben zu Ende bringen
if (SIDE) {
  const rest = await ev(async () => {
    const g = window.ponyhof, Q = g.quests, out = [];
    for (let i = 0; i < 40; i++) {
      for (const q of Q.available()) await T.talk(q.giver);
      const side = Q.active().filter((q) => !q.main);
      if (!side.length) break;
      try { await T.solve(side[0]); await T.idle(); } catch (e) { out.push('FEHLER ' + side[0].id + ': ' + e.message); break; }
    }
    return { out, done: Q.done().filter((q) => !q.main).map((q) => q.id), open: Q.active().filter((q) => !q.main).map((q) => q.id) };
  });
  console.log('Nebenaufgaben', JSON.stringify(rest));
}
console.log('vor Finale', JSON.stringify(await status()));
// Finale
await ev(async () => { const g = T.g; await T.mount(); T.tp(g.npcById('hilde').x + 1, g.npcById('hilde').y); g.talkTo('hilde'); });
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
for (let i = 0; i < 80; i++) { const has = await page.$('#st-next'); if (has) break; await page.waitForTimeout(500); }
await shot('18-credits1');
let pages = 0;
for (let i = 0; i < 12 && (await page.$('#st-next')); i++) { await page.click('#st-next'); pages++; await page.waitForTimeout(350); await shot('19-credits-' + i); }
await shot('20-stats');
await page.click('#cr-go');
await page.waitForTimeout(2500);
await shot('21-after');
console.log('Abspann-Seiten', pages);
console.log(await ev(() => JSON.stringify({ state: T.g.state, ending: T.g.S.ending, horses: T.g.S.horses.map((h) => h.name), mem: T.g.S.memories.map((m) => m.type), questsDone: T.g.quests.done().length, kittens: T.g.S.flags.kittens })));
// Speichern & Laden nach dem Ende
await page.reload(); await page.waitForTimeout(1200);
await page.click('#t-cont'); await page.waitForTimeout(1000);
console.log('nach Neuladen', await ev(() => JSON.stringify({ state: window.ponyhof.state, kittens: (window.ponyhof.kittens || []).length, foal: window.ponyhof.horses.some((h) => h.foal) })));
console.log('errors', errs);
await browser.close();
