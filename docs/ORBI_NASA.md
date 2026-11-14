# ORBI — acompañante y tutor científico

## Rol
ORBI es un robot ficticio que acompaña físicamente a la protagonista en el campus, ayuda a comprender el diseño orbital y aclara datos de astronomía. No elige por el jugador ni tiene autoridad de NASA.

## Implementado
- Representación 3D provisional que sigue al avatar en el campus.
- Panel conversacional con cinco preguntas de referencia y búsqueda sencilla basada en palabras clave.
- Respuestas seleccionadas manualmente y enlazadas a URLs oficiales de NASA.
- Búsqueda opcional de imágenes reales por NASA Images API; fallback al sitio público.
- Respuesta explícita de desconocimiento cuando no hay ficha pertinente.

**No es una IA entrenada ni un chat inteligente generativo**. No afirmar capacidad de consultar telemetría, artículos nuevos automáticamente o entender cualquier pregunta.

## Próxima versión
- Modelo y animaciones definitivos elaborados en Blender.
- Recomendaciones contextuales según los recursos del configurador.
- Catálogo NASA ampliado con citas granulares y fecha de última revisión.
- Si se implementa RAG: backend seguro, recuperación de fuentes NASA, controles de prompt injection, citas por fragmento, caché, consentimiento si hay usuarios menores y límites de costos.

## Separación de confianza
Los hechos de NASA se muestran con URL. La misión SELENE-01, personajes, capacidades de lanzadores y costos son inventados. El robot debe dejarlo claro.

Fuentes:
- https://science.nasa.gov/moon/facts/
- https://science.nasa.gov/moon/moon-water-and-ices/
- https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/
- https://api.nasa.gov/
- https://images.nasa.gov/
