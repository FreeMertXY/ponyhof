// Szenen von Teil 2 (Kapitel 7–9) und die Requisiten in der Welt.
// Kapitel 10–13 und die Nebenaufgaben stehen in scenes3.js.
import { SPOTS, TILE, FARM, LESSONS } from './world.js';
import { stage, endStage, kiss, forceDismount, love } from './scenes.js';
import { drawHorse, horseLook } from './draw/horse.js';
import { drawCharacter, npcLook } from './draw/characters.js';
import { NPCS } from './data/npcs.js';
import { drawLeafPile, drawSnowman, drawLantern, drawMarker, drawBirdhouse, drawCone, drawChest, drawPostVan, drawStorkInNest, drawPumpkinLamp } from './draw/props.js';
import { Animal } from './animals.js';
import { outlinedText, FONT, heart } from './draw/paint.js';
import { dist, pick } from './util.js';
import { Prop, placeNpc, homeAll, digAnim } from './scenekit.js';

export * from './scenes3.js';
export { Prop };

const T = TILE;

// ---------- Requisiten ----------

export function buildProps(g) {
  const S = g.S, Q = g.quests, season = S.season || 'summer';
  const out = [];
  if (!S.part2?.started) return out;
  void Q;
  // Herbst: Laubhaufen
  if (season === 'autumn') {
    if (!S.flags.hedgehogFound) out.push(new Prop(SPOTS.leafpile.x, SPOTS.leafpile.y + 0.4, (c, t) => drawLeafPile(c, t, false, g._rustle || 0)));
    out.push(new Prop(SPOTS.leafbig.x, SPOTS.leafbig.y + 0.4, (c, t) => drawLeafPile(c, t, true, g._rustleBig || 0)));
    // Kürbislaternen am Wohnhaus
    for (const [x, y] of [[67.8, 87.2], [73.2, 87.2]]) out.push(new Prop(x, y, (c, t) => drawPumpkinLamp(c, t)));
  }
  // Winter: Schneemann
  if (season === 'winter' && (S.flags.snowman || 0) > 0) out.push(new Prop(SPOTS.snowman.x, SPOTS.snowman.y + 0.3, (c, t) => drawSnowman(c, t, S.flags.snowman)));
  // Laternen am Seeufer (Kapitel 13)
  for (const i of S.flags.lanterns || []) {
    const p = SPOTS.lanterns[i];
    if (p && !S.part2.done) out.push(new Prop(p.x, p.y, (c, t) => drawLantern(c, t, ['#ffb3c8', '#ffe39a', '#b3e3ff', '#c9ffb3', '#e6c9ff', '#ffd0b0'][i % 6], true)));
  }
  // Vogelhäuschen
  for (const i of S.flags.birdhouses || []) { const p = SPOTS.birdspots[i]; if (p) out.push(new Prop(p.x, p.y, (c, t) => drawBirdhouse(c, t))); }
  // Störche im Nest
  if (S.farm.storks && season !== 'winter') for (const [i, dx] of [[0, -0.2], [1, 0.25]]) out.push(new Prop(147.5 + dx, 98.9, (c, t) => { c.translate(0, -78); drawStorkInNest(c, t, i); }, 0.2));
  // Marker für offene Aufgaben-Orte
  out.push(new MarkerProp(g));
  return out;
}

// zeichnet Bodenmarker an allen aktuell wichtigen Orten (Kamera, Laternenplätze, Grabstellen …)
class MarkerProp {
  constructor(g) { this.g = g; this.x = -100; this.y = -100; this.visible = true; }
  draw(ctx, g, t) {
    const S = g.S, Q = g.quests;
    for (const q of Q.active()) {
      const step = Q.step(q);
      const u = step?.use;
      if (!u) continue;
      let kind = null, spots = [];
      if (u.at === 'photos') { kind = 'camera'; spots = Object.entries(SPOTS.photos).filter(([id]) => !S.photos[id]).map(([, p]) => p); }
      else if (u.at === 'lanterns') { kind = 'lantern'; spots = SPOTS.lanterns.filter((p, i) => !(S.flags.lanterns || []).includes(i)); }
      else if (u.at === 'birdspots') { kind = 'bird'; spots = SPOTS.birdspots.filter((p, i) => !(S.flags.birdhouses || []).includes(i)); }
      else if (u.run === 'dig' || u.run === 'treasure') { kind = 'dig'; spots = [SPOTS[u.at]]; }
      if (!kind) continue;
      for (const p of spots) {
        if (!p || Math.abs(p.x - g.player.x) > 22 || Math.abs(p.y - g.player.y) > 14) continue;
        ctx.save(); ctx.translate(p.x * T, p.y * T); drawMarker(ctx, t, kind); ctx.restore();
      }
    }
  }
}


