# V58.1 FASE4 — Optimización de atlas y sprites PNG sin pérdida

Este procedimiento usa **PNG originales del repositorio**: no inventa sprites, poses, efectos ni fotogramas. Solo recomprime el flujo IDAT (DEFLATE/zlib) de cada PNG existente. No modifica muestras RGBA, transparencia, metadatos, pivotes, coordenadas, escalas, física ni hitboxes; tampoco crea atlas duplicados.

## Ejecución desde game/

```bash
node --test tests/v581_lossless_png_optimization.test.js
node tools/arte/optimize_png_source_locked.js --profile runtime --report optimizacion_previa.json
node tools/arte/optimize_png_source_locked.js --profile runtime --apply --report optimizacion_aplicada.json
node --test tests/character_enemy_assets_section01.test.js tests/character_enemy_missing_sources_v581.test.js tests/v581_lossless_png_optimization.test.js
```

`--profile runtime` selecciona piraña, tiburón, pulpo, Poseidón, atlas de Sofía, cuadros de Sofía llegada, Estoker y Luna/Morita. `--profile all` agrega los PNG de fuentes y QA.

La ejecución normal es **solo lectura**. Solo `--apply` modifica archivos, y únicamente si el resultado pesa menos. Comprueba los CRC, verifica igualdad de los bytes de píxeles descomprimidos, valida el nuevo PNG y reemplaza cada archivo de forma atómica. Registra dimensiones, alfa, bytes y SHA-256.

No convierte RGB a RGBA ni crea poses nuevas. La optimización no promete una reducción fija, ya que algunos archivos pueden estar comprimidos óptimamente. Las animaciones derivadas del atlas complementario de Sofía continúan siendo provisionales. Revisar visualmente y probar las colisiones antes de publicar.

**Alcance de QA:** las pruebas unitarias del algoritmo se ejecutaron en un PNG RGBA de prueba. Ejecutar el script con los PNG descargados para medir los ahorros reales.
