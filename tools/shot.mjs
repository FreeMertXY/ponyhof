// Screenshot-Werkzeug: node tools/shot.mjs <url-pfad> <ausgabe.png> [breite] [höhe] [wartezeit-ms]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const [,, path='tools/preview.html', out='screenshots/preview.png', w='1200', h='700', wait='800'] = process.argv;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', m => console.log('console:', m.type(), m.text()));
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:8080/' + path);
await page.waitForTimeout(+wait);
await page.screenshot({ path: out });
await browser.close();
