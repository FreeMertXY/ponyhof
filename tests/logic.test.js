import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from '../src/inventory.js';
import { defaultState, SaveManager, memoryStorage, serialize, deserialize, SAVE_KEY } from '../src/save.js';
import { QuestEngine } from '../src/quests.js';
import { QUESTS } from '../src/data/quests.js';
import { newTameState, tameTick, tameOffer, friendLevel, speedBonus, tricksFor, SPEED } from '../src/horses.js';

function setup() {
  const S = defaultState();
  const inv = new Inventory(S);
  const log = [];
  const ctx = {
    inv, fmt: (t) => t, notify: () => {}, onStart: (q) => log.push('start:' + q.id), onComplete: (q) => log.push('done:' + q.id),
    maxFriendLevel: () => ctx._lv || 1, albumCount: () => ctx._album || 0, isTamed: (id) => (ctx._tamed || []).includes(id),
    tamedCount: () => (ctx._tamed || []).length, regionId: () => ctx._region || 'farm', playerPos: () => ({ x: 0, y: 0 }),
    flag: (n) => S.flags[n], timer: () => {},
  };
  const q = new QuestEngine(S, ctx);
  return { S, inv, q, ctx, log };
}

test('Inventar: hinzufügen, entfernen, verkaufen, Münzen', () => {
  const { inv, S } = setup();
  inv.add('apple', 3);
  assert.equal(inv.count('apple'), 3);
  assert.ok(inv.has('apple', 3));
  assert.equal(inv.remove('apple', 5), false, 'kann nicht mehr entfernen als vorhanden');
  assert.ok(inv.remove('apple', 2));
  assert.equal(inv.count('apple'), 1);
  const c0 = S.player.coins;
  assert.equal(inv.sell('apple', 1), 3);
  assert.equal(S.player.coins, c0 + 3);
  assert.equal(inv.count('apple'), 0);
  assert.equal('apple' in S.inv, false);
  assert.equal(inv.spend(99999), false);
  assert.ok(inv.spend(5));
  assert.equal(inv.sell('letter', 1), 0, 'Aufgabengegenstände sind unverkäuflich');
  assert.throws(() => inv.add('quatsch', 1));
  inv.add('lavender', 4); inv.add('poppy', 2);
  assert.ok(inv.hasAll({ lavender: 4, poppy: 2 }));
  assert.ok(inv.removeAll({ lavender: 4, poppy: 1 }));
  assert.equal(inv.count('poppy'), 1);
  inv.unlock('hat_sun');
  assert.ok(inv.owns('hat_sun'));
});

test('Speichern und Laden (Rundreise)', () => {
  const storage = memoryStorage();
  const sm = new SaveManager(storage);
  assert.equal(sm.has(), false);
  assert.equal(sm.load(), null);
  const S = defaultState();
  S.player.name = 'Jolina';
  S.player.coins = 123;
  S.inv.apple = 7;
  S.horses.push({ id: 'h1', name: 'Sternchen', coat: 'fuchs', pts: 33 });
  S.quests.k1_pflege = { state: 'done' };
  assert.ok(sm.save(S));
  assert.ok(sm.has());
  const L = sm.load();
  assert.equal(L.player.coins, 123);
  assert.equal(L.inv.apple, 7);
  assert.equal(L.horses[0].name, 'Sternchen');
  assert.equal(L.quests.k1_pflege.state, 'done');
});

test('Laden: kaputte Daten werden abgefangen und gesichert', () => {
  const storage = memoryStorage();
  const sm = new SaveManager(storage);
  storage.setItem(SAVE_KEY, '{kaputt');
  assert.equal(sm.load(), null);
  assert.ok(sm.lastError);
  assert.equal(storage.getItem(SAVE_KEY + '.kaputt'), '{kaputt');
  storage.setItem(SAVE_KEY, JSON.stringify({ v: 2, data: { player: { x: 'a' } } }));
  assert.equal(sm.load(), null);
  storage.setItem(SAVE_KEY, JSON.stringify({ v: 99, data: defaultState() }));
  assert.equal(sm.load(), null, 'zukünftige Version wird abgelehnt');
});

