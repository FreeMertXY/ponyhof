// Alle Gegenstände. cat: food | seed | flower | find | bake | quest
// sell = Verkaufspreis bei Theo (0 = nicht verkaufbar)
export const ITEMS = {
  apple: { name: 'Apfel', plural: 'Äpfel', cat: 'food', sell: 3, desc: 'Knackig und süß – Pferde lieben ihn.' },
  carrot: { name: 'Karotte', plural: 'Karotten', cat: 'food', sell: 3, desc: 'Frisch aus dem Garten. Ein Leckerli für Pferde.' },
  hay: { name: 'Heu', plural: 'Heu', cat: 'food', sell: 1, desc: 'Duftet nach Sommer. Macht Pferde satt und zufrieden.' },
  seed_carrot: { name: 'Karottensamen', plural: 'Karottensamen', cat: 'seed', sell: 1, desc: 'Im Gemüsegarten säen und gießen.' },
  seed_sunflower: { name: 'Sonnenblumensamen', plural: 'Sonnenblumensamen', cat: 'seed', sell: 1, desc: 'Wächst zu einer strahlenden Sonnenblume.' },
  lavender: { name: 'Lavendelstrauß', plural: 'Lavendelsträuße', cat: 'flower', sell: 4, desc: 'Duftet herrlich beruhigend.' },
  poppy: { name: 'Mohnblume', plural: 'Mohnblumen', cat: 'flower', sell: 3, desc: 'Leuchtend rot wie ein Kirschbonbon.' },
  sunflower: { name: 'Sonnenblume', plural: 'Sonnenblumen', cat: 'flower', sell: 5, desc: 'Dreht sich immer zur Sonne.' },
  daisy: { name: 'Gänseblümchen', plural: 'Gänseblümchen', cat: 'flower', sell: 2, desc: 'Klein, weiß und fröhlich.' },
  mushroom: { name: 'Pilz', plural: 'Pilze', cat: 'find', sell: 4, desc: 'Ein Steinpilz aus dem Flüsterwald.' },
  shell: { name: 'Muschel', plural: 'Muscheln', cat: 'find', sell: 4, desc: 'Wenn man sie ans Ohr hält, rauscht das Meer.' },
  bread: { name: 'Brot', plural: 'Brote', cat: 'bake', sell: 4, desc: 'Ofenfrisch aus Bertas Backstube.' },
  cake: { name: 'Streuselkuchen', plural: 'Streuselkuchen', cat: 'bake', sell: 8, desc: 'Bertas berühmter Kuchen. Ein tolles Geschenk!' },
  juice: { name: 'Apfelsaft', plural: 'Apfelsaft', cat: 'bake', sell: 3, desc: 'Naturtrüb und spritzig.' },
  letter: { name: 'Eilbrief', plural: 'Eilbriefe', cat: 'quest', sell: 0, desc: 'Für Kuno, den Leuchtturmwärter. Schnell!' },
  boards: { name: 'Bretter', plural: 'Bretter', cat: 'quest', sell: 0, desc: 'Stabile Bretter zum Bauen. Gibt es bei Theo.' },
  loveletter: { name: 'Liebesbrief', plural: 'Liebesbriefe', cat: 'quest', sell: 0, desc: 'Rosa Papier, ein Herz als Siegel – und Merts krakelige Schrift.' },
  birthdaycake: { name: 'Geburtstagstorte', plural: 'Geburtstagstorten', cat: 'quest', sell: 0, desc: 'Bertas Apfeltorte mit Kerzen – für Merts Geburtstag.' },
  giftbox: { name: 'Muschel-Anhänger', plural: 'Muschel-Anhänger', cat: 'quest', sell: 0, desc: 'Von Luise gefertigt: zwei Muschelhälften, die zusammen ein Herz ergeben.' },
  flamingo: { name: 'Flamingo-Spielzeug', plural: 'Flamingo-Spielzeuge', cat: 'quest', sell: 0, desc: 'Mannis liebstes Spielzeug – rosa, mit Wackelaugen.' },
  heartstone: { name: 'Herzstein', plural: 'Herzsteine', cat: 'quest', sell: 0, desc: 'Ein glatter Stein in Herzform. Mert hat ihn für dich versteckt.' },
  invite: { name: 'Einladung', plural: 'Einladungen', cat: 'quest', sell: 0, desc: 'Einladung zum Sommerfest auf dem Ponyhof.' },
  // ---------- Teil 2 ----------
  proviant: { name: 'Reiseproviant', plural: 'Reiseproviant', cat: 'quest', sell: 0, desc: 'Bertas Apfelkuchen in einer Dose – für Oma Hildes lange Reise.' },
  halter: { name: 'Fohlenhalfter', plural: 'Fohlenhalfter', cat: 'quest', sell: 0, desc: 'Ein weiches, lavendelfarbenes Halfter. Von Luise genäht – genau in Fohlengröße.' },
  seed_pumpkin: { name: 'Kürbissamen', plural: 'Kürbissamen', cat: 'seed', sell: 1, desc: 'Im Gemüsegarten säen und gießen – daraus werden dicke, orange Kürbisse.' },
  pumpkin: { name: 'Kürbis', plural: 'Kürbisse', cat: 'food', sell: 7, desc: 'Rund, orange und schwer. Perfekt für Suppe – oder als Laterne.' },
  chestnut: { name: 'Kastanie', plural: 'Kastanien', cat: 'find', sell: 2, desc: 'Glänzend braun und glatt wie ein Handschmeichler.' },
  mappiece: { name: 'Kartenstück', plural: 'Kartenstücke', cat: 'quest', sell: 0, desc: 'Ein Stück von Opa Karls alter Schatzkarte. Vergilbt, aber mit liebevoller Handschrift.' },
  wool: { name: 'Alpakawolle', plural: 'Alpakawolle', cat: 'find', sell: 5, desc: 'Watteweich und warm. Die Alpakas in den Wolkenbergen geben sie gern her.' },
  pinecone: { name: 'Tannenzapfen', plural: 'Tannenzapfen', cat: 'find', sell: 2, desc: 'Duftet nach Wald und Winter. Schön zum Basteln.' },
  cookies: { name: 'Plätzchen', plural: 'Plätzchen', cat: 'bake', sell: 4, desc: 'Bertas Butterplätzchen in Herz- und Sternform.' },
  snowdrop: { name: 'Schneeglöckchen', plural: 'Schneeglöckchen', cat: 'flower', sell: 3, desc: 'Das erste Blümchen nach dem Winter. Es läutet den Frühling ein.' },
  youngsaddle: { name: 'Jungpferdesattel', plural: 'Jungpferdesättel', cat: 'quest', sell: 0, desc: 'Ein leichter, weich gepolsterter Sattel – genau richtig für ein junges Pferd.' },
  seed_tulip: { name: 'Tulpenzwiebeln', plural: 'Tulpenzwiebeln', cat: 'seed', sell: 1, desc: 'Im Garten setzen und gießen – im Frühling blühen sie in allen Farben.' },
  tulip: { name: 'Tulpe', plural: 'Tulpen', cat: 'flower', sell: 5, desc: 'Leuchtend bunt. Opa Karl hat Oma Hilde jedes Frühjahr Tulpen geschenkt.' },
  stone: { name: 'Feldstein', plural: 'Feldsteine', cat: 'find', sell: 1, desc: 'Ein schöner, flacher Stein aus den Wolkenbergen. Gut zum Bauen.' },
  sand: { name: 'Eimer Sand', plural: 'Eimer Sand', cat: 'quest', sell: 0, desc: 'Feiner Strandsand – perfekt für einen Reitplatz.' },
  paper: { name: 'Seidenpapier', plural: 'Seidenpapier', cat: 'quest', sell: 0, desc: 'Hauchdünnes, buntes Papier von Paula.' },
  candle: { name: 'Teelicht', plural: 'Teelichter', cat: 'quest', sell: 0, desc: 'Ein kleines Licht für eine große Laterne.' },
  skylantern: { name: 'Seelaterne', plural: 'Seelaternen', cat: 'quest', sell: 0, desc: 'Eine schwimmende Papierlaterne. Für das Jahresfest auf dem Glitzersee.' },
  rosette: { name: 'Reitabzeichen', plural: 'Reitabzeichen', cat: 'quest', sell: 0, desc: 'Eine Ehrenschleife von Luise – für tapfere kleine Reiterinnen und Reiter.' },
  curtains: { name: 'Gardinen', plural: 'Gardinen', cat: 'quest', sell: 0, desc: 'Lavendelfarbene Gardinen mit Herzchen-Saum. Für euer Häuschen.' },
  lampoil: { name: 'Lampenöl', plural: 'Lampenöl', cat: 'quest', sell: 0, desc: 'Damit der Leuchtturm wieder strahlt.' },
  parcel: { name: 'Paket', plural: 'Pakete', cat: 'quest', sell: 0, desc: 'Ein Päckchen aus Theos Laden – bitte nicht schütteln!' },
  birdkit: { name: 'Vogelhäuschen', plural: 'Vogelhäuschen', cat: 'quest', sell: 0, desc: 'Ein selbstgebautes Vogelhäuschen. Muss nur noch aufgehängt werden.' },
  pumpkinpie: { name: 'Kürbiskuchen', plural: 'Kürbiskuchen', cat: 'bake', sell: 8, desc: 'Bertas Herbstspezialität mit einer Wolke Sahne.' },
  punch: { name: 'Kinderpunsch', plural: 'Kinderpunsch', cat: 'bake', sell: 3, desc: 'Heiß, süß und nach Zimt duftend. Wärmt von innen!' },
};

