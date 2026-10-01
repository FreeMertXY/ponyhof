// Kleine, bewegte Requisiten für Teil 2 (im Weltmaßstab, Ursprung = Füße/Boden).
import { rr, ell, circ, fs, shadow, flower, star, sparkle, heart, FONT } from './paint.js';
import { shade, hash2 } from '../util.js';

export function drawLeafPile(ctx, t, big = false, rustle = 0) {
  const k = big ? 1.6 : 1;
  ctx.save(); ctx.scale(k, k);
  shadow(ctx, 0, 0, 22, 6, 0.15);
  const cols = ['#e8874a', '#d9603c', '#f2b84a', '#c9783a', '#f0a04b'];
  for (let i = 0; i < 28; i++) {
    const a = hash2(i, 1, 5) * Math.PI, r = hash2(i, 2, 5);
    const x = Math.cos(a) * 20 * r * (i % 2 ? 1 : -1), y = -2 - Math.sin(a) * 16 * r - (1 - r) * 8;
    const w = rustle ? Math.sin(t * 30 + i) * rustle : 0;
    ctx.fillStyle = cols[i % cols.length];
    ell(ctx, x + w, y, 4.6, 2.8, i + w * 0.1); ctx.fill();
  }
  ctx.restore();
}

// Schneemann in drei Stufen
export function drawSnowman(ctx, t, stage) {
  if (stage <= 0) return;
  shadow(ctx, 0, 0, 20, 5, 0.15);
  const ball = (y, r) => { circ(ctx, 0, y, r); fs(ctx, '#ffffff', 1.6, '#c8d8ea'); ctx.fillStyle = 'rgba(200,216,234,0.5)'; ell(ctx, r * 0.3, y + r * 0.3, r * 0.6, r * 0.45); ctx.fill(); };
  ball(-14, 15);
  if (stage >= 2) ball(-38, 11);
  if (stage >= 3) {
    ball(-56, 8.5);
    // Gesicht
    ctx.fillStyle = '#2c2130'; circ(ctx, -3, -58, 1.4); ctx.fill(); circ(ctx, 3, -58, 1.4); ctx.fill();
    ctx.fillStyle = '#ff8a3c'; ctx.beginPath(); ctx.moveTo(0, -55.5); ctx.lineTo(11, -54); ctx.lineTo(0, -53); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2c2130'; for (let i = -2; i <= 2; i++) { circ(ctx, i * 1.8, -50.5 + Math.abs(i) * -0.5, 0.8); ctx.fill(); }
    // Schal
    rr(ctx, -10, -49, 20, 4, 2); fs(ctx, '#ef4f6f', 1);
    rr(ctx, 4, -47, 4, 11, 2); fs(ctx, '#ef4f6f', 1);
    // Mütze
    ctx.beginPath(); ctx.ellipse(0, -62, 8.5, 7, 0, Math.PI, 0); ctx.closePath(); fs(ctx, '#3a4a6a', 1);
    circ(ctx, 0, -70, 2.6); fs(ctx, '#ffffff', 1);
    // Knöpfe und Arme
    ctx.fillStyle = '#2c2130'; for (const y of [-41, -35]) { circ(ctx, 0, y, 1.3); ctx.fill(); }
    ctx.strokeStyle = '#7a5038'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -40); ctx.lineTo(-22, -48 + Math.sin(t * 2) * 2); ctx.moveTo(10, -40); ctx.lineTo(22, -47); ctx.stroke();
  }
}

// Schneekugel, die gerollt wird
export function drawSnowball(ctx, r) { shadow(ctx, 0, 0, r, r * 0.35, 0.15); circ(ctx, 0, -r, r); fs(ctx, '#ffffff', 1.4, '#c8d8ea'); }

