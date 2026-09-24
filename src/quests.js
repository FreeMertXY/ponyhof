// Aufgaben-Engine: schaltet Aufgaben frei, zählt Fortschritt, verteilt Belohnungen.
// Reine Logik – die Spielwelt wird über das ctx-Objekt angebunden.
import { QUESTS, QUEST_BY_ID, CHAPTERS } from './data/quests.js';
import { itemName, ITEM_SOURCES } from './data/items.js';

// ctx: {
//   inv: Inventory,
//   fmt(text) -> string, notify(text), onStart(q), onComplete(q), onStep(q, step),
//   maxFriendLevel() -> n, albumCount() -> n, isTamed(id) -> bool, tamedCount() -> n,
//   regionId() -> 'farm'|..., playerPos() -> {x,y}, flag(name) -> any, timer(action, id)
// }
export class QuestEngine {
  constructor(S, ctx) {
    this.S = S;
    this.ctx = ctx;
  }

  st(id) { return this.S.quests[id]; }
  isDone(id) { return this.st(id)?.state === 'done'; }
  isActive(id) { return this.st(id)?.state === 'active'; }
  isAvailable(id) { return this.st(id)?.state === 'available'; }
  allDone(ids) { return (ids || []).every((r) => this.isDone(r)); }

  // Neue Aufgaben freischalten
  refresh() {
    let changed = false;
    for (const q of QUESTS) {
      if (this.st(q.id)) continue;
      if (!this.allDone(q.requires)) continue;
      if (q.main) this.start(q, true);
      else { this.S.quests[q.id] = { state: 'available' }; changed = true; }
      changed = true;
    }
    if (changed) this.checkPassive();
    return changed;
  }

  start(q, silentAuto = false) {
    this.S.quests[q.id] = { state: 'active', step: 0, p: 0, got: [] };
    if (q.startGive) for (const [id, n] of Object.entries(q.startGive)) this.ctx.inv.add(id, n);
    if (!this.S.tracked || !this.isActive(this.S.tracked)) this.S.tracked = q.id;
    else if (q.main && !QUEST_BY_ID[this.S.tracked]?.main) this.S.tracked = q.id;
    this.ctx.onStart?.(q, silentAuto);
    this.checkPassive();
  }

  active() { return QUESTS.filter((q) => this.isActive(q.id)); }
  available() { return QUESTS.filter((q) => this.isAvailable(q.id)); }
  done() { return QUESTS.filter((q) => this.isDone(q.id)); }

  step(q) {
    const s = this.st(q.id);
    if (!s || s.state !== 'active') return null;
    return q.steps[s.step] || null;
  }

  advance(q) {
    const s = this.st(q.id);
    const step = q.steps[s.step];
    this.ctx.onStep?.(q, step);
    if (step?.stopTimer) this.ctx.timer?.('stop', step.stopTimer);
    s.step++;
    s.p = 0;
    s.got = [];
    if (s.step >= q.steps.length) this.complete(q);
    else {
      const next = q.steps[s.step];
      if (next.startTimer) this.ctx.timer?.('start', next.startTimer);
      this.checkPassive();
    }
  }

  complete(q) {
    const s = this.st(q.id);
    s.state = 'done';
    const r = q.reward || {};
    if (r.coins) this.ctx.inv.addCoins(r.coins);
    if (r.items) for (const [id, n] of Object.entries(r.items)) this.ctx.inv.add(id, n);
    if (r.unlock) for (const u of r.unlock) this.ctx.inv.unlock(u);
    if (r.deco) for (const [id, n] of Object.entries(r.deco)) this.ctx.inv.addDeco(id, n);
    if (r.farm) this.S.farm[r.farm] = true;
    if (this.S.tracked === q.id) this.S.tracked = null;
    this.ctx.onComplete?.(q);
    this.refresh();
    if (!this.S.tracked || !this.isActive(this.S.tracked)) {
      const a = this.active();
      this.S.tracked = (a.find((x) => x.main) || a[0])?.id || null;
    }
  }

