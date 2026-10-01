// Kompletter automatischer Durchlauf von Teil 2 („Vier Jahreszeiten“) im echten Browser.
// Start über „Direkt zu Teil 2“, jede Aufgabe wird über die echten Interaktionen gelöst
// (Teleport zum Ort + „E“-Aktion), inklusive Reitstunden, Rennen, Finale und Abspann.
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
await page.click('#t-p2'); await page.waitForTimeout(2500);
for (let i = 0; i < 6 && (await page.$('#st-next')); i++) { await page.click('#st-next'); await page.waitForTimeout(400); }
for (let i = 0; i < 40; i++) { if (await page.evaluate(() => window.ponyhof.state === 'play' && !window.ponyhof.cutscene)) break; await page.waitForTimeout(250); }
const SHOTS = process.env.SHOTS !== '0';
const shot = async (n) => { if (!SHOTS) return; await page.waitForTimeout(250); await page.screenshot({ path: `screenshots/w2-${n}.png` }); };

await page.evaluate(() => {
  const g = window.ponyhof;
  g.dialog.show = async () => {};
  window.nextChoice = null;
  g.dialog.choice = async () => { const c = window.nextChoice ?? 0; window.nextChoice = null; return c; };
  g.screens.askName = async (t, d) => d;
  g.screens.interiorCard = async () => {};
  g.fade = async () => {};
  const w = g.wait.bind(g); g.wait = (s) => w(Math.min(s, 0.03));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.T = {
    g, warn: [],
    tp(x, y, riding) { const P = g.player; const f = g.world.nearestFree(x, y, { riding: riding ?? P.riding }); P.x = f.x; P.y = f.y; P.vx = P.vy = 0; P.speed = 0; P.face = 'down'; g.renderer.follow(P.x, P.y, 0, true); },
    idle() { return new Promise((r) => { let n = 0; const chk = () => (++n < 800 && (g.pending.length || g.cutscene || g.dialog.open || g.state !== 'play') ? setTimeout(chk, 50) : r()); setTimeout(chk, 80); }); },
    async talk(id) { if (g.player.riding && id !== 'mia') this.dismount(); const n = g.npcById(id); this.tp(n.x + 1, n.y); await sleep(30); await g.talkTo(id); await this.idle(); },
    dismount() { if (g.player.riding) { if (!g.player.dismount()) { this.tp(g.player.x, g.player.y, false); g.player.dismount(); } } },
    async mount() { if (!g.player.riding) { const h = g.horseEntity(g.S.ridingHorse); this.tp(h.x, h.y); g.toggleRide(); await sleep(60); } },
    async use(label, x, y) {
      if (x !== undefined) this.tp(x, y);
      await sleep(90);
      const f = g.findInteraction();
      if (!f || !f.label.includes(label)) throw new Error(`Interaktion „${label}“ nicht gefunden bei ${g.player.x.toFixed(1)},${g.player.y.toFixed(1)} (gefunden: ${f?.label})`);
      g.focus = f; g.interact();
      await this.idle();
    },
    async race() {
      await this.idle();
      for (let i = 0; i < 100 && !g.race; i++) await sleep(50);
      while (g.race && g.race.phase !== 'done') {
        if (g.race.phase === 'run') { const [x, y] = g.race.track[g.race.next]; g.player.x = x + 0.5; g.player.y = y + 0.5; }
        await sleep(100);
      }
      await this.idle();
    },
    async tame(id) {
      g.inv.add('apple', 12);
      this.dismount();
      for (let i = 0; i < 40 && !g.S.horses.some((x) => x.id === id); i++) {
        const h = g.horseEntity(id);
        if (!h) throw new Error('Wildpferd nicht da: ' + id);
        this.tp(h.x + 1.4, h.y); h.tame && (h.tame.nervous = 0, h.tame.fleeing = 0);
        await g.offerTame(h); await sleep(30);
      }
      await this.idle();
      if (!g.S.horses.some((x) => x.id === id)) throw new Error('Zähmen fehlgeschlagen: ' + id);
    },
    give(items) { for (const [id, n] of Object.entries(items || {})) if (g.inv.count(id) < n) g.inv.add(id, n - g.inv.count(id)); },
    async spots(at) {
      const P2 = await import('/src/part2.js');
      const { SPOTS } = await import('/src/world.js');
      if (['photos', 'lanterns', 'birdspots'].includes(at)) return P2.openSpots(g, at);
      if (at === 'foal') { const h = g.horseEntity('foal'); return [{ x: h.x, y: h.y }]; }
      if (at.startsWith('npc:')) { const n = g.npcById(at.slice(4)); return [{ x: n.x, y: n.y }]; }
      return [SPOTS[at]];
    },
    async useStep(q, step) {
      const u = step.use, label = g.fmt(u.label);
      if (step.needs) this.give(step.needs);
      if (u.run === 'fetchTree') await this.mount(); else this.dismount();
      const list = await this.spots(u.at);
      const sp = list[0];
      if (!sp) throw new Error('Kein Ort für ' + q.id);
      // nah genug, aber auf freiem Boden
      this.tp(sp.x, sp.y + 0.8);
      if (u.run === 'fetchTree') this.tp(sp.x, sp.y + 0.8, true);
      await this.use(label);
      if (u.run === 'lesson') await this.doLesson();
    },
    async doLesson() {
      for (let i = 0; i < 40 && !g.lesson; i++) await sleep(50);
      const L = g.lesson;
      if (!L) throw new Error('Reitstunde startet nicht');
      while (g.lesson && L.idx < L.cones.length) {
        const [x, y] = L.cones[L.idx];
        g.player.x = x + 0.5; g.player.y = y + 0.5;
        await sleep(120);
      }
      await this.idle();
    },
    async garden(ev, crop, count) {
      this.dismount();
      const plots = g.world.gardenPlots;
      if (ev === 'plant') {
        // Beete leeren wie nach einer Ernte (Spielerin würde vorher ernten)
        for (let i = 0; i < count; i++) g.S.garden[i] = { crop: null, growth: 0, wet: 0 };
        this.give({ ['seed_' + crop]: count });
      }
      for (let i = 0; i < count; i++) {
        const pl = plots[i];
        this.tp(pl.x + 0.5, pl.y + 1.3); g.player.face = 'up';
        await sleep(60);
        const f = g.findInteraction();
        if (!f) throw new Error('Beet ohne Aktion');
        g.focus = f; g.interact(); await this.idle();
        if (ev === 'water' && i === count - 1) g.growCrops(10, false);
      }
    },
    async collectAll(kind, n) {
      for (let i = 0; i < n; i++) {
        const P2 = await import('/src/part2.js');
        const p = P2.targetPos(g, { [kind]: 'nearest' });
        if (!p) throw new Error('Kein ' + kind + ' mehr gefunden');
        if (kind === 'icestar' || kind === 'clover' || kind === 'lovenote' || kind === 'recipe') this.dismount();
        this.tp(p.x, p.y); g.player.x = p.x; g.player.y = p.y;
        await sleep(160);
        await this.idle();
      }
    },
    async solve(q) {
      const Q = g.quests, step = Q.step(q), S = g.S;
      if (!step) return;
      const t = step.type;
      if (t === 'talk') return this.talk(step.npc);
      if (t === 'deliver') { this.give(step.items); return this.talk(step.npc); }
      if (t === 'talkAll') { if (step.consume) this.give({ [step.consume]: step.npcs.length }); for (const n of step.npcs) await this.talk(n); return; }
      if (t === 'tame') return this.tame(step.horse);
      if (step.use?.run === 'outfitShow') {
        const shown = S.flags.outfitsShown || [];
        for (let i = 0; i < 13; i++) if (!shown.includes(i)) { S.player.outfit = i; break; }
      }
      if (step.use) return this.useStep(q, step);
      const ev = step.ev;
      switch (ev) {
        case 'foal_walk': {
          this.dismount();
          const { SPOTS } = await import('/src/world.js');
          const fe = g.horseEntity('foal');
          // in Etappen zum Steg laufen, das Fohlen folgt
          const sx = g.player.x, sy = g.player.y, tx = SPOTS.dock.x, ty = SPOTS.dock.y - 1;
          for (let k = 1; k <= 16; k++) { this.tp(sx + (tx - sx) * k / 16, sy + (ty - sy) * k / 16); await sleep(400); }
          if (fe && Math.hypot(fe.x - g.player.x, fe.y - g.player.y) > 4) { T.warn.push('Fohlen kam nicht hinterher (' + fe.mode + ' ' + fe.x.toFixed(1) + ',' + fe.y.toFixed(1) + ' P ' + g.player.x.toFixed(1) + ',' + g.player.y.toFixed(1) + ' vis ' + fe.visible + ')'); fe.x = g.player.x - 1; fe.y = g.player.y; }
          for (let i = 0; i < 20 && !g.cutscene; i++) await sleep(100);
          return this.idle();
        }
        case 'return_wildfoal': {
          this.dismount();
          const { SPOTS } = await import('/src/world.js');
          const sx = g.player.x, sy = g.player.y, tx = SPOTS.herdHome.x - 1, ty = SPOTS.herdHome.y;
          for (let k = 1; k <= 16; k++) { this.tp(sx + (tx - sx) * k / 16, sy + (ty - sy) * k / 16); await sleep(400); }
          const wf = g.horseEntity('wildfoal');
          if (wf && Math.hypot(wf.x - SPOTS.herdHome.x, wf.y - SPOTS.herdHome.y) > 6) { T.warn.push('Wildfohlen kam nicht hinterher (' + wf.mode + ')'); wf.x = SPOTS.herdHome.x; wf.y = SPOTS.herdHome.y; }
          for (let i = 0; i < 20 && !g.cutscene; i++) await sleep(100);
          return this.idle();
        }
        case 'plant': case 'water': case 'harvest': {
          const crop = step.filter || Object.values(q.steps).find((s) => s.ev === 'plant')?.filter;
          return this.garden(ev, crop, step.count);
        }
        case 'clover': case 'clover10': return this.collectAll('clover', ev === 'clover' ? 1 : Math.max(0, 10 - S.collected.clovers.length));
        case 'icestar': return this.collectAll('icestar', step.count);
        case 'lovenote': return this.collectAll('lovenote', step.count);
        case 'recipe': return this.collectAll('recipe', step.count);
        case 'alpaca_brush': {
          this.dismount();
          for (let i = 0; i < step.count; i++) {
            const br = S.flags.alpacaBrushed || {};
            const a = g.animals.find((x) => x.species === 'alpaca' && x.visible !== false && !br[x.variant + ':' + S.time.day]);
            if (!a) throw new Error('Kein Alpaka');
            this.tp(a.x + 0.8, a.y); g.player.x = a.x + 0.6; g.player.y = a.y + 0.1;
            try { await this.use('Bürsten'); } catch (e) { throw new Error(e.message + ' Alpakas: ' + JSON.stringify(g.animals.filter((x) => x.species === 'alpaca').map((x) => [x.variant, x.x.toFixed(1), x.y.toFixed(1), x.visible, x.mode, x.state])) + ' P ' + g.player.x.toFixed(1) + ',' + g.player.y.toFixed(1)); }
          }
          return;
        }
        case 'groom': {
          const rec = S.horses.find((h) => h.id === S.ridingHorse);
          for (let i = 0; i < step.count; i++) g.careAction(rec, 'groom');
          return;
        }
        case 'race': { await this.mount(); const npc = step.target.npc; const n = g.npcById(npc); this.tp(n.x + 1.2, n.y); await g.talkTo(npc); return this.race(); }
        default: throw new Error('Unbekanntes Ereignis ' + ev + ' in ' + q.id);
      }
    },
  };
});

