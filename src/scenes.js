// Szenen der Kapitel „Herzklopfen“ und „Pfotenglück“: Dates mit Mert, Küsschen, Party, Kätzchen, Hundeshow …
import { SPOTS, TILE, FARM } from './world.js';
import { drawHorse, horseLook } from './draw/horse.js';
import { drawCharacter, npcLook } from './draw/characters.js';
import { NPCS } from './data/npcs.js';
import { rr, circ, ell, heart, flower, outlinedText, FONT } from './draw/paint.js';
import { Animal } from './animals.js';
import { dist, pick } from './util.js';

const T = TILE;

// ---------- Bühnen-Helfer ----------
export function forceDismount(g) {
  const P = g.player;
  if (!P.riding || !P.horse) return;
  const h = P.horse;
  const spot = g.world.nearestFree(P.x + 1.6, P.y + 0.2, { riding: true });
  h.x = spot.x; h.y = spot.y; h.face = -1;
  h.mode = 'idle'; h.visible = true; h.target = null; h.speed = 0;
  P.riding = false; P.horse = null; P.jumpT = -1; P.z = 0;
  g.S.player.riding = false;
  g.rebuildEntities();
}

// Spielerin und Mert an einen Ort stellen
export async function stage(g, x, y, mertDx = 1.1) {
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = x; P.y = y; P.vx = P.vy = 0; P.speed = 0;
  const m = g.npcById('mert');
  m.mode = 'scene'; m.target = null;
  m.x = x + mertDx; m.y = y;
  P.face = mertDx > 0 ? 'right' : 'left';
  m.face = mertDx > 0 ? 'left' : 'right';
  const mira = g.pets?.mira;
  if (mira && !g.S.flags.miraLost) { mira.x = x - 1.1; mira.y = y + 0.5; }
  g.camOverride = { x: x + mertDx / 2, y: y - 0.8 };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  await g.wait(0.2);
  await g.fade(false);
}

export async function endStage(g) {
  await g.fade(true);
  const m = g.npcById('mert');
  m.x = m.homeX; m.y = m.homeY; m.mode = 'home'; m.target = null;
  g.camOverride = null;
  g.sceneEntities = null;
  g.rebuildEntities();
  await g.wait(0.2);
  await g.fade(false);
  g.cutscene = false;
  g.saveNow();
}

function love(on) {
  const el = document.getElementById('love');
  if (el) el.classList.toggle('on', on);
}

// Ein Küsschen – zärtlich und bilderbuchhaft
export async function kiss(g, kind = 'wange') {
  const P = g.player, m = g.npcById('mert');
  love(true);
  g.audio.play('heart');
  await g.wait(0.6);
  const sx = m.x, px = P.x;
  const dir = m.x > P.x ? 1 : -1;
  // aufeinander zu
  for (let i = 0; i <= 10; i++) { m.x = sx - dir * 0.28 * (i / 10); P.x = px + dir * 0.12 * (i / 10); await g.wait(0.03); }
  g.audio.play('kiss');
  const mx = (m.x + P.x) / 2;
  g.particles.add({ type: 'bigheart', x: mx, y: P.y - 0.2, z: 70, vz: 16, life: 2.2, size: 1 });
  g.particles.hearts(mx, P.y - 0.3, 10);
  await g.wait(0.9);
  const lines = {
    wange: 'Mert gibt dir ein Küsschen auf die Wange. Deine Wangen werden ganz warm. ♥',
    stirn: 'Mert gibt dir einen zarten Kuss auf die Stirn. Mira seufzt glücklich.',
    kuss: 'Ihr gebt euch einen Kuss. Ganz kurz steht die Welt still – nur die Herzen tanzen. ♥',
    zurueck: 'Du stellst dich auf die Zehenspitzen und gibst Mert ein Küsschen. Er wird knallrot. ♥',
  };
  await g.say([{ who: 'narr', t: lines[kind] || lines.wange }]);
  for (let i = 0; i <= 10; i++) { m.x = sx - dir * 0.28 * (1 - i / 10); P.x = px + dir * 0.12 * (1 - i / 10); await g.wait(0.03); }
  love(false);
}

