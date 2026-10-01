// Bewohnerinnen und Bewohner mit Aussehen, Persönlichkeit, Alltagssätzen und Geschenk-Vorlieben.
// {name} = Name der Spielerin, {horse} = Name des Reitpferds, {farm} = "Jolinas Ponyhof"

export const SKINS = ['#ffe3cc', '#f7d0ab', '#e9b68c', '#cf9366', '#a36b47', '#704832'];
export const HAIR_COLORS = [
  { name: 'Blond', c: '#f4d27a' }, { name: 'Hellbraun', c: '#c68b59' }, { name: 'Braun', c: '#6e4431' },
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
  mert: {
    name: 'Mert', title: 'dein Freund', home: 'farm',
    look: { skin: 1, hair: 'curlyshort', hairColor: '#2b221f', outfit: { main: '#2a2527', second: '#3b3a3f', style: 'openshirt' }, glasses: 'round', beard: '#3a2b25', fullBeard: true, necklace: '#d8dce4', chain: true },
    voice: 0.8,
    lines: [
      ['Guten Morgen, {name}! Maumau hat schon wieder auf meinem Kopfkissen geschlafen.', 'Ich hab Mira heute früh schon Gassi geführt. Sie wollte unbedingt zu den Pferden.'],
      ['Der Stall ist mein ganzer Stolz. Also, nach dir natürlich.', 'Manni sitzt seit einer Stunde vor dem Heuballen. Ich glaube, er jagt eine Maus. Oder er schläft.'],
      ['Weißt du noch, wie wir zum ersten Mal hier ankamen? Und jetzt schau dir das an!', 'Wenn du ausreiten willst, pass ich auf den Hof auf. Und auf die Katzen. Vor allem auf die Katzen.'],
      ['Das Sommerfest wird wunderschön. Genau wie du. … Hab ich das gerade laut gesagt?', 'Ich bin so stolz auf dich, {name}.'],
    ],
    loves: ['cake', 'bread'], likes: ['apple', 'juice', 'sunflower'],
    thanks: 'Für mich? Du bist die Beste, {name}!',
    giftBack: { coins: 10 },
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

// ---------- Teil 2: neue Bewohnerinnen ----------
NPCS.lotte = {
  name: 'Lotte', title: 'Mias kleine Cousine', home: 'village', kid: true, part2: true,
  look: { skin: 0, hair: 'bob', hairColor: '#f4d27a', outfit: { main: '#ffd23f', second: '#5b8fd9', style: 'jacket' }, freckles: true },
  voice: 1.6,
  lines: [['Ähm … hallo! Ich mag Pferde. Sehr. Sehr sehr.']],
  loves: ['carrot', 'cookies'], likes: ['daisy', 'apple', 'snowdrop'],
  thanks: 'Für mich?! Danke, danke, danke!',
  giftBack: { item: 'daisy', n: 1 },
};
NPCS.ella = {
  name: 'Tierärztin Ella', title: 'Tierärztin', home: 'village', part2: true,
  look: { skin: 4, hair: 'curly', hairColor: '#2e2430', outfit: { main: '#ffffff', second: '#7fcdea', style: 'vest' }, bag: '#e86f7d', necklace: '#8a9aaa' },
  voice: 1.05,
  lines: [['Hallo! Ich bin Ella. Tierärztin. Und Igel-Flüsterin.']],
  loves: ['tulip', 'pumpkinpie'], likes: ['juice', 'apple', 'snowdrop'],
  thanks: 'Wie aufmerksam! Das kommt auf meinen Schreibtisch.',
  giftBack: { coins: 8 },
};

// Plaudersätze in Teil 2, je nach Jahreszeit
const L2 = {
  hilde: {
    autumn: ['Ich schreibe euch jede Woche, versprochen!'],
    winter: ['Schnee auf dem Ponyhof … wie in meinen Kindertagen.', 'Ein Becher heißer Kakao, und alles ist gut.'],
    spring: ['Die Tulpen von Karl … ich sehe sie schon blühen.', 'Gerda lässt grüßen. Sie will euch im Sommer besuchen!'],
    summer: ['Ein ganzes Jahr, {name}. Und jeder Tag war ein Geschenk.', 'Euer Häuschen ist das schönste weit und breit.'],
  },
  mert: {
    autumn: ['Herbst ist meine Lieblingsjahreszeit. Wegen der Farben. Und wegen dir. Vor allem wegen dir.', 'Manni hat heute versucht, ein Blatt zu fangen. Er hat verloren.', '{foal} hat heute mein Halstuch gefressen. Fast. Ich hab’s gerettet.'],
    winter: ['Deine Nase ist ganz rot vor Kälte. Steht dir!', 'Mira hat einen Schneeengel gemacht. Also, sie hat sich im Schnee gewälzt.', 'Weißt du, was das Beste am Winter ist? Kuscheln. Eindeutig Kuscheln.'],
    spring: ['Alles blüht! Sogar Theo hat heute gelächelt.', '{foal} ist so groß geworden. Wo ist nur die Zeit hin?', 'Die Vögel singen schon um fünf Uhr früh. Ich auch. Leider.'],
    summer: ['Ein Jahr mit dir auf dem Hof. Ich würde jeden Tag genauso wieder erleben.', 'Unser Häuschen … ich kann es immer noch nicht glauben.', 'Ich bin so stolz auf dich, {name}. Hab ich das heute schon gesagt? Dann jetzt nochmal.'],
  },
  berta: {
    autumn: ['Kürbiskuchen, Apfelkuchen, Zwetschgenkuchen – der Herbst ist ein Kuchenfest!', 'Hilde hat geschrieben! Aus Bremerhaven. Mit Möwe auf der Karte!'],
    winter: ['In der Backstube ist es mollig warm. Komm rein, Schätzchen!', 'Krümel schläft jetzt den ganzen Winter auf dem Ofen.'],
    spring: ['Frühlingszwiebelbrot! Neu im Sortiment.', 'Die Störche sind zurück – dann wird alles gut.'],
    summer: ['Ein Jahr schon? Kinder, wie die Zeit vergeht.', 'Für das Jahresfest backe ich eine Torte in Hufeisenform!'],
  },
  luise: {
    autumn: ['Herbstfarben! Rost, Senf, Kürbis – ich bin im Stoffhimmel.'],
    winter: ['Strickzeit! Ich stricke gerade einen Schal für Theo. Er weiß es noch nicht.'],
    spring: ['Pastell! Endlich wieder Pastell!'],
    summer: ['Für das Jahresfest nähe ich Wimpelketten in allen Farben eines ganzen Jahres.'],
  },
  theo: {
    autumn: ['Hm-hm. Warum fallen Blätter im Herbst? Weil sie es satthaben. Hehe.'],
    winter: ['Was sagt ein Schneemann zum anderen? „Riechst du auch Karotten?“ Hm-hm.'],
    spring: ['Tulpenzwiebeln im Angebot. Die bringen mich nicht zum Weinen. Hehe.'],
    summer: ['Ein Jahr Ponyhof. Mein Umsatz bei Karotten hat sich verdreifacht. Danke.'],
  },
  paula: {
    autumn: ['Herbstwind von vorne – das ist Training für die Waden!'],
    winter: ['Weihnachtspost! Ich fahre jetzt mit Schneeketten am Fahrrad.'],
    spring: ['Die Störche bringen Post aus dem Süden. Also, irgendwie.'],
    summer: ['Ein Jahr, in dem ich dir Post bringen durfte. Zack, zack – nächstes Jahr wieder!'],
  },
  mia: {
    autumn: ['Lotte malt jetzt NUR noch dich und Pferde. Manchmal auch mich. Klein. In der Ecke.'],
    winter: ['Im Schnee galoppieren ist das Größte! Blitz liebt es.'],
    spring: ['Bald ist wieder Rennsaison. Ich trainiere schon!'],
    summer: ['Der Kleeberg-Pokal wird legendär. LEGENDÄR!'],
  },
  ben: {
    autumn: ['W-wusstest du, dass Igel bis zu fünf Monate Winterschlaf halten?'],
    winter: ['Rotkehlchen bleiben den ganzen Winter hier. Tapfere kleine Vögel.'],
    spring: ['Die ersten Kaulquappen im Glitzersee! Ich hab sie gezählt. 412. Ungefähr.'],
    summer: ['In meinem Tierbuch hast du jetzt ein eigenes Kapitel. „Die Pferdefrau“.'],
  },
  kuno: {
    autumn: ['Herbststürme! Da muss mein Leuchtturm ganz besonders hell leuchten.'],
    winter: ['Das Meer friert nie zu. Zu salzig. Wie meine Witze.'],
    spring: ['Die Robben haben Junge! Kleine Kugeln mit Schnurrbart.'],
    summer: ['Ein Jahr, in dem du mich besucht hast. Das hat mein altes Seemannsherz gewärmt.'],
  },
  lotte: {
    autumn: ['Ich hab heute ein Pferd gemalt, das aussieht wie deins. Nur mit Flügeln.', 'Mia sagt, ich bin mutig geworden. Ich glaub, das stimmt!'],
    winter: ['Im Winter haben Pferde Plüschfell! Wie Teddys mit Hufen!', 'Ich hab einen Schneemann gebaut. Er heißt Herr Möhre.'],
    spring: ['Wenn ich groß bin, werde ich Reitlehrerin. Wie du!', 'Die Fohlen auf der Wildpferdewiese sind sooo süß!'],
    summer: ['Beim Kleeberg-Pokal reite ich mit! Ein bisschen. Hinten.', 'Du bist meine allerliebste Reitlehrerin der Welt.'],
  },
  ella: {
    autumn: ['Igel brauchen im Herbst viel Futter. Katzenfutter mögen sie übrigens auch.', 'Mein Wartezimmer ist heute voller Meerschweinchen. Fünf Stück. Alle heißen Fluffy.'],
    winter: ['Im Winter brauchen Pferde viel Heu. Das wärmt von innen!', 'Stachelchen schläft tief und fest. Ich hab nachgeschaut. Leise.'],
    spring: ['Frühling ist Babyzeit! Überall Küken, Lämmer und Fohlen.', 'Hast du die Störche auf dem Postdach gesehen?'],
    summer: ['Deine Tiere sind die gesündesten in ganz Kleeberg. Das liegt an dir.', 'Ein Jahr Ponyhof – und ein Jahr Ella in Kleeberg. Wir sind ein gutes Team!'],
  },
};
for (const [id, l] of Object.entries(L2)) NPCS[id].lines2 = l;

export const NPC_ORDER = ['hilde', 'mert', 'berta', 'luise', 'theo', 'paula', 'mia', 'ben', 'kuno', 'lotte', 'ella'];
export const VILLAGERS = ['berta', 'luise', 'theo', 'paula', 'mia', 'ben'];
