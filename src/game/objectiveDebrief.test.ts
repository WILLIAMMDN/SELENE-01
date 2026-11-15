import { describe, expect, it } from 'vitest'
import { INITIAL_DESIGN, startOperations, type InstrumentId } from './missionDesign'
import { objectiveDebrief } from './objectiveDebrief'

describe('objective debrief', () => {
  it.each<InstrumentId>(['camera', 'spectrometer', 'radar'])(
    'connects returned data to %s without inventing discoveries',
    (id) => {
      const report = objectiveDebrief(
        id,
        { ...INITIAL_DESIGN, instruments: [id] },
        { ...startOperations(), status: 'completed', step: 3, delivered: 8 },
      )!
      expect(report.objective.id).toBe(id)
      expect(report.outcome).toBe('returned')
      expect(report.explanation).toContain('8 GB')
      expect(report.explanation).toContain('no identifica qué instrumento produjo cada dato')
      expect(report.limit).toContain('no mediciones por instrumento')
    },
  )
  it('does not equate completing all turns with meeting the objective', () => {
    expect(
      objectiveDebrief('camera', INITIAL_DESIGN, {
        ...startOperations(),
        step: 3,
        status: 'completed',
      })?.outcome,
    ).toBe('no-data')
  })
  it('retains the distinction between partial data, unfinished operations and the wrong design', () => {
    expect(
      objectiveDebrief('camera', INITIAL_DESIGN, {
        ...startOperations(),
        status: 'failed',
        delivered: 8,
      })?.outcome,
    ).toBe('partial')
    expect(objectiveDebrief('camera', INITIAL_DESIGN, startOperations())?.outcome).toBe('pending')
    expect(
      objectiveDebrief('radar', INITIAL_DESIGN, {
        ...startOperations(),
        status: 'completed',
        delivered: 8,
      })?.outcome,
    ).toBe('incompatible')
    expect(
      objectiveDebrief(
        'camera',
        { ...INITIAL_DESIGN, orbit: 'inclined' },
        { ...startOperations(), status: 'completed', delivered: 8 },
      )?.outcome,
    ).toBe('incompatible')
  })
})
