# ¡Se me fue el camión! · A1+A2 — integración en rama V58.1

**Estado del juego:** RELEASE_CANDIDATE_ECO, no RELEASE 1.0.

## Código ya integrado en esta rama
- `js/app/environment_props.js`: decoración pasiva, posición estable por escena y carga asíncrona.
- `js/app/render.js`: dibuja ambiente después de fondos y antes de plataformas/personajes.
- `Se_Me_Fue_El_Camion.html`: carga el adaptador.
- `sw.js`: precarga optativa PNG/JSON, sin fallar si faltan; conserva cache de fase 4.
- `tests/environment_props_bridge.test.js`: regresión de integración.
- `tools/import_environment_assets.py`: importador seguro de recursos binarios.

## Transferencia binaria pendiente
**Los 8 atlas PNG y los 32 objetos originales no están todavía presentes en esta rama de GitHub.**
La conexión de código no los sustituye ni simula la subida. Hasta importarlos, el renderer conserva
los fondos y las físicas originales sin tratar de dibujar datos inexistentes.

Fuente exacta: `SE_ME_FUE_EL_CAMION_ENVIRONMENT_A1_A2_RGBA_V58_1.zip`
SHA-256: `e987510ca7a0645cc8e53a89260209205e6bebe05c6f648d86d050b3604f2281`

El ZIP incluye 32 objetos catalogados y 8 atlas PNG RGBA con JSON/CSV. Dos PNG auxiliares no
están incluidos en el catálogo y no se activan automáticamente.

### Finalizar desde el clon GitHub/Codespaces

```bash
git checkout manus/release-candidate-v58.1-fase4
python3 game/tools/import_environment_assets.py ./SE_ME_FUE_EL_CAMION_ENVIRONMENT_A1_A2_RGBA_V58_1.zip
cd game
node --test tests/environment_assets_integrity.test.js tests/environment_A2_integrity.test.js tests/environment_props_bridge.test.js
cd ..
git add game/assets/objects game/assets/atlases game/assets/environment_manifest.json game/assets/environment_a2_manifest.json game/assets/environment_complete_manifest.json game/tests/environment_assets_integrity.test.js game/tests/environment_A2_integrity.test.js game/tools/preview_environment_assets.html game/tools/preview_environment_A2.html game/tools/preview_environment_complete.html
git commit -m "assets: import 32 environmental props RGBA A1+A2"
git push origin manus/release-candidate-v58.1-fase4
```

No crear colisionadores para objetos decorativos ni reemplazar atlas de personajes/enemigos.
Revisar la visualización en cuatro mundos, móvil, escritorio y PWA offline antes del cierre ECO.
