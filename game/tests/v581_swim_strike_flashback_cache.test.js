'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const {load}=require('./helpers');const NS=load();
const dt=1/60;
const idle={left:false,right:false,upHeld:false,downHeld:false,downPressed:false,jumpHeld:false,jumpPressed:false,dashPressed:false,kickPressed:false};
function marine(){const z={kind:'marino',id:'sea',x1:0,x2:800,y:90,y2:2100,deep:true,banks:[]};const W={t:0,waters:[z],solids:[],platforms:[],hazards:[],currents:[],foes:[],shots:[]};const P=NS.Physics.createPlayer(400,400);P.vx=P.vy=0;return {W,P,z};}
test('Entrada acuática activa una sola secuencia de ataque de 0.5s',()=>{
 const {W,P}=marine();NS.Physics.stepPlayer(P,W,idle,dt,[]);
 const events=NS.Physics.stepPlayer(P,W,{...idle,kickPressed:true,right:true},dt,[]);
 NS.Physics.updateState(P,dt);
 assert.equal(P.state,'swimStrike');assert.equal(P.attackSeq,1);assert.equal(P.kickT,.5);assert.ok(events.some(e=>e.type==='kick'&&e.aquatic));
 const other=NS.Physics.stepPlayer(P,W,{...idle,kickPressed:true},dt,[]);
 assert.equal(other.some(e=>e.type==='kick'),false,'cooldown real evita ataques superpuestos');
});
test('Fase de aviso de patada acuática no daña hasta que aparece el impacto',()=>{
 const {W,P,z}=marine();NS.Physics.stepPlayer(P,W,idle,dt,[]);
 P.face=1;P.x=400;P.y=400;P.vx=P.vy=0;
 const foe=NS.Enemies.create('shark',{x:450,y:400,scene:0,waterZone:z,rng:()=>.8,lane:{x1:440,x2:460}});
 foe.spd=0;foe.cool=99;W.foes.push(foe);
 const ctx={active:()=>true,onScreen:()=>true,busy:false,jumpHeld:false,hurtbox:()=>({x1:P.x-12,x2:P.x+12,y1:P.y-20,y2:P.y+20}),hurt:()=>false};
 const ev=[];NS.Physics.stepPlayer(P,W,{...idle,kickPressed:true},dt,ev);
 NS.Enemies.update(W,P,dt,ctx,ev);
 assert.equal(foe.hp,6,'no golpe instantáneo en el primer frame');
 for(let i=0;i<18;i++){W.t+=dt;NS.Physics.stepPlayer(P,W,idle,dt,ev);NS.Enemies.update(W,P,dt,ctx,ev);}
 assert.equal(foe.hp,5,'golpe conectado dentro de la ventana activa');
 for(let i=0;i<9;i++){W.t+=dt;NS.Physics.stepPlayer(P,W,idle,dt,ev);NS.Enemies.update(W,P,dt,ctx,ev);}
 assert.equal(foe.hp,5,'sin daño doble en un único ataque');
});
test('Atlas extraído de fuente auténtica, exactamente 11 cuadros, todos con alpha y dentro de los límites',()=>{
 const j=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/player/sofia/swim_strike_v581.json'),'utf8'));
 assert.equal(j.frames.length,11);assert.ok(j.frames.every(f=>f.source));
 const png=fs.readFileSync(path.join(ROOT,'assets/player/sofia/swim_strike_11frames_v581.png'));
 assert.equal(png.subarray(1,4).toString(),'PNG');
 const w=png.readUInt32BE(16),h=png.readUInt32BE(20);
 assert.equal(w,864);assert.equal(h,648);
 assert.ok(j.frames.every(f=>f.rect[0]>=0&&f.rect[1]>=0&&f.rect[0]+f.rect[2]<=w&&f.rect[1]+f.rect[3]<=h));
 const override=fs.readFileSync(path.join(ROOT,'js/app/sofia_swim_override.js'),'utf8');
 assert.match(override,/attackSheet:.*swim_strike_11frames_v581/);assert.match(override,/"strike":/);
});
test('Estoker y Sofía comparten layout con separación y ancla de suelo',()=>{
 const intro=fs.readFileSync(path.join(ROOT,'js/app/marine_intro.js'),'utf8');
 assert.match(intro,/function layoutActors/); assert.match(intro,/dadX=baseX\+gw\+gap/);
 assert.match(intro,/Math\.min\(layout\.limit,motion\.offset\)/);assert.match(intro,/function setFeetOnGround/);
 assert.match(intro,/ARRIVAL_LOOKS=\{original:'uniforme'/);
});
test('Caché V58.1 no almacena respuestas HTTP fallidas; render restablece estado del canvas',()=>{
 const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
	 assert.match(sw,/camion-v58-1-phase4-visual-fx-cache/);assert.match(sw,/res\.ok && res\.type==='basic'/);
 const render=fs.readFileSync(path.join(ROOT,'js/app/render.js'),'utf8');
 assert.match(render,/ctx\.globalCompositeOperation='source-over'/);
 assert.match(render,/ctx\.filter='none'/);
});
