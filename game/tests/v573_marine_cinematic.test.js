"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load,miniWorld}=require('./helpers');const NS=load();
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const atlas=(()=>{const c={CAMION:{}};vm.runInNewContext(read('js/app/marine_atlases.js'),c);return c.CAMION.MARINE_ATLASES;})();
test('V57.3: cuatro atlas RGBA repaquetados y 129 cuadros reales',()=>{
 let count=0;
 for(const [kind,n] of [['piranha',35],['shark',33],['octopus',37],['poseidon',24]]){
  const a=atlas[kind];assert.equal(a.frames.length,n);
  const buf=fs.readFileSync(path.join(ROOT,a.src));assert.equal(buf.subarray(1,4).toString(),'PNG');
  const W=buf.readUInt32BE(16),H=buf.readUInt32BE(20);
  const [cw,ch]=a.cell;
  for(let i=0;i<n;i++){
   const [x,y,w,h,ox,oy]=a.frames[i];
   assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=W&&y+h<=H);
   assert.ok(ox>=8&&oy>=8&&ox+w<=cw-8&&oy+h<=ch-8);
  }
  for(const action of Object.values(a.animations)){
   assert.ok(action.ids.length>0&&action.ms>0);
   assert.ok(action.ids.every(i=>i>=0&&i<n));
  }
  assert.ok(fs.existsSync(path.join(ROOT,'assets/enemies/marine',kind+'_atlas_v573.json')));
  count+=n;
 }
 assert.equal(count,129);
});
test('V57.3: pulpo y Poseidón funcionan en zonas de agua sin daño antes del aviso',()=>{
 const z={id:'testmar',x1:0,x2:500,y:0,y2:400,deep:true};
 const ctx={active:()=>true,onScreen:()=>true,busy:false,jumpHeld:false,hurtbox:()=>({x1:150,y1:140,x2:210,y2:200}),hurt:()=>{hits++;return true;}};
 let hits=0;
 for(const kind of ['octopus','poseidon']){
  const W=miniWorld();W.waters=[z];W.shots=[];W.foes=[];
  const f=NS.Enemies.create(kind,{x:180,y:170,lane:{x1:70,x2:430},waterZone:z,rng:()=>0.75,diff:NS.CONFIG.difficulty.normal,isBoss:kind==='poseidon',hp:8});
  f.cool=99;f.dir=1;W.foes.push(f);
  const P=NS.Physics.createPlayer(180,170);P.y=170;P.water=z;P.submerged=true;P.vy=0;P.dashT=0;P.kickT=0;
  const start=hits;
  NS.Enemies.update(W,P,1/60,ctx,[]);
  assert.equal(hits,start,kind+' no contact damage while patrolling');
  f.state='windup';f.stateT=0;
  NS.Enemies.update(W,P,1/60,ctx,[]);
  assert.equal(hits,start,kind+' no damage during warning');
  f.state='charge';f.stateT=0;
  NS.Enemies.update(W,P,1/60,ctx,[]);
  assert.ok(hits>start,kind+' contact damage only after warning');
 }
});
test('V57.3: Poseidón al fondo del mar y pulpos en recorrido',()=>{
 const W=NS.World.buildWorld({levels:[NS.LEVELS.SUBMARINO_LEVEL]});
 const boss=W.foes.find(f=>f.kind==='poseidon'&&f.isBoss);
 assert.ok(boss&&boss.waterZone&&boss.waterZone.deep);
 assert.ok(boss.waterZone.y2-boss.y<300,'Boss must be near bottom');
 assert.ok(W.foes.some(f=>f.kind==='octopus'&&!f.isBoss));
 assert.ok(W.foes.some(f=>f.kind==='shark'&&!f.isBoss));
 assert.ok(W.foes.some(f=>f.kind==='piranha'&&!f.isBoss));
});
test('V57.5: flashback extendido de 7 escenas, offline and game pauses',()=>{
 const intro=read('js/app/marine_intro.js'),html=read('Se_Me_Fue_El_Camion.html'),sw=read('sw.js');
 assert.ok(intro.includes('FLASHBACK · LA LEYENDA'));
 assert.ok(intro.includes('NS.MARINE_ATLASES'));
 assert.ok(intro.includes('SALTAR CINEMÁTICA'));
 assert.ok(intro.includes('assets/cinematic/storyboard_marino/'));
 assert.ok(html.includes('marine_intro.js?v=58.1'));
 assert.ok(sw.includes('camion-v58-1-phase4-parallax-real-v582-cache'));
 for(let i=1;i<=5;i++){
  const f=`assets/cinematic/storyboard_marino/escena_0${i}.webp`;
  assert.ok(fs.existsSync(path.join(ROOT,f)));assert.ok(sw.includes(f));
 }
 const main=read('js/app/main.js');assert.ok(main.includes('G.pause(); input.releaseAll(); audio.pause()'));
});
