// Szenen von Teil 2: Kapitel 10–13 und Nebenaufgaben.
import { SPOTS, TILE, FARM } from './world.js';
import { stage, endStage, kiss, forceDismount, love } from './scenes.js';
import { drawSnowball, drawSleigh, drawSled, drawGift, drawLantern } from './draw/props.js';
import { drawHorse, horseLook } from './draw/horse.js';
import { drawCharacter, npcLook } from './draw/characters.js';
import { NPCS } from './data/npcs.js';
import { Animal } from './animals.js';
import { Prop, placeNpc, homeAll, digAnim } from './scenekit.js';
import { dist, pick } from './util.js';

const T = TILE;
const nap = (g, h) => {
  // bis zu einer Uhrzeit vorspulen (Garten wächst mit)
  const cur = g.S.time.minutes / 60;
  if (cur < h) g.growCrops(h - cur, false);
  g.S.time.minutes = h * 60;
  g.updateLighting();
};

// ---------- Kapitel 10: Winterwunderland ----------
export async function snowball(g) {
  const S = g.S, sp = SPOTS.snowman;
  g.cutscene = true;
  const stageN = (S.flags.snowman || 0) + 1;
  const r = [0, 14, 10, 8][stageN] || 8;
  const ball = new Prop(sp.x - 2.5, sp.y + 0.3, (c) => drawSnowball(c, ball.r));
  ball.r = 3;
  g.sceneEntities = [ball];
  g.rebuildEntities();
  for (let i = 0; i < 24; i++) { ball.x += 2.5 / 24; ball.r = 3 + (r - 3) * (i / 24); if (i % 4 === 0) { g.particles.snow(ball.x, ball.y, 3); g.audio.play('step'); } await g.wait(0.04); }
  g.sceneEntities = null;
  S.flags.snowman = stageN;
  g.props = (await import('./scenes2.js')).buildProps(g);
  g.rebuildEntities();
  g.particles.snow(sp.x, sp.y - 0.5, 12);
  g.audio.play('pop');
  const txt = ['', 'Die dicke Bauchkugel ist fertig!', 'Die Mittelkugel sitzt. Noch der Kopf!', 'Der Kopf! Mit Kohleaugen, Karottennase, Mütze und Schal. Ein Prachtkerl!'][stageN];
  g.ui.hint(txt, 3);
  g.cutscene = false;
  g.quests.emit('snowball');
  g.requestSave();
}

export async function snowballFight(g) {
  const sp = SPOTS.snowman;
  await stage(g, sp.x - 2.2, sp.y + 0.8, 3.6);
  const P = g.player, m = g.npcById('mert');
  await g.say([{ who: 'mert', t: 'Er ist wunderschön. Fast so schön wie … Moment.' }]);
  // Mert wirft einen Schneeball
  g.particles.add({ type: 'snowball', x: m.x, y: m.y - 0.6, z: 30, vx: (P.x - m.x) / 0.6, vy: 0, vz: 60, g: 170, life: 0.6 });
  g.audio.play('jump');
  await g.wait(0.6);
  g.particles.snow(P.x, P.y - 0.8, 16);
  g.audio.play('land');
  await g.say([{ who: 'narr', t: 'PLATSCH! Ein Schneeball, mitten auf deine Mütze. Mert grinst wie ein Honigkuchenpferd.' }, { who: 'player', t: 'Na warte!' }]);
  for (let i = 0; i < 3; i++) {
    g.particles.add({ type: 'snowball', x: P.x, y: P.y - 0.6, z: 30, vx: (m.x - P.x) / 0.55, vy: 0, vz: 55, g: 170, life: 0.55 });
    g.audio.play('jump');
    await g.wait(0.55);
    g.particles.snow(m.x, m.y - 0.8, 12);
    await g.wait(0.15);
  }
  await g.say([{ who: 'narr', t: 'Treffer, Treffer, TREFFER! Mert lässt sich theatralisch in den Schnee fallen und macht einen Schneeengel.' }, { who: 'mert', t: 'Ich ergebe mich! Aber nur gegen einen Kuss.' }]);
  m.x = P.x + 0.9; m.y = P.y;
  await kiss(g, 'nase');
  g.quests.emit('snowfight');
  await endStage(g);
}

export async function miraSweater(g) {
  const S = g.S;
  S.flags.miraSweater = true;
  const m = g.pets?.mira;
  if (m) { m.sweater = S.season === 'winter'; m.hop(3); g.particles.hearts(m.x, m.y - 0.5, 6); }
  g.audio.play('bark');
  await g.say([{ who: 'narr', t: 'Mira trägt jetzt einen winzigen rosa Strickpullover mit einem Herz auf dem Rücken. Sie dreht sich stolz im Kreis und will gar nicht mehr aufhören.' }]);
}

export function brushAlpaca(g, a) {
  const S = g.S;
  S.flags.alpacaBrushed = S.flags.alpacaBrushed || {};
  const key = a.variant + ':' + S.time.day;
  a.state = 'happy'; a.stateT = 3;
  g.audio.play('brush');
  g.particles.add({ type: 'sparkle', x: a.x, y: a.y - 0.3, z: 30, vz: 20, life: 0.8, size: 1.4, color: '#fff' });
  if (S.flags.alpacaBrushed[key]) { g.ui.hint('Dieses Alpaka ist heute schon ganz flauschig gebürstet. Probier ein anderes!', 3); return; }
  S.flags.alpacaBrushed[key] = true;
  g.inv.add('wool', 1);
  g.particles.text(a.x, a.y - 0.6, '+1 Alpakawolle');
  g.ui.hint(pick(['Das Alpaka summt zufrieden und lässt dich ein Büschel Wolle aufsammeln.', 'So weich! Das Alpaka schließt genießerisch die Augen.', 'Das Alpaka summt eine kleine Melodie. Ein Bündel Wolle für dich!']), 3);
  g.quests.emit('alpaca_brush');
  g.requestSave();
}

