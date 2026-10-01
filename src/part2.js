// Teil 2 „Vier Jahreszeiten“: Start, Jahreszeitenwechsel, Orts-Interaktionen, Sammelsachen.
import { SPOTS, FARM, SEASON_NAMES, REG, WW } from './world.js';
import { QUEST_BY_ID, QUESTS } from './data/quests.js';
import { NPCS } from './data/npcs.js';
import { WILD_HORSES } from './data/horses.js';
import { defaultState } from './save.js';
import { makeHorseRecord, HorseEntity, newTameState } from './horses.js';
import { npcLook } from './draw/characters.js';
import { Animal } from './animals.js';
import * as S2 from './scenes2.js';
import { forceDismount } from './scenes.js';
import { dist, pick } from './util.js';

export const isPart2 = (S) => !!S.part2?.started;
export const seasonOf = (S) => S.season || 'summer';

// ---------- Teil 2 beginnen ----------
export function maybeStartPart2(g) {
  const S = g.S;
  if (!S.ending?.done || isPart2(S) || g._part2Starting) return;
  g._part2Starting = true;
  g.later(1.2, () => g.pending.push(() => startPart2(g)));
}

export async function startPart2(g) {
  const S = g.S;
  if (isPart2(S)) { g._part2Starting = false; return; }
  g.cutscene = true;
  g.ui.showHUD(false);
  await g.fade(true);
  g.state = 'intro';
  await g.fade(false);
  await g.screens.part2Intro();
  // Zustand für Teil 2
  S.part2.started = true;
  S.part2.day = S.time.day;
  S.farm.part2 = true;
  S.season = 'autumn';
  S.weather = { kind: 'sun', until: S.time.day * 1440 + S.time.minutes + 200, rainbowUntil: 0 };
  S.time.minutes = 8 * 60;
  ensureFoal(S);
  g.player.x = FARM.spawn.x; g.player.y = FARM.spawn.y;
  if (g.player.riding) { const h = g.player.horse; g.player.riding = false; g.player.horse = null; S.player.riding = false; if (h) { h.mode = 'idle'; h.visible = true; h.x = FARM.spawn.x + 2; h.y = FARM.spawn.y; } }
  g.rebuildWorldKeepState();
  refresh(g);
  g.renderer.follow(g.player.x, g.player.y, 0, true);
  g.state = 'play';
  g.ui.showHUD(true);
  g.applyAudioMode();
  await g.fade(true);
  await g.fade(false);
  g.cutscene = false;
  g._part2Starting = false;
  g.ui.banner('Teil 2 · Vier Jahreszeiten', 'Der Herbst kommt auf den Ponyhof');
  g.quests.refresh();
  g.saveNow();
  g.later(3.5, () => g.hint('Neu in Teil 2: Es gibt Jahreszeiten! Im Aufgabenbuch (<kbd>Q</kbd>) steht bei jeder Aufgabe ein Tipp. Und überall sind 20 vierblättrige Kleeblätter versteckt.', 'p2start'));
}

// Fohlen sicherstellen (falls ein alter Spielstand keins hat)
export function ensureFoal(S) {
  if (S.horses.some((h) => h.id === 'foal')) return;
  const mother = S.horses.filter((h) => !h.foal).sort((a, b) => b.pts - a.pts)[0];
  const rec = makeHorseRecord({ id: 'foal', name: S.ending?.foal?.name || 'Wölkchen', coat: mother ? mother.coat : 'palomino', marking: 'star', socks: true, personality: 'verschmust', foal: true });
  S.horses.push(rec);
  S.ending.foal = S.ending.foal || { name: rec.name };
}

export function foalRec(S) { return S.horses.find((h) => h.id === 'foal'); }

// Platzhalter in Texten
export function fmt2(S, text) {
  const f = foalRec(S);
  return text.replace(/\{foal\}/g, f ? f.name : 'Wölkchen').replace(/\{hedgehog\}/g, S.flags.hedgehog || 'Stachelchen');
}

// ---------- Jahreszeiten ----------
const SEASON_SUB = {
  autumn: 'Die Blätter werden bunt', winter: 'Über Nacht ist alles weiß', spring: 'Alles fängt an zu blühen', summer: 'Die Sonne ist zurück',
};

