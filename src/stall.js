// Stall-Menü, Pferde-Details, Pflege (Striegeln-Minispiel, Füttern, Streicheln, Tricks).
import { ACCESSORIES, ACC_SLOTS } from './data/shop.js';
import { PERSONALITIES, COATS, TRICKS } from './data/horses.js';
import { HORSE_FOOD, ITEMS } from './data/items.js';
import { friendLevel, friendProgress, tricksFor } from './horses.js';
import { drawHorse, drawHorsePortrait, horseLook } from './draw/horse.js';
import { iconCanvas } from './draw/icons.js';
import { heart, sparkle, ell, circ } from './draw/paint.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function hearts(lv) { return '♥'.repeat(lv) + '♡'.repeat(5 - lv); }

function portrait(rec, size = 150) {
  const cv = document.createElement('canvas');
  const d = Math.min(2, devicePixelRatio || 1);
  cv.width = size * d; cv.height = size * d;
  const c = cv.getContext('2d'); c.scale(d, d);
  drawHorsePortrait(c, horseLook(rec), size, 0.4);
  return cv;
}

export function panelStall(p) {
  const ui = this, g = ui.game, S = g.S;
  ui.h(p, `<h2>Deine Pferde <span style="font-size:18px;color:var(--ink-soft)">${S.horses.length} von 9</span></h2>`);
  if (!S.farm.stable) ui.h(p, '<div class="desc-box" style="margin:0 0 10px">Der Stall ist noch morsch – aber deine Pferde fühlen sich auf der Koppel trotzdem wohl.</div>');
  const list = ui.h(p, '<div class="horse-list"></div>');
  for (const rec of S.horses) {
    const c = document.createElement('div');
    c.className = 'hcard' + (S.ridingHorse === rec.id ? ' riding' : '');
    c.appendChild(portrait(rec));
    const lv = friendLevel(rec.pts);
    c.insertAdjacentHTML('beforeend', `<div class="hn">${esc(rec.name)}${rec.foal ? ' (Fohlen)' : ''}</div><div class="hearts">${hearts(lv)}</div><div class="hp">${COATS[rec.coat]?.name || ''} · ${PERSONALITIES[rec.personality]?.name || ''}${S.ridingHorse === rec.id ? ' · Reitpferd' : ''}</div>`);
    c.onclick = () => { ui.panel = 'horse'; ui.panelArg = rec.id; ui.render(); };
    list.appendChild(c);
  }
  const wild = g.wildLeft();
  ui.h(p, `<div class="desc-box">${wild ? `Es leben noch <b>${wild}</b> wilde Pferde in der Gegend. Geh langsam auf sie zu, bleib stehen, wenn sie nervös werden, und biete einen Apfel an.` : 'Alle wilden Pferde haben ein Zuhause bei dir gefunden! ♥'}</div>`);
}

