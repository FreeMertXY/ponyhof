// Kleine Symbole für HUD, Inventar und Laden – alles im Code gezeichnet.
import { rr, ell, circ, fs, flower, star, heart, sparkle } from './paint.js';
import { pickupSprite, drawDecoIcon } from './objects.js';
import { ACCESSORIES, OUTFITS } from '../data/shop.js';
import { drawCharacter } from './characters.js';
import { SKINS } from '../data/npcs.js';
import { drawHorse } from './horse.js';

const D = {
  apple(c) { circ(c, 0, 3, 11); fs(c, '#ef4f5f', 2, '#b8323f'); c.fillStyle = '#fff8'; ell(c, -4, -1, 3, 4, -0.4); c.fill(); c.strokeStyle = '#7a5038'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -7); c.lineTo(1, -12); c.stroke(); c.fillStyle = '#6cc063'; ell(c, 5, -11, 5, 2.6, -0.4); c.fill(); },
  carrot(c) { c.beginPath(); c.moveTo(-9, -6); c.quadraticCurveTo(0, -12, 9, -6); c.lineTo(1, 14); c.closePath(); fs(c, '#ff9a3c', 2, '#d0701f'); c.strokeStyle = '#d0701f'; c.lineWidth = 1.5; for (const y of [-2, 3, 8]) { c.beginPath(); c.moveTo(-4 + y * 0.3, y); c.lineTo(1, y + 1); c.stroke(); } c.fillStyle = '#5fb85a'; for (const a of [-0.5, 0, 0.5]) { c.save(); c.translate(0, -9); c.rotate(a); ell(c, 0, -5, 2.4, 6); c.fill(); c.restore(); } },
  hay(c) { rr(c, -13, -10, 26, 22, 8); fs(c, '#f3cf6a', 2, '#c9a040'); c.strokeStyle = '#c96a4a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-13, 1); c.lineTo(13, 1); c.stroke(); c.strokeStyle = '#d9b050'; c.lineWidth = 1.2; for (let i = -9; i < 12; i += 5) { c.beginPath(); c.moveTo(i, -8); c.lineTo(i + 1, 10); c.stroke(); } },
  seed_carrot(c) { seedbag(c, '#ff9a3c'); },
  seed_sunflower(c) { seedbag(c, '#ffd23f'); },
  lavender(c) { c.strokeStyle = '#6aa85a'; c.lineWidth = 2; for (const x of [-4, 0, 4]) { c.beginPath(); c.moveTo(x * 0.3, 13); c.lineTo(x, -6); c.stroke(); for (let j = 0; j < 4; j++) { ell(c, x, -8 + j * 3.5, 2.5, 2.8); c.fillStyle = j % 2 ? '#a98be8' : '#b99af5'; c.fill(); } } rr(c, -5, 4, 10, 4, 2); c.fillStyle = '#ff9ecb'; c.fill(); },
  poppy(c) { c.strokeStyle = '#5aa05a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(3, 4, 0, -2); c.stroke(); flower(c, 0, -4, 7, '#ef4f5f', '#3b2a3a', 4); },
  sunflower(c) { c.strokeStyle = '#4f9a4f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 0); c.stroke(); flower(c, 0, -3, 8.5, '#ffd23f', '#9a6a3a', 11); },
  daisy(c) { c.strokeStyle = '#5aa05a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 0); c.stroke(); flower(c, 0, -3, 7, '#fff', '#ffd23f', 8); c.strokeStyle = '#e6d9e0'; c.lineWidth = 1; circ(c, 0, -3, 11); },
  mushroom(c) { rr(c, -4, -2, 8, 14, 3); fs(c, '#fff4e4', 1.5); c.beginPath(); c.ellipse(0, -1, 13, 11, 0, Math.PI, 0); c.closePath(); fs(c, '#e8584f', 2); c.fillStyle = '#fff'; for (const [x, y, r] of [[-6, -6, 2.4], [3, -8, 2.8], [8, -3, 1.8]]) { circ(c, x, y, r); c.fill(); } },
  shell(c) { c.beginPath(); c.moveTo(0, 11); c.lineTo(-13, -1); c.quadraticCurveTo(0, -18, 13, -1); c.closePath(); fs(c, '#ffd0dc', 2, '#e89ab0'); c.strokeStyle = '#e89ab0'; c.lineWidth = 1.3; for (const a of [-0.8, -0.3, 0.2, 0.7]) { c.beginPath(); c.moveTo(0, 11); c.lineTo(Math.sin(a) * 13, 11 - Math.cos(a) * 20); c.stroke(); } },
  bread(c) { ell(c, 0, 2, 14, 9); fs(c, '#e0a060', 2, '#b07030'); c.strokeStyle = '#f7d7a0'; c.lineWidth = 2; for (const x of [-6, 0, 6]) { c.beginPath(); c.moveTo(x - 3, -2); c.lineTo(x + 3, 4); c.stroke(); } },
  cake(c) { rr(c, -12, -2, 24, 14, 4); fs(c, '#f7d7a0', 2, '#c9a070'); rr(c, -12, -6, 24, 7, 3); fs(c, '#ffe0ec', 1.5, '#e9a0b8'); c.fillStyle = '#ef4f5f'; circ(c, 0, -9, 3.2); c.fill(); c.fillStyle = '#fff'; for (const x of [-8, -3, 3, 8]) { circ(c, x, -6, 1.6); c.fill(); } },
  juice(c) { rr(c, -7, -8, 14, 21, 4); fs(c, '#fff', 1.5, '#b8c8d8'); rr(c, -6, -1, 12, 13, 3); c.fillStyle = '#ffcf5a'; c.fill(); rr(c, -4, -13, 8, 6, 2); fs(c, '#6cc063', 1.2); D.apple && (() => { c.save(); c.translate(0, 5); c.scale(0.3, 0.3); D.apple(c); c.restore(); })(); },
  letter(c) { rr(c, -14, -9, 28, 19, 3); fs(c, '#fff9ee', 2, '#c9a88a'); c.strokeStyle = '#c9a88a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, -9); c.lineTo(0, 3); c.lineTo(14, -9); c.stroke(); heart(c, 0, 4, 9, '#ef4f5f'); },
  boards(c) { for (const [y, col] of [[-6, '#d9a878'], [1, '#c9985f'], [8, '#d9a878']]) { rr(c, -14, y - 3, 28, 7, 2); fs(c, col, 1.5, '#9a6a45'); } },
  invite(c) { rr(c, -12, -12, 24, 24, 4); fs(c, '#fff0f6', 2, '#ff9ecb'); heart(c, 0, 1, 12, '#ff6f9f'); sparkle(c, 8, -7, 3, '#ffd24a'); },
  horseshoe(c) { c.lineCap = 'round'; c.strokeStyle = '#b8860b'; c.lineWidth = 8; c.beginPath(); c.arc(0, 1, 9, Math.PI * 0.8, Math.PI * 2.2); c.stroke(); c.strokeStyle = '#ffd24a'; c.lineWidth = 5; c.stroke(); sparkle(c, 9, -9, 3.5, '#fff'); },
  coin(c) { circ(c, 0, 0, 12); fs(c, '#ffd24a', 2.4, '#c9981a'); circ(c, 0, 0, 8); c.strokeStyle = '#e8b320'; c.lineWidth = 1.5; c.stroke(); heart(c, 0, 2, 9, '#e8a820'); c.fillStyle = '#fff8'; ell(c, -5, -5, 2.5, 1.6, -0.6); c.fill(); },
  sun(c) { c.fillStyle = '#ffc93d'; for (let i = 0; i < 8; i++) { c.save(); c.rotate((i / 8) * Math.PI * 2); ell(c, 0, -12, 2.5, 4); c.fill(); c.restore(); } circ(c, 0, 0, 8); fs(c, '#ffd84a', 1.5, '#f0a820'); },
  moon(c) { c.beginPath(); c.arc(0, 0, 11, 0.6, Math.PI * 2 - 0.6 + Math.PI * 0.001); c.arc(5, -3, 8, Math.PI * 2 - 0.9, 1.0, true); c.closePath(); fs(c, '#fff3b0', 1.5, '#d9b84a'); sparkle(c, 9, 8, 3, '#fff3b0'); },
  rain(c) { for (const [x, y, r] of [[-6, 0, 7], [3, -3, 8], [9, 1, 6]]) { circ(c, x, y, r); c.fillStyle = '#e6eef8'; c.fill(); } c.strokeStyle = '#6cb8ff'; c.lineWidth = 2; c.lineCap = 'round'; for (const x of [-6, 0, 6]) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x - 2, 14); c.stroke(); } },
  rainbow(c) { ['#ff7a8a', '#ffd166', '#8fe08a', '#7ec8ff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(0, 8, 13 - i * 3, Math.PI, 0); c.stroke(); }); },
  heart(c) { heart(c, 0, 4, 22, '#ff6f9f'); },
  star(c) { star(c, 0, 0, 12); fs(c, '#ffd24a', 2, '#e0a020'); },
  bag(c) { rr(c, -12, -6, 24, 19, 7); fs(c, '#f2a65a', 2, '#b8753a'); c.strokeStyle = '#b8753a'; c.lineWidth = 3; c.beginPath(); c.arc(0, -6, 7, Math.PI, 0); c.stroke(); rr(c, -12, -4, 24, 8, 4); fs(c, '#ffc27a', 1.5, '#b8753a'); heart(c, 0, 9, 8, '#ff7eb6'); },
  scroll(c) { rr(c, -10, -12, 20, 24, 3); fs(c, '#fff4d6', 2, '#c9a070'); for (const y of [-12, 12]) { rr(c, -13, y - 3, 26, 6, 3); fs(c, '#e0b880', 1.5, '#b08050'); } c.strokeStyle = '#d9a0b0'; c.lineWidth = 1.6; for (const y of [-5, 0, 5]) { c.beginPath(); c.moveTo(-6, y); c.lineTo(6, y); c.stroke(); } },
  map(c) { c.beginPath(); c.moveTo(-13, -9); c.lineTo(-4, -12); c.lineTo(4, -9); c.lineTo(13, -12); c.lineTo(13, 10); c.lineTo(4, 13); c.lineTo(-4, 10); c.lineTo(-13, 13); c.closePath(); fs(c, '#bfe8a0', 2, '#6fa05a'); c.fillStyle = '#8fd3f0'; ell(c, 6, 3, 5, 4); c.fill(); c.strokeStyle = '#ef6f6f'; c.lineWidth = 2; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(-9, 6); c.quadraticCurveTo(-4, -8, 3, -4); c.stroke(); c.setLineDash([]); heart(c, 3, -3, 7, '#ef4f5f'); },
  rabbit(c) { c.save(); c.translate(0, 12); c.scale(1.1, 1.1); c.translate(-2, 0); rabbitHead(c); c.restore(); },
  stable(c) { c.beginPath(); c.moveTo(-14, -2); c.lineTo(0, -14); c.lineTo(14, -2); c.closePath(); fs(c, '#a94b4b', 2); rr(c, -11, -3, 22, 16, 2); fs(c, '#e8736a', 2); rr(c, -5, 3, 10, 10, 2); fs(c, '#fff5ee', 1.5); c.strokeStyle = '#e8736a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, 3); c.lineTo(5, 13); c.moveTo(5, 3); c.lineTo(-5, 13); c.stroke(); },
  gear(c) { c.fillStyle = '#b79cf0'; for (let i = 0; i < 8; i++) { c.save(); c.rotate((i / 8) * Math.PI * 2); rr(c, -3.5, -14, 7, 7, 2); c.fill(); c.restore(); } circ(c, 0, 0, 10); fs(c, '#b79cf0', 2, '#8a6ad0'); circ(c, 0, 0, 4); c.fillStyle = '#fff'; c.fill(); },
  horse(c) { c.save(); c.translate(-10, 16); c.scale(0.5, 0.5); drawHorse(c, { body: '#d98a52', dark: '#b86b3a', light: '#f6b98a', mane: '#f2d3a0', marking: 'blaze', acc: {} }, { noShadow: true, t: 0 }); c.restore(); },
  brush(c) { rr(c, -12, -6, 24, 10, 4); fs(c, '#c98a5a', 2); c.strokeStyle = '#fff4e0'; c.lineWidth = 2; for (let x = -10; x <= 10; x += 3) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 11); c.stroke(); } heart(c, 0, 0, 7, '#ff9ecb'); },
  hand(c) { ell(c, 0, 3, 9, 10); fs(c, '#ffd9c0', 2, '#d9a080'); for (const [x, y] of [[-7, -7], [-2, -10], [3, -10], [8, -6]]) { rr(c, x - 2.5, y, 5, 10, 2.5); fs(c, '#ffd9c0', 1.5, '#d9a080'); } heart(c, 0, 5, 8, '#ff9ecb'); },
  build(c) { rr(c, -4, -12, 8, 24, 3); fs(c, '#c98a5a', 2); rr(c, -12, -14, 24, 9, 3); fs(c, '#9aa0b8', 2); },
  whistle(c) { ell(c, 2, 2, 10, 8); fs(c, '#ffd24a', 2, '#c9981a'); rr(c, -14, -3, 12, 7, 3); fs(c, '#ffd24a', 2, '#c9981a'); c.fillStyle = '#6a5a70'; circ(c, 3, 1, 3); c.fill(); },
  trick(c) { star(c, 0, 0, 12); fs(c, '#b79cf0', 2); sparkle(c, 10, -10, 4, '#ffd24a'); },
  lock(c) { rr(c, -9, -2, 18, 14, 4); fs(c, '#c9c1d6', 2); c.strokeStyle = '#9a91a8'; c.lineWidth = 3; c.beginPath(); c.arc(0, -3, 6, Math.PI, 0); c.stroke(); },
};

function seedbag(c, col) {
  c.beginPath(); c.moveTo(-10, -8); c.lineTo(10, -8); c.lineTo(12, 13); c.lineTo(-12, 13); c.closePath(); fs(c, '#f0dcb8', 2, '#b89a70');
  c.fillStyle = '#b89a70'; rr(c, -10, -12, 20, 5, 2); c.fill();
  flower(c, 0, 3, 5, col, '#9a6a3a', 8);
}
function rabbitHead(c) {
  const col = '#e8d6c6';
  for (const [x, r] of [[-5, -0.2], [5, 0.2]]) { c.save(); c.translate(x, -18); c.rotate(r); ell(c, 0, -6, 3.5, 9); fs(c, col, 1.5); ell(c, 0, -6, 1.6, 6); c.fillStyle = '#ffc2d4'; c.fill(); c.restore(); }
  circ(c, 0, -10, 10); fs(c, col, 1.8);
  c.fillStyle = '#3b2a3a'; ell(c, -4, -11, 1.6, 2); c.fill(); ell(c, 4, -11, 1.6, 2); c.fill();
  c.fillStyle = '#ff8fb1'; circ(c, 0, -7, 1.6); c.fill();
  c.fillStyle = 'rgba(255,120,150,0.35)'; ell(c, -6, -7, 2.4, 1.6); c.fill(); ell(c, 6, -7, 2.4, 1.6); c.fill();
}

// Zubehör und Kleidung
function accIcon(c, id) {
  const a = ACCESSORIES[id];
  if (!a) return;
  const col = a.color === 'rainbow' ? '#ff9ecb' : a.color;
  if (a.slot === 'saddle') {
    c.beginPath(); c.moveTo(-14, -6); c.quadraticCurveTo(-10, 2, 0, 1); c.quadraticCurveTo(10, 2, 14, -7); c.quadraticCurveTo(15, 6, 8, 8); c.lineTo(-8, 8); c.quadraticCurveTo(-16, 6, -14, -6); c.closePath(); fs(c, col, 2);
    rr(c, -7, 6, 14, 10, 3); fs(c, col, 1.6);
    if (a.glitter) { sparkle(c, -6, -2, 3); sparkle(c, 7, 2, 2.5, '#fff6c4'); }
  } else if (a.slot === 'bow') {
    const cs = a.color === 'rainbow' ? ['#ff7a8a', '#7ec8ff'] : [col, col];
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-13, -8); c.lineTo(-13, 8); c.closePath(); fs(c, cs[0], 2);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(13, -8); c.lineTo(13, 8); c.closePath(); fs(c, cs[1], 2);
    circ(c, 0, 0, 4); fs(c, cs[0], 1.5);
  } else if (a.slot === 'wreath') {
    for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2; flower(c, Math.cos(an) * 10, Math.sin(an) * 10, 3.6, a.gold ? ['#ffd24a', '#fff1a8'][i % 2] : ['#ff9ecb', '#fff', '#b79cf0', '#ffd166'][i % 4], a.gold ? '#fff' : '#ffc83d'); }
  } else if (a.slot === 'blanket') {
    rr(c, -14, -10, 28, 20, 6); fs(c, col, 2);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    if (a.pattern === 'stars') for (const [x, y] of [[-7, -3], [4, -5], [0, 4], [8, 4]]) { star(c, x, y, 3); c.fill(); }
    else if (a.pattern === 'hearts') for (const [x, y] of [[-7, 0], [5, -3], [2, 6]]) heart(c, x, y, 7, 'rgba(255,255,255,0.85)');
    else { c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; for (let x = -10; x < 14; x += 6) { c.beginPath(); c.moveTo(x, -10); c.lineTo(x, 10); c.stroke(); } for (let y = -6; y < 10; y += 6) { c.beginPath(); c.moveTo(-14, y); c.lineTo(14, y); c.stroke(); } }
  }
}

function clothIcon(c, id) {
  if (id.startsWith('outfit_')) {
    const o = OUTFITS.find((x) => x.unlock === id);
    c.save(); c.translate(0, 26); c.scale(0.9, 0.9);
    drawCharacter(c, { skin: SKINS[1], hair: 'long', hairColor: '#c68b59', outfit: o || OUTFITS[0], hat: null }, { noShadow: true });
    c.restore();
  } else {
    const hat = id.replace('hat_', '');
    c.save(); c.translate(0, 34); c.scale(1.1, 1.1);
    drawCharacter(c, { skin: SKINS[1], hair: 'bob', hairColor: '#7a4a2e', outfit: OUTFITS[0], hat }, { noShadow: true });
    c.restore();
  }
}

// Zeichnet ein Symbol in ein neues Canvas
export function iconCanvas(id, size = 64, kind = 'item') {
  const cv = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = size * dpr; cv.height = size * dpr;
  const c = cv.getContext('2d');
  c.scale(dpr, dpr);
  drawIconTo(c, id, size, kind);
  return cv;
}

export function drawIconTo(c, id, size, kind = 'item') {
  c.save();
  if (kind === 'deco') { drawDecoIcon(c, id, size); c.restore(); return; }
  c.translate(size / 2, size / 2);
  const k = size / 32;
  c.scale(k, k);
  if (kind === 'acc') accIcon(c, id);
  else if (kind === 'cloth') clothIcon(c, id);
  else if (D[id]) D[id](c);
  else if (kind === 'pickup') { c.translate(0, 10); const s = pickupSprite(id); c.drawImage(s.c, -s.ax * 0.6, -s.ay * 0.6, s.w * 0.6, s.h * 0.6); }
  c.restore();
}

// Alle <i data-icon> im Dokument füllen
export function fillIcons(root = document) {
  root.querySelectorAll('i[data-icon]').forEach((el) => {
    if (el.firstChild) el.innerHTML = '';
    el.appendChild(iconCanvas(el.dataset.icon, 40));
  });
}
