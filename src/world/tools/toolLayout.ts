export const TOOL_STATION = { x: 31, z: 23, height: 0.45, entry: [31, 26] as [number, number] }
export const TOOL_ACTIONS = [
  ['Llave_Inglesa', 'Llave inglesa', 'Abre y ajusta la mandíbula.'],
  ['Destornillador', 'Destornillador', 'Gira el eje para mostrar su funcionamiento.'],
  ['Martillo', 'Martillo', 'Reproduce tres golpes de demostración.'],
  ['Alicates', 'Alicates', 'Abre y cierra las mordazas.'],
  ['Multimetro', 'Multímetro', 'Mueve el selector y las puntas de medición.'],
  ['Linterna', 'Linterna', 'Acciona el botón y enciende la lente.'],
  ['Cinta_Metrica', 'Cinta métrica', 'Extiende y recoge la cinta.'],
  ['Taladro', 'Taladro', 'Gira el mandril y la broca.'],
] as const
export const TOOL_COLLIDERS = [{ x: TOOL_STATION.x, z: TOOL_STATION.z, hx: 1.7, hz: 0.7 }]
