# Contribuir a SELENE-01

## Reglas de trabajo
Todo cambio nuevo nace en un issue y una rama feature/*, art/*, fix/* o docs/*. Abrir Pull Request, adjuntar capturas cuando cambie el mundo, revisar con otra persona y ejecutar las comprobaciones de CI. No modificar main directamente.

## Pasos
    git clone https://github.com/WILLIAMMDN/SELENE-01.git
    cd SELENE-01
    npm install
    git switch -c feature/mi-funcion
    npm run build
    npm test
    git add .
    git commit -m "feat: integrar nueva funcion"
    git push -u origin feature/mi-funcion

Luego abrir PR a main y enlazar el issue. Requerir revisión antes de mezclar.

## Estilo y seguridad
TypeScript estricto. Lógica de simulación en funciones puras. Fuentes científicas verificables. No afirmar que los números inventados son datos NASA; nunca copiar logos oficiales para marca. No subir secretos, node_modules, dist ni modelos pesados sin presupuesto. Cada GLB nuevo requiere autor, licencia, revisión visual, ubicación, escala, colisiones y medición de rendimiento.

## Accesos
El responsable debe invitar cinco usuarios de GitHub desde Settings → Collaborators, y activar Rulesets para main con PR obligatorio, una aprobación y bloqueo de force-push. La conexión de GitHub utilizada para crear estos archivos no puede modificar administrativamente esa configuración ni adivinar las cuentas de los compañeros.
