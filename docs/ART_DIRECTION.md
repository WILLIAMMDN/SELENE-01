# SELENE-01 — Biblia de dirección visual
**Versión:** 1.0 (propuesta para revisión del equipo, 14/11/2026)  
**Nombre de la dirección:** **Illustrated Space Adventure**  
**Descripción técnica:** *3D hand-drawn anime aesthetic / stylized non-photorealistic rendering (NPR) + cel shading + ink outlines.*

> Esta guía se basa en las dos capturas de referencia aportadas por el equipo: un personaje de espaldas explorando calles tridimensionales, edificios de formas suaves, cielo turquesa, líneas oscuras imperfectas y colores mate. Las imágenes son una **referencia de tratamiento artístico**, no assets a copiar ni licencia para reproducir sus personajes, arquitectura o señales. Nuestra ambientación lunar tendrá diseño original.

## 1. En una frase
**«Un mundo lunar tridimensional que parece un cómic de aventura espacial dibujado a mano, pero que se puede explorar y manipular».**

No buscamos realismo PBR ni low-poly geométrico evidente. Buscamos escenarios ricos en detalles **gráficos**, superficies simples con sombreado por bandas, contornos tipo tinta y una cámara que transmita exploración y escala.

## 2. Descomposición objetiva de la referencia
| Rasgo visible de las capturas | Interpretación de diseño | Aplicación lunar |
|---|---|---|
| Personaje de espaldas, cuerpo completo | Escala humana y lectura inmediata en tercera persona | Astronauta jugable con mochila de soporte vital y visor reconocible |
| Bordes negros/grises ligeramente temblorosos | Dibujo a tinta, no alambre técnico de polígonos | Siluetas y detalles arquitectónicos pintados o trazados |
| Edificios llenos de carteles, ventanas y pequeñas marcas | Complejidad visual mediante detalles secundarios | Tramas de módulos, señalética de sectores, antenas, compuertas, cables |
| Colores turquesa, crema, verde apagado, burdeos | Paleta mate de saturación contenida | Blanco hueso, grafito, azul petróleo, coral y acentos turquesa |
| Superficies sin brillo metálico dominante | Ilustración pintada, con luz simplificada | Materiales toon, algunas texturas hand-painted y sombras suaves |
| Calle curva y edificios en profundidad | Mundo 3D legible, con perspectiva y puntos de interés | Senderos de regolito entre hábitat, energía, invernadero y observatorio |

**No copiar el cielo terrestre ni sus nubes.** La Luna no tiene una atmósfera que produzca cielos azules o nubes como la Tierra: la superficie exterior debe mostrar un cielo casi negro con el Sol y la Tierra cuando correspondan. El turquesa de la referencia se traslada a elementos diseñados (luz en paneles, interfaces, visores, habitáculos) y no a una atmósfera lunar inventada. Los espacios interiores pueden tener vistas de iluminación cálida.

## 3. Principios creativos obligatorios
1. **Silueta primero:** una captura sin texturas debe permitir identificar astronauta, hábitat, panel solar, rover y cultivo.
2. **Tres tonos, no infinitos:** color local + sombra definida + luz acentuada. Evitar gradientes fotorrealistas.
3. **Trazo visible, pero moderado:** el dibujo resalta contornos, aberturas y piezas clave; no entintar cada triángulo.
4. **Detalle con función:** pernos, números, uniones, luces e iconos ayudan a reconocer y navegar sectores.
5. **Personalidad sin sobrecarga:** formas algo caricaturescas, proporciones amables, animación expresiva, espacio para leer la UI.
6. **La ciencia y el arte conviven:** ficción narrativa y simplificación artística no deben presentarse como hechos físicos.

## 4. Paleta aprobable para el prototipo
Paleta propuesta, **no extraída pixel a pixel** de las capturas. Los hex son puntos de partida que se ajustarán con una captura A/B.

