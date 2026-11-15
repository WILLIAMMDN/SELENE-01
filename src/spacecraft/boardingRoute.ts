import { ODYSSEY_SCALE } from '../world/physicalScale'
// Keep route coordinates dependency-free to avoid a cycle with worldData -> ArtKit.
const LAUNCH_SITE = { x: 61, z: -75 } as const

/** Distances in metres, in the shared Artemisa campus coordinates. */
export const LIFT = { x: 80, z: -84 }
export const HATCH = { x: 62, z: -84 }
export const DECK_HEIGHT = 40.3 * ODYSSEY_SCALE
export const CABIN = { x: LAUNCH_SITE.x, y: DECK_HEIGHT + 5, z: LAUNCH_SITE.z - 1 }

export type BoardingPhase = 'idle' | 'access' | 'ascending' | 'bridge' | 'cockpit' | 'flight'

export type BoardingMotion = { lift: number }

export const nearLift = (x: number, z: number) => Math.hypot(x - LIFT.x, z - LIFT.z) < 3.1
export const nearHatch = (x: number, z: number) => Math.hypot(x - HATCH.x, z - HATCH.z) < 2.7

/** Secure L-shaped pedestrian route from station LC-01 around the vehicle. */
export function onGroundRoute(x: number, z: number) {
  return (
    (x >= 60 && x <= 82 && z >= -38 && z <= -32) || (x >= 77.4 && x <= 82.6 && z >= -87 && z <= -32)
  )
}

/** The raised bridge is player-walkable; the rest of the launch pad is not. */
export function onCrewBridge(x: number, z: number) {
  return x >= 60.5 && x <= 81.3 && z >= -85.45 && z <= -82.55
}
