'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers');
const NS = load();
const DT = NS.CONFIG.sim.fixedDt;
const idle = { left: false, right: false, jumpPressed: false, jumpHeld: false,
  dashPressed: false, downPressed: false, upHeld: false, downHeld: false,
  kickPressed: false, kickHeld: false };

function makeGame(mission) {
  const save = NS.Game.defaultSave();
  save.missions.espacial = 1;
  const G = NS.Game.createGame({ save });
  G.newRun({ mission, startTramo: 0, seed: 31 });
  const P = G.P, W = G.world;
  W.foes.length = 0; // El fixture mide el arma; los enemigos se agregan explícitamente en sus tests.
  P.x = 0; P.face = 1; P.vx = 0; P.vy = 0;
  const floor = { x1: -120, x2: 120, y: P.y + P.h / 2, prevY: P.y + P.h / 2,
    kind: 'floor', drop: false, h: 8, dx: 0, dy: 0, w: 240, scene: 0, region: 'main' };
  W.platforms.push(floor); P.ground = floor;
  G.updateCamera(0, true);
  G.drainEvents();
  return G;
}
function addTargetDrone(G, x) {
  const P = G.P;
  const f = NS.Enemies.create('drone', { x, y: P.y - 8, lane: { x1: x, x2: x },
    rng: () => 0.99, diff: NS.CONFIG.difficulty.normal, scene: G.tramo, region: G.region });
  f.spd = 0; f.cool = 9; f.baseY = P.y - 8; f.y = f.baseY; f.hp = f.maxHp = 2; f.hitCD = 0;
  G.world.foes = [f];
  return f;
}

test('V58.1: el control de ataque dispara en espacio sin activar la patada', () => {
  const G = makeGame(3);
  assert.equal(G.world.scenes[G.tramo].theme, 'espacial');
  G.step(DT, { ...idle, kickPressed: true, kickHeld: true });
  assert.equal(G.P.kickT, 0, 'el ataque espacial no inicia la animación/colisión de patada');
  assert.equal(G.laserShots.length, 1, 'se crea un proyectil del arma orbital');
  assert.equal(G.laserShots[0].scene, G.tramo);
});

test('V58.1: mantener el ataque repite el disparo solo al vencer la cadencia', () => {
  const G = makeGame(3);
  G.step(DT, { ...idle, kickPressed: true, kickHeld: true });
  for (let i = 0; i < 30; i++) G.step(DT, { ...idle, kickHeld: true });
  assert.equal(G.laserShots.length, 2, 'dos rayos siguen en vuelo y no hay disparos por fotograma');
});

test('V58.1: el láser daña una vez al enemigo al cruzar su hitbox', () => {
  const G = makeGame(3), f = addTargetDrone(G, 108);
  G.step(DT, { ...idle, kickPressed: true, kickHeld: true });
  G.drainEvents();
  for (let i = 0; i < 48 && f.hp === 2; i++) {
    G.step(DT, idle);
    G.drainEvents();
  }
  assert.equal(f.hp, 1, 'el proyectil alcanza al dron y aplica un solo punto de daño');
  assert.ok(f.hitCD > 0, 'el enemigo entra en la ventana anti-impactos repetidos del combate común');
  assert.equal(G.laserShots.length, 0, 'el proyectil desaparece tras el impacto');
});

test('V58.1: un sólido delgado bloquea el láser aun si el paso cruza toda su anchura', () => {
  const G = makeGame(3), f = addTargetDrone(G, 108), P = G.P;
  G.world.solids.push({ x1: P.x + 42, x2: P.x + 44, y1: P.y - 30, y2: P.y + 20, broken: false, open: false });
  G.step(DT, { ...idle, kickPressed: true, kickHeld: true });
  for (let i = 0; i < 18; i++) G.step(DT, idle);
  assert.equal(f.hp, 2, 'el objetivo detrás del obstáculo no recibe daño');
  assert.equal(G.laserShots.length, 0, 'el rayo se consume al tocar el sólido');
});

test('V58.1: la patada sigue activa fuera del mundo espacial', () => {
  const G = makeGame(0);
  assert.notEqual(G.world.scenes[G.tramo].theme, 'espacial');
  G.step(DT, { ...idle, kickPressed: true, kickHeld: true });
  assert.ok(G.P.kickT > 0, 'se conserva la patada en el mundo terrestre');
  assert.equal(G.laserShots.length, 0);
});

test('V58.1: teclado/táctil y HUD anuncian LÁSER en espacio y mantienen la patada fuera de él', () => {
  const root = path.join(__dirname, '..');
  const input = fs.readFileSync(path.join(root, 'js/app/input.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'js/app/ui.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'Se_Me_Fue_El_Camion.html'), 'utf8');
  const render = fs.readFileSync(path.join(root, 'js/app/render.js'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.match(input, /kickHeld:\s*held\.kick/);
  assert.match(ui, /LÁSER/);
  assert.match(html, /LÁSER EN ESPACIO/);
  assert.match(render, /function drawLaserPistol\(/);
  assert.match(render, /G\.laserShots/);
  assert.match(sw, /camion-v58-1-phase4-parallax-real-v582-cache/);
});