  // Ereignis aus dem Spiel (z. B. 'plant', 'race' mit filter 'race1')
  emit(ev, filter = null, n = 1) {
    let any = false;
    for (const q of this.active()) {
      const step = this.step(q);
      if (!step || step.type !== 'event' || step.ev !== ev) continue;
      if (step.filter && step.filter !== filter) continue;
      const s = this.st(q.id);
      s.p += n;
      any = true;
      if (s.p >= step.count) this.advance(q);
    }
    return any;
  }

  // Bedingungen, die ohne Gespräch erfüllt werden
  checkPassive() {
    let guard = 0, again = true;
    while (again && guard++ < 20) {
      again = false;
      for (const q of this.active()) {
        const step = this.step(q);
        if (!step) continue;
        let ok = false;
        if (step.type === 'reach') {
          if (step.region) ok = this.ctx.regionId?.() === step.region;
          else if (step.at) {
            const p = this.ctx.playerPos?.();
            ok = p && Math.hypot(p.x - step.at.x, p.y - step.at.y) < (step.at.r || 3);
          }
        } else if (step.type === 'tame') ok = !!this.ctx.isTamed?.(step.horse);
        else if (step.type === 'friendship') ok = (this.ctx.maxFriendLevel?.() || 0) >= step.level;
        else if (step.type === 'album') ok = (this.ctx.albumCount?.() || 0) >= step.count;
        // bereits vorher gezähmte Pferde zählen mit – so kann man nie festhängen
        else if (step.type === 'event' && step.ev === 'tame') ok = (this.ctx.tamedCount?.() || 0) >= step.count;
        if (ok) { this.advance(q); again = true; }
      }
    }
  }

  // Gespräch mit einer Person. Gibt eine Aktion zurück oder null.
  // { kind:'quest'|'offer'|'missing'|'race'|'ending'|'wait', quest, lines, speaker, run() }
  talk(npc) {
    for (const q of this.active()) {
      const step = this.step(q);
      if (!step) continue;
      if (step.type === 'talk' && step.npc === npc) {
        if (step.needKitten && !this.ctx.flag?.('kittenFollowing')) {
          return { kind: 'wait', quest: q, speaker: npc, lines: ['Hast du Krümel schon gefunden? Sie muss irgendwo im Flüsterwald sein … bei einem hohlen Baumstamm auf einer Lichtung.'] };
        }
        return {
          kind: step.ending ? 'ending' : 'quest', quest: q, speaker: npc, lines: step.lines || [], after: step.after,
          run: () => {
            if (step.onTalk) this.ctx.onTalk?.(step.onTalk);
            if (step.give) for (const [id, n] of Object.entries(step.give)) this.ctx.inv.add(id, n);
            if (step.startTimer) this.ctx.timer?.('start', step.startTimer);
            this.advance(q);
          },
        };
      }
      if (step.type === 'deliver' && step.npc === npc) {
        if (this.ctx.inv.hasAll(step.items)) {
          return {
            kind: 'quest', quest: q, speaker: npc, lines: step.lines || [], after: step.after,
            run: () => {
              this.ctx.inv.removeAll(step.items);
              if (step.give) for (const [id, n] of Object.entries(step.give)) this.ctx.inv.add(id, n);
              this.advance(q);
            },
          };
        }
        const tips = this.sourceTips(step.items);
        return { kind: 'missing', quest: q, speaker: npc, lines: [...(step.missing || ['Du hast noch nicht alles beisammen: ' + this.itemsNeed(step.items)]), ...(tips.length ? [{ who: 'narr', t: 'Tipp – ' + tips.join(' ') }] : [])] };
      }
      if (step.type === 'talkAll' && step.npcs.includes(npc)) {
        const s = this.st(q.id);
        if (!s.got.includes(npc)) {
          return {
            kind: 'quest', quest: q, speaker: npc, lines: step.lines?.[npc] || [],
            run: () => {
              if (s.got.includes(npc)) return;
              s.got.push(npc);
              if (step.consume) this.ctx.inv.remove(step.consume, 1);
              if (s.got.length >= step.npcs.length) this.advance(q);
            },
          };
        }
      }
      if (step.type === 'event' && step.ev === 'race' && step.target?.npc === npc) {
        return { kind: 'race', quest: q, speaker: npc, race: step.filter, lines: [] };
      }
    }
    // Nebenaufgabe anbieten
    for (const q of this.available()) {
      if (q.giver !== npc) continue;
      return {
        kind: 'offer', quest: q, speaker: npc, lines: q.offer || [],
        run: () => this.start(q),
      };
    }
    return null;
  }

