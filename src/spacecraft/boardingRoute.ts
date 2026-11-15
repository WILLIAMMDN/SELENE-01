import { ODYSSEY_SCALE } from '../world/physicalScale'
// Independent from the renderer to keep world navigation rules testable in Node.
const LAUNCH_SITE = { x: 61, z: -75 } as const

export const SUIT_POINT = { x: 70, z: -35 }
export const LIFT = { x: 80, z: -84 }
export const HATCH = { x: 62, z: -84 }
export const DECK_HEIGHT = 40.3 * ODYSSEY_SCALE
export const CABIN = { x: LAUNCH_SITE.x, y: DECK_HEIGHT + 5, z: LAUNCH_SITE.z - 1 }

export const STAIR_START = -70
export const STAIR_END = -82
export const STAIR_COUNT = 12
export const STAIR_RISE = 0.14
export const STAIR_TOTAL_HEIGHT = STAIR_COUNT * STAIR_RISE

export type BoardingPhase =
  | 'idle'
  | 'suiting'
  | 'access'
  | 'ascending'
  | 'bridge'
  | 'cockpit'
  | 'flight'

export type BoardingMotion = { lift: number }

export const nearSuit = (x: number, z: number) =>
  Math.hypot(x - SUIT_POINT.x, z - SUIT_POINT.z) < 2.9
export const nearLift = (x: number, z: number) => Math.hypot(x - LIFT.x, z - LIFT.z) < 1.9
export const nearHatch = (x: number, z: number) => Math.hypot(x - HATCH.x, z - HATCH.z) < 2.7

/** A short real stepped approach before the high service lift. */
export function boardingStairHeight(x: number, z: number) {
  if (Math.abs(x - LIFT.x) > 2.4 || z > STAIR_START) return 0
  if (z <= STAIR_END) return STAIR_TOTAL_HEIGHT
  const steps = Math.floor((STAIR_START - z) / ((STAIR_START - STAIR_END) / STAIR_COUNT))
  return Math.min(STAIR_TOTAL_HEIGHT, Math.max(0, steps) * STAIR_RISE)
}

/** Guarded corridor from the LC-01 station to the tower and stair-lift access. */
export function onGroundRoute(x: number, z: number) {
  return (
    (x >= 60 && x <= 82 && z >= -38 && z <= -32) || (x >= 77.4 && x <= 82.6 && z >= -87 && z <= -32)
  )
}

/** The raised crew bridge is player-walkable; the rest of the launch pad is not. */
export function onCrewBridge(x: number, z: number) {
  return x >= 60.5 && x <= 81.3 && z >= -85.45 && z <= -82.55
}
