import { CAMPUS_BUILDINGS } from './campusLayout'
import { buildingAt } from './buildingNavigation'

export const AIRLOCK_MODULE = CAMPUS_BUILDINGS.find((b) => b.id === 'airlock')!
// Standing space in front of the existing cabinet on the airlock's right wall.
export const AIRLOCK_WARDROBE = {
  x: AIRLOCK_MODULE.x + 0.15,
  z: AIRLOCK_MODULE.z - 0.111055,
  radius: 1.65,
}
export function canUseWardrobe(x: number, z: number, world: string) {
  return (
    world === 'earth' &&
    buildingAt(x, z, true) === 'airlock' &&
    Math.hypot(x - AIRLOCK_WARDROBE.x, z - AIRLOCK_WARDROBE.z) < AIRLOCK_WARDROBE.radius
  )
}
export function handleWardrobeKey(
  event: Pick<KeyboardEvent, 'code' | 'repeat' | 'preventDefault'>,
  x: number,
  z: number,
  world: string,
  onOpen?: () => void,
) {
  if (!onOpen || event.code !== 'KeyE' || event.repeat || !canUseWardrobe(x, z, world)) return false
  event.preventDefault()
  onOpen()
  return true
}
