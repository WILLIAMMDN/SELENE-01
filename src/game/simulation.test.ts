import { describe, expect, it } from 'vitest'
import { applyImpact, choose, initialMission, nextSol, LAST_SOL } from './simulation'

describe('simulador SELENE-01', () => {
  it('comienza en el sol 1 y con recursos independientes', () => {
    const a = initialMission()
    const b = initialMission()
    a.resources.energy = 1
    expect(b.resources.energy).toBe(72)
    expect(b.sol).toBe(1)
  })

  it('impide avanzar sin decidir e impide decidir dos veces', () => {
    const start = initialMission()
    expect(nextSol(start)).toBe(start)
    const chosen = choose(start, 'solar')
    expect(choose(chosen, 'reserve')).toBe(chosen)
    expect(chosen.selectedChoice).toBe('solar')
  })

  it('limita los índices al rango de 0 a 100', () => {
    const result = applyImpact(initialMission().resources, { energy: 1000, water: -1000 })
    expect(result.energy).toBe(100)
    expect(result.water).toBe(0)
  })

  it('permite completar los 5 soles tomando decisiones válidas', () => {
    let state = initialMission()
    const picks = ['solar', 'recycle', 'shelter', 'balance', 'conserve']
    for (const id of picks) {
      state = choose(state, id)
      state = nextSol(state)
    }
    expect(state.status).toBe('won')
    expect(state.sol).toBe(LAST_SOL)
    expect(state.history.length).toBe(10)
  })

  it('pierde la misión si un recurso llega a cero tras el consumo', () => {
    const state = choose({ ...initialMission(), resources: { ...initialMission().resources, oxygen: 2 } }, 'solar')
    const result = nextSol(state)
    expect(result.status).toBe('lost')
    expect(result.resources.oxygen).toBe(0)
  })
})
