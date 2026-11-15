# Entrega vigente de SELENE-01

La versión del juego se comparte en `main`. Las notas históricas de recursos sustituidos se conservan en Git; este documento describe únicamente la entrega actual.

- Tierra: campus Artemisa de 240 × 240 m, exploradora Quaternius de 1,80 m, TARS01, diez módulos BASEPRI y hangar. Laboratorios y estructuras visitables con puertas automáticas, rampas, muebles, colisiones y cubiertas que se ocultan al entrar.
- Marte: sector Ares de 320 × 320 m, astronauta y demostración de cápsula L01. No hay campaña marciana completa ni terreno obtenido de elevaciones NASA.
- ODYSSEY: trece modelos modulares, constructor, lanzador y plataforma con mecanismos animados. Son diseños ficticios de enseñanza.
- ROBER: control remoto y cinco clips, con ruedas, mástil y brazo. Sus acciones no equivalen a mediciones científicas reales.
- Entorno: tres árboles con brisa y hojas, ocho animales animados, quince elementos ambientales, cielo ilustrado y caminos integrados en el material del terreno. Los árboles se incluyen con autorización expresa del responsable, quien confirma su autoría.
- L01: cápsula de 5 m, demostración de descenso y separación de ascenso; entrenamiento en Tierra y llegada en Marte.

## Recorrido y controles

Investigación → diseño y ensamblaje → revisión en comunicaciones → autorización de lanzamiento → tres decisiones de operaciones → informe en el mirador. La revisión se vincula al diseño: cambiar la configuración exige volver a revisarla.

WASD/flechas para caminar, Shift para correr, Espacio para saltar, E para interactuar, Ctrl para sentarse junto a bancos. M abre el mapa, J la bitácora y Escape el menú. Los diálogos aparecen bajo demanda. El salto es físico: el personaje no trae un clip de salto propio. Ellis está retirado y no es una opción del juego.

El progreso se guarda en el navegador. Los cuatro cuadernos de TARS son sesiones locales; no existe multijugador sincronizado. La duración de 30, 90 o 180 días influye en las reglas educativas de recursos; no constituye un cálculo orbital real.

## Documentación y comprobaciones

- [Guía del equipo](COLLABORATION.md): instalación, edición y forks.
- [Narrativa e interfaz](NARRATIVE_AND_INTERFACE.md): experiencia actual.
- [Integración NASA](NASA_INTEGRATION.md): fuentes y límites científicos.
- [Proporciones](PHYSICAL_SCALE.md): referencias y medidas del juego.
- `public/models/*/README.md`: procedencia, animaciones y uso de cada recurso.

Las 18 pruebas y la compilación pasaron localmente y en GitHub. La revisión visual, el rendimiento en distintos equipos y la experiencia de juego requieren evaluación del equipo. No se hicieron capturas ni se afirma validación visual completa.