export async function changeSeason(g, season) {
  const S = g.S;
  if (seasonOf(S) === season) return;
  g.cutscene = true;
  await g.fade(true);
  S.season = season;
  S.weather = { kind: season === 'winter' ? 'snow' : 'sun', until: S.time.day * 1440 + S.time.minutes + (season === 'winter' ? 90 : 200), rainbowUntil: 0 };
  // ein neuer Morgen
  S.time.day++;
  S.time.minutes = 8 * 60;
  const f = foalRec(S);
  if (f && f.foal) f.grow = Math.max(f.grow || 0, season === 'winter' ? 0.6 : season === 'spring' ? 0.85 : f.grow || 0);
  // neuer Morgen am Hof (so steht nie jemand zu Pferd auf einer vereisten Insel fest)
  g.player.x = FARM.spawn.x; g.player.y = FARM.spawn.y;
  if (g.player.horse) { g.player.horse.x = g.player.x; g.player.horse.y = g.player.y; }
  g.rebuildWorldKeepState();
  refresh(g);
  g.renderer.follow(g.player.x, g.player.y, 0, true);
  g.updateLighting();
  g.applyAudioMode();
  await g.wait(0.4);
  await g.fade(false);
  g.ui.banner(SEASON_NAMES[season], SEASON_SUB[season]);
  g.audio.play(season === 'winter' ? 'jingle' : 'bird');
  await g.wait(1.2);
  await S2.seasonScene(g, season);
  g.cutscene = false;
  g.saveNow();
}

// NPC-Aussehen je Jahreszeit (Winter: Schal und Mütze)
const WINTER_GEAR = {
  hilde: { scarf: '#ff9fb2' }, mert: { scarf: '#c94a5a', hat: 'beanie', beanieColor: '#3a4a6a' }, berta: { scarf: '#ff9eb8' }, luise: { scarf: '#b79cf0' },
  theo: { scarf: '#6b8e5a' }, paula: { scarf: '#ffd23f' }, mia: { scarf: '#ffffff' }, ben: { scarf: '#ffd166', hat: 'beanie', beanieColor: '#7cc6e8' },
  kuno: { scarf: '#ef6f6f' }, lotte: { scarf: '#ff7eb6', hat: 'beanie', beanieColor: '#ff7eb6' }, ella: { scarf: '#7fcdea' },
};
export function applySeasonLooks(g) {
  const winter = seasonOf(g.S) === 'winter';
  for (const n of g.npcs) {
    const base = NPCS[n.id].look;
    const gear = winter ? WINTER_GEAR[n.id] || { scarf: '#ff9eb8' } : null;
    const l = gear ? { ...base, scarf: gear.scarf, hat: base.hat && base.hat !== 'helmet' ? base.hat : gear.hat || base.hat, beanieColor: gear.beanieColor } : base;
    n.look = npcLook(l);
  }
}

// ---------- Figuren: Sichtbarkeit und Zuhause ----------
export function npcHome(g, id) {
  const S = g.S, q = g.quests;
  if (id === 'lotte') {
    const st = q.st('j8_lotte');
    if (st && st.state === 'active' && st.step >= 2) return SPOTS.lotteFarm;
    if (S.farm.arena) return { x: 83.5, y: 125.6 };
    return SPOTS.npc.lotte;
  }
  return SPOTS.npc[id];
}

export function updateNpcs(g) {
  const S = g.S, p2 = isPart2(S);
  for (const n of g.npcs) {
    if (n.id === 'lotte' || n.id === 'ella') n.visible = p2;
    if (n.id === 'hilde') n.visible = !S.flags.hildeAway;
    if (n.mode === 'home') {
      const h = npcHome(g, n.id);
      if (h && (Math.abs(n.homeX - h.x) > 0.01 || Math.abs(n.homeY - h.y) > 0.01)) { n.homeX = h.x; n.homeY = h.y; n.x = h.x; n.y = h.y; }
    }
  }
}