// ---------- Jahreszeiten-Vignetten ----------
export async function seasonScene(g, season) {
  const m = g.pets?.mira;
  if (season === 'winter') {
    if (m) { m.state = 'happy'; m.stateT = 4; m.hop(4); g.particles.snow(m.x, m.y, 14); }
    g.audio.play('bark');
    await g.say([{ who: 'narr', t: 'Über Nacht hat es geschneit. Der ganze Hof ist weiß und still, und auf jedem Zaunpfahl sitzt eine kleine Schneemütze.' }, { who: 'narr', t: 'Mira hüpft wie ein Gummiball durch den Schnee – nur ihre Ohren gucken noch heraus.' }]);
  } else if (season === 'spring') {
    g.audio.play('bird');
    await g.say([{ who: 'narr', t: 'Der Schnee ist geschmolzen. Überall sprießt frisches Grün, die Obstbäume blühen, und die Vögel singen um die Wette.' }, { who: 'narr', t: 'Auf der Koppel tobt {foal} ausgelassen herum – sie ist über den Winter richtig groß geworden!' }]);
  } else if (season === 'summer') {
    await g.say([{ who: 'narr', t: 'Der Sommer ist zurück. Die Wiesen duften nach Heu, die Sonnenblumen recken die Köpfe – und es ist fast genau ein Jahr her, dass du auf den Ponyhof gekommen bist.' }]);
  }
}

// ---------- Kapitel 7 ----------
export async function hildeLeaves(g) {
  const S = g.S;
  const gx = FARM.gate.x - 2.5, gy = 89.4;
  await stage(g, gx - 2, gy, 1.1);
  const van = new Prop(gx + 3.5, gy - 0.2, (c, t) => drawPostVan(c, t, -1));
  g.sceneEntities = [van];
  placeNpc(g, 'hilde', gx - 0.6, gy - 1.1, 'right');
  placeNpc(g, 'paula', gx + 2.2, gy + 0.9, 'left');
  g.rebuildEntities();
  g.camOverride = { x: gx, y: gy - 0.8 };
  await g.say([
    { who: 'paula', t: 'Zack, zack! Der Postwagen nach Bremerhaven fährt pünktlich. Also, so pünktlich wie ich.' },
    { who: 'hilde', t: 'Komm her, mein Schatz.' },
    { who: 'narr', t: 'Oma Hilde nimmt dich ganz fest in den Arm. Sie riecht nach Lavendel und Apfelkuchen.' },
    { who: 'hilde', t: 'Pass gut auf dich auf. Und auf Mert. Und auf die Pferde, die Katzen, Mira, {foal} …' },
    { who: 'mert', t: 'Und ich pass auf sie auf. Versprochen, Hilde.' },
    { who: 'hilde', t: 'Das weiß ich doch. Ihr zwei seid das Beste, was diesem Hof je passiert ist.' },
  ]);
  love(true);
  g.particles.hearts(gx - 1, gy - 0.6, 10);
  await g.wait(1);
  love(false);
  // Abfahrt
  const h = g.npcById('hilde');
  h.visible = false;
  g.audio.play('whistle');
  for (let i = 0; i < 60; i++) { van.x += 0.12; if (i % 10 === 0) g.particles.dust(van.x - 1.5, van.y, 2); await g.wait(0.03); }
  van.visible = false;
  await g.say([{ who: 'narr', t: 'Ihr winkt, bis der gelbe Postwagen hinter den Hügeln verschwunden ist. Mira bellt ihm hinterher.' }, { who: 'mert', t: 'So. Jetzt sind wir zwei die Chefs. Ich schlage vor: Erst mal Kakao.' }]);
  S.flags.hildeAway = true;
  homeAll(g, ['paula']);
  await endStage(g);
}

export async function foalHalter(g, q, step) {
  const S = g.S, fe = g.horseEntity('foal');
  g.inv.remove('halter', 1);
  g.audio.play('neigh', { pitch: 1.5 });
  if (fe) { g.particles.hearts(fe.x, fe.y - 0.6, 6); fe.mode = 'follow'; }
  S.flags.foalHalter = true;
  await g.say([{ who: 'narr', t: 'Ganz vorsichtig legst du {foal} das lavendelfarbene Halfter um. Sie schnuppert daran, schüttelt den Kopf – und stupst dich dann zufrieden an.' }, { who: 'narr', t: 'Jetzt läuft {foal} dir überallhin nach. Auf zum Glitzersee!' }]);
  g.quests.emit('foal_halter');
  g.hint('{foal} folgt dir jetzt. Geh zu Fuß zum Steg am Glitzersee (der Pfeil zeigt den Weg).'.replace('{foal}', g.fmt('{foal}')), 6);
}

export async function foalWalkDone(g) {
  const fe = g.horseEntity('foal'), sp = SPOTS.dock;
  g.cutscene = true;
  if (fe) { fe.mode = 'scene'; fe.setTarget(sp.x + 1.2, sp.y + 0.2, 2); }
  await g.wait(1);
  g.audio.play('splash');
  g.particles.splash(sp.x + 1.6, sp.y + 0.6, 10);
  await g.say([{ who: 'narr', t: '{foal} beugt sich übers Wasser – und erschrickt vor dem kleinen Pferd, das sie von unten anschaut. Ein Hüpfer zurück, ein Schnauben … und dann ganz neugierig wieder hin.' }, { who: 'narr', t: 'Sie tippt mit der Nase ins Wasser. Platsch! Jetzt hat sie einen nassen Bart und sieht sehr zufrieden aus.' }]);
  if (fe) { g.particles.hearts(fe.x, fe.y - 0.6, 6); }
  g.cutscene = false;
  g.quests.emit('foal_walk');
  g.hint('Zurück zu Mert! {foal} läuft wieder auf die Koppel.'.replace('{foal}', g.fmt('{foal}')), 5);
}

