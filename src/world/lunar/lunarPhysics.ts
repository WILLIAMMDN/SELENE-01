/** NASA Glenn, Moon: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/moon/
 * The acceleration is NASA's mean lunar surface value. Movement and suit rates
 * below are authored for an educational game, in metres and local game seconds.
 */
export const LUNAR_GRAVITY = 1.62
export const LUNAR_JUMP_SPEED = 1.65
export const LUNAR_WALK_SPEED = 1.65
export const LUNAR_RUN_SPEED = 3.05
export const LUNAR_INDOOR_SPEED = 1.3
export const LUNAR_TAKEOFF_TIME = 0.18
export const LUNAR_LAND_TIME = 0.34
export const LUNAR_EVA_TIME = 18 * 60
export const LUNAR_LOW_RESERVE = 0.2

export function lunarVelocity(current: number, target: number, dt: number, airborne: boolean) {
  const acceleration = airborne ? 0.85 : target === 0 ? 5.6 : 3.4
  const limit = acceleration * dt
  return current + Math.max(-limit, Math.min(limit, target - current))
}

export type LunarSuit = { oxygen: number; battery: number; workload: number }
export const freshLunarSuit = (): LunarSuit => ({ oxygen: 1, battery: 1, workload: 0 })

/** PLSS functions from NASA's Artemis spacesuit reference. Rates are gameplay parameters.
 * Workload is a nominal cooling/CO₂-removal demand indicator, not a medical model.
 */
export function stepLunarSuit(suit: LunarSuit, dt: number, effort: number, sealed: boolean) {
  suit.workload += (effort - suit.workload) * (1 - Math.exp(-dt * 1.2))
  if (sealed) {
    suit.oxygen = Math.min(1, suit.oxygen + dt / 13)
    suit.battery = Math.min(1, suit.battery + dt / 18)
  } else {
    suit.oxygen = Math.max(0, suit.oxygen - (dt * (1 + suit.workload * 0.65)) / LUNAR_EVA_TIME)
    suit.battery = Math.max(
      0,
      suit.battery - (dt * (1 + suit.workload * 0.5)) / (LUNAR_EVA_TIME * 1.4),
    )
  }
  return suit.oxygen === 0 || suit.battery === 0
}
