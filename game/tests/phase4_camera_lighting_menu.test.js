'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const render = read('js/app/render.js');

test('Fase 4: preload devuelve estado booleano tras decode y evita alertas falsas de recursos faltantes', () => {
  const start = render.indexOf('function preload(srcs)');
  const end = render.indexOf('// Resolución adaptativa', start);
  const preload = render.slice(start, end);
  assert.ok(preload.includes('if (!ok) return false'));
  assert.ok(preload.includes('await im.decode()'));
  assert.ok(preload.includes('return true'));
});

test('Fase 4: impactos producen un pulso de cámara pequeño, centrado y opcional', () => {
  assert.match(render, /const pulse = G\.state === 'playing'[\s\S]{0,180}0\.012/);
  assert.match(render, /const shakeX = G\.shakeT[\s\S]{0,140}ropt\.shake/);
  assert.match(render, /cw \* 0\.5 - \(G\.cam\.x \+ v\.w \* 0\.5\) \* k/);
  assert.match(render, /ch \* 0\.5 - \(G\.cam\.y \+ v\.h \* 0\.5\) \* k/);
});

test('Fase 4: iluminación ambiental por mundo es acotada por calidad y no cubre la interfaz', () => {
  assert.match(render, /function drawDynamicLights\(G,V,T\)/);
  assert.match(render, /createRadialGradient/);
  assert.match(render, /globalCompositeOperation='screen'/);
  assert.match(render, /qScale<\.72/);
  const tail = render.slice(render.indexOf('function draw(G, T)'));
  assert.ok(tail.indexOf('drawDynamicLights(G,V,T)') > tail.indexOf('drawPlayer(G, T)'));
  assert.ok(tail.indexOf('drawDynamicLights(G,V,T)') < tail.indexOf('drawRealParallax(G,V,sc,4,5)'));
});

test('Fase 4: el menú reutiliza botones y solo reconstruye estructura si cambia su estado', () => {
  const ui = read('js/app/ui.js');
  assert.match(ui, /let missionBuildKey = null, tramoBuildKey = null/);
  assert.match(ui, /document\.createDocumentFragment\(\)/);
  assert.match(ui, /missionBuildKey !==/);
  assert.match(ui, /tramoBuildKey !==/);
  assert.match(ui, /aria-pressed/);
});

test('Fase 4: menú de escritorio usa dos columnas y móvil conserva una columna desplazable', () => {
  const html = read('Se_Me_Fue_El_Camion.html');
  const css = read('css/game.css');
  assert.match(html, /class="menuHero"/);
  assert.match(html, /class="menuProgress"/);
  assert.match(html, /class="menuOptions"/);
  assert.match(css, /@media\s*\(min-width:\s*760px\)\s*and\s*\(orientation:\s*landscape\)/);
  assert.match(css, /#menu\.menuPanel\s*\{[^}]*display:\s*grid/);
});

test('Fase 4: PWA renueva el caché y precarga el renderer actualizado', () => {
  const sw = read('sw.js');
  assert.match(sw, /const CACHE='camion-v58-1-phase4-visual-fx-cache'/);
  assert.match(sw, /js\/app\/render\.js\?v=58\.1/);
});
