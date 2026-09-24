// Läden: Kaufen und Verkaufen.
import { SHOPS, ACCESSORIES, CLOTHES, DECO } from './data/shop.js';
import { ITEMS } from './data/items.js';
import { iconCanvas } from './draw/icons.js';

// Reine Logik: Kaufen. Gibt 'ok' | 'owned' | 'money' | 'unknown' zurück.
export function shopBuy(inv, type, id, price) {
  if (type === 'item' && !ITEMS[id]) return 'unknown';
  if (type === 'acc' && !ACCESSORIES[id]) return 'unknown';
  if (type === 'cloth' && !CLOTHES[id]) return 'unknown';
  if (type === 'deco' && !DECO[id]) return 'unknown';
  if ((type === 'acc' || type === 'cloth') && inv.owns(id)) return 'owned';
  if (!inv.spend(price)) return 'money';
  if (type === 'item') inv.add(id, 1);
  else if (type === 'deco') inv.addDeco(id, 1);
  else inv.unlock(id);
  return 'ok';
}

export function entryName(type, id) {
  if (type === 'item') return ITEMS[id].name;
  if (type === 'acc') return ACCESSORIES[id].name;
  if (type === 'cloth') return CLOTHES[id].name;
  if (type === 'deco') return DECO[id].name;
  return id;
}

// Laden-Fenster (wird von ui.js als Panel aufgerufen)
export function panelShop(p, shopId) {
  const ui = this, g = ui.game, shop = SHOPS[shopId];
  ui.shopTab = ui.shopTab && ui.shopTabShop === shopId ? ui.shopTab : 0;
  ui.shopTabShop = shopId;
  ui.h(p, `<h2>${shop.title}</h2>`);
  ui.h(p, `<div class="row" style="margin:-6px 0 10px"><span class="sub" style="font-size:15px">„${shop.greet}“</span><span class="spacer"></span><span class="pill" style="box-shadow:none;border-color:#f6e3ea"><i class="ico" data-icon="coin"></i><b>${g.S.player.coins}</b></span></div>`);
  const pill = p.querySelector('i[data-icon=coin]');
  pill.appendChild(iconCanvas('coin', 26));
  const tabs = ui.h(p, '<div class="tabs"></div>');
  const names = shop.tabs.map((t) => t.name).concat(shop.sells ? ['Verkaufen'] : []);
  names.forEach((n, i) => {
    const b = document.createElement('button'); b.className = 'tab' + (ui.shopTab === i ? ' on' : ''); b.textContent = n;
    b.onclick = () => { ui.shopTab = i; ui.render(); };
    tabs.appendChild(b);
  });
  const grid = ui.h(p, '<div class="grid"></div>');
  const desc = ui.h(p, '<div class="desc-box">Klicke etwas an, um es zu kaufen.</div>');
  if (ui.shopTab < shop.tabs.length) {
    for (const [type, id, price] of shop.tabs[ui.shopTab].entries) {
      const owned = (type === 'acc' || type === 'cloth') && g.inv.owns(id);
      const c = document.createElement('div');
      c.className = 'card click' + (owned ? ' locked' : '');
      c.appendChild(iconCanvas(id, 64, type === 'item' ? 'item' : type));
      const have = type === 'item' ? g.inv.count(id) : type === 'deco' ? g.S.decoInv[id] || 0 : 0;
      c.insertAdjacentHTML('beforeend', `<div>${entryName(type, id)}</div><div class="price">${owned ? '✓ gekauft' : price + ' Münzen'}</div>${have ? `<span class="n">${have}</span>` : ''}`);
      c.onclick = () => {
        const r = shopBuy(g.inv, type, id, price);
        if (r === 'ok') {
          g.audio.play('buy');
          ui.toast(`${entryName(type, id)} gekauft!`, iconCanvas(id, 26, type === 'item' ? 'item' : type), 'gold');
          g.requestSave();
          ui.render();
        } else if (r === 'money') { g.audio.play('error'); desc.innerHTML = 'Dafür reichen deine Münzen leider noch nicht. Verkaufe Blumen, Pilze oder Muscheln – oder erfülle Aufgaben!'; }
        else if (r === 'owned') { desc.innerHTML = 'Das hast du schon!'; }
      };
      c.onmouseenter = () => {
        const d = type === 'item' ? ITEMS[id].desc : type === 'acc' ? 'Zubehör für dein Pferd – anlegen im Pferde-Menü (P).' : type === 'deco' ? 'Deko für deinen Hof – aufstellen über die Tasche (I) → Hof-Deko.' : 'Anziehen über die Tasche (I) → Kleidung.';
        desc.innerHTML = `<b>${entryName(type, id)}</b> – ${d}`;
      };
      grid.appendChild(c);
    }
  } else {
    const list = g.inv.list().filter((it) => it.sell > 0);
    if (!list.length) grid.outerHTML = '<div class="empty">Du hast nichts zu verkaufen. Blumen, Pilze, Muscheln und Äpfel kauft Theo gern!</div>';
    for (const it of list) {
      const c = document.createElement('div'); c.className = 'card';
      c.appendChild(iconCanvas(it.id, 64));
      c.insertAdjacentHTML('beforeend', `<div>${it.name}</div><div class="price">${it.sell} Münzen</div><span class="n">${it.n}</span>`);
      const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center'; row.style.marginTop = '6px';
      const b1 = document.createElement('button'); b1.className = 'btn small'; b1.textContent = '1 verkaufen';
      const b2 = document.createElement('button'); b2.className = 'btn small'; b2.textContent = 'alle';
      b1.onclick = () => { const m = g.inv.sell(it.id, 1); if (m) { g.audio.play('coin'); ui.render(); g.requestSave(); } };
      b2.onclick = () => { const m = g.inv.sell(it.id, it.n); if (m) { g.audio.play('coin'); ui.toast(`+${m} Münzen`, 'coin', 'gold'); ui.render(); g.requestSave(); } };
      row.append(b1, b2); c.appendChild(row);
      grid.appendChild(c);
    }
    desc.innerHTML = 'Tipp: Behalte ein paar Äpfel und Karotten für deine Pferde – und Blumen für Aufgaben!';
  }
}
