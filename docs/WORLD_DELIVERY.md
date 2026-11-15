# Estado vigente: estaciones y Juego NASA.rar

La actualización vigente se describe en [NASA_INTEGRATION.md](NASA_INTEGRATION.md). Quaternius es el único personaje terrestre; Ellis está retirado. Los interiores tienen accesos, las actividades forman una secuencia y ODYSSEY ocupa la plataforma. Las notas posteriores conservan el historial de entregas y pueden describir recursos sustituidos.

# Actualización BASEPRI y ambiente ilustrado

Se incorporan diez módulos del archivo BASEPRI en Tierra y Marte, con mobiliario, cimientos, colisiones y cubierta desmontable al pulsar. Los edificios son del usuario; no se sustituyen por imitaciones de las capturas. Se mantiene el hangar grande para ODYSSEY y el SLS.

Tierra incorpora suelo con manchas orgánicas de hierba/tierra, límites dibujados, caminos con márgenes claros, grietas discretas, barandillas, equipos de servicio, rocas, hierba instanciada y hojas que caen. Cielo turquesa y nubes menta completan la paleta de referencia. Los árboles añaden copas compactas con silueta lobulada, tinta y sombras agrupadas, conservando el recurso fuente y la brisa.

El menú Personaje y movimientos permite elegir Ellis v8 o una exploradora de Quaternius. La alternativa trae siete clips y materiales adaptados; no amplía ni sustituye los 31 clips de Ellis. El salto alternativo es físico, sin un clip propio. La procedencia y el alcance están en public/models/characters/quaternius/README.md.

No se hicieron capturas, compilación ni pruebas automatizadas: la revisión visual y de ejecución queda al usuario. No se afirma una coincidencia visual perfecta con las referencias.

---

# Actualización activa — Ellis v8, ODYSSEY final, árboles y ROBER

El proyecto utiliza Ellis v8 (31 clips, solo Tierra), TARS01, los trece modelos de ODYSSEY_GLB_FINAL y ROBER con sus cinco animaciones. Se conserva la dirección Illustrated Space Adventure: materiales mates, sombreado por bandas y tinta.

ODYSSEY completa reúne 17 instancias; motor, energía, depósitos, oxígeno, cuatro RCS, paneles y antena están integrados con los acoples del manifiesto. El constructor ofrece depósitos pequeños o grandes y dependencias de ensamblaje. Escala uniforme 5/3, altura final 18,55 m; hangar de 24 m y puerta de 22 m. Ver docs/PHYSICAL_SCALE.md y public/models/odyssey/README.md.

El árbol exacto de BlenderKit se convirtió en tres variantes GLB de aproximadamente 1 MB, cada una con 4 000 hojas y brisa animada. Hay cuarenta ejemplares en Tierra, con geometrías compartidas y fases distintas. La procedencia, licencia y método están en public/models/trees/README.md.

ROBER sustituye los vehículos provisionales de Tierra y Marte. Su panel ofrece escaneo, conducción, terreno irregular, giro y perforación; usa cámara de seguimiento, controles de teclado/táctiles y colisión con obstáculos del mundo. Los clips del archivo se conectan a comportamiento de juego; no se inventan mediciones científicas. Detalles: public/models/rober/README.md.

Ellis mantiene carrera de 4,2 m/s, salto, agachado y parpadeo. Añade sentarse en bancos, pasos laterales, retroceso, giros, frenada y gestos v8 en el menú. Marte conserva su astronauta. Las acciones de recoger/abrir son gestos; todavía no modifican objetos. Detalles: public/models/characters/ellis/README.md.

No se ejecutaron capturas, compilación ni pruebas automatizadas de esta actualización por preferencia del usuario. La revisión visual queda a su cargo. El servidor local se mantiene en http://127.0.0.1:5174/?world=earth .

---

# Historial anterior a esta actualización

Las medidas y referencias a versiones antiguas que siguen son un registro histórico; la sección anterior y los README de recursos describen la versión activa.

# SELENE-01: Tierra y Marte — entrega del mundo

## Alcance

Dos escenarios 3D originales, seleccionables, construidos directamente con Three.js / React Three Fiber. La Tierra mantiene el campus Artemisa; Marte añade el sector Ares. Los personajes, TARS, edificios y vehículos son componentes sustituibles. No se utilizó Blender para esta entrega ni se modificó el archivo Blender abierto del usuario.

