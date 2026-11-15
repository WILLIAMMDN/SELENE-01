import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { isRecord, isStringArray, isFiniteNumber } from '../../shared/persistence/validation'
import { OBJECTIVES } from '../objectives'
import type { Mission } from '../missionRules'

export const emptyMission = (): Mission => ({ objective: null, verified: null, result: null })
export function decodeMission(value: unknown): Mission | undefined {
  if (!isRecord(value)) return undefined
  const objective = OBJECTIVES.find((o) => o.id === value.objective)?.id ?? null
  if (value.objective !== null && !objective) return undefined
  const result = value.result
  return {
    objective,
    verified: typeof value.verified === 'string' ? value.verified : null,
    result:
      isRecord(result) &&
      (result.status === 'completed' || result.status === 'failed') &&
      isFiniteNumber(result.score) &&
      isFiniteNumber(result.delivered) &&
      isStringArray(result.history)
        ? {
            status: result.status,
            score: result.score,
            delivered: result.delivered,
            history: result.history,
            lessons: isStringArray(result.lessons) ? result.lessons : undefined,
          }
        : null,
  }
}
export const missionStore = createPersistedStore({
  key: 'selene-campus-mission-v1',
  initial: emptyMission,
  decode: decodeMission,
})
