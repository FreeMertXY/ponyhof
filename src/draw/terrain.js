// Gelände-Maler: zeichnet einen Chunk (8×8 Kacheln) einmal in ein Offscreen-Canvas.
// Weiche, runde Übergänge durch Ebenen mit abgerundeten Ecken.
import { G, TILE, WW, WH, FARM } from '../world.js';
import { hash2, noise2, shade, mix } from '../util.js';
import { rr, ell, circ, flower } from './paint.js';

export const CHUNK = 8;
const T = TILE;

export const COLORS = {
  sea: '#58b9e6', deep: '#62c3ea', shallow: '#93dff1', wetsand: '#efd7a2', sand: '#fbe9bd',
  grass: '#a8df80', forest: '#86c870', meadow: '#b6e68a', alpine: '#b4d98f', soil: '#b98457',
  path: '#efd6a5', pathEdge: '#dcbd87', plaza: '#ece0d0', plazaEdge: '#d6c4ae', cliff: '#bfae9d',
  bridge: '#cf9d6c', dock: '#d6a776', flowerbed: '#a5704b',
};

// Rang für die Schichtung (höher = liegt oben)
function rank(g) {
  switch (g) {
    case G.SEA: case G.DEEP: case G.BRIDGE: case G.DOCK: return 0;
    case G.SHALLOW: return 1;
    case G.WETSAND: return 2;
    case G.SAND: return 3;
    case G.GRASS: case G.FOREST: case G.MEADOW: case G.ALPINE: return 4;
    case G.SOIL: case G.FLOWERBED: return 5;
    case G.PATH: return 6;
    case G.PLAZA: return 7;
    case G.CLIFF: return 8;
    default: return 4;
  }
}

function grassColor(g) {
  return g === G.FOREST ? COLORS.forest : g === G.MEADOW ? COLORS.meadow : g === G.ALPINE ? COLORS.alpine : COLORS.grass;
}

// Kachel mit gerundeten konvexen Ecken zeichnen
function roundTile(ctx, px, py, s, tl, tr, br, bl, r, grow = 0) {
  const x = px - grow, y = py - grow, w = s + grow * 2, h = s + grow * 2;
  ctx.beginPath();
  ctx.moveTo(x + (tl ? r : 0), y);
  ctx.lineTo(x + w - (tr ? r : 0), y);
  if (tr) ctx.arcTo(x + w, y, x + w, y + r, r); else ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - (br ? r : 0));
  if (br) ctx.arcTo(x + w, y + h, x + w - r, y + h, r); else ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + (bl ? r : 0), y + h);
  if (bl) ctx.arcTo(x, y + h, x, y + h - r, r); else ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + (tl ? r : 0));
  if (tl) ctx.arcTo(x, y, x + r, y, r); else ctx.lineTo(x, y);
  ctx.closePath();
}

// Eine Ebene: alle Kacheln, für die inSet(x,y) gilt, mit Farbe fill (oder fillFn pro Kachel)
function layer(ctx, x0, y0, x1, y1, ox, oy, inSet, fill, r = T * 0.42, grow = 0, fillets = true) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const px = x * T - ox, py = y * T - oy;
      if (inSet(x, y)) {
        const L = inSet(x - 1, y), R = inSet(x + 1, y), U = inSet(x, y - 1), D = inSet(x, y + 1);
        roundTile(ctx, px, py, T, !L && !U, !R && !U, !R && !D, !L && !D, r, grow);
        ctx.fillStyle = typeof fill === 'function' ? fill(x, y) : fill;
        ctx.fill();
      } else if (fillets) {
        // konkave Ecken ausrunden
        const L = inSet(x - 1, y), R = inSet(x + 1, y), U = inSet(x, y - 1), D = inSet(x, y + 1);
        const rr2 = r * 0.6;
        ctx.fillStyle = typeof fill === 'function' ? fill(L ? x - 1 : x + 1, U ? y - 1 : y + 1) : fill;
        const corner = (cx, cy, sx, sy) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + sx * rr2, cy);
          ctx.quadraticCurveTo(cx, cy, cx, cy + sy * rr2);
          ctx.closePath();
          ctx.fill();
        };
        if (L && U && inSet(x - 1, y - 1)) corner(px, py, 1, 1);
        if (R && U && inSet(x + 1, y - 1)) corner(px + T, py, -1, 1);
        if (R && D && inSet(x + 1, y + 1)) corner(px + T, py + T, -1, -1);
        if (L && D && inSet(x - 1, y + 1)) corner(px, py + T, 1, -1);
      }
    }
  }
}

