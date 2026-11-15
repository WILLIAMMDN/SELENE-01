import { useSyncExternalStore } from 'react'
import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { LUNAR_RESOURCES } from './lunarResources'

const sampleIds = new Set<string>(LUNAR_RESOURCES.map(({ id }) => id))
const samples = createPersistedStore<string[]>({
  key: 'selene_lunar_resources_collected_v1',
  initial: () => [],
  decode: (value) =>
    Array.isArray(value)
      ? [
          ...new Set(
            value.filter((id): id is string => typeof id === 'string' && sampleIds.has(id)),
          ),
        ]
      : undefined,
})

export function useLunarSamples() {
  return useSyncExternalStore(samples.subscribe, samples.getSnapshot)
}

export function collectLunarResource(id: string) {
  const existing = samples.getSnapshot()
  if (existing.includes(id) || !sampleIds.has(id)) return existing
  const next = [...existing, id]
  samples.set(next)
  return next
}

const milestones = ['power', 'telemetry', 'traverse', 'return'] as const
type Milestone = (typeof milestones)[number]

const operations = createPersistedStore<Milestone[]>({
  key: 'selene_lunar_surface_operations_v1',
  initial: () => [],
  decode: (value) =>
    Array.isArray(value) ? milestones.filter((milestone) => value.includes(milestone)) : undefined,
})

export const LUNAR_TRAVERSE_DISTANCE = 30

export function useLunarOperations() {
  return useSyncExternalStore(operations.subscribe, operations.getSnapshot)
}

export function completeLunarOperation(milestone: Milestone) {
  const existing = operations.getSnapshot()
  if (!existing.includes(milestone)) operations.set([...existing, milestone])
}

const fieldMilestones = ['iceAnalyzed', 'iceSent'] as const
type FieldMilestone = (typeof fieldMilestones)[number]
type RockDisposition = 'carried' | 'archived' | 'reserved'
type LunarFieldwork = { steps: FieldMilestone[]; rock: RockDisposition }

const fieldwork = createPersistedStore<LunarFieldwork>({
  key: 'selene_lunar_fieldwork_v1',
  initial: () => ({ steps: [], rock: 'carried' }),
  decode: (value) => {
    if (!value || typeof value !== 'object') return undefined
    const data = value as Partial<LunarFieldwork>
    const raw = Array.isArray(data.steps) ? data.steps : []
    const steps = fieldMilestones.filter(
      (step) => raw.includes(step) && (step !== 'iceSent' || raw.includes('iceAnalyzed')),
    )
    const rock = data.rock === 'archived' || data.rock === 'reserved' ? data.rock : 'carried'
    return { steps, rock }
  },
})

export function useLunarFieldwork() {
  return useSyncExternalStore(fieldwork.subscribe, fieldwork.getSnapshot)
}

export function analyzeLunarIce() {
  const state = fieldwork.getSnapshot()
  if (state.steps.includes('iceAnalyzed') || !samples.getSnapshot().includes('hielo')) return false
  fieldwork.set({ ...state, steps: [...state.steps, 'iceAnalyzed'] })
  return true
}

export function transmitLunarIce() {
  const state = fieldwork.getSnapshot()
  if (
    !state.steps.includes('iceAnalyzed') ||
    state.steps.includes('iceSent') ||
    !operations.getSnapshot().includes('power')
  )
    return false
  fieldwork.set({ ...state, steps: [...state.steps, 'iceSent'] })
  completeLunarOperation('telemetry')
  return true
}

export function setLunarRockDisposition(rock: RockDisposition) {
  if (!samples.getSnapshot().includes('roca') || operations.getSnapshot().includes('return')) return
  const state = fieldwork.getSnapshot()
  if (state.rock !== rock) fieldwork.set({ ...state, rock })
}

export function prepareLunarReturn() {
  if (
    samples.getSnapshot().length !== LUNAR_RESOURCES.length ||
    fieldwork.getSnapshot().rock !== 'reserved' ||
    operations.getSnapshot().includes('return')
  )
    return false
  completeLunarOperation('return')
  return true
}
