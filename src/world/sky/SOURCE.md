# Cielo anime para Three.js

Adaptador procedural independiente para el juego. Recrea la dirección visual del `.blend`; no importa materiales ni drivers de Blender. Usa una sola dependencia: `three` (comprobado con 0.180.0).

```js
import { AnimeSky } from './AnimeSky.js';

camera.far = Math.max(camera.far, 650);
camera.updateProjectionMatrix();
const sky = new AnimeSky(scene, {
  daySeconds: 300,   // 5 minutos reales de día: 06:00–18:00
  nightSeconds: 60,  // 1 minuto real de noche: 18:00–06:00
  startHour: 6,
  fog: true,        // opcional: instala niebla y restaura la anterior al liberar
  lighting: true,   // opcional: añade sol, luz ambiente y destellos a la escena
});

// En tu bucle existente, antes de renderer.render(scene, camera):
sky.update(deltaSeconds, camera);

sky.setWeather('rain', 4);   // lluvia con transición de cuatro segundos
sky.setWeather('storm', 6);  // tormenta con destellos ocasionales
sky.setWeather('clear', 5); // despejar
sky.autoCycle = false;
sky.setHour(22);            // fijar noche; acepta horas fuera del rango y las normaliza
sky.autoCycle = true;
sky.setPhaseDurations(300, 60); // ajustar las dos duraciones por separado

// Al salir de la escena:
sky.dispose();
```

El cielo sigue la posición mundial de la cámara y conserva su orientación. El sistema supone el eje Y hacia arriba y cámara sin un padre escalado. El radio del fondo es de 500 unidades; ajusta el plano lejano de la cámara al menos a 650. Llama `update` una vez por frame con segundos reales y vuelve a pasar la cámara después de moverla.

El ciclo predeterminado dura **6 minutos: 5 de día y 1 de noche**. El amanecer y el atardecer forman parte de esas fases. `daySeconds` y `nightSeconds` se expresan en segundos reales; `startHour` es la hora solar. `setCycleDuration(totalSeconds)` y la opción compatible `cycleSeconds` cambian el total conservando la proporción configurada (5:1 por defecto); por ejemplo, `setCycleDuration(720)` produce 10 minutos de día y 2 de noche. `setPhaseDurations(300, 60)` restablece la duración solicitada sin cambiar la hora actual. La velocidad del viento, la caída de lluvia y las transiciones climáticas siguen usando segundos reales.

Incluye gradiente diurno, atardecer, luna creciente, estrellas que titilan, nubes de geometría instanciada y lluvia que cae alrededor de la cámara. La hora avanza automáticamente; el juego decide cuándo llamar a `setWeather`. Las tormentas producen destellos visuales, sin audio. `fog` y `lighting` están desactivados por defecto. El fondo existente de la escena no se modifica.

Los shaders de cielo y nubes dependen de WebGL; usa `THREE.WebGLRenderer`. El adaptador no configura postprocesado, sombras, colisiones, suelo mojado ni efectos de audio. No debe pasarse por exportación glTF: se integra copiando este módulo. La validación automática cubre sintaxis, API y liberación de recursos; la apariencia debe comprobarse en la cámara y exposición definitivas de tu juego.
