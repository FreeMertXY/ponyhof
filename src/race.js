// Rennen gegen Dorfkinder und der Hindernisparcours: Checkpoints, Gegner, Medaillen.
import { TRACKS, TILE } from './world.js';
import { NPCS } from './data/npcs.js';
import { drawHorse, horseLook } from './draw/horse.js';
import { drawCharacter, npcLook } from './draw/characters.js';
import { ell, rr, outlinedText, FONT, star } from './draw/paint.js';
import { formatTime, dist } from './util.js';

export const RACES = {
  race1: { name: 'Wiesenrennen', rivals: [['ben', 7.3]] },
  race2: { name: 'Strandrennen', rivals: [['mia', 7.9]] },
  race3: { name: 'Das große Kleeberg-Rennen', rivals: [['mia', 8.15], ['ben', 7.85]] },
  finale: { name: 'Sommerfest-Rennen', rivals: [['mia', 8.2], ['ben', 7.95]] },
  parcours: { name: 'Hindernisparcours', rivals: [], medals: [24, 34] },
};

const RIVAL_HORSE = {
  mia: { name: 'Blitz', coat: 'falbe', mane: '#4a3628', marking: 'star', socks: true, acc: { saddle: 'saddle_kirsch', bow: 'bow_rosa' } },
  ben: { name: 'Wolke', coat: 'schimmel', mane: '#e8e2f0', marking: 'none', acc: { saddle: 'saddle_himmel', blanket: 'blanket_sterne' } },
};

export const MEDAL_NAMES = { gold: 'Gold', silver: 'Silber', bronze: 'Bronze' };
export const MEDAL_COLORS = { gold: '#ffd24a', silver: '#d6dde8', bronze: '#e0a070' };

class Rival {
  constructor(id, speed, track, offset) {
    this.id = id;
    this.look = npcLook(NPCS[id].look);
    this.horse = horseLook(RIVAL_HORSE[id]);
    this.speed = speed;
    this.track = track;
    this.idx = 1;
    this.x = track[0][0] + 0.5 + offset.x; this.y = track[0][1] + 0.5 + offset.y;
    this.face = 1; this.t = Math.random(); this.done = false; this.finishT = 0;
    this.cur = 0; this.z = 0; this.jumpT = -1;
  }
  update(dt, race, lead) {
    this.t += dt;
    if (this.done) { this.cur = Math.max(0, this.cur - dt * 6); return; }
    if (race.phase !== 'run') return;
    const [tx, ty] = this.track[this.idx];
    const dx = tx + 0.5 - this.x, dy = ty + 0.5 - this.y, d = Math.hypot(dx, dy);
    // Gummiband: nicht zu weit weg, nicht zu weit vorn
    let spd = this.speed;
    if (lead > 10) spd *= 0.9; else if (lead < -10) spd *= 1.06;
    this.cur = Math.min(spd, this.cur + dt * 6);
    const s = Math.min(d, this.cur * dt);
    if (d > 0.01) { this.x += (dx / d) * s; this.y += (dy / d) * s; if (Math.abs(dx) > 0.05) this.face = dx > 0 ? 1 : -1; }
    if (d < 0.6) {
      this.idx++;
      if (this.idx >= this.track.length) { this.done = true; this.finishT = race.time; }
    }
    if (this.jumpT >= 0) { this.jumpT += dt; this.z = Math.sin(Math.min(1, this.jumpT / 0.5) * Math.PI) * 24; if (this.jumpT > 0.5) { this.jumpT = -1; this.z = 0; } }
  }
  progress() {
    if (this.done) return 1e6 - this.finishT;
    const [tx, ty] = this.track[Math.min(this.idx, this.track.length - 1)];
    return this.idx * 1000 - dist(this.x, this.y, tx + 0.5, ty + 0.5);
  }
  draw(ctx, game, t) {
    ctx.save();
    ctx.translate(this.x * TILE, this.y * TILE);
    const pose = this.cur > 7 ? 'gallop' : this.cur > 4 ? 'trot' : this.cur > 0.3 ? 'walk' : 'stand';
    const L = this.look;
    drawHorse(ctx, this.horse, {
      t: this.t, pose, face: this.face, z: this.z, scale: 1.22,
      rider: (c) => { c.save(); c.translate(-1, -24); c.scale(1 / 1.22, 1 / 1.22); drawCharacter(c, L, { dir: 'right', t, seated: true, noShadow: true }); c.restore(); },
    });
    ctx.font = `700 12px ${FONT}`; ctx.textAlign = 'center';
    outlinedText(ctx, NPCS[this.id].name, 0, -110 - this.z, '#fff', '#7a4a6a', 4);
    ctx.restore();
  }
}

