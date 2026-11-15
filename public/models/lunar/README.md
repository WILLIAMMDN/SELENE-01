# Destino lunar ODYSSEY

Fuente: `ODYSSEY_BASE_LUNAR_v01.blend`, aportada por el usuario. Se exportan el terreno de 300 × 300 m, rocas, horizonte y el montaje de BASE_LUNAR_ROOT: hábitat, laboratorio, almacén, unidad de energía y corredores. Se omiten el cubo, cámaras, luces de estudio y los prototipos que duplicaban el montaje. No se modifica el original ni se atribuye una nueva licencia.

Entrada: menú → Luna, o `?world=moon`. Inicio (57, 66). Se mantienen las coordenadas de Blender convertidas a Three.js (X, Z, -Y), a un metro por unidad. La cápsula L01 se sitúa en la explanada indicada por el archivo, (-84, 78).

La altura navegable procede de los 10.201 vértices del terreno, con interpolación de la cuadrícula de 3 m; se añade la superficie de la plataforma L01. Colisiones horizontales conservadoras para módulos, corredores, rocas grandes y cápsula; no es física de pendientes ni interiores recorribles. El mapa y los cinco puntos de interés tienen coordenadas lunares propias; no reutilizan los edificios terrestres.

La unidad PWR conserva PWR_L01_DESPLIEGUE. E junto a Energía permite desplegar o recoger paneles; movimiento reducido aplica la pose final. El archivo utiliza acciones de varios objetos: el exportador restaura sus slots al materializar las instancias de colección. Las rocas estáticas se agrupan para reducir llamadas de dibujo.

La Luna es un destino de exploración, no una nueva campaña ni una simulación de gravedad/soporte vital. La misión orbital y sus partidas se conservan en la Tierra. Las formas del terreno son artísticas, no datos de elevación NASA.

Receta: `blender --background --factory-startup --disable-autoexec --python tools/export_lunar_base.py -- RUTA.blend`. El GLB y `src/world/lunar/lunarLayout.json` se distribuyen con el juego; Downloads y Blender no se necesitan para jugar.

No se ejecutaron suites ni recorridos de prueba de este destino por indicación del usuario. Revisión visual, navegación, animación y rendimiento pendientes de su revisión.
