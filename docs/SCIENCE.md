# Rigor científico y supuestos

SELENE-01 busca explicar sistemas reales de misiones espaciales, pero esta primera versión **NO simula ingeniería real**. Se prohíbe describir los porcentajes del HUD como cantidades físicas o pronósticos de supervivencia de una tripulación.

## Referencias conceptuales
- NASA, *Moon to Mars Architecture*: https://www.nasa.gov/moontomarsarchitecture/
- NASA, *Environmental Control and Life Support System (ECLSS)*: https://www.nasa.gov/reference/environmental-control-and-life-support-system-eclss/
- NASA, *Artemis*: https://www.nasa.gov/artemis/
- NASA, *Space Weather*: https://science.nasa.gov/heliophysics/space-weather/

Estos enlaces son puntos de partida para futuras validaciones. Las cifras del juego son **inventadas para equilibrio pedagógico**, no tomadas de NASA.

## Modelo de demostración
Cada recurso parte con un índice de 0–100. Elegir una opción modifica algunos índices y avanzar al siguiente sol descuenta consumos educativos fijos:

| Recurso | Consumo fijo por sol (puntos) |
|---|---:|
| Energía | -13 |
| Oxígeno | -10 |
| Agua | -8 |
| Alimentos | -8 |
| Integridad | -3 |

Se aplica `nuevo = max(0, min(100, actual + impacto))`. Cuando un recurso llega a cero después de la fase de consumo, la misión termina. Es un diseño de juego, no un modelo calibrado de recursos reales.

## Validación posterior
Antes de representar métricas reales, definir unidades físicas, supuestos, tasas, condiciones del entorno, márgenes de seguridad y referencias primarias verificables. Acompañar cada regla de un comentario de fuente. Someter el contenido a revisión por docente o asesor. Diferenciar con claridad contenido factual, ficción narrativa y decisiones de equilibrio del juego.
