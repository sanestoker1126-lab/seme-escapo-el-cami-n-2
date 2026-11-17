'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const Motion = require('../js/app/marine_motion.js');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('cinemática: pasos y paneo comparten una fase acotada y sin salto al detenerse', () => {
  const mid = Motion.actorMotion(540, 1080, 300, true, 180, 6);
  assert.equal(mid.frame, 3);
  assert.ok(Math.abs(mid.offset - 150) < 1e-9);
  assert.equal(Motion.backgroundPan(mid.offset), -57);
  const end = Motion.actorMotion(1080, 1080, 300, true, 180, 6);
  assert.equal(end.moving, false);
  assert.equal(end.frame, 0);
  assert.equal(end.offset, 300);
  assert.equal(Motion.actorMotion(500, 1080, 300, false).offset, 0);
  const mobileSafeWidth = Motion.actorSafeWidth(412, 24.7, 0.115);
  assert.ok(mobileSafeWidth < 412 - 49.4, 'el grupo reserva margen para avanzar en móvil');
  assert.ok(Math.abs((412 - 49.4 - mobileSafeWidth) - 47.38) < 1e-9);
});

test('cinemática: ciclos con distintas duraciones de frames repiten juntos', () => {
  const sofia = { frames: Array.from({ length: 6 }, (_, i) => ({ src: `s${i}`, ms: 180 })) };
  const estoker = { frames: [{ src: 'e0', ms: 90 }, { src: 'e1', ms: 270 }, { src: 'e2', ms: 180 }] };
  for (const time of [0, 180, 360, 540, 720, 900]) {
    const a = Motion.frameAtPhase(sofia, time, 1080);
    const b = Motion.frameAtPhase(estoker, time, 1080);
    assert.ok(a && b);
    assert.equal(Motion.frameAtPhase(sofia, time + 1080, 1080), a);
    assert.equal(Motion.frameAtPhase(estoker, time + 1080, 1080), b);
  }
});

test('integración marina: helper precargado, fondo ligado al paseo, trajes originales y FX de Poseidón', () => {
  const html = read('Se_Me_Fue_El_Camion.html');
  const sw = read('sw.js');
  const intro = read('js/app/marine_intro.js');
  const css = read('css/marine_intro.css');
  const render = read('js/app/render.js');
  assert.ok(html.indexOf('marine_motion.js') < html.indexOf('marine_intro.js'));
  assert.match(sw, /camion-v58-1-phase4-visual-fx-cache/);
  assert.match(sw, /js\/app\/marine_motion\.js\?v=58\.1/);
  assert.match(intro, /MOTION\.frameAtPhase/);
  assert.match(intro, /MOTION\.backgroundPan\(offset\)/);
  assert.match(intro, /MOTION\.actorSafeWidth\(w,padding,walk\?walk\.distance:0\)/);
  assert.match(css, /--marine-background-pan/);
  assert.match(render, /function drawMarineMotionFX\(/);
  assert.match(render, /f\.state==='windup'/);
  assert.match(render, /f\.state==='charge'/);
  assert.match(render, /f\.state==='dizzy'/);
  assert.match(render, /COMPANIONS_SUB/);
  assert.match(render, /theme === 'submarino' \? COMPANIONS_SUB/);
});
