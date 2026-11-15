import type { DesignConfig } from '../game/missionDesign'
import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'
import './boardingSequence.css'

/**
 * The camera already tells the story: only a concise subtitle and skip button.
 * Uses the same paper-and-ink language as Artemisa's exploration prompts.
 */
export default function LaunchCinematicOverlay({
  seconds,
  config,
  onSkip,
}: {
  seconds: number
  config: DesignConfig
  onSkip: () => void
}) {
  const frame = getLaunchFrame(seconds, config.launcher)
  const text = frame.narration.replace(/^TARS:\s*/, '')
  return (
    <div className="selene-cutscene" role="region" aria-label="Lanzamiento de ODYSSEY">
      <button className="selene-cutscene-skip" type="button" onClick={onSkip}>
        Omitir <kbd>Esc</kbd>
      </button>
      {frame.countdown !== null && (
        <div className="selene-cutscene-countdown" aria-label={`Despegue en ${frame.countdown}`}>
          {frame.countdown}
        </div>
      )}
      <div className="selene-cutscene-dialogue" aria-live="off">
        <span>{frame.speaker === 'TARS' ? 'TARS' : 'Dra. Vega'}</span>
        <p>{text}</p>
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
  )
}
