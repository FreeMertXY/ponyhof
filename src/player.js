// Die Spielfigur: laufen, rennen, reiten, springen.
import { SPEED, speedBonus } from './horses.js';
import { COL, TILE } from './world.js';
import { drawCharacter, playerLook } from './draw/characters.js';
import { drawHorse, horseLook } from './draw/horse.js';
import { shadow } from './draw/paint.js';

const JUMP = 0.55;
export const HORSE_SCALE = 1.22;

export class Player {
  constructor(game) {
    this.game = game;
    const p = game.S.player;
    this.x = p.x; this.y = p.y;
    this.face = p.facing || 'down';
    this.faceX = 1;
    this.t = 0;
    this.speed = 0;
    this.vx = 0; this.vy = 0;
    this.riding = false;
    this.horse = null;
    this.jumpT = -1;
    this.z = 0;
    this.stepT = 0;
    this.hoofI = 0;
    this.blockHintT = 0;
    this.lookCache = null;
    this.visible = true;
    this.autoMove = null; // für Zwischensequenzen: {x,y,spd,done}
    this.jumpRot = 0;
  }

  get look() {
    const p = this.game.S.player;
    const key = [p.skin, p.hair, p.hairColor, p.outfit, p.hat, p.hatType].join(',');
    if (!this.lookCache || this.lookCache.key !== key) this.lookCache = { key, L: playerLook(p) };
    return this.lookCache.L;
  }

  mount(h) {
    this.riding = true;
    this.horse = h;
    h.mode = 'ridden';
    h.visible = false;
    this.x = h.x; this.y = h.y;
    this.faceX = h.face;
    this.game.S.player.riding = true;
    this.game.S.ridingHorse = h.id;
  }

  dismount() {
    const h = this.horse;
    if (!h) return false;
    const w = this.game.world;
    // Absteigen nur auf festem Boden
    let spot = null;
    for (const [dx, dy] of [[0, 0.9], [0, -0.9], [0.9, 0], [-0.9, 0], [0.8, 0.8], [-0.8, 0.8]]) {
      if (w.canStand(this.x + dx, this.y + dy, {})) { spot = [this.x + dx, this.y + dy]; break; }
    }
    if (!spot || !w.canStand(this.x, this.y, { riding: true })) return false;
    h.x = this.x; h.y = this.y; h.face = this.faceX;
    h.mode = 'idle'; h.visible = true; h.target = null; h.speed = 0;
    this.riding = false;
    this.horse = null;
    this.x = spot[0]; this.y = spot[1];
    this.jumpT = -1; this.z = 0;
    this.game.S.player.riding = false;
    return true;
  }

  startJump() {
    if (this.jumpT >= 0 || !this.riding) return;
    this.jumpT = 0;
    this.game.audio.play('jump');
    this.game.onJump?.();
  }