| Mundo | Área recorrible | Núcleo de actividades | Entorno lejano |
|---|---|---|---|
| Tierra | 240 × 240 m, 5,76 ha | Cinco destinos conectados por caminos | Colinas decorativas |
| Marte | 320 × 320 m, 10,24 ha | Laboratorio, taller, enlace, descenso y estratos | Mesetas decorativas |

Una unidad representa aproximadamente un metro. Caminar: 1,4 m/s; desplazamiento rápido: 3,2 m/s. Son velocidades elegidas para el control del juego, no una simulación biomecánica ni de marcha EVA. Desde la llegada a los destinos hay aproximadamente 36–94 m en línea recta; los caminos amplían esas distancias. La escala se eligió para actividades concentradas, no porque NASA exija determinadas dimensiones. No hay planeta infinito ni interiores explorables.

## Dirección visual

Referencia del usuario: ilustración 3D con manchas de color plano, sombras gráficas, siluetas delineadas y detalles dibujados. Se aplica sombreado de tres bandas con filtrado nearest, contorno por normales en objetos principales, marcas estáticas, terreno con manchas originales y líneas de estratos. La paleta marciana usa arena, papel, óxido y burdeos; petróleo en equipo construido. No se copian personajes ni arquitectura de la referencia. No hay vegetación terrestre exterior ni cielo turquesa en Marte.

El terreno marciano es ficticio: no es un DEM ni una reconstrucción científica de una región real. Las manchas y líneas se generan con semilla fija, evitando vibración temporal. Falta aprobación visual de Marte: la automatización del navegador dejó de estar disponible durante su implementación. La imagen de referencia es el objetivo artístico, no una promesa de igualdad exacta ya verificada.

## Uso

`npm ci`, `npm run dev`. La entrada predeterminada muestra Marte; `?world=earth` abre Tierra y `?world=mars` abre Marte. Los botones superiores cambian de mundo. WASD/flechas: caminar; Shift: correr; arrastrar: mirar; rueda: distancia de cámara; E: panel de sector cercano. En móvil hay botones de dirección. Mapa: viaje a entradas; vista aérea: órbita; recorrido: cinco encuadres con pausa. Calidad ligera y movimiento reducido están en opciones.

El contador de lugares descubiertos se conserva por mundo en almacenamiento local. La campaña conserva su diseño lunar, con botón explícito al abrirla desde Marte. No se afirma que existan ya reglas de misión marcianas. Al salir de la campaña su estado actual no se conserva.

## Relación con Space Mission Design Game

La consigna consultada describe diseñar, gestionar y simular una misión completa, con decisiones de ingeniería, recursos limitados y consecuencias. La superficie explorable es una interfaz narrativa, no el criterio central de cumplimiento.

| Tema | Espacio reservado | Estado funcional |
|---|---|---|
| Objetivos científicos | Laboratorio Ares | Información de sector; selección marciana pendiente |
| Nave, instrumentos, masa/potencia/presupuesto | Taller | Campaña lunar existente disponible; reglas marcianas pendientes |
| Comunicaciones/datos | Estación de enlace | Exterior e información; eventos marcianos pendientes |
| Llegada/operaciones | Descenso | Módulo y plataforma; animación de descenso y física pendientes |
| Observación y evaluación | Estratos | Exterior/información; resultados y muestras pendientes |

No declarar cumplimiento total del reto por disponer de estos entornos. La URL completa oficial devolvió 502 durante la consulta. Se contrastó el resumen del reto dentro del dominio oficial y la reproducción del evento local; se debe cotejar la ficha/rúbrica exacta aportada por el equipo antes de la presentación.

- Resumen en dominio oficial: https://www.spaceappschallenge.org/2026/find-a-team/missionforge/
- Ficha oficial intentada: https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/
- Reproducción del evento local: https://hackathlone.com/challenges/space-mission-design-game
- Contexto de Marte: https://science.nasa.gov/mars/facts/

## Reemplazar elementos sin rehacer el mundo

- `worldConfig.tsx`: dimensiones, entradas, etiquetas y altura de cada mundo.
- `MarsEnvironment.tsx` / `Environment.tsx`: paisajes independientes; cambiar los componentes de edificios/vehículos por GLB conservando posición, pivote y escala.
- `ExplorerScene.tsx`: personaje independiente del terreno; `TarsCompanion.tsx` carga el compañero GLB y admite hasta cuatro referencias de avatar.
- `ArtKit.tsx`: materiales y trazos compartidos. Los cargadores de TARS y ODYSSEY convierten materiales a tres tonos; ODYSSEY también aplica la paleta y líneas de tinta.
- `worldData.test.ts`: destinos accesibles, límites, pendientes y separación de mundos.

## Validación y límites

