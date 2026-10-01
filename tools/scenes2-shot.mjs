// Screenshots mitten in den Szenen von Teil 2 (echtes Timing, Dialoge klicken sich selbst weiter).
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
let errs = 0;
p.on('pageerror', (e) => { errs++; console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')); });
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) { errs++; console.log('console:', m.text()); } });
await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(1000);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
await p.click('#t-p2'); await p.waitForTimeout(2500);
for (let i = 0; i < 6 && (await p.$('#st-next')); i++) { await p.click('#st-next'); await p.waitForTimeout(300); }
await p.waitForTimeout(2500);
await p.evaluate(() => {
  const g = window.ponyhof;
  // Dialoge nach kurzer Lesezeit weiterklicken, Auswahl: erste Option
  setInterval(() => { if (g.dialog.open && !g.dialog.choiceResolve) g.dialog.advance(); }, 900);
  g.dialog.choice = async () => { await new Promise((r) => setTimeout(r, 500)); return 0; };
  g.screens.askName = async (t, d) => d;
  const ic = g.screens.interiorCard.bind(g.screens);
  g.screens.interiorCard = async (...a) => { const pr = ic(...a); setTimeout(() => document.querySelector('#st-next')?.click(), 1500); return pr; };
});
const only = process.env.ONLY?.split(',');
const scenes = [
  // [Name, Jahreszeit, Szene, Quest, Schritt, Vorbereitung, Zeitpunkte (ms)]
  ['hildeLeaves', 'autumn', 'hildeLeaves', null, 0, '', [2500, 6000]],
  ['findHedgehog', 'autumn', 'findHedgehog', 'j7_igel', 1, '', [2500]],
  ['leafJump', 'autumn', 'leafJump', 'j7_laub', 1, '', [1500, 3500]],
  ['harvestFest', 'autumn', 'harvestFest', 'j7_erntedank', 3, 'S.farm.farmshop=true', [3000, 7000]],
  ['lottePet', 'autumn', 'lottePet', 'j8_lotte', 2, '', [2500]],
  ['lesson', 'autumn', 'lesson', 'j8_stunde1', 1, 'S.farm.arena=true; g.rebuildWorldKeepState()', [2500]],
  ['badgeShow', 'autumn', 'badgeShow', 'j8_abzeichen', 2, 'S.farm.arena=true; g.rebuildWorldKeepState()', [3000, 7000]],
  ['atticChest', 'autumn', 'atticChest', 'j9_dachboden', 1, '', [2500]],
  ['treasure', 'autumn', 'treasure', 'j9_schatz', 1, '', [3000, 8000, 13000]],
  ['snowballFight', 'winter', 'snowballFight', 'j10_schnee', 2, 'S.flags.snowman=3; g.props=null', [2500, 5000]],
  ['miraSweater', 'winter', 'miraSweater', 'j10_wolle', 2, '', [2500]],
  ['feedRack', 'winter', 'feedRack', 'j10_futter', 1, "g.inv.add('hay',3); g.inv.add('carrot',3)", [2500, 5000]],
  ['skateMert', 'winter', 'skateMert', 'j10_eis', 2, '', [2500, 5000]],
  ['winterFest', 'winter', 'winterFest', 'j10_winterfest', 1, 'S.farm.winterlights=true; S.farm.plazaTree=true; g.rebuildWorldKeepState()', [3000, 8000, 14000, 20000]],
  ['longe', 'spring', 'longe', 'j11_ritt', 2, 'S.farm.arena=true; g.rebuildWorldKeepState()', [1500]],
  ['firstRide', 'spring', 'firstRide', 'j11_ritt', 3, 'S.farm.arena=true; g.rebuildWorldKeepState()', [3000, 7000]],
  ['findWildFoal', 'spring', 'findWildFoal', 'j11_fohlen', 1, '', [1500]],
  ['storkNest', 'spring', 'storkNest', 'j11_storch', 2, '', [2500, 5000]],
  ['cottageSite', 'summer', 'cottageSite', 'j12_idee', 1, '', [2500, 5000]],
  ['richtfest', 'summer', 'richtfest', 'j12_bau', 1, "S.farm.cottage=true; S.farm.cottageStyle=S.farm.cottageStyle||'rose'; g.rebuildWorldKeepState()", [2500, 6000]],
  ['furnish', 'summer', 'furnish', 'j12_einrichten', 2, '', [2200]],
  ['housewarming', 'summer', 'housewarming', 'j12_party', 2, '', [3000, 7000, 12000]],
  ['sledding', 'winter', 'sledding', 's2_schlitten', 0, '', [2000, 4000]],
  ['starName', 'summer', 'starName', 's2_stern', 0, '', [3000, 6000]],
  ['photo', 'summer', 'photo', 's2_foto', 0, '', [1200, 2600]],
];
for (const [name, season, fn, qid, si, prep, times] of scenes) {
  if (only && !only.includes(name)) continue;
  await p.evaluate(async ({ season }) => {
    const g = window.ponyhof; const P2 = await import('/src/part2.js');
    if (g.S.season !== season) await P2.changeSeason(g, season);
    g.S.time.minutes = 11 * 60; g.updateLighting();
  }, { season });
  await p.waitForTimeout(800);
  const t0 = Date.now();
  await p.evaluate(async ({ fn, qid, si, prep }) => {
    const g = window.ponyhof, S = g.S;
    const { QUEST_BY_ID } = await import('/src/data/quests.js');
    const { SPOTS } = await import('/src/world.js');
    const S2 = await import('/src/scenes2.js');
    // eslint-disable-next-line no-eval
    if (prep) eval(prep);
    const q = qid ? QUEST_BY_ID[qid] : null, step = q ? q.steps[si] : null;
    let sp = null;
    if (step?.use) {
      const at = step.use.at;
      if (at === 'photos') sp = { id: 'gazebo', ...SPOTS.photos.gazebo };
      else if (at === 'lanterns') sp = { id: 0, ...SPOTS.lanterns[0] };
      else sp = SPOTS[at] || null;
      if (sp) { const f = g.world.nearestFree(sp.x, sp.y + 0.8); g.player.x = f.x; g.player.y = f.y; g.renderer.follow(f.x, f.y, 0, true); }
    }
    window.__sceneDone = false;
    Promise.resolve(S2[fn](g, q, step, sp)).catch((e) => console.error('Szene ' + fn + ': ' + e.message)).finally(() => { window.__sceneDone = true; });
  }, { fn, qid, si, prep });
  for (let i = 0; i < times.length; i++) {
    const wait = times[i] - (Date.now() - t0);
    if (wait > 0) await p.waitForTimeout(wait);
    await p.screenshot({ path: `screenshots/s2-${name}-${i}.png` });
  }
  // Reitstunde: Pylonen ablaufen
  if (fn === 'lesson') await p.evaluate(async () => { const g = window.ponyhof; for (let k = 0; k < 40 && g.lesson; k++) { const L = g.lesson; const c = L.cones[L.idx]; if (!c) break; g.player.x = c[0] + 0.5; g.player.y = c[1] + 0.5; await new Promise((r) => setTimeout(r, 200)); } });
  for (let i = 0; i < 120; i++) { if (await p.evaluate(() => window.__sceneDone && !window.ponyhof.cutscene)) break; await p.waitForTimeout(500); }
  const st = await p.evaluate(() => ({ done: window.__sceneDone, cut: window.ponyhof.cutscene, state: window.ponyhof.state }));
  console.log(name, JSON.stringify(st));
  if (!st.done || st.cut) { await p.evaluate(() => { const g = window.ponyhof; g.cutscene = false; g.state = 'play'; }); }
}
console.log('errors', errs);
await b.close();
