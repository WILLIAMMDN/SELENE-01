# SELENE-01 · Lanzamiento y relevo de escenarios

## Objetivo del flujo
La secuencia ocurre en el **mismo Canvas** y campus del juego, no en un video ni
una pantalla independiente. El jugador debe completar y validar su nave primero.

1. En LC-01, después de validar la nave, acercarse al vestuario EVA.
2. Pulsar E, equipar el traje espacial del personaje ya existente.
3. Seguir caminando por el corredor con las doce escaleras, hacia el elevador de
   servicio de la torre. La subida elevada usa el mismo PlayerRig del campus.
4. Recorrer la pasarela hasta la escotilla, pulsar E y confirmar lanzamiento.
5. Cámara de la escena existente cambia a planos de cine, ocultando controles y
   dejando un diálogo breve, una cuenta regresiva y un botón Omitir.
6. Se ven sucesivamente retirada de servicios, ignición, despegue, separación
   de auxiliares, cofia, etapa central y ODYSSEY. No se falsifican lecturas NASA.
7. Terminado o omitido el vuelo, se guarda **una sola vez** la sesión de
   operaciones y se cambia al mundo de la misión.

## Referencia de cámara (para arte/Blender)
La altura mundial del GLB del lanzador es aproximadamente 90 m. Los encuadres
están en `src/spacecraft/launchCameraShots.ts`, con una separación mínima entre
cámara y estructura. No colocar una cámara a 20 m de la tobera de un cohete
de 90 m: se convertirá en un plano de la textura del tanque.

| Segmento | Tiempo de montaje | Intención |
| --- | --- | --- |
| Nave y plataforma | 0–4 s | Situar espacio y escala |
| Cabina | 4–8 s | Confirmar nave montada |
| Servicios | 8–12 s | Mostrar brazos móviles |
| Ignición | 12–18 s | Tobera y vehículo, en mismo plano |
| Despegue | 18–24 s | Ver la nave despegar sobre el campus |
| Ascenso | 24–28 s | Seguir el vehículo completo |
| Auxiliares | 28–32 s | Desacople lateral visible |
| Cofia | 32–35 s | Mostrar las dos mitades separarse |
| Central | 35–38 s | Caída de etapa principal |
| ODYSSEY | 38–45 s | Liberación y toma final de nave |

El sistema usa los clips de Blender originales; cada clip de los cuatro
mecanismos incluye una pose inicial que preserva las separaciones previas.

## Interfaces
`LaunchCinematicOverlay` es la única UI para todo el lanzamiento, también en
el visor de prueba y el antiguo panel de campaña. No incorporar tarjetas de
datos superpuestas, telemetrías ficticias o un segundo HUD que tape el cohete.

## Entrega para guionistas de Luna y Marte
`src/game/missionArrival.ts` exporta `makeMissionArrival(key, objective, world)`.
El parámetro `world` debe venir del **escenario de misión**, nunca inferirse
de si se eligió una cámara o un espectrómetro (ambos pueden ir a distintos mundos).

La campaña actual es lunar: utiliza `world='moon'`, conduce al mapa lunar
existente y muestra un mensaje pequeño con «Explorar el escenario» o
«Continuar operaciones». El módulo también acepta `world='mars'` como
destino explícito de un futuro escenario marciano.

Los compañeros pueden añadir guiones y disparadores locales en los
escenarios Luna y Marte sin modificar la cinematografía ni el control de
viajes. Todavía faltan misiones de Marte integradas en la campaña.

## Validación
- `npm run format:check`
- `npm test`
- `npm run build`
- Visor: `/?preview=launch` (selector de nave y lanzador).
- Recorrido real: construir y aprobar nave en campus, vestuario,
  escaleras, elevador, pasarela, cabina, despegue y llegada.

**No declarar terminado el acabado** sin comprobar visualmente en navegador
los desacoples y el interior de cabina. El elevador y las escaleras son
geometría funcional prototipo, no el modelo de arte final.


## Integración de noviembre de 2026: atmósfera de ascenso y trabajo del equipo

- Se fusionan los cambios del `main` actualizado (mural de autores, menú, diseño de
  navegación y asistentes), manteniendo el embarque físico y las misiones existentes.
- `src/spacecraft/LaunchCloudLayers.tsx` añade tres capas de nubes dibujadas con
  geometría instanciada en alturas estilizadas de 350, 660 y 1040 metros. Se activan
  durante la ascensión y desaparecen cuando la nave deja las capas representadas.
- `CampusSky` sigue usando el cielo ilustrado del campus, pero mientras hay
  `launchClock` oscurece gradualmente la cúpula y activa las estrellas. La hora
  global de la Tierra no cambia: visualmente se representa la pérdida de
  dispersión atmosférica conforme se gana altura, no un anochecer instantáneo.
- También se usa la atmósfera cinematográfica en la vista previa
  `/?preview=launch`, sin construir otra ambientación.
- La bitácora de autores y los chevrons planos incorporados por el equipo
  están enlazados al mundo. El botón de prueba del menú abre el visor y **no**
  falsifica la autorización de lanzamiento del juego.
- Las nubes y altitudes forman parte de una **representación educativa**, no
  deben interpretarse como datos atmosféricos de NASA.

Todos los cambios se desarrollan en una rama de integración antes de añadirlos
a la rama principal; los guiones de misiones lunares y marcianas conservan sus
puntos de integración y podrán ampliarse por separado.