export function panelHorse(p, id) {
  const ui = this, g = ui.game, S = g.S;
  const rec = S.horses.find((h) => h.id === id);
  if (!rec) { ui.panel = 'stall'; ui.render(); return; }
  const lv = friendLevel(rec.pts);
  const top = ui.h(p, '<div class="row" style="align-items:flex-start;gap:18px"></div>');
  const pc = portrait(rec, 190);
  pc.style.cssText = 'width:190px;height:190px;border-radius:22px;border:4px solid #fff;box-shadow:0 0 0 3px var(--pink-soft)';
  top.appendChild(pc);
  const info = document.createElement('div'); info.style.flex = '1'; info.style.minWidth = '240px';
  info.innerHTML = `
    <div class="row"><input class="name" maxlength="16" value="${esc(rec.name)}" style="max-width:280px"><button class="btn small">Umbenennen</button></div>
    <div style="margin-top:8px;font-size:15px">${COATS[rec.coat]?.name || ''} · <b>${PERSONALITIES[rec.personality]?.name || ''}</b> – ${PERSONALITIES[rec.personality]?.desc || ''}</div>
    <div style="margin-top:8px"><span class="hearts" style="font-size:22px">${hearts(lv)}</span> Freundschaft Level ${lv}${lv < 5 ? '' : ' (maximal!)'}</div>
    <div class="bar" style="margin:6px 0 4px;max-width:320px"><div style="width:${friendProgress(rec.pts) * 100}%"></div></div>
    <div class="sub">Tempo: +${(lv - 1) * 5}% · Tricks: ${TRICKS.map((t) => (t.level <= lv ? t.name : `<span style="opacity:.5">${t.name} (Lv ${t.level})</span>`)).join(', ')}</div>
    <div class="row" style="margin-top:10px"></div>`;
  top.appendChild(info);
  const [inp, rb] = [info.querySelector('input'), info.querySelector('button')];
  const doRename = () => { const n = inp.value.trim().slice(0, 16); if (n) { rec.name = n; g.audio.play('pop'); ui.toast(`Dein Pferd heißt jetzt ${esc(n)}!`, 'heart'); g.requestSave(); ui.render(); } };
  rb.onclick = doRename;
  inp.onkeydown = (e) => { if (e.key === 'Enter') doRename(); e.stopPropagation(); };
  const actions = info.querySelector('.row:last-child');
  if (!rec.foal) {
    const b = document.createElement('button');
    b.className = 'btn ' + (S.ridingHorse === rec.id ? 'mint' : 'primary');
    b.textContent = S.ridingHorse === rec.id ? '✓ Dein Reitpferd' : 'Als Reitpferd wählen';
    b.onclick = () => { g.selectRidingHorse(rec.id); ui.render(); };
    actions.appendChild(b);
  }
  const cb = document.createElement('button'); cb.className = 'btn'; cb.textContent = 'Pflegen';
  cb.onclick = () => { ui.panel = 'care'; ui.panelArg = rec.id; ui.render(); };
  actions.appendChild(cb);
  // Zubehör
  if (!rec.foal) {
    ui.h(p, '<h3>Zubehör</h3>');
    for (const slot of Object.keys(ACC_SLOTS)) {
      const row = ui.h(p, `<div class="row" style="margin-bottom:8px"><b style="width:70px">${ACC_SLOTS[slot]}</b></div>`);
      const none = document.createElement('button'); none.className = 'chip' + (!rec.acc[slot] ? ' on' : ''); none.textContent = 'ohne';
      none.onclick = () => { rec.acc[slot] = null; g.requestSave(); ui.render(); };
      row.appendChild(none);
      const owned = Object.entries(ACCESSORIES).filter(([aid, a]) => a.slot === slot && g.inv.owns(aid));
      for (const [aid, a] of owned) {
        const b = document.createElement('button'); b.className = 'chip' + (rec.acc[slot] === aid ? ' on' : '');
        b.title = a.name;
        const ic = iconCanvas(aid, 26, 'acc'); ic.style.cssText = 'width:26px;height:26px;vertical-align:middle';
        b.appendChild(ic);
        b.append(' ' + a.name.replace(/^(Sattel|Decke|Mähnenschleifen) /, ''));
        b.onclick = () => { rec.acc[slot] = aid; g.audio.play('pop'); g.requestSave(); ui.render(); };
        row.appendChild(b);
      }
      if (!owned.length) row.insertAdjacentHTML('beforeend', '<span class="sub">Noch keins – schau in Theos Laden!</span>');
    }
  }
  const back = ui.h(p, '<div class="row" style="margin-top:10px"><button class="btn small">← Alle Pferde</button></div>');
  back.querySelector('button').onclick = () => { ui.panel = 'stall'; ui.render(); };
}

