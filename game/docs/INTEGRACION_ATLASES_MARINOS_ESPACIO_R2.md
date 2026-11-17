# V57.2 · Recursos marinos y espaciales R2

**Base:** V57.1 isla y flashback de Estoker. Este paquete es una integración local; no se ha publicado en GitHub.

- `assets/enemies/marine/` contiene los atlas RGBA y mapeos originales de cuatro enemigos del paquete R1 (tiburón, piraña, pulpo y Poseidón).
- `js/app/marine_atlases.js` es metadata derivada automáticamente de los JSON originales (sin generar cuadros nuevos).
- `js/app/render.js` utiliza los atlas de tiburón y piraña para las entidades `shark` y `piranha` existentes. Pivote anclado a centro virtual de celda; volteo por dirección; los ataques animados no modifican física, hitbox ni daño. El motor sigue exigiendo embestida anunciada para causar daño.
- El pulpo y Poseidón están **incluidos como recursos para futura integración**, pero **no son enemigos jugables todavía**: no se crean entidades ni se inventan ataques funcionales.
- `assets/parallax/espacial/r2` contiene el panorama y decoración original, además de copias optimizadas WebP. El panorama llena el área visible usando recorte proporcional; capas SVG 1-4 existentes siguen en escena. Los objetos móviles son decorativos.
- El parallax marino de siete capas de V57.1 se conserva sin modificar, porque el paquete marino recibido corresponde al mismo conjunto de imágenes ya usado allí. Hay copias PNG originales en `assets/parallax/marino/originales_r1`.
- Cambiado el nombre de la caché PWA e incluidos los recursos nuevos de los atlas, sprites y panorama espacial. Los recursos nuevos se cargan por separado del estado de partida.

## Alcance de QA

- Valida atlas/JSON: 129 frames, crops en los límites de los PNG, animaciones y archivos.
- Verifica las referencias y `node --check` + suite de pruebas Node.
- Pendiente: inspección visual y rendimiento con Android; sincronización final de hitboxes frente a sprite real; animaciones de pulpo/Poseidón en motor de combate.