// Laterne (auf dem Ufer oder schwimmend)
export function drawLantern(ctx, t, col = '#ffb3c8', lit = true, floatOnWater = false) {
  const bob = floatOnWater ? Math.sin(t * 2 + col.length) * 2 : 0;
  ctx.save(); ctx.translate(0, bob);
  if (floatOnWater) { ctx.fillStyle = 'rgba(255,230,160,0.25)'; ell(ctx, 0, 0, 16, 5); ctx.fill(); }
  else shadow(ctx, 0, 0, 8, 3, 0.15);
  rr(ctx, -8, -22, 16, 18, 5); fs(ctx, col, 1.4, shade(col, -0.3));
  if (lit) { ctx.fillStyle = `rgba(255,240,170,${0.75 + Math.sin(t * 8) * 0.15})`; ell(ctx, 0, -12, 4, 6); ctx.fill(); }
  ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(8, -16); ctx.moveTo(-8, -9); ctx.lineTo(8, -9); ctx.stroke();
  heart(ctx, 0, -25, 5, '#fff');
  ctx.restore();
}

// Leuchtender Bodenmarker (für Orte einer Aufgabe)
export function drawMarker(ctx, t, kind = 'spot') {
  const p = 0.5 + Math.sin(t * 3) * 0.5;
  ctx.save();
  ctx.fillStyle = `rgba(255,230,120,${0.18 + p * 0.15})`; ell(ctx, 0, 0, 18 + p * 4, 6 + p * 1.5); ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${0.5 + p * 0.4})`; ctx.lineWidth = 2; ell(ctx, 0, 0, 14 + p * 3, 4.5 + p); ctx.stroke();
  if (kind === 'camera') {
    ctx.translate(0, -30 + Math.sin(t * 2.5) * 3);
    rr(ctx, -12, -8, 24, 16, 4); fs(ctx, '#5a5470', 1.4, '#3a3450');
    circ(ctx, 0, 0, 5.5); fs(ctx, '#bfe6f7', 1.4, '#3a3450');
    rr(ctx, 5, -11, 6, 4, 1.5); fs(ctx, '#ff7eb6', 1);
    heart(ctx, -16, -12, 7, '#ff7eb6');
  } else if (kind === 'lantern') {
    ctx.translate(0, -6); ctx.globalAlpha = 0.55 + p * 0.3; drawLantern(ctx, t, '#fff0b8', false); ctx.globalAlpha = 1;
  } else if (kind === 'bird') {
    ctx.translate(0, -26 + Math.sin(t * 2.5) * 3); ctx.globalAlpha = 0.85;
    rr(ctx, -8, -8, 16, 14, 3); fs(ctx, '#8fd3f0', 1.2); ctx.beginPath(); ctx.moveTo(-11, -6); ctx.lineTo(0, -16); ctx.lineTo(11, -6); ctx.closePath(); fs(ctx, '#ef7f6f', 1.2);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 0, -1, 2.5); ctx.fill(); ctx.globalAlpha = 1;
  } else if (kind === 'dig') {
    ctx.strokeStyle = '#ef4f5f'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 3); ctx.moveTo(7, -7); ctx.lineTo(-7, 3); ctx.stroke();
    sparkle(ctx, 10, -14 - p * 4, 3 + p * 2, '#fff');
  }
  ctx.restore();
}

// Vogelhäuschen am Pfahl (aufgehängt)
export function drawBirdhouse(ctx, t) {
  shadow(ctx, 0, 0, 8, 3); rr(ctx, -2, -36, 4, 36, 2); fs(ctx, '#9a6a45', 1);
  rr(ctx, -10, -56, 20, 20, 3); fs(ctx, '#8fd3f0'); ctx.beginPath(); ctx.moveTo(-13, -54); ctx.lineTo(0, -66); ctx.lineTo(13, -54); ctx.closePath(); fs(ctx, '#ef7f6f');
  ctx.fillStyle = '#3b2a3a'; circ(ctx, 0, -46, 3.5); ctx.fill();
  // Rotkehlchen guckt raus
  const b = Math.sin(t * 1.3) > 0.2;
  if (b) { circ(ctx, 0, -47, 3); fs(ctx, '#a0683e', 0.8); ctx.fillStyle = '#ef7a4a'; circ(ctx, 0, -45.6, 1.8); ctx.fill(); ctx.fillStyle = '#2c2130'; circ(ctx, 1, -48, 0.7); ctx.fill(); }
}

// Pylon für die Reitstunde
export function drawCone(ctx, n, active, done, t) {
  shadow(ctx, 0, 0, 9, 3, 0.15);
  const col = done ? '#8fe0a0' : active ? '#ff9a3c' : '#ffc38a';
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, -22); ctx.lineTo(2, -22); ctx.lineTo(8, 0); ctx.closePath(); fs(ctx, col, 1.4, shade(col, -0.3));
  ctx.fillStyle = '#fff'; ctx.fillRect(-5, -12, 10, 3);
  rr(ctx, -10, -2, 20, 4, 2); fs(ctx, shade(col, -0.15), 1);
  ctx.font = `800 12px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(done ? '✓' : String(n), 0, -32); ctx.fillStyle = done ? '#3f9f5a' : '#d0601a'; ctx.fillText(done ? '✓' : String(n), 0, -32);
  if (active) { const p = 0.5 + Math.sin(t * 5) * 0.5; ctx.strokeStyle = `rgba(255,210,63,${0.5 + p * 0.5})`; ctx.lineWidth = 3; ell(ctx, 0, 0, 16 + p * 4, 5 + p); ctx.stroke(); }
}

