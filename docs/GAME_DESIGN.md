# Game Design Document — SELENE-01

## Premisa y público
Juego 3D de aventura y simulación de ingeniería, para adolescentes y estudiantes universitarios iniciales. Narrativa cálida, exploración en tercera persona y un sistema de decisiones verificables. En una campaña ficticia, la protagonista es reclutada para construir un orbitador lunar.

**Problema educativo:** los componentes de una misión se aprenden por separado. Las decisiones reales entre instrumentos, presupuesto, masa, potencia, órbita, comunicaciones, datos y vida útil son difíciles de experimentar en clases tradicionales.

**Objetivo de aprendizaje:** tomar decisiones integradas y explicar por qué mejoran o empeoran la viabilidad y los objetivos científicos.

## Historia canónica
Cap. 1 — La convocatoria: el jugador llega al campus. Dra. Vega ofrece tres preguntas científicas lunares vinculadas a cámara, espectrómetro y radar. TARS se incorpora como guía científica, no como piloto automático.

Cap. 2 — El hangar: el equipo define objetivos, selecciona instrumentos (cámara, espectrómetro, radar), subsistemas de energía y antena, lanzador y órbita. Un panel muestra los efectos cruzados en tiempo real.

Cap. 3 — Cuenta regresiva: el jugador valida el presupuesto, la masa del vehículo, la potencia disponible y los datos transmisibles. Los diseños incompatibles requieren corregirse.

Cap. 4 — Órbita y primera observación: decisiones de ciencia vs. consumo de batería y memoria.

Cap. 5 — Ventana de comunicación y eclipse: elegir entre transmitir, investigar o conservar recursos. No existe una única solución óptima.

Cap. 6 — Informe: explicación de aciertos y errores, datos enviados, rendimiento estimado y opción de repetir con otro diseño.

## Localizaciones
Campus explorable; centro de investigación; hangar de ensamblaje; plataforma de lanzamiento; centro de control; escena orbital. Los ambientes se conectarán mediante escenas con carga progresiva.

## Bucle principal
Recorrer → conversar → planificar → comparar recursos → validar → lanzar simulación → afrontar eventos → recibir explicación → rediseñar.

## Mecánicas
- Configuración de instrumentos, órbita y lanzador; upgrades de paneles y comunicaciones.
- Restricciones de capacidad, potencia, presupuesto y transferencia.
- Tres eventos de operación deterministas, memoria de 36 GB de simulación y batería.
- TARS explica ciencia con enlaces verificables y expresa incertidumbre cuando una pregunta no está cubierta.
- Puntuación educativa y registro de decisiones.

## Aceptación del prototipo
Una historia coherente y un camino completo desde briefing a informe. Un diseño incompatible no debe lanzarse; el feedback explica el porqué; el diseño puede reintentarse. El jugador diferencia parámetros ficticios de hechos NASA y puede abrir fuentes.

## Ampliaciones no implementadas
Multijugador colaborativo hasta cuatro participantes; campañas adicionales, terrenos científicos importados, efectos de eventos probabilísticos, perfiles de dificultad, simulación orbital de mayor rigor, estudio pedagógico antes/después.