export async function findHedgehog(g) {
  const S = g.S, sp = SPOTS.leafpile;
  g.cutscene = true;
  g._rustle = 2;
  g.audio.play('shake');
  await g.wait(0.8);
  g._rustle = 0;
  const hog = new Animal('hedgehog', sp.x + 0.6, sp.y + 0.7, 0);
  hog.mode = 'scene'; hog.scale = 1;
  g.sceneEntities = [hog];
  g.rebuildEntities();
  g.particles.leaves(sp.x, sp.y, 10, '#e8874a');
  await g.say([{ who: 'narr', t: 'Das Laub raschelt … und heraus schaut eine winzige Schnuffelnase. Dann zwei Knopfaugen. Ein Igelbaby!' }, { who: 'narr', t: 'Es ist kaum größer als ein Apfel und zittert ein bisschen. Mira wedelt ganz vorsichtig mit dem Schwanz.' }, { who: 'mert', t: 'Ooooh. Ist der klein! Ob der allein durch den Winter kommt? Bring ihn lieber zur neuen Tierärztin in Kleeberg. Sie wohnt im Nordosten vom Dorf.' }]);
  S.flags.hedgehogFound = true;
  g.sceneEntities = null;
  g.props = buildProps(g);
  g.rebuildEntities();
  g.cutscene = false;
  g.quests.emit('find_hedgehog');
  g.ui.toast('Der kleine Igel kuschelt sich in deine Jackentasche.', 'heart');
}

export async function nameHedgehog(g) {
  const S = g.S;
  const n = await g.screens.askName('Wie soll der kleine Igel heißen?', 'Stachelchen');
  S.flags.hedgehog = n;
  await g.say([{ who: 'ella', t: `${n}! Was für ein schöner Name. Bring ${n} zu Mert – er soll ein Igelhaus bauen. Und schau ab und zu nach ihm, ja?` }]);
  g.requestSave();
}

export async function leafJump(g) {
  const sp = SPOTS.leafbig;
  await stage(g, sp.x - 1.4, sp.y + 1.2, 2.8);
  const P = g.player, m = g.npcById('mert');
  await g.say([{ who: 'mert', t: 'Auf drei! Eins … zwei … DREI!' }]);
  // beide springen hinein
  const sx = P.x, mx = m.x;
  for (let i = 0; i <= 14; i++) {
    const k = i / 14;
    P.x = sx + (sp.x - 0.3 - sx) * k; m.x = mx + (sp.x + 0.4 - mx) * k;
    P.y = sp.y + 1.2 - Math.sin(k * Math.PI) * 0.8; m.y = sp.y + 1.2 - Math.sin(k * Math.PI) * 0.8;
    await g.wait(0.03);
  }
  g._rustleBig = 3;
  g.audio.play('shake');
  for (let i = 0; i < 4; i++) { g.particles.leaves(sp.x, sp.y + 0.5, 12, ['#e8874a', '#d9603c', '#f2b84a', '#c9783a'][i]); }
  await g.wait(0.6);
  g._rustleBig = 0;
  const mira = g.pets?.mira;
  if (mira) { mira.x = sp.x + 1.4; mira.y = sp.y + 1.2; mira.hop(4); g.audio.play('bark'); }
  await g.say([{ who: 'narr', t: 'Ihr landet mitten im Laub. Blätter fliegen in alle Richtungen, Mira springt hinterher und verschwindet komplett im Haufen.' }, { who: 'mert', t: 'Du hast ein Blatt im Haar. Und noch eins. Und … warte, das ist Maumau.' }]);
  await kiss(g, 'laub');
  g.quests.emit('leafjump');
  await endStage(g);
}

