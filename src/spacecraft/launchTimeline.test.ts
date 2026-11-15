import { describe, expect, it } from 'vitest'
import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'

describe('launch cinematic timeline', () => {
  it('starts with a deterministic countdown and no movement', () => {
    const frame = getLaunchFrame(0, 'aurora')
    expect(frame.beat).toBe('countdown')
    expect(frame.countdown).toBe(5)
    expect(frame.altitudeMeters).toBe(0)
    expect(frame.exhaust).toBe(0)
  })
  it('withdraws into ignition and then climbs', () => {
    expect(getLaunchFrame(5, 'aurora').beat).toBe('ignition')
    expect(getLaunchFrame(9.01, 'aurora').altitudeMeters).toBeGreaterThan(0)
    expect(getLaunchFrame(9.01, 'aurora').beat).toBe('ascent')
  })
  it('plays the four GLB mechanism clips in the supplied order', () => {
    expect(getLaunchFrame(15, 'aurora').mechanism).toBe('BOOSTERS_SEPARATION')
    expect(getLaunchFrame(19, 'aurora').mechanism).toBe('CORE_STAGE_SEPARATION')
    expect(getLaunchFrame(23, 'aurora').mechanism).toBe('FAIRING_JETTISON')
    expect(getLaunchFrame(27, 'aurora').mechanism).toBe('ODYSSEY_RELEASE')
  })
  it('adapts its cinematic ascent profile to launcher selection', () => {
    expect(getLaunchFrame(15, 'atlas').altitudeMeters).toBeGreaterThan(
      getLaunchFrame(15, 'aurora').altitudeMeters,
    )
  })
  it('handles invalid or out-of-range timings without NaN', () => {
    expect(getLaunchFrame(NaN, 'aurora').time).toBe(0)
    expect(getLaunchFrame(-8, 'aurora').time).toBe(0)
    const end = getLaunchFrame(Infinity, 'aurora')
    expect(end.time).toBe(0)
    expect(getLaunchFrame(10000, 'atlas').time).toBe(LAUNCH_DURATION)
    expect(getLaunchFrame(10000, 'atlas').progress).toBe(1)
  })
})
