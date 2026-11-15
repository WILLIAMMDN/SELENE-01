import { describe, expect, it } from 'vitest'
import layout from './lunarInteriors.json'
import {
  clearLunarDoors,
  LUNAR_HAB_CHECKPOINT,
  lunarCabinSealed,
  lunarDeckAt,
  lunarDoors,
  lunarDoorSweepClear,
  type LunarDoors,
} from './lunarInteriorNavigation'
import {
  freshLunarSuit,
  LUNAR_EVA_TIME,
  LUNAR_GRAVITY,
  lunarVelocity,
  stepLunarSuit,
} from './lunarPhysics'

describe('ODYSSEY lunar interior', () => {
  it('connects the HAB ramp to the three interiors through the geometry of the corridors', () => {
    const { minX, minZ, step, columns, rows } = layout
    const ix = Math.round((63.52 - minX) / step)
    const iz = Math.round((82.7 - minZ) / step)
    const start = iz * columns + ix
    const queue = [start],
      visited = new Set(queue),
      rooms = new Set<string>()
    const doors: LunarDoors = new Map(lunarDoors.map(({ id }) => [id, { progress: 1, open: true }]))
    for (const k of queue) {
      const x = k % columns
      const z = Math.floor(k / columns)
      const current = lunarDeckAt(minX + x * step, minZ + z * step)!
      if (current.room) rooms.add(current.room)
      for (const [i, j] of [
        [x - 1, z],
        [x + 1, z],
        [x, z - 1],
        [x, z + 1],
      ]) {
        if (i < 0 || j < 0 || i >= columns || j >= rows) continue
        const next = j * columns + i
        if (visited.has(next)) continue
        const wx = minX + i * step,
          wz = minZ + j * step
        const floor = lunarDeckAt(wx, wz)
        if (
          floor &&
          Math.abs(floor.height - current.height) <= 0.18 &&
          clearLunarDoors(doors, wx, wz)
        ) {
          queue.push(next)
          visited.add(next)
        }
      }
    }
    expect([...rooms].sort()).toEqual(['HAB-L01', 'LAB-L01', 'Pasillo presurizable', 'STO-L01'])
    expect(lunarDeckAt(...LUNAR_HAB_CHECKPOINT)?.room).toBe('HAB-L01')
    // The base panel is modeled as a solid obstacle on the deck.
    expect(lunarDeckAt(62.78, 76.88)).toBeNull()
  })

  it('retains the hatch collision while opening and clears the central passage only when fully open', () => {
    const doors: LunarDoors = new Map(
      lunarDoors.map(({ id }) => [id, { progress: 0, open: false }]),
    )
    const hatch = lunarDoors.find(({ label }) => label === 'HAB-L01')!
    expect(lunarCabinSealed(doors)).toBe(true)
    expect(clearLunarDoors(doors, 63.52, 80.44)).toBe(false)
    expect(lunarDoorSweepClear(hatch, 63.52, 80.44)).toBe(false)
    expect(lunarDoorSweepClear(hatch, ...LUNAR_HAB_CHECKPOINT)).toBe(true)
    doors.set(hatch.id, { progress: 0.9, open: true })
    expect(clearLunarDoors(doors, 63.52, 80.44)).toBe(false)
    doors.set(hatch.id, { progress: 1, open: true })
    expect(clearLunarDoors(doors, 63.52, 80.44)).toBe(true)
    expect(lunarCabinSealed(doors)).toBe(false)
  })
})

describe('EVA suit and movement', () => {
  it('consumes more oxygen under load and restores reserves in a sealed cabin', () => {
    const resting = freshLunarSuit()
    const working = freshLunarSuit()
    stepLunarSuit(resting, 60, 0, false)
    stepLunarSuit(working, 60, 1, false)
    expect(working.oxygen).toBeLessThan(resting.oxygen)
    expect(working.battery).toBeLessThan(resting.battery)
    expect(stepLunarSuit(working, 18, 0, true)).toBe(false)
    expect(working.oxygen).toBe(1)
    expect(stepLunarSuit(working, LUNAR_EVA_TIME + 1, 0, false)).toBe(true)
  })
  it('uses NASA lunar gravity and gives weaker horizontal control in flight', () => {
    expect(LUNAR_GRAVITY).toBe(1.62)
    expect(lunarVelocity(0, 2, 0.1, true)).toBeLessThan(lunarVelocity(0, 2, 0.1, false))
    expect(lunarVelocity(0.03, 0, 0.1, false)).toBe(0)
  })
})
