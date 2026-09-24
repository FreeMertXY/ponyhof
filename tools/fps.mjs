// Bildrate messen in verschiedenen Szenen: node tools/fps.mjs [breite] [höhe]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const W = +(process.argv[2] || 1920), H = +(process.argv[3] || 1080);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(900);
await page.evaluate(() => localStorage.clear());
await page.click('#t-new'); await page.click('#e-go'); await page.click('#st-skip'); await page.click('#h-go');
await page.waitForTimeout(400);
await page.evaluate(() => { const g = window.ponyhof; g.dialog.show = async () => {}; g.dialog.close(); g.hintQueue = []; g.ui.hint = () => {}; g.S.flags.noWeather = true; });
for (const [name, x, y, min] of [['Hof', 84, 92, 600], ['Dorf Nacht', 131, 97, 1320], ['Wald Nacht', 28, 78, 1320], ['Wiese', 100, 54, 700], ['Strand', 130, 158, 700]]) {
  await page.evaluate(([x, y, min]) => { const g = window.ponyhof; g.S.time.minutes = min; const P = g.player; P.x = x; P.y = y; g.renderer.follow(x, y, 0, true); }, [x, y, min]);
  // laufen, damit neue Chunks gezeichnet werden
  await page.keyboard.down('d'); await page.keyboard.down('Shift');
  const r = await page.evaluate(() => new Promise((res) => {
    const times = []; let last = performance.now(); let n = 0;
    const f = (t) => { times.push(t - last); last = t; if (++n < 180) requestAnimationFrame(f); else res(times); };
    requestAnimationFrame(f);
  }));
  await page.keyboard.up('d'); await page.keyboard.up('Shift');
  const sorted = [...r].sort((a, b) => a - b);
  const avg = r.reduce((a, b) => a + b, 0) / r.length;
  console.log(`${name}: ${(1000 / avg).toFixed(1)} fps im Schnitt, 95%-Frame ${sorted[Math.floor(r.length * 0.95)].toFixed(1)} ms`);
}
await browser.close();
