---
name: game-consolidation-economy
description: "Consolidar, pulir o preparar para publicación un videojuego existente por fases verificables, preservando su motor y contenido y evitando trabajo, llamadas, assets, pruebas o créditos innecesarios. Usar cuando se mejore una demo o Release Candidate existente, se audite su preparación de lanzamiento o se solicite trabajar de forma ECO/económica."
---

# Consolidación de videojuegos existentes — modo eficiente

## Objetivo

Mejorar un juego existente sin reconstruirlo ni gastar esfuerzo en tareas redundantes. Priorizar corrección, jugabilidad y verificación antes del pulido. Trabajar solo dentro del alcance autorizado; una skill ayuda a seguir un proceso, pero no garantiza perfección ni sustituye pruebas reales.

## Reglas

- Preservar la fuente original, los assets funcionales, la identidad visual y el motor vigente. No regenerar un sistema ya existente sin demostrar que es necesario.
- Usar primero los archivos, recursos, informes, pruebas y análisis disponibles. Confirmar versión y rama antes de editar; no cambiar de base silenciosamente.
- Hacer una sola fase o subsistema a la vez. No iniciar la fase siguiente automáticamente.
- Aplicar el parche mínimo que resuelva la causa. No mezclar refactor, cosmética y gameplay en la misma fase salvo necesidad demostrada.
- No afirmar que una prueba pasó, un nivel es completable, un dispositivo es compatible o el juego está listo si no se verificó.
- Diferenciar siempre: **verificado**, **pendiente**, **bloqueado** y **no aplicable**.
- Pedir aclaración antes de cambiar versión fuente, alcance, historia aprobada, dificultad global, eliminar/sustituir contenido o realizar acciones externas/publicación.

## Flujo obligatorio

### 1. Resolver el contexto con bajo coste

1. Leer instrucciones del proyecto y localizar la fuente exacta, candidatas, informes, manifiestos y tests relevantes.
2. Preferir inventario/listado y búsquedas locales a volver a generar o volver a investigar lo que ya está documentado.
3. Consultar el material justo necesario; no leer masivamente todos los assets si la tarea afecta un módulo concreto.
4. Registrar base, versión, ruta, estado de trabajo y hash cuando se vaya a modificar o empaquetar.
5. Si hay versiones en conflicto o falta el archivo base solicitado, detenerse y preguntar antes de modificar.

### 2. Establecer alcance y plan

- Convertir la petición en un objetivo medible, límites, archivos/sistemas implicados y prueba de aceptación.
- Revisar si el mismo trabajo ya está integrado. Si lo está, verificar evidencia y no repetirlo sin motivo.
- En solicitudes amplias, primero presentar una auditoría y un plan priorizado; no editar antes de que el usuario apruebe el trabajo por fases cuando esa aprobación sea necesaria.
- Separar bloqueos de lanzamiento de mejoras opcionales. Orden recomendado: estabilidad/progresión, controles/físicas, jugabilidad, guardado, compatibilidad, arte/audio, contenido promocional.

### 3. Implementar con eficiencia

- Reproducir el defecto con la prueba más pequeña disponible. Si no es reproducible, inspeccionar y reportar la limitación, sin inventar una causa.
- Añadir una regresión determinista cuando sea viable.
- Cambiar únicamente archivos necesarios; reutilizar assets del proyecto.
- Antes de pedir o generar assets, comprobar si ya existe material reutilizable. Evitar generación de imágenes, audio o video cuando una modificación determinista de assets existentes sea suficiente.
- No llamar servicios de pago, modelos generativos o herramientas de alto coste para tareas que se resuelven con lectura de archivos, código, pruebas locales o recursos ya disponibles. Si el usuario pide explícitamente una capacidad con coste o hay una decisión de gasto, explicar coste/alternativa y esperar aprobación según las reglas vigentes.
- No crear tareas de fondo, automatizaciones, publicación o trabajo futuro por iniciativa propia.

### 4. Probar proporcionalmente

- Ejecutar primero sintaxis y pruebas del módulo tocado; después regresiones cercanas si el cambio puede afectarlas.
- No repetir suites aprobadas que no hayan sido afectadas. Repetirlas solo si hay cambios relevantes, evidencia caducada o el usuario lo solicita.
- No ejecutar toda la batería, pruebas de navegador o dispositivos si no son pertinentes; justificar cada suite más amplia.
- Para cambios visuales, inspeccionar una muestra representativa del viewport afectado. Para niveles/progresión, verificar rutas y salidas del nivel afectado.
- Tratar cada entorno por separado: sandbox ≠ navegador de usuario ≠ Android físico. Si el dispositivo no está disponible, entregar pasos manuales y marcarlo pendiente/bloqueado.
- Registrar comandos, contadores de pruebas, errores y condiciones. No convertir una métrica breve de FPS en garantía de rendimiento.

### 5. Entregar y detenerse

Para una fase de código, entregar un parche incremental contra la base confirmada y, cuando proceda, archivos modificados o candidata. Probar que el parche aplica sobre una copia limpia y que el resultado coincide con los archivos de trabajo. No empaquetar un ZIP completo si no se pidió o no aporta valor.

Informar brevemente:
- base y fase;
- causa y cambios realizados;
- archivos afectados;
- pruebas ejecutadas y resultados exactos;
- pruebas pendientes/bloqueadas;
- artefacto y SHA-256, si se generaron.

Finalizar indicando el siguiente paso recomendado, pero esperar autorización antes de empezarlo.

## Auditoría de juego completo

Al revisar una demo o candidata, evaluar y marcar por separado:

1. **Producto/progresión:** objetivo central, campaña, orden de mundos, misiones, desbloqueos, recompensas, final y guardado.
2. **Niveles:** aparición, checkpoints, alcance, colisiones, peligros, enemigos, cámara, objetivos, salidas y rutas alternativas.
3. **Jugabilidad:** claridad de controles, tutoriales, variedad de objetivos, dificultad justa y razones entendibles de éxito/fracaso.
4. **Sistemas:** físicas, combate, IA, compañeros, animaciones, cinemáticas, pausa, victoria y derrota.
5. **Presentación:** arte, escalas, parallax, estados de sprite, UI responsive, legibilidad, audio y opciones de accesibilidad.
6. **Técnica:** carga, errores, memoria, rendimiento, almacenamiento, PWA/cache/offline, orientación y recuperación de contexto.
7. **Publicación:** metadatos, instrucciones, artefacto reproducible, versión y hashes.

No asumir que una categoría está ausente porque un informe no la mencione. Clasificar cada hallazgo como:
- **Confirmado pendiente:** evidencia actual indica que falta o está roto.
- **No verificado:** no hay prueba suficiente.
- **Resuelto con evidencia:** prueba o informe identificado.
- **Mejora opcional:** no bloquea la funcionalidad esencial.

## Umbral de lanzamiento

Usar “Release Candidate” si queda cualquier bloqueo crítico o prueba obligatoria sin ejecutar. Declarar “Release” solo cuando la campaña, niveles, progresión, guardado, controles, rendimiento en dispositivos objetivo, instalación/actualización y QA de la misma versión candidata estén verificados. Si no hay hardware, declarar explícitamente ese bloqueo y no inferir compatibilidad.
