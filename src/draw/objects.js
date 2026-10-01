// Objekte der Welt: Bäume, Gebäude, Zäune, Deko, Sammelsachen.
// Statische Objekte werden einmal in Offscreen-Canvas vorgezeichnet (Sprite-Cache).
import { TILE } from '../world.js';
import { rr, ell, circ, fs, shadow, flower, star, sparkle, heart, makeCanvas, FONT } from './paint.js';
import { shade, mix, hash2 } from '../util.js';

const T = TILE;
let RS = 1;
const cache = new Map();

export function setRenderScale(s) { RS = s; cache.clear(); }

// Sprite im Cache: w,h = Größe in Weltpixeln, ax,ay = Ankerpunkt im Sprite
function sprite(key, w, h, ax, ay, fn) {
  let s = cache.get(key);
  if (s) return s;
  const c = makeCanvas(w * RS, h * RS);
  const ctx = c.getContext('2d');
  ctx.scale(RS, RS);
  ctx.translate(ax, ay);
  fn(ctx);
  s = { c, w, h, ax, ay };
  cache.set(key, s);
  return s;
}

export function drawSprite(ctx, s, x, y, alpha = 1) {
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(s.c, x - s.ax, y - s.ay, s.w, s.h);
  if (alpha < 1) ctx.globalAlpha = 1;
}

// ---------- Bäume ----------
function canopy(ctx, blobs, base, light, dark) {
  for (const [x, y, r] of blobs) { circ(ctx, x, y + 3, r); ctx.fillStyle = dark; ctx.fill(); }
  for (const [x, y, r] of blobs) { circ(ctx, x, y, r); ctx.fillStyle = base; ctx.fill(); }
  for (const [x, y, r] of blobs) { circ(ctx, x - r * 0.25, y - r * 0.3, r * 0.55); ctx.fillStyle = light; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1; }
}

function trunk(ctx, h, w = 11, col = '#a0704c') {
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + 1, -h * 0.6, -w / 2 + 2, -h);
  ctx.lineTo(w / 2 - 2, -h); ctx.quadraticCurveTo(w / 2 - 1, -h * 0.6, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 + 3, 2, 0, 2); ctx.quadraticCurveTo(-w / 2 - 3, 2, -w / 2, 0);
  ctx.closePath(); fs(ctx, col, 1.5);
  ctx.strokeStyle = shade(col, -0.2); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-1, -4); ctx.lineTo(-1.5, -h * 0.6); ctx.stroke();
}

// Kahle Winteräste mit Schnee
function winterTree(ctx, v, s) {
  const birch = v === 'birch';
  const col = birch ? '#f4f0ea' : '#9a6a4c';
  trunk(ctx, 34, birch ? 9 : 12, col);
  ctx.strokeStyle = birch ? '#d9d2c8' : '#8a5d40'; ctx.lineCap = 'round';
  const br = [[0, -34, -18, -64, 5], [0, -34, 16, -66, 5], [0, -40, 2, -78, 4.5], [-9, -50, -26, -56, 3], [9, -52, 26, -58, 3], [-14, -58, -10, -76, 2.6], [12, -60, 18, -76, 2.6]];
  for (const [x0, y0, x1, y1, w] of br) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + 3, (y0 + y1) / 2, x1, y1); ctx.stroke(); }
  ctx.fillStyle = '#ffffff';
  for (const [, , x1, y1, w] of br) { ell(ctx, x1, y1 - 1, w + 2.5, 2.4, 0); ctx.fill(); }
  ell(ctx, -6, -46, 6, 2, -0.3); ctx.fill(); ell(ctx, 8, -48, 6, 2, 0.3); ctx.fill();
  if (v === 'bigblossom') { ctx.fillStyle = '#ffd6e7'; for (let i = 0; i < 5; i++) circ(ctx, -20 + i * 10, -66 + (i % 2) * 6, 2), ctx.fill(); }
  void s;
}

export function treeSprite(v, s = 1, extra = '', season = 'summer') {
  const key = `tree:${v}:${s.toFixed(2)}:${extra}:${season}`;
  const big = v === 'bigblossom' ? 1.8 : 1;
  const W = 110 * s * big, H = 140 * s * big;
  return sprite(key, W, H, W / 2, H - 10 * s, (ctx) => {
    ctx.scale(s * big, s * big);
    shadow(ctx, 0, 0, 26, 8, 0.2);
    if (season === 'winter' && v !== 'pine' && v !== 'palm') { winterTree(ctx, v, s); return; }
    if (v === 'pine') {
      trunk(ctx, 16, 9, '#8a5d40');
      const layers = [[-16, 30, '#4f9a62'], [-36, 25, '#5aa86b'], [-54, 19, '#66b676'], [-70, 12, '#72c282']];
      for (const [y, r, c] of layers) {
        ctx.beginPath(); ctx.moveTo(-r - 4, y + 6); ctx.quadraticCurveTo(0, y - r * 1.5, r + 4, y + 6); ctx.quadraticCurveTo(0, y + 12, -r - 4, y + 6); ctx.closePath();
        fs(ctx, c, 1.6, shade(c, -0.3));
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(ctx, -r * 0.35, y - 2, r * 0.35, 4, -0.3); ctx.fill();
      }
      if (extra === 'snow' || season === 'winter') {
        ctx.fillStyle = '#fff';
        for (const [y, r] of layers) { ctx.beginPath(); ctx.moveTo(-r - 2, y + 4); ctx.quadraticCurveTo(0, y - r * 1.25, r + 2, y + 4); ctx.quadraticCurveTo(0, y - r * 0.6, -r - 2, y + 4); ctx.closePath(); ctx.fill(); }
        ell(ctx, 0, -76, 7, 4); ctx.fill();
      }
    } else if (v === 'palm') {
      ctx.strokeStyle = '#b98a5a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -30, 4, -62); ctx.stroke();
      ctx.strokeStyle = '#9c7048'; ctx.lineWidth = 1.5;
      for (let i = 1; i < 7; i++) { const yy = -i * 9; ctx.beginPath(); ctx.moveTo(-3 + i * 0.6, yy); ctx.lineTo(8 + (i < 4 ? i : 7 - i), yy - 1); ctx.stroke(); }
      for (const [a, l] of [[-2.6, 34], [-2.0, 32], [-1.3, 30], [-0.6, 32], [-0.1, 30], [-3.1, 26]]) {
        ctx.save(); ctx.translate(4, -62); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * 0.5, -10, l, 6); ctx.quadraticCurveTo(l * 0.5, 2, 0, 0); ctx.closePath();
        fs(ctx, '#63bf6f', 1.4, '#3f8f50');
        ctx.restore();
      }
      for (const [x, y] of [[0, -60], [7, -59], [3, -56]]) { circ(ctx, x, y, 3.5); fs(ctx, '#8a5a3a', 1); }
    } else {
      const birch = v === 'birch';
      trunk(ctx, 30, birch ? 9 : 12, birch ? '#f4f0ea' : '#a0704c');
      if (birch) {
        ctx.fillStyle = '#4a4040';
        for (const [x, y] of [[-2, -8], [2, -16], [-2, -23]]) { rr(ctx, x - 2, y, 4, 2, 1); ctx.fill(); }
      }
      let base = '#6cbf5f', light = '#b8f09a', dark = '#4d9a52';
      if (v === 'blossom' || v === 'bigblossom') { base = '#ffb0cc'; light = '#ffe3ee'; dark = '#e98aad'; }
      if (birch) { base = '#9ad66a'; light = '#dcf7a8'; dark = '#72b456'; }
      if (v === 'apple') { base = '#6cc063'; light = '#bff29f'; dark = '#4f9d55'; }
      if (v === 'chestnut') { base = '#5aae58'; light = '#a8e690'; dark = '#3f8a48'; }
      if (season === 'autumn') {
        const k = Math.floor(hash2(Math.round(s * 100), 7, 3) * 3);
        if (v === 'oak') [base, light, dark] = [['#f0a04b', '#ffd28a', '#c9763a'], ['#e8704a', '#ffb08a', '#b9503a'], ['#f2c14e', '#ffe9a0', '#c99a3a']][k];
        else if (birch) { base = '#f2d35a'; light = '#fff0a8'; dark = '#c9a83a'; }
        else if (v === 'apple') { base = '#d9b04a'; light = '#f6dc8a'; dark = '#a8843a'; }
        else if (v === 'chestnut') { base = '#e08a3a'; light = '#ffc27a'; dark = '#b0602a'; }
        else if (v === 'blossom') { base = '#f2905a'; light = '#ffc79a'; dark = '#c96a40'; }
        else if (v === 'bigblossom') { base = '#f4a08a'; light = '#ffd6c4'; dark = '#d9786a'; }
      } else if (season === 'spring') {
        if (v === 'oak' || v === 'chestnut') { base = '#8fd870'; light = '#d8f8b0'; dark = '#69b456'; }
        else if (birch) { base = '#b2e682'; light = '#e8fcc0'; dark = '#88c464'; }
        else if (v === 'apple') { base = '#f6e2ea'; light = '#ffffff'; dark = '#e2b8c8'; }
      }
      const blobs = [[-16, -44, 18], [16, -44, 18], [0, -58, 22], [-10, -34, 15], [11, -33, 15], [0, -40, 18]];
      canopy(ctx, blobs, base, light, dark);
      if (v === 'chestnut') {
        if (season === 'summer' || season === 'spring') for (let i = 0; i < 6; i++) { const cx = hash2(i, 8, 3) * 44 - 22, cy = -34 - hash2(i, 9, 3) * 36; ctx.fillStyle = '#fff6e6'; ell(ctx, cx, cy, 2.2, 4.5); ctx.fill(); ctx.fillStyle = '#ffb3c8'; circ(ctx, cx, cy + 1, 1); ctx.fill(); }
        else for (let i = 0; i < 7; i++) { const cx = hash2(i, 8, 3) * 44 - 22, cy = -32 - hash2(i, 9, 3) * 36; circ(ctx, cx, cy, 3.6); fs(ctx, '#9acd5a', 1, '#6a9a3a'); ctx.fillStyle = '#7a3e1e'; circ(ctx, cx + 1, cy + 1, 1.8); ctx.fill(); }
      }
      if (season === 'autumn' && v !== 'pine') {
        // ein paar fallende Blätter am Boden
        for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#e8874a', '#d9603c', '#f2b84a'][i % 3]; ell(ctx, hash2(i, 2, s * 9) * 50 - 25, -2 + hash2(i, 3, s * 9) * 6, 3, 1.8, i); ctx.fill(); }
      }
      if (season === 'spring' && (v === 'oak' || v === 'apple')) {
        for (let i = 0; i < 9; i++) flower(ctx, hash2(i, 5, 11) * 50 - 25, -30 - hash2(i, 6, 11) * 40, 2.2, v === 'apple' ? '#ffb3cf' : '#fff', '#ffe07a');
      }
      if (v === 'blossom' || v === 'bigblossom') {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 14; i++) { const hx = hash2(i, 3, 7) * 56 - 28, hy = -30 - hash2(i, 4, 7) * 44; flower(ctx, hx, hy, 2.2, '#fff', '#ffcf4a'); }
      }
      if (v === 'apple' && season !== 'spring') {
        const n = extra === 'empty' ? 2 : 8;
        for (let i = 0; i < n; i++) {
          const ax = hash2(i, 1, 9) * 48 - 24, ay = -30 - hash2(i, 2, 9) * 36;
          circ(ctx, ax, ay, 4.2); fs(ctx, '#ef4f5f', 1.2, '#b8323f');
          ctx.fillStyle = '#fff9'; circ(ctx, ax - 1.3, ay - 1.4, 1.3); ctx.fill();
        }
      }
      if (v === 'oak' && hash2(s * 100, 1, 1) < 0.3) {
        for (let i = 0; i < 4; i++) flower(ctx, hash2(i, 5, s * 99) * 40 - 20, -32 - hash2(i, 6, s * 99) * 34, 1.8, '#fff6', '#fff8');
      }
    }
  });
}