// ---------- Kapitel 4: Herzklopfen ----------
export async function readLetter(g) {
  g.inv.add('loveletter', 1);
  g.audio.play('heart');
  await g.say([
    { who: 'narr', t: 'Im Briefkasten liegt ein rosa Umschlag mit einem aufgemalten Herz. Du öffnest ihn vorsichtig …' },
    { who: 'narr', t: '„Liebe {name}, triff mich heute am Steg des Glitzersees. Ich hab eine Überraschung für dich. Kuss, dein Mert ♥ (PS: Mira weiß von nichts.)“' },
  ]);
  g.quests.emit('read_letter');
}

class DateDeco {
  constructor(x, y) { this.x = x; this.y = y; }
  draw(ctx, game, t) {
    ctx.save(); ctx.translate(this.x * T, this.y * T);
    rr(ctx, -30, -16, 60, 30, 8); ctx.fillStyle = '#ffb3c8'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = -26; i < 30; i += 10) ctx.fillRect(i, -16, 4, 30);
    for (const [x, y] of [[-14, -4], [12, 2]]) { rr(ctx, x - 5, y - 10, 10, 12, 3); ctx.fillStyle = '#ffe6a0'; ctx.fill(); ctx.fillStyle = `rgba(255,220,120,${0.5 + Math.sin(t * 6 + x) * 0.3})`; circ(ctx, x, y - 6, 2.2); ctx.fill(); }
    flower(ctx, 0, -4, 5, '#ff6f8f', '#ffd84a');
    heart(ctx, 0, -40 + Math.sin(t * 3) * 3, 12, '#ff6f9f');
    ctx.restore();
  }
}

export async function dockDate(g) {
  const S = g.S;
  S.time.minutes = Math.max(S.time.minutes, 19.2 * 60) > 20.5 * 60 ? S.time.minutes : 19.2 * 60;
  g.updateLighting();
  await stage(g, SPOTS.dock.x, SPOTS.dock.y, -1.1);
  g.sceneEntities = [new DateDeco(SPOTS.dock.x - 0.5, SPOTS.dock.y + 1)];
  g.rebuildEntities();
  await g.say([
    { who: 'mert', t: 'Da bist du ja! Schau mal, wie das Wasser glitzert. Deshalb heißt er Glitzersee.' },
    { who: 'player', t: 'Mert … hast du das alles vorbereitet? Die Decke, die Laternen?' },
    { who: 'mert', t: 'Mit ein bisschen Hilfe von Berta. Und ich hab nur zweimal die Laterne ins Wasser fallen lassen.' },
    { who: 'mert', t: 'Ich wollte dir nur sagen … Seit wir auf dem Hof sind, bin ich jeden Tag ein bisschen glücklicher. Wegen dir.' },
  ]);
  await kiss(g, 'wange');
  await g.say([{ who: 'mert', t: 'So. Und jetzt essen wir Bertas Kekse, bevor Mira sie findet.' }, { who: 'narr', t: 'Zu spät. Mira hat die Kekse gefunden.' }]);
  g.quests.emit('dock_date');
  await endStage(g);
}

export function miraLost(g) {
  const S = g.S, m = g.pets?.mira;
  S.flags.miraLost = true;
  if (m) { m.mode = 'scene'; m.x = SPOTS.miraHide.x; m.y = SPOTS.miraHide.y; m.target = null; }
  g.requestSave();
}

export async function findMira(g) {
  const S = g.S, m = g.pets.mira;
  S.flags.miraLost = false;
  m.mode = 'follow'; m.followT = 0; m.state = 'happy'; m.stateT = 3; m.hop(3);
  g.audio.play('bark');
  g.particles.hearts(m.x, m.y - 0.5, 6);
  await g.say([{ who: 'narr', t: 'Zwischen den Sonnenblumen raschelt es – Mira! Sie hat Blütenstaub auf der Nase und wedelt wie verrückt mit dem Schwanz.' }, { who: 'narr', t: 'Den Hasen hat sie natürlich nicht erwischt. Aber jetzt folgt sie dir wieder brav.' }]);
  g.quests.emit('find_mira');
  g.requestSave();
}

