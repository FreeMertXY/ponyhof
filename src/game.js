// Das Spiel: verbindet Welt, Figuren, Aufgaben, Oberfläche und Zeit.
import { World, TILE, WW, WH, REG, REGIONS, SPOTS, FARM, VILLAGE, G, COL, regionName } from './world.js';
import { Renderer, lightingAt } from './render.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { SaveManager, defaultState } from './save.js';
import { Inventory } from './inventory.js';
import { QuestEngine } from './quests.js';
import { QUEST_BY_ID, CHAPTERS } from './data/quests.js';
import { ITEMS, HORSE_FOOD, CROPS, itemName } from './data/items.js';
import { NPCS, NPC_ORDER, VILLAGERS } from './data/npcs.js';
import { SPECIES, SPECIES_ORDER } from './data/animals.js';
import { WILD_HORSES, COATS } from './data/horses.js';
import { DECO, ACCESSORIES, OUTFITS } from './data/shop.js';
import { Player } from './player.js';
import { HorseEntity, makeHorseRecord, friendLevel, tameOffer, newTameState, wildDef } from './horses.js';
import { NPC } from './npcs.js';
import { Animal, spawnAnimals } from './animals.js';
import { Particles } from './particles.js';
import { UI } from './ui.js';
import { Dialog } from './dialog.js';
import { panelShop } from './shop.js';
import { panelStall, panelHorse, panelCare } from './stall.js';
import { Race, RACES, MEDAL_NAMES } from './race.js';
import { Screens } from './screens.js';
import { runEnding } from './ending.js';
import * as Sc from './scenes.js';
import { paintMiniMap } from './draw/terrain.js';
import { makeCanvas, rr, outlinedText, FONT, star, heart, circ, ell } from './draw/paint.js';
import { decoSprite, drawSprite } from './draw/objects.js';
import { drawCharacter, playerLook } from './draw/characters.js';
import { iconCanvas } from './draw/icons.js';
import { clamp, dist, genitive, pick } from './util.js';

const T = TILE;
const REGION_IDS = REGIONS.map((r) => r.id);

