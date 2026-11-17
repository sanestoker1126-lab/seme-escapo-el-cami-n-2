"use strict";
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const {load}=require('./helpers');
const NS=load(),ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const imgSize=(pathName)=>{const b=fs.readFileSync(path.join(ROOT,pathName));
  // WebP dimensions are read from Pillow (manifest) so this test validates
  // image magic rather than assuming all WebP subtypes have the same header.
  assert.equal(b.toString('latin1',0,4),'RIFF');assert.equal(b.toString('latin1',8,12),'WEBP');};
test('Marino fase1: siete capas reales y efectos no interactivos',()=>{
 const m=JSON.parse(read('assets/parallax/marino/manifest_v571.json'));
 assert.equal(m.layers.length,7);
 assert.deepEqual(m.layers.map(l=>l.parallax),[.05,.08,.15,.25,.35,.5,.8]);
 for(const l of m.layers)assert.ok(fs.existsSync(path.join(ROOT,l.src)),l.src);
 assert.equal(m.layers[0].width,2304);assert.equal(m.layers[0].height,3072);
 imgSize(m.layers[0].src);imgSize(m.layers[4].src);
 const r=read('js/app/render.js');
 assert.match(r,/function drawMarineParallax\(/);
 assert.match(r,/ctx\.rect\(B\.x1,y1,span\*\.11,y2-y1\)/);
 assert.match(r,/if \(sc\.theme === 'submarino'\) \{ drawMarineParallax/);
});
test('Marino fase1: isla seca, océano amplio, física de inmersión y salida inferiores',()=>{
 const W=NS.World.buildWorld({levels:[NS.LEVELS.SUBMARINO_LEVEL]});
 const z=W.waters.find(z=>z.kind==='marino');
 assert.ok(z&&z.deep);
 assert.equal(z.x1,W.bounds.x1);assert.equal(z.x2,W.bounds.x2);
 assert.ok(W.checkpoints[0].y<z.y);
 const P=NS.Physics.createPlayer(W.checkpoints[0].x,W.checkpoints[0].y);
 P.ground=W.checkpoints[0].plat;
 let entered=false,left=false,landed=false;
 // Descender desde la isla hasta la plataforma inferior requiere ~18.4 s.
 for(let i=0;i<1200;i++){
  const events=NS.Physics.stepPlayer(P,W,{right:i<50,downHeld:i>=50},1/60,[]);
  entered ||=events.some(e=>e.type==='waterEnter');
  left ||=events.some(e=>e.type==='waterExit'&&e.zone.kind==='marino');
  landed ||=P.ground===W.scenes[0].exitPlatform;
  if(landed)break;
 }
 assert.equal(entered,true,'Sofía entra al mar caminando desde la isla');
 assert.equal(left,true,'atraviesa el fondo del agua sin salto vertical');
 assert.equal(landed,true,'alcanza la última plataforma tras bucear');
 assert.ok(!P.water);
});
test('Marino fase1: flashback Estoker pausado y recursos PWA',()=>{
 const intro=read('js/app/marine_intro.js'),main=read('js/app/main.js'),html=read('Se_Me_Fue_El_Camion.html'),sw=read('sw.js');
 for(const token of ['LLEGADA','FLASHBACK','ESTOKER','tiburones','corrientes','BAJAR','DASH'])assert.ok(intro.includes(token),token);
 assert.match(main,/G\.pause\(\); input\.releaseAll\(\); audio\.pause\(\)/);
 assert.match(main,/G\.resume\(\); input\.releaseAll\(\); acc = 0/);
 assert.ok(html.includes('marine_intro.js?v=58.1'));
 assert.ok(sw.includes('marine_intro.css?v=58.1'));
 assert.ok(sw.includes('00_oceano_vertical.webp'));
 assert.ok(fs.existsSync(path.join(ROOT,'assets/cinematic/papito_estoker_provisional.svg')));
});
