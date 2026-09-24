// Zubehör, Kleidung, Deko und die Sortimente der Läden.

export const SADDLE_COLORS = [
  { id: 'saddle_rosa', name: 'Rosa', color: '#ff8fb8' },
  { id: 'saddle_himmel', name: 'Himmelblau', color: '#79c6f2' },
  { id: 'saddle_minze', name: 'Minze', color: '#7fdcb4' },
  { id: 'saddle_lila', name: 'Flieder', color: '#b79cf0' },
  { id: 'saddle_sonne', name: 'Sonnengelb', color: '#ffd166' },
  { id: 'saddle_kirsch', name: 'Kirschrot', color: '#ef5f6f' },
];

// slot: saddle | bow | wreath | blanket
export const ACCESSORIES = {
  ...Object.fromEntries(SADDLE_COLORS.map((s) => [s.id, { slot: 'saddle', name: `Sattel „${s.name}“`, color: s.color, price: 45 }])),
  bow_rosa: { slot: 'bow', name: 'Mähnenschleifen Rosa', color: '#ff7eb6', price: 20 },
  bow_blau: { slot: 'bow', name: 'Mähnenschleifen Blau', color: '#6cb8ff', price: 20 },
  bow_gold: { slot: 'bow', name: 'Mähnenschleifen Gold', color: '#ffc83d', price: 30 },
  wreath: { slot: 'wreath', name: 'Blumenkranz', color: '#ff9ecb', price: 35 },
  blanket_karo: { slot: 'blanket', name: 'Decke „Karo“', color: '#e86f7d', pattern: 'check', price: 40 },
  blanket_sterne: { slot: 'blanket', name: 'Decke „Sternchen“', color: '#6c7fe0', pattern: 'stars', price: 40 },
  blanket_herz: { slot: 'blanket', name: 'Decke „Herzchen“', color: '#ffb3cf', pattern: 'hearts', price: 40 },
  saddle_glitzer: { slot: 'saddle', name: 'Glitzersattel', color: '#e7c6ff', glitter: true, price: 0, special: true },
  bow_regenbogen: { slot: 'bow', name: 'Regenbogenschleifen', color: 'rainbow', price: 0, special: true },
  wreath_gold: { slot: 'wreath', name: 'Goldener Blütenkranz', color: '#ffd24a', gold: true, price: 0, special: true },
};

export const ACC_SLOTS = { saddle: 'Sattel', blanket: 'Decke', bow: 'Mähne', wreath: 'Kranz' };

// Kleidung: Outfits ohne „unlock“ gibt es im Editor, die anderen kann man bekommen
export const OUTFITS = [
  { name: 'Blümchenkleid', main: '#fbfaf7', second: '#4d6fb8', style: 'floral' },
  { name: 'Latzhose', main: '#5b8fd9', second: '#fff3d6', style: 'overall' },
  { name: 'Sommerkleid', main: '#ff9ec4', second: '#fff', style: 'dress' },
  { name: 'Reitjacke', main: '#e2574c', second: '#f3e3c3', style: 'jacket' },
  { name: 'Kuschelpulli', main: '#f7c948', second: '#6d8fc9', style: 'sweater' },
  { name: 'Karohemd', main: '#6cc28a', second: '#8a6a4f', style: 'check' },
  { name: 'Matrosenlook', main: '#f4f7ff', second: '#4166c9', style: 'sailor' },
  { name: 'Lavendelkleid', main: '#b79cf0', second: '#fff', style: 'dress', unlock: 'outfit_lavender' },
  { name: 'Festtagskleid', main: '#ffb3c1', second: '#ffe08a', style: 'fancy', unlock: 'outfit_fest' },
];

export const HATS = [
  { id: 'straw', name: 'Strohhut' },
  { id: 'sun', name: 'Sonnenhut', unlock: 'hat_sun' },
  { id: 'helmet', name: 'Reithelm', unlock: 'hat_helmet' },
  { id: 'flower', name: 'Blütenhaarreif', unlock: 'hat_flower' },
  { id: 'captain', name: 'Kapitänsmütze', unlock: 'hat_captain' },
];

export const CLOTHES = {
  outfit_lavender: { name: 'Lavendelkleid', price: 0, special: true },
  outfit_fest: { name: 'Festtagskleid', price: 90 },
  hat_sun: { name: 'Sonnenhut', price: 35 },
  hat_helmet: { name: 'Reithelm', price: 40 },
  hat_flower: { name: 'Blütenhaarreif', price: 30 },
  hat_captain: { name: 'Kapitänsmütze', price: 0, special: true },
};

// Hof-Deko für den Baumodus
export const DECO = {
  planter: { name: 'Blumenkübel', price: 15 },
  bench: { name: 'Gartenbank', price: 30 },
  lantern: { name: 'Laterne', price: 25, light: true },
  birdhouse: { name: 'Vogelhaus', price: 25 },
  haybale: { name: 'Heuballen', price: 10 },
  gnome: { name: 'Gartenzwerg', price: 20 },
  heartarch: { name: 'Herzbogen', price: 60 },
  sunflowerpot: { name: 'Sonnenblumentopf', price: 18 },
};

// Sortimente. type: item | acc | cloth | deco
export const SHOPS = {
  theo: {
    title: 'Theos Laden',
    greet: 'Hm-hm. Qualität zu fairen Preisen!',
    sells: true,
    tabs: [
      { name: 'Futter & Samen', entries: [['item', 'apple', 6], ['item', 'carrot', 6], ['item', 'hay', 4], ['item', 'seed_carrot', 3], ['item', 'seed_sunflower', 4], ['item', 'juice', 6]] },
      { name: 'Pferdezubehör', entries: [...Object.entries(ACCESSORIES).filter(([, a]) => !a.special).map(([id, a]) => ['acc', id, a.price])] },
      { name: 'Hof-Deko', entries: Object.entries(DECO).map(([id, d]) => ['deco', id, d.price]) },
    ],
  },
  berta: {
    title: 'Bertas Backstube',
    greet: 'Frisch aus dem Ofen, Schätzchen!',
    tabs: [{ name: 'Backwaren', entries: [['item', 'bread', 8], ['item', 'cake', 15], ['item', 'juice', 6]] }],
  },
  luise: {
    title: 'Luises Nähstube',
    greet: 'Mode ist Farbe, die man tragen kann!',
    tabs: [{ name: 'Kleidung', entries: Object.entries(CLOTHES).filter(([, c]) => !c.special).map(([id, c]) => ['cloth', id, c.price]) }],
  },
};
