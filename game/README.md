# ¡Se me fue el camión!

Juego de navegador (PWA) de plataformas 2.5D ambientado en Guadalajara, Jalisco. Sofía baja por la ciudad
—y más allá— persiguiendo el camión de la ruta 6, acompañada de las gatitas **Luna** y **Morita**.

## Cómo jugar

Es un sitio estático, sin dependencias. Para jugarlo:

- Abre `Se_Me_Fue_El_Camion.html` desde un servidor local (el service worker y la carga de assets necesitan
  `http://`, no `file://`). Por ejemplo, en la carpeta del proyecto:

  ```bash
  python3 -m http.server 8000
  # luego abre http://localhost:8000/Se_Me_Fue_El_Camion.html
  ```

Controles en pantalla (táctil) y teclado. Se instala como app (PWA) y funciona sin conexión tras la primera carga.

## Misiones (V53)

El juego está separado en cuatro misiones; en el menú eliges misión y después la parada:

1. **La Escuela** — los niveles de tema escolar.
2. **Guadalajara** — el grueso del juego por la ciudad.
3. **El Submarino** — mundo nuevo: ruinas sumergidas, se bucea por los cristales del fondo.
4. **El Espacio** — mundo nuevo: estación en órbita, saltos entre asteroides.

Opciones incluye **Aspecto de Sofía** (original / uniforme / rosa).

## Estructura

- `Se_Me_Fue_El_Camion.html` — punto de entrada.
- `js/core/` — motor (física, mundo, niveles, historia, enemigos, config).
- `js/app/` — render, UI, audio, entrada, datos de arte, arranque.
- `css/` — estilos.
- `assets/` — escenas, personajes, gatitas, plataformas, audio, vehículos.
- `sw.js` — service worker (precarga para jugar sin conexión).
- `tests/` — pruebas con el runner de Node (`node --test tests/*.test.js`).
- `tools/` — utilidades de verificación de niveles.
- `CHANGELOG_V*.md` — historial de versiones.

## Pruebas

```bash
node --test tests/*.test.js
```

Versión de desarrollo: **V57** (`js/core/config.js` → 57.0.0). La rama principal publicada continúa siendo V56 hasta fusionar este PR.

## V54 · Submarino y Espacio ampliados

Los dos mundos se ampliaron a **940 × 3072 unidades**, con tres sectores de descenso y 39 cristales por mundo.
Los fondos originales se despliegan de forma continua por todo el ancho y el descenso, con desplazamientos
independientes de imagen, partículas lejanas y elementos cercanos; no se ha alterado la física.

Sofía utiliza el atlas submarino existente fuera del agua y el de nado dentro del agua. En el espacio se muestra
con un equipo astronauta superpuesto como solución visual temporal, porque el repositorio aún no incluye el
atlas completo de la versión espacial. Los sprites originales no se reemplazan ni se eliminan.

Antes de pulsar JUGAR se puede elegir ORIGINAL, UNIFORME, ROSA, BUZO o ASTRONAUTA. El ajuste se guarda y se usa en Escuela y
Guadalajara; los mundos especiales imponen su equipamiento correspondiente.

Las salidas de los mundos nuevos se representan como una escotilla y un módulo orbital. Su comportamiento
de meta conserva el sistema del motor existente.


## V55 · Parallax gráfico real en las misiones 3 y 4

Se integraron cinco capas independientes por mundo en `assets/parallax/submarino/` y
`assets/parallax/espacial/`: fondo lejano, profundidad, estructuras, elementos y
primer plano. Son imágenes SVG optimizadas para mantener detalle sin archivos
raster gigantes; las cuatro primeras capas quedan detrás del juego y el primer
plano se dibuja por delante únicamente en los bordes.

La cámara las desplaza con factores 0.10, 0.22, 0.40, 0.68 y 1.00, recorriendo toda
la anchura y profundidad del mapa sin generar espacios vacíos. El renderizador
dibuja solo el recorte visible; en caso de que falten imágenes conserva el fondo
de respaldo V54. La PWA incluye las capas en su precarga para uso sin conexión.

El arte es vectorial y original del proyecto; no recupera fotografías/capas de las
imágenes V53 aplanadas. El nivel y las colisiones no fueron modificados en V55.

## V57.1 · Parallax marino e isla de Sofía

Fase inicial integrada: panorámica oceánica de siete capas, superficie seca de isla, océano profundo continuo y cinemática de llegada/flashback de Estoker. Detalles en `docs/MARINO_ISLA_FLASHBACK_FASE1.md`.

## V57 · Villanos especiales y validación automática

El nivel submarino incorpora pirañas que nadan dentro de estanques reales y un tiburón guardián. El nivel espacial utiliza drones que marcan su objetivo antes de disparar plasma. Son diseños temporales en Canvas (el guion de La Toxifamilia aún está en redacción), no spritesheets canónicos.

Los nuevos enemigos conservan los recorridos V54/V55 y la física de 60 FPS. Los peces sólo causan daño por contacto durante una embestida anunciada; se ha corregido el envío de la segunda fase de los jefes a la interfaz. Todos los módulos JS/CSS comparten la versión de caché 57.0, y CI ejecuta las pruebas del motor en cada PR.

Detalles: docs/TOXIFAMILIA_V57_VILLANOS_QA.md. Para revisar localmente: node --test tests/*.test.js.


## V57.4
- Se integran las 3 versiones de Sofía para la llegada a la isla en la cinemática submarina.
- Se integra el atlas de buceo de 100 frames para las animaciones acuáticas de Sofía.
- Se conservan los atlas marinos (piraña, tiburón, pulpo y Poseidón) y se guarda el paquete fuente R1 dentro de assets/enemies/marine/source_r1/.


## V57.5 — Estoker y el recuerdo de la isla

La primera secuencia del nivel submarino empieza con Sofía caminando despistada en la isla. Recuerda que ya estuvo allí con su papá Estoker. El flashback utiliza 32 frames RGBA reales de Estoker (caminar, explicar, caminar con Sofía, conversación), las tres variantes de caminar asombrada de Sofía y las hojas de storyboard marina. La historia cuenta la leyenda de la ciudad submarina, sus peligros y el descenso hasta el santuario de Poseidón. La simulación permanece pausada mientras se muestra la cinemática y vuelve al juego al terminar o pulsar SALTAR.

Prueba aislada de la cinemática (servir por HTTP): `PREVIEW_CINEMATICA_ESTOKER.html`.

Las cuatro tiras originales se conservan en `assets/cinematic/estoker_memory/atlases/`; en la secuencia `explicar_estoker` se utiliza una copia de los PNG con el fragmento sobrante inferior oculto. Revisar en Android la continuidad estética de los originales.


## V57.9 — Corrientes marinas y depredadores
- 6 corrientes controlables con flechas e indicador; fuera de ellas se mantiene flotación neutra.
- 5 encuentros adicionales: 2 tiburones y 3 pirañas.
- Estelas en embestida, aviso visible, bancos de peces, partículas ambientales y atlas originales sin cambios.
- Cinemática Estoker y Sofía, isla seca, parallax y juego espacial intactos.