export async function harvestFest(g) {
  const S = g.S, sp = SPOTS.show;
  S.time.minutes = Math.max(S.time.minutes, 19.6 * 60);
  g.updateLighting();
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = sp.x - 0.6; P.y = sp.y + 0.6; P.face = 'right';
  const ids = ['mert', 'berta', 'theo', 'luise', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'];
  const pos = [[sp.x + 0.6, sp.y + 0.6, 'left'], [sp.x - 3, sp.y - 1, 'right'], [sp.x + 3, sp.y - 1, 'left'], [sp.x - 3.6, sp.y + 1.2, 'right'], [sp.x + 3.6, sp.y + 1.3, 'left'], [sp.x - 2, sp.y + 2.4, 'up'], [sp.x + 2, sp.y + 2.4, 'up'], [sp.x + 4.5, sp.y, 'left'], [sp.x - 1, sp.y + 2.8, 'up'], [sp.x + 1, sp.y + 2.8, 'up']];
  ids.forEach((id, i) => { if (g.npcById(id)) placeNpc(g, id, pos[i][0], pos[i][1], pos[i][2]); });
  const lamps = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; lamps.push(new Prop(sp.x + Math.cos(a) * 5.2, sp.y - 1 + Math.sin(a) * 3.4, (c, t) => drawPumpkinLamp(c, t))); }
  g.sceneEntities = lamps;
  g.festivalLights = lamps.map((l) => ({ x: l.x, y: l.y - 0.3, r: 2.6, c: '#ffc87a' }));
  g.rebuildEntities();
  g.camOverride = { x: sp.x, y: sp.y };
  g.renderer.follow(sp.x, sp.y, 0, true);
  g.audio.setMode('festival');
  await g.fade(false);
  g.ui.banner('Erntedankfest in Kleeberg', 'Danke für ein Jahr voller Ernte ♥');
  await g.say([
    { who: 'berta', t: 'Liebe Leute! Die Kürbissuppe ist fertig – mit Kürbissen vom Ponyhof!' },
    { who: 'theo', t: 'Hm-hm. Und der Apfelpunsch. Mit Äpfeln vom Ponyhof. Ich hab nur umgerührt. Sehr gut umgerührt.' },
    { who: 'kuno', t: 'Und jetzt: Musik! Ich hab meine Ziehharmonika mitgebracht!' },
    { who: 'lotte', t: 'Tanzen! Alle müssen tanzen!' },
  ]);
  // Tanz
  const m = g.npcById('mert');
  const cx = (P.x + m.x) / 2, cy = P.y;
  g.audio.playTune?.('dance');
  for (let i = 0; i < 70; i++) {
    const a = i * 0.18;
    P.x = cx - Math.cos(a) * 0.6; P.y = cy - Math.sin(a) * 0.3;
    m.x = cx + Math.cos(a) * 0.6; m.y = cy + Math.sin(a) * 0.3;
    P.face = m.x > P.x ? 'right' : 'left'; m.face = m.x > P.x ? 'left' : 'right';
    if (i % 8 === 0) g.particles.notes(cx + (Math.random() - 0.5) * 3, cy - 1);
    if (i % 12 === 0) g.particles.hearts(cx, cy - 0.6, 2);
    await g.wait(0.05);
  }
  await g.say([{ who: 'narr', t: 'Ihr tanzt unter den Kürbislaternen, bis euch schwindelig ist. Mira tanzt mit. Also, sie rennt im Kreis.' }]);
  await kiss(g, 'tanz');
  await g.say([{ who: 'ella', t: 'Ich bin erst ein paar Wochen in Kleeberg – aber so ein schönes Fest hab ich noch nie erlebt.' }, { who: 'mert', t: 'Und weißt du was? Ab jetzt haben wir einen eigenen Hofladen. Ich hab ihn heimlich gebaut, während du die Kürbisse gegossen hast!' }]);
  await g.fade(true);
  homeAll(g, ids);
  g.sceneEntities = null;
  g.festivalLights = null;
  g.camOverride = null;
  g.rebuildEntities();
  g.applyAudioMode();
  g.quests.emit('harvestfest');
  await g.fade(false);
  g.cutscene = false;
  g.saveNow();
}

// ---------- Kapitel 8 ----------
export function lotteToFarm(g) {
  g.later(0.3, () => g.hint('Lotte rennt schon mal vor zu deinem Hof. Triff sie am Koppeltor!', 5));
}

export async function lottePet(g) {
  const S = g.S, sp = SPOTS.lotteFarm;
  g.cutscene = true;
  const rec = S.horses.find((h) => h.personality === 'sanft' && !h.foal) || S.horses.find((h) => !h.foal);
  const h = rec && g.horseEntity(rec.id);
  const L = g.npcById('lotte');
  let hx = sp.x + 1.6, hy = sp.y + 0.2;
  if (h && h.mode !== 'ridden') { h.mode = 'scene'; h.x = hx + 1; h.y = hy; h.setTarget(hx, hy, 1.5); h.face = -1; }
  await g.wait(1.2);
  await g.say([{ who: 'narr', t: `${rec ? rec.name : 'Dein Pferd'} kommt ganz langsam herüber und senkt den Kopf zu Lotte hinunter.` }, { who: 'lotte', t: 'Oh … oh! Es ist so … WEICH! Wie ein Samtkissen mit Schnurrhaaren!' }]);
  if (h) g.particles.hearts(h.x, h.y - 0.8, 8);
  g.audio.play('neigh');
  await g.say([{ who: 'lotte', t: 'Es hat mich angepustet! Das kitzelt! Hihihi!' }, { who: 'player', t: 'Siehst du? Pferde sind groß – aber ganz sanft, wenn man lieb zu ihnen ist.' }, { who: 'lotte', t: 'Kannst du mir Reiten beibringen? Bitte bitte bitte? Ich übe auch ganz doll!' }, { who: 'mert', t: 'Reitstunden auf dem Ponyhof? Dafür brauchen wir einen richtigen Reitplatz. Lass mich mal machen!' }]);
  if (h) { h.mode = h.id === S.ridingHorse ? 'idle' : 'paddock'; const P = g.world.paddock; if (h.mode === 'paddock') { h.x = P.x + 3; h.y = P.y + 3; } }
  if (L) { L.mode = 'home'; }
  g.cutscene = false;
  g.saveNow();
}

