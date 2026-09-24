// Screenshots aller Menüs
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
await page.goto('http://localhost:8080/index.html');
await page.waitForTimeout(900);
await page.evaluate(() => localStorage.clear());
await page.click('#t-new'); await page.click('#e-go'); await page.click('#st-skip'); await page.click('#h-go');
await page.waitForTimeout(400);
await page.evaluate(() => {
  const g = window.ponyhof; g.dialog.show = async () => {}; g.dialog.close(); g.hintQueue = [];
  g.inv.add('apple', 5); g.inv.add('lavender', 3); g.inv.add('shell', 2); g.inv.add('mushroom', 4); g.inv.add('cake', 1);
  g.inv.unlock('saddle_rosa'); g.inv.unlock('bow_gold'); g.inv.unlock('blanket_herz'); g.inv.unlock('wreath'); g.inv.unlock('outfit_lavender'); g.inv.unlock('hat_sun');
  g.inv.addDeco('bench', 2); g.inv.addDeco('lantern', 1);
  g.S.album.rabbit = { day: 1, where: 'Blumenwiesen' }; g.S.album.cat = { day: 1, where: 'Dorf Kleeberg' }; g.S.album.owl = { day: 2, where: 'Flüsterwald' };
  g.S.discovered.village = true; g.S.discovered.meadow = true; g.S.player.coins = 250;
  g.S.horses[0].acc = { saddle: 'saddle_rosa', bow: 'bow_gold', blanket: 'blanket_herz', wreath: 'wreath' };
  g.S.horses[0].pts = 60;
});
for (const [name, arg] of [['inventory'], ['quests'], ['map'], ['album'], ['stall'], ['horse', 'h_start'], ['care', 'h_start'], ['shop', 'theo'], ['pause'], ['settings'], ['keys']]) {
  await page.evaluate(([n, a]) => { const g = window.ponyhof; g.ui.close(); g.ui.open(n, a); }, [name, arg]);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/p-${name}.png` });
}
await page.evaluate(() => { const g = window.ponyhof; g.ui.close(); g.ui.invTab = 'clothes'; g.ui.open('inventory'); });
await page.waitForTimeout(300); await page.screenshot({ path: 'screenshots/p-clothes.png' });
await page.evaluate(() => { const g = window.ponyhof; g.ui.close(); });
// Dialog-Ansicht
await page.evaluate(() => { const g = window.ponyhof; delete g.dialog.show; g.say([{ who: 'berta', t: 'Ach du liebe Güte, Jolina! Krümel ist weg! Mein kleines Kätzchen!' }]); });
await page.waitForTimeout(1500); await page.screenshot({ path: 'screenshots/p-dialog.png' });
await browser.close();
