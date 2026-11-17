# Hoja de ruta de consolidación — «¡Se me fue el camión!»

Estado de referencia: candidata V58.1 Fase 4. Esta hoja de ruta es un plan de verificación, no una afirmación de que todas las tareas estén pendientes. Antes de ejecutar una fase, contrastar cada punto con código, informes y pruebas actuales.

## Bloqueos prioritarios de lanzamiento

1. Validar en Motorola Moto G15 con Android 15: estática al avanzar hacia el fondo, caminatas, render, cámara, controles, partículas, memoria, FPS y sesiones largas.
2. Instalar y actualizar PWA en Android; probar offline, caché actualizado, reapertura y recuperación de actualización interrumpida.
3. Jugar la campaña desde partida nueva hasta final, incluidos mundos, misiones, paradas extra/desbloqueos y progreso guardado.
4. Auditar los 18 niveles: aparición, checkpoints, alcance, plataformas, descensos, colisiones, peligros, enemigos, cámara, objetivos, salidas y rutas alternativas.
5. Revisar defectos heredados registrados en el informe Fase 4: banda superior anaranjada en encuadre marino y grandes formas geométricas del fondo espacial.
6. Fijar una única candidata/rama oficial antes de integrar nuevo trabajo; documentar versión, fuente y hash.

## Diseño de juego y campaña

7. Definir estructura de mundos, niveles, misiones y paradas extra; mostrar orden, requisitos y estados de desbloqueo.
8. Conectar el objetivo de Sofía, la historia de Estoker, la leyenda del océano, Poseidón, la misión marina, la mamá y los gatitos.
9. Dar a cada misión objetivos distinguibles, condiciones de éxito/fallo, puntos de control y recompensas; evitar que todo sea solo avanzar y derrotar enemigos.
10. Definir la función de recompensas y desbloqueos y comprobar guardado/carga de cada uno.
11. Añadir tutoriales breves para controles y mecánicas nuevas: tierra, nado, buceo, combate, láser y gravedad espacial.
12. Ajustar la curva de dificultad, el daño, ventanas de ataque y checkpoints mediante pruebas de juego; comunicar causas de derrota.

## Sistemas de juego y consistencia

13. Verificar físicas terrestres, submarinas y espaciales, colisiones y casos límite en los niveles afectados.
14. Auditar IA y jefes: señales de ataques, ventanas válidas, daño, recuperación y legibilidad.
15. Probar seguimiento de Luna y Morita en tierra, agua, desniveles, cámara y combate, sin teletransporte ni bloqueo del jugador.
16. Revisar ciclos de animación, apoyo de pies, pivotes, escala, trajes, ataques, daño, recortes, frames vacíos o duplicados.
17. Probar cinemáticas: sincronía de diálogo, animación y audio, omisión, salida y recuperación de control.
18. Probar guardado, checkpoints, pausa, reanudación, victoria, derrota, reinicio y recuperación tras cierre o suspensión.

## Pulido y preparación de publicación

19. Revisar coherencia visual de los cuatro mundos, cobertura de parallax, cámara vertical/horizontal y visibilidad de objetivos.
20. Completar y balancear audio de menú, acciones, mundos, enemigos, cinemáticas y resultados; comprobar volumen y reanudación.
21. Revisar HUD, legibilidad, contraste, foco, tamaño táctil, teclado y opciones de accesibilidad.
22. Medir carga, FPS y memoria en escenas representativas y sesiones largas, especificando dispositivo y condiciones.
23. Realizar pruebas de uso con jugadores nuevos: comprensión, aburrimiento, confusión y abandono; corregir con una segunda pasada.
24. Ejecutar QA final sobre una misma candidata, documentar fallos/bloqueos, empaquetar instrucciones y hashes.

## Criterio de estado

Mantener **Release Candidate** si hay bloqueo crítico o prueba obligatoria sin ejecutar. Declarar Release solo cuando campaña, niveles, progresión, guardado, controles, rendimiento en dispositivos objetivo, PWA y QA de la candidata que se entrega estén verificados. Sandbox/Chromium no sustituye Android físico.
