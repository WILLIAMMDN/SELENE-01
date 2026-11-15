export const LAUNCH_DESTINATIONS = [
  { id: 'moon', name: 'Luna', place: 'Base lunar ODYSSEY' },
  { id: 'mars', name: 'Marte', place: 'Sector Ares' },
] as const

export type LaunchDestination = (typeof LAUNCH_DESTINATIONS)[number]['id']

export function isLaunchDestination(value: unknown): value is LaunchDestination {
  return LAUNCH_DESTINATIONS.some((destination) => destination.id === value)
}

type Flight = { destination: LaunchDestination; blueprintKey: string }

/** The selected exploration map is retained through the launch simulation. */
export function createLaunchJourney() {
  let pending: Flight | null = null
  return {
    begin(destination: LaunchDestination, blueprintKey: string, ready: boolean) {
      if (!ready || pending) return false
      pending = { destination, blueprintKey }
      return true
    },
    finish(blueprintKey: string, ready: boolean): Flight | null {
      if (!ready || !pending || pending.blueprintKey !== blueprintKey) return null
      const arrival = pending
      pending = null
      return arrival
    },
    cancel() {
      pending = null
    },
    get destination() {
      return pending?.destination
    },
  }
}
