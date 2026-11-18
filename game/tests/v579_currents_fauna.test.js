/* V57.9: corrientes con física controlable, depredadores y estética separada. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers');const NS=load();
const dt=1/60;
const ZERO={left:false,right:false,upHeld:false,downHeld:false,downPressed:false,jumpHeld:false,jumpPressed:false,dashPressed:false};
function world(){return NS.World.buildWorld({levels:[NS.LEVELS.SUBMARINO_LEVEL]});}
function setup(W,x,y){const P=NS.Physics.createPlayer(x,y+31); P.vx=P.vy=0;return P;}
function run(P,W,input,n=120){for(let i=0;i<n;i++){W.t+=dt;NS.Physics.stepPlayer(P,W,{...ZERO,...input},dt,[]);NS.Physics.updateState(P,dt);}}

test('corrientes: seis corredores dentro del océano, fuera de isla y arena final',()=>{
 const W=world(),z=W.waters.find(z=>z.kind==='marino');
 assert.equal(W.currents.length,6);
 assert.ok(W.currents.every(c=>c.water===z&&c.x1>z.x1&&c.x2<z.x2&&c.y1>z.y+290&&c.y2<z.y2-220));
 assert.ok(W.currents.some(c=>c.vx>0));assert.ok(W.currents.some(c=>c.vx<0));
 assert.ok(W.currents.some(c=>c.vy>0));assert.ok(W.currents.some(c=>c.vy<0));
});
test('sin pulsaciones y fuera de corriente: flotación neutra V57.8 intacta',()=>{
 const W=world(),z=W.waters[0],P=setup(W,0,z.y+95),y=P.y;
 run(P,W,ZERO,180);
 assert.ok(Math.abs(P.y-y)<0.25,`flota ${P.y-y}`);
 assert.equal(P.current,null);
});
test('corriente horizontal visible empuja al entrar y se contrarresta con dirección opuesta',()=>{
 const W=world(),c=W.currents.find(c=>c.vx>80),cx=(c.x1+c.x2)/2,cy=(c.y1+c.y2)/2;
 const P=setup(W,cx,cy),x=P.x;
 run(P,W,ZERO,35);
 assert.ok(P.x>x+2,`deriva a la derecha ${P.x-x}`);
 assert.ok(P.current&&P.current.id===c.id,'corriente detectada');
 const before=P.x;run(P,W,{left:true},22);
 assert.ok(P.x<before-7,'puede contracorriente');
});
test('corriente vertical empuja solo dentro de su banda, al salir vuelve neutral',()=>{
 const W=world(),c=W.currents.find(c=>c.vy>60),cx=(c.x1+c.x2)/2,cy=(c.y1+c.y2)/2;
 const P=setup(W,cx,cy),start=P.y;
 run(P,W,ZERO,70);
 assert.ok(P.y>start+5,`resaca vertical ${P.y-start}`);
 P.x=c.x2+120; P.y=cy;P.vy=0;
 run(P,W,ZERO,70);
 assert.ok(Math.abs(P.y-cy)<.5);
 assert.equal(P.current,null);
});
test('depredadores R1: encuentros repartidos y no causan daño antes del aviso',()=>{
 const W=world(),counts=Object.groupBy(W.foes,f=>f.kind);
 assert.ok(counts.piranha.length>=5,'más pirañas');
 assert.ok(counts.shark.length>=4,'más tiburones');
 assert.equal(counts.poseidon.length,1,'un solo jefe');
 const z=W.waters[0];
 for(const f of [...counts.piranha,...counts.shark]){
  assert.ok(f.y>z.y+260&&f.y<z.y2-200,'fuera de entrada y salida');
  assert.equal(NS.Enemies.TYPES[f.kind].contactRequiresCharge,true,'daño en embestida anunciada');
 }
});
test('render: parallax inalterado y señales puramente visuales',()=>{
 const js=fs.readFileSync(path.join(__dirname,'..','js/app/render.js'),'utf8');
 for(const name of ['drawMarineParallax','drawMarineAtmosphere','drawMarineCurrents','drawMarinePredatorSignals'])assert.ok(js.includes(`function ${name}`));
 assert.ok(js.includes('drawMarineCurrents(G,V,T)'));
 assert.ok(js.includes('drawMarinePredatorSignals(G,V,T)'));
});
