import WorldNotebook from '../ui/world/WorldNotebook'
import { OBJECTIVE_NAMES, type Panel } from '../ui/world/worldUiTypes'
import { useCampusMission, nextMissionStep, missionVerified } from '../game/campusMission'
import { loadBlueprint, useBlueprint } from '../game/state/blueprintStore'
import Icon from '../ui/world/Icon'
import CampusMap from '../ui/world/CampusMap'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import ExplorerScene, { type InputState, type PositionReport, type Travel } from './ExplorerScene'
import { type SectorId, type ViewMode } from './worldData'
import './world.css'
import './notebook.css'
import StoryDialogue from '../ui/world/StoryDialogue'
import { ARRIVAL, stationConversation, type Conversation } from '../game/narrative/conversations'
import { MOTION_SCALE } from './physicalScale'
import { WorldContext, WORLDS, useWorld, type WorldId } from './worldConfig'

const Campaign = lazy(() => import('../App'))
function WorldExperience({ onWorld }: { onWorld: (id: WorldId) => void }) {
  useBlueprint()
  useCampusMission()
  const world = useWorld(),
    mars = world.id === 'mars',
    SECTORS = world.sectors
  const next = nextMissionStep(),
    destination = SECTORS.find((s) => s.id === next.sector)!
  const [mode, setMode] = useState<ViewMode>('walk'),
    [panel, setPanel] = useState<Panel>(null),
    [conversation, setConversation] = useState<Conversation | null>(null),
    [ready, setReady] = useState(false)
  const [tourIndex, setTourIndex] = useState(0),
    [tourPlaying, setTourPlaying] = useState(true),
    [miniMap, setMiniMap] = useState(false)
  const [campaign, setCampaign] = useState(false),
    [campaignStage, setCampaignStage] = useState<'briefing' | 'design' | 'launch'>('briefing')
  const [position, setPosition] = useState<PositionReport>({ x: 0, z: 37, nearby: null, fps: 0 }),
    [travel, setTravel] = useState<Travel>({ id: 'start', serial: 0 })
  const [quality, setQuality] = useState<'standard' | 'light'>('standard'),
    [reduced, setReduced] = useState(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
  const [visited, setVisited] = useState<SectorId[]>([])
  const input = useRef<InputState>({
    keys: new Set(),
    actions: [],
    yaw: 0,
    pitch: 0.14,
    zoom: MOTION_SCALE.zoom,
  })
  const onPosition = useCallback((p: PositionReport) => setPosition(p), []),
    onReady = useCallback(() => setReady(true), [])
  const onInteract = useCallback(
    (id: SectorId) => {
      setPanel(null)
      setConversation(
        mars
          ? {
              speaker: 'TARS · ARES',
              lines: [
                'Ares es nuestro terreno de exploración. La primera misión de diseño comienza en Artemisa, en la Tierra.',
              ],
              action: 'Ver estación',
              sector: id,
            }
          : stationConversation(id),
      )
    },
    [mars],
  )
  useEffect(() => {
    if (!ready || mars) return
    try {
      if (localStorage.getItem('selene-arrival-story-v1')) return
    } catch {
      /* Show the introduction once per mount. */
    }
    setConversation(ARRIVAL)
  }, [ready, mars])
  const closeConversation = () => {
    if (conversation === ARRIVAL)
      try {
        localStorage.setItem('selene-arrival-story-v1', 'seen')
      } catch {
        /* Continue. */
      }
    setConversation(null)
  }
  useEffect(() => {
    if (position.nearby)
      setVisited((v) => (v.includes(position.nearby!) ? v : [...v, position.nearby!]))
  }, [position.nearby])
  useEffect(() => {
    if (mode !== 'tour' || !tourPlaying || panel || conversation || reduced) return
    const timer = window.setInterval(() => setTourIndex((i) => (i + 1) % 5), 11000)
    return () => clearInterval(timer)
  }, [mode, tourPlaying, panel, conversation, reduced])
  useEffect(() => {
    input.current.keys.clear()
    input.current.actions.length = 0
  }, [panel, conversation])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (conversation || campaign) return
      if (e.code === 'Escape') {
        setPanel((p) => (p ? null : 'menu'))
        return
      }
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input,select,textarea,button,[contenteditable]')
      )
        return
      if (e.code === 'KeyM') {
        e.preventDefault()
        setPanel((p) => (p === 'map' ? null : 'map'))
      }
      if (e.code === 'KeyJ') {
        e.preventDefault()
        setPanel((p) => (p === 'journal' ? null : 'journal'))
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [conversation, campaign])
  useEffect(() => {
    const observe = (e: Event) => {
      if (panel || conversation || mode !== 'walk' || campaign) return
      const data = (e as CustomEvent<{ name: string }>).detail
      setConversation({
        speaker: 'TARS · CUADERNO DE CAMPO',
        lines: [
          `${data.name}. Podemos observar sus movimientos desde el sendero. Esta costa forma parte del campus ficticio de Artemisa.`,
          'Una pausa para mirar también es parte de explorar. Cuando quieras, retomamos nuestro encargo lunar.',
        ],
        action: 'Seguir explorando',
      })
    }
    window.addEventListener('selene-wildlife-observe', observe)
    return () => window.removeEventListener('selene-wildlife-observe', observe)
  }, [panel, conversation, mode, campaign])
  useEffect(() => {
    const open = () => {
      if (panel || conversation || campaign) return
      setConversation({
        speaker: 'TARS · DESCENSO L01',
        kind: 'lander',
        lines: [
          mars
            ? 'Esta es la cápsula L01: aquí se representa la llegada a la superficie. Su etapa superior puede separarse para el ascenso.'
            : 'Este módulo de entrenamiento nos permite estudiar otra etapa del viaje: llegar a una superficie y separar después la cápsula de ascenso.',
          'El encargo lunar actual es orbital. Estas animaciones muestran los mecanismos del modelo; no calculan una trayectoria real de aterrizaje.',
        ],
        action: 'Explorar la cápsula',
      })
    }
    window.addEventListener('selene-lander-panel', open)
    return () => window.removeEventListener('selene-lander-panel', open)
  }, [panel, conversation, campaign, mars])
  const chooseMode = (m: ViewMode) => {
    setMode(m)
    setPanel(null)
    input.current.keys.clear()
  }
  const visit = (id: Travel['id']) => {
    setTravel((t) => ({ id, serial: t.serial + 1 }))
    setMode('walk')
    setPanel(null)
    setConversation(null)
  }
  const openCampaign = (id: SectorId) => {
    if (mars || position.nearby !== id) return
    const draft = loadBlueprint()
    if (id === 'launch' && !missionVerified(draft.config, draft.parts)) return
    setCampaignStage(id === 'hangar' ? 'design' : 'launch')
    setCampaign(true)
    setPanel(null)
    input.current.keys.clear()
  }
  const returnToCampus = () => {
    setTravel((t) => ({ id: t.id, point: [position.x, position.z], serial: t.serial + 1 }))
    setCampaign(false)
  }
  const nearby = SECTORS.find((s) => s.id === position.nearby),
    tour = SECTORS[tourIndex]
  const objectiveNames = OBJECTIVE_NAMES
  if (campaign)
    return (
      <>
        <button className="return-world" onClick={returnToCampus}>
          ← Volver al campus
        </button>
        <div className="campaign-return-space">
          <Suspense fallback={<p>Preparando la mesa…</p>}>
            <Campaign
              initialStage={campaignStage}
              campus
              launchAccess={campaignStage === 'launch'}
              onReturnToCampus={returnToCampus}
            />
          </Suspense>
        </div>
      </>
    )
  return (
    <main className={`selene-world clean-world ${mars ? 'mars-world' : 'earth-world'}`}>
      <div className="world-viewport">
        <ExplorerScene
          mode={mode}
          tourIndex={tourIndex}
          travel={travel}
          input={input}
          paused={!!panel || !!conversation}
          reduced={reduced}
          onPosition={onPosition}
          onInteract={onInteract}
          quality={quality}
          onReady={onReady}
        />
      </div>
      {!ready && (
        <div className="world-loading">
          <span className="orbit-mark">◒</span>
          <h1>Bienvenida a {world.place}.</h1>
        </div>
      )}
      {!conversation && !panel && (
        <button className="quest-slip" onClick={() => setPanel('journal')}>
          <span>{mars ? 'ARES' : `MISIÓN ${next.number} / 05`}</span>
          <strong>{mars ? 'Explora el paisaje' : objectiveNames[next.sector]}</strong>
          <small>
            {mars
              ? 'El encargo lunar comienza en la Tierra'
              : `${destination.short} · ${Math.round(Math.hypot(position.x - destination.entry[0], position.z - destination.entry[1]))} m`}{' '}
            <b>↗</b>
          </small>
        </button>
      )}
      <button
        className="paper-icon menu-toggle"
        aria-label="Abrir menú"
        title="Menú · Esc"
        onClick={() => {
          closeConversation()
          setPanel('menu')
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6h12M9 12h12M9 18h12" />
          <path d="M3 5h2v2H3zm0 6h2v2H3zm0 6h2v2H3z" />
        </svg>
      </button>
      {!panel && !conversation && (
        <nav className="paper-dock" aria-label="Herramientas">
          <button
            className="paper-icon"
            title="Mapa · M"
            aria-label="Abrir mapa"
            onClick={() => setPanel('map')}
          >
            <Icon name="map" size={27} />
          </button>
          <button
            className="paper-icon"
            title="Bitácora · J"
            aria-label="Abrir bitácora"
            onClick={() => setPanel('journal')}
          >
            <Icon name="compass" size={27} />
          </button>
          <button
            className="paper-icon"
            title="Hablar con TARS"
            aria-label="Consultar a TARS"
            onClick={() => setPanel('tars')}
          >
            <Icon name="robot" size={28} />
          </button>
        </nav>
      )}
      {miniMap && !panel && !conversation && (
        <aside className="small-map">
          <CampusMap position={position} visited={visited} />
        </aside>
      )}
      {mode === 'walk' && nearby && !panel && !conversation && (
        <button className="station-prompt" onClick={() => onInteract(nearby.id)}>
          <kbd>E</kbd> {nearby.id === 'research' ? 'Hablar con la Dra. Vega' : 'Usar estación'}{' '}
          <span>▶</span>
        </button>
      )}
      {mode !== 'walk' && !panel && !conversation && (
        <div className="view-controls">
          <button onClick={() => chooseMode('walk')}>← Volver a caminar</button>
          {mode === 'tour' && (
            <>
              <span>{tour.name}</span>
              <button disabled={reduced} onClick={() => setTourPlaying((v) => !v)}>
                {tourPlaying ? 'Pausar' : 'Continuar'}
              </button>
              <button onClick={() => setTourIndex((i) => (i + 1) % 5)}>→</button>
            </>
          )}
        </div>
      )}
      {!panel && !conversation && mode === 'walk' && (
        <>
          <div className="touch-movement" aria-label="Movimiento táctil">
            {[
              { key: 'KeyW', label: '↑' },
              { key: 'KeyA', label: '←' },
              { key: 'KeyS', label: '↓' },
              { key: 'KeyD', label: '→' },
            ].map((b) => (
              <button
                key={b.key}
                aria-label={`Mover ${b.label}`}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.currentTarget.setPointerCapture(e.pointerId)
                  input.current.keys.add(b.key)
                }}
                onPointerUp={() => input.current.keys.delete(b.key)}
                onPointerCancel={() => input.current.keys.delete(b.key)}
                onLostPointerCapture={() => input.current.keys.delete(b.key)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="touch-actions">
            <button
              aria-label="Correr, mantener pulsado"
              onPointerDown={(e) => {
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                input.current.keys.add('ShiftLeft')
              }}
              onPointerUp={() => input.current.keys.delete('ShiftLeft')}
              onPointerCancel={() => input.current.keys.delete('ShiftLeft')}
              onLostPointerCapture={() => input.current.keys.delete('ShiftLeft')}
            >
              Correr
            </button>
            {!mars && (
              <button
                onClick={() => {
                  if (!position.room) input.current.actions.push('jump')
                }}
              >
                Saltar
              </button>
            )}
          </div>
          <button className="controls-hint" onClick={() => setPanel('controls')}>
            ? Controles
          </button>
        </>
      )}
      {conversation && (
        <StoryDialogue
          conversation={conversation}
          onClose={closeConversation}
          onFinish={() => {
            const sector = conversation.sector,
              kind = conversation.kind
            closeConversation()
            if (kind === 'lander') setPanel('lander')
            else if (sector) setPanel(sector)
          }}
        />
      )}
      {panel && (
        <WorldNotebook
          panel={panel}
          position={position}
          visited={visited}
          mode={mode}
          quality={quality}
          setQuality={setQuality}
          reduced={reduced}
          setReduced={setReduced}
          miniMap={miniMap}
          setMiniMap={setMiniMap}
          onClose={() => setPanel(null)}
          onPanel={setPanel}
          onMode={chooseMode}
          onWorld={onWorld}
          onVisit={visit}
          onCampaign={openCampaign}
          onConversation={setConversation}
          onTravelPoint={(point) => {
            setTravel((t) => ({ id: 'start', point, serial: t.serial + 1 }))
            setMode('walk')
            setPanel(null)
          }}
        />
      )}
    </main>
  )
}

export default function Worlds() {
  const [id, setId] = useState<WorldId>(() =>
    new URLSearchParams(window.location.search).get('world') === 'mars' ? 'mars' : 'earth',
  )
  const change = (next: WorldId) => {
    setId(next)
    const url = new URL(window.location.href)
    url.searchParams.set('world', next)
    window.history.replaceState(null, '', url)
  }
  return (
    <WorldContext.Provider value={WORLDS[id]}>
      <WorldExperience key={id} onWorld={change} />
    </WorldContext.Provider>
  )
}
