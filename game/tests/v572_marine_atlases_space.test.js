'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname,'..');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
function getAtlasses(){
 const ctx={CAMION:{}};
 vm.runInNewContext(read('js/app/marine_atlases.js'),ctx);
 return ctx.CAMION.MARINE_ATLASES;
}
test('R2: marine atlas frames, virtual cell anchors, original PNG sources',()=>{
 const atlas=getAtlasses();
 assert.equal(Object.keys(atlas).length,4);
 for (const [kind,count] of [['piranha',35],['shark',33],['octopus',37],['poseidon',24]]) {
   const d=atlas[kind];
   assert.equal(d.frames.length,count);
   const png=fs.readFileSync(path.join(ROOT,d.src));
   assert.equal(png.toString('latin1',1,4),'PNG');
   const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
   const [cw,ch]=d.cell;
   for (const [x,y,w,h,ox,oy] of d.frames) {
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=width&&y+h<=height);
    assert.ok(ox>=0&&oy>=0&&ox+w<=cw&&oy+h<=ch);
   }
   const names=Object.keys(d.animations);
   assert.ok(names.length>=5);
   for(const a of Object.values(d.animations)){
    assert.ok(a.ids.length>0&&a.ms>0);
    for(const index of a.ids) assert.ok(index>=0&&index<d.frames.length);
   }
 }
});
test('R2: piranhas and shark render through atlas, engine attack logic unchanged',()=>{
 const render=read('js/app/render.js');
 assert.match(render,/function drawMarineEnemySprite\(/);
 assert.match(render,/drawMarineEnemySprite\(f, T\)/);
 assert.match(render,/f\.state === 'charge'/);
 assert.match(render,/f\.state === 'windup'/);
 assert.match(render,/\(ox-cw\*\.5\)\*scale/);
 assert.match(render,/ctx\.scale\(-1,1\)/);
 assert.match(read('js/core/enemies.js'),/contactRequiresCharge: true/);
 assert.ok(!read('js/core/enemies.js').includes('MARINE_ATLASES'));
});
test('R2: space background and 7-layer marine parallax, new PWA cache',()=>{
 const r=read('js/app/render.js'),h=read('Se_Me_Fue_El_Camion.html'),sw=read('sw.js');
 for(const src of ['assets/parallax/espacial/r2/panorama.webp','assets/parallax/espacial/r2/decoracion.webp']){
   const b=fs.readFileSync(path.join(ROOT,src));
   assert.equal(b.toString('latin1',0,4),'RIFF');
   assert.equal(b.toString('latin1',8,12),'WEBP');
   assert.ok(sw.includes(src));
 }
 assert.match(r,/function drawSpaceArtwork\(/);
 assert.match(r,/function drawMarineParallax\(/);
 assert.match(r,/MARINE_SPEED = Object\.freeze\(\[0\.05/);
 assert.ok(h.includes('marine_atlases.js?v=58.1'));
 assert.ok(sw.includes('camion-v58-1-phase4-visual-fx-cache'));
 assert.ok(sw.includes('...MARINE_ATLAS_FILES,...SPACE_R2_FILES'));
});
