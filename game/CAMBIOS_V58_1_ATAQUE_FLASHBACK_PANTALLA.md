# V58.1 · Ataque submarino, flashback y protección visual

## Cambios reales

1. **Patada submarina funcional en el mar:** el manejador `swimStep()` recibe PATEAR y activa 0,50 s de animación. Un tiburón puede recibir daño en la fase de impacto, no durante la anticipación. Se impide repetir el daño al mismo enemigo con un único ataque.
2. **Atlas nuevo de 11 cuadros RGBA** (`assets/player/sofia/swim_strike_11frames_v581.png`): se compone de 11 cuadros reales extraídos de la hoja de 100 frames previamente suministrada, utilizando giro, impulso y frenado. **No son once nuevas poses dibujadas de puño o patada**: son movimientos existentes reorganizados con un efecto de onda en el instante de contacto.
3. **Flashback de Estoker:** mejor separación horizontal y escalado en pantallas estrechas para evitar que padre e hija se encimen, deslizamiento horizontal suavizado, secuencia de diálogo continuada sin quedar congelada y texto por segmentos. Ambos siguen apoyados en el suelo seco.
4. **Mitigación del fallo visual verde:** el render restablece `globalAlpha` y `globalCompositeOperation` al inicio de cada frame, reduce la presión de memoria GPU limitando el DPR en móvil, cambia el fondo de reserva verde por azul, invalida caché SW V58.0 y evita guardar errores HTTP como recursos válidos.
5. **Conservado:** ropa escolar en calle e isla, equipo de buceo al entrar al agua, Luna y Morita acompañando el descenso, corrientes, tiburones, pirañas, pulpos y Poseidón.

## Límites de las pruebas
- La prueba en navegador real / Android no está certificada. La desaparición de la pantalla verde **no puede darse por garantizada** por las pruebas estáticas.
- Hay pruebas históricas que verifican la ausencia de ataques submarinos o el número de una versión antigua de caché; esas condiciones anteriores ya no son válidas.

## Uso
Descomprimir el ZIP y ejecutar en HTTP local, por ejemplo `python -m http.server 8000`; abrir `http://localhost:8000/Se_Me_Fue_El_Camion.html`. Si se usa PWA instalada, cerrar ventanas anteriores y recargar para activar la nueva caché.