// Weiche Ebene mit Marching Squares: glatte, organische Kanten statt Treppenstufen
function msLayer(ctx, x0, y0, x1, y1, ox, oy, inSet, fill, th = 0.5, stroke = true, wob = 0) {
  const v = (x, y) => (inSet(x, y) ? 1 : 0);
  const f = (x, y) => {
    const b = 0.6 * v(x, y) + 0.1 * (v(x - 1, y) + v(x + 1, y) + v(x, y - 1) + v(x, y + 1));
    return wob && b > 0.05 && b < 0.95 ? b + (noise2(x * 0.45, y * 0.45, 77) - 0.5) * wob : b;
  };
  const W = x1 - x0 + 3;
  const vals = new Float32Array(W * (y1 - y0 + 3));
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) vals[(y - y0 + 1) * W + (x - x0 + 1)] = f(x, y);
  const val = (x, y) => vals[(y - y0 + 1) * W + (x - x0 + 1)];
  ctx.beginPath();
  for (let y = y0 - 1; y <= y1; y++) {
    for (let x = x0 - 1; x <= x1; x++) {
      const a = val(x, y), b = val(x + 1, y), c = val(x + 1, y + 1), d = val(x, y + 1);
      const inA = a >= th, inB = b >= th, inC = c >= th, inD = d >= th;
      if (!inA && !inB && !inC && !inD) continue;
      const px = (x + 0.5) * T - ox, py = (y + 0.5) * T - oy;
      if (inA && inB && inC && inD) { ctx.rect(px, py, T, T); continue; }
      const pts = [];
      const lerpP = (va, vb) => (th - va) / (vb - va);
      // Ecken im Uhrzeigersinn: A(0,0) B(1,0) C(1,1) D(0,1)
      if (inA) pts.push([0, 0]);
      if (inA !== inB) pts.push([lerpP(a, b), 0]);
      if (inB) pts.push([1, 0]);
      if (inB !== inC) pts.push([1, lerpP(b, c)]);
      if (inC) pts.push([1, 1]);
      if (inC !== inD) pts.push([1 - lerpP(c, d), 1]);
      if (inD) pts.push([0, 1]);
      if (inD !== inA) pts.push([0, 1 - lerpP(d, a)]);
      ctx.moveTo(px + pts[0][0] * T, py + pts[0][1] * T);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(px + pts[i][0] * T, py + pts[i][1] * T);
      ctx.closePath();
    }
  }
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = fill; ctx.lineWidth = 1; ctx.lineJoin = 'round'; }
}

