# Trabajar juntos en SELENE-01

La versión compartida está en `main`: incluye Tierra, Marte y la campaña lunar. Crear una rama propia desde `main` para cada modificación.

## Descargar y ejecutar

Instalar Node.js 22.12 o posterior de la rama 22, Git y un navegador con WebGL2. Blender solo hace falta para modificar los recursos 3D.

```sh
git clone https://github.com/WILLIAMMDN/SELENE-01.git
cd SELENE-01
npm ci
npm run dev -- --host 127.0.0.1 --port 5174
```

Abrir http://127.0.0.1:5174/?world=earth o cambiar el parámetro a `mars`. No requiere servicios de pago, claves API ni archivos de Downloads para jugar. Los GLB del juego y la fuente se incluyen. `npm ci` usa las versiones de package-lock.json; no editar ese archivo a mano.

WASD/flechas: desplazarse. Shift: correr. Espacio: saltar. E: interactuar. M: mapa. J: bitácora. Escape: menú. Objetivos, diseño y resultados se guardan en el navegador de cada persona, no se sincronizan por GitHub.

## Proponer cambios sin permisos de escritura

Compartir el enlace de un repositorio público permite leerlo y clonarlo; no concede permiso para subir cambios directamente. Cualquier compañero puede crear un **fork** en GitHub y enviar un Pull Request al proyecto:

1. Crear el fork y clonarlo. Añadir el original como remoto `upstream`.
2. Traer la rama actual y crear una rama propia para un cambio concreto.
3. Publicar esa rama en el fork y abrir un PR al repositorio original.

```sh
git remote add upstream https://github.com/WILLIAMMDN/SELENE-01.git
git fetch upstream
git switch -c feature/mi-cambio upstream/main
# Editar archivos, después:
npm test
npm run build
git add ruta/del/archivo
git commit -m "feat: describir el cambio"
git push -u origin feature/mi-cambio
```

Crear ramas desde `main` y dirigir los PR a `main`. Enlazar un issue y pedir revisión a otra persona. Quien ya tenga permiso de escritura puede usar una rama propia del repositorio original, sin fork. No compartir contraseñas ni sobrescribir ramas con force-push.

## Dónde editar

| Área | Archivos principales |
| --- | --- |
| Reglas de misión y operaciones | `src/game/missionDesign.ts` |
| Progreso, revisión y persistencia | `src/game/campusMission.ts` |
| Historia, estaciones y diálogos | `src/world/StoryDialogue.tsx`, `MissionStation.tsx` |
| Pantallas y controles | `src/world/WorldExperience.tsx`, `notebook.css`, `src/styles.css` |
| Distribución y navegación | `src/world/campusLayout.ts`, `buildingNavigation.ts`, `environmentLayout.ts` |
| Terreno, vegetación y atmósfera | `src/world/Environment.tsx`, `ArtKit.tsx`, `IllustratedTrees.tsx` |
| Mundos y escalas | `src/world/worldConfig.tsx`, `worldData.ts`, `physicalScale.ts` |
| TARS y conocimiento local | `src/robot/` |
| Nave, plataforma y cápsula | `src/spacecraft/` |
| Modelos y procedencia | `public/models/`, con README por grupo |
| Exportadores de Blender | `tools/` |

Repartir tareas por área; evitar que dos personas reexporten el mismo GLB a la vez, porque Git no puede combinar su contenido binario. Actualizar el README del asset si cambia escala, origen, animaciones o licencia. Mantener colores mates, sombras por tonos, líneas de tinta y texto bajo demanda.

## Modelos y archivos editables

El repositorio contiene los GLB usados por la aplicación. Los archivos fuente `.blend`, `.rar` y los respaldos completos permanecen en la copia local del responsable; compartirlos por separado cuando alguien vaya a editar esos recursos. Se pueden importar los GLB en Blender, aunque no conservan todas las propiedades del archivo fuente.

Los tres árboles animados y su manifiesto se incluyen con la autorización expresa del responsable, quien confirma su autoría. Ver `public/models/trees/README.md`. Quaternius mantiene CC0 y Patrick Hand conserva OFL en su carpeta. Los modelos aportados por el equipo mantienen su procedencia documentada; el repositorio no les aplica una licencia CC0 ni una nueva licencia global.

Ejemplo de exportación de animales (Blender 5.3; reemplazar ejecutable y ruta):

```sh
blender --background --factory-startup --disable-autoexec --python tools/export_animals.py -- /ruta/animales.blend
```

## Alcance y validación

El recorrido principal es investigación → ensamblaje → revisión en comunicaciones → autorización de lanzamiento → tres decisiones de operaciones → informe. Marte es un escenario de exploración con demostración de descenso; no una segunda campaña completa. Los cuatro cuadernos de tripulación son locales, no multijugador. Los números de diseño son una simulación educativa: ver `docs/NASA_INTEGRATION.md` y `docs/PHYSICAL_SCALE.md` para fuentes y supuestos.

Antes de enviar un PR ejecutar `npm test` y `npm run build`. GitHub Actions repite ambos con Node 22 y `npm ci`. El equipo debe revisar visualmente materiales, animaciones, interiores y rendimiento; la publicación no certifica esas comprobaciones. Compartir el código en GitHub no publica por sí mismo un sitio web jugable.
