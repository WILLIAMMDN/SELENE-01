# Recursos integrados el 15 de noviembre de 2026

## Accesos

Servidor local: http://127.0.0.1:5174/?world=earth. En el menú están Vestuario y gestos, Cielo y clima, y los destinos Tierra, Marte y Luna. La Luna también abre con `?world=moon`.

En el mapa terrestre, Mirador → Ir a la entrada permite acceder a la estación y abrir los mecanismos del observatorio. También se puede pulsar su modelo. En la Luna, el mapa ofrece Laboratorio, Base lunar, Energía, Descenso y Cráter; E abre la ficha o los mecanismos desde cada puesto. El panel de Energía controla el despliegue original; Descenso abre las secuencias de la L01.

## Responsabilidades y procedencia

- `world/wardrobe.ts`: selección validada y persistida, independiente de la misión; `ExplorerCharacter` conserva rig, ropa, rostro y clips. Barrera de error local para recuperar el avatar clásico sin desmontar el mundo.
- `world/sky/`: adaptación del runtime incluido en el ZIP; nubes de planos ilustrados instanciados, ciclo y clima. Solo Tierra.
- `world/observatoryLayout.ts`: posición y colisión compartidas. La demostración no reemplaza el informe de misión.
- `world/lunar/`: render del recurso original, navegación con alturas exportadas y acciones de energía. Ningún módulo BASEPRI terrestre se dibuja ni se usa como colisión lunar.
- `tools/export_*.py`: exportaciones sin sobrescribir los originales, con autoejecución de scripts embebidos desactivada.

Los archivos `.blend` y ZIP originales permanecen en Downloads. Todos los recursos que carga el navegador están en el proyecto. No se introducen dependencias nuevas ni se cambian las claves de misión, diseño u operaciones. No se atribuye aval NASA ni licencia nueva a los adjuntos del usuario.

## Corrección del error de escena

La exportación inicial de vestuario mezclaba la escena principal y la de estudio. Una malla acababa compartida entre un nodo normal y otro con esqueleto, sin atributos de pesos. Se restringió la exportación a la escena principal y se preservaron pesos y morph targets. El fallo de una vestimenta se aísla y recupera el personaje clásico. El aviso de pantalla completa que atribuía cualquier error a la aceleración gráfica se retiró; los fallos generales se registran en consola y ofrecen un control discreto para recuperar la vista.

## Alcance de esta entrega

Los modelos tienen navegación exterior conservadora; abrir cúpula o puertas de la base lunar no habilita interiores nuevos. Las animaciones representan mecanismos, no trayectorias físicas ni seguimiento astronómico calculado. Las prendas no son equipo espacial certificado y cambiar ropa no altera las reglas de misión.

Antes de que el usuario pidiera detener las pruebas, pasaron las 58 pruebas existentes y una compilación de una versión intermedia. Después de esa instrucción no se ejecutaron más suites, capturas ni recorridos de juego. Se corrigieron los errores de TypeScript mediante compilación estática. Esto no valida visualmente los cambios posteriores, ni garantiza rendimiento. El servidor queda disponible para la revisión del usuario. No se lanza CI remoto para evitar ejecutar pruebas contra su instrucción.

## Ampliación: piloto, herramientas y segunda revisión del cielo

`Piloto_Astronauta_Editable.blend` se integra como identidad seleccionable en Vestuario y gestos; comparte rig, escala, controles y nueve clips, conservando su rostro, piel, cabello y ropa. `herramientas-tierra.blend` se integra en el taller terrestre (29, 21), con cofre y ocho secuencias sincronizadas; el mapa lleva al punto de interacción. Las herramientas se demuestran frente al cofre, no se equipan en la mano ni cambian la campaña.

El cielo ya no repite una sola silueta: cuatro recetas originales de cúmulos y bancos de horizonte, luces y sombras pintadas; cuatro llamadas de dibujo para las nubes y 36/20 instancias según calidad, movimiento a 10 Hz. Las referencias web se documentan en `src/world/sky/README.md`; no se incluyen imágenes ajenas. Sin medidas de FPS ni revisión visual automatizada.
