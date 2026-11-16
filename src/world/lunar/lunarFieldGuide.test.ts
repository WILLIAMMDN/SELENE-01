import { describe, expect, it } from 'vitest'
import { lunarFieldGuide } from './lunarFieldGuide'
import { LUNAR_RESOURCES } from './lunarResources'

describe('lunar field guidance', () => {
  it('follows sample, lab, power, transmission, survey and traverse in order', () => {
    const state = {
      samples: [] as (typeof LUNAR_RESOURCES)[number]['id'][],
      fieldwork: [] as ('iceAnalyzed' | 'iceSent')[],
      operations: [] as ('power' | 'telemetry' | 'traverse' | 'return')[],
    }
    expect(lunarFieldGuide(state).hint).toContain('estación 01')
    state.samples.push('hielo')
    expect(lunarFieldGuide(state).hint).toContain('LAB-L01')
    state.fieldwork.push('iceAnalyzed')
    expect(lunarFieldGuide(state).hint).toContain('PWR-L01')
    state.operations.push('power')
    expect(lunarFieldGuide(state).hint).toContain('bitácora')
    state.fieldwork.push('iceSent')
    expect(lunarFieldGuide(state).hint).toContain('estación 02')
    state.samples.push(...LUNAR_RESOURCES.filter(({ id }) => id !== 'hielo').map(({ id }) => id))
    expect(lunarFieldGuide(state).hint).toContain('30 m')
    state.operations.push('traverse')
    expect(lunarFieldGuide(state).title).toContain('completo')
  })
})
