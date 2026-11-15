import { LAUNCHERS, INSTRUMENTS, type DesignConfig } from '../../game/missionDesign'
import type { ModuleId } from '../../spacecraft/assembly'
import { getLaunchFrame, LAUNCH_DURATION, LIFTOFF_AT } from '../../spacecraft/launchTimeline'

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
  const hasHabitat = parts.includes('habitat')
  const frame = getLaunchFrame(seconds, config.launcher, hasHabitat)
  const launcher = LAUNCHERS.find((item) => item.id === config.launcher)
  const instruments = INSTRUMENTS.filter((item) => config.instruments.includes(item.id))
  const flightTime =
    seconds < LIFTOFF_AT
      ? `T−${String(Math.ceil(LIFTOFF_AT - seconds)).padStart(2, '0')}`
      : `T+${String(Math.floor(seconds - LIFTOFF_AT)).padStart(2, '0')}`

  return (
    <div className="launch-film" role="region" aria-label="Historia del lanzamiento de ODYSSEY">
      <header className="launch-film-top">
        <div className="launch-film-brand">
          <span className="launch-film-dot" aria-hidden="true" />
          <strong>SELENE—01</strong>
          <span className="launch-film-divider">/</span>
          <span>LC-01 · CAMPUS ARTEMISA</span>
        </div>
        <button className="launch-film-skip" type="button" onClick={onSkip}>
          Omitir <kbd>ESC</kbd>
        </button>
      </header>

      <aside className="launch-film-ledger" aria-label="Ficha de la nave">
        <span className="launch-film-ledger-kicker">CUADERNO DE MISIÓN / 04</span>
        <strong>Un viaje construido por ti.</strong>
        <dl>
          <div>
            <dt>Vehículo</dt>
            <dd>{launcher?.name ?? 'ODYSSEY'}</dd>
          </div>
          <div>
            <dt>Orbitador</dt>
            <dd>{hasHabitat ? 'Con hábitat' : 'Compacto autónomo'}</dd>
          </div>
          <div>
            <dt>Ensamblaje</dt>
            <dd>{parts.length} conjuntos</dd>
          </div>
          <div>
            <dt>Instrumentos</dt>
            <dd>
              {instruments.map((instrument) => instrument.name).join(' · ') || 'Sin instrumentos'}
            </dd>
          </div>
        </dl>
        <small className="launch-film-ledger-note">
          Configuración elegida en el hangar. Lanzamiento narrativo, no telemetría real.
        </small>
      </aside>

      {frame.countdown !== null && (
        <div className="launch-film-countdown" aria-label={`Cuenta regresiva ${frame.countdown}`}>
          <span>CUENTA REGRESIVA</span>
          <strong>{String(frame.countdown).padStart(2, '0')}</strong>
        </div>
      )}

      <div className="launch-film-footer">
        <div className="launch-film-caption">
          <div className="launch-film-milestone">
            <span>
              REGISTRO {String(Math.min(11, Math.floor(seconds / 4) + 1)).padStart(2, '0')}
            </span>
            <span>{frame.milestone}</span>
          </div>
          <div className="launch-film-subtitles">
            <span>
              {frame.speaker === 'TARS'
                ? 'TARS · ASISTENTE DE MISIÓN'
                : 'DRA. VEGA · DIRECTORA DE MISIÓN'}
            </span>
            <strong>{frame.title}</strong>
            <p>{frame.narration.replace(/^TARS:\s*/, '')}</p>
          </div>
        </div>
        <div className="launch-film-telemetry">
          <span>{flightTime} · secuencia condensada</span>
          <span>
            ALTITUD ILUSTRATIVA {Math.round(frame.altitudeMeters).toLocaleString('es-PE')} m
          </span>
        </div>
        <div
          className="launch-film-progress"
          role="progressbar"
          aria-label="Progreso de la historia"
          aria-valuenow={Math.round(frame.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${(seconds / LAUNCH_DURATION) * 100}%` }} />
        </div>
        <p className="launch-film-disclaimer">
          Los procedimientos están inspirados en referencias NASA; la nave, las escalas y los
          tiempos pertenecen a SELENE-01.
        </p>
      </div>
    </div>
  )
}