// ---------- Requisiten (Laubhaufen, Schneemann, Laternen …) ----------
export function refresh(g) {
  const S = g.S;
  applySeasonLooks(g);
  updateNpcs(g);
  syncSpecialHorses(g);
  // Stachelchen, der kleine Igel
  g.animals = g.animals.filter((a) => !a.isHedgehog2);
  if (S.flags.hedgehog && S.farm.igelhaus && seasonOf(S) !== 'winter') {
    const a = new Animal('hedgehog', SPOTS.igelhaus.x + 0.8, SPOTS.igelhaus.y + 0.6, 0);
    a.name = S.flags.hedgehog; a.isHedgehog2 = true; a.homeX = SPOTS.igelhaus.x + 0.6; a.homeY = SPOTS.igelhaus.y + 0.8;
    g.animals.push(a);
  }
  // Mira im Pullover
  if (g.pets?.mira) g.pets.mira.sweater = !!S.flags.miraSweater && seasonOf(S) === 'winter';
  g.props = S2.buildProps(g);
  g.rebuildEntities();
}

// Besondere Pferde: das weiße Winterpony, das Wildfohlen
export function syncSpecialHorses(g) {
  const S = g.S;
  g.horses = g.horses.filter((h) => !h.special2 || S.horses.includes(h.rec));
  const def = WILD_HORSES.find((w) => w.id === 'flocke');
  const owned = S.horses.some((h) => h.id === 'flocke');
  const ponyQuest = g.quests.isActive('s2_pony');
  if (def && !owned && isPart2(S) && (seasonOf(S) === 'winter' || ponyQuest)) {
    const sp = SPOTS.wildHorses.flocke;
    const h = new HorseEntity({ ...def, acc: {} }, 'wild', sp.x, sp.y);
    h.special2 = true;
    if (S.wild.flocke) { h.tame = newTameState(); h.tame.trust = S.wild.flocke.trust || 0; }
    g.horses.push(h);
  }
  // Wildfohlen
  const wf = S.flags.wildfoal;
  const fq = g.quests.st('j11_fohlen');
  const searching = fq && fq.state === 'active';
  if ((searching && seasonOf(S) === 'spring') || wf === 'home') {
    const home = wf === 'home';
    const following = wf === 'follow' && !home;
    const sp = home ? SPOTS.herdHome : following ? { x: g.player.x - 1.5, y: g.player.y + 0.5 } : SPOTS.wildfoal;
    const h = new HorseEntity({ id: 'wildfoal', name: 'Wildfohlen', coat: 'falbe', mane: '#5a4536', marking: 'star', acc: {}, foal: true, personality: 'wild' }, home ? 'herd' : following ? 'follow' : 'scene', sp.x, sp.y);
    h.special2 = true;
    h.homeX = sp.x; h.homeY = sp.y;
    g.horses.push(h);
  }
}

// ---------- laufende Prüfungen ----------
export function update(g, dt) {
  const S = g.S;
  if (!isPart2(S)) return;
  g._p2T = (g._p2T || 0) - dt;
  if (g._p2T > 0) return;
  g._p2T = 0.25;
  if (g.cutscene || g.state !== 'play') return;
  const Q = g.quests;
  for (const q of Q.active()) {
    const step = Q.step(q);
    if (!step) continue;
    // Fohlen folgt beim Spaziergang
    if (step.watch?.foalAt) {
      const fe = g.horseEntity('foal');
      if (fe && fe.mode !== 'follow' && fe.mode !== 'ridden') { fe.mode = 'follow'; }
      const sp = SPOTS[step.watch.foalAt];
      if (fe && dist(fe.x, fe.y, sp.x, sp.y) < step.watch.r && dist(g.player.x, g.player.y, sp.x, sp.y) < step.watch.r) {
        g.pending.push(() => S2.foalWalkDone(g));
        g.cutscene = true;
        return;
      }
    }
    if (step.watch?.wildfoalAt) {
      const wf = g.horseEntity('wildfoal');
      const sp = SPOTS[step.watch.wildfoalAt];
      if (wf && dist(wf.x, wf.y, sp.x, sp.y) < step.watch.r) {
        g.pending.push(() => S2.wildFoalHome(g));
        g.cutscene = true;
        return;
      }
    }
    if (step.ev === 'clover' && S.collected.clovers.length > 0) Q.emit('clover');
    if (step.ev === 'clover10' && S.collected.clovers.length >= 10) Q.emit('clover10');
  }
  // Fohlen wieder auf die Koppel, wenn kein Spaziergang mehr
  const fe = g.horseEntity('foal');
  if (fe && fe.mode === 'follow' && !fe.rec.follow && !Q.active().some((q) => Q.step(q)?.watch?.foalAt)) {
    const P = g.world.paddock;
    if (fe.foal) { fe.mode = 'paddock'; fe.x = P.x + 2 + Math.random() * (P.w - 4); fe.y = P.y + 2 + Math.random() * (P.h - 4); }
  }
  updateNpcs(g);
}

