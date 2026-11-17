/* V58.1 · Presentación orbital. Usa el Canvas pausado como escena de fondo para
   conservar los sprites, trajes y parallax reales; no modifica mundo ni física. */
(function (root) {
  'use strict';
  const NS = root.CAMION = root.CAMION || {};
  const SCENES = Object.freeze([
    Object.freeze({
      kind: 'signal', tag: 'MISIÓN 4 · ESTACIÓN EN ÓRBITA', title: 'RECONEXIÓN ORBITAL',
      text: 'Tras cruzar las ruinas submarinas, la baliza de la ruta 6 llama desde una estación en órbita. Sofía, Luna y Morita siguen la señal: la salida está al otro lado.'
    }),
    Object.freeze({
      kind: 'station', tag: 'SEÑAL DE AUXILIO', title: 'LA ESTACIÓN A LA DERIVA',
      text: 'La estación perdió energía y sus plataformas quedaron separadas entre asteroides. La gravedad reducida conserva el impulso: cambia de dirección con tiempo y mide cada salto.'
    }),
    Object.freeze({
      kind: 'mission', tag: 'OBJETIVO · MÓDULO DE SALIDA', title: 'ÚLTIMO TRAMO',
      text: 'Cruza los huecos con SALTAR y usa LÁSER (X/U o el botón de acción) para defenderte. Los sólidos bloquean el rayo. Alcanza el módulo y reúne a la tripulación.'
    })
  ]);
  let overlay = null, active = false, index = 0, onEnd = null;
  const $ = (selector) => overlay.querySelector(selector);

  function mount() {
    if (overlay) return;
    overlay = root.document.createElement('section');
    overlay.id = 'spaceIntro';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cinemática de la misión espacial');
    overlay.innerHTML = `<div class="space-intro-stage" data-scene="signal">
      <div class="space-intro-top"><span class="space-intro-crew">SOFÍA · LUNA · MORITA</span><span class="space-intro-tag" aria-live="polite"></span></div>
      <div class="space-intro-copy" aria-live="polite"><h1 class="space-intro-title"></h1><p class="space-intro-text"></p></div>
      <div class="space-intro-controls"><button class="space-intro-skip" type="button">SALTAR CINEMÁTICA</button>
        <div class="space-intro-progress"><span class="space-intro-counter"></span><div class="space-intro-track"><i></i></div></div>
        <button class="space-intro-next" type="button">SIGUIENTE</button></div>
      <p class="space-intro-hint">ENTER / → para continuar · ESC para saltar</p>
    </div>`;
    root.document.body.appendChild(overlay);
    $('.space-intro-next').addEventListener('click', next);
    $('.space-intro-skip').addEventListener('click', finish);
  }

  function paint() {
    const scene = SCENES[index];
    const stage = $('.space-intro-stage');
    stage.dataset.scene = scene.kind;
    $('.space-intro-tag').textContent = scene.tag;
    $('.space-intro-title').textContent = scene.title;
    $('.space-intro-text').textContent = scene.text;
    $('.space-intro-counter').textContent = `ESCENA ${index + 1} / ${SCENES.length}`;
    $('.space-intro-track i').style.width = `${100 * (index + 1) / SCENES.length}%`;
    $('.space-intro-next').textContent = index === SCENES.length - 1 ? 'COMENZAR MISIÓN' : 'SIGUIENTE';
  }

  function onKey(event) {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); finish(); }
    else if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault(); event.stopImmediatePropagation(); next();
    }
  }

  function next() {
    if (!active) return;
    if (index >= SCENES.length - 1) { finish(); return; }
    index++;
    paint();
  }

  function finish() {
    if (!active) return;
    active = false;
    root.document.removeEventListener('keydown', onKey, true);
    overlay.hidden = true;
    const done = onEnd;
    onEnd = null;
    if (done) done();
  }

  function play(done) {
    if (active) return false;
    mount();
    onEnd = typeof done === 'function' ? done : null;
    active = true;
    index = 0;
    overlay.hidden = false;
    paint();
    root.document.addEventListener('keydown', onKey, true);
    return true;
  }

  NS.SpaceIntro = { play, get active() { return active; }, get scenes() { return SCENES.map((scene) => ({ ...scene })); } };
})(typeof globalThis !== 'undefined' ? globalThis : window);
