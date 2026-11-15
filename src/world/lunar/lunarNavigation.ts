import layout from './lunarLayout.json'
import { createCollisionGrid } from '../navigation/collision'
import { landingPadHeight } from '../environmentLayout'
import type { Sector } from '../worldData'
import { LUNAR_BASE_LAYOUT, lunarBaseClear, lunarBaseFloor } from './lunarBaseNavigation'

const grid = layout.terrain
export const LUNAR_LANDER = { x: -84, z: 78 }
export function lunarTerrainHeight(x: number, z: number) {
  const gx = Math.max(0, Math.min(grid.columns - 1.001, (x - grid.minX) / grid.step))
  const gz = Math.max(0, Math.min(grid.rows - 1.001, (z - grid.minZ) / grid.step))
  const ix = Math.floor(gx),
    iz = Math.floor(gz),
    tx = gx - ix,
    tz = gz - iz
  const h = (dx: number, dz: number) => grid.heights[(iz + dz) * grid.columns + ix + dx]
  return (h(0, 0) * (1 - tx) + h(1, 0) * tx) * (1 - tz) + (h(0, 1) * (1 - tx) + h(1, 1) * tx) * tz
}
export function lunarHeight(x: number, z: number) {
  const deck = lunarBaseFloor(x, z)
  if (deck !== null) return deck
  const distance = Math.hypot(x - LUNAR_LANDER.x, z - LUNAR_LANDER.z)
  const ground = lunarTerrainHeight(x, z)
  if (distance >= 8.5) return ground
  const pad = landingPadHeight(LUNAR_LANDER.x, LUNAR_LANDER.z, lunarTerrainHeight)
  return distance <= 6 ? pad : ground + ((pad - ground) * (8.5 - distance)) / 2.5
}
const clear = createCollisionGrid([
  ...layout.colliders.filter(
    (_, index) => !LUNAR_BASE_LAYOUT.replacedColliderIndices.includes(index),
  ),
  { x: LUNAR_LANDER.x, z: LUNAR_LANDER.z, hx: 2.6, hz: 2.6 },
])
export function lunarCanWalk(x: number, z: number) {
  return Math.abs(x) < 148 && Math.abs(z) < 148 && clear(x, z) && lunarBaseClear(x, z)
}
export const LUNAR_SECTORS: Sector[] = [
  {
    id: 'research',
    number: '01',
    name: 'Laboratorio lunar',
    short: 'Laboratorio',
    x: 52.73,
    z: 83.44,
    entry: [56.3, 85.49],
    color: '#7d9298',
    title: 'Preguntas desde la superficie.',
    description: 'El módulo LAB-L01 forma parte de la base ODYSSEY.',
    detail:
      'Entra por la rampa o por los pasillos del hábitat. Puedes recorrer el laboratorio y su equipo de análisis.',
    chapter: 'LABORATORIO',
  },
  {
    id: 'hangar',
    number: '02',
    name: 'Hábitat y almacén',
    short: 'Base lunar',
    x: 63,
    z: 78,
    entry: [63.52, 81.08],
    color: '#b5987c',
    title: 'Un lugar al que volver.',
    description: 'Hábitat HAB-L01, almacén STO-L01 y corredores de la base.',
    detail:
      'Puertas automáticas, hábitat, almacén y laboratorio conectados por pasillos transitables. Acércate al acceso para abrir la puerta.',
    chapter: 'BASE ODYSSEY',
  },
  {
    id: 'control',
    number: '03',
    name: 'Unidad de energía',
    short: 'Energía',
    x: 47.5,
    z: 78,
    entry: [47.5, 73],
    color: '#628c8a',
    title: 'Desplegar la energía.',
    description: 'PWR-L01 conserva la secuencia original de despliegue de paneles.',
    detail:
      'Puedes desplegar y recoger sus paneles desde este puesto. La animación no modifica el presupuesto de tu orbitador.',
    chapter: 'PANELES SOLARES',
  },
  {
    id: 'launch',
    number: '04',
    name: 'Explanada de descenso',
    short: 'Descenso L01',
    x: -84,
    z: 78,
    entry: [-84, 86],
    color: '#b5846c',
    title: 'Llegada a la Luna.',
    description: 'La cápsula L01 ocupa la explanada de aterrizaje del terreno original.',
    detail: 'Reproduce el descenso y la separación de la cápsula de ascenso.',
    chapter: 'DESCENSO',
  },
  {
    id: 'observatory',
    number: '05',
    name: 'Cuenca del cráter',
    short: 'Cráter',
    x: 26,
    z: -63,
    entry: [26, -63],
    color: '#7d9298',
    title: 'Leer el paisaje.',
    description: 'Un cráter del terreno artístico proporcionado con la base.',
    detail:
      'Explora el relieve, las rocas y la zona de investigación. No corresponde a una localización lunar medida.',
    chapter: 'EXPLORACIÓN',
  },
]
export function lunarStationAt(x: number, z: number) {
  const sector = LUNAR_SECTORS.find((s) => Math.hypot(x - s.entry[0], z - s.entry[1]) < 3)
  return sector
    ? { sector: sector.id, room: sector.id, x: sector.entry[0], z: sector.entry[1] }
    : undefined
}
