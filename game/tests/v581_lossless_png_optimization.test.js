'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const {chunk,parsePng,optimizePng,getTargets} = require('../tools/arte/optimize_png_source_locked');
const SIG = Buffer.from('89504e470d0a1a0a','hex');
function syntheticRGBA(w=96,h=96){
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
  const stride=w*4,raw=Buffer.alloc((stride+1)*h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const i=y*(stride+1)+1+x*4;
    raw[i]=42;raw[i+1]=137;raw[i+2]=222;raw[i+3]=(x+y)%17?255:0;
  }
  const png=Buffer.concat([SIG,chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:0})),chunk('IEND',Buffer.alloc(0))]);
  return {png,raw};
}
function raster(file){const p=parsePng(file);return zlib.inflateSync(Buffer.concat(p.idats.map(x=>x.payload)));}
test('recompression preserves exact source RGBA scanlines, dimensions and transparency',()=>{
  const {png,raw}=syntheticRGBA();
  const result=optimizePng(png);
  assert.ok(result.savedBytes>0,'fixture should be compressible');
  assert.ok(result.buffer.length<png.length);
  assert.equal(result.info.colorType,6);
  assert.deepEqual(raster(result.buffer),raw);
  assert.equal(parsePng(result.buffer).width,96);
  assert.equal(parsePng(result.buffer).height,96);
  assert.equal(optimizePng(result.buffer).savedBytes,0,'recompression should be idempotent');
});
test('invalid CRC and invalid PNG files are rejected without writing',()=>{
  const {png}=syntheticRGBA();
  const corrupt=Buffer.from(png);corrupt[15]^=0x41;
  assert.throws(()=>optimizePng(corrupt),/CRC/);
  assert.throws(()=>optimizePng(Buffer.from('not png')),/PNG/);
});
test('canonical runtime targets are source-locked and contain no duplicate paths',()=>{
  const files=getTargets(undefined,'runtime');
  assert.equal(new Set(files).size,files.length);
  for(const id of ['piranha','shark','octopus','poseidon']) assert.ok(files.some(p=>p.endsWith(id+'_atlas_v573.png')));
  assert.ok(files.some(p=>p.endsWith('sofia_buceadora_movimientos_rgba.png')));
  assert.ok(files.some(p=>p.endsWith('swim_strike_11frames_v581.png')));
  assert.ok(files.every(p=>p.startsWith('assets/')&&p.endsWith('.png')));
});
