# ODYSSEY transitable y soporte vital

Los seis GLB suministrados se conservan en metros y con sus transformaciones originales. Las nueve instancias sustituyen las copias exteriores de HAB-L01, LAB-L01, STO-L01 y sus corredores. La unidad solar PWR-L01 conserva su modelo exterior y su animación.

El importador muestrea los pisos y las rampas, y comprueba el volumen del astronauta contra la geometría de las paredes y el equipamiento. Las hojas de las tres escotillas se comprueban aparte mientras se animan. El acceso por la escalera HAB usa un plano continuo de apoyo para que el movimiento no tropiece en cada peldaño.

Desde el mapa, viaja a Hábitat y almacén. Avanza por la rampa, pulsa E cerca de la escotilla y vuelve a cerrar desde el interior, una vez despejada la trayectoria de la hoja. En el juego, la red conectada queda en condición de recarga cuando las tres escotillas exteriores están cerradas. El rover abierto sigue usando el soporte vital del traje.

## Datos de referencia y valores del juego

- **Gravedad exterior e interior** de 1,62 m/s². Estar dentro de un módulo presurizado no cambia la gravedad. La Luna tiene una exosfera muy tenue. [NASA Glenn, Moon](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/moon/) · [NASA Science, Moon Facts](https://science.nasa.gov/moon/facts/)
- **Movilidad EVA** con aceleración gradual, control más débil durante el salto y velocidad reducida en interiores. Los valores de velocidad, impulso de salto y aceleración horizontal se ajustaron para el juego. NASA documentó cambios de equilibrio y locomoción en Apollo por la gravedad reducida y las restricciones del traje. [NASA NTRS, Lunar Balance and Locomotion](https://ntrs.nasa.gov/citations/20080014275)
- **Soporte vital portátil** con reserva de O₂ y batería, y un indicador de demanda de refrigeración y retirada de CO₂. La presión del traje y la presurización de cabina se representan como estados del escenario. Los 18 minutos de reserva nominal, el consumo por esfuerzo, la recarga y el rescate son reglas educativas. [NASA, Artemis Generation Spacesuits](https://www.nasa.gov/wp-content/uploads/2023/03/artemis-generation-spacesuits-508.pdf)

Para regenerar los datos y copiar las mallas desde el paquete original:

```powershell
node tools/import_lunar_interiors.mjs ../modelos/ODYSSEY_BASE_TRANSITABLE_FINAL
```
