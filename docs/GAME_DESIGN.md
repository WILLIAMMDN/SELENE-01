# Documento de diseño del juego — SELENE-01

## 1. Premisa
**Género:** simulación educativa, aventura narrativa y gestión de recursos. **Público:** estudiantes de nivel escolar (adaptable según pruebas con docentes). **Plataforma:** navegador web de escritorio y móvil. **Modo inicial:** individual, con colaboración de seis integrantes *desarrolladores* (no seis jugadores simultáneos).

**Pregunta central:** ¿qué decisiones permiten mantener una pequeña base lunar habitable cuando los recursos son limitados?

## 2. Historia general
Año ficticio próximo al establecimiento de una base lunar. La misión de entrenamiento **SELENE-01** te pone al mando de la estación **Artemisa**, un puesto científico en las proximidades del polo sur lunar. La tripulación acaba de aterrizar, la comunicación con la Tierra tiene demoras operativas y cada sistema depende de otros. Un mensaje de Control de Misión explica que no ganará quien acumule un solo recurso, sino quien mantenga el equilibrio.

**Acto I — Llegada (sol 1):** activar la estación, orientar paneles y asegurar energía.

**Acto II — Vida cotidiana (sol 2):** solucionar una pérdida de agua y comprender el reciclaje.

**Acto III — Emergencia (sol 3):** responder a un evento de radiación solar y proteger al personal.

**Acto IV — Autosuficiencia (sol 4):** sostener el cultivo de alimentos, controlar nutrientes y distribución de recursos.

**Acto V — Legado (sol 5):** tomar la última decisión y transmitir el reporte a la Tierra.

El entrenamiento actual presenta estos actos como cinco eventos cortos. **Futuro:** escenas de diálogo, misiones explorables, diario científico, personajes y cinemáticas.

## 3. Bucle de jugabilidad
Observar la base 3D → leer evento → comparar tres opciones → decidir → recibir explicación y cambios de recursos → avanzar un sol → evaluar condición de victoria o derrota.

**Victoria:** cinco soles completados y todos los índices de recursos por encima de cero. **Derrota:** cualquier índice crítico llega a cero tras el consumo diario. Hay reinicio inmediato, sin castigo permanente.

## 4. Sistemas
- Energía: alimenta soporte vital, equipos, movilidad e iluminación.
- Oxígeno: representa disponibilidad del sistema de soporte vital.
- Agua: consumo y circuito de reciclaje.
- Alimentos: reservas y producción controlada.
- Integridad: índice agregado de seguridad y estado de las instalaciones.

Los cinco índices son una **abstracción pedagógica de 0–100**. No se presentan como medidas reales de kWh, kg u horas de oxígeno.

## 5. Experiencia visual deseada
Aventura de ciencia ficción amigable y educativa: personaje astronauta de silueta clara; módulos blancos, beige y azul; acentos naranja para acciones importantes; polvo lunar gris; siluetas limpias, cel shading ligero, sombras suaves y cámaras amplias. Evitar copiar franquicias o usar insignias oficiales sin permiso. Ver `ART_DIRECTION.md`.

## 6. Pantallas planificadas
1. Inicio e introducción cinematográfica breve.
2. Vista explorable de la estación lunar + HUD (prototipo implementado).
3. Diálogos de tripulación y consola de misiones.
4. Mapa/sectores: hábitat, invernadero, energía, laboratorio y comunicaciones.
5. Bitácora con conceptos aprendidos y progreso.
6. Resultados, informe de misión y opción de repetir.

## 7. Experiencia de aprendizaje y evaluación
Cada decisión enseña una relación causal entre sistemas; el mensaje de feedback explica el razonamiento. Para una versión evaluable, se propone pretest/postest breve, preguntas de transferencia y telemetría **anonimizada y con consentimiento**, no necesaria para el prototipo.

## 8. Criterios de aceptación del MVP
- Escenario lunar 3D se renderiza y permite girar la cámara.
- Recursos comienzan con valores reproducibles.
- Un evento ofrece tres decisiones distintas.
- Una sola decisión por sol.
- Una explicación clara tras la decisión.
- El consumo se aplica al avanzar.
- Se puede ganar o perder y volver a iniciar.
- El sitio se compila sin backend.