export class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.renderer = new Renderer(this.canvas);
    this.input = new Input(this.canvas);
    this.audio = new AudioEngine();
    this.saves = new SaveManager(window.localStorage);
    this.settings = this.saves.loadSettings();
    this.audio.setVolumes(this.settings.music, this.settings.sfx);
    this.particles = new Particles();
    this.ui = new UI(this);
    Object.assign(this.ui, { panel_shop: panelShop, panel_stall: panelStall, panel_horse: panelHorse, panel_care: panelCare });
    this.dialog = new Dialog(this);
    this.screens = new Screens(this);
    this.state = 'boot';
    this.t = 0;
    this.S = defaultState();
    this.timers = [];
    this.pending = [];
    this.cutscene = false;
    this.controlsLocked = false;
    this.mouseWalk = true;
    this.race = null;
    this.build = null;
    this.entities = [];
    this.horses = [];
    this.npcs = [];
    this.animals = [];
    this.lighting = { dark: 0, tint: null, night: false };
    this.lightingNight = false;
    this.rainbowAlpha = 0;
    this.saveT = 0;
    this.saveReq = 0;
    this.passiveT = 0;
    this.hintQueue = [];
    this.hintCool = 0;
    this.regionId = null;
    this.postTimer = null;
    this.camOverride = null;
    this.fps = { frames: 0, acc: 0, value: 60, samples: [] };
    window.addEventListener('resize', () => this.renderer.resize());
    const unlock = () => { this.audio.init(); this.applyAudioMode(); };
    window.addEventListener('mousedown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('beforeunload', () => { if (this.state === 'play') this.saveNow(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'play') this.saveNow(); });
    this.initWorld();
  }

  // ---------- Aufbau ----------
  initWorld() {
    this.world = new World(this.S.farm);
    this.renderer.setWorld(this.world);
    this.mapCanvas = makeCanvas(WW * 2, WH * 2);
    paintMiniMap(this.mapCanvas.getContext('2d'), this.world, 2);
    this._fog = null;
  }

  async boot() {
    try { await Promise.race([document.fonts.load('600 16px Fredoka'), new Promise((r) => setTimeout(r, 2500))]); } catch { /* Schrift optional */ }
    document.getElementById('loading').classList.add('gone');
    this.state = 'title';
    this.screens.title();
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.frame(dt, now);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  setupPlay() {
    const S = this.S;
    this.world = new World(S.farm);
    this.renderer.setWorld(this.world);
    this.mapCanvas = makeCanvas(WW * 2, WH * 2);
    paintMiniMap(this.mapCanvas.getContext('2d'), this.world, 2);
    this._fog = null;
    this.inv = new Inventory(S, (kind, id, n) => this.onInvChange(kind, id, n));
    const qctx = this.questCtx();
    qctx.inv = this.inv;
    this.quests = new QuestEngine(S, qctx);
    this.player = new Player(this);
    this.npcs = NPC_ORDER.map((id) => new NPC(id));
    this.animals = spawnAnimals(this.world);
    // Krümel
    this.kitten = new Animal('cat', SPOTS.kitten.x, SPOTS.kitten.y, 9);
    this.kitten.name = 'Krümel';
    this.kittenState();
    this.animals.push(this.kitten);
    // Haustiere: Maumau, Manni und Mira
    this.pets = {
      maumau: new Animal('maumau', 66.5, 91.6, 0),
      manni: new Animal('manni', 87.5, 91.6, 0),
      mira: new Animal('mira', this.player.x - 1, this.player.y + 0.4, 0),
    };
    for (const [id, a] of Object.entries(this.pets)) { a.name = { maumau: 'Maumau', manni: 'Manni', mira: 'Mira' }[id]; this.animals.push(a); }
    this.pets.mira.mode = 'follow'; this.pets.mira.followT = 0;
    this.sniffed = new Set();
    this.sniffT = 3;
    this.setupHorses();
    this.restoreStory();
    this.rebuildEntities();
    // Deko-Kollision
    for (const d of S.deco) this.world.setDyn(d.x, d.y, true);
    // Spielerin an sicherer Stelle
    const safe = this.world.nearestFree(this.player.x, this.player.y, { riding: this.player.riding });
    this.player.x = safe.x; this.player.y = safe.y;
    this.renderer.follow(this.player.x, this.player.y, 0, true);
    this.regionId = null;
    this.quests.refresh();
    this.updateLighting();
    this.race = null;
    this.build = null;
    this.cutscene = false;
    this.controlsLocked = false;
    if (S.flags.festivalMusic) this.audio.setMode('festival');
  }

  // Zustände aus den neuen Kapiteln nach dem Laden wiederherstellen
  restoreStory() {
    const S = this.S, pets = this.pets;
    this.escort = null; this.escortHorse = null; this.kittens = [];
    if (S.farm.petcorner) { pets.maumau.homeX = 102; pets.maumau.homeY = 109.2; pets.manni.homeX = 106.5; pets.manni.homeY = 108.8; pets.maumau.x = 102; pets.maumau.y = 109.2; pets.manni.x = 106.5; pets.manni.y = 108.8; }
    if (S.flags.miraLost) { const m = pets.mira; m.mode = 'scene'; m.x = SPOTS.miraHide.x; m.y = SPOTS.miraHide.y; }
    if (Array.isArray(S.flags.kittens)) Sc.spawnKittens(this, S.flags.kittens);
    pets.manni.toy = !!S.flags.manniToy;
    pets.mira.rosette = !!S.flags.miraRosette;
    const st = this.quests.st('h_ausritt');
    if (st && st.state === 'active' && st.step === 1) Sc.escortStart(this);
  }

  setupHorses() {
    const S = this.S;
    this.horses = [];
    const P = this.world.paddock;
    const rp = () => ({ x: P.x + 1 + Math.random() * (P.w - 2), y: P.y + 1 + Math.random() * (P.h - 2) });
    for (const rec of S.horses) {
      let h;
      if (rec.foal && rec.follow) h = new HorseEntity(rec, 'follow', this.player.x - 1.5, this.player.y + 0.5);
      else if (rec.id === S.ridingHorse) {
        const pos = rec.place === 'world' && Number.isFinite(rec.x) && rec.x > 0 ? { x: rec.x, y: rec.y } : { x: FARM.spawn.x + 2, y: FARM.spawn.y };
        h = new HorseEntity(rec, 'idle', pos.x, pos.y);
      } else { const p = rp(); h = new HorseEntity(rec, 'paddock', p.x, p.y); }
      this.horses.push(h);
    }
    const riding = this.horses.find((h) => h.id === S.ridingHorse);
    if (S.player.riding && riding) this.player.mount(riding);
    else S.player.riding = false;
    for (const def of WILD_HORSES) {
      if (S.horses.some((h) => h.id === def.id)) continue;
      const sp = SPOTS.wildHorses[def.id];
      const h = new HorseEntity({ ...def, acc: {} }, 'wild', sp.x, sp.y);
      if (S.wild[def.id]) { h.tame = newTameState(); h.tame.trust = S.wild[def.id].trust || 0; }
      this.horses.push(h);
    }
    // Wildpferdeherde
    const herdCoats = ['brauner', 'falbe', 'rappe', 'fuchs'];
    SPOTS.herd.forEach((p, i) => this.horses.push(new HorseEntity({ id: 'herd' + i, name: 'Wildpferd', coat: herdCoats[i], marking: i % 2 ? 'star' : 'none', acc: {}, personality: 'wild' }, 'herd', p.x, p.y)));
  }

  rebuildEntities() {
    this.entities = [this.player, ...this.npcs, ...this.animals, ...this.horses.filter((h) => h.mode !== 'ridden' && h.visible !== false), ...(this.race ? this.race.entities : []), ...(this.sceneEntities || []), ...(this.escort ? [this.escort] : [])];
  }

  kittenState() {
    const S = this.S, k = this.kitten;
    const st = S.flags.kitten;
    if (st === 'following') { k.mode = 'follow'; k.visible = true; k.x = this.player.x - 1; k.y = this.player.y; }
    else if (st === 'home') { k.mode = null; k.visible = true; k.homeX = 133.5; k.homeY = 88.5; k.x = k.homeX; k.y = k.homeY; }
    else {
      const q = this.quests?.st('k1_kruemel');
      const searching = q && q.state === 'active' && q.step === 1;
      k.visible = !!searching;
      k.mode = 'scene'; k.x = SPOTS.kitten.x; k.y = SPOTS.kitten.y; k.state = 'idle';
    }
  }

  questCtx() {
    return {
      inv: null, // wird unten gesetzt
      fmt: (t) => this.fmt(t),
      onStart: (q, auto) => this.onQuestStart(q, auto),
      onComplete: (q) => this.onQuestComplete(q),
      onStep: (q) => { this.requestSave(); this.ui.pulseTracker?.(); if (q.id === 'k1_kruemel') setTimeout(() => this.kittenState(), 0); },
      maxFriendLevel: () => Math.max(1, ...this.S.horses.filter((h) => !h.foal).map((h) => friendLevel(h.pts))),
      albumCount: () => Object.keys(this.S.album).length,
      isTamed: (id) => this.S.horses.some((h) => h.id === id),
      tamedCount: () => this.S.horses.filter((h) => WILD_HORSES.some((w) => w.id === h.id)).length,
      regionId: () => REGION_IDS[this.world.regionAt(this.player.x, this.player.y)],
      playerPos: () => ({ x: this.player.x, y: this.player.y }),
      flag: (n) => (n === 'kittenFollowing' ? this.S.flags.kitten === 'following' : this.S.flags[n]),
      timer: (action, id) => this.questTimer(action, id),
      onTalk: (k) => { if (k === 'miraLost') Sc.miraLost(this); else if (k === 'escortStart') Sc.escortStart(this); },
    };
  }

  // ---------- Neues Spiel / Laden ----------
  newGame(look, horse) {
    const S = defaultState();
    Object.assign(S.player, look);
    S.created = Date.now();
    const rec = makeHorseRecord({ id: 'h_start', name: horse.name, coat: horse.coat, marking: horse.marking, socks: horse.socks, personality: 'sanft' });
    rec.place = 'world'; rec.x = 80.5; rec.y = 89.9;
    S.horses.push(rec);
    S.ridingHorse = rec.id;
    S.memories.push({ type: 'firstHorse', day: 1, horse: rec.id });
    S.player.x = 75.5; S.player.y = 89.6;
    this.S = S;
    this.setupPlay();
    this.state = 'play';
    this.ui.showHUD(true);
    this.saveNow();
    // Begrüßung durch Oma Hilde
    this.later(0.8, async () => {
      await this.say([
        { who: 'hilde', t: 'Da bist du ja, {name}! Willkommen auf deinem Ponyhof.' },
        { who: 'mert', t: 'Wir sind wirklich da! Maumau und Manni haben schon die ganze Scheune inspiziert – und Mira will sofort alles erkunden.' },
        { who: 'narr', t: 'Wuff! Mira hüpft aufgeregt um deine Füße. Sie wird dir überallhin folgen.' },
        { who: 'hilde', t: '{horse} fühlt sich auch schon ganz wie zu Hause. Geh doch mal hin und sag Hallo – mit E kannst du es streicheln und füttern.' },
        { who: 'hilde', t: 'Hier sind drei Karotten. Die mag {horse} besonders!' },
      ]);
      this.tutorial('move');
    });
  }

  loadGame() {
    const S = this.saves.load();
    if (!S) {
      this.screens.message('Der Speicherstand konnte leider nicht geladen werden. Starte ein neues Spiel – dein alter Stand wurde zur Sicherheit aufgehoben.');
      return false;
    }
    this.S = S;
    this.setupPlay();
    this.state = 'play';
    this.ui.showHUD(true);
    this.ui.banner(regionName(this.world.regionAt(this.player.x, this.player.y), S.player.name), `Tag ${S.time.day}`);
    return true;
  }

  quitToTitle() {
    this.saveNow();
    this.state = 'title';
    this.ui.showHUD(false);
    this.dialog.close();
    this.race = null;
    this.cutscene = false;
    this.screens.title();
  }

  // ---------- Hilfen ----------
  fmt(text) {
    const S = this.S;
    return String(text)
      .replace(/\{name\}/g, S.player.name || 'Jolina')
      .replace(/\{horse\}/g, this.ridingRecord()?.name || 'dein Pferd')
      .replace(/\{farm\}/g, genitive(S.player.name) + ' Ponyhof');
  }
  // Fohlen mitnehmen oder auf der Koppel lassen (sonst folgt nur Mira)
  setFoalFollow(rec, on) {
    rec.follow = !!on;
    const h = this.horseEntity(rec.id);
    if (h) {
      const P = this.world.paddock;
      if (on) h.mode = 'follow';
      else { h.mode = 'paddock'; h.target = null; h.x = P.x + 2 + Math.random() * (P.w - 4); h.y = P.y + 2 + Math.random() * (P.h - 4); }
    }
    this.ui.toast(on ? `${rec.name} kommt jetzt mit dir mit!` : `${rec.name} bleibt auf der Koppel.`, 'horse', 'mint');
    this.requestSave();
  }

  ridingRecord() { return this.S.horses.find((h) => h.id === this.S.ridingHorse) || this.S.horses.find((h) => !h.foal); }
  regionName(id) { return regionName(id, this.S.player.name); }
  regionLabel() { return this.regionName(this.world.regionAt(this.player.x, this.player.y)); }
  npcById(id) { return this.npcs.find((n) => n.id === id); }
  horseEntity(id) { return this.horses.find((h) => h.id === id); }
  isOnFarm() { return this.world.regionAt(this.player.x, this.player.y) === REG.FARM; }
  wildLeft() { return WILD_HORSES.filter((w) => !this.S.horses.some((h) => h.id === w.id)).length; }

  say(lines, who = 'narr') {
    return this.dialog.show(lines, who);
  }
  ask(text, options, who = 'narr') { return this.dialog.choice(text, options, who); }
  wait(sec) { return new Promise((r) => this.timers.push({ t: sec, fn: r })); }
  later(sec, fn) { this.timers.push({ t: sec, fn }); }
  fade(on) {
    document.getElementById('fade').classList.toggle('on', on);
    return new Promise((r) => setTimeout(r, 650));
  }

  hint(text, key) {
    if (key) {
      if (this.S.tutorial['h_' + key]) return;
      this.S.tutorial['h_' + key] = true;
    }
    this.ui.hint(text);
  }

  tutorial(key) {
    const S = this.S;
    if (S.tutorial[key]) return;
    const H = {
      move: 'Laufe mit <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> oder den Pfeiltasten – oder halte die linke Maustaste gedrückt.',
      pet: 'Stell dich zu {horse} und drück <kbd>E</kbd> (oder klick drauf), um es zu streicheln und zu füttern.',
      ride: 'Drück <kbd>R</kbd>, um auf {horse} aufzusteigen. Ist dein Pferd weit weg, pfeifst du es mit <kbd>R</kbd> herbei!',
      gallop: 'Halte <kbd>Shift</kbd> zum Galoppieren. Mit der <kbd>Leertaste</kbd> springst du über Zäune!',
      quest: 'Oben siehst du deine Aufgabe, der goldene Pfeil zeigt den Weg. <kbd>Q</kbd> öffnet das Aufgabenbuch.',
      map: 'Neues Gebiet! <kbd>M</kbd> öffnet die Karte – du kannst dort auch eigene Markierungen setzen.',
      bag: 'Gesammeltes landet in deiner Tasche (<kbd>I</kbd>). Theo im Dorf kauft Blumen, Pilze und Muscheln.',
      album: 'Das Tier steht jetzt in deinem Tieralbum (<kbd>T</kbd>)! Findest du alle 14 Arten?',
      shoe: 'Ein goldenes Hufeisen! 30 davon sind gut versteckt. Bei 10, 20 und 30 gibt es tolle Belohnungen.',
      wild: 'Ein wildes Pferd! Steig ab, geh langsam hin und bleib stehen, wenn es nervös wird (<b>!</b>). Dann <kbd>E</kbd>: Apfel anbieten.',
      night: 'Es wird Nacht. Im Wohnhaus kannst du schlafen (<kbd>E</kbd> an der Tür) – oder die Glühwürmchen bestaunen.',
    };
    if (!H[key]) return;
    S.tutorial[key] = true;
    this.hintQueue.push(this.fmt(H[key]));
  }

  contextTutorials() {
    const P = this.player;
    for (const h of this.horses) {
      const d = dist(h.x, h.y, P.x, P.y);
      if (h.mode === 'wild' && d < 9) this.tutorial('wild');
      else if (h.id === this.S.ridingHorse && d < 4 && !P.riding) this.tutorial('pet');
    }
    if (this.quests.isDone('k1_pflege') && !P.riding) this.tutorial('ride');
  }

  // ---------- Hauptschleife ----------
  frame(dt, now) {
    this.t += dt;
    // Bildrate messen
    const f = this.fps;
    f.frames++; f.acc += dt;
    if (f.acc >= 1) {
      f.value = f.frames / f.acc; f.samples.push(f.value); if (f.samples.length > 120) f.samples.shift(); f.frames = 0; f.acc = 0;
      this.adaptQuality();
    }
    if (this.state === 'title' || this.state === 'editor' || this.state === 'intro' || this.state === 'credits') {
      this.screens.update(dt);
    } else if (this.state === 'play' || this.state === 'ending') {
      this.update(dt);
      this.renderer.draw(this, this.t);
      this.ui.updateHUD(dt);
    }
    this.input.endFrame();
  }

  // Automatische Qualitätsanpassung: bei dauerhaft niedriger Bildrate interne Auflösung senken
  adaptQuality() {
    const f = this.fps, r = this.renderer;
    if (document.hidden || (this.state !== 'play' && this.state !== 'ending')) return;
    const last = f.samples.slice(-3);
    if (last.length < 3) return;
    const avg = last.reduce((a, b) => a + b, 0) / 3;
    this._qCool = (this._qCool || 0) - 1;
    if (this._qCool > 0) return;
    if (avg < 48 && r.quality > 0.6) { r.quality = Math.max(0.6, r.quality - 0.15); r.resize(); this._qCool = 3; this._goodT = 0; }
    else if (avg > 58.5 && r.quality < 1) { this._goodT = (this._goodT || 0) + 1; if (this._goodT > 20) { r.quality = Math.min(1, r.quality + 0.1); r.resize(); this._qCool = 5; this._goodT = 0; } }
  }

  update(dt) {
    const inp = this.input, ui = this.ui;
    // Timer
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i];
      tm.t -= dt;
      if (tm.t <= 0) { this.timers.splice(i, 1); tm.fn(); }
    }
    // Tasten für Menüs
    if (inp.hit('Escape')) {
      if (this.build) this.endBuild();
      else if (ui.isOpen()) ui.close();
      else if (!this.dialog.open && !this.cutscene) ui.open('pause');
    }
    if (ui.isOpen()) {
      if (inp.hit('i') && ui.panel === 'inventory') ui.close();
      else if (inp.hit('q') && ui.panel === 'quests') ui.close();
      else if (inp.hit('m') && ui.panel === 'map') ui.close();
      else if (inp.hit('t') && ui.panel === 'album') ui.close();
      else if (inp.hit('p') && (ui.panel === 'stall' || ui.panel === 'horse')) ui.close();
      return; // Spiel pausiert, solange ein Fenster offen ist
    }
    const busy = this.dialog.open || this.cutscene;
    this.controlsLocked = busy || (this.race && this.race.phase === 'countdown');
    if (this.dialog.open) this.dialog.update(dt, inp);
    if (!busy && this.state === 'play') {
      if (inp.hit('i')) ui.open('inventory');
      else if (inp.hit('q')) ui.open('quests');
      else if (inp.hit('m')) ui.open('map');
      else if (inp.hit('t')) ui.open('album');
      else if (inp.hit('p')) ui.open('stall');
      else if (inp.hit('r')) this.toggleRide();
      else if (inp.hit('f')) this.doTrick();
    }
    // Zeit
    if (!busy || this.cutscene) this.advanceTime(dt);
    this.updateLighting();
    // Figuren
    this.player.update(dt);
    for (const h of this.horses) if (h.mode !== 'ridden') h.update(dt, this);
    for (const n of this.npcs) n.update(dt, this);
    for (const a of this.animals) a.update(dt, this);
    if (this.sceneEntities) for (const e of this.sceneEntities) e.update?.(dt, this);
    if (this.race) this.race.update(dt);
    if (this.escort) {
      this.escort.update(dt, this);
      if (!this.cutscene && this.state === 'play' && dist(this.player.x, this.player.y, SPOTS.lookout.x, SPOTS.lookout.y) < 4.5) this.pending.push(() => Sc.lookoutScene(this));
    }
    this.particles.update(dt);
    // Kamera
    const ct = this.camOverride || { x: this.player.x + this.player.vx * 0.25, y: this.player.y - 0.6 + this.player.vy * 0.2 };
    this.renderer.follow(ct.x, ct.y, dt);
    if (this.renderer.shake > 0) this.renderer.shake = Math.max(0, this.renderer.shake - dt * 30);
    if (this.state !== 'play') return;
    // Gebiet
    this.checkRegion();
    // Sammeln & Interaktion
    this.autoCollect();
    this.focus = busy ? null : this.findInteraction();
    this.ui.setActButton(null);
    if (!busy) {
      if (inp.hit('e', 'Enter') && this.focus) this.interact();
      else if (inp.mouse.clicked && !this.build) this.clickWorld();
      if (this.build) this.updateBuild();
    }
    // Aufgaben passiv prüfen
    this.passiveT -= dt;
    if (this.passiveT <= 0) { this.passiveT = 0.5; this.quests.checkPassive(); this.checkKitten(); this.contextTutorials(); }
    // wartende Aktionen (nach Dialogen)
    if (!busy && this.pending.length) { const fn = this.pending.shift(); this.runScript(fn); }
    if (!busy && !this.S.flags.miraLost) this.miraSniff(dt);
    if (this.S.flags.miraLost && !busy) this.miraBark(dt);
    // Hinweise
    this.hintCool -= dt;
    if (this.hintCool <= 0 && this.hintQueue.length && !busy) { this.ui.hint(this.hintQueue.shift(), 7); this.hintCool = 9; }
    // Umgebung
    this.audio.tick(dt, { night: this.lightingNight, region: REGION_IDS[this.world.regionAt(this.player.x, this.player.y)] });
    const nearSea = this.world.regionAt(this.player.x, this.player.y) === REG.BEACH;
    this.audio.setAmbience({ rain: this.S.weather.kind === 'rain' ? 1 : 0, waves: nearSea ? 1 : 0 });
    // Speichern
    this.S.stats.playSeconds += dt;
    this.saveT += dt;
    if (this.saveT >= 30) { this.saveT = 0; this.saveNow(); }
    if (this.saveReq > 0) { this.saveReq -= dt; if (this.saveReq <= 0) this.saveNow(); }
    if (this.postTimer) this.postTimer.t += dt;
  }

  async runScript(fn) {
    try { await fn(); } catch (e) { console.error(e); this.cutscene = false; this.camOverride = null; }
  }

  // ---------- Zeit & Wetter ----------
  advanceTime(dt) {
    const S = this.S;
    const gm = dt * 2; // 12 Minuten = 1 Tag
    S.time.minutes += gm;
    this.growCrops(gm / 60, S.weather.kind === 'rain');
    if (S.time.minutes >= 1440) { S.time.minutes -= 1440; S.time.day++; this.newDay(); }
    // Wetter
    const now = S.time.day * 1440 + S.time.minutes;
    const W = S.weather;
    if (now >= W.until && !S.flags.noWeather) {
      if (W.kind === 'rain') { W.kind = 'sun'; W.rainbowUntil = now + 70; W.until = now + 180 + Math.random() * 240; this.ui.toast('Ein Regenbogen!', 'rainbow'); }
      else if (Math.random() < 0.3) { W.kind = 'rain'; W.until = now + 50 + Math.random() * 70; }
      else W.until = now + 120 + Math.random() * 200;
    }
    const target = now < W.rainbowUntil && W.kind !== 'rain' && !this.lightingNight ? 1 : 0;
    this.rainbowAlpha += (target - this.rainbowAlpha) * Math.min(1, dt * 0.8);
  }

  newDay() {
    this.ui.toast(`Ein neuer Tag beginnt – Tag ${this.S.time.day}`, 'sun');
    this.requestSave();
  }

  updateLighting() {
    this.lighting = lightingAt(this.S.time.minutes);
    const n = this.lighting.night;
    if (n !== this.lightingNight) {
      this.lightingNight = n;
      this.applyAudioMode();
      if (n && this.state === 'play') this.tutorial('night');
    }
  }

  applyAudioMode() {
    if (this.state === 'title' || this.state === 'editor' || this.state === 'intro') this.audio.setMode('title');
    else if (this.S.flags.festivalMusic || this.race) this.audio.setMode('festival');
    else this.audio.setMode(this.lightingNight ? 'night' : 'day');
  }

  // ---------- Garten ----------
  growCrops(hours, raining) {
    for (const g of this.S.garden) {
      if (!g || !g.crop) continue;
      if (raining) g.wet = Math.max(g.wet || 0, 8);
      if (g.wet > 0 && g.growth < 1) {
        g.growth = Math.min(1, g.growth + hours / CROPS[g.crop].hours);
        g.wet = Math.max(0, g.wet - hours);
        if (g.growth >= 1 && !g.ripeNotified) { g.ripeNotified = true; if (this.isOnFarm()) this.ui.toast(`Im Garten ist etwas reif! (${CROPS[g.crop].name})`, CROPS[g.crop].item); }
      } else if (g.wet > 0) g.wet = Math.max(0, g.wet - hours);
    }
  }

  cropStage(g) {
    if (!g || !g.crop) return 0;
    if (g.growth >= 1) return 3;
    if (g.growth >= 0.55) return 2;
    if (g.growth >= 0.15) return 1;
    return 0;
  }

  plotIndex(tx, ty) { return this.world.gardenPlots.findIndex((p) => p.x === tx && p.y === ty); }

  gardenAction(i) {
    const S = this.S;
    const g = S.garden[i] || (S.garden[i] = { crop: null, growth: 0, wet: 0 });
    const pl = this.world.gardenPlots[i];
    if (!g.crop) {
      const seed = this.inv.has('seed_carrot') ? 'seed_carrot' : this.inv.has('seed_sunflower') ? 'seed_sunflower' : null;
      if (!seed) {
        if (!this.S.flags.freeSeeds || this.S.flags.freeSeeds < S.time.day) {
          this.S.flags.freeSeeds = S.time.day;
          this.inv.add('seed_carrot', 3);
          this.ui.toast('Oma Hilde hat dir 3 Karottensamen dagelassen!', 'seed_carrot');
          return;
        }
        this.ui.hint('Du hast keine Samen. Theo verkauft Karotten- und Sonnenblumensamen.');
        return;
      }
      this.inv.remove(seed, 1);
      g.crop = seed === 'seed_carrot' ? 'carrot' : 'sunflower';
      g.growth = 0; g.ripeNotified = false;
      this.audio.play('dig');
      this.particles.dust(pl.x + 0.5, pl.y + 0.6, 4);
      this.quests.emit('plant');
      this.hint('Jetzt gießen: nochmal <kbd>E</kbd> drücken!', 'water');
    } else if (g.growth >= 1) {
      const c = CROPS[g.crop];
      this.inv.add(c.item, c.yield);
      this.audio.play('pling');
      this.particles.text(pl.x + 0.5, pl.y + 0.5, `+${c.yield} ${itemName(c.item, c.yield)}`);
      this.particles.sparkles(pl.x + 0.5, pl.y + 0.5, 6);
      this.quests.emit('harvest', g.crop);
      S.garden[i] = { crop: null, growth: 0, wet: g.wet };
    } else if (!(g.wet > 0)) {
      g.wet = 12;
      this.audio.play('water');
      this.particles.splash(pl.x + 0.5, pl.y + 0.5, 8);
      this.quests.emit('water');
    } else {
      this.ui.hint(`Die ${CROPS[g.crop].name} wächst noch (${Math.round(g.growth * 100)} %). Die Erde ist feucht – einfach etwas warten oder schlafen.`);
      return;
    }
    this.requestSave();
  }

  // ---------- Gebiete ----------
  checkRegion() {
    const r = this.world.regionAt(this.player.x, this.player.y);
    if (r === this.regionId) return;
    const first = this.regionId === null;
    this.regionId = r;
    const id = REGION_IDS[r];
    this.audio.setRegion(id);
    if (!this.S.discovered[id]) {
      this.S.discovered[id] = true;
      this._fog = null;
      this.ui.banner(this.regionName(r), 'Neues Gebiet entdeckt!');
      this.audio.play('pling');
      if (Object.keys(this.S.discovered).length >= 2) this.tutorial('map');
      this.requestSave();
    } else if (!first) this.ui.banner(this.regionName(r));
    this.quests.checkPassive();
  }

  fogCanvas() {
    if (this._fog) return this._fog;
    const c = makeCanvas(WW, WH), x = c.getContext('2d');
    for (let y = 0; y < WH; y++) for (let i = 0; i < WW; i++) {
      const id = REGION_IDS[this.world.regionAt(i, y)];
      if (!this.S.discovered[id]) { x.fillStyle = (i + y) % 3 ? 'rgba(250,244,255,0.92)' : 'rgba(240,232,250,0.94)'; x.fillRect(i, y, 1, 1); }
    }
    this._fog = c;
    return c;
  }

  // ---------- Sammeln ----------
  pickupAvailable(p) {
    const C = this.S.collected;
    if (p.k === 'horseshoe') return !C.hs.includes(p.id);
    if (p.k === 'heartstone') return !C.hearts.includes(p.id) && this.quests.step(QUEST_BY_ID.s_herzsteine)?.ev === 'heartstone';
    const d = C.pick[p.id];
    return d === undefined || d < this.S.time.day;
  }

  visiblePickups(view) {
    const out = [];
    for (const p of this.world.pickups) {
      if (p.x < view.x0 - 1 || p.x > view.x1 + 1 || p.y < view.y0 - 1 || p.y > view.y1 + 2) continue;
      const av = this.pickupAvailable(p);
      if (av) out.push(p.picked ? Object.assign(p, { picked: false }) : p);
      else if (p.k === 'lavender' || p.k === 'sunflower') { p.picked = true; out.push(p); }
    }
    return out;
  }

  collectPickup(p) {
    const S = this.S;
    if (p.k === 'heartstone') {
      S.collected.hearts.push(p.id);
      this.inv.add('heartstone', 1);
      this.audio.play('heart');
      this.particles.hearts(p.x, p.y - 0.3, 8);
      this.ui.toast(`Ein Herzstein von Mert! (${S.collected.hearts.length}/5)`, 'heart', 'mint');
      this.quests.emit('heartstone');
      this.requestSave();
      return;
    }
    if (p.k === 'horseshoe') {
      S.collected.hs.push(p.id);
      this.audio.play('horseshoe');
      this.particles.sparkles(p.x, p.y, 14, 20, '#ffe39a');
      const n = S.collected.hs.length;
      this.ui.toast(`Goldenes Hufeisen! (${n}/30)`, 'horseshoe', 'gold');
      this.tutorial('shoe');
      this.horseshoeReward(n);
    } else {
      S.collected.pick[p.id] = S.time.day;
      const item = p.k;
      this.inv.add(item, 1);
      this.audio.play('pling');
      this.particles.text(p.x, p.y - 0.3, `+1 ${ITEMS[item].name}`);
      if (p.k === 'lavender' || p.k === 'sunflower' || p.k === 'poppy' || p.k === 'daisy') this.particles.add({ type: 'petal', x: p.x, y: p.y, z: 20, vz: 30, vx: 0.4, life: 1, color: p.k === 'lavender' ? '#b99af5' : p.k === 'poppy' ? '#ef4f5f' : p.k === 'sunflower' ? '#ffd23f' : '#fff' });
      this.tutorial('bag');
    }
    this.requestSave();
  }

  horseshoeReward(n) {
    const S = this.S;
    const rewards = { 10: ['saddle_glitzer', 'Glitzersattel'], 20: ['bow_regenbogen', 'Regenbogenschleifen'], 30: ['wreath_gold', 'Goldener Blütenkranz'] };
    if (rewards[n] && !S.hsRewards.includes(n)) {
      S.hsRewards.push(n);
      this.inv.unlock(rewards[n][0]);
      this.inv.addCoins(n * 5);
      this.pending.push(async () => {
        this.audio.play('fanfare');
        this.particles.confetti(this.player.x, this.player.y);
        await this.say([`${n} goldene Hufeisen! Als Belohnung bekommst du: ${rewards[n][1]} und ${n * 5} Münzen!`, n === 30 ? 'Du hast ALLE Hufeisen gefunden. Unglaublich! Du bist eine echte Schatzsucherin.' : 'Leg das Zubehör im Pferde-Menü (P) an.']);
      });
    }
  }

  autoCollect() {
    const P = this.player;
    for (const p of this.world.pickups) {
      if (p.k !== 'horseshoe' && p.k !== 'heartstone') continue;
      if (Math.abs(p.x - P.x) < 0.8 && Math.abs(p.y - P.y) < 0.8 && this.pickupAvailable(p)) this.collectPickup(p);
    }
  }

  treeShaken(id) { return this.S.collected.trees[id] === this.S.time.day; }

  shakeTree(tree) {
    const S = this.S;
    if (this.treeShaken(tree.id)) { this.ui.hint('Dieser Baum ist für heute leer geschüttelt. Morgen hängen neue Äpfel dran!'); return; }
    S.collected.trees[tree.id] = S.time.day;
    const n = 2 + Math.floor(Math.random() * 2);
    this.inv.add('apple', n);
    this.audio.play('shake');
    this.renderer.shake = 3;
    this.particles.leaves(tree.x + 0.5, tree.y + 0.8, 8);
    this.particles.text(tree.x + 0.5, tree.y + 0.3, `+${n} Äpfel`);
    this.tutorial('bag');
    this.requestSave();
  }

  // ---------- Interaktion ----------
  findInteraction() {
    const P = this.player, S = this.S, q = this.quests;
    const cands = [];
    const add = (d, label, fn, x, y, icon) => cands.push({ d, label, fn, x, y, icon });
    const fx = P.face === 'left' ? -0.5 : P.face === 'right' ? 0.5 : 0, fy = P.face === 'up' ? -0.5 : P.face === 'down' ? 0.5 : 0;
    const px = P.x + fx * 0.6, py = P.y + fy * 0.6;
    const near = (x, y, r) => { const d = dist(px, py, x, y); return d < r ? d : null; };
    let d;
    for (const n of this.npcs) if (n.visible && (d = near(n.x, n.y, 1.7)) !== null) add(d, 'Sprechen', () => this.talkTo(n.id), n.x, n.y - 1.6);
    if (!P.riding) {
      for (const h of this.horses) {
        if (h.mode === 'wild' && (d = near(h.x, h.y, 2.6)) !== null) {
          const it = this.inv.has('apple') ? 'Apfel anbieten' : this.inv.has('carrot') ? 'Karotte anbieten' : 'Hand hinhalten';
          add(d - 0.3, it, () => this.offerTame(h), h.x, h.y - 1.8);
        } else if ((h.mode === 'paddock' || h.mode === 'idle' || h.mode === 'follow') && (d = near(h.x, h.y, 1.9)) !== null) {
          add(d, 'Pflegen', () => this.openCare(h), h.x, h.y - (h.foal ? 1.2 : 1.8));
        }
      }
    }
    for (const a of this.animals) {
      if (!a.visible || a === this.kitten && S.flags.kitten !== 'home' && S.flags.kitten !== 'following') continue;
      const r = a.sp.water || a.sp.night || a.sp.flying ? 2.6 : 1.7;
      if ((d = near(a.x, a.y, r)) !== null) {
        if (a.sp.pet && a.mode === 'follow') d += 1.3; // Mira ist immer da – andere Dinge haben Vorrang
        if (a === this.pets?.mira) { add(S.flags.miraLost ? d - 0.8 : d, S.flags.miraLost ? 'Mira rufen' : 'Mira', () => this.petAnimal(a), a.x, a.y - 0.9); continue; }
        if (a === this.pets?.manni && q.step(QUEST_BY_ID.p_flamingo)?.ev === 'give_manni' && this.inv.has('flamingo')) { add(d - 0.8, 'Flamingo geben', () => Sc.giveManni(this), a.x, a.y - 0.9); continue; }
        const food = a.sp.food && this.inv.has(a.sp.food) && (a.sp.shy || a.species === 'alpaca' || a.species === 'duckling' || a.species === 'seal');
        add(d + 0.1, food ? `Füttern (${ITEMS[a.sp.food].name})` : a.sp.verb, () => this.petAnimal(a), a.x, a.y - 0.9);
      }
    }
    // Krümel suchen
    if (this.kitten.visible && !S.flags.kitten && (d = near(SPOTS.kitten.x, SPOTS.kitten.y, 2.4)) !== null) add(d - 0.5, 'Krümel rufen', () => this.findKitten(), SPOTS.kitten.x, SPOTS.kitten.y - 1);
    for (const p of this.world.pickups) {
      if (p.k === 'horseshoe' || p.k === 'heartstone') continue;
      if (Math.abs(p.x - px) > 1.3 || Math.abs(p.y - py) > 1.3) continue;
      if (!this.pickupAvailable(p)) continue;
      if ((d = near(p.x, p.y, 1.15)) !== null) add(d + 0.2, p.k === 'shell' ? 'Aufheben' : p.k === 'mushroom' ? 'Sammeln' : 'Pflücken', () => this.collectPickup(p), p.x, p.y - 0.8);
    }
    for (const t of this.world.appleTrees) if ((d = near(t.x + 0.5, t.y + 0.9, 1.6)) !== null) add(d + 0.3, 'Äpfel schütteln', () => this.shakeTree(t), t.x + 0.5, t.y - 1);
    // Beet vor den Füßen
    if (!P.riding) {
      const tx = Math.floor(px + fx * 0.5), ty = Math.floor(py + fy * 0.5 + 0.1);
      for (const [ax, ay] of [[tx, ty], [Math.floor(P.x), Math.floor(P.y)], [Math.floor(P.x), Math.floor(P.y - 0.7)]]) {
        const i = this.plotIndex(ax, ay);
        if (i >= 0) {
          const g = S.garden[i];
          const label = !g || !g.crop ? 'Säen' : g.growth >= 1 ? 'Ernten' : !(g.wet > 0) ? 'Gießen' : 'Wachstum ansehen';
          add(0.3, label, () => this.gardenAction(i), ax + 0.5, ay - 0.2);
          break;
        }
      }
    }
    // Schilder
    for (const s of this.world.signs) if ((d = near(s.x + 0.5, s.y + 1, 1.4)) !== null) add(d + 0.2, 'Lesen', () => this.readSign(s), s.x + 0.5, s.y - 1.2);
    // Türen
    const doors = [
      [FARM.house.door, S.farm.stable ? 'Schlafen' : 'Schlafen', () => this.sleepPrompt()],
      [FARM.stable.door, 'Stall', () => this.ui.open('stall')],
      ...VILLAGE.buildings.filter((b) => ['shop', 'bakery', 'tailor'].includes(b.type)).map((b) => [b.door, 'Einkaufen', () => this.ui.open('shop', { shop: 'theo', bakery: 'berta', tailor: 'luise' }[b.type])]),
    ];
    for (const [door, label, fn] of doors) if ((d = near(door.x, door.y, 1.3)) !== null) add(d + 0.1, label, fn, door.x, door.y - 1.6);
    // besondere Orte
    if (q.isActive('k3_picknick') && q.step(QUEST_BY_ID.k3_picknick)?.ev === 'picnic' && (d = near(SPOTS.picnic.x, SPOTS.picnic.y, 2.2)) !== null) add(d - 0.5, 'Picknick auspacken', () => this.picnic(), SPOTS.picnic.x, SPOTS.picnic.y - 1);
    if ((d = near(SPOTS.telescope.x, SPOTS.telescope.y, 1.6)) !== null) add(d, 'Durchs Fernrohr schauen', () => this.telescope(), SPOTS.telescope.x, SPOTS.telescope.y - 1.6);
    if ((d = near(SPOTS.parcoursBoard.x, SPOTS.parcoursBoard.y, 2)) !== null) add(d, 'Parcours starten', () => this.startParcours(), SPOTS.parcoursBoard.x, SPOTS.parcoursBoard.y - 2);
    if ((d = near(VILLAGE.plaza.x + 0.5, VILLAGE.plaza.y + 1.6, 1.6)) !== null) add(d + 0.4, 'Münze in den Brunnen werfen', () => this.wishWell(), VILLAGE.plaza.x + 0.5, VILLAGE.plaza.y - 1);
    const stepOf = (id) => (q.isActive(id) ? q.step(QUEST_BY_ID[id]) : null);
    const letterStep = stepOf('h_brief');
    if ((d = near(66.5, 88.3, 1.3)) !== null) add(d - (letterStep?.ev === 'read_letter' ? 0.5 : 0), letterStep?.ev === 'read_letter' ? 'Rosa Brief lesen' : 'Briefkasten öffnen', () => this.mailbox(), 66.5, 86.6);
    if (letterStep?.ev === 'dock_date' && (d = near(SPOTS.dock.x, SPOTS.dock.y, 2.4)) !== null) add(d - 0.5, 'Mert treffen', () => Sc.dockDate(this), SPOTS.dock.x, SPOTS.dock.y - 1.5);
    if (stepOf('p_maumau')?.ev === 'kittens' && (d = near(SPOTS.kittens.x, SPOTS.kittens.y, 1.8)) !== null) add(d - 0.5, 'Im Heu nachsehen', () => Sc.kittenScene(this), SPOTS.kittens.x, SPOTS.kittens.y - 1.2);
    if (stepOf('p_flamingo')?.ev === 'find_flamingo' && (d = near(SPOTS.nest.x, SPOTS.nest.y, 2)) !== null) add(d - 0.5, 'Elsternnest untersuchen', () => Sc.findFlamingo(this), SPOTS.nest.x, SPOTS.nest.y - 1.2);
    if (stepOf('p_show')?.ev === 'dog_show' && (d = near(SPOTS.show.x, SPOTS.show.y, 2.2)) !== null) add(d - 0.5, 'Hundeshow starten', () => Sc.dogShow(this), SPOTS.show.x, SPOTS.show.y - 1.2);
    if (stepOf('s_sterne')?.ev === 'stargaze' && (d = near(SPOTS.hillTop.x, SPOTS.hillTop.y, 2.4)) !== null) add(d - 0.5, 'Mit Mert Sterne gucken', () => Sc.stargaze(this), SPOTS.hillTop.x, SPOTS.hillTop.y - 1.4);
    if (S.farm.gazebo && (d = near(SPOTS.gazebo.x, SPOTS.gazebo.y - 0.2, 1.8)) !== null) add(d + 0.2, 'Schaukeln', () => this.swing(), SPOTS.gazebo.x, SPOTS.gazebo.y - 3);
    if (!cands.length) return null;
    cands.sort((a, b) => a.d - b.d);
    return cands[0];
  }

  interact() {
    const f = this.focus;
    if (!f) return;
    this.audio.init();
    f.fn();
  }

  clickWorld() {
    // Klick auf etwas in der Nähe → benutzen, sonst laufen (Maus gedrückt halten)
    const inp = this.input;
    const w = this.renderer.screenToWorld(inp.mouse.x, inp.mouse.y);
    if (this.focus && dist(w.x, w.y, this.focus.x, this.focus.y + 1) < 1.6) { this.interact(); this.input.mouse.down = false; }
  }

  drawWorldOverlay(ctx, t, view) {
    if (this.race) this.race.drawWorld(ctx, t);
    if (this.build) this.drawBuild(ctx, t);
    const P = this.player;
    // Richtungspfeil zum Ziel
    const tg = this.currentTarget();
    if (tg && !this.cutscene && this.state === 'play' && !this.race) {
      const d = dist(P.x, P.y, tg.x, tg.y);
      if (d > 3) {
        const a = Math.atan2(tg.y - P.y, tg.x - P.x);
        const cx = P.x * T, cy = (P.y - 0.7) * T;
        const r = 62 + Math.sin(t * 4) * 4;
        ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -12); ctx.lineTo(-3, 0); ctx.lineTo(-8, 12); ctx.closePath();
        ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }
      if (tg.x > view.x0 && tg.x < view.x1 && tg.y > view.y0 && tg.y < view.y1 && d > 1.5) {
        ctx.save(); ctx.translate(tg.x * T, (tg.y - 2.2) * T + Math.sin(t * 4) * 6);
        ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
        star(ctx, 0, 0, 13); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    }
    // Interaktions-Hinweis
    const f = this.focus;
    if (f && !this.dialog.open) {
      const x = f.x * T, y = f.y * T - 8 + Math.sin(t * 5) * 2;
      ctx.font = `700 15px ${FONT}`;
      const tw = ctx.measureText(f.label).width;
      const w = tw + 46;
      ctx.save();
      rr(ctx, x - w / 2, y - 32, w, 30, 15);
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
      ctx.strokeStyle = '#ffb3cf'; ctx.lineWidth = 3; ctx.stroke();
      rr(ctx, x - w / 2 + 5, y - 28, 24, 22, 8); ctx.fillStyle = '#ff7eb6'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('E', x - w / 2 + 17, y - 16);
      ctx.fillStyle = '#5b3f55'; ctx.textAlign = 'left';
      ctx.fillText(f.label, x - w / 2 + 35, y - 16);
      ctx.restore();
    }
    // Eilpost-Uhr über dem Kopf
    if (this.postTimer) {
      ctx.font = `700 14px ${FONT}`; ctx.textAlign = 'center';
      const s = Math.max(0, 90 - this.postTimer.t);
      outlinedText(ctx, s > 0 ? `Eilpost: ${Math.ceil(s)} s` : 'Eilpost', P.x * T, (P.y - 2.1) * T, s > 0 ? '#ffd23f' : '#fff', '#7a4a6a', 4);
    }
  }

  currentTarget() {
    const q = this.trackedQuest();
    if (q) { const p = this.questTargetPos(q); if (p) return p; }
    const wp = this.S.flags.waypoint;
    if (wp) {
      if (dist(wp.x, wp.y, this.player.x, this.player.y) < 2.5) { this.S.flags.waypoint = null; return null; }
      return wp;
    }
    return null;
  }

  trackedQuest() {
    const id = this.S.tracked;
    if (id && this.quests.isActive(id)) return QUEST_BY_ID[id];
    const a = this.quests.active();
    return a.find((x) => x.main) || a[0] || null;
  }

  questTargetPos(q) {
    const tg = this.quests.stepTarget(q);
    if (!tg) return null;
    if (tg.npc) { const n = this.npcById(tg.npc); return n ? { x: n.x, y: n.y } : null; }
    if (tg.npcAll) {
      const st = this.quests.st(q.id);
      const step = this.quests.step(q);
      const left = step.npcs.filter((n) => !st.got.includes(n)).map((id) => this.npcById(id));
      left.sort((a, b) => dist(a.x, a.y, this.player.x, this.player.y) - dist(b.x, b.y, this.player.x, this.player.y));
      return left[0] ? { x: left[0].x, y: left[0].y } : null;
    }
    if (tg.spot === 'garden') return { x: 95, y: 84 };
    if (tg.spot === 'kitten') return SPOTS.kitten;
    if (tg.spot === 'picnic') return SPOTS.picnic;
    if (tg.spot === 'telescope') return SPOTS.telescope;
    if (tg.spot === 'parcours') return SPOTS.parcoursBoard;
    if (tg.spot === 'lookout') return SPOTS.lookout;
    if (tg.spot === 'hill') return SPOTS.hillTop;
    if (tg.spot && SPOTS[tg.spot]) return SPOTS[tg.spot];
    if (tg.pet) { const a = this.pets?.[tg.pet]; return a ? { x: a.x, y: a.y } : null; }
    if (tg.heart) {
      const hs = this.world.pickups.filter((p) => p.k === 'heartstone' && !this.S.collected.hearts.includes(p.id));
      hs.sort((a, b) => dist(a.x, a.y, this.player.x, this.player.y) - dist(b.x, b.y, this.player.x, this.player.y));
      return hs[0] ? { x: hs[0].x, y: hs[0].y } : null;
    }
    if (tg.horse === 'riding') { if (this.player.riding) return null; const h = this.horseEntity(this.S.ridingHorse); return h ? { x: h.x, y: h.y } : null; }
    if (tg.wild === 'nearest') {
      const w = this.horses.filter((h) => h.mode === 'wild');
      w.sort((a, b) => dist(a.x, a.y, this.player.x, this.player.y) - dist(b.x, b.y, this.player.x, this.player.y));
      const k = w.find((h) => h.id === 'kleeblatt') || w[0];
      return k ? { x: k.x, y: k.y } : null;
    }
    if (tg.wildId) { const h = this.horseEntity(tg.wildId); return h && h.mode === 'wild' ? { x: h.x, y: h.y } : null; }
    if (tg.x !== undefined) return { x: tg.x, y: tg.y };
    return null;
  }

  // ---------- Gespräche ----------
  async talkTo(id) {
    const n = this.npcById(id);
    const act = this.quests.talk(id);
    n?.say?.('');
    if (act && act.kind === 'race') { await this.raceOffer(id, act.race); return; }
    if (act && (act.kind === 'quest' || act.kind === 'ending')) {
      await this.say(act.lines, id);
      act.run?.();
      this.requestSave();
      if (act.kind === 'ending') this.pending.push(() => runEnding(this));
      if (act.after === 'party') this.pending.push(() => Sc.partyScene(this));
      if (act.after === 'kissHeart') this.pending.push(() => Sc.mertHug(this, 'kiss'));
      return;
    }
    if (act && act.kind === 'offer') {
      await this.say(act.lines, id);
      const c = await this.ask('Hilfst du?', ['Klar, mach ich!', 'Vielleicht später'], id);
      if (c === 0) { act.run(); this.audio.play('quest'); }
      else await this.say(['Kein Problem. Komm einfach wieder, wenn du Zeit hast!'], id);
      return;
    }
    if (act && (act.kind === 'missing' || act.kind === 'wait')) {
      await this.say(act.lines, id);
      await this.ambientMenu(id, true);
      return;
    }
    await this.ambientMenu(id);
  }

  async ambientMenu(id, short = false) {
    const npc = NPCS[id];
    const opts = [];
    if (npc.shop) opts.push(['Einkaufen', () => this.ui.open('shop', npc.shop)]);
    if (!short) opts.push(['Plaudern', () => this.chat(id)]);
    if (id === 'mert') { opts.push(['Umarmen', () => Sc.mertHug(this, 'hug')]); opts.push(['Küsschen geben', () => Sc.mertHug(this, 'kiss')]); }
    opts.push(['Etwas schenken', () => this.ui.open('gift', id)]);
    if (id === 'hilde' && this.quests.isDone('k4_fest') && !this.S.ending.done) opts.unshift(['Das Sommerfest beginnen!', () => { this.pending.push(() => runEnding(this)); }]);
    if ((id === 'mia' || id === 'ben')) {
      const races = [];
      if (this.quests.isDone('k2_rennen1') && id === 'ben') races.push('race1');
      if (this.quests.isDone('k3_rennen2') && id === 'mia') races.push('race2');
      if (this.quests.isDone('k4_rennen3') && id === 'mia') races.push('race3');
      for (const r of races) opts.push([`Revanche: ${RACES[r].name}`, () => this.raceOffer(id, r, true)]);
    }
    if (id === 'hilde' && this.S.ending.done) opts.push(['Das Fest nochmal erleben', () => this.replayFireworks()]);
    opts.push(['Tschüss!', () => {}]);
    const greet = short ? 'Kann ich sonst noch etwas für dich tun?' : this.greeting(id);
    const c = await this.ask(greet, opts.map((o) => o[0]), id);
    await opts[c][1]();
  }

  greeting(id) {
    const h = this.S.time.minutes / 60;
    const tod = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
    const g = { hilde: `${tod}, mein Schatz!`, mert: 'Hey {name}! Na, alles gut bei dir?', theo: 'Hm-hm. Was darf’s sein?', berta: `${tod}, {name}! Frisch gebacken ist alles!`, luise: 'Wie entzückend, dich zu sehen!', paula: 'Zack, zack – was gibt’s?', mia: 'Hey {name}! Na, wie geht’s {horse}?', ben: 'Oh, h-hallo {name}!', kuno: 'Ahoi, {name}!' };
    return g[id] || `${tod}!`;
  }

  async chat(id) {
    const ch = Math.min(3, this.quests.chapter() - 1);
    const lines = NPCS[id].lines[ch] || NPCS[id].lines[0];
    await this.say([pick(lines)], id);
  }

  async giveGift(id, item) {
    const S = this.S, npc = NPCS[id];
    if (!this.inv.remove(item, 1)) return;
    S.stats.gifts++;
    const loved = npc.loves.includes(item), liked = npc.likes.includes(item);
    const n = this.npcById(id);
    this.particles.hearts(n.x, n.y - 0.5, loved ? 6 : liked ? 3 : 1);
    this.audio.play('heart');
    const react = loved ? `${npc.thanks} ${itemName(item)} mag ich ganz besonders!` : liked ? `Oh, ${itemName(item)}! Danke, {name}!` : 'Oh, danke! Wie aufmerksam von dir.';
    const lines = [react];
    if ((loved || liked) && S.npcGift[id] !== S.time.day) {
      S.npcGift[id] = S.time.day;
      const gb = npc.giftBack;
      if (gb.coins) { this.inv.addCoins(gb.coins); lines.push(`Hier, nimm ${gb.coins} Münzen als kleines Dankeschön.`); }
      else if (gb.item) { this.inv.add(gb.item, gb.n); lines.push(`Und das hier ist für dich: ${gb.n} ${itemName(gb.item, gb.n)}.`); }
    }
    await this.say(lines, id);
    this.requestSave();
  }

  readSign(s) {
    const txt = s.lines.map(([a, n]) => `${a} ${n}`).join('   ·   ');
    this.say([{ who: 'narr', t: `Auf dem Wegweiser steht: ${txt}` }]);
  }

  // ---------- Pferde ----------
  toggleRide() {
    const P = this.player;
    this.audio.init();
    if (this.race && this.race.active && this.race.phase !== 'done') { this.ui.hint('Während des Rennens bleibst du im Sattel!'); return; }
    if (P.riding) {
      if (!P.dismount()) { this.ui.hint('Hier kannst du nicht absteigen – das Wasser ist zu tief oder ein Zaun ist im Weg.'); return; }
      this.audio.play('land');
      this.rebuildEntities();
      return;
    }
    // Pferd in der Nähe?
    const own = this.horses.filter((h) => (h.mode === 'idle' || h.mode === 'paddock' || h.mode === 'called') && !h.foal);
    own.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y));
    const h = own[0];
    if (h && dist(h.x, h.y, P.x, P.y) < 2.4) {
      if (h.mode === 'paddock' && h.id !== this.S.ridingHorse) this.selectRidingHorse(h.id, true);
      P.mount(h);
      this.audio.play('neigh', { pitch: 1 + (h.id.length % 3) * 0.05 });
      this.particles.dust(P.x, P.y, 4);
      this.rebuildEntities();
      this.tutorial('gallop');
      this.requestSave();
      return;
    }
    // Reitpferd herbeipfeifen
    const rh = this.horseEntity(this.S.ridingHorse);
    if (!rh) { this.ui.hint('Du hast noch kein Pferd zum Reiten.'); return; }
    this.audio.play('whistle');
    const d = dist(rh.x, rh.y, P.x, P.y);
    if (d > 10 || rh.mode === 'paddock') {
      // hinter der Spielerin auftauchen
      let spot = null;
      for (const r of [5, 4, 3, 2]) for (let a = 0; a < 12 && !spot; a++) {
        const ang = (a / 12) * Math.PI * 2;
        const x = P.x + Math.cos(ang) * r, y = P.y + Math.sin(ang) * r;
        if (this.world.canStand(x, y, {}, 0.35, 0.2)) spot = { x, y };
      }
      spot = spot || { x: P.x + 1, y: P.y };
      rh.x = spot.x; rh.y = spot.y;
    }
    rh.mode = 'called';
    this.later(0.4, () => this.audio.play('neigh'));
    this.ui.toast(`${rh.rec.name} kommt angetrabt!`, 'whistle');
  }

  selectRidingHorse(id, silent = false) {
    const S = this.S;
    const old = this.horseEntity(S.ridingHorse);
    if (this.player.riding && S.ridingHorse !== id) { this.ui.hint('Steig erst ab, um das Reitpferd zu wechseln.'); return; }
    if (old && old.id !== id && old.mode !== 'ridden') {
      old.mode = 'paddock';
      const P = this.world.paddock;
      old.x = P.x + 2 + Math.random() * (P.w - 4); old.y = P.y + 2 + Math.random() * (P.h - 4);
      old.rec.place = 'paddock';
    }
    S.ridingHorse = id;
    const h = this.horseEntity(id);
    if (h && h.mode === 'paddock' && !silent) { h.mode = 'idle'; }
    if (h) h.rec.place = 'world';
    if (!silent) { this.audio.play('neigh'); this.ui.toast(`${h?.rec.name} ist jetzt dein Reitpferd!`, 'horse'); }
    this.requestSave();
  }

  openCare(h) {
    this.tutorial('ride');
    this.ui.open('care', h.id);
  }

  careAction(rec, kind, arg) {
    const S = this.S;
    const before = friendLevel(rec.pts);
    let gain = 0, msg = '';
    const now = S.stats.playSeconds;
    const ent = this.horseEntity(rec.id);
    if (kind === 'pet') {
      gain = now - (rec.lastPet || -99) > 12 ? 3 : 0;
      rec.lastPet = now;
      msg = gain ? `${rec.name} schnaubt glücklich und stupst dich an. ♥` : `${rec.name} genießt das Streicheln.`;
      this.audio.play('heart');
      this.quests.emit('pet_horse');
      S.stats.petted++;
    } else if (kind === 'feed') {
      if (!this.inv.remove(arg, 1)) return 'Davon hast du gerade nichts.';
      gain = HORSE_FOOD[arg] || 2;
      msg = { apple: `Knack! ${rec.name} liebt Äpfel.`, carrot: `Mampf! ${rec.name} knuspert die Karotte.`, hay: `${rec.name} kaut zufrieden auf dem Heu.` }[arg];
      this.audio.play('pop');
      this.quests.emit('feed_horse');
    } else if (kind === 'groom') {
      gain = rec.lastGroom === S.time.day ? 3 : 10;
      rec.lastGroom = S.time.day;
      msg = `${rec.name} glänzt wie neu! Sieh nur, wie das Fell schimmert.`;
      this.audio.play('levelup');
      this.quests.emit('groom');
    } else if (kind === 'trick') {
      gain = 1;
      if (ent) ent.doTrick(arg);
      this.audio.play('neigh');
    }
    rec.pts += gain;
    if (ent) { ent.hearts = 2; this.particles.hearts(ent.x, ent.y - 0.6, 3); }
    const after = friendLevel(rec.pts);
    if (after > before) {
      msg += ` Freundschaft Level ${after}!`;
      this.audio.play('levelup');
      this.ui.toast(`${rec.name}: Freundschaft Level ${after}! ♥`, 'heart');
      const tr = { 2: 'Wiehern', 3: 'Steigen', 4: 'Pirouette', 5: 'Verbeugen' }[after];
      if (tr) this.ui.toast(`Neuer Trick: ${tr} (Taste F)`, 'trick', 'mint');
    }
    this.quests.checkPassive();
    this.requestSave();
    return msg;
  }

  doTrick() {
    const P = this.player;
    let h = P.riding ? P.horse : null;
    if (!h) {
      const own = this.horses.filter((x) => x.mode === 'idle' || x.mode === 'paddock');
      own.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y));
      if (own[0] && dist(own[0].x, own[0].y, P.x, P.y) < 3) h = own[0];
    }
    if (!h) return;
    const lv = friendLevel(h.rec.pts);
    const list = [lv >= 2 && 'neigh', lv >= 3 && 'rear', lv >= 4 && 'spin', lv >= 5 && 'bow'].filter(Boolean);
    if (!list.length) { this.ui.hint(`${h.rec.name} lernt Tricks ab Freundschaftslevel 2. Pflegen, füttern und reiten hilft!`); return; }
    const k = (this._trickI = ((this._trickI || 0) + 1) % list.length);
    const tr = list[k];
    if (tr === 'neigh') { this.audio.play('neigh'); this.particles.notes(h.x, h.y - 1); }
    else { h.doTrick(tr); this.audio.play('neigh'); this.particles.hearts(h.x, h.y - 1, 2); }
    if (P.riding && tr === 'spin') P.faceX *= -1;
  }

  async offerTame(h) {
    const P = this.player;
    if (!h.tame) h.tame = newTameState();
    const d = dist(h.x, h.y, P.x, P.y);
    const item = this.inv.has('apple') ? 'apple' : this.inv.has('carrot') ? 'carrot' : null;
    const r = tameOffer(h.tame, h.rec.personality, item, d);
    h.saveTame(this.S);
    const name = h.rec.name;
    if (r === 'far') this.ui.hint(`Geh noch ein kleines Stück näher an ${name} heran – ganz langsam.`);
    else if (r === 'nervous' || r === 'away') { this.ui.hint(`${name} ist gerade zu nervös. Bleib ruhig stehen, bis das <b>!</b> verschwindet.`); this.audio.play('sad'); }
    else if (r === 'wait') this.ui.hint(`${name} schnuppert noch an deiner Hand … gib ihm einen Moment.`);
    else {
      if (item) { this.inv.remove(item, 1); this.audio.play('pop'); }
      this.particles.hearts(h.x, h.y - 1, item ? 3 : 1);
      if (r === 'tamed') await this.tameHorse(h);
      else this.ui.hint(item ? `${name} frisst dir vorsichtig aus der Hand. Das Vertrauen wächst! ♥` : `${name} schnuppert an deiner Hand. Mit Äpfeln oder Karotten geht es schneller.`, 4);
    }
    this.requestSave();
  }

  async tameHorse(h) {
    const S = this.S;
    const def = wildDef(h.id);
    this.audio.play('neigh');
    this.audio.play('fanfare');
    this.particles.confetti(h.x, h.y - 0.5, 30);
    this.particles.hearts(h.x, h.y - 1, 8);
    h.mode = 'scene';
    const first = S.stats.tamed === 0;
    await this.say([{ who: 'narr', t: `${def.name} legt den Kopf an deine Schulter. Es vertraut dir jetzt! ♥` }]);
    const nm = await this.screens.askName(`Wie soll dein neues Pferd heißen?`, def.name, h.rec);
    const rec = makeHorseRecord({ id: def.id, name: nm || def.name, coat: def.coat, mane: def.mane, marking: def.marking, socks: def.socks, personality: def.personality });
    S.horses.push(rec);
    delete S.wild[def.id];
    S.stats.tamed++;
    if (first) S.memories.push({ type: 'tame', day: S.time.day, horse: rec.id });
    if (def.id === 'nebel') S.memories.push({ type: 'nebel', day: S.time.day, horse: rec.id });
    h.rec = rec;
    h.tame = null;
    await this.say([{ who: 'narr', t: `${rec.name} trabt fröhlich los – zu deinem Hof! Du findest ${rec.name} auf der Koppel.` }]);
    // sanft verschwinden und auf der Koppel auftauchen
    this.particles.sparkles(h.x, h.y, 16);
    const P = this.world.paddock;
    h.x = P.x + 2 + Math.random() * (P.w - 4); h.y = P.y + 2 + Math.random() * (P.h - 4);
    h.mode = 'paddock';
    this.quests.emit('tame');
    this.quests.checkPassive();
    this.ui.toast(`${rec.name} lebt jetzt auf deinem Hof! (${S.horses.filter((x) => !x.foal).length} Pferde)`, 'horse', 'mint');
    this.saveNow();
  }

  onWildFled(h) {
    if (!this._fledHintT || this.t - this._fledHintT > 20) {
      this._fledHintT = this.t;
      this.ui.hint(`${h.rec.name} hat sich erschreckt! Nicht rennen und nicht reiten – nähere dich langsam und bleib stehen, wenn es nervös wird.`);
    }
  }

  // ---------- Tiere ----------
  petAnimal(a, direct = false) {
    const S = this.S;
    if (a === this.pets?.mira && !direct) {
      if (S.flags.miraLost) { this.pending.push(() => Sc.findMira(this)); return; }
      this.pending.push(() => Sc.miraMenu(this));
      return;
    }
    const fed = a.interact(this);
    if (a.species === 'butterfly') this.particles.sparkles(a.x, a.y, 6, 30, '#ffd6ec');
    if (a.sp.pet) {
      const lines = {
        maumau: ['Maumau schnurrt wie ein kleiner Traktor und drückt ihr Köpfchen in deine Hand.', 'Maumau blinzelt dich langsam an. Das ist ein Katzenkuss!', 'Maumau rollt sich auf den Rücken – aber Achtung, der Bauch ist Sperrgebiet!'],
        manni: ['Manni lässt sich plumpsen und schnurrt tief und zufrieden.', 'Manni stupst dich mit der Nase an. Ob er ein Leckerli will?', 'Manni putzt sich stolz das Flauschfell. Er ist schließlich der Schönste.'],
        mira: ['Mira wedelt so doll mit dem Schwanz, dass sie fast umfällt!', 'Mira leckt dir die Hand und bellt fröhlich: Wuff!', 'Mira macht Männchen. Wer ist ein braves Mädchen? Mira!'],
      }[a.species];
      if (lines) this.ui.hint(pick(lines), 4);
    }
    const key = a.sp.pet ? a.sp.albumAs : a.species;
    if (key && !S.album[key]) {
      const reg = this.regionName(this.world.regionAt(a.x, a.y));
      S.album[key] = { day: S.time.day, where: reg };
      this.audio.play('pling');
      this.ui.toast(`Neu im Tieralbum: ${SPECIES[key].name}! (${Object.keys(S.album).length}/14)`, iconFor(key), 'mint');
      this.tutorial('album');
      this.quests.checkPassive();
      if (Object.keys(S.album).length >= 14 && !S.albumRewarded) {
        S.albumRewarded = true;
        this.inv.unlock('wreath_gold');
        this.inv.unlock('hat_flower');
        this.inv.addCoins(100);
        S.memories.push({ type: 'album', day: S.time.day });
        this.pending.push(async () => {
          this.audio.play('fanfare');
          this.particles.confetti(this.player.x, this.player.y, 60);
          await this.say(['Dein Tieralbum ist vollständig! Alle 14 Tierarten!', 'Belohnung: der Goldene Blütenkranz für dein Pferd, ein Blütenhaarreif für dich und 100 Münzen!']);
        });
      }
    } else if (fed && SPECIES[a.species]) this.ui.hint(`${SPECIES[a.species].name} hat dir aus der Hand gefressen! ♥`, 3);
    this.requestSave();
  }

  findKitten() {
    const S = this.S;
    S.flags.kitten = 'following';
    this.kitten.visible = true;
    this.kitten.mode = 'follow';
    this.audio.play('purr');
    this.particles.hearts(this.kitten.x, this.kitten.y - 0.5, 5);
    this.quests.emit('find_kitten');
    this.pending.push(async () => {
      await this.say([{ who: 'narr', t: 'Miau! Aus dem hohlen Baumstamm krabbelt ein kleines, staubiges Kätzchen.' }, { who: 'narr', t: 'Krümel kuschelt sich an dich und schnurrt. Sie folgt dir jetzt – bring sie zu Berta!' }]);
    });
    if (!S.album.cat) this.petAnimal(this.kitten);
    this.requestSave();
  }

  checkKitten() {
    const S = this.S;
    const q = this.quests.st('k1_kruemel');
    if (S.flags.kitten === 'following' && q && q.state === 'done') {
      S.flags.kitten = 'home';
      this.kittenState();
    } else if (!S.flags.kitten) {
      const searching = q && q.state === 'active' && q.step === 1;
      this.kitten.visible = !!searching;
    }
  }

  // Mira bellt aus ihrem Versteck – je näher, desto lauter
  miraBark(dt) {
    this._barkT = (this._barkT || 0) - dt;
    if (this._barkT > 0) return;
    const d = dist(this.player.x, this.player.y, SPOTS.miraHide.x, SPOTS.miraHide.y);
    this._barkT = d < 25 ? 2.2 : 5;
    if (d < 30) {
      this.audio.play('bark');
      const m = this.pets.mira;
      this.particles.add({ type: 'text', x: m.x, y: m.y - 0.8, z: 30, vz: 20, life: 1.2, text: 'Wuff!', color: '#fff' });
      if (d > 6 && !this._barkHint) { this._barkHint = true; this.ui.hint('Da! Ein Bellen aus Richtung der Sonnenblumen – das ist Mira!', 4); }
    }
  }

  // Mira schnüffelt versteckte Hufeisen auf
  miraSniff(dt) {
    this.sniffT -= dt;
    if (this.sniffT > 0) return;
    this.sniffT = 1.5;
    const m = this.pets?.mira, P = this.player;
    if (!m || m.mode !== 'follow') return;
    let best = null, bd = 6.5;
    for (const p of this.world.pickups) {
      if (p.k !== 'horseshoe' || !this.pickupAvailable(p) || this.sniffed.has(p.id)) continue;
      const d = dist(p.x, p.y, P.x, P.y);
      if (d < bd) { bd = d; best = p; }
    }
    if (!best) {
      if (Math.random() < 0.04) { this.audio.play('bark'); this.particles.notes(m.x, m.y - 0.6); }
      return;
    }
    this.sniffed.add(best.id);
    m.state = 'happy'; m.stateT = 2.5;
    this.audio.play('bark');
    this.particles.add({ type: 'text', x: m.x, y: m.y - 0.8, z: 30, vz: 20, life: 1.6, text: '!', color: '#ffd23f' });
    const dir = Math.abs(best.x - P.x) > Math.abs(best.y - P.y) ? (best.x > P.x ? 'Osten' : 'Westen') : best.y > P.y ? 'Süden' : 'Norden';
    this.ui.hint(`Mira schnüffelt aufgeregt und zieht Richtung ${dir} – hier ist bestimmt ein goldenes Hufeisen versteckt!`, 5);
  }

  // ---------- Besondere Orte ----------
  async sleepPrompt() {
    const h = this.S.time.minutes / 60;
    const c = await this.ask(h >= 18 || h < 5 ? 'Es ist schon spät. Möchtest du schlafen gehen?' : 'Möchtest du ein Nickerchen bis zum nächsten Morgen machen?', ['Ja, schlafen bis zum Morgen', 'Nein, noch nicht'], 'narr');
    if (c !== 0) return;
    await this.say([{ who: 'mert', t: pick(['Gute Nacht, {name}. Träum was Schönes. Am besten von mir. ♥', 'Schlaf gut! Ich pass auf, dass Maumau dir nicht wieder aufs Gesicht legt.', 'Gute Nacht, meine Liebe. Mira hat schon deine Hälfte vom Bett erobert.']) }]);
    this.cutscene = true;
    await this.fade(true);
    const S = this.S;
    const hoursLeft = ((24 * 60 - S.time.minutes) + 7 * 60) / 60;
    this.growCrops(hoursLeft, false);
    S.time.day++;
    S.time.minutes = 7 * 60;
    S.weather.kind = 'sun'; S.weather.until = S.time.day * 1440 + 11 * 60;
    this.player.x = FARM.house.door.x; this.player.y = FARM.house.door.y + 0.8;
    this.player.face = 'down';
    this.renderer.follow(this.player.x, this.player.y, 0, true);
    this.updateLighting();
    await this.wait(0.4);
    await this.fade(false);
    this.cutscene = false;
    this.ui.banner('Guten Morgen!', `Tag ${S.time.day}`);
    this.audio.play('bird');
    this.particles.hearts(this.player.x, this.player.y - 0.6, 4);
    this.ui.hint(pick(['Mert hat dir einen Zettel hingelegt: „Guten Morgen, Schlafmütze! Kaffee steht in der Küche. Kuss!“ ♥', 'Mira springt aufs Bett und schleckt dich wach. Guten Morgen!', 'Mert gibt dir einen Guten-Morgen-Kuss und verschwindet summend in den Stall.']), 6);
    this.saveNow();
  }

  async telescope() {
    this.cutscene = true;
    this.camOverride = { x: this.player.x, y: this.player.y };
    const pan = async (x, y, sec) => {
      const sx = this.camOverride.x, sy = this.camOverride.y;
      const t0 = this.t;
      while (this.t - t0 < sec) {
        const k = Math.min(1, (this.t - t0) / sec);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        this.camOverride = { x: sx + (x - sx) * e, y: sy + (y - sy) * e };
        await this.wait(0);
      }
    };
    await this.say([{ who: 'narr', t: 'Du schaust durch das alte Messing-Fernrohr …' }]);
    await pan(165, 158, 2.5);
    await this.say([{ who: 'narr', t: 'Da hinten steht der Leuchtturm! Und das Meer glitzert bis zum Horizont.' }]);
    await pan(84, 94, 2.5);
    await this.say([{ who: 'narr', t: `Und da … ${genitive(this.S.player.name)} Ponyhof! Von hier oben sieht er aus wie ein kleines Bilderbuch.` }]);
    await pan(this.player.x, this.player.y - 0.6, 1.5);
    this.camOverride = null;
    this.cutscene = false;
    this.quests.emit('telescope');
    this.S.flags.telescope = true;
    this.requestSave();
  }

  async wishWell() {
    if (!this.inv.spend(1)) { this.ui.hint('Du brauchst eine Münze, um dir etwas zu wünschen.'); return; }
    this.audio.play('splash');
    this.particles.splash(VILLAGE.plaza.x + 0.5, VILLAGE.plaza.y + 0.5, 10);
    this.particles.sparkles(VILLAGE.plaza.x + 0.5, VILLAGE.plaza.y, 8);
    const wishes = ['Du wünschst dir etwas ganz Geheimes … ♥', 'Plitsch! Die Münze funkelt am Brunnenboden.', 'Man sagt, wer hier wünscht, findet bald ein goldenes Hufeisen …', 'Der Brunnen gluckert fröhlich zurück.'];
    this.ui.hint(pick(wishes), 4);
  }

  async mailbox() {
    const S = this.S;
    const hb = this.quests.step(QUEST_BY_ID.h_brief);
    if (hb && hb.ev === 'read_letter') { await Sc.readLetter(this); return; }
    const tips = [
      'Ein Brief von Oma Hilde: „Regen gießt deinen Garten. Und nach dem Regen kommt oft ein Regenbogen!“',
      'Eine Postkarte von Paula: „Vom Aussichtspunkt in den Wolkenbergen sieht man die ganze Gegend!“',
      'Ein Zettel von Ben: „Eulen gibt es nur nachts im Flüsterwald. Psst!“',
      'Ein Brief von Mia: „Pferde springen automatisch über niedrige Zäune – oder mit der Leertaste!“',
      'Eine Karte von Kuno: „Robben lieben Muscheln. Wirklich!“',
      'Ein Rezept von Berta: „Pilzsuppe mit viel Liebe. Pilze wachsen an den Waldwegen.“',
      'Ein Brief von Luise: „Mit dem Zubehör aus Theos Laden sieht dein Pferd zauberhaft aus!“',
    ];
    const i = (S.time.day + (S.flags.mailI || 0)) % tips.length;
    S.flags.mailI = (S.flags.mailI || 0) + 1;
    await this.say([{ who: 'narr', t: tips[i] }]);
  }

  async picnic() {
    const need = { apple: 2, carrot: 2, bread: 1, juice: 1 };
    if (!this.inv.hasAll(need)) {
      const miss = Object.entries(need).filter(([id, n]) => !this.inv.has(id, n)).map(([id, n]) => `${n - this.inv.count(id)} ${itemName(id, n - this.inv.count(id))}`);
      await this.say([{ who: 'narr', t: `Für das Picknick fehlt noch: ${miss.join(', ')}.` }, { who: 'narr', t: 'Äpfel wachsen an Bäumen, Karotten im Garten, Brot und Saft gibt es bei Berta oder Theo.' }]);
      return;
    }
    this.inv.removeAll(need);
    this.cutscene = true;
    await this.fade(true);
    const P = this.player;
    // Gäste auf die Insel holen
    const guests = ['hilde', 'berta'].map((id) => this.npcById(id));
    const pos = [[SPOTS.picnic.x - 1.4, SPOTS.picnic.y + 0.3], [SPOTS.picnic.x + 1.4, SPOTS.picnic.y + 0.4]];
    const saved = guests.map((n) => ({ x: n.x, y: n.y }));
    guests.forEach((n, i) => { n.x = pos[i][0]; n.y = pos[i][1]; n.mode = 'scene'; });
    this.S.flags.picnicShow = true;
    this.sceneEntities = [new PicnicBlanket(SPOTS.picnic.x, SPOTS.picnic.y + 0.2)];
    this.rebuildEntities();
    this.camOverride = { x: SPOTS.picnic.x, y: SPOTS.picnic.y - 0.5 };
    await this.fade(false);
    this.audio.play('quest');
    await this.say([
      { who: 'berta', t: 'Da bist du ja! Oh, wie schön du alles mitgebracht hast!' },
      { who: 'hilde', t: 'Genau hier haben Berta und ich als Mädchen gesessen und Pläne geschmiedet.' },
      { who: 'berta', t: 'Und dann hat dein Opa Karl sein Pferd über die Furt geritten und ist mitten im See stecken geblieben!' },
      { who: 'hilde', t: 'Hihi! Er war klatschnass. Und hat gelacht wie ein Kind.' },
      { who: 'hilde', t: 'Danke, {name}. Das war der schönste Nachmittag seit Langem.' },
    ]);
    this.particles.hearts(SPOTS.picnic.x, SPOTS.picnic.y, 8);
    await this.wait(0.8);
    await this.fade(true);
    guests.forEach((n, i) => { n.x = saved[i].x; n.y = saved[i].y; n.mode = 'home'; });
    this.sceneEntities = null;
    this.rebuildEntities();
    this.camOverride = null;
    this.quests.emit('picnic');
    await this.fade(false);
    this.cutscene = false;
    void P;
  }

  startParcours() {
    if (!this.player.riding) { this.ui.hint('Für den Parcours musst du reiten! Drück <kbd>R</kbd>.'); return; }
    this.startRace('parcours');
  }

  async raceOffer(npc, raceId, replay = false) {
    const c = await this.ask(`Bereit für das ${RACES[raceId].name}?`, ['Los geht’s!', 'Noch nicht'], npc);
    if (c !== 0) return;
    if (!this.player.riding) {
      const h = this.horseEntity(this.S.ridingHorse);
      if (h) {
        // Pferd ist nicht da: kurz herbeipfeifen und direkt aufsitzen
        this.player.mount(h);
        this.rebuildEntities();
      } else { await this.say(['Du brauchst ein Pferd für das Rennen!'], npc); return; }
    }
    await this.startRace(raceId);
    void replay;
  }

  async startRace(id) {
    this.cutscene = true;
    await this.fade(true);
    this.race = new Race(this, id);
    this.race.start();
    this.rebuildEntities();
    await this.fade(false);
    this.cutscene = false;
    this.applyAudioMode();
  }

  async onRaceFinished(race) {
    const S = this.S;
    const { place, medal, time } = race.result;
    const prevBest = S.stats.medals[race.id];
    const order = { gold: 3, silver: 2, bronze: 1 };
    if (!prevBest || order[medal] > order[prevBest]) S.stats.medals[race.id] = medal;
    if (race.id === 'parcours' && (!S.stats.parcoursBest || time < S.stats.parcoursBest)) S.stats.parcoursBest = time;
    this.audio.play(place === 1 || race.id === 'parcours' && medal === 'gold' ? 'fanfare' : 'quest');
    this.particles.confetti(this.player.x, this.player.y, 50);
    const medalTxt = MEDAL_NAMES[medal];
    const lines = [];
    if (race.id === 'parcours') {
      lines.push({ who: 'narr', t: `Geschafft! Zeit: ${time.toFixed(2)} Sekunden – Medaille: ${medalTxt}!${S.stats.parcoursBest === time ? ' Neue Bestzeit!' : ''}` });
      if (medal !== 'gold') lines.push({ who: 'narr', t: `Für Gold musst du unter ${RACES.parcours.medals[0]} Sekunden bleiben. Galoppieren (Shift) und direkt über die Hürden springen!` });
    } else {
      lines.push({ who: 'narr', t: `Ziel! Du bist ${place === 1 ? 'Erste' : place === 2 ? 'Zweite' : 'Dritte'} geworden – ${medalTxt}! (${time.toFixed(1)} s)` });
      const rival = race.rivals[0]?.id;
      const talk = {
        race1: place === 1 ? ['W-wow, du bist so schnell! Das schreib ich in mein Buch: „{name}: blitzschnell.“'] : ['Ich … hab gewonnen? Das muss ich sofort Mia erzählen! Du warst aber auch super!'],
        race2: place === 1 ? ['Waaas? Blitz und ich waren noch nie so knapp dran! Respekt, {name}!'] : ['Ha! Gewonnen! Aber du wirst immer besser, das merk ich.'],
        race3: place === 1 ? ['Unglaublich! Du hast uns beide geschlagen!', { who: 'ben', t: 'Ich wusste es. Ich hab es sogar aufgeschrieben.' }] : ['Knapp! Beim nächsten Mal hast du uns bestimmt.', { who: 'ben', t: 'D-du warst trotzdem toll!' }],
        finale: place === 1 ? ['Die Siegerin des Sommerfest-Rennens: {name}!'] : ['Was für ein Rennen! Alle jubeln für dich!'],
      }[race.id] || [];
      for (const l of talk) lines.push(typeof l === 'string' ? { who: rival, t: l } : l);
    }
    await this.wait(0.8);
    await this.say(lines);
    if (race.id !== 'finale') {
      if (!S.memories.some((m) => m.type === 'race') && race.id !== 'parcours') S.memories.push({ type: 'race', day: S.time.day, medal, race: race.id });
      race.end();
      this.rebuildEntities();
      this.quests.emit(race.id === 'parcours' ? 'parcours' : 'race', race.id);
      if (medal === 'gold' && race.id !== 'parcours') { this.inv.addCoins(20); this.ui.toast('Goldmedaille-Bonus: +20 Münzen', 'coin', 'gold'); }
    } else {
      S.memories.push({ type: 'finale', day: S.time.day, medal });
      race.end();
      this.rebuildEntities();
      this.finaleRaceDone?.();
    }
    this.saveNow();
  }

  questTimer(action, id) {
    if (id !== 'post') return;
    if (action === 'start') this.postTimer = { t: 0 };
    else if (action === 'stop' && this.postTimer) {
      const t = this.postTimer.t;
      this.postTimer = null;
      if (!this.S.stats.postBest || t < this.S.stats.postBest) this.S.stats.postBest = t;
      if (t <= 90) { this.inv.addCoins(20); this.pending.push(async () => { this.audio.play('fanfare'); await this.say([`Du hast den Brief in ${Math.round(t)} Sekunden gebracht – Zeitbonus: +20 Münzen!`]); }); }
      else this.pending.push(async () => { await this.say([`Brief zugestellt in ${Math.round(t)} Sekunden. Kein Zeitbonus – aber Kuno freut sich trotzdem riesig!`]); });
    }
  }

  onInvChange(kind, id, n) {
    if (this.state !== 'play') return;
    if (kind === 'add' && ITEMS[id] && ITEMS[id].cat !== 'quest' && n > 0 && !this._silentAdd) {
      // kleine Sammel-Rückmeldung passiert über Partikel; hier nur Aufgabenstand prüfen
    }
    this.quests?.checkPassive();
  }

  // ---------- Aufgaben-Rückmeldungen ----------
  onQuestStart(q, auto) {
    if (this.state !== 'play') return;
    this.ui.toast(`Neue Aufgabe: <b>${this.fmt(q.title)}</b>`, 'scroll');
    this.audio.play('quest');
    this.ui.pulseTracker();
    if (q.id === 'k1_pflege') this.later(4, () => this.tutorial('pet'));
    if (q.main && q.chapter > 1 && QUEST_BY_ID[q.id] && q.requires.length && !this._chapterShown?.[q.chapter]) {
      // Kapitelbanner, wenn das erste Kapitel-Quest startet
      this._chapterShown = this._chapterShown || {};
      if (q.requires.every((r) => QUEST_BY_ID[r].chapter < q.chapter)) {
        this._chapterShown[q.chapter] = true;
        this.later(1, () => this.ui.banner(`Kapitel ${q.chapter}`, CHAPTERS[q.chapter - 1].title));
      }
    }
    if (q.id === 'k1_kruemel') this.later(0.1, () => this.kittenState());
    this.tutorial('quest');
    void auto;
  }

  onQuestComplete(q) {
    const r = q.reward || {};
    this.ui.toast(`Aufgabe erledigt: <b>${this.fmt(q.title)}</b>${r.coins ? ` · +${r.coins} Münzen` : ''}`, 'star', 'gold');
    this.audio.play('quest');
    if (r.items) for (const [id, n] of Object.entries(r.items)) this.ui.toast(`+${n} ${itemName(id, n)}`, id);
    if (r.unlock) for (const u of r.unlock) this.ui.toast(`Freigeschaltet: ${ACCESSORIES[u]?.name || this.clothName(u)}`, u.startsWith('hat') || u.startsWith('outfit') ? 'bag' : 'heart', 'mint');
    if (r.deco) for (const id of Object.keys(r.deco)) this.ui.toast(`Neue Deko: ${DECO[id].name}`, iconCanvas(id, 26, 'deco'), 'mint');
    if (r.memory && !this.S.memories.some((m) => m.type === r.memory)) this.S.memories.push({ type: r.memory, day: this.S.time.day });
    if (r.farm) this.pending.push(() => this.farmUpgrade(r.farm));
    if (q.id === 'k1_kruemel') { this.S.flags.kitten = 'home'; this.later(0.2, () => this.kittenState()); }
    this.requestSave();
  }

  clothName(u) {
    const o = OUTFITS.find((x) => x.unlock === u);
    if (o) return o.name;
    return { hat_sun: 'Sonnenhut', hat_helmet: 'Reithelm', hat_flower: 'Blütenhaarreif', hat_captain: 'Kapitänsmütze' }[u] || u;
  }

  async farmUpgrade(kind) {
    const texts = {
      stable: ['Der Stall ist repariert!', 'Hämmern, sägen, streichen – der alte Stall strahlt in neuem Rot.'],
      paddock: ['Die Koppel ist erweitert!', 'Viel Platz zum Toben für alle deine Pferde.'],
      flowerGarden: ['Der Blumengarten blüht!', 'Neben der Koppel duftet es jetzt nach tausend Blüten.'],
      festival: ['Die Festwiese ist geschmückt!', 'Lampions, Wimpelketten und Blumenbögen – das Sommerfest kann kommen!'],
      gazebo: ['Die Rosenlaube ist fertig!', 'Ein Plätzchen nur für euch zwei – mit Schaukel.'],
      petcorner: ['Das Tierparadies ist fertig!', 'Katzenhaus, Kratzbaum und Miras eigene Hundehütte.'],
    };
    this.cutscene = true;
    await this.fade(true);
    for (let i = 0; i < 4; i++) { this.audio.play('land'); await this.wait(0.25); }
    this.S.farm[kind] = true;
    this.rebuildWorldKeepState();
    const focus = { stable: [81, 86], paddock: [82, 99], flowerGarden: [103, 99], festival: [85, 115], gazebo: [100.5, 79.5], petcorner: [103.5, 107.5] }[kind];
    if (kind === 'petcorner') {
      const pets = this.pets;
      pets.maumau.homeX = 102; pets.maumau.homeY = 109.2; pets.manni.homeX = 106.5; pets.manni.homeY = 108.8;
      pets.maumau.x = 102; pets.maumau.y = 109.2; pets.manni.x = 106.5; pets.manni.y = 108.8;
    }
    this.camOverride = { x: focus[0], y: focus[1] };
    this.renderer.follow(focus[0], focus[1], 0, true);
    await this.wait(0.3);
    await this.fade(false);
    this.audio.play('fanfare');
    this.particles.confetti(focus[0], focus[1], 70);
    this.ui.banner(texts[kind][0], texts[kind][1]);
    await this.wait(3);
    if (kind === 'stable' || kind === 'paddock' || kind === 'flowerGarden') {
      const ch = { stable: 1, paddock: 2, flowerGarden: 3 }[kind];
      const extra = {
        1: { who: 'mert', t: 'Jeder Nagel sitzt! Und Manni hat sich schon den besten Platz auf dem Heuboden gesichert.' },
        2: { who: 'mert', t: 'Hundertzwölf Pfähle. Ich hab sie alle selbst eingeschlagen. Na gut, Mia hat beim Zählen geholfen.' },
        3: { who: 'mert', t: 'Ich hab dir ein Beet mit Sonnenblumen gepflanzt. Weil du mein Sonnenschein bist. … Zu kitschig?' },
      }[ch];
      await this.say([{ who: 'hilde', t: { 1: 'Kapitel 1 geschafft, {name}! Der Stall ist wie neu. Opa Karl würde vor Freude tanzen.', 2: 'Kapitel 2 geschafft! Sieh nur, wie die Pferde über die neue Koppel galoppieren.', 3: 'Kapitel 3 geschafft! Dieser Duft … der Hof blüht wieder auf. Genau wie du.' }[ch] }, extra]);
    }
    if (kind === 'petcorner') {
      await this.say([{ who: 'mert', t: 'Maumau hat das Katzenhaus sofort mit den Kätzchen bezogen. Manni schläft auf dem Kratzbaum. Und Mira … liegt schon in ihrer Hütte und schnarcht.' }, { who: 'hilde', t: 'Kapitel 5 geschafft! Ein Hof voller Pfoten und Herzen. Genau so muss es sein.' }]);
    }
    this.camOverride = null;
    this.cutscene = false;
    this.saveNow();
    if (kind === 'gazebo') this.pending.push(() => Sc.gazeboScene(this));
  }

  async swing() {
    this.audio.play('heart');
    this.particles.hearts(SPOTS.gazebo.x, SPOTS.gazebo.y - 1, 4);
    const m = this.npcById('mert');
    const near = dist(m.x, m.y, SPOTS.gazebo.x, SPOTS.gazebo.y) < 14;
    this.ui.hint(pick(near ? ['Du schaukelst sanft hin und her. Mert winkt dir vom Stall aus zu und wirft dir einen Luftkuss zu. ♥', 'Die Schaukel quietscht leise. Mert ruft: „Warte, ich komm gleich zu dir!“'] : ['Du schaukelst sanft hin und her und schaust den Pferden zu.', 'Die Rosen duften. Was für ein schöner Tag.']), 4);
  }

  rebuildWorldKeepState() {
    this.world = new World(this.S.farm);
    this.renderer.setWorld(this.world);
    this.mapCanvas = makeCanvas(WW * 2, WH * 2);
    paintMiniMap(this.mapCanvas.getContext('2d'), this.world, 2);
    this._fog = null;
    for (const d of this.S.deco) this.world.setDyn(d.x, d.y, true);
    const P = this.world.paddock;
    for (const h of this.horses) if (h.mode === 'paddock' && !this.world.inPaddock(h.x, h.y)) { h.x = P.x + 2 + Math.random() * (P.w - 4); h.y = P.y + 2 + Math.random() * (P.h - 4); }
    const safe = this.world.nearestFree(this.player.x, this.player.y, { riding: this.player.riding });
    this.player.x = safe.x; this.player.y = safe.y;
  }

  // ---------- Baumodus (Hof-Deko) ----------
  startBuild(id) {
    if (!this.isOnFarm()) { this.ui.hint('Deko kannst du nur auf deinem Hof aufstellen. Reite nach Hause!'); return; }
    this.build = { id, x: 0, y: 0, ok: false };
    this.ui.hint(id ? `Baumodus: Klicke auf eine Grasfläche, um „${DECO[id].name}“ aufzustellen. Klick auf vorhandene Deko hebt sie auf. <kbd>Esc</kbd> beendet.` : 'Baumodus: Klicke auf aufgestellte Deko, um sie aufzuheben. <kbd>Esc</kbd> beendet.', 10);
  }
  endBuild() { this.build = null; this.ui.hideHint(); this.requestSave(); }

  updateBuild() {
    const b = this.build, inp = this.input;
    const w = this.renderer.screenToWorld(inp.mouse.x, inp.mouse.y);
    b.x = Math.floor(w.x); b.y = Math.floor(w.y);
    const S = this.S;
    const existing = S.deco.findIndex((d) => d.x === b.x && d.y === b.y);
    b.remove = existing >= 0;
    b.ok = !!b.id && !b.remove && (S.decoInv[b.id] || 0) > 0 && this.canPlaceDeco(b.x, b.y);
    if (inp.mouse.right) { this.endBuild(); return; }
    if (inp.mouse.clicked) {
      inp.mouse.down = false;
      if (b.remove) {
        const d = S.deco.splice(existing, 1)[0];
        this.world.setDyn(d.x, d.y, false);
        this.inv.addDeco(d.id, 1);
        this.audio.play('pop');
        this.particles.dust(d.x + 0.5, d.y + 0.9, 4);
      } else if (b.ok) {
        this.inv.takeDeco(b.id);
        S.deco.push({ id: b.id, x: b.x, y: b.y });
        this.world.setDyn(b.x, b.y, true);
        this.audio.play('dig');
        this.particles.sparkles(b.x + 0.5, b.y + 0.9, 6);
        if (!(S.decoInv[b.id] > 0)) { this.ui.hint('Das war die letzte. Mehr Deko gibt es bei Theo!', 4); this.build.id = null; }
      } else if (b.id) { this.audio.play('error'); this.ui.hint('Hier geht das nicht: nur auf freiem Gras deines Hofes, und der Weg muss frei bleiben.', 4); }
      this.requestSave();
    }
  }

  canPlaceDeco(x, y) {
    const w = this.world;
    if (!w.inFarmBuildArea(x, y)) return false;
    const P = this.player;
    if (Math.floor(P.x) === x && Math.abs(P.y - (y + 0.5)) < 1.2) return false;
    if (w.inPaddock(x + 0.5, y + 0.5)) return false;
    // Weg zur Tür muss frei bleiben
    w.setDyn(x, y, true);
    const reach = w.reachable(FARM.spawn.x, FARM.spawn.y, {});
    w.setDyn(x, y, false);
    const ok = reach[Math.floor(P.y) * WW + Math.floor(P.x)] && reach[Math.floor(FARM.gate.x + 2) + 89 * WW];
    return !!ok;
  }

  drawBuild(ctx, t) {
    const b = this.build;
    const x = (b.x + 0.5) * T, y = (b.y + 1) * T;
    ctx.save();
    rr(ctx, b.x * T + 2, b.y * T + 2, T - 4, T - 4, 10);
    ctx.fillStyle = b.remove ? 'rgba(255,180,90,0.35)' : b.ok ? 'rgba(120,230,160,0.35)' : 'rgba(255,120,140,0.3)';
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 20; ctx.stroke();
    ctx.setLineDash([]);
    if (b.id && !b.remove) drawSprite(ctx, decoSprite(b.id), x, y - 6, 0.6);
    ctx.font = `700 13px ${FONT}`; ctx.textAlign = 'center';
    outlinedText(ctx, b.remove ? 'Aufheben' : b.id ? `${DECO[b.id].name} (${this.S.decoInv[b.id] || 0})` : 'Deko anklicken', x, b.y * T - 8, '#fff', '#7a4a6a', 4);
    ctx.restore();
  }

  // ---------- Lichter ----------
  collectLights(view) {
    const out = [];
    for (const l of this.world.lights) if (l.x > view.x0 - 8 && l.x < view.x1 + 8 && l.y > view.y0 - 8 && l.y < view.y1 + 8) out.push(l);
    for (const d of this.S.deco) if (d.id === 'lantern') out.push({ x: d.x + 0.5, y: d.y - 0.1, r: 3.5, c: '#ffe1a8' });
    // Fenster
    for (const o of this.world.objects) if (o.k === 'bld' && o.type !== 'lighthouse' && o.x > view.x0 - 8 && o.x < view.x1 + 2 && o.y > view.y0 - 4 && o.y < view.y1 + 4) out.push({ x: o.x + o.w / 2, y: o.y + o.h - 0.7, r: 3.2, c: '#ffd99a' });
    out.push({ x: this.player.x, y: this.player.y - 0.5, r: 3.4 });
    if (this.festivalLights) for (const l of this.festivalLights) out.push(l);
    return out;
  }

  // ---------- Speichern ----------
  requestSave() { this.saveReq = 1; }
  saveNow(manual = false) {
    if (this.state !== 'play' && this.state !== 'ending') return;
    for (const h of this.horses) {
      if (h.mode === 'wild') h.saveTame(this.S);
      if (h.rec && this.S.horses.includes(h.rec) && (h.mode === 'idle' || h.mode === 'called')) { h.rec.place = 'world'; h.rec.x = h.x; h.rec.y = h.y; }
    }
    const ok = this.saves.save(this.S);
    if (manual) this.ui.toast(ok ? 'Gespeichert! ♥' : 'Speichern hat nicht geklappt (Speicher voll?)', ok ? 'heart' : null);
    this.saveReq = 0;
  }

  applySettings() {
    this.audio.setVolumes(this.settings.music, this.settings.sfx);
    this.saves.saveSettings(this.settings);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }

  async teleportHome() {
    this.cutscene = true;
    await this.fade(true);
    if (this.race) { this.race.end(); this.race = null; }
    this.player.x = FARM.spawn.x; this.player.y = FARM.spawn.y;
    if (this.player.horse) { this.player.horse.x = this.player.x; this.player.horse.y = this.player.y; }
    const rh = this.horseEntity(this.S.ridingHorse);
    if (rh && !this.player.riding) { rh.x = FARM.spawn.x + 2; rh.y = FARM.spawn.y; rh.mode = 'idle'; }
    this.renderer.follow(this.player.x, this.player.y, 0, true);
    this.rebuildEntities();
    await this.wait(0.3);
    await this.fade(false);
    this.cutscene = false;
    this.ui.banner(this.regionName(REG.FARM), 'Willkommen zu Hause!');
    this.saveNow();
  }

  hudAction(act) {
    if (this.state !== 'play') return;
    if (act === 'ride') { if (!this.dialog.open && !this.cutscene) this.toggleRide(); }
    else if (act === 'pause') { if (this.ui.isOpen()) this.ui.close(); else this.ui.open('pause'); }
    else if (this.ui.panel === act) this.ui.close();
    else if (!this.dialog.open) this.ui.open(act);
  }

  drawOutfitPreview(c, i, size) {
    const look = playerLook({ ...this.S.player, outfit: i, hat: false });
    c.save(); c.translate(size / 2, size * 0.98); c.scale(size / 64, size / 64);
    drawCharacter(c, look, { noShadow: true });
    c.restore();
  }

  replayFireworks() {
    this.cutscene = true;
    const cx = this.player.x, cy = this.player.y;
    let n = 0;
    const cols = ['#ff7eb6', '#ffd166', '#7ec8ff', '#b79cf0', '#8fe0c0'];
    const fire = () => {
      this.particles.firework(cx + (Math.random() - 0.5) * 8, cy - 1, 170 + Math.random() * 80, cols[n % cols.length], n % 2 === 0);
      this.audio.play('boom');
      if (++n < 8) this.later(0.6, fire); else this.later(1.5, () => { this.cutscene = false; });
    };
    fire();
  }
}

