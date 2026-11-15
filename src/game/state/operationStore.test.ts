import { describe, expect, it } from 'vitest'
import { decodeOperationSession } from './operationStore'
import { startOperations } from '../missionDesign'

describe('operation save validation', () => {
  it('rejects malformed counters, statuses and unfinished final steps', () => {
    for (const patch of [{ step: 99 }, { step: -1 }, { step: 1.5 }, { battery: NaN }, { status: 'unknown' }, { step: 3, status: 'running' }, { history: [42] }]) {
      expect(decodeOperationSession({ blueprintKey: 'test', ops: { ...startOperations(), ...patch } })).toBeNull()
    }
  })
  it('retains a failed flight whose memory overflowed', () => {
    const ops = { ...startOperations(), step: 3, stored: 40, status: 'failed' as const }
    expect(decodeOperationSession({ blueprintKey: 'test', ops })?.ops).toEqual(ops)
  })
})