// Reitstunde: die Spielerin führt ein Pony mit Kind um die Pylonen
class LessonPony {
  constructor(g, rec, riderLook, x, y) {
    this.hl = horseLook(rec); this.rider = riderLook; this.x = x; this.y = y; this.face = -1; this.t = 0; this.speed = 0; this.visible = true;
  }
  update(dt, g) {
    this.t += dt;
    const P = g.player;
    const d = dist(this.x, this.y, P.x, P.y);
    if (d > 1.7) {
      const tx = P.x - (P.faceX || 1) * 1.4, ty = P.y + 0.3;
      const dx = tx - this.x, dy = ty - this.y, dd = Math.hypot(dx, dy) || 1;
      const spd = Math.min(5.5, 1.5 + d * 1.1);
      const s = Math.min(dd, spd * dt);
      this.x += (dx / dd) * s; this.y += (dy / dd) * s;
      this.speed = spd;
      if (Math.abs(dx) > 0.05) this.face = dx > 0 ? 1 : -1;
    } else this.speed = 0;
  }
  draw(ctx, g, t) {
    const P = g.player;
    ctx.save();
    // Führstrick
    ctx.strokeStyle = '#c94a7a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(this.x * T + this.face * 30, this.y * T - 50); ctx.quadraticCurveTo((this.x + P.x) / 2 * T, Math.max(this.y, P.y) * T - 10, P.x * T, P.y * T - 22); ctx.stroke();
    ctx.translate(this.x * T, this.y * T);
    const pose = this.speed > 4.5 ? 'trot' : this.speed > 0.2 ? 'walk' : 'stand';
    const L = this.rider;
    drawHorse(ctx, this.hl, { t: this.t, pose, face: this.face, scale: 1.22, rider: (c) => { c.save(); c.translate(-1, -24); c.scale(1 / 1.22, 1 / 1.22); drawCharacter(c, L, { dir: 'right', t, seated: true, noShadow: true }); c.restore(); } });
    ctx.restore();
  }
}

class Cone {
  constructor(lesson, i, x, y) { this.L = lesson; this.i = i; this.x = x + 0.5; this.y = y + 0.5; this.visible = true; }
  draw(ctx, g, t) { ctx.save(); ctx.translate(this.x * T, this.y * T); drawCone(ctx, this.i + 1, this.L.idx === this.i, this.L.idx > this.i, t); ctx.restore(); }
}

export async function lesson(g, q, step) {
  const S = g.S, arg = step.use.arg;
  const cones = LESSONS[arg];
  const kid = arg === 'b1' ? 'ben' : 'lotte';
  const rec = arg === 'b1' ? { coat: 'schimmel', mane: '#e8e2f0', marking: 'none', acc: { saddle: 'saddle_himmel', blanket: 'blanket_sterne' } } : (S.horses.find((h) => h.personality === 'sanft' && !h.foal) || S.horses.find((h) => !h.foal));
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player, A = FARM.arena;
  P.x = A.x + A.w - 2.5; P.y = A.y + A.h / 2; P.face = 'left'; P.faceX = -1;
  const kn = g.npcById(kid); kn.visible = false;
  // echtes Pferd kurz verstecken
  const realH = arg !== 'b1' && rec?.id ? g.horseEntity(rec.id) : null;
  const realMode = realH?.mode;
  if (realH) { realH.visible = false; realH.mode = 'scene'; }
  const L = { idx: 0, cones, done: null, kid, arg };
  const pony = new LessonPony(g, rec, npcLook(NPCS[kid].look), P.x + 1.6, P.y + 0.2);
  L.pony = pony;
  g.sceneEntities = [pony, ...cones.map(([x, y], i) => new Cone(L, i, x, y))];
  g.lesson = L;
  g.rebuildEntities();
  g.renderer.follow(P.x, P.y, 0, true);
  await g.fade(false);
  g.cutscene = false;
  const intro = { l1: 'Ganz langsam im Schritt. Ich halte mich an der Mähne fest!', l2: 'Slalom! Mit Glücksklee im Helm schaffe ich das!', b1: 'Okay. Augen auf. Augen AUF, Ben.' }[arg];
  g.ui.hint(`${NPCS[kid].name}: „${intro}“ – Führ das Pony zu jedem leuchtenden Pylon (zu Fuß).`, 6);
  const ok = await new Promise((resolve) => { L.done = resolve; });
  g.lesson = null;
  g.cutscene = true;
  await g.fade(true);
  g.sceneEntities = null;
  kn.visible = true;
  if (realH) { realH.visible = true; realH.mode = realMode === 'ridden' ? 'idle' : realMode || 'paddock'; }
  g.rebuildEntities();
  await g.fade(false);
  if (ok) {
    g.audio.play('fanfare');
    g.particles.confetti(P.x, P.y, 40);
    const lines = {
      l1: [{ who: 'lotte', t: 'Ich bin geritten! Fünf Pylonen! Und ich bin nicht runtergefallen! Kein einziges Mal!' }],
      l2: [{ who: 'lotte', t: 'Sieben Pylonen! Im Slalom! Das Kleeblatt wirkt wirklich!' }, { who: 'narr', t: 'Lotte strahlt so sehr, dass man fast eine Sonnenbrille braucht.' }],
      b1: [{ who: 'ben', t: 'Das war … das war gar nicht schlimm! Eigentlich war es sogar schön. Wolke fand es auch schön.' }],
    }[arg];
    await g.say(lines);
    g.quests.emit('lesson', arg);
  } else {
    await g.say([{ who: kid, t: 'Oh … ist die Stunde schon vorbei? Wir können ja nochmal anfangen. Am Schild!' }]);
  }
  g.cutscene = false;
  g.saveNow();
}