  update(dt) {
    const g = this.game, inp = g.input, w = g.world;
    this.t += dt;
    let ax = 0, ay = 0, run = false;
    if (this.autoMove) {
      const m = this.autoMove;
      const dx = m.x - this.x, dy = m.y - this.y, d = Math.hypot(dx, dy);
      if (d < 0.2) { this.autoMove = null; m.done?.(); }
      else { ax = dx / d; ay = dy / d; run = m.run; }
    } else if (!g.controlsLocked) {
      const a = inp.axis();
      ax = a.x; ay = a.y;
      run = inp.down('Shift');
      if (!ax && !ay && inp.mouse.down && g.mouseWalk) {
        const tw = g.renderer.screenToWorld(inp.mouse.x, inp.mouse.y);
        const dx = tw.x - this.x, dy = tw.y - (this.y - (this.riding ? 0.6 : 0.5)), d = Math.hypot(dx, dy);
        if (d > 0.35) { ax = dx / d; ay = dy / d; run = d > 4 || run; }
      }
      if (this.riding && inp.hit(' ')) this.startJump();
    }
    const len = Math.hypot(ax, ay);
    if (len > 1) { ax /= len; ay /= len; }
    const hb = this.riding && this.horse ? speedBonus(this.horse.rec.pts || 0) : 1;
    let maxSpd = this.riding ? (run ? SPEED.gallop : SPEED.trot) * hb : run ? SPEED.run : SPEED.walk;
    if (this.autoMove?.spd) maxSpd = this.autoMove.spd;
    // weiches Beschleunigen
    const acc = this.riding ? 14 : 22;
    const tvx = ax * maxSpd, tvy = ay * maxSpd;
    this.vx += (tvx - this.vx) * Math.min(1, acc * dt);
    this.vy += (tvy - this.vy) * Math.min(1, acc * dt);
    if (!ax && !ay && Math.hypot(this.vx, this.vy) < 0.2) { this.vx = 0; this.vy = 0; }
    // Richtung
    if (Math.abs(ax) > 0.01 || Math.abs(ay) > 0.01) {
      if (Math.abs(ax) > 0.01) this.faceX = ax > 0 ? 1 : -1;
      if (Math.abs(ax) >= Math.abs(ay) * 0.9) this.face = ax > 0 ? 'right' : 'left';
      else this.face = ay > 0 ? 'down' : 'up';
    }
    // Sprung
    if (this.jumpT >= 0) {
      this.jumpT += dt;
      const k = Math.min(1, this.jumpT / JUMP);
      this.z = Math.sin(k * Math.PI) * 26;
      this.jumpRot = Math.sin(k * Math.PI * 2) * -0.18;
      if (k >= 1) {
        if (!w.canStand(this.x, this.y, { riding: true, jumping: false }, 0.35, 0.2)) {
          this.jumpT = JUMP * 0.85; // noch über dem Zaun: weiter schweben
        } else {
          this.jumpT = -1; this.z = 0; this.jumpRot = 0;
          g.audio.play('land');
          g.particles.dust(this.x, this.y, 5);
        }
      }
    }
    const mode = { riding: this.riding, jumping: this.jumpT >= 0 };
    const hw = this.riding ? 0.35 : 0.28, hh = this.riding ? 0.22 : 0.18;
    // automatischer Sprung über niedrige Hindernisse
    if (this.riding && this.jumpT < 0 && (ax || ay)) {
      const lx = this.x + ax * 0.55, ly = this.y + ay * 0.55;
      if (!w.canStand(lx, ly, { riding: true }, hw, hh) && w.canStand(lx, ly, { riding: true, jumping: true }, hw, hh)) {
        const fx = this.x + ax * 1.6, fy = this.y + ay * 1.6;
        if (w.canStand(fx, fy, { riding: true }, hw, hh) || w.canStand(this.x + ax * 2.2, this.y + ay * 2.2, { riding: true }, hw, hh)) this.startJump();
      }
    }
    const r = w.move(this.x, this.y, this.vx * dt, this.vy * dt, this.autoMove?.ghost ? { riding: true, jumping: true } : mode, hw, hh);
    const moved = Math.hypot(r.x - this.x, r.y - this.y);
    if (this.autoMove?.ghost) { this.x += this.vx * dt; this.y += this.vy * dt; }
    else { this.x = r.x; this.y = r.y; }
    this.speed = moved / Math.max(dt, 0.001);
    if (r.blocked && (ax || ay)) {
      this.blockHintT -= dt;
      if (this.blockHintT <= 0) {
        const k = w.blockerKind(this.x + ax * 0.5, this.y + ay * 0.5, hw, hh);
        if (k === COL.FORD && !this.riding) g.hint('Hier ist es zu tief zum Laufen – zu Pferd kommst du durch die Furt! (R)', 'ford');
        else if (k === COL.WATER) g.hint('Das Wasser ist zu tief. Such eine Brücke oder eine Furt!', 'deep');
        else if (k === COL.LOW && !this.riding) g.hint('Zu Pferd kannst du über niedrige Zäune springen!', 'fence');
        this.blockHintT = 3;
      }
    }
    // Staub, Hufe, Schritte
    const moving = this.speed > 0.3;
    if (moving) {
      this.stepT -= dt;
      if (this.riding) {
        const gallop = this.speed > 7;
        if (gallop && Math.random() < dt * 14) g.particles.dust(this.x - this.faceX * 0.5, this.y, 1);
        else if (Math.random() < dt * 3) g.particles.dust(this.x - this.faceX * 0.5, this.y, 1);
        if (this.stepT <= 0 && this.jumpT < 0) {
          const pat = gallop ? [0.07, 0.07, 0.22] : this.speed > 4.5 ? [0.17] : [0.24];
          this.stepT = pat[this.hoofI % pat.length];
          this.hoofI++;
          g.audio.play('hoof', { vol: gallop ? 0.28 : 0.2 });
        }
      } else if (this.stepT <= 0) {
        this.stepT = this.speed > 4 ? 0.22 : 0.32;
        g.audio.play('step');
      }
    }
    if (this.horse) { this.horse.x = this.x; this.horse.y = this.y; this.horse.face = this.faceX; this.horse.t += dt; }
    const S = g.S.player;
    S.x = this.x; S.y = this.y; S.facing = this.face;
  }

  get pose() {
    if (this.jumpT >= 0) return 'jump';
    if (this.speed > 7) return 'gallop';
    if (this.speed > 4.5) return 'trot';
    if (this.speed > 0.3) return 'walk';
    return 'stand';
  }

  draw(ctx, game, t) {
    const X = this.x * TILE, Y = this.y * TILE;
    ctx.save();
    ctx.translate(X, Y);
    if (this.riding && this.horse) {
      const h = this.horse;
      const L = this.look;
      const rideBob = this.pose === 'gallop' ? Math.abs(Math.sin(this.t * 13)) * 2 : this.pose === 'trot' ? Math.abs(Math.sin(this.t * 11)) * 3 : 0;
      if (this.z > 0) shadow(ctx, 0, 0, 26, 7, 0.15);
      drawHorse(ctx, horseLook(h.rec), {
        t: this.t, pose: h.trick ? 'stand' : this.pose, face: this.faceX, z: this.z, noShadow: this.z > 0, jumpRot: this.jumpRot,
        trick: h.trick, trickT: h.trickT, scale: HORSE_SCALE,
        rider: (c) => {
          c.save(); c.translate(-1, -24 - rideBob); c.scale(1 / HORSE_SCALE, 1 / HORSE_SCALE);
          drawCharacter(c, L, { dir: 'right', t, seated: true, noShadow: true });
          c.restore();
        },
      });
    } else {
      drawCharacter(ctx, this.look, { dir: this.face, t: this.t, moving: this.speed > 0.3, run: this.speed > 4.2, blink: Math.sin(t * 0.9) > 0.985 });
    }
    ctx.restore();
  }
}
