// Speicherstand: Standardwerte, Versionierung, Laden mit Fehlerbehandlung.
// storage ist austauschbar (localStorage im Browser, Map-Attrappe im Test).
import { mergeDefaults, deepClone } from './util.js';
import { defaultFarm, FARM } from './world.js';

export const SAVE_KEY = 'ponyhof.save';
export const SETTINGS_KEY = 'ponyhof.settings';
export const SAVE_VERSION = 2;

export function defaultState() {
  return {
    version: SAVE_VERSION,
    created: 0,
    player: {
      name: 'Jolina', skin: 0, hair: 0, hairColor: 2, outfit: 0, hat: false, hatType: 'straw',
      x: FARM.spawn.x, y: FARM.spawn.y, facing: 'down', coins: 15, riding: false,
    },
    inv: {},
    owned: {},
    decoInv: {},
    deco: [],
    horses: [],
    ridingHorse: null,
    wild: {},
    quests: {},
    tracked: null,
    farm: defaultFarm(),
    flags: {},
    collected: { hs: [], pick: {}, trees: {}, hearts: [] },
    hsRewards: [],
    garden: [],
    album: {},
    albumRewarded: false,
    discovered: { farm: true },
    time: { day: 1, minutes: 8 * 60 },
    weather: { kind: 'sun', until: 1440 + 13 * 60, rainbowUntil: 0 },
    stats: { playSeconds: 0, medals: {}, parcoursBest: 0, postBest: 0, tamed: 0, petted: 0, gifts: 0 },
    memories: [],
    tutorial: {},
    npcGift: {},
    ending: { done: false, foal: null },
  };
}

export function defaultSettings() {
  return { music: 0.6, sfx: 0.8 };
}

// Ältere Speicherstände anheben
function migrate(data) {
  if (!data.version || data.version < 2) {
    // v1 kannte noch kein Deko-Inventar und keine NPC-Geschenke
    data.decoInv = data.decoInv || {};
    data.npcGift = data.npcGift || {};
  }
  data.version = SAVE_VERSION;
  return data;
}

export function validate(data) {
  if (!data || typeof data !== 'object') throw new Error('Kein Objekt');
  if (!data.player || typeof data.player.x !== 'number' || typeof data.player.y !== 'number') throw new Error('Spielerposition fehlt');
  if (!Array.isArray(data.horses)) throw new Error('Pferdeliste fehlt');
  if (!Number.isFinite(data.player.x) || !Number.isFinite(data.player.y)) throw new Error('Ungültige Position');
  return true;
}

export function serialize(S) {
  return JSON.stringify({ v: SAVE_VERSION, t: Date.now(), data: S });
}

export function deserialize(str) {
  const wrap = JSON.parse(str);
  if (!wrap || typeof wrap !== 'object' || !wrap.data) throw new Error('Unbekanntes Format');
  let data = wrap.data;
  if ((wrap.v || 1) > SAVE_VERSION) throw new Error('Speicherstand stammt aus einer neueren Version');
  data = migrate(data);
  data = mergeDefaults(data, defaultState());
  validate(data);
  return data;
}

export class SaveManager {
  constructor(storage) {
    this.storage = storage;
    this.lastError = null;
  }
  has() {
    try { return !!this.storage.getItem(SAVE_KEY); } catch { return false; }
  }
  save(S) {
    try {
      this.storage.setItem(SAVE_KEY, serialize(S));
      return true;
    } catch (e) {
      this.lastError = e;
      return false;
    }
  }
  load() {
    let raw = null;
    try {
      raw = this.storage.getItem(SAVE_KEY);
      if (!raw) return null;
      return deserialize(raw);
    } catch (e) {
      this.lastError = e;
      // Kaputten Stand sichern, damit nichts verloren geht
      try { if (raw) this.storage.setItem(SAVE_KEY + '.kaputt', raw); } catch { /* egal */ }
      return null;
    }
  }
  clear() { try { this.storage.removeItem(SAVE_KEY); } catch { /* egal */ } }
  loadSettings() {
    try {
      const raw = this.storage.getItem(SETTINGS_KEY);
      return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
    } catch { return defaultSettings(); }
  }
  saveSettings(s) { try { this.storage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* egal */ } }
}

export function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

export { deepClone };
