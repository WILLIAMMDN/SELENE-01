import { describe, expect, it } from 'vitest'
import { DEMO_EVALUATION, DEMO_OPERATIONS, DEMO_READY, DEMO_SCORE } from './demoSequence'

describe('fast mission demonstration', () => {
  it('uses a valid design and reaches a report with data returned to Earth', () => {
    expect(DEMO_READY).toBe(true)
    expect(DEMO_EVALUATION.problems).toEqual([])
    expect(DEMO_OPERATIONS.map((state) => state.step)).toEqual([0, 1, 2, 3])
    expect(DEMO_OPERATIONS[3].status).toBe('completed')
    expect(DEMO_OPERATIONS[3].delivered).toBeGreaterThan(0)
    expect(DEMO_SCORE).toBeGreaterThan(0)
  })
})
