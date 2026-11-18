/* V58.1 ECO · Environmental props A1/A2. PNG/JSON source-locked, decorative only.
   Missing optional files fail closed. No changes to physics, collision or entities. */
(function(root){
'use strict';
const NS=root.CAMION=root.CAMION||{};
const PACKS=Object.freeze({
 escuela:{A1:['casilleros_azules','banco_patio','jardinera_flores','barandal_metalico'],A2:['canasta_baloncesto','porton_escolar_azul','bebedero_escolar_triple']},
 guadalajara:{A1:['kiosco_plaza','jacaranda','farol_colonial','fuente_plaza'],A2:['puesto_mercado_rodante','maceton_agave_urbano','portal_cantera','papel_picado_festivo']},
 submarino:{A1:['columna_ruinas','proa_navio_hundido','ancla_con_cadena'],A2:['tunel_roca_arrecife','formacion_corales_profundos','timon_navio_roto','cofre_tesoro_hundido']},
 espacio:{A1:['modulo_energia','caja_orbital'],A2:['antena_telecomunicacion','domo_observatorio','esclusa_orbital','asteroide_cristalino']}
});
const cache=new Map(),placements=new WeakMap();
function worldKey(theme){return theme==='espacial'?'espacio':theme;}
function atlasJSON(world,batch){return 'assets/atlases/environment_'+world+(batch==='A2'?'_a2':'')+'.json';}
function load(world,batch){
 const key=world+':'+batch,existing=cache.get(key);
 if(existing)return existing;
 if(typeof root.fetch!=='function'||typeof root.Image!=='function')return null;
 const entry={pack:null};
 cache.set(key,entry);
 root.fetch(atlasJSON(world,batch)).then(res=>res.ok?res.json():Promise.reject(Error('optional environmental art missing')))
 .then(meta=>{
   if(!meta||!meta.image||!meta.frames)return Promise.reject(Error('invalid environment atlas'));
   const image=new root.Image();image.decoding='async';
   image.src=meta.image;
   if(image.decode)return image.decode().then(()=>({meta,image}));
   return new Promise((resolve,reject)=>{
     if(image.complete&&image.naturalWidth)return resolve({meta,image});
     image.onload=()=>resolve({meta,image});image.onerror=reject;
   });
 }).then(pack=>{entry.pack=pack;}).catch(()=>{entry.unavailable=true;});
 return entry;
}
function buildPlacements(sc){
 const world=worldKey(sc.theme),groups=PACKS[world];if(!groups)return [];
 const seed=Array.from(String(sc.def&&sc.def.id||sc.id||world)).reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,2166136261);
 const list=[...groups.A1.map(id=>({id,batch:'A1'})),...groups.A2.map(id=>({id,batch:'A2'}))];
 const count=(world==='espacio'||world==='submarino')?5:2;
 const picks=[];
 for(let i=0;i<count;i++){
   const choice=list[(seed+i*3)%list.length];
   picks.push({world,id:choice.id,batch:choice.batch,
     x:sc.x0+sc.drawW*(i%2===0?.13:.87),y:sc.startY+sc.drawH*(i+1)/(count+1)});
 }
 return picks;
}
function draw(G,V,ctx){
 if(!G||!G.world||G.room||!ctx)return 0;
 let drawn=0;
 for(const sc of G.world.scenes||[]){
   if(sc.endY<V.y1||sc.startY>V.y2||sc.x0+sc.drawW<V.x1||sc.x0>V.x2)continue;
   let items=placements.get(sc);if(!items){items=buildPlacements(sc);placements.set(sc,items);}
   for(const p of items){
     if(p.x<V.x1-180||p.x>V.x2+180||p.y<V.y1-200||p.y>V.y2+200)continue;
     const entry=load(p.world,p.batch);
     if(!entry||!entry.pack)continue;
     const {meta,image}=entry.pack,frame=meta.frames[p.id];if(!frame)continue;
     const r=frame.rect,pivot=frame.pivot||{x:.5,y:1};
     if(!r||!r.w||!r.h)continue;
     const scale=Math.min(1,(p.world==='submarino'?175:p.world==='espacio'?115:145)/r.w,145/r.h);
     if(!Number.isFinite(scale)||scale<=0)continue;
     ctx.save();ctx.globalAlpha*=.52;
     ctx.drawImage(image,r.x,r.y,r.w,r.h,p.x-r.w*scale*pivot.x,p.y-r.h*scale*pivot.y,r.w*scale,r.h*scale);
     ctx.restore();drawn++;
   }
 }
 return drawn;
}
NS.EnvironmentProps=Object.freeze({draw,worldKey,atlasJSON,PACKS});
})(typeof globalThis!=='undefined'?globalThis:window);
