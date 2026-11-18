'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers');
const NS = load();
const ROOT = path.join(__dirname, '..');
const render = fs.readFileSync(path.join(ROOT, 'js/app/render.js'), 'utf8');
const source = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('Fase 3: meteoritos ambientales siguen la cámara y no crean colisiones', () => {
  assert.match(render, /function drawSpaceMeteorField\(G,V,T\)/);
  assert.match(render, /sc\.theme!=='espacial'/);
  assert.match(render, /ctx\.rect\(x1,y1,x2-x1,y2-y1\);ctx\.clip\(\)/);
  assert.match(render, /drawSpaceMeteorField\(G,V,T\)/);
  assert.match(render, /Decorativos|no crean objetos ni colisionadores/);
  assert.doesNotMatch(render, /__phase3MeteorDebug/);
  assert.match(render, /for\(let attempt=0;attempt<8&&!clear;attempt\+\+\)/);
  assert.match(render, /Math\.abs\(x-G\.P\.x\)<105/);
  const drawTail = render.slice(render.indexOf('function draw(G, T)'));
  assert.ok(drawTail.indexOf('drawSpaceMeteorField(G,V,T)') > drawTail.indexOf('drawRealParallax(G,V,sc,5,6)'),
    'meteoritos sobre el plano parallax para que sean visibles');
  assert.doesNotMatch(render.slice(render.indexOf('function drawSpaceMeteorField'), render.indexOf('function drawMarineParallax')), /\.foes\.push|\.platforms\.push|EN\.create/);
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/parallax/espacial/r2/decoracion.webp')),
    'conserva el arte fuente que también texturiza las plataformas meteoríticas');
});

test('Fase 3: partículas marinas deterministas, limitadas por calidad y dentro del agua', () => {
  const start = render.indexOf('function drawMarineAtmosphere');
  const end = render.indexOf('function drawMarineCurrents', start);
  const marine = render.slice(start, end);
  assert.notEqual(start, -1);
  assert.match(marine, /const vents=qScale<\.72\?2:4, bubbles=qScale<\.72\?3:5/);
  assert.match(marine, /if\(x<bx\|\|x>ex\|\|y<by\|\|y>ey\)continue/);
  assert.match(marine, /ring\(x,y,r\+\.35,r\+\.35/);
  assert.match(marine, /phase=\(\(T\*\.16/);
  assert.match(source('js/core/game.js'), /if \(G\.waterFx\.length > 40\)/,
    'el pool existente de FX de agua sigue limitado');
});

test('Fase 3: el service worker invalida caché previa y precarga el renderer', () => {
  const sw = source('sw.js');
  assert.match(sw, /const CACHE='camion-v58-1-phase4-parallax-real-v582-cache'/);
  assert.match(sw, /js\/app\/render\.js\?v=58\.1/);
});

test('Fase 3: Poseidón destaca visualmente, pero conserva hitbox, IA y telegraphs', () => {
  assert.match(render, /f\.kind === 'poseidon' \? \(f\.isBoss \? 1\.55 : 1\.36\)/);
  assert.match(render, /if\(f\.isBoss\)\{[\s\S]{0,300}ring\(f\.x,f\.y,f\.w\*\(\.78\+pulse\*\.1\)/);
  const enemyCode = source('js/core/enemies.js');
  assert.match(enemyCode, /case 'poseidon'/);
  assert.match(enemyCode, /f\.state === 'windup'/);
  assert.match(enemyCode, /setState\(f, 'charge'\)/);
  assert.match(enemyCode, /setState\(f, 'dizzy'\)/);
  const W = NS.World.buildWorld({ levels: [NS.LEVELS.SUBMARINO_LEVEL] });
  const boss = W.foes.find((f) => f.kind === 'poseidon' && f.isBoss);
  assert.ok(boss && boss.waterZone && boss.waterZone.deep, 'Poseidón sigue en la poza profunda de la misión');
  assert.ok(boss.hp > 0 && boss.w > 0 && boss.h > 0, 'hitbox y salud siguen definidos por el gameplay original');
});
