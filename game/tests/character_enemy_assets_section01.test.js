'use strict';
// Source-locked QA for the first character/enemy asset production section.
// Never edits, extracts, or replaces original sprite pixels.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const catalog=require('../assets/production/character_enemy_section01.json');
const disk=rel=>path.join(ROOT,rel);
function pngInfo(rel){
  const file=disk(rel),f=fs.openSync(file,'r'),b=Buffer.alloc(24);
  try { assert.equal(fs.readSync(f,b,0,24,0),24,rel+' truncated'); }
  finally { fs.closeSync(f); }
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',rel+' invalid PNG');
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);
  assert.ok(w>0&&h>0&&w<=16384&&h<=16384,rel+' invalid dimensions');
  return {w,h};
}
test('marine enemy source atlases have valid frames, source paths and runtime coordinates',()=>{
  const sandbox={};vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(disk('js/app/marine_atlases.js'),'utf8'),sandbox);
  const loaded=sandbox.CAMION.MARINE_ATLASES;
  assert.equal(catalog.marine_enemies.length,4);
  for(const entry of catalog.marine_enemies){
    const meta=JSON.parse(fs.readFileSync(disk(entry.metadata),'utf8'));
    const runtime=loaded[entry.id];
    assert.ok(runtime,entry.id+' missing from runtime');
    assert.equal(runtime.src,entry.atlas);
    const {w,h}=pngInfo(entry.atlas);
    assert.equal(meta.frames_count,entry.frames);
    assert.equal(runtime.frames.length,entry.frames);
    assert.deepEqual(Array.from(runtime.cell),entry.source_cell_px);
    const sourceFrames=Object.values(meta.frames);
    assert.equal(sourceFrames.length,entry.frames);
    for(let i=0;i<entry.frames;i++){
      const frame=runtime.frames[i],sidecar=sourceFrames[i],r=sidecar.rect;
      assert.deepEqual(Array.from(frame),r,entry.id+' frame '+i+' mismatch');
      const [x,y,sw,sh,ox,oy]=frame;
      assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&sw>0&&sh>0,entry.id+' invalid rect '+i);
      assert.ok(x>=0&&y>=0&&x+sw<=w&&y+sh<=h,entry.id+' overflow '+i);
      assert.ok(ox>=0&&oy>=0&&ox+sw<=runtime.cell[0]&&oy+sh<=runtime.cell[1],entry.id+' cell overflow '+i);
      assert.equal(typeof sidecar.state,'string');
      const original=entry.frames_directory+entry.source_prefix+String(i).padStart(3,'0')+'.png';
      pngInfo(original);
    }
    for(const [state,anim] of Object.entries(runtime.animations)){
      assert.ok(anim.ids.length>0&&anim.ms>0&&typeof anim.loop==='boolean',entry.id+' '+state);
      for(const id of anim.ids){assert.ok(Number.isInteger(id)&&id>=0&&id<entry.frames,entry.id+' invalid id '+id);}
    }
  }
});
test('Sofía arrival variants resolve to real original assets with bottom/center pivot',()=>{
  const variants=catalog.characters.sofia.arrival.variants;
  assert.equal(variants.length,3);
  for(const v of variants){
    assert.deepEqual(pngInfo(v.atlas),{w:3840,h:320},v.id);
    const sidecar=JSON.parse(fs.readFileSync(disk(v.metadata),'utf8'));
    assert.equal(sidecar.frames.length,12);
    for(let i=0;i<12;i++){
      const f=sidecar.frames[i];
      assert.equal(f.frame.x,i*320);
      assert.equal(f.frame.y,0);
      assert.equal(f.frame.w,320);
      assert.equal(f.frame.h,320);
      assert.equal(f.pivot.x,0.5);
      assert.equal(f.pivot.y,0.9625);
    }
    for(let i=0;i<6;i++)pngInfo(v.folder+'walk_'+i+'.png');
    pngInfo(v.folder+'idle_0.png');
  }
});
test('Estoker cinematic and Luna/Morita original frame sources are complete',()=>{
  const sandbox={};vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(disk(catalog.characters.estoker.module),'utf8'),sandbox);
  const anims=sandbox.CAMION.ESTOKER_ANIMS;
  let sum=0;
  for(const [state,count] of Object.entries(catalog.characters.estoker.animations)){
    const a=anims[state];assert.ok(a&&a.frames.length===count,state);
    for(const f of a.frames){assert.ok(f.ms>0);pngInfo(f.src);}
    sum+=count;
  }
  assert.equal(sum,catalog.characters.estoker.original_frames_total);
  for(const cat of catalog.characters.companions){
    for(let i=1;i<=cat.idle_frames;i++)pngInfo(cat.folder+cat.id+'_idle_v38_0'+i+'.png');
    for(let i=1;i<=cat.walk_frames;i++)pngInfo(cat.folder+cat.id+'_walk_v38_0'+i+'.png');
    pngInfo(cat.folder+cat.id+'_shoulder.png');
  }
  for(const rel of [catalog.characters.sofia.underwater.atlas,catalog.characters.sofia.underwater.attack_atlas])pngInfo(rel);
  for(const rel of [catalog.characters.sofia.underwater.metadata,catalog.characters.sofia.underwater.attack_metadata])assert.ok(fs.existsSync(disk(rel)),rel);
});
