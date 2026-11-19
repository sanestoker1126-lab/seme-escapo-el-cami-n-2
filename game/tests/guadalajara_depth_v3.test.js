'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const CODE=fs.readFileSync(path.resolve(__dirname,'../js/app/guadalajara_depth_v3.js'),'utf8');
function setup(imagesReady=true,reduced=false){
 const created=[];
 class MockImage{
  constructor(){this.complete=imagesReady;this.naturalWidth=832;this.naturalHeight=1356;created.push(this);}
  set src(v){this.url=v;}
 }
 const s={Image:MockImage,matchMedia:()=>({matches:reduced}),Math};s.globalThis=s;
 vm.createContext(s);vm.runInContext(CODE,s);
 let draws=[],rects=[],ctx={globalAlpha:1,save(){},restore(){},beginPath(){},rect(...p){rects.push(p);},clip(){},drawImage(...p){draws.push(p);}};
 return {api:s.CAMION.GDL_DEPTH_V3,ctx,draws,rects,created};
}
const scene={id:'portales',theme:'guadalajara',gdlProArtwork:true,x0:-258,startY:2200,drawW:516,drawH:840,endY:3040};
const world={view:{w:360,h:480},cam:{x:-210,y:2240}};
const V={x1:-230,y1:2260,x2:150,y2:2740};
test('registered only for the three Guadalajara scenes',()=>{
 const s=setup();assert.equal(s.api.enabledFor('portales'),true);
 assert.equal(s.api.enabledFor('guadalajara'),true);
 assert.equal(s.api.enabledFor('centro_historico'),true);
 assert.equal(s.api.enabledFor('escuela'),false);
 assert.equal(s.api.speeds.length,3);
 for(const sp of s.api.speeds) assert.ok(sp>0&&sp<1);
});
test('renders three RGBA planes and clips them to scene-view intersection',()=>{
 const s=setup();const n=s.api.draw(s.ctx,world,V,scene,1.7);
 assert.equal(n,3);assert.equal(s.draws.length,3);assert.ok(s.rects.length>=1);
 for(const args of s.draws){assert.equal(args.length,9);
  for(const a of args.slice(1))assert.ok(Number.isFinite(a),String(a));
  assert.ok(args[5]>=V.x1-1e-5&&args[5]+args[7]<=V.x2+1e-5);
  assert.ok(args[6]>=V.y1-1e-5&&args[6]+args[8]<=V.y2+1e-5);
  assert.ok(args[7]>0&&args[8]>0);
 }
 assert.equal(scene.gdlProArtwork,true);assert.deepEqual(world.view,{w:360,h:480});
});
test('extreme camera positions and reduced motion do not create negative crop',()=>{
 for(const cam of [{x:-800,y:1500},{x:900,y:7500}]){
  let s=setup(true,true);let G={view:{w:300,h:350},cam};
  const n=s.api.draw(s.ctx,G,{x1:-290,x2:290,y1:2080,y2:3090},scene,1);
  assert.equal(n,3);
  for(const args of s.draws)assert.ok(args[3]>0&&args[4]>0&&args[7]>0&&args[8]>0);
 }
});
test('missing images, unselected scene, and empty intersection fall back safely',()=>{
 let s=setup(false),n=s.api.draw(s.ctx,world,V,scene,1);assert.equal(n,0);
 s=setup();assert.equal(s.api.draw(s.ctx,world,V,{...scene,id:'escuela'},1),0);
 assert.equal(s.api.draw(s.ctx,world,{x1:9000,x2:9200,y1:100,y2:200},scene,1),0);
});
