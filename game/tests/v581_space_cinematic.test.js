'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

class FakeNode {
  constructor() { this.listeners = {}; this.dataset = {}; this.style = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this.hidden = false; this.textContent = ''; }
  setAttribute() {}
  addEventListener(type, fn) { this.listeners[type] = fn; }
  querySelector(sel) { if (!this.children.has(sel)) this.children.set(sel, new FakeNode()); return this.children.get(sel); }
  click() { if (this.listeners.click) this.listeners.click({ preventDefault() {}, stopPropagation() {} }); }
  children = new Map();
}
function loadIntro() {
  const listeners = {};
  const document = {
    body: { lastChild: null, appendChild(n) { this.lastChild = n; } },
    createElement() { const n = new FakeNode(); n.setAttribute = () => {}; return n; },
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type) { delete listeners[type]; },
    sendKey(key) { const e = { key, preventDefault() {}, stopImmediatePropagation() {} }; if (listeners.keydown) listeners.keydown(e); }
  };
  const root = { CAMION: {}, document, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, localStorage: { getItem() { return null; }, setItem() {} } };
  root.globalThis = root;
  vm.runInNewContext(read('js/app/space_intro.js'), root);
  return { intro: root.CAMION.SpaceIntro, document };
}

test('V58.1 espacio: cinemática breve presenta la señal, la gravedad orbital y el objetivo', () => {
  const intro = read('js/app/space_intro.js');
  assert.match(intro, /RECONEXIÓN ORBITAL/);
  assert.match(intro, /LA ESTACIÓN A LA DERIVA/);
  assert.match(intro, /ÚLTIMO TRAMO/);
  assert.match(intro, /LÁSER \(X\/U/);
  assert.match(intro, /Sofía, Luna y Morita/);
  assert.match(intro, /SpaceIntro\s*=\s*\{\s*play/);
});

test('V58.1 espacio: los controles pasan, comienzan la misión y permiten saltar con cierre único', () => {
  const { intro, document } = loadIntro();
  let completed = 0;
  assert.equal(intro.play(() => completed++), true);
  assert.equal(intro.active, true);
  assert.equal(intro.scenes.length, 3);
  const overlay = document.body.lastChild;
  const next = overlay.querySelector('.space-intro-next');
  const title = overlay.querySelector('.space-intro-title');
  assert.match(title.textContent, /RECONEXIÓN/);
  next.click();
  assert.match(title.textContent, /ESTACIÓN A LA DERIVA/);
  next.click();
  assert.match(title.textContent, /ÚLTIMO TRAMO/);
  assert.match(next.textContent, /COMENZAR/);
  next.click();
  assert.equal(completed, 1);
  assert.equal(intro.active, false);

  intro.play(() => completed++);
  document.sendKey('ArrowRight');
  assert.match(overlay.querySelector('.space-intro-title').textContent, /ESTACIÓN A LA DERIVA/);
  document.sendKey('Escape');
  assert.equal(completed, 2);
  assert.equal(intro.active, false);
});

test('V58.1 espacio: main activa una vez al iniciar misión 4, no en checkpoints ni con cinemáticas apagadas', () => {
  const main = read('js/app/main.js');
  assert.match(main, /mission === 3 && tramo === 0/);
  assert.match(main, /opt\.cinematics && NS\.SpaceIntro/);
  assert.match(main, /camion-space-cinematic-seen/);
  assert.match(main, /ui\.clearOverlays\(\);\s*G\.pause\(\)/);
  assert.match(main, /G\.pause\(\); input\.releaseAll\(\); audio\.pause\(\)/);
  assert.match(main, /NS\.SpaceIntro\.play\(\(\) =>/);
  assert.match(main, /G\.resume\(\); input\.releaseAll\(\); acc = 0; last = performance\.now\(\)/);
});

test('V58.1 espacio: HTML y PWA cargan el módulo y estilos de cinemática en caché', () => {
  const html = read('Se_Me_Fue_El_Camion.html');
  const sw = read('sw.js');
  assert.match(html, /css\/space_intro\.css\?v=58\.1/);
  assert.match(html, /js\/app\/space_intro\.js\?v=58\.1/);
  assert.match(sw, /camion-v58-1-phase4-parallax-real-v582-cache/);
  assert.match(sw, /css\/space_intro\.css\?v=58\.1/);
  assert.match(sw, /js\/app\/space_intro\.js\?v=58\.1/);
});
