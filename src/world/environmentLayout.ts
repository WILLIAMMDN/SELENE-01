export const COAST = { x: -97, z: 10, rx: 18, rz: 40, water: -0.32 }
export const coastDistance = (x: number, z: number) =>
  Math.hypot((x - COAST.x) / COAST.rx, (z - COAST.z) / COAST.rz)
export const PARKING = [
  { x: 33, z: 43, hx: 6.98, hz: 4.74 },
  { x: 61, z: 31, hx: 3.88, hz: 4.74 },
]
export const SCENERY_BLOCKERS = [
  { x: 87, z: -13, hx: 2.65, hz: 2.65 },
  { x: 30, z: 43, hx: 1.2, hz: 2.2 },
  { x: 61, z: 31, hx: 1.3, hz: 2.5 },
  { x: 30, z: 20, hx: 1.1, hz: 1.8 },
]
export const sceneryClear = (x: number, z: number) =>
  coastDistance(x, z) > 1.025 &&
  !SCENERY_BLOCKERS.some((b) => Math.abs(x - b.x) < b.hx + 0.3 && Math.abs(z - b.z) < b.hz + 0.3)

export const LANDER_SITES = { earth: { x: 87, z: -13 }, mars: { x: 61, z: -57 } }
export function landingPadHeight(x: number, z: number, height: (x: number, z: number) => number) {
  return (
    Math.max(
      ...[
        [0, 0],
        [-4.3, -4.3],
        [-4.3, 4.3],
        [4.3, -4.3],
        [4.3, 4.3],
      ].map(([dx, dz]) => height(x + dx, z + dz)),
    ) + 0.12
  )
}
