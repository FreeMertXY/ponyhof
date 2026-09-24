// Musik und Geräusche – alles live mit der Web Audio API erzeugt.
import { mulberry32 } from './util.js';

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

// Klangfarbe je Gebiet
const REGION_STYLE = {
  farm: { key: 60, lead: 'marimba', extra: 'pad', prog: [[0, 4, 5, 3], [0, 3, 4, 4]] },
  village: { key: 65, lead: 'accordion', extra: 'bass', prog: [[0, 3, 4, 0], [5, 3, 4, 0]] },
  meadow: { key: 67, lead: 'bell', extra: 'pad', prog: [[0, 5, 3, 4], [0, 4, 3, 4]] },
  forest: { key: 62, lead: 'flute', extra: 'pad', prog: [[5, 3, 0, 4], [5, 1, 3, 4]] },
  lake: { key: 63, lead: 'harp', extra: 'pad', prog: [[0, 5, 1, 4], [3, 4, 0, 0]] },
  beach: { key: 69, lead: 'uke', extra: 'shaker', prog: [[0, 3, 4, 3], [0, 5, 3, 4]] },
  mountain: { key: 64, lead: 'bell', extra: 'pad', prog: [[0, 4, 3, 0], [5, 4, 3, 4]] },
  festival: { key: 65, lead: 'accordion', extra: 'drums', prog: [[0, 3, 4, 0], [0, 5, 3, 4]] },
};