const ev = (fn, ...a) => page.evaluate(fn, ...a);
const status = () => ev(() => { const g = window.ponyhof; return { ch: g.quests.chapter(), season: g.S.season, day: g.S.time.day, active: g.quests.active().map((q) => q.id + '@' + g.S.quests[q.id].step), farm: Object.entries(g.S.farm).filter(([, v]) => v === true).map(([k]) => k).join(','), coins: g.S.player.coins }; });

let guard = 0, lastCh = 0, lastSeason = '';
while (guard++ < 400) {
  const st = await status();
  if (st.ch !== lastCh) { console.log(`Kapitel ${st.ch}:`, JSON.stringify(st)); await shot('kap' + st.ch); lastCh = st.ch; }
  if (st.season !== lastSeason) { await shot('season-' + st.season); lastSeason = st.season; }
  const done = await ev(() => window.ponyhof.quests.isActive('j13_fest'));
  if (done) break;
  const res = await ev(async () => {
    const g = window.ponyhof, Q = g.quests;
    try {
      for (const q of Q.available()) await T.talk(q.giver);
      const act = Q.active().filter((q) => q.id !== 'j13_fest');
      // Nebenaufgaben der aktuellen Jahreszeit zuerst (sonst sind sie bis zur Schneekugel weg)
      const q = act.find((x) => !x.main && x.offerSeason) || act.find((x) => x.main) || act[0];
      if (!q) return 'keine Aufgabe';
      const before = JSON.stringify(g.S.quests[q.id]);
      await T.solve(q);
      await T.idle();
      const after = JSON.stringify(g.S.quests[q.id]);
      return before === after ? 'KEIN FORTSCHRITT bei ' + q.id + ' ' + JSON.stringify(Q.step(q)) : 'ok ' + q.id;
    } catch (e) { return 'FEHLER ' + e.message + ' ' + e.stack?.split('\n')[1]; }
  });
  if (process.env.V) console.log(res);
  if (!res.startsWith('ok')) { console.log(res); if (res.startsWith('FEHLER') || res.startsWith('KEIN')) { await shot('fehler'); break; } }
}
// restliche Nebenaufgaben
const rest = await ev(async () => {
  const g = window.ponyhof, Q = g.quests, out = [];
  for (let i = 0; i < 60; i++) {
    for (const q of Q.available()) await T.talk(q.giver);
    const side = Q.active().filter((q) => !q.main);
    if (!side.length) break;
    try { await T.solve(side[0]); await T.idle(); } catch (e) { out.push('FEHLER ' + side[0].id + ': ' + e.message); break; }
  }
  return { out, done: Q.done().filter((q) => !q.main && q.part2).map((q) => q.id), open: Q.active().filter((q) => !q.main).map((q) => q.id), avail: Q.available().map((q) => q.id) };
});
console.log('Nebenaufgaben', JSON.stringify(rest));
console.log('Warnungen', JSON.stringify(await ev(() => T.warn)));
console.log('vor Finale', JSON.stringify(await status()));
// Finale
await ev(async () => { const g = T.g; T.dismount(); const h = g.npcById('hilde'); T.tp(h.x + 1, h.y); g.talkTo('hilde'); });
await page.waitForTimeout(1500);
await shot('fest-1');
await page.waitForTimeout(2500);
await shot('fest-2');
for (let i = 0; i < 120; i++) { const has = await page.$('#st-next'); if (has) break; await page.waitForTimeout(500); }
await shot('credits2-0');
let pages = 0;
for (let i = 0; i < 14 && (await page.$('#st-next')); i++) { await page.click('#st-next'); pages++; await page.waitForTimeout(350); await shot('credits2-' + (i + 1)); }
await page.click('#cr-go');
await page.waitForTimeout(2500);
await shot('after');
console.log('Abspann-Seiten', pages);
console.log(await ev(() => JSON.stringify({ state: T.g.state, part2: T.g.S.part2, season: T.g.S.season, deco: T.g.S.decoInv, photos: Object.keys(T.g.S.photos).length, questsDone: T.g.quests.done().length, open: T.g.quests.active().map((q) => q.id), horses: T.g.S.horses.map((h) => h.name + (h.foal ? '(F)' : '')) })));
// Speichern & Laden nach dem Ende
await page.reload(); await page.waitForTimeout(1200);
await page.click('#t-cont'); await page.waitForTimeout(2500);
console.log('nach Neuladen', await ev(() => JSON.stringify({ state: window.ponyhof.state, season: window.ponyhof.S.season, intro: !!document.querySelector('#st-next') })));
await shot('reload');
console.log('errors', errs);
await browser.close();
