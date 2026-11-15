import { lunarDeckAt } from './lunarInteriorNavigation'

export const LUNAR_WORKSTATIONS = [
  { id: 'lab', room: 'LAB-L01', name: 'Mesa de análisis', x: 51.613, z: 84.328 },
  { id: 'storage', room: 'STO-L01', name: 'Inventario de muestras', x: 75.23, z: 78.105 },
] as const

export function lunarWorkstationAt(x: number, z: number) {
  const room = lunarDeckAt(x, z)?.room
  return LUNAR_WORKSTATIONS.find(
    (station) => station.room === room && Math.hypot(station.x - x, station.z - z) <= 0.92,
  )
}

export type LunarWorkstationId = (typeof LUNAR_WORKSTATIONS)[number]['id']
