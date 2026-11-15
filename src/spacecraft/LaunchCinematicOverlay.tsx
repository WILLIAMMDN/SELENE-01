import type { DesignConfig } from '../game/missionDesign'
import { LAUNCH_DESTINATIONS, type LaunchDestination } from '../game/launchJourney'
import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'
import './boardingSequence.css'

/** Only the context a player needs; the rocket and camera remain the main subject. */
export default function LaunchCinematicOverlay({
  seconds,
  config,
  onSkip,
  destination,
}: {
  seconds: number
  config: DesignConfig
  onSkip: () => void
  destination?: LaunchDestination
}) {
  const frame = getLaunchFrame(seconds, config.launcher, config.habitat)
  const target = LAUNCH_DESTINATIONS.find((item) => item.id === destination)
  const text =
    target && frame.beat === 'orbital'
      ? `Preparando llegada a ${target.place}.`
      : frame.narration.replace(/^TARS:\s*/, '')
  const showAltitude = seconds >= 18 && seconds < 41
  return (
    <div className="selene-cutscene" role="region" aria-label="Lanzamiento de ODYSSEY">
      <button className="selene-cutscene-skip" type="button" onClick={onSkip}>
        Omitir <kbd>Esc</kbd>
      </button>
      {frame.countdown !== null && (
        <div className="selene-cutscene-countdown" aria-label={`Despegue en ${frame.countdown}`}>
          <span>DESPEGUE</span>
          <strong>{String(frame.countdown).padStart(2, '0')}</strong>
        </div>
      )}
      <div className="selene-cutscene-dialogue" aria-live="off">
        <span className="selene-cutscene-speaker">
          {frame.speaker === 'TARS' ? 'TARS' : 'DRA. VEGA'}
        </span>
        <p>{text}</p>
        <div className="selene-cutscene-meta">
          <span>{frame.milestone}</span>
          {target && <span>Destino · {target.name}</span>}
          {showAltitude && (
            <span>
              Alt. ilustrativa {Math.round(frame.altitudeMeters).toLocaleString('es-PE')} m
            </span>
          )}
        </div>
        <div
          className="selene-cutscene-progress"
          role="progressbar"
          aria-label="Progreso de la secuencia"
          aria-valuenow={Math.round((seconds / LAUNCH_DURATION) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${(seconds / LAUNCH_DURATION) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