export class Race {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.def = RACES[id];
    this.track = TRACKS[id];
    this.active = false;
    this.phase = 'idle';
    this.time = 0;
    this.cd = 0;
    this.next = 1;
    this.rivals = [];
    this.result = null;
  }

  start() {
    const g = this.game, P = g.player;
    const [sx, sy] = this.track[0], [nx, ny] = this.track[1];
    const ang = Math.atan2(ny - sy, nx - sx);
    const perp = { x: -Math.sin(ang), y: Math.cos(ang) };
    P.x = sx + 0.5; P.y = sy + 0.5; P.vx = 0; P.vy = 0;
    P.faceX = Math.cos(ang) >= 0 ? 1 : -1;
    this.rivals = this.def.rivals.map(([rid, spd], i) => new Rival(rid, spd, this.track, { x: perp.x * (i + 1) * 1.2, y: perp.y * (i + 1) * 1.2 }));
    this.rivals.forEach((r) => { r.face = P.faceX; });
    for (const r of this.rivals) { const n = g.npcById(r.id); if (n) n.visible = false; }
    this.active = true;
    this.phase = 'countdown';
    this.cd = 3.5;
    this.time = 0;
    this.next = 1;
    this.lastBeep = 4;
    g.renderer.follow(P.x, P.y, 0, true);
    g.audio.setMode('festival');
  }

  get entities() { return this.rivals; }

  update(dt) {
    if (!this.active) return;
    const g = this.game, P = g.player;
    if (this.phase === 'countdown') {
      this.cd -= dt;
      const n = Math.ceil(this.cd);
      if (n < this.lastBeep && n > 0) { this.lastBeep = n; g.audio.play('countdown'); }
      if (this.cd <= 0) { this.phase = 'run'; g.audio.play('go'); g.audio.play('neigh'); }
      return;
    }
    if (this.phase !== 'run') return;
    this.time += dt;
    if (!P.riding) { this.abort('Du bist abgestiegen – das Rennen ist vorbei. Versuch es einfach nochmal!'); return; }
    const [cx, cy] = this.track[this.next];
    if (dist(P.x, P.y, cx + 0.5, cy + 0.5) < 2.3) {
      this.next++;
      g.audio.play('checkpoint');
      g.particles.sparkles(cx + 0.5, cy + 0.5, 8, 30, '#ffe39a');
      if (this.next >= this.track.length) { this.finish(); return; }
    }
    const myProg = this.next * 1000 - dist(P.x, P.y, this.track[this.next][0] + 0.5, this.track[this.next][1] + 0.5);
    for (const r of this.rivals) r.update(dt, this, (r.progress() - myProg) / 1000 * 8);
    // Gegner springen im Parcours nicht – aber über Zäune auf der Strecke
    for (const r of this.rivals) if (r.jumpT < 0 && !r.done && !g.world.canStand(r.x, r.y, { riding: true }, 0.3, 0.2)) r.jumpT = 0;
  }

  place() {
    const g = this.game, P = g.player;
    const myProg = this.next * 1000 - dist(P.x, P.y, this.track[Math.min(this.next, this.track.length - 1)][0] + 0.5, this.track[Math.min(this.next, this.track.length - 1)][1] + 0.5);
    return 1 + this.rivals.filter((r) => r.progress() > myProg).length;
  }

  finish() {
    const g = this.game;
    this.phase = 'done';
    const place = 1 + this.rivals.filter((r) => r.done).length;
    let medal;
    if (this.id === 'parcours') medal = this.time < this.def.medals[0] ? 'gold' : this.time < this.def.medals[1] ? 'silver' : 'bronze';
    else medal = ['gold', 'silver', 'bronze'][place - 1];
    this.result = { place, medal, time: this.time };
    g.onRaceFinished(this);
  }

  abort(msg) {
    this.phase = 'done';
    this.end();
    this.game.ui.hint(msg, 5);
  }

  end() {
    const g = this.game;
    this.active = false;
    for (const r of this.rivals) { const n = g.npcById(r.id); if (n) n.visible = true; }
    g.race = null;
    g.applyAudioMode();
  }

  hudText() {
    if (!this.active) return '';
    if (this.phase === 'countdown') {
      const n = Math.ceil(this.cd);
      return `<div>${this.def.name}</div><div class="big">${n > 3 ? 'Bereit?' : n > 0 ? n : 'Los!'}</div>`;
    }
    const total = this.track.length - 1;
    const cp = Math.min(this.next - 1, total);
    const pl = this.rivals.length ? ` · Platz ${this.place()}/${this.rivals.length + 1}` : '';
    return `<div>${this.def.name}</div><div class="big">${formatTime(this.time)}</div><div style="font-size:15px">Tor ${cp}/${total}${pl}</div>`;
  }

  // Tore und Zielbanner
  drawWorld(ctx, t) {
    if (!this.active) return;
    for (let i = Math.max(1, this.next); i < this.track.length; i++) {
      const [x, y] = this.track[i];
      const X = (x + 0.5) * TILE, Y = (y + 0.5) * TILE;
      const isNext = i === this.next, last = i === this.track.length - 1;
      const pulse = isNext ? 1 + Math.sin(t * 6) * 0.08 : 1;
      ctx.save(); ctx.translate(X, Y); ctx.scale(pulse, pulse);
      ctx.globalAlpha = isNext ? 1 : 0.45;
      ell(ctx, 0, 0, 62, 24);
      ctx.strokeStyle = last ? '#ff7eb6' : isNext ? '#ffd23f' : '#fff'; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      for (const s of [-1, 1]) {
        ctx.fillStyle = '#fff'; rr(ctx, s * 58 - 3, -70, 6, 70, 3); ctx.fill();
        ctx.fillStyle = last ? '#ff7eb6' : '#7ec8ff';
        ctx.beginPath(); ctx.moveTo(s * 58, -70); ctx.lineTo(s * 58 + s * 22, -62); ctx.lineTo(s * 58, -54); ctx.closePath(); ctx.fill();
      }
      if (isNext || last) {
        ctx.font = `800 16px ${FONT}`; ctx.textAlign = 'center';
        outlinedText(ctx, last ? 'ZIEL' : `${i}`, 0, -40, last ? '#ff7eb6' : '#ffd23f', '#6b4a5e', 5);
      }
      if (isNext) { ctx.fillStyle = 'rgba(255,230,120,0.25)'; ell(ctx, 0, 0, 58, 20); ctx.fill(); ctx.fillStyle = '#ffd23f'; star(ctx, 0, -80 + Math.sin(t * 5) * 5, 10); ctx.fill(); }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }
}

export { RIVAL_HORSE };
