#!/usr/bin/env python3
"""Extrae arte real de un parallax marino y monta un fondo vertical 940x3072 sin deformar las imágenes."""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import numpy as np, json, sys

target = Path(__file__).resolve().parents[2] / 'assets/parallax/marino'
source = target
target.mkdir(parents=True,exist_ok=True)
W,H=2304,3072
pano=Image.open(source/'panorama_marino.webp').convert('RGB')
base=Image.new('RGB',(W,H))
d=ImageDraw.Draw(base)
for y in range(H):
 t=y/(H-1)
 color=(int(8+0*t),int(107-75*t),int(159-98*t))
 d.line((0,y,W,y),fill=color)
# Recortes horizontales del ARTE REAL en tres etapas, con escala uniforme: naufragio, abismo, Poseidón.
crops=[(0,0,1500,724,0),(410,45,1910,724,1020),(670,40,2170,724,2080)]
for n,(x1,y1,x2,y2,at) in enumerate(crops):
 im=pano.crop((x1,y1,x2,y2))
 sc=W/im.width
 hh=round(im.height*sc)
 im=im.resize((W,hh),Image.Resampling.LANCZOS)
 alpha=Image.new('L',(W,hh),0)
 a=ImageDraw.Draw(alpha)
 for j in range(hh):
  top=1 if n==0 else min(1,j/130)
  bottom=min(1,(hh-1-j)/170)
  val=int(245*min(top,bottom))
  a.line((0,j,W,j),fill=max(0,val))
 base.paste(im,(0,at),alpha)
base.save(target/'00_oceano_vertical.webp', 'WEBP', quality=85, method=6)
# Rayos volumétricos y burbujas ambientales. Nunca se aplican a colisiones.
lights=Image.new('RGBA',(W,H),(0,0,0,0))
d=ImageDraw.Draw(lights,'RGBA')
for j in range(4):
 y0=0
 for k in range(7):
  x=100+j*238+k*5
  y=0+k*450
  d.polygon([(x-28,y),(x+8,y),(x+115,y+620),(x-110,y+620)],fill=(145,245,250,max(0,14-k)))
import random
rng=random.Random(57)
for i in range(340):
 x=rng.randint(3,W-3);y=rng.randint(20,H-20)
 r=rng.choice([1,1,1,2,3])
 d.ellipse((x-r,y-r,x+r,y+r),outline=(198,250,255,rng.randint(18,80)),width=1)
lights.save(target/'01_luz_volumen.webp', 'WEBP',quality=84,method=6)
# Elimina los halos casi blancos de la tira de peces, sin inventar ni redibujar peces.
fauna=Image.open(source/'fauna.webp').convert('RGBA')
arr=np.asarray(fauna).copy()
rgb=arr[...,:3].astype(np.float32)
hi=rgb.max(axis=2)
lo=rgb.min(axis=2)
saturation=(hi-lo)/np.maximum(1,hi)
# Los colores reales de peces son más saturados que el fondo lechoso.
keep=np.clip((saturation-0.15)/0.18,0,1)*np.clip(((hi-lo)-15)/52,0,1)
arr[...,3]=(arr[...,3].astype(np.float32)*keep).astype(np.uint8)
fish=Image.fromarray(arr,'RGBA')
fish.save(target/'05_fauna_limpia.webp','WEBP',quality=88,method=6)
# Arrecife: conservar alfa original y sus bordes.
reef=Image.open(source/'arrecife.webp').convert('RGBA')
reef.save(target/'06_arrecife_real.webp','WEBP',quality=90,method=6)
# Manifiesto de siete capas reales, exportable y verificable.
assets=[
 ('00_oceano_vertical.webp',0.05,'background'),
 ('01_luz_volumen.webp',0.08,'background'),
 ('../submarino/01_profundidad.svg',0.15,'background'),
 ('../submarino/02_estructuras.svg',0.25,'background'),
 ('05_fauna_limpia.webp',0.35,'background'),
 ('06_arrecife_real.webp',0.50,'background'),
 ('../submarino/04_primer_plano.svg',0.80,'foreground'),
]
manifest={'schema':'marino-parallax-integrado-v571','levelSize':{'width':940,'height':3072},'layers':[]}
for n,(filename,speed,kind) in enumerate(assets):
 f=(target/filename).resolve()
 if not f.is_file(): raise RuntimeError(f'Archivo faltante: {filename}')
 data={'index':n,'src':'assets/parallax/marino/'+filename if not filename.startswith('../') else 'assets/parallax/submarino/'+filename.split('/')[-1], 'parallax':speed,'role':kind}
 if f.suffix.lower()!='.svg':
  with Image.open(f) as im:
   data['width'],data['height']=im.size
   data['alpha']=im.mode in ('RGBA','LA')
 manifest['layers'].append(data)
(target/'manifest_v571.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print('Generated',[(a['src'],a.get('width'),a.get('height')) for a in manifest['layers']])
