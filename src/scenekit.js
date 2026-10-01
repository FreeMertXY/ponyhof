// Gemeinsame Bausteine für die Szenen von Teil 2.
import { TILE } from './world.js';

const T = TILE;

// Ein Requisit in der Welt mit eigener Zeichenfunktion (Ursprung = Boden)
export class Prop {
  constructor(x, y, draw, sortY = 0) { this.x = x; this.y = y; this._draw = draw; this.sortDy = sortY; this.visible = true; }
  draw(ctx, g, t) { ctx.save(); ctx.translate(this.x * T, this.y * T); this._draw(ctx, t, g); ctx.restore(); }
}

export async function walkNpc(g, n, x, y, spd = 2.2) {
  n.mode = 'scene'; n.goTo(x, y, spd);
  for (let i = 0; i < 300 && n.target; i++) await g.wait(0.05);
}

export function placeNpc(g, id, x, y, face = 'down') {
  const n = g.npcById(id);
  if (!n) return null;
  n.mode = 'scene'; n.target = null; n.x = x; n.y = y; n.face = face; n.visible = true;
  return n;
}

export function homeAll(g, ids) {
  for (const id of ids) { const n = g.npcById(id); if (!n) continue; n.x = n.homeX; n.y = n.homeY; n.mode = 'home'; n.target = null; }
  g.refreshNpcVisibility?.();
}

export async function digAnim(g) {
  const P = g.player;
  for (let i = 0; i < 3; i++) { g.audio.play('dig'); g.particles.dust(P.x + 0.5, P.y + 0.2, 6); g.renderer.shake = 2; await g.wait(0.35); }
}
