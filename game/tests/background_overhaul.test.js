const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('../js/core/levels.js');
const levels = global.CAMION.LEVELS;
const root = path.resolve(__dirname, '..');
const scenes = levels.MISSIONS.flatMap((mission) => mission.levels);
const phaseOne = new Map([
  ['escuela', 'assets/scenes/overhaul/bg_escuela.webp'],
  ['guadalajara', 'assets/scenes/overhaul/bg_gdl_centro.webp'],
  ['escuela_vecina', 'assets/scenes/overhaul/bg_escuela_patio.webp'],
  ['gdl_noche', 'assets/scenes/overhaul/bg_gdl_noche.webp'],
  ['azoteas', 'assets/scenes/overhaul/bg_azoteas.webp'],
  ['escuela_ruinas', 'assets/scenes/overhaul/bg_escuela_ruinas.webp'],
  ['centro_historico', 'assets/scenes/overhaul/bg_centro_historico.webp'],
  ['portales', 'assets/scenes/overhaul/bg_portales.webp'],
  ['zapopan', 'assets/scenes/overhaul/bg_zapopan.webp'],
  ['arcadas', 'assets/scenes/overhaul/bg_terminal.webp']
]);

test('la campaña mantiene sus 18 niveles agrupados en cuatro mundos', () => {
  assert.equal(scenes.length, 18);
  assert.deepEqual(levels.MISSIONS.map((mission) => mission.id), ['escuela', 'guadalajara', 'submarino', 'espacial']);
  assert.equal(new Set(scenes.map((scene) => scene.id)).size, 18);
});

test('cada uno de los diez fondos de fase 1 existe y coincide con el registro de nivel', () => {
  for (const [id, file] of phaseOne) {
    const scene = scenes.find((candidate) => candidate.id === id);
    assert.ok(scene, `falta el nivel ${id}`);
    assert.equal(scene.file, file, `ruta equivocada para ${id}`);
    assert.ok(fs.existsSync(path.join(root, file)), `no existe ${file}`);
  }
});

test('las ocho escenas restantes conservan sus fondos de origen o procedurales', () => {
  const remaining = scenes.filter((scene) => !phaseOne.has(scene.id));
  assert.equal(remaining.length, 8);
  for (const scene of remaining) {
    if (scene.file) assert.ok(fs.existsSync(path.join(root, scene.file)), `no existe el fondo conservado de ${scene.id}`);
    else assert.ok(scene.bg, `${scene.id} no tiene archivo ni fondo procedural`);
  }
});

test('los suelos antes pintados siguen teniendo la misma geometría y ahora muestran plataformas del motor', () => {
  const school = scenes.find((scene) => scene.id === 'escuela');
  const portales = scenes.find((scene) => scene.id === 'portales');
  assert.ok(school.map.surfaces.length > 0);
  assert.ok(portales.map.surfaces.length > 0);
  assert.notEqual(school.art, 'painted');
  assert.notEqual(portales.art, 'painted');
});
