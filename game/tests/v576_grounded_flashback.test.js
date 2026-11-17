'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

const ctx={CAMION:{}};
vm.runInNewContext(read('js/app/marine_feet.js'),ctx);
vm.runInNewContext(read('js/app/estoker_anim_data.js'),ctx);
const anchors=ctx.CAMION.MARINE_FEET;
const anims=ctx.CAMION.ESTOKER_ANIMS;

test('V57.6: Sofía y Estoker tienen anclas medidas de los PNG reales',()=>{
  for(const look of ['original','rosa','uniforme']){
    for(let n=0;n<6;n++){
      const src=`assets/player/sofia_arrival/${look}/walk_${n}.png`;
      const [pad,h]=anchors[src]||[];
      assert.ok(fs.existsSync(path.join(ROOT,src)));
      assert.equal(h,320);assert.ok(pad>=0&&pad<=25);
    }
  }
  let estokerFrames=0;
  for(const seq of Object.values(anims))for(const frame of seq.frames){
    const [pad,h]=anchors[frame.src]||[];
    assert.equal(h,384);assert.ok(pad>=0&&pad<100);
    if(frame.src.includes('/caminar_estoker/')||frame.src.includes('/caminar_con_sofia/'))assert.ok(pad<25);
    estokerFrames++;
  }
  assert.equal(estokerFrames,32);
});

test('V57.6: el paseo usa paso lento, desplazamiento sincronizado y suelo único',()=>{
  const intro=read('js/app/marine_intro.js'),css=read('css/marine_intro.css');
  assert.match(intro,/SOFIA_STEP_MS=270/);
  assert.match(intro,/ESTOKER_WALK_SLOW=1\.9/);
  assert.match(intro,/pastWalk:\{moveMs:9500/);
  assert.match(intro,/setFeetOnGround\(sofiaBox,src\)/);
  assert.match(intro,/setFeetOnGround\(estokerBox,est\)/);
  assert.match(intro,/const translate=`translate3d\(/);
  assert.match(intro,/estokerBox\.style\.transform=translate/);
  assert.match(intro,/sofiaBox\.style\.transform=translate/);
  assert.match(css,/--marine-ground-line:30%/);
  assert.match(css,/\.marine-ground\{/);
  assert.match(css,/animation:none!important/);
});

test('V57.6: PWA y HTML incluyen la corrección de pies antes de la cinemática',async()=>{
  const html=read('Se_Me_Fue_El_Camion.html');
  const sw=read('sw.js');
  assert.ok(sw.includes('camion-v57-9-corrientes-fauna'));
  assert.ok(html.indexOf('marine_feet.js?v=57.9')<html.indexOf('marine_intro.js?v=57.9'));
  const handlers={};let files=[];
  const sandbox={self:{addEventListener:(evt,cb)=>{handlers[evt]=cb;},skipWaiting:()=>{}},
    caches:{open:async()=>({addAll:async a=>{files=a;}})},Promise};
  vm.runInNewContext(sw,sandbox);
  let promise;
  handlers.install({waitUntil:p=>{promise=p;}});
  await promise;
  assert.ok(files.includes('js/app/marine_feet.js?v=57.9'));
  const missing=files.filter(f=>!fs.existsSync(path.join(ROOT,f.split('?')[0])));
  assert.equal(missing.length,0,`Faltan: ${missing.join(", ")}`);
});
