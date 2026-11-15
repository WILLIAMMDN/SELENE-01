# Elementos de entorno

Origen: ELEMENTOS ENTORNO.glb, aportado por el usuario; copia sin modificar. Se utilizan sus quince piezas independientes: dos montañas, tres módulos de estacionamiento/acceso, tres arbustos, banco, silla, farola, tacho, buggy, camión y van.

Se mantienen sus medidas originales. Las montañas reciben una escala uniforme para el horizonte. Los módulos de estacionamiento se ubican junto al transporte y la logística; los coches tienen obstáculos de navegación y los suelos elevan el apoyo del personaje. El buggy conducible queda junto al inicio (4,5; 34), separado del banco de herramientas (31; 23). Los bancos principales conservan las posiciones del control de sentarse. Las piezas se adaptan al sombreado ilustrado desde EnvironmentProps.tsx.

El archivo no contiene animaciones. Van y camión permanecen como ambientación estática; ROBER conserva su control remoto independiente. El origen es un archivo del usuario, no un recurso NASA ni una licencia pública inferida.

## Buggy conducible

`buggy_drivable.glb` (411.292 bytes) es un derivado del buggy del mismo archivo del usuario. `tools/export_drivable_buggy.py` separa sus componentes conectados y agrupa 27 piezas por rueda; conserva materiales, formas y escala. Envolvente aproximada 2,04 × 3,33 × 2,00 m; ruedas de radio 0,38 m y distancia entre ejes 1,96 m. El modelo es ficticio, no una réplica del Carryall.

`BuggyModel.tsx` aplica giro de ruedas por distancia recorrida y dirección del eje delantero; no se inventan clips de animación en el original. Navegación cinemática: máximo 5 m/s hacia adelante y 2 m/s hacia atrás, aceleración progresiva, freno, barrido de toda la huella y rechazo de interiores/pendientes fuertes. El jugador ocupa una pose sentada mientras conduce. E detiene y busca un punto libre para bajar; el menú y la pérdida de foco detienen la marcha. Al viajar mediante el mapa se aparca el buggy. Su estado se mantiene durante la sesión, sin cambiar el guardado de misiones.

Referencia dimensional y de velocidad: [ficha oficial Carryall 300](https://www.clubcar.com/-/media/project/milky-way/clubcar/clubcar-documents/pdf/literature/commercial/carryall/comm0045---carryall-300-brochure-lr.pdf), distancia entre ejes 1,66 m y velocidad máxima 27 km/h. El límite del juego de 18 km/h es una elección de jugabilidad, no una especificación de ese modelo. Revisión visual y rendimiento pendientes del usuario; no se ejecutaron pruebas de juego.