// pro Bild aufgerufen, solange eine Reitstunde läuft
export function updateLesson(g, dt) {
  const L = g.lesson;
  if (!L || g.cutscene) return;
  const P = g.player;
  const c = L.cones[L.idx];
  if (c && dist(P.x, P.y, c[0] + 0.5, c[1] + 0.5) < 1.05) {
    L.idx++;
    g.audio.play('checkpoint');
    g.particles.sparkles(c[0] + 0.5, c[1] + 0.5, 8);
    if (L.idx >= L.cones.length) { const d = L.done; L.done = null; d?.(true); return; }
    if (L.idx === Math.floor(L.cones.length / 2)) g.ui.hint(pick(['Super, weiter so!', 'Das Pony folgt dir ganz brav.', 'Schon die Hälfte geschafft!']), 2);
  }
  const A = FARM.arena;
  if (dist(P.x, P.y, A.x + A.w / 2, A.y + A.h / 2) > 16) { const d = L.done; L.done = null; d?.(false); }
}

export async function badgeShow(g) {
  const S = g.S, A = FARM.arena;
  const cx = A.x + A.w / 2, cy = A.y + A.h / 2;
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = A.x + A.w + 0.6; P.y = cy + 1.6; P.face = 'left';
  const crowd = [['mert', A.x + A.w + 1.8, cy + 1.2, 'left'], ['mia', A.x + A.w + 0.8, cy - 1.8, 'left'], ['luise', A.x + A.w + 2.2, cy - 0.8, 'left'], ['berta', A.x + 3, A.y - 1, 'down'], ['ella', A.x + 6, A.y - 1, 'down'], ['paula', A.x + 9, A.y - 1, 'down'], ['theo', A.x + 11.5, A.y - 1, 'down']];
  for (const [id, x, y, f] of crowd) placeNpc(g, id, x, y, f);
  g.npcById('lotte').visible = false; g.npcById('ben').visible = false;
  const rec = S.horses.find((h) => h.personality === 'sanft' && !h.foal) || S.horses.find((h) => !h.foal);
  const pony = new LessonPony(g, rec, npcLook(NPCS.lotte.look), cx, cy);
  const benPony = new LessonPony(g, { coat: 'schimmel', mane: '#e8e2f0', acc: { saddle: 'saddle_himmel', blanket: 'blanket_sterne' } }, npcLook(NPCS.ben.look), A.x + 2, cy + 2);
  pony.update = benPony.update = () => {};
  pony.draw = drawNoRope(pony); benPony.draw = drawNoRope(benPony);
  g.sceneEntities = [pony, benPony];
  g.rebuildEntities();
  g.camOverride = { x: cx + 1, y: cy - 0.6 };
  g.renderer.follow(cx + 1, cy - 0.6, 0, true);
  await g.fade(false);
  await g.say([{ who: 'mia', t: 'Willkommen zum ersten Reitturnier der kleinen Reitschule vom Ponyhof! Als Erste: LOTTE!' }]);
  // Lotte reitet eine Runde
  await rideLap(g, pony, cx, cy, 4.8, 2.4, 3.2);
  g.audio.play('fanfare');
  await g.say([{ who: 'narr', t: 'Lotte reitet ganz allein eine Runde – im Trab! Sie lacht die ganze Zeit.' }, { who: 'mia', t: 'Und jetzt: BEN!' }]);
  await rideLap(g, benPony, cx, cy, 4.2, 2, 3.2);
  g.particles.confetti(cx, cy, 60);
  g.audio.play('fanfare');
  await g.say([
    { who: 'narr', t: 'Ben reitet eine perfekte Runde – mit offenen Augen! Alle jubeln.' },
    { who: 'player', t: 'Und jetzt die Reitabzeichen! Für Lotte – für Ben – und eins für Mia, weil sie das ganze Turnier organisiert hat.' },
    { who: 'lotte', t: 'Das ist das schönste Abzeichen der Welt. Ich trag es für immer. Auch beim Schlafen.' },
    { who: 'ben', t: 'Ich trag es auch beim Schlafen. Und beim Zähneputzen.' },
    { who: 'mert', t: 'Ich bin so stolz auf dich, {name}. Du bist jetzt offiziell eine Reitlehrerin. Die beste der Welt.' },
    { who: 'luise', t: 'Ich hab ein Schild gemacht! „Kleine Reitschule vom Ponyhof“. Mit Blümchen!' },
  ]);
  g.inv.remove('rosette', 3);
  await g.fade(true);
  homeAll(g, crowd.map((c) => c[0]));
  g.npcById('lotte').visible = true; g.npcById('ben').visible = true;
  g.sceneEntities = null;
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.quests.emit('badge_show');
  g.cutscene = false;
  g.saveNow();
}

