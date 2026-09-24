// Die Welt: 180×180 Kacheln, fest designt (mit etwas Rauschen für natürliche Ränder).
// Reine Logik – keine DOM-Abhängigkeit, damit sie in node --test geprüft werden kann.
import { rngFor, fbm, noise2, hash2, clamp } from './util.js';

export const TILE = 48;
export const WW = 180;
export const WH = 180;

// Bodenarten
export const G = {
  GRASS: 0, FOREST: 1, PATH: 2, SAND: 3, DEEP: 4, SHALLOW: 5, MEADOW: 6, SOIL: 7,
  PLAZA: 8, ALPINE: 9, CLIFF: 10, BRIDGE: 11, DOCK: 12, SEA: 13, WETSAND: 14, FLOWERBED: 15,
};

// Kollisionsarten
export const COL = { FREE: 0, SOLID: 1, WATER: 2, FORD: 3, LOW: 4 };

// Gebiete
export const REG = { FARM: 0, VILLAGE: 1, MEADOW: 2, FOREST: 3, LAKE: 4, BEACH: 5, MOUNTAIN: 6 };
export const REGIONS = [
  { id: 'farm', name: 'Ponyhof', map: '#f6c99a' },
  { id: 'village', name: 'Dorf Kleeberg', map: '#f3b6c4' },
  { id: 'meadow', name: 'Blumenwiesen', map: '#c9e59a' },
  { id: 'forest', name: 'Flüsterwald', map: '#7fbf7a' },
  { id: 'lake', name: 'Glitzersee', map: '#9fd8ec' },
  { id: 'beach', name: 'Sonnenstrand', map: '#f7e3a8' },
  { id: 'mountain', name: 'Wolkenberge', map: '#c7c3d8' },
];

// ---------- Feste Orte ----------
export const FARM = {
  house: { x: 68, y: 82, w: 6, h: 5, door: { x: 70.5, y: 87.4 } },
  stable: { x: 77, y: 82, w: 8, h: 5, door: { x: 81, y: 87.4 } },
  garden: { x: 91, y: 81, w: 8, h: 6, soil: { x: 92, y: 82, w: 6, h: 4 } },
  paddockSmall: { x: 66, y: 93, w: 17, h: 12, gates: [[73, 93], [74, 93]] },
  paddockBig: { x: 66, y: 93, w: 31, h: 14, gates: [[73, 93], [74, 93], [89, 93], [90, 93]] },
  flowerGarden: { x: 100, y: 93, w: 7, h: 12 },
  festival: { x: 70, y: 110, w: 31, h: 12 },
  hill: { x: 86, y: 128, r: 4.5 },
  gate: { x: 107, y: 87, h: 5 },
  spawn: { x: 88.5, y: 89.5 },
};

export const VILLAGE = {
  plaza: { x: 132, y: 96, r: 7 },
  buildings: [
    { type: 'shop', x: 118, y: 84, w: 6, h: 5, door: { x: 120.5, y: 89.3 } },
    { type: 'bakery', x: 128, y: 82, w: 6, h: 5, door: { x: 130.5, y: 87.3 } },
    { type: 'tailor', x: 138, y: 84, w: 6, h: 5, door: { x: 140.5, y: 89.3 } },
    { type: 'post', x: 142, y: 93, w: 6, h: 5, door: { x: 144.5, y: 98.3 } },
    { type: 'house_mia', x: 118, y: 104, w: 5, h: 4, door: { x: 120.5, y: 108.3 } },
    { type: 'house_ben', x: 138, y: 104, w: 5, h: 4, door: { x: 140.5, y: 108.3 } },
    { type: 'house_a', x: 150, y: 84, w: 5, h: 4, door: { x: 152.5, y: 88.3 } },
    { type: 'house_b', x: 151, y: 104, w: 5, h: 4, door: { x: 153.5, y: 108.3 } },
    { type: 'house_c', x: 111, y: 99, w: 4, h: 4, door: { x: 112.5, y: 103.3 } },
  ],
};

export const SPOTS = {
  npc: {
    hilde: { x: 72.5, y: 88.6 },
    theo: { x: 121.5, y: 90.2 },
    berta: { x: 131.5, y: 88.2 },
    luise: { x: 141.5, y: 90.2 },
    paula: { x: 145.5, y: 99.4 },
    mia: { x: 121.5, y: 110.5 },
    ben: { x: 139.5, y: 110.5 },
    kuno: { x: 162.5, y: 157.5 },
  },
  kitten: { x: 21.5, y: 73.5 },
  picnic: { x: 41.5, y: 146.5 },
  telescope: { x: 106.5, y: 6.6 },
  lookout: { x: 106.5, y: 8.5 },
  parcoursBoard: { x: 88.5, y: 66.5 },
  lighthouse: { x: 164, y: 160, w: 3, h: 3 },
  hillTop: { x: 86.5, y: 127.5 },
  festivalCenter: { x: 85.5, y: 116 },
  wildHorses: {
    kleeblatt: { x: 112.5, y: 64.5 },
    schoko: { x: 42.5, y: 66.5 },
    perle: { x: 66.5, y: 148.5 },
    sandy: { x: 116.5, y: 158.5 },
    tupfen: { x: 155.5, y: 68.5 },
    mondschein: { x: 14.5, y: 100.5 },
    nebel: { x: 146.5, y: 14.5 },
  },
  herd: [{ x: 138.5, y: 12.5 }, { x: 152.5, y: 20.5 }, { x: 141.5, y: 21.5 }, { x: 156.5, y: 11.5 }],
};

