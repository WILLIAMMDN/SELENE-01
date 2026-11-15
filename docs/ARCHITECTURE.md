# Arquitectura y contratos

## Capas activas

- `src/main.tsx` inicia `src/world/WorldExperience.tsx`: exploración, HUD, mapa y estaciones.
- `src/world/ExplorerScene.tsx`: personaje, cámara, desplazamiento y compañero TARS.
- `src/world/campusLayout.ts`, `buildingNavigation.ts` y `environmentLayout.ts`: edificios, accesos, colisiones y elementos ambientales.
- `src/world/StoryDialogue.tsx` y `MissionStation.tsx`: conversaciones, objetivos y actividades.
- `src/App.tsx` y `src/scene/GameWorld.tsx`: configurador de misión, ensamblaje, lanzamiento y operaciones abiertos desde el campus.
- `src/game/campusMission.ts`: objetivo, revisión vinculada al diseño y resultado persistente.
- `src/game/missionDesign.ts`: evaluación pura, operaciones y puntuación educativa.
- `src/spacecraft/`: módulos ODYSSEY, plataforma y cápsula de descenso.
- `src/robot/TarsAssistant.tsx` y `TarsCompanion.tsx`: ayuda contextual, cuatro cuadernos locales y modelo acompañante.
- `src/robot/Orbi.tsx`: nombre histórico del componente de ayuda que todavía utiliza App; su interfaz presenta TARS. No eliminarlo sin actualizar ese import.
- `src/robot/nasaKnowledge.ts` y `nasaMedia.ts`: fichas curadas y consultas opcionales a NASA Images.
- `public/models/`: GLB integrados, manifiestos y procedencia; `tools/`: exportadores Blender.

## Ciclo de datos

Objetivo → configuración → evaluación de recursos → revisión de la configuración exacta → autorización → operaciones → informe. Cambiar piezas o parámetros invalida la revisión. El progreso se guarda en localStorage; los cuadernos de TARS usan sessionStorage. No hay backend ni sincronización multijugador.

TARS recupera fichas mediante palabras clave y muestra fuentes. No es un modelo generativo ni consulta telemetría real. La búsqueda de imágenes es opcional.

## Calidad y seguridad

No incluir secretos en el frontend. Ejecutar `npm test` y `npm run build` antes de integrar cambios; CI usa `npm ci` y Node 22. La revisión visual, accesibilidad, memoria y FPS se comprueban en navegador por el equipo. GitHub conserva los cambios por commits; las reglas efectivas de protección dependen de los Rulesets configurados por el propietario.
