import type { DesignConfig } from '../../game/missionDesign'
import { LAUNCHERS } from '../../game/missionDesign'
import type { ModuleId } from '../../spacecraft/assembly'
import { getLaunchFrame, LAUNCH_DURATION } from '../../spacecraft/launchTimeline'

export default function LaunchCinematicHud({
  seconds,
  config,
  parts,
  onSkip,
}: {
  seconds: number
  config: DesignConfig
  parts: ModuleId[]
  onSkip: () => void
}) {
  const frame = getLaunchFrame(seconds, config.launcher)
  const launcherName = LAUNCHERS.find((item) => item.id === config.launcher)?.name ?? 'Lanzador'
  const moduleName = parts.includes('habitat') ? 'ODYSSEY · CON HÁBITAT' : 'ODYSSEY · COMPACTA'
  return (
    <div className="launch-film" role="region" aria-label="Cinemática interactiva de lanzamiento">
      <div className="launch-film-top">
        <div className="launch-film-brand">
          <span className="launch-film-dot" aria-hidden="true" />
          <span>SELENE—01</span>
          <span className="launch-film-divider">/</span>
          <span>SEC. LANZAMIENTO</span>
        </div>
        <button className="launch-film-skip" type="button" onClick={onSkip}>
          Omitir cinemática <kbd>ESC</kbd>
        </button>
      </div>
      <div className="launch-film-specs">
        <span>LANZAMIENTO SIMULADO</span>
        <strong>{launcherName}</strong>
        <span>{moduleName}</span>
        <small>Modelo escénico común · rendimiento hipotético</small>
      </div>
      {frame.countdown !== null && (
        <div className="launch-film-countdown" aria-label={`Cuenta regresiva: ${frame.countdown}`}>
          <span>DESPEGUE EN</span>
          <strong>{String(frame.countdown).padStart(2, '0')}</strong>
        </div>
      )}
      <div className="launch-film-footer">
        <div className="launch-film-subtitles" aria-live="off">
          <span>TARS / CONTROL DE MISIÓN</span>
          <strong>{frame.title}</strong>
          <p>{frame.narration}</p>
        </div>
        <div className="launch-film-data">
          <span>T+{Math.max(0, Math.floor(seconds - 9)).toString().padStart(2, '0')} s</span>
          <span>{Math.round(frame.altitudeMeters).toLocaleString('es-PE')} m · altitud ilustrativa</span>
        </div>
        <div
          className="launch-film-progress"
          role="progressbar"
          aria-label="Progreso de la cinemática"
          aria-valuenow={Math.round(frame.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${(seconds / LAUNCH_DURATION) * 100}%` }} />
        </div>
        <span className="launch-film-disclaimer">
          Simulación visual educativa. No representa una trayectoria ni telemetría real.
        </span>
      </div>
    </div>
  )
}
