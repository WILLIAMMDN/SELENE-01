import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let values: Map<string, string>
beforeEach(() => {
  vi.resetModules()
  values = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('launch destination preference', () => {
  it('defaults to the Moon and restores the chosen map after reloading', async () => {
    let { launchDestinationStore } = await import('./launchDestinationStore')
    expect(launchDestinationStore.getSnapshot()).toBe('moon')
    launchDestinationStore.set('mars')
    vi.resetModules()
    ;({ launchDestinationStore } = await import('./launchDestinationStore'))
    expect(launchDestinationStore.getSnapshot()).toBe('mars')
  })

  it.each(['"earth"', '"unknown"', '{invalid', 'null'])(
    'safely defaults an unavailable or corrupted destination: %s',
    async (saved) => {
      values.set('selene-launch-destination-v1', saved)
      const { launchDestinationStore } = await import('./launchDestinationStore')
      expect(launchDestinationStore.getSnapshot()).toBe('moon')
    },
  )

  it('keeps the selection usable when browser storage is unavailable', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked')
      },
      setItem: () => {
        throw Error('blocked')
      },
    })
    const { launchDestinationStore } = await import('./launchDestinationStore')
    launchDestinationStore.set('mars')
    expect(launchDestinationStore.getSnapshot()).toBe('mars')
  })
})
