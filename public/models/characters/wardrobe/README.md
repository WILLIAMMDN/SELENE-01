# Vestuario de la exploradora

Fuente: `Exploradora_Astronauta_Vestimentas.blend`, aportada por el usuario el 15 de noviembre de 2026. Es una edición de Casual2_Female de Quaternius; la base mantiene su procedencia CC0 documentada en `../quaternius/README.md`. Las prendas y ediciones adicionales se documentan como aportadas por el usuario, sin atribuirles una nueva licencia.

`explorer_wardrobe.glb` conserva el rostro editado, ropa original, uniforme formal y traje EVA. Los extras `wardrobe` separan cuerpo, ropa, casco y cabellos. El selector del menú guarda preferencias independientes para Tierra, Marte y Luna; el casco se conserva como preferencia compartida. Los personajes clásicos siguen disponibles. La Luna selecciona EVA inicialmente.

Clips: Idle, Walk, Run, PickUp, Punch, ReceiveHit, SitDown, Saludar y MirarAlrededor. La locomoción usa el desplazamiento del jugador; sentarse/levantarse reutiliza SitDown, y los gestos del menú terminan o se interrumpen al caminar. No se añadió un clip de salto. Se conserva el rig y los morph targets de rostro. El contorno comparte las influencias faciales; el visor transparente no recibe una cubierta opaca de tinta.

Se toma como referencia la silueta civil de 1,80 m, manteniendo la misma escala corporal al cambiar de ropa. No se presenta el traje como equipo certificado. Colisión horizontal del jugador: la existente, 0,24 m.

Exportación: `blender --background --factory-startup --disable-autoexec --python tools/export_wardrobe.py -- RUTA.blend`. Exporta únicamente la escena principal: la escena de estudio generaba una malla compartida con y sin skin, incompatible con el cargador de Drei. Se asignan pesos al broche y se reemplazan los drivers de visibilidad de Blender por grupos seleccionables en Three.js. No se modifica el original.

Una barrera local recupera el personaje clásico si falla una vestimenta. La pantalla general ya no atribuye cualquier excepción a la aceleración gráfica.

La revisión visual y de juego queda a cargo del usuario. No se ejecutaron más suites de pruebas después de su instrucción de detenerlas.
