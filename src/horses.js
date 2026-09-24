// Pferde: Freundschaft, Zähmen (reine Logik) und das Verhalten der Pferde in der Welt.
import { FRIEND_LEVELS, PERSONALITIES, WILD_HORSES, COATS, TRICKS } from './data/horses.js';
import { SPOTS } from './world.js';
import { clamp, dist } from './util.js';

export const SPEED = { walk: 3.4, run: 5.3, trot: 5.8, gallop: 8.8 };

export function friendLevel(pts) {
  let lv = 1;
  for (let i = 0; i < FRIEND_LEVELS.length; i++) if (pts >= FRIEND_LEVELS[i]) lv = i + 1;
  return lv;
}
export function friendProgress(pts) {
  const lv = friendLevel(pts);
  if (lv >= 5) return 1;
  const a = FRIEND_LEVELS[lv - 1], b = FRIEND_LEVELS[lv];
  return (pts - a) / (b - a);
}
export function speedBonus(pts) { return 1 + (friendLevel(pts) - 1) * 0.05; }
export function tricksFor(pts) { const lv = friendLevel(pts); return TRICKS.filter((t) => t.level <= lv); }

export function makeHorseRecord({ id, name, coat, mane, marking = 'none', socks = false, personality = 'sanft', foal = false }) {
  return {
    id, name, coat, mane: mane || COATS[coat]?.mane || '#fff', marking, socks, personality,
    pts: 0, acc: { saddle: null, blanket: null, bow: null, wreath: null },
    place: 'paddock', x: 0, y: 0, foal, day: 1, lastGroom: 0, lastPet: -99,
  };
}

export function wildDef(id) { return WILD_HORSES.find((w) => w.id === id); }

// ---------- Zähmen (reine Logik) ----------
export function newTameState() { return { nervous: 0, trust: 0, fleeing: 0, handCd: 0, tamed: false }; }

// input: { dist, speed (Kacheln/s), riding, dt }
export function tameTick(st, persId, input) {
  const p = PERSONALITIES[persId] || PERSONALITIES.sanft;
  const { dist: d, speed, riding, dt } = input;
  st.handCd = Math.max(0, st.handCd - dt);
  if (st.fleeing > 0) { st.fleeing = Math.max(0, st.fleeing - dt); return 'flee'; }
  let result = 'calm';
  if (d < p.aware) {
    const close = 1 - d / p.aware;
    if (riding) {
      st.nervous += dt * p.skittish * (0.6 + close) * 1.2;
    } else if (speed > 0.3) {
      const sf = Math.pow(speed / SPEED.walk, 2);
      st.nervous += dt * p.skittish * (0.15 + close) * sf * 0.45;
    } else {
      st.nervous -= dt * p.calm * 0.5;
      if (d < 3.2 && st.nervous < 0.5) st.trust = Math.min(1, st.trust + dt * 0.012);
    }
  } else {
    st.nervous -= dt * p.calm * 0.8;
  }
  st.nervous = clamp(st.nervous, 0, 1);
  if (st.nervous >= 1) {
    st.fleeing = 1.6;
    st.nervous = 0.45;
    st.trust = Math.max(0, st.trust - 0.08);
    return 'fled';
  }
  if (st.nervous > 0.6) result = 'nervous';
  if (st.trust >= 1) { st.tamed = true; return 'tamed'; }
  return result;
}

// Leckerli anbieten. item: 'apple' | 'carrot' | null (Hand hinhalten)
export function tameOffer(st, persId, item, d) {
  const p = PERSONALITIES[persId] || PERSONALITIES.sanft;
  if (st.fleeing > 0) return 'away';
  if (d > 2.4) return 'far';
  if (st.nervous > 0.75) return 'nervous';
  if (item) {
    st.trust = Math.min(1, st.trust + p.treat * (item === 'apple' ? 1 : 0.9));
    st.nervous = Math.max(0, st.nervous - 0.25);
  } else {
    if (st.handCd > 0) return 'wait';
    st.trust = Math.min(1, st.trust + p.treat * 0.3);
    st.handCd = 3;
  }
  if (st.trust >= 1) { st.tamed = true; return 'tamed'; }
  return 'ok';
}