// Pflege-Fenster mit Striegel-Minispiel
export function panelCare(p, id) {
  const ui = this, g = ui.game, S = g.S;
  const rec = S.horses.find((h) => h.id === id);
  if (!rec) { ui.close(); return; }
  const lv = friendLevel(rec.pts);
  const gen = ui._careGen = (ui._careGen || 0) + 1;
  ui.h(p, `<h2>${esc(rec.name)} pflegen <span class="hearts" style="font-size:20px">${hearts(lv)}</span></h2>`);
  const area = ui.h(p, '<div class="groom-area"><canvas></canvas></div>');
  const cv = area.querySelector('canvas');
  const d = Math.min(2, devicePixelRatio || 1);
  const W = 640, H = 400;
  cv.width = W * d; cv.height = H * d;
  const c = cv.getContext('2d');
  const status = ui.h(p, '<div class="row" style="margin-top:10px;justify-content:center"></div>');
  const msg = ui.h(p, '<div class="desc-box" style="text-align:center">Wähle aus, was du tun möchtest!</div>');
  const bar = ui.h(p, '<div class="bar hidden" style="margin-top:8px"><div style="width:0%"></div></div>');
  let mode = 'idle';
  const onFarm = g.isOnFarm();
  const btn = (label, icon, fn, dis = false) => {
    const b = document.createElement('button'); b.className = 'btn'; b.disabled = dis;
    const ic = iconCanvas(icon, 26); ic.style.cssText = 'width:26px;height:26px;vertical-align:middle;margin-right:4px';
    b.appendChild(ic); b.append(label); b.onclick = fn; status.appendChild(b); return b;
  };
  btn('Striegeln', 'brush', () => {
    if (!onFarm) { msg.innerHTML = 'Die Bürste liegt im Stall – striegeln kannst du auf dem Ponyhof.'; return; }
    mode = 'groom'; setupDirt(); bar.classList.remove('hidden');
    msg.innerHTML = 'Fahr mit der Maus über das Fell und bürste den Schmutz weg!';
  });
  btn('Streicheln', 'hand', () => { mode = 'pet'; bar.classList.add('hidden'); msg.innerHTML = 'Klick auf den Kopf oder Hals, um zu streicheln.'; });
  for (const food of ['carrot', 'apple', 'hay']) {
    const n = g.inv.count(food);
    btn(`${ITEMS[food].name} (${n})`, food, () => {
      const r = g.careAction(rec, 'feed', food);
      msg.innerHTML = r;
      for (let i = 0; i < 5; i++) fx.push({ k: 'heart', x: 430 + Math.random() * 40, y: 150, vy: -40 - Math.random() * 30, life: 1.4 });
      munch = 1.2;
      ui.render();
    }, n <= 0);
  }
  for (const tr of tricksFor(rec.pts)) {
    btn(tr.name, 'trick', () => { trick = tr.id; trickT = 0; g.careAction(rec, 'trick', tr.id); msg.innerHTML = `${esc(rec.name)} zeigt: ${tr.name}!`; });
  }
  // Minispiel-Zustand
  const H0 = { x: 300, y: 352, k: 4.3 };
  let dirt = [], fx = [], mouse = { x: -99, y: -99, px: -99, py: -99, down: false }, t = 0, munch = 0, trick = null, trickT = 0, done = false;
  function setupDirt() {
    dirt = [];
    done = false;
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      dirt.push({ x: Math.cos(a) * r * 16, y: -26 + Math.sin(a) * r * 9.5, s: 2 + Math.random() * 2.2, v: 1 });
    }
    for (let i = 0; i < 4; i++) dirt.push({ x: 8 + Math.random() * 10, y: -36 - Math.random() * 10, s: 1.8, v: 1 });
  }
  const look = horseLook(rec);
  const toLocal = (x, y) => ({ x: (x - H0.x) / H0.k, y: (y - H0.y) / H0.k });
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  cv.addEventListener('mousemove', (e) => { const q = pos(e); mouse.x = q.x; mouse.y = q.y; });
  cv.addEventListener('mouseleave', () => { mouse.x = -99; });
  cv.addEventListener('mousedown', (e) => {
    const q = pos(e);
    if (mode === 'pet' || mode === 'idle') {
      const l = toLocal(q.x, q.y);
      if (l.x > 0 && l.y < -20) {
        const r = g.careAction(rec, 'pet');
        msg.innerHTML = r;
        for (let i = 0; i < 4; i++) fx.push({ k: 'heart', x: q.x + (Math.random() - 0.5) * 30, y: q.y, vy: -50 - Math.random() * 40, life: 1.3 });
      }
    }
  });
  cv.addEventListener('touchmove', (e) => { const tt = e.touches[0]; const q = pos(tt); mouse.x = q.x; mouse.y = q.y; e.preventDefault(); }, { passive: false });
  let last = performance.now(), raf;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    if (munch > 0) munch -= dt;
    if (trick) { trickT += dt; if (trickT > 1.7) trick = null; }
    // Striegeln
    if (mode === 'groom' && !done && mouse.x > 0) {
      const mv = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      const l = toLocal(mouse.x, mouse.y);
      if (mv > 1) {
        for (const s of dirt) {
          if (s.v <= 0) continue;
          if (Math.hypot(s.x - l.x, s.y - l.y) < s.s + 5) {
            s.v -= Math.min(0.5, mv * 0.012);
            if (Math.random() < 0.5) fx.push({ k: 'spark', x: mouse.x + (Math.random() - 0.5) * 30, y: mouse.y + (Math.random() - 0.5) * 20, vy: -30, life: 0.7 });
          }
        }
        if (Math.random() < 0.25) g.audio.play('brush');
      }
      const left = dirt.reduce((a, s) => a + Math.max(0, s.v), 0) / dirt.length;
      bar.firstChild.style.width = `${(1 - left) * 100}%`;
      if (left <= 0.02) {
        done = true;
        const r = g.careAction(rec, 'groom');
        msg.innerHTML = r;
        for (let i = 0; i < 30; i++) fx.push({ k: i % 3 ? 'spark' : 'heart', x: 200 + Math.random() * 240, y: 120 + Math.random() * 160, vy: -30 - Math.random() * 50, life: 1.5 });
      }
    }
    mouse.px = mouse.x; mouse.py = mouse.y;
    // Zeichnen
    c.setTransform(d, 0, 0, d, 0, 0);
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#e9f7ff'); bg.addColorStop(0.62, '#fdf6e8'); bg.addColorStop(0.63, '#e8cfa0'); bg.addColorStop(1, '#dcbf8a');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // Stallwand
    c.fillStyle = '#f3dcc4'; c.fillRect(0, 60, W, 190);
    c.strokeStyle = '#e6c8a8'; c.lineWidth = 3; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 60); c.lineTo(x, 250); c.stroke(); }
    c.fillStyle = '#f3cf6a'; ell(c, 80, 250, 70, 20); c.fill();
    c.save(); c.translate(H0.x, H0.y); c.scale(H0.k, H0.k);
    drawHorse(c, look, { t, pose: munch > 0 ? 'graze' : 'stand', face: 1, trick, trickT });
    // Schmutz
    if (mode === 'groom') for (const s of dirt) {
      if (s.v <= 0) continue;
      c.fillStyle = `rgba(140,100,70,${0.75 * s.v})`;
      ell(c, s.x, s.y, s.s, s.s * 0.75); c.fill();
      c.fillStyle = `rgba(120,85,60,${0.6 * s.v})`;
      circ(c, s.x + s.s * 0.4, s.y - s.s * 0.2, s.s * 0.35); c.fill();
    }
    c.restore();
    // Effekte
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.life -= dt; f.y += f.vy * dt;
      if (f.life <= 0) { fx.splice(i, 1); continue; }
      c.globalAlpha = Math.min(1, f.life * 2);
      if (f.k === 'heart') heart(c, f.x + Math.sin(f.life * 6) * 6, f.y, 18, '#ff6f9f');
      else sparkle(c, f.x, f.y, 7, '#fff6b0');
      c.globalAlpha = 1;
    }
    // Bürste / Hand als Mauszeiger
    if (mouse.x > 0) {
      c.save(); c.translate(mouse.x, mouse.y);
      if (mode === 'groom') {
        c.rotate(-0.3 + Math.sin(t * 20) * 0.05);
        c.fillStyle = '#c98a5a'; c.beginPath(); c.roundRect(-26, -12, 52, 20, 8); c.fill();
        c.fillStyle = '#fff4e0'; for (let x = -22; x <= 22; x += 5) c.fillRect(x, 8, 3, 10);
        heart(c, 0, 0, 12, '#ff9ecb');
      } else {
        c.fillStyle = '#ffd9c0'; c.strokeStyle = '#d9a080'; c.lineWidth = 2;
        ell(c, 0, 6, 14, 15); c.fill(); c.stroke();
        for (const [x, y] of [[-10, -10], [-3, -14], [4, -14], [11, -9]]) { c.beginPath(); c.roundRect(x - 3.5, y, 7, 15, 3.5); c.fill(); c.stroke(); }
      }
      c.restore();
    }
    if (ui.panel === 'care' && ui._careGen === gen) raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  ui.onClose = () => cancelAnimationFrame(raf);
  const back = ui.h(p, '<div class="row" style="margin-top:10px"><button class="btn small">← Zu den Pferden</button></div>');
  back.querySelector('button').onclick = () => { cancelAnimationFrame(raf); ui.panel = 'horse'; ui.panelArg = rec.id; ui.render(); };
}
