'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, miniWorld, input } = require('./helpers');
const NS = load();
const dt = 1 / 60;

function world(theme) {
  const W = miniWorld({ platforms: [{ x1: -400, x2: 400, y: 0 }] });
  W.scenes = [{ theme, startY: -1000, endY: 1000 }];
  W.sceneAt = () => 0;
  return W;
}
function step(P, W, inp, n = 1) {
  for (let i = 0; i < n; i++) NS.Physics.stepPlayer(P, W, input(inp), dt, []);
}

test('V58.1 espacio: gravedad orbital menor y salto calibrado de trayectoria más pausada', () => {
  const earth = world('escuela'), space = world('espacial');
  const PE = NS.Physics.createPlayer(0, -220), PS = NS.Physics.createPlayer(0, -220);
  step(PE, earth, {}); step(PS, space, {});
  assert.ok(PS.vy < PE.vy, `aceleración vertical espacial ${PS.vy} debe ser menor que terrestre ${PE.vy}`);

  const JE = NS.Physics.createPlayer(0, 0), JS = NS.Physics.createPlayer(0, 0);
  JE.ground = earth.platforms[0]; JS.ground = space.platforms[0];
  step(JE, earth, { jumpPressed: true, jumpHeld: true });
  step(JS, space, { jumpPressed: true, jumpHeld: true });
  assert.ok(Math.abs(JS.vy) < Math.abs(JE.vy), 'el impulso de salto se escala con la gravedad reducida');
});

test('V58.1 espacio: inercia aérea mayor, pero la entrada opuesta conserva capacidad de maniobra', () => {
  const earth = world('escuela'), space = world('espacial');
  const PE = NS.Physics.createPlayer(0, -220), PS = NS.Physics.createPlayer(0, -220);
  PE.vx = PS.vx = 300;
  step(PE, earth, {}, 30); step(PS, space, {}, 30);
  assert.ok(PS.vx > PE.vx + 20, `la inercia espacial debe conservar más velocidad: espacio=${PS.vx}, tierra=${PE.vx}`);

  const before = PS.vx;
  step(PS, space, { left: true }, 6);
  assert.ok(PS.vx < before, 'contramaniobra izquierda reduce el impulso a derecha');
});

test('V58.1 espacio: fuera del volumen orbital se conserva gravedad terrestre y se invalida la caché PWA', () => {
  const space = world('espacial'), earth = world('escuela');
  space.scenes[0].startY = -100; space.scenes[0].endY = 100;
  const PE = NS.Physics.createPlayer(0, 200), PO = NS.Physics.createPlayer(0, 200);
  step(PE, earth, {}); step(PO, space, {});
  assert.equal(PO.vy, PE.vy, 'el perfil espacial termina al salir del volumen de escena');

  const sw = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'sw.js'), 'utf8');
  assert.match(sw, /camion-v58-1-phase4-visual-fx-cache/);
});
