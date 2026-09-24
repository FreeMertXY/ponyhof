// 14 niedliche Tierarten, alle nach rechts schauend gezeichnet (Ursprung = Füße).
import { rr, ell, circ, fs, shadow, heart } from './paint.js';
import { shade } from '../util.js';

function eye(ctx, x, y, r = 1.8) {
  ctx.fillStyle = '#2c2130'; ell(ctx, x, y, r, r * 1.2); ctx.fill();
  ctx.fillStyle = '#fff'; circ(ctx, x + r * 0.35, y - r * 0.45, r * 0.4); ctx.fill();
}
function blush(ctx, x, y, r = 2) { ctx.fillStyle = 'rgba(255,120,150,0.35)'; ell(ctx, x, y, r, r * 0.65); ctx.fill(); }

const D = {
  rabbit(ctx, t, m, st) {
    const hop = m ? Math.abs(Math.sin(t * 9)) * 6 : 0;
    shadow(ctx, 0, 0, 9, 3);
    ctx.translate(0, -hop);
    const c = '#d8c2ae';
    circ(ctx, -8, -8, 3.5); fs(ctx, '#fff');
    ell(ctx, -1, -8, 9, 7); fs(ctx, c);
    ell(ctx, 3, -3, 3, 2); fs(ctx, shade(c, -0.05));
    // Ohren
    const ew = st === 'alert' ? 0 : Math.sin(t * 2) * 0.1;
    for (const [x, r] of [[5, -0.25 + ew], [8, 0.05 + ew]]) {
      ctx.save(); ctx.translate(x, -15); ctx.rotate(r);
      ell(ctx, 0, -7, 2.6, 7); fs(ctx, c);
      ell(ctx, 0, -7, 1.2, 5); ctx.fillStyle = '#ffc2d4'; ctx.fill();
      ctx.restore();
    }
    circ(ctx, 7, -14, 6); fs(ctx, c);
    eye(ctx, 9, -15, 1.5);
    ctx.fillStyle = '#ff8fb1'; circ(ctx, 12.6, -13, 1.1); ctx.fill();
    blush(ctx, 9, -11.5, 1.8);
  },
  cat(ctx, t, m, st) {
    shadow(ctx, 0, 0, 11, 3);
    const c = '#f2a65a', d = '#d7843c';
    const tw = Math.sin(t * 3) * 0.3;
    ctx.save(); ctx.translate(-9, -10); ctx.rotate(-0.8 + tw);
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-4, -8, 0, -14); ctx.stroke();
    ctx.restore();
    const lg = m ? Math.sin(t * 12) * 2 : 0;
    for (const x of [-6, 5]) { rr(ctx, x - 1.8 + lg * (x > 0 ? 1 : -1) * 0.5, -6, 3.6, 6, 1.6); fs(ctx, c, 1); }
    ell(ctx, -1, -9, 10, 5.5); fs(ctx, c);
    ctx.strokeStyle = d; ctx.lineWidth = 1.5;
    for (const x of [-6, -2, 2]) { ctx.beginPath(); ctx.moveTo(x, -14); ctx.lineTo(x + 1, -10); ctx.stroke(); }
    circ(ctx, 8, -15, 6.5); fs(ctx, c);
    for (const x of [4, 10.5]) { ctx.beginPath(); ctx.moveTo(x - 2.5, -19); ctx.lineTo(x, -25); ctx.lineTo(x + 2.5, -19); ctx.closePath(); fs(ctx, c, 1.2); }
    if (st === 'happy') { ctx.strokeStyle = '#2c2130'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(10, -15, 1.6, Math.PI + 0.3, -0.3); ctx.stroke(); }
    else eye(ctx, 10, -15.5, 1.5);
    ctx.fillStyle = '#ff8fb1'; circ(ctx, 13.8, -13.5, 1); ctx.fill();
    blush(ctx, 10, -12, 1.8);
    ctx.strokeStyle = 'rgba(80,60,60,0.5)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(13, -12.5); ctx.lineTo(18, -13.5); ctx.moveTo(13, -12); ctx.lineTo(18, -11); ctx.stroke();
  },
  puppy(ctx, t, m, st) {
    shadow(ctx, 0, 0, 11, 3);
    const c = '#f3dcb4', d = '#b0764a';
    const wag = Math.sin(t * (st === 'happy' ? 18 : 6)) * 0.5;
    ctx.save(); ctx.translate(-9, -11); ctx.rotate(-0.6 + wag);
    ell(ctx, 0, -4, 2.2, 5); fs(ctx, c); ctx.restore();
    const lg = m ? Math.sin(t * 12) * 2 : 0;
    for (const x of [-6, 5]) { rr(ctx, x - 2 + lg * (x > 0 ? 1 : -1) * 0.5, -6, 4, 6, 1.8); fs(ctx, c, 1); }
    ell(ctx, -1, -10, 10, 6); fs(ctx, c);
    ell(ctx, -3, -12, 4, 3); ctx.fillStyle = d; ctx.fill();
    circ(ctx, 8, -16, 7); fs(ctx, c);
    ell(ctx, 13, -13.5, 4, 3); fs(ctx, '#fff4e0', 1);
    ctx.save(); ctx.translate(4, -20); ctx.rotate(0.4 + Math.sin(t * 5) * 0.08);
    ell(ctx, 0, 5, 3, 6.5); fs(ctx, d); ctx.restore();
    eye(ctx, 9.5, -17, 1.6);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 16.5, -14.5, 1.4); ctx.fill();
    blush(ctx, 9, -13, 1.8);
    if (st === 'happy') { ctx.fillStyle = '#ff8fa3'; ell(ctx, 13.5, -10.5, 1.5, 2); ctx.fill(); }
  },
  duckling(ctx, t) {
    const bob = Math.sin(t * 3) * 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 0, 11 + Math.sin(t * 2) * 1.5, 3, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.translate(0, bob);
    const c = '#ffe066';
    ell(ctx, -1, -4, 8, 5.5); fs(ctx, c);
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-12, -9); ctx.lineTo(-8, -3); ctx.fill();
    circ(ctx, 5, -10, 5); fs(ctx, c);
    ctx.beginPath(); ctx.moveTo(9, -10.5); ctx.quadraticCurveTo(14, -10, 9.5, -8); ctx.closePath(); fs(ctx, '#ff9f43', 1);
    eye(ctx, 6.5, -11, 1.3);
    blush(ctx, 6, -8.3, 1.4);
    ell(ctx, -2, -5, 4, 2.4, -0.3); ctx.fillStyle = shade(c, -0.08); ctx.fill();
  },
  hedgehog(ctx, t, m, st) {
    shadow(ctx, 0, 0, 10, 3);
    const ball = st === 'curl';
    const c = '#8a6a55';
    if (ball) { circ(ctx, 0, -7, 7.5); fs(ctx, c); }
    ctx.fillStyle = shade(c, -0.15);
    for (let i = 0; i < 11; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      ctx.beginPath(); ctx.moveTo(-1 + Math.cos(a) * 6, -5 + Math.sin(a) * 5);
      ctx.lineTo(-1 + Math.cos(a) * 12, -5 + Math.sin(a) * 10); ctx.lineTo(-1 + Math.cos(a + 0.2) * 6, -5 + Math.sin(a + 0.2) * 5); ctx.fill();
    }
    ctx.beginPath(); ctx.ellipse(-1, -5, 10, 8, 0, Math.PI, 0); ctx.closePath(); fs(ctx, c);
    if (ball) return;
    ell(ctx, 8, -4, 5, 4, 0.2); fs(ctx, '#f0d6b8');
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 12.8, -3.5, 1.3); ctx.fill();
    eye(ctx, 8.5, -5.5, 1.2);
    blush(ctx, 8, -2.5, 1.4);
    const lg = m ? Math.sin(t * 14) * 1 : 0;
    for (const x of [-5, 3]) { rr(ctx, x - 1.2 + lg, -1.5, 2.4, 2.5, 1); ctx.fillStyle = '#6b4a3a'; ctx.fill(); }
  },
  fox(ctx, t, m, st) {
    shadow(ctx, 0, 0, 12, 3);
    const c = '#f08a3c';
    ctx.save(); ctx.translate(-10, -10); ctx.rotate(-0.3 + Math.sin(t * 3) * 0.15);
    ell(ctx, -6, -2, 8, 4.5, 0.3); fs(ctx, c);
    ell(ctx, -12, -4.5, 3.5, 3, 0.3); fs(ctx, '#fff', 1);
    ctx.restore();
    const lg = m ? Math.sin(t * 14) * 3 : 0;
    for (const [x, k] of [[-6, 1], [6, -1]]) { rr(ctx, x - 1.8 + lg * k * 0.5, -7, 3.6, 7, 1.6); fs(ctx, '#3b2a33', 1); }
    ell(ctx, 0, -11, 10, 5.5); fs(ctx, c);
    ell(ctx, 6, -9, 4, 3.5); fs(ctx, '#fff', 1);
    ctx.beginPath(); ctx.moveTo(4, -21); ctx.lineTo(5, -28); ctx.lineTo(9, -21); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, -21); ctx.lineTo(11, -28); ctx.lineTo(13, -20); ctx.closePath(); fs(ctx, c, 1);
    ctx.beginPath(); ctx.moveTo(2, -17); ctx.quadraticCurveTo(8, -26, 14, -18); ctx.lineTo(20, -14); ctx.quadraticCurveTo(10, -9, 3, -13); ctx.closePath(); fs(ctx, c);
    ctx.beginPath(); ctx.moveTo(10, -14.5); ctx.lineTo(20, -14); ctx.quadraticCurveTo(12, -9.5, 6, -12); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#2c2130'; circ(ctx, 20, -14.2, 1.2); ctx.fill();
    eye(ctx, 10, -17.5, 1.4);
  },
  squirrel(ctx, t, m) {
    shadow(ctx, 0, 0, 8, 2.6);
    const c = '#c8663a';
    const hop = m ? Math.abs(Math.sin(t * 11)) * 4 : 0;
    ctx.translate(0, -hop);
    ctx.save(); ctx.translate(-5, -6); ctx.rotate(Math.sin(t * 2.5) * 0.12);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-14, -2, -12, -24, -2, -22); ctx.bezierCurveTo(-8, -18, -8, -8, 2, -4); ctx.closePath(); fs(ctx, shade(c, 0.1));
    ctx.restore();
    ell(ctx, 1, -7, 6, 6.5); fs(ctx, c);
    ell(ctx, 3, -5, 3, 4); fs(ctx, '#ffe4c4', 1);
    circ(ctx, 5, -15, 5); fs(ctx, c);
    ctx.beginPath(); ctx.moveTo(2, -18); ctx.lineTo(2.5, -23); ctx.lineTo(5, -19); ctx.closePath(); fs(ctx, c, 1);
    eye(ctx, 7, -16, 1.3);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 9.8, -14, 0.9); ctx.fill();
    blush(ctx, 6.5, -12.8, 1.3);
    ell(ctx, 7, -8, 2.2, 2.6); fs(ctx, '#9a6a3a', 1);
  },
  deer(ctx, t, m, st) {
    shadow(ctx, 0, 0, 13, 3.2);
    const c = '#c98a52';
    const la = m ? Math.sin(t * 12) * 0.5 : 0;
    for (const [x, a] of [[-9, la], [-6, -la], [7, -la], [10, la]]) {
      ctx.save(); ctx.translate(x, -12); ctx.rotate(a); rr(ctx, -1.5, 0, 3, 12, 1.4); fs(ctx, shade(c, -0.05), 1); ctx.restore();
    }
    ell(ctx, 0, -15, 12, 6.5); fs(ctx, c);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const [x, y] of [[-6, -17], [-2, -19], [2, -17], [-4, -14], [5, -19]]) { circ(ctx, x, y, 1.1); ctx.fill(); }
    ell(ctx, -11, -18, 2.5, 2); fs(ctx, '#fff', 1);
    const neck = st === 'graze' ? 0.9 : 0;
    ctx.save(); ctx.translate(8, -18); ctx.rotate(neck);
    rr(ctx, -2, -12, 6, 13, 3); fs(ctx, c);
    circ(ctx, 4, -14, 5.5); fs(ctx, c);
    ell(ctx, 9, -12.5, 3.5, 2.8); fs(ctx, shade(c, 0.25), 1);
    for (const [x, r] of [[0, -0.6], [3, -0.2]]) { ctx.save(); ctx.translate(x, -18); ctx.rotate(r); ell(ctx, 0, -3, 2.2, 4.5); fs(ctx, c, 1); ctx.restore(); }
    eye(ctx, 5, -15, 1.5);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 12, -13, 1); ctx.fill();
    ctx.restore();
  },
  frog(ctx, t, m) {
    const hop = m ? Math.abs(Math.sin(t * 8)) * 7 : 0;
    shadow(ctx, 0, 0, 8, 2.6);
    ctx.translate(0, -hop);
    const c = '#7fd36a';
    ell(ctx, 0, -5, 8.5, 6); fs(ctx, c);
    ell(ctx, 1, -3, 5, 3); fs(ctx, '#d9f5b8', 1);
    for (const x of [-3.5, 3.5]) { circ(ctx, x, -11, 3.4); fs(ctx, c); eye(ctx, x + 0.4, -11.3, 1.6); }
    ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -6.5, 3, 0.3, Math.PI - 0.3); ctx.stroke();
    blush(ctx, -5.5, -6, 1.5); blush(ctx, 5.5, -6, 1.5);
    const throat = Math.max(0, Math.sin(t * 2.5)) * 1.5;
    if (throat > 0.2) { ell(ctx, 0, -2.5, 3 + throat, 2 + throat * 0.6); fs(ctx, '#e9fbd0', 1); }
  },
  butterfly(ctx, t, m, st, col = '#ff9ecb') {
    const fl = 0.35 + Math.abs(Math.sin(t * 14)) * 0.65;
    const y = -18 + Math.sin(t * 3) * 3;
    ctx.fillStyle = 'rgba(60,40,70,0.12)'; ell(ctx, 0, 0, 4, 1.4); ctx.fill();
    ctx.translate(0, y);
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s * fl, 1);
      ell(ctx, 5, -3, 6, 5, -0.4); fs(ctx, col, 1.2);
      ell(ctx, 4, 3.5, 4, 3.5, 0.4); fs(ctx, shade(col, 0.25), 1.2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; circ(ctx, 6, -3.5, 1.5); ctx.fill();
      ctx.restore();
    }
    rr(ctx, -1.2, -6, 2.4, 11, 1.2); ctx.fillStyle = '#4a3a4a'; ctx.fill();
    ctx.strokeStyle = '#4a3a4a'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-2.5, -10); ctx.moveTo(0, -6); ctx.lineTo(2.5, -10); ctx.stroke();
  },
  crab(ctx, t, m) {
    shadow(ctx, 0, 0, 10, 2.8);
    const c = '#ff7b5c';
    const sc = m ? Math.sin(t * 16) * 1.5 : 0;
    ctx.strokeStyle = shade(c, -0.2); ctx.lineWidth = 1.6;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s * 5, -4 + i * 1.5); ctx.lineTo(s * (10 + i), -1 + i * 1.3 + (i % 2 ? sc : -sc)); ctx.stroke(); }
    ell(ctx, 0, -6, 8, 5.5); fs(ctx, c);
    const cl = Math.sin(t * 4) * 0.2;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(s * 7, -10); ctx.rotate(s * (0.4 + cl));
      circ(ctx, 0, -4, 3.5); fs(ctx, c, 1.2);
      ctx.fillStyle = '#fff5'; circ(ctx, -1, -5.5, 1); ctx.fill();
      ctx.restore();
    }
    for (const x of [-2.5, 2.5]) { ctx.strokeStyle = shade(c, -0.2); ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x, -13); ctx.stroke(); eye(ctx, x, -14, 1.5); }
    ctx.strokeStyle = '#8a3a3a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -6, 2, 0.4, Math.PI - 0.4); ctx.stroke();
    blush(ctx, -4.5, -6, 1.3); blush(ctx, 4.5, -6, 1.3);
  },
  seal(ctx, t, m, st) {
    shadow(ctx, 0, 0, 14, 3.4);
    const c = '#a9b3c4';
    const rock = Math.sin(t * 2) * 0.05;
    ctx.rotate(rock);
    ctx.beginPath(); ctx.moveTo(-16, -2); ctx.quadraticCurveTo(-8, -14, 6, -12); ctx.quadraticCurveTo(12, -6, 10, 0); ctx.lineTo(-16, 0); ctx.closePath(); fs(ctx, c);
    ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-21, -6); ctx.lineTo(-20, 0); ctx.closePath(); fs(ctx, c, 1);
    circ(ctx, 9, -13, 6.5); fs(ctx, c);
    ell(ctx, 13, -11, 3.6, 2.8); fs(ctx, '#d6dde8', 1);
    eye(ctx, 10, -15, 1.8);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 15.5, -12, 1); ctx.fill();
    ctx.strokeStyle = 'rgba(60,60,80,0.5)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(14, -10.5); ctx.lineTo(19, -11); ctx.moveTo(14, -10); ctx.lineTo(19, -9); ctx.stroke();
    blush(ctx, 9.5, -10.5, 1.8);
    ctx.save(); ctx.translate(2, -4); ctx.rotate(0.5 + (st === 'happy' ? Math.sin(t * 12) * 0.5 : 0));
    ell(ctx, 3, 0, 5, 2.2); fs(ctx, shade(c, -0.1), 1); ctx.restore();
  },
  owl(ctx, t, m, st) {
    // sitzt auf einem Ast/Baumstumpf
    rr(ctx, -9, -8, 18, 8, 3); fs(ctx, '#9a6a4a');
    ctx.fillStyle = '#c69a74'; ell(ctx, 0, -8, 9, 2.5); ctx.fill();
    const c = '#9c7a5c';
    const tilt = Math.sin(t * 0.8) * 0.15;
    ctx.save(); ctx.translate(0, -8); ctx.rotate(tilt);
    ell(ctx, 0, -10, 8.5, 10); fs(ctx, c);
    ell(ctx, 0, -7, 5.5, 6.5); fs(ctx, '#e8d2b0', 1);
    for (const x of [-4, 4]) { ctx.beginPath(); ctx.moveTo(x * 1.7, -16); ctx.lineTo(x * 2, -23); ctx.lineTo(x * 0.6, -17); ctx.closePath(); fs(ctx, c, 1); }
    for (const x of [-3.8, 3.8]) {
      circ(ctx, x, -14, 3.8); fs(ctx, '#fff8e8', 1);
      const blinkNow = Math.sin(t * 0.7) > 0.97;
      if (blinkNow) { ctx.strokeStyle = '#2c2130'; ctx.beginPath(); ctx.moveTo(x - 2, -14); ctx.lineTo(x + 2, -14); ctx.stroke(); }
      else { ctx.fillStyle = '#ffc83d'; circ(ctx, x, -14, 2.4); ctx.fill(); ctx.fillStyle = '#2c2130'; circ(ctx, x, -14, 1.4); ctx.fill(); ctx.fillStyle = '#fff'; circ(ctx, x + 0.6, -14.7, 0.6); ctx.fill(); }
    }
    ctx.beginPath(); ctx.moveTo(-1.3, -11.5); ctx.lineTo(1.3, -11.5); ctx.lineTo(0, -9); ctx.closePath(); ctx.fillStyle = '#f0a040'; ctx.fill();
    ctx.restore();
  },
  alpaca(ctx, t, m, st) {
    shadow(ctx, 0, 0, 12, 3.2);
    const c = '#f7ecd8';
    const la = m ? Math.sin(t * 9) * 0.4 : 0;
    for (const [x, a] of [[-8, la], [-4, -la], [5, -la], [9, la]]) {
      ctx.save(); ctx.translate(x, -9); ctx.rotate(a); rr(ctx, -1.8, 0, 3.6, 9, 1.6); fs(ctx, shade(c, -0.08), 1); ctx.restore();
    }
    for (const [x, y, r] of [[-7, -14, 6], [0, -16, 6.5], [7, -14, 6], [-3, -10, 5.5], [4, -10, 5.5]]) { circ(ctx, x, y, r); fs(ctx, c, 1.2); }
    rr(ctx, 6, -32, 6.5, 18, 3); fs(ctx, c);
    for (const [x, y, r] of [[9, -33, 5], [6, -30, 3.5], [12, -30, 3.5]]) { circ(ctx, x, y, r); fs(ctx, c, 1); }
    ell(ctx, 13, -29, 3.5, 2.8); fs(ctx, '#f0dcc0', 1);
    for (const x of [6.5, 10.5]) { ell(ctx, x, -38.5, 1.4, 3.2); fs(ctx, c, 1); }
    eye(ctx, 11, -31.5, 1.4);
    blush(ctx, 11, -28.5, 1.6);
    ctx.fillStyle = '#3b2a3a'; circ(ctx, 16, -29.5, 0.8); ctx.fill();
    ctx.fillStyle = '#ff9ecb'; rr(ctx, 5.5, -26, 7.5, 2.5, 1.2); ctx.fill();
  },
};

