// CAMION_DIALOGOS_MUNDOS_V581_20261119 · validación de acceso, guardados y frases.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers');
const NS = load();

test('todas las paradas de los cuatro mundos son accesibles sin trucos de depuración', () => {
  const s = NS.Game.defaultSave();
  assert.equal(NS.LEVELS.MISSIONS.length, 4);
  for (const mission of NS.LEVELS.MISSIONS) {
    assert.ok(mission.levels.length > 0, mission.id);
    assert.equal(s.missions[mission.id], mission.levels.length, mission.id);
  }
  assert.equal(s.unlocked, 1, 'la métrica histórica de progreso no se finge completada');
});
test('un guardado antiguo conserva objetos, récords y victorias al abrir los mundos', () => {
  const save = { unlocked: 2, bestScore: 9205, bestTime: 77, bestDepth: 31,
    wins: 3, items: { credencial: true, tarjeta: true },
    missions: { escuela: 2, guadalajara: 0, submarino: 0, espacial: 0 } };
  const G = NS.Game.createGame({ save });
  assert.equal(G.save.bestScore, 9205);
  assert.equal(G.save.bestTime, 77);
  assert.equal(G.save.bestDepth, 31);
  assert.equal(G.save.wins, 3);
  assert.deepEqual(G.save.items, { credencial: true, tarjeta: true });
  assert.equal(G.save.unlocked, 2);
  for (const mission of NS.LEVELS.MISSIONS) assert.equal(G.save.missions[mission.id], mission.levels.length);
});
test('cada mundo puede arrancar con sus mapas y físicas originales', () => {
  const G = NS.Game.createGame(); G.setView(390, 844);
  NS.LEVELS.MISSIONS.forEach((mission, i) => {
    G.newRun({ mission: i, startTramo: 0, difficulty: 'normal' });
    assert.equal(G.missionId, mission.id);
    assert.equal(G.state, 'playing');
    assert.equal(G.world.scenes.length, mission.levels.length);
    assert.ok(G.P && G.P.ground, mission.id + ': protagonista en suelo/plataforma');
  });
});
test('Sofía, Luna y Morita tienen frases por mundo y las tablas cubren a todos los enemigos', () => {
  for (const mission of NS.LEVELS.MISSIONS) {
    const d=NS.STORY.DIALOGUES[mission.id];
    assert.ok(d?.sofia?.entry);
    for (const cat of ['luna','morita']) {
      assert.ok(d[cat].warning);
      assert.ok(d[cat].assist);
    }
  }
  const types=['rat','dog','bravo','chile','bat','pigeon','kid','piranha',
    'shark','octopus','poseidon','drone','satellite'];
  for (const type of types) assert.ok(NS.STORY.ENEMY_LINES[type], type);
  assert.ok(NS.STORY.ENEMY_LINES.poseidon.challenge);
  assert.ok(NS.STORY.ENEMY_LINES.poseidon.defeated);
});