export async function feedRack(g, q, step) {
  const sp = SPOTS.rack;
  g.inv.removeAll(step.needs);
  g.cutscene = true;
  g.audio.play('pop');
  await g.say([{ who: 'narr', t: 'Du legst duftendes Heu in die Krippe und die Karotten obendrauf. Dann versteckst du dich ein Stück weiter hinter einem Baum.' }]);
  await g.fade(true);
  const P = g.player;
  forceDismount(g);
  P.x = sp.x + 3.6; P.y = sp.y + 1.2; P.face = 'left';
  const deer = [];
  const ben = placeNpc(g, 'ben', sp.x + 4.6, sp.y + 1.5, 'left');
  for (let i = 0; i < 3; i++) { const a = new Animal('deer', sp.x - 6 - i * 1.4, sp.y + 0.3 + i * 0.6, i); a.mode = 'scene'; a.visible = true; if (i === 2) a.scale = 0.95; deer.push(a); }
  g.sceneEntities = deer;
  g.rebuildEntities();
  g.camOverride = { x: sp.x + 0.5, y: sp.y };
  g.renderer.follow(sp.x + 0.5, sp.y, 0, true);
  await g.fade(false);
  deer.forEach((a, i) => a.setTarget(sp.x - 0.6 + i * 0.9, sp.y + 0.6 + (i % 2) * 0.5, 1.2));
  await g.wait(3.2);
  for (const a of deer) a.state = 'graze';
  await g.say([
    { who: 'narr', t: 'Leise stapfen drei Rehe aus dem Wald. Eine Rehmama, ein Rehpapa – und ein kleines Kitz mit wackeligen Beinen.' },
    { who: 'ben', t: '(flüstert) Psst! Guck mal, das Kleine! Es hat eine Karotte! Es hat eine KAROTTE!' },
    { who: 'narr', t: 'Das Kitz knabbert vorsichtig, schaut zu euch herüber – und frisst dann seelenruhig weiter.' },
    { who: 'ben', t: 'Das schreib ich in mein Buch. Auf die allererste Seite.' },
  ]);
  g.particles.hearts(sp.x, sp.y, 6);
  await g.fade(true);
  g.sceneEntities = null;
  homeAll(g, ['ben']);
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('feed_rack');
  g.saveNow();
  void ben;
}

export async function skateMert(g) {
  const S = g.S, sp = SPOTS.icecenter;
  nap(g, 20.6);
  await stage(g, sp.x - 0.6, sp.y, 1.2);
  const P = g.player, m = g.npcById('mert');
  await g.say([{ who: 'mert', t: 'Da bist du! Halt dich an mir fest. Oder ich mich an dir. Eher ich mich an dir.' }]);
  // Hand in Hand Kreise fahren
  const cx = sp.x, cy = sp.y;
  for (let i = 0; i < 110; i++) {
    const a = i * 0.06;
    P.x = cx + Math.cos(a) * 2.6 - 0.45; P.y = cy + Math.sin(a) * 1.4;
    m.x = cx + Math.cos(a) * 2.6 + 0.45; m.y = cy + Math.sin(a) * 1.4;
    const f = Math.sin(a) > 0 ? 'left' : 'right';
    P.face = f; m.face = f;
    if (i % 6 === 0) g.particles.sparkles(P.x, P.y + 0.2, 2, 4, '#e6f6ff');
    await g.wait(0.04);
  }
  P.x = cx - 0.6; m.x = cx + 0.6; P.y = m.y = cy; P.face = 'right'; m.face = 'left';
  await g.say([
    { who: 'narr', t: 'Ihr gleitet über das Eis, Runde um Runde. Der Mond spiegelt sich im See, und Mira rutscht kreischend vor Freude hinter euch her.' },
    { who: 'mert', t: 'Weißt du, was ich gerade denke? Dass ich mit dir sogar Eislaufen kann. Und ich KANN kein Eislaufen.' },
  ]);
  for (let i = 0; i < 3; i++) g.particles.shootingStar(cx - 10 + i * 4, cy - 3);
  await kiss(g, 'eis');
  g.quests.emit('skate_mert');
  await endStage(g);
}

export async function fetchTree(g) {
  const S = g.S;
  if (!g.player.riding) { g.ui.hint('Zu Fuß ist die Tanne viel zu schwer. Hol dein Pferd (<kbd>R</kbd>) und versuch es nochmal!', 5); return; }
  g.cutscene = true;
  g.audio.play('neigh');
  await g.say([{ who: 'narr', t: 'Du bindest die Tanne mit einem Seil an den Sattel. {horse} schnaubt, stemmt sich ins Geschirr – und zieht die Tanne den ganzen Weg bis nach Kleeberg.' }]);
  await g.fade(true);
  S.farm.firFetched = true;
  S.farm.plazaTree = true;
  const P = g.player;
  P.x = SPOTS.plazaTree.x + 2.5; P.y = SPOTS.plazaTree.y + 1.5;
  if (P.horse) { P.horse.x = P.x; P.horse.y = P.y; }
  g.rebuildWorldKeepState();
  g.refreshPart2?.();
  const ids = ['theo', 'berta', 'luise', 'mia', 'lotte'];
  const pos = [[2, 0.4], [-1.6, 1.4], [0.6, 2], [3.4, 1.6], [-0.4, 2.8]];
  ids.forEach((id, i) => placeNpc(g, id, SPOTS.plazaTree.x + pos[i][0], SPOTS.plazaTree.y + pos[i][1], 'up'));
  g.camOverride = { x: SPOTS.plazaTree.x + 1, y: SPOTS.plazaTree.y };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  await g.fade(false);
  g.audio.play('fanfare');
  g.particles.confetti(SPOTS.plazaTree.x, SPOTS.plazaTree.y - 1, 40);
  await g.say([{ who: 'theo', t: 'Hm-hm. Hm-HM! Das ist sie. Die schönste Tanne der Welt. Ich hatte recht. Wie immer.' }, { who: 'lotte', t: 'Sie ist so groß wie ein Riese! Ein Riese aus Weihnachten!' }, { who: 'luise', t: 'Jetzt fehlt nur noch der Schmuck. Bringst du mir Tannenzapfen? Sechs Stück!' }]);
  await g.fade(true);
  homeAll(g, ids);
  g.camOverride = null;
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('fetch_tree');
  g.saveNow();
}

