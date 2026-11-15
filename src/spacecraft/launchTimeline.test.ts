import { describe, expect, it } from 'vitest'
import { getLaunchFrame, LAUNCH_DURATION, LIFTOFF_AT } from './launchTimeline'

describe('cinemática narrativa de lanzamiento', () => {
  it('comienza con el embarque de la tripulación en LC-01', () => {
    const initial = getLaunchFrame(0, 'aurora')
    expect(initial.beat).toBe('boarding')
    expect(initial.altitudeMeters).toBe(0)
    expect(initial.exhaust).toBe(0)
    expect(initial.speaker).toBe('DRA. VEGA')
  })

  it('presenta la retirada de servicios y la ignición antes del ascenso', () => {
    expect(getLaunchFrame(8, 'aurora').beat).toBe('countdown')
    expect(getLaunchFrame(8, 'aurora').countdown).toBe(10)
    expect(getLaunchFrame(12, 'aurora').beat).toBe('ignition')
    expect(getLaunchFrame(LIFTOFF_AT, 'aurora').beat).toBe('ascent')
    expect(getLaunchFrame(LIFTOFF_AT, 'aurora').altitudeMeters).toBe(0)
    expect(getLaunchFrame(LIFTOFF_AT + 1, 'aurora').altitudeMeters).toBeGreaterThan(0)
  })

  it('mantiene las fases reales del GLB sin introducir módulos no instalados', () => {
    expect(getLaunchFrame(28, 'aurora').mechanism).toBe('BOOSTERS_SEPARATION')
    expect(getLaunchFrame(32, 'aurora').mechanism).toBe('FAIRING_JETTISON')
    expect(getLaunchFrame(35, 'aurora').mechanism).toBe('CORE_STAGE_SEPARATION')
    expect(getLaunchFrame(38, 'aurora').mechanism).toBe('ODYSSEY_RELEASE')
  })

  it('distingue los perfiles hipotéticos del lanzador', () => {
    expect(getLaunchFrame(27, 'atlas').altitudeMeters).toBeGreaterThan(
      getLaunchFrame(27, 'aurora').altitudeMeters,
    )
  })

  it('atraviesa nubes y oscurece el cielo gradualmente sin cambiar la hora del campus', () => {
    const ground = getLaunchFrame(18, 'aurora')
    const clouds = getLaunchFrame(29, 'aurora')
    const edgeOfSpace = getLaunchFrame(39, 'aurora')
    const space = getLaunchFrame(LAUNCH_DURATION, 'aurora')
    expect(ground.spaceBlend).toBe(0)
    expect(clouds.altitudeMeters).toBeGreaterThan(350)
    expect(clouds.spaceBlend).toBe(0)
    expect(edgeOfSpace.spaceBlend).toBeGreaterThan(0.5)
    expect(space.spaceBlend).toBe(1)
  })

  it('mantiene una sola cronología para todos los valores', () => {
    expect(getLaunchFrame(-1, 'aurora').time).toBe(0)
    expect(getLaunchFrame(Number.NaN, 'aurora').time).toBe(0)
    expect(getLaunchFrame(100, 'aurora').time).toBe(LAUNCH_DURATION)
    expect(getLaunchFrame(100, 'aurora').progress).toBe(1)
    expect(getLaunchFrame(100, 'aurora').beat).toBe('orbital')
    expect(getLaunchFrame(100, 'aurora').mechanism).toBe('ODYSSEY_RELEASE')
  })
})
