/* Guadalajara depth V3. Non-colliding atmospheric planes; scene architecture stays fixed.
 * Existing four world parallax layers are preserved; adds three lightweight RGBA
 * atmospheric layers at distinct velocities. The renderer never mutates physics. */
(function (root) {
  'use strict';
  const NS = root.CAMION = root.CAMION || {};
  const BASE = 'assets/parallax/guadalajara/depth_v3/';
  const SCENES = new Set(['guadalajara', 'portales', 'centro_historico']);
  const LAYERS = Object.freeze([
    Object.freeze({src: '01_bruma_atmosferica.png', speed: .06, alpha: .44, depth: 'far'}),
    Object.freeze({src: '02_luz_volumetrica.png', speed: .23, alpha: .53, depth: 'mid'}),
    Object.freeze({src: '03_hojas_jacaranda.png', speed: .55, alpha: .48, depth: 'near'})
  ]);
  // With a maximum of two visible transitions, no more than six images should
  // remain decoded. Browser may still retain network cache, not large canvases.
  const images = new Map();
  const MAX_IMAGES = 6;
  let frameCount = 0, lastDrawCount = 0;
  function get(src) {
    let im = images.get(src);
    if (!im) {
      im = new Image(); im.decoding = 'async'; im.src = src;
      images.set(src, im);
      if (images.size > MAX_IMAGES) {
        const oldest = images.keys().next().value;
        if (oldest !== src) images.delete(oldest);
      }
    } else {
      images.delete(src); images.set(src, im);
    }
    return im;
  }
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const ready = im => !!(im && im.complete && im.naturalWidth > 0 && im.naturalHeight > 0);
  function draw(ctx, G, V, sc, time) {
    // Integración en esta rama: se dibuja sobre el fondo actual de la escena. El paquete exigía
    // sc.gdlProArtwork (fondos PRO V2), pero esos fondos se hicieron para mapas de 628×1024 /
    // 1600×450 y los mapas actuales son mayores, así que PRO V2 no se activa.
    if (!ctx || !G || !V || !sc || sc.theme !== 'guadalajara' ||
        !SCENES.has(sc.id) || !G.view || !G.cam) return 0;
    const x1 = Math.max(V.x1, sc.x0), y1 = Math.max(V.y1, sc.startY);
    const x2 = Math.min(V.x2, sc.x0 + sc.drawW), y2 = Math.min(V.y2, sc.endY);
    if (!(x2 > x1 && y2 > y1) || sc.drawW <= 0 || sc.drawH <= 0) return 0;
    const v = G.view;
    const vw = Math.min(sc.drawW, Math.max(1, v.w));
    const vh = Math.min(sc.drawH, Math.max(1, v.h));
    const xTravel = Math.max(0, sc.drawW - vw);
    const yTravel = Math.max(0, sc.drawH - vh);
    const progressX = clamp(G.cam.x - sc.x0, 0, xTravel);
    const progressY = clamp(G.cam.y - sc.startY, 0, yTravel);
    const reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    // Vary only by a few pixels; particles must never obscure gameplay or jitter.
    const seconds = Number.isFinite(time) ? time : 0;
    let draws = 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.clip();
    for (let i = 0; i < LAYERS.length; i++) {
      const layer = LAYERS[i];
      const img = get(BASE + sc.id + '/' + layer.src);
      if (!ready(img)) continue; // progressive activation; original scene never disappears
      // The layer is always larger than the current viewport, including on camera extrema.
      const padX = Math.min(72, vw * .20), padY = Math.min(72, vh * .20);
      const requiredW = vw + 2 * padX + xTravel * layer.speed;
      const requiredH = vh + 2 * padY + yTravel * layer.speed;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(requiredW / iw, requiredH / ih);
      const dw = iw * scale, dh = ih * scale;
      const driftX = reduce ? 0 : Math.sin(seconds * .13 + i) * (1.5 + i);
      const driftY = reduce ? 0 : Math.cos(seconds * .085 + i) * (1 + i * .5);
      const dx = sc.x0 + progressX * (1 - layer.speed) - padX + (requiredW - dw) * .5 + driftX;
      const dy = sc.startY + progressY * (1 - layer.speed) - padY + (requiredH - dh) * .5 + driftY;
      const ax = Math.max(x1, dx), ay = Math.max(y1, dy);
      const bx = Math.min(x2, dx + dw), by = Math.min(y2, dy + dh);
      if (bx <= ax || by <= ay) continue;
      ctx.globalAlpha = layer.alpha;
      ctx.drawImage(img, (ax - dx) * iw / dw, (ay - dy) * ih / dh,
                    (bx - ax) * iw / dw, (by - ay) * ih / dh,
                    ax, ay, bx - ax, by - ay);
      draws++;
    }
    ctx.restore();
    lastDrawCount = draws; frameCount++;
    return draws;
  }
  NS.GDL_DEPTH_V3 = Object.freeze({
    version: 'gdl-depth-v3.0', draw, enabledFor: id => SCENES.has(id),
    stats: () => ({frames: frameCount, lastDrawCount, cachedImages: images.size}),
    speeds: Object.freeze(LAYERS.map(x => x.speed))
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
