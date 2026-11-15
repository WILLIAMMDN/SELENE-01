import { assemblyReady, type ModuleId } from '../../spacecraft/assembly'
import {
  applyOperation,
  evaluateDesign,
  missionScore,
  startOperations,
  type DesignConfig,
  type OperationChoice,
} from '../../game/missionDesign'

/** A standalone, reproducible example; it never writes the player's saved mission. */
export const DEMO_CONFIG: DesignConfig = {
  instruments: ['radar'],
  orbit: 'polar-low',
  launcher: 'aurora',
  solarUpgrade: true,
  commUpgrade: false,
  durationDays: 90,
  habitat: false,
  supports: false,
}
export const DEMO_PARTS: ModuleId[] = [
  'fuselage',
  'connectors',
  'cabin',
  'engine',
  'fuel',
  'energy',
  'rcs',
  'solar',
]
export const DEMO_CHOICES: OperationChoice[] = ['observe', 'downlink', 'safemode']
export const DEMO_EVALUATION = evaluateDesign(DEMO_CONFIG)
export const DEMO_READY = assemblyReady(DEMO_PARTS) && DEMO_EVALUATION.ready
export const DEMO_OPERATIONS = DEMO_CHOICES.reduce(
  (states, choice) => [
    ...states,
    applyOperation(states[states.length - 1], choice, DEMO_EVALUATION),
  ],
  [startOperations()],
)
export const DEMO_SCORE = missionScore(DEMO_OPERATIONS[3], DEMO_EVALUATION)
