# Guadalajara Azoteas PRO V2 — Instalación técnica

**Estado:** V58.1 FASE4 — RELEASE_CANDIDATE_ECO. **No es RELEASE 1.0.**

## Entrega

Tres fondos WebP RGB para `guadalajara`, `portales` y `centro_historico`, acompañados de tres PNG RGBA de arquitectura con posiciones exactas de **55 entradas** del mapa: 23 superficies, 29 peldaños, 3 bases móviles (estas últimas se anotan pero NO se hornean). Existe un visor HTML con controles de cámara, un CSV y capturas QA diferenciadas de los assets finales.

La nueva versión mejora el arte de Los Portales y ajusta luz, contraste y nitidez de los otros fondos. Los PNG de cornisas transparentes añaden molduras sutiles a coordenadas de colisión ya existentes. El motor conserva el dibujo de las plataformas, los hitboxes, el parallax preexistente y los personajes/enemigos originales.

## Instalación segura en la rama correspondiente

Desde la raíz del repositorio `seme-escapo-el-cami-n-2`, después de descomprimir el ZIP conservando `game/`:

```bash
python3 game/tools/integrate_guadalajara_rooftops_pro_v2.py --root . --check
python3 game/tools/integrate_guadalajara_rooftops_pro_v2.py --root . --apply
python3 game/tools/integrate_guadalajara_rooftops_pro_v2.py --root . --verify
node --test game/tests/guadalajara_rooftops_pro_v2.test.js
python3 -m unittest discover -s game/tests -p 'test_guadalajara_rooftops_pro_v2.py'
```

El instalador modifica **solo** `game/js/app/render.js`, `game/Se_Me_Fue_El_Camion.html` y `game/sw.js`, y crea copia reversible de esos tres archivos. Si el repositorio está sobre `main`, `master` u otra rama, el instalador rechaza la operación. No edita `levels.js`, ni física, ni colisiones, ni personajes. Si los anclajes del código no coinciden exactamente con lo inspeccionado, `--check` detiene la instalación sin cambios.

### Revertir

```bash
python3 game/tools/integrate_guadalajara_rooftops_pro_v2.py --root . --revert
```

La reversión restaura únicamente si nadie editó los archivos tras la instalación; los seis assets nuevos permanecen inactivos para evitar pérdidas no deseadas. Si existen cambios posteriores, se rechaza la reversión automática.

## Contrato del renderer

- Fondo arquitectónico: mapeado estable a `sc.x0`, `sc.startY`, `sc.drawW`, `sc.drawH` sin compensación de cámara tipo parallax.
- Efecto parallax: se conservan las cuatro capas ambientales ya existentes para Guadalajara, velocidad `[0.12, 0.30, 0.43, 0.56]`, y sus efectos de luz de V58.2.
- Sobrecapa de cornisas: PNG RGBA independiente, dibujado solo cuando el fondo PRO está listo y recortado a escena+viewport.
- Sectores laterales: soportes de barandilla/piedra procedurales calculados sobre las plataformas reales `G.world.platforms`, sin crear físicas.
- Fallback: si falla la carga del nuevo fondo, se usa la ruta original `sc.file` del nivel.
- Cache PWA: se actualiza la etiqueta de caché y precarga los nuevos PNG/WebP como **opcionales**, sin bloquear instalación si falta un archivo.

## Límites de QA

Las comprobaciones de coordenadas, formatos, canal alfa y sintaxis/pureza del módulo pasan; las capturas incluidas son diagnósticos estáticos. Un análisis heurístico de bordes (no reconocimiento de tejados) marca 14 de 23 superficies para revisión artística manual; véase `game/reports/guadalajara_rooftops_pro_v2/heuristic_architecture_alignment.json`. **No se ha realizado una partida real en Android ni se han validado los 55 apoyos en las posiciones reales de una cámara de juego.** Esta versión no corrige de forma automática discrepancias entre salientes pintados y la superficie física; las cornisas complementarias hacen visibles los bordes correspondientes.

## Abrir el inspector

Con un servidor estático que sirva `game/`, abrir `tools/guadalajara_rooftops_pro_v2_viewer.html`; alternar visualización de cornisas, marcas de plataforma y desplazar los controles X/Y.

## Integración real en la rama `fix/nivel-marino-rayas` (19/11/2026)

**Problema del paquete en esta versión del juego.** El arte se pintó sobre los mapas originales
(628×1024 Portales y Centro Histórico, 1600×450 Guadalajara). Aquí cada mapa es esa fuente **más una copia
lateral** (`continueMapBesideExit` en `levels.js`; datos en `sc.map.expansion`): 1352×1851, 1352×1874 y
3296×780. El instalador estiraba el fondo a toda la escena: **0 de 23** superficies pintadas caían sobre una
plataforma real.

**Solución.** `js/app/guadalajara_rooftops_pro_v2.js` se reescribió para colocar el fondo y las cornisas
**una vez por copia del trazado**, a escala 1:1 del mapa, en los desplazamientos exactos de
`sc.map.expansion` (Portales +724,+827; Centro Histórico +724,+850; Guadalajara +1696,+330).
Resultado medido en el juego: **46 de 46** superficies pintadas coinciden (±1 u) con una plataforma real.

- Entre las dos copias (y en el puente que las une) se ve el fondo original de la escena; los bordes del arte
  PRO se difuminan (3,5 %) para no dejar costura dura. Lienzo difuminado con lado mayor ≤ 2048 px.
- Si el tamaño de origen del mapa deja de coincidir con el del arte, PRO V2 **no se activa** y queda el fondo
  original (nunca balcones desalineados). Lo comprueba `tests/guadalajara_rooftops_pro_v2.test.js` con los
  mapas reales.
- No se usó el instalador (exige la rama `manus/release-candidate-v58.1-fase4`). La caché PWA no cambia de
  nombre; fondos y cornisas se precargan como opcionales. Los reportes QA del paquete no se copiaron.
