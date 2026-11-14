# SELENE-01 — Arquitectos del espacio

**NASA Space Apps Challenge 2026 | Space Mission Design Game**

SELENE-01 es un videojuego educativo independiente, para navegador, que enseña a diseñar, gestionar y simular **una misión espacial completa**. No es un juego de supervivencia de una base lunar ni un proyecto oficial de NASA.

## Problema

Aprender piezas aisladas de ingeniería aeroespacial no equivale a comprender cómo funcionan juntas. Una mejora en un instrumento puede incrementar simultáneamente el valor científico, la masa, la potencia, los datos generados y el costo.

## Historia

Un estudiante llega al centro espacial SELENE y recibe de la Dra. Vega una misión: diseñar un **orbitador científico para estudiar el polo sur lunar**. Recorre el campus 3D y conversa con **ORBI**, un robot original que explica ciencia con referencias NASA y no decide por el jugador. La campaña cubre investigación, diseño, validación de lanzador y órbita, lanzamiento simulado, operaciones y un informe final. Se puede rediseñar y repetir.

## Estado real del software

- Implementado en la rama de evolución: escena 3D de campus explorado con WASD y E, prototipos visuales de jugador y ORBI, selección de instrumentos, órbita y lanzador, validación de masa, energía, datos y presupuesto, tres eventos de operaciones y un informe con puntuación; fuentes y búsqueda NASA Images en el robot.
- Provisional: modelos y escenarios hechos con geometrías por código, no assets Blender finales; resultados **hipotéticos de enseñanza**.
- Pendiente: rig y animación definitivos, materiales de calidad final, colisiones avanzadas, campaña extensa, multijugador real, cálculo orbital de alta fidelidad, pruebas con estudiantes y despliegue público.
- Los **seis integrantes** son desarrolladores. El cooperativo **hasta cuatro jugadores**, sugerido en el reto, es una ampliación futura.

## Tecnologías

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Vitest. Los modelos se crearán en Blender y exportarán a GLB. No hace falta backend ni clave API para las fichas offline de ORBI. Las búsquedas opcionales consultan NASA Images.

## Desarrollo

Requisitos: Node.js 22 actualizado y npm.

    git clone https://github.com/WILLIAMMDN/SELENE-01.git
    cd SELENE-01
    npm install
    npm run dev
    npm test
    npm run build

Abrir la dirección local que muestra Vite. Mover al personaje con WASD o flechas; E interactúa cerca de edificios. Se puede recorrer el flujo completo desde la navegación por etapas.

## Equipo

Consulta docs/TEAM.md y CONTRIBUTING.md. No introducir código, arte ni archivos ajenos sin revisión del origen, licencia, atribución y aprobación mediante Pull Request.

## Documentos

- docs/GAME_DESIGN.md — argumento y experiencia.
- docs/SCIENCE.md — reglas, supuestos y validación.
- docs/ARCHITECTURE.md — módulos, estado y APIs.
- docs/ART_DIRECTION.md — estilo visual 3D y estándar de assets.
- docs/ASSET_PIPELINE.md — exportación Blender/GLB.
- docs/ORBI_NASA.md — funcionamiento y fuentes del robot.
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
