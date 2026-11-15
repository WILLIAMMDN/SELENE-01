import type { InstrumentId } from './missionDesign'

export type MissionWorld = 'moon' | 'mars'
export type MissionArrival = {
  world: MissionWorld
  objective: InstrumentId | null
  key: string
  title: string
  narrative: string
}

const STORAGE_KEY = 'selene-pending-mission-arrival-v1'

/**
 * A destination belongs to the STORY/SCENARIO, not to the instrument.
 * The current campaign is explicitly lunar, regardless of whether the
 * chosen sensor is a camera, radar, or spectrometer.
 *
 * Future scenario scripts should pass their verified world ('moon'|'mars')
 * when calling makeMissionArrival, after their mission rules are implemented.
 */
export const CURRENT_CAMPAIGN_WORLD: MissionWorld = 'moon'

export function makeMissionArrival(
  key: string,
  objective: InstrumentId | null,
  world: MissionWorld = CURRENT_CAMPAIGN_WORLD,
): MissionArrival {
  return {
    world,
    objective,
    key,
    title: world === 'moon' ? 'Explora la Luna simulada.' : 'Explora Marte simulado: Ares.',
    narrative:
      world === 'moon'
        ? 'TARS: ODYSSEY es un orbitador ficticio no tripulado. Este paisaje es una reconstrucción de entrenamiento; las observaciones y transmisiones se deciden en control de misión.'
        : 'TARS: Ares es una reconstrucción de entrenamiento para explorar Marte. El encargo científico de ODYSSEY sigue siendo lunar y no se convierte en una misión marciana al abrir este mapa.',
  }
}

export function savePendingMissionArrival(arrival: MissionArrival) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arrival))
  } catch {
    // Storage denial must not block the scene transition.
  }
}

export function loadPendingMissionArrival(world: MissionWorld): MissionArrival | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as MissionArrival
    if (
      value?.world !== world ||
      typeof value.key !== 'string' ||
      typeof value.title !== 'string' ||
      typeof value.narrative !== 'string'
    )
      return null
    return value
  } catch {
    return null
  }
}

export function clearPendingMissionArrival() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* No persistent state required for dismissal. */
  }
}
