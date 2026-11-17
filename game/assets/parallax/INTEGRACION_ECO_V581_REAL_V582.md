# Parallax V58.1 + V58.2 — integración en Release Candidate ECO

**Motor:** HTML5 Canvas / JavaScript · **Rama:** `manus/release-candidate-v58.1-fase4`

## Assets integrados
- `assets/parallax/eco_v581/`: **10 PNG RGBA8888 de 768×768**; manifiesto y renderer V58.1.
- `assets/parallax/real_v582/`: **16 PNG RGBA8888 de 1536×864**; manifiesto y renderer V58.2.
- Cuatro escenarios: Escuela, Guadalajara, Submarino y Espacio.
- `tests/parallax_eco_v581.test.js` y `tests/parallax_real_v582.test.js`; visores en `tools/`.

Los PNG proceden de los paquetes de producción previos y se añadieron sin modificación de sus píxeles; las comprobaciones Git blob SHA se hicieron contra los bytes de origen.

## Render de producción
`js/app/parallax_real_v582.js` se carga antes de `js/app/render.js` y pinta tras `drawScenes`, antes del entorno cercano. El render usa las cámaras y bounds existentes; no escribe en la simulación, físicas ni hitboxes. La caché PWA incluye las 16 capas V58.2 y cambia de identificador para invalidar la versión anterior.

**V58.2 es el conjunto activo.** Los 10 PNG V58.1 y su módulo permanecen disponibles para referencia y revisión, pero no se ejecutan simultáneamente para evitar doble neblina/partículas y consumo excesivo en Android.

## Validación y límites
El pipeline de producción verifica rutas, hashes, PNG RGBA y módulos con pruebas Node; no prueba el rendimiento del dispositivo físico. Aún es **RELEASE_CANDIDATE_ECO**, no Release 1.0.

**Pruebas mínimas:**
```bash
cd game
node --test tests/parallax_eco_v581.test.js tests/parallax_real_v582.test.js
node --test tests/*.test.js
```

El parallax nuevo es decorativo: no se crea geometría de plataforma, colisionadores, IA ni enemigos. Los fondos y sprites canónicos preexistentes quedan intactos.
