# ODYSSEY — entrega final del usuario

Origen activo: ODYSSEY_GLB_FINAL.rar. Se incorporan sus 13 GLB y modulos_odyssey.json sin reescribir las mallas. La configuración completa reúne 17 instancias: fuselaje, conectores, soportes, hábitat, cabina, motor, energía, dos depósitos grandes, oxígeno, cuatro RCS, dos paneles solares y antena. El depósito pequeño está disponible como alternativa al grande, en ambos puertos laterales.

El cargador usa las transformaciones de nave_completa y la cabina de nave_basica cuando se retira el hábitat. Los acoples pequeño/grande comparten el mismo marco en el manifiesto. Retirar el hábitat retira su antena; los tipos de depósito son mutuamente excluyentes. Los controles de paneles/antena se sincronizan con el presupuesto educativo.

La nave conserva las proporciones de origen con una única escala 5/3: fuselaje Ø 5 m, altura con motor 14,38 m, con motor y hábitat 18,55 m, envolvente desplegada 13,60 m por eje horizontal. El apoyo parte de Y=-6,075 m en el modelo original. Son medidas del diseño suministrado escalado; no especificaciones NASA de ODYSSEY.

Materiales mates, sombreado por bandas, texturas y contornos aplicados por Three.js. Paneles y antena usan los GLB finales, en su posición suministrada. No se añadieron ciclos de despliegue a esos componentes. Los instrumentos científicos siguen siendo accesorios ilustrativos del simulador. Los soportes siguen siendo provisionales y no hay dinámica de propulsión ni cálculo estructural.

El manifiesto conserva sus validaciones de autoría; no constituyen pruebas ejecutadas durante esta integración. Procedencia y derechos de los adjuntos: materiales aportados por el usuario.

La plataforma tiene 10,3 m de radio para alojar los paneles diagonales, con margen de colisión de 11 m. El camino hacia lanzamiento rodea la exposición.

## Modelo fuente v01 — 15 de noviembre de 2026

`nave_modelada_v01.glb` se exporta del montaje ODYSSEY_ROOT de `Nave_ODYSSEY_Final_Modelado_v01.blend` y ocupa la exposición del prototipo en Tierra y Marte. El archivo no contiene clips de animación. El hangar y la campaña conservan los 13 GLB finales y sus acoplamientos mejorados para permitir añadir y retirar módulos. No se sustituye el constructor por una nave monolítica. El modelo fuente se muestra a la misma escala 5/3 y con la misma referencia vertical. `source-versions.json` registra hashes y procedencia de las cuatro exportaciones ODYSSEY nuevas.