// Mert reitet hinter der Spielerin her
export class MertRider {
  constructor(g, rec) {
    this.rec = rec;
    this.look = npcLook(NPCS.mert.look);
    this.hl = horseLook(rec);
    const P = g.player;
    const f = g.world.nearestFree(P.x - 1.5, P.y + 0.5, { riding: true });
    this.x = f.x; this.y = f.y; this.face = 1; this.t = 0; this.speed = 0;
  }
  update(dt, g) {
    this.t += dt;
    const P = g.player;
    const d = dist(this.x, this.y, P.x, P.y);
    if (d > 22) { const f = g.world.nearestFree(P.x - P.faceX * 2, P.y + 0.5, { riding: true }); this.x = f.x; this.y = f.y; }
    if (d > 2.4) {
      const tx = P.x - (P.faceX || 1) * 1.8, ty = P.y + 0.6;
      const dx = tx - this.x, dy = ty - this.y, dd = Math.hypot(dx, dy) || 1;
      const spd = Math.min(11, 2 + d * 1.2);
      this.x += (dx / dd) * spd * dt; this.y += (dy / dd) * spd * dt;
      this.speed = spd;
      if (Math.abs(dx) > 0.05) this.face = dx > 0 ? 1 : -1;
    } else { this.speed = 0; this.face = P.x > this.x ? 1 : -1; }
  }
  draw(ctx, g, t) {
    ctx.save(); ctx.translate(this.x * T, this.y * T);
    const pose = this.speed > 7 ? 'gallop' : this.speed > 4 ? 'trot' : this.speed > 0.2 ? 'walk' : 'stand';
    const L = this.look;
    drawHorse(ctx, this.hl, { t: this.t, pose, face: this.face, scale: 1.22, rider: (c) => { c.save(); c.translate(-1, -24); c.scale(1 / 1.22, 1 / 1.22); drawCharacter(c, L, { dir: 'right', t, seated: true, noShadow: true }); c.restore(); } });
    ctx.font = `700 12px ${FONT}`; ctx.textAlign = 'center';
    outlinedText(ctx, 'Mert', 0, -108, '#fff', '#7a4a6a', 4);
    ctx.restore();
  }
}

export function escortStart(g) {
  const S = g.S;
  const rec = S.horses.find((h) => !h.foal && h.id !== S.ridingHorse) || S.horses.find((h) => !h.foal);
  if (!rec) return;
  const h = g.horseEntity(rec.id);
  if (h) { h.visible = false; h.mode = 'scene'; }
  g.escort = new MertRider(g, rec);
  g.escortHorse = h;
  const m = g.npcById('mert'); m.visible = false;
  S.flags.escort = rec.id;
  g.rebuildEntities();
  g.later(0.5, () => g.ui.hint(g.player.riding ? 'Mert reitet hinter dir her. Reite zum Aussichtspunkt – ganz oben in den Wolkenbergen!' : 'Steig auf dein Pferd (<kbd>R</kbd>) – Mert reitet hinter dir her zum Aussichtspunkt!', 8));
}

export function escortEnd(g) {
  const m = g.npcById('mert'); m.visible = true;
  if (g.escortHorse) {
    const h = g.escortHorse, P = g.world.paddock;
    h.visible = true; h.mode = 'paddock';
    h.x = P.x + 2 + Math.random() * (P.w - 4); h.y = P.y + 2 + Math.random() * (P.h - 4);
  }
  g.escort = null; g.escortHorse = null;
  g.S.flags.escort = null;
  g.rebuildEntities();
}

