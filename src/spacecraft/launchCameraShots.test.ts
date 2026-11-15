import { describe, expect, it } from 'vitest'
import { getLaunchCameraPose, getLaunchShot, LAUNCH_SHOTS } from './launchCameraShots'

describe('dirección de cámaras del lanzamiento', () => {
  it('cada etapa tiene un plano propio que se mantiene dentro de los tiempos de vuelo', () => {
    expect(LAUNCH_SHOTS.map((shot) => shot.id)).toEqual([
      'establish',
      'capsule',
      'services',
      'ignition',
      'liftoff',
      'atmosphere',
      'boosters',
      'fairing',
      'core',
      'release',
      'odyssey',
    ])
    for (let i = 0; i < LAUNCH_SHOTS.length - 1; i++) {
      expect(LAUNCH_SHOTS[i].end).toBe(LAUNCH_SHOTS[i + 1].start)
    }
    expect(getLaunchShot(12).id).toBe('ignition')
    expect(getLaunchShot(28).id).toBe('boosters')
    expect(getLaunchShot(32).id).toBe('fairing')
    expect(getLaunchShot(35).id).toBe('core')
    expect(getLaunchShot(38).id).toBe('release')
  })
  it('ignición y separación de auxiliares se filman desde fuera del lanzador', () => {
    const origin: [number, number, number] = [61, 0, -75]
    for (const t of [0, 9, 12, 15, 18, 23, 28, 29, 31, 35, 38, 43]) {
      const pose = getLaunchCameraPose(t, 'aurora', origin, 90.4)
      const horizontal = Math.hypot(pose.position[0] - origin[0], pose.position[2] - origin[2])
      expect(horizontal, `instante ${t}`).toBeGreaterThan(94)
      expect(pose.position.every(Number.isFinite)).toBe(true)
      expect(pose.target.every(Number.isFinite)).toBe(true)
    }
  })
  it('seguimiento asciende con el cohete sin teletransportar el objetivo al suelo', () => {
    const origin: [number, number, number] = [61, 0, -75]
    const before = getLaunchCameraPose(22, 'aurora', origin, 90.4)
    const after = getLaunchCameraPose(26, 'aurora', origin, 90.4)
    expect(after.target[1]).toBeGreaterThan(before.target[1])
    expect(after.position[1]).toBeGreaterThan(before.position[1])
  })
})
