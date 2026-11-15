> Actualización: el usuario proporcionó el texto completo del reto. Se incorporó a [NARRATIVE_AND_INTERFACE.md](NARRATIVE_AND_INTERFACE.md), junto con las nuevas reglas educativas de duración. Esto no equivale a una consulta independiente de la página oficial. Las notas siguientes corresponden a la entrega de estaciones previa.

# Estaciones, ODYSSEY y referencias NASA

Entrega del 14 de noviembre de 2026. Las fuentes fundamentan los contenidos educativos; no convierten los edificios, vehículos o presupuestos ficticios en diseños aprobados por NASA.

## Integración de Juego NASA.rar

- Los 13 GLB de los módulos coinciden byte por byte con los ya integrados; se mantienen.
- Se incorporan lanzador_odyssey.glb y plataforma_odyssey.glb. Sus metadatos originales los identifican como lanzador cinematográfico y escenario industrial ficticios.
- Se conserva la jerarquía original, incluido CARGA_ODYSSEY, para acoplar la nave y acompañar la animación de liberación.
- Lanzador, plataforma y nave comparten el factor uniforme 5/3 que ya utiliza ODYSSEY. Lanzador: 90,407 m de alto y 17,567 m de ancho; plataforma: envolvente 66,667 × 71,667 m. Son medidas del modelo escalado, no cifras NASA.
- La plataforma ocupa el noreste del campus, centro de montaje (61, -75). Su huella queda dentro del límite de 240 × 240 m; el terreno de apoyo se nivela y la zona técnica se delimita mediante colisiones.
- Animaciones: SERVICIOS_RETIRADA, BOOSTERS_SEPARATION, CORE_STAGE_SEPARATION, FAIRING_JETTISON y ODYSSEY_RELEASE. Los mecanismos se demuestran individualmente; no son una simulación aerodinámica del ascenso.
- Los paneles se representan plegados mediante geometría simplificada en la carga del lanzador. La nave del constructor y la exposición conservan los paneles originales desplegados.
- Materiales toon mate, marfil/verde azulado/coral y contornos de tinta; texturas originales conservadas.

## Fuentes consultadas

| Fuente primaria | Aplicación |
| --- | --- |
| [NASA Systems Engineering Handbook: System Design Processes](https://www.nasa.gov/reference/4-0-system-design-processes/) | Partir de objetivos y requisitos, comparar soluciones y revisar el diseño de forma iterativa. Adaptado a las estaciones del campus. |
| [NASA Moon Water and Ices](https://science.nasa.gov/moon/moon-water-and-ices/) | Contexto de hielo en zonas permanentemente sombreadas; observaciones complementarias y composición lunar. |
| [NASA Mini-RF: radar polar](https://science.nasa.gov/missions/mini-rf/nasa-radar-finds-ice-deposits-at-moons-north-pole/) | Contexto para el encargo de radar. El juego no afirma que una señal aislada confirme un depósito. |
| [NASA Space Launch System](https://www.nasa.gov/reference/space-launch-system/) | Referencia externa SLS Block 1: 322 pies ≈ 98,15 m. ODYSSEY ocupa ahora la plataforma y no se presenta como SLS. |

Se intentó consultar la [ficha oficial indicada por el usuario](https://spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources), pero el acceso web no devolvió su contenido. No se declara cumplimiento íntegro de las bases con una captura parcial. Los enlaces NASA anteriores sí se consultaron.

## Secuencia implementada

Objetivo científico → ensamblaje y selección de instrumentos/órbita/lanzador → revisión de masa, potencia, datos y presupuesto → autorización en la plataforma → tres decisiones de operaciones → cuaderno de resultados en el mirador.

La actividad exige estar en la estación. El mapa solo permite visitar la entrada. La revisión se vincula a la configuración exacta; cambiar piezas, instrumentos, órbita o lanzador impide reutilizar una revisión anterior. Objetivo, diseño, revisión y resultado se guardan localmente; no se comparte progreso entre navegadores.

## Interiores y límites

Laboratorio, taller, comunicaciones, hábitat, esclusa, invernadero, refugio y soporte vital conservan los muebles del archivo BASEPRI. El hangar tiene una envolvente abierta, área de trabajo y consola. Se separan las hojas de puertas para abrirlas, se extraen obstáculos y superficies del modelo y se añaden accesos. Energía y logística contienen principalmente equipos de exterior. La cámara se aproxima al personaje y se ocultan las cubiertas al entrar.

La misión de esta entrega es lunar y se prepara en la Tierra. Marte conserva su escenario y módulos visitables; sus objetivos específicos todavía no están implementados. El juego es de un jugador con cuatro cuadernos locales de TARS. Las masas, capacidades, presupuestos, tres turnos y puntuaciones son reglas hipotéticas; no se calculan dinámica orbital, consumo real de propelente, vida útil ni seguridad de una misión tripulada.

Sin capturas, pruebas automáticas ni compilación en esta entrega, a petición del usuario. Queda pendiente su revisión visual y jugable.
