'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('V58.1 espacial: satélite y bandera se dibujan solo en el ambiente orbital', () => {
  const render = read('js/app/render.js');
  assert.match(render, /function drawSpaceSatellite\(/);
  assert.match(render, /drawSpaceSatellite\(G, V, sc\)/);
  assert.match(render, /function drawSpaceFlag\(/);
  assert.match(render, /drawSpaceFlag\(G, V, sc\)/);
  assert.match(render, /if\s*\(!front\)[\s\S]*drawSpaceSatellite/);
});

test('V58.1 espacial: las plataformas conservan collider existente y reciben aspecto de meteorito', () => {
  const render = read('js/app/render.js');
  const sw = read('sw.js');
  assert.match(render, /function drawSpaceMeteoritePlatform\(/);
  assert.match(render, /p\.theme === 'espacial'[\s\S]*drawSpaceMeteoritePlatform\(p/);
  assert.match(render, /decoracion\.webp/);
  assert.match(render, /p\.x1[\s\S]*p\.x2[\s\S]*p\.y/);
  assert.match(sw, /camion-v58-1-phase4-visual-fx-cache/);
});