// Rennstrecken (Wegpunkte in Kacheln). Gegner folgen den Punkten geradlinig.
export const TRACKS = {
  race1: [[131, 78], [127, 66], [114, 58], [98, 57], [104, 68], [118, 72], [131, 78]],
  race2: [[131, 120], [128, 134], [124, 150], [140, 157], [156, 155], [146, 142], [136, 130], [131, 120]],
  race3: [[96, 76], [95, 58], [80, 56], [62, 55], [50, 55], [40, 53], [30, 50], [24, 58], [22, 66], [27, 78], [34, 88], [40, 92], [50, 94], [60, 92], [65, 89], [88, 89], [88, 80], [96, 76]],
  finale: [[80, 114], [96, 116], [98, 104], [98, 90], [88, 89], [88, 80], [90, 70], [95, 58], [114, 58], [126, 66], [120, 76], [114, 91], [107, 89], [98, 90], [98, 108], [84, 114]],
  parcours: [[84, 63], [75, 63], [69, 63], [69, 69], [75, 71], [81, 71], [85, 71]],
};

export const PARCOURS = {
  arena: { x: 66, y: 61, w: 21, h: 12 },
  hurdles: [
    [[78, 62], [78, 63], [78, 64]],
    [[72, 62], [72, 63], [72, 64]],
    [[68, 66], [69, 66], [70, 66]],
    [[72, 70], [72, 71], [72, 72]],
    [[78, 70], [78, 71], [78, 72]],
  ],
};

const PATHS = [
  // [Punkte, Radius]
  [[[107, 89], [114, 92], [120, 95], [126, 96]], 1.1], // Hof -> Dorf
  [[[88, 88], [88, 80], [90, 70], [95, 58], [100, 48], [100, 40]], 1.1], // Hof -> Norden
  [[[100, 40], [100, 38], [92, 36], [110, 33.2], [93, 30.6], [104, 28], [106, 24]], 1.25], // Serpentinen
  [[[106, 24], [106, 9]], 1.0], // zum Aussichtspunkt
  [[[106, 20], [120, 17], [134, 15]], 1.0], // zur Wildpferdewiese
  [[[106, 20], [92, 18], [80, 17]], 1.0], // zur Alpakaweide
  [[[64, 89], [60, 92], [50, 94], [40, 92], [34, 88], [27, 78]], 1.1], // Hof -> Wald
  [[[27, 78], [22, 66], [24, 58], [30, 50], [40, 53], [50, 55], [62, 55], [80, 56], [95, 58]], 1.05], // Waldrunde -> Wiese
  [[[40, 92], [34, 104], [24, 118], [20, 130], [19, 140], [19.5, 147]], 1.05], // Wald -> See (Furt)
  [[[34, 104], [22, 102], [15, 100]], 0.9], // zur Mondschein-Lichtung
  [[[63, 90], [62, 104], [63, 118], [62, 130], [60, 138], [58, 141.5]], 1.05], // Hof -> Steg
  [[[98, 90], [98, 109], [90, 110], [86, 122], [86.5, 126]], 1.0], // Hof -> Hügel
  [[[87, 130], [92, 140], [98, 152]], 1.0], // Hügel -> Strand
  [[[132, 103], [131, 118], [128, 134], [124, 150]], 1.1], // Dorf -> Strand
  [[[132, 89], [131, 78], [126, 66], [114, 58], [95, 58]], 1.05], // Dorf -> Wiese
  [[[60, 138], [68, 146], [74, 154]], 1.0], // See -> Strand
  [[[42, 66], [36, 70], [27, 78]], 0.8], // Schoko-Lichtung
];

const CLEARINGS = [
  { x: 26, y: 76, r: 6 }, { x: 30, y: 50, r: 5 }, { x: 14, y: 100, r: 5 }, { x: 42, y: 66, r: 4.2 },
  { x: 24, y: 118, r: 3.5 }, { x: 46, y: 106, r: 3 },
];

const SIGNS = [
  { x: 105, y: 91, lines: [['→', 'Dorf Kleeberg'], ['↑', 'Blumenwiesen'], ['↓', 'Sonnenstrand']] },
  { x: 90, y: 77, lines: [['↑', 'Wolkenberge'], ['←', 'Flüsterwald'], ['↓', 'Ponyhof']] },
  { x: 66, y: 87, lines: [['←', 'Flüsterwald'], ['↓', 'Glitzersee'], ['→', 'Ponyhof']] },
  { x: 125, y: 92, lines: [['←', 'Ponyhof'], ['↑', 'Blumenwiesen'], ['↓', 'Sonnenstrand']] },
  { x: 134, y: 120, lines: [['↑', 'Dorf Kleeberg'], ['↓', 'Sonnenstrand'], ['→', 'Leuchtturm']] },
  { x: 102, y: 42, lines: [['↑', 'Wolkenberge'], ['↓', 'Blumenwiesen']] },
  { x: 108, y: 22, lines: [['↑', 'Aussichtspunkt'], ['→', 'Wildpferdewiese'], ['←', 'Alpakaweide']] },
  { x: 38, y: 95, lines: [['↓', 'Glitzersee'], ['↑', 'Waldlichtungen'], ['→', 'Ponyhof']] },
  { x: 64, y: 136, lines: [['←', 'Steg'], ['↓', 'Sonnenstrand'], ['↑', 'Ponyhof']] },
  { x: 21, y: 142, lines: [['→', 'Furt zur Insel (nur zu Pferd)'], ['↑', 'Flüsterwald']] },
  { x: 63, y: 57, lines: [['←', 'Flüsterwald'], ['→', 'Blumenwiesen'], ['↓', 'Furt (nur zu Pferd)']] },
];

