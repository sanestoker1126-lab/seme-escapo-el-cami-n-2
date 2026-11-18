'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const m=require('../assets/parallax/eco_v581/manifest.json');
function source(p){return path.join(root,p);}
test('10 independent PNG RGBA 768x768 layers with valid manifest',()=>{
  assert.equal(m.schema,'seme-fue-el-camion/parallax-eco-v581/v1');
  assert.equal(m.policy.gameplay_colliders,false);
  const entries=Object.entries(m.worlds),total=entries.reduce((n,[,v])=>n+v.overlayLayers.length,0);
  assert.deepEqual(entries.map(([name])=>name),['submarino','espacial','escuela','guadalajara']);
  assert.equal(total,10);
  for(const [world,data] of entries){
    assert.ok(data.originalBackgroundsPreserved);
    for(const l of data.overlayLayers){
      assert.ok(l.src.startsWith('assets/parallax/eco_v581/'+world+'/'));
      assert.ok(l.alpha>0&&l.alpha<=1);assert.ok(l.speed>=0&&l.speed<=1);
      assert.ok(l.uniformScale>0);assert.equal(l.layer,'background_only');
      const b=fs.readFileSync(source(l.src));
      assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.equal(b.readUInt32BE(16),768);assert.equal(b.readUInt32BE(20),768);
      assert.equal(b[24],8);assert.equal(b[25],6); // RGBA8888
      assert.equal(b.length,l.bytes);
    }
  }
});
test('JS reads but does not mutate game state and restores canvas state',()=>{
  const drawing={n:0,save(){},restore(){},beginPath(){},rect(){},clip(){},drawImage(){this.n++}};
  class FakeImage{constructor(){this.naturalWidth=768;this.naturalHeight=768;this.onload=null;}
    set src(s){this._src=s;if(this.onload)this.onload();}}
  const box={Image:FakeImage, CAMION:{}};vm.createContext(box);
  vm.runInContext(fs.readFileSync(source('js/app/parallax_eco_v581.js'),'utf8'),box);
  const api=box.CAMION.PARALLAX_ECO_V581;assert.ok(api);
  api.preload('submarino');
  const G={cam:{x:100,y:250},room:null,world:{bounds:{x1:0,x2:1976},scenes:[{theme:'submarino',startY:0,endY:5960}]}};
  const before=JSON.stringify(G);
  const drawn=api.draw(drawing,G,{x1:100,x2:1000,y1:250,y2:790},1);
  assert.ok(drawn>0);assert.equal(before,JSON.stringify(G));
  assert.equal(drawn,drawing.n);
  api.setQuality('low');api.draw(drawing,G,{x1:100,x2:1000,y1:250,y2:790},3);
  api.setEnabled(false);assert.equal(api.draw(drawing,G,{x1:100,x2:1000,y1:250,y2:790},4),0);
});
