'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
test('Fase 2: activa las capas ambientales terrestres existentes y registra los SVG nuevos', () => {
  const render = read('js/app/render.js'), sw = read('sw.js');
  const manifest = JSON.parse(read('assets/parallax/manifest.json'));
  assert.match(sw, /const CACHE='camion-v58-1-phase4-parallax-real-v582-cache'/);
  assert.match(sw, /const PARALLAX_REAL=.*assets\/parallax\/real_v582\//);
  assert.match(sw, /js\/app\/parallax_real_v582\.js\?v=58\.1/);
  assert.match(render, /03_ambiente\.webp/);
  assert.match(render, /03_reflejos_luces\.webp/);
  assert.match(render, /05_corriente_profunda\.svg/);
  assert.match(render, /05_nebulosa_distante\.svg/);
  assert.match(sw, /05_corriente_profunda\.svg/);
  assert.match(sw, /05_nebulosa_distante\.svg/);
  assert.match(sw, /03_ambiente\.webp/);
  assert.match(sw, /03_reflejos_luces\.webp/);
  assert.ok(manifest.themes.submarino.some(layer => layer.src.endsWith('05_corriente_profunda.svg')));
  assert.ok(manifest.themes.espacial.some(layer => layer.src.endsWith('05_nebulosa_distante.svg')));
});
test('Fase 2: los fondos nuevos son SVG autónomos, transparentes y de dimensiones aprobadas', () => {
  for (const p of ['assets/parallax/submarino/05_corriente_profunda.svg','assets/parallax/espacial/05_nebulosa_distante.svg']) {
    const src = read(p);
    assert.match(src, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="960" height="1300" viewBox="0 0 1920 2600"/);
    assert.ok(src.trimEnd().endsWith('</svg>'));
    assert.doesNotMatch(src, /\b(?:href|xlink:href)\s*=/i);
    assert.doesNotMatch(src, /<text\b/i);
  }
});
test('Fase 2: la capa espacial frontal mantiene libre el corredor de juego y el mar no pinta cielo cálido', () => {
  const front = read('assets/parallax/espacial/04_primer_plano.svg');
  const structures = read('assets/parallax/espacial/02_estructuras.svg');
  const elements = read('assets/parallax/espacial/03_elementos.svg');
  const render = read('js/app/render.js');
  assert.match(front, /M-45 80/);
  assert.match(front, /M1985 1660/);
  assert.match(structures, /estaciones orbitales distantes/);
  assert.match(elements, /fragmentos y cristales de borde/);
  assert.doesNotMatch(elements, /scale\(1\./);
  assert.match(render, /marineOpening = W\.scenes\[0\]\?\.theme === 'submarino'/);
  assert.match(render, /if \(!marineOpening\) for \(let i = 0; i < 40; i\+\+\)/);
});
