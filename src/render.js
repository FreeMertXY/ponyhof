// Renderer: Gelände-Chunks (vorgezeichnet), y-sortierte Objekte, Licht, Wetter.
import { TILE, WW, WH, G, FARM } from './world.js';
import { CHUNK, paintChunk } from './draw/terrain.js';
import { treeSprite, buildingSprite, fenceSprite, smallSprite, signSprite, lampSprite, bushSprite, rockSprite, stumpSprite, drawSprite, pickupSprite, drawCrop, decoSprite, drawBunting, setRenderScale } from './draw/objects.js';
import { makeCanvas, ell, circ, rr, heart, sparkle, outlinedText, FONT, star } from './draw/paint.js';
import { hash2, clamp, lerp, genitive } from './util.js';

const T = TILE;
const NCX = Math.ceil(WW / CHUNK), NCY = Math.ceil(WH / CHUNK);

const KEYS = [
  // [Stunde, Multiplikationsfarbe]
  [0, [88, 92, 172]], [4.5, [88, 92, 172]], [5.6, [200, 150, 190]], [6.6, [255, 214, 214]], [7.5, [255, 255, 255]],
  [17.2, [255, 255, 255]], [18.4, [255, 226, 196]], [19.4, [255, 188, 176]], [20.3, [176, 136, 200]], [21.2, [88, 92, 172]], [24, [88, 92, 172]],
];

