# Trazabilidad científica de la campaña lunar

SELENE-01 es una interpretación educativa del desafío **Space Mission Design Game** de NASA Space Apps 2026. La campaña pide elegir un objetivo, diseñar una nave, revisar recursos, autorizar el lanzamiento, operar y analizar el resultado. No representa una misión aprobada por NASA.

## Hechos documentados y uso en el juego

| Hecho o método | Fuente primaria | Uso en SELENE | Límite que debe explicarse |
| --- | --- | --- | --- |
| Los objetivos y requisitos guían el diseño; se comparan soluciones y sus consecuencias. | [NASA Systems Engineering Handbook: System Design Processes](https://www.nasa.gov/reference/4-0-system-design-processes/) | Laboratorio → diseño → revisión → operación → informe. | La revisión del juego es una comprobación educativa, no certificación de vuelo. |
| LRO lleva instrumentos para estudiar superficie, iluminación polar y regiones sombreadas; sus datos se procesan en centros científicos. | [NASA: LRO Spacecraft & Instruments](https://science.nasa.gov/mission/lro/spacecraft-and-instruments/) | Encargo de cartografía, órbita polar y retorno de datos. | ODYSSEY no reproduce los instrumentos, datos, órbita ni capacidades de LRO. |
| El instrumento Moon Mineralogy Mapper de NASA, a bordo de Chandrayaan-1 de ISRO, contribuyó a identificar hielo en regiones permanentemente sombreadas. | [NASA: Moon Water and Ices](https://science.nasa.gov/moon/moon-water-and-ices/) | Encargo de estudiar la composición. | El espectrómetro ficticio no identifica sustancias; una selección de pieza no produce un hallazgo. |
| Mini-RF en LRO usa radar para buscar indicios de hielo bajo la superficie y obtener imágenes de regiones sombreadas. | [NASA: Mini-RF](https://science.nasa.gov/mission/lro/mini-rf/) | Encargo de radar. | Una señal aislada del juego no confirma hielo real. |
| En el polo sur lunar hay evidencias de hielo en algunas regiones permanentemente sombreadas; la distribución y las condiciones de iluminación varían. | [NASA: Moonbase Environment](https://www.nasa.gov/reference/moonbase-environment/), [NASA: LCROSS](https://science.nasa.gov/mission/lcross/) | La bitácora de superficie diferencia indicios orbitales de una muestra de práctica. | La estación 01 y sus depósitos no corresponden a un sitio medido por NASA. |
| MRO estudia Marte con instrumentos especializados: HiRISE para imágenes, CRISM para minerales y SHARAD para el subsuelo. CRISM dejó de adquirir datos en 2022. | [NASA: MRO Science Instruments](https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/), [NASA/JPL: retiro de CRISM](https://www.jpl.nasa.gov/news/nasa-retires-mineral-mapping-instrument-on-mars-orbiter/) | Cuaderno independiente de Ares: elegir pregunta e instrumento de referencia; CRISM se presenta como archivo histórico. | El mapa de Ares no contiene observaciones de MRO ni constituye una campaña marciana completa. |

## Parámetros del simulador

Los instrumentos de ODYSSEY, AURORA-S, ATLAS-T, sus masas, potencia, presupuestos, GB, puntuación y duraciones son **ficticios**. Los tres eventos condensan una campaña; no propagan una órbita ni predicen batería, radiación, ventanas reales de comunicación o vida útil. El informe registra GB agregados, sin atribución por instrumento, por lo que no declara resuelta una pregunta científica real.

El personaje, el paisaje lunar y el mapa de Ares son reconstrucciones de entrenamiento. El encargo científico de la campaña es un orbitador lunar no tripulado: tras el lanzamiento, el jugador pasa a operaciones orbitales y después al informe. Los mapas de superficie de la Luna y Marte se pueden explorar por separado al terminar; no son el aterrizaje de ODYSSEY. Ares tiene un ejercicio de elección de observación orbital basado en MRO, pero todavía no tiene una campaña completa de diseño, lanzamiento, operaciones e informe propios. La secuencia de embarque y el descenso L01 son dramatizaciones independientes del juego.

La prospección, los interiores, el rover y el soporte vital de la base lunar forman **otro ejercicio simulado de superficie**. Sus seis depósitos, lecturas, reservas de oxígeno, recarga, rescate y diseño de sistemas de superficie son reglas ficticias. La muestra de hielo del juego no es una medición de ODYSSEY ni prueba la existencia de hielo en ese punto. El simulador de diseño de superficie emplea índices de comunicación, masas, costos y capacidades inventados; sus opciones no representan especificaciones de SLS, TBIRD o Kilopower.

## Pendiente para mayor fidelidad

1. Vincular cada dato simulado a un instrumento y a un objetivo medible.
2. Definir escenarios con altitud, iluminación, paso de comunicación y duración respaldados por fuentes, con unidades y supuestos visibles.
3. Revisar el modelo con una persona experta en ciencia o ingeniería espacial y probar si estudiantes comprenden las compensaciones.

La [ficha completa del desafío](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/) y su pestaña de recursos deben comprobarse directamente al preparar la entrega; no se declara aquí conformidad íntegra con recursos que no se han podido consultar.
