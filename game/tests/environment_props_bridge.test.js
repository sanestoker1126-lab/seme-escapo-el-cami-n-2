'use strict';
/* A1/A2 integration bridge: allows optional assets, never changes gameplay. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
test('A1/A2 module loads after renderer and draws before collision surfaces',()=>{
 const html=read('Se_Me_Fue_El_Camion.html');
 const draw=read('js/app/render.js');
 const module=read('js/app/environment_props.js');
 assert.ok(html.indexOf('js/app/render.js?v=58.1')<html.indexOf('environment_props.js?v=58.1-env-a1a2'));
 assert.ok(draw.includes('NS.EnvironmentProps.draw(G, V, ctx)'));
 assert.ok(draw.indexOf('NS.EnvironmentProps.draw(G, V, ctx)')>draw.indexOf('drawBackdrop(G, V);'));
 assert.ok(draw.indexOf('NS.EnvironmentProps.draw(G, V, ctx)')<draw.indexOf('drawSolids(G, V);'));
 assert.doesNotMatch(module,/\.platforms\.push|\.solids\.push|\.foes\.push|\.hazards\.push/);
});
test('A1/A2 module has expected world IDs and fails closed without optional PNG',()=>{
 const sandbox={CAMION:{}};
 vm.runInNewContext(read('js/app/environment_props.js'),sandbox);
 const d=sandbox.CAMION.EnvironmentProps;
 assert.equal(d.worldKey('espacial'),'espacio');
 assert.equal(d.atlasJSON('submarino','A2'),'assets/atlases/environment_submarino_a2.json');
 const fake={world:{scenes:[]},room:false};
 const c={drawImage(){throw Error('unexpected drawImage');}};
 assert.equal(d.draw(fake,{x1:0,x2:300,y1:0,y2:300},c),0);
});
test('PWA precaches environment module and tolerates optional binary absence',()=>{
 const sw=read('sw.js');
 assert.ok(sw.includes('js/app/environment_props.js?v=58.1-env-a1a2'));
 assert.ok(sw.includes('ENVIRONMENT_A1_A2_OPTIONAL'));
 assert.ok(sw.includes('Promise.allSettled(ENVIRONMENT_A1_A2_OPTIONAL'));
});
