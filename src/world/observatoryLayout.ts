import type { BoxCollider } from './navigation/collision'

// Beside the existing mirador; front door faces the observation terrace.
export const OBSERVATORY = { x: -51, z: 55, rotation: Math.PI, groundOffset: 0.14 }
export const OBSERVATORY_ACTIONS = [
  ['Obs_Open_Sequence', 'Abrir observatorio'],
  ['Obs_Track_Sky', 'Seguir el cielo'],
  ['Obs_Full_Rotation', 'Girar la cúpula'],
  ['Obs_Close_Park', 'Cerrar y estacionar'],
] as const
// Exterior demonstration: conservative footprint includes the side annex and steps.
// Door animations do not grant interior navigation.
export const OBSERVATORY_COLLIDERS: BoxCollider[] = [
  { x: OBSERVATORY.x - 1, z: OBSERVATORY.z - 0.23, hx: 5.78, hz: 5.02 },
]
