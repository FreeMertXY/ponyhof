// Das Finale von Teil 2: Jahresfest am Glitzersee mit Laternen, Feuerwerk und Bilderbuch-Abspann.
import { SPOTS, FARM } from './world.js';
import { Animal } from './animals.js';
import { kiss, love } from './scenes.js';
import { Prop } from './scenekit.js';
import { drawLantern } from './draw/props.js';

export async function runEnding2(g) {
  const S = g.S;
  g.cutscene = true;
  g.state = 'ending';
  await g.fade(true);
  // Festzustand
  S.flags.festivalMusic = true;
  S.flags.noWeather = true;
  S.weather.kind = 'sun';
  g.rainbowAlpha = 0;
  S.time.minutes = 18.6 * 60;
  g.updateLighting();
  g.applyAudioMode();
  if (g.player.riding) { const h = g.player.horse; g.player.riding = false; g.player.horse = null; S.player.riding = false; if (h) { h.visible = true; h.mode = 'scene'; } }
  const F = SPOTS.lakeFest; // Ostufer am Steg
  const P = g.player;
  P.x = F.x - 1.4; P.y = F.y + 0.6; P.face = 'left';
  // Gäste am Ufer
  const guests = ['mert', 'hilde', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'];
  const spots = [[F.x - 0.4, F.y + 0.7], [F.x + 1.2, F.y - 1.2], [F.x + 2.4, F.y - 0.2], [F.x + 3.4, F.y + 1], [F.x + 2.2, F.y + 2.2], [F.x + 1.2, F.y + 3.2], [F.x + 3.6, F.y + 2.8], [F.x + 4.6, F.y + 1.8], [F.x + 4.4, F.y - 1], [F.x + 0.4, F.y + 2.4], [F.x + 5.4, F.y + 0.4]];
  guests.forEach((id, i) => { const n = g.npcById(id); if (!n) return; n.visible = true; n.mode = 'scene'; n.target = null; n.x = spots[i][0]; n.y = spots[i][1]; n.face = 'left'; });
  // Pferde auf der Wiese dahinter
  const own = g.horses.filter((h) => S.horses.includes(h.rec) && !h.foal);
  own.forEach((h, i) => { h.visible = true; h.mode = 'scene'; h.target = null; h.x = F.x + 7 + (i % 3) * 2.4; h.y = F.y - 2 + Math.floor(i / 3) * 1.8; h.face = -1; });
  const pets = g.pets || {};
  if (pets.maumau) { pets.maumau.mode = 'scene'; pets.maumau.x = F.x + 0.8; pets.maumau.y = F.y + 1.4; }
  if (pets.manni) { pets.manni.mode = 'scene'; pets.manni.x = F.x + 1.6; pets.manni.y = F.y + 1.6; }
  if (pets.mira) { pets.mira.mode = 'scene'; pets.mira.x = F.x - 0.9; pets.mira.y = F.y + 1.3; pets.mira.face = -1; }
  for (const k of g.kittens || []) { k.x = F.x + 1 + k.variant * 0.4; k.y = F.y + 2; }
  // Laternen am Ufer (die aufgestellten + ein paar mehr)
  const lantCols = ['#ffb3c8', '#ffe39a', '#b3e3ff', '#c9ffb3', '#e6c9ff', '#ffd0b0'];
  const lanterns = SPOTS.lanterns.map((p, i) => new Prop(p.x, p.y, (c, t) => drawLantern(c, t, lantCols[i % 6], true)));
  g.sceneEntities = [...lanterns];
  g.festivalLights = lanterns.map((l) => ({ x: l.x, y: l.y - 0.4, r: 2.4, c: '#ffe39a' }));
  g.rebuildEntities();
  g.camOverride = { x: F.x - 1, y: F.y };
  g.renderer.follow(g.camOverride.x, g.camOverride.y, 0, true);
  await g.fade(false);
  g.ui.banner('Das Jahresfest am Glitzersee', 'Ein Jahr voller Herzen ♥');
  g.audio.play('fanfare');
  g.particles.confetti(F.x + 1, F.y, 50);
  await g.wait(1.6);
  const medal = S.stats.medals.cup;
  await g.say([
    { who: 'hilde', t: 'Ihr Lieben! Vor genau einem Jahr stand ein Mädchen mit einem Koffer vor meinem alten, müden Hof.' },
    { who: 'hilde', t: 'Heute hat dieser Hof einen Hofladen, eine Reitschule, einen Igel, ein Storchennest, Tulpen – und ein kleines Häuschen voller Liebe.' },
    { who: 'berta', t: 'Und die Kleeberger haben wieder einen Grund zum Feiern. Jede Woche! Mein Kuchenumsatz hat sich verdoppelt.' },
    { who: 'mia', t: medal === 'gold' ? 'Und {name} hat den Kleeberg-Pokal gewonnen! Mit {foal}! Ich bin nur ein BISSCHEN neidisch.' : 'Der Kleeberg-Pokal war das spannendste Rennen aller Zeiten! Nächstes Jahr wieder!' },
    { who: 'lotte', t: 'Und ich kann reiten! Wegen {name}! Wenn ich groß bin, werde ich genau wie sie.' },
    { who: 'ben', t: 'Ich habe ausgerechnet: {name} hat dieses Jahr mindestens zweitausend Tiere gestreichelt. Mindestens.' },
    { who: 'ella', t: 'Und alle sind gesund und glücklich. Ich hab nachgezählt. Also, Ben hat nachgezählt.' },
    { who: 'kuno', t: 'Ahoi! Und jetzt: Die Laternen! Wie früher, als Hilde und Karl hier gefeiert haben!' },
  ]);
  // Sonnenuntergang -> Nacht
  for (let i = 0; i < 40; i++) { S.time.minutes += 4; g.updateLighting(); await g.wait(0.05); }
  await g.say([{ who: 'hilde', t: 'Jeder setzt seine Laterne aufs Wasser und wünscht sich etwas. Ganz leise. Nur für sich.' }]);
  // Laternen steigen auf und treiben über den See
  for (let w = 0; w < 4; w++) {
    for (let i = 0; i < 9; i++) g.particles.lantern(F.x - 3 - Math.random() * 14, F.y - 2 + Math.random() * 9, lantCols[(i + w) % 6]);
    await g.wait(0.9);
  }
  lanterns.forEach((l) => { l.visible = false; });
  await g.wait(1.5);
  await g.say([{ who: 'narr', t: 'Hunderte kleine Lichter schweben über den Glitzersee. Sie spiegeln sich im Wasser, als würde der See selbst leuchten.' }]);
  // Mert
  const m = g.npcById('mert');
  m.x = P.x + 0.9; m.y = P.y; m.face = 'left'; P.face = 'right';
  await g.say([
    { who: 'mert', t: '{name}. Kann ich dir was sagen? Vor allen. Auch wenn Theo zuhört.' },
    { who: 'mert', t: 'Vor einem Jahr hatte ich Angst, dass wir das nicht schaffen. Ein alter Hof, keine Ahnung von Pferden, und Manni hat beim Umzug die Kiste mit den Tellern umgeschmissen.' },
    { who: 'mert', t: 'Aber du hast einfach angefangen. Mit einem Pferd, ein paar Karotten und so viel Herz, dass es für den ganzen Hof gereicht hat. Und für mich.' },
    { who: 'mert', t: 'Ich wünsche mir nur eins: Dass jedes Jahr so wird wie dieses. Mit dir. Für immer.' },
  ]);
  love(true);
  await kiss(g, 'kuss');
  love(false);
  // Feuerwerk
  let firing = true;
  const cols = ['#ff7eb6', '#ffd166', '#7ec8ff', '#b79cf0', '#8fe0c0', '#ff9f7a'];
  let k = 0;
  const fire = () => {
    if (!firing) return;
    g.particles.firework(F.x - 10 + Math.random() * 14, F.y - 2, 150 + Math.random() * 90, cols[k % cols.length], true);
    if (k % 3 === 0) g.particles.shootingStar(F.x - 16 + Math.random() * 8, F.y - 4);
    g.audio.play('boom');
    k++;
    g.later(0.8 + Math.random() * 0.6, fire);
  };
  fire();
  await g.wait(3);
  await g.say([
    { who: 'hilde', t: 'Und weil ihr mir das schönste Jahr geschenkt habt, bekommt ihr etwas von mir.' },
    { who: 'narr', t: 'Hilde gibt dir eine gläserne Schneekugel. Darin: ein winziger Ponyhof. Wenn man sie schüttelt, schneit es, blühen Blumen oder fallen bunte Blätter.' },
    { who: 'hilde', t: 'Karl hat sie mir geschenkt. Man sagt, wer sie schüttelt, kann sich die Jahreszeit aussuchen. Probier es mal aus – im Menü.' },
    { who: 'narr', t: 'Mert nimmt deine Hand. Mira kuschelt sich an deine Füße, die Katzen schnurren, {foal} schnaubt leise von der Wiese herüber – und über dem See tanzen die Lichter.' },
  ]);
  await g.wait(2);
  firing = false;
  // Abspann
  S.part2.done = true;
  g.inv.addDeco('snowglobe', 1);
  S.memories.push({ type: 'jahresfest', day: S.time.day });
  await g.fade(true);
  g.ui.showHUD(false);
  g.state = 'credits';
  g.saveNow();
  await g.fade(false);
  await g.screens.credits2();
  // Weiterspielen
  await g.fade(true);
  guests.forEach((id) => { const n = g.npcById(id); if (n) { n.x = n.homeX; n.y = n.homeY; n.mode = 'home'; n.target = null; } });
  const pad = g.world.paddock;
  own.forEach((h) => { if (h.id === S.ridingHorse) { h.mode = 'idle'; h.x = FARM.spawn.x + 2; h.y = FARM.spawn.y; } else { h.mode = 'paddock'; h.x = pad.x + 2 + Math.random() * (pad.w - 4); h.y = pad.y + 2 + Math.random() * (pad.h - 4); } h.target = null; });
  if (pets.maumau) { pets.maumau.mode = null; pets.maumau.x = pets.maumau.homeX; pets.maumau.y = pets.maumau.homeY; }
  if (pets.manni) { pets.manni.mode = null; pets.manni.x = pets.manni.homeX; pets.manni.y = pets.manni.homeY; }
  if (pets.mira) { pets.mira.mode = 'follow'; }
  g.sceneEntities = null;
  g.festivalLights = null;
  S.flags.festivalMusic = false;
  S.flags.noWeather = false;
  S.time.day++;
  S.time.minutes = 8 * 60;
  P.x = FARM.spawn.x; P.y = FARM.spawn.y;
  g.camOverride = null;
  g.renderer.follow(P.x, P.y, 0, true);
  g.refreshPart2?.();
  g.rebuildEntities();
  g.state = 'play';
  g.ui.showHUD(true);
  g.applyAudioMode();
  g.cutscene = false;
  g.saveNow();
  await g.fade(false);
  g.ui.banner('Ein neues Jahr beginnt', 'Mit allen, die du liebst ♥');
  g.ui.hint('Du kannst frei weiterspielen! Mit der Schneekugel (Menü → „Jahreszeit wählen“) suchst du dir die Jahreszeit aus. Kleeblätter, Hufeisen, Fotos und das Tieralbum warten noch.', 10);
  void Animal;
}
