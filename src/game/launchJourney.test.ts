import { describe, expect, it } from 'vitest'
import { createLaunchJourney, LAUNCH_DESTINATIONS } from './launchJourney'

describe('authorized cinematic journey', () => {
  it.each(LAUNCH_DESTINATIONS)('arrives at $name once when the cinematic completes', ({ id }) => {
    const flight = createLaunchJourney()
    expect(flight.finish('approved-design', true)).toBeNull()
    expect(flight.begin(id, 'approved-design', true)).toBe(true)
    expect(flight.destination).toBe(id)
    expect(flight.finish('approved-design', true)).toEqual({
      destination: id,
      blueprintKey: 'approved-design',
    })
    // Completion and an Escape key in the same frame cannot trigger two arrivals.
    expect(flight.finish('approved-design', true)).toBeNull()
  })

  it('keeps the authorized destination if the saved preference changes during flight', () => {
    const flight = createLaunchJourney()
    flight.begin('mars', 'approved-design', true)
    expect(flight.begin('moon', 'approved-design', true)).toBe(false)
    expect(flight.finish('approved-design', true)?.destination).toBe('mars')
  })

  it('requires approval and refuses completion for a different or invalid design', () => {
    const flight = createLaunchJourney()
    expect(flight.begin('moon', 'draft', false)).toBe(false)
    expect(flight.finish('draft', true)).toBeNull()
    flight.begin('moon', 'approved-design', true)
    expect(flight.finish('modified-design', true)).toBeNull()
    expect(flight.finish('approved-design', false)).toBeNull()
  })

  it('cancels a discarded launch and permits a fresh destination for the next one', () => {
    const flight = createLaunchJourney()
    flight.begin('moon', 'old-design', true)
    flight.cancel()
    expect(flight.finish('old-design', true)).toBeNull()
    expect(flight.begin('mars', 'new-design', true)).toBe(true)
    expect(flight.finish('new-design', true)?.destination).toBe('mars')
  })
})