// ---------- Kleinzeug ----------
function bushSprite(v) {
  return sprite('bush' + v, 60, 50, 30, 42, (ctx) => {
    shadow(ctx, 0, 0, 20, 6);
    canopy(ctx, [[-10, -10, 11], [10, -10, 11], [0, -17, 13]], '#74c466', '#c2f2a0', '#56a254');
    if (v === 1) for (const [x, y] of [[-8, -14], [6, -18], [10, -8], [-2, -8], [0, -22]]) { circ(ctx, x, y, 2.6); fs(ctx, '#ff6f9f', 1, '#c94a78'); }
    else for (const [x, y] of [[-9, -12], [7, -15], [2, -22]]) flower(ctx, x, y, 2.3, '#fff', '#ffd84a');
  });
}

function rockSprite(v) {
  return sprite('rock' + v, 60, 50, 30, 42, (ctx) => {
    shadow(ctx, 0, 0, 20, 6);
    ctx.beginPath();
    if (v === 1) { ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-22, -20, -4, -26); ctx.quadraticCurveTo(18, -24, 20, 0); ctx.closePath(); }
    else { ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-16, -16, 0, -18); ctx.quadraticCurveTo(16, -16, 16, 0); ctx.closePath(); }
    fs(ctx, '#c9c1ba', 1.8, '#9a918a');
    ctx.fillStyle = '#e6e0da'; ell(ctx, -5, -14, 7, 4, -0.3); ctx.fill();
    ctx.fillStyle = '#9fd47a'; ell(ctx, 8, -2, 6, 3); ctx.fill();
  });
}

function stumpSprite() {
  return sprite('stump', 40, 36, 20, 30, (ctx) => {
    shadow(ctx, 0, 0, 13, 4);
    rr(ctx, -11, -14, 22, 14, 5); fs(ctx, '#a0704c');
    ell(ctx, 0, -14, 11, 4.5); fs(ctx, '#e8c89a', 1.4, '#a0704c');
    ctx.strokeStyle = '#c9a070'; ctx.lineWidth = 1; ell(ctx, 0, -14, 6, 2.2); ctx.stroke();
    flower(ctx, 8, -3, 2, '#fff', '#ffd84a');
  });
}

// ---------- Gebäude ----------
function windowBox(ctx, x, y, w = 20, h = 20, curtain = '#ffb3c8', lit = false) {
  rr(ctx, x - 2, y - 2, w + 4, h + 4, 5); fs(ctx, '#fffaf2', 1.2, '#b89a88');
  rr(ctx, x, y, w, h, 4); ctx.fillStyle = lit ? '#ffe9a8' : '#bfe6f7'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(x + 3, y + h - 4); ctx.lineTo(x + 8, y + 3); ctx.lineTo(x + 11, y + 3); ctx.lineTo(x + 6, y + h - 4); ctx.fill();
  ctx.strokeStyle = '#fffaf2'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.fillStyle = curtain;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5, y + 6, x + 2, y + h * 0.6); ctx.lineTo(x, y + h * 0.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w, y); ctx.quadraticCurveTo(x + w - 5, y + 6, x + w - 2, y + h * 0.6); ctx.lineTo(x + w, y + h * 0.6); ctx.closePath(); ctx.fill();
  // Blumenkasten
  rr(ctx, x - 3, y + h + 1, w + 6, 6, 2); fs(ctx, '#c98a5a', 1.2);
  for (let i = 0; i < 4; i++) flower(ctx, x + 1 + i * (w / 3), y + h, 2.4, ['#ff7eb6', '#fff', '#ffd166', '#b79cf0'][i], '#ffb84a');
}

function door(ctx, x, y, w, h, col) {
  ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  fs(ctx, col, 1.6);
  ctx.fillStyle = '#ffd24a'; circ(ctx, x + w - 5, y + h * 0.6, 1.8); ctx.fill();
  heart(ctx, x + w / 2, y + w / 2 + 2, 6, '#fff9');
  rr(ctx, x - 4, y + h - 1, w + 8, 5, 2); fs(ctx, '#d9cbbd', 1);
}

function roof(ctx, x, y, w, h, col, style = 'shingle') {
  // Dachfläche (Aufsicht, leicht schräg) mit Überstand
  rr(ctx, x - 6, y, w + 12, h, 10);
  fs(ctx, col, 2, shade(col, -0.35));
  ctx.save(); rr(ctx, x - 6, y, w + 12, h, 10); ctx.clip();
  if (style === 'shingle') {
    ctx.fillStyle = shade(col, -0.1);
    for (let row = 0; row < h / 10; row++) {
      for (let i = -1; i < w / 12 + 2; i++) {
        const sx = x - 6 + i * 12 + (row % 2) * 6, sy = y + 8 + row * 10;
        ctx.beginPath(); ctx.arc(sx + 6, sy, 6, 0, Math.PI); ctx.fill();
      }
    }
  } else if (style === 'planks') {
    ctx.strokeStyle = shade(col, -0.2); ctx.lineWidth = 2;
    for (let i = 0; i < w + 12; i += 10) { ctx.beginPath(); ctx.moveTo(x - 6 + i, y); ctx.lineTo(x - 6 + i, y + h); ctx.stroke(); }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x - 6, y, w + 12, 8);
  ctx.restore();
  // First
  rr(ctx, x - 4, y - 3, w + 8, 8, 4); fs(ctx, shade(col, -0.15), 1.5);
}

