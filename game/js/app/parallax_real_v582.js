/* ¡Se me fue el camión! Parallax Real V58.2 ECO — 16 PNG RGBA.
 * Purely visual; backgrounds, world geometry, collision, sprites unchanged.
 * Must render between drawScenes() and interactive map objects.
 */
(function(root){
'use strict';
const NS=root.CAMION=root.CAMION||{};
const PREFIX='assets/parallax/real_v582/';
const DEF=Object.freeze({
  submarino: [
    ['01_caudales_luz_fisica.png',0.045,0.660,0.000,-0.016,1,0],
    ['02_microplancton_sedimento.png',0.180,0.680,0.140,-0.320,1,1],
    ['03_burbujas_refraccion.png',0.400,0.750,0.060,-2.600,1,0],
    ['04_relieve_arrecife_bordes.png',0.720,0.500,0.015,0.003,1,1]
  ],
  espacial: [
    ['01_nebulosa_volumetrica.png',0.035,0.610,-0.006,0.000,1,0],
    ['02_campo_estelar_optico.png',0.130,0.840,-0.005,0.003,1,0],
    ['03_meteoroides_relieve.png',0.530,0.660,-0.050,0.026,1,1],
    ['04_gas_y_polvo_fino.png',0.290,0.330,0.006,0.000,1,1]
  ],
  escuela: [
    ['01_sol_difuso_arquitectonico.png',0.090,0.570,0.000,-0.001,1,0],
    ['02_polvo_aire_solar.png',0.410,0.550,0.016,-0.160,1,1],
    ['03_follaje_desenfocado.png',0.620,0.320,0.000,0.000,1,1],
    ['04_humedad_ambiental.png',0.200,0.340,0.000,0.000,1,0]
  ],
  guadalajara: [
    ['01_neblina_calida_urbana.png',0.060,0.500,0.001,0.000,1,0],
    ['02_bokeh_callejero.png',0.320,0.540,-0.014,0.000,1,1],
    ['03_sombra_arbolado_urbano.png',0.550,0.370,0.000,0.000,1,1],
    ['04_polvo_y_calor_ambiental.png',0.130,0.320,0.001,0.000,1,0]
  ]
});
const cache=new Map(); let quality=1,enabled=true;
function source(theme,filename){return PREFIX+theme+'/'+filename;}
function loadImage(rel){
  if(cache.has(rel))return cache.get(rel);
  if(typeof Image==='undefined')return null;
  const im=new Image(),obj={im,ready:false,error:false};
  cache.set(rel,obj);
  im.onload=function(){obj.ready=im.naturalWidth>0&&im.naturalHeight>0;};
  im.onerror=function(){obj.error=true;};
  im.src=rel;return obj;
}
function preload(theme){
  let n=0;
  for(const name of Object.keys(DEF)){
    if(theme&&name!==theme)continue;
    for(const layer of DEF[name]){loadImage(source(name,layer[0]));n++;}
  }
  return n;
}
function setQuality(q){quality=(q===0||q==='low')?0:1;}
function setEnabled(x){enabled=!!x;}
function draw(ctx,G,V,T){
  if(!enabled||!ctx||!G||!G.world||!G.world.bounds||!G.world.scenes||!G.cam||G.room)return 0;
  const B=G.world.bounds; const t=Number.isFinite(T)?T:0;let drawn=0;
  for(const sc of G.world.scenes){
    const layers=DEF[sc.theme];if(!layers||sc.endY<=V.y1||sc.startY>=V.y2)continue;
    const x1=Math.max(B.x1,V.x1),x2=Math.min(B.x2,V.x2),
          y1=Math.max(sc.startY,V.y1),y2=Math.min(sc.endY,V.y2);
    if(!(x2>x1&&y2>y1))continue;
    ctx.save();ctx.beginPath();ctx.rect(x1,y1,x2-x1,y2-y1);ctx.clip();
    for(const [filename,speed,opacity,dx,dy,scale,minQ] of layers){
      if(quality<minQ)continue;
      const item=loadImage(source(sc.theme,filename));if(!item||item.error||!item.ready)continue;
      const im=item.im,tw=im.naturalWidth*scale,th=im.naturalHeight*scale;
      if(!(tw>0&&th>0))continue;
      // Transparent 2D layers, independent X/Y camera parallax, preserved scale.
      const ox=B.x1+(G.cam.x-B.x1)*(1-speed)+t*dx,
            oy=sc.startY+(G.cam.y-sc.startY)*(1-speed)+t*dy;
      const firstX=Math.floor((x1-ox)/tw)*tw+ox,
            firstY=Math.floor((y1-oy)/th)*th+oy;
      ctx.globalAlpha=opacity;
      // Culling, max 4*5 tiles per layer on bad maps.
      for(let col=0;col<4;col++){
        const x=firstX+col*tw;if(x>=x2)break;
        for(let row=0;row<5;row++){
          const y=firstY+row*th;if(y>=y2)break;
          ctx.drawImage(im,x,y,tw,th);drawn++;
        }
      }
    }
    ctx.restore();
  }
  return drawn;
}
NS.PARALLAX_REAL_V582=Object.freeze({source,preload,draw,setEnabled,setQuality,
  get worlds(){return Object.keys(DEF);},
  get images(){return [...cache.entries()].map(([path,obj])=>({path,ready:obj.ready,error:obj.error}));}
});
})(typeof globalThis!=='undefined'?globalThis:window);
