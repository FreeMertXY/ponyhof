// Titelbildschirm, Charakter-Editor, Intro, Pferdewahl, Namenseingabe und Bilderbuch-Abspann.
import { drawHorse, horseLook } from './draw/horse.js';
import { drawCharacter, playerLook, npcLook } from './draw/characters.js';
import { drawAnimal } from './draw/animals.js';
import { ell, circ, rr, flower, heart, sparkle, star, FONT } from './draw/paint.js';
import { SKINS, HAIR_COLORS, HAIR_STYLES, NPCS } from './data/npcs.js';
import { OUTFITS } from './data/shop.js';
import { COATS, STARTER_COATS } from './data/horses.js';
import { SPECIES_ORDER } from './data/animals.js';
import { hash2, formatDuration, genitive } from './util.js';
import { MEDAL_NAMES, MEDAL_COLORS } from './race.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Hintergrund-Szene: Wiese mit Pferden ----------
export function drawMeadowScene(ctx, w, h, t, opts = {}) {
  const sunset = !!opts.sunset;
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  if (sunset) { sky.addColorStop(0, '#6f6bc9'); sky.addColorStop(0.5, '#ff9fb2'); sky.addColorStop(1, '#ffd6a0'); }
  else { sky.addColorStop(0, '#9fdcff'); sky.addColorStop(0.7, '#dff3ff'); sky.addColorStop(1, '#ffeaf3'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // Sonne
  const sx = w * 0.8, sy = sunset ? h * 0.52 : h * 0.18;
  const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 170);
  sg.addColorStop(0, sunset ? 'rgba(255,220,150,0.95)' : 'rgba(255,245,190,0.95)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = sg; circ(ctx, sx, sy, 170); ctx.fill();
  ctx.fillStyle = sunset ? '#ffc98a' : '#fff4b0'; circ(ctx, sx, sy, 46); ctx.fill();
  // Wolken
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 330 + t * (12 + i * 3)) % (w + 400)) - 200, cy = 60 + hash2(i, 1, 1) * h * 0.25;
    ctx.fillStyle = sunset ? 'rgba(255,220,235,0.8)' : 'rgba(255,255,255,0.9)';
    for (const [dx, dy, r] of [[0, 0, 34], [36, -12, 42], [76, 2, 32], [40, 12, 30]]) { circ(ctx, cx + dx, cy + dy, r * (0.8 + hash2(i, 2, 1) * 0.5)); ctx.fill(); }
  }
  // Hügel
  const hill = (y0, amp, col, seed) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 20; x += 20) ctx.lineTo(x, y0 + Math.sin(x * 0.004 + seed) * amp + Math.sin(x * 0.011 + seed * 2) * amp * 0.4);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  };
  hill(h * 0.5, 30, sunset ? '#b7a6d9' : '#c3e7a5', 1);
  hill(h * 0.58, 26, sunset ? '#c7a0c8' : '#aedd8c', 3);
  hill(h * 0.68, 18, sunset ? '#9f8fc0' : '#9cd47a', 5);
  // Zaun
  const fy = h * 0.72;
  ctx.fillStyle = '#fff6ee';
  for (let x = -20; x < w + 40; x += 70) { rr(ctx, x, fy - 44, 9, 50, 3); ctx.fill(); }
  rr(ctx, -10, fy - 36, w + 20, 7, 3); ctx.fill();
  rr(ctx, -10, fy - 18, w + 20, 7, 3); ctx.fill();
  // Vordergrund
  ctx.fillStyle = sunset ? '#8f86b8' : '#92cd6e';
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  const cols = ['#fff', '#ffd6e7', '#ffe57a', '#c9b6ff', '#ff9aa8'];
  for (let i = 0; i < 90; i++) {
    const x = hash2(i, 3, 2) * w, y = h * 0.75 + hash2(i, 4, 2) * h * 0.25;
    flower(ctx, x, y + Math.sin(t * 2 + i) * 1.5, 3 + hash2(i, 5, 2) * 3, cols[i % cols.length], '#ffcf4a');
  }
  // Pferde
  const k = Math.min(w, h) / 380;
  const trotX = ((t * 80) % (w + 400)) - 200;
  const horses = [
    { x: w * 0.28, y: h * 0.84, pose: 'graze', face: 1, look: { coat: 'fuchs', marking: 'blaze', socks: true, acc: { saddle: 'saddle_rosa', bow: 'bow_rosa' } }, s: 1.3 },
    { x: trotX, y: h * 0.66, pose: 'trot', face: 1, look: { coat: 'schimmel', marking: 'none', acc: {} }, s: 0.8 },
    { x: trotX - 90 * k, y: h * 0.67, pose: 'trot', face: 1, look: { coat: 'palomino', marking: 'star', acc: {}, foal: true }, s: 0.8 },
    { x: w * 0.7, y: h * 0.9, pose: 'stand', face: -1, look: { coat: 'schecke', marking: 'snip', acc: { wreath: 'wreath' } }, s: 1.45 },
  ];
  for (const H of horses) {
    ctx.save(); ctx.translate(H.x, H.y); ctx.scale(k * H.s * 1.6, k * H.s * 1.6);
    drawHorse(ctx, horseLook(H.look), { t: t + H.x * 0.01, pose: H.pose, face: H.face });
    ctx.restore();
  }
  // Schmetterlinge
  for (let i = 0; i < 4; i++) {
    const bx = w * (0.2 + i * 0.2) + Math.sin(t * 0.7 + i) * 60, by = h * 0.62 + Math.cos(t * 0.9 + i * 2) * 40;
    ctx.save(); ctx.translate(bx, by); ctx.scale(k * 1.6, k * 1.6);
    drawAnimal(ctx, 'butterfly', { t: t + i, variant: i });
    ctx.restore();
  }
}