function signBoard(ctx, x, y, text, bg = '#fff6e6', fg = '#8a4a5a', size = 12) {
  ctx.font = `600 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + 14;
  rr(ctx, x - w / 2, y - size, w, size + 8, 6); fs(ctx, bg, 1.6, shade(bg, -0.4));
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y - size / 2 + 4);
}

function awning(ctx, x, y, w, c1, c2) {
  const n = Math.max(3, Math.round(w / 14));
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * sw, y); ctx.lineTo(x + (i + 1) * sw, y); ctx.lineTo(x + (i + 1) * sw, y + 12);
    ctx.arc(x + i * sw + sw / 2, y + 12, sw / 2, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = i % 2 ? c2 : c1; ctx.fill();
  }
  ctx.strokeStyle = shade(c1, -0.35); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, 1);
}

const BLD = {
  house: { wall: '#fff1dc', roof: '#ef7f6f', door: '#6cc2b5', timber: '#b98a6a' },
  stable: { wall: '#e8736a', roof: '#a94b4b', door: '#fff' },
  stable_old: { wall: '#b39a84', roof: '#8f8a86', door: '#9c8672' },
  shop: { wall: '#cfe6ff', roof: '#6f9fe0', door: '#ffb35c', awning: ['#6fa8ff', '#fff'], sign: 'Theos Laden' },
  bakery: { wall: '#ffe7a8', roof: '#e9855a', door: '#b77a54', awning: ['#ff9eb8', '#fff'], sign: 'Bäckerei' },
  tailor: { wall: '#e6d6ff', roof: '#9a7fd6', door: '#7fd6c0', awning: ['#8fe0c8', '#fff'], sign: 'Nähstube' },
  post: { wall: '#fff2b0', roof: '#4f73c9', door: '#4f73c9', awning: ['#ffd23f', '#4f73c9'], sign: 'Post' },
  house_mia: { wall: '#ffd8e4', roof: '#e86f8f', door: '#fff' },
  house_ben: { wall: '#d6f2e0', roof: '#5fa87a', door: '#f7c948' },
  house_a: { wall: '#fdf0d8', roof: '#d98f5a', door: '#8fb8e8' },
  house_b: { wall: '#e2eeff', roof: '#8b8fd9', door: '#ff9eb8' },
  house_c: { wall: '#fff6e0', roof: '#c9a05a', door: '#8fd08a' },
  vet: { wall: '#eef8f4', roof: '#5fb8a8', door: '#ff9eb8', awning: ['#7fd6c0', '#fff'], sign: 'Tierärztin' },
  cottage: { wall: '#ffd8e4', roof: '#e86f8f', door: '#fff', timber: '#c98a8a' },
};

export function buildingSprite(b, season = 'summer') {
  if (b.type === 'lighthouse') return lighthouseSprite();
  const st = b.style ? `${b.style.wall}${b.style.roof}` : '';
  const key = `bld:${b.type}:${b.w}:${b.h}:${season}:${st}`;
  const W = b.w * T, depth = b.h * T;
  const extra = 60;
  return sprite(key, W + 40, depth + extra + 20, 20, depth + extra, (ctx) => {
    const P = b.style ? { ...BLD[b.type], ...b.style } : BLD[b.type] || BLD.house_a;
    const wallH = Math.min(58, depth * 0.55 + 10);
    const old = b.type === 'stable_old';
    const barn = b.type === 'stable' || old;
    // Schatten
    ctx.fillStyle = 'rgba(60,40,70,0.16)'; rr(ctx, -4, -8, W + 14, 16, 8); ctx.fill();
    // Wand
    rr(ctx, 0, -wallH, W, wallH, 4); fs(ctx, P.wall, 2);
    if (barn) {
      ctx.strokeStyle = shade(P.wall, -0.15); ctx.lineWidth = 1.5;
      for (let i = 8; i < W; i += 10) { ctx.beginPath(); ctx.moveTo(i, -wallH + 4); ctx.lineTo(i, -2); ctx.stroke(); }
    }
    if (b.type === 'house' || b.type === 'cottage') {
      ctx.strokeStyle = P.timber || '#b98a6a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(2, -wallH / 2); ctx.lineTo(W - 2, -wallH / 2); ctx.stroke();
      for (const x of [W * 0.33, W * 0.66]) { ctx.beginPath(); ctx.moveTo(x, -wallH + 2); ctx.lineTo(x, -2); ctx.stroke(); }
    }
    // Dach
    const roofTop = -depth - extra + 22;
    roof(ctx, 0, roofTop, W, depth + extra - wallH - 18, old ? '#9c9690' : P.roof, barn ? 'planks' : 'shingle');
    if (old) {
      ctx.fillStyle = '#5a4a44';
      ell(ctx, W * 0.3, roofTop + 30, 10, 6); ctx.fill();
      ell(ctx, W * 0.7, roofTop + 18, 7, 5); ctx.fill();
      ctx.strokeStyle = '#7a6a5a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(W * 0.62, -wallH + 10); ctx.lineTo(W * 0.8, -wallH + 22); ctx.stroke();
      ctx.fillStyle = '#6a5a4f'; rr(ctx, W * 0.12, -wallH + 12, 12, 8, 2); ctx.fill();
    }
    // Schnee auf dem Dach: weiche Schneedecke mit welligem Rand und Eiszapfen
    if (season === 'winter') {
      const rh = depth + extra - wallH - 18;
      const sh = Math.max(14, Math.min(rh * 0.55, rh - 10));
      const by = roofTop + sh;
      ctx.beginPath();
      ctx.moveTo(-5, by - 6);
      ctx.lineTo(-5, roofTop + 8); ctx.quadraticCurveTo(-5, roofTop - 3, 8, roofTop - 3);
      ctx.lineTo(W - 8, roofTop - 3); ctx.quadraticCurveTo(W + 5, roofTop - 3, W + 5, roofTop + 8);
      ctx.lineTo(W + 5, by - 6);
      for (let x = W + 5; x > -5; x -= 12) ctx.quadraticCurveTo(x - 6, by + 4 + ((x * 7) % 5), x - 12, by - 5);
      ctx.closePath();
      const gr = ctx.createLinearGradient(0, roofTop, 0, by);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#eaf2fb');
      ctx.fillStyle = gr; ctx.fill();
      ctx.strokeStyle = '#c3d3e6'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(ctx, 6, roofTop + 1, W - 12, 4, 2); ctx.fill();
      ctx.fillStyle = '#dff1ff'; for (let i = 6; i < W; i += 11) { ctx.beginPath(); ctx.moveTo(i, -wallH - 2); ctx.lineTo(i + 2, -wallH + 6 + (i % 3) * 2); ctx.lineTo(i + 4, -wallH - 2); ctx.closePath(); ctx.fill(); }
    }
    // Schornstein (Wohnhaus, Bäckerei, Häuschen)
    if (b.type === 'house' || b.type === 'bakery' || b.type === 'cottage') {
      rr(ctx, W * 0.72, roofTop - 14, 14, 24, 3); fs(ctx, '#d9826a', 1.6);
      rr(ctx, W * 0.72 - 2, roofTop - 16, 18, 6, 2); fs(ctx, '#c46a55', 1.2);
    }
    // Wetterfahne am Stall
    if (b.type === 'stable') {
      ctx.strokeStyle = '#6a5060'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, roofTop); ctx.lineTo(W / 2, roofTop - 20); ctx.stroke();
      ctx.fillStyle = '#6a5060';
      ctx.beginPath(); ctx.ellipse(W / 2 + 2, roofTop - 22, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      circ(ctx, W / 2 + 9, roofTop - 25, 3); ctx.fill();
      // Heuboden
      rr(ctx, W / 2 - 12, -wallH - 4, 24, 16, 4); fs(ctx, '#fff4e0', 1.5);
      ctx.fillStyle = '#f3cf6a'; rr(ctx, W / 2 - 9, -wallH + 2, 18, 8, 3); ctx.fill();
      // Blumen am Stall
      for (let i = 0; i < 6; i++) flower(ctx, 6 + i * 7, -3, 2.6, ['#ff7eb6', '#fff', '#ffd166'][i % 3], '#ffb84a');
    }
    // Fenster
    const doorW = barn ? 40 : 22;
    const dx = (b.door ? b.door.x * T - b.x * T : W / 2) - doorW / 2;
    const winY = -wallH + 12;
    const winXs = [];
    for (let x = 12; x + 22 < W - 8; x += 44) if (Math.abs(x + 10 - (dx + doorW / 2)) > doorW / 2 + 16) winXs.push(x);
    for (const x of winXs) {
      if (old) { rr(ctx, x, winY, 20, 18, 3); fs(ctx, '#6a5a50', 1.2); ctx.strokeStyle = '#9c8672'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 2, winY + 2); ctx.lineTo(x + 22, winY + 16); ctx.stroke(); }
      else windowBox(ctx, x, winY, 20, 18, barn ? '#fff' : ['#ffb3c8', '#b3d9ff', '#ffe08a'][x % 3]);
    }
    // Tür
    if (barn) {
      const dh = wallH - 8;
      rr(ctx, dx, -dh, doorW, dh, 4); fs(ctx, old ? '#8a7563' : '#fff5ee', 1.8);
      ctx.strokeStyle = old ? '#6a5a4f' : '#e8736a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(dx + doorW / 2, -dh); ctx.lineTo(dx + doorW / 2, 0);
      ctx.moveTo(dx + 3, -dh + 3); ctx.lineTo(dx + doorW / 2 - 2, -3); ctx.moveTo(dx + doorW / 2 - 2, -dh + 3); ctx.lineTo(dx + 3, -3);
      ctx.moveTo(dx + doorW / 2 + 2, -dh + 3); ctx.lineTo(dx + doorW - 3, -3); ctx.moveTo(dx + doorW - 3, -dh + 3); ctx.lineTo(dx + doorW / 2 + 2, -3);
      ctx.stroke();
      if (old) { ctx.save(); ctx.translate(dx + doorW * 0.75, -dh * 0.5); ctx.rotate(0.2); rr(ctx, -doorW / 4, -dh / 2, doorW / 2, dh, 3); fs(ctx, '#8a7563', 1.5); ctx.restore(); }
    } else {
      door(ctx, dx, -wallH + 14, doorW, wallH - 14, P.door);
    }
    // Markise + Schild
    if (P.awning) {
      awning(ctx, dx - 14, -wallH + 2, doorW + 28, P.awning[0], P.awning[1]);
      signBoard(ctx, W / 2, -wallH - 8, P.sign, '#fffaf0', shade(P.roof, -0.3), 12);
    }
    if (b.type === 'bakery') { // Brezel
      ctx.strokeStyle = '#c98a4a'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(W - 16, -wallH + 18, 6, 0, Math.PI * 2); ctx.stroke();
    }
    if (b.type === 'post') {
      ctx.fillStyle = '#ffd23f'; rr(ctx, W - 22, -wallH / 2 - 6, 14, 18, 3); ctx.fill(); ctx.strokeStyle = '#c9a020'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#4f73c9'; rr(ctx, W - 19, -wallH / 2 - 3, 8, 2, 1); ctx.fill();
    }
    if (b.type === 'vet') { // Pfötchen-Schild
      ctx.fillStyle = '#fff'; circ(ctx, W - 18, -wallH + 18, 9); ctx.fill(); ctx.strokeStyle = '#5fb8a8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#ff7eb6'; circ(ctx, W - 18, -wallH + 20, 3.2); ctx.fill(); for (const [dx, dy] of [[-3.5, -3.5], [0, -5.5], [3.5, -3.5]]) { circ(ctx, W - 18 + dx, -wallH + 20 + dy, 1.5); ctx.fill(); }
    }
    if (b.type === 'cottage') { // Herzfenster, Veranda, Blumen
      ctx.fillStyle = '#fff6e6'; heart(ctx, W / 2, -wallH - 10, 16, '#fff6e6'); heart(ctx, W / 2, -wallH - 10, 11, '#ffd99a');
      rr(ctx, -4, -6, W + 8, 8, 3); fs(ctx, '#c98a5a', 1.4);
      for (let i = 0; i < 8; i++) flower(ctx, 6 + i * (W - 12) / 7, -8, 3.2, ['#ff7eb6', '#fff', '#ffd166', '#b79cf0'][i % 4], '#ffb84a');
      ctx.font = `700 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = shade(P.roof, -0.35); ctx.fillText('♥ Unser Zuhause ♥', W / 2, -wallH + 2);
    }
  });
}

function lighthouseSprite() {
  return sprite('lighthouse', 110, 250, 55, 220, (ctx) => {
    shadow(ctx, 0, 0, 44, 12, 0.2);
    rr(ctx, -34, -24, 68, 28, 10); fs(ctx, '#d8cfc6', 1.8);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-28, -16); ctx.lineTo(-18, -170); ctx.lineTo(18, -170); ctx.lineTo(28, -16); ctx.closePath();
    ctx.fillStyle = '#fffaf5'; ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#ef6f6f';
    for (let i = 0; i < 4; i++) ctx.fillRect(-40, -46 - i * 40, 80, 20);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(8, -180, 30, 180);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-14, -180, 8, 180);
    ctx.restore();
    ctx.strokeStyle = '#b86060'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-28, -16); ctx.lineTo(-18, -170); ctx.lineTo(18, -170); ctx.lineTo(28, -16); ctx.stroke();
    door(ctx, -9, -44, 18, 28, '#6f9fe0');
    windowBox(ctx, -7, -120, 14, 14, '#fff');
    rr(ctx, -26, -176, 52, 8, 3); fs(ctx, '#6a6f8a', 1.5);
    ctx.strokeStyle = '#6a6f8a'; ctx.lineWidth = 2;
    for (let i = -24; i <= 24; i += 8) { ctx.beginPath(); ctx.moveTo(i, -176); ctx.lineTo(i, -186); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-26, -186); ctx.lineTo(26, -186); ctx.stroke();
    rr(ctx, -14, -200, 28, 26, 6); ctx.fillStyle = '#fff4b8'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-18, -198); ctx.quadraticCurveTo(0, -222, 18, -198); ctx.closePath(); fs(ctx, '#ef6f6f', 1.8);
    circ(ctx, 0, -216, 3); fs(ctx, '#ffd24a', 1);
  });
}

// ---------- Zäune ----------
const FENCE_COL = { fence: '#b88a5e', picket: '#fffaf4', white: '#fffaf4' };
export function fenceSprite(style, mask) {
  // mask: 1=N, 2=E, 4=S, 8=W
  return sprite(`fence:${style}:${mask}`, T + 8, T + 30, 4 + T / 2, T - 6 + 20, (ctx) => {
    const c = FENCE_COL[style] || '#b88a5e';
    const o = shade(c, -0.35);
    const hh = style === 'picket' ? 22 : 24;
    const railY = [-hh + 7, -hh + 15];
    if (mask & 8) for (const y of railY) { rr(ctx, -T / 2 - 1, y, T / 2 + 2, 4.5, 2); fs(ctx, c, 1.2, o); }
    if (mask & 2) for (const y of railY) { rr(ctx, -1, y, T / 2 + 2, 4.5, 2); fs(ctx, c, 1.2, o); }
    if (mask & 1) { rr(ctx, -2.5, -T - hh + 10, 5, T, 2); fs(ctx, c, 1.2, o); }
    if (style === 'picket' && (mask & 10)) {
      for (const x of [-18, -9, 9, 18]) {
        if ((x < 0 && !(mask & 8)) || (x > 0 && !(mask & 2))) continue;
        ctx.beginPath(); ctx.moveTo(x - 2.5, -1); ctx.lineTo(x - 2.5, -hh + 4); ctx.lineTo(x, -hh); ctx.lineTo(x + 2.5, -hh + 4); ctx.lineTo(x + 2.5, -1); ctx.closePath(); fs(ctx, c, 1.1, o);
      }
    }
    // Pfosten
    shadow(ctx, 0, 0, 6, 2.5, 0.15);
    rr(ctx, -4, -hh - 2, 8, hh + 2, 3); fs(ctx, c, 1.4, o);
    ctx.fillStyle = shade(c, 0.2); rr(ctx, -3, -hh - 1, 6, 3, 1.5); ctx.fill();
  });
}

