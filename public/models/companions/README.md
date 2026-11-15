# TARS — modelo animado proporcionado por el usuario

Origen actual: `TARS01.glb (adjunto del equipo)`, copiado a `tars_selene01.glb` para mantener la ruta de integración. El adjunto TARS01.glb contiene cuatro mallas, cuatro materiales y cinco clips; reemplaza la versión TARS.glb anterior. Tamaño del nuevo adjunto: 613 352 bytes. El original de Downloads no se modifica.

El cargador conserva las texturas pintadas, los colores y la pantalla emisiva, aplica sombreado de tres tonos, coloca el origen a los pies y normaliza la altura a 1,85 m. Cada compañero usa una copia independiente del esqueleto y su mezclador de animación. TARS_Idle, TARS_Walk y TARS_Run_Wheel se alternan con transiciones al detenerse, caminar y correr. El desplazamiento horizontal del hueso Root se mantiene fijo para no duplicar el movimiento del seguimiento. Se conserva el movimiento vertical y la rotación de rueda. TARS_Jump y el clip genérico permanecen en el GLB, sin activar porque el juego todavía no tiene salto. Movimiento reducido pausa el reposo automático.

TarsCompanions admite hasta cuatro avatares identificados; la escena actual proporciona uno. Los cuatro cuadernos locales permanecen separados en sessionStorage. No hay multijugador ni IA generativa conectada. El sustituto provisional solo se muestra durante la carga o si el modelo falla.

No se hicieron capturas ni pruebas de navegador de esta actualización. La lectura estructural del adjunto permitió conectar sus mallas y nombres de animación.

La altura de 1,85 m es una decisión de diseño del compañero ficticio; no se atribuye a NASA. El desplazamiento animado sigue las velocidades ajustadas del tripulante.

La URL de carga usa la versión tars01-2 para evitar que el navegador reutilice el modelo anterior. Se conserva la escala de 1,85 m del proyecto.
