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
};

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
};
