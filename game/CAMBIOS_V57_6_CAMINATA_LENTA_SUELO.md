# V57.6 — Sofía y Estoker caminando más despacio y apoyados en tierra

- Velocidad de cuadros de Sofía en las escenas caminando: 270 ms/imagen (~3.7 FPS, era 125 ms/imagen).
- Estoker caminando: se reproduce a 1/1.9 de su velocidad original (170 ms * 1.9 = 323 ms/imagen). Los metadatos fuente se conservan.
- Movimiento lineal compartido y sincronizado, basado en `elapsed`: no anima `translateX` por CSS y el paso por JS a distinto ritmo.
- Isla inicial: marcha durante 7.5 s y detención; paseo con Estoker durante 9.5 s; paseo de la misión durante 8.45 s.
- Un solo suelo escénico visible de roca/musgo. Los personajes mantienen la misma línea base en cualquier tamaño de pantalla.
- `js/app/marine_feet.js` contiene el margen inferior transparente medido en cada PNG mediante el canal alfa. Ajuste exacto del offset vertical por cada frame para que los pies no floten.
- Mantiene las 7 escenas, flashback, bestias y atlas de buceo; no cambia física, colisiones, ataques ni gameplay.

QA: revisar en `PREVIEW_CINEMATICA_ESTOKER.html?auto=1` y en modo misión marina real.