// ---------- Interaktionen ----------
function spotPos(g, at) {
  if (at === 'foal') { const h = g.horseEntity('foal'); return h ? { x: h.x, y: h.y } : null; }
  if (typeof at === 'string' && at.startsWith('npc:')) { const n = g.npcById(at.slice(4)); return n ? { x: n.x, y: n.y } : null; }
  if (Array.isArray(at)) return { x: at[0], y: at[1] };
  if (at === 'garden') return { x: 95, y: 84 };
  return SPOTS[at] || null;
}

// mehrteilige Orte (Fotos, Laternen, Vogelhäuschen): noch offene Plätze
export function openSpots(g, kind) {
  const S = g.S;
  if (kind === 'photos') return Object.entries(SPOTS.photos).filter(([id]) => !S.photos[id]).map(([id, p]) => ({ id, ...p }));
  if (kind === 'lanterns') return SPOTS.lanterns.map((p, i) => ({ id: i, ...p })).filter((p) => !(S.flags.lanterns || []).includes(p.id));
  if (kind === 'birdspots') return SPOTS.birdspots.map((p, i) => ({ id: i, ...p })).filter((p) => !(S.flags.birdhouses || []).includes(p.id));
  return [];
}

export function addCandidates(g, add, near) {
  const S = g.S, Q = g.quests, P = g.player;
  if (!isPart2(S)) return;
  let d;
  for (const q of Q.active()) {
    const step = Q.step(q);
    const u = step?.use;
    if (!u) continue;
    const r = u.r || 2;
    const label = g.fmt(u.label);
    const multi = ['photos', 'lanterns', 'birdspots'].includes(u.at);
    const spots = multi ? openSpots(g, u.at) : [spotPos(g, u.at)].filter(Boolean);
    for (const sp of spots) {
      // Hauptaufgaben haben Vorrang; Fotos & Co. treten zurück, wenn etwas anderes genauso nah ist
      if ((d = near(sp.x, sp.y, r)) !== null) add(d + (q.main ? -0.6 : multi ? 0.15 : -0.3), label, () => useStep(g, q, step, sp), sp.x, sp.y - 1.4);
    }
  }
  // feste Orte in Teil 2
  if (S.farm.farmshop && (d = near(SPOTS.farmshop.x + 0.5, SPOTS.farmshop.y, 1.8)) !== null) add(d + 0.1, 'Hofladen', () => g.ui.open('shop', 'hofladen'), SPOTS.farmshop.x + 0.5, SPOTS.farmshop.y - 2);
  if ((d = near(SPOTS.sandpit.x, SPOTS.sandpit.y, 1.8)) !== null && !P.riding) add(d, 'Sand einfüllen', () => S2.shovelSand(g), SPOTS.sandpit.x, SPOTS.sandpit.y - 1);
  if (S.farm.igelhaus && (d = near(SPOTS.igelhaus.x, SPOTS.igelhaus.y, 1.4)) !== null) add(d + 0.2, seasonOf(S) === 'winter' ? 'Leise lauschen' : 'Ins Igelhaus schauen', () => S2.igelhausPeek(g), SPOTS.igelhaus.x, SPOTS.igelhaus.y - 1);
  if (S.flags.musicboxPlaced !== undefined) { /* Deko-Spieluhr wird über die Deko bedient */ }
}

export async function useStep(g, q, step, sp) {
  const S = g.S;
  if (step.needs && !g.inv.hasAll(step.needs)) {
    const tips = g.quests.sourceTips(step.needs);
    await g.say([{ who: 'narr', t: 'Dafür fehlt dir noch: ' + g.quests.itemsNeed(step.needs) + '.' }, ...(tips.length ? [{ who: 'narr', t: 'Tipp – ' + tips.join(' ') }] : [])]);
    return;
  }
  const fn = step.use.run && S2[step.use.run];
  // Für fast alles steigt man ab (nur die Tanne braucht ein Pferd zum Ziehen)
  if (g.player.riding && step.use.run !== 'fetchTree') forceDismount(g);
  if (fn) { await fn(g, q, step, sp); return; }
  if (step.needs) g.inv.removeAll(step.needs);
  g.quests.emit(step.ev, step.filter);
  g.requestSave();
  void S;
}

