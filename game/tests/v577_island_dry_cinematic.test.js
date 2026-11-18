/* V57.7 — Cinemática sobre tierra firme; no cambia simulación del juego. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const intro=read('js/app/marine_intro.js');
const css=read('css/marine_intro.css');
const sw=read('sw.js');

test('La llegada inicia por una calle seca y la revelación ocurre en la isla',()=>{
 const arrival=intro.indexOf("kind:'arrival'");
 const recognize=intro.indexOf("kind:'recognize'");
 const pastWalk=intro.indexOf("kind:'pastWalk'");
 assert.ok(arrival>0 && recognize>arrival && pastWalk>recognize);
 assert.match(intro,/Sofía camina despacio por una calle empedrada sobre tierra firme/);
 assert.match(intro,/Entonces comienza el flashback/);
 assert.match(intro,/s\.kind==='recognize' && elapsed>=1900/);
});

test('Escenas de cine se dibujan usando fondos secos, no storyboard bajo el mar',()=>{
 assert.match(intro,/LANDSCAPES=\{street:DRY\+'calle_llegada.webp',island:DRY\+'isla_recuerdo.webp'\}/);
 assert.match(intro,/index===0\?LANDSCAPES.street:LANDSCAPES.island/);
 for(const f of ['calle_llegada.webp','isla_recuerdo.webp']){
  const stat=fs.statSync(path.join(root,'assets/cinematic/isla_tierra_firme',f));
  assert.ok(stat.size>10000);
 }
});

test('Estoker cuenta la leyenda y las bestias permanecen dentro de la visión submarina',()=>{
 for(const scene of ['pastWalk','legend','warning','mission'])
  assert.match(intro,new RegExp("kind:'"+scene+"'"));
 assert.match(intro,/kind:'warning'.+sofia:'look',estoker:'conversacion_con_sofia'/);
 assert.match(css,/\.marine-vision\{display:none/);
 assert.match(css,/marine-vision\{display:block\}/);
 assert.match(css,/\.marine-beasts\{z-index:3;left:auto;right:4%;top:12%;width:43%;height:36%/);
});

test('Pies alineados con suelo y movimientos lentos independientes de la física',()=>{
 assert.match(intro,/SOFIA_STEP_MS=270/);
 assert.match(intro,/ESTOKER_WALK_SLOW=1\.9/);
 assert.match(intro,/setFeetOnGround\(sofiaBox,src\)/);
 assert.match(intro,/setFeetOnGround\(estokerBox,est\)/);
 assert.match(css,/--marine-ground-line:30%/);
 assert.match(css,/url\('\.\.\/assets\/platforms\/concrete\.png'\)/);
});

test('Caché PWA y versión incluyendo nuevos fondos',()=>{
 assert.match(sw,/camion-v58-1-phase4-parallax-real-v582-cache/);
 assert.match(sw,/CINEMATIC_ISLAND/);
 assert.match(sw,/assets\/cinematic\/isla_tierra_firme\/calle_llegada\.webp/);
 assert.match(sw,/assets\/cinematic\/isla_tierra_firme\/isla_recuerdo\.webp/);
 assert.match(read('Se_Me_Fue_El_Camion.html'),/marine_intro\.js\?v=58\.1/);
 assert.match(read('js/core/config.js'),/version: '58\.1\.0'/);
});