export async function lookoutScene(g) {
  const S = g.S;
  S.time.minutes = 21.5 * 60;
  g.updateLighting();
  const L = SPOTS.lookout;
  await stage(g, L.x - 0.6, L.y, 1.1);
  escortEnd(g);
  const m = g.npcById('mert'); m.mode = 'scene'; m.x = L.x + 0.5; m.y = L.y; m.face = 'left';
  await g.say([
    { who: 'mert', t: 'Wow. Man sieht den ganzen Hof von hier oben. Und das Meer. Und … die Sterne!' },
    { who: 'mert', t: 'Ich bin übrigens nur zweimal fast runtergefallen. Das Pferd war sehr nachsichtig mit mir.' },
    { who: 'player', t: 'Du warst super, Mert.' },
    { who: 'mert', t: 'Weißt du, was ich mir wünsche, wenn ich eine Sternschnuppe sehe? Nichts. Ich hab ja schon alles.' },
  ]);
  for (let i = 0; i < 3; i++) g.particles.shootingStar(L.x - 8 + i * 5, L.y - 3);
  await kiss(g, 'stirn');
  g.quests.emit('ride_lookout');
  await endStage(g);
}

class BirthdayTable {
  constructor(x, y) { this.x = x; this.y = y; }
  draw(ctx, game, t) {
    ctx.save(); ctx.translate(this.x * T, this.y * T);
    ctx.fillStyle = 'rgba(60,40,70,0.15)'; ell(ctx, 0, 2, 34, 7); ctx.fill();
    rr(ctx, -32, -22, 64, 12, 5); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#ffb3cf'; for (let i = -30; i < 32; i += 8) ctx.fillRect(i, -22, 4, 12);
    ctx.fillStyle = '#c98a5a'; ctx.fillRect(-26, -10, 4, 12); ctx.fillRect(22, -10, 4, 12);
    rr(ctx, -14, -42, 28, 20, 6); ctx.fillStyle = '#ffe0ec'; ctx.fill(); ctx.fillStyle = '#ff6f9f'; ctx.fillRect(-14, -34, 28, 3);
    for (const x of [-8, 0, 8]) { ctx.fillStyle = '#7ec8ff'; ctx.fillRect(x - 1, -50, 2, 8); ctx.fillStyle = `rgba(255,${190 + Math.sin(t * 10 + x) * 40},80,1)`; ell(ctx, x, -53, 2, 3.2); ctx.fill(); }
    // Luftballons
    for (const [x, c] of [[-40, '#ff7eb6'], [40, '#7ec8ff'], [-34, '#ffd166']]) { ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x + Math.sin(t + x) * 3, -60); ctx.stroke(); ell(ctx, x + Math.sin(t + x) * 3, -70, 9, 11); ctx.fillStyle = c; ctx.fill(); }
    ctx.restore();
  }
}

