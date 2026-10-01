// 14 Tierarten für das Tieralbum.
// shy: flieht, wenn man rennt/reitet. food: Lieblingsfutter (dann flieht es nicht).
// verb: Interaktions-Wort. night: nur nachts sichtbar. water: schwimmt.
export const SPECIES = {
  rabbit: {
    name: 'Hase', region: 'Blumenwiesen', shy: true, food: 'carrot', verb: 'Streicheln', speed: 4.2,
    fact: 'Hasen können bis zu 70 km/h schnell rennen – und schlafen oft mit offenen Augen.',
    spawns: [[100, 62], [84, 50], [118, 70], [136, 48], [78, 116]],
  },
  cat: {
    name: 'Katze', region: 'Dorf Kleeberg', verb: 'Streicheln', speed: 2,
    fact: 'Katzen schnurren nicht nur, wenn sie glücklich sind – Schnurren beruhigt sie auch selbst.',
    spawns: [[128, 100], [146, 102], [115, 92]],
  },
  puppy: {
    name: 'Welpe', region: 'Ponyhof', verb: 'Streicheln', speed: 3, follows: true,
    fact: 'Welpen schlafen bis zu 20 Stunden am Tag. Spielen ist anstrengend!',
    spawns: [[92, 90], [124, 98]],
  },
  duckling: {
    name: 'Entenküken', region: 'Glitzersee', verb: 'Zuwinken', speed: 1.5, water: true, food: 'bread', seasons: ['spring', 'summer', 'autumn'],
    fact: 'Entenküken folgen dem ersten Lebewesen, das sie nach dem Schlüpfen sehen.',
    spawns: [[50, 139], [52, 144], [48, 148]],
  },
  hedgehog: {
    name: 'Igel', region: 'Flüsterwald', verb: 'Vorsichtig streicheln', speed: 1, seasons: ['spring', 'summer', 'autumn'],
    fact: 'Ein Igel hat etwa 7000 Stacheln. Bei Gefahr rollt er sich zu einer Kugel.',
    spawns: [[30, 86], [18, 70], [46, 108]],
  },
  fox: {
    name: 'Fuchs', region: 'Flüsterwald', shy: true, food: 'apple', verb: 'Streicheln', speed: 4.5,
    fact: 'Füchse benutzen ihren buschigen Schwanz als Decke, wenn sie schlafen.',
    spawns: [[44, 76], [16, 56]],
  },
  squirrel: {
    name: 'Eichhörnchen', region: 'Flüsterwald', shy: true, food: 'apple', verb: 'Füttern', speed: 4,
    fact: 'Eichhörnchen vergraben tausende Nüsse – und vergessen viele davon. So wachsen neue Bäume!',
    spawns: [[36, 60], [28, 96], [10, 80]],
  },
  deer: {
    name: 'Reh', region: 'Flüsterwald', shy: true, food: 'apple', verb: 'Streicheln', speed: 4.5,
    fact: 'Rehkitze haben weiße Punkte im Fell – so sind sie im Sonnenlicht gut getarnt.',
    spawns: [[30, 49], [62, 44], [14, 102]],
  },
  frog: {
    name: 'Frosch', region: 'Glitzersee', verb: 'Beobachten', speed: 2.5, seasons: ['spring', 'summer', 'autumn'],
    fact: 'Frösche trinken nicht mit dem Mund – sie nehmen Wasser über die Haut auf.',
    spawns: [[57, 146], [26, 138], [53, 142]],
  },
  butterfly: {
    name: 'Schmetterling', region: 'Blumenwiesen', verb: 'Anlocken', speed: 1.5, flying: true, seasons: ['spring', 'summer', 'autumn'],
    fact: 'Schmetterlinge schmecken mit ihren Füßen!',
    spawns: [[72, 48], [96, 52], [124, 46], [110, 66], [103, 98], [86, 62]],
  },
  crab: {
    name: 'Krabbe', region: 'Sonnenstrand', verb: 'Hallo sagen', speed: 1.6,
    fact: 'Krabben laufen seitwärts, weil ihre Beine so am besten gelenkig sind.',
    spawns: [[100, 163], [140, 162], [122, 164]],
  },
  seal: {
    name: 'Robbe', region: 'Sonnenstrand', verb: 'Streicheln', speed: 1, food: 'shell',
    fact: 'Robben können bis zu 30 Minuten die Luft anhalten.',
    spawns: [[150, 163], [169, 155]],
  },
  owl: {
    name: 'Eule', region: 'Flüsterwald', verb: 'Leise grüßen', speed: 0, night: true,
    fact: 'Eulen können ihren Kopf um 270 Grad drehen. Nachts sehen sie hervorragend.',
    spawns: [[24, 60], [40, 100], [12, 84]],
  },
  alpaca: {
    name: 'Alpaka', region: 'Wolkenberge', verb: 'Streicheln', speed: 1.8, food: 'carrot',
    fact: 'Alpakas summen, um sich miteinander zu unterhalten.',
    spawns: [[76, 16], [82, 20], [70, 22], [88, 14]],
  },
  // ---------- Teil 2 ----------
  swan: {
    name: 'Schwan', region: 'Glitzersee', verb: 'Zuwinken', speed: 1.2, water: true, food: 'bread', part2: true, seasons: ['spring', 'summer', 'autumn'], seasonHint: 'nicht im Winter',
    fact: 'Schwäne bleiben ihr ganzes Leben lang mit ihrem Partner zusammen.',
    spawns: [[46, 141], [31, 151]],
  },
  goat: {
    name: 'Bergziege', region: 'Wolkenberge', verb: 'Streicheln', speed: 2.4, food: 'carrot', part2: true,
    fact: 'Ziegen können auf fast senkrechten Felsen klettern – und sie lieben es, auf Dingen zu stehen.',
    spawns: [[122, 10], [136, 25], [94, 24]],
  },
  robin: {
    name: 'Rotkehlchen', region: 'Ponyhof', verb: 'Leise grüßen', speed: 2, part2: true, seasons: ['autumn', 'winter'], seasonHint: 'Herbst und Winter',
    fact: 'Rotkehlchen singen sogar im Winter – und manchmal nachts unter einer Laterne.',
    spawns: [[64, 87], [129, 104], [58, 101]],
  },
  stork: {
    name: 'Storch', region: 'Blumenwiesen', verb: 'Bewundern', speed: 1.4, part2: true, seasons: ['spring', 'summer'], seasonHint: 'Frühling und Sommer',
    fact: 'Störche fliegen jedes Jahr Tausende Kilometer – und kommen immer zum selben Nest zurück.',
    spawns: [[146, 72], [119, 63]],
  },
  lamb: {
    name: 'Lämmchen', region: 'Blumenwiesen', verb: 'Streicheln', speed: 2.2, food: 'carrot', part2: true, seasons: ['spring', 'summer'], seasonHint: 'Frühling und Sommer',
    fact: 'Lämmer erkennen ihre Mama am Blöken – unter hunderten anderen Schafen.',
    spawns: [[151, 58], [154, 62], [147, 61]],
  },
  bat: {
    name: 'Fledermaus', region: 'Dorf Kleeberg', verb: 'Leise grüßen', speed: 0, night: true, flying: true, part2: true, seasons: ['spring', 'summer', 'autumn'], seasonHint: 'nachts, nicht im Winter',
    fact: 'Fledermäuse sehen mit den Ohren: Sie rufen ganz hoch und hören das Echo.',
    spawns: [[112, 96], [66, 80]],
  },
};

