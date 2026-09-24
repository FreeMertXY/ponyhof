// Inventar: stapelbare Gegenstände, Münzen, freigeschaltete Dinge. Reine Logik auf dem Speicherstand S.
import { ITEMS } from './data/items.js';

export class Inventory {
  constructor(S, onChange = () => {}) {
    this.S = S;
    this.onChange = onChange;
  }
  count(id) { return this.S.inv[id] || 0; }
  has(id, n = 1) { return this.count(id) >= n; }
  hasAll(items) { return Object.entries(items || {}).every(([id, n]) => this.has(id, n)); }
  add(id, n = 1) {
    if (n <= 0) return;
    if (!ITEMS[id]) throw new Error('Unbekannter Gegenstand: ' + id);
    this.S.inv[id] = this.count(id) + n;
    this.onChange('add', id, n);
  }
  remove(id, n = 1) {
    if (!this.has(id, n)) return false;
    this.S.inv[id] = this.count(id) - n;
    if (this.S.inv[id] <= 0) delete this.S.inv[id];
    this.onChange('remove', id, n);
    return true;
  }
  removeAll(items) {
    if (!this.hasAll(items)) return false;
    for (const [id, n] of Object.entries(items)) this.remove(id, n);
    return true;
  }
  get coins() { return this.S.player.coins; }
  addCoins(n) { this.S.player.coins = Math.max(0, this.S.player.coins + n); this.onChange('coins', null, n); }
  spend(n) {
    if (this.S.player.coins < n) return false;
    this.S.player.coins -= n;
    this.onChange('coins', null, -n);
    return true;
  }
  sell(id, n = 1) {
    const it = ITEMS[id];
    if (!it || !it.sell || !this.has(id, n)) return 0;
    this.remove(id, n);
    const earned = it.sell * n;
    this.addCoins(earned);
    return earned;
  }
  owns(key) { return !!this.S.owned[key]; }
  unlock(key) { this.S.owned[key] = true; this.onChange('unlock', key, 1); }
  addDeco(id, n = 1) { this.S.decoInv[id] = (this.S.decoInv[id] || 0) + n; this.onChange('deco', id, n); }
  takeDeco(id) {
    if (!(this.S.decoInv[id] > 0)) return false;
    this.S.decoInv[id]--;
    this.onChange('deco', id, -1);
    return true;
  }
  list(cat) {
    return Object.entries(this.S.inv).filter(([id, n]) => n > 0 && ITEMS[id] && (!cat || ITEMS[id].cat === cat)).map(([id, n]) => ({ id, n, ...ITEMS[id] }));
  }
}
