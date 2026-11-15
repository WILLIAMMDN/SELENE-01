import * as T from 'three'
import type { RoverLunarController } from './RoverLunarController'
import { lunarCanWalk, lunarHeight } from './lunarNavigation'
import { lunarBaseFloor } from './lunarBaseNavigation'

export const LUNAR_ROVER_HOME = [53, 0, 63] as const
const HALF = { x: 1.3, z: 1.85 }
type Clear = (x: number, z: number) => boolean
type Height = (x: number, z: number) => number
export type LunarRoverMount = {
  controller: RoverLunarController | null
  driving: boolean
  exitBlocked: boolean
}

export function outsideLunarRover(
  rover: RoverLunarController | null,
  x: number,
  z: number,
  margin = 0.24,
) {
  if (!rover) return true
  const dx = x - rover.vehicle.position.x,
    dz = z - rover.vehicle.position.z
  const c = Math.cos(rover.yaw),
    s = Math.sin(rover.yaw)
  return (
    Math.abs(c * dx - s * dz) >= HALF.x + margin || Math.abs(s * dx + c * dz) >= HALF.z + margin
  )
}

function pathClear(x: number, z: number, endX: number, endZ: number, clear: Clear) {
  const steps = Math.ceil(Math.hypot(endX - x, endZ - z) / 0.12)
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0
    if (!clear(T.MathUtils.lerp(x, endX, t), T.MathUtils.lerp(z, endZ, t))) return false
  }
  return true
}

export function canBoardLunarRover(
  rover: RoverLunarController | null,
  x: number,
  z: number,
  clear: Clear = lunarCanWalk,
) {
  if (!rover) return false
  const p = rover.vehicle.position
  return Math.hypot(x - p.x, z - p.z) < 3.4 && pathClear(x, z, p.x, p.z, clear)
}

export function lunarRoverFits(
  position: T.Vector3,
  yaw: number,
  clear: Clear = lunarCanWalk,
  height: Height = lunarHeight,
) {
  const c = Math.cos(yaw),
    s = Math.sin(yaw),
    base = height(position.x, position.z)
  for (let ix = -2; ix <= 2; ix++)
    for (let iz = -3; iz <= 3; iz++) {
      const lx = (ix * HALF.x) / 2,
        lz = (iz * HALF.z) / 3
      const x = position.x + c * lx + s * lz,
        z = position.z - s * lx + c * lz
      if (lunarBaseFloor(x, z) !== null) return false
      if (!clear(x, z) || Math.abs(height(x, z) - base) > 0.65) return false
    }
  return true
}

export function lunarRoverExit(
  rover: RoverLunarController,
  clear: Clear = lunarCanWalk,
  height: Height = lunarHeight,
) {
  const p = rover.vehicle.position,
    c = Math.cos(rover.yaw),
    s = Math.sin(rover.yaw)
  for (const [lx, lz] of [
    [-1.95, -0.2],
    [1.95, -0.2],
    [-2.5, -0.2],
    [2.5, -0.2],
    [0, -2.6],
    [0, 2.6],
  ]) {
    const x = p.x + c * lx + s * lz,
      z = p.z - s * lx + c * lz
    if (!outsideLunarRover(rover, x, z, 0.4) || !pathClear(p.x, p.z, x, z, clear)) continue
    const y = height(x, z)
    if (!Number.isFinite(y) || Math.abs(y - height(p.x, p.z)) > 0.65) continue
    if (
      [
        [0.22, 0],
        [-0.22, 0],
        [0, 0.22],
        [0, -0.22],
      ].every(([dx, dz]) => clear(x + dx, z + dz))
    )
      return new T.Vector3(x, y, z)
  }
  return null
}

export function toggleLunarRover(mount: LunarRoverMount, player: T.Vector3) {
  const rover = mount.controller
  if (!rover) return false
  if (mount.driving) {
    rover.speed = 0
    rover.stop()
    const exit = lunarRoverExit(rover)
    mount.exitBlocked = !exit
    if (!exit) return false
    mount.driving = false
    player.copy(exit)
  } else {
    if (!canBoardLunarRover(rover, player.x, player.z)) return false
    mount.driving = true
    mount.exitBlocked = false
  }
  return true
}
