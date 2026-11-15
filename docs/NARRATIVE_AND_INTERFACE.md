# Artemisa: misión, fauna e interfaz ilustrada

Entrega: 14 de noviembre de 2026. Referencias visuales proporcionadas por el usuario: papel claro, contornos irregulares, tipografía manual legible, pestaña de interlocutor coral, botones cuadrados y espacio libre para explorar.

## Historia jugable

La exploradora llega al campus terrestre como integrante del equipo SELENE. La Dra. Vega le encarga preparar un orbitador para estudiar el polo sur lunar. TARS acompaña, explica las consecuencias y orienta sin resolver la misión. ODYSSEY se construye en el hangar; la revisión en comunicaciones habilita la autorización de vuelo. La operación termina con un informe, que se conserva para conversar sobre lo aprendido en el mirador.

- Llegada: introducción breve de dos páginas, una vez por navegador; se puede cerrar.
- Investigación: escoger pregunta, instrumento necesario y cobertura polar.
- Ingeniería: montar módulos y elegir instrumentos, órbita, lanzador y duración.
- Comunicaciones: contrastar recursos y registrar esa configuración exacta.
- Lanzamiento: autorizar solo con una revisión vigente; mecanismos del modelo disponibles como demostración aparte.
- Operaciones: tres periodos representativos, con decisiones de adquisición, transmisión y conservación.
- Cierre: datos recuperados, reserva, puntuación y explicaciones concretas de qué mejorar; rediseño disponible.

Llegar a un edificio no completa automáticamente su actividad. Las conversaciones se inician con E en las estaciones; el mapa permite viajar a sus entradas. El lanzamiento no equivale al éxito científico: acabar sin devolver datos penaliza la puntuación y el informe lo explica.

## Pautas recibidas

Se leyó el texto completo pegado por el usuario, titulado «Diseñar una misión espacial requiere una cuidadosa consideración…». Se usa como contexto del reto, sin presentarlo como verificación independiente de la página oficial.

| Aspecto central del texto | Aplicación en el proyecto |
| --- | --- |
| Objetivo antes de diseñar | Selección en el laboratorio y requisito del instrumento |
| Decisiones con consecuencias | Masa, potencia, datos, coste y ciencia calculados según selección |
| Lanzador y órbita | Capacidad de masa y compatibilidad orbital educativa |
| Tiempo y duración | Opciones de 30, 90 y 180 días, coste de operaciones y margen energético |
| Gestión y operación | Tres decisiones con consumo, almacenamiento y transmisión |
| Aprender del resultado | Bitácora e informe con causas de fallo y propuestas de ajuste |
| Interfaz clara | Objetivo breve, diálogos cortos, cuaderno a demanda, recursos visibles en la mesa |
| Colaboración sugerida | Cuatro cuadernos locales; no equivale a multijugador en línea |

Los apartados formulados como «podría» o «puede considerar» no se interpretan como funcionalidades ya implementadas. No hay multijugador en red, clasificaciones, dinámica orbital de alta fidelidad ni campaña marciana específica.

## Reglas educativas añadidas

Duraciones: 30/90/180 días con coste de operaciones de 2/6/12 M USD. La extensión a 180 días requiere paneles adicionales. AURORA-S permite las opciones polar baja e inclinada; polar alta requiere ATLAS-T. Son restricciones hipotéticas de este escenario, no rendimientos de lanzadores reales.

Cada decisión de operaciones representa un tercio de la duración. El consumo de reserva incluye una penalización por duración. En el eclipse, modo seguro consume poco en vez de recargar la batería. La puntuación se reduce si no se devuelven datos; el informe distingue completar la secuencia de alcanzar el propósito científico.

## Interfaz y arte

Objetivo compacto arriba a la izquierda; menú arriba a la derecha; mapa, bitácora y TARS en botones pequeños. Minimap opcional y apagado inicialmente. Sin tarjeta de bienvenida permanente, barra superior corporativa ni pie de instrucciones ocupando la escena. Los diálogos de papel aparecen abajo; los detalles de ingeniería se abren solo al solicitarlos. Teclado, foco y cierre con Escape disponibles.