// Schatztruhe
export function drawChest(ctx, t, open = 0) {
  shadow(ctx, 0, 0, 18, 5, 0.18);
  rr(ctx, -16, -18, 32, 18, 4); fs(ctx, '#a0683e', 1.6, '#6a4020');
  ctx.fillStyle = '#ffd24a'; ctx.fillRect(-16, -12, 32, 3); ctx.fillRect(-2, -18, 4, 18);
  ctx.save(); ctx.translate(0, -18); ctx.rotate(-open * 1.2);
  rr(ctx, -16, -10, 32, 10, 5); fs(ctx, '#b8784a', 1.6, '#6a4020'); ctx.fillStyle = '#ffd24a'; ctx.fillRect(-2, -10, 4, 10);
  ctx.restore();
  if (open > 0.3) { for (let i = 0; i < 4; i++) sparkle(ctx, -10 + i * 7, -26 - Math.sin(t * 4 + i) * 4, 3 + Math.sin(t * 5 + i), '#fff6b0'); heart(ctx, 0, -32 + Math.sin(t * 3) * 3, 12, '#ff6f9f'); }
  ctx.font = `700 7px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9a8'; ctx.fillText('K ♥ H', 0, -4);
}

// Gelber Postwagen (für Hildes Abreise)
export function drawPostVan(ctx, t, face = 1) {
  ctx.save(); ctx.scale(face, 1);
  shadow(ctx, 0, 0, 40, 8, 0.18);
  rr(ctx, -38, -40, 70, 34, 8); fs(ctx, '#ffd23f', 2, '#c9a020');
  rr(ctx, 14, -36, 24, 22, 6); fs(ctx, '#ffd23f', 2, '#c9a020');
  rr(ctx, 18, -33, 16, 11, 3); ctx.fillStyle = '#bfe6f7'; ctx.fill();
  ctx.fillStyle = '#3d5aa8'; ctx.fillRect(-36, -24, 66, 4);
  ctx.font = `800 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#3d5aa8'; ctx.fillText('POST', -12, -28);
  for (const x of [-24, 22]) { circ(ctx, x, -5, 7); fs(ctx, '#3b3440', 1.4); circ(ctx, x, -5, 3); ctx.fillStyle = '#c9c1d6'; ctx.fill(); }
  heart(ctx, -12, -12, 7, '#ff7eb6');
  ctx.restore();
}