// Picknickdecke als Szenen-Objekt
class PicnicBlanket {
  constructor(x, y) { this.x = x; this.y = y - 0.8; }
  draw(ctx, game, t) {
    const X = this.x * T, Y = (this.y + 0.8) * T;
    ctx.save(); ctx.translate(X, Y);
    rr(ctx, -46, -22, 92, 44, 10); ctx.fillStyle = '#ff9eb8'; ctx.fill();
    ctx.save(); rr(ctx, -46, -22, 92, 44, 10); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let x = -46; x < 46; x += 12) ctx.fillRect(x, -22, 6, 44);
    for (let y = -22; y < 22; y += 12) ctx.fillRect(-46, y, 92, 6);
    ctx.restore();
    // Korb, Kuchen, Äpfel
    rr(ctx, -30, -16, 22, 16, 5); ctx.fillStyle = '#c98a5a'; ctx.fill();
    ctx.strokeStyle = '#9a6a45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-19, -16, 9, Math.PI, 0); ctx.stroke();
    for (const [x, y] of [[4, -6], [12, -2], [8, 6]]) { circ(ctx, x, y, 5); ctx.fillStyle = '#ef4f5f'; ctx.fill(); }
    ell(ctx, 26, 2, 11, 7); ctx.fillStyle = '#e0a060'; ctx.fill();
    rr(ctx, -6, 4, 8, 12, 3); ctx.fillStyle = '#ffcf5a'; ctx.fill();
    heart(ctx, 0, -28 + Math.sin(t * 3) * 3, 12, '#ff6f9f');
    ctx.restore();
  }
}

function iconFor(species) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 52;
  import('./draw/animals.js').then((m) => m.drawAnimalPortrait(cv.getContext('2d'), species, 52, 0));
  return cv;
}

export { COL, G, SPECIES_ORDER, VILLAGERS, COATS };
