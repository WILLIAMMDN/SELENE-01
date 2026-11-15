import { describe, expect, it } from 'vitest'
import {
  INITIAL_DESIGN,
  OPERATION_EVENTS,
  applyOperation,
  evaluateDesign,
  startOperations,
} from './missionDesign'
import { operationPreview } from './operationFeedback'

describe('operation consequences', () => {
  const evaluation = evaluateDesign(INITIAL_DESIGN)
  it('previews the real transition for every legal action without mutating history or telemetry', () => {
    let state = startOperations()
    for (const event of OPERATION_EVENTS) {
      const before = structuredClone(state)
      for (const option of event.options) {
        const preview = operationPreview(state, option.id, evaluation)
        expect(preview?.next).toEqual(applyOperation(state, option.id, evaluation))
        expect(state).toEqual(before)
      }
      state = applyOperation(state, event.options[0].id, evaluation)
    }
  })
  it('includes the duration overhead and current data rather than the generic action description', () => {
    const preview = operationPreview(startOperations(), 'observe', evaluation)!
    expect(preview.next.battery).toBe(43)
    expect(preview.summary).toContain('(-20)')
    const transmission = operationPreview(preview.next, 'downlink', evaluation)!
    expect(transmission.next.delivered).toBe(10)
    expect(transmission.summary).toContain('enviados +10 GB')
  })
  it('warns about empty transmissions and a final turn with no returned data', () => {
    const first = applyOperation(startOperations(), 'conserve', evaluation)
    expect(operationPreview(first, 'downlink', evaluation)?.warning).toContain('No hay datos')
    const second = applyOperation(first, 'prioritize', evaluation)
    expect(operationPreview(second, 'safemode', evaluation)?.warning).toContain(
      'sin devolver datos',
    )
  })
  it('warns about battery exhaustion and memory overflow without running either action', () => {
    expect(
      operationPreview({ ...startOperations(), battery: 1 }, 'observe', evaluation)?.warning,
    ).toContain('agota la batería')
    expect(
      operationPreview({ ...startOperations(), stored: 35 }, 'observe', evaluation)?.warning,
    ).toContain('supera la memoria')
    expect(operationPreview(startOperations(), 'emergency', evaluation)).toBeNull()
  })
})
