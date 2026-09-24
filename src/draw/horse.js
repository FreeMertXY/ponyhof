// Pferde im niedlichen Bilderbuchstil (Seitenansicht, nach rechts; links = gespiegelt).
import { rr, ell, circ, fs, shadow, flower, star, sparkle, heart } from './paint.js';
import { shade, mix } from '../util.js';
import { COATS } from '../data/horses.js';
import { ACCESSORIES } from '../data/shop.js';

const RAINBOW = ['#ff7a8a', '#ffb366', '#ffe066', '#8fe08a', '#7ec8ff', '#b79cf0'];

export function horseLook(rec) {
  const coat = COATS[rec.coat] || COATS.fuchs;
  return {
    body: coat.body, dark: coat.dark, light: coat.light, mane: rec.mane || coat.mane,
    dapple: !!coat.dapple, patches: coat.patches || null,
    marking: rec.marking || 'none', socks: !!rec.socks,
    acc: rec.acc || {}, foal: !!rec.foal,
  };
}

function legAngles(pose, t, speed) {
  // [farFront, farBack, nearFront, nearBack]
  let f = 0, amp = 0, ph = [0, 0, 0, 0];
  if (pose === 'walk') { f = 7; amp = 0.35; ph = [Math.PI * 0.5, 0, Math.PI * 1.5, Math.PI]; }
  else if (pose === 'trot') { f = 11; amp = 0.5; ph = [Math.PI, 0, 0, Math.PI]; }
  else if (pose === 'gallop') { f = 13; amp = 0.75; ph = [0.5, Math.PI + 0.5, 0, Math.PI]; }
  if (!f) return [0, 0, 0, 0];
  return ph.map((p) => Math.sin(t * f * (speed || 1) + p) * amp);
}

function leg(ctx, x, y, a, len, col, sock, hoof, bend = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  rr(ctx, -3, -2, 6.2, len * 0.55 + 2, 3); fs(ctx, col, 1.3);
  ctx.translate(0, len * 0.5);
  ctx.rotate(bend);
  rr(ctx, -2.7, -1, 5.6, len * 0.5 + 1, 2.6); fs(ctx, sock ? '#fbf7f3' : col, 1.3);
  rr(ctx, -3.2, len * 0.5 - 1.6, 6.6, 3.8, 1.6); fs(ctx, hoof, 1);
  ctx.restore();
}

function bow(ctx, x, y, c, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, -3.5); ctx.lineTo(-5, 3.5); ctx.closePath(); fs(ctx, c, 1);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, -3.5); ctx.lineTo(5, 3.5); ctx.closePath(); fs(ctx, c, 1);
  circ(ctx, 0, 0, 1.8); fs(ctx, shade(c, -0.15), 0.8);
  ctx.restore();
}