// ---------- verschiedene Objekte ----------
function lampSprite() {
  return sprite('lamp', 30, 80, 15, 72, (ctx) => {
    shadow(ctx, 0, 0, 7, 2.5);
    rr(ctx, -2.5, -52, 5, 52, 2); fs(ctx, '#5a5470', 1.2);
    rr(ctx, -5, -4, 10, 5, 2); fs(ctx, '#5a5470', 1);
    ctx.beginPath(); ctx.moveTo(-8, -52); ctx.lineTo(8, -52); ctx.lineTo(6, -66); ctx.lineTo(-6, -66); ctx.closePath(); fs(ctx, '#fff4c2', 1.4, '#5a5470');
    ctx.beginPath(); ctx.moveTo(-9, -66); ctx.quadraticCurveTo(0, -76, 9, -66); ctx.closePath(); fs(ctx, '#5a5470', 1);
    ctx.fillStyle = '#ffd86a'; circ(ctx, 0, -59, 3); ctx.fill();
  });
}

function signSprite(lines) {
  const key = 'sign:' + lines.map((l) => l.join('')).join('|');
  return sprite(key, 150, 110, 75, 100, (ctx) => {
    shadow(ctx, 0, 0, 8, 3);
    rr(ctx, -3, -62, 6, 62, 2); fs(ctx, '#9a6a45', 1.4);
    ctx.font = `600 10px ${FONT}`;
    lines.forEach(([arrow, name], i) => {
      const text = arrow === '←' ? `← ${name}` : `${name} ${arrow}`;
      const w = Math.min(130, ctx.measureText(text).width + 14);
      const y = -60 + i * 16;
      const x = arrow === '←' ? -w + 8 : arrow === '→' ? -8 : -w / 2;
      ctx.beginPath();
      if (arrow === '→') { ctx.moveTo(x, y); ctx.lineTo(x + w - 6, y); ctx.lineTo(x + w, y + 7); ctx.lineTo(x + w - 6, y + 14); ctx.lineTo(x, y + 14); }
      else if (arrow === '←') { ctx.moveTo(x + 6, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + 14); ctx.lineTo(x + 6, y + 14); ctx.lineTo(x, y + 7); }
      else { rr(ctx, x, y, w, 14, 4); }
      ctx.closePath();
      fs(ctx, ['#fff1d6', '#ffe3ec', '#e6f4ff'][i % 3], 1.4, '#9a6a45');
      ctx.fillStyle = '#6b4a4e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text.length > 26 ? text.slice(0, 25) + '…' : text, x + w / 2, y + 7.5);
    });
  });
}

