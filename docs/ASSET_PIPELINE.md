# Blender → Three.js: contrato técnico v1

1. Modelar en Blender respetando escala métrica y orientación acordada.
2. Conservar archivo .blend editable fuera de los assets finales del sitio; usar Git LFS para fuentes grandes si se guardan en Git.
3. Exportar .glb, con malla, materiales compatibles, texturas y clips de animación.
4. Guardar el GLB optimizado en public/models/<categoria>/<nombre>.glb; nombres únicos, minúsculas y sin espacios.
5. Probar en visor glTF y en una escena R3F antes de un PR.
6. Cada asset lleva autor, enlace de procedencia, condiciones de uso, fecha, fuente modificada y polígonos / tamaño aproximado.

Convenios: suelo en Y=0 en Three.js, 1 unidad=1 metro; avatar ~1.7 unidades; pivote a nivel de pies; animaciones Idle, Walk, Run, Talk, Interact; para ORBI, Follow, Scan y Explain.

Se prefieren texturas 1K y atlas; sombras por objeto cuidadosamente limitadas; evitar materiales 4K y modelos pesados en zonas no visibles. No esperar que los nodos complejos de Blender se reproduzcan automáticamente en GLB.

Fuentes externas de referencia reales:
- https://github.com/nasa/NASA-3D-Resources
- https://science.nasa.gov/3d-resources/
- https://www.nasa.gov/nasa-brand-center/images-and-media/
- https://github.com/pmndrs/react-three-fiber
- https://github.com/pmndrs/drei

Los recursos NASA no se incorporan automáticamente: verificar sus guías de uso y sus atribuciones.
