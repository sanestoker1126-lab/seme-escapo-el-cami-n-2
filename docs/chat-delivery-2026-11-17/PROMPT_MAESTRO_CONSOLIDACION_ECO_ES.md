# Prompt maestro ECO — consolidación de «¡Se me fue el camión!»

Copia y pega el bloque en Manus para iniciar un trabajo nuevo. El prompt ordena primero auditar y no modificar hasta recibir aprobación.

```text
Activa y sigue la skill «game-consolidation-economy» durante toda esta tarea.

## Objetivo
Ayúdame a mejorar y consolidar el videojuego existente «¡Se me fue el camión!» para que avance de Release Candidate a un juego completo, estable y publicable, sin rehacerlo desde cero y evitando trabajo o gasto innecesario.

## Reglas obligatorias
- Usa la skill como procedimiento de trabajo, no como garantía de perfección.
- Preserva el proyecto fuente, los assets funcionales, la identidad de los personajes y el motor actual.
- Revisa primero archivos, informes, pruebas y recursos disponibles. No repitas análisis ni pruebas que sigan siendo válidos.
- Confirma versión y rama antes de modificar. Si hay versiones incompatibles o dudas sobre la fuente correcta, detente y pregúntame.
- Trabaja en una sola fase o subsistema a la vez. Realiza el cambio mínimo necesario y no mezcles trabajo ajeno al objetivo de la fase.
- Reutiliza recursos existentes. No generes assets ni uses servicios o herramientas de alto coste si una solución local o determinista es suficiente.
- No publiques, despliegues ni inicies tareas futuras automáticamente.
- No afirmes que una prueba, nivel, dispositivo o versión está aprobado si no lo has comprobado.
- Distingue entre **verificado**, **pendiente**, **bloqueado** y **mejora opcional**.

## Primera acción: auditoría, sin modificar archivos
1. Inspecciona archivos, candidatas, informes, manifiestos, pruebas y assets relevantes.
2. Identifica la fuente oficial más reciente y confirma su versión y ruta.
3. Resume lo implementado, lo respaldado por pruebas y lo no verificado.
4. Presenta bloqueos de lanzamiento por prioridad y propone fases pequeñas con criterios verificables de cierre.
5. No edites archivos ni empieces implementación hasta que yo apruebe el plan.

## Alcance de la auditoría
Evalúa, sin asumir que algo falta por no estar mencionado en un informe:
- **Campaña e historia:** objetivo central, relación entre mundos, misiones, cinemáticas, final, tutoriales, recompensas y desbloqueos.
- **Niveles:** aparición, checkpoints, alcanzabilidad, colisiones, peligros, enemigos, cámara, objetivos, salidas y rutas alternativas.
- **Gameplay:** controles, variedad de objetivos, dificultad, físicas, combate, jefes, compañeros y animaciones.
- **Presentación:** arte y escala, parallax, transiciones, UI, audio, accesibilidad y defectos visuales conocidos.
- **Sistemas técnicos:** guardado, PWA, caché, modo offline, carga, errores, memoria, rendimiento, orientación y recuperación tras suspender/reanudar.
- **Publicación:** versión candidata, pruebas de QA, instrucciones, metadatos, integridad del paquete y hashes.

Clasifica cada hallazgo como **Confirmado pendiente**, **No verificado**, **Resuelto con evidencia** o **Mejora opcional**.

## Restricciones de validación
- Chromium/sandbox no equivale a un teléfono real.
- Si el Motorola Moto G15 con Android 15 no está disponible, no simules esa prueba: márcala como pendiente/bloqueada y proporciona instrucciones manuales.
- No conviertas una muestra breve de FPS en garantía de rendimiento.
- No declares Release 1.0 mientras quede un bloqueo crítico o una prueba obligatoria sin verificar.

## Después de mi aprobación
Trabaja únicamente en la fase aprobada:
1. Define objetivo, alcance y criterio de aceptación.
2. Reproduce el problema o explica por qué no se pudo reproducir.
3. Aplica un parche pequeño y conserva intacta la fuente original.
4. Ejecuta pruebas focalizadas y regresiones pertinentes; evita suites no afectadas.
5. Registra archivos modificados, comandos, resultados y pruebas no ejecutadas.
6. Entrega parche y hashes cuando corresponda.
7. Resume riesgos y pendientes, recomienda el siguiente paso y detente para esperar mi autorización.

No continúes a otra fase sin mi aprobación explícita.
```
