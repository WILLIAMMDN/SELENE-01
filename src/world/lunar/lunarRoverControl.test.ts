import { describe, expect, it } from 'vitest'
import { createCollisionGrid } from '../navigation/collision'
import { canBoardLunarRover, lunarRoverExit, outsideLunarRover } from './lunarRoverControl'

describe('lunar rover boarding and dismount', () => {
  it('places the astronaut near the current vehicle position and outside its rotated body', () => {
    const rover = { x: -38, z: 72 }
    const yaw = Math.PI / 2
    const exit = lunarRoverExit(rover, yaw, () => true)!
    expect(exit.x).toBeCloseTo(-38)
    expect(exit.z).toBeCloseTo(69.6)
    expect(outsideLunarRover(exit, rover, yaw)).toBe(true)
    expect(canBoardLunarRover(exit, rover, () => true)).toBe(true)
    expect(canBoardLunarRover({ x: 53, z: 63 }, rover, () => true)).toBe(false)
  })

  it('tries the other side when a wall blocks the path and stays aboard if all paths are blocked', () => {
    const rover = { x: 20, z: 20 }
    const clear = createCollisionGrid([{ x: 21.98, z: 20, hx: 0.04, hz: 1 }])
    expect(lunarRoverExit(rover, 0, clear)?.x).toBeCloseTo(17.6)
    expect(canBoardLunarRover({ x: 23, z: 20 }, rover, clear)).toBe(false)
    expect(lunarRoverExit(rover, 0, (x, z) => Math.hypot(x - 20, z - 20) < 2)).toBeNull()
  })
})