function drawNoRope(p) {
  return (ctx, g, t) => {
    ctx.save(); ctx.translate(p.x * T, p.y * T);
    const pose = p.speed > 4.5 ? 'trot' : p.speed > 0.2 ? 'walk' : 'stand';
    drawHorse(ctx, p.hl, { t: p.t, pose, face: p.face, scale: 1.22, rider: (c) => { c.save(); c.translate(-1, -24); c.scale(1 / 1.22, 1 / 1.22); drawCharacter(c, p.rider, { dir: 'right', t, seated: true, noShadow: true }); c.restore(); } });
    ctx.restore();
  };
}

async function rideLap(g, p, cx, cy, rx, ry, sec) {
  const t0 = g.t;
  let last = null;
  while (g.t - t0 < sec) {
    const a = ((g.t - t0) / sec) * Math.PI * 2 + Math.PI;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (last) { p.face = x > last.x ? 1 : -1; p.speed = 5; }
    p.x = x; p.y = y; p.t += 1 / 60;
    last = { x, y };
    await g.wait(0);
  }
  p.speed = 0;
}

// ---------- Kapitel 9 ----------
export async function atticChest(g) {
  g.cutscene = true;
  await g.fade(true);
  const chest = new Prop(SPOTS.attic.x + 0.8, SPOTS.attic.y + 0.4, (c, t) => drawChest(c, t, chest.open || 0));
  chest.open = 0;
  g.sceneEntities = [chest];
  g.rebuildEntities();
  await g.fade(false);
  await g.say([{ who: 'narr', t: 'Mert hat die alte Truhe vom Heuboden heruntergetragen. Auf dem Deckel: ein geschnitztes Herz, darin ein K und ein H.' }]);
  for (let i = 0; i <= 10; i++) { chest.open = i / 10; await g.wait(0.04); }
  g.audio.play('pling');
  g.inv.add('mappiece', 1);
  await g.say([
    { who: 'narr', t: 'In der Truhe liegen ein vergilbtes Stück Papier mit gezeichneten Wegen – und ein Brief.' },
    { who: 'narr', t: '„Meine liebste Hilde. Diese Karte führt zu einem Schatz. Ich habe sie in vier Teile zerrissen und an unseren Lieblingsorten versteckt. Such sie – und du wirst sehen, was ich für dich aufgehoben habe. Für immer dein, Karl.“' },
    { who: 'mert', t: 'Ein Schatz? Von Opa Karl? Für Hilde? Wir MÜSSEN ihn finden. Und dann erzählen wir ihr alles!' },
    { who: 'mert', t: 'Berta kannte Karl gut. Vielleicht weiß sie, wo die anderen Stücke sind.' },
  ]);
  g.sceneEntities = null;
  g.rebuildEntities();
  g.cutscene = false;
  g.quests.emit('attic');
}

const DIG_TEXT = {
  leuchtturm: ['Sieben Schritte, ganz genau. Die Schaufel stößt auf etwas Hartes: eine kleine Blechdose mit einem Anker drauf.', 'Darin: ein Kartenstück! Am Rand hat Karl geschrieben: „Wo das Licht die Schiffe heimbringt.“'],
  insel: ['Unter dem Blütenbaum, zwischen den Wurzeln, liegt ein kleines Kästchen aus Holz. Ein Gänseblümchen ist eingeschnitzt.', 'Darin: noch ein Kartenstück! „Wo du Ja gesagt hast.“'],
  berge: ['Unter dem Herzfelsen ist eine flache Steinplatte. Darunter: eine Wachstuchrolle.', 'Darin: das dritte Kartenstück! „Wo das Echo deinen Namen liebt.“'],
};

export async function dig(g, q, step) {
  const arg = step.use.arg;
  g.cutscene = true;
  await digAnim(g);
  g.audio.play('pling');
  g.particles.sparkles(g.player.x + 0.5, g.player.y, 12);
  g.inv.add('mappiece', 1);
  await g.say(DIG_TEXT[arg].map((t) => ({ who: 'narr', t })));
  g.ui.toast(`Kartenstück gefunden! (${g.inv.count('mappiece')}/4)`, 'mappiece', 'gold');
  g.cutscene = false;
  g.quests.emit('dig', arg);
}

