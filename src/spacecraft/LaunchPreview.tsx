import { useCallback, useEffect, useMemo, useState } from 'react'
import GameWorld from '../scene/GameWorld'
import { useBlueprint } from '../game/state/blueprintStore'
import { LAUNCHERS, type LauncherId } from '../game/missionDesign'
import { COMPLETE_ASSEMBLY, assemblyReady, type ModuleId } from '../spacecraft/assembly'
import LaunchCinematicOverlay from './LaunchCinematicOverlay'
import './launchCinematic.css'
import './launchPreview.css'

type Preset = 'saved' | 'compact' | 'habitat'

const COMPACT_ASSEMBLY: ModuleId[] = COMPLETE_ASSEMBLY.filter(
  (id) => id !== 'habitat' && id !== 'antenna' && id !== 'oxygen',
)

export default function LaunchPreview() {
  const blueprint = useBlueprint()
  const [preset, setPreset] = useState<Preset>(() =>
    assemblyReady(blueprint.parts) ? 'saved' : 'habitat',
  )
  const [launcher, setLauncher] = useState<LauncherId>(blueprint.config.launcher)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const parts = useMemo(
    () =>
      preset === 'saved'
        ? blueprint.parts
        : preset === 'compact'
          ? COMPACT_ASSEMBLY
          : COMPLETE_ASSEMBLY,
    [preset, blueprint.parts],
  )

  const config = useMemo(
    () => ({
      ...blueprint.config,
      launcher,
      habitat: parts.includes('habitat'),
      supports: parts.includes('supports'),
      solarUpgrade: parts.includes('solar'),
      commUpgrade: parts.includes('antenna'),
    }),
    [blueprint.config, launcher, parts],
  )

  const finish = useCallback(() => setPlaying(false), [])
  const start = () => {
    setElapsed(0)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      finish()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playing, finish])

  const returnToGame = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('preview')
    window.location.assign(url.toString())
  }

  return (
    <div className={`launch-preview app-shell ${playing ? 'cinematic-active' : ''}`}>
      <div className="world-column launch-preview-world">
        <GameWorld
          mode="launch"
          onInteract={() => undefined}
          parts={parts}
          config={config}
          cinematic={playing}
          cinematicElapsed={elapsed}
          onCinematicProgress={setElapsed}
          onCinematicComplete={finish}
        />
        {playing && <LaunchCinematicOverlay seconds={elapsed} config={config} onSkip={finish} />}
      </div>

      {!playing && (
        <aside className="launch-preview-panel" aria-label="Vista previa de lanzamiento">
          <div className="launch-preview-heading">
            <span className="launch-preview-kicker">SELENE—01 / VISOR DE CINEMÁTICAS</span>
            <h1>El lanzamiento de ODYSSEY.</h1>
            <p>
              Reproduce la secuencia completa con tu ensamblaje guardado o compara dos
              configuraciones de prueba. Esta vista no modifica tu misión.
            </p>
          </div>

          <fieldset>
            <legend>Configuración de la nave</legend>
            <label className="launch-preview-field" htmlFor="launch-preview-preset">
              Ensamblaje
              <select
                id="launch-preview-preset"
                value={preset}
                onChange={(event) => setPreset(event.target.value as Preset)}
              >
                <option value="saved">Mi nave guardada</option>
                <option value="compact">Prototipo compacto</option>
                <option value="habitat">Prototipo con hábitat</option>
              </select>
            </label>
            <label className="launch-preview-field" htmlFor="launch-preview-launcher">
              Vehículo de lanzamiento
              <select
                id="launch-preview-launcher"
                value={launcher}
                onChange={(event) => setLauncher(event.target.value as LauncherId)}
              >
                {LAUNCHERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="launch-preview-summary">
              {parts.length} módulos · {parts.includes('habitat') ? 'Con hábitat' : 'Sin hábitat'}
              {!assemblyReady(parts) && ' · Ensamblaje incompleto'}
            </p>
          </fieldset>

          <button className="launch-preview-start" type="button" onClick={start}>
            ▶ Reproducir cinemática
          </button>
          <button className="launch-preview-return" type="button" onClick={returnToGame}>
            ← Volver al juego
          </button>
          <p className="launch-preview-footnote">
            AURORA-S y ATLAS-T comparten temporalmente el mismo modelo de lanzamiento. Sus
            diferencias de ascenso son ilustrativas, no simulaciones físicas.
          </p>
        </aside>
      )}
    </div>
  )
}
