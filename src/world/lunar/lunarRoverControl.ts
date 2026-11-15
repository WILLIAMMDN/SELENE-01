import type { LunarSampling } from './lunarSampling'
import type { LunarDoors } from './lunarInteriorNavigation'
import type { Vector3 } from 'three'
import type { RoverLunarController } from './RoverLunarController'

export type LunarSession = {
  rover?: RoverLunarController
  boarded: boolean
  doors: LunarDoors
  position?: Vector3
  interact?: () => boolean
  sampling?: LunarSampling
}

type Point = { x: number; z: number }
type Clear = (x: number, z: number) => boolean

export const LUNAR_ROVER_START: [number, number] = [53, 63]

export function outsideLunarRover(player: Point, rover: Point, yaw: number) {
  const dx = player.x - rover.x
  const dz = player.z - rover.z
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  return Math.abs(dx * c - dz * s) >= 1.65 || Math.abs(dx * s + dz * c) >= 2.15
}

export function canBoardLunarRover(player: Point, rover: Point, clear: Clear) {
  return (
    Math.hypot(player.x - rover.x, player.z - rover.z) <= 4.5 && clearPath(player, rover, clear)
  )
}

function clearPath(from: Point, to: Point, clear: Clear) {
  const count = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / 0.15))
  for (let i = 1; i <= count; i++) {
    const t = i / count
    if (!clear(from.x + (to.x - from.x) * t, from.z + (to.z - from.z) * t)) return false
  }
  return true
}

export function lunarRoverExit(rover: Point, yaw: number, clear: Clear) {
  for (const distance of [2.4, 3, 3.6]) {
    for (const angle of [Math.PI / 2, -Math.PI / 2, Math.PI, 0]) {
      const x = rover.x + Math.sin(yaw + angle) * distance
      const z = rover.z + Math.cos(yaw + angle) * distance
      if (
        clearPath(rover, { x, z }, clear) &&
        [
          [0.25, 0],
          [-0.25, 0],
          [0, 0.25],
          [0, -0.25],
        ].every(([dx, dz]) => clear(x + dx, z + dz))
      )
        return { x, z }
    }
  }
  return null
}
