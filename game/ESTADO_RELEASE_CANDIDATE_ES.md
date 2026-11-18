# ¡Se me fue el camión! — RELEASE CANDIDATE

**Base:** V58.1 integrada (HTML5 Canvas + JavaScript). Esta entrega conserva el proyecto y sus recursos; no es una declaración de RELEASE 1.0.

## Actualizaciones incluidas en este candidato

- Fases ECO previas del nivel marino: flujo de misión, cinematografía Sofía/Estoker, movimiento y pisadas, efectos de nado/compañeras y resiliencia del Canvas.
- Perfil de gravedad e inercia espacial separado de la física terrestre.
- Atuendo espacial contextual para Sofía y selección espacial de equipamiento para Luna y Morita, reutilizando recursos existentes.
- Pistola láser contextual en la misión espacial; la patada permanece en otros mundos.
- Cinemática introductoria espacial con diálogo y controles para avanzar/omitir.
- Ambientación orbital con satélite, bandera y plataformas con aspecto de meteorito, manteniendo la geometría de colisión.
- Enemigo satélite artillero con aviso, punto de mira fijo y plasma; conserva el dron Centinela como jefe.
- Actualización de versión de caché del service worker para los recursos/código de las fases integradas.

## Verificaciones registradas

Se ejecutaron las suites focalizadas de enemigo satelital, láser, villanos temáticos, atlas/espacio y alcanzabilidad submarina/espacial. En la fase de enemigos, la suite combinada tuvo **20/20 pruebas aprobadas** y la comprobación de alcanzabilidad del espacio pasó en tres dificultades. También se hicieron comprobaciones de sintaxis JavaScript y revisión visual del inicio espacial en Chromium headless.

Estas pruebas no equivalen a certificación completa del juego ni a una prueba en hardware móvil.

## Pendientes antes de RELEASE 1.0

- Validación física y visual en el Motorola Moto G15 con Android 15; no se ejecutó sobre dispositivo físico.
- Verificación integral de todos los niveles, progresión, guardado, victoria/game over, funcionamiento de PWA instalada y FPS real en los dispositivos objetivo.
- No se declara cerrada la auditoría visual completa de todos los mundos ni la ausencia de todo error crítico en todas las plataformas.

## Ejecución local

Extrae el ZIP y sirve la carpeta por HTTP (necesario para el service worker), por ejemplo con `python3 -m http.server 8000`; después abre `http://localhost:8000/` en un navegador moderno. En Android, instala/abre la PWA desde el servidor HTTPS de publicación una vez completadas las pruebas del dispositivo.
