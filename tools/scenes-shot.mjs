// Screenshots der Liebes- und Tierszenen in echter Geschwindigkeit
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(900);
await page.evaluate(() => localStorage.clear());
await page.click('#t-new'); await page.click('#e-go'); await page.click('#st-skip'); await page.click('#h-go');
await page.waitForTimeout(600);
for (let i = 0; i < 8; i++) { await page.keyboard.press('e'); await page.waitForTimeout(120); }
await page.evaluate(async () => { window.Sc = await import('/src/scenes.js'); const g = window.ponyhof; g.hintQueue = []; g.S.flags.noWeather = true; });
// Szene starten und dabei Dialoge per Taste weiterklicken + Screenshots
async function run(name, code, shots = [1500, 4200, 7000], adv = 1100) {
  await page.evaluate((c) => { window.__done = false; (async () => { await eval(c); window.__done = true; })().catch((e) => { console.error(e); window.__done = true; }); }, code);
  const t0 = Date.now(); let si = 0;
  while (!(await page.evaluate(() => window.__done)) && Date.now() - t0 < 60000) {
    const el = Date.now() - t0;
    if (si < shots.length && el > shots[si]) { await page.screenshot({ path: `screenshots/s-${name}-${si}.png` }); si++; }
    const open = await page.evaluate(() => window.ponyhof.dialog.open && !window.ponyhof.dialog.choiceMode);
    if (open) { await page.waitForTimeout(adv); await page.keyboard.press('e'); await page.keyboard.press('e'); }
    const choice = await page.evaluate(() => window.ponyhof.dialog.choiceMode);
    if (choice) await page.keyboard.press('1');
    const nameIn = await page.$('#n-ok'); if (nameIn) await nameIn.click();
    await page.waitForTimeout(100);
  }
  console.log(name, 'fertig in', ((Date.now() - t0) / 1000).toFixed(1), 's');
}
await run('date', 'Sc.dockDate(window.ponyhof)', [2500, 9000, 13500]);
await page.evaluate(() => { window.ponyhof.inv.add('birthdaycake', 1); });
await run('party', 'Sc.partyScene(window.ponyhof)', [2500, 10000, 16000]);
await page.evaluate(() => { const g = window.ponyhof; g.S.farm.gazebo = true; g.S.farm.petcorner = true; g.rebuildWorldKeepState(); });
await run('laube', 'Sc.gazeboScene(window.ponyhof)', [2500, 6500, 8500]);
await run('kitten', '(async () => { const g = window.ponyhof; g.player.x = 87.5; g.player.y = 86.6; g.renderer.follow(87.5, 86, 0, true); await Sc.kittenScene(g); })()', [2000, 5000]);
await run('show', 'Sc.dogShow(window.ponyhof)', [2500, 7000, 11000]);
await page.evaluate(() => { const g = window.ponyhof; g.camOverride = null; g.player.x = 103.5; g.player.y = 110.5; g.renderer.follow(103.5, 109, 0, true); g.S.time.minutes = 11 * 60; });
await page.waitForTimeout(800);
await page.screenshot({ path: 'screenshots/s-petcorner.png' });
await browser.close();
