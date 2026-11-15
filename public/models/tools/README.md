# Herramientas del taller terrestre

Fuente: `herramientas-tierra.blend`, aportada por el usuario. `earth_tools.glb` incluye únicamente KIT_HERRAMIENTAS y su jerarquía: cofre, llave inglesa, destornillador, martillo, alicates, multímetro, linterna, cinta métrica y taladro. Se excluyen suelo, luces y cámara de estudio. No se ejecuta el generador Python embebido ni se modifica el original; no se asigna una licencia nueva.

Banco junto al taller: (29, 21), escala 1:1; soporte a 0,45 m, cofre de 3,20 × 1,25 m. Colisión horizontal compartida con navegación. El mapa permite viajar delante del banco; E o pulsar el cofre abre el selector. Las herramientas reproducen la salida, uso y regreso del archivo original, en un espacio de demostración frente al cofre. No están acopladas a las manos del avatar ni implementan reparaciones o inventario.

La línea de tiempo original se hornea en una secuencia conjunta, conservando todos los mecanismos sincronizados. El selector usa sus marcadores de 24 FPS: 40, 240, 440, 640, 840, 1040, 1240 y 1440; cada demostración dura 196 fotogramas. Apertura 1–31 y cierre 1640–1670. `toolTimeline.json` conserva marcadores y emisión de lente/pantalla horneada por fotograma. La linterna ilumina su lente sin añadir un foco dinámico al mundo; movimiento reducido desactiva esos destellos. Las demostraciones explícitas continúan disponibles.

Se actualiza el mezclador solo al reproducir una secuencia y se pausa con paneles. Materiales toon compartidos, colores adaptados a crema/coral/petróleo. Exportador reproducible: `tools/export_earth_tools.py`. No se requieren archivos de Downloads para jugar.

No se ejecutaron suites ni recorridos de prueba de esta integración, por instrucción del usuario. Revisión visual, escala, animación y rendimiento a su cargo.
