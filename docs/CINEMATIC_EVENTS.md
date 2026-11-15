# SELENE-01 — Integración narrativa en el mismo mundo

## Estado de esta rama

Esta rama contiene un **prototipo jugable de embarque** que conecta el
campus Artemisa existente con la plataforma de lanzamiento, seguido por
una cinemática que utiliza el **mismo Canvas** de Three.js.

El propósito es que el jugador **no cambie a una escena de demostración**
para embarcar y despegar. La configuración de ODYSSEY se toma de
`useBlueprint` y su autorización de `missionVerified`.

## Experiencia prevista

1. Crear y verificar ODYSSEY en las estaciones existentes.
2. Llegar a la plataforma LC-01 en el campus.
3. Acceder a un recorrido peatonal señalizado junto al cohete.
4. Pulsar `E` en el ascensor y ascender con el mismo personaje.
5. Caminar por la pasarela elevada hasta la escotilla.
6. Pulsar `E` para entrar a la cabina y confirmar el despegue.
7. Ver el despegue **en el mismo campus**: retirada de servicios,
   ignición, ascenso, etapas y liberación de ODYSSEY.
8. Continuar con operaciones sin repetir ni duplicar la sesión.

Los elementos UI específicos del vuelo se limitan a subtítulos
breves, cuenta regresiva (cuando corresponda) y botón para omitir.

## Archivos clave

- `src/world/WorldExperience.tsx`: máquina de fases de embarque y flujo.
- `src/world/player/PlayerRig.tsx`: desplazamiento del jugador y entrada.
- `src/world/ExplorerScene.tsx`: misma escena 3D; cámara cinematográfica.
- `src/world/Environment.tsx`: hangar, plataforma y pasarela compartidos.
- `src/spacecraft/boardingRoute.ts`: recorrido y zonas de interacción.
- `src/spacecraft/BoardingAccess.tsx`: ascensor y pasarela 3D.
- `src/spacecraft/LaunchCinematicDirector.tsx`: planos de cámara.
- `src/spacecraft/launchTimeline.ts`: secuencia e hitos sincronizados.
- `src/spacecraft/LaunchCinematicOverlay.tsx`: subtítulos mínimos.

## Pruebas y límites conocidos

- `npm test`, `npm run format:check`, `npm run build`.
- La escena principal carga en Chromium automatizado sin errores JS.
- Las pruebas de colisiones validan el acceso terrestre a LC-01.

**No está cerrada la revisión visual del embarque completo**: hay que
comprobar cámara, escala de la pasarela, colocación de la escotilla y la
transición de la cabina a todos los planos de vuelo en un navegador
interactivo. El ascensor y la pasarela son geometrías funcionales
provisionales, pendientes de pulido artístico y animaciones del personaje.
No se ha implementado aún un interior de cabina completo con controles
3D manipulables ni sonido final de la misión.

**AURORA-S y ATLAS-T comparten de momento el mismo modelo visual** de
lanzador; el perfil educativo puede variar, pero no debe sugerirse una
simulación física validada de vehículos reales. Toda altitud presentada
es ilustrativa y los procedimientos de separación están inspirados en
NASA, no son la cronología real de Artemis.

No fusionar automáticamente a `main` sin verificar la interacción
completa y coordinar con la otra rama de trabajo del equipo.