export class Screens {
  constructor(game) {
    this.game = game;
    this.el = $('screen');
    this.t = 0;
    this.mode = null;
  }

  show(html) {
    this.el.innerHTML = html;
    this.el.classList.remove('hidden');
  }
  hide() { this.el.classList.add('hidden'); this.el.innerHTML = ''; }

  update(dt) {
    this.t += dt;
    const g = this.game, r = g.renderer, ctx = r.ctx;
    ctx.setTransform(r.RS, 0, 0, r.RS, 0, 0);
    drawMeadowScene(ctx, r.w, r.h, this.t);
    if (this.mode === 'editor' && this.previewCtx) this.drawEditorPreview();
    if (this.mode === 'horse' && this.horseCtx) this.drawHorsePreview();
    if (this.mode === 'story' && this.storyDraw) this.storyDraw(this.t);
  }

  // ---------- Titel ----------
  title() {
    const g = this.game;
    g.state = 'title';
    this.mode = 'title';
    g.ui.showHUD(false);
    g.applyAudioMode();
    const has = g.saves.has();
    this.show(`
      <div class="title-box">
        <div class="logo"><small>${esc(genitive(this.lastName()))}</small>Ponyhof</div>
        <div class="title-btns">
          <button class="btn primary" id="t-new">Neues Spiel</button>
          <button class="btn" id="t-cont" ${has ? '' : 'disabled'}>Fortsetzen</button>
          <button class="btn" id="t-set">Einstellungen</button>
        </div>
      </div>
      <div class="title-foot">Ein gemütliches Pferde-Abenteuer · Musik startet nach dem ersten Klick ♥</div>`);
    $('t-new').onclick = () => {
      g.audio.init(); g.audio.play('click');
      if (has) {
        this.confirm('Ein neues Spiel überschreibt deinen bisherigen Spielstand. Wirklich neu anfangen?', 'Ja, neu anfangen', () => this.editor(), () => this.title());
      } else this.editor();
    };
    $('t-cont').onclick = () => { g.audio.init(); g.audio.play('click'); this.hide(); if (!g.loadGame()) this.title(); };
    $('t-set').onclick = () => { g.audio.init(); this.settings(); };
  }

  lastName() {
    try { const raw = localStorage.getItem('ponyhof.save'); if (raw) return JSON.parse(raw).data.player.name || 'Jolina'; } catch { /* egal */ }
    return 'Jolina';
  }

  confirm(text, yes, onYes, onNo) {
    this.show(`<div class="story" style="max-width:520px"><p>${esc(text)}</p><div class="row" style="justify-content:center;gap:12px"><button class="btn primary" id="c-yes">${esc(yes)}</button><button class="btn" id="c-no">Abbrechen</button></div></div>`);
    $('c-yes').onclick = onYes;
    $('c-no').onclick = onNo;
  }

  message(text) {
    this.show(`<div class="story" style="max-width:560px"><p>${esc(text)}</p><button class="btn primary" id="m-ok">Okay</button></div>`);
    $('m-ok').onclick = () => this.title();
  }

