# Integración de tripulación y exploración lunar — SELENE-01

## Principios de integración

Esta rama incorpora la contribución del equipo en PR #23 al mismo juego que
ya tiene embarque físico y despegue cinematográfico. **No se sustituye la
cinemática de 45 segundos** ni se crea un segundo sistema de autorización.

1. Selección inicial entre cuatro personajes; el personaje escogido se
   conserva al viajar entre la Tierra, Luna y Marte.
2. En el campus se mantiene el recorrido al vestuario EVA, escaleras,
   ascensor, pasarela y escotilla de ODYSSEY, con cámaras en la escena real.
3. Se conserva el despegue ilustrado, las animaciones GLB, las capas de
   nubes y la transición de día a oscuridad espacial.
4. El destino procede de `launchDestinationStore`, no del instrumento
   científico. En el viaje autorizado, la misma sesión se guarda una sola
   vez y se activa el entorno seleccionado.
5. En la Luna, la cámara de aterrizaje tiene prioridad mientras se reproduce;
   después vuelve al jugador con su traje EVA.
6. La base lunar utiliza sus corredores, suelos, puertas, colisiones e
   interiores originales. El rover lunar usa la misma tecla E que el buggy
   terrestre, pero los controladores se aíslan por mundo.
7. La interfaz permanece contenida: HUD mínimo de rover, indicadores discretos
   de misión y diálogos en papel claro. El mural de autores y la navegación
   del campus permanecen disponibles.
8. `/?preview=launch` sigue funcionando independientemente de la selección
   inicial y no altera la misión real.

## Responsabilidad de cada módulo

- `src/world/WorldExperience.tsx`: flujo narrativo, viaje, puesta en órbita,
  guardado, vestuario, llegada y HUD.
- `src/world/player/PlayerRig.tsx`: embarque y movimiento, colisiones,
  acciones del rover y cámara del jugador.
- `src/world/ExplorerScene.tsx`: mundo visual único; en Luna incluye
  `LunarLanding`; en Tierra incluye `LaunchCinematicDirector`,
  `LaunchCloudLayers` y la atmósfera del campus.
- `src/spacecraft/launchTimeline.ts`: único reloj de lanzamiento y desacoples.
- `src/world/lunar/LunarBase.tsx`: base transitable y puertas.
- `src/world/lunar/RoverLunar.tsx`: físicas estilizadas, velocidad y polvo.
- `src/ui/world/CharacterSelection.tsx`: pantalla de selección inicial.

## Controles y rutas a revisar

- Campus: elegir personaje, cumplir objetivo, construir y validar ODYSSEY;
  luego vestuario EVA → escaleras → ascensor → pasarela → cabina → despegar.
- Nave: `Esc` omite sin duplicar la sesión; si no se omite, al completar
  entra al mundo de destino.
- Luna: aterrizaje cinematográfico al llegar, `Esc` permite omitir;
  base y laboratorio transitables, pasar por puertas y conducir rover con
  `WASD`, `Espacio` para freno y `E` para subir/bajar.
- Visor: `/?preview=launch`, seleccionar configuración y reproducir
  repetidamente sin desmontar el Canvas principal.
- Los datos de altitud, tiempos y fuerzas siguen siendo **ilustrativos**, no
  una simulación aerodinámica ni telemetría NASA.

## Validación

Usar `npm run format:check`, `npm test`, `npm run build`.
Las pruebas de navegador deben incluir selección de personaje, mundo Tierra,
mundo Luna, aterrizaje (incluido omitir), acceso y conducción del rover,
repetición del visor y transición a operaciones.
El primer render bajo WebGL por software puede tardar bastante más que en
una GPU normal; no atribuir a red los retrasos de prueba si los archivos
terminan cargando sin HTTP 404 ni errores.