function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicVol = 0.6;
    this.sfxVol = 0.8;
    this.region = 'farm';
    this.mode = 'day'; // day | night | festival | title
    this.playing = false;
    this.nextBarTime = 0;
    this.bar = 0;
    this.themes = {};
    this.rainGain = null;
    this.waveGain = null;
    this.birdTimer = 0;
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.ratio.value = 3;
    this.comp.connect(ctx.destination);
    this.master = ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.comp);
    this.music = ctx.createGain(); this.music.connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.connect(this.master);
    // weicher Hall für die Musik
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(2.2);
    this.revGain = ctx.createGain(); this.revGain.gain.value = 0.28;
    this.reverb.connect(this.revGain); this.revGain.connect(this.music);
    this.musicBus = ctx.createGain(); this.musicBus.connect(this.music); this.musicBus.connect(this.reverb);
    this.noiseBuf = this.makeNoise(2);
    this.applyVolumes();
    // Umgebungsgeräusche (Regen, Meer)
    this.rainGain = this.loopNoise(1200, 0.0);
    this.waveGain = this.loopNoise(500, 0.0, true);
    this.startMusic();
  }

  makeImpulse(sec) {
    const ctx = this.ctx, len = ctx.sampleRate * sec;
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return b;
  }
  makeNoise(sec) {
    const ctx = this.ctx, len = ctx.sampleRate * sec;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  loopNoise(freq, gain, lfo = false) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(this.sfx);
    if (lfo) {
      const o = ctx.createOscillator(); o.frequency.value = 0.12;
      const og = ctx.createGain(); og.gain.value = 300;
      o.connect(og); og.connect(f.frequency); o.start();
    }
    src.start();
    return g;
  }

  setVolumes(music, sfx) { this.musicVol = music; this.sfxVol = sfx; this.applyVolumes(); }
  applyVolumes() {
    if (!this.ctx) return;
    this.music.gain.setTargetAtTime(this.musicVol * 0.55, this.ctx.currentTime, 0.1);
    this.sfx.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.1);
  }

  setAmbience({ rain = 0, waves = 0 }) {
    if (!this.ctx) return;
    this.rainGain.gain.setTargetAtTime(rain * 0.12, this.ctx.currentTime, 0.8);
    this.waveGain.gain.setTargetAtTime(waves * 0.1, this.ctx.currentTime, 0.8);
  }

  setRegion(r) { this.region = r; }
  setMode(m) { this.mode = m; }

  // ---------- Musik ----------
  startMusic() {
    if (this.playing || !this.ctx) return;
    this.playing = true;
    this.nextBarTime = this.ctx.currentTime + 0.2;
    this.timer = setInterval(() => this.schedule(), 90);
  }

  style() {
    if (this.mode === 'festival') return REGION_STYLE.festival;
    if (this.mode === 'title') return REGION_STYLE.meadow;
    return REGION_STYLE[this.region] || REGION_STYLE.farm;
  }

  theme(styleKey) {
    if (this.themes[styleKey]) return this.themes[styleKey];
    // 8-taktiges Motiv aus Akkordtönen, damit es wie eine richtige Melodie klingt
    const r = mulberry32(styleKey.split('').reduce((a, c) => a + c.charCodeAt(0) * 31, 7));
    const rhythms = [[1, 0, 1, 1, 1, 0, 1, 0], [1, 0, 0, 1, 1, 0, 1, 1], [1, 1, 1, 0, 1, 0, 0, 0], [1, 0, 1, 0, 1, 1, 1, 0], [1, 0, 0, 0, 1, 0, 1, 0]];
    const bars = [];
    let deg = 4;
    for (let b = 0; b < 8; b++) {
      const rh = b % 4 === 3 ? [1, 0, 0, 0, 1, 0, 0, 0] : rhythms[Math.floor(r() * rhythms.length)];
      const notes = rh.map((on) => {
        if (!on) return null;
        const step = [-2, -1, -1, 1, 1, 2, 0, 3, -3][Math.floor(r() * 9)];
        deg = Math.max(0, Math.min(11, deg + step));
        return deg;
      });
      bars.push(notes);
    }
    this.themes[styleKey] = bars;
    return bars;
  }

  schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextBarTime < ctx.currentTime + 0.4) {
      this.playBar(this.nextBarTime);
      const bpm = this.mode === 'night' ? 70 : this.mode === 'festival' ? 118 : this.mode === 'title' ? 88 : 92;
      this.nextBarTime += (60 / bpm) * 4;
      this.bar++;
    }
  }

  playBar(t0) {
    const st = this.style();
    const night = this.mode === 'night';
    const fest = this.mode === 'festival';
    const bpm = night ? 70 : fest ? 118 : this.mode === 'title' ? 88 : 92;
    const beat = 60 / bpm;
    const key = st.key - (night ? 12 : 0) + 0;
    const progs = night ? [[5, 3, 0, 4], [5, 3, 1, 4]] : st.prog;
    const prog = progs[Math.floor(this.bar / 4) % progs.length];
    const chordDeg = prog[this.bar % 4];
    const scaleNote = (d) => key + MAJOR[((d % 7) + 7) % 7] + Math.floor(d / 7) * 12;
    const chord = [chordDeg, chordDeg + 2, chordDeg + 4].map(scaleNote);
    const dest = this.musicBus;
    // Bass
    const bassType = night ? 'softbass' : 'bass';
    this.note(bassType, mtof(chord[0] - 24), t0, beat * 1.8, 0.22, dest);
    this.note(bassType, mtof(chord[0] - 24 + (this.bar % 2 ? 7 : 12)), t0 + beat * 2, beat * 1.6, 0.18, dest);
    // Begleitung
    if (st.extra === 'pad' || night) {
      for (const n of chord) this.note('pad', mtof(n - 12), t0, beat * 4, night ? 0.05 : 0.04, dest);
    } else {
      for (let i = 0; i < 4; i++) for (const n of chord) this.note(st.lead === 'accordion' ? 'accordion' : 'pluck', mtof(n - 12), t0 + beat * i + beat * 0.5, beat * 0.4, 0.035, dest);
    }
    // Melodie
    const theme = this.theme(st.key + st.lead + (night ? 'n' : ''));
    const bars = theme[this.bar % theme.length];
    const lead = night ? 'musicbox' : st.lead;
    bars.forEach((d, i) => {
      if (d === null) return;
      if (night && i % 2 === 1) return;
      const n = scaleNote(d + (night ? 7 : 0));
      const len = i === 7 || bars[i + 1] === null ? beat * 0.9 : beat * 0.45;
      this.note(lead, mtof(n), t0 + (beat / 2) * i, len, night ? 0.09 : 0.1, dest);
    });
    // Rhythmus
    if (st.extra === 'shaker' || fest) for (let i = 0; i < 8; i++) this.perc('shaker', t0 + (beat / 2) * i, i % 2 ? 0.03 : 0.05);
    if (fest) for (let i = 0; i < 4; i++) { this.perc('kick', t0 + beat * i, 0.35); if (i % 2) this.perc('snare', t0 + beat * i, 0.12); }
    if (this.mode === 'title' && this.bar % 2 === 0) this.note('bell', mtof(chord[2] + 12), t0 + beat * 3.5, beat, 0.04, dest);
  }

  note(type, f, t, dur, vel, dest = this.musicBus) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.connect(dest);
    const env = (a, d, s, r) => {
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel, t + a);
      g.gain.setTargetAtTime(vel * s, t + a, d);
      g.gain.setTargetAtTime(0, t + dur, r);
    };
    const osc = (wave, freq, detune = 0) => {
      const o = ctx.createOscillator(); o.type = wave; o.frequency.value = freq; o.detune.value = detune;
      o.start(t); o.stop(t + dur + 1.5); return o;
    };
    switch (type) {
      case 'marimba': {
        const o = osc('sine', f), o2 = osc('sine', f * 4);
        const g2 = ctx.createGain(); g2.gain.value = 0.15;
        o.connect(g); o2.connect(g2); g2.connect(g);
        env(0.005, 0.12, 0.2, 0.15);
        break;
      }
      case 'bell': case 'musicbox': {
        const o = osc('sine', f), o2 = osc('sine', f * 2.01), o3 = osc('sine', f * 3.98);
        const g2 = ctx.createGain(); g2.gain.value = type === 'musicbox' ? 0.25 : 0.35;
        const g3 = ctx.createGain(); g3.gain.value = 0.12;
        o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
        env(0.003, 0.25, 0.25, 0.5);
        break;
      }
      case 'flute': {
        const o = osc('sine', f);
        const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2; const lg = ctx.createGain(); lg.gain.value = f * 0.008;
        lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 1);
        const o2 = osc('triangle', f * 2); const g2 = ctx.createGain(); g2.gain.value = 0.1; o2.connect(g2); g2.connect(g);
        o.connect(g);
        env(0.06, 0.2, 0.7, 0.12);
        break;
      }
      case 'accordion': {
        const f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.value = 1800;
        const o = osc('sawtooth', f, -6), o2 = osc('sawtooth', f, 7);
        o.connect(f1); o2.connect(f1); f1.connect(g);
        vel *= 0.5;
        env(0.03, 0.2, 0.6, 0.08);
        break;
      }
      case 'harp': case 'pluck': case 'uke': {
        const o = osc(type === 'uke' ? 'triangle' : 'triangle', f);
        const f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.setValueAtTime(f * 6, t); f1.frequency.setTargetAtTime(f * 1.5, t, 0.15);
        o.connect(f1); f1.connect(g);
        env(0.004, type === 'harp' ? 0.35 : 0.12, 0.1, 0.2);
        break;
      }
      case 'pad': {
        const f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.value = 900;
        const o = osc('triangle', f, -8), o2 = osc('triangle', f, 8);
        o.connect(f1); o2.connect(f1); f1.connect(g);
        env(0.4, 0.8, 0.8, 0.5);
        break;
      }
      case 'bass': case 'softbass': {
        const o = osc(type === 'bass' ? 'triangle' : 'sine', f);
        o.connect(g);
        env(0.01, 0.2, 0.5, 0.1);
        break;
      }
      default: {
        const o = osc('sine', f); o.connect(g); env(0.01, 0.1, 0.4, 0.1);
      }
    }
  }

  perc(type, t, vel) {
    const ctx = this.ctx;
    const g = ctx.createGain(); g.connect(this.musicBus);
    if (type === 'kick') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      o.connect(g); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t); o.stop(t + 0.3);
    } else {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = type === 'snare' ? 'bandpass' : 'highpass'; f.frequency.value = type === 'snare' ? 1800 : 7000;
      s.connect(f); f.connect(g);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + (type === 'snare' ? 0.15 : 0.06));
      s.start(t, Math.random()); s.stop(t + 0.2);
    }
  }

  // ---------- Geräusche ----------
  play(name, opt = {}) {
    const ctx = this.ctx;
    if (!ctx || this.sfxVol <= 0) return;
    const t = ctx.currentTime + 0.005;
    const out = this.sfx;
    const tone = (wave, f0, f1, dur, vol, delay = 0) => {
      const o = ctx.createOscillator(); o.type = wave;
      const g = ctx.createGain();
      o.frequency.setValueAtTime(f0, t + delay);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + delay + dur);
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(vol, t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + delay + dur);
      o.connect(g); g.connect(out);
      o.start(t + delay); o.stop(t + delay + dur + 0.05);
    };
    const noise = (freq, q, dur, vol, delay = 0, type = 'bandpass') => {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t + delay); g.gain.exponentialRampToValueAtTime(0.0008, t + delay + dur);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t + delay, Math.random() * 1.5); s.stop(t + delay + dur + 0.05);
    };
    switch (name) {
      case 'hoof': {
        const v = opt.vol || 0.25;
        noise(900 + Math.random() * 300, 3, 0.07, v);
        tone('sine', 180 + Math.random() * 40, 90, 0.08, v * 0.8);
        break;
      }
      case 'step': noise(1600 + Math.random() * 400, 1.5, 0.05, 0.05); break;
      case 'pling': tone('sine', 1318, 0, 0.25, 0.18); tone('sine', 1976, 0, 0.35, 0.14, 0.07); break;
      case 'coin': tone('square', 988, 0, 0.08, 0.06); tone('square', 1319, 0, 0.25, 0.06, 0.08); break;
      case 'horseshoe': [784, 988, 1175, 1568].forEach((f, i) => tone('sine', f, 0, 0.4, 0.14, i * 0.08)); break;
      case 'pop': tone('sine', 500, 900, 0.08, 0.15); break;
      case 'click': tone('sine', 900, 600, 0.05, 0.08); break;
      case 'open': tone('sine', 520, 780, 0.12, 0.1); break;
      case 'close': tone('sine', 700, 450, 0.1, 0.08); break;
      case 'type': tone('triangle', 500 + Math.random() * 150 * (opt.pitch || 1), 0, 0.03, 0.035); break;
      case 'heart': tone('sine', 880, 0, 0.18, 0.1); tone('sine', 1320, 0, 0.3, 0.08, 0.06); break;
      case 'splash': noise(1400, 0.8, 0.35, 0.18); noise(600, 1, 0.25, 0.1, 0.05); break;
      case 'jump': tone('sine', 300, 700, 0.18, 0.08); noise(2000, 1, 0.15, 0.04); break;
      case 'land': noise(500, 1, 0.12, 0.15); tone('sine', 120, 60, 0.1, 0.12); break;
      case 'shake': for (let i = 0; i < 5; i++) noise(2500, 1, 0.08, 0.06, i * 0.05); break;
      case 'water': for (let i = 0; i < 6; i++) noise(3000 + Math.random() * 2000, 4, 0.06, 0.05, i * 0.04); break;
      case 'dig': noise(400, 1, 0.12, 0.15); noise(300, 1, 0.1, 0.1, 0.1); break;
      case 'brush': noise(3500, 0.8, 0.12, 0.05); break;
      case 'purr': {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 26;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.2); g.gain.linearRampToValueAtTime(0, t + 1.4);
        o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 1.5);
        break;
      }
      case 'bark': tone('square', 520, 330, 0.09, 0.07); tone('square', 540, 330, 0.09, 0.07, 0.16); break;
      case 'quack': tone('sawtooth', 700, 500, 0.1, 0.05); break;
      case 'animal': tone('sine', 700 + Math.random() * 400, 1200, 0.12, 0.08); break;
      case 'neigh': this.neigh(t, opt.pitch || 1); break;
      case 'bird': this.bird(t, opt.pitch || 1); break;
      case 'owl': tone('sine', 420, 380, 0.35, 0.1); tone('sine', 420, 360, 0.5, 0.1, 0.5); break;
      case 'quest': [523, 659, 784, 1047].forEach((f, i) => { tone('triangle', f, 0, 0.35, 0.12, i * 0.1); tone('sine', f * 2, 0, 0.3, 0.05, i * 0.1); }); break;
      case 'fanfare': [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone('triangle', f, 0, 0.3, 0.14, [0, 0.12, 0.24, 0.36, 0.6, 0.72, 0.9][i])); break;
      case 'levelup': [659, 784, 988, 1319].forEach((f, i) => tone('sine', f, 0, 0.3, 0.12, i * 0.07)); break;
      case 'countdown': tone('sine', 660, 0, 0.2, 0.15); break;
      case 'go': tone('sine', 1320, 0, 0.45, 0.18); break;
      case 'checkpoint': tone('sine', 1047, 0, 0.12, 0.12); tone('sine', 1568, 0, 0.2, 0.1, 0.07); break;
      case 'boom': noise(200, 0.7, 0.8, 0.35, 0, 'lowpass'); for (let i = 0; i < 8; i++) noise(4000, 2, 0.05, 0.05, 0.2 + Math.random() * 0.5); break;
      case 'whistle': tone('sine', 1600, 2200, 0.15, 0.1); tone('sine', 2200, 1500, 0.25, 0.1, 0.18); break;
      case 'sad': tone('sine', 500, 380, 0.3, 0.08); break;
      case 'buy': tone('sine', 880, 0, 0.1, 0.1); tone('sine', 1175, 0, 0.2, 0.1, 0.08); break;
      case 'error': tone('square', 220, 180, 0.15, 0.05); break;
      default: break;
    }
  }

  neigh(t, pitch) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const base = 620 * pitch;
    o.frequency.setValueAtTime(base * 0.8, t);
    o.frequency.linearRampToValueAtTime(base * 1.25, t + 0.15);
    o.frequency.linearRampToValueAtTime(base * 0.95, t + 0.5);
    o.frequency.linearRampToValueAtTime(base * 0.6, t + 1.0);
    const vib = ctx.createOscillator(); vib.frequency.value = 14; const vg = ctx.createGain(); vg.gain.value = base * 0.07;
    vib.connect(vg); vg.connect(o.frequency);
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 1300; f1.Q.value = 2.5;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 2600; f2.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.08); g.gain.linearRampToValueAtTime(0.12, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 1.05);
    o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(this.sfx);
    o.start(t); vib.start(t); o.stop(t + 1.1); vib.stop(t + 1.1);
  }

  bird(t, pitch) {
    const ctx = this.ctx;
    const n = 2 + Math.floor(Math.random() * 4);
    const f0 = (2600 + Math.random() * 1400) * pitch;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(); o.type = 'sine';
      const g = ctx.createGain();
      const st = t + i * (0.09 + Math.random() * 0.05);
      o.frequency.setValueAtTime(f0, st);
      o.frequency.exponentialRampToValueAtTime(f0 * (1.3 + Math.random() * 0.4), st + 0.05);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.9, st + 0.08);
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.035, st + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, st + 0.09);
      o.connect(g); g.connect(this.sfx); o.start(st); o.stop(st + 0.1);
    }
  }

  // regelmäßige Umgebungsgeräusche
  tick(dt, { night, region, indoorsOrMenu }) {
    if (!this.ctx || indoorsOrMenu) return;
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      if (!night) {
        const rate = region === 'forest' || region === 'meadow' ? 1 : 0.5;
        if (Math.random() < rate) this.play('bird', { pitch: 0.8 + Math.random() * 0.5 });
      } else if (region === 'forest' && Math.random() < 0.3) this.play('owl');
      else if (Math.random() < 0.5) this.cricket();
      this.birdTimer = 2 + Math.random() * 5;
    }
  }

  cricket() {
    const ctx = this.ctx, t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator(); o.frequency.value = 4200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.06); g.gain.linearRampToValueAtTime(0.012, t + i * 0.06 + 0.01); g.gain.linearRampToValueAtTime(0, t + i * 0.06 + 0.04);
      o.connect(g); g.connect(this.sfx); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.05);
    }
  }
}
