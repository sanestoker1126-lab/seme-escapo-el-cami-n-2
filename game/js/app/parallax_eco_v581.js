/* ¡Se me fue el camión! V58.1 ECO: ambient parallax overlays only.
 * Source backgrounds, player, foes, world state, hitboxes and physics remain unchanged.
 * Draw after drawScenes() while world coordinates are active, before interactive objects.
 */
(function(root){
'use strict';
const NS=root.CAMION=root.CAMION||{};
const FOLDER='assets/parallax/eco_v581/';
const DEF=Object.freeze({
  submarino:[
    ['01_luz_volumetrica_alpha.png',.07,.85,0,-.12,1,0],
    ['02_burbujas_profundidad_alpha.png',.38,.75,.9,-3.5,.95,1],
    ['03_sedimento_en_suspension_alpha.png',.58,.56,-.28,-.45,.92,1]
  ],
  espacial:[
    ['01_nebulosa_difusa_alpha.png',.035,.48,.03,0,1.1,0],
    ['02_campo_estelar_alpha.png',.17,.81,.04,-.015,1,0],
    ['03_polvo_orbital_alpha.png',.63,.45,-.25,.1,.85,1]
  ],
  escuela:[
    ['01_haces_sol_alpha.png',.11,.76,0,-.02,1.1,0],
    ['02_particulas_aire_alpha.png',.48,.58,.06,-.20,.9,1]
  ],
  guadalajara:[
    ['01_bruma_urbana_alpha.png',.15,.62,.03,.02,1,0],
    ['02_particulas_ambientales_alpha.png',.52,.52,-.09,-.05,.9,1]
  ]
});
const cache=new Map();let quality=1,enabled=true;
function source(world,name){return FOLDER+world+'/'+name;}
function fetchImage(path){
  if(cache.has(path))return cache.get(path);
  if(typeof Image==='undefined')return null;
  const im=new Image();
  const rec={im,ok:false,failed:false};cache.set(path,rec);
  im.onload=()=>{rec.ok=!!(im.naturalWidth&&im.naturalHeight);};
  im.onerror=()=>{rec.failed=true;};
  im.src=path;
  return rec;
}
function preload(world){
  const worlds=world&&DEF[world]?[world]:Object.keys(DEF);
  for(const key of worlds)for(const lay of DEF[key])fetchImage(source(key,lay[0]));
  return worlds.reduce((n,k)=>n+DEF[k].length,0);
}
function setQuality(value){quality=(value==='low'||value===0)?0:1;}
function setEnabled(on){enabled=!!on;}
function draw(ctx,G,V,T){
  if(!enabled||!ctx||!G||!G.world||!G.world.scenes||!G.cam||G.room)return 0;
  const B=G.world.bounds;if(!B)return 0;
  const t=Number.isFinite(T)?T:0, cx=G.cam.x||0,cy=G.cam.y||0;
  let rendered=0;
  for(const sc of G.world.scenes){
    const layers=DEF[sc.theme];if(!layers)continue;
    const x1=Math.max(B.x1,V.x1),x2=Math.min(B.x2,V.x2);
    const y1=Math.max(sc.startY,V.y1),y2=Math.min(sc.endY,V.y2);
    if(!(x2>x1&&y2>y1))continue;
    ctx.save();
    ctx.beginPath();ctx.rect(x1,y1,x2-x1,y2-y1);ctx.clip();
    for(const [name,speed,opacity,driftX,driftY,scale,minQuality] of layers){
      if(quality<minQuality)continue;
      const rec=fetchImage(source(sc.theme,name));if(!rec||!rec.ok||rec.failed)continue;
      const im=rec.im,tw=im.naturalWidth*scale,th=im.naturalHeight*scale;
      if(tw<1||th<1)continue;
      // Uniform X/Y scale; shift moves < 1 source pixel / frame even at 60 FPS.
      const ox=B.x1+(cx-B.x1)*(1-speed)+t*driftX;
      const oy=sc.startY+(cy-sc.startY)*(1-speed)+t*driftY;
      let left=Math.floor((x1-ox)/tw)*tw+ox;
      let top=Math.floor((y1-oy)/th)*th+oy;
      ctx.globalAlpha=opacity;
      // Bounded loops: maximum 30 draw calls per layer, even with a corrupt viewport.
      for(let col=0;col<6&&left+col*tw<x2;col++){
        const dx=left+col*tw;
        for(let row=0;row<5&&top+row*th<y2;row++){
          ctx.drawImage(im,dx,top+row*th,tw,th);rendered++;
        }
      }
    }
    ctx.restore();
  }
  return rendered;
}
NS.PARALLAX_ECO_V581=Object.freeze({draw,preload,setQuality,setEnabled,source,
  get worldNames(){return Object.keys(DEF);},
  get loadedImages(){return cache.size;},
  get imageStatus(){return [...cache.entries()].map(([src,r])=>({src,ready:r.ok,failed:r.failed}));}
});
})(typeof globalThis!=='undefined'?globalThis:window);
