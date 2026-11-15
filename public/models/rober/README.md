# ROBER — rover del usuario

Origen: ROBER.glb, 1 105 684 bytes, con un rig de 18 articulaciones. Se conserva el archivo, los mapas y las proporciones originales. Three.js clona el rig y aplica material toon mate crema, petróleo y coral, sensores cian y contornos de tinta deformables.

Se incorpora en Tierra y Marte, sustituyendo las representaciones geométricas anteriores. Longitud normalizada uniformemente a 3 m; las ruedas definen el eje delantero y el origen se apoya en el suelo. Referencia dimensional: https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/ . No se afirma exactitud de réplica.

Los cinco clips se conectan al panel ROBER / Control remoto:
- Rover_Idle_Scan: exploración visual del mástil.
- Rover_Drive_Forward: seis ruedas, avance y reproducción inversa al retroceder.
- Rover_Steer_Turn: giro/dirección; demostración continua o durante conducción con giro.
- Rover_Rough_Terrain: conducción lenta con animación de terreno irregular.
- Rover_Arm_Drill: ciclo completo del brazo y perforador; vuelve a escaneo y suma un ciclo local.

El panel abre al pulsar ROBER o su rótulo y la cámara lo sigue. Conducción con WASD/flechas dentro del panel o botones mantenidos; Detener pausa la acción, cerrar detiene el vehículo y devuelve la cámara al tripulante. Reiniciar posición lo devuelve al punto de exposición. La conducción aplica el relieve y una envolvente de colisión contra los obstáculos del mundo. No hay dinámica física de suspensión, consumo de combustible, navegación autónoma ni colisión dinámica entre vehículos y personajes.

El escaneo y la perforación son demostraciones animadas: no generan mediciones, muestras físicas ni resultados NASA. El contador de ciclos no persiste al cambiar de mundo. Las velocidades de juego 1,1/0,55 m/s no representan capacidades del rover real.

Sin capturas ni pruebas de navegador, conforme a la preferencia del usuario.