La Tierra fue revisada visualmente en navegador de escritorio: caminar, obstáculo de hangar, tecla E, mapa, visita rápida, campaña y vistas. Se observó una lectura instantánea de 95 FPS; no es un benchmark ni garantía. La revisión de Marte y móvil quedó pendiente por interrupción del acceso al navegador. La integración posterior de TARS y ODYSSEY no se compiló ni se probó por petición expresa del usuario, quien realizará la revisión.

Colisiones aproximadas de edificios; el personaje sigue la altura del terreno. Pequeñas rocas y equipo son decorativos y no todos tienen colisión. La cámara evita volúmenes principales, no realiza colisión de malla completa. No hay físicas realistas, multijugador, duración real de misión ni ciencia marciana funcional aún. La compilación advierte del tamaño del paquete 3D; la optimización adicional debe basarse en mediciones reales.

## Procedencia

Geometría, texturas canvas y carteles nuevos generados como código original para esta entrega; Los GLB de TARS y ODYSSEY fueron proporcionados por el usuario; se conservaron sus archivos originales y el manifiesto de ODYSSEY. La referencia adjunta se usó como guía visual, no como textura ni recurso publicado. Se conservan las condiciones de licencia del repositorio de origen.


## TARS y ODYSSEY — integración de adjuntos

TARS: cargador GLB con escala normalizada, seguimiento del terreno y conversión a sombreado de tres tonos. El nuevo adjunto `TARS.glb` reemplaza la exportación vacía anterior: contiene cuatro mallas, materiales pintados y cinco clips. Se conecta reposo, caminata y rueda al movimiento del compañero; el sustituto queda solo como respaldo de carga o error. Cuatro cuadernos separados conservan las consultas de cada tripulante durante la pestaña, también entre mundos. Hay fichas documentadas de Luna y Marte, ubicación y acceso al destino cercano. Son respuestas seleccionadas, no IA generativa ni telemetría externa. El componente admite cuatro compañeros asociados a cuatro avatares; la escena actual solo contiene un avatar. El multijugador sigue pendiente. El clip de salto se conserva sin activar porque no existe todavía una mecánica de salto.

ODYSSEY: se extrajeron los cinco GLB de `ODYSSEY_3D.rar` en `public/models/odyssey`, junto con el manifiesto del usuario. No se ejecutó contenido del archivo. Se conservaron pivotes y transformaciones de ensamblaje suministradas; no se centra cada pieza individualmente. Una escala uniforme de conjunto de 5/3 adapta el diámetro principal a 5 m, manteniendo las proporciones del modelo original. Las poses se incluyen en `src/spacecraft/odysseyPoses.json`. Se aplican colores mate, tres tonos y líneas de tinta manteniendo las texturas existentes.

Flujo: convocatoria de la Dra. Vega → hangar → montar fuselaje, conectores y cabina → añadir hábitat y soportes opcionales → seleccionar instrumentos y mejoras → comprobar límites → autorizar lanzamiento simulado → operar la misma configuración orbital → informe. El constructor permite retirar piezas y separarlas visualmente. Retirar el fuselaje o conectores retira también las piezas dependientes; el lanzamiento requiere los tres módulos obligatorios y un diseño compatible. Instrumentos, paneles extra y antena modifican la representación 3D mediante accesorios educativos.

El hábitat añade 90 kg / 55 W / 14 M USD y los soportes 12 kg / 2 M USD en el modelo educativo, no como especificaciones físicas de los GLB. El diseño y las piezas se guardan en sessionStorage; al regresar al mundo se conserva el plano, pero las operaciones se reinician al abrir otra campaña. Tierra y Marte incluyen un prototipo completo de exposición junto al taller, con una zona de colisión. El constructor continúa siendo parte de la campaña lunar.

El archivo no contiene motores, combustible ni módulos de energía completos. Los soportes aparecen descritos como provisionales en el manifiesto. No se inventaron modelos finales para esos sistemas: el lanzamiento es una transición simulada y no hay física de propulsión ni soporte vital tripulado. La tripulación de cuatro forma parte de la narrativa y de los cuadernos; no se representa una partida en red. No se realizaron capturas, compilación ni pruebas de estas integraciones por instrucción del usuario.


Actualización de TARS: se instaló el nuevo adjunto TARS.glb (602 232 bytes). Se conserva la altura de integración de 1,85 m, las texturas y la emisión de pantalla. Se añadieron transiciones de animación por avatar y se eliminó la flotación artificial del sustituto. La URL del recurso lleva una nueva versión para invalidar la caché del GLB vacío. Sin capturas, compilación ni pruebas de navegador de esta actualización.


