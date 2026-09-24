// Bewohnerinnen und Bewohner mit Aussehen, Persönlichkeit, Alltagssätzen und Geschenk-Vorlieben.
// {name} = Name der Spielerin, {horse} = Name des Reitpferds, {farm} = "Jolinas Ponyhof"

export const SKINS = ['#ffe3cc', '#f7d0ab', '#e9b68c', '#cf9366', '#a36b47', '#704832'];
export const HAIR_COLORS = [
  { name: 'Blond', c: '#f4d27a' }, { name: 'Hellbraun', c: '#c68b59' }, { name: 'Braun', c: '#7a4a2e' },
  { name: 'Schwarz', c: '#2e2430' }, { name: 'Rot', c: '#dc5f33' }, { name: 'Rosa', c: '#ff9ecb' },
  { name: 'Lila', c: '#a98be8' }, { name: 'Mint', c: '#6fd3b8' },
];
export const HAIR_STYLES = ['Lang & offen', 'Pferdeschwanz', 'Zwei Zöpfe', 'Dutt', 'Bob', 'Locken'];

export const NPCS = {
  hilde: {
    name: 'Oma Hilde', title: 'deine Oma', home: 'farm',
    look: { skin: 1, hair: 'bun', hairColor: '#e4e1ea', outfit: { main: '#9b7fd1', second: '#f6e7d2', style: 'dress' }, glasses: true, shawl: '#ff9fb2', apron: '#fff6e8' },
    voice: 0.9,
    lines: [
      ['Weißt du, {name}, dein Opa Karl hat hier jeden Morgen den Pferden „Guten Morgen“ gesagt.', 'Jedes Pferd hat seinen eigenen Kopf. Genau wie wir.'],
      ['Der Hof wird mit jedem Tag schöner. Ich sehe es in deinen Augen.', 'Vergiss nicht, {horse} ab und zu zu striegeln. Das mögen Pferde sehr!'],
      ['Wenn es regnet, gießt der Himmel deinen Garten. Praktisch, nicht?', 'Nachts leuchten im Flüsterwald die Glühwürmchen. Ein Zauber!'],
      ['Ich bin so stolz auf dich, {name}.', 'Das Sommerfest … ach, wie habe ich es vermisst.'],
    ],
    loves: ['cake', 'sunflower'], likes: ['lavender', 'daisy', 'apple'],
    thanks: 'Oh, wie lieb von dir, Schatz!',
    giftBack: { item: 'apple', n: 2 },
  },
  berta: {
    name: 'Bäckerin Berta', title: 'Bäckerin', home: 'village', shop: 'berta',
    look: { skin: 2, hair: 'bun', hairColor: '#c9793f', outfit: { main: '#f2a65a', second: '#fff', style: 'dress' }, apron: '#ffffff', hat: 'chef' },
    voice: 1.1,
    lines: [
      ['Ach du liebe Güte, {name}! Schön, dich zu sehen!', 'Ein Leben ohne Kuchen ist möglich, aber sinnlos.'],
      ['Krümel schläft am liebsten auf dem warmen Mehlsack.', 'Brötchen, Brezeln, Brote – alles mit Liebe gebacken!'],
      ['Ich hab gehört, du reitest wie der Wind! Sei vorsichtig, ja?', 'Wenn du Pilze findest, denk an mich. Pilzsuppe, hmmm!'],
      ['Für das Sommerfest backe ich eine Torte mit sieben Etagen!', 'Hilde und ich waren früher unzertrennlich. Und jetzt kommst du!'],
    ],
    loves: ['mushroom', 'apple'], likes: ['daisy', 'carrot'],
    thanks: 'Für mich? Du bist ja ein Schatz!',
    giftBack: { item: 'bread', n: 1 },
  },
  luise: {
    name: 'Schneiderin Luise', title: 'Schneiderin', home: 'village', shop: 'luise',
    look: { skin: 0, hair: 'long', hairColor: '#b98be8', outfit: { main: '#7fcfc0', second: '#ffe9f3', style: 'fancy' }, glasses: false, scarf: '#ff8fb8' },
    voice: 1.25,
    lines: [
      ['Wie entzückend! Dein Outfit hat so eine schöne Farbe.', 'Ich träume in Stoffmustern. Heute Nacht: Tupfen!'],
      ['Weißt du, welche Farbe Glück hat? Pfirsichrosa. Ganz sicher.', 'Mein Nähkorb ist mein Schatz. Und mein Chaos.'],
      ['Ein Pferd mit Blumenkranz – gibt es etwas Schöneres?', 'Lavendel beruhigt. Und er duftet nach Urlaub.'],
      ['Ich nähe Wimpelketten fürs Fest. Hunderte!', 'Du bringst so viel Farbe in unser Dorf, {name}.'],
    ],
    loves: ['lavender', 'poppy'], likes: ['daisy', 'sunflower', 'shell'],
    thanks: 'Oh! Das inspiriert mich zu einem neuen Kleid!',
    giftBack: { item: 'daisy', n: 2 },
  },
  theo: {
    name: 'Kaufmann Theo', title: 'Ladenbesitzer', home: 'village', shop: 'theo',
    look: { skin: 1, hair: 'short', hairColor: '#8a8a94', outfit: { main: '#6b8e5a', second: '#f0e0c0', style: 'vest' }, mustache: true, hat: 'cap', apron: '#d8c7a8' },
    voice: 0.75,
    lines: [
      ['Hm-hm. Was darf’s sein?', 'Warum sind Äpfel so gute Verkäufer? Sie haben immer die Kerne-Kompetenz. Hehe.'],
      ['Im Laden gibt’s Sättel in sechs Farben. Sechs! Ich hab nachgezählt.', 'Dein Pferd sieht hungrig aus. Karotten hätte ich da …'],
      ['Früher war ich auch mal schnell. Wie ein Pferd. Ein langsames Pferd.', 'Wer Blumen verkauft, verdient ehrliche Münzen.'],
      ['Das Sommerfest? Ich spendiere die Limonade. Aber nur eine.', 'Na gut, zwei.'],
    ],
    loves: ['apple', 'juice'], likes: ['bread', 'mushroom'],
    thanks: 'Hm-hm. Sehr freundlich. Wirklich.',
    giftBack: { coins: 8 },
  },
  paula: {
    name: 'Postbotin Paula', title: 'Postbotin', home: 'village',
    look: { skin: 3, hair: 'ponytail', hairColor: '#2e2430', outfit: { main: '#ffd23f', second: '#3d5aa8', style: 'jacket' }, hat: 'post', bag: '#8b5a3c' },
    voice: 1.35,
    lines: [
      ['Zack, zack! Keine Zeit, keine Zeit!', 'Wusstest du, dass ich jeden Tag 30 Kilometer fahre? Mit Fahrrad!'],
      ['Ein Brief ist wie ein kleines Geschenk. Mit Briefmarke!', 'Wenn du galoppierst, bist du fast so schnell wie ich. Fast!'],
      ['Vom Aussichtspunkt sieht man bis zum Leuchtturm. Traumhaft!', 'Ich liebe Montage. Da gibt’s am meisten Post!'],
      ['Die Einladungen fürs Sommerfest? Die hätte ich schneller verteilt. Aber lieb von dir!', 'Zack, zack – aber heute mal ganz entspannt.'],
    ],
    loves: ['juice', 'cake'], likes: ['apple', 'bread'],
    thanks: 'Danke! Das gibt Energie für die nächste Tour!',
    giftBack: { coins: 6 },
  },
  mia: {
    name: 'Mia', title: 'Dorfkind', home: 'village', kid: true,
    look: { skin: 0, hair: 'pigtails', hairColor: '#dc5f33', outfit: { main: '#ff7aa8', second: '#3d4a6b', style: 'jacket' }, hat: 'helmet', freckles: true },
    voice: 1.5,
    lines: [
      ['Pferde sind die besten Tiere der Welt. Punkt.', 'Wetten, ich bin schneller als du?'],
      ['Mein Pony heißt Blitz. Weil er so schnell ist. Und weil er Angst vor Gewitter hat.', 'Beim Springen musst du nach vorne schauen, nicht aufs Hindernis!'],
      ['Ben ist eigentlich ganz okay. Für einen Frosch-Zähler.', 'Hast du schon alle Hufeisen gefunden? Ich hab eins! Glaub ich.'],
      ['Beim Sommerfest reite ich vorneweg. Oder du. Mal sehen.', 'Du bist echt eine richtige Pferdefrau, {name}!'],
    ],
    loves: ['carrot', 'apple'], likes: ['cake', 'sunflower'],
    thanks: 'Cool! Das kriegt Blitz. Oder ich. Mal sehen.',
    giftBack: { item: 'carrot', n: 1 },
  },
  ben: {
    name: 'Ben', title: 'Dorfkind', home: 'village', kid: true,
    look: { skin: 4, hair: 'short', hairColor: '#2e2430', outfit: { main: '#7cc6e8', second: '#a57a52', style: 'sweater' }, glasses: true, bag: '#6fa35a' },
    voice: 1.45,
    lines: [
      ['W-wusstest du, dass Frösche mit der Haut trinken?', 'Ich schreibe alles in mein Tierbuch. Alles!'],
      ['Eulen sieht man nur nachts. Im Flüsterwald. Psst.', 'Hasen laufen weg, wenn man rennt. Langsam gehen hilft!'],
      ['Robben am Strand mögen Muscheln. Glaube ich. Muss ich noch prüfen.', 'Mia ist laut. Aber nett.'],
      ['Ich hab für das Sommerfest ein Tierquiz vorbereitet!', 'Du bist die beste Tierfreundin, die ich kenne, {name}.'],
    ],
    loves: ['shell', 'mushroom'], likes: ['daisy', 'bread'],
    thanks: 'Oh! Das kommt in meine Sammlung! D-danke!',
    giftBack: { item: 'shell', n: 1 },
  },
  kuno: {
    name: 'Leuchtturmwärter Kuno', title: 'Leuchtturmwärter', home: 'beach',
    look: { skin: 2, hair: 'short', hairColor: '#f0f0f5', outfit: { main: '#2f4f8a', second: '#f4f4f4', style: 'sailor' }, beard: '#f0f0f5', hat: 'captain' },
    voice: 0.7,
    lines: [
      ['Ahoi, {name}! Frischer Wind heute, was?', 'Ich hab mal einen Wal gesehen, so groß wie das ganze Dorf. Mindestens!'],
      ['Mein Leuchtturm zeigt den Schiffen den Weg nach Hause.', 'Robben sind die besten Zuhörer. Sagen nie Nein.'],
      ['Bei Sonnenuntergang glitzert das Meer wie tausend Goldmünzen.', 'Muscheln sammeln macht glücklich. Wissenschaftlich bewiesen. Von mir.'],
      ['Ein Sommerfest! Da hol ich mein bestes Seemannslied raus.', 'Du hast ein großes Herz, Landratte.'],
    ],
    loves: ['shell', 'bread'], likes: ['juice', 'mushroom'],
    thanks: 'Donnerwetter! Das ist ja ein Schatz!',
    giftBack: { item: 'shell', n: 2 },
  },
};

export const NPC_ORDER = ['hilde', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno'];
export const VILLAGERS = ['berta', 'luise', 'theo', 'paula', 'mia', 'ben'];
