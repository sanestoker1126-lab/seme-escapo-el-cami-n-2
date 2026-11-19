#!/usr/bin/env python3
"""Reproducible environmental-depth pipeline for Guadalajara PRO V2.

Generates three non-colliding RGBA depth/atmospheric planes per scene. The
original architectural WebP remains unchanged and fixed to world geometry.
This is not semantic character/architecture segmentation; it is a controlled
atmospheric depth enhancement, with no painted gameplay geometry.
"""
from __future__ import annotations
import csv
import hashlib
import io
import json
import math
import os
from pathlib import Path
import random
import shutil
import sys
import zipfile

import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC=Path('GUADALAJARA_AZOTEAS_PROFESIONAL_V2_V58_1.zip')
DEST=Path('guadalajara_depth_v3_build')
BASE=DEST/'game/assets/parallax/guadalajara/depth_v3'
REPORT=DEST/'game/reports/guadalajara_depth_v3'
SCENES=['guadalajara','portales','centro_historico']
LAYER_NAMES=['01_bruma_atmosferica','02_luz_volumetrica','03_hojas_jacaranda']
SPEED=[.06,.23,.55]
ALPHA=[.44,.53,.48]
TINTS={
 'guadalajara': {'fog':(236,202,159),'light':(255,213,146),'leaf':(127,68,166)},
 'portales': {'fog':(233,191,199),'light':(255,183,112),'leaf':(133,68,163)},
 'centro_historico': {'fog':(220,200,188),'light':(255,216,170),'leaf':(133,70,150)},
}

def hashbytes(b:bytes)->str: return hashlib.sha256(b).hexdigest()
def gaussian_field(h,w,rng,rows=14,cols=10):
    coarse=rng.normal(0,1,(rows,cols)).astype('float32')
    a=cv2.resize(coarse,(w,h),interpolation=cv2.INTER_CUBIC)
    a=cv2.GaussianBlur(a,(0,0),sigmaX=max(1.0,w/120),sigmaY=max(1.0,h/180))
    a=(a-a.min())/(a.max()-a.min()+1e-8)
    return a

def rgbatinted(color,alpha):
    rgba=np.zeros((*alpha.shape,4),dtype=np.uint8)
    rgba[:,:,:3]=color
    rgba[:,:,3]=np.asarray(np.clip(alpha,0,255),dtype=np.uint8)
    return Image.fromarray(rgba,'RGBA')

def fog_plane(size,scene,seed):
    w,h=size; rng=np.random.default_rng(seed)
    a=gaussian_field(h,w,rng,14,12)
    yy=np.arange(h,dtype='float32')[:,None]/h
    # Far atmosphere on the skyline and distant rooftops, not gameplay floor.
    haze=np.exp(-((yy-.25)/.29)**2) * .85 + np.exp(-((yy-.68)/.15)**2)*.21
    fog=np.clip((a*.66+.25)*haze,0,1)*66
    return rgbatinted(TINTS[scene]['fog'],fog)

def light_plane(size,scene,seed):
    w,h=size;rng=np.random.default_rng(seed)
    v=np.zeros((h,w),np.float32)
    yy,xx=np.mgrid[:h,:w].astype('float32')
    # Gentle volumetric light shafts; deliberately weak so hazards remain legible.
    origins=[(w*.17,h*.06),(w*.75,h*.08),(w*.52,h*.19)]
    for k,(cx,cy) in enumerate(origins):
        ang=[.28,-.22,.10][k];dx=(xx-cx)-ang*(yy-cy)
        width=w*[.055,.043,.030][k]
        beam=np.exp(-.5*(dx/width)**2)*np.exp(-np.maximum(yy-cy,0)/(h*.66))
        beam[yy<cy]=0
        v+=beam*[.62,.53,.31][k]
    # A second depth cue: soft diffuse lamplight, no fixed collision edges.
    centers=[(.14,.48),(.86,.53),(.23,.81),(.73,.78)]
    for cx,cy in centers:
        r=((xx-w*cx)/(w*.10))**2+((yy-h*cy)/(h*.046))**2
        v+=.18*np.exp(-r/2.)
    noise=gaussian_field(h,w,rng,10,8)
    v=v*(noise*.18+.85)
    return rgbatinted(TINTS[scene]['light'],v*57)

