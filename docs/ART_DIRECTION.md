# Dirección artística y flujo de producción 3D

## Estética
**Aventura espacial estilizada**, legible y cálida, no fotorrealismo. Siluetas redondeadas, materiales mate, detalles industriales simplificados y luces suaves. Evitar degradados llamativos en interfaz. Contraste alto en información científica. Se busca una identidad propia, no un calco de imágenes de referencia.

## Paleta inicial
- Azul noche espacial: `#0A1525` — fondo de escena.
- Azul panel: `#0E2030` — interfaz de control.
- Gris regolito: `#777D86` — terreno lunar.
- Blanco hábitat: `#D7DEE6` — arquitectura y trajes.
- Ámbar señal: `#E7AC73` — botones, alertas moderadas.
- Verde estabilidad: `#73BAA7` — recursos saludables.

## Lista de activos prioritarios
| Prioridad | Modelo/asset | Versión inicial | Versión artística deseada |
|---|---|---|---|
| P0 | Habitación lunar central | Geometría Three.js | Módulo modular con acceso, ventanas y señalética |
| P0 | Paneles solares | Geometría Three.js | Paneles articulados con marcos y celdas |
| P0 | Astronauta | Geometría Three.js | Personaje riggeado con gestos y animaciones |
| P0 | Terreno y cráteres | Geometría Three.js | Terreno esculpido o procedural optimizado |
| P1 | Rover explorador | Geometría Three.js | Vehículo con ruedas animadas |
| P1 | Invernadero, comunicaciones y laboratorio | Pendiente | Edificios distinguibles y explorables |
| P1 | UI, iconos, retratos | HTML/CSS | HUD consistente y retratos originales |
| P2 | Partículas, efectos y cinemáticas | Pendiente | Polvo, luces, animaciones y transiciones |

## Convenciones para Blender
Unidades métricas y pivotes coherentes; nombres de archivos `snake_case`. Escala realista relativa entre personas y base (personaje ≈ 1,7–1,9 unidades, salvo elección de arte deliberada). Aplicar transformaciones, revisar normales y UV. Exportar **glTF 2.0 binario (.glb)**. Evitar incluir cámaras o luces no usadas. Materiales PBR simples y texturas comprimidas con dimensiones razonables.

## Reglas de assets externos
Solo utilizar contenido creado por el equipo o con licencia documentada que permita el uso previsto. Registrar: URL, autor, licencia, fecha de descarga y cambios. Un asset sin procedencia verificada NO entra a `main`. No se asume permiso para redistribuir contenido de bancos comerciales.

## Flujo de aprobación visual
Moodboard original → un prototipo de personaje y un módulo → revisión de escala, materiales y rendimiento → aprobación de estilo → bibliotecas modulares → integración → captura comparativa en Pull Request.

**Importante:** todo el escenario inicial fue generado por geometría en Three.js; ningún archivo Blender es obligatorio para probar la demo.
