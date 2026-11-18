# V57.5 · Recuerdo de la isla y la leyenda marina

El nivel 2 (misión marina) presenta a Sofía llegando a la isla en la animación de la apariencia seleccionada. Reconoce que ya visitó el lugar con su papá Estoker. Se activa un flashback donde caminan, Estoker cuenta la leyenda de una ciudad perdida bajo el mar, explica los peligros (tiburones, pirañas, pulpos y corrientes) y le indica bajar al santuario de Poseidón y alcanzar la salida del camión. Al terminar o saltar la escena se devuelve el control de juego sin alterar las físicas.

**Assets:** 32 PNG RGBA de Estoker en 4 secuencias y sus 4 atlas originales, con tiempos y pivote según el manifiesto de fuente. El paquete fue conservado sin redibujar poses. V57.4 conserva las variantes de Sofía y los 100 cuadros de buceo; V57.3 conserva los enemigos marinos y el parallax.

**QA pendiente:** continuidad visual cuadro a cuadro de los atlas generados de Estoker en dispositivos reales. El sprite de `explicar_estoker` presenta un fragmento duplicado en el extremo inferior de ciertos cuadros de origen; se conserva la fuente original; la cinemática utiliza una copia con alfa atenuado al final del cuadro para ocultar el fragmento duplicado (sin redibujar).

Prueba de la cinemática sin jugar: `PREVIEW_CINEMATICA_ESTOKER.html` a través de un servidor HTTP local.