const SMALL = {
  hay(ctx) { shadow(ctx, 0, 0, 20, 5); rr(ctx, -20, -26, 40, 26, 10); fs(ctx, '#f3cf6a', 1.8, '#c9a040'); ctx.strokeStyle = '#d9b050'; ctx.lineWidth = 1.2; for (let i = -14; i < 16; i += 7) { ctx.beginPath(); ctx.moveTo(i, -24); ctx.lineTo(i + 2, -2); ctx.stroke(); } ctx.strokeStyle = '#c96a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -13); ctx.lineTo(20, -13); ctx.stroke(); },
  barrel(ctx) { shadow(ctx, 0, 0, 13, 4); rr(ctx, -12, -28, 24, 28, 7); fs(ctx, '#b88a5e'); ctx.strokeStyle = '#7a6a70'; ctx.lineWidth = 2.5; for (const y of [-22, -6]) { ctx.beginPath(); ctx.moveTo(-12, y); ctx.lineTo(12, y); ctx.stroke(); } ell(ctx, 0, -28, 12, 4); fs(ctx, '#7fcdea', 1.2); },
  mailbox(ctx) { shadow(ctx, 0, 0, 8, 3); rr(ctx, -2, -26, 4, 26, 2); fs(ctx, '#9a6a45', 1); rr(ctx, -9, -38, 18, 13, 6); fs(ctx, '#ff8fb1'); ctx.fillStyle = '#fff'; heart(ctx, 0, -31, 6, '#fff'); rr(ctx, 8, -44, 3, 10, 1); ctx.fillStyle = '#ef5f6f'; ctx.fill(); },
  trough(ctx) { shadow(ctx, 0, 0, 22, 5); rr(ctx, -22, -14, 44, 14, 5); fs(ctx, '#a0704c'); rr(ctx, -19, -13, 38, 6, 3); ctx.fillStyle = '#7fcdea'; ctx.fill(); },
  hayrack(ctx) { shadow(ctx, 0, 0, 18, 5); rr(ctx, -18, -30, 36, 30, 4); fs(ctx, '#b88a5e'); ctx.fillStyle = '#f3cf6a'; rr(ctx, -15, -34, 30, 14, 6); ctx.fill(); ctx.strokeStyle = '#8a6040'; ctx.lineWidth = 2; for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, -28); ctx.lineTo(i, -4); ctx.stroke(); } },
  weed(ctx) { ctx.fillStyle = '#6aa85a'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.quadraticCurveTo(i * 5, -10, i * 6, -18 - Math.abs(i) * -2); ctx.lineTo(i * 3 + 2, 0); ctx.fill(); } flower(ctx, 4, -14, 2, '#ffe57a', '#fff'); },
  arch(ctx) {
    ctx.strokeStyle = '#fff4f0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-26, -50); ctx.arc(0, -50, 26, Math.PI, 0); ctx.lineTo(26, 0); ctx.stroke();
    ctx.strokeStyle = '#c9a0a8'; ctx.lineWidth = 1.2; ctx.stroke();
    for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; flower(ctx, Math.cos(a) * 26, -50 + Math.sin(a) * 26, 3.3, ['#ff7eb6', '#fff', '#ffd166', '#b79cf0'][i % 4], '#ffb84a'); }
    for (let i = 0; i < 5; i++) { flower(ctx, -26, -8 - i * 9, 3, '#ff9ecb', '#fff'); flower(ctx, 26, -8 - i * 9, 3, '#b79cf0', '#fff'); }
  },
  bench(ctx) { shadow(ctx, 0, 0, 20, 4); ctx.fillStyle = '#7a6a70'; for (const x of [-16, 14]) { rr(ctx, x, -12, 3, 12, 1); ctx.fill(); } rr(ctx, -20, -16, 40, 6, 3); fs(ctx, '#c98a5a'); rr(ctx, -20, -28, 40, 5, 2.5); fs(ctx, '#c98a5a'); rr(ctx, -20, -22, 40, 4, 2); fs(ctx, '#d99a6a'); },
  birdbath(ctx) { shadow(ctx, 0, 0, 12, 4); rr(ctx, -4, -20, 8, 20, 3); fs(ctx, '#e0d6f0'); ell(ctx, 0, -22, 14, 5); fs(ctx, '#e0d6f0'); ell(ctx, 0, -23, 10, 3); ctx.fillStyle = '#9fdcf2'; ctx.fill(); },
  festarch(ctx) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -60); ctx.arc(0, -60, 34, Math.PI, 0); ctx.lineTo(34, 0); ctx.stroke();
    for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; flower(ctx, Math.cos(a) * 34, -60 + Math.sin(a) * 34, 4, ['#ff7eb6', '#ffd166', '#b79cf0', '#8fe0c0', '#fff'][i % 5], '#ffb84a'); }
    for (let i = 0; i < 7; i++) { flower(ctx, -34, -6 - i * 9, 3.4, '#ff9ecb', '#fff'); flower(ctx, 34, -6 - i * 9, 3.4, '#ffd166', '#fff'); }
    heart(ctx, 0, -86, 16, '#ff6f9f');
  },
  table(ctx) {
    shadow(ctx, 0, 0, 24, 5);
    ctx.fillStyle = '#b88a5e'; for (const x of [-18, 16]) { rr(ctx, x, -16, 3, 16, 1); ctx.fill(); }
    rr(ctx, -24, -22, 48, 10, 4); fs(ctx, '#fff');
    ctx.fillStyle = '#ff9eb8'; for (let i = -22; i < 24; i += 8) { ctx.fillRect(i, -22, 4, 10); }
    // Kuchen & Limo
    rr(ctx, -12, -34, 14, 12, 3); fs(ctx, '#ffe0ec'); ctx.fillStyle = '#ff6f9f'; ctx.fillRect(-12, -30, 14, 2); circ(ctx, -5, -36, 2); ctx.fill();
    rr(ctx, 6, -36, 9, 14, 3); fs(ctx, '#fff6a8', 1.2);
  },
  stage(ctx) {
    shadow(ctx, 0, 0, 40, 8, 0.12);
    rr(ctx, -40, -10, 80, 12, 4); fs(ctx, '#d6a776');
    ctx.strokeStyle = '#b8864f'; ctx.lineWidth = 1.5; for (let i = -36; i < 40; i += 10) { ctx.beginPath(); ctx.moveTo(i, -10); ctx.lineTo(i, 2); ctx.stroke(); }
  },
  gatepost(ctx) { shadow(ctx, 0, 0, 9, 3); rr(ctx, -7, -70, 14, 70, 4); fs(ctx, '#b88a5e'); rr(ctx, -9, -74, 18, 8, 3); fs(ctx, '#9a6a45'); flower(ctx, 0, -40, 4, '#ff9ecb', '#fff'); flower(ctx, 2, -24, 3.5, '#ffd166', '#fff'); },
  fountain(ctx) {
    shadow(ctx, 0, 0, 62, 16, 0.15);
    ell(ctx, 0, -14, 64, 26); fs(ctx, '#e3d6c6', 2);
    ell(ctx, 0, -18, 56, 21); ctx.fillStyle = '#86d3f0'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ell(ctx, -18, -24, 16, 5); ctx.fill();
    rr(ctx, -8, -52, 16, 36, 6); fs(ctx, '#e3d6c6', 1.8);
    ell(ctx, 0, -52, 20, 7); fs(ctx, '#e3d6c6', 1.8);
    ell(ctx, 0, -53, 15, 4.5); ctx.fillStyle = '#86d3f0'; ctx.fill();
  },
  stall(ctx, o) {
    const c = o.c || '#ff9fb8';
    shadow(ctx, 24, 0, 30, 6);
    rr(ctx, 0, -26, 48, 26, 4); fs(ctx, '#d9a878');
    ctx.fillStyle = '#ffe07a'; for (let i = 0; i < 4; i++) { circ(ctx, 8 + i * 11, -28, 5); ctx.fill(); }
    ctx.fillStyle = '#ef5f6f'; for (let i = 0; i < 3; i++) { circ(ctx, 13 + i * 11, -30, 4); ctx.fill(); }
    ctx.fillStyle = '#7a6a70'; ctx.fillRect(2, -64, 3, 40); ctx.fillRect(43, -64, 3, 40);
    awning(ctx, -4, -70, 56, c, '#fff');
  },
  flowerbox(ctx) { shadow(ctx, 0, 0, 18, 4); rr(ctx, -18, -14, 36, 14, 4); fs(ctx, '#c98a5a'); for (let i = 0; i < 5; i++) { ctx.fillStyle = '#5aa05a'; ell(ctx, -14 + i * 7, -15, 3, 4); ctx.fill(); flower(ctx, -14 + i * 7, -19, 3.4, ['#ff7eb6', '#ffd166', '#fff', '#b79cf0', '#ff9f7a'][i], '#ffe07a'); } },
  hut(ctx) {
    shadow(ctx, 70, 0, 76, 10, 0.15);
    rr(ctx, 4, -54, 136, 54, 6); fs(ctx, '#8fc9e8', 2);
    ctx.strokeStyle = '#6fa9c8'; ctx.lineWidth = 1.5; for (let i = 14; i < 140; i += 12) { ctx.beginPath(); ctx.moveTo(i, -52); ctx.lineTo(i, -2); ctx.stroke(); }
    roof(ctx, 4, -102, 136, 52, '#f7f3ea', 'planks');
    door(ctx, 20, -40, 22, 40, '#ff8a6a');
    windowBox(ctx, 90, -42, 22, 20, '#fff');
    // Rettungsring
    ctx.lineWidth = 6; ctx.strokeStyle = '#ef6f6f'; circ(ctx, 64, -30, 10); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
  },
  rail(ctx) { rr(ctx, -T / 2, -18, T, 5, 2); fs(ctx, '#b88a5e', 1.2); rr(ctx, -3, -22, 6, 22, 2); fs(ctx, '#9a6a45', 1.2); },
  telescope(ctx) {
    shadow(ctx, 0, 0, 12, 4);
    ctx.strokeStyle = '#6a5a70'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(-10, 0); ctx.moveTo(0, -24); ctx.lineTo(10, 0); ctx.moveTo(0, -24); ctx.lineTo(0, 0); ctx.stroke();
    ctx.save(); ctx.translate(0, -28); ctx.rotate(-0.35);
    rr(ctx, -16, -6, 32, 11, 5); fs(ctx, '#e8b84a'); rr(ctx, 12, -8, 8, 15, 3); fs(ctx, '#c9983a');
    ctx.restore();
  },
  board(ctx) {
    shadow(ctx, 0, 0, 16, 4);
    ctx.fillStyle = '#9a6a45'; ctx.fillRect(-14, -40, 4, 40); ctx.fillRect(10, -40, 4, 40);
    rr(ctx, -20, -58, 40, 28, 5); fs(ctx, '#fff6e6', 1.8, '#9a6a45');
    ctx.fillStyle = '#e8736a'; ctx.font = `700 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('PARCOURS', 0, -46);
    ctx.fillStyle = '#6b4a4e'; ctx.fillText('Start ➜', 0, -36);
  },
  log(ctx) {
    shadow(ctx, 48, 0, 50, 7);
    rr(ctx, 0, -26, 92, 26, 12); fs(ctx, '#a0704c');
    ell(ctx, 4, -13, 9, 13); fs(ctx, '#d9b27f', 1.4); ell(ctx, 4, -13, 5, 8); ctx.fillStyle = '#3b2a2a'; ctx.fill();
    ctx.fillStyle = '#7cc26b'; ell(ctx, 40, -26, 16, 5); ctx.fill(); ell(ctx, 70, -25, 10, 4); ctx.fill();
    for (const x of [30, 50, 76]) { ctx.fillStyle = '#ff7b5c'; ell(ctx, x, -28, 4, 2.6); ctx.fill(); ctx.fillStyle = '#fff'; circ(ctx, x - 1, -29, 0.8); ctx.fill(); }
  },
  shelter(ctx) {
    shadow(ctx, 72, 0, 76, 10, 0.15);
    ctx.fillStyle = '#9a6a45'; for (const x of [8, 136]) { ctx.fillRect(x, -60, 6, 60); }
    rr(ctx, 4, -64, 140, 38, 8); fs(ctx, '#c9a06a');
    ctx.fillStyle = '#f3cf6a'; rr(ctx, 20, -20, 50, 20, 8); ctx.fill();
  },
  hurdle(ctx) {
    shadow(ctx, 0, 0, 20, 4, 0.12);
    ctx.fillStyle = '#fff'; rr(ctx, -3, -30, 6, 30, 2); ctx.fill();
    for (const y of [-26, -16]) { rr(ctx, -T / 2, y, T, 6, 3); fs(ctx, '#ff7a8a', 1.2, '#c95060'); ctx.fillStyle = '#fff'; for (let i = -18; i < 24; i += 12) ctx.fillRect(i, y + 0.5, 6, 5); }
  },
  bunting() {},
  gazebo(ctx) {
    // Rosenlaube mit Schaukel (Anker: unten links, 3 Kacheln breit)
    const W = 144;
    shadow(ctx, W / 2, -2, 78, 14, 0.16);
    rr(ctx, 6, -14, W - 12, 16, 8); fs(ctx, '#e9d8c4');
    ctx.strokeStyle = '#d6c2aa'; ctx.lineWidth = 1.5; for (let i = 16; i < W - 10; i += 14) { ctx.beginPath(); ctx.moveTo(i, -13); ctx.lineTo(i, 1); ctx.stroke(); }
    // Schaukel
    ctx.strokeStyle = '#a57a52'; ctx.lineWidth = 2;
    for (const x of [48, 96]) { ctx.beginPath(); ctx.moveTo(x, -104); ctx.lineTo(x, -34); ctx.stroke(); }
    rr(ctx, 40, -38, 64, 9, 4); fs(ctx, '#c98a5a');
    rr(ctx, 42, -58, 60, 20, 6); fs(ctx, '#fff0f6', 1.5, '#e8a0b8');
    heart(ctx, 60, -46, 9, '#ff7eb6'); heart(ctx, 84, -46, 9, '#ff9ecb');
    // Pfosten
    for (const x of [10, W - 10]) { rr(ctx, x - 5, -112, 10, 108, 4); fs(ctx, '#fffaf4', 1.6, '#c9b0a0'); }
    for (const x of [10, W - 10]) for (let i = 0; i < 7; i++) flower(ctx, x + Math.sin(i * 1.7) * 5, -20 - i * 13, 4, ['#ff6f8f', '#ff9ecb', '#fff'][i % 3], '#ffd84a');
    // Dach
    ctx.beginPath(); ctx.moveTo(-8, -108); ctx.quadraticCurveTo(W / 2, -176, W + 8, -108); ctx.quadraticCurveTo(W / 2, -96, -8, -108); ctx.closePath();
    fs(ctx, '#ff9eb8', 2, '#d9708f');
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(W / 2, -150); ctx.lineTo(-8 + (W + 16) * (i / 6), -104); ctx.stroke(); }
    ctx.fillStyle = '#fff'; for (let i = 0; i <= 12; i++) { circ(ctx, -8 + (W + 16) * (i / 12), -106, 3.4); ctx.fill(); }
    heart(ctx, W / 2, -150, 20, '#ff5f8f');
    // Rosenranken am Dachrand
    for (let i = 0; i < 9; i++) flower(ctx, 4 + i * 17, -104 + Math.sin(i) * 2, 3.6, i % 2 ? '#ff5f7f' : '#ffb3c8', '#ffe07a');
  },
  cathouse(ctx) {
    shadow(ctx, 48, 0, 50, 9);
    rr(ctx, 6, -56, 84, 56, 8); fs(ctx, '#ffe7c2');
    ctx.beginPath(); ctx.moveTo(-2, -52); ctx.lineTo(48, -92); ctx.lineTo(98, -52); ctx.closePath(); fs(ctx, '#b79cf0', 2);
    for (const x of [26, 70]) { ctx.beginPath(); ctx.moveTo(x - 10, -66); ctx.lineTo(x, -96 + (x > 48 ? 8 : 0)); ctx.lineTo(x + 10, -72); ctx.closePath(); fs(ctx, '#b79cf0', 2); ctx.fillStyle = '#ffc2d4'; ctx.beginPath(); ctx.moveTo(x - 4, -70); ctx.lineTo(x, -86 + (x > 48 ? 6 : 0)); ctx.lineTo(x + 4, -72); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.arc(48, -18, 15, Math.PI, 0); ctx.lineTo(63, 0); ctx.lineTo(33, 0); ctx.closePath(); fs(ctx, '#6b4a5e');
    for (const x of [20, 76]) { circ(ctx, x, -34, 7); fs(ctx, '#bfe6f7', 1.5, '#c9a080'); }
    ctx.font = `700 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#8a4a6a'; ctx.fillText('Maumau & Manni', 48, -44);
    // Pfötchen
    ctx.fillStyle = '#ff9ecb'; for (const [x, y] of [[26, -12], [70, -12]]) { circ(ctx, x, y, 3); ctx.fill(); for (const [dx, dy] of [[-3, -4], [0, -5.5], [3, -4]]) { circ(ctx, x + dx, y + dy, 1.4); ctx.fill(); } }
  },
  doghouse(ctx) {
    shadow(ctx, 48, 0, 46, 9);
    rr(ctx, 12, -50, 72, 50, 6); fs(ctx, '#ffd9a8');
    ctx.strokeStyle = '#e6b880'; ctx.lineWidth = 1.5; for (let y = -42; y < 0; y += 9) { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(82, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(2, -46); ctx.lineTo(48, -84); ctx.lineTo(94, -46); ctx.closePath(); fs(ctx, '#ef6f6f', 2);
    ctx.beginPath(); ctx.arc(48, -18, 14, Math.PI, 0); ctx.lineTo(62, 0); ctx.lineTo(34, 0); ctx.closePath(); fs(ctx, '#4a3a44');
    rr(ctx, 30, -66, 36, 14, 5); fs(ctx, '#fff', 1.5, '#c96a6a');
    ctx.font = `800 10px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#e8587a'; ctx.fillText('MIRA', 48, -56);
    // Knochen & Napf
    ctx.fillStyle = '#fff8ee'; rr(ctx, 70, -6, 16, 4, 2); ctx.fill(); for (const x of [70, 86]) for (const y of [-7, -3]) { circ(ctx, x, y, 2.4); ctx.fill(); }
    ell(ctx, 20, -3, 8, 3.5); fs(ctx, '#7ec8ff', 1.2);
  },
  // ---------- Teil 2 ----------
  board2(ctx) {
    shadow(ctx, 0, 0, 16, 4);
    ctx.fillStyle = '#9a6a45'; ctx.fillRect(-14, -40, 4, 40); ctx.fillRect(10, -40, 4, 40);
    rr(ctx, -22, -60, 44, 30, 5); fs(ctx, '#fff6e6', 1.8, '#9a6a45');
    ctx.fillStyle = '#4f9a8a'; ctx.font = `700 8px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('REITSTUNDE', 0, -48);
    ctx.fillStyle = '#6b4a4e'; ctx.fillText('Start ➜', 0, -37);
    heart(ctx, 17, -56, 7, '#ff7eb6');
  },
  schoolsign(ctx) {
    shadow(ctx, 0, 0, 22, 4);
    ctx.fillStyle = '#9a6a45'; ctx.fillRect(-20, -46, 4, 46); ctx.fillRect(16, -46, 4, 46);
    rr(ctx, -30, -70, 60, 28, 6); fs(ctx, '#ffe9f3', 1.8, '#c9708f');
    ctx.fillStyle = '#c9506f'; ctx.font = `700 9px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('Kleine', 0, -59); ctx.fillText('Reitschule', 0, -48);
    flower(ctx, -24, -70, 4, '#ffd166', '#fff'); flower(ctx, 24, -70, 4, '#b79cf0', '#fff');
  },
  farmshop(ctx, o, season) {
    shadow(ctx, 48, 0, 50, 7);
    rr(ctx, 2, -30, 92, 30, 5); fs(ctx, '#d9a878');
    ctx.strokeStyle = '#b88a5e'; ctx.lineWidth = 1.5; for (let i = 10; i < 92; i += 12) { ctx.beginPath(); ctx.moveTo(i, -28); ctx.lineTo(i, -2); ctx.stroke(); }
    // Ware: Äpfel, Karotten, (Herbst) Kürbisse, Blumen
    for (let i = 0; i < 4; i++) { circ(ctx, 12 + i * 8, -33, 4.5); fs(ctx, '#ef4f5f', 1, '#b8323f'); }
    ctx.fillStyle = '#ff9a3c'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(52 + i * 6, -34); ctx.rotate(0.6); ell(ctx, 0, 0, 2.4, 7); ctx.fill(); ctx.restore(); }
    if (season === 'autumn') for (const x of [-4, 98]) { ell(ctx, x, -6, 9, 7); fs(ctx, '#f28a2a', 1.4, '#c0601a'); ctx.fillStyle = '#5a8a3a'; ctx.fillRect(x - 1, -15, 2, 4); }
    else for (let i = 0; i < 3; i++) flower(ctx, 80 + i * 5, -36, 3.4, ['#ff7eb6', '#ffd166', '#fff'][i], '#ffb84a');
    ctx.fillStyle = '#7a6a70'; ctx.fillRect(4, -74, 3, 46); ctx.fillRect(89, -74, 3, 46);
    awning(ctx, -2, -80, 100, '#7fd6a0', '#fff');
    if (season === 'winter') { ctx.fillStyle = '#fff'; rr(ctx, -2, -84, 100, 7, 3); ctx.fill(); }
    signBoard(ctx, 48, -82, 'Hofladen', '#fffaf0', '#5f8a4f', 11);
  },
  igelhaus(ctx) {
    shadow(ctx, 0, 0, 18, 5);
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-18, -16); ctx.lineTo(0, -30); ctx.lineTo(18, -16); ctx.lineTo(18, 0); ctx.closePath(); fs(ctx, '#c98a5a', 1.6, '#8a5d40');
    ctx.fillStyle = '#e8874a'; for (let i = 0; i < 7; i++) { ell(ctx, -16 + i * 5.5, -28 + Math.abs(i - 3) * 4 + 6, 4, 2.4, i); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, -6, 6, Math.PI, 0); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.closePath(); fs(ctx, '#3b2a2a');
    ctx.font = `700 7px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff6e6'; ctx.fillText('IGEL', 0, -16);
    ctx.fillStyle = '#f3cf6a'; ell(ctx, 10, -1, 6, 2.2); ctx.fill();
  },
  xmastree(ctx) {
    shadow(ctx, 0, 0, 24, 6);
    rr(ctx, -5, -14, 10, 14, 2); fs(ctx, '#8a5d40', 1.2);
    rr(ctx, -12, -6, 24, 8, 3); fs(ctx, '#e8587a', 1.2);
    const lay = [[-14, 30, '#3f8f5a'], [-36, 25, '#4a9a62'], [-56, 19, '#56a66c'], [-72, 12, '#62b276']];
    for (const [y, r, c] of lay) { ctx.beginPath(); ctx.moveTo(-r - 4, y + 6); ctx.quadraticCurveTo(0, y - r * 1.5, r + 4, y + 6); ctx.quadraticCurveTo(0, y + 12, -r - 4, y + 6); ctx.closePath(); fs(ctx, c, 1.6, shade(c, -0.3)); ctx.fillStyle = '#fff'; ell(ctx, -r * 0.5, y + 2, r * 0.5, 2.5); ctx.fill(); }
    const cols = ['#ff5f7f', '#ffd24a', '#7ec8ff', '#b79cf0', '#fff'];
    for (let i = 0; i < 16; i++) { circ(ctx, hash2(i, 1, 4) * 44 - 22, -16 - hash2(i, 2, 4) * 52, 2.4); ctx.fillStyle = cols[i % 5]; ctx.fill(); }
    ctx.fillStyle = '#ffd24a'; star(ctx, 0, -86, 9); ctx.fill(); ctx.strokeStyle = '#e0a020'; ctx.lineWidth = 1.2; ctx.stroke();
    for (const [x, c] of [[-18, '#7ec8ff'], [16, '#ff9eb8']]) { rr(ctx, x - 6, -10, 12, 10, 2); fs(ctx, c, 1.2); ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, -10, 2, 10); }
  },
  bigxmastree(ctx) {
    ctx.save(); ctx.scale(1.6, 1.6); SMALL.xmastree(ctx); ctx.restore();
  },
  xstall(ctx, o) {
    const c = o.c || '#e86f7d';
    shadow(ctx, 24, 0, 30, 6);
    rr(ctx, 0, -26, 48, 26, 4); fs(ctx, '#c98a5a');
    ctx.fillStyle = '#e0a060'; for (let i = 0; i < 4; i++) { heart(ctx, 8 + i * 11, -28, 8, '#d9904a'); }
    ctx.fillStyle = '#7a6a70'; ctx.fillRect(2, -64, 3, 40); ctx.fillRect(43, -64, 3, 40);
    awning(ctx, -4, -70, 56, c, '#fff');
    ctx.fillStyle = '#fff'; rr(ctx, -6, -76, 60, 8, 4); ctx.fill();
    for (let i = 0; i < 6; i++) { circ(ctx, -2 + i * 10, -60, 2.2); ctx.fillStyle = ['#ffe39a', '#ffb3c8', '#b3e3ff'][i % 3]; ctx.fill(); }
  },
  storknest(ctx) {
    ell(ctx, 0, -78, 20, 8); fs(ctx, '#a57a52', 1.5, '#7a5a3a');
    ctx.strokeStyle = '#8a6040'; ctx.lineWidth = 1.5; for (let i = -16; i <= 16; i += 4) { ctx.beginPath(); ctx.moveTo(i, -84); ctx.lineTo(i + 3, -72); ctx.stroke(); }
    ell(ctx, 0, -82, 13, 4); ctx.fillStyle = '#c9a070'; ctx.fill();
  },
  rack(ctx, o, season) {
    shadow(ctx, 48, 0, 46, 8);
    ctx.fillStyle = '#9a6a45'; for (const x of [8, 86]) { rr(ctx, x - 3, -62, 6, 62, 2); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-4, -56); ctx.lineTo(48, -84); ctx.lineTo(100, -56); ctx.closePath(); fs(ctx, '#b9845a', 1.6, '#7a5a3a');
    if (season === 'winter') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-2, -58); ctx.lineTo(48, -86); ctx.lineTo(98, -58); ctx.lineTo(48, -78); ctx.closePath(); ctx.fill(); }
    rr(ctx, 12, -40, 72, 26, 4); fs(ctx, '#c98a5a', 1.4, '#8a5d40');
    ctx.strokeStyle = '#8a5d40'; ctx.lineWidth = 1.5; for (let x = 18; x < 82; x += 7) { ctx.beginPath(); ctx.moveTo(x, -40); ctx.lineTo(x, -14); ctx.stroke(); }
    ctx.fillStyle = '#f3cf6a'; rr(ctx, 16, -46, 64, 10, 5); ctx.fill();
  },
  bigfir(ctx, o, season) {
    ctx.save(); ctx.scale(1.25, 1.25);
    shadow(ctx, 0, 0, 26, 7);
    rr(ctx, -4.5, -16, 9, 16, 2); fs(ctx, '#8a5d40', 1.2);
    const lay = [[-16, 32, '#3f8f5a'], [-38, 27, '#4a9a62'], [-58, 21, '#56a66c'], [-76, 13, '#62b276']];
    for (const [y, r, c] of lay) { ctx.beginPath(); ctx.moveTo(-r - 4, y + 6); ctx.quadraticCurveTo(0, y - r * 1.5, r + 4, y + 6); ctx.quadraticCurveTo(0, y + 12, -r - 4, y + 6); ctx.closePath(); fs(ctx, c, 1.6, shade(c, -0.3)); if (season === 'winter') { ctx.fillStyle = '#fff'; ell(ctx, -r * 0.3, y, r * 0.7, 3); ctx.fill(); } }
    // rote Schleife: reserviert!
    ctx.fillStyle = '#ef4f5f'; rr(ctx, -8, -30, 16, 4, 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(-7, -34); ctx.lineTo(-7, -22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(7, -34); ctx.lineTo(7, -22); ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  echorock(ctx, o, season) {
    shadow(ctx, 0, 0, 24, 7);
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-26, -30, -6, -38); ctx.quadraticCurveTo(20, -40, 24, 0); ctx.closePath();
    fs(ctx, '#c9c1ba', 1.8, '#9a918a');
    ctx.fillStyle = '#e6e0da'; ell(ctx, -8, -28, 9, 5, -0.3); ctx.fill();
    if (season === 'winter') { ctx.fillStyle = '#fff'; ell(ctx, -4, -36, 14, 5, -0.1); ctx.fill(); }
    heart(ctx, 4, -16, 12, 'rgba(170,150,150,0.8)');
  },
  tulipbed(ctx, o, season) {
    if (season === 'winter') { ctx.fillStyle = '#e6e0db'; ell(ctx, 0, -4, 20, 7); ctx.fill(); return; }
    ctx.fillStyle = '#a5704b'; ell(ctx, 0, -4, 20, 7); ctx.fill();
    const cols = ['#ff5f7f', '#ffd24a', '#ff9ecb', '#b79cf0', '#ff8a5a'];
    for (let i = 0; i < 7; i++) {
      const x = -15 + i * 5, y = -6 + (i % 2) * 3;
      ctx.strokeStyle = '#5aa05a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 10); ctx.stroke();
      ctx.fillStyle = cols[i % 5]; ctx.beginPath(); ctx.moveTo(x - 3, y - 10); ctx.lineTo(x - 3, y - 15); ctx.lineTo(x - 1, y - 13); ctx.lineTo(x, y - 16); ctx.lineTo(x + 1, y - 13); ctx.lineTo(x + 3, y - 15); ctx.lineTo(x + 3, y - 10); ctx.quadraticCurveTo(x, y - 7, x - 3, y - 10); ctx.closePath(); ctx.fill();
    }
  },
  scratchtree(ctx) {
    shadow(ctx, 0, 0, 14, 4);
    rr(ctx, -16, -8, 32, 8, 3); fs(ctx, '#c9a0e8');
    rr(ctx, -4, -66, 8, 60, 3); fs(ctx, '#e6cfa8');
    ctx.strokeStyle = '#c9a878'; ctx.lineWidth = 1; for (let y = -62; y < -8; y += 4) { ctx.beginPath(); ctx.moveTo(-4, y); ctx.lineTo(4, y + 2); ctx.stroke(); }
    rr(ctx, -14, -40, 28, 7, 3); fs(ctx, '#c9a0e8'); rr(ctx, -12, -70, 24, 7, 3); fs(ctx, '#c9a0e8');
    ctx.strokeStyle = '#ff7eb6'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(10, -40); ctx.lineTo(12, -28); ctx.stroke(); circ(ctx, 12, -26, 3); ctx.fillStyle = '#ff7eb6'; ctx.fill();
  },
};

// Deko der Spielerin
const DECO_DRAW = {
  planter(ctx) { shadow(ctx, 0, 0, 14, 4); ctx.beginPath(); ctx.moveTo(-13, -20); ctx.lineTo(13, -20); ctx.lineTo(10, 0); ctx.lineTo(-10, 0); ctx.closePath(); fs(ctx, '#e88a6a'); for (let i = 0; i < 5; i++) flower(ctx, -10 + i * 5, -24 - (i % 2) * 4, 3.4, ['#ff7eb6', '#fff', '#ffd166', '#b79cf0', '#ff9f7a'][i], '#ffe07a'); },
  bench: SMALL.bench,
  lantern(ctx) { shadow(ctx, 0, 0, 8, 3); rr(ctx, -2, -40, 4, 40, 2); fs(ctx, '#6a6070', 1); ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(8, -40); ctx.lineTo(6, -54); ctx.lineTo(-6, -54); ctx.closePath(); fs(ctx, '#ffe9a8', 1.4, '#6a6070'); ctx.fillStyle = '#ffc94a'; circ(ctx, 0, -47, 3); ctx.fill(); },
  birdhouse(ctx) { shadow(ctx, 0, 0, 8, 3); rr(ctx, -2, -36, 4, 36, 2); fs(ctx, '#9a6a45', 1); rr(ctx, -10, -56, 20, 20, 3); fs(ctx, '#8fd3f0'); ctx.beginPath(); ctx.moveTo(-13, -54); ctx.lineTo(0, -66); ctx.lineTo(13, -54); ctx.closePath(); fs(ctx, '#ef7f6f'); ctx.fillStyle = '#3b2a3a'; circ(ctx, 0, -46, 3.5); ctx.fill(); },
  haybale: SMALL.hay,
  gnome(ctx) { shadow(ctx, 0, 0, 9, 3); rr(ctx, -7, -16, 14, 16, 6); fs(ctx, '#5f9fe0'); circ(ctx, 0, -20, 6); fs(ctx, '#ffd9c0'); ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(0, -40); ctx.lineTo(8, -22); ctx.closePath(); fs(ctx, '#ef5f6f'); ctx.beginPath(); ctx.moveTo(-6, -18); ctx.quadraticCurveTo(0, -4, 6, -18); ctx.closePath(); fs(ctx, '#fff', 1); ctx.fillStyle = '#3b2a3a'; circ(ctx, -2, -21, 1); ctx.fill(); circ(ctx, 2, -21, 1); ctx.fill(); },
  heartarch(ctx) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-20, -34); ctx.arc(0, -34, 20, Math.PI, 0); ctx.lineTo(20, 0); ctx.stroke();
    for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; heart(ctx, Math.cos(a) * 20, -32 + Math.sin(a) * 20, 7, i % 2 ? '#ff7eb6' : '#ffb3cf'); }
    heart(ctx, 0, -62, 14, '#ff6f9f');
  },
  sunflowerpot(ctx) { shadow(ctx, 0, 0, 10, 3); ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(9, -14); ctx.lineTo(7, 0); ctx.lineTo(-7, 0); ctx.closePath(); fs(ctx, '#6fa8e8'); ctx.strokeStyle = '#4f9a4f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, -40); ctx.stroke(); flower(ctx, 0, -44, 7, '#ffd23f', '#9a6a3a', 10); },
  // Teil 2
  chestnutman(ctx) { shadow(ctx, 0, 0, 10, 3); ctx.strokeStyle = '#c9a070'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(-6, 0); ctx.moveTo(4, -6); ctx.lineTo(6, 0); ctx.moveTo(-7, -14); ctx.lineTo(-14, -18); ctx.moveTo(7, -14); ctx.lineTo(14, -18); ctx.stroke(); ell(ctx, 0, -12, 9, 8); fs(ctx, '#8a4a22', 1.4, '#5a2a12'); circ(ctx, 0, -26, 7); fs(ctx, '#8a4a22', 1.4, '#5a2a12'); ctx.fillStyle = '#fff'; circ(ctx, -2.4, -27, 1.6); ctx.fill(); circ(ctx, 2.4, -27, 1.6); ctx.fill(); ell(ctx, 0, -32, 11, 3); fs(ctx, '#f3d58e', 1); ctx.beginPath(); ctx.ellipse(0, -33, 6, 4, 0, Math.PI, 0); fs(ctx, '#f3d58e', 1); },
  pumpkinlamp(ctx) { shadow(ctx, 0, 0, 12, 4); ell(ctx, 0, -10, 13, 10); fs(ctx, '#f28a2a', 1.6, '#c0601a'); ctx.fillStyle = '#ffd86a'; ctx.beginPath(); ctx.moveTo(-6, -13); ctx.lineTo(-2, -9); ctx.lineTo(-7, -9); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(6, -13); ctx.lineTo(2, -9); ctx.lineTo(7, -9); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, -6); ctx.quadraticCurveTo(0, -1, 6, -6); ctx.quadraticCurveTo(0, -3, -6, -6); ctx.fill(); ctx.fillStyle = '#5a8a3a'; ctx.fillRect(-1.5, -22, 3, 5); },
  musicbox(ctx) { shadow(ctx, 0, 0, 14, 4); rr(ctx, -14, -16, 28, 16, 3); fs(ctx, '#c98a5a', 1.6, '#8a5d40'); ctx.fillStyle = '#ffd24a'; ctx.fillRect(-14, -10, 28, 2); ell(ctx, 0, -17, 12, 3.5); fs(ctx, '#ffe9f3', 1.2); for (const [x, c] of [[-5, '#fff'], [5, '#d98a52']]) { ctx.save(); ctx.translate(x, -19); ctx.scale(0.22, 0.22); ctx.fillStyle = c; ell(ctx, 0, -20, 22, 14); ctx.fill(); ell(ctx, 18, -36, 9, 12); ctx.fill(); ctx.restore(); ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, -19); ctx.lineTo(x, -30); ctx.stroke(); } heart(ctx, 0, -6, 6, '#ff7eb6'); },
  snowglobe(ctx) { shadow(ctx, 0, 0, 12, 4); rr(ctx, -12, -8, 24, 8, 3); fs(ctx, '#c98a5a', 1.4, '#8a5d40'); circ(ctx, 0, -20, 14); ctx.fillStyle = 'rgba(200,232,255,0.55)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#ef7f6f'; ctx.beginPath(); ctx.moveTo(-5, -16); ctx.lineTo(0, -21); ctx.lineTo(5, -16); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff1dc'; ctx.fillRect(-4, -16, 8, 6); ctx.fillStyle = '#fff'; for (const [x, y] of [[-7, -26], [5, -28], [8, -18], [-8, -15], [0, -30]]) { circ(ctx, x, y, 1.2); ctx.fill(); } },
  photoframe(ctx) { shadow(ctx, 0, 0, 12, 3); ctx.fillStyle = '#9a6a45'; ctx.fillRect(-2, -10, 4, 10); rr(ctx, -16, -40, 32, 30, 4); fs(ctx, '#ffb3c8', 2, '#d9708f'); rr(ctx, -12, -36, 24, 22, 2); ctx.fillStyle = '#bfe6f7'; ctx.fill(); heart(ctx, -3, -24, 9, '#ff6f9f'); heart(ctx, 4, -24, 9, '#ff9ecb'); },
  sled(ctx) { shadow(ctx, 0, 0, 18, 4); ctx.strokeStyle = '#8a5d40'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, -2); ctx.lineTo(14, -2); ctx.quadraticCurveTo(20, -2, 19, -9); ctx.stroke(); rr(ctx, -16, -12, 30, 6, 2); fs(ctx, '#e8587a', 1.4, '#a83a5a'); },
  starlamp(ctx) { shadow(ctx, 0, 0, 8, 3); rr(ctx, -2, -40, 4, 40, 2); fs(ctx, '#6a6070', 1); star(ctx, 0, -48, 10); fs(ctx, '#fff1a8', 1.4, '#e0b020'); },
};

