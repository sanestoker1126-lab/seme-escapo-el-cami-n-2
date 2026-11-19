'use strict';
/* Atlas de astronautas V58.1 (Sofía falda roja / cuadros, Luna = gato blanco, Morita = gato gris). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function loadData() {
  const NS = {};
  new Function('globalThis', read('js/app/space_atlas_data.js'))({ CAMION: NS });
  return NS.SPACE_ATLAS;
}
function pngSize(file) {
  const b = fs.readFileSync(path.join(ROOT, file));
  assert.equal(b.toString('ascii', 1, 4), 'PNG', file + ' es PNG');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

test('Atlas espacial: cuatro personajes, frames dentro de su PNG y animaciones completas', () => {
  const A = loadData();
  assert.deepEqual(Object.keys(A).sort(), ['gato_blanco', 'gato_gris', 'sofia_cuadros', 'sofia_falda_roja']);
  for (const [id, a] of Object.entries(A)) {
    assert.equal(a.image, `assets/space_atlas_v581/${id}.png`);
    const { w, h } = pngSize(a.image);
    assert.ok(w <= 2048 && h <= 2048, id + ': textura dentro del límite seguro para GPU móviles');
    for (const [name, f] of Object.entries(a.frames)) {
      const [x, y, fw, fh, ax, ay, k] = f;
      assert.ok(x >= 0 && y >= 0 && fw > 0 && fh > 0 && x + fw <= w && y + fh <= h, `${id}/${name} dentro del atlas`);
      assert.ok(Number.isFinite(ax) && Number.isFinite(ay) && k > 0, `${id}/${name} ancla y escala válidas`);
    }
    for (const [anim, def] of Object.entries(a.anims)) {
      assert.ok(def.frames.length > 0 && def.ms > 0, `${id}/${anim} no vacía`);
      for (const n of def.frames) assert.ok(a.frames[n], `${id}/${anim} referencia ${n}`);
    }
    for (const need of ['idle', 'walk']) assert.ok(a.anims[need], `${id} tiene ${need}`);
  }
  for (const id of ['sofia_falda_roja', 'sofia_cuadros']) {
    for (const need of ['run', 'jump_launch', 'jump_air', 'land', 'hurt_alt', 'boost', 'shoot']) assert.ok(A[id].anims[need], `${id} tiene ${need}`);
  }
});

test('Atlas espacial: Sofía de pie mide lo mismo que la Sofía actual (≈ 66.7 u) en todos los grupos de origen', () => {
  const A = loadData();
  for (const id of ['sofia_falda_roja', 'sofia_cuadros']) {
    for (const ref of ['idle_01', 'shoot_01']) {
      const f = A[id].frames[ref];
      const worldH = f[5] * f[6]; // del pie (ay) al borde superior del recorte, en unidades de mundo
      assert.ok(worldH > 60 && worldH < 76, `${id}/${ref}: ${worldH.toFixed(1)} u`);
    }
  }
});

test('Atlas espacial: el renderer lo usa con respaldo y la PWA lo precarga', () => {
  const render = read('js/app/render.js'), html = read('Se_Me_Fue_El_Camion.html'), sw = read('sw.js');
  assert.match(render, /function drawSpacePlayer\(G, T, alpha\)/);
  assert.match(render, /outfit === 'astronauta' && drawSpacePlayer\(G, T, alpha\)/, 'si el atlas no carga se usa el dibujo anterior');
  assert.match(render, /uniforme: 'sofia_cuadros', rosa: 'sofia_cuadros'/);
  assert.ok(html.indexOf('js/app/space_atlas_data.js') > 0 && html.indexOf('js/app/space_atlas_data.js') < html.indexOf('js/app/render.js'), 'datos antes del renderer');
  assert.match(sw, /"js\/app\/space_atlas_data\.js\?v=58\.1"/);
  assert.match(sw, /\.\.\.SPACE_ATLAS_V581,/);
  assert.ok(!/cuarentena|sofia_variacion_roja/.test(read('js/app/space_atlas_data.js')), 'la variación en cuarentena no se integra');
});