def leaves_plane(size,scene,seed):
    w,h=size;rng=random.Random(seed)
    im=Image.new('RGBA',(w,h),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA')
    leaves=TINTS[scene]['leaf']
    # Near-camera jacaranda petals on edges: never solid collision silhouettes.
    num=90 if h>700 else 45
    for i in range(num):
        edge=rng.random()
        if edge<.37:x=rng.uniform(-.04,.15)*w
        elif edge<.74:x=rng.uniform(.85,1.04)*w
        else:x=rng.uniform(.12,.88)*w
        y=rng.uniform(-.03,.97)*h
        rad=rng.uniform(.004,.014)*w
        if edge>=.74:rad*=.60
        t=rng.uniform(-.9,.9)
        poly=[(x+math.cos(t+a)*rad*(1.25 if j%2 else .66),y+math.sin(t+a)*rad*.65) for j,a in enumerate([0,math.pi/2,math.pi,3*math.pi/2])]
        # Genuine partially transparent cutouts, not chroma-keyed artwork.
        d.polygon(poly,fill=(*leaves,rng.randint(44,108)))
        d.ellipse((x-rad*.22,y-rad*.20,x+rad*.22,y+rad*.20), fill=(237,158,221,rng.randint(20,70)))
    # Some near defocused flower glows for cinematic depth, very faint.
    glow=im.filter(ImageFilter.GaussianBlur(max(1,w/140)))
    glow.putalpha(glow.getchannel('A').point(lambda q:int(q*.20)))
    glow.alpha_composite(im)
    return glow

def make_assets():
    if not SRC.is_file():raise FileNotFoundError(SRC)
    DEST.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(SRC) as zi:
        for member in zi.infolist():
            dst=DEST/member.filename
            if member.is_dir():dst.mkdir(parents=True,exist_ok=True);continue
            dst.parent.mkdir(parents=True,exist_ok=True)
            dst.write_bytes(zi.read(member.filename))
    BASE.mkdir(parents=True,exist_ok=True);REPORT.mkdir(parents=True,exist_ok=True)
    old=json.loads((DEST/'game/assets/scenes/guadalajara_rooftops_pro_v2/guadalajara_pro_v2_manifest.json').read_text())
    manifest={"schema":"seme-fue-el-camion/guadalajara-depth-v3","release":"V58.1 FASE4 — RELEASE_CANDIDATE_ECO",
              "status":"GENERATED_PENDING_INGAME_QA","provenance":"Derived atmospheric RGBA effects; existing WebP architecture is not edited",
              "rules":{"fixed_architecture":True,"keep_existing_four_parallax":True,"no_collision_changes":True,
                       "no_character_enemy_changes":True,"no_main_changes":True,"clip":"viewport_intersect_scene",
                       "transparent_effects_only":True,"strict_alpha":True},
              "scenes":{}}
    rows=[]
    for i,scene in enumerate(SCENES):
        info=old['scenes'][scene]
        w,h=info['image_size'];target_w=min(832, w) if h>w else min(1088,w)
        target_h=round(target_w*h/w);size=(target_w,target_h)
        p=BASE/scene;p.mkdir(exist_ok=True)
        layers=[]
        assets=[fog_plane(size,scene,1975+i),light_plane(size,scene,2830+i),leaves_plane(size,scene,7716+i)]
        for j,(name,im) in enumerate(zip(LAYER_NAMES,assets)):
            filename=f'{name}.png';path=p/filename;im.save(path,compress_level=7)
            pix=np.asarray(im,dtype=np.uint8);alpha=pix[:,:,3]
            coverage=float(np.count_nonzero(alpha))/alpha.size
            assert im.mode=='RGBA' and alpha.max()>0 and alpha.min()==0
            data=path.read_bytes()
            layer={'id':name,'src':f'assets/parallax/guadalajara/depth_v3/{scene}/{filename}',
                   'width':im.width,'height':im.height,'speed':SPEED[j],'opacity':ALPHA[j],
                   'alpha_coverage':round(coverage,4),'sha256':hashbytes(data),'depth':('far','mid','near')[j],
                   'occlusion':'atmospheric_overlay_not_gameplay_geometry'}
            layers.append(layer)
            rows.append({'scene':scene,'name':name,'image_width':im.width,'image_height':im.height,
                         'speed':SPEED[j],'opacity':ALPHA[j],'nonzero_alpha_coverage':round(coverage,4),'sha256':hashbytes(data)})
        manifest['scenes'][scene]={'scene_id':scene,'base_background':info['background'],
                                    'base_size':info['image_size'],'base_map':info['map_size'],
                                    'architecture_overlay':info['architecture_overlay'],
                                    'existing_land_parallax_speeds':old['base_parallax']['speeds'],
                                    'layers':layers}
    dst=BASE/'manifest.json';dst.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (BASE/'layer_catalog.csv').open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=rows[0].keys());writer.writeheader();writer.writerows(rows)
    return manifest

if __name__=='__main__':
 import argparse
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--v2-zip',type=Path,required=True,help='Original PRO V2 ZIP archive')
 p.add_argument('--out',type=Path,required=True,help='EMPTY destination folder (never overwrites project)')
 args=p.parse_args()
 SRC=args.v2_zip.resolve();DEST=args.out.resolve();BASE=DEST/'game/assets/parallax/guadalajara/depth_v3';REPORT=DEST/'game/reports/guadalajara_depth_v3'
 if DEST.exists() and any(DEST.iterdir()):raise SystemExit('Refusing to overwrite a nonempty output directory: '+str(DEST))
 m=make_assets();print(json.dumps({k:len(v['layers']) for k,v in m['scenes'].items()}))