const SEASONAL = new Set(['farmshop', 'rack', 'bigfir', 'echorock', 'tulipbed']);
export function smallSprite(k, o = {}, season = 'summer') {
  const key = 'o:' + k + (o.c || '') + (SEASONAL.has(k) ? season : '');
  const sizes = {
    gazebo: [170, 200, 13, 188], cathouse: [110, 110, 8, 100], doghouse: [110, 100, 8, 90], scratchtree: [50, 90, 25, 80], fountain: [140, 110, 70, 90], stall: [70, 90, 10, 80], hut: [160, 120, 10, 108], log: [110, 50, 10, 40], shelter: [160, 90, 10, 80], festarch: [100, 130, 50, 118], arch: [80, 100, 40, 92], stage: [100, 30, 50, 20], gatepost: [30, 90, 15, 82], table: [60, 50, 30, 42],
    farmshop: [120, 110, 14, 98], xstall: [70, 100, 10, 88], rack: [120, 110, 14, 98], xmastree: [80, 110, 40, 100], bigxmastree: [120, 166, 60, 156], bigfir: [110, 140, 55, 128], echorock: [70, 70, 35, 60], storknest: [60, 100, 30, 94], schoolsign: [80, 90, 40, 80], board2: [60, 80, 30, 70], igelhaus: [60, 50, 30, 42], tulipbed: [60, 40, 30, 30],
  };
  const [w, h, ax, ay] = sizes[k] || [70, 80, 35, 70];
  const f = SMALL[k];
  return sprite(key, w, h, ax, ay, (ctx) => f && f(ctx, o, season));
}