// Futterwerte für Pferde: Freundschaftspunkte
export const HORSE_FOOD = { apple: 5, carrot: 5, hay: 3 };

export const CATEGORY_NAMES = {
  food: 'Futter', seed: 'Samen', flower: 'Blumen', find: 'Fundstücke', bake: 'Backwaren', quest: 'Aufgaben',
};

export function itemName(id, n = 1) {
  const it = ITEMS[id];
  if (!it) return id;
  return n === 1 ? it.name : it.plural;
}

// Pflanzen im Gemüsegarten: benötigte "feuchte" Spielstunden
export const CROPS = {
  carrot: { seed: 'seed_carrot', item: 'carrot', hours: 5, yield: 1, name: 'Karotte' },
  sunflower: { seed: 'seed_sunflower', item: 'sunflower', hours: 7, yield: 1, name: 'Sonnenblume' },
  pumpkin: { seed: 'seed_pumpkin', item: 'pumpkin', hours: 6, yield: 1, name: 'Kürbis' },
  tulip: { seed: 'seed_tulip', item: 'tulip', hours: 5, yield: 1, name: 'Tulpe' },
};
// Reihenfolge, in der Samen beim Säen benutzt werden (Aufgaben-Samen zuerst)
export const SEED_ORDER = ['seed_pumpkin', 'seed_tulip', 'seed_carrot', 'seed_sunflower'];

