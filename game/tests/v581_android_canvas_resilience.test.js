'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('Android Canvas: el renderer registra recuperación al perder/restaurar el contexto 2D', () => {
  const render = read('js/app/render.js');
  assert.match(render, /function onCanvasContextLost\(event\)/);
  assert.match(render, /event\.preventDefault\(\)/);
  assert.match(render, /function onCanvasContextRestored\(\)/);
  assert.match(render, /canvas\.getContext\('2d',\s*\{\s*alpha:\s*false\s*\}\)/);
  assert.match(render, /canvas\.addEventListener\('contextlost'/);
  assert.match(render, /canvas\.addEventListener\('contextrestored'/);
  assert.match(render, /if\s*\(contextLost\s*\|\|\s*!ctx\)\s*return/);
});

test('Android Canvas: contextlost pausa el draw y contextrestored vuelve a adquirir el 2D', () => {
  const original = { Image: global.Image, width: global.innerWidth, height: global.innerHeight, dpr: global.devicePixelRatio };
  const calls = { getContext: 0 };
  global.innerWidth = 320; global.innerHeight = 640; global.devicePixelRatio = 2;
  global.Image = class { set src(value) { this._src = value; this.complete = false; this.naturalWidth = 0; } };
  const rendererPath = path.join(ROOT, 'js/app/render.js');
  delete require.cache[require.resolve(rendererPath)];
  try {
    require(rendererPath);
    const listeners = {};
    const fakeContext = { setTransform() {}, fillRect() {} };
    const canvas = {
      style: {}, width: 0, height: 0,
      getContext() { calls.getContext++; return fakeContext; },
      addEventListener(name, fn) { listeners[name] = fn; }
    };
    global.CAMION.Render.init(canvas);
    let prevented = false;
    listeners.contextlost({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.doesNotThrow(() => global.CAMION.Render.draw({}, 0), 'el renderer omite el frame con contexto perdido');
    listeners.contextrestored();
    assert.equal(calls.getContext, 2, 'reobtiene el contexto 2D al restaurarse');
    assert.equal(canvas.width, 528); assert.equal(canvas.height, 1056, 'reconstruye el backing store a DPR limitado');
    assert.doesNotThrow(() => global.CAMION.Render.draw({}, 0), 'el renderer acepta dibujar tras la restauración');
  } finally {
    delete require.cache[require.resolve(rendererPath)];
    if (original.Image === undefined) delete global.Image; else global.Image = original.Image;
    if (original.width === undefined) delete global.innerWidth; else global.innerWidth = original.width;
    if (original.height === undefined) delete global.innerHeight; else global.innerHeight = original.height;
    if (original.dpr === undefined) delete global.devicePixelRatio; else global.devicePixelRatio = original.dpr;
  }
});

test('Android Canvas: la calidad baja reduce decoración pero preserva telegraph visual de Poseidón', () => {
  const render = read('js/app/render.js');
  assert.match(render, /Math\.ceil\(40\s*\*\s*qScale\)/);
  assert.match(render, /Math\.ceil\(\(P\.dashT>0\?7:P\.kickT>0\?5:Math\.min\(4,1\+Math\.floor\(speed\/105\)\)\)\*qScale\)/);
  assert.match(render, /f\.state==='windup'/);
  assert.match(render, /f\.state==='charge'/);
  assert.match(render, /ring\(tipX,tipY/);
});

test('Android Canvas: la caché PWA se invalida para descargar el renderer actualizado', () => {
  const sw = read('sw.js');
  assert.match(sw, /camion-v58-1-phase4-visual-fx-cache/);
});
