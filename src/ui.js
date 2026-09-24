// Oberfläche: HUD, Hinweise, Menüs (Inventar, Aufgaben, Karte, Album, Pause, Einstellungen).
import { ITEMS, CATEGORY_NAMES, itemName } from './data/items.js';
import { ACCESSORIES, OUTFITS, HATS, DECO, CLOTHES } from './data/shop.js';
import { SPECIES, SPECIES_ORDER } from './data/animals.js';
import { QUESTS, CHAPTERS } from './data/quests.js';
import { NPCS } from './data/npcs.js';
import { REGIONS, REG, WW, WH } from './world.js';
import { iconCanvas, fillIcons } from './draw/icons.js';
import { drawAnimalPortrait } from './draw/animals.js';
import { heart, star as starPath } from './draw/paint.js';
import { formatTime } from './util.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const REGION_CENTERS = {
  farm: [85, 96], village: [133, 95], meadow: [104, 56], forest: [28, 80], lake: [40, 146], beach: [128, 160], mountain: [110, 17],
};

export class UI {
  constructor(game) {
    this.game = game;
    this.panel = null;
    this.hintTimer = null;
    this.bannerTimer = null;
    this.hudT = 0;
    this.mini = $('minimap').getContext('2d');
    fillIcons();
    document.querySelectorAll('.hbtn').forEach((b) => b.addEventListener('click', () => { game.audio.init(); game.hudAction(b.dataset.act); }));
    $('minimap-wrap').addEventListener('click', () => this.open('map'));
    $('quest-tracker').addEventListener('click', () => this.open('quests'));
    $('panel-wrap').addEventListener('mousedown', (e) => { if (e.target.id === 'panel-wrap') this.close(); });
    $('act-btn').addEventListener('click', () => game.interact());
  }