export async function partyScene(g) {
  const cx = 78.5, cy = 89.6;
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = cx - 1; P.y = cy; P.face = 'right';
  const m = g.npcById('mert'); m.mode = 'scene'; m.x = cx + 0.2; m.y = cy; m.face = 'left';
  const guests = [['hilde', cx - 2.5, cy - 0.9], ['berta', cx + 2, cy - 1], ['luise', cx + 3, cy + 0.2], ['mia', cx - 2.2, cy + 1.1], ['ben', cx + 1.5, cy + 1.2]];
  const saved = guests.map(([id]) => { const n = g.npcById(id); return { n, x: n.x, y: n.y }; });
  for (const [id, x, y] of guests) { const n = g.npcById(id); n.mode = 'scene'; n.x = x; n.y = y; n.face = x < cx ? 'right' : 'left'; }
  g.sceneEntities = [new BirthdayTable(cx - 0.4, cy - 1.3)];
  g.rebuildEntities();
  g.camOverride = { x: cx, y: cy - 0.8 };
  g.renderer.follow(cx, cy - 0.8, 0, true);
  await g.fade(false);
  g.particles.confetti(cx, cy - 0.5, 60);
  g.audio.play('fanfare');
  await g.say([{ who: 'hilde', t: 'ÜBERRASCHUNG! Alles Gute zum Geburtstag, Mert!' }, { who: 'mert', t: 'Was?! Ihr … ihr habt es gewusst? Alle?' }, { who: 'mia', t: 'Natürlich! {name} hat alles geplant!' }]);
  g.audio.playTune?.('birthday');
  await g.say([{ who: 'narr', t: '♪ Zum Geburtstag viel Glück … ♪ Alle singen – Ben ein bisschen schief, Berta sehr laut, und Mira bellt im Takt.' }]);
  await g.say([{ who: 'berta', t: 'Und jetzt: Kerzen auspusten und was wünschen!' }, { who: 'narr', t: 'Mert pustet alle drei Kerzen auf einmal aus. Applaus!' }, { who: 'player', t: 'Und das hier ist für dich. Von Luise gemacht – aber die Idee war von mir.' }, { who: 'mert', t: 'Zwei Muschelhälften … die zusammen ein Herz ergeben. Eine für dich, eine für mich.' }, { who: 'mert', t: 'Das ist das schönste Geschenk, das ich je bekommen hab.' }]);
  await kiss(g, 'zurueck');
  await g.say([{ who: 'luise', t: 'Ooooh! Ich muss mir die Augen tupfen. Wie entzückend!' }, { who: 'ben', t: 'Das schreib ich in mein Buch. Unter „Wunder der Natur“.' }]);
  await g.fade(true);
  for (const s of saved) { s.n.x = s.n.homeX; s.n.y = s.n.homeY; s.n.mode = 'home'; }
  m.x = m.homeX; m.y = m.homeY; m.mode = 'home';
  g.sceneEntities = null;
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.saveNow();
}

// Nach dem Bau der Laube: gemeinsam schaukeln
export async function gazeboScene(g) {
  const G = SPOTS.gazebo;
  await stage(g, G.x - 0.6, G.y, 1.2);
  await g.say([
    { who: 'mert', t: 'Fertig! Unsere eigene kleine Rosenlaube. Mit Schaukel, wie versprochen.' },
    { who: 'narr', t: 'Ihr setzt euch auf die Schaukel. Sie knarzt ein bisschen, und Maumau springt sofort dazwischen.' },
    { who: 'mert', t: 'Ich glaube, das hier ist ab jetzt mein Lieblingsort auf der ganzen Welt.' },
  ]);
  await kiss(g, 'kuss');
  await g.say([{ who: 'hilde', t: 'Kapitel 4 geschafft! Ach, junge Liebe … Opa Karl hat mir damals auch eine Bank gebaut. Sie hat drei Tage gehalten.' }]);
  await endStage(g);
}

// ---------- Kapitel 5: Pfotenglück ----------
export async function kittenScene(g) {
  const S = g.S;
  const mau = g.pets.maumau;
  const k = SPOTS.kittens;
  g.cutscene = true;
  mau.mode = 'scene'; mau.x = k.x + 0.9; mau.y = k.y + 0.3; mau.face = -1;
  g.audio.play('purr');
  await g.say([{ who: 'narr', t: 'Aus dem Heu schaut ein weißes Köpfchen heraus. Dann noch eins. Und noch eins!' }]);
  const kits = spawnKittens(g, ['?', '?', '?']);
  for (const kt of kits) { kt.x = k.x + 0.4 + kt.variant * 0.5; kt.y = k.y + 0.6; kt.mode = 'scene'; g.particles.sparkles(kt.x, kt.y - 0.2, 5); }
  g.rebuildEntities();
  g.particles.hearts(k.x + 0.8, k.y, 8);
  await g.say([{ who: 'narr', t: 'Maumau hat drei Kätzchen bekommen! Ein getupftes, ein graues und ein rotes. Sie maunzen ganz leise.' }, { who: 'narr', t: 'Maumau schaut dich stolz an, als wollte sie sagen: „Na? Hab ich gut gemacht, oder?“' }]);
  const names = ['Flocke', 'Pünktchen', 'Keks'];
  names[0] = await g.screens.askName('Wie soll das getupfte Kätzchen heißen?', 'Flocke');
  names[1] = await g.screens.askName('Und das kleine graue?', 'Pünktchen');
  names[2] = await g.screens.askName('Und das rote Wuschelkätzchen?', 'Keks');
  S.flags.kittens = names;
  kits.forEach((kt, i) => { kt.name = names[i]; kt.mode = null; });
  mau.mode = null;
  g.cutscene = false;
  g.quests.emit('kittens');
  g.requestSave();
}

