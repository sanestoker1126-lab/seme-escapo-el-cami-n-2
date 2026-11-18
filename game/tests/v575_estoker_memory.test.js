'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const c={CAMION:{}};
vm.runInNewContext(read('js/app/estoker_anim_data.js'),c);
const anim=c.CAMION.ESTOKER_ANIMS;

test('V57.5: 32 cuadros reales y 4 secuencias con duraciones correctas',()=>{
 const expected={caminar_estoker:[7,170],explicar_estoker:[7,410],caminar_con_sofia:[6,170],conversacion_con_sofia:[12,410]};
 let total=0;
 for(const [name,[n,ms]] of Object.entries(expected)){
  assert.equal(anim[name].frames.length,n);
  for(const f of anim[name].frames){
   assert.equal(f.ms,ms);
   assert.ok(fs.existsSync(path.join(ROOT,f.src)),f.src);
   const b=fs.readFileSync(path.join(ROOT,f.src));
   assert.equal(b.toString('latin1',1,4),'PNG');
   assert.equal(b.readUInt32BE(16),280);assert.equal(b.readUInt32BE(20),384);
  }
  total+=n;
 }
 assert.equal(total,32);
 for(const name of Object.keys(expected)){
  assert.ok(fs.existsSync(path.join(ROOT,`assets/cinematic/estoker_memory/atlases/${name}.png`)));
 }
});

test('V57.5: las 3 versiones de Sofía y 100 cuadros de buceo siguen presentes',()=>{
 const sofia=JSON.parse(read('assets/player/sofia/sofia_buceadora_movimientos.json'));
 assert.equal(Object.keys(sofia.frames).length,100);
 assert.ok(fs.existsSync(path.join(ROOT,'assets/player/sofia/sofia_buceadora_movimientos_rgba.png')));
 for(const look of ['original','rosa','uniforme'])for(let i=0;i<6;i++)
   assert.ok(fs.existsSync(path.join(ROOT,`assets/player/sofia_arrival/${look}/walk_${i}.png`)));
});

test('V57.5: la cinemática narra la visita previa y la leyenda, se puede saltar y pausa el juego',()=>{
 const intro=read('js/app/marine_intro.js'),main=read('js/app/main.js');
 const phrases=['ya estuve aquí','papá Estoker','ciudad perdida','FLASHBACK','tiburones','pirañas','pulpos','corrientes','Poseidón','camión'];
 for(const w of phrases)assert.ok(intro.includes(w),w);
 assert.match(intro,/estoker:'caminar_estoker'/);assert.match(intro,/estoker:'explicar_estoker'/);
 assert.match(intro,/estoker:'caminar_con_sofia'/);assert.match(intro,/estoker:'conversacion_con_sofia'/);
 assert.match(intro,/board:5/);assert.match(intro,/SALTAR CINEMÁTICA/);
 assert.match(intro,/if\(document.hidden\)/);
 assert.match(intro,/NS\.MarineIntro=\{play/);
 assert.match(main,/G\.pause\(\); input\.releaseAll\(\); audio\.pause\(\)/);
 assert.match(main,/G\.resume\(\); input\.releaseAll\(\); acc = 0/);
});

test('V57.5: secuencias y storyboard precargados correctamente en PWA',()=>{
 const sw=read('sw.js'),html=read('Se_Me_Fue_El_Camion.html');
 assert.ok(sw.includes('camion-v58-1-phase4-parallax-real-v582-cache'));
 for(const s of ['js/app/marine_intro.js?v=58.1','js/app/estoker_anim_data.js?v=58.1','css/marine_intro.css?v=58.1'])assert.ok(sw.includes(s));
 assert.ok(html.indexOf('estoker_anim_data.js?v=58.1')<html.indexOf('marine_intro.js?v=58.1'));
 for(const name of ['caminar_estoker','explicar_estoker','caminar_con_sofia','conversacion_con_sofia'])assert.ok(sw.includes(name));
 for(let i=1;i<=5;i++)assert.ok(sw.includes(`assets/cinematic/storyboard_marino/escena_0${i}.webp`));
 assert.ok(fs.existsSync(path.join(ROOT,'PREVIEW_CINEMATICA_ESTOKER.html')));
});
