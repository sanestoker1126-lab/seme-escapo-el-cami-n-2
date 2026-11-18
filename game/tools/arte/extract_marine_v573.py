#!/usr/bin/env python3
"""Integración marina V57.3: extracción real de atlas y storyboard (sin generación)."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import json,math,re,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
ASSETS=ROOT/'assets/enemies/marine'
OUT=ROOT/'assets/cinematic/storyboard_marino'
OUT.mkdir(parents=True,exist_ok=True)
allmetadata={}
for kind in ('piranha','shark','octopus','poseidon'):
    src=Image.open(ASSETS/f'{kind}_atlas.png').convert('RGBA')
    meta=json.loads((ASSETS/f'{kind}_atlas.json').read_text('utf-8'))
    original_cw,original_ch=meta['cell']['w'],meta['cell']['h']
    padded_cell=(original_cw+16,original_ch+16)
    names=sorted(meta['frames'],key=lambda n:int(n.rsplit('_',1)[-1]))
    assert len(names)=={'piranha':35,'shark':33,'octopus':37,'poseidon':24}[kind]
    cols=6;rows=math.ceil(len(names)/cols)
    out=Image.new('RGBA',(cols*padded_cell[0],rows*padded_cell[1]),(0,0,0,0))
    frameout=ASSETS/'frames'/kind;frameout.mkdir(parents=True,exist_ok=True)
    packed=[];valid=0;faults=[]
    for i,name in enumerate(names):
        rec=meta['frames'][name];fr=rec['frame']; x,y,w,h=[fr[k] for k in ['x','y','w','h']]
        assert x>=0 and y>=0 and w>0 and h>0 and x+w<=src.width and y+h<=src.height,(kind,name,'out of bounds')
        crop=src.crop((x,y,x+w,y+h))
        bbox=crop.getchannel('A').getbbox()
        if not bbox: faults.append([name,'empty']);continue
        if bbox[0]==0 or bbox[1]==0 or bbox[2]==w or bbox[3]==h:
            # edge hit: crop is trimmed, not necessarily invalid; report for inspection
            faults.append([name,'trim touches crop edge; expected for trimmed sources'])
        ox,oy=rec['origin']['x'],rec['origin']['y']
        assert 0<=ox and 0<=oy and ox+w<=original_cw and oy+h<=original_ch, (kind,name,'bad origin')
        tx=(i%cols)*padded_cell[0]+8+ox
        ty=(i//cols)*padded_cell[1]+8+oy
        out.alpha_composite(crop,(tx,ty))
        # PNG individual RGBA; 8px safe border and source centered via origin metadata.
        single=Image.new('RGBA',(w+16,h+16),(0,0,0,0));single.alpha_composite(crop,(8,8))
        single.save(frameout/f'{name}.png',optimize=True)
        packed.append([tx,ty,w,h,ox+8,oy+8])
        valid+=1
    assert valid==len(names),(kind,valid,len(names))
    sheetname=f'{kind}_atlas_v573.png'
    out.save(ASSETS/sheetname,optimize=True)
    indexed_animations={key:{'ids':[names.index(fn) for fn in val['frames']],'ms':val['frame_duration_ms'],'loop':val['loop']} for key,val in meta['animations'].items()}
    newmeta={
     'source_atlas':f'{kind}_atlas.png','source_metadata':f'{kind}_atlas.json',
     'image':sheetname,'format':'RGBA8888','frames_count':len(names),
     'cell':{'w':padded_cell[0],'h':padded_cell[1]},'pivot':{'x':0.5,'y':0.5},
     'padding':8,'direction':'right','frames':{name:{'rect':packed[i],'state':next((s for s,a in meta['animations'].items() if name in a['frames']), 'unused')} for i,name in enumerate(names)},
     'animations':indexed_animations,'qa_flags':faults
    }
    (ASSETS/f'{kind}_atlas_v573.json').write_text(json.dumps(newmeta,indent=2,ensure_ascii=False),'utf-8')
    allmetadata[kind]={'src':f'assets/enemies/marine/{sheetname}', 'cell':list(padded_cell), 'frames':packed,'animations':indexed_animations}
    # contact sheet based on individual crops, preserving transparency
    ww=cols*160;hh=rows*137
    contact=Image.new('RGB',(ww,hh),(23,39,61));dr=ImageDraw.Draw(contact)
    for i,name in enumerate(names):
        x=i%cols*160;y=i//cols*137
        crop=src.crop((meta['frames'][name]['frame']['x'],meta['frames'][name]['frame']['y'],meta['frames'][name]['frame']['x']+meta['frames'][name]['frame']['w'],meta['frames'][name]['frame']['y']+meta['frames'][name]['frame']['h']))
        crop.thumbnail((150,102),Image.Resampling.LANCZOS)
        contact.paste(crop,(x+(160-crop.width)//2,y+(110-crop.height)//2),crop)
        dr.text((x+6,y+114),f'{kind} {i:03d}',fill=(238,244,255))
    contact.save(ASSETS/f'{kind}_QA_v573.webp',quality=85)
    print(kind, len(names),out.size, 'qa flags',len(faults))
# Regenerate display metadata for actual game draw with source rects preserved.
js='/* V57.3: frames RGBA EXTRAÍDOS y atlas normalizados con padding 8px. Sin IA. */\n(function(root){"use strict";const NS=root.CAMION=root.CAMION||{};NS.MARINE_ATLASES='+json.dumps(allmetadata,separators=(',',':'))+';})(typeof globalThis!=="undefined"?globalThis:window);\n'
(ROOT/'js/app/marine_atlases.js').write_text(js,'utf-8')
# Storyboard assets: real crops of user-supplied last storyboard, not standalone character frames.
sheet=Image.open(OUT/'hoja_original.png').convert('RGB')
W,H=sheet.size
# 5 horizontal panels in the last reference sheet, manual source coordinates checked against image
bounds=[(72,210),(214,357),(364,511),(517,671),(677,847)]
for i,(ya,yb) in enumerate(bounds):
    # source aspect ratio preserved; background blur + sharp main strip, no stretching
    art=sheet.crop((0,ya,W,yb))
    cover=Image.new('RGB',(1280,720),(2,24,48))
    big=art.resize((round(art.width*720/art.height),720),Image.Resampling.LANCZOS)
    left=(big.width-1280)//2
    big=big.crop((left,0,left+1280,720)).filter(ImageFilter.GaussianBlur(26))
    cover.paste(big,(0,0))
    # display full breadth of panel at 1260 width with natural ratio and letterbox
    nw=1260;nh=round(art.height*nw/art.width)
    resized=art.resize((nw,nh),Image.Resampling.LANCZOS)
    cover.paste(resized,(10,210+(i%2)*12))
    shade=Image.new('RGBA',(1280,720),(0,0,0,0));sd=ImageDraw.Draw(shade)
    sd.rectangle((0,0,1279,100),fill=(0,14,38,65))
    for j in range(0,150,6):sd.rectangle((0,570+j,1280,575+j),fill=(0,11,27,min(225,25+j)))
    cover=Image.alpha_composite(cover.convert('RGBA'),shade).convert('RGB')
    cover.save(OUT/f'escena_{i+1:02d}.webp',format='WEBP',quality=88,method=5)
# store unmodified sheet for traceability and user-requested flashback source.
# hoja_original.png preservada como fuente canónica
(OUT/'manifest.json').write_text(json.dumps({'source':'hoja_original.png','frames':[{'image':f'escena_{i+1:02d}.webp','crop_y':list(v),'storyboard_panel':i+1} for i,v in enumerate(bounds)]},indent=2,ensure_ascii=False),'utf-8')
print('cinematic panels ready',W,H)