// Woher bekommt man was? (für Tipps im Aufgabenbuch und bei fehlenden Sachen)
export const ITEM_SOURCES = {
  apple: 'Äpfel: unter einem Apfelbaum E drücken (schütteln) – oder bei Theo kaufen.',
  carrot: 'Karotten: im Gemüsegarten säen, gießen und ernten – oder bei Theo kaufen.',
  hay: 'Heu: bei Theo im Laden.',
  lavender: 'Lavendel: im Lavendelfeld auf den Blumenwiesen (nördlich vom Hof). Wächst jeden Tag nach.',
  poppy: 'Mohnblumen: rote Blumen überall auf den Blumenwiesen.',
  sunflower: 'Sonnenblumen: im Sonnenblumenfeld auf den Blumenwiesen (Nordosten) – oder im Garten säen.',
  daisy: 'Gänseblümchen: kleine weiße Blumen auf den Wiesen rund um Hof und Dorf.',
  mushroom: 'Pilze: im Flüsterwald nahe der Wege.',
  shell: 'Muscheln: am Sonnenstrand im Süden.',
  bread: 'Brot: bei Berta in der Bäckerei (Dorf Kleeberg).',
  cake: 'Streuselkuchen: bei Berta in der Bäckerei.',
  juice: 'Apfelsaft: bei Berta oder Theo.',
  boards: 'Bretter: bei Theo im Laden (Dorf Kleeberg), 12 Münzen pro Stück. Zu wenig Münzen? Blumen, Äpfel oder Muscheln bei Theo verkaufen.',
  seed_carrot: 'Karottensamen: bei Theo – oder notfalls einmal am Tag gratis im Garten.',
  seed_sunflower: 'Sonnenblumensamen: bei Theo.',
  // Teil 2
  pumpkin: 'Kürbisse: Kürbissamen im Gemüsegarten säen, gießen und ernten (Samen bei Theo oder im Hofladen).',
  seed_pumpkin: 'Kürbissamen: bei Theo oder im Hofladen.',
  chestnut: 'Kastanien: unter den Kastanienbäumen auf den Blumenwiesen (nur im Herbst). Sie fallen jeden Tag neu.',
  wool: 'Alpakawolle: die Alpakas auf der Alpakaweide in den Wolkenbergen bürsten (E bei einem Alpaka).',
  pinecone: 'Tannenzapfen: im Winter im Flüsterwald nahe der Wege – dort, wo sonst die Pilze wachsen.',
  cookies: 'Plätzchen: bei Berta in der Bäckerei.',
  snowdrop: 'Schneeglöckchen: im Frühling am Waldrand und auf dem Hof (kleine weiße Glöckchen).',
  youngsaddle: 'Jungpferdesattel: bei Theo im Laden.',
  seed_tulip: 'Tulpenzwiebeln: bei Theo oder im Hofladen.',
  tulip: 'Tulpen: Tulpenzwiebeln im Garten setzen, gießen und ernten.',
  stone: 'Feldsteine: am Fuß der Wolkenberge, dort, wo die Felsen beginnen (graue Steine, E drücken).',
  sand: 'Sand: am Sonnenstrand südlich vom Dorf – an der Sandkuhle E drücken.',
  candle: 'Teelichter: bei Theo im Laden.',
  paper: 'Seidenpapier: bei Paula auf der Post.',
  lampoil: 'Lampenöl: bei Theo im Laden.',
  punch: 'Kinderpunsch: im Winter bei Berta.',
};
// Im Winter wächst nichts im Garten
export const WINTER_SOURCES = {
  carrot: 'Karotten: im Winter wächst nichts – Theo und der Hofladen haben aber welche.',
  apple: 'Äpfel: im Winter hängen keine an den Bäumen – Theo und der Hofladen haben welche.',
};
