# Equipo de seis — responsabilidades

**Seis desarrolladores** no significa seis jugadores simultáneos. El modo cooperativo de hasta cuatro jugadores es una fase futura.

| Integrante | Especialidad | Entregable verificable | Área inicial |
|---|---|---|---|
| 1 · Coordinador de mundos (propietario del repositorio) | Diseño de niveles, composición, iluminación, integración WebGL | Campus explorable, escena de laboratorio, integración de GLB y revisión de PR | src/scene, docs |
| 2 · Artista de entornos | Modelado Blender de edificios, caminos, árboles, hangar, laboratorio | Kit modular GLB optimizado con licencias y renders | assets/entornos |
| 3 · Artista de personajes | Protagonista, NPC y TARS; rig, animaciones y expresiones | GLB con animaciones Idle, Walk, Run, Talk, Scan y control de escala | assets/personajes |
| 4 · Programador de gameplay | Controles, cámara, colisiones, interacción, misiones | Navegación, disparadores de estaciones y transiciones | src/scene, src/game |
| 5 · Responsable de simulación científica | Configurador de orbitador, lanzadores, órbitas, eventos | Motor puro, pruebas y fuentes de reglas | src/game, docs/SCIENCE.md |
| 6 · Narrativa, interfaz y robot TARS | Escritura, diálogos, onboarding, UX/UI, robot y citación | Guion completo, HUD y TARS; QA de experiencia | src/robot, src/App.tsx |

Cada integrante participa en pruebas y revisión de calidad; el líder integra. Los nombres de GitHub se asignan cuando los cinco compañeros acepten la invitación.

## Ritmo de trabajo
Todos publican entregables a través de issues y ramas propias. Daily breve: bloqueo, avance y siguiente paso. Revisión visual con capturas, revisión funcional con pruebas. No aceptar assets no licenciados ni código no verificado.

## Definition of Done
- Issue y criterios de aceptación completos.
- Arte: fuente, licencia, escala, pivotes, rendimiento y captura de prueba.
- Código: build + tests y revisión de otra persona.
- Ciencia: distinción entre hechos NASA y parámetros de ficción.
- Narrativa: legibilidad y consistencia con la historia de SELENE-01.

## Accesos
En GitHub: Settings → Collaborators → Add people. Invitar a las cinco cuentas como colaboradores; no compartir contraseñas. Después habilitar Settings → Rules → Rulesets con PR obligatorio, mínimo una aprobación y sin force-push para main. En repo personal público, la disponibilidad de reglas puede depender del plan; si no se aplica, mantener el acuerdo del equipo por procedimiento.