export function paintChunk(ctx, world, cx, cy) {
  const x0 = cx * CHUNK, y0 = cy * CHUNK;
  const ox = x0 * T, oy = y0 * T;
  const ax = x0 - 1, ay = y0 - 1, bx = x0 + CHUNK, by = y0 + CHUNK;
  const g = (x, y) => world.g(Math.max(0, Math.min(WW - 1, x)), Math.max(0, Math.min(WH - 1, y)));
  const rk = (x, y) => rank(g(x, y));

  // 0) Wasser-Grund
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) {
    const t = g(x, y);
    ctx.fillStyle = t === G.SEA ? mix(COLORS.sea, '#3f9fd6', Math.min(1, Math.max(0, (y - 168) / 10))) : COLORS.deep;
    ctx.fillRect(x * T - ox, y * T - oy, T, T);
  }
  // Wasser-Glanz (statisch)
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) {
    if (rk(x, y) !== 0) continue;
    const h = hash2(x, y, 3);
    if (h < 0.35) {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2;
      const px = x * T - ox + h * 30 + 8, py = y * T - oy + hash2(x, y, 4) * 30 + 8;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + 6, py - 3, px + 12, py); ctx.stroke();
    }
  }
  const g0 = (x, y) => g(x, y);
  // 1) Flachwasser
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 1, COLORS.shallow, 0.36, true, 0.3);
  // Uferschaum
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 2, 'rgba(255,255,255,0.75)', 0.3, true, 0.3);
  // 2) nasser Sand, 3) Sand
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 2, COLORS.wetsand, 0.42, true, 0.3);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 3, COLORS.sand, 0.46, true, 0.3);
  // 4) Gras mit dunklerem Rand
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 4, shade(COLORS.grass, -0.14), 0.4, true, 0.3);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 4, COLORS.grass, 0.5, true, 0.3);
  // Grasarten weich ineinander
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => g0(x, y) === G.MEADOW, COLORS.meadow, 0.45, true, 0.4);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => g0(x, y) === G.ALPINE, COLORS.alpine, 0.45, true, 0.4);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => g0(x, y) === G.FOREST, COLORS.forest, 0.45, true, 0.4);
  // sanfte Farbflecken
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) {
    const t = g(x, y);
    if (rank(t) !== 4) continue;
    const n = noise2(x * 0.3, y * 0.3, 44);
    if (n > 0.42 && n < 0.58) continue;
    const c = grassColor(t);
    ctx.fillStyle = n >= 0.58 ? shade(c, 0.06) : shade(c, -0.04);
    ctx.globalAlpha = 0.28;
    ell(ctx, x * T - ox + T / 2, y * T - oy + T / 2, T * 0.85, T * 0.7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Hügel
  for (const hl of world.hills) {
    const hx = hl.x * T - ox, hy = hl.y * T - oy, hr = hl.r * T;
    if (hx + hr * 1.3 < 0 || hy + hr * 1.3 < 0 || hx - hr * 1.3 > CHUNK * T || hy - hr * 1.3 > CHUNK * T) continue;
    const gr = ctx.createRadialGradient(hx - hr * 0.3, hy - hr * 0.35, hr * 0.1, hx, hy, hr * 1.15);
    gr.addColorStop(0, 'rgba(255,255,220,0.5)');
    gr.addColorStop(0.6, 'rgba(255,255,220,0.14)');
    gr.addColorStop(0.85, 'rgba(60,110,60,0.12)');
    gr.addColorStop(1, 'rgba(60,110,60,0)');
    ctx.fillStyle = gr;
    ell(ctx, hx, hy, hr * 1.15, hr * 1.0); ctx.fill();
  }
  // 5) Beete (bewusst eckig-rund wie echte Beete)
  layer(ctx, ax, ay, bx, by, ox, oy, (x, y) => g(x, y) === G.SOIL || g(x, y) === G.FLOWERBED, (x, y) => (g(x, y) === G.SOIL ? COLORS.soil : COLORS.flowerbed), T * 0.2, -2, false);
  // 6) Wege (Rand, dann Füllung)
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 6 && rk(x, y) < 8, COLORS.pathEdge, 0.36);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) >= 6 && rk(x, y) < 8, COLORS.path, 0.48);
  // 7) Pflaster
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) === 7, COLORS.plazaEdge, 0.4);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) === 7, COLORS.plaza, 0.5);
  // 8) Felsen
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) === 8, shade(COLORS.cliff, -0.25), 0.38);
  msLayer(ctx, ax, ay, bx, by, ox, oy, (x, y) => rk(x, y) === 8, COLORS.cliff, 0.5);

  // ---------- Details pro Kachel ----------
  for (let y = y0 - 1; y <= y0 + CHUNK; y++) {
    for (let x = x0 - 1; x <= x0 + CHUNK; x++) {
      const t = g(x, y);
      const px = x * T - ox, py = y * T - oy;
      const h = hash2(x, y, 1), h2 = hash2(x, y, 2), h3 = hash2(x, y, 5);
      switch (t) {
        case G.GRASS: case G.FOREST: case G.MEADOW: case G.ALPINE: {
          const base = grassColor(t);
          // Grashalme
          ctx.strokeStyle = shade(base, -0.22); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          const n = t === G.FOREST ? 3 : 2;
          for (let i = 0; i < n; i++) {
            const gx = px + hash2(x, y, 10 + i) * T, gy = py + hash2(x, y, 20 + i) * T;
            if (hash2(x, y, 30 + i) < 0.55) {
              ctx.beginPath(); ctx.moveTo(gx - 3, gy - 4); ctx.lineTo(gx - 1, gy); ctx.lineTo(gx + 1, gy - 5); ctx.lineTo(gx + 2, gy); ctx.lineTo(gx + 4, gy - 3); ctx.stroke();
            }
          }
          if (t === G.MEADOW) {
            const cols = ['#fff', '#ffd6e7', '#ffe57a', '#c9b6ff', '#ff9aa8'];
            const k = 2 + Math.floor(h * 3);
            for (let i = 0; i < k; i++) {
              const fx = px + hash2(x, y, 40 + i) * T, fy = py + hash2(x, y, 50 + i) * T;
              flower(ctx, fx, fy, 2.2, cols[Math.floor(hash2(x, y, 60 + i) * cols.length)], '#ffcf4a');
            }
          } else if (t === G.GRASS && h < 0.22) {
            flower(ctx, px + h2 * T, py + h3 * T, 2, h < 0.1 ? '#fff' : '#ffe57a', '#ffb94a');
          } else if (t === G.FOREST) {
            if (h < 0.12) { ctx.fillStyle = 'rgba(60,110,50,0.35)'; ell(ctx, px + h2 * T, py + h3 * T, 7, 4); ctx.fill(); }
            if (h > 0.93) { // Farn
              ctx.strokeStyle = '#4f9a4f'; ctx.lineWidth = 2;
              const fx = px + h2 * T, fy = py + h3 * T;
              for (let a = -2; a <= 2; a++) { ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + a * 4, fy - 8, fx + a * 7, fy - 6); ctx.stroke(); }
            }
            if (h > 0.4 && h < 0.46) { ctx.fillStyle = '#d98f5c'; ell(ctx, px + h2 * T, py + h3 * T, 3, 2, h * 6); ctx.fill(); }
          } else if (t === G.ALPINE) {
            if (h < 0.18) { ctx.fillStyle = '#b3aaa3'; ell(ctx, px + h2 * T, py + h3 * T, 4 + h * 10, 3 + h * 6); ctx.fill(); ctx.fillStyle = '#d2cac4'; ell(ctx, px + h2 * T - 1, py + h3 * T - 1, 2.4 + h * 6, 1.6 + h * 3); ctx.fill(); }
            else if (h > 0.9) flower(ctx, px + h2 * T, py + h3 * T, 2, '#fff', '#f2d45a', 6);
          }
          break;
        }
        case G.SAND: case G.WETSAND:
          ctx.fillStyle = t === G.SAND ? '#ecd49c' : '#dcc088';
          for (let i = 0; i < 3; i++) { circ(ctx, px + hash2(x, y, 70 + i) * T, py + hash2(x, y, 80 + i) * T, 1.2); ctx.fill(); }
          if (h < 0.03 && t === G.SAND) { ctx.fillStyle = '#ff9f8a'; starfish(ctx, px + h2 * T, py + h3 * T); }
          break;
        case G.PATH:
          if (h < 0.5) {
            ctx.fillStyle = '#dcc08f';
            ell(ctx, px + h2 * T, py + h3 * T, 3 + h * 3, 2 + h * 2); ctx.fill();
            ctx.fillStyle = '#f7e6c2';
            ell(ctx, px + h2 * T - 1, py + h3 * T - 1, 1.5 + h * 1.5, 1 + h); ctx.fill();
          }
          break;
        case G.PLAZA: {
          if (g(x - 1, y) !== G.PLAZA || g(x + 1, y) !== G.PLAZA || g(x, y - 1) !== G.PLAZA || g(x, y + 1) !== G.PLAZA) break;
          ctx.strokeStyle = COLORS.plazaEdge; ctx.lineWidth = 1.5;
          const off = (y % 2) * (T / 4);
          for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) {
            const sx = px + i * (T / 2) + off - T / 4 + 3, sy = py + j * (T / 3) + 2;
            rr(ctx, sx, sy, T / 2 - 5, T / 3 - 4, 5);
            ctx.fillStyle = hash2(x * 3 + i, y * 3 + j, 9) < 0.5 ? '#f3e9dc' : '#e7d9c7';
            ctx.fill(); ctx.stroke();
          }
          break;
        }
        case G.SOIL:
          ctx.strokeStyle = 'rgba(90,50,30,0.35)'; ctx.lineWidth = 2;
          for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(px + 6, py + i * 12); ctx.lineTo(px + T - 6, py + i * 12); ctx.stroke(); }
          break;
        case G.FLOWERBED: {
          const cols = ['#ff7eb6', '#ffd166', '#b79cf0', '#ff9f7a', '#fff'];
          for (let i = 0; i < 6; i++) {
            const fx = px + 6 + hash2(x, y, 90 + i) * (T - 12), fy = py + 6 + hash2(x, y, 95 + i) * (T - 12);
            ctx.fillStyle = '#5aa05a'; ell(ctx, fx, fy + 3, 3, 2); ctx.fill();
            flower(ctx, fx, fy, 3.2, cols[(i + x + y) % cols.length], '#ffe07a');
          }
          break;
        }
        case G.CLIFF: {
          // Gesteinsstruktur
          const up = g(x, y - 1) !== G.CLIFF, down = g(x, y + 1) !== G.CLIFF;
          ctx.fillStyle = shade(COLORS.cliff, 0.12);
          ell(ctx, px + h * T, py + h2 * T * 0.6 + 8, 9 + h3 * 6, 5); ctx.fill();
          ctx.strokeStyle = shade(COLORS.cliff, -0.18); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(px + 4, py + 20 + h * 10); ctx.quadraticCurveTo(px + T / 2, py + 16 + h2 * 10, px + T - 4, py + 22 + h3 * 8); ctx.stroke();
          if (up) { // Graskante oben
            ctx.fillStyle = '#9fd47a';
            rr(ctx, px - 2, py - 3, T + 4, 12, 6); ctx.fill();
            ctx.fillStyle = '#8cc46a';
            for (let i = 0; i < 4; i++) { circ(ctx, px + 6 + i * 12, py + 9, 4); ctx.fill(); }
          }
          if (down) {
            ctx.fillStyle = 'rgba(80,60,60,0.25)';
            rr(ctx, px, py + T - 12, T, 12, 4); ctx.fill();
          }
          break;
        }
        default: break;
      }
    }
  }
  // Brücken & Stege
  for (let y = y0 - 1; y <= y0 + CHUNK; y++) {
    for (let x = x0 - 1; x <= x0 + CHUNK; x++) {
      const t = g(x, y);
      if (t !== G.BRIDGE && t !== G.DOCK) continue;
      const px = x * T - ox, py = y * T - oy;
      const col = t === G.BRIDGE ? COLORS.bridge : COLORS.dock;
      const same = (xx, yy) => g(xx, yy) === t;
      // Richtung: Bretter quer zur Laufrichtung
      const horiz = same(x - 1, y) || same(x + 1, y) || rank(g(x - 1, y)) > 0 || rank(g(x + 1, y)) > 0;
      ctx.fillStyle = 'rgba(40,60,90,0.25)';
      ctx.fillRect(px + 2, py + 6, T, T);
      ctx.fillStyle = col;
      ctx.fillRect(px, py, T, T);
      ctx.strokeStyle = shade(col, -0.25); ctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        if (horiz) { ctx.moveTo(px + i * 12, py); ctx.lineTo(px + i * 12, py + T); }
        else { ctx.moveTo(px, py + i * 12); ctx.lineTo(px + T, py + i * 12); }
        ctx.stroke();
      }
      ctx.fillStyle = shade(col, -0.3);
      for (let i = 0; i < 4; i++) { circ(ctx, px + (horiz ? i * 12 + 6 : 5), py + (horiz ? 5 : i * 12 + 6), 1.3); ctx.fill(); }
      // Geländer an Wasserkanten (Brücke)
      if (t === G.BRIDGE) {
        const wN = rank(g(x, y - 1)) === 0 && !same(x, y - 1), wS = rank(g(x, y + 1)) === 0 && !same(x, y + 1);
        const wW = rank(g(x - 1, y)) === 0 && !same(x - 1, y), wE = rank(g(x + 1, y)) === 0 && !same(x + 1, y);
        ctx.fillStyle = '#9a6a45';
        if (wN) { ctx.fillRect(px, py - 2, T, 5); circ(ctx, px + 4, py, 4); ctx.fill(); }
        if (wS) { ctx.fillRect(px, py + T - 5, T, 5); circ(ctx, px + 4, py + T - 3, 4); ctx.fill(); }
        if (wW) { ctx.fillRect(px - 2, py, 5, T); }
        if (wE) { ctx.fillRect(px + T - 3, py, 5, T); }
      }
    }
  }
}