export function decoSprite(id) {
  return sprite('deco:' + id, 70, 90, 35, 80, (ctx) => DECO_DRAW[id]?.(ctx));
}

export function drawDecoIcon(ctx, id, size) {
  ctx.save();
  ctx.translate(size / 2, size * 0.9);
  const k = size / 70;
  ctx.scale(k, k);
  DECO_DRAW[id]?.(ctx);
  ctx.restore();
}

export { signSprite, lampSprite, bushSprite, rockSprite, stumpSprite };

// Wimpelkette (dynamisch, weht leicht)
export function drawBunting(ctx, x, y, w, t) {
  ctx.strokeStyle = '#9a6a70'; ctx.lineWidth = 1.5;
  const x2 = x + w;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2, y + 22, x2, y); ctx.stroke();
  const cols = ['#ff7eb6', '#ffd166', '#8fe0c0', '#7ec8ff', '#b79cf0'];
  const n = Math.floor(w / 18);
  for (let i = 0; i <= n; i++) {
    const tt = i / n, px = x + (x2 - x) * tt, py = y + 22 * 2 * tt * (1 - tt) * 1;
    const sw = Math.sin(t * 3 + i) * 2;
    ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py); ctx.lineTo(px + sw, py + 14); ctx.closePath();
    ctx.fillStyle = cols[i % cols.length]; ctx.fill();
  }
  // Lampions
  for (let i = 1; i < n; i += 3) {
    const tt = i / n, px = x + (x2 - x) * tt, py = y + 22 * 2 * tt * (1 - tt);
    ctx.fillStyle = i % 2 ? '#ffb3c8' : '#ffe39a';
    ell(ctx, px, py + 24, 7, 9); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(ctx, px - 2, py + 21, 2, 3); ctx.fill();
  }
  // Pfosten
  for (const px of [x, x2]) { ctx.fillStyle = '#b88a5e'; rr(ctx, px - 3, y - 4, 6, 60, 2); ctx.fill(); }
}

