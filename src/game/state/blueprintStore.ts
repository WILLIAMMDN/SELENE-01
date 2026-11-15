import { useSyncExternalStore } from 'react'
import { INITIAL_DESIGN, INSTRUMENTS, ORBITS, LAUNCHERS, type DesignConfig } from '../missionDesign'
import { INITIAL_ASSEMBLY, MODULES, type ModuleId } from '../../spacecraft/assembly'
import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { isRecord } from '../../shared/persistence/validation'

export type Blueprint = { config: DesignConfig; parts: ModuleId[] }
export function initialBlueprint(): Blueprint {
  return {
    config: { ...INITIAL_DESIGN, instruments: [...INITIAL_DESIGN.instruments] },
    parts: [...INITIAL_ASSEMBLY],
  }
}
export function decodeBlueprint(value: unknown): Blueprint | undefined {
  if (!isRecord(value) || !Array.isArray(value.parts) || !isRecord(value.config)) return undefined
  const c = value.config,
    savedParts = value.parts
  const orbit = ORBITS.find((o) => o.id === c.orbit)?.id,
    launcher = LAUNCHERS.find((l) => l.id === c.launcher)?.id
  if (
    !Array.isArray(c.instruments) ||
    !c.instruments.every((id) => INSTRUMENTS.some((i) => i.id === id)) ||
    !orbit ||
    !launcher ||
    typeof c.solarUpgrade !== 'boolean' ||
    typeof c.commUpgrade !== 'boolean'
  )
    return undefined
  let parts = MODULES.filter((m) => savedParts.includes(m.id)).map((m) => m.id)
  if (!parts.includes('fuselage')) parts = []
  else if (!parts.includes('connectors')) parts = ['fuselage']
  if (!parts.includes('habitat')) parts = parts.filter((id) => id !== 'antenna')
  if (parts.includes('fuel')) parts = parts.filter((id) => id !== 'fuelSmall')
  return {
    parts,
    config: {
      instruments: [...new Set(c.instruments)] as DesignConfig['instruments'],
      durationDays: c.durationDays === 30 || c.durationDays === 180 ? c.durationDays : 90,
      orbit,
      launcher,
      solarUpgrade: parts.includes('solar'),
      commUpgrade: parts.includes('antenna'),
      habitat: parts.includes('habitat'),
      supports: parts.includes('supports'),
    },
  }
}
export const blueprintStore = createPersistedStore({
  key: 'selene-odyssey-blueprint-v1',
  initial: initialBlueprint,
  decode: decodeBlueprint,
  legacyStorage: () => sessionStorage,
})
export const loadBlueprint = blueprintStore.getSnapshot
// Write synchronously before leaving a station, even when disk persistence fails.
export const saveBlueprint = blueprintStore.set
export const useBlueprint = () => useSyncExternalStore(blueprintStore.subscribe, loadBlueprint)
