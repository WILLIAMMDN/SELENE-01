# Arquitectura y contratos de SELENE-01

Esta organización conserva la aplicación, los modelos, las reglas educativas y el diseño visual existentes. No introduce otro motor, backend ni sistema de estilos.

## Mapa de responsabilidades

```text
src/
  main.tsx                 Entrada de React
  App.tsx                  Composición visual del simulador
  game/
    missionDesign.ts       Reglas puras de recursos, operaciones y puntuación
    missionRules.ts        Requisitos y progresión de la campaña, sin React ni almacenamiento
    missionTypes.ts        Identificadores compartidos de estaciones
    objectives.ts          Encargos científicos y fuentes
    campaignContent.ts     Etapas y mensajes del simulador
    campusMission.ts       Acciones públicas: aceptar, revisar, registrar y reiniciar
    hooks/
      useMissionController.ts  Estado de pantalla y coordinación de acciones
    state/
      blueprintStore.ts    Diseño compartido, validación y lectura de guardados anteriores
      missionStore.ts      Objetivo, revisión y resultado
      operationStore.ts    Reanudación del vuelo vinculada a la configuración
    narrative/
      conversations.ts     Selección del diálogo según el progreso
  ui/
    campaign/              Pantallas de historia, diseño, lanzamiento, operaciones e informe
    world/                 Mapa, iconos, cuaderno y presentación de diálogos
  world/
    WorldExperience.tsx    Orquestación de exploración, paneles y entrada a campaña
    ExplorerScene.tsx     Canvas, luces, carga y manejo de error de la escena
    player/                Personaje, cámara de seguimiento y contratos de exploración
    controls/keyboard.ts   Teclado compartido, foco y limpieza de teclas
    characterMotion.ts     Movimiento y estados de animación existentes
    ...                    Entorno, interiores, terreno, fauna y navegación
  scene/GameWorld.tsx      Vistas 3D del simulador, reutilizando movimiento y teclado
  spacecraft/             Ensamblaje, modelos ODYSSEY, plataforma y cápsula
  robot/                  TARS del campus, ayuda del simulador y fuentes NASA
  shared/persistence/     Almacenamiento tolerante a fallos, sin reglas del juego
```

`public/models/` conserva todos los modelos activos y sus README. `tools/` conserva los exportadores Blender. CSS, materiales, geometría, posición de los elementos y textos visibles no se rediseñaron.

## Dirección de las dependencias

Las pantallas llaman al controlador o a las acciones de `campusMission.ts`. El controlador utiliza las reglas y los almacenes; las reglas no importan componentes ni leen el navegador. La persistencia no conoce misiones, modelos ni interfaz. `assembly.ts` contiene las reglas existentes del ensamblaje, compartidas por validación y visualización.

Los componentes de `ui/campaign/` reciben el controlador y representan la interfaz existente. Las decisiones de lanzamiento, guardado y reinicio pertenecen al controlador, no a los manejadores JSX. `WorldNotebook` presenta las herramientas del mundo; `WorldExperience` decide qué panel, mundo o campaña abrir.

`GameWorld` y `PlayerRig` conservan sus cámaras y encuadres distintos. Ambos comparten `characterMotion` y `bindCharacterKeyboard`; no duplicar la gestión de teclas, foco, repetición y liberación. El vocabulario de animaciones del controlador se conserva para no alterar las transiciones del personaje actual.

## Estado y guardado

Los almacenes se inicializan al primer acceso y mantienen una única instantánea en memoria. React se suscribe a esa instantánea; no se vuelve a leer localStorage en cada render. Actualizar objetos y arrays mediante las acciones; no mutar lo devuelto por un almacén.

Se conservan las claves anteriores:

| Clave | Contenido |
| --- | --- |
| `selene-odyssey-blueprint-v1` | Diseño y piezas; conserva lectura de la versión antigua en sessionStorage |
| `selene-campus-mission-v1` | Objetivo, firma de revisión y resultado |
| `selene-operations-v1` | Nueva instantánea de operaciones, asociada a la firma del diseño |

Las escrituras actualizan la memoria antes de intentar persistir. Si el navegador bloquea almacenamiento, las estaciones comparten el diseño durante la sesión; cerrar o recargar en ese caso no puede conservarlo. Los datos inválidos se descartan mediante decodificadores. Cambiar un formato incompatible requiere migración o una nueva versión de clave; no cambiar las claves actuales por motivos cosméticos.

Al regresar al puesto de lanzamiento con el mismo objetivo, diseño y revisión, se recuperan las operaciones guardadas. Cambiar el diseño, elegir otro objetivo, volver a revisar o reiniciar limpia o invalida el vuelo anterior. No se autoriza un lanzamiento solo porque exista una instantánea guardada.

Preferencias de interfaz y los cuadernos de TARS mantienen sus claves anteriores. La persistencia sigue siendo local: no hay cuentas, sincronización entre pestañas ni multijugador.

## Reglas de colaboración

- Modificar reglas de recursos en `missionDesign`; requisitos de campaña en `missionRules`; transiciones de pantalla en `useMissionController`.
- Cambiar textos narrativos en `objectives`, `campaignContent` o `narrative/conversations`; presentación en `ui/`.
- Mantener la lógica de cámara y 3D en `world/player`, `world` y `scene`; no trasladarla a los almacenes.
- Preservar las clases CSS y la estructura del HTML al extraer componentes. Un cambio visual debe ser una tarea explícita.
- No mover todos los modelos o renombrar sus rutas para reorganizar TypeScript; los GLB tienen consumidores y manifiestos.
- Evitar gestores globales adicionales: el mecanismo existente de suscripciones cubre el estado local actual.
- Formatear con `npm run format`, comprobar con `npm run format:check`, ejecutar `npm test` y `npm run build`.

## Validación y límites

Las pruebas cubren recursos, consultas NASA, navegación, flujo de objetivo a informe, invalidación de revisión, guardados existentes, almacenamiento bloqueado, recuperación de operaciones y teclado compartido. No sustituyen una revisión visual ni una prueba completa de interacción WebGL.

La carga inicial ahora espera el montaje del contenido principal de la escena, no solo la creación de Canvas. Los recursos con límites de carga propios mantienen sus alternativas existentes. No se midió FPS ni se cambió el presupuesto gráfico en esta reorganización.

El bundle principal sigue necesitando una futura evaluación de carga y rendimiento. Los eventos ambientales actuales y el estado de ocupación de la escena siguen limitados a un mundo visible; no deben utilizarse como base de una implementación multijugador sin revisar ese contrato.
