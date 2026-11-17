# Informe de renovación visual de fondos — Fase 1

**Base:** candidata V58.1 de «¡Se me fue el camión!»  
**Estado:** candidata visual parcial; no es RELEASE 1.0  
**Alcance previsto:** 18 escenas de Escuela, Guadalajara, Submarino y Espacio  
**Integrado en esta fase:** 10 de 18 escenas

## Cambios integrados

Se integraron diez fondos nuevos, generados a 1776 × 2368 px y optimizados como WebP. Cubren las tres escenas escolares y siete escenas de Guadalajara: centro, colonia nocturna, azoteas, pasillos lluviosos, centro histórico, Portales, Zapopan y terminal. El conjunto runtime ocupa 5 772 848 bytes (aprox. 5,51 MiB).

Se cambiaron únicamente las rutas de imagen y los tintes heredados de esas escenas. En Escuela y Portales se retiró el indicador de plataformas «pintadas» para que las superficies existentes se rendericen con las texturas originales del motor. No se modificaron mapas, coordenadas de colisión, físicas, enemigos, cámara, misiones, sprites ni progresión. Los fondos fuente originales siguen en el proyecto; los nuevos PNG maestros se conservan fuera del árbol runtime en `assets/generated_raw/`.

El service worker usa una nueva clave de caché y precarga los diez WebP; así evita servir la versión visual cacheada anterior y mantiene la disponibilidad offline de los fondos integrados.

## Escenas todavía pendientes

Se mantienen sin cambios los fondos originales/procedurales de: Metro, Mercado Tapatío, Parque Metropolitano, Tlaquepaque, Andén del Tren Ligero, Plaza de las Jacarandas, Submarino y Estación en Órbita. Por lo tanto, el rediseño completo de los cuatro mundos no está terminado, en particular faltan los mundos submarino y espacial.

La generación se detuvo al alcanzarse el límite diario disponible de 10 imágenes (10/10); no se volvió a intentar. No hay una hora de renovación confirmada en esta entrega. Estos ocho niveles no se marcan como renovados.

## Verificación ejecutada

- `node --check js/core/levels.js`: correcto.
- `node --check sw.js`: correcto.
- `node --test tests/background_overhaul.test.js tests/physics.test.js tests/world.test.js`: **33/33 pruebas correctas, 0 fallas**. Incluye verificación de cobertura/rutas, colisiones, físicas, geometría y alcanzabilidad en las tres dificultades.
- Verificación de imagen WebP: diez archivos legibles, 1776 × 2368 px; total runtime 5 772 848 bytes.
- Prueba visual en Chromium, viewport 1920 × 1080: escenas Escuela y Centro de Guadalajara cargaron en el juego real; canvas 1920 × 1080, objetivo/HUD visibles y cero elementos DOM de error detectados. El helper no inspeccionó la consola JavaScript.
- Capturas: `reports/screenshots/01_escuela_fase1.png` y `reports/screenshots/02_guadalajara_fase1.png`.

La prueba visual cubre dos escenas representativas, no las diez escenas nuevas. No se ejecutó validación en dispositivo Android físico ni una prueba completa en el Motorola Moto G15.

## Archivos relevantes

- `js/core/levels.js`: cambio de diez rutas de fondo, tintes y dos indicadores visuales de plataforma pintada.
- `sw.js`: invalidación de caché y precache de los nuevos WebP.
- `assets/scenes/overhaul/`: diez imágenes runtime WebP y manifiesto.
- `tests/background_overhaul.test.js`: prueba focalizada de assets y cobertura.

## Siguiente condición para completar la renovación

Generar e integrar los ocho fondos pendientes —incluyendo Submarino y Espacio— cuando vuelva a estar disponible el cupo; luego verificar esas escenas visualmente, repetir las pruebas focalizadas y empaquetar una candidata consolidada. Esta entrega parcial no afirma cumplimiento del objetivo de «todos los niveles».