  settings() {
    const g = this.game, st = g.settings;
    this.show(`<div class="story" style="max-width:560px;text-align:left">
      <h2 style="color:var(--rose);margin:4px 0 10px">Einstellungen</h2>
      <div class="slider-row"><span style="width:150px">Musik</span><input type="range" id="s-m" min="0" max="100" value="${Math.round(st.music * 100)}"></div>
      <div class="slider-row"><span style="width:150px">Geräusche</span><input type="range" id="s-s" min="0" max="100" value="${Math.round(st.sfx * 100)}"></div>
      <div class="row" style="margin:12px 0"><button class="btn" id="s-f">Vollbild an/aus</button></div>
      <div class="keys" style="font-size:15px">
        <kbd>WASD</kbd><span>laufen · <kbd>Shift</kbd> rennen/galoppieren</span>
        <kbd>E</kbd><span>benutzen · <kbd>R</kbd> reiten · <kbd>Leertaste</kbd> springen</span>
        <kbd>I Q M T P</kbd><span>Tasche, Aufgaben, Karte, Album, Pferde</span>
        <kbd>Esc</kbd><span>Menü</span>
      </div>
      <div class="row" style="margin-top:14px;justify-content:center"><button class="btn primary" id="s-ok">Zurück</button></div></div>`);
    $('s-m').oninput = (e) => { st.music = e.target.value / 100; g.applySettings(); };
    $('s-s').oninput = (e) => { st.sfx = e.target.value / 100; g.applySettings(); };
    $('s-s').onchange = () => g.audio.play('pling');
    $('s-f').onclick = () => g.toggleFullscreen();
    $('s-ok').onclick = () => this.title();
  }

