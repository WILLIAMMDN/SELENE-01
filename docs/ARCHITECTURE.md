# Arquitectura técnica

## Principios
La aplicación es una SPA estática escrita en TypeScript. El renderizado 3D vive dentro del `Canvas` de React Three Fiber y la interfaz HTML en React. La lógica de misión es pura y se prueba sin navegador ni WebGL.

```text
src/
  App.tsx                 HUD, decisiones, informes y controles
  styles.css              diseño responsivo
  main.tsx                punto de entrada
  scene/LunarBase.tsx     terreno, hábitat, rover, paneles, astronauta
  game/simulation.ts      modelo de recursos, eventos y transiciones
  game/simulation.test.ts pruebas del modelo
  store/useMissionStore.ts estado reactivo (Zustand)
public/
  selene-icon.svg
docs/                      diseño, ciencia, equipo y planificación
.github/workflows/ci.yml   compilación y pruebas en Pull Requests
```

## Flujo
El usuario hace clic en una decisión → `useMissionStore.decide()` → `choose()` en el motor puro → React actualiza HUD → `advance()` invoca `nextSol()` → validación de recursos → siguiente escenario, victoria o derrota.

## Integración futura de recursos 3D
1. Crear o adaptar objeto en Blender con licencia apropiada.
2. Aplicar escala coherente, UV/materiales y reducir geometría.
3. Exportar `.glb`, optimizar texturas y tamaño.
4. Guardar en `public/models/` y cargarlo con `useGLTF('/models/...')`.
5. Mantener los prototipos geométricos como fallback o sustituirlos tras validar rendimiento.

## Rendimiento
Presupuesto inicial orientativo (a validar en dispositivos reales): 30–60 FPS en PC corriente y experiencia funcional en móvil. Controlar triángulos, draw calls, luces con sombras, texturas, DPR y memoria GPU. No usar materiales 4K en cada elemento. Probar teclado, tacto y accesibilidad del HUD.

## Seguridad y despliegue
No se requieren secretos, servidor ni cuentas de jugadores. CI ejecuta instalación, TypeScript, compilación y tests. Para publicar: generar `dist/` con `npm run build` y configurar un hosting estático. No afirmar persistencia o guardado en la nube hasta implementarlos.

## Decisiones pendientes
- Evaluar incorporación de Rapier si se agrega movimiento libre y colisiones reales.
- Elegir persistencia local para guardar avances; después, únicamente si es necesario, backend y cuentas.
- Establecer presupuesto de recursos/artes y decidir licencia con todo el equipo.
