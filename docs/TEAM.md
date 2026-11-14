# Organización del equipo — 6 integrantes

Los siguientes son **roles propuestos**, no asignaciones definitivas. El coordinador los relacionará con usuarios de GitHub cuando todos acepten la invitación.

| Integrante | Rol principal | Primer entregable | Rama recomendada |
|---|---|---|---|
| 1 | Product owner, coordinación e integración | Revisar objetivos, gestionar issues y PR, controlar entregables | `docs/planificacion` |
| 2 | Dirección artística y UI/UX | Moodboard, guía de estilo, propuestas de HUD | `art/direccion-visual` |
| 3 | Modelado 3D y animación | Astronauta y un módulo GLB optimizado | `art/personaje-base` |
| 4 | Gameplay y narrativa | Diálogos, guía de misión y eventos | `feat/narrativa` |
| 5 | Simulación científica y QA | Auditoría de supuestos y pruebas del motor | `test/simulacion` |
| 6 | Frontend 3D, integración y despliegue | Interactividad del mundo, rendimiento y publicación | `feat/interacciones-3d` |

**Ritmo sugerido:** una reunión breve de coordinación por semana, avances asíncronos mediante issues, al menos un revisor distinto por Pull Request y revisión semanal de una demo funcional.

## Definición de terminado
Una tarea se completa cuando tiene su código/arte/documento en el repositorio, fue revisada, cumple criterios del issue y no rompe build ni tests. Las tareas de arte requieren además procedencia de licencias, captura y prueba de rendimiento.

## Invitaciones
Solo el propietario puede invitar directamente a colaboradores desde la configuración del repositorio. Evitar compartir credenciales. El acceso se hace mediante cuentas personales y permisos de colaboración.

## Acuerdos
- No sobrescribir ni modificar la rama de otro integrante sin coordinar.
- No aprobar entregables sin abrirlos y verificar su funcionamiento.
- Avisar antes de introducir dependencias nuevas o cambiar el modelo de recursos.
- Registrar las decisiones técnicas importantes en `docs/ARCHITECTURE.md`.
