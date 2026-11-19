#!/usr/bin/env python3
"""V58.1 source-locked alpha cleanup: no pose synthesis, atlas resizing or JSON edits.
Requires pillow, numpy and opencv-python-headless. Works inside the game/ folder.
"""
import argparse
import hashlib
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

def clean_rgba(src, remove_dust=False):
    assert src.dtype == np.uint8 and src.ndim == 3 and src.shape[2] == 4
    alpha = src[:, :, 3]
    core = (alpha >= 48).astype(np.uint8)
    dist = (cv2.distanceTransform(1-core, cv2.DIST_L2, 5)
            if core.any() else np.zeros(alpha.shape, dtype=np.float32))
    remove = (alpha > 0) & (alpha <= 3)
    remove |= (alpha > 3) & (alpha <= 12) & (dist > 3.5)
    remove |= (alpha > 12) & (alpha <= 24) & (dist > 7.0)
    dust_count = 0
    if remove_dust:
        remain = (alpha > 0) & ~remove
        n, labels, stats, _ = cv2.connectedComponentsWithStats(remain.astype(np.uint8), 8)
        substantial = np.zeros(alpha.shape, dtype=np.uint8)
        for i in range(1,n):
            if stats[i,cv2.CC_STAT_AREA] >= 90:
                substantial[labels == i] = 1
        if substantial.any():
            dst = cv2.distanceTransform(1-substantial,cv2.DIST_L2,5)
            for i in range(1,n):
                if stats[i,cv2.CC_STAT_AREA] > 9:
                    continue
                yy,xx=np.nonzero(labels==i)
                if (len(yy) and np.max(alpha[yy,xx]) <= 96
                        and np.min(dst[yy,xx]) > 10.0):
                    remove[yy,xx] = True
                    dust_count += 1
    out = src.copy()
    clear_rgb = (alpha == 0) & np.any(src[:,:,:3] != 0, axis=2)
    out[remove] = (0,0,0,0)
    out[clear_rgb,:3] = 0
    assert out.shape == src.shape
    assert np.array_equal(src[alpha >= 97],out[alpha >= 97])
    assert np.array_equal(src[~remove & (alpha>0)],out[~remove & (alpha>0)])
    assert np.all(out[:,:,3] <= alpha)
    return out, {
        "pixels_cleared":int(np.count_nonzero(remove)),
        "isolated_dust_components":dust_count,
        "dust_pixels_alpha_25_to_96":int(np.count_nonzero(remove & (alpha>=25))),
        "transparent_rgb_cleared":int(np.count_nonzero(clear_rgb))
    }

def source_locked_pngs(root):
    """Only the exact section 01 PNG: never process unrelated backgrounds."""
    import re
    c=json.loads((root/"assets/production/character_enemy_section01.json").read_text())
    names=set()
    def add(rel):
        if not rel.endswith(".png"): raise RuntimeError("Expected PNG "+rel)
        p=root/rel
        if not p.is_file(): raise RuntimeError("Missing source "+rel)
        names.add(p)
    for e in c["marine_enemies"]:
        add(e["atlas"])
        for i in range(e["frames"]):
            add(e["frames_directory"]+e["source_prefix"]+f"{i:03}.png")
    so=c["characters"]["sofia"]
    add(so["underwater"]["atlas"])
    add(so["underwater"]["attack_atlas"])
    add("assets/player/sofia/sofia_submarina_complementaria.png")
    for v in so["arrival"]["variants"]:
        add(v["atlas"])
        add(v["folder"]+"idle_0.png")
        for i in range(v["original_walk_frames"]):
            add(v["folder"]+f"walk_{i}.png")
    est=c["characters"]["estoker"]
    module=(root/est["module"]).read_text()
    for rel in re.findall(r'"src":"([^"]+\.png)"',module):
        add(rel)
    sidecar=json.loads((root/(est["folder"]+"manifest.json")).read_text())
    for seq in sidecar["sequences"].values():
        add(est["folder"]+seq["atlas"])
    for cat in c["characters"]["companions"]:
        for i in range(1,cat["idle_frames"]+1):
            add(cat["folder"]+cat["id"]+f"_idle_v38_0{i}.png")
        for i in range(1,cat["walk_frames"]+1):
            add(cat["folder"]+cat["id"]+f"_walk_v38_0{i}.png")
        add(cat["folder"]+cat["id"]+"_shoulder.png")
    return sorted(names)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",default=".")
    parser.add_argument("--report",default="qa_alpha_cleanup_v581.json")
    args=parser.parse_args()
    root=Path(args.root).resolve()
    imgs=source_locked_pngs(root)
    if not imgs:
        raise RuntimeError("Missing source PNG assets")
    rows=[]
    for p in imgs:
        rel=p.relative_to(root).as_posix()
        raw=p.read_bytes()
        with Image.open(p) as im:
            if im.mode != "RGBA":
                raise RuntimeError("Refusing to convert non-RGBA source: "+rel)
            source=np.asarray(im).copy()
        actor=any(s in rel for s in (
            "assets/cinematic/estoker_memory/",
            "assets/companions/",
            "assets/player/sofia_arrival/"
        ))
        out,stats=clean_rgba(source,actor)
        changed=not np.array_equal(source,out)
        if changed:
            Image.fromarray(out,"RGBA").save(p,format="PNG",compress_level=9,optimize=True)
        with Image.open(p) as check:
            decoded=np.asarray(check.convert("RGBA"))
            assert check.mode == "RGBA" and check.size == (source.shape[1],source.shape[0])
        assert np.array_equal(out,decoded),rel
        assert np.array_equal(decoded[source[:,:,3]>=97],source[source[:,:,3]>=97]),rel
        assert np.all(decoded[:,:,3] <= source[:,:,3]),rel
        output=p.read_bytes()
        rows.append({
            "path":rel,"changed":changed,"size_px":[source.shape[1],source.shape[0]],
            "bytes_original":len(raw),"bytes_cleaned":len(output),
            "sha256_original":hashlib.sha256(raw).hexdigest(),
            "sha256_cleaned":hashlib.sha256(output).hexdigest(),**stats
        })
    report={
        "schema":"seme-fue-el-camion/source-locked-frame-alpha-cleanup/v581",
        "method":"conservative low alpha fringe + isolated nonmarine actor dust",
        "qa":"PASS; alpha>=97 original RGBA unchanged, no added pixels, geometry unchanged",
        "total":len(rows),"changed":sum(int(x["changed"]) for x in rows),
        "cleared_pixels":sum(x["pixels_cleared"] for x in rows),
        "dust_components":sum(x["isolated_dust_components"] for x in rows),
        "files":rows
    }
    Path(args.report).write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print(json.dumps({key:report[key] for key in ["qa","total","changed","cleared_pixels","dust_components"]}))

if __name__=="__main__":
    main()