test('Laden: alte Version wird migriert und ergänzt', () => {
  const old = defaultState();
  delete old.decoInv; delete old.npcGift; delete old.stats; old.version = 1;
  const L = deserialize(JSON.stringify({ v: 1, data: old }));
  assert.equal(L.version, 2);
  assert.deepEqual(L.decoInv, {});
  assert.equal(typeof L.stats.playSeconds, 'number');
  const s = serialize(L);
  assert.equal(JSON.parse(s).v, 2);
});

test('Einstellungen haben Standardwerte', () => {
  const sm = new SaveManager(memoryStorage());
  const s = sm.loadSettings();
  assert.equal(typeof s.music, 'number');
  sm.saveSettings({ music: 0.1, sfx: 0.2 });
  assert.equal(sm.loadSettings().music, 0.1);
});

test('Aufgaben: erste Aufgabe startet automatisch, Schritte zählen', () => {
  const { q, S, inv } = setup();
  q.refresh();
  assert.ok(q.isActive('k1_pflege'));
  assert.equal(inv.count('carrot'), 3, 'Startgeschenk');
  assert.equal(q.isActive('k1_garten'), false);
  q.emit('pet_horse');
  assert.equal(S.quests.k1_pflege.step, 1);
  q.emit('feed_horse');
  const a = q.talk('hilde');
  assert.equal(a.kind, 'quest');
  a.run();
  assert.ok(q.isDone('k1_pflege'));
  assert.ok(q.isActive('k1_garten'));
  assert.ok(q.isActive('k1_dorf'));
  assert.equal(S.player.coins, 15 + 20);
});

test('Aufgaben: Abgabe prüft Inventar, Nebenaufgaben werden angeboten', () => {
  const { q, S, inv } = setup();
  for (const id of ['k1_pflege', 'k1_dorf', 'k1_garten']) S.quests[id] = { state: 'done' };
  S.flags.kittenFollowing = false;
  q.refresh();
  assert.ok(q.isActive('k1_kruemel'));
  q.talk('berta').run();
  q.emit('find_kitten');
  assert.equal(q.talk('berta').kind, 'wait', 'ohne Kätzchen geht es nicht weiter');
  S.flags.kittenFollowing = true;
  q.talk('berta').run();
  assert.ok(q.isDone('k1_kruemel'));
  assert.ok(q.isAvailable('s_pilze'));
  assert.equal(q.npcHasNews('berta'), 'offer');
  const offer = q.talk('berta');
  assert.equal(offer.kind, 'offer');
  offer.run();
  assert.ok(q.isActive('s_pilze'));
  assert.equal(q.talk('berta').kind, 'missing');
  inv.add('mushroom', 5);
  q.talk('berta').run();
  assert.ok(q.isDone('s_pilze'));
  assert.equal(inv.count('mushroom'), 0);
});

test('Aufgaben: kompletter Durchlauf bis zum Sommerfest', () => {
  const { q, S, inv, ctx } = setup();
  S.flags.kittenFollowing = true;
  q.refresh();
  let guard = 0;
  // simuliert eine Spielerin, die alles erledigt
  while (!q.isActive('k4_fest') && guard++ < 500) {
    const act = q.active();
    assert.ok(act.length > 0, 'es gibt immer eine aktive Aufgabe');
    for (const quest of act) {
      const step = q.step(quest);
      if (!step) continue;
      if (step.type === 'event') {
        if (step.needs) for (const [id, n] of Object.entries(step.needs)) inv.add(id, n);
        if (step.ev === 'tame') ctx._tamed = [...(ctx._tamed || []), 'kleeblatt'];
        q.emit(step.ev, step.filter, step.count);
        q.checkPassive();
      } else if (step.type === 'talk') q.talk(step.npc).run();
      else if (step.type === 'deliver') { for (const [id, n] of Object.entries(step.items)) if (!inv.has(id, n)) inv.add(id, n - inv.count(id)); q.talk(step.npc).run(); }
      else if (step.type === 'reach') { ctx._region = step.region; q.checkPassive(); }
      else if (step.type === 'tame') { ctx._tamed = [...(ctx._tamed || []), step.horse]; q.checkPassive(); }
      else if (step.type === 'talkAll') for (const n of step.npcs) { const a = q.talk(n); if (a && a.run) a.run(); }
      else if (step.type === 'friendship') { ctx._lv = step.level; q.checkPassive(); }
      else if (step.type === 'album') { ctx._album = step.count; q.checkPassive(); }
    }
  }
  assert.ok(q.isActive('k4_fest'), 'Finale erreichbar');
  assert.deepEqual(S.farm, { stable: true, paddock: true, flowerGarden: true, festival: true });
  assert.equal(q.chapter(), 4);
  const a = q.talk('hilde');
  assert.equal(a.kind, 'ending');
  a.run();
  assert.equal(q.chapter(), 5);
  const mp = q.mainProgress();
  assert.equal(mp.done, mp.total);
  assert.ok(QUESTS.length >= 16);
});

