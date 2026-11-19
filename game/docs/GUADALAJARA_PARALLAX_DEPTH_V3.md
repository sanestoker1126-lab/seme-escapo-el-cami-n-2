# Guadalajara — Parallax con profundidad V3

**Entrega:** V58.1 FASE4 — RELEASE_CANDIDATE_ECO. No es RELEASE 1.0.
**Rama:** `manus/release-candidate-v58.1-fase4`. No modificar `main`.

## Arquitectura de capas

- Base arquitectónica PRO V2: imagen **fija**, bloqueada a `sc.x0 / sc.startY / sc.drawW / sc.drawH`.
- Cuatro planos parallax de Guadalajara preexistentes: **se reutilizan**, sin regenerarlos.
- **Tres planos extra por escena, nueve PNG RGBA nuevos**, derivados de forma determinista y con metadatos:

| Plano | Relación de profundidad | Factor de cámara | Opacidad del renderer | Función |
|---|---|---:|---:|---|
| `01_bruma_atmosferica.png` | lejano | `0.06` | `0.44` | Bruma suave de ciudad y cielo |
| `02_luz_volumetrica.png` | intermedio | `0.23` | `0.53` | Rayos cálidos y bokeh leve |
| `03_hojas_jacaranda.png` | cercano | `0.55` | `0.48` | Pétalos periféricos en primer plano |

Estas opacidades se multiplican por el alfa individual de cada píxel: son efectos discretos y no placas opacas. El orden de dibujo es **fondo fijo → parallax existente → nuevos planos atmosféricos → cornisas arquitectónicas fijas → colisiones y personajes del motor**.

Las capas tienen transparencia PNG real, no negro de relleno. **No son una descomposición semántica perfecta del fondo original en edificios/vegetación**: esa separación requeriría máscaras manuales o renders por planos. Este módulo añade **profundidad ambiental** sin desplazar ni deformar la arquitectura jugable.

## Instalar sobre el juego existente

Este ZIP también contiene todos los archivos del PRO V2 necesarios para que no tengas que instalar dos paquetes por separado.

1. Cambia a la rama de trabajo indicada y descomprime el ZIP conservando la estructura `game/`. **No sobrescribas recursos diferentes del proyecto**; extrae en una copia de trabajo o usa `git status` para revisar conflictos antes de confirmar.
2. Desde la raíz del repositorio:

```bash
python3 game/tools/integrate_guadalajara_depth_v3.py --root . --check
python3 game/tools/integrate_guadalajara_depth_v3.py --root . --apply
python3 game/tools/integrate_guadalajara_depth_v3.py --root . --verify
node --test game/tests/guadalajara_depth_v3.test.js
python3 -m unittest discover -s game/tests -p test_guadalajara_depth_v3.py
```

El integrador crea V2 automáticamente si aún no estaba instalado. Si ya existe, añade únicamente la V3. Cambia solo `game/js/app/render.js`, `game/Se_Me_Fue_El_Camion.html` y `game/sw.js`, con backups y control SHA-256. **No edita levels.js, world.js, físicas, colisiones, enemigos ni personajes.**

**Revertir** (sin sobreescribir cambios ajenos):

```bash
python3 game/tools/integrate_guadalajara_depth_v3.py --root . --revert
```

## Diagnóstico

Abre `game/tools/guadalajara_depth_v3_viewer.html` bajo un servidor estático cuya raíz sea `game/` (no `file://`). Mueve cámara X/Y, alterna profundidad, muestra plataformas y usa movimiento automático para comprobar diferencias. Los reportes en `game/reports/guadalajara_depth_v3/` son previsualizaciones de composición estática y una animación diagnóstica, no capturas de una partida en Android.

**QA disponible:** sintaxis, carga opcional, recorte de cámara a viewport/escena, posiciones extremas, factor parallax, integridad RGBA, SHA y reversión del instalador. No equivale a QA visual de juego ni certifica 60 FPS en hardware.

## Reproducibilidad en Python

El archivo `game/tools/build_guadalajara_depth_v3.py` permite rehacer exactamente las capas con Pillow, NumPy y OpenCV. Ejecútalo **fuera del árbol de producción** en una carpeta vacía:

```bash
python3 game/tools/build_guadalajara_depth_v3.py \
  --v2-zip GUADALAJARA_AZOTEAS_PROFESIONAL_V2_V58_1.zip \
  --out /tmp/guadalajara_depth_v3_rebuild
```

No genera personajes, colisiones ni plataformas nuevas. Reutiliza PRO V2 sin sustituir sus imágenes.

## Integración real en la rama `fix/nivel-marino-rayas` (19/11/2026)

- **Solo V3.** Los 9 PNG RGBA y `js/app/guadalajara_depth_v3.js` se integraron a mano (el instalador
  exige la rama `manus/release-candidate-v58.1-fase4`). Se dibujan sobre el fondo **actual** de las escenas
  `guadalajara`, `portales` y `centro_historico`; se quitó del módulo la condición `sc.gdlProArtwork`.
- **PRO V2 sí se activó, colocado por copias** (ver `GUADALAJARA_AZOTEAS_PRO_V2.md`, sección final).
- **Corrección:** el instalador V3 insertaba `NS.GDL_DEPTH_V3.draw(ctx, G, V, sc, T)` dentro de
  `drawScenes(G, V)`, donde `T` no existe (ReferenceError en cada fotograma). Aquí se usa `G.world.t`.
- La caché PWA no cambia de nombre (las pruebas existentes la fijan); el código se pide primero a la red.