// o: { face (1|-1), pose, t, speed, rider(fn), z, noShadow, trick, trickT, glow }
export function drawHorse(ctx, H, o = {}) {
  const t = o.t || 0;
  let pose = o.pose || 'stand';
  const face = o.face || 1;
  const s = (H.foal ? 0.62 : 1) * (o.scale || 1);
  ctx.save();
  if (!o.noShadow) shadow(ctx, 0, 0, 22 * s, 6 * s, o.z ? 0.12 : 0.2);
  ctx.translate(0, -(o.z || 0));
  ctx.scale(face * s, s);
  // Tricks
  let bodyRot = 0, pivotX = -12;
  let tuck = 0;
  if (o.trick === 'rear') {
    const k = Math.sin(Math.min(1, (o.trickT || 0) / 1.6) * Math.PI);
    bodyRot = -0.6 * k; tuck = k; pose = 'stand';
  } else if (o.trick === 'bow') {
    const k = Math.sin(Math.min(1, (o.trickT || 0) / 1.6) * Math.PI);
    bodyRot = 0.22 * k; pose = 'stand';
  } else if (pose === 'jump') {
    tuck = 1; bodyRot = o.jumpRot || 0; pivotX = 0;
  }
  const gallopRock = pose === 'gallop' ? Math.sin(t * 13) * 0.06 : 0;
  const bob = pose === 'trot' ? Math.abs(Math.sin(t * 11)) * 2 : pose === 'gallop' ? Math.abs(Math.sin(t * 13)) * 3 : pose === 'walk' ? Math.abs(Math.sin(t * 7)) * 1 : Math.sin(t * 1.8) * 0.4;
  ctx.translate(pivotX, 0);
  ctx.rotate(bodyRot + gallopRock);
  ctx.translate(-pivotX, -bob);
  const la = legAngles(pose, t, 1);
  if (tuck) { la[0] = la[2] = -1.0 * tuck; la[1] = la[3] = 0.7 * tuck; }
  const col = H.body, far = shade(H.body, -0.12), hoof = '#5a4550';
  const hy = -20;
  const legLen = 19;
  // Schweif
  const sw = Math.sin(t * (pose === 'stand' || pose === 'graze' ? 1.6 : 6)) * (pose === 'gallop' ? 0.25 : 0.15);
  ctx.save();
  ctx.translate(-19, -30);
  ctx.rotate(sw + (pose === 'gallop' ? -0.5 : 0));
  ctx.lineCap = 'round';
  ctx.strokeStyle = shade(H.mane, -0.25); ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-9, 6, -7, 22); ctx.stroke();
  ctx.strokeStyle = H.mane === 'rainbow' ? RAINBOW[2] : H.mane; ctx.lineWidth = 6.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-9, 6, -7, 22); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-2, 3); ctx.quadraticCurveTo(-8, 8, -7, 18); ctx.stroke();
  ctx.restore();
  // hintere Beine (weiter weg)
  leg(ctx, 13, hy, la[0], legLen, far, H.socks, hoof, tuck * 1.2);
  leg(ctx, -10, hy, la[1], legLen, far, H.socks, hoof, -tuck * 0.6);
  // Körper
  ell(ctx, 0, -26, 20.5, 12.5);
  fs(ctx, col);
  ctx.save();
  ell(ctx, 0, -26, 20.5, 12.5); ctx.clip();
  if (H.patches) {
    ctx.fillStyle = H.patches;
    ell(ctx, -9, -30, 8, 7, 0.4); ctx.fill();
    ell(ctx, 8, -20, 7, 5, -0.3); ctx.fill();
    ell(ctx, 2, -36, 5, 4); ctx.fill();
  }
  if (H.dapple) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (const [x, y, r] of [[-12, -27, 2.4], [-6, -22, 2], [-2, -30, 2.6], [5, -24, 2], [10, -30, 1.8], [-9, -33, 1.7], [2, -20, 1.6], [13, -23, 1.5]]) { circ(ctx, x, y, r); ctx.fill(); }
  }
  // Bauchschatten + Glanz
  ctx.fillStyle = 'rgba(80,40,60,0.12)';
  ell(ctx, 0, -16, 20, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ell(ctx, -3, -34, 11, 3.5, -0.1); ctx.fill();
  ctx.restore();
  // Zubehör: Decke
  const A = H.acc || {};
  if (A.blanket && ACCESSORIES[A.blanket]) {
    const b = ACCESSORIES[A.blanket];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-14, -35); ctx.quadraticCurveTo(-2, -41, 10, -35);
    ctx.lineTo(10, -22); ctx.quadraticCurveTo(-2, -17, -14, -22); ctx.closePath();
    fs(ctx, b.color);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    if (b.pattern === 'check') {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6;
      for (let x = -14; x < 12; x += 5) { ctx.beginPath(); ctx.moveTo(x, -42); ctx.lineTo(x, -16); ctx.stroke(); }
      for (let y = -38; y < -16; y += 5) { ctx.beginPath(); ctx.moveTo(-15, y); ctx.lineTo(11, y); ctx.stroke(); }
    } else if (b.pattern === 'stars') {
      for (const [x, y] of [[-9, -30], [0, -25], [6, -32], [-4, -35], [-10, -23]]) { star(ctx, x, y, 2.4); ctx.fill(); }
    } else if (b.pattern === 'hearts') {
      for (const [x, y] of [[-9, -29], [1, -24], [5, -32], [-5, -35]]) heart(ctx, x, y + 1, 5, 'rgba(255,255,255,0.8)');
    }
    ctx.restore();
    ctx.strokeStyle = '#fff6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(10, -22); ctx.quadraticCurveTo(-2, -17, -14, -22); ctx.stroke();
  }
  // Sattel
  if (A.saddle && ACCESSORIES[A.saddle]) {
    const sd = ACCESSORIES[A.saddle];
    rr(ctx, -7, -35, 12, 13, 4); fs(ctx, shade(sd.color, -0.1));
    ctx.beginPath();
    ctx.moveTo(-10, -41); ctx.quadraticCurveTo(-8, -35, -1, -35.5); ctx.quadraticCurveTo(5, -35, 7, -40.5);
    ctx.quadraticCurveTo(8, -34, 4, -32); ctx.lineTo(-7, -32); ctx.quadraticCurveTo(-11, -34, -10, -41); ctx.closePath();
    fs(ctx, sd.color);
    ctx.strokeStyle = '#8a6a5a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-1, -24); ctx.lineTo(-1, -16); ctx.stroke();
    rr(ctx, -3.5, -16.5, 5, 3, 1.2); fs(ctx, '#d9d2c8', 1);
    if (sd.glitter) { sparkle(ctx, -4, -37, 2.2); sparkle(ctx, 3, -34, 1.6, '#fff9d6'); }
  }
  // Reiterin
  if (o.rider) o.rider(ctx);
  // vordere Beine (nah)
  leg(ctx, 9, hy, la[2], legLen, col, H.socks, hoof, tuck * 1.2);
  leg(ctx, -14, hy, la[3], legLen, col, H.socks, hoof, -tuck * 0.6);
  // Hals + Kopf
  let neckRot = 0;
  if (pose === 'graze') neckRot = 0.95 + Math.sin(t * 2) * 0.05;
  else if (pose === 'alert') neckRot = -0.15;
  else if (o.trick === 'bow') neckRot = 0.6 * Math.sin(Math.min(1, (o.trickT || 0) / 1.6) * Math.PI);
  else if (pose === 'gallop') neckRot = 0.18 + Math.sin(t * 13) * 0.08;
  else neckRot = Math.sin(t * 1.2) * 0.03;
  ctx.save();
  ctx.translate(11, -29);
  ctx.rotate(neckRot);
  ctx.translate(-11, 29);
  const hs = H.foal ? 1.18 : 1;
  // Hals
  ctx.beginPath();
  ctx.moveTo(4, -33); ctx.quadraticCurveTo(12, -46, 18, -52);
  ctx.lineTo(27, -45); ctx.quadraticCurveTo(21, -34, 19, -21);
  ctx.quadraticCurveTo(10, -22, 4, -33); ctx.closePath();
  fs(ctx, col);
  // Blumenkranz um den Hals
  if (A.wreath && ACCESSORIES[A.wreath]) {
    const w = ACCESSORIES[A.wreath];
    const cols = w.gold ? ['#ffd24a', '#fff1a8', '#ffc83d'] : ['#ff9ecb', '#fff', '#b79cf0', '#ffd166'];
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + (i / 6) * 2.4;
      flower(ctx, 14 + Math.cos(a) * 4.5, -33 + Math.sin(a) * 9, 2.3, cols[i % cols.length], w.gold ? '#fff' : '#ffc83d');
    }
  }
  ctx.save();
  ctx.translate(24, -49);
  ctx.scale(hs, hs);
  ctx.translate(-24, 49);
  // Ohren
  for (const [x, r] of [[19.5, -0.35], [24, -0.05]]) {
    ctx.save(); ctx.translate(x, -56); ctx.rotate(r + (pose === 'alert' ? -0.1 : Math.sin(t * 0.9 + x) * 0.06));
    ctx.beginPath(); ctx.moveTo(-3, 1); ctx.quadraticCurveTo(0, -11, 3, 1); ctx.closePath(); fs(ctx, col);
    ctx.beginPath(); ctx.moveTo(-1.4, 0); ctx.quadraticCurveTo(0, -7, 1.4, 0); ctx.closePath(); ctx.fillStyle = mix(col, '#ffb3c8', 0.5); ctx.fill();
    ctx.restore();
  }
  // Kopf
  ell(ctx, 24, -49, 10, 8.8); fs(ctx, col);
  ell(ctx, 31.5, -43.5, 7, 6, 0.25); fs(ctx, mix(H.light, '#ffc9c2', H.body === '#f6f3f0' || H.body === '#fbf7f2' ? 0.4 : 0.15));
  // Abzeichen
  ctx.fillStyle = '#fffaf6';
  if (H.marking === 'blaze') {
    ctx.beginPath(); ctx.moveTo(22.5, -57); ctx.quadraticCurveTo(26, -56, 26.5, -52); ctx.quadraticCurveTo(31, -46, 35, -42.5); ctx.quadraticCurveTo(32, -41, 29, -44); ctx.quadraticCurveTo(24, -50, 21.5, -55); ctx.closePath(); ctx.fill();
  } else if (H.marking === 'star') {
    star(ctx, 24, -54, 3.2, 4, 0.45); ctx.fill();
  } else if (H.marking === 'snip') {
    ell(ctx, 33, -46, 3, 2.2, 0.3); ctx.fill();
  }
  // Auge
  ctx.fillStyle = '#2c2130';
  ell(ctx, 25.8, -50.5, 2.7, 3.3); ctx.fill();
  ctx.fillStyle = '#fff';
  circ(ctx, 26.7, -51.8, 1.1); ctx.fill();
  circ(ctx, 25.2, -49, 0.5); ctx.fill();
  ctx.strokeStyle = '#2c2130'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(27.8, -52.8); ctx.lineTo(29.3, -54.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26.7, -53.6); ctx.lineTo(27.6, -55.4); ctx.stroke();
  // Wange
  ctx.fillStyle = 'rgba(255,120,150,0.3)';
  ell(ctx, 27, -46, 2.6, 1.8); ctx.fill();
  // Nüster + Mund
  ctx.fillStyle = 'rgba(70,40,50,0.55)';
  ell(ctx, 35.3, -45.5, 1.2, 0.9, 0.4); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,50,0.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(33.5, -41.5, 2.2, 0.3, 1.8); ctx.stroke();
  // Stirnlocke
  const mc = H.mane === 'rainbow' ? RAINBOW[4] : H.mane;
  for (const [x, y, r] of [[20.5, -56, 3.4], [23.5, -56.5, 3], [25.5, -55, 2.4]]) { circ(ctx, x, y, r); fs(ctx, mc, 1.1, shade(mc, -0.3)); }
  ctx.restore();
  // Mähne am Hals
  const pts = [[19, -54, 4.2], [16.5, -50, 4.6], [14, -46, 4.8], [11.5, -42, 4.8], [9, -38.5, 4.5], [6.5, -35, 4]];
  pts.forEach(([x, y, r], i) => {
    const c = H.mane === 'rainbow' ? RAINBOW[i % RAINBOW.length] : mc;
    const wob = Math.sin(t * (pose === 'gallop' ? 12 : 3) + i) * (pose === 'gallop' ? 1.4 : 0.4);
    circ(ctx, x - 2 + wob, y, r); fs(ctx, c, 1.1, shade(c, -0.3));
  });
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (const [x, y] of [[16, -51], [11, -43]]) { ell(ctx, x - 3, y, 1.4, 2.6, 0.5); ctx.fill(); }
  // Schleifen
  if (A.bow && ACCESSORIES[A.bow]) {
    const b = ACCESSORIES[A.bow];
    const cs = b.color === 'rainbow' ? RAINBOW : [b.color];
    bow(ctx, 16, -50, cs[0], 0.85);
    bow(ctx, 9.5, -40, cs[2 % cs.length], 0.85);
  }
  ctx.restore();
  if (o.glow) { sparkle(ctx, -10 + Math.sin(t * 3) * 6, -44, 2.5, '#fff6c4'); }
  ctx.restore();
}

// kleines Pferd für Menüs/Porträts
export function drawHorsePortrait(ctx, H, size, t = 0) {
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size * 0.6, size * 0.1, size / 2, size / 2, size * 0.75);
  g.addColorStop(0, '#f4ffe9');
  g.addColorStop(1, '#cfeec0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.translate(size * 0.42, size * 0.9);
  const k = size / 75;
  ctx.scale(k, k);
  drawHorse(ctx, H, { t, pose: 'stand', face: 1 });
  ctx.restore();
}
