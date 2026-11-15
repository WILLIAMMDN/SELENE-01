import { describe, expect, it } from 'vitest'
import { lineClear } from '../../robot/followerRoute'
import { canWalk, SECTORS, START } from '../worldData'
import { stationAt } from '../buildingNavigation'
import { AIRLOCK_WARDROBE } from '../wardrobeStation'
import { missionDestination, onCampusRoad } from './missionDestination'
import {
  createMissionRouter,
  relativeGuideAngle,
  projectOnRoute,
  sampleRoute,
} from './missionRoute'

describe('mission walking guidance', () => {
  it('reaches all five real mission stations, including entering and leaving rooms', () => {
    const router = createMissionRouter(canWalk, onCampusRoad)
    let from = { x: START[0], z: START[1] }
    for (const sector of SECTORS) {
      const goal = missionDestination(sector.id, from).point
      expect(goal, sector.id).toBeDefined()
      const path = router(from, goal!)
      expect(path.length, `No walking route to ${sector.id}`).toBeGreaterThan(1)
      for (let i = 1; i < path.length; i++)
        expect(lineClear(path[i - 1], path[i], canWalk), `${sector.id}: blocked segment ${i}`).toBe(
          true,
        )
      const end = path.at(-1)!
      expect(stationAt(end.x, end.z)?.sector).toBe(sector.id)
      expect(missionDestination(sector.id, end).arrived).toBe(true)
      from = end
    }
  })
  it('does not invent a route through a sealed wall', () => {
    const router = createMissionRouter(
      (x, z) => Math.abs(x) < 4 && Math.abs(z) < 4 && Math.abs(x) > 0.4,
    )
    expect(router({ x: -2, z: 0 }, { x: 2, z: 0 })).toEqual([])
  })
  it('guides the player out of the wardrobe and back to the mission', () => {
    const router = createMissionRouter(canWalk, onCampusRoad)
    const goal = missionDestination('research', AIRLOCK_WARDROBE).point!
    const path = router(AIRLOCK_WARDROBE, goal)
    expect(path.length).toBeGreaterThan(1)
    for (let i = 1; i < path.length; i++)
      expect(lineClear(path[i - 1], path[i], canWalk)).toBe(true)
    expect(stationAt(path.at(-1)!.x, path.at(-1)!.z)?.sector).toBe('research')
  })
  it('rotates relative to the camera and crosses north without a full revolution', () => {
    expect(relativeGuideAngle({ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 0, z: -1 })).toBeCloseTo(
      Math.PI / 2,
    )
    expect(relativeGuideAngle({ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 1, z: 0 })).toBeCloseTo(0)
    const previous = Math.PI - 0.02
    const next = relativeGuideAngle({ x: 0, z: 0 }, { x: -0.01, z: 1 }, { x: 0, z: -1 }, previous)
    expect(Math.abs(next - previous)).toBeLessThan(0.04)
  })
  it('keeps markers ahead of the player along the remaining route', () => {
    const path = [
      { x: 0, z: 0 },
      { x: 0, z: -10 },
      { x: 5, z: -10 },
    ]
    const progress = projectOnRoute(path, { x: 0, z: -6 })
    expect(progress.along).toBeCloseTo(6)
    expect(progress.remaining).toBeCloseTo(9)
    expect(sampleRoute(path, progress.along + 2)).toEqual({ x: 0, z: -8 })
  })
})
