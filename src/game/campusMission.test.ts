import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  INITIAL_DESIGN,
  applyOperation,
  evaluateDesign,
  missionScore,
  startOperations,
} from './missionDesign'
import type { ModuleId } from '../spacecraft/assembly'

const parts: ModuleId[] = [
  'fuselage',
  'connectors',
  'cabin',
  'engine',
  'fuelSmall',
  'energy',
  'rcs',
]
let values: Map<string, string>
beforeEach(() => {
  vi.resetModules()
  values = new Map()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('sessionStorage', { getItem: () => null })
})
afterEach(() => vi.unstubAllGlobals())
async function services() {
  return {
    mission: await import('./campusMission'),
    blueprint: await import('./state/blueprintStore'),
    flight: await import('./state/operationStore'),
  }
}
describe('campus mission workflow', () => {
  it('requires an objective and assembled design before reviewing or recording a flight', async () => {
    const { mission, blueprint } = await services()
    expect(mission.nextMissionStep().sector).toBe('research')
    expect(mission.verifyMission()).toBe(false)
    mission.acceptObjective('camera')
    expect(mission.nextMissionStep().sector).toBe('hangar')
    expect(mission.verifyMission()).toBe(false)
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    expect(mission.nextMissionStep().sector).toBe('control')
    expect(mission.missionVerified(INITIAL_DESIGN, parts)).toBe(false)
    mission.recordMission(
      { ...startOperations(), status: 'completed', step: 3 },
      80,
      INITIAL_DESIGN,
      parts,
    )
    expect(mission.getMission().result).toBeNull()
  })
  it('invalidates the review for configuration changes and restores the complete sequence', async () => {
    let { mission, blueprint, flight } = await services()
    mission.acceptObjective('camera')
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    expect(mission.verifyMission()).toBe(true)
    expect(mission.nextMissionStep().sector).toBe('launch')
    const config = { ...INITIAL_DESIGN, durationDays: 30 as const }
    blueprint.saveBlueprint({ config, parts })
    expect(mission.missionVerified(config, parts)).toBe(false)
    expect(mission.nextMissionStep().sector).toBe('control')
    expect(mission.verifyMission()).toBe(true)
    const key = mission.blueprintKey(config, parts)
    const evaluation = evaluateDesign(config)
    const first = applyOperation(startOperations(), 'observe', evaluation)
    flight.saveOperationSession(key, first)
    vi.resetModules()
    ;({ mission, blueprint, flight } = await services())
    expect(blueprint.loadBlueprint().config.durationDays).toBe(30)
    expect(mission.missionVerified(config, parts)).toBe(true)
    let state = flight.loadOperationSession(key)!.ops
    expect(state.step).toBe(1)
    state = applyOperation(state, 'downlink', evaluation)
    state = applyOperation(state, 'safemode', evaluation)
    mission.recordMission(state, missionScore(state, evaluation), config, parts)
    expect(mission.nextMissionStep().sector).toBe('observatory')
    expect(mission.getMission().result?.delivered).toBeGreaterThan(0)
    vi.resetModules()
    ;({ mission } = await services())
    expect(mission.nextMissionStep().sector).toBe('observatory')
    expect(mission.getMission().result?.history).toHaveLength(3)
  })
  it('checks the chosen instrument, polar coverage and module changes', async () => {
    const { mission, blueprint } = await services()
    mission.acceptObjective('radar')
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    expect(mission.verifyMission()).toBe(false)
    mission.acceptObjective('camera')
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN, orbit: 'inclined' }, parts })
    expect(mission.verifyMission()).toBe(false)
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    expect(mission.verifyMission()).toBe(true)
    expect(
      mission.missionVerified(
        INITIAL_DESIGN,
        parts.filter((id) => id !== 'engine'),
      ),
    ).toBe(false)
    expect(mission.missionVerified(INITIAL_DESIGN, [...parts].reverse())).toBe(true)
  })
  it('keeps station-to-station progress usable when storage throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked')
      },
      setItem: () => {
        throw Error('blocked')
      },
    })
    const { mission, blueprint } = await services()
    mission.acceptObjective('camera')
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    expect(mission.verifyMission()).toBe(true)
    expect(mission.nextMissionStep().sector).toBe('launch')
    expect(blueprint.loadBlueprint().parts).toEqual(parts)
  })
  it('drops a previous flight when choosing another objective or resetting', async () => {
    const { mission, blueprint, flight } = await services()
    mission.acceptObjective('camera')
    blueprint.saveBlueprint({ config: { ...INITIAL_DESIGN }, parts })
    mission.verifyMission()
    const key = mission.blueprintKey(INITIAL_DESIGN, parts)
    flight.saveOperationSession(key, startOperations())
    mission.acceptObjective('spectrometer')
    expect(flight.loadOperationSession(key)).toBeNull()
    expect(mission.getMission().verified).toBeNull()
    mission.resetCampusMission()
    expect(mission.nextMissionStep().sector).toBe('research')
  })
  it('loads existing save keys and safely defaults corrupted drafts', async () => {
    values.set(
      'selene-campus-mission-v1',
      JSON.stringify({ objective: 'camera', verified: null, result: null }),
    )
    values.set('selene-odyssey-blueprint-v1', '{invalid')
    const { mission, blueprint } = await services()
    expect(mission.getMission().objective).toBe('camera')
    expect(blueprint.loadBlueprint().parts).toEqual(['fuselage'])
    expect(mission.verifyMission()).toBe(false)
  })
})
