# Parallax marino e isla inicial · Fase 1 (V57.1)

- Origen: panorama_marino.png, arrecife.png y fauna.png del ZIP SOFIA_PARALLAX_MARINO, combinado con las capas SVG originales existentes del proyecto.
- Arte nuevo: `assets/parallax/marino/00_oceano_vertical.webp`, `01_luz_volumen.webp`, `05_fauna_limpia.webp`, `06_arrecife_real.webp` y `manifest_v571.json`.
- Fondo oceánico de 2304 x 3072 cubriendo el panel de juego y ambos laterales; escenas recortadas del arte real (naufragio arriba, mar abierto en el centro, ruinas y Poseidón abajo), sin estirar por separado X e Y.
- Efecto en siete capas que se muestra a distintas distancias; solo las dos últimas se desplazan cerca del jugador; el primer plano se recorta a los bordes. Sin colisiones, sin afectar la simulación a 60 Hz.
- Isla seca al principio: plataforma física original de inicio y=150; superficie del océano en y=205. Un único cuerpo profundo ocupa el resto hasta y=2920 del mapa, y se sale al final del agua de manera continua para alcanzar la salida del motor V57.
- Nueva secuencia de 5 escenas `js/app/marine_intro.js`: Sofía camina confundida; recuerda las indicaciones de su padre Estoker; peligros y controles; regreso al presente. Pausa real del motor durante el relato, sin modificar movimiento/cámara.
- El retrato de Estoker es vectorial **provisional**, no un diseño canónico.
- Las corrientes marinas y Poseidón como jefe no se integran en esta primera fase. No confundir su mención en el flashback con una función ya implementada. Actualmente permanece el tiburón guardián de V57, y la escotilla de salida.
- Para jugar: abrir un servidor HTTP local (`python3 -m http.server 8000`) y cargar `Se_Me_Fue_El_Camion.html`. La intro sale al elegir la misión 3 con la opción Cinemáticas activada.
- Para validar: `node --test tests/*.test.js` y `node --test tests/v571_marine_phase1.test.js`.
