import { describe, expect, it } from 'vitest'
import { canWalk } from '../world/worldData'
import { LIFT, HATCH, nearLift, nearHatch, onCrewBridge, onGroundRoute } from './boardingRoute'

describe('recorrido físico al lanzador LC-01', () => {
  it('permite caminar por el corredor sin atravesar el puesto de control', () => {
    expect(canWalk(61, -35)).toBe(false)
    for (const x of [64, 68, 74, 79.5]) {
      expect(onGroundRoute(x, -35)).toBe(true)
      expect(canWalk(x, -35), `corredor x=${x}`).toBe(true)
    }
    for (const z of [-39, -48, -57, -67, -75, -83]) {
      expect(onGroundRoute(80, z)).toBe(true)
      expect(canWalk(80, z), `corredor z=${z}`).toBe(true)
    }
  })

  it('conecta sin huecos la terminal de autorización con el ascensor', () => {
    for (let x = 62; x <= 80; x += 0.2)
      expect(canWalk(x, -33.8), `acceso (x=${x.toFixed(1)}, z=-33.8)`).toBe(true)
    for (let z = -33.8; z >= -84; z -= 0.2)
      expect(canWalk(80, z), `acceso (x=80, z=${z.toFixed(1)})`).toBe(true)
  })

  it('limita la pasarela elevada al brazo de acceso', () => {
    expect(nearLift(LIFT.x, LIFT.z)).toBe(true)
    expect(onCrewBridge(LIFT.x, LIFT.z)).toBe(true)
    expect(onCrewBridge(HATCH.x, HATCH.z)).toBe(true)
    expect(nearHatch(HATCH.x, HATCH.z)).toBe(true)
    expect(onCrewBridge(61, -76)).toBe(false)
  })
})
