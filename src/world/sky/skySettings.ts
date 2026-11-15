import { useSyncExternalStore } from 'react'
import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { isRecord } from '../../shared/persistence/validation'

export type SkySettings = {
  phase: 'cycle' | 'day' | 'sunset' | 'night'
  weather: 'clear' | 'rain' | 'storm'
}
export function decodeSky(value: unknown): SkySettings | undefined {
  if (
    !isRecord(value) ||
    !['cycle', 'day', 'sunset', 'night'].includes(value.phase as string) ||
    !['clear', 'rain', 'storm'].includes(value.weather as string)
  )
    return undefined
  return {
    phase: value.phase as SkySettings['phase'],
    weather: value.weather as SkySettings['weather'],
  }
}
export const skyStore = createPersistedStore<SkySettings>({
  key: 'selene-sky-v1',
  initial: () => ({ phase: 'cycle', weather: 'clear' }),
  decode: decodeSky,
})
export function useSkySettings() {
  return useSyncExternalStore(skyStore.subscribe, skyStore.getSnapshot)
}
export function effectiveWeather(weather: SkySettings['weather'], reduced: boolean) {
  return reduced && weather === 'storm' ? 'rain' : weather
}