// Pferdeschlitten mit Glöckchen
export function drawSleigh(ctx, t) {
  shadow(ctx, 0, 0, 30, 6, 0.15);
  ctx.strokeStyle = '#c9a020'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-30, -2); ctx.lineTo(24, -2); ctx.quadraticCurveTo(34, -2, 32, -12); ctx.stroke();
  rr(ctx, -26, -26, 44, 22, 8); fs(ctx, '#e8587a', 2, '#a83a5a');
  rr(ctx, -30, -34, 14, 30, 6); fs(ctx, '#e8587a', 2, '#a83a5a');
  ctx.fillStyle = '#fff'; rr(ctx, -24, -28, 40, 6, 3); ctx.fill();
  for (let i = 0; i < 4; i++) { circ(ctx, -18 + i * 10, -14, 2.2); ctx.fillStyle = '#ffd24a'; ctx.fill(); }
}

// Holzschlitten
export function drawSled(ctx) {
  shadow(ctx, 0, 0, 16, 4, 0.15);
  ctx.strokeStyle = '#8a5d40'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(12, -2); ctx.quadraticCurveTo(18, -2, 17, -8); ctx.stroke();
  rr(ctx, -14, -10, 26, 5, 2); fs(ctx, '#c98a5a', 1.4, '#8a5d40');
}

// Geschenkpaket
export function drawGift(ctx, col = '#ff7eb6') {
  rr(ctx, -7, -12, 14, 12, 2); fs(ctx, col, 1.2);
  ctx.fillStyle = '#fff'; ctx.fillRect(-1.2, -12, 2.4, 12); ctx.fillRect(-7, -7, 14, 2.4);
  heart(ctx, 0, -14, 6, '#fff');
}

// Kürbislaterne
export function drawPumpkinLamp(ctx, t) {
  shadow(ctx, 0, 0, 10, 3, 0.15);
  ell(ctx, 0, -8, 11, 8.5); fs(ctx, '#f28a2a', 1.4, '#c0601a');
  ctx.strokeStyle = '#d0701a'; ctx.lineWidth = 1; for (const x of [-5, 0, 5]) { ctx.beginPath(); ctx.ellipse(x * 0.6, -8, 3, 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = `rgba(255,${210 + Math.sin(t * 9) * 25},90,1)`;
  ctx.beginPath(); ctx.moveTo(-5, -11); ctx.lineTo(-2, -8); ctx.lineTo(-6, -8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(5, -11); ctx.lineTo(2, -8); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-5, -5); ctx.quadraticCurveTo(0, -1, 5, -5); ctx.quadraticCurveTo(0, -3, -5, -5); ctx.fill();
  ctx.fillStyle = '#5a8a3a'; ctx.fillRect(-1, -18, 2, 4);
}

// Storch im Nest (für das Postdach)
export function drawStorkInNest(ctx, t, i = 0) {
  const b = Math.sin(t * 1.5 + i) * 1.5;
  ctx.save(); ctx.translate(0, b * 0.3);
  ell(ctx, 0, -8, 7, 5); fs(ctx, '#ffffff', 1, '#d0d4dc');
  ctx.fillStyle = '#2c2130'; ell(ctx, -4, -7, 4, 3, 0.3); ctx.fill();
  rr(ctx, 1, -20, 3, 12, 1.5); fs(ctx, '#ffffff', 0.8, '#d0d4dc');
  circ(ctx, 3, -21, 3.2); fs(ctx, '#ffffff', 0.8, '#d0d4dc');
  ctx.fillStyle = '#ef5f3f'; ctx.beginPath(); ctx.moveTo(5, -22); ctx.lineTo(14 + b, -20); ctx.lineTo(5, -19.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2c2130'; circ(ctx, 4, -22, 0.8); ctx.fill();
  ctx.restore();
}

export { star, flower };