  // ---------- Charakter-Editor ----------
  editor() {
    const g = this.game;
    g.state = 'editor';
    this.mode = 'editor';
    this.look = this.look || { name: 'Jolina', skin: 1, hair: 1, hairColor: 0, outfit: 1, hat: true, hatType: 'straw' };
    const L = this.look;
    const sw = (arr, key, colorFn, titleFn) => arr.map((v, i) => `<div class="sw ${L[key] === i ? 'on' : ''}" data-k="${key}" data-v="${i}" style="background:${colorFn(v, i)}" title="${esc(titleFn(v, i))}"></div>`).join('');
    const chips = (arr, key) => arr.map((v, i) => `<button class="chip ${L[key] === i ? 'on' : ''}" data-k="${key}" data-v="${i}">${esc(v)}</button>`).join('');
    this.show(`
      <div class="editor">
        <div class="preview"><canvas id="e-prev" width="560" height="680"></canvas><div class="sub" style="font-size:14px">Deine Figur – so sieht dich das ganze Dorf!</div></div>
        <div class="opts">
          <h2>Wer bist du?</h2>
          <div class="opt"><label>Name</label><input class="name" id="e-name" maxlength="14" value="${esc(L.name)}"></div>
          <div class="opt"><label>Hautton</label><div class="swatches">${sw(SKINS, 'skin', (c) => c, (c, i) => 'Hautton ' + (i + 1))}</div></div>
          <div class="opt"><label>Frisur</label><div class="swatches">${chips(HAIR_STYLES, 'hair')}</div></div>
          <div class="opt"><label>Haarfarbe</label><div class="swatches">${sw(HAIR_COLORS, 'hairColor', (c) => c.c, (c) => c.name)}</div></div>
          <div class="opt"><label>Outfit</label><div class="swatches">${chips(OUTFITS.slice(0, 6).map((o) => o.name), 'outfit')}</div></div>
          <div class="opt"><label>Strohhut</label><div class="swatches"><button class="chip ${L.hat ? 'on' : ''}" data-k="hat" data-v="1">mit Hut</button><button class="chip ${!L.hat ? 'on' : ''}" data-k="hat" data-v="0">ohne Hut</button></div></div>
          <div class="row" style="margin-top:14px"><button class="btn" id="e-back">← Zurück</button><span class="spacer"></span><button class="btn primary" id="e-go">Los geht’s! ♥</button></div>
        </div>
      </div>`);
    this.previewCtx = $('e-prev').getContext('2d');
    this.el.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k, v = +b.dataset.v;
      L[k] = k === 'hat' ? !!v : v;
      g.audio.play('pop');
      this.editor();
    }));
    const nm = $('e-name');
    nm.addEventListener('input', () => { L.name = nm.value; });
    nm.addEventListener('keydown', (e) => e.stopPropagation());
    $('e-back').onclick = () => this.title();
    $('e-go').onclick = () => {
      L.name = (nm.value || '').trim().replace(/[<>]/g, '').slice(0, 14) || 'Jolina';
      g.audio.play('click');
      this.intro();
    };
  }

  drawEditorPreview() {
    const c = this.previewCtx, L = this.look;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 560, 680);
    c.fillStyle = 'rgba(160,210,120,0.5)'; ell(c, 280, 590, 150, 36); c.fill();
    for (let i = 0; i < 12; i++) flower(c, 90 + hash2(i, 1, 4) * 380, 560 + hash2(i, 2, 4) * 70, 7, ['#fff', '#ffd6e7', '#ffe57a'][i % 3], '#ffcf4a');
    c.translate(280, 590);
    c.scale(7.5, 7.5);
    const dirs = ['down', 'down', 'right', 'down', 'left', 'down'];
    const dir = dirs[Math.floor(this.t / 2.2) % dirs.length];
    drawCharacter(c, playerLook(L), { dir, t: this.t, moving: false, blink: Math.sin(this.t * 1.3) > 0.97 });
  }

  // ---------- Intro ----------
  async intro() {
    const g = this.game;
    g.state = 'intro';
    const name = this.look.name;
    const cards = [
      { title: 'Ein Brief', text: `„Liebe ${name}, ich werde langsam alt, und mein Ponyhof braucht junge Hände und ein großes Herz. Ich möchte, dass du ihn übernimmst. Komm bald! Deine Oma Hilde ♥“`, draw: (c, w, h, t) => this.cardLetter(c, w, h, t) },
      { title: 'Der alte Hof', text: 'Als du ankommst, ist der Hof ganz schön verwildert: Der Stall ist morsch, die Koppel winzig, überall wächst Unkraut. Aber irgendwie fühlt er sich sofort nach Zuhause an.', draw: (c, w, h, t) => this.cardFarm(c, w, h, t) },
      { title: 'Oma Hilde', text: '„Früher war hier das schönste Sommerfest der ganzen Gegend“, erzählt Oma Hilde. „Vielleicht schaffst du es, dem Hof sein Herz zurückzugeben?“', draw: (c, w, h, t) => this.cardHilde(c, w, h, t) },
      { title: 'Ein Geschenk', text: '„Und damit du nicht allein anfangen musst, habe ich ein Geschenk für dich.“ Oma Hilde führt dich zur Koppel – und dort wartet ein Pferd. Dein Pferd!', draw: (c, w, h, t) => this.cardGift(c, w, h, t) },
    ];
    for (let i = 0; i < cards.length; i++) {
      const skip = await this.storyCard(cards[i], i, cards.length);
      if (skip) break;
    }
    this.chooseHorse();
  }

  storyCard(card, i, n, btnText = 'Weiter ➜', showSkip = true) {
    return new Promise((resolve) => {
      this.mode = 'story';
      this.show(`<div class="story"><div class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <canvas id="st-c" width="1280" height="720"></canvas><p>${esc(card.text)}</p>
        <div class="row" style="justify-content:center;gap:12px">${showSkip && i < n - 1 ? '<button class="btn small" id="st-skip">Überspringen</button>' : ''}<button class="btn primary" id="st-next">${btnText}</button></div></div>`);
      const cv = $('st-c'), c = cv.getContext('2d');
      this.storyDraw = (t) => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 1280, 720); card.draw(c, 1280, 720, t); };
      const done = (skip) => { this.storyDraw = null; document.removeEventListener('keydown', key); resolve(skip); };
      const key = (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'e') { e.preventDefault(); this.game.audio.play('click'); done(false); } };
      document.addEventListener('keydown', key);
      $('st-next').onclick = () => { this.game.audio.play('click'); done(false); };
      if ($('st-skip')) $('st-skip').onclick = () => done(true);
    });
  }

  cardLetter(c, w, h, t) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe9f1'); g.addColorStop(1, '#fff6e0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8c49a'; rr(c, 0, h * 0.7, w, h * 0.3, 0); c.fill();
    for (let i = 0; i < 16; i++) flower(c, hash2(i, 1, 9) * w, hash2(i, 2, 9) * h * 0.6, 10 + hash2(i, 3, 9) * 10, ['#ffd6e7', '#fff', '#e6d6ff'][i % 3], '#ffe07a');
    c.save(); c.translate(w / 2, h * 0.52 + Math.sin(t * 1.5) * 8); c.rotate(-0.06);
    rr(c, -300, -170, 600, 340, 16); c.fillStyle = '#fffaf2'; c.fill(); c.strokeStyle = '#e0c0a8'; c.lineWidth = 6; c.stroke();
    c.beginPath(); c.moveTo(-300, -170); c.lineTo(0, 30); c.lineTo(300, -170); c.strokeStyle = '#ecd2bc'; c.stroke();
    heart(c, 0, 50, 90, '#ef4f6f');
    c.font = `600 34px ${FONT}`; c.fillStyle = '#b06a80'; c.textAlign = 'center'; c.fillText(`An ${this.look.name}`, 0, 130);
    c.restore();
    sparkle(c, w * 0.72, h * 0.25, 18 + Math.sin(t * 4) * 5, '#fff');
  }

  cardFarm(c, w, h, t) {
    drawMeadowScene(c, w, h, t);
    c.save(); c.translate(w * 0.3, h * 0.78); c.scale(2.6, 2.6);
    // altes Haus
    c.fillStyle = 'rgba(60,40,70,0.15)'; ell(c, 60, 4, 90, 12); c.fill();
    rr(c, 0, -70, 130, 70, 5); c.fillStyle = '#b39a84'; c.fill(); c.strokeStyle = '#7a6a5a'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(-10, -66); c.lineTo(65, -120); c.lineTo(140, -66); c.closePath(); c.fillStyle = '#9c9690'; c.fill(); c.stroke();
    c.fillStyle = '#5a4a44'; ell(c, 45, -92, 12, 7); c.fill();
    rr(c, 50, -46, 30, 46, 3); c.fillStyle = '#8a7563'; c.fill();
    for (let i = 0; i < 9; i++) { c.fillStyle = '#6aa85a'; for (let j = -3; j <= 3; j++) { c.beginPath(); c.moveTo(-20 + i * 20 + j * 2, 0); c.quadraticCurveTo(-20 + i * 20 + j * 3, -8, -20 + i * 20 + j * 4, -14 - Math.abs(j) * -1); c.lineTo(-18 + i * 20 + j * 2, 0); c.fill(); } }
    c.restore();
  }

  cardHilde(c, w, h, t) {
    drawMeadowScene(c, w, h, t);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 0, w, h);
    c.save(); c.translate(w * 0.38, h * 0.95); c.scale(6.5, 6.5);
    drawCharacter(c, npcLook(NPCS.hilde.look), { dir: 'right', t, blink: Math.sin(t * 1.3) > 0.97 });
    c.restore();
    c.save(); c.translate(w * 0.62, h * 0.95); c.scale(6.5, 6.5);
    drawCharacter(c, playerLook(this.look), { dir: 'left', t: t + 1 });
    c.restore();
    heart(c, w / 2, h * 0.3 + Math.sin(t * 3) * 10, 60, '#ff7eb6');
  }

  cardGift(c, w, h, t) {
    drawMeadowScene(c, w, h, t);
    c.save(); c.translate(w * 0.45, h * 0.92); c.scale(5, 5);
    drawHorse(c, horseLook({ coat: 'fuchs', marking: 'blaze', acc: { bow: 'bow_rosa' } }), { t, pose: 'stand', face: 1 });
    c.restore();
    // große Schleife
    c.save(); c.translate(w * 0.5, h * 0.47);
    c.fillStyle = '#ff7eb6';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -34); c.lineTo(-60, 34); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(60, -34); c.lineTo(60, 34); c.closePath(); c.fill();
    circ(c, 0, 0, 16); c.fill();
    c.restore();
    for (let i = 0; i < 6; i++) sparkle(c, w * (0.3 + i * 0.08), h * (0.2 + Math.sin(t * 2 + i) * 0.05), 10, '#fff9d0');
  }

  // ---------- Pferdewahl ----------
  chooseHorse() {
    const g = this.game;
    this.mode = 'horse';
    this.horse = this.horse || { coat: 'fuchs', marking: 'blaze', socks: false, name: 'Sternchen' };
    const H = this.horse;
    const markings = [['none', 'keins'], ['star', 'Stern'], ['blaze', 'Blesse'], ['snip', 'Schnippe']];
    this.show(`
      <div class="editor">
        <div class="preview"><canvas id="h-prev" width="600" height="520" style="height:280px"></canvas><div class="sub" style="font-size:14px">Dein erstes Pferd – für immer dein bester Freund.</div></div>
        <div class="opts">
          <h2>Dein Pferd</h2>
          <div class="opt"><label>Name</label><input class="name" id="h-name" maxlength="14" value="${esc(H.name)}"></div>
          <div class="opt"><label>Fellfarbe</label><div class="swatches">${STARTER_COATS.map((k) => `<div class="sw ${H.coat === k ? 'on' : ''}" data-coat="${k}" title="${COATS[k].name}" style="background:${k === 'schecke' ? 'linear-gradient(135deg,#fbf7f2 50%,#8a5a42 50%)' : COATS[k].body}"></div>`).join('')}</div><div class="sub" style="margin-top:4px">${COATS[H.coat].name}</div></div>
          <div class="opt"><label>Abzeichen</label><div class="swatches">${markings.map(([k, n]) => `<button class="chip ${H.marking === k ? 'on' : ''}" data-mark="${k}">${n}</button>`).join('')}</div></div>
          <div class="opt"><label>Weiße Stiefel</label><div class="swatches"><button class="chip ${H.socks ? 'on' : ''}" data-socks="1">ja</button><button class="chip ${!H.socks ? 'on' : ''}" data-socks="0">nein</button></div></div>
          <div class="row" style="margin-top:16px"><span class="spacer"></span><button class="btn primary" id="h-go">Auf zum Ponyhof! ♥</button></div>
        </div>
      </div>`);
    this.horseCtx = $('h-prev').getContext('2d');
    this.el.querySelectorAll('[data-coat]').forEach((b) => b.onclick = () => { H.coat = b.dataset.coat; g.audio.play('neigh'); this.chooseHorse(); });
    this.el.querySelectorAll('[data-mark]').forEach((b) => b.onclick = () => { H.marking = b.dataset.mark; g.audio.play('pop'); this.chooseHorse(); });
    this.el.querySelectorAll('[data-socks]').forEach((b) => b.onclick = () => { H.socks = b.dataset.socks === '1'; g.audio.play('pop'); this.chooseHorse(); });
    const nm = $('h-name');
    nm.addEventListener('input', () => { H.name = nm.value; });
    nm.addEventListener('keydown', (e) => e.stopPropagation());
    $('h-go').onclick = () => {
      H.name = (nm.value || '').trim().replace(/[<>]/g, '').slice(0, 14) || 'Sternchen';
      g.audio.play('neigh');
      this.hide();
      this.mode = null;
      this.previewCtx = null; this.horseCtx = null;
      g.newGame({ ...this.look }, { ...H });
    };
  }

  drawHorsePreview() {
    const c = this.horseCtx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 600, 520);
    c.fillStyle = 'rgba(160,210,120,0.5)'; ell(c, 300, 430, 200, 40); c.fill();
    c.translate(290, 430); c.scale(6, 6);
    const poses = ['stand', 'stand', 'graze', 'stand'];
    drawHorse(c, horseLook({ ...this.horse, acc: {} }), { t: this.t, pose: poses[Math.floor(this.t / 2.5) % poses.length], face: 1 });
  }

  // ---------- Namenseingabe (im Spiel) ----------
  askName(title, def, rec = null) {
    const g = this.game;
    return new Promise((resolve) => {
      const prev = g.cutscene;
      g.cutscene = true;
      this.show(`<div class="story" style="max-width:560px">
        ${rec ? '<canvas id="n-c" width="600" height="360" style="aspect-ratio:5/3"></canvas>' : ''}
        <p>${esc(title)}</p>
        <input class="name" id="n-in" maxlength="14" value="${esc(def)}" style="text-align:center;max-width:320px">
        <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" id="n-ok">Passt! ♥</button></div></div>`);
      const inp = $('n-in');
      inp.focus(); inp.select();
      let raf;
      if (rec) {
        const c = $('n-c').getContext('2d'); let t = 0;
        const loop = () => {
          t += 1 / 60;
          c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 600, 360);
          const gr = c.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#e6f7ff'); gr.addColorStop(1, '#d9f5c8'); c.fillStyle = gr; c.fillRect(0, 0, 600, 360);
          c.translate(290, 330); c.scale(4.6, 4.6);
          drawHorse(c, horseLook(rec), { t, pose: 'stand', face: 1 });
          raf = requestAnimationFrame(loop);
        };
        loop();
      }
      const ok = () => {
        cancelAnimationFrame(raf);
        const v = inp.value.trim().replace(/[<>]/g, '').slice(0, 14);
        this.hide();
        g.cutscene = prev;
        g.input.clear();
        g.audio.play('pling');
        resolve(v || def);
      };
      $('n-ok').onclick = ok;
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') ok(); });
    });
  }

  // ---------- Bilderbuch-Abspann ----------
  async credits() {
    const g = this.game, S = g.S;
    const P = playerLook(S.player);
    const first = S.horses.find((h) => h.id === 'h_start') || S.horses[0];
    const tamed = S.horses.filter((h) => !h.foal);
    const foal = S.horses.find((h) => h.foal);
    const raceMem = S.memories.find((m) => m.type === 'finale') || S.memories.find((m) => m.type === 'race');
    const medal = raceMem?.medal || 'gold';
    const frame = (c, w, h, bg1, bg2) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bg1); gr.addColorStop(1, bg2); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      // Bilderbuch-Rahmen
      c.strokeStyle = '#fff'; c.lineWidth = 24; c.strokeRect(12, 12, w - 24, h - 24);
      c.strokeStyle = '#ffd6e7'; c.lineWidth = 6; c.strokeRect(30, 30, w - 60, h - 60);
      for (const [x, y] of [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]]) flower(c, x, y, 14, '#ff9ecb', '#ffe07a');
    };
    const ground = (c, w, h, col = '#9cd47a') => { c.fillStyle = col; c.beginPath(); c.moveTo(0, h * 0.72); c.quadraticCurveTo(w / 2, h * 0.62, w, h * 0.72); c.lineTo(w, h); c.lineTo(0, h); c.fill(); };
    const pages = [
      {
        text: `Es war einmal ein alter Ponyhof – und ein Mädchen namens ${S.player.name}, das ihm sein Herz zurückgab.`,
        draw: (c, w, h, t) => { frame(c, w, h, '#bfe6ff', '#ffeaf3'); ground(c, w, h); c.save(); c.translate(w * 0.58, h * 0.86); c.scale(5, 5); drawHorse(c, horseLook(first), { t, pose: 'stand', face: -1, rider: null }); c.restore(); c.save(); c.translate(w * 0.34, h * 0.86); c.scale(5, 5); drawCharacter(c, P, { dir: 'right', t }); c.restore(); heart(c, w * 0.44, h * 0.3 + Math.sin(t * 3) * 8, 50); this.caption(c, w, 'Das erste Pferd: ' + first.name); },
      },
      {
        text: `Aus einem Pferd wurden ${tamed.length}. Jedes mit eigenem Kopf – und alle mit einem großen Herzen.`,
        draw: (c, w, h, t) => { frame(c, w, h, '#fff3d6', '#ffe0ec'); ground(c, w, h, '#a8dd84'); tamed.slice(0, 8).forEach((r, i) => { const n = Math.min(8, tamed.length); c.save(); c.translate(w * (0.15 + (i / Math.max(1, n - 1)) * 0.7), h * (0.82 + (i % 2) * 0.06)); c.scale(2.6, 2.6); drawHorse(c, horseLook(r), { t: t + i, pose: i % 3 === 0 ? 'graze' : 'stand', face: i % 2 ? -1 : 1 }); c.restore(); }); this.caption(c, w, 'Neue Freunde auf der Koppel'); },
      },
      {
        text: `Beim großen Rennen flog ${S.player.name} über die Wiesen – ${MEDAL_NAMES[medal]} für das schnellste Team der Gegend!`,
        draw: (c, w, h, t) => { frame(c, w, h, '#d9f2ff', '#f0fff0'); ground(c, w, h); const r = S.horses.find((x) => x.id === S.ridingHorse) || first; c.save(); c.translate(w * 0.45 + Math.sin(t) * 20, h * 0.86); c.scale(4.6, 4.6); drawHorse(c, horseLook(r), { t, pose: 'gallop', face: 1, rider: (cc) => { cc.save(); cc.translate(-1, -24); drawCharacter(cc, P, { dir: 'right', t, seated: true, noShadow: true }); cc.restore(); } }); c.restore(); this.medal(c, w * 0.78, h * 0.32, medal, t); this.caption(c, w, 'Das große Rennen'); },
      },
      {
        text: `Hasen, Robben, Eulen und Alpakas: ${Object.keys(S.album).length} von 14 Tierarten stehen im Tieralbum.`,
        draw: (c, w, h, t) => { frame(c, w, h, '#fffaf0', '#f2e9ff'); SPECIES_ORDER.forEach((id, i) => { const col = i % 7, row = Math.floor(i / 7); c.save(); c.translate(w * (0.14 + col * 0.12), h * (0.42 + row * 0.3)); c.scale(2.8, 2.8); if (!S.album[id]) c.globalAlpha = 0.18; drawAnimal(c, id, { t: t + i, face: 1 }); c.restore(); c.globalAlpha = 1; }); this.caption(c, w, 'Das Tieralbum'); },
      },
      {
        text: `Und dann, beim Sommerfest, kam ein kleines Fohlen zur Welt: ${foal ? foal.name : 'das Fohlen'}. Der Hof hatte wieder ein Herz.`,
        draw: (c, w, h, t) => { frame(c, w, h, '#6f6bc9', '#ffb3a8'); ground(c, w, h, '#8f86b8'); for (let i = 0; i < 5; i++) { const k = ((t * 0.4 + i * 0.2) % 1); c.globalAlpha = 1 - k; heart(c, w * (0.2 + i * 0.15), h * (0.35 - k * 0.15), 30 + k * 40, ['#ff7eb6', '#ffd166', '#b79cf0', '#7ec8ff', '#8fe0c0'][i]); c.globalAlpha = 1; } if (foal) { c.save(); c.translate(w * 0.55, h * 0.86); c.scale(5, 5); drawHorse(c, horseLook(foal), { t, pose: 'stand', face: -1 }); c.restore(); } c.save(); c.translate(w * 0.38, h * 0.86); c.scale(4.6, 4.6); drawCharacter(c, P, { dir: 'right', t }); c.restore(); this.caption(c, w, 'Das Sommerfest'); },
      },
    ];
    for (let i = 0; i < pages.length; i++) await this.storyCard(pages[i], i, pages.length + 1, 'Umblättern ➜', false);
    // Statistik
    await new Promise((resolve) => {
      this.mode = 'story';
      this.storyDraw = null;
      const medals = Object.values(S.stats.medals);
      this.show(`<div class="story" style="max-width:640px">
        <h2 style="color:var(--rose);margin:6px 0">${esc(genitive(S.player.name))} Ponyhof</h2>
        <div class="stats">
          <div><b>${formatDuration(S.stats.playSeconds)}</b>Spielzeit</div>
          <div><b>${tamed.length}${foal ? ' + 1' : ''}</b>Pferde${foal ? ' (und ein Fohlen)' : ''}</div>
          <div><b>${Object.keys(S.album).length}/14</b>Tierarten im Album</div>
          <div><b>${S.collected.hs.length}/30</b>goldene Hufeisen</div>
          <div><b>${medals.filter((m) => m === 'gold').length}</b>Goldmedaillen</div>
          <div><b>${S.time.day}</b>Tage auf dem Hof</div>
        </div>
        <p style="font-size:26px;margin:18px 0 8px">Ende …</p>
        <p style="font-size:22px;margin:0 0 16px;color:var(--rose)">… oder doch nicht?</p>
        <button class="btn primary" id="cr-go" style="font-size:20px">Weiterspielen ♥</button></div>`);
      $('cr-go').onclick = () => { this.hide(); this.mode = null; resolve(); };
    });
  }

  caption(c, w, text) {
    c.font = `700 40px ${FONT}`; c.textAlign = 'center';
    c.lineWidth = 10; c.strokeStyle = '#fff'; c.strokeText(text, w / 2, 100);
    c.fillStyle = '#e8587a'; c.fillText(text, w / 2, 100);
  }

  medal(c, x, y, m, t) {
    c.save(); c.translate(x, y + Math.sin(t * 2) * 6); c.rotate(Math.sin(t * 1.5) * 0.1);
    c.fillStyle = '#7ec8ff'; c.beginPath(); c.moveTo(-30, -110); c.lineTo(-8, 0); c.lineTo(8, 0); c.lineTo(30, -110); c.lineTo(10, -110); c.lineTo(0, -40); c.lineTo(-10, -110); c.closePath(); c.fill();
    circ(c, 0, 20, 52); c.fillStyle = MEDAL_COLORS[m]; c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
    c.fillStyle = '#fff8'; star(c, 0, 20, 28); c.fill();
    c.restore();
  }
}
