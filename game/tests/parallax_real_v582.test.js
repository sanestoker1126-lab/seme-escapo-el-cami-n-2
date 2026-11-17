'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const crypto=require('node:crypto');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const m=require('../assets/parallax/real_v582/manifest.json');
function file(src){return path.join(root,src);}
test('16 game-ready PNG RGBA 1536x864 with original asset paths intact',()=>{
  assert.equal(m.schema,'seme-fue-el-camion/photophysical-source-preserving-parallax/v582');
  assert.equal(m.policy.no_new_colliders,true);
  assert.equal(m.policy.preserve_original_pixels,true);
  assert.deepEqual(Object.keys(m.worlds),['submarino','espacial','escuela','guadalajara']);
  let count=0;const hashes=new Set();
  for(const [world,config] of Object.entries(m.worlds)){
    assert.equal(config.originalBackgroundsPreserved,true);
    for(const l of config.overlayLayers){
      assert.ok(l.src.startsWith('assets/parallax/real_v582/'+world+'/'));
      assert.ok(l.speed>=0&&l.speed<=1);assert.ok(l.alpha>0&&l.alpha<=1);
      assert.equal(l.uniformScale,1);assert.ok([0,1].includes(l.minQuality));
      assert.equal(l.renderPass,'background_only');
      const b=fs.readFileSync(file(l.src));
      assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),864);
      assert.equal(b[24],8);assert.equal(b[25],6);
      assert.equal(b.length,l.bytes);
      const sha=crypto.createHash('sha256').update(b).digest('hex');
      assert.equal(sha,l.sha256);assert.ok(!hashes.has(sha));hashes.add(sha);count++;
    }
  }
  assert.equal(count,16);
});
test('Canvas module only draws; preserves model state, clips and supports low quality',()=>{
  const c={n:0,saves:0,restores:0,save(){this.saves++;},restore(){this.restores++;},beginPath(){},rect(){},clip(){},drawImage(){this.n++}};
  class FakeImage{constructor(){this.naturalWidth=1536;this.naturalHeight=864;this.onload=null;}
    set src(x){this._src=x;this.onload?.();}}
  const box={Image:FakeImage,CAMION:{}};vm.createContext(box);
  vm.runInContext(fs.readFileSync(file('js/app/parallax_real_v582.js'),'utf8'),box);
  const api=box.CAMION.PARALLAX_REAL_V582;assert.ok(api);
  assert.equal(api.preload('submarino'),4);
  const G={cam:{x:155,y:250},room:null,world:{bounds:{x1:0,x2:1976},scenes:[{theme:'submarino',startY:0,endY:5960}]}};
  const before=JSON.stringify(G);
  let n=api.draw(c,G,{x1:155,x2:1115,y1:250,y2:790},2);
  assert.ok(n>0);assert.equal(n,c.n);assert.equal(c.saves,c.restores);
  assert.equal(before,JSON.stringify(G));
  api.setQuality(0);
  assert.ok(api.draw(c,G,{x1:155,x2:1115,y1:250,y2:790},3)>0);
  api.setEnabled(false);assert.equal(api.draw(c,G,{x1:155,x2:1115,y1:250,y2:790},4),0);
});