// 30 goldene Hufeisen – gut versteckt
export const HORSESHOES = [
  [64, 80], [104, 81], [99, 125], [72, 120], // Hof
  [113, 84], [155, 90], [149, 111], [127, 101], // Dorf
  [66, 47], [128, 45], [84, 67], [158, 58], // Wiesen
  [8, 44], [22, 71], [4, 110], [48, 86], [16, 90], // Wald
  [40, 147], [51, 141.5], [30, 160], [58, 157], // See
  [168, 160], [110, 164], [80, 162], [146, 164], // Strand
  [106, 5], [60, 14], [162, 8], [124, 26], [98, 31], // Berge
];

// ---------- Aufbau ----------
function makeGrid() { return new Uint8Array(WW * WH); }

export function coastY(x) { return 166.5 + 2.2 * Math.sin(x * 0.07) + 2.5 * (fbm(x * 0.08, 3.3, 11) - 0.5); }
export function coastX(y) { return 171.5 + 1.8 * Math.sin(y * 0.09 + 1) + 2.5 * (fbm(4.1, y * 0.08, 12) - 0.5); }
export function mountainEdge(x) { return 38.5 + 2.2 * (fbm(x * 0.07, 1.7, 13) - 0.5) * 2; }

const LAKE = { x: 40, y: 146, rx: 18, ry: 12 };
const ISLAND = { x: 40, y: 147, r: 4.6 };
const RIVER = [[64, 22], [64, 30], [63.5, 37], [62, 46], [58.5, 58], [60, 70], [57, 82], [58, 94], [55, 106], [52, 118], [49, 134]];

function lakeD(x, y) {
  const dx = (x + 0.5 - LAKE.x) / LAKE.rx, dy = (y + 0.5 - LAKE.y) / LAKE.ry;
  return dx * dx + dy * dy + (noise2(x * 0.18, y * 0.18, 21) - 0.5) * 0.28;
}

function stampLine(pts, r, fn) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(len / 0.25));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, cx = ax + (bx - ax) * t, cy = ay + (by - ay) * t;
      const r2 = r * r;
      for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
        for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
          const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
          if (dx * dx + dy * dy <= r2) fn(x, y);
        }
      }
    }
  }
}

function inB(x, y) { return x >= 0 && y >= 0 && x < WW && y < WH; }

export function defaultFarm() {
  return { stable: false, paddock: false, flowerGarden: false, festival: false };
}

export class World {
  constructor(farm = defaultFarm()) {
    this.farm = { ...defaultFarm(), ...farm };
    this.ground = makeGrid();
    this.coll = makeGrid();
    this.region = makeGrid();
    this.keep = makeGrid(); // reservierte Flächen: keine Vegetation
    this.dyn = makeGrid(); // dynamische Hindernisse (Deko)
    this.objects = [];
    this.pickups = [];
    this.appleTrees = [];
    this.signs = [];
    this.lights = [];
    this.hills = [FARM.hill];
    this.build();
  }

  idx(x, y) { return y * WW + x; }
  g(x, y) { return inB(x, y) ? this.ground[y * WW + x] : G.CLIFF; }
  setG(x, y, v) { if (inB(x, y)) this.ground[y * WW + x] = v; }
  regionAt(x, y) {
    const tx = clamp(Math.floor(x), 0, WW - 1), ty = clamp(Math.floor(y), 0, WH - 1);
    return this.region[ty * WW + tx];
  }
  reserve(x, y) { x = Math.floor(x); y = Math.floor(y); if (inB(x, y)) this.keep[y * WW + x] = 1; }
  reserveRect(x, y, w, h, m = 0) {
    for (let j = y - m; j < y + h + m; j++) for (let i = x - m; i < x + w + m; i++) this.reserve(i, j);
  }

  build() {
    this.buildRegions();
    this.buildTerrain();
    this.buildWater();
    this.buildPaths();
    this.buildFarm();
    this.buildVillage();
    this.buildSpecials();
    this.buildVegetation();
    this.buildPickups();
    this.buildCollision();
  }

  buildRegions() {
    for (let y = 0; y < WH; y++) {
      for (let x = 0; x < WW; x++) {
        let r;
        const cy = coastY(x), cx = coastX(y);
        const ld = (() => { const dx = (x - LAKE.x) / (LAKE.rx + 9), dy = (y - LAKE.y) / (LAKE.ry + 8); return dx * dx + dy * dy; })();
        if (y < mountainEdge(x) + 0.5) r = REG.MOUNTAIN;
        else if (ld < 1) r = REG.LAKE;
        else if (x >= 64 && (y > cy - 13 || (y > 118 && x > cx - 10))) r = REG.BEACH;
        else if (x < 59 + 2 * Math.sin(y * 0.1)) r = y > 132 ? REG.LAKE : REG.FOREST;
        else if (x >= 108 && y >= 76) r = REG.VILLAGE;
        else if (x >= 59 && x < 108 && y >= 78) r = REG.FARM;
        else r = REG.MEADOW;
        this.region[y * WW + x] = r;
      }
    }
  }

