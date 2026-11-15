# Rendimiento, movimiento y colisiones

Estos ajustes conservan los GLB originales, la paleta, los materiales ilustrados y la distribución del campus. No se cambian dependencias de ejecución, guardados ni reglas de la misión. Se añade únicamente @types/node como dependencia de desarrollo para leer los clips reales del GLB en las pruebas.

## Trabajo gráfico y de CPU

- `EnvironmentProps` prepara el material toon y los contornos una vez por objeto fuente; las instancias comparten geometría y materiales.
- `ArtemisaBuildings` resuelve las referencias a puertas y cubierta al cargar. `buildingNavigation` guarda las cimentaciones por función de terreno y prepara los obstáculos de altura relevante una vez.
- Los árboles conservan tronco, copas y contornos. A más de 80 m se omiten las mallas de hojas pequeñas; se recuperan al acercarse a 65 m. Las copas son hijas de las hojas en el archivo: se cambia la geometría de las hojas, no se oculta su jerarquía.
- Árboles y fauna actualizan su mezclador como máximo a 15 Hz a más de 40 m y lo suspenden a más de 130 m. Cerca conservan la frecuencia de render. Movimiento reducido sigue respetándose.
- La colocación del pasto consulta muestras de caminos mediante una cuadrícula espacial. Mantiene los márgenes y la geometría; su conjunto instanciado tiene una esfera de recorte que incluye el desplazamiento del viento.
- Resolución adaptativa: cinco segundos de calentamiento; ventanas de tres segundos. Bajo 40 FPS sostenidos reduce DPR en pasos de 0,15 hasta 1. Tras tres ventanas por encima de 58 FPS lo aumenta en 0,1 hasta el límite original (1,5 exploración, 1,6 simulador, limitado por la pantalla). El modo ligero conserva DPR 1. No cambia la resolución del texto HTML ni rebaja el tamaño de las texturas. Las pausas largas y pestañas ocultas no se cuentan como carga gráfica normal.

## Navegación

`navigation/collision.ts` separa una búsqueda espacial de obstáculos y comprobaciones precisas en rectángulos rotados. El cuerpo tiene radio horizontal de 0,24 m. El desplazamiento se divide en tramos de como máximo 8 cm; cada eje puede deslizarse junto a paredes. Tierra, Marte y TARS reutilizan el barrido, incluidos los saltos terrestres. No es un motor de física tridimensional: no permite subirse a muebles ni saltar sobre paredes.

`navigation/propLayout.ts` centraliza las posiciones de barandillas, armarios, bancos, sillas, papeleras y farolas utilizadas también al dibujarlos. Añade obstáculos para los postes, telescopio, consolas, carros y la Dra. Vega. Las colisiones existentes de edificios, vehículos, árboles y naves se mantienen. La llegada a lanzamiento queda en (61, -33,8), delante de la consola, cuya posición no cambia. Sentarse usa una aproximación libre y levantarse devuelve al personaje delante del banco.

TARS conserva una ruta de posiciones recorridas por el tripulante cuando un obstáculo corta su seguimiento lateral. Se limita a 512 puntos y a 9 m/s para recuperar distancia. No atraviesa paredes para alcanzarlo; el viaje rápido reinicia la ruta. No sustituye un navmesh para navegación independiente.

## Controles y animaciones

- Caminar: WASD/flechas a 2 m/s. Correr: Shift, 6,5 m/s en Tierra y 5 m/s en Marte.
- Salto terrestre: Espacio. Se conserva su física y sus transiciones.
- TARS: reposo, caminar y rueda según su desplazamiento real; salto al despegar el tripulante; salto y acción adicional disponibles en el panel TARS. Se usan los cinco clips del GLB, sin nuevas animaciones generadas ni funciones científicas inventadas.

## Validación y límites

`npm test` cubre cajas rotadas en límites de celdas, barrido contra paredes delgadas, deslizamiento, colisión al saltar, velocidad a 20/60/144 FPS, acceso a estaciones, sentarse/levantarse, márgenes de caminos, recuperación conservadora de resolución, nombres de los cinco clips reales del GLB y seguimiento alrededor de una esquina. `npm run build` valida TypeScript y producción.

No se realizaron capturas ni mediciones de FPS en navegador por preferencia del usuario. Estas optimizaciones reducen trabajo concreto, pero no constituyen una garantía de FPS en todos los equipos. La comprobación visual, el tiempo de carga de assets y el perfil GPU/CPU en los equipos del equipo quedan para una sesión de juego. No se modifica el tamaño de descarga de los modelos.
