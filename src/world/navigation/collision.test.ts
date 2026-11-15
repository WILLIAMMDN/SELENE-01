import { describe, expect, it } from 'vitest'
import { createCollisionGrid, createRoadClearance, moveWithCollisions } from './collision'
import { PROP_COLLIDERS } from './propLayout'
import { canWalk } from '../worldData'
import { createCharacterMotion, stepCharacter } from '../characterMotion'
import { INTERIOR_STATIONS, stationAt } from '../buildingNavigation'

describe('solid navigation', () => {
  it('matches rotated boxes including inflated corners across spatial cell boundaries', () => {
    const boxes = [
      { x: 7.4, z: -7.7, hx: 1, hz: 0.15, angle: 0.8 },
      { x: -1, z: 3, hx: 0.4, hz: 2 },
    ]
    const clear = createCollisionGrid(boxes)
    for (let x = -4; x < 11; x += 0.13)
      for (let z = -11; z < 7; z += 0.17) {
        const expected = !boxes.some((b) => {
          const c = Math.cos(b.angle ?? 0),
            s = Math.sin(b.angle ?? 0),
            dx = x - b.x,
            dz = z - b.z
          return Math.abs(c * dx - s * dz) < b.hx + 0.24 && Math.abs(s * dx + c * dz) < b.hz + 0.24
        })
        expect(clear(x, z)).toBe(expected)
      }
  })
  it('does not tunnel through a thin wall and still slides along it', () => {
    const clear = createCollisionGrid([{ x: 0, z: 0, hx: 0.025, hz: 5 }]),
      p = { x: -1, z: 0 }
    moveWithCollisions(p, 3, 2, clear)
    expect(p.x).toBeLessThan(-0.265)
    expect(p.z).toBeCloseTo(2)
  })
  it('blocks the added furniture while retaining laboratory access and station interaction', () => {
    for (const b of PROP_COLLIDERS) expect(canWalk(b.x, b.z), `${b.x},${b.z}`).toBe(false)
    for (let z = 5; z >= -2.2; z -= 0.1) expect(canWalk(-17, z)).toBe(true)
    for (const station of INTERIOR_STATIONS) {
      let reachable = false
      for (let x = station.x - 2.5; x <= station.x + 2.5; x += 0.2)
        for (let z = station.z - 2.5; z <= station.z + 2.5; z += 0.2)
          if (canWalk(x, z) && stationAt(x, z)?.sector === station.sector) reachable = true
      expect(reachable, station.label).toBe(true)
    }
  })
  it('runs at 6.5 m/s independent of frame rate and stays solid during a jump', () => {
    for (const fps of [20, 60, 144]) {
      const state = createCharacterMotion(),
        p = { x: 0, y: 0, z: 0 }
      const controls = { keys: new Set(['KeyW', 'ShiftLeft']), actions: [] }
      for (let i = 0; i < fps; i++)
        stepCharacter(
          state,
          controls,
          p,
          0,
          1 / fps,
          () => 0,
          () => true,
        )
      expect(p.z).toBeCloseTo(-6.5)
    }
    const state = createCharacterMotion(),
      p = { x: 0, y: 0, z: 0 }
    const clear = createCollisionGrid([{ x: 0, z: -1, hx: 4, hz: 0.025 }])
    stepCharacter(state, { keys: new Set(), actions: ['jump'] }, p, 0, 0.05, () => 0, clear)
    for (let i = 0; i < 40; i++)
      stepCharacter(
        state,
        { keys: new Set(['KeyW', 'ShiftLeft']), actions: [] },
        p,
        0,
        0.05,
        () => 0,
        clear,
      )
    expect(p.z).toBeGreaterThan(-0.735)
    expect(state.phase).toBe('ground')
  })
  it('lets the player sit and stand outside the newly solid bench', () => {
    const state = createCharacterMotion(),
      p = { x: -8, y: 0, z: 24 }
    stepCharacter(state, { keys: new Set(), actions: ['sit'] }, p, 0, 0.05, () => 0, canWalk)
    for (let i = 0; i < 20; i++)
      stepCharacter(state, { keys: new Set(), actions: [] }, p, 0, 0.05, () => 0, canWalk)
    expect(state.seat).toBe('idle')
    stepCharacter(state, { keys: new Set(), actions: ['sit'] }, p, 0, 0.05, () => 0, canWalk)
    for (let i = 0; i < 20; i++)
      stepCharacter(state, { keys: new Set(), actions: [] }, p, 0, 0.05, () => 0, canWalk)
    expect(state.seat).toBeNull()
    expect(canWalk(p.x, p.z)).toBe(true)
  })
  it('preserves sampled road margins when indexing grass placement', () => {
    const routes = [
      {
        points: [
          { x: 7.9, z: -0.2 },
          { x: -9, z: 3 },
        ],
        margin: 2.6,
      },
    ]
    const clear = createRoadClearance(routes)
    for (let x = -13; x < 13; x += 0.3)
      for (let z = -5; z < 8; z += 0.3)
        expect(clear(x, z)).toBe(
          !routes.some((r) => r.points.some((p) => Math.hypot(p.x - x, p.z - z) < r.margin)),
        )
  })
})