  buildTerrain() {
    for (let y = 0; y < WH; y++) {
      for (let x = 0; x < WW; x++) {
        const r = this.region[y * WW + x];
        let g = G.GRASS;
        if (r === REG.FOREST) g = G.FOREST;
        else if (r === REG.MEADOW) g = G.MEADOW;
        else if (r === REG.MOUNTAIN) {
          const edge = mountainEdge(x);
          const sideL = 46 + 3 * (noise2(1, y * 0.2, 5) - 0.5), sideR = 168 + 3 * (noise2(2, y * 0.2, 5) - 0.5);
          if (y < 3 || x < sideL || x > sideR) g = G.CLIFF;
          else if (y >= edge - 9.5) g = G.CLIFF;
          else g = G.ALPINE;
        }
        // Meer und Strand
        const cy = coastY(x), cx = coastX(y);
        if (r !== REG.MOUNTAIN) {
          if (y > cy || (x > cx && y > 40)) g = G.SEA;
          else if (y > cy - 1.2 || (x > cx - 1.2 && y > 40)) g = G.WETSAND;
          else if (y > cy - 7 || (x > cx - 6.5 && y > 44)) g = G.SAND;
        } else if (x > cx + 1 && g !== G.CLIFF) g = G.CLIFF;
        this.ground[y * WW + x] = g;
      }
    }
    // Waldrand im Westen undurchdringlich
    for (let y = 0; y < WH; y++) for (let x = 0; x < 2; x++) if (this.g(x, y) !== G.SEA) this.setG(x, y, G.CLIFF);
    // Leuchtturm-Landzunge
    for (let y = 154; y < 170; y++) for (let x = 156; x < 176; x++) {
      const d = Math.hypot(x + 0.5 - 165, y + 0.5 - 161);
      if (d < 4.2) this.setG(x, y, G.SAND);
      else if (d < 5.2 && this.g(x, y) === G.SEA) this.setG(x, y, G.WETSAND);
    }
    // Lichtungen im Wald
    for (const c of CLEARINGS) {
      for (let y = Math.floor(c.y - c.r - 1); y <= c.y + c.r + 1; y++) for (let x = Math.floor(c.x - c.r - 1); x <= c.x + c.r + 1; x++) {
        const d = Math.hypot(x + 0.5 - c.x, y + 0.5 - c.y) + (noise2(x * 0.5, y * 0.5, 9) - 0.5) * 1.2;
        if (d < c.r) { this.setG(x, y, G.GRASS); this.reserve(x, y); }
      }
    }
    // Bergteich (Quelle des Flusses)
    for (let y = 18; y < 28; y++) for (let x = 58; x < 70; x++) {
      if (Math.hypot(x + 0.5 - 64, (y + 0.5 - 22) * 1.2) < 3) this.setG(x, y, G.DEEP);
    }
  }

  buildWater() {
    // See
    for (let y = LAKE.y - LAKE.ry - 4; y < LAKE.y + LAKE.ry + 4; y++) {
      for (let x = LAKE.x - LAKE.rx - 4; x < LAKE.x + LAKE.rx + 4; x++) {
        const d = lakeD(x, y);
        if (d < 0.8) this.setG(x, y, G.DEEP);
        else if (d < 1) this.setG(x, y, G.SHALLOW);
        else if (d < 1.22 && this.g(x, y) !== G.SEA) this.setG(x, y, G.SAND);
      }
    }
    // Insel
    for (let y = ISLAND.y - 7; y < ISLAND.y + 7; y++) for (let x = ISLAND.x - 7; x < ISLAND.x + 7; x++) {
      const d = Math.hypot(x + 0.5 - ISLAND.x, y + 0.5 - ISLAND.y);
      if (d < ISLAND.r - 1.1) this.setG(x, y, G.GRASS);
      else if (d < ISLAND.r) this.setG(x, y, G.SAND);
      else if (d < ISLAND.r + 1.2) this.setG(x, y, G.SHALLOW);
    }
    // Furt zur Insel (nur zu Pferd)
    for (let y = 146; y <= 148; y++) for (let x = 19; x < 37; x++) {
      const g = this.g(x, y);
      if (g === G.DEEP || g === G.SHALLOW) this.setG(x, y, G.SHALLOW);
    }
    // Fluss
    stampLine(RIVER, 1.55, (x, y) => {
      const g = this.g(x, y);
      if (g !== G.SEA) this.setG(x, y, G.DEEP);
    });
    // Furt über den Fluss
    for (let y = 69; y <= 72; y++) for (let x = 55; x <= 64; x++) if (this.g(x, y) === G.DEEP) this.setG(x, y, G.SHALLOW);
    stampLine([[52, 70.5], [66, 70.5]], 1.4, (x, y) => this.reserve(x, y));
    // Steg
    for (let x = 50; x <= 58; x++) for (let y = 141; y <= 142; y++) this.setG(x, y, G.DOCK);
  }

  buildPaths() {
    for (const [pts, r] of PATHS) {
      stampLine(pts, r, (x, y) => {
        const g = this.g(x, y);
        if (g === G.DEEP) this.setG(x, y, G.BRIDGE);
        else if (g === G.SHALLOW || g === G.SEA || g === G.DOCK || g === G.BRIDGE) return;
        else this.setG(x, y, G.PATH);
      });
      stampLine(pts, r + 1.6, (x, y) => this.reserve(x, y));
    }
    // Brücken sauber machen: Brückenkacheln immer mindestens 2 breit
    // Rennstrecken freihalten
    for (const k of Object.keys(TRACKS)) stampLine(TRACKS[k], 1.8, (x, y) => this.reserve(x, y));
    // Hofplatz
    for (let y = 88; y <= 90; y++) for (let x = 63; x <= 107; x++) this.setG(x, y, G.PATH);
    this.reserveRect(60, 86, 50, 6);
  }

