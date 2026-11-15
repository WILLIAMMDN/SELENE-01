# Piloto editable

Fuente: `Piloto_Astronauta_Editable.blend`, aportada por el usuario. Variante de la base Quaternius: piel marrón, cabello corto rizado, uniforme azul y traje EVA marfil. Se conserva la procedencia de la base CC0; no se atribuye otra licencia a las ediciones aportadas.

`pilot.glb` se exporta solo de la escena principal, sin estudio, cámaras, luces ni cubo. Mantiene el rig, el rostro con morph targets, uniforme formal, EVA con casco opcional y ropa de campus. Escala corporal común basada en 1,80 m civil. La misma selección de vestuario sirve para Exploradora y Piloto, con identidad persistida. Al elegir Piloto se usa uniforme en Tierra y EVA en Luna/Marte cuando la selección previa era clásica.

Clips: Idle, Walk, Run, PickUp, Punch, ReceiveHit, SitDown, Saludar y MirarAlrededor. Se conectan a locomoción, sentarse y gestos existentes. El traje no introduce una simulación de soporte vital. El casco no modifica la colisión horizontal del personaje.

Exportador: `tools/export_wardrobe.py`, detecta la fuente del piloto y escribe una carpeta independiente. Original intacto. Revisión visual y pruebas de juego a cargo del usuario.
