#!/usr/bin/env python3
"""¡Se me fue el camión! — atlas de astronautas V58.1 para el juego.

Lee el paquete ATLAS_ESPACIAL_V58_1_CONTORNOS_MAPEADOS_JSON (carpeta `personajes/<id>/atlas.json` +
`atlas_00.png`) y genera, por personaje, un atlas reducido listo para el runtime:

  game/assets/space_atlas_v581/<id>.png       (RGBA, frames escalados con alfa premultiplicado)
  game/js/app/space_atlas_data.js            (NS.SPACE_ATLAS: frames y anclas en px del atlas reducido)

Normalización (el paquete mezcla tres escalas de origen; ver README del paquete, "Límites"):
  * Hojas de celdas de 280 px (idle/walk/run/jump/land/hurt_alt): pies = fondo del contorno de idle_01,
    centro = centro de la celda; todas las poses conservan su posición relativa dentro de la celda.
  * Hojas de celdas de 362 px (boost/shoot): mismo criterio con shoot_01 como referencia de pie.
  * Recortes previos (prior_zip: defeat/victory): pies = fondo del recorte; referencia = victory_01.
  Cada grupo se escala para que su pose de referencia mida TARGET_H unidades de mundo.

No se usa la carpeta `cuarentena/`. No modifica sprites existentes del juego.
Uso: python3 build_space_atlas_v581.py <carpeta_del_paquete> <carpeta_game>
"""
import json
import os
import sys

from PIL import Image

PACK_SCALE = 0.5          # en pantalla Sofía mide ~150 px: 50 % basta y gasta 4× menos memoria de GPU
PAD = 2
MAX_W = 2048
TARGET_H = {'sofia': 68.0, 'gato': 9.4}   # unidades de mundo de la pose de referencia (Sofía actual ≈ 66.7)

CHARACTERS = {
    'sofia_falda_roja': ('sofia', ['idle', 'walk', 'run', 'jump_launch', 'jump_air', 'land', 'hurt_alt',
                                   'boost', 'shoot', 'defeat', 'victory']),
    'sofia_cuadros': ('sofia', ['idle', 'walk', 'run', 'jump_launch', 'jump_air', 'land', 'hurt_alt',
                                'boost', 'shoot']),
    'gato_blanco': ('gato', ['idle', 'walk', 'run', 'jump_air']),
    'gato_gris': ('gato', ['idle', 'walk', 'run', 'jump_air']),
}


def drop_bottom_strays(im, name, log):
    """Quita piezas sueltas pequeñas pegadas al borde INFERIOR del recorte (p. ej. el casco de la celda
    de abajo que se coló en run_01/run_02 de sofia_cuadros). No toca llamas/destellos laterales."""
    import numpy as np
    a = np.array(im.split()[3]) > 38
    h, w = a.shape
    lab = np.zeros((h, w), np.int32)
    comps = []
    for sy, sx in zip(*np.nonzero(a)):
        if lab[sy, sx]:
            continue
        cid = len(comps) + 1
        stack = [(sy, sx)]
        lab[sy, sx] = cid
        ys, xs = [], []
        while stack:
            y, x = stack.pop()
            ys.append(y); xs.append(x)
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = cid
                    stack.append((ny, nx))
        comps.append((cid, len(ys), min(ys), max(ys)))
    if len(comps) < 2:
        return im
    big = max(c[1] for c in comps)
    kill = [c for c in comps if c[1] < 0.04 * big and c[3] >= h - 2 and c[2] >= h * 0.85]
    if not kill:
        return im
    arr = np.array(im)
    for cid, area, _, _ in kill:
        arr[lab == cid] = 0
    log.append('%s: %d pieza(s) suelta(s) en el borde inferior eliminada(s)' % (name, len(kill)))
    return Image.fromarray(arr, 'RGBA')


def group_of(entry):
    if entry['source_png'].startswith('prior_zip'):
        return 'trim'
    return 'sheet:' + entry['source_png']   # cada hoja de origen tiene su propia escala de celda


