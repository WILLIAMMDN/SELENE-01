import { describe, expect, it } from 'vitest'
import { createPersistedStore } from '../shared/persistence/createPersistedStore'
import { CHARACTERS } from './characters'
import {
  availableOutfits,
  chooseCharacter,
  decodeWardrobe,
  equipForLaunch,
  wardrobeVisible,
  type Wardrobe,
} from './wardrobe'

const legacy: Wardrobe = {
  character: 'explorer',
  earth: 'classic',
  mars: 'classic',
  moon: 'eva',
  helmet: true,
}

describe('crew selection and clothing saves', () => {
  it.each(CHARACTERS)('keeps $name and equips EVA clothing on arrival', ({ id }) => {
    const before: Wardrobe = {
      ...legacy,
      character: id,
      earth: 'formal',
      moon: 'classic',
      helmet: false,
    }
    for (const destination of ['moon', 'mars'] as const) {
      const after = equipForLaunch(before, destination)
      expect(after.character).toBe(id)
      expect(after.earth).toBe('formal')
      expect(after[destination]).toBe('eva')
      expect(after.helmet).toBe(true)
    }
    expect(before.helmet).toBe(false)
    expect(before.moon).toBe('classic')
  })
  it.each(CHARACTERS)('persists $name with its own identity and compatible outfits', ({ id }) => {
    let saved: string | null = null
    const options = {
      key: 'wardrobe-test',
      initial: () => ({ ...legacy }),
      decode: decodeWardrobe,
      storage: () => ({
        getItem: () => saved,
        setItem: (_key: string, value: string) => {
          saved = value
        },
      }),
    }
    const store = createPersistedStore<Wardrobe>(options)
    store.set(chooseCharacter(store.getSnapshot(), id))
    store.set({ ...store.getSnapshot(), earth: 'eva', helmet: false })
    expect(createPersistedStore<Wardrobe>(options).getSnapshot()).toEqual({
      character: id,
      earth: 'eva',
      mars: 'eva',
      moon: 'eva',
      helmet: false,
    })
  })
  it('migrates the earlier pilot save without switching to the old generic astronaut', () => {
    const { moon: _moon, ...old } = legacy
    expect(decodeWardrobe({ ...old, character: 'pilot' })).toEqual({
      ...legacy,
      character: 'pilot',
      earth: 'formal',
      mars: 'eva',
      moon: 'eva',
    })
    expect(decodeWardrobe({ ...old, character: 'missing' })?.character).toBe('explorer')
  })
  it.each(CHARACTERS.filter((c) => c.id !== 'explorer'))(
    'keeps $name available on all worlds',
    ({ id }) => {
      const selected = chooseCharacter(legacy, id)
      expect(selected.earth).toBe('formal')
      for (const world of ['mars', 'moon'] as const) {
        expect(availableOutfits(id, world).map(([outfit]) => outfit)).toEqual(['eva'])
      }
      expect(availableOutfits(id, 'earth').map(([outfit]) => outfit)).toEqual([
        'original',
        'formal',
        'eva',
      ])
    },
  )
  it('hides the other clothing layers and removes only the helmet when toggled', () => {
    expect(wardrobeVisible('formal', 'eva', true)).toBe(false)
    expect(wardrobeVisible('original', 'formal', false)).toBe(false)
    expect(wardrobeVisible('eva', 'eva', false)).toBe(true)
    expect(wardrobeVisible('helmet', 'eva', false)).toBe(false)
    expect(wardrobeVisible('helmet', 'formal', true)).toBe(false)
    expect(wardrobeVisible('body', 'eva', false)).toBe(true)
  })
})
