// Tiere in der Welt: Idle-Animationen, Reaktionen auf die Spielerin, Tieralbum.
import { SPECIES } from './data/animals.js';
import { TILE, G } from './world.js';
import { drawAnimal } from './draw/animals.js';
import { outlinedText, FONT } from './draw/paint.js';
import { dist } from './util.js';

const SCALE = 1.35;

export class Animal {
  constructor(species, x, y, i = 0) {
    this.species = species;
    this.sp = SPECIES[species];
    this.homeX = x; this.homeY = y;
    this.x = x; this.y = y;
    this.face = Math.random() < 0.5 ? 1 : -1;
    this.t = Math.random() * 10;
    this.state = 'idle';
    this.stateT = 0;
    this.target = null;
    this.wait = Math.random() * 3;
    this.variant = i;
    this.visible = true;
    this.followT = 0;
    this.name = null;
    this.ang = Math.random() * 6;
  }

  setTarget(x, y, spd) { this.target = { x, y, spd }; }

  step(dt, world, collide = true) {
    if (!this.target) return false;
    const dx = this.target.x - this.x, dy = this.target.y - this.y, d = Math.hypot(dx, dy);
    if (d < 0.1) { this.target = null; return false; }
    const s = Math.min(d, this.target.spd * dt);
    const mx = (dx / d) * s, my = (dy / d) * s;
    if (Math.abs(dx) > 0.02) this.face = dx > 0 ? 1 : -1;
    if (collide) {
      const r = world.move(this.x, this.y, mx, my, {}, 0.2, 0.12);
      if (r.blocked && Math.hypot(r.x - this.x, r.y - this.y) < s * 0.2) { this.target = null; return false; }
      this.x = r.x; this.y = r.y;
    } else { this.x += mx; this.y += my; }
    return true;
  }

  update(dt, game) {
    this.t += dt;
    if (this.stateT > 0) { this.stateT -= dt; if (this.stateT <= 0 && (this.state === 'happy' || this.state === 'curl')) this.state = 'idle'; }
    const w = game.world, P = game.player, sp = this.sp;
    if (sp.night) { this.visible = game.lightingNight || game.forceAnimals; }
    if (!this.visible) return;
    const d = dist(this.x, this.y, P.x, P.y);
    this.moving = false;
    if (this.mode === 'scene') { this.moving = this.step(dt, w, false); return; }
    if (this.mode === 'follow') {
      // Krümel oder Welpe folgt
      if (d > 20) { this.x = P.x - 1; this.y = P.y + 0.5; }
      if (d > 1.6) { this.setTarget(P.x - (P.faceX || 1) * 1.1, P.y + 0.3, Math.min(9, 2 + d * 1.5)); this.moving = this.step(dt, w, false); }
      if (this.followT > 0) { this.followT -= dt; if (this.followT <= 0) { this.mode = null; this.setTarget(this.homeX, this.homeY, 2); } }
      return;
    }
    if (sp.flying) {
      this.ang += dt * 0.6;
      this.x = this.homeX + Math.cos(this.ang) * 2 + Math.sin(this.ang * 2.3) * 0.6;
      this.y = this.homeY + Math.sin(this.ang * 0.8) * 1.3;
      this.face = Math.cos(this.ang) < 0 ? 1 : -1;
      this.moving = true;
      return;
    }
    if (sp.water) {
      this.ang += dt * 0.25;
      const tx = this.homeX + Math.cos(this.ang + this.variant) * 1.6, ty = this.homeY + Math.sin(this.ang + this.variant) * 0.9;
      const g = w.g(Math.floor(tx), Math.floor(ty));
      if (g === G.DEEP || g === G.SHALLOW) { this.face = tx > this.x ? 1 : -1; this.x = tx; this.y = ty; }
      return;
    }
    // Scheue Tiere fliehen bei schneller Annäherung
    const hasFood = sp.food && game.inv.has(sp.food);
    if (sp.shy && d < 4.2 && (P.speed > 4 || P.riding && P.speed > 0.5) && !hasFood && this.state !== 'happy') {
      const a = Math.atan2(this.y - P.y, this.x - P.x);
      this.setTarget(this.x + Math.cos(a) * 4, this.y + Math.sin(a) * 4, sp.speed);
      this.state = 'flee';
      if (!this.fledHint) { this.fledHint = true; game.hint(`${{ rabbit: 'Der Hase', fox: 'Der Fuchs', deer: 'Das Reh', squirrel: 'Das Eichhörnchen' }[this.species] || 'Das Tier'} ist scheu. Geh langsam darauf zu – nicht rennen oder reiten! Mit Lieblingsfutter klappt es leichter.`, 'shy'); }
    }
    if (this.species === 'hedgehog' && d < 2.5 && P.speed > 4 && this.state !== 'curl') { this.state = 'curl'; this.stateT = 3; }
    if (this.state === 'curl') return;
    if (this.target) {
      this.moving = this.step(dt, w);
      if (!this.target && this.state === 'flee') { this.state = 'idle'; this.wait = 2; }
      return;
    }
    if (this.state === 'flee') this.state = 'idle';
    // Rückkehr nach Hause, wenn zu weit weg
    if (dist(this.x, this.y, this.homeX, this.homeY) > 7) { this.setTarget(this.homeX, this.homeY, sp.speed * 0.4); return; }
    if (d < 2.5 && P.speed < 0.3) { this.face = P.x > this.x ? 1 : -1; return; }
    this.wait -= dt;
    if (this.wait <= 0 && sp.speed > 0) {
      this.wait = 2 + Math.random() * 4;
      if (Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 2.5;
        this.setTarget(this.homeX + Math.cos(a) * r, this.homeY + Math.sin(a) * r, sp.speed * 0.35);
      } else if (this.species === 'deer') this.state = this.state === 'graze' ? 'idle' : 'graze';
    }
  }

  // Streicheln/Füttern
  interact(game) {
    const sp = this.sp;
    let fed = false;
    if (sp.food && game.inv.has(sp.food) && (sp.shy || this.species === 'alpaca' || this.species === 'duckling' || this.species === 'seal')) {
      game.inv.remove(sp.food, 1);
      fed = true;
    }
    this.state = 'happy'; this.stateT = 2.5;
    this.target = null;
    const snd = { cat: 'purr', puppy: 'bark', duckling: 'quack', owl: 'owl' }[this.species] || 'animal';
    game.audio.play(snd);
    game.particles.hearts(this.x, this.y - 0.2, 3);
    if (this.species === 'puppy') { this.mode = 'follow'; this.followT = 15; }
    return fed;
  }

  draw(ctx, game, t) {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x * TILE, this.y * TILE);
    ctx.scale(SCALE, SCALE);
    drawAnimal(ctx, this.species, { face: this.face, t: this.t, moving: this.moving, state: this.state, variant: this.variant });
    ctx.restore();
    if (this.name && dist(this.x, this.y, game.player.x, game.player.y) < 3) {
      ctx.font = `700 12px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      outlinedText(ctx, this.name, this.x * TILE, this.y * TILE - 44, '#fff', '#8a4a6a', 4);
    }
  }
}

export function spawnAnimals(world) {
  const list = [];
  for (const [id, sp] of Object.entries(SPECIES)) {
    sp.spawns.forEach(([x, y], i) => {
      let px = x + 0.5, py = y + 0.5;
      if (!sp.water && !sp.flying) { const f = world.nearestFree(px, py); px = f.x; py = f.y; }
      list.push(new Animal(id, px, py, i));
    });
  }
  return list;
}
