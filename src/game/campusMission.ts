import { useSyncExternalStore } from 'react'
import { objectiveDebrief } from './objectiveDebrief'
import {
  missionDebrief,
  evaluateDesign,
  type InstrumentId,
  type DesignConfig,
  type OperationState,
} from './missionDesign'
import type { ModuleId } from '../spacecraft/assembly'
import { loadBlueprint } from './state/blueprintStore'
import { emptyMission, missionStore } from './state/missionStore'
import * as rules from './missionRules'
import { clearOperationSession } from './state/operationStore'

export { OBJECTIVES } from './objectives'
export const getMission = missionStore.getSnapshot
export const useCampusMission = () => useSyncExternalStore(missionStore.subscribe, getMission)
export function acceptObjective(objective: InstrumentId) {
  clearOperationSession()
  missionStore.set({ objective, verified: null, result: null })
}
export function resetCampusMission() {
  clearOperationSession()
  missionStore.set(emptyMission())
}
export const blueprintKey = (config: DesignConfig, parts: ModuleId[]) =>
  rules.blueprintKey(getMission(), config, parts)
export const missionProblems = (config: DesignConfig, parts: ModuleId[]) =>
  rules.missionProblems(getMission(), config, parts)
export const missionVerified = (config: DesignConfig, parts: ModuleId[]) =>
  rules.missionVerified(getMission(), config, parts)
export function verifyMission() {
  const { config, parts } = loadBlueprint()
  if (missionProblems(config, parts).length) return false
  // Reopening an already approved design must not erase its flight or report.
  if (missionVerified(config, parts)) return true
  clearOperationSession()
  missionStore.set({ ...getMission(), verified: blueprintKey(config, parts), result: null })
  return true
}
export function recordMission(
  result: OperationState,
  score: number,
  config: DesignConfig,
  parts: ModuleId[],
) {
  if (result.status === 'running' || !missionVerified(config, parts)) return
  const debrief = objectiveDebrief(getMission().objective, config, result)
  missionStore.set({
    ...getMission(),
    result: {
      status: result.status,
      score,
      delivered: result.delivered,
      history: result.history,
      lessons: [
        ...(debrief
          ? [
              `Encargo: ${debrief.objective.name}. ${debrief.objective.question}`,
              debrief.title,
              debrief.explanation,
              debrief.limit,
              debrief.reflection,
            ]
          : []),
        ...missionDebrief(result, evaluateDesign(config)),
      ],
    },
  })
}
export function nextMissionStep() {
  const { config, parts } = loadBlueprint()
  return rules.nextMissionStep(getMission(), config, parts)
}
