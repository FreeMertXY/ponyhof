// Automatischer Browser-Test: node tools/play.mjs <schritt>
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const step = process.argv[2] || 'title';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.type(), m.text()); });
page.on('pageerror', (e) => { errors.push(e.message); console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0,3).join(' | ')); });
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'screenshots/01-title.png' });
if (step === 'title') { await browser.close(); process.exit(0); }
await page.click('#t-new');
await page.waitForTimeout(400);
await page.screenshot({ path: 'screenshots/02-editor.png' });
await page.click('#e-go');
for (let i = 0; i < 4; i++) { await page.waitForTimeout(300); if (i === 1) await page.screenshot({ path: 'screenshots/03-intro.png' }); await page.click('#st-next'); }
await page.waitForTimeout(300);
await page.screenshot({ path: 'screenshots/04-horse.png' });
await page.click('#h-go');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'screenshots/05-game.png' });
// Dialog durchklicken
for (let i = 0; i < 5; i++) { await page.keyboard.press('e'); await page.waitForTimeout(200); await page.keyboard.press('e'); await page.waitForTimeout(150); }
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshots/06-play.png' });
const fps = await page.evaluate(() => window.ponyhof.fps.value);
console.log('fps', fps, 'errors', errors.length);
await browser.close();
