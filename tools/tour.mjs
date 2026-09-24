// Screenshot-Rundgang durch alle Gebiete: node tools/tour.mjs [breite] [höhe]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const W = +(process.argv[2] || 1280), H = +(process.argv[3] || 760);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(900);
await page.evaluate(() => localStorage.clear());
await page.click('#t-new'); await page.click('#e-go'); await page.click('#st-skip'); await page.click('#h-go');
await page.waitForTimeout(400);
await page.evaluate(() => { const g = window.ponyhof; g.dialog.show = async () => {}; g.dialog.close(); g.hintQueue = []; g.ui.hint = () => {}; g.ui.banner = () => {}; g.ui.toast = () => {}; g.S.flags.noWeather = true; });
const spots = (process.env.SPOTS || 'farm:84,92;village:131,97;meadow:100,54;lavender:74,49;forest:28,78;lake:44,140;island:40,146;beach:130,158;lighthouse:162,156;mountain:106,20;lookout:106,9;wildherd:144,16;alpaca:78,19;parcours:77,67;hill:86,126;river:58,94;ford:58,71').split(';');
for (const s of spots) {
  const [name, xy] = s.split(':'); const [x, y] = xy.split(',').map(Number);
  await page.evaluate(([x, y]) => { const g = window.ponyhof; const P = g.player; P.x = x; P.y = y; g.renderer.follow(x, y, 0, true); }, [x, y]);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `screenshots/t-${name}.png` });
}
if (process.env.NIGHT) {
  await page.evaluate(() => { const g = window.ponyhof; g.S.time.minutes = 22 * 60; const P = g.player; P.x = 131; P.y = 97; g.renderer.follow(131, 97, 0, true); });
  await page.waitForTimeout(500); await page.screenshot({ path: 'screenshots/t-night-village.png' });
  await page.evaluate(() => { const g = window.ponyhof; const P = g.player; P.x = 28; P.y = 78; g.renderer.follow(28, 78, 0, true); });
  await page.waitForTimeout(500); await page.screenshot({ path: 'screenshots/t-night-forest.png' });
  await page.evaluate(() => { const g = window.ponyhof; g.S.time.minutes = 19 * 60; const P = g.player; P.x = 84; P.y = 92; g.renderer.follow(84, 92, 0, true); });
  await page.waitForTimeout(500); await page.screenshot({ path: 'screenshots/t-dusk-farm.png' });
  await page.evaluate(() => { const g = window.ponyhof; g.S.time.minutes = 12 * 60; g.S.weather.kind = 'rain'; });
  await page.waitForTimeout(500); await page.screenshot({ path: 'screenshots/t-rain.png' });
  await page.evaluate(() => { const g = window.ponyhof; g.S.weather.kind = 'sun'; g.rainbowAlpha = 1; g.S.weather.rainbowUntil = 99999; });
  await page.waitForTimeout(300); await page.screenshot({ path: 'screenshots/t-rainbow.png' });
}
console.log('fps', await page.evaluate(() => window.ponyhof.fps.value));
await browser.close();
