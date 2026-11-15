import { describe, expect, it } from 'vitest'
import * as T from 'three'
import { canBoardLunarRover, LUNAR_ROVER_HOME } from './lunarRoverAccess'
import { lunarCanWalk } from './lunarNavigation'
import type { RoverLunarController } from './RoverLunarController'

describe('real lunar rover spawn and boarding', () => {
  it('provides walkable boarding points around its actual parked location', () => {
    const rover = {
      vehicle: { position: new T.Vector3(...LUNAR_ROVER_HOME) },
    } as RoverLunarController
    const points: Array<[number, number]> = []
    for (let x = 50; x <= 57; x += 0.5)
      for (let z = 60; z <= 67; z += 0.5) {
        if (lunarCanWalk(x, z) && canBoardLunarRover(rover, x, z)) points.push([x, z])
      }
    expect(lunarCanWalk(57, 66)).toBe(true)
    expect(points.length).toBeGreaterThan(0)
  })
})