// Zielposition für das Aufgaben-Ziel (Pfeil, Karte)
export function targetPos(g, tg) {
  const S = g.S, P = g.player;
  const nearest = (list) => { list.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y)); return list[0] ? { x: list[0].x, y: list[0].y } : null; };
  if (tg.foal) { const h = g.horseEntity('foal'); return h && h.mode !== 'ridden' ? { x: h.x, y: h.y } : null; }
  if (tg.clover) return nearest(g.world.pickups.filter((p) => p.k === 'clover' && !S.collected.clovers.includes(p.id)));
  if (tg.lovenote) return nearest(g.world.pickups.filter((p) => p.k === 'lovenote' && !S.collected.notes.includes(p.id)));
  if (tg.recipe) return nearest(g.world.pickups.filter((p) => p.k === 'recipe' && !S.collected.recipes.includes(p.id)));
  if (tg.icestar) return nearest(g.world.pickups.filter((p) => p.k === 'icestar' && !S.collected.stars.includes(p.id)));
  if (tg.photo) return nearest(openSpots(g, 'photos'));
  if (tg.lantern) return nearest(openSpots(g, 'lanterns'));
  if (tg.birdhouse) return nearest(openSpots(g, 'birdspots'));
  return undefined;
}

// ---------- Sammelsachen ----------
// Welche Sorte zeigt ein Fundort gerade? (Winter: Tannenzapfen statt Pilze)
export function pickupKind(g, p) {
  if (p.k === 'mushroom' && seasonOf(g.S) === 'winter') return 'pinecone';
  return p.k;
}

const FLOWERS = new Set(['lavender', 'sunflower', 'poppy', 'daisy']);
// null = Teil 1 entscheidet; true/false = Teil-2-Regel
export function pickupAvailable(g, p) {
  const S = g.S, season = seasonOf(S), C = S.collected, Q = g.quests;
  const k = p.k;
  if (FLOWERS.has(k) && season === 'winter') return false;
  if (k === 'clover') return isPart2(S) && !C.clovers.includes(p.id);
  if (k === 'lovenote') return Q.step(QUEST_BY_ID.s2_zettel)?.ev === 'lovenote' && !C.notes.includes(p.id);
  if (k === 'recipe') return Q.step(QUEST_BY_ID.s2_rezept)?.ev === 'recipe' && !C.recipes.includes(p.id);
  if (k === 'icestar') return season === 'winter' && Q.step(QUEST_BY_ID.j10_eis)?.ev === 'icestar' && !C.stars.includes(p.id);
  if (k === 'chestnut') return isPart2(S) && season === 'autumn' && !(C.pick[p.id] >= S.time.day);
  if (k === 'snowdrop') return isPart2(S) && season === 'spring' && !(C.pick[p.id] >= S.time.day);
  if (k === 'stone') return isPart2(S) && !(C.pick[p.id] >= S.time.day);
  return null;
}

export const AUTO_KINDS = new Set(['horseshoe', 'heartstone', 'clover', 'lovenote', 'recipe', 'icestar']);

const NOTES = [
  '„Ich liebe es, wie du mit den Pferden flüsterst, wenn du denkst, dass keiner zuhört.“',
  '„Du bist mein Lieblingsmensch. Seit dem ersten Tag. Und jeden Tag ein bisschen mehr.“',
  '„Wenn du lachst, lacht sogar Theo mit. Und das will was heißen.“',
  '„Danke, dass du mit mir das Abenteuer Ponyhof wagst. Mit dir würde ich überall hingehen.“',
  '„Egal welche Jahreszeit – mit dir ist immer Sommer. (Zu kitschig? Egal.)“',
];