  // ---------- kleine Einblendungen ----------
  toast(html, icon = null, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    if (icon) el.appendChild(typeof icon === 'string' ? iconCanvas(icon, 26) : icon);
    const s = document.createElement('span'); s.innerHTML = html; el.appendChild(s);
    $('toasts').appendChild(el);
    while ($('toasts').children.length > 5) $('toasts').firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3200);
  }

  banner(title, sub = '') {
    const b = $('banner');
    b.innerHTML = `<div class="b-title">${esc(title)}</div>${sub ? `<div class="b-sub">${esc(sub)}</div>` : ''}`;
    b.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => b.classList.remove('show'), 2800);
  }

  hint(html, sec = 6) {
    const h = $('hint');
    h.innerHTML = html;
    h.classList.add('show');
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => h.classList.remove('show'), sec * 1000);
  }
  hideHint() { $('hint').classList.remove('show'); }

  showHUD(on) { $('hud').classList.toggle('hidden', !on); }

  setActButton(text) {
    const b = $('act-btn');
    if (!text) { b.classList.add('hidden'); return; }
    b.textContent = text;
    b.classList.remove('hidden');
  }

  pulseTracker() {
    const q = $('quest-tracker');
    q.classList.remove('pulse'); void q.offsetWidth; q.classList.add('pulse');
  }

  // ---------- HUD ----------
  updateHUD(dt) {
    const g = this.game, S = g.S;
    document.getElementById('hud').classList.toggle('cinematic', !!(g.cutscene && !g.race));
    this.hudT += dt;
    if (this.hudT < 0.1) return;
    this.hudT = 0;
    const m = Math.floor(S.time.minutes);
    $('clock-text').textContent = `Tag ${S.time.day} · ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const icoKind = S.weather.kind === 'rain' ? 'rain' : g.rainbowAlpha > 0.1 ? 'rainbow' : g.lightingNight ? 'moon' : 'sun';
    const ci = $('clock-ico');
    if (ci.dataset.icon !== icoKind) { ci.dataset.icon = icoKind; ci.innerHTML = ''; ci.appendChild(iconCanvas(icoKind, 40)); }
    $('coins-text').textContent = S.player.coins;
    $('shoes-text').textContent = `${S.collected.hs.length}/30`;
    // Aufgabe
    const q = g.trackedQuest();
    if (q) {
      $('quest-tracker').classList.remove('hidden');
      $('qt-chapter').textContent = q.main ? `Kapitel ${q.chapter} · ${CHAPTERS[q.chapter - 1].title}` : 'Nebenaufgabe';
      $('qt-title').textContent = g.fmt(q.title);
      $('qt-step').textContent = g.quests.stepText(q);
    } else if (S.ending.done) {
      $('quest-tracker').classList.remove('hidden');
      $('qt-chapter').textContent = 'Freies Spiel';
      $('qt-title').textContent = 'Der Hof hat wieder ein Herz ♥';
      $('qt-step').textContent = `Hufeisen ${S.collected.hs.length}/30 · Tieralbum ${Object.keys(S.album).length}/14`;
    } else $('quest-tracker').classList.add('hidden');
    // Reiten-Knopf
    const rb = document.querySelector('.hbtn[data-act=ride] .bl');
    if (rb) rb.textContent = g.player.riding ? 'Absteigen' : 'Reiten';
    this.drawMinimap();
    // Rennen
    const rh = $('race-hud');
    const rt = g.race?.hudText?.();
    if (rt) { rh.classList.remove('hidden'); rh.innerHTML = rt; } else rh.classList.add('hidden');
  }

  drawMinimap() {
    const g = this.game, c = this.mini, P = g.player;
    const map = g.mapCanvas;
    if (!map) return;
    const scale = map.width / WW;
    const span = 44; // Kacheln sichtbar
    const sx = (P.x - span / 2) * scale, sy = (P.y - span / 2) * scale;
    c.fillStyle = '#5cbde6'; c.fillRect(0, 0, 180, 180);
    c.imageSmoothingEnabled = false;
    c.drawImage(map, sx, sy, span * scale, span * scale, 0, 0, 180, 180);
    const k = 180 / span;
    const toMini = (x, y) => [(x - P.x) * k + 90, (y - P.y) * k + 90];
    // Pferde
    for (const h of g.horses) {
      if (h.mode === 'ridden') continue;
      const [mx, my] = toMini(h.x, h.y);
      if (mx < 0 || my < 0 || mx > 180 || my > 180) continue;
      c.fillStyle = h.mode === 'wild' ? '#ffffff' : '#c98a5a';
      c.beginPath(); c.arc(mx, my, 3.5, 0, 7); c.fill();
      c.strokeStyle = '#6b4a5e'; c.lineWidth = 1; c.stroke();
    }
    // Personen
    for (const n of g.npcs) {
      const [mx, my] = toMini(n.x, n.y);
      if (mx < 0 || my < 0 || mx > 180 || my > 180) continue;
      const news = g.quests.npcHasNews(n.id);
      c.fillStyle = news === 'offer' ? '#ffd23f' : news ? '#ff7eb6' : '#b79cf0';
      c.beginPath(); c.arc(mx, my, news ? 5 : 3.5, 0, 7); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
    }
    // Ziel
    const tgt = g.currentTarget();
    if (tgt) {
      let [mx, my] = toMini(tgt.x, tgt.y);
      const out = mx < 8 || my < 8 || mx > 172 || my > 172;
      const a = Math.atan2(my - 90, mx - 90);
      if (out) { mx = 90 + Math.cos(a) * 76; my = 90 + Math.sin(a) * 76; }
      c.save(); c.translate(mx, my);
      c.fillStyle = '#ffd23f'; c.strokeStyle = '#c9781a'; c.lineWidth = 2;
      starPath(c, 0, 0, 8); c.fill(); c.stroke();
      c.restore();
    }
    // Spielerin
    c.save(); c.translate(90, 90);
    heart(c, 0, 4, 16, '#ff4f8f');
    c.restore();
    $('minimap-region').textContent = g.regionLabel();
  }

  // ---------- Panels ----------
  isOpen() { return !!this.panel; }

  open(name, arg) {
    const g = this.game;
    if (g.state !== 'play' && name !== 'settings') return;
    if (g.cutscene && name !== 'settings' && name !== 'pause') return;
    if (g.race?.active && name !== 'pause' && name !== 'settings') { this.hint('Erst das Rennen beenden!'); return; }
    this.panel = name;
    this.panelArg = arg;
    $('panel-wrap').classList.remove('hidden');
    g.audio.play('open');
    this.render();
  }

  close() {
    if (!this.panel) return;
    const was = this.panel;
    this.panel = null;
    $('panel-wrap').classList.add('hidden');
    $('panel').innerHTML = '';
    this.game.audio.play('close');
    this.onClose?.(was);
    this.onClose = null;
  }

  render() {
    const p = $('panel');
    p.innerHTML = '';
    const fn = this['panel_' + this.panel] || this.game.panels?.[this.panel];
    if (fn) fn.call(this, p, this.panelArg);
    const x = document.createElement('button');
    x.className = 'close-x'; x.textContent = '×'; x.title = 'Schließen (Esc)';
    x.onclick = () => this.close();
    p.appendChild(x);
  }

  h(p, html) { const d = document.createElement('div'); d.innerHTML = html; while (d.firstChild) p.appendChild(d.firstChild); return p.lastChild; }

  // Inventar
  panel_inventory(p) {
    const g = this.game, S = g.S;
    this.invTab = this.invTab || 'items';
    this.h(p, `<h2>Deine Tasche</h2>`);
    const tabs = this.h(p, '<div class="tabs"></div>');
    for (const [id, name] of [['items', 'Gegenstände'], ['clothes', 'Kleidung'], ['acc', 'Pferdezubehör'], ['deco', 'Hof-Deko']]) {
      const b = document.createElement('button'); b.className = 'tab' + (this.invTab === id ? ' on' : ''); b.textContent = name;
      b.onclick = () => { this.invTab = id; this.render(); };
      tabs.appendChild(b);
    }
    const grid = this.h(p, '<div class="grid"></div>');
    const desc = document.createElement('div'); desc.className = 'desc-box';
    const setDesc = (html) => { desc.innerHTML = html; };
    if (this.invTab === 'items') {
      const list = g.inv.list();
      if (!list.length) grid.outerHTML = '<div class="empty">Deine Tasche ist noch leer. Sammle Blumen, Pilze, Muscheln und Äpfel!</div>';
      const order = ['food', 'seed', 'flower', 'find', 'bake', 'quest'];
      list.sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
      for (const it of list) {
        const c = document.createElement('div'); c.className = 'card click';
        c.appendChild(iconCanvas(it.id, 64));
        c.insertAdjacentHTML('beforeend', `<div>${esc(itemName(it.id, it.n))}</div><div class="sub">${CATEGORY_NAMES[it.cat]}</div><span class="n">${it.n}</span>`);
        c.onclick = () => setDesc(`<b>${esc(it.name)}</b> – ${esc(it.desc)}${it.sell ? `<br><span class="sub">Verkaufswert bei Theo: ${it.sell} Münzen</span>` : ''}`);
        grid.appendChild(c);
      }
      setDesc('Tipp: Pferde lieben Äpfel und Karotten. Blumen, Pilze und Muscheln kannst du bei Theo verkaufen oder verschenken.');
    } else if (this.invTab === 'clothes') {
      OUTFITS.forEach((o, i) => {
        const owned = !o.unlock || g.inv.owns(o.unlock);
        const c = document.createElement('div'); c.className = 'card' + (owned ? ' click' : ' locked') + (S.player.outfit === i ? ' sel' : '');
        c.appendChild(this.outfitCanvas(i));
        c.insertAdjacentHTML('beforeend', `<div>${esc(o.name)}</div><div class="sub">${owned ? (S.player.outfit === i ? 'angezogen' : 'anziehen') : 'noch nicht freigeschaltet'}</div>`);
        if (owned) c.onclick = () => { S.player.outfit = i; g.audio.play('pop'); this.render(); g.requestSave(); };
        grid.appendChild(c);
      });
      const hatRow = this.h(p, '<h3>Hüte</h3>');
      void hatRow;
      const hg = this.h(p, '<div class="grid"></div>');
      const none = document.createElement('div'); none.className = 'card click' + (!S.player.hat ? ' sel' : '');
      none.insertAdjacentHTML('beforeend', '<div style="height:64px;display:flex;align-items:center;justify-content:center;font-size:34px;color:var(--ink-soft)">–</div><div>Ohne Hut</div>');
      none.onclick = () => { S.player.hat = false; this.render(); g.requestSave(); };
      hg.appendChild(none);
      for (const h of HATS) {
        const owned = !h.unlock || g.inv.owns(h.unlock);
        const c = document.createElement('div'); c.className = 'card' + (owned ? ' click' : ' locked') + (S.player.hat && S.player.hatType === h.id ? ' sel' : '');
        c.appendChild(iconCanvas('hat_' + h.id, 64, 'cloth'));
        c.insertAdjacentHTML('beforeend', `<div>${esc(h.name)}</div><div class="sub">${owned ? 'aufsetzen' : 'noch nicht freigeschaltet'}</div>`);
        if (owned) c.onclick = () => { S.player.hat = true; S.player.hatType = h.id; g.audio.play('pop'); this.render(); g.requestSave(); };
        hg.appendChild(c);
      }
    } else if (this.invTab === 'acc') {
      const owned = Object.keys(ACCESSORIES).filter((id) => g.inv.owns(id));
      if (!owned.length) grid.outerHTML = '<div class="empty">Noch kein Zubehör. In Theos Laden gibt es Sättel, Schleifen, Kränze und Decken!</div>';
      for (const id of owned) {
        const c = document.createElement('div'); c.className = 'card';
        c.appendChild(iconCanvas(id, 64, 'acc'));
        c.insertAdjacentHTML('beforeend', `<div>${esc(ACCESSORIES[id].name)}</div>`);
        grid.appendChild(c);
      }
      setDesc('Zubehör legst du deinen Pferden im Pferde-Menü an (Taste <kbd>P</kbd> oder an der Stalltür).');
    } else if (this.invTab === 'deco') {
      const ids = Object.keys(S.decoInv).filter((id) => S.decoInv[id] > 0);
      if (!ids.length) grid.outerHTML = '<div class="empty">Noch keine Deko. Theo verkauft Blumenkübel, Bänke, Laternen und mehr!</div>';
      for (const id of ids) {
        const c = document.createElement('div'); c.className = 'card click';
        c.appendChild(iconCanvas(id, 64, 'deco'));
        c.insertAdjacentHTML('beforeend', `<div>${esc(DECO[id].name)}</div><div class="sub">Klicken zum Platzieren</div><span class="n">${S.decoInv[id]}</span>`);
        c.onclick = () => { this.close(); g.startBuild(id); };
        grid.appendChild(c);
      }
      const b = this.h(p, '<div class="row" style="margin-top:10px"><button class="btn small">Deko auf dem Hof umstellen / einsammeln</button></div>');
      b.querySelector('button').onclick = () => { this.close(); g.startBuild(null); };
      setDesc('Deko kannst du nur auf deinem Hof aufstellen – auf Gras, nicht auf Wegen.');
    }
    p.appendChild(desc);
    if (!desc.innerHTML) desc.remove();
  }

  outfitCanvas(i) {
    const cv = document.createElement('canvas');
    const d = Math.min(2, devicePixelRatio || 1);
    cv.width = 64 * d; cv.height = 64 * d;
    const c = cv.getContext('2d'); c.scale(d, d);
    this.game.drawOutfitPreview(c, i, 64);
    return cv;
  }

  // Aufgabenbuch
  panel_quests(p) {
    const g = this.game, Q = g.quests;
    this.h(p, '<h2>Aufgaben</h2>');
    const ch = Q.chapter();
    const chap = this.h(p, '<div class="row" style="gap:6px;margin-bottom:12px"></div>');
    CHAPTERS.forEach((c) => {
      const done = ch > c.n, cur = ch === c.n;
      chap.insertAdjacentHTML('beforeend', `<div class="card" style="flex:1;min-width:150px;${cur ? 'border-color:var(--pink)' : ''}${done ? ';background:#f0fff6' : ''}"><div class="sub">Kapitel ${c.n}${done ? ' ✓' : ''}</div><div>${esc(c.title)}</div><div class="sub">${done ? '' : 'Belohnung: '}${esc(c.reward)}</div></div>`);
    });
    this.questTab = this.questTab || 'active';
    const tabs = this.h(p, '<div class="tabs"></div>');
    for (const [id, name] of [['active', 'Aktuell'], ['done', 'Erledigt']]) {
      const b = document.createElement('button'); b.className = 'tab' + (this.questTab === id ? ' on' : ''); b.textContent = name;
      b.onclick = () => { this.questTab = id; this.render(); };
      tabs.appendChild(b);
    }
    const list = this.h(p, '<div></div>');
    if (this.questTab === 'active') {
      const act = Q.active();
      if (!act.length && !Q.available().length) list.innerHTML = '<div class="empty">Gerade keine offenen Aufgaben. Genieß den Hof! ♥</div>';
      for (const q of act) {
        const d = document.createElement('div');
        d.className = 'quest' + (g.S.tracked === q.id ? ' tracked' : '');
        d.innerHTML = `<div class="qt">${esc(g.fmt(q.title))}<span class="badge ${q.main ? '' : 'side'}">${q.main ? 'Kapitel ' + q.chapter : 'Nebenaufgabe'}</span></div><div class="qd">${esc(g.fmt(q.desc || ''))}</div><div class="qs">➜ ${esc(Q.stepText(q))}</div>`;
        d.onclick = () => { g.S.tracked = q.id; g.audio.play('click'); this.render(); };
        list.appendChild(d);
      }
      const av = Q.available();
      if (av.length) {
        this.h(list, '<h3>Wer braucht noch Hilfe?</h3>');
        for (const q of av) this.h(list, `<div class="quest"><div class="qt">${esc(q.title)}<span class="badge side">neu</span></div><div class="qs">Sprich mit ${esc(NPCS[q.giver].name)} (gelbes <b>!</b>)</div></div>`);
      }
      this.h(p, '<div class="sub" style="margin-top:8px;text-align:center">Klicke eine Aufgabe an, um ihr mit dem Richtungspfeil zu folgen.</div>');
    } else {
      const done = Q.done();
      if (!done.length) list.innerHTML = '<div class="empty">Noch nichts erledigt – aber das kommt!</div>';
      for (const q of done) this.h(list, `<div class="quest done"><div class="qt">✓ ${esc(g.fmt(q.title))}</div><div class="qd">${esc(g.fmt(q.desc || ''))}</div></div>`);
    }
  }

  // Karte
  panel_map(p) {
    const g = this.game, S = g.S;
    this.h(p, '<h2>Karte</h2>');
    const wrap = this.h(p, '<div class="map-wrap"><canvas width="720" height="720"></canvas></div>');
    const cv = wrap.querySelector('canvas');
    const c = cv.getContext('2d');
    const k = 720 / WW;
    const drawMap = (t) => {
      c.imageSmoothingEnabled = true;
      c.drawImage(g.mapCanvas, 0, 0, 720, 720);
      // Nebel über unentdeckten Gebieten
      c.drawImage(g.fogCanvas(), 0, 0, 720, 720);
      // Gebietsnamen
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const [id, [x, y]] of Object.entries(REGION_CENTERS)) {
        const disc = S.discovered[id];
        c.font = '700 20px Fredoka, sans-serif';
        c.lineWidth = 5; c.strokeStyle = '#fff'; c.fillStyle = disc ? '#8a3a5e' : '#9a90a8';
        const name = disc ? (id === 'farm' ? g.regionName(REG.FARM) : REGIONS.find((r) => r.id === id).name) : '???';
        c.strokeText(name, x * k, y * k); c.fillText(name, x * k, y * k);
      }
      // Personen
      for (const n of g.npcs) {
        const news = g.quests.npcHasNews(n.id);
        if (!S.discovered[n.id === 'kuno' ? 'beach' : n.id === 'hilde' ? 'farm' : 'village']) continue;
        c.fillStyle = news === 'offer' ? '#ffd23f' : news ? '#ff7eb6' : '#b79cf0';
        c.beginPath(); c.arc(n.x * k, n.y * k, news ? 7 : 5, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      }
      // Aufgabenziele
      for (const q of g.quests.active()) {
        const tg = g.questTargetPos(q);
        if (!tg) continue;
        const tracked = S.tracked === q.id;
        c.save(); c.translate(tg.x * k, tg.y * k); c.scale(tracked ? 1.3 + Math.sin(t * 4) * 0.1 : 1, tracked ? 1.3 + Math.sin(t * 4) * 0.1 : 1);
        c.fillStyle = tracked ? '#ffd23f' : '#fff3b0'; c.strokeStyle = '#c9781a'; c.lineWidth = 2;
        starPath(c, 0, 0, 10); c.fill(); c.stroke(); c.restore();
      }
      // Wegpunkt
      if (S.flags.waypoint) { c.fillStyle = '#7ec8ff'; c.beginPath(); c.arc(S.flags.waypoint.x * k, S.flags.waypoint.y * k, 8, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); }
      // Spielerin
      c.save(); c.translate(g.player.x * k, g.player.y * k - 6);
      heart(c, 0, 4 + Math.sin(t * 5) * 2, 26, '#ff4f8f');
      c.restore();
    };
    let t = 0, raf;
    const loop = () => { t += 1 / 60; drawMap(t); if (this.panel === 'map') raf = requestAnimationFrame(loop); };
    loop();
    this.onClose = () => cancelAnimationFrame(raf);
    cv.addEventListener('click', (e) => {
      const r = cv.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * WW, y = ((e.clientY - r.top) / r.height) * WH;
      if (S.flags.waypoint && Math.hypot(S.flags.waypoint.x - x, S.flags.waypoint.y - y) < 4) S.flags.waypoint = null;
      else S.flags.waypoint = { x, y };
      g.audio.play('pop');
    });
    this.h(p, `<div class="legend"><span style="--c:#ff4f8f">Du</span><span style="--c:#ffd23f">Aufgabenziel / neue Aufgabe</span><span style="--c:#ff7eb6">Jemand wartet auf dich</span><span style="--c:#7ec8ff">Deine Markierung (Klick auf die Karte)</span></div>`);
  }

  // Tieralbum
  panel_album(p) {
    const g = this.game, S = g.S;
    const n = Object.keys(S.album).length;
    this.h(p, `<h2>Tieralbum <span style="font-size:18px;color:var(--ink-soft)">${n}/14</span></h2>`);
    this.h(p, `<div class="bar" style="margin-bottom:12px"><div style="width:${(n / 14) * 100}%"></div></div>`);
    const grid = this.h(p, '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))"></div>');
    for (const id of SPECIES_ORDER) {
      const sp = SPECIES[id], e = S.album[id];
      const c = document.createElement('div'); c.className = 'card' + (e ? '' : ' locked');
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; cv.style.width = '96px'; cv.style.height = '96px';
      drawAnimalPortrait(cv.getContext('2d'), id, 128, 0.5, !e);
      c.appendChild(cv);
      if (e) c.insertAdjacentHTML('beforeend', `<div>${esc(sp.name)}</div><div class="sub">Gefunden: ${esc(e.where || sp.region)} · Tag ${e.day}</div><div class="sub" style="margin-top:4px">${esc(sp.fact)}</div>`);
      else c.insertAdjacentHTML('beforeend', `<div>???</div><div class="sub">Lebt irgendwo: ${esc(sp.region)}${sp.night ? ' (nachts)' : ''}</div>`);
      grid.appendChild(c);
    }
    this.h(p, `<div class="desc-box">${S.albumRewarded ? 'Album vollständig! Du bist offiziell die größte Tierfreundin der Gegend. ♥ Der Goldene Blütenkranz gehört dir.' : 'Streichle oder füttere ein Tier, um es einzutragen. Scheue Tiere laufen weg, wenn du rennst oder reitest – geh langsam! Mit vollem Album wartet eine Überraschung.'}</div>`);
  }

  // Pausenmenü
  panel_pause(p) {
    const g = this.game;
    this.h(p, '<h2>Pause</h2>');
    const col = this.h(p, '<div class="menu-col"></div>');
    const add = (label, fn, cls = '') => { const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = label; b.onclick = fn; col.appendChild(b); };
    add('Weiterspielen', () => this.close(), 'primary');
    add('Einstellungen', () => { this.panel = 'settings'; this.render(); });
    add('Tastenübersicht', () => { this.panel = 'keys'; this.render(); });
    add('Jetzt speichern', () => { g.saveNow(true); });
    add('Zurück zum Hof (Notfall)', () => { this.close(); g.teleportHome(); });
    add('Zum Titelbildschirm', () => { this.close(); g.quitToTitle(); });
    this.h(p, `<div class="sub" style="text-align:center">Gespielt: ${Math.floor(g.S.stats.playSeconds / 60)} Minuten · Das Spiel speichert automatisch.</div>`);
  }

  panel_settings(p) {
    const g = this.game, st = g.settings;
    this.h(p, '<h2>Einstellungen</h2>');
    const row = (label, key) => {
      const r = this.h(p, `<div class="slider-row"><span style="width:170px">${label}</span><input type="range" min="0" max="100" value="${Math.round(st[key] * 100)}"><span class="v" style="width:44px">${Math.round(st[key] * 100)}%</span></div>`);
      const inp = r.querySelector('input');
      inp.oninput = () => { st[key] = inp.value / 100; r.querySelector('.v').textContent = inp.value + '%'; g.applySettings(); };
      inp.onchange = () => { if (key === 'sfx') g.audio.play('pling'); };
    };
    row('Musik', 'music');
    row('Geräusche', 'sfx');
    const fr = this.h(p, '<div class="row" style="margin:14px 0"><button class="btn">Vollbild an/aus</button><button class="btn">Tastenübersicht</button></div>');
    const [fb, kb] = fr.querySelectorAll('button');
    fb.onclick = () => g.toggleFullscreen();
    kb.onclick = () => { this.panel = 'keys'; this.render(); };
    if (g.state === 'play') { const b = this.h(p, '<div class="row"><button class="btn small">Zurück</button></div>'); b.querySelector('button').onclick = () => { this.panel = 'pause'; this.render(); }; }
  }

  panel_keys(p) {
    this.h(p, '<h2>Tastenübersicht</h2>');
    this.h(p, `<div class="keys">
      <kbd>W A S D</kbd><span>oder Pfeiltasten: laufen</span>
      <kbd>Shift</kbd><span>gedrückt halten: rennen / galoppieren</span>
      <kbd>E</kbd><span>sprechen, streicheln, pflücken, benutzen</span>
      <kbd>R</kbd><span>auf- und absteigen (weit weg: dein Pferd herbeipfeifen)</span>
      <kbd>Leertaste</kbd><span>zu Pferd springen (klappt auch automatisch an Zäunen)</span>
      <kbd>F</kbd><span>Pferde-Trick (ab Freundschaftslevel 2)</span>
      <kbd>I</kbd><span>Tasche / Inventar</span>
      <kbd>Q</kbd><span>Aufgaben</span>
      <kbd>M</kbd><span>Karte</span>
      <kbd>T</kbd><span>Tieralbum</span>
      <kbd>P</kbd><span>Pferde-Menü</span>
      <kbd>Esc</kbd><span>Menü / Fenster schließen</span>
      <kbd>Maus</kbd><span>Linke Taste gedrückt halten = in diese Richtung laufen · Klick auf Personen, Tiere und Dinge = benutzen</span>
    </div>`);
    if (this.game.state === 'play') { const b = this.h(p, '<div class="row" style="margin-top:12px"><button class="btn small">Zurück</button></div>'); b.querySelector('button').onclick = () => { this.panel = 'pause'; this.render(); }; }
  }

  // Geschenk auswählen
  panel_gift(p, npc) {
    const g = this.game;
    this.h(p, `<h2>Geschenk für ${esc(NPCS[npc].name)}</h2>`);
    const grid = this.h(p, '<div class="grid"></div>');
    const list = g.inv.list().filter((it) => it.cat !== 'quest' && it.cat !== 'seed');
    if (!list.length) grid.outerHTML = '<div class="empty">Du hast nichts zum Verschenken dabei. Wie wär’s mit Blumen oder Muscheln?</div>';
    for (const it of list) {
      const c = document.createElement('div'); c.className = 'card click';
      c.appendChild(iconCanvas(it.id, 64));
      c.insertAdjacentHTML('beforeend', `<div>${esc(it.name)}</div><span class="n">${it.n}</span>`);
      c.onclick = () => { this.close(); g.giveGift(npc, it.id); };
      grid.appendChild(c);
    }
  }
}

export { esc, formatTime, CLOTHES };
