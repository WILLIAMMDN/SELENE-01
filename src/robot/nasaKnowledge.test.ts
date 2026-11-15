import { describe, it, expect } from 'vitest'
import { NASA_FACTS, findFact, normalizeQuestion } from './nasaKnowledge'
import { mediaSearchUrl } from './nasaMedia'
describe('TARS', () => {
  it('reconoce tildes', () => expect(normalizeQuestion('ÓRBITA LUNAR')).toBe('orbita lunar'))
  it('responde con fuente oficial', () => {
    const fact = findFact('¿Se encuentra hielo en el polo lunar?')
    expect(fact?.id).toBe('lunar-ice')
    expect(fact?.url).toMatch(/nasa\.gov/)
  })
  it('rechaza preguntas desconocidas', () => {
    expect(findFact('¿Quién ganará la final el domingo?')).toBeNull()
    expect(findFact('')).toBeNull()
  })
  it('todas las fichas remiten a NASA', () =>
    NASA_FACTS.forEach((f) => expect(new URL(f.url).hostname).toMatch(/(^|\.)nasa\.gov$/)))
  it('escapa las búsquedas web', () =>
    expect(mediaSearchUrl('Moon & Ice')).toContain('Moon%20%26%20Ice'))
})
