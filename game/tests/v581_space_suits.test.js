'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const render = fs.readFileSync(path.join(ROOT, 'js/app/render.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

test('V58.1 espacio: Sofía conserva astronauta automático y Luna/Morita usan frames sellados fuente', () => {
  assert.match(render, /suitTheme === 'espacial' \? 'astronauta'/, 'Sofía cambia automáticamente al entrar a la misión espacial');
  assert.match(render, /function drawAstronautGear\(/, 'la capa visual astronauta permanece');
  assert.match(render, /const COMPANIONS_SPACE = COMPANIONS_SUB;/, 'el traje espacial felino reutiliza sprites de casco/tanque existentes');
  assert.match(render, /scNow && scNow\.theme === 'espacial' \? COMPANIONS_SPACE : COMPANIONS/, 'el selector activa los trajes durante la escena espacial');
  assert.match(sw, /const SUB_FRAMES=/, 'el service worker construye la lista de sprites sellados');
  assert.match(sw, /assets\/companions\/sub\/\$\{cat\}_idle_sub_0/, 'la lista incorpora sprites fuente de Luna y Morita');
  assert.match(sw, /\.\.\.SUB_FRAMES/, 'el service worker precarga los sprites sellados sin conexión');
  assert.match(sw, /camion-v58-1-phase4-visual-fx-cache/, 'la PWA renueva renderer, trajes, arma y cinemática');

  for (const cat of ['luna', 'morita']) {
    for (let i = 1; i <= 6; i++) {
      const src = `assets/companions/sub/${cat}_idle_sub_0${i}.png`;
      assert.ok(fs.existsSync(path.join(ROOT, src)), `falta sprite sellado ${src}`);
    }
    for (let i = 1; i <= 4; i++) {
      const src = `assets/companions/sub/${cat}_walk_sub_0${i}.png`;
      assert.ok(fs.existsSync(path.join(ROOT, src)), `falta frame de marcha ${src}`);
    }
    const shoulder = `assets/companions/sub/${cat}_shoulder_sub.png`;
    assert.ok(fs.existsSync(path.join(ROOT, shoulder)), `falta sprite al hombro ${shoulder}`);
  }
});