Fuente Patrick Hand alojada localmente, procedente del repositorio Google Fonts y con su licencia SIL OFL incluida. Interfaz, diálogos y carteles usan la misma familia visual. El texto pequeño conserva una tipografía sencilla para legibilidad.

Los caminos usan una máscara de cobertura de 4096 píxeles centrada en el campus y reconstrucción de bordes en el shader. Los colores, grietas y manchas se dibujan por separado en coordenadas del mundo; no son una fotografía ampliada. Se mantienen sobre la misma superficie, sin bandas coplanares. El pasto tiene hojas segmentadas y variaciones de color.

La costa occidental incorpora ocho animales del blend, agua y una orilla modelada en el terreno. El entorno nuevo aporta sus quince piezas, colocadas en transporte, logística, descanso, jardines y horizonte. Véanse los README de cada carpeta de modelos.

## Estado de revisión

Se construyeron los recursos y el código. No se ejecutaron capturas, compilación ni pruebas automáticas, conforme a la preferencia del usuario. La revisión visual, rendimiento y recorrido jugable quedan a su cargo. No se declara equivalencia visual exacta con las referencias ni cumplimiento certificado de las bases.

## Cápsula de descenso añadida a la entrega

L01 ocupa la zona de llegada de Ares y una plataforma de entrenamiento al este de Artemisa. El mapa ofrece una visita directa. La conversación de TARS explica la diferencia entre la misión orbital del capítulo y el descenso a una superficie. La selección de mecanismos reproduce los dos clips originales y cierra el panel para observar la escena. La cápsula conserva sus metros de origen, con 5 m de altura; no se ha ampliado arbitrariamente para igualarla a ODYSSEY. Las plataformas tienen suelo nivelado, acceso inclinado y colisiones alrededor del módulo.

## Corrección de arranque

Se corrigió la condición del diálogo del mirador en StoryDialogue.tsx que impedía a Vite transformar el módulo. Tras el error reportado por el usuario se ejecutó npm run build: TypeScript y Vite finalizaron sin errores. No se realizaron capturas ni se comprobó visualmente el recorrido.


## Recorrido guiado y resultados por encargo

La misión comparte una guía de seis requisitos entre ingeniería, estaciones y TARS: pregunta elegida, sistemas montados, instrumento del encargo, cobertura polar, recursos compatibles y revisión registrada. La lista detallada se abre a petición del jugador. El texto breve señala el primer requisito pendiente; no completa actividades ni autoriza un vuelo por sí mismo.

El encargo elegido aparece en diseño y en el plan de vuelo: cámara, espectrómetro o radar. Los diálogos de ingeniería y comunicaciones consultan el estado actual. En la plataforma, el botón distingue autorizar un vuelo, continuar operaciones guardadas y consultar un informe existente.

Durante las operaciones, el desplegable de TARS muestra la batería resultante, la memoria y los datos transmitidos por cada opción. Usa la misma función de transición que el juego, incluidos los costes por duración. Consultarlo no modifica el estado. Después de elegir, la notificación existente muestra las consecuencias reales y las advertencias de batería, memoria o ausencia de datos.

El informe conecta el resultado con la pregunta elegida y distingue operación pendiente, diseño incompatible, ausencia de datos recuperados, recuperación parcial antes de un fallo y datos devueltos. Los GB siguen siendo agregados del simulador: no se inventan mediciones por instrumento, descubrimientos ni respuestas científicas. Cada encargo tiene una pregunta de reflexión y conserva su enlace NASA. El resumen se guarda con el informe del mirador utilizando el formato de lecciones existente; las partidas antiguas siguen siendo válidas.

Registrar de nuevo una revisión que continúa vigente ya no borra una operación ni un informe. Una revisión de una configuración diferente sí inicia una nueva preparación. El botón de revisión queda deshabilitado cuando esa misma configuración ya fue aprobada.

Esta entrega conserva todos los modelos, posiciones y CSS. Amplía contenido y controles usando los paneles, listas y desplegables del diseño actual. La validación automatizada incluye recorridos completos para los tres encargos; no sustituye una revisión visual o una sesión de juego del equipo.