test('Aufgaben: Zähm-Aufgabe ist erfüllt, wenn schon vorher gezähmt wurde', () => {
  const { q, S, ctx } = setup();
  for (const id of ['k1_pflege', 'k1_dorf', 'k1_garten', 'k1_kruemel', 'k1_bretter']) S.quests[id] = { state: 'done' };
  ctx._tamed = ['schoko'];
  q.refresh();
  q.talk('hilde').run(); // k2_zaehmen Schritt 1 (Hilde hat mehrere Aufgaben – die erste aktive)
  const zs = S.quests.k2_zaehmen;
  assert.ok(zs.step >= 2 || zs.state === 'done');
});

test('Zähmen: langsam nähern, stehen bleiben, Apfel anbieten', () => {
  const st = newTameState();
  // Rennen macht nervös
  for (let i = 0; i < 60; i++) tameTick(st, 'schuechtern', { dist: 3, speed: SPEED.run, riding: false, dt: 0.05 });
  assert.ok(st.nervous > 0.6 || st.fleeing > 0);
  const st2 = newTameState();
  let fled = false;
  for (let i = 0; i < 200; i++) if (tameTick(st2, 'wild', { dist: 2, speed: 0, riding: true, dt: 0.05 }) === 'fled') fled = true;
  assert.ok(fled, 'reitend flieht Nebel');
  // Stehen beruhigt
  const st3 = newTameState(); st3.nervous = 0.9;
  for (let i = 0; i < 100; i++) tameTick(st3, 'verschmust', { dist: 2, speed: 0, riding: false, dt: 0.05 });
  assert.ok(st3.nervous < 0.2);
  // Leckerli
  const st4 = newTameState();
  assert.equal(tameOffer(st4, 'verschmust', 'apple', 5), 'far');
  st4.nervous = 0.9;
  assert.equal(tameOffer(st4, 'verschmust', 'apple', 1.5), 'nervous');
  st4.nervous = 0;
  assert.equal(tameOffer(st4, 'verschmust', 'apple', 1.5), 'ok');
  assert.equal(tameOffer(st4, 'verschmust', 'apple', 1.5), 'ok');
  assert.equal(tameOffer(st4, 'verschmust', 'apple', 1.5), 'tamed');
  assert.ok(st4.tamed);
  // Hand hinhalten klappt auch ohne Futter, nur langsamer
  const st5 = newTameState();
  assert.equal(tameOffer(st5, 'wild', null, 1), 'ok');
  assert.equal(tameOffer(st5, 'wild', null, 1), 'wait');
  let n = 0;
  while (!st5.tamed && n++ < 100) { st5.handCd = 0; tameOffer(st5, 'wild', null, 1); }
  assert.ok(st5.tamed, 'Zähmen ist auch ohne Äpfel möglich');
});

test('Freundschaft: Level, Tempo, Tricks', () => {
  assert.equal(friendLevel(0), 1);
  assert.equal(friendLevel(20), 2);
  assert.equal(friendLevel(89), 3);
  assert.equal(friendLevel(500), 5);
  assert.ok(speedBonus(140) > speedBonus(0));
  assert.deepEqual(tricksFor(50).map((t) => t.id), ['neigh', 'rear']);
  assert.ok(tricksFor(140).some((t) => t.id === 'bow'));
});
