# V57.8 — Océano neutral y animación terrestre

- En el **océano de la misión submarina**, eliminamos la flotación automática hacia la superficie. Sofía conserva casi la misma profundidad cuando no se mueve; su velocidad vertical se amortigua suavemente con fricción exponencial.
- Se amortigua la velocidad de caída al entrar al mar. Se establecen límites verticales de 185 unidades/s para bajar y 190 para subir, sólo al mantener las direcciones.
- ARRIBA/SALTAR continúan impulsando hacia arriba; ABAJO impulsa hacia abajo. DASH mantiene una ráfaga independiente.
- Los **lagos del Parque** conservan la flotación original para no alterar otros niveles.
- Se incorporan 6 cuadros de `estabilizar_agua` del atlas buceadora de 100 cuadros para la pose bajo el agua sin movimiento.
- En la **isla inicial**, la jugadora usa los 6 cuadros de caminata por versión (original, rosa, uniforme), a 8 fps y pivote de pies `160,308`. En reposo utiliza `idle_0.png` (pose real de dos pies apoyados tomada del material recibido) y respiración sutil con pivote fijo.
- En la cinemática, las escenas de conversación dejan de reproducir pasos si Sofía se encuentra quieta.
- No se modificaron las hitboxes ni la física terrestre.

Control: en la superficie ARRIBA/SALTAR permite salir del agua; bajo el agua ARRIBA asciende, ABAJO desciende y soltar mantiene profundidad.