export function spawnKittens(g, names) {
  const mau = g.pets.maumau;
  g.kittens = names.map((n, i) => {
    const a = new Animal('kitten', mau.x + 0.5 + i * 0.4, mau.y + 0.6, i);
    a.name = n; a.leader = mau;
    g.animals.push(a);
    return a;
  });
  return g.kittens;
}

export async function findFlamingo(g) {
  g.inv.add('flamingo', 1);
  g.audio.play('pling');
  g.particles.sparkles(SPOTS.nest.x, SPOTS.nest.y - 0.4, 10);
  await g.say([{ who: 'narr', t: 'Im alten Baumstumpf liegt ein Elsternnest voller glitzernder Dinge: ein Löffel, zwei Knöpfe, ein Schlüssel … und ein rosa Flamingo mit Wackelaugen!' }, { who: 'narr', t: 'Die Elster krächzt beleidigt, lässt dich aber gewähren. Du legst ihr einen glänzenden Kiesel als Tausch hin.' }]);
  g.quests.emit('find_flamingo');
}

export async function giveManni(g) {
  const mn = g.pets.manni;
  g.inv.remove('flamingo', 1);
  mn.toy = true; mn.state = 'happy'; mn.stateT = 4; mn.hop(3);
  g.S.flags.manniToy = true;
  g.audio.play('purr');
  g.particles.hearts(mn.x, mn.y - 0.5, 8);
  await g.say([{ who: 'narr', t: 'Mannis Augen werden riesig. Er schnappt sich den Flamingo, wirft ihn in die Luft, fängt ihn und schnurrt so laut, dass die Hühner im Nachbardorf aufwachen.' }, { who: 'mert', t: 'Da ist er wieder, unser alter Manni! Danke, {name}.' }]);
  g.quests.emit('give_manni');
}

// Miras Menü: Streicheln, Stöckchen, Kunststücke
export async function miraMenu(g) {
  const m = g.pets.mira;
  const c = await g.ask('Mira schaut dich erwartungsvoll an und wedelt mit dem Schwanz.', ['Streicheln', 'Stöckchen werfen', 'Kunststück üben', 'Leckerli geben', 'Nichts'], 'narr');
  if (c === 0) g.petAnimal(m, true);
  else if (c === 1) {
    const P = g.player;
    const dx = P.face === 'left' ? -1 : P.face === 'right' ? 1 : 0, dy = P.face === 'up' ? -1 : P.face === 'down' ? 1 : 0;
    const f = g.world.nearestFree(P.x + dx * 4.5, P.y + dy * 4.5);
    g.particles.add({ type: 'stick', x: P.x, y: P.y - 0.3, z: 30, vx: (f.x - P.x) / 0.7, vy: (f.y - P.y) / 0.7, vz: 60, g: 170, life: 0.7 });
    g.audio.play('jump');
    m.fetch = { x: f.x, y: f.y, phase: 'go', done: () => g.ui.hint(pick(['Mira bringt dir stolz das Stöckchen zurück. Nochmal!', 'Wuff! Mira legt dir das Stöckchen vor die Füße.', 'Mira hat das Stöckchen! Sie ist die schnellste Yorkie der Welt.']), 3) };
  } else if (c === 2) {
    const tricks = [['Sitz!', 'Mira setzt sich sofort hin und schaut dich mit großen Augen an.'], ['Pfote!', 'Mira gibt dir ganz feierlich ihre kleine Pfote.'], ['Dreh dich!', 'Mira dreht sich zweimal im Kreis und bellt stolz.'], ['Mach Männchen!', 'Mira stellt sich auf die Hinterbeine und wackelt mit den Vorderpfötchen.'], ['Peng!', 'Mira lässt sich theatralisch auf die Seite plumpsen. Oscarreif!']];
    const tr = tricks[(g._miraTrick = ((g._miraTrick || 0) + 1)) % tricks.length];
    m.state = 'happy'; m.stateT = 2; m.hop(2);
    let n = 0;
    const spin = () => { m.face *= -1; if (++n < 4) g.later(0.15, spin); };
    spin();
    g.audio.play('bark');
    g.particles.add({ type: 'text', x: m.x, y: m.y - 0.8, z: 30, vz: 20, life: 1.6, text: tr[0], color: '#fff' });
    g.ui.hint(tr[1], 3);
    g.quests.emit('mira_trick');
  } else if (c === 3) {
    if (g.inv.has('bread')) { g.inv.remove('bread', 1); g.ui.hint('Mira knabbert glücklich an einem Stückchen Brot. Sie leckt sich noch minutenlang die Schnauze.', 4); }
    else g.ui.hint('Mira schnuppert an deiner leeren Hand und leckt sie trotzdem ab. Liebe geht auch ohne Leckerli!', 4);
    m.state = 'happy'; m.stateT = 2; m.hop(1);
    g.particles.hearts(m.x, m.y - 0.5, 3);
    g.audio.play('bark');
  }
}

