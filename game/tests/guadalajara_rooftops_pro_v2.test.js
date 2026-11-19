'use strict';
/* Guadalajara PRO V2 colocado por copias del trazado (ver js/app/guadalajara_rooftops_pro_v2.js).
   Adaptado de la prueba del paquete: el paquete estiraba el fondo a toda la escena, lo que en los mapas
   ampliados de esta versión dejaba 0 de 23 superficies pintadas sobre una plataforma real. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
require('../js/core/levels.js');
const L = globalThis.CAMION.LEVELS;
const mf = JSON.parse(fs.readFileSync(path.join(root, 'assets/scenes/guadalajara_rooftops_pro_v2/guadalajara_pro_v2_manifest.json')));

function makeAPI() {
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 1536; this.naturalHeight = 2504; } set src(s) { this._src = s; } get src() { return this._src; } }
  const host = { Image: FakeImage };
  host.globalThis = host;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/app/guadalajara_rooftops_pro_v2.js'), 'utf8'), host, { timeout: 1000 });
  return host.CAMION.GDL_ROOFTOPS_PRO_V2;
}
const levelMap = (id) => L.LEVEL_SEQUENCE.find((d) => d.id === id).map;

test('las tres escenas, sus fondos y respaldo seguro', () => {
  const api = makeAPI();
  assert.equal(Object.keys(mf.scenes).length, 3);
  for (const k of Object.keys(mf.scenes)) { assert.equal(api.has(k), true); assert.equal(api.background(k), mf.scenes[k].background); }
  assert.equal(api.has('escuela'), false); assert.equal(api.background('no-existe'), null);
});

test('PNG de cornisas con el tamaño del arte y WebP válidos', () => {
  for (const [id, scene] of Object.entries(mf.scenes)) {
    const s = fs.readFileSync(path.join(root, scene.architecture_overlay));
    assert.equal(s.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.deepEqual([s.readUInt32BE(16), s.readUInt32BE(20)], scene.image_size, id + ' tamaño de cornisas');
    const b = fs.readFileSync(path.join(root, scene.background));
    assert.equal(b.toString('ascii', 0, 4), 'RIFF'); assert.equal(b.toString('ascii', 8, 12), 'WEBP');
  }
});

test('con los MAPAS REALES, cada balcón pintado cae sobre una superficie en las dos copias del trazado', () => {
  const api = makeAPI();
  for (const [id, scene] of Object.entries(mf.scenes)) {
    const map = levelMap(id);
    const sc = { id, map, x0: 0, startY: 0, scale: 1, drawW: map.width, drawH: map.height, endY: map.height };
    const tiles = api.tiles(sc);
    assert.equal(tiles.length, 2, id + ': fuente + copia lateral');
    for (const t of tiles) {
      for (const [x1, x2, y] of scene.surfaces) {
        const a = t.x + x1, b = t.x + x2, c = t.y + y;
        assert.ok(map.surfaces.some((s) => Math.abs(s.x1 - a) <= 1 && Math.abs(s.x2 - b) <= 1 && Math.abs(s.y - c) <= 1),
          `${id}: superficie pintada [${a},${b}] y=${c} sin plataforma real`);
      }
    }
  }
});

test('si el mapa no coincide con el tamaño del arte, PRO V2 no se activa', () => {
  const api = makeAPI();
  const map = { width: 700, height: 1100, surfaces: [] };
  assert.equal(api.tiles({ id: 'portales', map, x0: 0, startY: 0, scale: 1 }).length, 0);
  const exp = { ...levelMap('portales') };
  exp.expansion = { ...exp.expansion, sourceWidth: 630 };
  assert.equal(api.tiles({ id: 'portales', map: exp, x0: 0, startY: 0, scale: 1 }).length, 0);
  assert.equal(api.drawBackground({}, {}, { x1: 0, x2: 1, y1: 0, y2: 1 }, { id: 'portales', map, x0: 0, startY: 0, scale: 1 }), false);
});

test('cornisas recortadas a vista ∩ escena ∩ copia, sin tocar el estado del mundo', () => {
  const api = makeAPI();
  const calls = [];
  const ctx = { globalAlpha: 1, save() {}, restore() {}, drawImage(...a) { calls.push(a); } };
  const map = levelMap('portales');
  const sc = { id: 'portales', gdlProArtwork: true, map, x0: -554.32, startY: 1000, scale: 0.82, drawW: map.width * 0.82, drawH: map.height * 0.82 };
  sc.endY = sc.startY + sc.drawH;
  const G = { world: { platforms: [], scenes: [sc] } }, snap = JSON.stringify(G);
  const V = { x1: -600, x2: 600, y1: 1000, y2: 2600 };
  assert.equal(api.draw(ctx, G, V, sc), true);
  assert.equal(calls.length, 2, 'una por copia visible');
  for (const c of calls) {
    const [, , , , , dx, dy, dw, dh] = c;
    assert.ok(dx >= V.x1 - 1e-6 && dx + dw <= V.x2 + 1e-6 && dy >= V.y1 - 1e-6 && dy + dh <= sc.endY + 1e-6);
    assert.ok(dw > 0 && dh > 0);
  }
  assert.equal(JSON.stringify(G), snap);
  assert.equal(api.draw(ctx, G, { x1: 9999, x2: 10200, y1: 10, y2: 120 }, sc), false);
});

test('soportes laterales solo visuales e ignoran plataformas móviles', () => {
  const api = makeAPI();
  const calls = [];
  const ctx = { globalAlpha: 1, save() {}, restore() {}, fillRect(...a) { calls.push(a); } };
  const sc = { id: 'portales', gdlProArtwork: true, index: 0, startY: 0, endY: 840 };
  const G = { world: { scenes: [sc], platforms: [
    { scene: 0, sector: -1, kind: 'floor', x1: -480, x2: -330, y: 310 },
    { scene: 0, sector: 1, kind: 'moving', x1: 330, x2: 430, y: 220 },
    { scene: 0, kind: 'floor', x1: -20, x2: 20, y: 90 }
  ] } };
  const snap = JSON.stringify(G);
  assert.equal(api.drawSideSupports(ctx, G, { x1: -500, x2: 500, y1: 100, y2: 460 }), 1);
  assert.ok(calls.length > 0);
  assert.equal(JSON.stringify(G), snap);
});
