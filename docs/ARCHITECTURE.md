# Arquitectura y contratos

## Capas
- src/scene/GameWorld.tsx: Canvas WebGL, campus, orbitador, avatar y robot provisional. Controles de movimiento y estaciones.
- src/App.tsx: lógica de navegación por la historia y componentes React de UI.
- src/game/missionDesign.ts: función pura evaluateDesign; operaciones puras startOperations/applyOperation; missionScore. Sin dependencias gráficas.
- src/robot/nasaKnowledge.ts: fichas curatoriales y recuperación por palabras; no inteligencia artificial generativa.
- src/robot/nasaMedia.ts: búsqueda NASA Image and Video Library; se usa sólo al solicitarla.
- src/robot/Orbi.tsx: UI, fuentes y búsquedas.
- docs/: contrato de producto y ciencia.
- public/models/: assets GLB finales futuros con manifiesto de derechos y procedencia.

## Ciclo de datos
Input de jugador → evaluación pura → indicadores de límites y warnings → autorización de lanzamiento → selección de eventos → informe.

ORBI: pregunta → búsqueda determinista en biblioteca curada → respuesta con enlace NASA o mensaje sin resultados. Para material en vivo, hace consulta a imágenes NASA en el navegador; no interpreta imágenes ni consulta telemetría de una misión operativa.

## Seguridad
- Sin secretos ni tokens en frontend. No enviar claves de modelos generativos al navegador.
- Links externos con noopener/noreferrer.
- Parametrización limitada de consultas públicas; no procesar HTML arbitrario recibido de APIs.
- Si se agrega un backend/LLM, usar allowlist de dominios NASA, citas por fragmento, análisis de prompt injection y límites de gasto.
- No registrar datos personales de estudiantes en esta versión.

## Ingeniería de calidad
npm test y npm run build obligatorios en PR. Los módulos de ciencia son deterministas, con pruebas de contornos. Comprobar WebGL en navegador real, accesibilidad, memoria y FPS. La rama main estará protegida cuando el propietario habilite Rulesets.
