# SELENE-01 — dimensiones y proporciones

Actualización: 14 de noviembre de 2026. Todas las coordenadas del mundo representan metros. La dirección artística sigue siendo ilustrada, con color mate, tinta y tres tonos.

## Referencias oficiales consultadas

| Referencia | Dato utilizado | Fuente |
|---|---|---|
| Orion, módulo de tripulación | Diámetro 5 m; altura 3,35 m | [NASA, Orion by the Numbers 2026](https://www.nasa.gov/wp-content/uploads/2026/01/orion-by-the-numbers-2026b.pdf) |
| SLS Block 1 | Altura completa 98,3 m | [NASA, comparación Block 1 / Block 1B](https://www.nasa.gov/reference/sls-space-launch-system-block-1b/) |
| Etapa central SLS | Altura 212 ft ≈ 64,6 m; diámetro 27,6 ft ≈ 8,4 m | [NASA, Core Stage](https://www.nasa.gov/reference/sls-space-launch-system-core-stage/) |
| Propulsores SLS | Longitud 177 ft ≈ 53,9 m; diámetro 12 ft ≈ 3,7 m | [NASA, Solid Rocket Booster](https://www.nasa.gov/reference/sls-space-launch-system-solid-rocket-booster/) |
| Perseverance | Longitud 3 m, anchura 2,7 m, altura 2,2 m | [NASA Science, Rover Components](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/) |
| Acomodación antropométrica de Orion | Estaturas de 4 ft 10 in a 6 ft 5 in (≈1,47–1,96 m) | [NASA, Crew Systems](https://www.nasa.gov/reference/crew-systems/) |

El rango antropométrico describe acomodación de asientos de Orion, no un requisito de altura del astronauta ni el tamaño de un traje. Se eligió un adulto ficticio de 1,80 m y una silueta de 1,95 m incluyendo casco. No se afirma reproducir un traje certificado.

## Medidas implementadas

- Exploradora Quaternius terrestre: 1,80 m en pose base, escala uniforme conservando su ropa y proporciones originales.
- Tripulante marciano: 1,95 m hasta el casco; extremidades y torso de proporción adulta, origen a la suela.
- TARS: 1,85 m en su pose base, escala uniforme conservando las cuatro mallas y su animación. Es un personaje ficticio sin especificaciones NASA.
- ODYSSEY: escala uniforme 5/3, diámetro del fuselaje y cabina 5 m. Altura de la versión compacta ≈14,38 m y con hábitat ≈18,55 m, incluyendo el motor final. La envolvente horizontal desplegada es aproximadamente 13,60 × 13,60 m. La cabina conserva su proporción original y mide 4 m de altura, distinta de los 3,35 m de Orion. La referencia NASA orienta el tamaño; no certifica geometría, habitabilidad ni rendimiento.
- Hangar terrestre: cuerpo de 23 × 24 × 20 m (ancho × alto × fondo), abertura industrial de 22 m de alto y 15 m de ancho. Se mantiene su emplazamiento y su colisión horizontal. El taller marciano es una instalación de superficie, no el edificio que encierra la nave completa.
- Puerta peatonal: hoja/paso visual de aproximadamente 1,10 × 2,20 m; herrajes, dintel y marco quedan fuera de esa medida. Los edificios visitables tienen puertas automáticas, suelos interiores, rampas y colisiones; ver NASA_INTEGRATION.md.
- Banco: 0,50 m de altura superior del asiento, 1,80 m de longitud. Estas son decisiones arquitectónicas del proyecto, no normas NASA.
- Lanzador ODYSSEY: 90,407 m de alto, modelo ficticio escalado 5/3. La plataforma usa su GLB animado; SLS se conserva únicamente como referencia documental de dimensiones, no como el lanzador activo.
- ROBER: GLB aportado por el usuario, normalizado uniformemente a 3 m de longitud tomando Perseverance como referencia. Se conserva la relación original de anchura y altura; no se fuerza a una envolvente de 3 × 2,7 × 2,2 m. Incluye rig, seis ruedas, mástil y brazo animado, sin afirmar que sea un CAD exacto ni una simulación científica. Velocidad jugable de 1,1 m/s, o 0,55 m/s en modo terreno irregular; son valores educativos, no velocidades operativas NASA.
- Marcha 1,4 m/s; carrera de la exploradora en Tierra 4,2 m/s; desplazamiento rápido del astronauta marciano 3,2 m/s. No son velocidades EVA documentadas. La simulación no modela carga del traje ni gravedad reducida.

## Integración

`physicalScale.ts` centraliza medidas y fuentes. Se usan en TARS, ODYSSEY, el rover, colisiones y controles. `Astronaut.tsx` representa al tripulante marciano; `ExplorerCharacter.tsx` es el avatar exclusivo de Tierra, normalizado a 1,80 m. `LaunchComplex.tsx` integra el lanzador ODYSSEY y su plataforma. La campaña y el explorador ahora reutilizan el mismo entorno terrestre. El constructor conserva sus acoples GLB originales y aplica la escala de conjunto una sola vez, incluidos los accesorios; la cuadrícula representa pasos de 1 m.

Los mundos no aumentaron de extensión. El campus se interpreta como exposición educativa compacta: ningún lanzamiento real se sitúa a esta distancia de personas y edificios. Las masas, consumos y presupuestos del juego siguen identificados como educativos; no se deducen automáticamente de los tamaños ni se presentan como datos reales de Orion o SLS.

Las 18 pruebas automáticas y la compilación pasaron localmente y en GitHub. La revisión visual y jugable queda pendiente del usuario. No se garantiza perfección visual ni conformidad técnica NASA.
