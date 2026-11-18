# Estoker caminando y explicándole la misión a Sofía

Sprites RGBA separados en cuatro grupos: **caminar_estoker** (7), **explicar_estoker** (7), **caminar_con_sofia** (6) y **conversacion_con_sofia** (12). Total **32 frames** (280 × 384 px).

- `frames/`: PNG individuales en secuencia.
- `atlases/`: una tira PNG por secuencia.
- `preview/`: GIF de revisión de cada animación.
- `manifest.json`: posiciones del atlas, tamaños, duración y punto de apoyo (bottom center).
- `referencias/`: spritesheets originales para trazabilidad.
- `index.html`: reproductor local para las cuatro secuencias.

**Nota técnica:** los fotogramas son arte generado y recortado, no una animación verificada con rig o interpolación. Conviene revisar continuidad del tatuaje, transición entre pasos y variaciones de escala antes de la integración final. El fondo es alfa transparente.