export async function winterFest(g) {
  const S = g.S, sp = SPOTS.farmTree;
  nap(g, 19.5);
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = sp.x - 0.6; P.y = sp.y + 1.6; P.face = 'right';
  const ids = ['mert', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'];
  const pos = [[0.6, 1.6, 'left'], [-3.4, 0.6, 'right'], [-4.4, 1.8, 'right'], [3.4, 0.4, 'left'], [4.4, 1.6, 'left'], [-2.4, 2.8, 'up'], [-1.2, 3.2, 'up'], [3, 2.8, 'up'], [1.2, 3.2, 'up'], [5.2, 0.6, 'left']];
  ids.forEach((id, i) => placeNpc(g, id, sp.x + pos[i][0], sp.y + pos[i][1], pos[i][2]));
  const gifts = [['#ff7eb6', -0.8], ['#7ec8ff', 0.2], ['#ffd166', 1.2]].map(([c, dx]) => new Prop(sp.x + dx, sp.y + 0.5, (cc) => drawGift(cc, c)));
  const tree = new Prop(sp.x, sp.y - 0.05, (c, t) => { /* Baum ist Teil der Welt, nach Fest */ void c; void t; });
  g.sceneEntities = [...gifts, tree];
  g.festivalLights = [];
  for (let i = 0; i < 10; i++) g.festivalLights.push({ x: sp.x - 6 + i * 1.3, y: sp.y - 2.6 + Math.sin(i) * 0.3, r: 2, c: ['#ffb3c8', '#ffe39a', '#b3e3ff', '#c9ffb3'][i % 4] });
  g.rebuildEntities();
  g.camOverride = { x: sp.x, y: sp.y };
  g.renderer.follow(sp.x, sp.y, 0, true);
  await g.fade(false);
  g.ui.banner('Winterabend auf dem Ponyhof', 'Alle sind gekommen ♥');
  await g.say([
    { who: 'mert', t: 'Willkommen zum ersten Winterfest auf dem Ponyhof! Es gibt Kinderpunsch, Plätzchen und … ich hab die Lichterkette dreimal neu aufgehängt.' },
    { who: 'berta', t: 'Und sie leuchtet wunderschön, mein Junge.' },
    { who: 'mert', t: 'Und jetzt – die Überraschung! Hört ihr das?' },
  ]);
  // Hilde kommt mit dem Schlitten
  g.audio.play('jingle');
  const sleigh = new Prop(sp.x + 14, sp.y - 0.6, (c, t) => {
    drawHorse(c, horseLook({ coat: 'apfel', mane: '#ffffff', marking: 'snip', acc: { blanket: 'blanket_karo' } }), { t, pose: 'trot', face: -1, scale: 1.1 });
    c.save(); c.translate(42, 4); drawSleigh(c, t); c.translate(-2, -18); c.scale(0.9, 0.9); drawCharacter(c, npcLook({ ...NPCS.hilde.look, scarf: '#ff9fb2' }), { dir: 'left', t, seated: true, noShadow: true }); c.restore();
  });
  g.sceneEntities.push(sleigh);
  g.rebuildEntities();
  for (let i = 0; i < 70; i++) { sleigh.x -= 0.14; if (i % 6 === 0) { g.particles.snow(sleigh.x + 1, sleigh.y, 4); g.audio.play('jingle'); } await g.wait(0.04); }
  await g.wait(0.4);
  sleigh.visible = false;
  S.flags.hildeAway = false;
  const h = placeNpc(g, 'hilde', sp.x + 4.6, sp.y - 0.2, 'left');
  g.rebuildEntities();
  g.particles.hearts(h.x, h.y - 0.8, 10);
  g.audio.play('fanfare');
  await g.say([
    { who: 'hilde', t: 'Frohe Weihnachten, ihr Lieben! Habt ihr gedacht, ich lasse euch an Weihnachten allein?' },
    { who: 'player', t: 'OMA HILDE!' },
    { who: 'narr', t: 'Du rennst zu ihr und umarmst sie so fest, dass ihr Hut verrutscht. Mira springt an ihr hoch, Maumau maunzt empört, weil keiner sie hochhebt.' },
    { who: 'hilde', t: 'Ich hab euren Brief bekommen. Über Karls Schatz. Ich hab ihn hundertmal gelesen und hundertmal geweint. Vor Glück.' },
    { who: 'hilde', t: 'Gerda sagt, ich soll nach Hause fahren, wo mein Herz ist. Und mein Herz ist hier. Bei euch. Ich bleibe!' },
  ]);
  g.audio.playTune?.('tannenbaum');
  await g.say([{ who: 'narr', t: '♪ O Tannenbaum, o Tannenbaum … ♪ Alle singen. Kuno spielt Ziehharmonika, Theo brummt den Bass, und Lotte singt drei Takte zu früh – aber dafür am lautesten.' }]);
  await g.say([
    { who: 'mert', t: '{name}, das hier ist für dich.' },
    { who: 'narr', t: 'Mert gibt dir ein kleines Kästchen. Darin liegt eine silberne Kette mit einem winzigen Pferdeanhänger – und auf der Rückseite ist eingraviert: „Mein Zuhause bist du.“' },
    { who: 'player', t: 'Mert … die ist wunderschön.' },
    { who: 'mert', t: 'So wie du. Okay, das war kitschig. Aber es stimmt!' },
  ]);
  m2(g).x = P.x + 0.9; m2(g).y = P.y; m2(g).face = 'left'; P.face = 'right';
  await kiss(g, 'kuss');
  // Neujahrsfeuerwerk
  nap(g, 23.9);
  g.updateLighting();
  await g.say([{ who: 'paula', t: 'Zehn, neun, acht, … zwei, eins – FROHES NEUES JAHR!' }]);
  const cols = ['#ff7eb6', '#ffd166', '#7ec8ff', '#b79cf0', '#8fe0c0'];
  for (let i = 0; i < 10; i++) { g.particles.firework(sp.x - 6 + Math.random() * 12, sp.y - 1, 150 + Math.random() * 80, cols[i % 5], i % 2 === 0); g.audio.play('boom'); await g.wait(0.55); }
  S.flags.locket = true;
  await g.wait(1.2);
  await g.fade(true);
  homeAll(g, [...ids, 'hilde']);
  g.sceneEntities = null;
  g.festivalLights = null;
  g.camOverride = null;
  S.time.day++; S.time.minutes = 9 * 60;
  g.updateLighting();
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('winterfest');
  g.saveNow();
}
const m2 = (g) => g.npcById('mert');

// ---------- Kapitel 11: Frühlingserwachen ----------
export async function longe(g) {
  const S = g.S, A = FARM.arena;
  const fe = g.horseEntity('foal');
  if (!fe) return;
  if (g.player.riding) { g.ui.hint('Zum Longieren steigst du ab (<kbd>R</kbd>) und stellst dich in die Mitte.', 4); return; }
  g.cutscene = true;
  const cx = A.x + A.w / 2, cy = A.y + A.h / 2;
  const P = g.player;
  P.x = cx; P.y = cy; P.face = 'down';
  fe.mode = 'scene'; fe.target = null;
  const t0 = g.t;
  let last = null;
  while (g.t - t0 < 3.4) {
    const a = ((g.t - t0) / 3.4) * Math.PI * 2;
    const x = cx + Math.cos(a) * 4.2, y = cy + Math.sin(a) * 2.2;
    if (last) fe.face = x > last ? 1 : -1;
    fe.x = x; fe.y = y; fe.speed = 5; fe.pose = 'trot';
    last = x;
    if (Math.random() < 0.2) g.particles.dust(x, y, 1);
    await g.wait(0);
  }
  fe.speed = 0; fe.pose = 'stand';
  S.flags.longe = (S.flags.longe || 0) + 1;
  g.audio.play('neigh', { pitch: 1.3 });
  g.particles.hearts(fe.x, fe.y - 1, 3);
  const n = S.flags.longe;
  g.ui.hint(n === 1 ? '{foal} trabt eine schöne Runde an der Longe. Brav!' : n === 2 ? 'Noch eine Runde – {foal} hört schon auf deine Stimme.' : '{foal} ist bereit für den ersten Ritt!', 3);
  g.cutscene = false;
  g.quests.emit('longe');
}

export async function firstRide(g) {
  const S = g.S, A = FARM.arena;
  const rec = S.horses.find((h) => h.id === 'foal');
  const fe = g.horseEntity('foal');
  if (!rec || !fe) return;
  const cx = A.x + A.w / 2, cy = A.y + A.h / 2;
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const ids = ['mert', 'hilde', 'lotte', 'ella'];
  const pos = [[A.x + A.w + 1, cy - 1], [A.x + A.w + 1.6, cy + 0.6], [A.x + A.w + 0.6, cy + 1.8], [A.x + A.w + 2.4, cy - 0.4]];
  ids.forEach((id, i) => placeNpc(g, id, pos[i][0], pos[i][1], 'left'));
  fe.mode = 'scene'; fe.x = cx; fe.y = cy; fe.face = 1;
  const P = g.player;
  P.x = cx - 1.2; P.y = cy + 0.3; P.face = 'right';
  g.camOverride = { x: cx + 2, y: cy - 0.6 };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  g.rebuildEntities();
  await g.fade(false);
  await g.say([{ who: 'mert', t: 'Ganz ruhig, {foal}. Ganz ruhig. … Ich meine mich. Ich bin nervöser als sie.' }, { who: 'narr', t: 'Du legst {foal} den neuen Sattel auf. Sie dreht den Kopf, schnuppert daran – und bleibt ganz still stehen.' }, { who: 'narr', t: 'Dann setzt du einen Fuß in den Steigbügel … und schwingst dich ganz sanft hinauf.' }]);
  // Fohlen ist groß!
  rec.foal = false;
  rec.grow = 1;
  rec.follow = false;
  rec.acc.saddle = rec.acc.saddle || 'saddle_rosa';
  g.inv.unlock('saddle_rosa');
  rec.place = 'world';
  S.ridingHorse = rec.id;
  P.mount(fe);
  g.rebuildEntities();
  g.audio.play('neigh');
  g.particles.hearts(P.x, P.y - 1, 12);
  // eine Runde reiten
  await new Promise((r) => { P.autoMove = { x: cx + 3.5, y: cy - 1.4, spd: 3, done: r }; });
  await new Promise((r) => { P.autoMove = { x: cx + 1, y: cy + 1.2, spd: 3, done: r }; });
  g.audio.play('fanfare');
  g.particles.confetti(P.x, P.y, 50);
  await g.say([
    { who: 'lotte', t: 'Sie lässt dich reiten! Sie LÄSST dich reiten!' },
    { who: 'hilde', t: 'Wie damals, als Karl zum ersten Mal auf seinem Fohlen saß. Genau so hat er gestrahlt.' },
    { who: 'ella', t: 'Gesund, kräftig und glücklich. Das ist ein Pferd, das sich sicher fühlt. Wegen dir.' },
    { who: 'mert', t: '{name} und {foal}. Das schönste Team auf dem ganzen Hof. Ach was – auf der ganzen Welt.' },
  ]);
  S.memories.push({ type: 'ritt', day: S.time.day, horse: rec.id });
  await g.fade(true);
  homeAll(g, ids);
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('first_ride');
  g.hint('Ab jetzt kannst du {foal} reiten! Sie ist dein Reitpferd – im Pferde-Menü (<kbd>P</kbd>) kannst du jederzeit wechseln.', 'firstride');
  g.saveNow();
}

export async function findWildFoal(g) {
  const S = g.S;
  if (g.player.riding) { g.ui.hint('Das Fohlen ist sehr scheu. Steig lieber ab (<kbd>R</kbd>) und geh ganz leise hin.', 5); return; }
  const wf = g.horseEntity('wildfoal');
  g.cutscene = true;
  await g.say([{ who: 'narr', t: 'Da steht es: ein winziges, falbfarbenes Fohlen mit einem weißen Stern auf der Stirn. Es zittert ein bisschen und ruft leise nach seiner Mama.' }, { who: 'narr', t: 'Du gehst in die Hocke und streckst ganz langsam die Hand aus. Das Fohlen schnuppert … und stupst dich an.' }]);
  S.flags.wildfoal = 'follow';
  if (wf) { wf.mode = 'follow'; g.particles.hearts(wf.x, wf.y - 0.6, 6); }
  g.audio.play('neigh', { pitch: 1.6 });
  g.cutscene = false;
  g.quests.emit('find_wildfoal');
  g.hint('Das Fohlen folgt dir! Geh langsam nach Osten zur Wildpferdewiese.', 5);
  g.requestSave();
}

export async function wildFoalHome(g) {
  const S = g.S;
  const wf = g.horseEntity('wildfoal');
  const mom = g.horses.find((h) => h.mode === 'herd');
  g.cutscene = true;
  if (mom && wf) { mom.setTarget(wf.x + 1, wf.y, 6); }
  g.audio.play('neigh', { pitch: 0.9 });
  await g.wait(1.4);
  if (wf) { wf.mode = 'scene'; g.particles.hearts(wf.x + 0.5, wf.y - 1, 10); }
  g.audio.play('neigh', { pitch: 1.6 });
  await g.say([{ who: 'narr', t: 'Eine Stute hebt den Kopf, wiehert – und galoppiert auf euch zu. Das Fohlen quiekt vor Freude und rennt ihr entgegen.' }, { who: 'narr', t: 'Die beiden stehen ganz eng beieinander, Nase an Nase. Die ganze Herde schnaubt zufrieden. Mama ist wieder da.' }]);
  S.flags.wildfoal = 'home';
  if (wf) { wf.mode = 'herd'; wf.homeX = SPOTS.herdHome.x; wf.homeY = SPOTS.herdHome.y; }
  g.cutscene = false;
  g.quests.emit('return_wildfoal');
  g.saveNow();
}

export async function storkNest(g) {
  const S = g.S;
  g.cutscene = true;
  await g.fade(true);
  S.farm.storks = true;
  g.rebuildWorldKeepState();
  g.refreshPart2?.();
  await g.fade(false);
  await g.say([{ who: 'narr', t: 'Paula hält die Leiter, du kletterst aufs Dach. Bretter als Boden, Heu als Polster, ein paar Zweige außenrum – fertig ist das schönste Storchennest von Kleeberg.' }]);
  await g.wait(0.6);
  g.audio.play('bird');
  await g.say([{ who: 'narr', t: 'Und schon am Nachmittag kreisen zwei Störche über dem Dorf. Sie landen, klappern mit den Schnäbeln – und ziehen ein.' }, { who: 'paula', t: 'Zack, zack – die beste Post des Jahres! Storchenpost! Danke, {name}!' }]);
  g.cutscene = false;
  g.quests.emit('storks');
  g.saveNow();
}

// ---------- Kapitel 12: Unser kleines Zuhause ----------
export async function cottageSite(g) {
  const S = g.S, sp = SPOTS.cottage;
  await stage(g, sp.x - 0.8, sp.y + 1, 1.3);
  await g.say([{ who: 'mert', t: 'Hier! Morgens scheint hier zuerst die Sonne, und vom Fenster aus sieht man den Hügel mit dem Blütenbaum.' }, { who: 'mert', t: 'Und jetzt das Wichtigste: Welche Farbe soll unser Häuschen haben?' }]);
  const walls = [['Rosa', '#ffd8e4'], ['Minzgrün', '#d6f2e0'], ['Himmelblau', '#dcecff'], ['Vanillegelb', '#fff1c8']];
  const roofs = [['Rot', '#e8586a'], ['Flieder', '#a98be8'], ['Blau', '#5f8fd9'], ['Waldgrün', '#5fa87a']];
  const w = await g.ask('Welche Farbe sollen die Wände haben?', walls.map((x) => x[0]), 'mert');
  const r = await g.ask('Und das Dach?', roofs.map((x) => x[0]), 'mert');
  S.farm.cottageStyle = { wall: walls[w][1], roof: roofs[r][1], timber: '#c98a8a' };
  await g.say([{ who: 'mert', t: `${walls[w][0]} mit ${roofs[r][0].toLowerCase()}em Dach. Perfekt. Genau so hab ich es mir vorgestellt. Na gut, ich hab es mir in allen Farben vorgestellt.` }]);
  g.quests.emit('cottage_site');
  await endStage(g);
}

export async function hammer(g) {
  const S = g.S, sp = SPOTS.cottage;
  g.cutscene = true;
  for (let i = 0; i < 3; i++) { g.audio.play('hammer'); g.renderer.shake = 2; g.particles.dust(sp.x + (Math.random() - 0.5) * 2, sp.y - 1, 3); await g.wait(0.28); }
  S.flags.hammer = (S.flags.hammer || 0) + 1;
  const n = S.flags.hammer;
  g.ui.hint(['', 'Das Fundament aus Feldsteinen ist gelegt!', 'Die Wände stehen!', 'Das Dach ist drauf!', 'Fenster, Tür und Veranda – fertig!'][Math.min(4, n)], 3);
  g.cutscene = false;
  g.quests.emit('build');
}

export async function richtfest(g) {
  const sp = SPOTS.cottage;
  await stage(g, sp.x - 0.8, sp.y + 0.8, 1.3);
  placeNpc(g, 'hilde', sp.x - 2.4, sp.y + 1.6, 'up');
  g.rebuildEntities();
  await g.say([
    { who: 'narr', t: 'Mert klettert aufs Dach und hängt einen Kranz aus Blumen an den Giebel – so macht man das beim Richtfest.' },
    { who: 'mert', t: 'Auf unser Häuschen! Möge es nie einstürzen, immer warm sein und nie von Manni als Kratzbaum benutzt werden!' },
    { who: 'hilde', t: 'Ein Haus ist schnell gebaut. Ein Zuhause wird es erst durch die, die darin lachen. Und ihr lacht viel.' },
  ]);
  homeAll(g, ['hilde']);
  await endStage(g);
}

export async function furnish(g) {
  const S = g.S;
  g.cutscene = true;
  g.inv.remove('curtains', 1);
  const st = S.farm.cottageStyle || { wall: '#ffd8e4', roof: '#e86f8f' };
  await g.screens.interiorCard(st);
  await g.say([{ who: 'narr', t: 'Gardinen an die Fenster, Kissen aufs Sofa, die Spieluhr aufs Regal. Maumau testet sofort das Sofa. Manni testet sofort Maumau.' }, { who: 'mert', t: 'Es ist perfekt. Es ist unseres.' }]);
  g.cutscene = false;
  g.quests.emit('furnish');
}

export async function housewarming(g) {
  const S = g.S, sp = SPOTS.cottage;
  nap(g, 17.8);
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = sp.x - 0.6; P.y = sp.y + 1.4; P.face = 'right';
  const ids = ['mert', 'hilde', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'];
  const pos = [[0.6, 1.4, 'left'], [-2.6, 1, 'right'], [-3.4, 2.2, 'right'], [-2.2, 3.2, 'up'], [2.4, 1, 'left'], [3.2, 2.2, 'left'], [-0.8, 3.4, 'up'], [0.6, 3.6, 'up'], [3.8, 0.2, 'left'], [2, 3.2, 'up'], [-4.2, 0.4, 'right']];
  ids.forEach((id, i) => placeNpc(g, id, sp.x + pos[i][0], sp.y + pos[i][1], pos[i][2]));
  g.camOverride = { x: sp.x, y: sp.y + 0.6 };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  g.rebuildEntities();
  g.audio.setMode('festival');
  await g.fade(false);
  g.particles.confetti(sp.x, sp.y, 60);
  g.audio.play('fanfare');
  await g.say([
    { who: 'berta', t: 'Herzlichen Glückwunsch zum eigenen Häuschen! Vier Kuchen. Einer für jede Wand.' },
    { who: 'theo', t: 'Hm-hm. Ich hab einen Witz vorbereitet: Was sagt ein Haus zum anderen? „Du hast ja gar keinen Garten!“ … Hm. Er war besser in meinem Kopf.' },
    { who: 'kuno', t: 'Ahoi! Ein Seemannslied für das neue Zuhause!' },
    { who: 'lotte', t: 'Darf ich bei euch übernachten? Bitte? Ich bring auch meinen eigenen Schlafsack mit. Und ein Pferd. Ein gemaltes.' },
    { who: 'hilde', t: 'Auf {name} und Mert! Und auf alle, die dieses Häuschen noch zum Lachen bringen werden.' },
  ]);
  await g.fade(true);
  homeAll(g, ids.filter((x) => x !== 'mert'));
  nap(g, 21.4);
  P.x = sp.x - 0.6; P.y = sp.y + 0.8;
  const m = placeNpc(g, 'mert', sp.x + 0.6, sp.y + 0.8, 'left');
  P.face = 'right';
  g.camOverride = { x: sp.x, y: sp.y };
  g.rebuildEntities();
  g.applyAudioMode();
  await g.fade(false);
  await g.say([
    { who: 'narr', t: 'Später, als alle gegangen sind, sitzt ihr zu zweit auf den Stufen der Veranda. Die Grillen zirpen, und über dem Hügel funkeln die ersten Sterne.' },
    { who: 'mert', t: 'Weißt du noch, wie wir vor einem Jahr hier ankamen? Der Stall war kaputt, der Garten voller Unkraut, und Manni hat sich drei Tage unter dem Bett versteckt.' },
    { who: 'mert', t: 'Und jetzt … haben wir alles. Einen Hof, Freunde, Pferde, ein Häuschen. Aber das Wichtigste hatte ich schon an dem Tag, als wir ankamen.' },
    { who: 'player', t: 'Was denn?' },
    { who: 'mert', t: 'Dich.' },
  ]);
  void m;
  await kiss(g, 'haus');
  g.particles.shootingStar(sp.x - 8, sp.y - 3);
  await g.wait(1);
  await g.fade(true);
  homeAll(g, ['mert']);
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('housewarming');
  g.saveNow();
}

// ---------- Kapitel 13 ----------
export async function placeLantern(g, q, step, sp) {
  const S = g.S;
  if (!g.inv.has('skylantern')) { g.ui.hint('Du hast keine Laterne mehr dabei. Luise macht welche aus Seidenpapier und Teelichtern.', 4); return; }
  g.inv.remove('skylantern', 1);
  S.flags.lanterns = [...(S.flags.lanterns || []), sp.id];
  g.props = (await import('./scenes2.js')).buildProps(g);
  g.rebuildEntities();
  g.audio.play('pling');
  g.particles.sparkles(sp.x, sp.y - 0.4, 8, 20, '#ffe9a8');
  g.ui.hint(`Laterne aufgestellt! (${S.flags.lanterns.length}/6)`, 2);
  g.quests.emit('place_lantern');
  g.requestSave();
}

// ---------- Nebenaufgaben ----------
export async function photo(g, q, step, sp) {
  const S = g.S;
  if (g.player.riding) { g.ui.hint('Für das Foto steigst du kurz ab (<kbd>R</kbd>).', 3); return; }
  g.cutscene = true;
  const P = g.player;
  const m = g.npcById('mert');
  const saved = { x: m.x, y: m.y, mode: m.mode };
  await g.fade(true);
  m.mode = 'scene'; m.target = null;
  const f = g.world.nearestFree(P.x + 0.9, P.y);
  m.x = f.x; m.y = P.y; m.face = 'down'; P.face = 'down';
  const mira = g.pets?.mira;
  if (mira) { mira.x = P.x + 0.45; mira.y = P.y + 0.6; mira.face = 1; }
  g.camOverride = { x: P.x + 0.45, y: P.y - 0.9 };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  g.ui.showHUD(false);
  await g.fade(false);
  await g.say([{ who: 'mert', t: pick(['Selbstauslöser ist an! Schnell, lächeln!', 'Okay, Kamera steht. Zehn Sekunden! … Na gut, drei.', 'Mira, guck in die Kamera! Nicht auf den Käfer!']) }]);
  for (const n of ['3', '2', '1']) { g.particles.add({ type: 'text', x: P.x + 0.45, y: P.y - 1.6, z: 40, vz: 10, life: 0.6, text: n, color: '#fff' }); g.audio.play('countdown'); await g.wait(0.6); }
  love(true);
  await g.wait(0.15);
  // Foto aufnehmen
  const url = g.capturePhoto?.();
  g.audio.play('camera');
  const fl = document.getElementById('flash'); if (fl) { fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); }
  love(false);
  S.photos[sp.id] = { day: S.time.day, name: sp.name, season: S.season };
  if (url) g.storePhoto?.(sp.id, url);
  g.ui.showHUD(true);
  g.showPolaroid?.(url, sp.name);
  await g.wait(0.8);
  m.x = saved.x; m.y = saved.y; m.mode = 'home';
  g.camOverride = null;
  g.cutscene = false;
  const n = Object.keys(S.photos).length;
  g.ui.toast(`Foto „${sp.name}“ ins Album geklebt! (${Math.min(n, 8)}/8)`, 'heart', 'mint');
  g.quests.emit('photo');
  g.saveNow();
}

export async function birdhouse(g, q, step, sp) {
  const S = g.S;
  if (!g.inv.has('birdkit')) { g.ui.hint('Du hast kein Vogelhäuschen mehr dabei – Ben hat sie gebaut.', 3); return; }
  g.inv.remove('birdkit', 1);
  S.flags.birdhouses = [...(S.flags.birdhouses || []), sp.id];
  g.props = (await import('./scenes2.js')).buildProps(g);
  g.rebuildEntities();
  for (let i = 0; i < 3; i++) { g.audio.play('hammer'); await g.wait(0.25); }
  g.audio.play('bird');
  g.ui.hint(`Vogelhäuschen aufgehängt! (${S.flags.birdhouses.length}/3)`, 3);
  g.quests.emit('birdhouse');
  g.requestSave();
}

export async function sledding(g) {
  const H = SPOTS.hillTop;
  await stage(g, H.x - 0.8, H.y + 0.4, 1.3);
  const P = g.player;
  placeNpc(g, 'mia', H.x + 2.2, H.y + 0.2, 'down');
  placeNpc(g, 'ben', H.x + 3.2, H.y + 0.6, 'down');
  const sleds = [new Prop(P.x, P.y + 0.2, (c) => drawSled(c)), new Prop(H.x + 2.2, H.y + 0.4, (c) => drawSled(c))];
  g.sceneEntities = sleds;
  g.rebuildEntities();
  await g.say([{ who: 'mia', t: 'Auf die Plätze, fertig … LOS!' }]);
  const mia = g.npcById('mia');
  for (let i = 0; i < 70; i++) {
    const k = i / 70;
    P.y = H.y + 0.4 + k * 9; P.x = H.x - 0.8 + Math.sin(k * 6) * 0.6; sleds[0].x = P.x; sleds[0].y = P.y + 0.2;
    mia.y = H.y + 0.2 + k * 8.4; mia.x = H.x + 2.2 + Math.sin(k * 5 + 1) * 0.5; sleds[1].x = mia.x; sleds[1].y = mia.y + 0.2;
    g.camOverride = { x: H.x + 1, y: P.y - 1 };
    if (i % 3 === 0) { g.particles.snow(P.x, P.y, 2); g.particles.snow(mia.x, mia.y, 2); }
    await g.wait(0.035);
  }
  g.particles.snow(P.x, P.y, 20);
  g.audio.play('land');
  await g.say([{ who: 'narr', t: 'Ihr rauscht den Hügel hinunter, der Schnee stiebt, Mira rennt bellend hinterher – und unten landet ihr alle zusammen in einer riesigen Schneewehe.' }, { who: 'mia', t: 'Unentschieden! Nochmal! NOCHMAL!' }, { who: 'ben', t: '(von oben) Ich komme jetzt auch! Ich habe die Augen offen! Fast!' }]);
  g.sceneEntities = null;
  homeAll(g, ['mia', 'ben']);
  g.quests.emit('sled');
  await endStage(g);
}

export async function starName(g) {
  const S = g.S;
  const h = S.time.minutes / 60;
  if (h > 5 && h < 20.5) {
    const c = await g.ask('Sterne sieht man nur nachts. Möchtest du am Aussichtspunkt warten, bis es dunkel ist?', ['Ja, bis zur Nacht warten', 'Später'], 'narr');
    if (c !== 0) return;
    nap(g, 21.8);
  }
  const L = SPOTS.lookout;
  await stage(g, L.x - 0.6, L.y, 1.2);
  await g.say([
    { who: 'narr', t: 'Durch das alte Fernrohr funkeln tausende Sterne. Und da – vier helle Sterne als Beine, einer als Nase … ein Pferd aus Sternen!' },
    { who: 'mert', t: 'Ben hat es entdeckt. Und ich … ich hab den hellsten Stern darin für dich registrieren lassen. Bei der Sternwarte. Mit Urkunde!' },
  ]);
  const nm = await g.screens.askName('Wie soll dein Stern heißen?', `${S.player.name}s Stern`.slice(0, 14));
  S.flags.starName = nm;
  for (let i = 0; i < 4; i++) { g.particles.shootingStar(L.x - 10 + i * 4, L.y - 3); await g.wait(0.4); }
  await g.say([{ who: 'mert', t: `„${nm}“. Jedes Mal, wenn du nachts hochschaust, weißt du jetzt: Da oben leuchtet einer nur für dich.` }]);
  await kiss(g, 'stirn');
  g.quests.emit('starname');
  await endStage(g);
}

const OUTFIT_TALK = [
  'Das Blümchenkleid! Klassisch, romantisch, perfekt für Picknicks.', 'Die Latzhose! Praktisch UND süß. Das kann nicht jede Hose.', 'Das Sommerkleid in Rosa – wie ein Bonbon!',
  'Die Reitjacke! Sportlich und elegant. Ein Pferd würde dir sofort vertrauen.', 'Der Kuschelpulli! Den will ich sofort umarmen.', 'Karohemd! Der Landlook steht dir.',
  'Matrosenlook! Kuno würde salutieren.', 'Das Lavendelkleid! Duftet es? Es sieht aus, als würde es duften.', 'Das Festtagskleid! Für große Auftritte!',
  'Die Reitlehrerin! Ich habe es genäht, und ich bin SEHR stolz.', 'Das Herbstkleid in Kürbisorange! Ich liebe es.', 'Der Wintermantel! Kuschelig wie ein Alpaka.', 'Das Frühlingskleid! Wie ein Himmel voller Blüten.',
];
export async function outfitShow(g) {
  const S = g.S;
  const shown = S.flags.outfitsShown = S.flags.outfitsShown || [];
  if (shown.includes(S.player.outfit)) { await g.say([{ who: 'luise', t: 'Das Outfit kenne ich schon! Zieh etwas anderes an (Tasche → Kleidung) und komm wieder!' }]); return; }
  shown.push(S.player.outfit);
  g.audio.play('pop');
  g.particles.sparkles(g.player.x, g.player.y - 0.6, 10);
  await g.say([{ who: 'luise', t: OUTFIT_TALK[S.player.outfit] || 'Entzückend! Einfach entzückend!' }, { who: 'luise', t: shown.length >= 3 ? 'Drei Outfits! Die Modenschau ist ein voller Erfolg!' : `Noch ${3 - shown.length} – zieh dich um und komm wieder!` }]);
  g.quests.emit('outfit_show');
}

export async function shovelSand(g) {
  if (g.inv.count('sand') >= 6) { g.ui.hint('Mehr Sand kannst du nicht tragen.', 2); return; }
  g.audio.play('dig');
  g.particles.dust(SPOTS.sandpit.x, SPOTS.sandpit.y, 6);
  g.inv.add('sand', 1);
  g.particles.text(SPOTS.sandpit.x, SPOTS.sandpit.y - 0.6, '+1 Eimer Sand');
  g.requestSave();
}

export async function igelhausPeek(g) {
  const S = g.S, n = S.flags.hedgehog || 'Stachelchen';
  if (S.season === 'winter') await g.say([{ who: 'narr', t: `Psst … ${n} hält Winterschlaf. Aus dem Igelhaus hört man ein ganz, ganz leises Schnarchen.` }]);
  else { g.audio.play('animal'); await g.say([{ who: 'narr', t: pick([`${n} schnüffelt aus dem Igelhaus und schmatzt zufrieden.`, `${n} hat sich ein Blatt als Decke genommen. Wie gemütlich!`, `${n} kugelt sich zusammen und blinzelt dich an.`]) }]); }
}

// Spieluhr (Deko) anspielen
export async function playMusicbox(g) {
  g.audio.playTune?.('musicbox');
  g.particles.notes(g.player.x, g.player.y - 1);
  g.ui.hint('Die Spieluhr spielt Opa Karls Melodie. Zwei kleine Pferde drehen sich im Kreis.', 4);
}

export { dist, drawLantern, T };