export function lightingAt(min) {
  const h = (min / 60) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const [h0, c0] = KEYS[i], [h1, c1] = KEYS[i + 1];
  const k = h1 > h0 ? (h - h0) / (h1 - h0) : 0;
  const c = c0.map((v, j) => Math.round(lerp(v, c1[j], Math.max(0, Math.min(1, k)))));
  const lum = (c[0] * 0.3 + c[1] * 0.5 + c[2] * 0.2) / 255;
  const dark = Math.max(0, Math.min(0.6, (1 - lum) * 1.05));
  // warmer Schimmer bei Sonnenuntergang
  const glow = h > 17.5 && h < 20.5 ? Math.sin(((h - 17.5) / 3) * Math.PI) * 0.22 : h > 5.5 && h < 7.5 ? Math.sin(((h - 5.5) / 2) * Math.PI) * 0.12 : 0;
  return { mul: `rgb(${c[0]},${c[1]},${c[2]})`, white: c[0] + c[1] + c[2] >= 762, dark, glow, night: dark > 0.3 };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.RS = 1;
    this.quality = 1;
    this.Z = 1;
    this.w = 0; this.h = 0;
    this.vw = 0; this.vh = 0;
    this.chunks = new Map();
    this.cam = { x: 0, y: 0 };
    this.shake = 0;
    this.light = makeCanvas(16, 16);
    this.lctx = this.light.getContext('2d');
    this.buckets = null;
    this.world = null;
    this.stars = Array.from({ length: 90 }, (_, i) => ({ x: hash2(i, 1, 3), y: hash2(i, 2, 3), s: 0.6 + hash2(i, 3, 3) * 1.6, p: hash2(i, 4, 3) * 6 }));
    this.rain = Array.from({ length: 160 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: 0.7 + Math.random() * 0.6 }));
    this.frameMs = 16;
    this.resize();
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth, h = window.innerHeight;
    // bei sehr großen Fenstern Auflösung etwas senken (60 fps)
    const rs = (w * h * dpr * dpr > 3200000 ? Math.max(1, Math.sqrt(3200000 / (w * h))) : dpr) * this.quality;
    // Zoom: immer etwa 16 Kacheln hoch sichtbar
    const z = Math.max(0.75, Math.min(2.2, h / 690));
    if (Math.abs(rs - this.RS) > 0.01 || Math.abs(z - this.Z) > 0.01) { this.RS = rs; this.Z = z; this.chunks.clear(); setRenderScale(rs * z); }
    this.w = w; this.h = h;
    this.vw = w / this.Z; this.vh = h / this.Z;
    this.canvas.width = Math.round(w * this.RS);
    this.canvas.height = Math.round(h * this.RS);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.LD = 3; // Lichtmaske in 1/3 Auflösung
    this.light.width = Math.ceil(w / this.LD); this.light.height = Math.ceil(h / this.LD);
  }

  setWorld(world) {
    this.world = world;
    this.chunks.clear();
    // Objekte in Chunk-Eimer sortieren
    this.buckets = Array.from({ length: NCX * NCY }, () => []);
    for (const o of world.objects) {
      const bx = clamp(Math.floor(o.x / CHUNK), 0, NCX - 1), by = clamp(Math.floor(o.y / CHUNK), 0, NCY - 1);
      this.buckets[by * NCX + bx].push(o);
    }
  }

  invalidateAll() { this.chunks.clear(); }

  getChunk(cx, cy) {
    const key = cy * NCX + cx;
    let c = this.chunks.get(key);
    if (c) { this.chunks.delete(key); this.chunks.set(key, c); return c; }
    const sc = this.RS * this.Z;
    c = makeCanvas(CHUNK * T * sc, CHUNK * T * sc);
    const ctx = c.getContext('2d');
    ctx.scale(sc, sc);
    paintChunk(ctx, this.world, cx, cy);
    this.chunks.set(key, c);
    if (this.chunks.size > 90) this.chunks.delete(this.chunks.keys().next().value);
    this.painted++;
    return c;
  }

  follow(tx, ty, dt, snap = false) {
    const x = tx * T, y = ty * T;
    const k = snap ? 1 : 1 - Math.pow(0.0025, dt);
    this.cam.x += (x - this.cam.x) * k;
    this.cam.y += (y - this.cam.y) * k;
    const hw = this.vw / 2, hh = this.vh / 2;
    this.cam.x = clamp(this.cam.x, hw, WW * T - hw);
    this.cam.y = clamp(this.cam.y, hh, WH * T - hh);
  }

  // Bildschirm -> Welt (Kacheln)
  screenToWorld(sx, sy) {
    return { x: (sx / this.Z - this.vw / 2 + this.cam.x) / T, y: (sy / this.Z - this.vh / 2 + this.cam.y) / T };
  }
  worldToScreen(x, y) {
    return { x: (x * T - this.cam.x + this.vw / 2) * this.Z, y: (y * T - this.cam.y + this.vh / 2) * this.Z };
  }

  draw(game, t) {
    const ctx = this.ctx;
    const RS = this.RS, SC = this.RS * this.Z;
    this.painted = 0;
    ctx.setTransform(RS, 0, 0, RS, 0, 0);
    ctx.fillStyle = '#5cbde6';
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.imageSmoothingEnabled = true;
    const sx = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const ox = Math.round((this.cam.x - this.vw / 2 + sx) * SC) / SC, oy = Math.round((this.cam.y - this.vh / 2) * SC) / SC;
    ctx.save();
    ctx.translate(-ox, -oy);
    // Gelände
    const cx0 = Math.max(0, Math.floor(ox / (CHUNK * T))), cy0 = Math.max(0, Math.floor(oy / (CHUNK * T)));
    const cx1 = Math.min(NCX - 1, Math.floor((ox + this.vw) / (CHUNK * T))), cy1 = Math.min(NCY - 1, Math.floor((oy + this.vh) / (CHUNK * T)));
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      ctx.drawImage(this.getChunk(cx, cy), cx * CHUNK * T, cy * CHUNK * T, CHUNK * T, CHUNK * T);
    }
    const view = { x0: ox / T, y0: oy / T, x1: (ox + this.vw) / T, y1: (oy + this.vh) / T };
    this.drawWater(ctx, view, t, game);
    this.drawGroundOverlays(ctx, game, view, t);
    // Objekte sammeln
    const list = [];
    const bx0 = Math.max(0, Math.floor((view.x0 - 4) / CHUNK)), bx1 = Math.min(NCX - 1, Math.floor((view.x1 + 4) / CHUNK));
    const by0 = Math.max(0, Math.floor((view.y0 - 2) / CHUNK)), by1 = Math.min(NCY - 1, Math.floor((view.y1 + 5) / CHUNK));
    for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) {
      for (const o of this.buckets[by * NCX + bx]) {
        const w = o.w || 1;
        if (o.x + w + 2 < view.x0 || o.x - 2 > view.x1 || o.y - (o.h || 1) - 5 > view.y1 || o.y + (o.h || 1) + 3 < view.y0) continue;
        list.push({ y: this.sortY(o), o });
      }
    }
    // Sammelsachen
    for (const p of game.visiblePickups(view)) list.push({ y: p.y + 0.2, p });
    // Beete
    if (view.x1 > 88 && view.x0 < 100 && view.y1 > 80 && view.y0 < 88) list.push({ y: 0, ground: true, crops: true });
    // Deko
    for (const d of game.S.deco) if (d.x > view.x0 - 2 && d.x < view.x1 + 2 && d.y > view.y0 - 2 && d.y < view.y1 + 3) list.push({ y: d.y + 1, d });
    // Figuren
    for (const e of game.entities) if (e.visible !== false && e.x > view.x0 - 3 && e.x < view.x1 + 3 && e.y > view.y0 - 2 && e.y < view.y1 + 4) list.push({ y: e.y, e });
    list.sort((a, b) => a.y - b.y);
    const P = game.player;
    for (const it of list) {
      if (it.crops) this.drawCrops(ctx, game, t);
      else if (it.o) this.drawObj(ctx, it.o, t, game, P);
      else if (it.p) drawSprite(ctx, pickupSprite(it.p.k, it.p.picked), (it.p.x) * T, (it.p.y) * T + 12 + (it.p.k === 'horseshoe' ? Math.sin(t * 3 + it.p.x) * 2 : 0));
      else if (it.d) drawSprite(ctx, decoSprite(it.d.id), (it.d.x + 0.5) * T, (it.d.y + 1) * T - 6);
      else if (it.e) it.e.draw(ctx, game, t);
    }
    // Partikel & Welt-Overlays
    game.particles.draw(ctx, t);
    game.drawWorldOverlay?.(ctx, t, view);
    this.drawWeatherWorld(ctx, game, view, t);
    ctx.restore();
    // Licht und Wetter (Bildschirm)
    this.drawLighting(ctx, game, view, t, ox, oy);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.save(); ctx.translate(-ox, -oy); game.particles.drawTop(ctx, t); ctx.restore();
    ctx.setTransform(RS, 0, 0, RS, 0, 0);
    this.drawWeatherScreen(ctx, game, t);
  }

  sortY(o) {
    if (o.k === 'bld') return o.y + o.h;
    if (o.k === 'farmgate') return o.y;
    if (o.k === 'bunting') return o.y - 2;
    if (o.k === 'fountain') return o.y + 2.6;
    if (o.k === 'stage') return o.y - 1;
    return o.y + 0.9;
  }

  drawObj(ctx, o, t, game, P) {
    const X = (o.x + 0.5) * T, Y = (o.y + 1) * T;
    switch (o.k) {
      case 'tree': {
        let extra = '';
        if (o.v === 'apple' && game.treeShaken(o.id)) extra = 'empty';
        const spr = treeSprite(o.v, o.s || 1, extra);
        const behind = P && Math.abs(P.x - (o.x + 0.5)) < 1.3 * (o.v === 'bigblossom' ? 1.8 : 1) && P.y < o.y + 0.9 && P.y > o.y - 2.2 * (o.v === 'bigblossom' ? 1.8 : 1);
        const sway = o.v === 'palm' ? 0 : 0;
        drawSprite(ctx, spr, X + sway, Y - 6, behind ? 0.55 : 1);
        if (o.shake && o.shake > t) { /* Wackeln via Partikel */ }
        break;
      }
      case 'bush': drawSprite(ctx, bushSprite(o.v), X, Y - 8); break;
      case 'rock': drawSprite(ctx, rockSprite(o.v), X, Y - 8); break;
      case 'stump': drawSprite(ctx, stumpSprite(), X, Y - 10); break;
      case 'bld': {
        if (o.type === 'lighthouse') drawSprite(ctx, buildingSprite(o), (o.x + o.w / 2) * T, (o.y + o.h) * T - 4);
        else drawSprite(ctx, buildingSprite(o), o.x * T, (o.y + o.h) * T);
        if (game.lightingNight && o.type !== 'lighthouse') {
          // warme Fenster nachts
          ctx.fillStyle = 'rgba(255,220,140,0.35)';
        }
        break;
      }
      case 'fence': {
        const w = this.world;
        const m = (w.isFence(o.x, o.y - 1) ? 1 : 0) | (w.isFence(o.x + 1, o.y) ? 2 : 0) | (w.isFence(o.x, o.y + 1) ? 4 : 0) | (w.isFence(o.x - 1, o.y) ? 8 : 0);
        drawSprite(ctx, fenceSprite(o.style, m), X, Y - 10);
        break;
      }
      case 'lamp': drawSprite(ctx, lampSprite(), X, Y - 8); break;
      case 'sign': drawSprite(ctx, signSprite(o.lines), X, Y - 8); break;
      case 'farmgate': this.drawFarmGate(ctx, o, game, t); break;
      case 'bunting': drawBunting(ctx, o.x * T, o.y * T, o.w * T, t); break;
      case 'fountain': {
        drawSprite(ctx, smallSprite('fountain'), (o.x + 1.5) * T, (o.y + 2.6) * T);
        const fx = (o.x + 1.5) * T, fy = (o.y + 2.6) * T - 52;
        for (let i = 0; i < 8; i++) {
          const k = ((t * 1.3 + i / 8) % 1);
          const a = (i / 8) * Math.PI * 2;
          ctx.fillStyle = `rgba(200,240,255,${1 - k})`;
          circ(ctx, fx + Math.cos(a) * k * 18, fy - 14 + k * k * 30 - k * 22 + Math.sin(a) * k * 5, 2.2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ell(ctx, fx, fy - 10, 3, 8); ctx.fill();
        break;
      }
      default: {
        const spr = smallSprite(o.k, o);
        const big = ['stall', 'hut', 'log', 'shelter'].includes(o.k);
        drawSprite(ctx, spr, big ? o.x * T : X, Y - 6);
      }
    }
  }

  drawFarmGate(ctx, o, game, t) {
    const x = (o.x + 0.5) * T, top = 86 * T - 54;
    const y1 = 86.8 * T, y2 = 92.8 * T;
    // Bogen über den Weg (von oben gesehen quer)
    ctx.save();
    ctx.strokeStyle = '#b88a5e'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y1 - 60); ctx.quadraticCurveTo(x + 10, (y1 + y2) / 2 - 90, x, y2 - 60); ctx.stroke();
    // Schild
    const name = genitive(game.S.player.name) + ' Ponyhof';
    ctx.font = `700 15px ${FONT}`;
    const w = ctx.measureText(name).width + 26;
    const sy = (y1 + y2) / 2 - 100 + Math.sin(t * 1.5) * 1.2;
    ctx.strokeStyle = '#9a6a45'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - w / 3, sy - 4); ctx.lineTo(x - w / 3, sy - 16); ctx.moveTo(x + w / 3, sy - 4); ctx.lineTo(x + w / 3, sy - 16); ctx.stroke();
    rr(ctx, x - w / 2, sy - 6, w, 28, 10);
    ctx.fillStyle = '#fff6e6'; ctx.fill(); ctx.strokeStyle = '#c98a5a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#e8587a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(name, x, sy + 8);
    heart(ctx, x - w / 2 + 8, sy + 9, 7, '#ff8fb1');
    heart(ctx, x + w / 2 - 8, sy + 9, 7, '#ff8fb1');
    ctx.restore();
    void top;
  }

  drawCrops(ctx, game, t) {
    const S = game.S;
    this.world.gardenPlots.forEach((pl, i) => {
      const g = S.garden[i] || {};
      drawCrop(ctx, (pl.x + 0.5) * T, (pl.y + 0.5) * T, g.crop, game.cropStage(g), g.wet > 0, t);
    });
  }

  drawWater(ctx, view, t, game) {
    const w = this.world;
    const x0 = Math.max(0, Math.floor(view.x0)), x1 = Math.min(WW - 1, Math.ceil(view.x1));
    const y0 = Math.max(0, Math.floor(view.y0)), y1 = Math.min(WH - 1, Math.ceil(view.y1));
    ctx.lineCap = 'round';
    const night = game.lightingNight;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const g = w.g(x, y);
      if (g !== G.DEEP && g !== G.SEA && g !== G.SHALLOW) continue;
      const h = hash2(x, y, 11);
      const px = x * T, py = y * T;
      if (h < 0.3) {
        const k = Math.sin(t * 1.6 + h * 20);
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + k * 0.15})`;
        ctx.lineWidth = 2.2;
        const wx = px + 10 + h * 60 + Math.sin(t + h * 9) * 3, wy = py + 14 + hash2(x, y, 12) * 22;
        ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 5, wy - 4, wx + 10, wy); ctx.quadraticCurveTo(wx + 15, wy + 4, wx + 20, wy); ctx.stroke();
      }
      if (night && h > 0.85) { // Sterne im Wasser
        const tw = 0.5 + Math.sin(t * 3 + h * 40) * 0.5;
        sparkle(ctx, px + hash2(x, y, 13) * T, py + hash2(x, y, 14) * T, 2 + tw * 2, `rgba(255,255,230,${0.4 + tw * 0.5})`);
      }
      // Brandung am Meer
      if (g === G.SEA) {
        const land = w.g(x, y - 1) !== G.SEA || w.g(x - 1, y) !== G.SEA && w.g(x - 1, y) !== G.DEEP;
        if (land && w.g(x, y - 1) !== G.SEA) {
          const k = (Math.sin(t * 1.2 + x * 0.5) + 1) / 2;
          ctx.fillStyle = `rgba(255,255,255,${0.75 - k * 0.35})`;
          ctx.beginPath();
          const fy = py + 2 + k * 10;
          ctx.moveTo(px - 2, fy);
          for (let i = 0; i <= 4; i++) ctx.quadraticCurveTo(px + i * 12 - 6, fy + 7, px + i * 12, fy);
          ctx.lineTo(px + T + 2, fy - 6 - k * 6); ctx.lineTo(px - 2, fy - 6 - k * 6); ctx.closePath(); ctx.fill();
        }
      }
    }
  }

  drawGroundOverlays(ctx, game, view, t) {
    // Wolkenschatten
    if (game.S.weather.kind !== 'rain') {
      ctx.fillStyle = 'rgba(40,60,90,0.07)';
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 1731 + t * 18) % (WW * T + 800)) - 400, cy = (hash2(i, 7, 7) * WH * T);
        if (cx > view.x0 * T - 400 && cx < view.x1 * T + 400 && cy > view.y0 * T - 300 && cy < view.y1 * T + 300) {
          ell(ctx, cx, cy, 260, 110); ctx.fill();
          ell(ctx, cx + 140, cy - 40, 150, 90); ctx.fill();
        }
      }
    }
  }

  drawWeatherWorld(ctx, game, view, t) {
    // Glühwürmchen nachts
    if (!game.lightingNight) return;
    const w = this.world;
    const x0 = Math.floor(view.x0), y0 = Math.floor(view.y0);
    for (let y = y0; y < view.y1; y += 2) for (let x = x0; x < view.x1; x += 2) {
      const g = w.g(x, y);
      if (g !== G.FOREST && g !== G.MEADOW && g !== G.GRASS) continue;
      const h = hash2(x, y, 21);
      if (h > (g === G.FOREST ? 0.3 : 0.1)) continue;
      const fx = (x + 1 + Math.sin(t * 0.7 + h * 50) * 1.2) * T, fy = (y + 1 + Math.cos(t * 0.5 + h * 30) * 1) * T;
      const b = 0.5 + 0.5 * Math.sin(t * 3 + h * 90);
      ctx.fillStyle = `rgba(255,250,150,${0.25 * b})`; circ(ctx, fx, fy, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,255,200,${0.6 + 0.4 * b})`; circ(ctx, fx, fy, 2.2); ctx.fill();
    }
  }

  lightSprite() {
    if (this._ls) return this._ls;
    const c = makeCanvas(128, 128), x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.5, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    this._ls = c;
    return c;
  }

  glowSprite(col) {
    this._gs = this._gs || new Map();
    let c = this._gs.get(col);
    if (c) return c;
    c = makeCanvas(128, 128);
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, hexA(col, 0.32)); g.addColorStop(0.6, hexA(col, 0.1)); g.addColorStop(1, hexA(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    this._gs.set(col, c);
    return c;
  }

  drawLighting(ctx, game, view, t, ox, oy) {
    const L = game.lighting, Z = this.Z;
    ctx.setTransform(this.RS, 0, 0, this.RS, 0, 0);
    if (L.glow > 0.01) {
      const gr = ctx.createLinearGradient(0, 0, 0, this.h);
      gr.addColorStop(0, `rgba(255,140,170,${L.glow})`); gr.addColorStop(1, `rgba(255,190,120,${L.glow * 0.6})`);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, this.w, this.h);
    }
    if (L.white) return;
    const lc = this.lctx, lw = this.light.width, lh = this.light.height;
    lc.globalCompositeOperation = 'source-over';
    lc.clearRect(0, 0, lw, lh);
    lc.fillStyle = L.mul;
    lc.fillRect(0, 0, lw, lh);
    const lights = L.dark > 0.08 ? game.collectLights(view) : [];
    lc.globalCompositeOperation = 'destination-out';
    const LD = this.LD, ls = this.lightSprite();
    lc.globalAlpha = Math.min(1, L.dark * 1.8);
    for (const l of lights) {
      const x = ((l.x * T - ox) * Z) / LD, y = ((l.y * T - oy) * Z) / LD, r = ((l.r * T * Z) / LD) * (1 + Math.sin(t * 3 + l.x) * 0.03);
      if (x < -r || y < -r || x > lw + r || y > lh + r) continue;
      lc.drawImage(ls, x - r, y - r, r * 2, r * 2);
    }
    lc.globalAlpha = 1;
    lc.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.light, 0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'source-over';
    if (L.dark < 0.08) return;
    // warmer Schein
    ctx.globalCompositeOperation = 'lighter';
    ctx.setTransform(this.RS * Z, 0, 0, this.RS * Z, 0, 0);
    for (const l of lights) {
      if (!l.c) continue;
      const x = l.x * T - ox, y = l.y * T - oy, r = l.r * T * 0.55;
      if (x < -r || y < -r || x > this.vw + r || y > this.vh + r) continue;
      ctx.globalAlpha = Math.min(1, L.dark);
      ctx.drawImage(this.glowSprite(l.c), x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      if (l.beam) {
        const a = t * 0.8;
        ctx.fillStyle = 'rgba(255,245,190,0.12)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 900, a, a + 0.25); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 900, a + Math.PI, a + Math.PI + 0.25); ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(this.RS, 0, 0, this.RS, 0, 0);
    // Sterne am Himmel (Bilderbuch-Stil)
    if (L.dark > 0.3) {
      const a = Math.min(1, (L.dark - 0.3) / 0.2);
      const sky = ctx.createLinearGradient(0, 0, 0, this.h * 0.22);
      sky.addColorStop(0, `rgba(30,24,90,${0.35 * a})`); sky.addColorStop(1, 'rgba(30,24,90,0)');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, this.w, this.h * 0.22);
      for (const s of this.stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.p);
        const y = s.y * this.h * 0.16;
        ctx.fillStyle = `rgba(255,255,230,${a * (0.3 + tw * 0.5) * (1 - y / (this.h * 0.2))})`;
        star(ctx, s.x * this.w, y, s.s * 2.2, 4, 0.4); ctx.fill();
      }
    }
  }

  drawWeatherScreen(ctx, game, t) {
    const W = game.S.weather;
    if (W.kind === 'rain') {
      ctx.fillStyle = 'rgba(80,90,130,0.12)';
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.strokeStyle = 'rgba(210,230,255,0.55)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath();
      for (const r of this.rain) {
        const y = ((r.y + t * 1.3 * r.s) % 1) * (this.h + 40) - 20;
        const x = ((r.x + t * 0.08) % 1) * this.w;
        ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14 * r.s);
      }
      ctx.stroke();
    }
    if (game.rainbowAlpha > 0.01) {
      const a = game.rainbowAlpha;
      const cx = this.w * 0.55, cy = this.h * 1.15, R = this.h * 1.07;
      const cols = ['#ff7a8a', '#ffb366', '#ffe066', '#8fe08a', '#7ec8ff', '#b79cf0'];
      ctx.lineWidth = R * 0.03;
      cols.forEach((c, i) => {
        ctx.strokeStyle = hexA(c, 0.3 * a);
        ctx.beginPath(); ctx.arc(cx, cy, R - i * ctx.lineWidth, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
      });
    }
  }
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}

export { FARM, outlinedText };
