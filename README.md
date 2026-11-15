# SELENE-01 — Arquitectos del espacio

**NASA Space Apps Challenge 2026 | Space Mission Design Game**

SELENE-01 es un videojuego educativo independiente, para navegador, que enseña a diseñar, gestionar y simular **una misión espacial completa**. No es un juego de supervivencia de una base lunar ni un proyecto oficial de NASA.

## Problema

Aprender piezas aisladas de ingeniería aeroespacial no equivale a comprender cómo funcionan juntas. Una mejora en un instrumento puede incrementar simultáneamente el valor científico, la masa, la potencia, los datos generados y el costo.

## Historia

Un estudiante llega al centro espacial SELENE y recibe de la Dra. Vega una misión: diseñar un **orbitador científico para estudiar el polo sur lunar**. Recorre el campus 3D y conversa con **TARS**, el acompañante del equipo que explica ciencia con referencias NASA y no decide por el jugador. La campaña cubre investigación, diseño, validación de lanzador y órbita, lanzamiento simulado, operaciones y un informe final. Se puede rediseñar y repetir.

## Estado real del software

- Implementado: escena 3D de campus explorado con WASD y E, exploradora Quaternius en Tierra, astronauta en Marte y TARS01, selección de instrumentos, órbita y lanzador, validación de masa, energía, datos y presupuesto, tres eventos de operaciones y un informe con puntuación; fuentes y búsqueda NASA Images en el robot.
- Assets integrados: exploradora Quaternius (CC0), TARS01, ODYSSEY final con ensamblaje modular, ROBER con cinco animaciones y control remoto, tres variantes animadas del árbol Anime Tree, incluidas con autorización expresa de su creador y diez módulos BASEPRI, con puertas automáticas, suelo interior, rampas y colisiones; plataforma y lanzador de Juego NASA.rar con cinco mecanismos animados. Tierra tiene suelo, caminos, vegetación y cielo con tratamiento ilustrado. Los escenarios combinan estos GLB con geometría ilustrada por código; los resultados son **hipotéticos de enseñanza**.
- Pendiente: revisión artística de animaciones y materiales, colisiones avanzadas, campaña extensa, multijugador real, cálculo orbital de alta fidelidad, pruebas con estudiantes y despliegue público.
- Los **seis integrantes** son desarrolladores. El cooperativo **hasta cuatro jugadores**, sugerido en el reto, es una ampliación futura.

## Tecnologías

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Vitest. Los modelos se integran desde Blender mediante GLB. No hace falta backend ni clave API para las fichas locales de TARS. Las búsquedas opcionales consultan NASA Images.

## Desarrollo

Requisitos: Node.js 22.12 o posterior de la rama 22 y npm.

La versión compartida del juego está en `main`. Consulta [la guía del equipo](docs/COLLABORATION.md) para trabajar en ella.

    git clone https://github.com/WILLIAMMDN/SELENE-01.git
    cd SELENE-01
    npm ci
    npm run dev
    npm run format:check
    npm test
    npm run build

Abrir la dirección local que muestra Vite. Mover al personaje con WASD o flechas; E interactúa al llegar a las mesas y consolas interiores. La campaña del campus requiere aceptar un objetivo, diseñar ODYSSEY, registrar la revisión en comunicaciones y autorizar desde la plataforma.

## Equipo

Consulta docs/TEAM.md y CONTRIBUTING.md. No introducir código, arte ni archivos ajenos sin revisión del origen, licencia, atribución y aprobación mediante Pull Request.

## Actualización de recursos

Abrir `?world=earth` para Tierra o `?world=mars` para Marte. ROBER está junto al taller: pulsa su rótulo para abrir el control remoto. La exploradora de Quaternius conserva su versión clásica y dispone de vestuario ampliado; Ellis sigue retirado. Shift corre, Espacio salta y Ctrl funciona junto a los bancos. El objetivo y el diseño se guardan en este navegador. Ver `docs/WORLD_DELIVERY.md` y los README de `public/models` para procedencia, controles y alcance.

## Documentos

- docs/GAME_DESIGN.md — argumento y experiencia.
- docs/SCIENCE.md — reglas, supuestos y validación.
- docs/NASA_MISSION_TRACEABILITY.md — hechos NASA, aplicación en la campaña y límites de la simulación.
- docs/ARCHITECTURE.md — módulos, estado y APIs.
- docs/ART_DIRECTION.md — estilo visual 3D y estándar de assets.
- docs/ASSET_PIPELINE.md — exportación Blender/GLB.
- docs/TARS_NASA.md — funcionamiento y fuentes del robot.
- docs/ROADMAP.md — fases y criterios de entrega.
- docs/TEAM.md — reparto y responsabilidades.
- docs/CHALLENGE_ALIGNMENT.md — correspondencia con el reto.

## Fuentes y repositorios auténticos

