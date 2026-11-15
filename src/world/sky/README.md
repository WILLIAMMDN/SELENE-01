# Cielo ilustrado de Artemisa

Origen: `Cielo_Anime_NAASAA.zip`, aportado por el usuario. `SOURCE.md` conserva la documentación del adaptador original; `AnimeSky.js` es su adaptación al juego, con una declaración TypeScript para su API. No se ejecutaron los scripts incluidos en el ZIP. No se atribuye una licencia no declarada.

Se incorpora el ciclo original de cinco minutos de día y uno de noche, luna, estrellas y clima. El menú permite fijar día, atardecer o noche, y elegir despejado, lluvia o tormenta. Se conservan las luces y cobertura de sombras del campus, variando intensidad y color. El clima es visual y no altera las reglas de misión.

A petición del usuario se revisó la composición con referencias de fondos de anime: cúmulos altos, bancos bajos y masas alargadas, con contornos suaves, luces crema y sombras azul verdoso. `paintedCloudGeometry.js` genera cuatro siluetas originales distintas, cada una con borde tenue, relleno, sombra e iluminación pintada. Cuatro mallas instanciadas comparten los materiales; son 36 instancias en estándar y 20 en ligera. Las capas se fusionan por silueta, sin apilar tarjetas transparentes. Las matrices de deriva se actualizan a 10 Hz. El fondo incorpora gradiente de horizonte y un halo solar calculado en su mismo shader. No se usan texturas de cielo, volúmenes, postprocesado ni sombras adicionales de nubes. No se midieron FPS ni se garantiza rendimiento en todos los equipos.

Referencias consultadas, únicamente como orientación artística (ninguna imagen descargada o incorporada): [fondos aéreos de Porco Rosso](https://www.pinterest.com/pin/347199452518101115/) y [cielos ilustrados](https://www.rawpixel.com/search/cloudscape%20drawing). La estrategia de geometría compartida utiliza [InstancedMesh de Three.js](https://threejs.org/docs/pages/InstancedMesh.html).

El cielo sigue a la cámara y se pausa con los paneles. Movimiento reducido congela ciclo y precipitación y suprime destellos de tormenta. La lluvia se oculta cuando el jugador entra en un edificio terrestre. Marte y Luna conservan sus ambientes propios.

La referencia visual aportada orienta el tratamiento; no se copian recursos de esa imagen.