export function collect(g, p) {
  const S = g.S, C = S.collected;
  if (p.k === 'clover') {
    C.clovers.push(p.id);
    g.audio.play('horseshoe');
    g.particles.sparkles(p.x, p.y, 14, 20, '#b8f2a0');
    const n = C.clovers.length;
    g.ui.toast(`Vierblättriges Kleeblatt! (${n}/20)`, 'clover', 'mint');
    g.hint('Ein Glücksklee! 20 davon sind in der ganzen Gegend versteckt. Mira hilft beim Suchen – bei 10 und 20 gibt es Belohnungen.', 'clover');
    cloverReward(g, n);
    g.quests.emit('clover');
    if (n >= 10) g.quests.emit('clover10');
  } else if (p.k === 'lovenote') {
    C.notes.push(p.id);
    g.audio.play('heart');
    g.particles.hearts(p.x, p.y - 0.3, 8);
    const i = C.notes.length - 1;
    g.pending.push(async () => { await g.say([{ who: 'narr', t: 'Ein rosa Zettelchen von Mert. Darauf steht:' }, { who: 'narr', t: NOTES[i % NOTES.length] }]); });
    g.quests.emit('lovenote');
  } else if (p.k === 'recipe') {
    C.recipes.push(p.id);
    g.audio.play('pling');
    g.particles.sparkles(p.x, p.y, 8);
    g.ui.toast(`Rezeptseite gefunden! (${C.recipes.length}/5)`, 'scroll');
    g.quests.emit('recipe');
  } else if (p.k === 'icestar') {
    C.stars.push(p.id);
    g.audio.play('horseshoe');
    g.particles.sparkles(p.x, p.y, 16, 20, '#e6f6ff');
    g.ui.toast(`Eiskristall! (${C.stars.length}/5)`, 'star', 'mint');
    g.quests.emit('icestar');
  }
  g.requestSave();
}

function cloverReward(g, n) {
  const S = g.S;
  const rewards = { 10: ['bow_klee', 'Kleeblattschleifen'], 20: ['saddle_klee', 'Glückssattel'] };
  if (!rewards[n] || S.cloverRewards.includes(n)) return;
  S.cloverRewards.push(n);
  g.inv.unlock(rewards[n][0]);
  g.inv.addCoins(n * 4);
  g.pending.push(async () => {
    g.audio.play('fanfare');
    g.particles.confetti(g.player.x, g.player.y);
    await g.say([`${n} Glücksklee-Blätter! Belohnung: ${rewards[n][1]} und ${n * 4} Münzen!`, n === 20 ? 'ALLE zwanzig! Du bist das größte Glückskind der ganzen Gegend.' : 'Leg das Zubehör im Pferde-Menü (P) an.']);
  });
}

// ---------- Briefkasten ----------
export function mailLetters(g) {
  const S = g.S, season = seasonOf(S);
  if (S.flags.hildeAway) {
    return [
      'Eine Postkarte von Oma Hilde, mit Möwe: „Ihr Lieben! Das Meer ist so groß und Gerda so laut wie früher. Ich vermisse euch und die Pferde. Gebt Maumau einen Kuss von mir!“',
      'Ein Brief von Oma Hilde: „Gerda und ich waren im Watt. Ich bin steckengeblieben – wie Karl damals im See! Wir haben gelacht wie Kinder.“',
      'Eine Karte von Oma Hilde: „Der Leuchtturm hier ist nicht so schön wie Kunos. Sagt ihm das nicht, sonst wird er eingebildet.“',
      'Ein Brief von Oma Hilde: „Ich stricke Mira einen Schal. Gerda sagt, Hunde brauchen keine Schals. Gerda hat keine Ahnung.“',
    ];
  }
  const by = {
    autumn: ['Ein Zettel von Ella: „Igel lieben Laubhaufen. Lasst ein paar liegen!“', 'Ein Brief von Lotte, mit Pferdezeichnung: „Für meine Reitlehrerin ♥“'],
    winter: ['Ein Brief von Berta: „Plätzchen-Alarm! Frisch aus dem Ofen.“', 'Eine Karte von Kuno: „Bei Schneesturm bleibt die Landratte drinnen. Ahoi!“'],
    spring: ['Eine Postkarte von Gerda: „Liebe {name}, Hilde erzählt nur von dir. Ich komme euch besuchen!“', 'Ein Zettel von Ben: „Die Störche sind zurück! Ich hab sie gezählt: 2.“'],
    summer: ['Ein Brief von Mia: „Training für den Kleeberg-Pokal! Ich kriege dich!“', 'Ein Brief von Mert: „Ich weiß, ich wohne hier. Ich wollte dir trotzdem einen Brief schreiben. Ich hab dich lieb. ♥“'],
  };
  return by[season] || by.summer;
}

