// Regresión ECO: cada mundo debe conservar su trazado y extenderse hacia un ala lateral más baja.
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, input } = require('./helpers');
const NS = load();
const LV = NS.LEVELS;
const defs = [...LV.LEVEL_SEQUENCE, LV.SUBMARINO_LEVEL, LV.ESPACIAL_LEVEL];

function uniqueDefs(items) {
  const maps = new Set();
  return items.filter((d) => {
    if (maps.has(d.map)) return false;
    maps.add(d.map);
    return true;
  });
}

test('cada misión conserva inicio/meta únicos y añade continuación lateral descendente', () => {
  assert.equal(LV.MISSIONS.length, 4);
  for (const def of uniqueDefs(defs)) {
    const map = def.map;
    assert.ok(map.expansion, `${def.id}: falta metadato de ampliación`);
    assert.equal(map.expansion.mode, 'side-continuation', def.id);
    assert.ok(map.width >= map.expansion.sourceWidth * 1.9, `${def.id}: ancho no extendido`);
    assert.ok(map.height >= map.expansion.sourceHeight * 1.6, `${def.id}: descenso no extendido`);
    assert.equal(map.surfaces.filter((s) => s.start).length, 1, `${def.id}: punto de inicio duplicado`);
    assert.equal(map.surfaces.filter((s) => s.exit).length, 1, `${def.id}: salida final no única`);
    const links = map.surfaces.filter((s) => s.continuationConnector);
    assert.equal(links.length, 1, `${def.id}: debe existir una conexión lateral`);
    assert.ok(links[0].x1 < links[0].x2, `${def.id}: conexión vacía`);
    assert.ok(links[0].y > map.surfaces.find((s) => s.start).y, `${def.id}: continuación no desciende desde el inicio`);
    assert.ok(map.exitX >= 0 && map.exitX <= map.width, `${def.id}: salida fuera del mapa`);
    for (const surface of map.surfaces) {
      assert.ok(surface.x1 >= 0 && surface.x2 <= map.width, `${def.id}: superficie fuera del ancho`);
      assert.ok(surface.y >= 0 && surface.y <= map.height, `${def.id}: superficie fuera de la altura`);
    }
  }
});

test('los cuatro mundos tienen al menos una misión asociada y mapas de dimensión positiva', () => {
  const byId = new Map(LV.MISSIONS.map((m) => [m.id, m]));
  for (const id of ['escuela', 'guadalajara', 'submarino', 'espacial']) {
    const mission = byId.get(id);
    assert.ok(mission && mission.levels.length, `misión ausente: ${id}`);
    for (const def of mission.levels) {
      assert.ok(def.map.width > 0 && def.map.height > 0, `${id}/${def.id}: dimensiones inválidas`);
    }
  }
});

test('Submarino y Espacio siguen siendo alcanzables en fácil, normal y difícil', () => {
  const { analyze } = require('./reach');
  for (const id of ['submarino', 'espacial']) {
    const mission = LV.MISSIONS.find((m) => m.id === id);
    for (const difficulty of ['facil', 'normal', 'dificil']) {
      const report = analyze(NS.World.buildWorld({ levels: mission.levels, difficulty }), { gems: true });
      assert.deepEqual(report.problems, [], `${id}/${difficulty}: ${report.problems.join('; ')}`);
      assert.ok(report.checks.goalFromStart, `${id}/${difficulty}: meta no alcanzable`);
      assert.ok(report.checks.checkpoints.every(Boolean), `${id}/${difficulty}: checkpoint bloqueado`);
    }
  }
});

test('retry reaparece en el checkpoint intermedio de la misma escena', () => {
  const G = NS.Game.createGame();
  G.setView(390, 844);
  G.newRun({ mission: 0, startTramo: 0 });
  const cp = G.world.checkpoints.find((candidate) => candidate.internal && candidate.scene === 0);
  assert.ok(cp, 'checkpoint intermedio generado');
  G.world.foes.length = 0;
  G.world.hazards.length = 0;
  G.P.x = cp.x; G.P.y = cp.y - G.P.h / 2; G.P.vx = 0; G.P.vy = 0; G.P.ground = cp.plat;
  G.step(1 / 60, input());
  assert.equal(G.checkpoint.id, cp.id, 'se activa al pisar la conexión');
  G.retry();
  assert.equal(G.tramo, 0, 'se conserva la escena actual');
  assert.equal(G.P.ground.id, cp.plat.id, 'vuelve a aparecer sobre la plataforma intermedia');
  assert.equal(G.P.x, cp.x, 'usa la coordenada de reaparición guardada');
});
