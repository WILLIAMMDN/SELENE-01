# SELENE-01 · Eventos narrativos dentro del mundo 3D

## Principio central

El jugador **no debe ver otra página, otro escenario o un video separado**
al despegar. Tras aprobar el diseño, camina por el campus Artemisa
en el mismo `Canvas` de `ExplorerScene` y con su mismo avatar.

## Recorrido jugable

1. Laboratorio: la Dra. Vega plantea un encargo científico.
2. Hangar: el jugador ensambla ODYSSEY, elige instrumentos y lanzador.
3. Comunicaciones: se verifican las restricciones educativas.
4. Plataforma: la carga útil aprobada aparece en LC-01, y deja de estar
   duplicada en el hangar. El transporte todavía es una transición de
   estado, no un traslado animado.
5. El jugador camina desde el puesto LC-01 por el corredor pavimentado
   hacia el ascensor lateral. **Se siguen aplicando colisiones de equipos**.
6. Cerca del ascensor, `E` permite subir. La cabina sube durante siete
   segundos, con el personaje visible y cámara de seguimiento.
7. El jugador **camina con sus propios controles** por la pasarela
   elevada y se acerca a la escotilla del orbitador.
8. `E` entra en la vista de cabina. Se solicita una única confirmación:
   «Iniciar despegue».
9. El lanzamiento de 45 s muestra la plataforma, ignición, ascenso,
   separación de auxiliares, cofia, etapa central y liberación de ODYSSEY.
   La cámara cambia de plano **dentro del mismo mundo 3D**.
10. Termina el vuelo simulado y se abre la fase existente de decisiones
    orbitales. Omitir/Esc utiliza la misma transición persistida.

La cabina de mando es un componente obligatorio en ambos montajes. Por ello
el jugador puede embarcar tanto en la versión compacta como en la versión
con hábitat. El diálogo contextual reconoce la configuración elegida.

## Arquitectura

| Archivo | Responsabilidad |
| --- | --- |
| `world/WorldExperience.tsx` | Estado del embarque y transición a operaciones |
| `world/ExplorerScene.tsx` | Único Canvas del campus y director cinemático |
| `world/player/PlayerRig.tsx` | Avatar, colisiones, ascensor, pasarela y cabina |
| `spacecraft/boardingRoute.ts` | Coordenadas y zonas de interacción |
| `spacecraft/BoardingAccess.tsx` | Estructura 3D del corredor, ascensor y pasarela |
| `spacecraft/launchTimeline.ts` | Guion temporal y diálogos TARS / Dra. Vega |
| `spacecraft/LaunchCinematicDirector.tsx` | Encuadres y seguimiento del vehículo |
| `spacecraft/LaunchCinematicOverlay.tsx` | Subtítulo discreto, contador y omisión |
| `spacecraft/LaunchComplex.tsx` | Modelo de lanzamiento y clips GLB originales |

El lanzamiento incluye una altitud **ilustrativa**. ODYSSEY y los lanzadores
AURORA-S y ATLAS-T son ficticios; esta secuencia **no reproduce un vuelo NASA**
ni calcula una trayectoria certificada.

## Dirección de interfaz

- Durante la exploración se respeta el HUD existente.
- Al ascender o cruzar la pasarela se muestra **una sola instrucción corta**.
- En la cabina aparece únicamente «Iniciar despegue».
- Durante el despegue solo hay subtítulos, cuenta regresiva y «Omitir».
- No mostrar fichas de ingeniería, paneles de telemetría simulada, porcentajes
  decorativos ni menús superpuestos al vehículo.

## Validación y límites

- El proyecto mantiene las pruebas de misión y colisiones; existe una
  prueba específica que recorre las coordenadas del acceso a LC-01.
- La integración visual inicial carga el mundo con un único Canvas sin
  errores de JavaScript y permite activar el acceso desde una misión verificada.
- Antes de fusionar, hay que revisar el último tramo de movimiento a la
  escotilla y las cámaras del ascenso en un navegador con aceleración 3D real.
- El modelo no incluye todavía un interior de cabina completamente visitable
  ni una animación física de transporte de la nave desde el hangar.
- La infraestructura permite nuevas cinemáticas contextualizadas,
  pero no se afirma que esas escenas adicionales ya estén implementadas.
