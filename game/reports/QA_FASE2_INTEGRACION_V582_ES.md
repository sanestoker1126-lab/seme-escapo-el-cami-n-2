# QA de integración Fase 2 sobre V58.2

**Rama:** `manus/release-candidate-v58.1-fase4`

**Base remota conservada:** `bac000a`

**Estado del producto:** Release Candidate ECO; no es RELEASE 1.0.

## Integración

Se conservó el stack V58.2 y se combinaron las dos capas SVG ambientales aprobadas: `submarino/05_corriente_profunda.svg` y `espacial/05_nebulosa_distante.svg`. También se conservaron las capas terrestres locales 03 de Escuela (`03_ambiente.webp`) y Guadalajara (`03_reflejos_luces.webp`), con su orden, velocidad y alpha en el compositor. Se mantuvieron las correcciones aprobadas de las capas espaciales SVG 02/03/04 y del gradiente exterior submarino.

La integración encontró que el HTML cargaba `js/app/parallax_real_v582.js?v=58.1`, pero el Service Worker no lo incluía en su lista de código. Se añadió al `CODE` del precache conservando el cache ID vigente `camion-v58-1-phase4-parallax-real-v582-cache`. Los cuatro grupos de overlays V58.2, las capas locales 03 y ambos SVG nuevos siguen registrados en el precache.

## Verificación dinámica y capturas

Se probaron las primeras escenas de Escuela, Guadalajara, Submarino y Espacio en el navegador QA. Los cuatro grupos V58.2 reportaron sus PNG listos; `03_ambiente.webp`, `03_reflejos_luces.webp`, `05_corriente_profunda.svg` y `05_nebulosa_distante.svg` también reportaron carga correcta en las escenas correspondientes. El encuadre marino queda en gama azul, sin la franja cálida superior. En Espacio, las capas SVG locales 02/03/04 ya no aportan los bloques grandes al corredor jugable. **Pendiente visual:** la captura actual todavía muestra discos planetarios muy grandes en el panorama V58.2 (principalmente a la derecha y en el margen inferior); se conservaron intactos y no se declara corregida por completo la referencia histórica hasta confirmar si ese tamaño es intencional o un defecto.

- Escuela: [captura PNG](screenshots/phase2_expanded/school_v582_integrated.png)
- Guadalajara: [captura PNG](screenshots/phase2_expanded/guadalajara_v582_integrated.png)
- Submarino: [captura PNG](screenshots/phase2_expanded/submarine_v582_integrated.png)
- Espacio: [captura PNG](screenshots/phase2_expanded/space_v582_integrated.png)

## Pruebas

Pasaron `node --check` para `render.js` y `sw.js`, el parseo de los manifiestos JSON y `git diff --cached --check`. Las regresiones enfocadas completaron **47/47**; las dos pruebas V56 de renderer y PWA, **2/2**. Tras añadir el módulo V58.2 al precache, la prueba de coherencia de versión HTML/Service Worker pasó **1/1**.

La suite completa final (`node --test tests/*.test.js`) ejecutó 222 pruebas: **212 pasaron, 10 fallaron y 0 se omitieron** (496.2 s). Los fallos restantes pertenecen al conjunto heredado ya reproducido en la comparación contra la base remota `bac000a`; afectan plataformas/mapas, físicas, atlas/animación de nado, precarga heredada y paseo V57.6. El fallo de precache específico del módulo V58.2 ya no aparece. Estas fallas se documentan y no se atribuyen a la ampliación parallax.