// ---------- Kapitel geschafft ----------
const CHAPTER_LINES = {
  7: [{ who: 'mert', t: 'Kapitel 7 geschafft! Ein Hofladen, ein Igel, ein Laubhaufen voller Küsse – was für ein Herbst!' }],
  8: [{ who: 'lotte', t: 'Kapitel 8 geschafft! Und ich kann reiten! Ich! Kann! Reiten!' }],
  9: [{ who: 'mert', t: 'Kapitel 9 geschafft! Opa Karls Schatz … ich glaube, der eigentliche Schatz war die Liebe darin.' }],
  10: [{ who: 'hilde', t: 'Kapitel 10 geschafft! Schnee, Lichter und ihr zwei. Mein Herz ist warm wie ein Kachelofen.' }],
  11: [{ who: 'hilde', t: 'Kapitel 11 geschafft! Die Tulpen blühen wieder. Karl wäre so glücklich.' }],
  12: [{ who: 'mert', t: 'Kapitel 12 geschafft! Willkommen zu Hause, {name}. In unserem Zuhause.' }],
};
export function chapterLines(ch) { return CHAPTER_LINES[ch] || null; }

// ---------- Direkt mit Teil 2 starten (neues Gerät, kein Spielstand) ----------
export function makePart2State(look = {}) {
  const S = defaultState();
  Object.assign(S.player, { name: 'Jolina', skin: 0, hair: 0, hairColor: 2, outfit: 0, hat: false }, look);
  S.created = Date.now();
  for (const q of QUESTS) if (!q.part2) S.quests[q.id] = { state: 'done' };
  Object.assign(S.farm, { stable: true, paddock: true, flowerGarden: true, gazebo: true, petcorner: true, festival: true });
  const mk = (o) => makeHorseRecord(o);
  const start = mk({ id: 'h_start', name: 'Sternchen', coat: 'fuchs', marking: 'blaze', personality: 'sanft' });
  start.pts = 100; start.acc.saddle = 'saddle_rosa'; start.acc.bow = 'bow_rosa'; start.place = 'world'; start.x = 80.5; start.y = 89.9;
  const klee = mk({ id: 'kleeblatt', name: 'Kleeblatt', coat: 'fuchs', mane: '#f7e0b0', marking: 'blaze', socks: true, personality: 'verschmust' }); klee.pts = 60;
  const nebel = mk({ id: 'nebel', name: 'Nebel', coat: 'apfel', mane: '#ffffff', marking: 'snip', personality: 'wild' }); nebel.pts = 40;
  const foal = mk({ id: 'foal', name: 'Wölkchen', coat: 'fuchs', marking: 'star', socks: true, personality: 'verschmust', foal: true });
  S.horses.push(start, klee, nebel, foal);
  S.ridingHorse = 'h_start';
  S.stats.tamed = 2;
  S.player.coins = 250;
  S.flags.kitten = 'home'; S.flags.kittens = ['Flocke', 'Pünktchen', 'Keks']; S.flags.manniToy = true; S.flags.miraRosette = true;
  S.owned.saddle_rosa = true; S.owned.bow_rosa = true; S.owned.bow_herz = true;
  for (const id of ['farm', 'village', 'meadow', 'forest', 'lake', 'beach', 'mountain']) S.discovered[id] = true;
  for (const t of ['firstHorse', 'stable', 'tame', 'race', 'paddock', 'picnic', 'garden', 'date', 'ausritt', 'birthday', 'laube', 'kittens', 'dogshow', 'petcorner', 'nebel', 'stars', 'finale', 'foal']) S.memories.push({ type: t, day: 1, horse: 'h_start', name: 'Wölkchen', medal: 'gold' });
  S.ending = { done: true, foal: { name: 'Wölkchen' } };
  S.tutorial = { move: true, pet: true, ride: true, gallop: true, quest: true, map: true, bag: true, album: true, shoe: true, wild: true, night: true };
  S.time.day = 40;
  S.player.x = FARM.spawn.x; S.player.y = FARM.spawn.y;
  return S;
}

export { pick, REG, WW };
