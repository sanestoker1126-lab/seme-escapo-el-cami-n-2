# ¡Se me fue el camión! — candidata V58.1 Fase 4

Rama de entrega: `manus/release-candidate-v58.1-fase4`  
Estado: **Release Candidate ECO**, no RELEASE 1.0.

## Proyecto

El juego HTML5 Canvas + JavaScript está completo en [`game/`](game/). Sirve esa carpeta como raíz web y visita `index.html` o `Se_Me_Fue_El_Camion.html` según las instrucciones del proyecto. Los archivos fuente y recursos existentes se preservan; esta rama organiza la copia de entrega bajo `game/`.

## Entregables de esta rama

- [`game/`](game/): fuente completa, assets, pruebas e informes integrados de Fase 1–4.
- [`release-artifacts/phase4/`](release-artifacts/phase4/): parche ECO, informe/manifiesto Fase 4 y paquete de evidencia visual.
- [`docs/chat-delivery-2026-11-17/`](docs/chat-delivery-2026-11-17/): skill reutilizable y prompt maestro preparados durante esta conversación, además del README inicial del repositorio.

El ZIP completo de la candidata Fase 4 (aprox. 180 MB) no se añade como archivo individual porque excede el límite normal de 100 MB por archivo de GitHub. La fuente completa sí está en `game/`; los hashes del paquete original se conservan en los artefactos de Fase 4.

## Estado y límites de verificación

El informe de Fase 4 registra 66/66 pruebas focalizadas aprobadas en 14 módulos y verificación visual en Chromium headless. La candidata aún **no** es una versión final: siguen pendientes la validación en Motorola Moto G15 con Android 15, instalación/actualización PWA offline y la revisión separada de defectos heredados descritos en el informe. La muestra de FPS de Chromium no certifica el rendimiento en el teléfono.

Consulta [`game/INFORME_FASE4_CAMARA_LUCES_MENU_ES.md`](game/INFORME_FASE4_CAMARA_LUCES_MENU_ES.md), [`game/MANIFEST_FASE4.json`](game/MANIFEST_FASE4.json) y [`release-artifacts/phase4/INFORME_FASE4_CAMARA_LUCES_MENU_ES.md`](release-artifacts/phase4/INFORME_FASE4_CAMARA_LUCES_MENU_ES.md) para el detalle y las evidencias.
