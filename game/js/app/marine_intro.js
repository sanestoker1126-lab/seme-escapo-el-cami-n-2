/* V58.1 · Introducción marina con flashback sobre la leyenda contada por Estoker.
   El personaje y las bestias se renderizan con cuadros reales. La simulación está
   pausada desde main.js; esta clase no escribe en G ni modifica física. */
(function(root){
 'use strict';
 const NS=root.CAMION=root.CAMION||{};
 const MOTION=root.CAMION_MARINE_MOTION;
 const DIR='assets/cinematic/storyboard_marino/';
 const DRY='assets/cinematic/isla_tierra_firme/';
 const LANDSCAPES={street:DRY+'calle_llegada.webp',island:DRY+'isla_recuerdo.webp'};
 // Los cinco fondos de storyboard se reciclan; las escenas 2-5 se desarrollan como recuerdo.
 const SCENES=[
  {tag:'CAMINO SECO · HACIA LA ISLA',title:'¿A dónde conduce esta calle?',kind:'arrival',board:1,duration:9300,sofia:'walk',
   text:'Sofía camina despacio por una calle empedrada sobre tierra firme. Al fondo aparece una isla que le resulta familiar.'},
  {tag:'LLEGADA A LA ISLA',title:'¡Esta isla... ya estuve aquí!',kind:'recognize',board:1,duration:4600,sofia:'look',
   text:'Sofía se detiene al llegar a la isla: «Yo ya estuve aquí... ¡vine con papito Estoker!» Entonces comienza el flashback.'},
  {tag:'FLASHBACK · SOBRE LA ISLA',title:'Un paseo con papá Estoker',kind:'pastWalk',board:1,duration:11900,sofia:'walk',estoker:'caminar_estoker',
   text:'En su recuerdo, Sofía y Estoker caminan sobre el sendero seco de la isla. Su papá le habla del mar que se extiende frente a ellos.'},
  {tag:'FLASHBACK · LA LEYENDA',title:'El reino que duerme bajo las olas',kind:'legend',board:3,duration:6600,sofia:'look',estoker:'explicar_estoker',
   text:'Estoker, aún sobre la isla: «Bajo ese mar hay una ciudad perdida. Cuentan que sus ruinas esconden el santuario de Poseidón».'},
  {tag:'FLASHBACK · ESTOKER LE ADVIERTE',title:'Las bestias del mar',kind:'warning',board:4,duration:7300,sofia:'look',estoker:'conversacion_con_sofia',
   text:'Estoker, en el camino de la isla: «Si entras al agua, habrá tiburones, pirañas, pulpos y corrientes peligrosas. Aprende a esquivarlos».'},
  {tag:'FLASHBACK · LA MISIÓN',title:'El secreto del santuario',kind:'mission',board:5,duration:10900,sofia:'walk',estoker:'caminar_con_sofia',
   text:'Estoker: «Cuando vuelvas a esta isla, desciende al fondo, usa BAJAR para bucear, esquiva con DASH y supera a Poseidón para llegar al camión».'},
  {tag:'DE VUELTA AL PRESENTE',title:'Ahora recuerdo, papito',kind:'resolve',board:2,duration:5800,sofia:'look',
   text:'De nuevo en la isla, Sofía sonríe: «Ahora recuerdo lo que me contó papito. Desde esta orilla bajaré al mar... ¡pero todavía estoy en tierra!»'}
 ];
 let overlay=null,active=false,index=0,elapsed=0,last=0,raf=0,onEnd=null,token=0,layout={limit:0,shift:0};
 // La velocidad horizontal usa el mismo reloj que las frames: sin CSS ease ni levitacion.
 const WALK={
   arrival:{moveMs:7600,distance:0.27},
   pastWalk:{moveMs:9500,distance:0.115},
   mission:{moveMs:8450,distance:0.09}
 };
 const SOFIA_STEP_MS=180;            // 5.55 fps: más continuidad, sin carrera
 const SOFIA_LOOK_STEP_MS=360;       // mirada más natural
 const WALK_CYCLE_MS=SOFIA_STEP_MS*6;
 const LOOK_SEQUENCE=[0,1,2,3,4,5,5,4,3,2,1,0];
 const reduced=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const bestiary={}; const estokerCache=new Map(); const sofiCache=new Map();
 const ARRIVAL_LOOKS={original:'original',rosa:'rosa',uniforme:'uniforme',buzo:'uniforme',astronauta:'uniforme'};
 const currentLook=()=>{try{return root.localStorage.getItem('camion-opt-ninaLook')||'original';}catch(_){return 'original';}};
 const $=(selector)=>overlay.querySelector(selector);
 const sofiaFrame=(i,look=currentLook())=>`assets/player/sofia_arrival/${ARRIVAL_LOOKS[look]||'original'}/walk_${Math.max(0,Math.min(5,i))}.png`;
 const sofiaIdleFrame=(look=currentLook())=>`assets/player/sofia_arrival/${ARRIVAL_LOOKS[look]||'original'}/idle_0.png`;
 const anims=()=>NS.ESTOKER_ANIMS||{};
 function frameFor(seq,ms,forceLoop){
   const a=anims()[seq]; if(!a||!a.frames.length)return null;
   const duration=a.frames.reduce((s,f)=>s+f.ms,0);
   if(duration<=0)return a.frames[0].src;
   const loop=(forceLoop===undefined)?a.loop:forceLoop;
   let p;
   if(loop==='pingpong'){const lastMs=a.frames[a.frames.length-1].ms;
     const period=duration*2-lastMs*2;const pos=ms%Math.max(1,period);
     p=pos<duration?pos:Math.max(0,period-pos);
   }else p=loop?(ms%duration):Math.min(ms,Math.max(0,duration-1));
   for(const f of a.frames){if(p<f.ms)return f.src;p-=f.ms;}
   return a.frames[a.frames.length-1].src;
 }
 function cacheImage(src){
   const store=src.includes('/estoker_memory/')?estokerCache:sofiCache;
   if(!store.has(src)){const im=new Image();im.decoding='async';im.src=src;store.set(src,im);}
   return store.get(src);
 }
 function mount(){
  if(overlay)return;
  overlay=document.createElement('section');overlay.id='marineIntro';overlay.hidden=true;
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Cinemática de Sofía y recuerdo de papá Estoker en la isla submarina');
  overlay.innerHTML=`<div class="marine-stage" data-scene="arrival">
   <img class="marine-board" src="${LANDSCAPES.street}" alt="Camino de piedra seco en la isla, con el mar a lo lejos">
   <div class="marine-flashback" aria-hidden="true"><span>✦ RECUERDO DE SOFÍA ✦</span></div>
   <div class="marine-memory" aria-hidden="true"></div>
   <div class="marine-ground" aria-hidden="true"></div>
   <div class="marine-place" aria-hidden="true">CAMINO DE LA ISLA · TIERRA FIRME</div>
   <div class="marine-vision" aria-hidden="true"><img src="assets/parallax/marino/panorama_marino.webp" alt=""></div>
   <div class="marine-sky"></div><div class="marine-island"></div><div class="marine-wave"></div>
   <div class="marine-actor"><img alt="Sofía caminando asombrada" src="${sofiaFrame(0)}"></div>
   <div class="marine-estoker"><img alt="Papá Estoker caminando y contando la leyenda marina"></div>
   <canvas class="marine-beasts" aria-hidden="true"></canvas>
   <div class="marine-caption" aria-live="polite"><span class="marine-tag"></span><h2 class="marine-title"></h2><p class="marine-text"></p></div>
   </div><div class="marine-controls"><button class="marine-skip" type="button">SALTAR CINEMÁTICA</button>
   <div class="marine-progress"><span class="marine-counter"></span><div class="marine-track"><i></i></div></div>
   <button class="marine-next" type="button">SIGUIENTE</button></div>`;
  document.body.appendChild(overlay);
  $('.marine-next').addEventListener('click',next);
  $('.marine-skip').addEventListener('click',finish);
  root.addEventListener('resize',()=>{if(active)layoutActors();},{passive:true});
  for(const [kind,pack] of Object.entries(NS.MARINE_ATLASES||{})){
    const im=new Image();im.decoding='async';im.src=pack.src;bestiary[kind]=im;
  }
  // Precarga normal de cuadros, evitando peticiones de red al cambiar de cuadro.
  for(const a of Object.values(anims()))for(const f of a.frames)cacheImage(f.src);
  for(const look of [ARRIVAL_LOOKS[currentLook()]||'original']){for(let i=0;i<6;i++)cacheImage(sofiaFrame(i,look));cacheImage(sofiaIdleFrame(look));}
 }
 function paint(){
  const s=SCENES[index],stage=$('.marine-stage');stage.dataset.scene=s.kind;
  $('.marine-board').src=index===0?LANDSCAPES.street:LANDSCAPES.island;
  $('.marine-place').textContent=index===0?'CALLE DE LA ISLA · TIERRA FIRME':index<2?'YA EN LA ISLA · TIERRA FIRME':'RECUERDO EN LA ISLA · TIERRA FIRME';
  $('.marine-tag').textContent=s.tag;$('.marine-title').textContent=s.title;$('.marine-text').textContent=s.text;
  $('.marine-counter').textContent=`ESCENA ${index+1} / ${SCENES.length}`;
  $('.marine-next').textContent=index===SCENES.length-1?'¡EMPEZAR MISIÓN!':'SIGUIENTE';
  $('.marine-track i').style.width='0%';
  $('.marine-estoker').dataset.seq=s.estoker||'none';
  elapsed=0;last=performance.now();stage.classList.remove('marine-animate');
  layoutActors();
  if(!reduced){void stage.offsetWidth;stage.classList.add('marine-animate');}
  updateActors();
 }
 function sprite(ctx,kind,action,x,y,width,t){
  const pack=NS.MARINE_ATLASES&&NS.MARINE_ATLASES[kind],im=bestiary[kind];
  if(!pack||!im||!im.complete||!im.naturalWidth)return;
  const a=pack.animations[action]||pack.animations.swim||pack.animations.idle_swim||pack.animations.idle;
  if(!a||!a.ids.length)return;
  const ix=reduced?0:Math.floor(t/a.ms)%a.ids.length;
  const f=pack.frames[a.ids[ix]];if(!f)return;
  const [sx,sy,sw,sh,ox,oy]=f,[cw,ch]=pack.cell,scale=width/cw;
  ctx.save();ctx.globalAlpha=.88;
  if(kind==='piranha'){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0);}
  ctx.drawImage(im,sx,sy,sw,sh,x+(ox-cw*.5)*scale,y+(oy-ch*.5)*scale,sw*scale,sh*scale);
  ctx.restore();
 }
 function drawBeasts(){
  const c=$('.marine-beasts');const w=c.clientWidth,h=c.clientHeight;
  if(!w||!h)return;const ratio=Math.min(1.5,root.devicePixelRatio||1);
  const pw=Math.max(1,Math.floor(w*ratio)),ph=Math.max(1,Math.floor(h*ratio));
  if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph;}
  const ctx=c.getContext('2d');if(!ctx)return;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pw,ph);ctx.setTransform(ratio,0,0,ratio,0,0);
  const kind=SCENES[index].kind;
  if(kind==='warning'){
   sprite(ctx,'piranha','swim',w*.25,h*.45,Math.min(104,w*.22),elapsed);
   sprite(ctx,'shark','swim',w*.66,h*.38,Math.min(220,w*.45),elapsed);
   sprite(ctx,'octopus','swim',w*.83,h*.68,Math.min(138,w*.31),elapsed);
  }else if(kind==='mission'){
   sprite(ctx,'poseidon','idle_swim',w*.62,h*.44,Math.min(250,w*.51),elapsed);
  }
 }
 // El punto de apoyo es compartido: suelo 30% desde abajo. Se resta exactamente
 // la franja transparente medida en cada PNG, para que los pies toquen la roca.
 function layoutActors(){
  if(!overlay)return;
  const stage=$('.marine-stage'), s=SCENES[index];
  const girl=$('.marine-actor'), dad=$('.marine-estoker');
  girl.style.left=''; dad.style.left='';
  girl.style.height=''; dad.style.height='';
  if(!s.estoker){layout={limit:0,shift:0};return;}
  const w=stage.clientWidth;
  if(!w)return;
  let gw=girl.getBoundingClientRect().width, dw=dad.getBoundingClientRect().width;
  const gap=Math.max(16,Math.min(44,w*.065)), padding=Math.max(12,w*.06);
  const walk=WALK[s.kind];
  const safeWidth=MOTION.actorSafeWidth(w,padding,walk?walk.distance:0);
  const ratio=Math.min(1,safeWidth/Math.max(1,gw+dw+gap));
  if(ratio<1){
    girl.style.height=(girl.clientHeight*ratio)+'px';
    dad.style.height=(dad.clientHeight*ratio)+'px';
    gw=girl.getBoundingClientRect().width; dw=dad.getBoundingClientRect().width;
  }
  const baseX=padding;
  const dadX=baseX+gw+gap;
  girl.style.left=baseX+'px'; dad.style.left=dadX+'px';
  layout={limit:Math.max(0,w-dadX-dw-padding),shift:0};
 }
 // La fase y el paneo se calculan juntos en CAMION_MARINE_MOTION.
 function setFeetOnGround(wrapper,src){
   if(!src)return;
   const box=(NS.MARINE_FEET||{})[src];
   const px=box?wrapper.clientHeight*(box[0]/box[1]):0;
   wrapper.style.bottom=`calc(var(--marine-ground-line) - ${px.toFixed(3)}px)`;
 }
 function updateActors(){
  const s=SCENES[index],stage=$('.marine-stage');
  const sofiaBox=$('.marine-actor'),estokerBox=$('.marine-estoker');
  const actor=sofiaBox.querySelector('img'),estoker=estokerBox.querySelector('img');
  const walking=WALK[s.kind],moveMs=walking?walking.moveMs:0;
  const motion=MOTION.actorMotion(elapsed,moveMs,walking?stage.clientWidth*walking.distance:0,!!walking&&!reduced,SOFIA_STEP_MS,6);
  const walkingNow=motion.moving;
  const walkTime=reduced?0:Math.min(elapsed,moveMs);
  // Solo hay pasos si se desplaza; de pie usa walk_0 (dos pies en tierra),
  // no recorre frames de pierna levantada en escenas de diálogo.
  const step=walkingNow?motion.frame:0;
  const src=walking && walkingNow ? sofiaFrame(step) : sofiaIdleFrame();
  if(actor.getAttribute('src')!==src)actor.setAttribute('src',src);
  const lookAround=!walking && (s.kind==='recognize'||s.kind==='resolve');
  actor.style.transform=lookAround && Math.floor(elapsed/1250)%4===2 ? 'scaleX(-1)' : ''; 
  let est=null;
  if(s.estoker){
    const isWalk=s.estoker==='caminar_estoker'||s.estoker==='caminar_con_sofia';
    est=isWalk&&!walkingNow ? frameFor('explicar_estoker',0,false)
      : isWalk ? MOTION.frameAtPhase(anims()[s.estoker],walkTime,WALK_CYCLE_MS)
        : frameFor(s.estoker,reduced?0:elapsed,s.kind==='warning'?'pingpong':undefined);
    if(est&&estoker.getAttribute('src')!==est)estoker.setAttribute('src',est);
  }
  // Un unico desplazamiento lineal y compartido en lugar de animaciones CSS separadas.
  // El tiempo pasa de 0 al total sin salto vertical, incluso al detenerse.
  const offset=s.estoker?Math.min(layout.limit,motion.offset):motion.offset;
  stage.style.setProperty('--marine-background-pan',`${MOTION.backgroundPan(offset)}px`);
  const translate=`translate3d(${offset.toFixed(2)}px,0,0)`;
  sofiaBox.style.transform=translate;
  estokerBox.style.transform=translate;
  setFeetOnGround(sofiaBox,src);
  if(est)setFeetOnGround(estokerBox,est);
  stage.classList.toggle('marine-has-estoker',!!est);
  stage.classList.toggle('marine-has-sofia',!!s.sofia);
  const remembered=['pastWalk','legend','warning','mission'].includes(s.kind);
  stage.classList.toggle('marine-memory-scene',remembered);
  stage.classList.toggle('marine-memory-opening',s.kind==='recognize' && elapsed>=1900);
 }
 function tick(t){
  if(!active)return;
  if(document.hidden)last=t;else{elapsed+=Math.max(0,Math.min(100,t-last));last=t;}
  updateActors();drawBeasts();
  const s=SCENES[index];
  if(s.kind==='legend') $('.marine-text').textContent=elapsed<3300
    ? 'Estoker: «Bajo ese mar hay una ciudad perdida que nadie ha encontrado».'
    : '«La leyenda cuenta que Poseidón vigila sus ruinas y el camino al camión».';
  else if(s.kind==='warning') $('.marine-text').textContent=elapsed<2500
    ? 'Estoker: «No te acerques a los tiburones: primero anuncian su ataque».'
    : elapsed<4900 ? '«Las pirañas atacan en grupos; aléjate cuando abran la boca».'
    : '«Esquiva los pulpos y las corrientes. Puedes nadar contra ellas».';
  else if(s.kind==='mission') $('.marine-text').textContent=elapsed<5300
    ? 'Estoker: «Baja poco a poco, guarda fuerzas y quédate junto a Luna y Morita».'
    : '«En el fondo está el santuario de Poseidón. Derrótalo y llega al camión».';$('.marine-track i').style.width=(Math.min(100,100*elapsed/s.duration))+'%';
  if(elapsed>=s.duration){next();if(!active)return;}
  raf=root.requestAnimationFrame(tick);
 }
 function next(){if(!active)return;if(index>=SCENES.length-1){finish();return;}index++;paint();}
 function onKey(e){if(!active)return;
   if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish();}
   else if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();next();}
 }
 function finish(){if(!active)return;active=false;token++;
  root.cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey,true);
  overlay.hidden=true;const done=onEnd;onEnd=null;if(done)done();
 }
 function play(done){if(active)return false;mount();onEnd=typeof done==='function'?done:null;
  active=true;index=0;overlay.hidden=false;paint();document.addEventListener('keydown',onKey,true);
  raf=root.requestAnimationFrame(tick);return true;}
 NS.MarineIntro={play,get active(){return active;},get scenes(){return SCENES.map(s=>({tag:s.tag,title:s.title,text:s.text,kind:s.kind,estoker:s.estoker||null}));}};
})(typeof globalThis!=='undefined'?globalThis:window);
