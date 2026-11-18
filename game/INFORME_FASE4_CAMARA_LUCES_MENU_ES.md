# Informe ECO — Fase 4: cámara, iluminación y menú

**Proyecto:** ¡Se me fue el camión!  
**Base preservada:** candidata integrada V58.1 Fase 3  
**Estado:** **RELEASE_CANDIDATE**; no es RELEASE 1.0  
**SHA-256 de la base:** `e77c3e77d52d5f4491b58e4bb8428c1bb4567584968f848251ff7348f549eee1`

## Alcance ejecutado

Esta fase se limitó al pulso visual de cámara, iluminación Canvas por mundo, optimización de reconstrucción del menú, presentación responsiva y una corrección del estado devuelto por la precarga. No se modificaron físicas, geometría de niveles, progresión, combate, sprites originales ni audio.

- **Cámara:** el pulso de impacto actúa alrededor del centro de la cámara; el zoom adicional está limitado a 1,2 %, usa `shakeT` y respeta la opción de sacudida. El desplazamiento se redondea a píxel físico para reducir vibración subpíxel y riesgo de bordes vacíos.
- **Iluminación dinámica:** gradientes radiales discretos con paleta según Escuela, Guadalajara, Submarino o Espacio; se recortan al área visible y solo se dibujan durante el juego. La calidad baja reduce el radio/intensidad; en calidad normal/alta Poseidón recibe un acento tenue cuando está cerca de Sofía. La iluminación queda antes del parallax frontal y fuera de la UI DOM.
- **Menú:** las listas de misiones, paradas y apariencia se conservan y solo se reconstruyen cuando cambia el estado que determina su contenido. La selección actualiza clases/atributos accesibles sin reemplazar innecesariamente los nodos. En paisaje amplio usa dos columnas; en móvil conserva una columna con desplazamiento vertical.
- **Precarga:** `Render.preload()` devolvía el resultado `undefined` de `Image.decode()` después de una decodificación exitosa, pero el arranque lo interpretaba como `false`. Ahora devuelve estado booleano explícito tras la carga; si `decode()` falla pero la imagen ya cargó, mantiene el fallback dibujable del navegador. Esto quitó el aviso engañoso “No se pudo cargar todo el arte” observado durante QA.
- **PWA:** se mantiene el identificador de caché de Fase 4 para invalidar el renderer anterior.

## Verificación ejecutada

### Pruebas automatizadas

- Sintaxis: `node --check` en los módulos tocados (`render.js`, `ui.js`, `game.js`, `sw.js`) y en los archivos JavaScript de `tests/`.
- Suite focalizada: **66/66 pruebas aprobadas, 0 fallos** en 14 módulos relacionados con cámara/menú/Fase 4, ciclo de partida, efectos de Fase 3, enemigos, cinemáticas, caché PWA y sistemas marino/espacial.
- Se añadieron regresiones para el retorno booleano de precarga, cámara acotada, iluminación por mundo, reutilización de nodos DOM y distribución responsiva.
- Se actualizaron assertions de pruebas heredadas de versiones previas que ya no correspondían a la expansión de mapas/densidad aplicada en Fases 1–2: dimensiones marino/espacial 1976×5960 y máximo de 8 pirañas por zona. Es mantenimiento de expectativas de tests; no cambia gameplay.

### Navegador headless

La página real se abrió en Chromium headless, en modo QA y sin registrar Service Worker durante esta captura. Se capturaron los cuatro mundos y el menú; no se observaron excepciones JavaScript.

- Menú paisaje: viewport 1920×1080, panel medido 970×587; el contenido medido no excedió el alto del panel (`scrollHeight` 585 / `clientHeight` 585). Los cuatro selectores de misión estaban disponibles y “Jugar” habilitado.
- Menú móvil: viewport 412×915, una columna con scroll y los cuatro selectores accesibles.
- Reutilización DOM: se mantuvieron las identidades de los botones de misión, parada y apariencia al repintar el menú.
- Gameplay: capturas en Escuela, Guadalajara, Submarino y Espacio a 1600×900; adicionalmente, Espacio en 412×915.
- Medición de animación: **60,3 FPS** de `requestAnimationFrame` durante 2,5 s a 1600×900 en Chromium headless. Es una comprobación del sandbox, no una medición en hardware Android ni una garantía de 60 FPS en el Moto G15.

Las capturas con efectos activos y la referencia con el estado en pausa se guardan bajo `reports/screenshots/phase4/`.

## Pendientes y límites

1. **Android 15 / Motorola Moto G15:** validación física pendiente; no se declara aprobada.
2. **PWA instalada/offline:** esta fase verifica el versionado y las pruebas de caché del código, pero no sustituye una instalación y actualización offline en Android.
3. **Arte heredado fuera de Fase 4:** la captura base de Fase 3 ya mostraba una banda superior anaranjada en el encuadre marino y grandes formas geométricas en el fondo espacial. Fase 4 no modifica los fondos ni corrige esos elementos; requieren una revisión de arte/parallax separada.
4. No se repitieron pruebas de alcanzabilidad ni físicas: esta fase no cambia geometría, movimiento ni colisiones. Continúan valiendo únicamente los resultados documentados en sus fases anteriores.

Por estos límites, el resultado se entrega como **candidata ECO Fase 4**, no como juego terminado ni publicación certificada.