// ---------- Sammelsachen ----------
export function pickupSprite(k, picked = false) {
  return sprite(`pk:${k}:${picked}`, 50, 60, 25, 50, (ctx) => {
    switch (k) {
      case 'lavender':
        shadow(ctx, 0, 0, 14, 4);
        for (let i = -3; i <= 3; i++) {
          ctx.strokeStyle = '#6aa85a'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(i * 2, 0); ctx.quadraticCurveTo(i * 3, -12, i * 4.5, -22); ctx.stroke();
          if (!picked || i % 3 === 0) for (let j = 0; j < 4; j++) { ell(ctx, i * 4.5 - (i * 0.4) * j, -22 + j * 3.5, 2.4, 2.8); ctx.fillStyle = j % 2 ? '#a98be8' : '#b99af5'; ctx.fill(); }
        }
        break;
      case 'sunflower':
        shadow(ctx, 0, 0, 8, 3);
        ctx.strokeStyle = '#4f9a4f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.stroke();
        ctx.fillStyle = '#6cc063'; ell(ctx, -6, -18, 6, 3, -0.5); ctx.fill(); ell(ctx, 6, -24, 6, 3, 0.5); ctx.fill();
        if (!picked) flower(ctx, 0, -40, 8, '#ffd23f', '#9a6a3a', 11);
        else { ctx.fillStyle = '#9a6a3a'; circ(ctx, 0, -38, 3); ctx.fill(); }
        break;
      case 'poppy':
        ctx.strokeStyle = '#5aa05a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -8, 0, -16); ctx.stroke();
        flower(ctx, 0, -18, 4.2, '#ef4f5f', '#3b2a3a', 4);
        break;
      case 'daisy':
        ctx.strokeStyle = '#5aa05a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -12); ctx.stroke();
        flower(ctx, 0, -14, 3.6, '#fff', '#ffd23f', 8);
        break;
      case 'mushroom':
        shadow(ctx, 0, 0, 9, 3);
        rr(ctx, -4, -12, 8, 12, 3); fs(ctx, '#fff4e4', 1.2);
        ctx.beginPath(); ctx.ellipse(0, -11, 11, 9, 0, Math.PI, 0); ctx.closePath(); fs(ctx, '#e8584f');
        ctx.fillStyle = '#fff'; for (const [x, y, r] of [[-5, -15, 2], [3, -17, 2.4], [6, -13, 1.5]]) { circ(ctx, x, y, r); ctx.fill(); }
        break;
      case 'shell':
        ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(-9, -10); ctx.quadraticCurveTo(0, -22, 9, -10); ctx.closePath(); fs(ctx, '#ffd0dc', 1.4, '#e89ab0');
        ctx.strokeStyle = '#e89ab0'; ctx.lineWidth = 1; for (const a of [-0.8, -0.3, 0.2, 0.7]) { ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(Math.sin(a) * 10, -2 - Math.cos(a) * 14); ctx.stroke(); }
        break;
      case 'heartstone':
        shadow(ctx, 0, 0, 8, 3);
        heart(ctx, 0, -8, 20, '#e8a0b8');
        heart(ctx, 0, -9, 16, '#ffb3cf');
        sparkle(ctx, 7, -18, 3.5, '#fff');
        break;
      case 'clover':
        shadow(ctx, 0, 0, 8, 3);
        ctx.strokeStyle = '#3f8f45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -6, 0, -10); ctx.stroke();
        for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(0, -13); ctx.rotate((i / 4) * Math.PI * 2 + 0.4); heart(ctx, 0, -5, 11, '#4fbf5a'); ctx.restore(); }
        circ(ctx, 0, -13, 1.6); ctx.fillStyle = '#2f8f3a'; ctx.fill();
        sparkle(ctx, 9, -22, 3.5, '#fff');
        break;
      case 'lovenote':
        shadow(ctx, 0, 0, 9, 3);
        ctx.save(); ctx.rotate(-0.15);
        rr(ctx, -10, -20, 20, 15, 2); fs(ctx, '#fff0f6', 1.4, '#ff9ecb');
        heart(ctx, 0, -11, 9, '#ff6f9f');
        ctx.restore();
        sparkle(ctx, 9, -24, 3, '#fff');
        break;
      case 'recipe':
        shadow(ctx, 0, 0, 9, 3);
        ctx.save(); ctx.rotate(0.2);
        rr(ctx, -9, -22, 18, 20, 2); fs(ctx, '#fffaf0', 1.4, '#c9a070');
        ctx.strokeStyle = '#d9b080'; ctx.lineWidth = 1; for (const y of [-17, -13, -9, -5]) { ctx.beginPath(); ctx.moveTo(-6, y); ctx.lineTo(6, y); ctx.stroke(); }
        ctx.restore();
        break;
      case 'icestar':
        ctx.fillStyle = 'rgba(180,220,255,0.5)'; ell(ctx, 0, 0, 12, 4); ctx.fill();
        star(ctx, 0, -14, 9); fs(ctx, '#e6f6ff', 1.6, '#7ec8ff');
        sparkle(ctx, 8, -24, 4, '#fff');
        break;
      case 'chestnut':
        shadow(ctx, 0, 0, 8, 3);
        for (const [x, y] of [[-4, -4], [4, -5], [0, -9]]) { ell(ctx, x, y, 4.2, 3.6); fs(ctx, '#8a4a22', 1.2, '#5a2a12'); ctx.fillStyle = '#e8c49a'; ell(ctx, x, y + 2, 2.4, 1); ctx.fill(); ctx.fillStyle = '#fff6'; circ(ctx, x - 1.5, y - 1.5, 1); ctx.fill(); }
        break;
      case 'snowdrop':
        ctx.strokeStyle = '#5aa05a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(1, -10, 4, -14); ctx.stroke();
        ctx.fillStyle = '#6cc063'; ell(ctx, -3, -5, 1.6, 5, -0.3); ctx.fill();
        ctx.save(); ctx.translate(4, -13);
        for (const a of [-0.5, 0, 0.5]) { ctx.save(); ctx.rotate(a); ell(ctx, 0, 4, 2.2, 4.4); fs(ctx, '#ffffff', 0.8, '#cfd8e0'); ctx.restore(); }
        ctx.fillStyle = '#8fd46a'; circ(ctx, 0, 1, 1.4); ctx.fill();
        ctx.restore();
        break;
      case 'stone':
        shadow(ctx, 0, 0, 9, 3);
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-10, -10, 0, -11); ctx.quadraticCurveTo(10, -10, 9, 0); ctx.closePath(); fs(ctx, '#c9c1ba', 1.4, '#9a918a');
        ctx.fillStyle = '#e6e0da'; ell(ctx, -3, -7, 3.6, 2, -0.3); ctx.fill();
        break;
      case 'pinecone':
        shadow(ctx, 0, 0, 8, 3);
        ell(ctx, 0, -8, 6, 9); fs(ctx, '#a0683e', 1.3, '#6a4020');
        ctx.strokeStyle = '#6a4020'; ctx.lineWidth = 1; for (const y of [-13, -9, -5]) { ctx.beginPath(); ctx.moveTo(-5, y); ctx.lineTo(0, y + 2); ctx.lineTo(5, y); ctx.stroke(); }
        ctx.fillStyle = '#fff'; ell(ctx, 0, -16, 4, 2); ctx.fill();
        break;
      case 'horseshoe':
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(0, -14, 8, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
        ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 4.5; ctx.stroke();
        ctx.fillStyle = '#b8860b'; for (const a of [1, 1.35, 1.65, 2]) { circ(ctx, Math.cos(a * Math.PI) * 8, -14 + Math.sin(a * Math.PI) * 8, 0.9); ctx.fill(); }
        sparkle(ctx, 7, -24, 3.5, '#fff');
        break;
      default: break;
    }
  });
}

// ---------- Beet-Pflanzen ----------
export function drawCrop(ctx, x, y, crop, stage, wet, t) {
  // x,y = Mitte der Kachel (Boden)
  if (wet) { ctx.fillStyle = 'rgba(80,40,30,0.3)'; rr(ctx, x - T / 2 + 3, y - T / 2 + 3, T - 6, T - 6, 8); ctx.fill(); }
  if (!crop) return;
  const sw = Math.sin(t * 2 + x) * 0.05;
  ctx.save(); ctx.translate(x, y + 8); ctx.rotate(sw);
  if (stage === 0) {
    ctx.fillStyle = '#7a5038'; ell(ctx, 0, -2, 5, 3); ctx.fill();
    ctx.fillStyle = '#8fd46a'; ell(ctx, -2, -5, 2, 3, -0.5); ctx.fill(); ell(ctx, 2, -5, 2, 3, 0.5); ctx.fill();
  } else if (crop === 'carrot') {
    const n = stage === 1 ? 3 : 5, h = stage === 1 ? 8 : 14;
    if (stage >= 3) { ctx.fillStyle = '#ff9a3c'; ell(ctx, 0, -1, 5, 4); ctx.fill(); }
    for (let i = 0; i < n; i++) { const a = -0.7 + (i / (n - 1)) * 1.4; ctx.fillStyle = i % 2 ? '#5fb85a' : '#7fd36a'; ell(ctx, Math.sin(a) * h * 0.5, -h * 0.6, 2.4, h * 0.55, a); ctx.fill(); }
  } else if (crop === 'sunflower') {
    const h = stage === 1 ? 10 : stage === 2 ? 20 : 30;
    ctx.strokeStyle = '#4f9a4f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
    ctx.fillStyle = '#6cc063'; ell(ctx, -5, -h * 0.5, 5, 2.6, -0.5); ctx.fill(); ell(ctx, 5, -h * 0.6, 5, 2.6, 0.5); ctx.fill();
    if (stage >= 3) flower(ctx, 0, -h - 4, 7, '#ffd23f', '#9a6a3a', 11);
    else if (stage === 2) { ctx.fillStyle = '#9fd46a'; circ(ctx, 0, -h - 2, 4); ctx.fill(); }
  }
  ctx.restore();
  if (stage >= 3) sparkle(ctx, x + 10, y - 16 + Math.sin(t * 3) * 2, 3 + Math.sin(t * 5), '#fffbd0');
}

export { mix, star };
