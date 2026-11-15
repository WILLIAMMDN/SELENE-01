import { describe, it, expect } from 'vitest'
import {
  INITIAL_DESIGN,
  evaluateDesign,
  startOperations,
  applyOperation,
  missionScore,
  OPERATION_EVENTS,
} from './missionDesign'
describe('Space Mission Design Game', () => {
  it('permite una carga útil viable', () => expect(evaluateDesign(INITIAL_DESIGN).ready).toBe(true))
  it('exige instrumentos', () =>
    expect(evaluateDesign({ ...INITIAL_DESIGN, instruments: [] }).ready).toBe(false))
  it('identifica incompatibilidades reales dentro de las reglas simuladas', () => {
    const result = evaluateDesign({
      ...INITIAL_DESIGN,
      instruments: ['camera', 'radar', 'spectrometer'],
    })
    expect(result.problems.some((x) => x.includes('datos'))).toBe(true)
    expect(result.problems.some((x) => x.includes('potencia'))).toBe(true)
  })
  it('una antena aumenta transmisión a cambio de masa y costo', () => {
    const a = evaluateDesign(INITIAL_DESIGN)
    const b = evaluateDesign({ ...INITIAL_DESIGN, commUpgrade: true })
    expect(b.capacity.data).toBeGreaterThan(a.capacity.data)
    expect(b.total.mass).toBeGreaterThan(a.total.mass)
    expect(b.total.cost).toBeGreaterThan(a.total.cost)
  })
  it('una órbita distinta altera cobertura y comunicaciones', () => {
    const a = evaluateDesign(INITIAL_DESIGN)
    const b = evaluateDesign({ ...INITIAL_DESIGN, orbit: 'inclined' })
    expect(b.total.science).toBeLessThan(a.total.science)
    expect(b.capacity.data).toBeGreaterThan(a.capacity.data)
  })
  it('inicia, opera y evalúa una misión', () => {
    const design = evaluateDesign(INITIAL_DESIGN)
    let state = startOperations()
    state = applyOperation(state, 'observe', design)
    state = applyOperation(state, 'downlink', design)
    state = applyOperation(state, 'safemode', design)
    expect(state.status).toBe('completed')
    expect(state.delivered).toBeGreaterThan(0)
    expect(missionScore(state, design)).toBeGreaterThan(0)
  })
  it('no permite acciones fuera de la fase de operaciones', () => {
    const design = evaluateDesign(INITIAL_DESIGN)
    expect(applyOperation(startOperations(), 'emergency', design).step).toBe(0)
    expect(OPERATION_EVENTS).toHaveLength(3)
  })
})