export async function dogShow(g) {
  const S = g.S, m = g.pets.mira;
  const sp = SPOTS.show;
  g.cutscene = true;
  await g.fade(true);
  forceDismount(g);
  const P = g.player;
  P.x = sp.x - 1.4; P.y = sp.y + 0.4; P.face = 'right';
  const guests = [['paula', sp.x + 1.8, sp.y - 0.4], ['mia', sp.x - 2.6, sp.y + 1.3], ['ben', sp.x + 2.4, sp.y + 1.4], ['berta', sp.x + 0.2, sp.y + 2], ['mert', sp.x - 0.9, sp.y + 1.6]];
  const saved = guests.map(([id]) => ({ n: g.npcById(id) }));
  for (const [id, x, y] of guests) { const n = g.npcById(id); n.mode = 'scene'; n.x = x; n.y = y; n.face = x < sp.x ? 'right' : 'left'; }
  m.mode = 'scene'; m.x = sp.x; m.y = sp.y; m.face = -1;
  g.rebuildEntities();
  g.camOverride = { x: sp.x, y: sp.y - 0.5 };
  g.renderer.follow(sp.x, sp.y - 0.5, 0, true);
  await g.fade(false);
  await g.say([{ who: 'paula', t: 'Meine Damen und Herren, Katzen und Pferde! Die große Hundeshow von Kleeberg! Und hier ist unsere Kandidatin: MIRA!' }]);
  const tricks = ['Sitz!', 'Pfote!', 'Dreh dich!', 'Mach Männchen!'];
  for (const tr of tricks) {
    m.hop(2); m.state = 'happy'; m.stateT = 1.5; m.face *= -1;
    g.audio.play('bark');
    g.particles.add({ type: 'text', x: m.x, y: m.y - 0.8, z: 30, vz: 20, life: 1.4, text: tr, color: '#fff' });
    await g.wait(1.1);
  }
  g.particles.confetti(sp.x, sp.y - 0.5, 50);
  g.audio.play('fanfare');
  m.rosette = true; S.flags.miraRosette = true;
  await g.say([
    { who: 'mia', t: 'WOW! Hast du das gesehen? Sie hat sich zweimal gedreht!' },
    { who: 'ben', t: 'Punktzahl: 10 von 10. Plus ein Sonderpunkt für die Ohren.' },
    { who: 'paula', t: 'Die Siegerin und süßester Hund von Kleeberg: MIRA! Hier ist ihre goldene Schleife!' },
    { who: 'mert', t: 'Das ist unser Mädchen! Ich wusste es!' },
    { who: 'narr', t: 'Mira trägt ab jetzt stolz ihre goldene Siegerschleife.' },
  ]);
  await g.fade(true);
  for (const s of saved) { s.n.x = s.n.homeX; s.n.y = s.n.homeY; s.n.mode = 'home'; }
  m.mode = 'follow'; m.followT = 0;
  g.camOverride = null;
  g.rebuildEntities();
  await g.fade(false);
  g.cutscene = false;
  g.quests.emit('dog_show');
  g.saveNow();
}

