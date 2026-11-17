# Informe ECO — expansión lateral y descenso, fase 1

**Proyecto:** «¡Se me fue el camión!»  
**Base preservada:** candidata V58.1 con fondos de fase 1 integrados  
**Estado:** candidata de trabajo; no es RELEASE 1.0  
**Alcance:** geometría/rutas de las 18 escenas en los cuatro mundos y checkpoints intermedios

## Cambios

Cada mapa conserva íntegro el primer recorrido y añade una continuación duplicada a la derecha. La plataforma de salida original se conecta por una pasarela continua a la plataforma inicial copiada, alineada a la misma altura; el recorrido duplicado desciende hasta la única salida final. Se duplican plataformas, escaleras, objetos, gemas y elementos de mapa compatibles. No se escalan plataformas, saltos, velocidades ni físicas.

Se añadió un checkpoint en el centro de cada pasarela. El checkpoint se activa al tocarlo y el comando de reintento reconstruye la escena y reaparece ahí. Se agregan después de los puntos iniciales de escena para mantener la indexación existente de inicio de nivel. La posición del checkpoint sirve durante la partida/reintento, pero no se persiste entre cierres de la aplicación; eso queda pendiente.

El mapa marino mantiene una masa de agua continua y extiende su profundidad hasta antes de la nueva salida final, dejando su franja de salida seca. La geometría y encuentros de poseidón se conservan, sin cambiar su IA ni vida.

## Dimensiones resultantes

| Mundo | Escena | Original (unidades de mapa) | Ampliado |
|---|---|---:|---:|
| Escuela | escuela | 500 × 1024 | 1096 × 1812 |
| Escuela | escuela_vecina | 500 × 1024 | 1096 × 1854 |
| Escuela | escuela_ruinas | 520 × 1024 | 1136 × 1864 |
| Guadalajara | guadalajara | 1600 × 450 | 3296 × 780 |
| Guadalajara | gdl_noche | 600 × 1024 | 1296 × 1864 |
| Guadalajara | azoteas | 560 × 1024 | 1216 × 1858 |
| Guadalajara | centro_historico | 628 × 1024 | 1352 × 1874 |
| Guadalajara | portales | 628 × 1024 | 1352 × 1851 |
| Guadalajara | zapopan | 600 × 1024 | 1296 × 1864 |
| Guadalajara | arcadas | 628 × 1024 | 1352 × 1864 |
| Guadalajara | metro | 600 × 1024 | 1296 × 1874 |
| Guadalajara | mercado_tapatio | 628 × 1024 | 1352 × 1874 |
| Guadalajara | parque_metropolitano | 560 × 1024 | 1216 × 1864 |
| Guadalajara | tlaquepaque | 1600 × 450 | 3296 × 798 |
| Guadalajara | anden_tren_ligero | 560 × 1024 | 1216 × 1864 |
| Guadalajara | plaza_jacarandas | 640 × 1024 | 1376 × 1884 |
| Submarino | submarino | 940 × 3072 | 1976 × 5960 |
| Espacio | espacial | 940 × 3072 | 1976 × 5960 |

Se amplió el área del mapa; no se afirma que la duración jugable sea exactamente 2×, porque depende de ruta, caídas, combate y ritmo del jugador. En los mapas verticales la altura queda entre ~1,7× y ~1,9×; en Guadalajara, las escenas apaisadas crecen también en ancho.

## Archivos modificados

- `js/core/levels.js`: función de continuación lateral/descendente; aplicada a los mapas terrestres, submarino y espacial.
- `js/core/world.js`: transferencia del marcador de continuación a la plataforma y creación del checkpoint intermedio.
- `js/core/game.js`: preservación del identificador del checkpoint al reintentar.
- `tests/world.test.js`: validación del conteo y orden de checkpoints.
- `tests/world_expansion.test.js`: regresiones de cobertura/dimensiones, alcanzabilidad marina y espacial, y reintento desde checkpoint.

## Pruebas ejecutadas

Comando: `node --check js/core/levels.js && node --check js/core/world.js && node --check js/core/game.js && node --test tests/world_expansion.test.js tests/world.test.js tests/game.test.js tests/background_overhaul.test.js`  
**Resultado:** 34/34 pruebas aprobadas; cero fallas. Las pruebas de alcanzabilidad de Escuela/Guadalajara recorrieron fácil, normal y difícil. Submarino y Espacio fueron analizados también en las tres dificultades. Se validaron checkpoints, reintentos, colisiones, objetos, enemigos, determinismo y referencias de fondo.

Después se reforzó la regresión para activar el checkpoint al pisar el puente (en lugar de asignarlo directamente) y se volvió a ejecutar `tests/world_expansion.test.js`: **4/4 aprobadas**. La sintaxis de los tres archivos de código volvió a comprobarse.

**Visual en Chromium headless:** se iniciaron las cuatro misiones y se capturó gameplay real a 1920 × 1080. No aparecieron nodos de error ni excepciones JS. Capturas: `reports/screenshots/expansion_escuela.png`, `expansion_guadalajara.png`, `expansion_submarino.png`, `expansion_espacio.png`. El navegador reportó en Espacio una llamada a `navigator.vibrate` bloqueada por falta de gesto de usuario; no fue una excepción JavaScript. Las capturas muestran la entrada de cada misión, no recorren visualmente toda la pasarela recién añadida.

**No ejecutado:** prueba en Motorola Moto G15/Android 15. Tampoco se comprobó físicamente el desplazamiento completo de cámara por las nuevas alas.

## Pendientes fuera de esta fase

- Extender o crear arte de fondo para cubrir visualmente las alas y el descenso; los fondos actuales se conservan. El parallax de cuatro capas por mundo queda pendiente.
- Rebalancear/añadir encuentros para que la densidad enemiga acompañe la longitud nueva; no se alteraron presupuestos de enemigos.
- Partículas, meteoritos como contenido de combate/obstáculo, más protagonismo jugable de Poseidón, nueva historia/mamá, cámara/luces/sonido y rediseño del menú son fases posteriores y no se incluyen en este cambio.
- Guardar el checkpoint intermedio a través de cierres/reinicios de la app.
- Prueba de recorrido en hardware Android.

Esta fase amplía geometría y añade puntos de reintento; por sí sola no certifica la calidad visual de las extensiones ni completa el lanzamiento.
