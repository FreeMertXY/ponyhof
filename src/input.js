// Tastatur und Maus.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, clicked: false, right: false, moved: false };
    this.canvas = canvas;
    this.enabled = true;
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      this.keys.delete(k);
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.down = false; });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2) { this.mouse.right = true; return; }
      this.mouse.down = true; this.mouse.clicked = true; this.mouse.downAt = performance.now();
      this.mouse.x = e.clientX; this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
    canvas.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.moved = true; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // Touch (Bonus)
    canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; this.mouse.x = t.clientX; this.mouse.y = t.clientY; this.mouse.down = true; this.mouse.clicked = true; this.mouse.downAt = performance.now(); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; this.mouse.x = t.clientX; this.mouse.y = t.clientY; e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', () => { this.mouse.down = false; });
  }
  down(...ks) { return ks.some((k) => this.keys.has(k)); }
  hit(...ks) { return ks.some((k) => this.pressed.has(k)); }
  axis() {
    let x = 0, y = 0;
    if (this.down('a', 'ArrowLeft')) x -= 1;
    if (this.down('d', 'ArrowRight')) x += 1;
    if (this.down('w', 'ArrowUp')) y -= 1;
    if (this.down('s', 'ArrowDown')) y += 1;
    return { x, y };
  }
  endFrame() { this.pressed.clear(); this.mouse.clicked = false; this.mouse.right = false; this.mouse.moved = false; }
  clear() { this.keys.clear(); this.pressed.clear(); this.mouse.down = false; this.mouse.clicked = false; }
}
