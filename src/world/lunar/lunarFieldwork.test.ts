import { afterEach, expect, it, vi } from 'vitest'
import { LUNAR_WORKSTATIONS, lunarWorkstationAt } from './lunarFieldwork'

afterEach(() => vi.unstubAllGlobals())

it('places analysis and inventory on accessible decks and requires approaching the furniture', () => {
  for (const station of LUNAR_WORKSTATIONS)
    expect(lunarWorkstationAt(station.x, station.z)?.id).toBe(station.id)
  expect(lunarWorkstationAt(56.58, 85.78)).toBeUndefined()
  expect(lunarWorkstationAt(63.52, 78.9)).toBeUndefined()
})

it('requires samples, analysis and power in order and persists transmission and rock disposition', async () => {
  const saves = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saves.get(key) ?? null,
    setItem: (key: string, value: string) => saves.set(key, value),
  })
  vi.resetModules()
  const {
    analyzeLunarIce,
    collectLunarResource,
    completeLunarOperation,
    prepareLunarReturn,
    setLunarRockDisposition,
    transmitLunarIce,
  } = await import('./lunarMissionProgress')
  expect(analyzeLunarIce()).toBe(false)
  expect(transmitLunarIce()).toBe(false)
  collectLunarResource('hielo')
  expect(analyzeLunarIce()).toBe(true)
  expect(analyzeLunarIce()).toBe(false)
  expect(transmitLunarIce()).toBe(false)
  completeLunarOperation('power')
  expect(transmitLunarIce()).toBe(true)
  expect(transmitLunarIce()).toBe(false)
  expect(prepareLunarReturn()).toBe(false)
  for (const resource of ['regolito', 'helio', 'titanio', 'hierro', 'roca'])
    collectLunarResource(resource)
  setLunarRockDisposition('archived')
  expect(prepareLunarReturn()).toBe(false)
  setLunarRockDisposition('reserved')
  expect(prepareLunarReturn()).toBe(true)
  setLunarRockDisposition('archived')
  expect(JSON.parse(saves.get('selene_lunar_fieldwork_v1')!)).toEqual({
    steps: ['iceAnalyzed', 'iceSent'],
    rock: 'reserved',
  })
  vi.resetModules()
  const reopened = await import('./lunarMissionProgress')
  expect(reopened.analyzeLunarIce()).toBe(false)
  expect(reopened.transmitLunarIce()).toBe(false)
  expect(reopened.prepareLunarReturn()).toBe(false)
})
