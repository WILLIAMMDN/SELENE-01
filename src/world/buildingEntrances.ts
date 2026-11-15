import { CAMPUS_BUILDINGS } from './campusLayout'

// Visit the exterior approach, then walk through the actual automatic door.
// Energy equipment and the landing platform have no habitable room.
export const BUILDING_ENTRANCES = CAMPUS_BUILDINGS.filter(
  (b) => b.floors.length && b.id !== 'habitat',
).map((b) => {
  const floor = b.floors[0]
  const door = b.doors.find((d) => d.hx > 0.3 && d.z > floor.z)!
  return {
    id: b.id,
    label: b.id === 'airlock' ? 'Hábitat y esclusa' : b.label,
    point: [b.x + door.x, b.z + door.z + 2.1] as [number, number],
  }
})
BUILDING_ENTRANCES.push({ id: 'hangar', label: 'Hangar ODYSSEY', point: [24, -3.5] })
export function roomLabel(id: string) {
  if (id === 'habitat') return 'Hábitat de la tripulación'
  return BUILDING_ENTRANCES.find((b) => b.id === id)?.label ?? 'Interior'
}