  buildFarm() {
    const F = FARM, f = this.farm;
    this.reserveRect(60, 78, 49, 52);
    // Gebäude
    this.addBuilding({ type: 'house', ...F.house });
    this.addBuilding({ type: f.stable ? 'stable' : 'stable_old', ...F.stable });
    // Gemüsegarten
    const s = F.garden.soil;
    this.gardenPlots = [];
    for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) {
      this.setG(x, y, G.SOIL);
      this.gardenPlots.push({ x, y });
    }
    this.fenceRect(F.garden.x, F.garden.y, F.garden.w, F.garden.h, [[94, 86], [95, 86]], 'fence');
    // Heuballen & Tränke
    this.addObj({ k: 'hay', x: 86, y: 84 }, true);
    this.addObj({ k: 'hay', x: 86, y: 85 }, true);
    this.addObj({ k: 'barrel', x: 76, y: 86 }, true);
    this.addObj({ k: 'mailbox', x: 66, y: 87 }, true);
    // Koppel
    const P = f.paddock ? F.paddockBig : F.paddockSmall;
    this.paddock = { x: P.x + 1, y: P.y + 1, w: P.w - 2, h: P.h - 2 };
    this.fenceRect(P.x, P.y, P.w, P.h, P.gates, 'fence');
    this.addObj({ k: 'trough', x: P.x + 3, y: P.y + P.h - 3 }, true);
    this.addObj({ k: 'hayrack', x: P.x + P.w - 4, y: P.y + 2 }, true);
    // Blumengarten
    const B = F.flowerGarden;
    if (f.flowerGarden) {
      for (let y = B.y; y < B.y + B.h; y++) for (let x = B.x; x < B.x + B.w; x++) {
        const inBed = (x === B.x || x === B.x + B.w - 1 || y === B.y + 3 || y === B.y + 8) && !(x === B.x + 3);
        if (inBed) this.setG(x, y, G.FLOWERBED);
      }
      this.addObj({ k: 'arch', x: B.x + 3, y: B.y + B.h - 1 }, false);
      this.addObj({ k: 'bench', x: B.x + 5, y: B.y + 5 }, true);
      this.addObj({ k: 'birdbath', x: B.x + 3, y: B.y + 5 }, true);
      this.lights.push({ x: B.x + 1.5, y: B.y + 6, r: 3.5, c: '#ffd9a0' });
      this.addObj({ k: 'lamp', x: B.x + 1, y: B.y + 6 }, true);
    } else {
      const r = rngFor('flowergarden-weeds');
      for (let i = 0; i < 9; i++) {
        const x = B.x + 1 + Math.floor(r() * (B.w - 2)), y = B.y + 1 + Math.floor(r() * (B.h - 2));
        if (x !== B.x + 3) this.addObj({ k: 'weed', x, y }, false);
      }
    }
    // Festwiese
    const FW = F.festival;
    if (f.festival) {
      this.addObj({ k: 'festarch', x: FW.x + 2, y: FW.y + 1 }, false);
      this.addObj({ k: 'festarch', x: FW.x + FW.w - 3, y: FW.y + 1 }, false);
      this.addObj({ k: 'bunting', x: FW.x + 4, y: FW.y + 3, w: FW.w - 8 }, false);
      this.addObj({ k: 'bunting', x: FW.x + 4, y: FW.y + 9, w: FW.w - 8 }, false);
      this.addObj({ k: 'table', x: FW.x + 6, y: FW.y + 10 }, true);
      this.addObj({ k: 'table', x: FW.x + 24, y: FW.y + 10 }, true);
      this.addObj({ k: 'stage', x: FW.x + 14, y: FW.y + 5 }, false);
      for (let i = 0; i < 6; i++) this.lights.push({ x: FW.x + 5 + i * 4.5, y: FW.y + 3.2, r: 2.6, c: i % 2 ? '#ffb3c8' : '#ffe39a' });
    }
    // Hoftor mit Namensschild
    this.addObj({ k: 'gatepost', x: F.gate.x, y: 86 }, true);
    this.addObj({ k: 'gatepost', x: F.gate.x, y: 92 }, true);
    this.addObj({ k: 'farmgate', x: F.gate.x, y: 91.9 }, false);
    // Laternen auf dem Hof
    for (const [lx, ly] of [[67, 91], [76, 91], [86, 91], [99, 91]]) {
      this.addObj({ k: 'lamp', x: lx, y: ly }, true);
      this.lights.push({ x: lx + 0.5, y: ly, r: 4, c: '#ffe1a8' });
    }
    // Apfelbäume auf dem Hof
    for (const [ax, ay] of [[64, 83], [101, 83], [104, 85], [62, 80]]) this.addAppleTree(ax, ay);
    // Großer Baum auf dem Hügel
    this.addObj({ k: 'tree', v: 'bigblossom', x: F.hill.x + 2, y: F.hill.y - 1 }, true);
  }

  buildVillage() {
    const V = VILLAGE;
    this.reserveRect(108, 78, 50, 40);
    for (let y = V.plaza.y - 9; y <= V.plaza.y + 9; y++) for (let x = V.plaza.x - 9; x <= V.plaza.x + 9; x++) {
      if (Math.hypot(x + 0.5 - V.plaza.x, y + 0.5 - V.plaza.y) < V.plaza.r) this.setG(x, y, G.PLAZA);
    }
    for (const b of V.buildings) {
      this.addBuilding({ ...b });
      // Weg zur Tür
      stampLine([[b.door.x, b.door.y + 0.5], [V.plaza.x + 0.5, V.plaza.y + 0.5]], 0.75, (x, y) => {
        const g = this.g(x, y);
        if (g === G.GRASS || g === G.PATH) this.setG(x, y, G.PLAZA);
      });
    }
    this.addObj({ k: 'fountain', x: V.plaza.x - 1, y: V.plaza.y - 1, w: 3, h: 3 }, true, 3, 3);
    this.lights.push({ x: V.plaza.x + 0.5, y: V.plaza.y + 0.5, r: 3, c: '#bfe8ff' });
    for (const [lx, ly] of [[126, 91], [138, 91], [126, 101], [138, 101], [132, 108], [114, 94], [132, 80]]) {
      this.addObj({ k: 'lamp', x: lx, y: ly }, true);
      this.lights.push({ x: lx + 0.5, y: ly, r: 4.2, c: '#ffe1a8' });
    }
    // Marktstände und Blumenkästen
    this.addObj({ k: 'stall', x: 126, y: 99, c: '#ff9fb8' }, true, 2, 1);
    this.addObj({ k: 'stall', x: 136, y: 99, c: '#8fd3f0' }, true, 2, 1);
    for (const [bx, by] of [[124, 89], [134, 87], [144, 89], [148, 98], [123, 108], [143, 108]]) this.addObj({ k: 'flowerbox', x: bx, y: by }, true);
    this.addObj({ k: 'bench', x: 128, y: 102 }, true);
    this.addObj({ k: 'bench', x: 135, y: 90 }, true);
    for (const [ax, ay] of [[112, 108], [148, 80], [156, 96]]) this.addAppleTree(ax, ay);
    // Zäunchen um die Gärten
    this.fenceRect(116, 103, 9, 7, [[120, 109], [121, 109]], 'picket');
    this.fenceRect(136, 103, 9, 7, [[140, 109], [141, 109]], 'picket');
  }

  buildSpecials() {
    // Leuchtturm
    const L = SPOTS.lighthouse;
    this.addBuilding({ type: 'lighthouse', x: L.x, y: L.y, w: L.w, h: L.h, door: { x: L.x + 1.5, y: L.y + L.h + 0.3 } });
    this.lights.push({ x: L.x + 1.5, y: L.y - 3, r: 7, c: '#fff2b8', beam: true });
    this.addObj({ k: 'hut', x: 157, y: 152 }, true, 3, 2);
    for (const [rx, ry] of [[160, 163], [170, 157], [150, 163]]) this.addObj({ k: 'rock', v: 1, x: rx, y: ry }, true);
    // Aussichtspunkt
    for (let y = 4; y <= 9; y++) for (let x = 103; x <= 110; x++) this.setG(x, y, G.DOCK);
    for (let x = 103; x <= 110; x++) this.addObj({ k: 'rail', x, y: 3 }, true);
    this.addObj({ k: 'telescope', x: 106, y: 5 }, true);
    this.addObj({ k: 'bench', x: 108, y: 7 }, true);
    this.reserveRect(100, 2, 14, 10);
    // Parcoursplatz
    const A = PARCOURS.arena;
    this.reserveRect(A.x - 1, A.y - 1, A.w + 3, A.h + 3);
    this.fenceRect(A.x, A.y, A.w, A.h, [[86, 62], [86, 63], [86, 64], [86, 65], [86, 66], [86, 67], [86, 68], [86, 69], [86, 70], [86, 71]], 'white');
    for (const h of PARCOURS.hurdles) for (const [hx, hy] of h) this.addObj({ k: 'hurdle', x: hx, y: hy }, 'low');
    this.addObj({ k: 'board', x: 88, y: 65 }, true);
    // Steg-Laterne & Pfosten
    this.addObj({ k: 'lamp', x: 58, y: 140 }, true);
    this.lights.push({ x: 58.5, y: 140, r: 4, c: '#ffe1a8' });
    // Hohler Baumstamm (Krümels Versteck)
    this.addObj({ k: 'log', x: 20, y: 73 }, true, 2, 1);
    // Alpaka-Weide: Hütte
    this.addObj({ k: 'shelter', x: 74, y: 12 }, true, 3, 2);
    // Wegweiser
    for (const s of SIGNS) {
      this.addObj({ k: 'sign', x: s.x, y: s.y, lines: s.lines }, true);
      this.signs.push(s);
    }
    // Brücken markieren (für Geländer)
  }

  addAppleTree(x, y) {
    const id = 'apple_' + this.appleTrees.length;
    const o = { k: 'tree', v: 'apple', x, y, id };
    this.appleTrees.push(o);
    this.addObj(o, true);
    this.reserveRect(x - 1, y - 1, 3, 3);
  }

  addBuilding(b) {
    const o = { k: 'bld', ...b };
    this.objects.push(o);
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) this.pushBlock(x, y, COL.SOLID);
    this.reserveRect(b.x, b.y - 3, b.w, b.h + 3, 1);
    if (b.door) this.reserveRect(Math.floor(b.door.x) - 1, Math.floor(b.door.y), 3, 2);
  }

  get blockList() { return this._bl || (this._bl = []); }
  get blockSet() { return this._bs || (this._bs = new Set()); }
  pushBlock(x, y, c) { this.blockList.push([x, y, c]); this.blockSet.add(y * WW + x); }

  addObj(o, block, w = 1, h = 1) {
    this.objects.push(o);
    if (block === 'low') this.pushBlock(o.x, o.y, COL.LOW);
    else if (block) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pushBlock(Math.floor(o.x) + i, Math.floor(o.y) + j, COL.SOLID);
    this.reserve(o.x, o.y);
  }

  fenceRect(x0, y0, w, h, gates = [], style = 'fence') {
    const gateSet = new Set(gates.map(([gx, gy]) => gx + ',' + gy));
    this.fences = this.fences || new Map();
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const edge = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1;
      if (!edge || gateSet.has(x + ',' + y)) continue;
      const key = y * WW + x;
      if (this.fences.has(key)) continue;
      this.fences.set(key, style);
      const o = { k: 'fence', x, y, style };
      this.objects.push(o);
      this.pushBlock(x, y, COL.LOW);
      this.reserve(x, y);
    }
  }
  isFence(x, y) { return this.fences && this.fences.has(y * WW + x); }

  canPlant(x, y) {
    const i = y * WW + x;
    return inB(x, y) && !this.keep[i] && !this.blockAt(x, y);
  }
  blockAt(x, y) { return this.blockSet.has(y * WW + x); }

  buildVegetation() {
    const r = rngFor('vegetation');
    const place = (x, y, o) => {
      if (!this.canPlant(x, y)) return false;
      this.addObj({ ...o, x, y }, true);
      // Umgebung ein wenig freihalten, damit Wege zwischen Bäumen bleiben
      return true;
    };
    for (let y = 1; y < WH - 1; y++) {
      for (let x = 1; x < WW - 1; x++) {
        const g = this.g(x, y), reg = this.region[y * WW + x];
        const n = fbm(x * 0.09, y * 0.09, 33);
        const h = hash2(x, y, 77);
        if (g === G.FOREST) {
          // dichter Wald, aber ein Schachbrett-artiges Raster sorgt für Lücken
          const dens = 0.18 + n * 0.5;
          if ((x + (y % 2)) % 2 === 0 && h < dens) {
            const v = hash2(x, y, 5) < 0.62 ? 'oak' : hash2(x, y, 6) < 0.6 ? 'pine' : 'birch';
            place(x, y, { k: 'tree', v, s: 0.85 + hash2(x, y, 8) * 0.35 });
          } else if (h > 0.985) place(x, y, { k: 'bush', v: hash2(x, y, 9) < 0.5 ? 0 : 1 });
          else if (h > 0.975 && h <= 0.985) place(x, y, { k: 'stump' });
        } else if (g === G.ALPINE) {
          if (h < 0.045 + n * 0.05) place(x, y, { k: 'tree', v: 'pine', s: 0.8 + hash2(x, y, 8) * 0.4 });
          else if (h > 0.975) place(x, y, { k: 'rock', v: hash2(x, y, 2) < 0.5 ? 0 : 1 });
        } else if (g === G.MEADOW) {
          if (h < 0.012 + (n > 0.6 ? 0.02 : 0)) place(x, y, { k: 'tree', v: hash2(x, y, 3) < 0.5 ? 'blossom' : 'oak', s: 0.9 + hash2(x, y, 8) * 0.3 });
          else if (h > 0.992) place(x, y, { k: 'bush', v: 1 });
        } else if (g === G.GRASS) {
          const dense = reg === REG.LAKE ? 0.04 : reg === REG.BEACH ? 0.006 : reg === REG.VILLAGE ? 0.012 : 0.014;
          if (h < dense) place(x, y, { k: 'tree', v: reg === REG.LAKE ? (hash2(x, y, 4) < 0.5 ? 'birch' : 'oak') : (hash2(x, y, 4) < 0.3 ? 'blossom' : 'oak'), s: 0.9 + hash2(x, y, 8) * 0.3 });
          else if (h > 0.993) place(x, y, { k: 'bush', v: 0 });
        } else if (g === G.SAND && reg === REG.BEACH) {
          if (h < 0.012 && this.g(x, y + 2) === G.SAND) place(x, y, { k: 'tree', v: 'palm', s: 0.9 + hash2(x, y, 8) * 0.25 });
          else if (h > 0.994) place(x, y, { k: 'rock', v: 0 });
        }
      }
    }
    // Baum auf der Insel
    this.addObj({ k: 'tree', v: 'blossom', x: 38, y: 145, s: 1.1 }, true);
    // Meadow: Apfelbäume
    for (const [ax, ay] of [[104, 50], [118, 66], [76, 50], [140, 60], [88, 45], [58, 110]]) {
      if (this.canPlant(ax, ay) || true) this.addAppleTree(ax, ay);
    }
    void r;
  }

  buildPickups() {
    const add = (k, x, y) => { this.pickups.push({ id: `${k}_${this.pickups.filter((p) => p.k === k).length}`, k, x: x + 0.5, y: y + 0.5 }); };
    const free = (x, y) => {
      if (!inB(x, y) || this.blockAt(x, y)) return false;
      const g = this.g(x, y);
      return g !== G.DEEP && g !== G.SHALLOW && g !== G.SEA && g !== G.CLIFF;
    };
    const taken = new Set();
    const tryAdd = (k, x, y) => {
      const key = y * WW + x;
      if (!free(x, y) || taken.has(key)) return false;
      taken.add(key); add(k, x, y); return true;
    };
    // Lavendelfeld (Reihen)
    for (let y = 44; y <= 52; y += 2) for (let x = 66; x <= 80; x += 3) tryAdd('lavender', x + (y % 4 === 0 ? 1 : 0), y);
    // Sonnenblumenfeld
    for (let y = 43; y <= 51; y += 2) for (let x = 118; x <= 132; x += 3) tryAdd('sunflower', x, y);
    // Mohn & Gänseblümchen verstreut
    const r = rngFor('pickups');
    let n = 0, guard = 0;
    while (n < 36 && guard++ < 3000) {
      const x = 60 + Math.floor(r() * 108), y = 40 + Math.floor(r() * 36);
      if (this.region[y * WW + x] === REG.MEADOW && this.g(x, y) === G.MEADOW && tryAdd('poppy', x, y)) n++;
    }
    n = 0; guard = 0;
    while (n < 26 && guard++ < 3000) {
      const x = 60 + Math.floor(r() * 110), y = 40 + Math.floor(r() * 90);
      const reg = this.region[y * WW + x];
      if ((reg === REG.FARM || reg === REG.MEADOW || reg === REG.VILLAGE) && (this.g(x, y) === G.GRASS || this.g(x, y) === G.MEADOW) && !this.keep[y * WW + x] && tryAdd('daisy', x, y)) n++;
    }
    // Pilze im Wald (in Wegnähe)
    n = 0; guard = 0;
    while (n < 30 && guard++ < 6000) {
      const x = 3 + Math.floor(r() * 54), y = 40 + Math.floor(r() * 84);
      if (this.region[y * WW + x] === REG.FOREST && this.g(x, y) === G.FOREST && this.nearPath(x, y, 3) && tryAdd('mushroom', x, y)) n++;
    }
    // Muscheln am Strand
    n = 0; guard = 0;
    while (n < 28 && guard++ < 6000) {
      const x = 66 + Math.floor(r() * 110), y = 120 + Math.floor(r() * 55);
      const g = this.g(x, y);
      if ((g === G.SAND || g === G.WETSAND) && this.region[y * WW + x] === REG.BEACH && tryAdd('shell', x, y)) n++;
    }
    // Hufeisen
    HORSESHOES.forEach(([hx, hy], i) => {
      let [x, y] = [Math.floor(hx), Math.floor(hy)];
      // falls blockiert: nächstes freies Feld
      if (!free(x, y)) {
        outer: for (let rad = 1; rad < 5; rad++) for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
          if (free(x + dx, y + dy)) { x += dx; y += dy; break outer; }
        }
      }
      this.pickups.push({ id: 'hs_' + i, k: 'horseshoe', x: x + 0.5, y: y + 0.5 });
    });
  }

  nearPath(x, y, r) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (this.g(x + i, y + j) === G.PATH) return true;
    return false;
  }

  buildCollision() {
    for (let i = 0; i < WW * WH; i++) {
      const g = this.ground[i];
      let c = COL.FREE;
      if (g === G.CLIFF) c = COL.SOLID;
      else if (g === G.DEEP || g === G.SEA) c = COL.WATER;
      else if (g === G.SHALLOW) c = COL.FORD;
      this.coll[i] = c;
    }
    for (const [x, y, c] of this.blockList) {
      if (!inB(x, y)) continue;
      const i = y * WW + x;
      if (this.coll[i] === COL.SOLID) continue;
      this.coll[i] = c;
    }
  }

  // ---------- Abfragen ----------
  collAt(tx, ty) {
    if (!inB(tx, ty)) return COL.SOLID;
    const i = ty * WW + tx;
    if (this.dyn[i]) return COL.SOLID;
    return this.coll[i];
  }

  // mode: { riding, jumping }
  passable(tx, ty, mode = {}) {
    const c = this.collAt(tx, ty);
    if (c === COL.FREE) return true;
    if (c === COL.FORD) return !!mode.riding;
    if (c === COL.LOW) return !!mode.riding && !!mode.jumping;
    return false;
  }

  // Prüft eine Box um (x,y) (Füße) in Kachelkoordinaten
  canStand(x, y, mode = {}, hw = 0.3, hh = 0.2) {
    const x0 = Math.floor(x - hw), x1 = Math.floor(x + hw);
    const y0 = Math.floor(y - hh), y1 = Math.floor(y + hh);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (!this.passable(tx, ty, mode)) return false;
    return true;
  }

  // Welches Hindernis blockiert? (für Hinweise)
  blockerKind(x, y, hw = 0.3, hh = 0.2) {
    const x0 = Math.floor(x - hw), x1 = Math.floor(x + hw);
    const y0 = Math.floor(y - hh), y1 = Math.floor(y + hh);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = this.collAt(tx, ty);
      if (c !== COL.FREE) return c;
    }
    return COL.FREE;
  }

  // Bewegung mit Achsentrennung. Gibt neue Position zurück und ob blockiert.
  move(x, y, dx, dy, mode = {}, hw = 0.3, hh = 0.2) {
    let nx = x, ny = y, blocked = false;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.2));
    const sx = dx / steps, sy = dy / steps;
    for (let i = 0; i < steps; i++) {
      if (sx !== 0) {
        if (this.canStand(nx + sx, ny, mode, hw, hh)) nx += sx;
        else blocked = true;
      }
      if (sy !== 0) {
        if (this.canStand(nx, ny + sy, mode, hw, hh)) ny += sy;
        else blocked = true;
      }
    }
    return { x: nx, y: ny, blocked };
  }

  // Nächste freie Stelle (Anti-Festhängen)
  nearestFree(x, y, mode = {}) {
    if (this.canStand(x, y, mode)) return { x, y };
    for (let r = 1; r < 30; r++) {
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2;
        const px = Math.floor(x + Math.cos(ang) * r) + 0.5, py = Math.floor(y + Math.sin(ang) * r) + 0.5;
        if (this.canStand(px, py, mode)) return { x: px, y: py };
      }
    }
    return { x: FARM.spawn.x, y: FARM.spawn.y };
  }

  // Breitensuche über begehbare Kacheln
  reachable(sx, sy, mode = {}) {
    const seen = new Uint8Array(WW * WH);
    const q = [Math.floor(sx) + Math.floor(sy) * WW];
    seen[q[0]] = 1;
    const m2 = { ...mode, jumping: mode.riding };
    for (let h = 0; h < q.length; h++) {
      const i = q[h], x = i % WW, y = (i / WW) | 0;
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of nb) {
        if (!inB(nx, ny)) continue;
        const j = ny * WW + nx;
        if (seen[j]) continue;
        if (!this.passable(nx, ny, m2)) continue;
        seen[j] = 1; q.push(j);
      }
    }
    return seen;
  }

  inPaddock(x, y) {
    const p = this.paddock;
    return x >= p.x && y >= p.y && x < p.x + p.w && y < p.y + p.h;
  }

  inFarmBuildArea(tx, ty) {
    if (this.regionAt(tx, ty) !== REG.FARM) return false;
    const g = this.g(tx, ty);
    if (g !== G.GRASS && g !== G.FLOWERBED) return false;
    if (this.collAt(tx, ty) !== COL.FREE) return false;
    return true;
  }

  setDyn(tx, ty, v) { if (inB(tx, ty)) this.dyn[ty * WW + tx] = v ? 1 : 0; }
}

export function regionName(id, playerName) {
  if (id === REG.FARM) {
    const n = (playerName || 'Jolina').trim();
    return (/[sßxz]$/i.test(n) ? n + '’' : n + 's') + ' Ponyhof';
  }
  return REGIONS[id].name;
}