- [NASA Moon Facts](https://science.nasa.gov/moon/facts/)
- [NASA Moon Water and Ices](https://science.nasa.gov/moon/moon-water-and-ices/)
- [NASA 3D Resources](https://science.nasa.gov/3d-resources/)
- [Repositorio NASA 3D](https://github.com/nasa/NASA-3D-Resources)
- [NASA Image and Video Library API](https://api.nasa.gov/)
- [Three.js](https://github.com/mrdoob/three.js)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)
- [NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)

**Aviso:** obra estudiantil independiente, sin afiliación ni aval de NASA. Los símbolos oficiales, logotipos, imágenes y modelos están sujetos a sus condiciones de uso. No hay licencia de redistribución del código del equipo definida todavía: se acordará antes de crear LICENSE.

## Estaciones e integración NASA — 14 de noviembre de 2026

1. Investigación: entra al laboratorio, acércate a la mesa y pulsa E; acepta un encargo.
2. Ingeniería: entra por el portón del hangar (o por el taller); ensambla y configura ODYSSEY. Guarda y vuelve al campus.
3. Comunicaciones: utiliza la terminal interior para revisar los recursos y registrar la configuración. Cambiar el diseño exige otra revisión.
4. Lanzamiento: utiliza el puesto exterior. Puedes demostrar los mecanismos del lanzador; autoriza para continuar con tres decisiones de operaciones.
5. Mirador: consulta el resultado guardado y prepara otro encargo.

El mapa y TARS indican el siguiente paso; viajar a una entrada no completa su actividad. Las puertas se abren por proximidad y las cubiertas se ocultan al entrar. Los caminos forman parte del material del terreno, sin capas coplanares superpuestas.

Fuentes, medidas, procedencia y límites: [integración NASA](docs/NASA_INTEGRATION.md). La preparación para GitHub ejecuta las pruebas existentes y la compilación; no incluye revisión visual ni capturas.

## Fauna, entorno y narrativa ilustrada

Ocho animales animados de `animales.blend` habitan la costa occidental de Artemisa; el mapa ofrece acceso al sendero. Se incorporan las quince piezas de `ELEMENTOS ENTORNO.glb`: vehículos estáticos, estacionamientos, mobiliario, vegetación y montañas. ROBER conserva su control remoto.

La interfaz muestra un objetivo breve y botones pequeños. E abre conversaciones de papel en las estaciones; M abre el mapa, J la bitácora y Escape el menú. La primera llegada presenta el encargo; los detalles aparecen bajo demanda. La misión permite elegir 30, 90 o 180 días y explica las consecuencias al terminar. Los caminos tienen bordes reconstruidos en el shader y pasto con hojas y tonos variados.

Documentación vigente: [narrativa e interfaz](docs/NARRATIVE_AND_INTERFACE.md). La revisión visual de esta entrega queda a cargo del equipo.

La cápsula L01 de `ODYSSEY_LANDER_FINAL.rar` está integrada en el descenso de Marte y en una plataforma de entrenamiento de la Tierra. El mapa ofrece acceso; pulsa el modelo o E cerca de él para reproducir descenso y separación de ascenso. Conserva su escala original de 5 m de alto. Su demostración es independiente de la misión orbital.

## Organización para continuar

Las pantallas se agrupan en `src/ui/`; las reglas, el controlador y los almacenes de partida en `src/game/`; el renderizado y los controles en `src/world/` y `src/scene/`. Se mantienen los modelos y estilos existentes. El guardado conserva las claves anteriores y permite recuperar operaciones desde la plataforma con el mismo diseño revisado. Ver [arquitectura](docs/ARCHITECTURE.md) para responsabilidades, contratos y límites.


La campaña ofrece requisitos consultables en TARS y las estaciones, consecuencias calculadas de cada decisión de operaciones e informes vinculados al encargo elegido. Volver a revisar un diseño ya aprobado conserva su vuelo guardado. Ver [narrativa e interfaz](docs/NARRATIVE_AND_INTERFACE.md).

## Vestuario, cielo y destino lunar — 15 de noviembre de 2026

- Menú → Vestuario y gestos: uniforme formal, ropa original editada y traje EVA con casco opcional, además de los personajes clásicos. Preferencias guardadas por destino.
- Menú → Cielo y clima, en Tierra: ciclo día/noche, hora fija, lluvia y tormenta; nubes ilustradas instanciadas con modo ligero.
- Mirador: observatorio adicional con apertura, seguimiento, giro y cierre. Se mantienen la estación de informes y su acceso.
- Menú → Luna (`?world=moon`): base ODYSSEY, terreno original, módulos y corredores, despliegue de paneles de energía y cápsula L01 en su explanada. Exploración exterior, sin una segunda campaña.
- Versiones fuente v01 de nave, lanzador, plataforma y cápsula integradas en sus funciones correspondientes. El ensamblaje modular de la campaña continúa intacto.

Detalles: [integración de recursos](docs/NEW_ASSETS_2026-11-15.md). Las pruebas y la revisión visual de esta ampliación quedan a cargo del usuario por indicación expresa.

El menú de vestuario también permite elegir **Piloto**, con los mismos controles de locomoción y gestos. El **banco de herramientas**, junto al taller terrestre, ofrece ocho demostraciones originales: visita su acceso desde el mapa y pulsa E o el cofre. El cielo se amplió con cuatro siluetas de nubes, capas de profundidad y luz de horizonte, conservando modos estándar y ligero.
