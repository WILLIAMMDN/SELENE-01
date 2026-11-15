import ToolsPanel from './ToolsPanel'
import { TOOL_STATION } from '../../world/tools/toolLayout'
import { LUNAR_LANDER } from '../../world/lunar/lunarNavigation'
import WardrobePanel from './WardrobePanel'
import SkyPanel from './SkyPanel'
import { OBSERVATORY_ACTIONS } from '../../world/observatoryLayout'
import { useEffect, useRef } from 'react'
import { LANDER_ACTIONS } from '../../spacecraft/OdysseyLander'
import MissionStation from '../../world/MissionStation'
import TarsAssistant from '../../robot/TarsAssistant'
import ScaleReference from '../../world/ScaleReference'
import { useCampusMission, nextMissionStep } from '../../game/campusMission'
import { useBlueprint } from '../../game/state/blueprintStore'
import { stationConversation, type Conversation } from '../../game/narrative/conversations'
import { useWorld, type WorldId } from '../../world/worldConfig'
import type { PositionReport, Travel } from '../../world/ExplorerScene'
import type { SectorId, ViewMode } from '../../world/worldData'
import CampusMap from './CampusMap'
import { OBJECTIVE_NAMES, type Panel } from './worldUiTypes'

type Props = {
  panel: Exclude<Panel, null>
  position: PositionReport
  visited: SectorId[]
  mode: ViewMode
  quality: 'standard' | 'light'
  setQuality: (q: 'standard' | 'light') => void
  reduced: boolean
  setReduced: (v: boolean) => void
  miniMap: boolean
  setMiniMap: (v: boolean) => void
  onClose: () => void
  onPanel: (p: Panel) => void
  onMode: (m: ViewMode) => void
  onWorld: (id: WorldId) => void
  onVisit: (id: Travel['id']) => void
  onCampaign: (id: SectorId) => void
  onConversation: (conversation: Conversation) => void
  onTravelPoint: (point: [number, number]) => void
}
export default function WorldNotebook({
  panel,
  position,
  visited,
  mode,
  quality,
  setQuality,
  reduced,
  setReduced,
  miniMap,
  setMiniMap,
  onClose,
  onPanel,
  onMode,
  onWorld,
  onVisit,
  onCampaign,
  onConversation,
  onTravelPoint,
}: Props) {
  useBlueprint()
  const mission = useCampusMission(),
    next = nextMissionStep(),
    world = useWorld(),
    mars = world.id === 'mars',
    moon = world.id === 'moon',
    offworld = world.id !== 'earth',
    SECTORS = world.sectors
  const active = SECTORS.find((s) => s.id === panel),
    objectiveNames = OBJECTIVE_NAMES
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    dialog.current?.focus()
    return () => previous?.focus()
  }, [panel])
  return (
    <div className={`notebook-layer ${active ? 'station-layer' : ''}`} onClick={() => onClose()}>
      <section
        className={`world-dialog paper-panel ${panel === 'map' ? 'map-dialog' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        ref={dialog}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return
          const nodes = dialog.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),select,input,a[href],summary',
          )
          if (!nodes?.length) return
          const first = nodes[0],
            last = nodes[nodes.length - 1]
          if (
            e.shiftKey &&
            (document.activeElement === first || document.activeElement === dialog.current)
          ) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }}
      >
        <button className="dialog-close" aria-label="Cerrar" onClick={() => onClose()}>
          ×
        </button>
        {panel === 'tools' && !offworld && <ToolsPanel onClose={onClose} />}
        {panel === 'wardrobe' && <WardrobePanel world={world.id} onClose={onClose} />}
        {panel === 'sky' && !offworld && <SkyPanel reduced={reduced} />}
        {panel === 'observatory-demo' && !offworld && (
          <>
            <span className="paper-kicker">MIRADOR / OBSERVATORIO</span>
            <h2 id="dialog-title">Una ventana al cielo.</h2>
            <p>Abre la cúpula y explora los mecanismos del telescopio.</p>
            <div className="menu-grid">
              {OBSERVATORY_ACTIONS.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('selene-observatory-action', { detail: id }),
                    )
                    onClose()
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <small>
              Demostración de mecanismos. El seguimiento es una animación artística, sin cálculo
              astronómico.
            </small>
          </>
        )}
        {panel === 'lander' && (
          <>
            <span className="paper-kicker">ODYSSEY / L01</span>
            <h2 id="dialog-title">Llegar. Explorar. Regresar.</h2>
            <p>
              Selecciona una secuencia para verla en la escena. Puedes alejar la cámara con la
              rueda.
            </p>
            <div className="menu-grid">
              {LANDER_ACTIONS.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('odyssey-lander-action', { detail: id }))
                    onClose()
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('odyssey-lander-action', { detail: 'reset' }),
                  )
                  onClose()
                }}
              >
                Restablecer cápsula
              </button>
            </div>
            <small>
              Modelo ficticio del usuario · altura 5 m · animaciones originales. La campaña orbital
              mantiene su propia progresión.
            </small>
          </>
        )}
        {panel === 'menu' && (
          <>
            <span className="paper-kicker">SELENE—01</span>
            <h2 id="dialog-title">Tu aventura.</h2>
            <div className="menu-grid">
              <button onClick={() => onClose()}>Continuar explorando</button>
              <button onClick={() => onPanel('journal')}>Bitácora de misión</button>
              <button onClick={() => onPanel('map')}>Mapa de {world.place}</button>
              <button onClick={() => onMode('map')}>Vista aérea</button>
              <button onClick={() => onMode('tour')}>Recorrido del campus</button>
              <button onClick={() => onPanel('controls')}>Controles</button>
              <button onClick={() => onPanel('wardrobe')}>Vestuario y gestos</button>
              {!offworld && <button onClick={() => onPanel('sky')}>Cielo y clima</button>}
              <button onClick={() => onPanel('settings')}>Opciones</button>
              <button onClick={() => onPanel('scale')}>El mundo y sus fuentes</button>
            </div>
            <div className="menu-worlds">
              <button aria-pressed={moon} onClick={() => onWorld('moon')}>
                Luna
              </button>
              <button aria-pressed={!offworld} onClick={() => onWorld('earth')}>
                Tierra
              </button>
              <button aria-pressed={mars} onClick={() => onWorld('mars')}>
                Marte
              </button>
            </div>
            <small>Una aventura de diseño de misiones. Partida local.</small>
          </>
        )}
        {panel === 'journal' && (
          <>
            <span className="paper-kicker">BITÁCORA DE LA TRIPULACIÓN</span>
            <h2 id="dialog-title">Una pregunta. Una misión.</h2>
            <p>
              Tu encargo: diseñar ODYSSEY, enviarla a estudiar el polo sur lunar y recuperar
              información que permita responder a tu pregunta.
            </p>
            <ol className="quest-list">
              {(['research', 'hangar', 'control', 'launch', 'observatory'] as SectorId[]).map(
                (id, i) => (
                  <li key={id} className={next.sector === id ? 'current' : ''}>
                    <button onClick={() => onPanel(id)}>
                      <span>{i + 1}</span>
                      <strong>{objectiveNames[id]}</strong>
                      {next.sector === id && <small>Ahora</small>}
                    </button>
                  </li>
                ),
              )}
            </ol>
            {mission.result && (
              <p>
                Último vuelo: {mission.result.score} puntos · {mission.result.delivered} GB
                recuperados.
              </p>
            )}
            <button
              className="primary-world"
              onClick={() => {
                onClose()
                onConversation(stationConversation(next.sector))
              }}
            >
              TARS, explícame el siguiente paso
            </button>
            <details>
              <summary>Por qué importan tus decisiones</summary>
              <p>
                Instrumentos, masa, energía, presupuesto, comunicaciones, órbita y duración compiten
                por recursos. Un diseño compatible debe responder a su objetivo y devolver datos.
                Puedes rediseñar después de cada vuelo.
              </p>
              <p>
                Los parámetros son educativos. Juegas individualmente; los cuatro cuadernos de TARS
                no son multijugador en línea.
              </p>
            </details>
          </>
        )}
        {panel === 'tars' && <TarsAssistant position={position} onVisit={onVisit} />}
        {panel === 'map' && (
          <>
            <span className="paper-kicker">{world.place.toUpperCase()}</span>
            <h2 id="dialog-title">Elige tu camino.</h2>
            <div className="map-layout">
              <CampusMap
                large
                position={position}
                visited={visited}
                onSelect={(id) => onPanel(id)}
              />
              <div className="map-sector-list">
                {SECTORS.map((s) => (
                  <button key={s.id} onClick={() => onPanel(s.id)}>
                    <span style={{ background: s.color }}>{s.number}</span>
                    <div>
                      <strong>{s.name}</strong>
                      <small>
                        {Math.round(Math.hypot(position.x - s.entry[0], position.z - s.entry[1]))} m
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {!offworld && (
              <button className="secondary-world" onClick={() => onTravelPoint(TOOL_STATION.entry)}>
                Visitar el banco de herramientas →
              </button>
            )}
            {!offworld && (
              <button
                className="secondary-world"
                onClick={() => {
                  onTravelPoint([-72, 18])
                }}
              >
                Visitar el sendero de la costa →
              </button>
            )}
            <button
              className="secondary-world"
              onClick={() => {
                onTravelPoint(
                  moon ? [LUNAR_LANDER.x, LUNAR_LANDER.z + 8] : mars ? [61, -49] : [87, -5],
                )
              }}
            >
              Visitar la cápsula L01 →
            </button>
            <small>
              Las actividades se realizan dentro de las estaciones.{' '}
              {moon
                ? 'El mapa lunar muestra los módulos y destinos del terreno.'
                : 'La costa de fauna está al oeste del campus terrestre.'}
            </small>
          </>
        )}
        {panel === 'controls' && (
          <>
            <h2 id="dialog-title">Muévete a tu ritmo.</h2>
            <p>
              WASD o flechas: caminar · Shift: correr · Espacio: saltar · Arrastra: mirar · Rueda:
              acercar · E: interactuar · M: mapa · J: bitácora · Esc: menú.
            </p>
            <dl className="control-list">
              <dt>Shift</dt>
              <dd>Mantener para correr</dd>
              <dt>Espacio</dt>
              <dd>Saltar en exteriores</dd>
              <dt>Ctrl</dt>
              <dd>Sentarse junto a un banco</dd>
              <dt>E</dt>
              <dd>Conversar o usar una estación</dd>
            </dl>
            <button className="secondary-world" onClick={() => onVisit('start')}>
              Volver a la entrada del campus
            </button>
          </>
        )}
        {panel === 'settings' && (
          <>
            <h2 id="dialog-title">A tu gusto.</h2>
            <label className="world-setting">
              Calidad
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as typeof quality)}
              >
                <option value="standard">Estándar · sombras y detalle</option>
                <option value="light">Ligera</option>
              </select>
            </label>
            <label className="world-setting check-setting">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
              Reducir movimiento ambiental
            </label>
            <label className="world-setting check-setting">
              <input
                type="checkbox"
                checked={miniMap}
                onChange={(e) => setMiniMap(e.target.checked)}
              />
              Mostrar minimapa mientras camino
            </label>
            <button
              className="secondary-world"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
                else void document.documentElement.requestFullscreen().catch(() => {})
              }}
            >
              Pantalla completa
            </button>
          </>
        )}
        {panel === 'scale' && (
          <>
            <h2 id="dialog-title">Un mundo para aprender.</h2>
            <p>
              Artemisa: 240 × 240 m. Ares: 320 × 320 m. Base lunar: 300 × 300 m. Escenarios
              ficticios con una escala común de un metro por unidad.
            </p>
            <details>
              <summary>Medidas y referencias NASA</summary>
              <ScaleReference />
            </details>
            <details>
              <summary>Alcance de esta aventura</summary>
              <p>
                La campaña lunar enlaza objetivo, diseño, revisión, operaciones e informe. Marte es
                explorable; sus misiones específicas siguen pendientes. La fauna y la costa son
                ambientales, no una recreación geográfica de una base NASA.
              </p>
              <a
                href="https://www.nasa.gov/reference/4-0-system-design-processes/"
                target="_blank"
                rel="noreferrer"
              >
                Diseño de sistemas · NASA ↗
              </a>
            </details>
          </>
        )}
        {active && (
          <>
            <span className="paper-kicker">ESTACIÓN {active.number}</span>
            <h2 id="dialog-title">{active.short}</h2>
            {position.nearby !== active.id && (
              <button className="secondary-world" onClick={() => onVisit(active.id)}>
                Ir a la entrada →
              </button>
            )}
            {!offworld && active.id === 'observatory' && (
              <button
                className="secondary-world"
                disabled={position.nearby !== 'observatory'}
                onClick={() => onPanel('observatory-demo')}
              >
                Explorar el observatorio →
              </button>
            )}
            {moon ? (
              <>
                <p>{active.description}</p>
                <p>{active.detail}</p>
                {active.id === 'control' && (
                  <div className="menu-grid">
                    {[
                      [true, 'Desplegar paneles'],
                      [false, 'Recoger paneles'],
                    ].map(([open, label]) => (
                      <button
                        key={String(open)}
                        disabled={position.nearby !== active.id}
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent('selene-lunar-power', { detail: open }),
                          )
                          onClose()
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {active.id === 'launch' && (
                  <button
                    className="secondary-world"
                    disabled={position.nearby !== active.id}
                    onClick={() => onPanel('lander')}
                  >
                    Controlar cápsula L01 →
                  </button>
                )}
                <button className="secondary-world" onClick={() => onWorld('earth')}>
                  Volver a Artemisa
                </button>
              </>
            ) : (
              <MissionStation
                key={active.id}
                sector={active.id}
                present={mode === 'walk' && position.nearby === active.id}
                mars={mars}
                onCampaign={onCampaign}
              />
            )}
          </>
        )}
      </section>
    </div>
  )
}