function starfish(ctx, x, y) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 2 : 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
}

// Kleine Weltkarte (1 Pixel pro Kachel), für Minikarte und große Karte
export function paintMiniMap(ctx, world, scale = 2) {
  const col = {
    [G.GRASS]: '#a8df80', [G.FOREST]: '#6fb563', [G.PATH]: '#ecd29c', [G.SAND]: '#f8e5b0', [G.DEEP]: '#5cbde6',
    [G.SHALLOW]: '#8fdcf0', [G.MEADOW]: '#bfe78e', [G.SOIL]: '#b98457', [G.PLAZA]: '#eee0cf', [G.ALPINE]: '#c6ddab',
    [G.CLIFF]: '#b3a393', [G.BRIDGE]: '#c9975f', [G.DOCK]: '#c9975f', [G.SEA]: '#4fb0e0', [G.WETSAND]: '#ebd39e', [G.FLOWERBED]: '#ff9ec4',
  };
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    ctx.fillStyle = col[world.g(x, y)] || '#a8df80';
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }
  // Bäume & Gebäude
  for (const o of world.objects) {
    if (o.k === 'tree') { ctx.fillStyle = o.v === 'pine' ? '#4f8f55' : o.v === 'blossom' || o.v === 'bigblossom' ? '#f3a6c4' : '#5fa55a'; ctx.fillRect(o.x * scale, o.y * scale, scale, scale); }
    else if (o.k === 'bld') { ctx.fillStyle = o.type === 'lighthouse' ? '#ef6f6f' : '#e58f7a'; ctx.fillRect(o.x * scale, o.y * scale, o.w * scale, o.h * scale); }
    else if (o.k === 'fence') { ctx.fillStyle = '#a57a52'; ctx.fillRect(o.x * scale, o.y * scale, scale, scale); }
  }
  void FARM;
}
