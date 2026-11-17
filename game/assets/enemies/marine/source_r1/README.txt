SOFÍA - ENEMIGOS MARINOS, R1

Contenido:
- 4 atlas PNG RGBA transparentes (tiburon, pirana, pulpo, poseidon)
- Un JSON por personaje con coordenadas, pivote, animaciones y guía de daño
- FX aislados en atlas individuales cuando hay recursos independientes
- manifest.json y preview_QA.html

Estos son frames gráficos generados, empaquetados y revisables. No se ha modificado el repositorio del juego.

Para visualización local del preview, sirve el directorio por HTTP (por ejemplo: python -m http.server 8000), luego abre /preview_QA.html.
Para Canvas 2D usa drawImage(atlas, frame.x, frame.y, frame.w, frame.h, x, y, frame.w, frame.h).
La simulación puede correr a 60 FPS con tiempos de sprites independientes en milisegundos.
Las animaciones de muerte no se repiten; los ataques causan daño solo en los fotogramas activos.
ATENCIÓN: Las hitboxes/hurtboxes incluidas son GUÍAS; requieren QA contra Sofía para validar el contacto real.
Los FX fusionados visualmente con el cuerpo no pudieron separarse sin intervención artística adicional.
Los valores de daño son orientativos: deben balancearse dentro del proyecto.
El arte muestra poses clave; aún deben probarse las transiciones y las cajas en el nivel.