## Escala física revisada con referencias NASA

La escena usa un metro por unidad. Consultar `docs/PHYSICAL_SCALE.md` para medidas, fuentes y distinción entre datos reales y diseño ficticio. El astronauta pasó a una silueta adulta de 1,95 m con casco; TARS a 1,85 m; ODYSSEY a un fuselaje de 5 m de diámetro y unos 15,44 m de altura con hábitat. El hangar terrestre tiene una compuerta de 18 m. Puertas peatonales, bancos, NPC, cámara y velocidades se ajustaron a escala humana.

La antigua representación de cohete de unos 20 m se sustituyó por una exposición SLS Block 1 de 98,3 m. Sus envolventes principales se basan en NASA; la torre y detalles son aproximaciones artísticas. El rover marciano se reconstruyó con una envolvente de 3 × 2,7 × 2,2 m, conservando ruedas circulares y tomando Perseverance como referencia dimensional. La campaña reutiliza el campus principal, evitando su versión anterior con tamaños distintos. Se actualizaron encuadres, luces, colisiones y la cuadrícula del constructor (cuadrados de 1 m).

Las fuentes y dimensiones se consultan desde «¿Hasta dónde llega este mundo?». Los 240 × 240 m de Tierra y 320 × 320 m de Marte siguen siendo áreas de juego compactas. No reproducen un centro espacial real, distancias de seguridad, elevaciones científicas ni métricas físicas de vuelo. No se hicieron capturas ni se ejecutaron pruebas de esta revisión, siguiendo la preferencia del usuario; el ajuste se implementó desde las medidas y el código.


## Personajes actualizados: Ellis terrestre y TARS01

Se reemplazó el recurso activo de TARS por `TARS01.glb` (613 352 bytes), manteniendo los clips y el controlador existente, con una nueva versión de URL para invalidar la caché. Su altura del proyecto sigue en 1,85 m.

Ellis sustituye al avatar terrestre tanto en el explorador como en el campus de la campaña. `EllisCharacter.tsx` carga `public/models/characters/ellis/ellis_animated_v2.glb`, clona su rig, conserva sus contornos y usa materiales toon compatibles con el mundo. Se mantiene una escala uniforme de 1,80 m. Marte sigue usando el astronauta con traje de 1,95 m.

El personaje utiliza Idle, Walk y Run con mezcla y ajuste del ritmo a la velocidad real de desplazamiento; queda en reposo al bloquearse contra un obstáculo. Los doce clips permanecen en el archivo, pero los restantes no agregan nuevas mecánicas de juego. El campus permite correr con Shift y limpia el movimiento al perder el foco. Los documentos del autor se guardan en `docs/assets/ellis`; el .blend y la imagen de vista previa quedan en el ZIP original del usuario, fuera de los recursos web.

Sin capturas, compilación ni pruebas de navegador de esta integración, conforme a la preferencia del usuario.


## Control completo de Ellis

Se incorporaron los doce clips del adjunto y un controlador compartido entre Tierra y el campus de la campaña. Carrera terrestre aumentada de 3,2 a 4,2 m/s; Marte conserva 3,2 m/s. El salto enlaza preparación, fase aérea y aterrizaje, con altura adicional cercana a 1 m y sin salto repetido en el aire. Se mantiene la colisión con edificios y el contacto con el terreno.

WASD/flechas: caminar. Shift: correr. Espacio: saltar. C: agacharse/levantarse; combinar con dirección para caminar agachado. G: saludar. T: conversar mediante gesto, sin audio; repetir para terminar. E: gesto de interacción y acceso a una estación cercana al concluir. B: parpadear; también automático. Moverse cancela los gestos. Todos los controles tienen botones en «Movimientos de Ellis», disponible únicamente en escenas terrestres.

Los párpados usan una animación independiente y el controlador mantiene las flexiones de pelvis y articulaciones de los clips de origen. Se pausó la animación junto con la física al abrir un diálogo; los viajes y cambios de vista reinician el estado. No se añadieron las acciones de Ellis al astronauta marciano.

No se ejecutaron capturas ni pruebas automatizadas de esta ampliación; se dejó la vista local disponible para la revisión del usuario.

Al volver a levantar Vite se corrigió un error de enlaces de animación al repetir la limpieza de efectos en React StrictMode: los mezcladores conservan sus enlaces mientras sus acciones memorizadas sigan en uso. Se aplicó a Ellis y TARS. Servidor local de desarrollo: http://127.0.0.1:5174/?world=earth.