// Haustiere von Jolina und Mert (nicht im Tieralbum, außer die Katzen zählen als „Katze“)
export const PETS = {
  maumau: { name: 'Maumau', verb: 'Streicheln', speed: 2, pet: true, albumAs: 'cat', sound: 'purr', desc: 'Glückskatze mit Wuschelfell und grünen Augen. Lässt sich am liebsten hinter den Ohren kraulen.' },
  manni: { name: 'Manni', verb: 'Streicheln', speed: 2, pet: true, albumAs: 'cat', sound: 'purr', desc: 'Grauer Flauschkater mit bernsteinfarbenen Augen. Liebt Spielzeug mit Wackelaugen.' },
  kitten: { name: 'Kätzchen', verb: 'Streicheln', speed: 2.2, pet: true, albumAs: 'cat', sound: 'purr', desc: 'Maumaus Kätzchen – winzig, flauschig und sehr neugierig.' },
  mira: { name: 'Mira', verb: 'Streicheln', speed: 4, pet: true, follows: true, sound: 'bark', desc: 'Kleine Yorkshire-Hündin mit großem Herz. Findet mit ihrer Nase fast alles.' },
};

export const SPECIES_ORDER = ['rabbit', 'cat', 'puppy', 'duckling', 'hedgehog', 'fox', 'squirrel', 'deer', 'frog', 'butterfly', 'crab', 'seal', 'owl', 'alpaca', 'swan', 'goat', 'robin', 'stork', 'lamb', 'bat'];
