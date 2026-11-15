import { describe, it, expect } from 'vitest'
import { createPersistedStore, type StorageAccess } from './createPersistedStore'

const decode = (value: unknown) => typeof value === 'number' ? value : undefined
describe('persistent snapshots', () => {
  it('keeps the latest shared value and subscriptions when storage is denied', () => {
    const denied: StorageAccess = () => { throw new Error('denied') }
    const store = createPersistedStore({ key: 'test', initial: () => 0, decode, storage: denied })
    const seen: number[] = []
    const unsubscribe = store.subscribe(() => seen.push(store.getSnapshot()))
    store.set(7)
    expect(store.getSnapshot()).toBe(7)
    expect(store.getSnapshot()).toBe(7)
    expect(seen).toEqual([7])
    unsubscribe()
    store.set(9)
    expect(seen).toEqual([7])
  })
  it('restores the persisted value in a fresh instance', () => {
    let saved: string | null = null
    const storage = () => ({ getItem: () => saved, setItem: (_key: string, value: string) => { saved = value } })
    const options = { key: 'test', initial: () => 0, decode, storage }
    createPersistedStore(options).set(42)
    expect(createPersistedStore(options).getSnapshot()).toBe(42)
  })
  it('uses a valid legacy save if the primary value is malformed', () => {
    const store = createPersistedStore({ key: 'test', initial: () => 0, decode,
      storage: () => ({ getItem: () => '{broken', setItem: () => {} }),
      legacyStorage: () => ({ getItem: () => '12', setItem: () => {} }),
    })
    expect(store.getSnapshot()).toBe(12)
  })
  it('rejects invalid payloads and gives each instance a fresh default', () => {
    const options = { key: 'test', initial: () => [0], decode: () => undefined,
      storage: () => ({ getItem: () => '{}', setItem: () => {} }),
    }
    const first = createPersistedStore<number[]>(options)
    first.getSnapshot().push(1)
    expect(createPersistedStore<number[]>(options).getSnapshot()).toEqual([0])
  })
})
