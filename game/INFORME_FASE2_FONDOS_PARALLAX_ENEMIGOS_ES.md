# Informe ECO — Fase 2: fondos, parallax y densidad de enemigos

**Base:** candidata V58.1 con expansión de mundos de Fase 1.  
**Estado:** candidata incremental de Fase 2; no equivale a RELEASE 1.0.  
**Alcance autorizado:** ampliar profundidad visual con cuatro planos lógicos y ajustar de forma moderada la densidad de encuentros en recorridos expandidos.  
**Preservación:** se conservaron geometría, colisiones, progreso, personajes, sprites y arte fuente preexistente. No se generaron reemplazos de sprites.

## Cambios realizados

- `js/app/render.js`: Escuela y Guadalajara componen el fondo propio de escena con tres planos transparentes de parallax, para cuatro estratos lógicos en total. Los planos siguen la cámara horizontal y vertical, se limitan al rectángulo visible y conservan la proporción del arte. Se redujeron sus opacidades tras la revisión visual para evitar que los edificios y vegetación duplicados se impongan sobre el fondo. Se usan los elementos WebP decodificados directamente, evitando crear copias de canvas adicionales.
- `assets/parallax/phase2/manifest.json`: asociación explícita de cuatro estratos y sus recursos para los cuatro mundos y 18 ids de escena. En Submarino y Espacio el manifiesto agrupa el sistema y los recursos parallax preexistentes; no reemplaza esos renderizadores.
- `js/core/world.js`: en mapas marcados con expansión, los presupuestos de enemigos comunes de panel y sectores laterales suben un 25%, respetando el multiplicador de dificultad existente. En zonas acuáticas se habilitan plazas adicionales y posiciones X separadas; se mantienen señales, IA, tipos de enemigos, jefe y daños actuales.
- `sw.js`: nueva versión de caché PWA para la fase y precache de las capas terrestres integradas, evitando servir la caché visual anterior cuando se instala la actualización.
- `tests/phase2_background_density.test.js`: regresiones para asociación de las cuatro capas/rutas locales y aumento efectivo de enemigos en los cuatro mundos.

## Validación ejecutada

- Sintaxis: `node --check` pasó en `js/app/render.js`, `js/core/world.js` y `sw.js`.
- Suite focalizada: **49/49 pruebas aprobadas, 0 fallos**, en aproximadamente 155 s. Incluyó regresiones de parallax y densidad, mapas expandidos, reachability fácil/normal/difícil, enemigos, colisiones, checkpoints y flujo de juego.
- Chromium headless: se iniciaron las cuatro misiones y se capturó gameplay a 1920×1080. En los cuatro arranques, `errorNodes=0` y no se registraron excepciones JavaScript. Una advertencia aislada de Espacio indica que `navigator.vibrate()` fue bloqueado por falta de interacción táctil en el navegador automatizado; no es una excepción del juego.
- Capturas: [Escuela](reports/screenshots/phase2/phase2_escuela.png), [Guadalajara](reports/screenshots/phase2/phase2_guadalajara.png), [Submarino](reports/screenshots/phase2/phase2_submarino.png) y [Espacio](reports/screenshots/phase2/phase2_espacio.png). Se revisaron visualmente. Son capturas de inicio de misión: no prueban por sí solas el recorrido completo de cámara.

## Pendiente / límites conocidos

- No se midieron FPS reales ni memoria en un teléfono durante esta fase. La validación en un dispositivo Android 15 físico (Motorola Moto G15), especialmente mientras se recorre el mapa ampliado, sigue pendiente.
- La prueba visual fue headless y cubre los arranques de las misiones, no una sesión completa de cada mapa ni un barrido de cámara de extremo a extremo.
- No se afirma validación de instalación/desinstalación offline del Service Worker en Android.
- Por tanto, permanece como **Release Candidate**. Antes de declarar RELEASE 1.0 se debe probar el paneo y los tiempos de cuadro en el dispositivo Android indicado y revisar la caché PWA instalada.

## Archivos principales

- Código de render/parallax: `js/app/render.js`.
- Presupuesto de encuentros: `js/core/world.js`.
- Caché offline: `sw.js`.
- Manifiesto de capas: `assets/parallax/phase2/manifest.json`.
- Pruebas: `tests/phase2_background_density.test.js`.