| Uso | Nombre | Hex | Instrucción |
|---|---|---|---|
| Cielo exterior | Negro espacial azulado | `#111B25` | fondo oscuro casi negro, sin nubes |
| Contornos | Tinta grafito | `#26343A` | azul-negro, no negro puro |
| Polvo lunar iluminado | Gris cálido | `#A8A59A` | amplias superficies mates |
| Polvo lunar en sombra | Pizarra lunar | `#6D797E` | dos bandas de color |
| Módulos y traje | Blanco papel | `#DCE0D5` | color dominante de estructuras |
| Detalles y paneles | Petróleo apagado | `#457D80` | continuidad con el turquesa de la referencia |
| Acciones/puntos de interés | Coral tierra | `#C67A5F` | una función de acento por pantalla |
| Seguridad/soporte vital | Verde salvia | `#7CA38B` | lectura de estados positivos |
| Pantallas y luz emitida | Agua luminosa | `#83CCC5` | aplicar de forma contenida |
| Peligro | Rojo óxido | `#A64E57` | alertas y consecuencias importantes |

**Regla práctica:** aprox. 70% neutros, 20% color secundario, 10% acentos en una escena; no es una restricción matemática. Materiales principalmente mates; excepción para vidrio del visor, cristal/solar y pantallas.

### Iluminación
- Una luz principal direccional con dirección clara y sombras controladas.
- Relleno suave para conservar lectura de zonas oscuras (licencia artística declarada, no simulación fotométrica).
- Dos o tres bandas de toon shading. Evitar brillos metálicos, bloom fuerte y ambient occlusion excesiva.
- En interiores, luces cálidas de servicio y pantallas frías para contraste narrativo.
- En exterior lunar, no añadir niebla atmosférica por defecto. Usar polvo únicamente como efecto **local** y justificado (por ejemplo, movimiento del rover).

## 5. Modelado 3D y personajes
**Modelos simplificados pero bien diseñados, no polígonos facetados a propósito.** Las formas deben ser suavizadas y las piezas grandes fáciles de reconocer; añadir detalle con siluetas auxiliares, líneas ilustradas y mapas ligeros.

### Astronauta protagonista
- Proporción ligeramente estilizada: cabeza/visor más grande para expresar emociones, extremidades legibles y mochila de soporte vital clara.
- En la primera vertical slice: caminar, detenerse, señalar/interactuar, mirar objeto y reacción al peligro.
- Color de traje `#DCE0D5`; visor en `#457D80`; acentos coral; guantes/ botas simplificados.
- Evitar reproducir el diseño del personaje de las capturas: solo se usa su tratamiento de cámara, silueta y dibujo.

### Escenario modular
- **Hábitat:** módulos redondeados y compuerta circular, ventanas pequeñas, antenas, señales pintadas.
- **Energía:** dos o tres conjuntos de paneles azules y baterías identificables.
- **Invernadero:** volumen protegido e iluminado; vegetación solo dentro.
- **Rover:** cuerpo compacto, ruedas grandes, antenas y luces.
- **Laboratorio / comunicaciones:** siluetas diferentes y señales sencillas con íconos originales.
- **Suelo:** relieve con cráteres suaves, huellas, marcas de rover y caminos de circulación.

### Texturas y líneas hand-painted
- Ilustrar a mano pequeñas rayas, marcas de mantenimiento, paneles y bordes en texturas o como decal.
- Variaciones controladas de tono, grano fino en superficies grandes, evitando ruido visual que compita con texto.
- No añadir líneas negras a todas las aristas geométricas: el objetivo es “dibujo animado” y no “modelo técnico wireframe”.

## 6. Render NPR: cómo lograremos el efecto en Three.js
**Motor elegido:** React + TypeScript + React Three Fiber / Three.js. **Software de arte:** Blender para modelado, rig, texturas y exportación GLB.

### A. Toon shading (primera implementación)
Usar `THREE.MeshToonMaterial` como baseline para materiales opacos, con `gradientMap` de 3 o 4 peldaños. En Three.js, `gradientMap` usa `NearestFilter` en min y mag para mantener escalones nítidos.

Los materiales básicos del prototipo actual usan mayormente `MeshStandardMaterial`; **todavía no implementan** la apariencia final. Cambiar el material por sí solo **no basta**.