def build(pack_dir, game_dir):
    out_img_dir = os.path.join(game_dir, 'assets', 'space_atlas_v581')
    os.makedirs(out_img_dir, exist_ok=True)
    data = {}
    cleaned = []
    for cid, (kind, anims) in CHARACTERS.items():
        src_dir = os.path.join(pack_dir, 'personajes', cid)
        meta = json.load(open(os.path.join(src_dir, 'atlas.json'), encoding='utf-8'))
        page = Image.open(os.path.join(src_dir, meta['atlas_pages'][0]['image'])).convert('RGBA')
        frames = meta['frames']

        # Referencias por grupo de origen: altura de pie y línea de pies.
        refs = {}
        for name in ('idle_01', 'shoot_01', 'victory_01'):
            if name not in frames:
                continue
            e = frames[name]
            g = group_of(e)
            ss = e['spriteSourceSize']
            refs[g] = {'h': ss['h'], 'foot': ss['y'] + ss['h']}

        names = []
        for a in anims:
            names += meta['animations'][a]['frames']

        # Recorta, escala y empaqueta en estantes.
        tiles = []
        for n in names:
            e = frames[n]
            f = e['frame']
            crop = page.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
            crop = drop_bottom_strays(crop, cid + '/' + n, cleaned)
            w = max(1, round(f['w'] * PACK_SCALE))
            h = max(1, round(f['h'] * PACK_SCALE))
            crop = crop.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
            tiles.append((n, e, crop))
        x = y = shelf = 0
        placed = []
        for n, e, im in tiles:
            if x + im.width + PAD > MAX_W:
                x, y, shelf = 0, y + shelf + PAD, 0
            placed.append((n, e, im, x, y))
            x += im.width + PAD
            shelf = max(shelf, im.height)
        atlas_w = min(MAX_W, max(px + im.width for _, _, im, px, _ in placed))
        atlas_h = y + shelf
        atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))
        out_frames = {}
        for n, e, im, px, py in placed:
            atlas.paste(im, (px, py))
            g = group_of(e)
            ss, src = e['spriteSourceSize'], e['sourceSize']
            ref = refs[g]
            if g == 'trim':
                ax_src, ay_src = ss['w'] / 2, ss['h']
            else:
                ax_src, ay_src = src['w'] / 2 - ss['x'], ref['foot'] - ss['y']
            k = TARGET_H[kind] / (ref['h'] * PACK_SCALE)   # unidades de mundo por px del atlas reducido
            out_frames[n] = [px, py, im.width, im.height,
                             round(ax_src * PACK_SCALE, 2), round(ay_src * PACK_SCALE, 2), round(k, 5)]
        img_rel = 'assets/space_atlas_v581/%s.png' % cid
        atlas.save(os.path.join(game_dir, img_rel), optimize=True)
        data[cid] = {
            'image': img_rel,
            'anims': {a: {'ms': meta['animations'][a]['duration_ms'], 'loop': bool(meta['animations'][a].get('loop')),
                          'frames': meta['animations'][a]['frames']} for a in anims},
            'frames': out_frames,
        }
        print('%-17s %3d frames  atlas %dx%d' % (cid, len(out_frames), atlas_w, atlas_h))
    for line in cleaned:
        print('limpieza:', line)

    js = ('/* ¡Se me fue el camión! — atlas de astronautas V58.1 (generado con tools/arte/build_space_atlas_v581.py;\n'
          '   no editar a mano). Origen: paquete ATLAS_ESPACIAL_V58_1_CONTORNOS_MAPEADOS_JSON (arte conceptual\n'
          '   preliminar, no sprites canónicos). frames[nombre] = [x, y, w, h, ax, ay, k]: rectángulo en el atlas,\n'
          '   ancla de pies (ax, ay) en px del atlas y k = unidades de mundo por px. Solo visual: no toca hitboxes. */\n'
          '(function (root) {\n  \'use strict\';\n  const NS = root.CAMION = root.CAMION || {};\n'
          '  NS.SPACE_ATLAS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
          '})(typeof globalThis !== \'undefined\' ? globalThis : window);\n')
    with open(os.path.join(game_dir, 'js', 'app', 'space_atlas_data.js'), 'w', encoding='utf-8') as fh:
        fh.write(js)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    build(sys.argv[1], sys.argv[2])
