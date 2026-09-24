// Dorfbewohner als Figuren in der Welt.
import { NPCS } from './data/npcs.js';
import { SPOTS, TILE } from './world.js';
import { drawCharacter, npcLook } from './draw/characters.js';
import { rr, outlinedText, FONT, heart } from './draw/paint.js';
import { dist } from './util.js';

export class NPC {
  constructor(id) {
    this.id = id;
    this.data = NPCS[id];
    this.look = npcLook(this.data.look);
    const s = SPOTS.npc[id];
    this.homeX = s.x; this.homeY = s.y;
    this.x = s.x; this.y = s.y;
    this.face = 'down';
    this.t = Math.random() * 5;
    this.target = null;
    this.wait = 2 + Math.random() * 4;
    this.moving = false;
    this.mode = 'home';
    this.visible = true;
    this.bubble = null; // kurzer Text über dem Kopf
    this.bubbleT = 0;
  }

  goTo(x, y, spd = 2.2) { this.target = { x, y, spd }; }

  update(dt, game) {
    this.t += dt;
    if (this.bubbleT > 0) this.bubbleT -= dt;
    const P = game.player;
    const dP = dist(this.x, this.y, P.x, P.y);
    if (this.target) {
      const dx = this.target.x - this.x, dy = this.target.y - this.y, d = Math.hypot(dx, dy);
      if (d < 0.1) { this.target = null; this.moving = false; }
      else {
        const s = Math.min(d, this.target.spd * dt);
        this.x += (dx / d) * s; this.y += (dy / d) * s;
        this.moving = true;
        this.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        return;
      }
    }
    this.moving = false;
    if (dP < 3.5 && !game.cutscene) {
      const dx = P.x - this.x, dy = P.y - this.y;
      this.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      return;
    }
    if (this.mode !== 'home') return;
    this.wait -= dt;
    if (this.wait <= 0) {
      this.wait = 3 + Math.random() * 5;
      if (Math.random() < 0.5) {
        const tx = this.homeX + (Math.random() - 0.5) * 2.4, ty = this.homeY + (Math.random() - 0.5) * 1.2;
        if (game.world.canStand(tx, ty, {})) this.goTo(tx, ty, 1.2);
      } else this.face = ['down', 'left', 'right', 'down'][Math.floor(Math.random() * 4)];
    }
  }

  say(text, sec = 3) { this.bubble = text; this.bubbleT = sec; }

  draw(ctx, game, t) {
    const X = this.x * TILE, Y = this.y * TILE;
    ctx.save();
    ctx.translate(X, Y);
    drawCharacter(ctx, this.look, { dir: this.face, t: this.t, moving: this.moving, blink: Math.sin(this.t * 0.8) > 0.985 });
    const top = this.data.kid ? -62 : -70;
    const news = game.cutscene ? null : game.quests.npcHasNews(this.id);
    if (news) {
      const b = Math.sin(t * 4) * 3;
      ctx.save(); ctx.translate(0, top - 14 + b);
      rr(ctx, -12, -14, 24, 24, 12);
      ctx.fillStyle = news === 'offer' ? '#ffd23f' : '#ff7eb6'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.font = `800 17px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(news === 'offer' ? '!' : '♥', 0, -1);
      ctx.restore();
    }
    const dP = dist(this.x, this.y, game.player.x, game.player.y);
    if (dP < 4 && !game.cutscene) {
      ctx.font = `700 12px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      outlinedText(ctx, this.data.name, 0, 12, '#fff', '#7a4a6a', 4);
    }
    if (this.bubbleT > 0 && this.bubble) {
      ctx.font = `600 13px ${FONT}`;
      const w = ctx.measureText(this.bubble).width + 18;
      ctx.globalAlpha = Math.min(1, this.bubbleT * 2);
      rr(ctx, -w / 2, top - 46, w, 26, 12); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = '#e8a0b8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#6b4a5e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.bubble, 0, top - 33);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    void heart;
  }
}