### B. Bordes tipo tinta (hacer una prueba A/B)
- **Siluetas de personajes y arquitectura principal:** probar técnica *inverted hull* (malla duplicada, caras frontales descartadas y expansión de normales) **o** un contorno por postproceso según normales/profundidad.
- **Uniones seleccionadas y líneas de dibujo interior:** curvas/líneas explícitas en la geometría o texturas con líneas dibujadas.
- `EdgesGeometry` sirve para un **prototipo rápido** de algunas aristas, pero por sí sola produce líneas demasiado mecánicas y puede revelar polígonos; no usarla globalmente como acabado final.
- Grosor orientativo en imagen de referencia a 1080p: 1–3 píxeles para detalle, 2–4 para siluetas principales; adaptar a DPR, zoom y dispositivo. Probar sin contornos en objetos lejanos para preservar rendimiento.
- En una fase posterior, una ligera irregularidad controlada puede aportar naturalidad, pero evitar vibraciones molestas (“boiling lines”) en reposo.

### C. Color grading y composición
- Mantener contraste entre el personaje y el piso.
- Evitar reflejos realistas, sombras negras impenetrables y filtros cinematográficos pesados.
- UI clara y poco intrusiva; paneles de misión inspirados en instrumentación espacial, sin imitar HUD de obras ajenas.
- Comprobar color final en Chrome, Firefox y móvil.

**Referencias de implementación:**  
- Three.js MeshToonMaterial: https://threejs.org/docs/pages/MeshToonMaterial.html  
- Three.js EdgesGeometry: https://threejs.org/docs/pages/EdgesGeometry.html  
- React Three Fiber, modelos: https://r3f.docs.pmnd.rs/tutorials/loading-models  
- React Three Fiber, optimización: https://r3f.docs.pmnd.rs/advanced/scaling-performance

## 7. Cámara, exploración y composición
En las capturas se observa una **perspectiva 3D real desde detrás del personaje**, no una cámara ortográfica. Para la versión explorable:

- Cámara **PerspectiveCamera** con campo vertical inicial aproximado de **45–55°**.
- Seguimiento de tercera persona con suavizado; personaje preferentemente dentro del tercio central inferior.
- Altura ligeramente superior a la cabeza; libertad para girar y contemplar módulos; evitar que la cámara atraviese estructuras.
- Un punto de interés visual en el fondo (por ejemplo, observatorio iluminado o la Tierra), con una ruta principal visible.
- Durante una decisión narrativa, cambiar a un encuadre corto (compuerta, panel o astronauta), manteniendo los controles de decisión en HTML accesible.
- Para la primera prueba, se permite el actual control orbital; la locomoción de personaje es una **fase futura**.

## 8. Arquitectura visual de pantallas
1. **Inicio:** protagonista sobre una plataforma lunar; estación pequeña al fondo, planeta Tierra visible, título original.
2. **Exploración:** cámara tercera persona, edificios modulares, caminos, señalética y elementos interactivos.
3. **Misión:** viñeta con retrato dibujado del personaje asesor, tres decisiones claras y sus consecuencias.
4. **Peligro:** señalización coherente y animación del entorno, sin explosiones gratuitas.
5. **Bitácora:** mapa de sectores, conceptos científicos comprobados y registros de decisiones.

### Identidad de UI
- Tipografía principal legible, moderna, con titulares cortos; no sustituir lectura por símbolos decorativos.
- HUD: energía, oxígeno, agua, alimentos, integridad. Números accesibles sin depender solo de colores.
- Acentos tipo papelería/diagramas ilustrados: tarjetas crema, bordes oscuros moderados y pequeñas marcas.
- Nunca tapar el personaje, la acción o el horizonte de la escena.

## 9. Pipeline del equipo
```text
Capturas de referencia → Biblia visual → Concept art ORIGINAL
     ↓
Modelado modular + personajes en Blender
     ↓
UV + texturas pintadas + rig + animaciones
     ↓
Exportar GLB / glTF → prueba de geometría, escala y licencia
     ↓
React Three Fiber → toon shading + líneas + luz y cámara
     ↓
HUD HTML + interacciones + pruebas de rendimiento
     ↓
Capturas A/B + revisión grupal + Pull Request
```

### Convenciones
- Escala de unidad: 1 unidad ≈ 1 metro como guía para el equipo (salvo decisiones conscientes de caricaturización).
- Archivos: `public/models/sector/objeto.glb`, texturas con nombres descriptivos.
- Mantener fuentes Blender fuera de paquetes de producción si son muy pesadas; se almacenan de forma trazable y con permiso de redistribución donde corresponda.
- Registrar autor, fuente y licencia de cada asset. No extraer modelos ni texturas de los juegos de las referencias.
- Evitar personajes ultradetallados cuyo costo comprometa la web.

