// Das süße Ende: Sommerfest, Abschlussrennen, Sonnenuntergang, Feuerwerk, Fohlen, Abspann.
import { FARM, SPOTS } from './world.js';
import { Animal } from './animals.js';
import { makeHorseRecord, HorseEntity } from './horses.js';
import { SPECIES_ORDER } from './data/animals.js';
import { VILLAGERS } from './data/npcs.js';

export async function runEnding(g) {
  const S = g.S;
  g.cutscene = true;
  g.state = 'ending';
  const FW = FARM.festival;
  await g.fade(true);
  // Festzustand
  S.flags.festivalMusic = true;
  S.flags.noWeather = true;
  S.weather.kind = 'sun';
  g.rainbowAlpha = 0;
  S.time.minutes = 15.5 * 60;
  g.applyAudioMode();
  // Alle Gäste auf die Festwiese
  const guests = ['hilde', ...VILLAGERS, 'kuno', 'mert'];
  const spots = [[85.5, 113.2], [76, 114.5], [79, 116.5], [92, 116.5], [95, 114.5], [73.5, 117.5], [97.5, 117.5], [88.5, 118.8], [82.5, 115.2]];
  const saved = new Map();
  guests.forEach((id, i) => {
    const n = g.npcById(id);
    saved.set(id, { x: n.x, y: n.y });
    n.x = spots[i][0]; n.y = spots[i][1]; n.mode = 'scene'; n.target = null; n.face = 'down';
  });
  // Pferde auf die Wiese
  const own = g.horses.filter((h) => g.S.horses.includes(h.rec) && h.mode !== 'ridden' && !h.foal);
  own.forEach((h, i) => { h.mode = 'scene'; h.target = null; h.x = FW.x + 3 + (i % 5) * 5.5; h.y = FW.y + 9 + Math.floor(i / 5) * 1.6; h.face = i % 2 ? -1 : 1; });
  // Tiere aus dem Album
  const fest = [];
  const species = SPECIES_ORDER.filter((s) => (S.album[s] || s === 'puppy' || s === 'cat') && s !== 'duckling');
  species.forEach((s, i) => {
    const a = new Animal(s, FW.x + 4 + (i % 7) * 3.8, FW.y + 3.5 + Math.floor(i / 7) * 3.2, i);
    a.mode = 'scene'; a.visible = true;
    fest.push(a);
  });
  g.kitten.mode = 'scene'; g.kitten.x = 84; g.kitten.y = 114; g.kitten.visible = true;
  const pets = g.pets || {};
  if (pets.maumau) { pets.maumau.mode = 'scene'; pets.maumau.x = 81.5; pets.maumau.y = 116.3; }
  if (pets.manni) { pets.manni.mode = 'scene'; pets.manni.x = 89.5; pets.manni.y = 116.3; }
  g.sceneEntities = fest;
  // Spielerin mit Lieblingspferd
  const P = g.player;
  if (!P.riding) { const rh = g.horseEntity(S.ridingHorse); if (rh) P.mount(rh); }
  P.x = FW.x + 15; P.y = FW.y + 7; P.faceX = 1;
  g.rebuildEntities();
  g.camOverride = { x: FW.x + 15, y: FW.y + 5 };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  g.festivalLights = Array.from({ length: 10 }, (_, i) => ({ x: FW.x + 3 + i * 2.8, y: FW.y + 3.4 + (i % 2) * 6, r: 2.8, c: i % 2 ? '#ffb3c8' : '#ffe39a' }));
  await g.fade(false);
  g.ui.banner('Sommerfest auf dem Ponyhof!', 'Alle sind gekommen ♥');
  g.audio.play('fanfare');
  for (let i = 0; i < 3; i++) { g.particles.confetti(FW.x + 8 + i * 7, FW.y + 5, 40); await g.wait(0.4); }
  await g.wait(1.5);
  await g.say([
    { who: 'hilde', t: 'Liebe Leute aus Kleeberg! Nach so vielen Jahren feiern wir endlich wieder das Sommerfest auf dem Ponyhof!' },
    { who: 'hilde', t: 'Und das verdanken wir alle nur einer: {name}!' },
    { who: 'berta', t: 'Hoch soll sie leben! Die Torte hat sieben Etagen – eine für jeden Tag der Woche!' },
    { who: 'theo', t: 'Hm-hm. Die Limonade geht auf mich. Alle drei Kannen. Heute ist ein besonderer Tag.' },
    { who: 'luise', t: 'Schaut nur, die Wimpelketten! Und die Lampions! Ich könnte weinen vor Glück.' },
    { who: 'kuno', t: 'Ahoi! So ein schönes Fest hab ich nicht mal auf den sieben Weltmeeren gesehen.' },
    { who: 'mert', t: 'Und Maumau hat sich schon auf die Torte gesetzt. Fast. Ich hab sie gerade noch erwischt!' },
    { who: 'narr', t: 'Mira rennt bellend im Kreis um die Festwiese. So viele Menschen, so viele Streicheleinheiten!' },
    { who: 'mia', t: 'Und jetzt: das große Sommerfest-Rennen! {name}, du reitest mit {horse}, oder?' },
    { who: 'ben', t: 'I-ich hab die Strecke abgesteckt. Einmal ums Hofgelände und über die Wiesen!' },
  ]);
  // Abschlussrennen
  g.camOverride = null;
  await new Promise((resolve) => {
    g.finaleRaceDone = resolve;
    g.cutscene = false;
    g.startRace('finale');
  });
  g.finaleRaceDone = null;
  g.cutscene = true;
  await g.say([
    { who: 'hilde', t: 'Was für ein Rennen! Mein Herz hat mitgaloppiert.' },
    { who: 'hilde', t: 'Komm, {name}. Die Sonne geht gleich unter. Reiten wir auf den Hügel?' },
  ]);
  // Sonnenuntergang auf dem Hügel
  await g.fade(true);
  S.time.minutes = 19.4 * 60;
  const top = SPOTS.hillTop;
  P.x = top.x - 3.5; P.y = top.y + 5; P.faceX = 1;
  if (!P.riding) { const rh = g.horseEntity(S.ridingHorse); if (rh) P.mount(rh); }
  const hn = g.npcById('hilde');
  hn.x = top.x - 3.4; hn.y = top.y + 1.4; hn.face = 'right';
  guests.slice(1).forEach((id, i) => { const n = g.npcById(id); n.x = top.x - 5 + i * 1.6; n.y = top.y + 3.6 + (i % 2) * 0.8; n.face = 'up'; });
  const mn = g.npcById('mert');
  mn.x = top.x - 1.8; mn.y = top.y + 1.6; mn.face = 'right';
  if (pets.maumau) { pets.maumau.x = top.x - 3; pets.maumau.y = top.y + 3; }
  if (pets.manni) { pets.manni.x = top.x + 0.5; pets.manni.y = top.y + 3; }
  own.forEach((h, i) => { h.x = top.x + 3 + (i % 4) * 2.2; h.y = top.y + 2.5 + Math.floor(i / 4) * 1.3; h.face = -1; h.mode = 'scene'; });
  fest.forEach((a, i) => { a.x = top.x - 6 + (i % 7) * 2; a.y = top.y + 5 + Math.floor(i / 7) * 1.4; a.mode = 'scene'; });
  g.kitten.x = top.x - 1; g.kitten.y = top.y + 1.8;
  g.camOverride = { x: top.x, y: top.y - 1 };
  g.renderer.follow(top.x, top.y - 1, 0, true);
  await g.fade(false);
  // langsam hinaufreiten
  await new Promise((r) => { P.autoMove = { x: top.x - 0.5, y: top.y + 0.3, spd: 2.6, ghost: true, done: r }; });
  // Tiere kuscheln sich dazu
  fest.forEach((a, i) => { const ang = (i / Math.max(1, fest.length)) * Math.PI - Math.PI; a.setTarget(top.x - 0.5 + Math.cos(ang) * (2 + (i % 3) * 0.7), top.y + 1.6 + Math.abs(Math.sin(ang)) * 1.2, 2.2); });
  own.forEach((h, i) => { h.setTarget(top.x + 1.8 + (i % 4) * 1.6, top.y + 1 + Math.floor(i / 4) * 1.1, 2.4); });
  guests.forEach((id, i) => { const n = g.npcById(id); if (id !== 'hilde' && id !== 'mert') n.goTo(top.x - 4 + i * 1.4, top.y + 3.2 + (i % 2) * 0.7, 1.5); });
  if (pets.maumau) pets.maumau.setTarget(top.x - 1.2, top.y + 1.9, 1.5);
  if (pets.manni) pets.manni.setTarget(top.x + 0.9, top.y + 1.7, 1.5);
  await g.wait(2.5);
  // Feuerwerk
  let firing = true;
  const cols = ['#ff7eb6', '#ffd166', '#7ec8ff', '#b79cf0', '#8fe0c0', '#ff9f7a'];
  let k = 0;
  const fire = () => {
    if (!firing) return;
    g.particles.firework(top.x - 7 + Math.random() * 14, top.y - 1, 140 + Math.random() * 80, cols[k % cols.length], true);
    if (k % 3 === 0) g.particles.shootingStar(top.x - 14 + Math.random() * 8, top.y - 2);
    g.audio.play('boom');
    k++;
    g.later(0.9 + Math.random() * 0.6, fire);
  };
  S.time.minutes = 20.3 * 60;
  fire();
  await g.wait(2.5);
  await g.say([
    { who: 'hilde', t: 'Sieh nur, {name}. Der ganze Himmel ist voller Herzen.' },
    { who: 'hilde', t: 'Als ich jung war, habe ich hier oben gesessen und mir gewünscht, dass dieser Hof nie leer wird.' },
    { who: 'hilde', t: 'Dann wurde es still. Die Pferde gingen, das Fest schlief ein … und ich dachte, der Hof hätte sein Herz verloren.' },
    { who: 'hilde', t: 'Aber dann bist du gekommen. Mit deinem Lachen, deiner Geduld und deiner Liebe für jedes Tier.' },
    { who: 'hilde', t: 'Der Hof hat wieder ein Herz, {name}. Und das Herz – das bist du. ♥' },
    { who: 'mert', t: 'Sie hat recht, weißt du? Ohne dich wäre das hier nur ein alter Hof. Mit dir ist es unser Zuhause.' },
    { who: 'narr', t: 'Mert nimmt deine Hand. Mira kuschelt sich an deine Füße, Maumau und Manni schnurren um die Wette – und der Himmel leuchtet in tausend Herzen.' },
  ]);
  await g.wait(1.5);
  // Ein Fohlen wird geboren
  const mother = g.S.horses.filter((h) => !h.foal).sort((a, b) => b.pts - a.pts)[0];
  await g.say([
    { who: 'ben', t: 'D-da! Schaut mal! Bei ' + (mother ? mother.name : 'den Pferden') + '!' },
    { who: 'narr', t: 'Im warmen Abendlicht stakst ein winziges Fohlen auf wackeligen Beinen durchs Gras.' },
    { who: 'mia', t: 'Ein Fohlen! Heute! Ist das nicht das Allerschönste?' },
    { who: 'hilde', t: 'Es ist in deiner Nacht geboren, {name}. Es gehört zu dir.' },
    { who: 'mert', t: 'Wie soll es heißen? Du hast immer die schönsten Namen.' },
  ]);
  const coat = mother ? mother.coat : 'palomino';
  const foalRec = makeHorseRecord({ id: 'foal', name: 'Wölkchen', coat, marking: 'star', socks: true, personality: 'verschmust', foal: true });
  const name = await g.screens.askName('Wie soll das Fohlen heißen?', 'Wölkchen', foalRec);
  foalRec.name = name;
  if (!S.horses.some((h) => h.id === 'foal')) S.horses.push(foalRec);
  const fe = new HorseEntity(foalRec, 'scene', P.x - 1.8, P.y + 0.6);
  fe.face = 1;
  g.horses.push(fe);
  g.rebuildEntities();
  g.particles.sparkles(fe.x, fe.y - 0.5, 20);
  g.particles.hearts(fe.x, fe.y - 1, 8);
  g.audio.play('neigh', { pitch: 1.5 });
  S.ending.foal = { name };
  S.memories.push({ type: 'foal', day: S.time.day, name });
  await g.say([
    { who: 'narr', t: `${name} stupst dich mit der kleinen, weichen Nase an – und weicht dir ab jetzt nicht mehr von der Seite.` },
    { who: 'hilde', t: `${name}. Was für ein wunderschöner Name.` },
  ]);
  await g.wait(2);
  firing = false;
  // Abspann
  await g.fade(true);
  g.ui.showHUD(false);
  g.state = 'credits';
  S.ending.done = true;
  g.saveNow();
  await g.fade(false);
  await g.screens.credits();
  // Weiterspielen
  await g.fade(true);
  guests.forEach((id) => { const n = g.npcById(id); const s = saved.get(id); n.x = n.homeX; n.y = n.homeY; n.mode = 'home'; n.target = null; void s; });
  const pad = g.world.paddock;
  own.forEach((h) => { if (h.id === S.ridingHorse) { h.mode = 'idle'; } else { h.mode = 'paddock'; h.x = pad.x + 2 + Math.random() * (pad.w - 4); h.y = pad.y + 2 + Math.random() * (pad.h - 4); } h.target = null; });
  fe.mode = 'follow';
  g.sceneEntities = null;
  g.festivalLights = null;
  if (pets.maumau) { pets.maumau.mode = null; pets.maumau.x = pets.maumau.homeX; pets.maumau.y = pets.maumau.homeY; }
  if (pets.manni) { pets.manni.mode = null; pets.manni.x = pets.manni.homeX; pets.manni.y = pets.manni.homeY; }
  g.kittenState();
  S.flags.festivalMusic = false;
  S.flags.noWeather = false;
  S.time.day++;
  S.time.minutes = 8 * 60;
  P.x = FARM.spawn.x; P.y = FARM.spawn.y;
  g.camOverride = null;
  g.renderer.follow(P.x, P.y, 0, true);
  g.rebuildEntities();
  g.state = 'play';
  g.ui.showHUD(true);
  g.applyAudioMode();
  g.cutscene = false;
  g.saveNow();
  await g.fade(false);
  g.ui.banner('Ein neuer Morgen', `${name} folgt dir überallhin ♥`);
  g.ui.hint('Du kannst frei weiterspielen: Hufeisen suchen, das Tieralbum füllen, Rennen wiederholen und deinen Hof schmücken!', 9);
}
