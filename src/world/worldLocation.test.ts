import { describe, expect, it } from 'vitest'
import { worldLocation } from './worldLocation'
import { WORLDS } from './worldConfig'

describe('arrival in the selected map', () => {
  it.each(['moon', 'mars'] as const)(
    'clears campaign entry flags so reloading keeps the player on %s',
    (destination) => {
      const url = worldLocation(
        'http://localhost:5173/?campaign=true&mode=campaign&stage=launch&launch=true&cinematic=true&world=earth&quality=light#game',
        destination,
      )
      expect(url.searchParams.get('world')).toBe(destination)
      for (const flag of ['campaign', 'mode', 'stage', 'launch', 'cinematic'])
        expect(url.searchParams.has(flag)).toBe(false)
      expect(url.searchParams.get('quality')).toBe('light')
      expect(url.hash).toBe('#game')
      const world = WORLDS[destination]
      expect(world.canWalk(...world.start)).toBe(true)
      expect(Number.isFinite(world.height(...world.start))).toBe(true)
    },
  )
})