// Langhaarkatze (Maumau, Manni)
function fluffyCat(ctx, t, m, st, P) {
  shadow(ctx, 0, 0, 12, 3.2);
  const lg = m ? Math.sin(t * 12) * 2.2 : 0;
  const tw = Math.sin(t * (st === 'happy' ? 6 : 2.2)) * 0.25;
  // Schweif
  ctx.save(); ctx.translate(-9, -9); ctx.rotate(-0.15 + tw);
  for (let i = 0; i < 6; i++) { circ(ctx, -i * 0.9 + i * i * 0.12, -i * 2.6, 3.4 - i * 0.12); fs(ctx, i > 3 && P.tailTip ? P.tailTip : P.body, 0.9); }
  ctx.restore();
  // Beine
  for (const [x, k] of [[-6, 1], [5, -1]]) { rr(ctx, x - 2.3 + lg * k * 0.4, -6, 4.6, 6.5, 2.2); fs(ctx, P.paws, 1); }
  // Körper
  ell(ctx, -1, -10, 11.5, 8); fs(ctx, P.body);
  ctx.save(); ell(ctx, -1, -10, 11.5, 8); ctx.clip();
  for (const [x, y, rx, ry, c] of P.patches) { ctx.fillStyle = c; ell(ctx, x, y, rx, ry, 0.3); ctx.fill(); }
  ctx.fillStyle = P.chest; ell(ctx, 6, -5, 7, 6); ctx.fill();
  ctx.restore();
  // Halskrause
  for (const [x, y, r] of [[5, -13, 4.5], [8, -10, 4.5], [4, -8, 4], [9, -15, 3.6]]) { circ(ctx, x, y, r); fs(ctx, P.chest, 0.8, '#d8d2cc'); }
  // Kopf
  const hy = -20 + (st === 'happy' ? Math.sin(t * 3) * 0.6 : 0);
  for (const x of [4.5, 11]) { ctx.beginPath(); ctx.moveTo(x - 3, hy - 4); ctx.lineTo(x - 0.5, hy - 11); ctx.lineTo(x + 2.8, hy - 4); ctx.closePath(); fs(ctx, P.ear, 1); ctx.fillStyle = '#ffc2d4'; ctx.beginPath(); ctx.moveTo(x - 1.4, hy - 5); ctx.lineTo(x - 0.4, hy - 8.5); ctx.lineTo(x + 1.2, hy - 5); ctx.closePath(); ctx.fill(); }
  circ(ctx, 8, hy, 7.5); fs(ctx, P.head);
  ctx.save(); circ(ctx, 8, hy, 7.5); ctx.clip();
  for (const [x, y, rx, ry, c] of P.headPatches) { ctx.fillStyle = c; ell(ctx, x, y + hy + 20, rx, ry, 0.2); ctx.fill(); }
  ctx.fillStyle = P.muzzle; ell(ctx, 12.5, hy + 3, 4.5, 3.8); ctx.fill();
  ctx.restore();
  // Wangenfell
  for (const [x, y] of [[3, hy + 5], [6, hy + 6.5]]) { circ(ctx, x, y, 2.6); fs(ctx, P.chest, 0.6, '#ddd'); }
  if (st === 'happy') { ctx.strokeStyle = '#2c2130'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(10.5, hy - 0.5, 1.8, Math.PI + 0.3, -0.3); ctx.stroke(); }
  else { ctx.fillStyle = P.eye; ell(ctx, 10.5, hy - 0.8, 1.9, 2.2); ctx.fill(); ctx.fillStyle = '#2c2130'; ell(ctx, 10.8, hy - 0.8, 0.8, 1.7); ctx.fill(); ctx.fillStyle = '#fff'; circ(ctx, 11.2, hy - 1.8, 0.6); ctx.fill(); }
  ctx.fillStyle = '#ff9fb4'; circ(ctx, 15.2, hy + 1.8, 1.1); ctx.fill();
  blush(ctx, 11, hy + 3.5, 1.6);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(14, hy + 3); ctx.lineTo(21, hy + 1.5); ctx.moveTo(14, hy + 3.6); ctx.lineTo(21, hy + 4.5); ctx.stroke();
}

