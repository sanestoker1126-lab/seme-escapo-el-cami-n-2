#!/usr/bin/env python3
"""Import A1+A2 PNG RGBA assets into this repository, without altering gameplay.
Usage (from repository root):
  python3 game/tools/import_environment_assets.py /path/to/SE_ME_FUE_EL_CAMION_ENVIRONMENT_A1_A2_RGBA_V58_1.zip
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import sys
import zipfile

EXPECTED_SHA256 = "e987510ca7a0645cc8e53a89260209205e6bebe05c6f648d86d050b3604f2281"
ROOT = Path(__file__).resolve().parents[2]
MANIFEST = "game/assets/environment_complete_manifest.json"
EXTRA_SOURCE_ONLY = (
    'game/assets/objects/guadalajara/banca_hierro_forjado.png',
    'game/assets/objects/submarino/arco_ruina_sumergida.png',
)
SUPPORT_FILES = (
    "game/assets/environment_manifest.json",
    "game/assets/environment_a2_manifest.json",
    "game/assets/environment_complete_manifest.json",
    "game/tests/environment_assets_integrity.test.js",
    "game/tests/environment_A2_integrity.test.js",
    "game/tools/preview_environment_assets.html",
    "game/tools/preview_environment_A2.html",
    "game/tools/preview_environment_complete.html",
)

def inspect_png(data: bytes, name: str) -> tuple[int,int]:
    if not data.startswith(bytes.fromhex("89504e470d0a1a0a")):
        raise ValueError(f"{name}: invalid PNG signature")
    if len(data)<26 or data[25]!=6:
        raise ValueError(f"{name}: expected PNG RGBA color type 6")
    w = int.from_bytes(data[16:20],"big")
    h = int.from_bytes(data[20:24],"big")
    if not 0<w<=16384 or not 0<h<=16384:
        raise ValueError(f"{name}: invalid image dimensions")
    return w,h

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip_path",type=Path)
    parser.add_argument("--root",type=Path,default=ROOT)
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    root=args.root.resolve()
    if not (root/"game/js/app/render.js").is_file():
        parser.error("target is not a game repository checkout")
    payload=args.zip_path.read_bytes()
    digest=hashlib.sha256(payload).hexdigest()
    if digest!=EXPECTED_SHA256:
        parser.error("ZIP SHA256 mismatch: original A1+A2 bundle required")
    with zipfile.ZipFile(args.zip_path) as src:
        if src.testzip() is not None:
            parser.error("ZIP CRC validation failed")
        manifest=json.loads(src.read(MANIFEST))
        if manifest.get("schema")!="seme-fue-el-camion/environment-A1-A2/v1":
            parser.error("unexpected manifest schema")
        objects=manifest.get("objects",[])
        if len(objects)!=32:
            parser.error("unexpected number of catalogued objects")
        targets=set(SUPPORT_FILES)|set(EXTRA_SOURCE_ONLY)
        for obj in objects:
            targets.add("game/"+obj["png"])
        for world in manifest["worlds"].values():
            for batch in ("A1","A2"):
                entry=world[batch]
                for field in ("atlas","metadata","csv"):
                    targets.add("game/"+entry[field])
        staged=[]
        for name in sorted(targets):
            if not name.startswith("game/") or ".." in Path(name).parts:
                raise ValueError(f"invalid archive path: {name}")
            data=src.read(name)
            if name.endswith(".png"):
                inspect_png(data,name)
            dst=(root/name).resolve()
            if not dst.is_relative_to(root):
                raise ValueError(f"destination escapes repository: {name}")
            if dst.exists() and dst.read_bytes()!=data:
                raise FileExistsError(f"refusing to overwrite modified asset: {name}")
            staged.append((dst,data,name))
        print(f"Validated {len(objects)} catalogued props and {len(staged)} files; ZIP SHA256 {digest}")
        if args.dry_run:
            return 0
        for dst,data,name in staged:
            dst.parent.mkdir(parents=True,exist_ok=True)
            if not dst.exists():
                dst.write_bytes(data)
                print("ADDED",name)
        print("NEXT: cd game && node --test tests/environment_assets_integrity.test.js tests/environment_A2_integrity.test.js")
        print("NEXT: git add game/assets/objects game/assets/atlases game/assets/environment* game/tests/environment_*")
        print("NEXT: git commit -m 'assets: import 32 RGBA environment props A1+A2' && git push")
    return 0

if __name__=="__main__":
    sys.exit(main())
