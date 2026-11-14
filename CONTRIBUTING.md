# Colaborar en SELENE-01

## Primer acceso
1. El responsable del repositorio invita a las otras cinco cuentas desde **Settings → Collaborators → Add people**. Cada persona acepta su invitación.
2. Instala Node.js 22.12+ y Git; clona el proyecto e instala paquetes con `npm install`.
3. Revisa [TEAM](docs/TEAM.md), [GAME_DESIGN](docs/GAME_DESIGN.md) y los issues abiertos.

## Trabajar sin sobrescribir a nadie

Nunca se trabaja directamente en `main` para nuevas funciones. Desde la versión reciente de `main`, crea una rama corta:

```bash
git checkout main
git pull origin main
git switch -c feat/escena-invernadero
npm install
npm run dev
```

Al terminar:

```bash
npm run build
npm test
git add .
git commit -m "feat: agregar invernadero lunar"
git push -u origin feat/escena-invernadero
```

En GitHub: **Compare & pull request** → describe qué cambiaste, capturas, issue relacionado y cómo verificaste que funciona → solicita una revisión → integra después de aprobar. Una persona no debe aprobar su propio código como única revisión.

## Convenciones
- Ramas: `feat/`, `fix/`, `docs/`, `art/`, `test/`.
- Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Código: TypeScript estricto; componentes pequeños, reglas de simulación puras.
- No subir `node_modules`, `dist`, contraseñas, tokens ni archivos gigantes que no usa el juego.
- Para modelos: `public/models/<sector>/<nombre>.glb`; adjunta fuente/licencia/autor y presupuesto de polígonos.
- Los recursos numéricos de simulación son índices educativos, no medidas físicas reales.
- Resolver conflictos de Git localmente; no forzar `main` sin coordinación.

## Criterios mínimos de Pull Request

- [ ] La descripción explica el propósito y enlaza un issue.
- [ ] `npm run build` y `npm test` terminan correctamente.
- [ ] Cambios visuales incluyen captura y revisión en móvil.
- [ ] No se incluyeron secretos ni materiales sin licencia.
- [ ] Al menos una persona distinta revisa antes del merge.

## Configuración sugerida de GitHub
- Proteger `main` mediante ruleset/branch protection: impedir force-push y eliminación, requerir Pull Request y al menos 1 aprobación; si el plan y permisos lo permiten, exigir la acción de CI.
- Abrir issues para tareas y usar un tablero Projects opcional; los issues se pueden asignar luego a cada usuario.
- No marcar como hecho el despliegue público hasta verificarlo.
