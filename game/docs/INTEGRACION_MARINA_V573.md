# ¡Se me fue el camión! V57.3 — Bestias marinas y flashback

Base: V57.2. Este paquete actualiza el juego localmente; no está publicado en GitHub.

## Extracción real
- Se extrajeron **129 cuadros RGBA** de los atlas fuente R1, sin generación de nuevos sprites: piraña 35, tiburón 33, pulpo 37, Poseidón 24.
- Rutas: `assets/enemies/marine/frames/<personaje>/`, atlas normalizados `*_atlas_v573.png`, metadatos `*_atlas_v573.json`, hojas `*_QA_v573.webp`.
- Se conservaron los atlas originales y JSON R1 como referencia. El nuevo atlas añade 8 px de margen por celda, pivote local central ajustado y reproduce coordenadas reales.
- Algunos recortes originales tienen alfa visible junto al borde del recorte ceñido; están registrados en `qa_flags` para revisión manual. No implica que el frame esté mutilado.

## Juego
- Pirañas, tiburones y pulpos aparecen en el océano; Poseidón se coloca en la parte baja del mar como jefe de la misión.
- El daño por contacto de las cuatro criaturas solo está habilitado durante el estado de embestida `charge` después del aviso `windup` y solo cuando Sofía comparte la misma zona de agua. Las animaciones siguen los estados de la IA de 60 FPS; el atlas no altera las hitboxes.
- La lógica de ataques de tinta, olas y tridente no usa proyectiles adicionales en esta etapa: los cuadros se sincronizan con la embestida anunciada. Los efectos de los atlas son visuales.
- El recorrido conserva la isla inicial, el océano y la escotilla inferior. El parallax no modifica la física.

## Flashback animado
- La última hoja proporcionada se guardó en `assets/cinematic/storyboard_marino/hoja_original.png` y se recortó en cinco imágenes `escena_*.webp`.
- La introducción enseña: llegada, mundo submarino, recuerdo de papito Estoker, peligros, misión y Poseidón. Se proyectan animaciones de las bestias sobre los paneles 4 y 5.
- Durante la intro, la simulación queda pausada. Se puede saltar o avanzar con teclado y controles táctiles.

## Límites verificados
- Se validó la existencia y las dimensiones de los archivos, integridad del ZIP, sintaxis y pruebas Node focalizadas.
- No se ha probado físicamente en un dispositivo Android ni se certifica el rendimiento gráfico/combate final en todos los tamaños de pantalla.
