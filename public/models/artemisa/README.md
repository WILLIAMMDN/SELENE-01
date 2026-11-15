# BASEPRI — módulos ARTEMISA

Origen: BASEPRI.blend aportado por el usuario. Se exportan diez tipos únicos: hábitat, esclusa, laboratorio, taller, comunicaciones, invernadero, energía, refugio, soporte vital y aterrizaje/logística. Se exporta un ejemplar por tipo y se omiten las copias duplicadas .001/.002; el terreno fuente y los vehículos duplicados no sustituyen el terreno del juego ni ROBER.

Se habilitaron las colecciones excluidas en el archivo antes de evaluar sus matrices: algunas cubiertas aparecían con matriz mundial nula al estar fuera de la capa visible. Se conservaron las ubicaciones y proporciones entre piezas, se hornearon biseles y textos, y se centró cada módulo completo una sola vez. Un metro de origen equivale a un metro del mundo. modules.json registra dimensiones, procedencia y origen de cada conjunto.

Cada GLB separa Body y Cover, conservando el mobiliario interior. Pulsar el edificio retira la cubierta y la pared desmontable suministradas para ver el interior; el botón de cierre las repone. Esta vista es expositiva, no añade interiores recorribles ni una simulación de soporte vital. Las puertas visibles siguen siendo geometría estática.

En Tierra y Marte se distribuyen los módulos con cimientos nivelados y colisiones correspondientes a su envolvente. El hangar de ODYSSEY y la exposición SLS continúan siendo las instalaciones grandes originales. El taller BASEPRI es el módulo de robótica junto a ROBER.

El navegador reutiliza geometrías, aplica materiales mates crema/petróleo/coral con sombreado de tres tonos y contornos por expansión de normales. Los textos y equipos del adjunto permanecen en las mallas. No se ejecutan scripts embebidos del blend.

Receta reproducible: Blender --background --factory-startup --disable-autoexec --python tools/export_artemisa.py -- RUTA_BASEPRI.blend . No se modifica el archivo original.

Sin capturas ni pruebas de ejecución en esta entrega, conforme a la instrucción del usuario.
