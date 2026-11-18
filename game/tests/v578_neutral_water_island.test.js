/* V57.8 · Pruebas de flotabilidad neutra y sprites de isla. */
'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const ROOT=path.resolve(__dirname,'..');
const {load}=require('./helpers');
const NS=load();
const C=NS.CONFIG, PH=NS.Physics;
const dt=1/60;
const empty={left:false,right:false,upHeld:false,downHeld:false,downPressed:false,jumpHeld:false,jumpPressed:false,dashPressed:false,kickPressed:false};
function marinePlayer(){
 const z={id:'test-mar',scene:0,kind:'marino',x1:0,x2:940,y:100,y2:2900,deep:true,banks:[]};
 const W={waters:[z],solids:[],platforms:[],hazards:[]};
 const P=PH.createPlayer(430,350); P.vy=0;
 for(let i=0;i<1;i++) PH.stepPlayer(P,W,empty,dt,[]);
 assert.equal(P.water,z); return {P,W,z};
}
function step(P,W,inp,n){for(let i=0;i<n;i++){PH.stepPlayer(P,W,{...empty,...inp},dt,[]);PH.updateState(P,dt);}}
test('océano neutro: sin tocar nada no asciende ni desciende',()=>{
 const {P,W}=marinePlayer(); const y=P.y;
 step(P,W,{},240);
 assert.ok(Math.abs(P.y-y)<0.3, 'quieta permanece a la profundidad inicial');
 assert.equal(P.vy,0);
 assert.equal(P.state,'swimHold');
});
test('desciende solo con ABAJO, luego frena sin arrastrarse al fondo',()=>{
 const {P,W}=marinePlayer(); const y=P.y;
 step(P,W,{downHeld:true},150); assert.ok(P.y>y+250, 'avanza durante la brazada hacia abajo');
 assert.ok(P.vy<=C.water.marineDiveMax+0.01); const after=P.y;
 step(P,W,{},120); assert.ok(P.y-after<55, 'frenado tras soltar bajar');
 assert.ok(P.vy===0 || Math.abs(P.vy)<2);
});
test('solo asciende con ARRIBA y frena sin ir a la superficie',()=>{
 const {P,W}=marinePlayer(); const y=P.y;
 step(P,W,{upHeld:true},60); assert.ok(P.y<y-80, 'subida dirigida');
 const after=P.y; step(P,W,{},120); assert.ok(after-P.y<55, 'inercia vertical amortiguada');
 assert.ok(P.y>W.waters[0].y+30,'no flota de vuelta a la superficie');
});
test('al entrar al mar amortigua la velocidad de caída',()=>{
 const {P,W}=marinePlayer(); P.water=null; P.vy=450;
 PH.stepPlayer(P,W,empty,dt,[]); assert.ok(P.vy<C.water.marineEntryMax+1);
});
test('no altera flotación tradicional en lagos',()=>{
 const {P,W}=marinePlayer(); W.waters[0].kind='lago'; P.water=W.waters[0]; P.y=400; P.vy=0;
 step(P,W,{},30); assert.ok(P.vy<0,'el lago sigue empujando hacia arriba');
});
test('las tres versiones de Sofía mantienen pies en un único renglón de atlas',()=>{
 const root=path.join(ROOT,'assets','player','sofia_arrival');
 for(const look of ['original','rosa','uniforme'])for(let i=0;i<6;i++){
   const p=path.join(root,look,'walk_'+i+'.png');assert.ok(fs.existsSync(p),p);
 }
 for(const look of ['original','rosa','uniforme'])assert.ok(fs.existsSync(path.join(root,look,'idle_0.png')));
 const r=fs.readFileSync(path.join(ROOT,'js','app','render.js'),'utf8');
 assert.match(r,/function drawIslandPlayer/); assert.match(r,/ISLAND_FEET_Y = 308/);
 assert.match(r,/drawIslandPlayer\(G, T, alpha\)/);
});
test('100 frames submarinos usan hoja real y animación estabilizar_agua',()=>{
 const js=fs.readFileSync(path.join(ROOT,'js/app/sofia_swim_override.js'),'utf8');
 assert.match(js,/\"hold\"/);assert.match(js,/sofia_buceadora_movimientos_rgba.png/);
 assert.ok(fs.existsSync(path.join(ROOT,'assets/player/sofia/sofia_buceadora_movimientos_rgba.png')));
});
