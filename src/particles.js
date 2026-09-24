// Partikel: Staubwölkchen, Herzen, Glitzer, Blütenblätter, Feuerwerk, schwebende Texte.
import { TILE } from './world.js';
import { circ, heart, sparkle, star, ell, outlinedText, FONT, flower } from './draw/paint.js';

const T = TILE;

export class Particles {
  constructor() { this.list = []; }

  add(p) {
    this.list.push({ z: 0, vx: 0, vy: 0, vz: 0, g: 0, life: 1, age: 0, size: 1, rot: 0, ...p });
    if (this.list.length > 900) this.list.splice(0, this.list.length - 900);
  }

  dust(x, y, n = 2) {
    for (let i = 0; i < n; i++) this.add({ type: 'dust', x: x + (Math.random() - 0.5) * 0.4, y: y + Math.random() * 0.1, vx: (Math.random() - 0.5) * 0.6, vy: -Math.random() * 0.2, vz: 8 + Math.random() * 10, life: 0.6 + Math.random() * 0.3, size: 0.7 + Math.random() * 0.8 });
  }
  hearts(x, y, n = 3) {
    for (let i = 0; i < n; i++) this.add({ type: 'heart', x: x + (Math.random() - 0.5) * 0.8, y, z: 40 + Math.random() * 10, vx: (Math.random() - 0.5) * 0.5, vz: 30 + Math.random() * 20, life: 1.2 + Math.random() * 0.4, size: 0.8 + Math.random() * 0.6 });
  }
  sparkles(x, y, n = 5, z = 20, color = '#fff6b0') {
    for (let i = 0; i < n; i++) this.add({ type: 'sparkle', x: x + (Math.random() - 0.5) * 1, y: y + (Math.random() - 0.5) * 0.3, z: z + Math.random() * 30, vx: (Math.random() - 0.5) * 0.8, vz: 10 + Math.random() * 30, life: 0.6 + Math.random() * 0.6, size: 0.6 + Math.random(), color });
  }
  splash(x, y, n = 6) {
    for (let i = 0; i < n; i++) this.add({ type: 'drop', x, y, z: 4, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 0.6, vz: 40 + Math.random() * 60, g: 300, life: 0.6, size: 1 });
  }
  leaves(x, y, n = 6, color = '#7fcf6a') {
    for (let i = 0; i < n; i++) this.add({ type: 'leaf', x: x + (Math.random() - 0.5) * 2, y: y + Math.random() * 0.5, z: 60 + Math.random() * 40, vx: (Math.random() - 0.5) * 0.8, vz: -10 - Math.random() * 20, life: 1.4, size: 1, rot: Math.random() * 6, color });
  }
  notes(x, y) { this.add({ type: 'note', x, y, z: 50, vx: (Math.random() - 0.5) * 0.3, vz: 25, life: 1.4, size: 1 }); }
  text(x, y, text, color = '#fff') { this.add({ type: 'text', x, y, z: 60, vz: 28, life: 1.6, text, color }); }
  confetti(x, y, n = 40) {
    const cols = ['#ff7eb6', '#ffd166', '#8fe0c0', '#7ec8ff', '#b79cf0', '#ff9f7a'];
    for (let i = 0; i < n; i++) this.add({ type: 'confetti', x: x + (Math.random() - 0.5) * 3, y: y + (Math.random() - 0.5) * 2, z: 60 + Math.random() * 80, vx: (Math.random() - 0.5) * 2, vz: 40 + Math.random() * 80, g: 120, life: 2 + Math.random(), rot: Math.random() * 6, color: cols[i % cols.length], size: 1 });
  }
  // Herzförmiges Feuerwerk (z = Höhe in Pixeln)
  firework(x, y, z, color, heartShape = true) {
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      let vx, vz;
      if (heartShape) {
        const hx = 16 * Math.pow(Math.sin(a), 3);
        const hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
        vx = hx * 0.09; vz = hy * 7;
      } else { vx = Math.cos(a) * 1.8; vz = Math.sin(a) * 110; }
      this.add({ type: 'spark', x, y, z, vx, vz, g: 30, life: 1.6 + Math.random() * 0.4, color, size: 1.2, drag: 0.6 });
    }
  }
  shootingStar(x, y) { this.add({ type: 'shoot', x, y, z: 300, vx: 9, vz: -110, life: 1.1, size: 1 }); }

  update(dt) {
    const L = this.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.age += dt;
      if (p.age >= p.life) { L.splice(i, 1); continue; }
      if (p.drag) { p.vx *= Math.pow(p.drag, dt); p.vz *= Math.pow(p.drag, dt); }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vz -= p.g * dt;
      p.z += p.vz * dt;
      if (p.z < 0 && p.type !== 'spark') { p.z = 0; p.vz = 0; }
      p.rot += dt * 3;
    }
  }

  // Feuerwerk & Sternschnuppen leuchten über der Nacht
  drawTop(ctx, t) { this.draw(ctx, t, true); }

  draw(ctx, t, top = false) {
    for (const p of this.list) {
      if ((p.type === 'spark' || p.type === 'shoot') !== top) continue;
      const k = p.age / p.life;
      const x = p.x * T, y = p.y * T - p.z;
      const a = 1 - k;
      switch (p.type) {
        case 'dust':
          ctx.fillStyle = `rgba(240,225,200,${0.6 * a})`;
          circ(ctx, x, y, (4 + k * 8) * p.size); ctx.fill();
          break;
        case 'heart':
          ctx.globalAlpha = Math.min(1, a * 1.5);
          heart(ctx, x + Math.sin(p.age * 5) * 4, y, 11 * p.size * (0.6 + Math.min(0.4, p.age * 2)), '#ff6f9f');
          ctx.globalAlpha = 1;
          break;
        case 'sparkle':
          sparkle(ctx, x, y, 5 * p.size * (1 - k * 0.5), p.color || '#fff6b0');
          break;
        case 'drop':
          ctx.fillStyle = `rgba(190,235,255,${a})`;
          circ(ctx, x, y, 2.5); ctx.fill();
          break;
        case 'leaf':
          ctx.save(); ctx.translate(x + Math.sin(p.age * 4) * 6, y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.globalAlpha = a; ell(ctx, 0, 0, 4, 2); ctx.fill();
          ctx.restore(); ctx.globalAlpha = 1;
          break;
        case 'petal':
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot);
          ctx.globalAlpha = a; flower(ctx, 0, 0, 2.5, p.color || '#ffb0cc', '#fff'); ctx.restore(); ctx.globalAlpha = 1;
          break;
        case 'note':
          ctx.globalAlpha = a; ctx.fillStyle = '#b36ad9'; ctx.font = `700 18px ${FONT}`; ctx.textAlign = 'center';
          ctx.fillText('♪', x + Math.sin(p.age * 4) * 5, y); ctx.globalAlpha = 1;
          break;
        case 'text':
          ctx.globalAlpha = Math.min(1, a * 2);
          ctx.font = `700 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          outlinedText(ctx, p.text, x, y, p.color, '#7a4a6a', 4);
          ctx.globalAlpha = 1;
          break;
        case 'confetti':
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, a * 2); ctx.fillRect(-3, -1.5, 6, 3);
          ctx.restore(); ctx.globalAlpha = 1;
          break;
        case 'spark': {
          ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, a * 1.5);
          circ(ctx, x, y, 3 * p.size); ctx.fill();
          ctx.globalAlpha = Math.min(1, a) * 0.35;
          circ(ctx, x, y, 8 * p.size); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }
        case 'shoot': {
          const tail = 70;
          const g = ctx.createLinearGradient(x, y, x - tail, y + tail * 0.4);
          g.addColorStop(0, `rgba(255,255,230,${a})`); g.addColorStop(1, 'rgba(255,255,230,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - tail, y + tail * 0.4); ctx.stroke();
          ctx.fillStyle = `rgba(255,255,240,${a})`; star(ctx, x, y, 6, 4, 0.4); ctx.fill();
          break;
        }
        default: break;
      }
    }
  }
}
