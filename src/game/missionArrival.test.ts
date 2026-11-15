import { describe, expect, it } from 'vitest'
import { makeMissionArrival, CURRENT_CAMPAIGN_WORLD } from './missionArrival'

describe('transición entre campañas y mundos', () => {
  it('la campaña polar actual siempre llega al escenario lunar', () => {
    expect(CURRENT_CAMPAIGN_WORLD).toBe('moon')
    for (const instrument of ['camera', 'spectrometer', 'radar'] as const) {
      const arrival = makeMissionArrival('blueprint', instrument)
      expect(arrival.world).toBe('moon')
      expect(arrival.objective).toBe(instrument)
    }
  })
  it('los nuevos guiones podrán pasar Marte explícitamente, sin deducirlo del instrumento', () => {
    const arrival = makeMissionArrival('future-mission', 'camera', 'mars')
    expect(arrival.world).toBe('mars')
    expect(arrival.title).toMatch(/Ares/)
  })
})
