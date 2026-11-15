import { describe, expect, it } from 'vitest'
import {
  AIRLOCK_MODULE,
  AIRLOCK_WARDROBE,
  canUseWardrobe,
  handleWardrobeKey,
} from './wardrobeStation'
import { buildingAt, stationAt } from './buildingNavigation'
import { canWalk } from './worldData'

describe('airlock clothing station', () => {
  const { x, z } = AIRLOCK_WARDROBE
  it('is reachable through the existing airlock entrance without crossing a blocker', () => {
    const door = AIRLOCK_MODULE.doors.find((d) => d.z > 0)!
    const outside = AIRLOCK_MODULE.z + door.z + 1.7
    for (let next = outside; next >= z; next -= 0.05) expect(canWalk(x, next)).toBe(true)
    expect(buildingAt(x, z)).toBe('airlock')
    expect(canUseWardrobe(x, z, 'earth')).toBe(true)
  })
  it('accepts the real E interaction at the locker instead of a mission station', () => {
    let opened = 0
    let prevented = 0
    const event = {
      code: 'KeyE',
      repeat: false,
      preventDefault: () => {
        prevented++
      },
    }
    expect(
      handleWardrobeKey(event, x, z, 'earth', () => {
        opened++
      }),
    ).toBe(true)
    expect(opened).toBe(1)
    expect(prevented).toBe(1)
    expect(
      handleWardrobeKey({ ...event, repeat: true }, x, z, 'earth', () => {
        opened++
      }),
    ).toBe(false)
    expect(opened).toBe(1)
    expect(stationAt(x, z)).toBeUndefined()
  })
  it('does not activate outside the room, through the wall, or on other worlds', () => {
    expect(canUseWardrobe(x, z, 'moon')).toBe(false)
    expect(canUseWardrobe(x, z, 'mars')).toBe(false)
    expect(canUseWardrobe(AIRLOCK_MODULE.x + 2.1, z, 'earth')).toBe(false)
    expect(canUseWardrobe(x, AIRLOCK_MODULE.z + 2, 'earth')).toBe(false)
    expect(canUseWardrobe(-36, 20, 'earth')).toBe(false)
  })
})
