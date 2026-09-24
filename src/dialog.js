// Dialoge als hübsche Sprechblasen mit Porträt, Tippeffekt und Klick zum Weiter.
import { NPCS } from './data/npcs.js';
import { drawPortrait, npcLook, playerLook } from './draw/characters.js';
import { drawHorsePortrait, horseLook } from './draw/horse.js';

export class Dialog {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('dialog');
    this.nameEl = document.getElementById('dlg-name');
    this.textEl = document.getElementById('dlg-text');
    this.choicesEl = document.getElementById('dlg-choices');
    this.nextEl = document.getElementById('dlg-next');
    this.portrait = document.getElementById('portrait');
    this.pctx = this.portrait.getContext('2d');
    this.queue = [];
    this.open = false;
    this.full = '';
    this.shown = 0;
    this.speaker = null;
    this.resolve = null;
    this.choiceMode = false;
    this.t = 0;
    this.typeT = 0;
    this.el.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.advance();
    });
  }

  // lines: Array aus 'Text' oder { who, t }. Gibt ein Promise zurück.
  show(lines, defaultWho = 'narr') {
    return new Promise((resolve) => {
      const list = lines.map((l) => (typeof l === 'string' ? { who: defaultWho, t: l } : { who: l.who || defaultWho, t: l.t }));
      if (!list.length) { resolve(); return; }
      this.queue = list;
      this.resolve = resolve;
      this.open = true;
      this.el.classList.remove('hidden');
      this.choicesEl.innerHTML = '';
      this.choiceMode = false;
      this.next();
    });
  }

  // Frage mit Auswahl. Gibt Index zurück.
  choice(text, options, who = 'narr') {
    return new Promise((resolve) => {
      this.open = true;
      this.el.classList.remove('hidden');
      this.queue = [];
      this.setSpeaker(who);
      this.full = this.game.fmt(text);
      this.shown = this.full.length;
      this.textEl.textContent = this.full;
      this.choiceMode = true;
      this.nextEl.style.display = 'none';
      this.choicesEl.innerHTML = '';
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.textContent = `${i + 1}. ${o}`;
        b.onclick = () => { this.game.audio.play('click'); this.close(); resolve(i); };
        this.choicesEl.appendChild(b);
      });
      this.choiceResolve = resolve;
      this.choiceCount = options.length;
    });
  }

  setSpeaker(who) {
    this.speaker = who;
    const g = this.game;
    this.el.classList.toggle('narr', who === 'narr');
    let name = '';
    if (who === 'player') name = g.S.player.name;
    else if (who === 'horse') name = g.ridingRecord()?.name || 'Pferd';
    else if (NPCS[who]) name = NPCS[who].name;
    this.nameEl.textContent = name;
    this.nameEl.style.display = name ? '' : 'none';
    this.drawPortrait();
  }

  drawPortrait() {
    const who = this.speaker, s = this.portrait.width;
    const g = this.game;
    if (who === 'narr') return;
    if (who === 'player') drawPortrait(this.pctx, playerLook(g.S.player), s, this.t);
    else if (who === 'horse') { const r = g.ridingRecord(); if (r) drawHorsePortrait(this.pctx, horseLook(r), s, this.t); }
    else if (NPCS[who]) drawPortrait(this.pctx, npcLook(NPCS[who].look), s, this.t);
  }

  next() {
    const l = this.queue.shift();
    if (!l) { this.close(); const r = this.resolve; this.resolve = null; r && r(); return; }
    this.setSpeaker(l.who);
    this.full = this.game.fmt(l.t);
    this.shown = 0;
    this.textEl.textContent = '';
    this.nextEl.style.display = '';
  }

  advance() {
    if (!this.open || this.choiceMode) return;
    if (this.shown < this.full.length) { this.shown = this.full.length; this.textEl.textContent = this.full; return; }
    this.game.audio.play('click');
    this.next();
  }

  close() {
    this.open = false;
    this.choiceMode = false;
    this.el.classList.add('hidden');
    this.choicesEl.innerHTML = '';
    this.nextEl.style.display = '';
  }

  update(dt, input) {
    if (!this.open) return;
    this.t += dt;
    if (this.shown < this.full.length) {
      this.typeT += dt;
      const speed = 55;
      const n = Math.floor(this.typeT * speed);
      if (n > 0) {
        this.typeT -= n / speed;
        const before = this.shown;
        this.shown = Math.min(this.full.length, this.shown + n);
        this.textEl.textContent = this.full.slice(0, this.shown);
        if (Math.floor(before / 3) !== Math.floor(this.shown / 3) && this.full[this.shown - 1] !== ' ') {
          const v = NPCS[this.speaker]?.voice || (this.speaker === 'player' ? 1.3 : 1);
          this.game.audio.play('type', { pitch: v });
        }
      }
    }
    if (Math.floor(this.t * 8) !== Math.floor((this.t - dt) * 8)) this.drawPortrait();
    if (this.choiceMode) {
      for (let i = 0; i < (this.choiceCount || 0); i++) {
        if (input.hit(String(i + 1))) { const r = this.choiceResolve; this.close(); this.game.audio.play('click'); r(i); return; }
      }
      return;
    }
    if (input.hit('e', ' ', 'Enter') || input.mouse.clicked) this.advance();
  }
}