export async function echo(g) {
  const sp = SPOTS.echo;
  g.cutscene = true;
  await g.say([{ who: 'player', t: 'HILDE!' }]);
  for (let i = 0; i < 4; i++) {
    g.particles.add({ type: 'text', x: sp.x - 4 + i * 2.5, y: sp.y - 2 - i * 0.6, z: 40, vz: 10, life: 1.6, text: 'Hilde …', color: `rgba(255,255,255,${1 - i * 0.2})` });
    g.audio.play('owl');
    await g.wait(0.7);
  }
  g.particles.sparkles(sp.x - 1, sp.y - 0.5, 14);
  await g.say([{ who: 'narr', t: 'Das Echo ruft den Namen viermal zurück – leiser und leiser. Dann glitzert das eingeritzte Herz auf dem Felsen in der Sonne.' }, { who: 'narr', t: 'Direkt darunter ist die Erde ganz locker. Hier muss es sein!' }]);
  g.cutscene = false;
  g.quests.emit('echo');
}

export async function treasure(g) {
  const S = g.S, sp = SPOTS.dig_schatz;
  S.time.minutes = 19.3 * 60;
  g.updateLighting();
  await stage(g, sp.x - 0.8, sp.y + 0.4, 1.4);
  await digAnim(g);
  const chest = new Prop(sp.x + 0.2, sp.y + 1.3, (c, t) => drawChest(c, t, chest.open || 0));
  chest.open = 0;
  g.sceneEntities = [chest];
  g.rebuildEntities();
  g.audio.play('horseshoe');
  await g.say([{ who: 'mert', t: 'Da! Eine Truhe! Genau wie die auf dem Heuboden – nur kleiner!' }]);
  for (let i = 0; i <= 12; i++) { chest.open = i / 12; await g.wait(0.05); }
  g.particles.sparkles(sp.x, sp.y + 0.6, 20);
  g.inv.remove('mappiece', g.inv.count('mappiece'));
  await g.say([
    { who: 'narr', t: 'In der Truhe liegen: ein Bündel Briefe mit rotem Band, eine goldene Hufeisen-Brosche – und eine kleine Spieluhr mit zwei tanzenden Pferden.' },
    { who: 'narr', t: 'Du ziehst sie auf. Eine zarte Melodie erklingt.' },
  ]);
  g.audio.playTune?.('musicbox');
  await g.wait(1);
  await g.say([
    { who: 'narr', t: 'Ganz oben liegt ein Brief. „Meine Hilde. Wenn du das liest, hast du alle unsere Orte besucht. Den Leuchtturm, die Insel, die Berge. Und jetzt bist du hier, auf unserem Hügel.“' },
    { who: 'narr', t: '„Ich habe keinen Schatz aus Gold für dich. Nur diese Spieluhr, die spielt, was ich gesummt habe, als wir uns kennenlernten. Und alle Briefe, die ich dir nie gegeben habe, weil ich zu schüchtern war.“' },
    { who: 'narr', t: '„Der wahre Schatz bist du. Und alles, was wir auf diesem Hof gemeinsam lieben. Pass gut darauf auf. Dein Karl.“' },
    { who: 'mert', t: '…' },
    { who: 'mert', t: 'Ich hab was im Auge. Beide Augen. Ganz viel was.' },
    { who: 'player', t: 'Wir müssen Hilde schreiben. Sofort.' },
    { who: 'mert', t: 'Ja. Aber erst … darf ich bitten? Die Spieluhr spielt noch.' },
  ]);
  g.audio.playTune?.('musicbox');
  const P = g.player, m = g.npcById('mert');
  const cx = (P.x + m.x) / 2, cy = P.y;
  for (let i = 0; i < 60; i++) { const a = i * 0.12; P.x = cx - Math.cos(a) * 0.55; m.x = cx + Math.cos(a) * 0.55; P.y = cy - Math.sin(a) * 0.25; m.y = cy + Math.sin(a) * 0.25; if (i % 10 === 0) g.particles.notes(cx, cy - 1); await g.wait(0.05); }
  await kiss(g, 'kuss');
  g.quests.emit('dig', 'schatz');
  await endStage(g);
  g.hint('Opa Karls Spieluhr steht jetzt in deiner Tasche unter „Hof-Deko“. Stell sie auf – sie spielt, wenn du davor E drückst.', 8);
}

export async function writeHilde(g) {
  g.cutscene = true;
  await g.say([
    { who: 'narr', t: 'Du setzt dich auf die Bank am Wohnhaus und schreibst. Über die Truhe, die Kartenstücke, den Leuchtturm, die Insel, das Echo – und über Karls Brief.' },
    { who: 'narr', t: 'Mert malt ein Herz unter den Brief. Mira drückt ihre Pfote drauf. Maumau legt sich drauf. Der Brief ist jetzt etwas zerknittert – aber voller Liebe.' },
    { who: 'narr', t: 'Du steckst ihn in den Briefkasten und klappst das rote Fähnchen hoch. Paula holt ihn morgen ab.' },
  ]);
  g.S.flags.letterToHilde = true;
  g.audio.play('pling');
  g.cutscene = false;
  g.quests.emit('hilde_letter');
}

export { outlinedText, FONT, heart };