export async function stargaze(g) {
  const S = g.S;
  const h = S.time.minutes / 60;
  if (h > 5 && h < 20.5) {
    const c = await g.ask('Sternschnuppen sieht man nur nachts. Möchtest du mit Mert warten, bis es dunkel ist?', ['Ja, bis zur Nacht warten', 'Später'], 'narr');
    if (c !== 0) return;
    g.growCrops(Math.max(0, 21.5 - h), false);
    S.time.minutes = 21.5 * 60;
    g.updateLighting();
  }
  const H = SPOTS.hillTop;
  await stage(g, H.x - 1, H.y + 0.6, 1.1);
  await g.say([{ who: 'mert', t: 'Hier, die Decke. Und hier, der Kakao. Und hier … Mira, das ist MEIN Kakao!' }, { who: 'narr', t: 'Ihr liegt auf der Decke und schaut in den Himmel. Der ganze Hof schläft schon.' }]);
  for (let i = 0; i < 6; i++) { g.particles.shootingStar(H.x - 12 + Math.random() * 10, H.y - 2 - Math.random() * 2); await g.wait(0.5); }
  await g.say([{ who: 'mert', t: 'Da! Noch eine! Hast du dir was gewünscht?' }, { who: 'player', t: 'Ja. Aber das verrate ich nicht.' }, { who: 'mert', t: 'Ich glaube, meiner ist gerade in Erfüllung gegangen.' }]);
  await kiss(g, 'kuss');
  g.quests.emit('stargaze');
  await endStage(g);
}

// Kleine Liebesmomente im Alltag
export async function mertHug(g, kind) {
  const m = g.npcById('mert');
  const P = g.player;
  if (P.riding) { await g.say([{ who: 'mert', t: 'Von da oben komm ich nicht an dich ran! Steig doch mal ab.' }]); return; }
  const sx = m.x, sy = m.y;
  m.mode = 'scene';
  m.x = P.x + (P.x < m.x ? 0.9 : -0.9); m.y = P.y;
  m.face = m.x > P.x ? 'left' : 'right'; P.face = m.x > P.x ? 'right' : 'left';
  g.cutscene = true;
  if (kind === 'hug') {
    love(true);
    g.particles.hearts((m.x + P.x) / 2, P.y - 0.4, 8);
    g.audio.play('heart');
    await g.say([{ who: 'narr', t: pick(['Mert nimmt dich ganz fest in den Arm. Er riecht nach Heu und Keksen.', 'Eine lange, warme Umarmung. Mira quetscht sich dazwischen – Gruppenkuscheln!', 'Mert hebt dich hoch und dreht sich mit dir im Kreis. Ihr lacht beide.']) }]);
    love(false);
  } else {
    await kiss(g, pick(['wange', 'stirn', 'zurueck']));
  }
  m.x = sx; m.y = sy; m.mode = 'home';
  g.cutscene = false;
  const S = g.S;
  if (S.flags.mertFlower !== S.time.day) {
    S.flags.mertFlower = S.time.day;
    const f = pick(['daisy', 'poppy', 'sunflower', 'lavender']);
    g.inv.add(f, 1);
    await g.say([{ who: 'mert', t: pick(['Ach, und die hab ich heute früh für dich gepflückt.', 'Warte, ich hab noch was für dich. Eine Blume! Na gut, sie ist ein bisschen zerdrückt.', 'Für die Schönste auf dem ganzen Hof.']) }]);
  }
}
