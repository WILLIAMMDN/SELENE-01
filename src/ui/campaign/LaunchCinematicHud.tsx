import type { LaunchDestination } from '../../game/launchJourney'
import type { DesignConfig } from '../../game/missionDesign'
import type { ModuleId } from '../../spacecraft/assembly'
import LaunchCinematicOverlay from '../../spacecraft/LaunchCinematicOverlay'

/** Shared understated HUD across the campaign fallback and in-world film. */
export default function LaunchCinematicHud({
  seconds,
  config,
  onSkip,
  destination,
}: {
  seconds: number
  config: DesignConfig
  parts: ModuleId[]
  destination?: LaunchDestination
  onSkip: () => void
}) {
  return (
    <LaunchCinematicOverlay
      seconds={seconds}
      config={config}
      onSkip={onSkip}
      destination={destination}
    />
  )
}
