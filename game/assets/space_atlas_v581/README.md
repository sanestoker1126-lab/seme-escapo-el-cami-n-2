# Atlas de astronautas V58.1 (integrados en el juego)

**Origen:** paquete `ATLAS_ESPACIAL_V58_1_CONTORNOS_MAPEADOS_JSON.zip` (33 847 537 bytes,
SHA-256 `e5ecaed833533887f086043ac331229db4bf657e847f0b83e8d4830fa4e8c448`), carpeta `personajes/`.
Generados con `tools/arte/build_space_atlas_v581.py <paquete_descomprimido> <carpeta_game>`.

**Estado:** arte conceptual **preliminar** (según el propio paquete: hojas generadas, no sprites canónicos).
No reemplaza ni modifica ningún sprite existente; si un atlas no carga, el juego vuelve al dibujo anterior.

| Archivo | Personaje en el juego | Cuándo se usa | Frames |
|---|---|---|---|
| `sofia_falda_roja.png` | Sofía (apariencia original, buzo y astronauta) | misión Espacio y apariencia ASTRONAUTA | 44 |
| `sofia_cuadros.png` | Sofía (apariencias uniforme y rosa) | misión Espacio | 32 |
| `gato_blanco.png` | Luna | misión Espacio | 16 |
| `gato_gris.png` | Morita | misión Espacio | 16 |

Estados de Sofía → animación: reposo `idle`, correr `walk`, carrera rápida `run`, salto `jump_launch` →
`jump_air`, aterrizaje `land`, daño `hurt_alt`, impulso (dash) `boost`, disparo láser `shoot`,
derrota `defeat` y victoria `victory` (solo falda roja; cuadros usa `hurt_alt`/`idle`).
Gatas: `idle` quietas y en el hombro, `walk` al moverse.

**Proceso:** frames escalados al 50 % (alfa premultiplicado) y reempaquetados; en pantalla Sofía mide
~150 px, así la textura cuesta 4× menos memoria de GPU. Cada grupo de origen (celdas de 280 px,
celdas de 362 px, recortes previos) se normaliza para que la pose de pie mida 68 u de mundo
(la Sofía actual mide ≈ 66.7 u). Las hitboxes no cambian.

**No integrado:** `cuarentena/sofia_variacion_roja` (vestuario incorrecto según el paquete) y las
secuencias `hurt`/`jump` de 9–12 frames de recortes previos (escala distinta; se usan `hurt_alt` y `jump_air`).

**QA pendiente (del paquete):** 29 frames con alertas, sobre todo `SOURCE_CELL_EDGE_CONTACT_REVIEW`
(el dibujo toca el borde de su celda; puede verse recortado) en `run` y `jump_air` de `sofia_cuadros`,
y `MULTIPLE_VALID_CONTOURS` (llamas/destellos separados) en `boost`/`shoot`. Revisar en el teléfono.
