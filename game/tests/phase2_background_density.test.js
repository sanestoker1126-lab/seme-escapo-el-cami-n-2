// Regresión ECO de fase 2: parallax completo y densidad para mapas ampliados.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers');
const NS = load();
const manifestPath = path.join(__dirname, '..', 'assets/parallax/phase2/manifest.json');

function definitions() {
  return [...NS.LEVELS.LEVEL_SEQUENCE, NS.LEVELS.SUBMARINO_LEVEL, NS.LEVELS.ESPACIAL_LEVEL];
}

test('cada escena declara cuatro capas visuales y sus rutas locales existen', () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.logicalDepthLayers, 4);
  const defs = definitions();
  assert.equal(Object.keys(manifest.scenes).length, defs.length);
  for (const def of defs) {
    const entry = manifest.scenes[def.id];
    assert.ok(entry, `${def.id}: falta mapeo de arte/parallax`);
    assert.equal(entry.world, def.theme, `${def.id}: mundo incorrecto`);
    assert.equal(entry.layers.length, 4, `${def.id}: deben existir cuatro planos visuales`);
    for (const layer of entry.layers) {
      assert.ok(Array.isArray(layer.sources) && layer.sources.length, `${def.id}/${layer.id}: capa vacía`);
      for (const src of layer.sources) {
        if (src.startsWith('assets/')) assert.ok(fs.existsSync(path.join(__dirname, '..', src)), `${def.id}: falta ${src}`);
      }
    }
  }
});

test('las cuatro misiones aumentan enemigos comunes al crecer el recorrido', () => {
  // Conteos de referencia observados en la base de fase 1, dificultad normal.
  const baseline = { escuela: 29, guadalajara: 194, submarino: 13, espacial: 9 };
  for (const mission of NS.LEVELS.MISSIONS) {
    const world = NS.World.buildWorld({ levels: mission.levels, difficulty: 'normal' });
    assert.ok(world.foes.length > baseline[mission.id], `${mission.id}: ${world.foes.length} no supera ${baseline[mission.id]}`);
  }
});
