'use strict';
/* Regresión: en Android el nivel marino se veía como franjas horizontales.
   Causa: los estratos SVG se dibujaban crudos y el navegador los rasterizaba al tamaño de
   destino en píxeles físicos (hasta ~4560×6176 px con zoom 140 %), por encima del límite de
   textura de 4096 px de muchas GPU móviles. Ahora se rasterizan una vez a un lienzo acotado. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const render = fs.readFileSync(path.join(ROOT, 'js/app/render.js'), 'utf8');

function bodyOf(name) {
  const start = render.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' existe');
  let depth = 0, i = render.indexOf('{', start);
  for (let j = i; j < render.length; j++) {
    if (render[j] === '{') depth++;
    else if (render[j] === '}' && --depth === 0) return render.slice(i, j + 1);
  }
  throw new Error('sin cierre: ' + name);
}

test('Marino Android: el lado mayor del SVG rasterizado no supera 4096 px', () => {
  const m = render.match(/const SVG_RASTER_MAX = (\d+);/);
  assert.ok(m, 'SVG_RASTER_MAX definido');
  assert.ok(+m[1] > 0 && +m[1] <= 4096, 'límite de textura seguro para GPU móviles');
  const fn = bodyOf('svgBitmap');
  assert.match(fn, /SVG_RASTER_MAX \/ Math\.max\(iw, ih\)/);
  assert.match(fn, /svgRasters\.set\(src, c\)/, 'se rasteriza una sola vez por archivo');
});

test('Marino Android: los estratos SVG se dibujan desde el mapa de bits acotado, nunca crudos', () => {
  const marine = bodyOf('drawMarineParallax');
  const stratum = marine.slice(marine.indexOf('function stratum('), marine.indexOf('function strip('));
  assert.match(stratum, /const im=svgBitmap\(src\);if\(!im\)return;/);
  assert.doesNotMatch(stratum, /image\(src\)/);
  // Todas las capas que pasan por stratum() son SVG.
  const calls = [...marine.matchAll(/stratum\(list\[(\d)\]/g)].map((x) => +x[1]);
  assert.ok(calls.length >= 4);
  const list = render.match(/submarino: \[([\s\S]*?)\]/)[1].match(/'[^']+'/g).map((s) => s.slice(1, -1));
  for (const i of calls) assert.match(list[i], /\.svg$/, 'list[' + i + '] es SVG');
});

test('Marino Android: svgBitmap devuelve un lienzo acotado y no rompe sin canvas', () => {
  const original = { Image: global.Image, document: global.document, w: global.innerWidth, h: global.innerHeight, dpr: global.devicePixelRatio };
  global.innerWidth = 360; global.innerHeight = 800; global.devicePixelRatio = 2;
  global.Image = class { set src(v) { this._src = v; this.complete = true; this.naturalWidth = 960; this.naturalHeight = 1300; } get src() { return this._src; } };
  const drawn = [];
  global.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage: (...a) => drawn.push(a) }) }) };
  // Expone la función privada solo para esta prueba evaluando el módulo con un gancho.
  const src = render.replace(/\n  NS\.Render = \{/, '\n  NS.__svgBitmap = svgBitmap;\n  NS.Render = {');
  try {
    const NS = (globalThis.CAMION = globalThis.CAMION || {});
    new Function(src)();
    const c = NS.__svgBitmap('assets/parallax/submarino/01_profundidad.svg');
    assert.ok(c, 'devuelve lienzo');
    assert.ok(Math.max(c.width, c.height) <= 2048);
    assert.equal(c.width, 1440); assert.equal(c.height, 1950);
    assert.strictEqual(NS.__svgBitmap('assets/parallax/submarino/01_profundidad.svg'), c, 'cacheado');
    assert.equal(drawn.length, 1, 'rasterizado una sola vez');
    global.document = { createElement: () => { throw new Error('sin memoria'); } };
    assert.equal(NS.__svgBitmap('assets/parallax/submarino/02_estructuras.svg'), null, 'falla de forma segura');
    delete NS.__svgBitmap;
  } finally {
    global.Image = original.Image; global.document = original.document;
    global.innerWidth = original.w; global.innerHeight = original.h; global.devicePixelRatio = original.dpr;
  }
});