## 10. Primer objetivo: una escena vertical (visual slice)
**No empezaremos construyendo todo el mapa.** Haremos una escena pequeña capaz de demostrar el acabado:

**Composición:** un astronauta de espaldas ante el módulo habitable, con un camino curvo, paneles solares y rover a los lados; observatorio al fondo, Tierra visible sobre el horizonte y señalética original de la base.

**Elementos mínimos de prueba:**
- 1 astronauta con silueta original.
- 1 hábitat detallado, 1 solar, 1 rover.
- 1 terreno con textura pintada y tres tipos de marcas.
- 1 sistema de cel shading, 1 sistema de contornos y sombras controladas.
- Cámara tercera persona y al menos 1 interacción que abra el panel de misión.

**Criterios visuales de aceptación:**
- [ ] Al quitar el color, el escenario sigue siendo reconocible por silueta.
- [ ] Al alejar la cámara, el astronauta no se pierde contra el suelo.
- [ ] En una captura, las superficies parecen ilustradas y no PBR brillante.
- [ ] Los bordes no muestran todos los triángulos y no tiemblan de forma excesiva.
- [ ] El estilo de personaje, hábitat, rover e interfaz parece pertenecer a un mismo juego.
- [ ] Entorno lunar sin nubes, cielo azul ni vegetación exterior terrestre.
- [ ] No hay materiales de terceros sin licencia documentada.
- [ ] Se prueba una versión de escritorio y otra móvil; se registran FPS, tiempo de carga y problemas antes de aprobar.

## 11. Entregables por responsabilidad
| Rol | Entrega para aprobación del estilo |
|---|---|
| Dirección visual | Concept art original, 1 hoja de paleta, 1 hoja de siluetas y 2 mockups HUD |
| Modelado 3D | GLB del astronauta, hábitat y set inicial de módulos; versiones optimizadas |
| Frontend/render 3D | Material toon reutilizable, prueba de dos enfoques de outline, cámara y luz |
| Gameplay/narrativa | Prueba de interacción con hábitat y panel de elección integrado |
| Ciencia/QA | Lista de elementos ficticios versus hechos lunares, y pruebas visuales de coherencia |
| Coordinación/integración | Aprobación de estilo, presupuesto de assets, convención de archivos y PR review |

## 12. Qué debemos evitar
- ❌ **Realismo espacial genérico:** texturas metálicas brillantes, lens flares y bloom pesado.
- ❌ **Low poly sin dirección:** terreno facetado y figuras hechas solo de primitivas sin identidad.
- ❌ **Contornos automáticos indiscriminados:** todas las aristas marcadas igual generan “wireframe”.
- ❌ **Copiar el entorno terrestre literalmente:** calles, carteles y cielo turquesa fuera de contexto.
- ❌ **Construir 20 edificios antes de validar un módulo y un personaje.**
- ❌ **Confundir imágenes promocionales con una demo 3D funcional.**

## 13. Decisión de arquitectura
El prototipo actual sirve como prueba de **estructura técnica y mecánica educativa**, pero **no todavía como objetivo artístico**. Esta biblia sustituye la descripción vaga «aventura espacial estilizada» por un objetivo visual verificable. El primer paso de ejecución debe ser una escena A/B de un astronauta y un módulo con materiales toon y dos tratamientos de contornos; una vez aprobado, se escala al resto del mundo.

**Estado:** guía propuesta; su fusión a `main` debe validarla el equipo.


## 11. Adecuación al reto Space Mission Design Game

La guía original describía un escenario lunar de supervivencia (prototipo anterior). **En la campaña actual el centro de formación espacial y el campus están en la Tierra**, por lo que árboles, montañas y cielos turquesa son coherentes con el entorno. **La escena orbital** muestra espacio oscuro y superficie lunar sin atmósfera; no se deben añadir nubes terrestres sobre la Luna. Los diseños de hábitat y rover se conservan como referencias para expansiones, no como mecánicas centrales del juego.

**Entregables prioritarios de Blender:** campus terrestre, laboratorio de ingeniería, hangar, control, lanzador ficticio y orbitador; protagonista, Dra. Vega y robot TARS. Conservar el NPR, el cel shading, las siluetas y la paleta documentados arriba, evitando el aspecto de paneles holográficos excesivos.
