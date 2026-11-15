# Contribuir a SELENE-01

## Reglas de trabajo
Todo cambio nuevo nace en un issue y una rama feature/*, art/*, fix/* o docs/*. Abrir Pull Request, adjuntar capturas cuando cambie el mundo, revisar con otra persona y ejecutar las comprobaciones de CI. No modificar main directamente.

## Pasos
    git clone https://github.com/WILLIAMMDN/SELENE-01.git
    cd SELENE-01
    npm ci
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
Compartir el repositorio público permite clonarlo. Los compañeros sin permisos de escritura pueden trabajar en un fork y proponer un Pull Request; no es obligatorio invitarlos. Ver [la guía de colaboración](docs/COLLABORATION.md). El propietario puede dar acceso de escritura desde Settings → Collaborators si lo decide. La protección de main depende de los Rulesets configurados en GitHub, no de este documento.
