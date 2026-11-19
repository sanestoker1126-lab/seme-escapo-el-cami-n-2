/* Guadalajara PRO V2 — fondos con balcones pintados exactamente bajo las plataformas.
 * Solo visual: no crea ni mueve geometría, enemigos, personajes ni hitboxes.
 *
 * El arte se pintó sobre los mapas ORIGINALES (628×1024 Portales/Centro Histórico, 1600×450 Guadalajara).
 * En esta versión cada mapa es esa fuente + una copia lateral (levels.js continueMapBesideExit, datos en
 * sc.map.expansion). Por eso el fondo se coloca DOS veces, a escala 1:1 del mapa, en las mismas posiciones
 * que las dos copias del trazado: así cada balcón pintado queda bajo su plataforma. Entre las copias se ve
 * el fondo original de la escena; los bordes del arte PRO se difuminan para no dejar costura.
 * Si el tamaño de origen del mapa no coincide con el del arte, NO se activa (evita balcones desalineados). */
(function (root) {
  'use strict';
  const NS = root.CAMION = root.CAMION || {};
  const BASE = 'assets/scenes/guadalajara_rooftops_pro_v2/';
  const SCENES = Object.freeze({
    guadalajara: Object.freeze({ bg: BASE + 'bg_guadalajara_pro_v2.webp', overlay: BASE + 'architecture_guadalajara_pro_v2.png', src: [1600, 450] }),
    portales: Object.freeze({ bg: BASE + 'bg_portales_pro_v2.webp', overlay: BASE + 'architecture_portales_pro_v2.png', src: [628, 1024] }),
    centro_historico: Object.freeze({ bg: BASE + 'bg_centro_historico_pro_v2.webp', overlay: BASE + 'architecture_centro_historico_pro_v2.png', src: [628, 1024] })
  });
  const FEATHER = 0.035;      // ancho del difuminado, fracción del lado menor del arte
  const MAX_SIDE = 2048;      // lado mayor del lienzo difuminado (límite seguro de textura en móviles)
  const imageCache = new Map();
  const featherCache = new Map();
  const sideGroups = new WeakMap(); // índice por mundo, no se recorre cada fotograma

  function getImage(src) {
    if (!imageCache.has(src)) {
      if (typeof Image === 'undefined') return null;
      const im = new Image();
      im.decoding = 'async'; im.src = src;
      imageCache.set(src, im);
    }
    return imageCache.get(src);
  }
  const ready = (im) => !!(im && im.complete && im.naturalWidth > 0 && im.naturalHeight > 0);

  /** Rectángulos de mundo donde va el arte PRO (uno por copia del trazado). [] = no alineable. */
  function tiles(sc) {
    const def = sc && SCENES[sc.id], map = sc && sc.map;
    if (!def || !map || !(sc.scale > 0)) return [];
    const [sw, sh] = def.src, exp = map.expansion;
    let origins;
    if (exp && exp.mode === 'side-continuation' && exp.sourceWidth === sw && exp.sourceHeight === sh) origins = [[0, 0], [exp.offsetX, exp.offsetY]];
    else if (!exp && map.width === sw && map.height === sh) origins = [[0, 0]];
    else return [];
    return origins.map(([mx, my]) => ({ x: sc.x0 + mx * sc.scale, y: sc.startY + my * sc.scale, w: sw * sc.scale, h: sh * sc.scale }));
  }

  /** Fondo con los cuatro bordes difuminados a transparente (se crea una vez por escena). */
  function feathered(id) {
    if (featherCache.has(id)) return featherCache.get(id);
    const im = getImage(SCENES[id].bg);
    if (!ready(im) || typeof document === 'undefined') return null;
    let c = null;
    try {
      const s = Math.min(1, MAX_SIDE / Math.max(im.naturalWidth, im.naturalHeight));
      c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
      const x = c.getContext('2d');
      x.drawImage(im, 0, 0, c.width, c.height);
      const f = Math.max(2, Math.round(Math.min(c.width, c.height) * FEATHER));
      x.globalCompositeOperation = 'destination-out';
      const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = x.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(rx, ry, rw, rh);
      };
      edge(0, 0, f, 0, 0, 0, f, c.height);
      edge(c.width, 0, c.width - f, 0, c.width - f, 0, f, c.height);
      edge(0, 0, 0, f, 0, 0, c.width, f);
      edge(0, c.height, 0, c.height - f, 0, c.height - f, c.width, f);
    } catch (_) { c = null; }
    featherCache.set(id, c);
    // El lienzo difuminado reemplaza al WebP: se suelta para no tener ambos decodificados en memoria.
    if (c) imageCache.delete(SCENES[id].bg);
    return c;
  }

  function drawTiles(ctx, V, sc, img) {
    const list = tiles(sc);
    if (!list.length || !img) return 0;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    let n = 0;
    for (const t of list) {
      const x1 = Math.max(V.x1, t.x, sc.x0), y1 = Math.max(V.y1, t.y, sc.startY);
      const x2 = Math.min(V.x2, t.x + t.w, sc.x0 + sc.drawW), y2 = Math.min(V.y2, t.y + t.h, sc.endY);
      if (!(x2 > x1 && y2 > y1)) continue;
      ctx.drawImage(img, (x1 - t.x) * iw / t.w, (y1 - t.y) * ih / t.h, (x2 - x1) * iw / t.w, (y2 - y1) * ih / t.h,
        x1, y1, x2 - x1, y2 - y1);
      n++;
    }
    return n;
  }

  /** Dibuja el fondo PRO sobre el fondo original. Devuelve true si la escena tiene arte PRO activo. */
  function drawBackground(ctx, G, V, sc) {
    if (!tiles(sc).length) return false;
    const img = feathered(sc.id);
    if (!img) return false;
    ctx.save();
    drawTiles(ctx, V, sc, img);
    ctx.restore();
    return true;
  }

  /** Cornisas RGBA de cada copia, encima del parallax y debajo de plataformas y personajes. */
  function draw(ctx, G, V, sc) {
    if (!sc || !sc.gdlProArtwork || !SCENES[sc.id]) return false;
    const img = getImage(SCENES[sc.id].overlay);
    if (!ready(img)) return false;
    ctx.save();
    ctx.globalAlpha *= 0.93;
    const n = drawTiles(ctx, V, sc, img);
    ctx.restore();
    return n > 0;
  }

  // Sectores laterales procedurales: soportes visuales sobre las plataformas reales (sin colisiones).
  function drawSideSupports(ctx, G, V) {
    if (!G || !G.world || !Array.isArray(G.world.platforms)) return 0;
    const sceneByIndex = G.world.scenes || [];
    let groups = sideGroups.get(G.world);
    if (!groups) {
      groups = new Map();
      for (const p of G.world.platforms) {
        if (!p || (p.sector !== -1 && p.sector !== 1 && p.sector !== '-1' && p.sector !== '1') || p.kind === 'moving') continue;
        if (!groups.has(p.scene)) groups.set(p.scene, []);
        groups.get(p.scene).push(p);
      }
      sideGroups.set(G.world, groups);
    }
    let count = 0;
    ctx.save();
    for (const [sceneIndex, platforms] of groups) {
      const sc = sceneByIndex[sceneIndex];
      if (!sc || !sc.gdlProArtwork || !SCENES[sc.id]) continue;
      if (sc.endY < V.y1 || sc.startY > V.y2) continue;
      for (const p of platforms) {
        if (p.y < Math.max(V.y1, sc.startY) - 18 || p.y > Math.min(V.y2, sc.endY) + 18 || p.x2 < V.x1 || p.x1 > V.x2) continue;
        const x1 = Math.max(p.x1, V.x1), x2 = Math.min(p.x2, V.x2), w = x2 - x1;
        if (w <= 0) continue;
        const y = p.y;
        ctx.fillStyle = '#3c312e'; ctx.globalAlpha = .64; ctx.fillRect(x1, y + 2, w, 12);
        ctx.fillStyle = '#caa17a'; ctx.globalAlpha = .91; ctx.fillRect(x1, y - 2, w, 3);
        ctx.fillStyle = '#7e5b47'; ctx.globalAlpha = .90; ctx.fillRect(x1, y + 2, w, 4);
        ctx.fillStyle = '#654d41'; ctx.globalAlpha = .50;
        for (let x = x1 + 20; x < x2 - 14; x += 52) ctx.fillRect(x, y + 7, 8, 18);
        ctx.fillStyle = '#f4cf9c'; ctx.globalAlpha = .68; ctx.fillRect(x1, y - 3, w, 1);
        count++;
      }
    }
    ctx.restore();
    return count;
  }

  NS.GDL_ROOFTOPS_PRO_V2 = Object.freeze({
    has: (id) => Object.prototype.hasOwnProperty.call(SCENES, id),
    background: (id) => SCENES[id] ? SCENES[id].bg : null,
    tiles, drawBackground, draw, drawSideSupports,
    version: '58.1-guadalajara-pro-v2-tiled'
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
