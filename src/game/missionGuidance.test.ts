import { describe, expect, it } from 'vitest'
import type { ModuleId } from '../spacecraft/assembly'
import { INITIAL_DESIGN } from './missionDesign'
import { missionGuidance } from './missionGuidance'
import { blueprintKey, type Mission } from './missionRules'

const parts: ModuleId[] = [
  'fuselage',
  'connectors',
  'cabin',
  'engine',
  'fuelSmall',
  'energy',
  'rcs',
]
const mission: Mission = { objective: 'camera', verified: null, result: null }
describe('mission guidance', () => {
  it('starts with the scientific question, not an automatic build', () => {
    const guide = missionGuidance({ ...mission, objective: null }, INITIAL_DESIGN, ['fuselage'])
    expect(guide.next.sector).toBe('research')
    expect(guide.requirements[0].complete).toBe(false)
    expect(guide.explanation).toContain('Dra. Vega')
  })
  it('names missing parts before sending an incomplete ship to review', () => {
    const guide = missionGuidance(mission, INITIAL_DESIGN, ['fuselage'])
    expect(guide.next.sector).toBe('hangar')
    expect(guide.explanation).toContain('Falta ensamblar')
  })
  it('keeps the objective requirement separate from otherwise valid engineering', () => {
    const guide = missionGuidance({ ...mission, objective: 'radar' }, INITIAL_DESIGN, parts)
    expect(guide.requirements.find((item) => item.id === 'instrument')?.complete).toBe(false)
    expect(guide.requirements.find((item) => item.id === 'resources')?.complete).toBe(true)
    expect(guide.explanation).toContain('Radar')
    expect(guide.next.sector).toBe('hangar')
  })
  it('explains that changed duration requires a new review', () => {
    const reviewed = { ...mission, verified: blueprintKey(mission, INITIAL_DESIGN, parts) }
    const guide = missionGuidance(reviewed, { ...INITIAL_DESIGN, durationDays: 30 }, parts)
    expect(guide.next.sector).toBe('control')
    expect(guide.explanation).toContain('cambió')
    expect(guide.requirements.filter((item) => item.complete)).toHaveLength(5)
  })
  it('directs a fully reviewed design to launch and a finished flight to the observatory', () => {
    const reviewed = { ...mission, verified: blueprintKey(mission, INITIAL_DESIGN, parts) }
    expect(
      missionGuidance(reviewed, INITIAL_DESIGN, parts).requirements.every((item) => item.complete),
    ).toBe(true)
    expect(missionGuidance(reviewed, INITIAL_DESIGN, parts).next.sector).toBe('launch')
    const completed: Mission = {
      ...reviewed,
      result: { status: 'completed', score: 50, delivered: 8, history: [] },
    }
    expect(missionGuidance(completed, INITIAL_DESIGN, parts).next.sector).toBe('observatory')
  })
})
