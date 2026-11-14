# SELENE-01 🚀

**Entrenador de misión lunar** — videojuego educativo 3D en navegador. Un equipo de seis estudiantes construye una experiencia de exploración y gestión en la que las decisiones sobre energía, oxígeno, agua, alimentos y seguridad determinan la supervivencia de una base lunar.

**Estado:** prototipo jugable v0.1, con un escenario 3D generado por código y cinco soles de entrenamiento. **No es aún el videojuego completo ni una representación científica validada.**

## Inicio rápido

Requisitos: **Node.js 22.12+** y npm (recomendado Node 22 LTS actualizado).

```bash
git clone https://github.com/WILLIAMMDN/SELENE-01.git
cd SELENE-01
npm install
npm run dev
```

Abre la URL local mostrada por Vite (usualmente http://localhost:5173). Rota la cámara arrastrando y haz zoom con la rueda. Elige una de las tres acciones por sol; observa cómo cambian los recursos, lee la explicación y avanza. El objetivo es completar cinco soles sin que ningún recurso llegue a cero.

Comandos: `npm run dev` (desarrollo), `npm run build` (comprobación TypeScript + compilación), `npm test` (reglas del simulador), `npm run preview` (vista previa de producción).

## Tecnologías

- **React 19 + TypeScript:** interfaz, accesibilidad y flujo de decisiones.
- **Three.js + React Three Fiber + Drei:** escenario lunar 3D, iluminación, cámara y prototipos geométricos.
- **Zustand:** estado de la misión.
- **Vite:** desarrollo, compilación y publicación como web estática.
- **Vitest:** pruebas del motor educativo.
- **Blender (fase de arte):** edición de modelos y exportación GLB/glTF, *no requerido para ejecutar esta primera versión*.

La versión actual no necesita backend, base de datos, pagos ni claves API. El progreso no se guarda todavía al recargar.

## Repositorio para seis integrantes

| Área | Entregables principales | Carpeta |
|---|---|---|
| 1. Coordinación e integración | Planificación, revisión de PR, integración | `docs/`, `.github/` |
| 2. Arte y dirección visual | Guía de estilo, ambientes, materiales, luces | `src/scene/`, `docs/ART_DIRECTION.md` |
| 3. Modelado 3D | Personajes, estación, rover, GLB optimizados | `public/models/` (por crear) |
| 4. Gameplay y narrativa | Misiones, diálogo, tutorial y decisiones | `src/game/` |
| 5. Simulación y ciencia | Reglas, equilibrio de recursos, fuentes, pruebas | `src/game/`, `docs/SCIENCE.md` |
| 6. Frontend y publicación | HUD, responsividad, accesibilidad, hosting | `src/App.tsx`, `src/styles.css` |

Las áreas son responsabilidades, no exclusividad sobre carpetas. Los nombres concretos se asignarán cuando estén los usuarios del equipo. Ver [roles](docs/TEAM.md) y [contribución](CONTRIBUTING.md).

## Documentación

- [Concepto, historia y mecánicas](docs/GAME_DESIGN.md)
- [Arquitectura y decisiones técnicas](docs/ARCHITECTURE.md)
- [Dirección artística y pipeline 3D](docs/ART_DIRECTION.md)
- [Modelo de recursos y rigor científico](docs/SCIENCE.md)
- [Equipo y dinámica de trabajo](docs/TEAM.md)
- [Entregables y hoja de ruta](docs/ROADMAP.md)
- [Cómo hacer aportes y abrir Pull Requests](CONTRIBUTING.md)

## Publicación

El sitio compila como archivos estáticos en `dist/`. Se puede publicar en GitHub Pages, Cloudflare Pages, Firebase Hosting o servicios similares. En esta etapa **no hay publicación configurada**. Compilar antes de publicar.

## Créditos y uso responsable

Proyecto estudiantil independiente inspirado en la educación espacial. **No es un producto oficial ni está afiliado a NASA**. No incorporar logotipos, fotografías, tipografías, modelos 3D ni recursos externos sin verificar su licencia y condiciones de atribución. La licencia final del código se decidirá con el equipo; mientras tanto, no se ha añadido archivo `LICENSE`.