  // Woher bekommt man die noch fehlenden Sachen?
  sourceTips(items) {
    return Object.entries(items || {}).filter(([id, n]) => this.ctx.inv.count(id) < n && ITEM_SOURCES[id]).map(([id]) => ITEM_SOURCES[id]);
  }

  // Tipp für den aktuellen Schritt (Aufgabenbuch)
  stepHint(q) {
    const step = this.step(q);
    if (!step) return '';
    const parts = [];
    if (step.hint) parts.push(this.ctx.fmt ? this.ctx.fmt(step.hint) : step.hint);
    if (step.type === 'deliver') parts.push(...this.sourceTips(step.items));
    if (step.type === 'event' && step.needs) parts.push(...this.sourceTips(step.needs));
    return parts.join(' ');
  }

  itemsNeed(items) {
    return Object.entries(items).map(([id, n]) => `${n} ${itemName(id, n)}`).join(', ');
  }

  // Text für HUD und Aufgabenbuch
  stepText(q) {
    const step = this.step(q);
    if (!step) return '';
    const s = this.st(q.id);
    let t = this.ctx.fmt ? this.ctx.fmt(step.text) : step.text;
    if (step.type === 'event' && step.count > 1) t += ` (${Math.min(s.p, step.count)}/${step.count})`;
    if (step.type === 'deliver') {
      const parts = Object.entries(step.items).map(([id, n]) => `${Math.min(this.ctx.inv.count(id), n)}/${n}`);
      t += ` (${parts.join(', ')})`;
    }
    if (step.type === 'event' && step.needs) {
      const parts = Object.entries(step.needs).map(([id, n]) => `${Math.min(this.ctx.inv.count(id), n)}/${n}`);
      t += ` (${parts.join(', ')})`;
    }
    if (step.type === 'talkAll') t += ` (${s.got.length}/${step.npcs.length})`;
    if (step.type === 'album') t += ` (${Math.min(this.ctx.albumCount?.() || 0, step.count)}/${step.count})`;
    return t;
  }

  stepTarget(q) {
    const step = this.step(q);
    return step ? step.target || null : null;
  }

  npcHasNews(npc) {
    for (const q of this.active()) {
      const step = this.step(q);
      if (!step) continue;
      if ((step.type === 'talk' || step.type === 'deliver') && step.npc === npc) {
        if (step.needKitten && !this.ctx.flag?.('kittenFollowing')) continue;
        if (step.type === 'deliver' && !this.ctx.inv.hasAll(step.items)) continue;
        return 'quest';
      }
      if (step.type === 'talkAll' && step.npcs.includes(npc) && !this.st(q.id).got.includes(npc)) return 'quest';
      if (step.type === 'event' && step.ev === 'race' && step.target?.npc === npc) return 'quest';
    }
    if (this.available().some((q) => q.giver === npc)) return 'offer';
    return null;
  }

  chapter() {
    let ch = 1;
    for (const c of CHAPTERS.map((x) => x.n)) {
      const main = QUESTS.filter((q) => q.main && q.chapter === c);
      if (main.every((q) => this.isDone(q.id))) ch = c + 1; else break;
    }
    return Math.min(ch, CHAPTERS.length + 1);
  }

  mainProgress() {
    const main = QUESTS.filter((q) => q.main);
    return { done: main.filter((q) => this.isDone(q.id)).length, total: main.length };
  }
}