// ---------- Pferd in der Welt ----------
// mode: 'wild' | 'paddock' | 'idle' | 'called' | 'ridden' | 'race' | 'scene' | 'herd'
export class HorseEntity {
  constructor(rec, mode, x, y) {
    this.rec = rec; // Speicher-Datensatz (bei wilden Pferden eine Definition)
    this.id = rec.id;
    this.mode = mode;
    this.x = x; this.y = y;
    this.homeX = x; this.homeY = y;
    this.face = 1;
    this.vx = 0; this.vy = 0;
    this.speed = 0;
    this.t = Math.random() * 10;
    this.pose = 'stand';
    this.poseT = 0;
    this.target = null;
    this.wait = Math.random() * 3;
    this.z = 0;
    this.tame = null;
    this.hearts = 0;
    this.trick = null;
    this.trickT = 0;
    this.status = 'calm';
  }

  get foal() { return !!this.rec.foal; }

  setTarget(x, y, spd) { this.target = { x, y, spd }; }

  moveTo(dt, world, collide = true) {
    if (!this.target) { this.speed = 0; return true; }
    const dx = this.target.x - this.x, dy = this.target.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.15) { this.target = null; this.speed = 0; return true; }
    const s = Math.min(d, this.target.spd * dt);
    const mx = (dx / d) * s, my = (dy / d) * s;
    if (Math.abs(dx) > 0.05) this.face = dx > 0 ? 1 : -1;
    if (collide && world) {
      const r = world.move(this.x, this.y, mx, my, { riding: true, jumping: false }, 0.35, 0.2);
      if (r.blocked && Math.hypot(r.x - this.x, r.y - this.y) < s * 0.3) { this.target = null; this.speed = 0; return true; }
      this.x = r.x; this.y = r.y;
    } else { this.x += mx; this.y += my; }
    this.speed = this.target ? this.target.spd : 0;
    return false;
  }

  doTrick(id) {
    this.trick = id; this.trickT = 0;
  }

  update(dt, game) {
    this.t += dt;
    if (this.hearts > 0) this.hearts -= dt;
    if (this.trick) {
      this.trickT += dt;
      const dur = this.trick === 'spin' ? 1.2 : 1.6;
      if (this.trickT > dur) this.trick = null;
      this.speed = 0;
      return;
    }
    const world = game.world;
    const P = game.player;
    switch (this.mode) {
      case 'paddock': this.updatePaddock(dt, world, P); break;
      case 'wild': case 'herd': this.updateWild(dt, world, P, game); break;
      case 'idle': this.updateIdle(dt, world); break;
      case 'called': {
        const d = dist(this.x, this.y, P.x, P.y);
        if (d < 1.4) { this.mode = 'idle'; this.target = null; this.speed = 0; break; }
        this.setTarget(P.x - P.face * 0.9, P.y + 0.1, SPEED.trot);
        this.moveTo(dt, world, false);
        break;
      }
      case 'follow': {
        // Fohlen: folgt der Spielerin
        const d = dist(this.x, this.y, P.x, P.y);
        if (d > 25) { this.x = P.x - 2; this.y = P.y + 0.5; }
        if (d > 2.2) { this.setTarget(P.x - (P.faceX || 1) * 1.6, P.y + 0.4, d > 6 ? SPEED.gallop : SPEED.trot * 0.8); this.moveTo(dt, world, false); }
        else { this.speed = 0; this.target = null; }
        break;
      }
      case 'scene': this.moveTo(dt, world, false); break;
      default: break;
    }
    if (this.speed > 0.1) this.pose = this.speed > 7 ? 'gallop' : this.speed > 4.5 ? 'trot' : 'walk';
    else if (this.pose !== 'graze' && this.pose !== 'alert') this.pose = 'stand';
  }

  wanderAround(dt, world, cx, cy, r, spd = 1.4) {
    if (this.target) { this.moveTo(dt, world); return; }
    this.wait -= dt;
    if (this.wait <= 0) {
      if (Math.random() < 0.55) {
        const a = Math.random() * Math.PI * 2, rr = Math.random() * r;
        const tx = cx + Math.cos(a) * rr, ty = cy + Math.sin(a) * rr;
        if (world.canStand(tx, ty, { riding: true }, 0.35, 0.2)) this.setTarget(tx, ty, spd);
        this.pose = 'walk';
      } else {
        this.pose = Math.random() < 0.6 ? 'graze' : 'stand';
      }
      this.wait = 2 + Math.random() * 4;
    }
  }

  updatePaddock(dt, world, P) {
    const p = world.paddock;
    const d = dist(this.x, this.y, P.x, P.y);
    if (d < 8 && d > 1.8 && !P.riding) {
      // Angetrabt kommen – bis an den Zaun
      const tx = clamp(P.x, p.x + 0.6, p.x + p.w - 0.6), ty = clamp(P.y, p.y + 0.6, p.y + p.h - 0.6);
      const td = dist(this.x, this.y, tx, ty);
      if (td > 1.2) this.setTarget(tx - Math.sign(tx - this.x) * 0.8, ty, SPEED.trot * 0.8);
      else { this.target = null; this.speed = 0; if (Math.abs(P.x - this.x) > 0.2) this.face = P.x > this.x ? 1 : -1; }
      if (this.target) this.moveTo(dt, world);
      return;
    }
    this.wanderAround(dt, world, p.x + p.w / 2, p.y + p.h / 2, Math.min(p.w, p.h) / 2 - 0.5);
  }

  updateIdle(dt, world) {
    this.target = null; this.speed = 0;
    this.wait -= dt;
    if (this.wait <= 0) { this.pose = Math.random() < 0.6 ? 'graze' : 'stand'; this.wait = 3 + Math.random() * 3; }
  }

  updateWild(dt, world, P, game) {
    if (this.mode === 'herd') {
      if (this.target) this.moveTo(dt, world);
      else this.wanderAround(dt, world, this.homeX, this.homeY, 5, 2);
      const d = dist(this.x, this.y, P.x, P.y);
      if (d < 4 && P.speed > 0.2 && !this.target) {
        const a = Math.atan2(this.y - P.y, this.x - P.x);
        this.setTarget(this.x + Math.cos(a) * 5, this.y + Math.sin(a) * 5, SPEED.gallop * 0.7);
      }
      return;
    }
    if (!this.tame) this.tame = game.S.wild[this.id] ? Object.assign(newTameState(), game.S.wild[this.id]) : newTameState();
    const d = dist(this.x, this.y, P.x, P.y);
    const res = tameTick(this.tame, this.rec.personality, { dist: d, speed: P.speed, riding: P.riding, dt });
    this.status = res;
    if (res === 'fled') {
      const a = Math.atan2(this.y - P.y, this.x - P.x) + (Math.random() - 0.5) * 0.8;
      let tx = this.x + Math.cos(a) * 6, ty = this.y + Math.sin(a) * 6;
      // nicht zu weit vom Zuhause weg
      if (dist(tx, ty, this.homeX, this.homeY) > 9) { tx = this.homeX + (Math.random() - 0.5) * 4; ty = this.homeY + (Math.random() - 0.5) * 4; }
      this.setTarget(tx, ty, SPEED.gallop * 0.8);
      game.onWildFled?.(this);
    }
    if (res === 'flee' || this.target && this.speed > 5) { this.moveTo(dt, world); return; }
    if (d < this.personalityAware() && !P.riding) {
      // aufmerksam: schaut zur Spielerin
      this.target = null; this.speed = 0;
      this.face = P.x > this.x ? 1 : -1;
      this.pose = this.tame.nervous > 0.6 ? 'alert' : 'stand';
      if (this.rec.personality === 'neugierig' && d > 2.2 && this.tame.nervous < 0.2 && P.speed < 0.2) {
        this.setTarget(this.x + (P.x - this.x) * 0.3, this.y + (P.y - this.y) * 0.3, 1.2);
        this.moveTo(dt, world);
      }
      return;
    }
    this.wanderAround(dt, world, this.homeX, this.homeY, 4);
  }

  personalityAware() { return (PERSONALITIES[this.rec.personality] || PERSONALITIES.sanft).aware; }

  saveTame(S) {
    if (this.tame) S.wild[this.id] = { trust: this.tame.trust };
  }
}

export function wildSpawn(id) { return SPOTS.wildHorses[id]; }
