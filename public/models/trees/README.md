# Árboles del campus — Anime Tree

Base solicitada: asset_base_id fbddfb70-eec5-4b49-a7c8-2e91ad44e4a0, asset_type model.
Autor original: Zuhaib Khoso. Nombre: Anime Tree. Revisión descargada: 699ebd9b-5588-4ab2-a36d-f512a4926217. Catálogo BlenderKit: isFree=true, license=royalty_free.
Metadatos de procedencia: https://www.blenderkit.com/api/v1/search/?query=asset_base_id:fbddfb70-eec5-4b49-a7c8-2e91ad44e4a0%20asset_type:model

El original contiene diez grupos de 4 000 hojas, con 308 000 vértices por grupo, más el tronco. Se usa su tronco y la distribución original del follaje como base para tres variantes adaptadas al proyecto:
- anime_tree_grove.glb: copa estándar.
- anime_tree_slender.glb: silueta más estrecha y alta.
- anime_tree_shelter.glb: copa más amplia y baja.

Cada variante tiene 4 000 hojas geométricas simplificadas, colores por vértice, ramas de conexión y tres grupos de copa con animación cíclica de brisa de cuatro segundos. Las variantes ocupan alrededor de 1 MB cada una. No son tres recursos independientes del catálogo: son derivaciones del árbol solicitado.

Se exportaron con Blender en segundo plano; no se capturó ni modificó la sesión interactiva del usuario. En Three.js se aplican materiales mates de tres tonos y trazos de tinta selectivos. El campus distribuye cuarenta ejemplares con escalas, orientaciones y fases de brisa distintas; comparte geometrías/materiales entre clones y pausa los mezcladores a distancia. Movimiento reducido detiene la brisa. Solo hay árboles en Tierra.

La licencia del recurso base sigue siendo la indicada por BlenderKit; no se relicencia como CC0 ni como código del proyecto. Estos modelos se incorporan como recursos del juego, con atribución de procedencia. No se incluye el blend original de 130 MB en los recursos del navegador.

Reproducción: tools/build_tree_variants.py, ejecutado con Blender --background --factory-startup --disable-autoexec --python tools/build_tree_variants.py -- RUTA_AL_BLEND_DESCARGADO. No requiere el MCP de Blender.

## Revisión de copas ilustradas

Se añadieron diez masas de copa de contorno lobulado a cada variante, siguiendo los centros del follaje original. Las hojas periféricas aportan detalle mientras las masas dan una silueta compacta y sombras legibles. Las copas tienen contorno de tinta y comparten el movimiento de los tres grupos animados. La distribución evita edificios y plataformas; los troncos tienen colisión terrestre. Se añadieron pequeñas hojas que caen y hierba con brisa junto a caminos; Movimiento reducido detiene ambos efectos.

## Publicación autorizada por el autor

El responsable del proyecto confirma que creó estos árboles y autoriza expresamente incluirlos completos en este repositorio. Se publican los tres GLB con sus animaciones y el manifiesto de variantes. Los metadatos anteriores documentan cómo se obtuvo el recurso del catálogo; no sustituyen esta declaración de autoría ni aplican una licencia nueva a los modelos.
