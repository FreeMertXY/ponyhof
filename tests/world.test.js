import test from 'node:test';
import assert from 'node:assert/strict';
import { World, SPOTS, FARM, TRACKS, WW, COL, G } from '../src/world.js';
import { SPECIES } from '../src/data/animals.js';

const farms = [{}, { stable: true, paddock: true, flowerGarden: true, gazebo: true, petcorner: true, festival: true }];

test('Welt ist deterministisch', () => {
  const a = new World({}), b = new World({});
  assert.deepEqual(a.ground, b.ground);
  assert.deepEqual(a.pickups.map((p) => p.id + p.x + p.y), b.pickups.map((p) => p.id + p.x + p.y));
});

test('Pickup-IDs bleiben beim Hofausbau stabil', () => {
  const a = new World({}), b = new World(farms[1]);
  assert.deepEqual(a.pickups.map((p) => p.id + ':' + p.x + ':' + p.y), b.pickups.map((p) => p.id + ':' + p.x + ':' + p.y));
  assert.deepEqual(a.appleTrees.map((t) => t.id), b.appleTrees.map((t) => t.id));
});

test('Kollision: Wasser, Bäume, Furt, Zaun', () => {
  const w = new World({});
  // Startpunkt ist frei
  assert.ok(w.canStand(FARM.spawn.x, FARM.spawn.y));
  // tiefes Wasser im See ist nie begehbar
  assert.equal(w.passable(40, 140, {}), false);
  assert.equal(w.passable(40, 140, { riding: true }), false);
  // Furt: nur zu Pferd
  assert.equal(w.g(28, 147), G.SHALLOW);
  assert.equal(w.passable(28, 147, {}), false);
  assert.equal(w.passable(28, 147, { riding: true }), true);
  // Koppelzaun: niedrig, nur mit Sprung
  const fx = 70, fy = 93;
  assert.equal(w.collAt(fx, fy), COL.LOW);
  assert.equal(w.passable(fx, fy, { riding: true }), false);
  assert.equal(w.passable(fx, fy, { riding: true, jumping: true }), true);
  // Gebäude blockieren
  assert.equal(w.passable(70, 84, { riding: true, jumping: true }), false);
  // Außerhalb der Welt: blockiert
  assert.equal(w.passable(-1, 5), false);
  assert.equal(w.passable(500, 5), false);
});

test('Bewegung stoppt an Hindernissen und rutscht an Wänden entlang', () => {
  const w = new World({});
  const r = w.move(70.5, 89.5, 0, -30, {});
  assert.ok(r.y > 86, 'läuft nicht durch das Haus');
  assert.equal(r.blocked, true);
  const r2 = w.move(FARM.spawn.x, FARM.spawn.y, 3, 0, {});
  assert.equal(r2.blocked, false);
  assert.ok(Math.abs(r2.x - FARM.spawn.x - 3) < 1e-6);
});

for (const farm of farms) {
  test('Alle wichtigen Orte sind erreichbar ' + JSON.stringify(farm), () => {
    const w = new World(farm);
    const walk = w.reachable(FARM.spawn.x, FARM.spawn.y, {});
    const ride = w.reachable(FARM.spawn.x, FARM.spawn.y, { riding: true });
    const near = (set, x, y) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (set[(Math.floor(y) + dy) * WW + Math.floor(x) + dx]) return true;
      return false;
    };
    for (const [k, p] of Object.entries(SPOTS.npc)) assert.ok(near(walk, p.x, p.y), 'NPC ' + k);
    for (const [k, p] of Object.entries(SPOTS.wildHorses)) assert.ok(near(walk, p.x, p.y), 'Wildpferd ' + k);
    assert.ok(near(walk, SPOTS.kitten.x, SPOTS.kitten.y), 'Kätzchen');
    for (const k of ['mailbox', 'dock', 'miraHide', 'kittens', 'show', 'nest', 'hillTop', 'gazebo', 'petcorner']) assert.ok(near(walk, SPOTS[k].x, SPOTS[k].y), 'Ort erreichbar: ' + k);
    assert.ok(near(walk, SPOTS.telescope.x, SPOTS.telescope.y + 1), 'Fernrohr');
    assert.ok(!near(walk, SPOTS.picnic.x, SPOTS.picnic.y), 'Insel zu Fuß nicht erreichbar');
    assert.ok(near(ride, SPOTS.picnic.x, SPOTS.picnic.y), 'Insel zu Pferd erreichbar');
    for (const p of w.pickups) assert.ok(near(ride, p.x, p.y), 'Pickup ' + p.id);
    for (const t of w.appleTrees) assert.ok(near(walk, t.x + 0.5, t.y + 1.5) || near(walk, t.x + 0.5, t.y - 0.5), 'Apfelbaum ' + t.id);
    for (const pl of w.gardenPlots) assert.ok(near(walk, pl.x + 0.5, pl.y + 0.5), 'Beet');
  });
}

test('Rennstrecken sind zu Pferd durchgehend befahrbar', () => {
  for (const farm of farms) {
    const w = new World(farm);
    for (const [k, t] of Object.entries(TRACKS)) {
      for (let i = 0; i < t.length - 1; i++) {
        const [ax, ay] = t[i], [bx, by] = t[i + 1];
        const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 3);
        for (let s = 0; s <= n; s++) {
          const x = ax + ((bx - ax) * s) / n + 0.5, y = ay + ((by - ay) * s) / n + 0.5;
          assert.ok(w.passable(Math.floor(x), Math.floor(y), { riding: true, jumping: true }), `${k} Abschnitt ${i} bei ${x},${y}`);
        }
      }
    }
  }
});

test('Tiere stehen an sinnvollen Orten', () => {
  const w = new World({});
  for (const [id, sp] of Object.entries(SPECIES)) {
    for (const [x, y] of sp.spawns) {
      const c = w.collAt(x, y);
      if (sp.water) assert.ok(w.g(x, y) === G.DEEP || w.g(x, y) === G.SHALLOW, id + ' im Wasser');
      else if (!sp.flying) {
        const f = w.nearestFree(x + 0.5, y + 0.5);
        assert.ok(Math.hypot(f.x - x - 0.5, f.y - y - 0.5) < 3, `${id} bei ${x},${y}: ${c}`);
      }
    }
  }
});

test('Anti-Festhängen: nearestFree findet immer eine freie Stelle', () => {
  const w = new World({});
  const p = w.nearestFree(70.5, 84.5); // mitten im Haus
  assert.ok(w.canStand(p.x, p.y));
  const q = w.nearestFree(40.5, 140.5); // im See
  assert.ok(w.canStand(q.x, q.y));
});
