// Mal-Helfer für den runden, weichen Bilderbuch-Stil.
import { shade } from '../util.js';

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ell(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2);
}

export function circ(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.abs(r), 0, Math.PI * 2);
}

// Füllen mit weicher dunklerer Kontur
export function fs(ctx, fill, lw = 1.6, outline = null) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (lw > 0) {
    ctx.strokeStyle = outline || shade(fill, -0.35);
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function shadow(ctx, x, y, rx, ry, a = 0.18) {
  ctx.fillStyle = `rgba(60,40,70,${a})`;
  ell(ctx, x, y, rx, ry);
  ctx.fill();
}

export function heart(ctx, x, y, s, color = '#ff6f9f') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 10, s / 10);
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-10, -4, -5, -11, 0, -5);
  ctx.bezierCurveTo(5, -11, 10, -4, 0, 3);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ell(ctx, -3.5, -5.5, 1.8, 1.2, -0.6);
  ctx.fill();
  ctx.restore();
}

export function star(ctx, x, y, r, points = 5, inner = 0.5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r * inner : r;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}

export function sparkle(ctx, x, y, r, color = '#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// kleine Blume (für Deko, Kränze, Wiesen)
export function flower(ctx, x, y, r, petal, center = '#ffd84a', n = 5) {
  ctx.fillStyle = petal;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    circ(ctx, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.75);
    ctx.fill();
  }
  ctx.fillStyle = center;
  circ(ctx, x, y, r * 0.6);
  ctx.fill();
}

// Offscreen-Canvas erzeugen (im Browser)
export function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

// Text mit Kontur (für Schilder, Schwebetexte)
export function outlinedText(ctx, text, x, y, fill = '#fff', stroke = '#6b4a5e', lw = 4) {
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export const FONT = '"Fredoka", "Baloo 2", "Nunito", "Comic Sans MS", "Trebuchet MS", sans-serif';
