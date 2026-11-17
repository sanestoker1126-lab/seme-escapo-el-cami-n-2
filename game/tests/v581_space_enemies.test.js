const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load, miniWorld } = require('./helpers');

const NS = load();
const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function combatContext(hurtbox = () => ({ x1: 500, y1: 500, x2: 520, y2: 520 })) {
  return {
    active: () => true,
    onScreen: () => true,
    hurtbox,
    hurt: () => true,
    busy: false,
    jumpHeld: false
  };
}

function player(x = 190, y = 0) {
  return { x, y, w: 32, h: 62, vy: 0, prevFoot: y + 31, kickT: 0, attackSeq: 0,
    dashT: 0, dead: false, water: null, face: 1 };
}

test('el roster espacial usa drones y torretas satelitales, y conserva al dron Centinela como jefe', () => {
  const world = NS.World.buildWorld({ levels: [NS.LEVELS.ESPACIAL_LEVEL], seed: 20261117 });
  const regular = world.foes.filter((f) => !f.isBoss);
  assert.ok(regular.some((f) => f.kind === 'drone'), 'debe conservar drones patrulla');
  assert.ok(regular.some((f) => f.kind === 'satellite'), 'debe incorporar torretas satelitales comunes');
  assert.ok(world.foes.some((f) => f.kind === 'drone' && f.isBoss && f.bossName === 'DRON CENTINELA'), 'el jefe existente debe conservarse');
  assert.ok(!regular.some((f) => f.kind === 'chile'), 'el chile no debe aparecer en la misión orbital');

  const terrestrial = NS.World.buildWorld({ levels: [NS.LEVELS.LEVEL_SEQUENCE[0]], seed: 20261117 });
  assert.ok(!terrestrial.foes.some((f) => f.kind === 'satellite'), 'la torreta debe quedar limitada al tema espacial');
});

test('la torreta avisa, fija el punto de mira y lanza un plasma esquivable', () => {
  assert.ok(NS.Enemies.TYPES.satellite, 'falta el arquetipo de torreta satelital');
  const W = miniWorld();
  const f = NS.Enemies.create('satellite', { x: 0, y: 0, lane: { x1: 0, x2: 0 }, scene: 0,
    diff: NS.CONFIG.difficulty.normal, rng: () => 0.75 });
  f.cool = 0;
  W.foes.push(f);
  const P = player(190, 24), ctx = combatContext(), events = [];
  NS.Enemies.update(W, P, 1 / 60, ctx, events);
  assert.equal(f.state, 'aim', 'primero debe comunicar su ataque');
  assert.ok(events.some((e) => e.type === 'foeAlert' && e.foe === f));
  const targetX = f.targetX, targetY = f.targetY;
  P.x = 270; P.y = 62;
  const steps = Math.ceil(NS.Enemies.TYPES.satellite.windup * f.reaction * 60) + 2;
  for (let i = 0; i < steps && !W.shots.length; i++) NS.Enemies.update(W, P, 1 / 60, ctx, events);
  assert.equal(W.shots.length, 1, 'debe emitir un único disparo al terminar el aviso');
  const shot = W.shots[0];
  assert.equal(shot.kind, 'plasma');
  assert.equal(shot.from, f.id);
  const expected = Math.atan2(targetY - f.y, targetX - f.x);
  assert.ok(Math.abs(Math.atan2(shot.vy, shot.vx) - expected) < 0.03, 'el proyectil debe conservar el blanco fijado al inicio del aviso');
  assert.ok(events.some((e) => e.type === 'shoot' && e.foe === f));
});

test('la torreta no inicia el aviso a través de un sólido ni daña por contacto pasivo', () => {
  assert.ok(NS.Enemies.TYPES.satellite, 'falta el arquetipo de torreta satelital');
  const wall = { x1: 70, x2: 90, y1: -35, y2: 35 };
  const W = miniWorld({ solids: [wall] });
  const f = NS.Enemies.create('satellite', { x: 0, y: 0, lane: { x1: 0, x2: 0 }, scene: 0,
    diff: NS.CONFIG.difficulty.normal, rng: () => 0.5 });
  f.cool = 0; W.foes.push(f);
  const P = player(190, 0), events = [];
  NS.Enemies.update(W, P, 1 / 60, combatContext(), events);
  assert.equal(f.state, 'idle', 'un obstáculo sólido debe bloquear adquisición del objetivo');
  assert.ok(!events.some((e) => e.type === 'foeAlert'));

  const touching = miniWorld();
  const turret = NS.Enemies.create('satellite', { x: 0, y: 0, lane: { x1: 0, x2: 0 }, scene: 0,
    diff: NS.CONFIG.difficulty.normal, rng: () => 0.5 });
  turret.cool = 9; touching.foes.push(turret);
  const touchPlayer = player(0, 250);
  turret.cool = 1;
  let damage = 0;
  const ctx = combatContext(() => ({ x1: -20, y1: -20, x2: 20, y2: 20 }));
  ctx.hurt = () => { damage++; return true; };
  NS.Enemies.update(touching, touchPlayer, 1 / 60, ctx, []);
  assert.equal(damage, 0, 'el contacto pasivo durante idle no debe dañar');
  assert.equal(turret.state, 'idle');
});

test('el láser del jugador daña la torreta por el pipeline de combate común', () => {
  const save = NS.Game.defaultSave();
  save.missions.espacial = 1;
  const G = NS.Game.createGame({ save });
  G.newRun({ mission: 3, startTramo: 0, seed: 31 });
  const P = G.P, W = G.world;
  W.foes.length = 0;
  P.x = 0; P.face = 1; P.vx = 0; P.vy = 0;
  const floor = { x1: -120, x2: 120, y: P.y + P.h / 2, prevY: P.y + P.h / 2,
    kind: 'floor', drop: false, h: 8, dx: 0, dy: 0, w: 240, scene: 0, region: 'main' };
  W.platforms.push(floor); P.ground = floor;
  const f = NS.Enemies.create('satellite', { x: 112, y: P.y - 8, lane: { x1: 112, x2: 112 },
    rng: () => 0.99, diff: NS.CONFIG.difficulty.normal, scene: 0, region: 'main' });
  f.cool = 9; f.baseY = f.y; W.foes.push(f);
  G.updateCamera(0, true); G.drainEvents();
  const idle = { left: false, right: false, jumpPressed: false, jumpHeld: false, dashPressed: false,
    downPressed: false, upHeld: false, downHeld: false, kickPressed: false, kickHeld: false };
  G.step(NS.CONFIG.sim.fixedDt, { ...idle, kickPressed: true, kickHeld: true });
  for (let i = 0; i < 48 && f.hp === 2; i++) G.step(NS.CONFIG.sim.fixedDt, idle);
  assert.equal(f.hp, 1, 'el impacto láser debe descontar un punto de vida');
  assert.equal(f.state, 'dizzy', 'el impacto abre su ventana vulnerable');
  assert.equal(G.laserShots.length, 0, 'el rayo se consume al confirmar el impacto');
});

test('el renderer reutiliza el atlas orbital existente para la torreta y el HUD explica cómo responder', () => {
  const render = read('js/app/render.js');
  const main = read('js/app/main.js');
  const sw = read('sw.js');
  assert.match(render, /f\.kind === 'satellite'/);
  assert.match(render, /assets\/parallax\/espacial\/r2\/decoracion\.webp/);
  assert.match(main, /satellite\s*:/);
  assert.match(sw, /SPACE_R2_FILES/);
});
