import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { isRecord, isStringArray, isFiniteNumber } from '../../shared/persistence/validation'
import { OPERATION_EVENTS, type OperationState } from '../missionDesign'

export type OperationSession = { blueprintKey: string; ops: OperationState }

export function decodeOperationSession(value: unknown): OperationSession | null {
  if (!isRecord(value) || typeof value.blueprintKey !== 'string' || !isRecord(value.ops)) return null
  const o = value.ops
  if (!isFiniteNumber(o.step) || !Number.isInteger(o.step) || o.step < 0 || o.step > OPERATION_EVENTS.length ||
      !isFiniteNumber(o.battery) || o.battery < 0 || o.battery > 100 ||
      !isFiniteNumber(o.stored) || o.stored < 0 ||
      !isFiniteNumber(o.delivered) || o.delivered < 0 ||
      !isFiniteNumber(o.science) || o.science < 0 || !isStringArray(o.history) ||
      !['running', 'completed', 'failed'].includes(String(o.status))) return null
  if (o.status === 'running' && o.step === OPERATION_EVENTS.length) return null
  if (o.status === 'completed' && o.step !== OPERATION_EVENTS.length) return null
  return { blueprintKey: value.blueprintKey, ops: {
    step: o.step, battery: o.battery, stored: o.stored, delivered: o.delivered,
    science: o.science, history: o.history, status: o.status as OperationState['status'],
  } }
}
const operationStore = createPersistedStore<OperationSession | null>({
  key: 'selene-operations-v1', initial: () => null, decode: decodeOperationSession,
})
export function loadOperationSession(key: string): OperationSession | null {
  const saved = operationStore.getSnapshot()
  return saved?.blueprintKey === key ? saved : null
}
export function saveOperationSession(key: string, ops: OperationState) {
  operationStore.set({ blueprintKey: key, ops })
}
export function clearOperationSession() { operationStore.set(null) }