D.maumau = (ctx, t, m, st) => fluffyCat(ctx, t, m, st, {
  body: '#fbf8f4', chest: '#ffffff', paws: '#fbf8f4', ear: '#2c2528', head: '#fbf8f4', muzzle: '#ffffff', eye: '#9ccf6a', tailTip: '#2c2528',
  patches: [[-6, -14, 7, 5, '#2c2528'], [-9, -9, 4, 4, '#d9853e'], [0, -16, 4, 3, '#d9853e']],
  headPatches: [[5, -26, 7, 5, '#2c2528'], [3, -21, 3.5, 4.5, '#2c2528'], [9, -27, 3, 2.5, '#d9853e'], [4.5, -19, 2, 2.5, '#d9853e']],
});
D.manni = (ctx, t, m, st) => fluffyCat(ctx, t, m, st, {
  body: '#80828f', chest: '#f7f5f2', paws: '#f7f5f2', ear: '#6d6f7c', head: '#80828f', muzzle: '#f2f0ee', eye: '#f0a23c', tailTip: '#6d6f7c',
  patches: [[-4, -15, 8, 4, '#737582']],
  headPatches: [[7, -27, 6, 3, '#6d6f7c']],
});
D.mira = (ctx, t, m, st) => {
  shadow(ctx, 0, 0, 9, 2.6);
  const tan = '#c9965e', blk = '#34303a', silver = '#8d8a96';
  const wag = Math.sin(t * (st === 'happy' || m ? 18 : 5)) * 0.45;
  ctx.save(); ctx.translate(-8, -9); ctx.rotate(-0.8 + wag); ell(ctx, 0, -3, 2, 4); fs(ctx, blk, 1); ctx.restore();
  const lg = m ? Math.sin(t * 16) * 2 : 0;
  for (const [x, k] of [[-5, 1], [4, -1]]) { rr(ctx, x - 1.8 + lg * k * 0.4, -5.5, 3.6, 5.5, 1.7); fs(ctx, tan, 1); }
  // wuscheliger Körper mit schwarzem Sattel
  ell(ctx, -1, -8.5, 8, 5); fs(ctx, tan);
  ctx.beginPath(); ctx.ellipse(-1.5, -10, 7.4, 3.8, 0, Math.PI * 1.05, Math.PI * 1.95 + 0.3); ctx.quadraticCurveTo(-1, -7.5, -8.6, -9.2); ctx.closePath(); fs(ctx, blk, 0.8, '#1f1c22');
  ctx.strokeStyle = 'rgba(170,170,185,0.55)'; ctx.lineWidth = 0.7;
  for (const x of [-6, -3, 0, 3]) { ctx.beginPath(); ctx.moveTo(x, -12.5); ctx.quadraticCurveTo(x + 1, -11, x, -9.5); ctx.stroke(); }
  // Kopf
  const hy = -15.5;
  for (const [x, r] of [[4, -0.3], [8.6, 0.3]]) { ctx.save(); ctx.translate(x, hy - 3.6); ctx.rotate(r + (st === 'happy' ? Math.sin(t * 8) * 0.12 : 0)); ctx.beginPath(); ctx.moveTo(-1.8, 1); ctx.lineTo(0, -4.6); ctx.lineTo(1.8, 1); ctx.closePath(); fs(ctx, tan, 0.9, '#8a5a30'); ctx.restore(); }
  circ(ctx, 6.5, hy, 5.2); fs(ctx, tan);
  ctx.fillStyle = silver; ctx.beginPath(); ctx.ellipse(6, hy - 2.6, 4.6, 2.6, 0, Math.PI, 0); ctx.fill();
  for (const [x, y] of [[4.5, hy - 4.2], [7.5, hy - 4.6]]) { circ(ctx, x, y, 1.5); ctx.fill(); }
  // Bart und Wuschelschnauze
  for (const [x, y, r] of [[10.5, hy + 2.2, 2.6], [8.5, hy + 3.6, 2.3], [11.8, hy + 3.6, 2]]) { circ(ctx, x, y, r); fs(ctx, '#ddb07a', 0.6, '#b88a55'); }
  ctx.fillStyle = '#1e1a1e'; circ(ctx, 12.6, hy + 0.8, 1.2); ctx.fill();
  eye(ctx, 8, hy - 0.6, 1.45);
  if (st === 'happy') { ctx.fillStyle = '#ff8fa3'; ell(ctx, 11, hy + 5, 1, 1.4); ctx.fill(); }
};

const BUTTERFLY_COLS = ['#ff9ecb', '#b79cf0', '#7ec8ff', '#ffd166', '#8fe0c0'];

// o: { face, t, moving, state, variant, hearts }
export function drawAnimal(ctx, species, o = {}) {
  const f = D[species];
  if (!f) return;
  ctx.save();
  if ((o.face || 1) < 0) ctx.scale(-1, 1);
  const extra = species === 'butterfly' ? BUTTERFLY_COLS[(o.variant || 0) % BUTTERFLY_COLS.length] : undefined;
  f(ctx, o.t || 0, !!o.moving, o.state || 'idle', extra);
  ctx.restore();
}

export function drawAnimalPortrait(ctx, species, size, t = 0, silhouette = false) {
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  ctx.translate(size / 2, size * 0.8);
  const k = species === 'alpaca' || species === 'deer' ? size / 52 : species === 'owl' ? size / 40 : size / 36;
  ctx.scale(k, k);
  if (silhouette) {
    ctx.filter = 'brightness(0) opacity(0.25)';
  }
  drawAnimal(ctx, species, { t, face: 1 });
  ctx.restore();
  ctx.filter = 'none';
}

export { heart };
