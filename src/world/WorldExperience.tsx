import { roomLabel } from './buildingEntrances'
import {
  analyzeLunarIce,
  useLunarFieldwork,
  useLunarSamples,
  useLunarOperations,
} from './lunar/lunarMissionProgress'
import { lunarFieldGuide } from './lunar/lunarFieldGuide'
import type { LunarWorkstationId } from './lunar/lunarFieldwork'
import { LUNAR_LOW_RESERVE } from './lunar/lunarPhysics'
import VehicleDashboard from '../ui/world/VehicleDashboard'
import LunarRoverHud from '../ui/world/LunarRoverHud'
import MissionDirection from '../ui/world/MissionDirection'
import type { MissionGuideReport } from './navigation/missionDestination'
import { canUseWardrobe } from './wardrobeStation'
import AuthorsPanel from '../ui/world/AuthorsPanel'
import { worldLocation } from './worldLocation'
import WorldNotebook from '../ui/world/WorldNotebook'
import type { Panel } from '../ui/world/worldUiTypes'
import {
  useCampusMission,
  nextMissionStep,
  missionVerified,
  blueprintKey,
} from '../game/campusMission'
import { loadOperationSession, saveOperationSession } from '../game/state/operationStore'
import { wardrobeStore } from './wardrobe'
import { loadPendingMissionArrival, clearPendingMissionArrival } from '../game/missionArrival'
import { startOperations } from '../game/missionDesign'
import type { BoardingMotion, BoardingPhase } from '../spacecraft/boardingRoute'
import LaunchCinematicOverlay from '../spacecraft/LaunchCinematicOverlay'
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
function WorldExperience({
  onWorld,
  landing,
  onLandingComplete,
}: {
  onWorld: (id: WorldId, withLanding?: boolean) => void
  landing: boolean
  onLandingComplete: () => void
}) {
  const blueprint = useBlueprint()
  useCampusMission()
  const world = useWorld(),
    mars = world.id === 'mars',
    moon = world.id === 'moon',
    offworld = world.id !== 'earth',
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
  const [arrival, setArrival] = useState(() =>
    offworld ? loadPendingMissionArrival(world.id as 'moon' | 'mars') : null,
  )
  const [guidance, setGuidance] = useState<MissionGuideReport | null>(null)
  const [guideEnabled, setGuideEnabled] = useState(() => {
    try {
      return localStorage.getItem('selene-mission-guide-v1') !== 'off'
    } catch {
      return true
    }
  })
  const onGuide = useCallback((report: MissionGuideReport) => setGuidance(report), [])
  useEffect(() => {
    try {
      localStorage.setItem('selene-mission-guide-v1', guideEnabled ? 'on' : 'off')
    } catch {
      /* Keep the local preference in memory. */
    }
  }, [guideEnabled])
  const activeGuide = guidance?.sector === next.sector ? guidance : null
  const openWardrobe = useCallback(() => setPanel('wardrobe'), [])
  const [launchPhase, setLaunchPhase] = useState<BoardingPhase>('idle')
  const boardingMotion = useRef<BoardingMotion>({ lift: 0 })
  const flightClock = useRef({ current: 0 })
  const [flightElapsed, setFlightElapsed] = useState(0)
  const [flightFinished, setFlightFinished] = useState(false)
  const recordedFlight = useRef(false)
  const onLaunchPhase = useCallback((phase: BoardingPhase) => {
    if (phase === 'access') {
      // The same playable explorer equips the existing EVA character model.
      const wardrobe = wardrobeStore.getSnapshot()
      wardrobeStore.set({ ...wardrobe, earth: 'eva', moon: 'eva', helmet: true })
    }
    if (phase === 'flight') {
      flightClock.current.current = 0
      setFlightElapsed(0)
    }
    setLaunchPhase(phase)
  }, [])
  const finishLaunch = useCallback(() => setFlightFinished(true), [])
  useEffect(() => {
    if (!flightFinished) return
    if (!recordedFlight.current) {
      recordedFlight.current = true
      const draft = loadBlueprint()
      if (missionVerified(draft.config, draft.parts)) {
        const key = blueprintKey(draft.config, draft.parts)
        if (!loadOperationSession(key)) saveOperationSession(key, startOperations())
        // Operations follow the lunar launch; surface maps are optional later.
        setCampaignStage('launch')
        setCampaign(true)
      }
    }
    setLaunchPhase('idle')
    setFlightFinished(false)
  }, [flightFinished])
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
      if (moon) {
        setPanel(id)
        return
      }
      setPanel(null)
      setConversation(
        mars
          ? {
              speaker: 'TARS · ARES',
              lines: [
                'Ares es un paisaje de entrenamiento. Abre la bitácora para formular una pregunta marciana desde la Tierra y elegir qué observaciones de Mars Reconnaissance Orbiter consultarías.',
              ],
              action: 'Ver estación',
              sector: id,
            }
          : stationConversation(id),
      )
    },
    [mars, moon],
  )
  useEffect(() => {
    if (!ready) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('launch') === 'true' || params.get('cinematic') === 'true') {
      onLaunchPhase('flight')
    }
  }, [ready, onLaunchPhase])

  useEffect(() => {
    if (!ready || offworld) return
    try {
      if (localStorage.getItem('selene-arrival-story-v1')) return
    } catch {
      /* Show the introduction once per mount. */
    }
    setConversation(ARRIVAL)
  }, [ready, offworld])
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
  }, [panel, conversation, landing])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (landing) {
        if (e.code === 'Escape') {
          e.preventDefault()
          onLandingComplete()
        }
        return
      }
      if (campaign) return
      if (launchPhase === 'flight') {
        if (e.code === 'Escape') {
          e.preventDefault()
          finishLaunch()
        }
        return
      }
      if (conversation) return
      if (e.code === 'Escape') {
        if (moon && mode === 'walk' && position.vehicle === 'driving' && !panel) {
          e.preventDefault()
          if (!e.repeat) input.current.actions.push('interact')
          return
        }
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
  }, [conversation, campaign, launchPhase, finishLaunch, landing, onLandingComplete])
  // The latest campus menu uses a shared event for cinematic previews.
  // Keep that shortcut functional without bypassing mission authorization.
  useEffect(() => {
    const previewLaunch = () => {
      const url = new URL(window.location.href)
      url.searchParams.set('preview', 'launch')
      window.location.assign(url.toString())
    }
    window.addEventListener('selene-launch-cinematic', previewLaunch)
    return () => window.removeEventListener('selene-launch-cinematic', previewLaunch)
  }, [])
  useEffect(() => {
    const showTeam = () => setPanel('authors')
    window.addEventListener('selene-authors-panel', showTeam)
    return () => window.removeEventListener('selene-authors-panel', showTeam)
  }, [])
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
          offworld
            ? 'Esta es la cápsula L01: aquí se representa la llegada a la superficie. Su etapa superior puede separarse para el ascenso.'
            : 'Este módulo de entrenamiento nos permite estudiar otra etapa del viaje: llegar a una superficie y separar después la cápsula de ascenso.',
          'El encargo lunar actual es orbital. Estas animaciones muestran los mecanismos del modelo; no calculan una trayectoria real de aterrizaje.',
        ],
        action: 'Explorar la cápsula',
      })
    }
    window.addEventListener('selene-lander-panel', open)
    return () => window.removeEventListener('selene-lander-panel', open)
  }, [panel, conversation, campaign, offworld])
  useEffect(() => {
    const open = () => {
      if (!offworld && !panel && !conversation && !campaign && mode === 'walk')
        setPanel('observatory-demo')
    }
    window.addEventListener('selene-observatory-panel', open)
    return () => window.removeEventListener('selene-observatory-panel', open)
  }, [offworld, panel, conversation, campaign, mode])
  useEffect(() => {
    const open = () => {
      if (!offworld && !panel && !conversation && !campaign && mode === 'walk') setPanel('tools')
    }
    window.addEventListener('selene-tools-panel', open)
    return () => window.removeEventListener('selene-tools-panel', open)
  }, [offworld, panel, conversation, campaign, mode])
  useEffect(() => {
    const onDialogue = (e: Event) => {
      if (panel || campaign) return
      const conv = (e as CustomEvent<Conversation>).detail
      if (conv) setConversation(conv)
    }
    window.addEventListener('selene-dialogue', onDialogue)
    return () => window.removeEventListener('selene-dialogue', onDialogue)
  }, [panel, campaign])
  const lunarSamples = useLunarSamples()
  const lunarFieldwork = useLunarFieldwork()
  const lunarOperations = useLunarOperations()
  const lunarGuide = lunarFieldGuide({
    samples: lunarSamples,
    fieldwork: lunarFieldwork.steps,
    operations: lunarOperations,
  })
  useEffect(() => {
    const useStation = (event: Event) => {
      if (!moon || panel || conversation || campaign || mode !== 'walk') return
      const { detail } = event as CustomEvent<LunarWorkstationId>
      if (detail === 'storage') {
        setPanel('lunar-inventory')
      } else if (detail === 'lab') {
        const hasIce = lunarSamples.includes('hielo')
        const analyzed = analyzeLunarIce()
        setConversation({
          speaker: 'LAB-L01 · MESA DE ANÁLISIS',
          lines: hasIce
            ? [
                analyzed
                  ? 'Resultado guardado. La lectura simulada de H₂O es compatible con la muestra de hielo de la estación 01.'
                  : 'El resultado de la muestra 01 ya está en la bitácora.',
                'Despliega PWR-L01 si la prueba de energía sigue pendiente. Después envía el resultado desde la bitácora con J.',
              ]
            : [
                'Recoge primero una muestra de hielo en la estación 01 y tráela de vuelta a esta mesa.',
              ],
          action: 'Volver al laboratorio',
        })
      }
    }
    window.addEventListener('selene-lunar-workstation', useStation)
    return () => window.removeEventListener('selene-lunar-workstation', useStation)
  }, [moon, panel, conversation, campaign, mode, lunarSamples])
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
    if (offworld || position.nearby !== id) return
    const draft = loadBlueprint()
    if (id === 'launch') {
      if (!missionVerified(draft.config, draft.parts)) return
      const key = blueprintKey(draft.config, draft.parts)
      if (loadOperationSession(key)) {
        setCampaignStage('launch')
        setCampaign(true)
      } else {
        recordedFlight.current = false
        onLaunchPhase('suiting')
      }
      setPanel(null)
      setConversation(null)
      input.current.keys.clear()
      return
    }
    setCampaignStage('design')
    setCampaign(true)
    setPanel(null)
    input.current.keys.clear()
  }
  const returnToCampus = () => {
    setLaunchPhase('idle')
    setTravel((t) => ({ id: t.id, point: [position.x, position.z], serial: t.serial + 1 }))
    setCampaign(false)
  }
  const lifeSupport = moon && mode === 'walk' ? position.eva : undefined
  const hatch = moon && mode === 'walk' ? position.hatch : undefined
  const nearby = SECTORS.find((s) => s.id === position.nearby),
    tour = SECTORS[tourIndex]
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
    <main
      className={`selene-world clean-world ${offworld ? 'mars-world' : 'earth-world'} ${moon ? 'moon-world' : ''} ${position.vehicle === 'driving' ? 'is-driving' : ''} ${landing ? 'is-landing' : ''}`}
    >
      <div className="world-viewport">
        <ExplorerScene
          mode={mode}
          tourIndex={tourIndex}
          travel={travel}
          input={input}
          paused={!!panel || !!conversation || landing || launchPhase === 'flight'}
          landing={landing}
          onLandingComplete={onLandingComplete}
          onWardrobe={openWardrobe}
          guideSector={!offworld && guideEnabled ? next.sector : undefined}
          onGuide={onGuide}
          reduced={reduced}
          launchPhase={launchPhase}
          boardingMotion={boardingMotion}
          flightClock={flightClock}
          onLaunchPhase={onLaunchPhase}
          onCinematicProgress={setFlightElapsed}
          onCinematicComplete={finishLaunch}
          onPosition={onPosition}
          onInteract={onInteract}
          quality={quality}
          onReady={onReady}
        />
      </div>
      {landing && (
        <button className="lunar-landing-skip" type="button" onClick={onLandingComplete}>
          Omitir llegada <kbd>Esc</kbd>
        </button>
      )}
      {!ready && (
        <div className="world-loading">
          <span className="orbit-mark">◒</span>
          <h1>Bienvenida a {world.place}.</h1>
        </div>
      )}
      {launchPhase === 'flight' && (
        <LaunchCinematicOverlay
          seconds={flightElapsed}
          config={blueprint.config}
          onSkip={finishLaunch}
        />
      )}
      {arrival && !landing && (
        <div className="mission-arrival" role="region" aria-label="Escenario de entrenamiento">
          <span className="mission-arrival-label">TARS · RECONSTRUCCIÓN DE ENTRENAMIENTO</span>
          <strong>{arrival.title}</strong>
          <p>{arrival.narrative.replace(/^TARS:\s*/, '')}</p>
          <div className="mission-arrival-actions">
            <button
              type="button"
              onClick={() => {
                clearPendingMissionArrival()
                setArrival(null)
              }}
            >
              Explorar el escenario
            </button>
            <button
              type="button"
              onClick={() => {
                clearPendingMissionArrival()
                setArrival(null)
                setCampaignStage('launch')
                setCampaign(true)
              }}
            >
              Continuar operaciones
            </button>
          </div>
        </div>
      )}
      {launchPhase === 'cockpit' && (
        <div className="boarding-cockpit-prompt">
          <strong>ODYSSEY · Recreación de cabina</strong>
          <span>TARS: Diseño revisado. El objetivo de ODYSSEY es la órbita lunar.</span>
          <button type="button" onClick={() => onLaunchPhase('flight')}>
            Iniciar despegue
          </button>
        </div>
      )}
      {launchPhase === 'suiting' && !position.boardingSpot && (
        <div className="boarding-guidance" role="status">
          Acércate al vestuario de la simulación junto a la plataforma.
          <button type="button" onClick={() => onLaunchPhase('idle')}>
            Cancelar
          </button>
        </div>
      )}
      {launchPhase === 'access' && !position.boardingSpot && (
        <div className="boarding-guidance" role="status">
          Sigue el sendero, sube las escaleras y toma el ascensor de LC-01.
          <button type="button" onClick={() => onLaunchPhase('idle')}>
            Cancelar
          </button>
        </div>
      )}
      {launchPhase === 'bridge' && !position.boardingSpot && (
        <div className="boarding-guidance" role="status">
          Cruza la pasarela hasta la escotilla de ODYSSEY.
        </div>
      )}
      {launchPhase !== 'idle' && position.boardingSpot && (
        <button
          className="station-prompt boarding-interact"
          type="button"
          onClick={() =>
            onLaunchPhase(
              position.boardingSpot === 'suit'
                ? 'access'
                : position.boardingSpot === 'lift'
                  ? 'ascending'
                  : 'cockpit',
            )
          }
        >
          <kbd>E</kbd>{' '}
          {position.boardingSpot === 'suit'
            ? 'Equipar traje de la simulación'
            : position.boardingSpot === 'lift'
              ? 'Subir al ascensor'
              : 'Entrar a la cabina simulada'}
        </button>
      )}
      {launchPhase === 'ascending' && (
        <div className="boarding-guidance" role="status">
          Ascendiendo a la pasarela…
        </div>
      )}
      {!conversation &&
        !panel &&
        !landing &&
        launchPhase === 'idle' &&
        (!(mode === 'walk' && position.room) || (guideEnabled && !offworld)) && (
          <button
            className={`quest-slip${position.room ? ' is-interior-guide' : ''}`}
            onClick={() => setPanel('journal')}
          >
            <span>
              {offworld
                ? moon
                  ? 'SIMULADOR DE CAMPO · LUNA'
                  : 'ARES'
                : `MISIÓN ${next.number} / 05`}
            </span>
            <strong>{moon ? lunarGuide.title : offworld ? 'Pregunta marciana' : next.title}</strong>
            <small>
              <span>
                {moon
                  ? lunarGuide.hint
                  : offworld
                    ? 'Abre la bitácora (J) y relaciona pregunta con datos orbitales'
                    : guideEnabled && mode === 'walk' && activeGuide
                      ? activeGuide.arrived
                        ? activeGuide.hint
                        : `${activeGuide.hint} · ${Math.round(activeGuide.distance)} m`
                      : `${destination.short} · ${Math.round(Math.hypot(position.x - destination.entry[0], position.z - destination.entry[1]))} m`}
              </span>
              {!offworld && guideEnabled && mode === 'walk' ? (
                <MissionDirection report={activeGuide} />
              ) : (
                <b>↗</b>
              )}
            </small>
          </button>
        )}
      {launchPhase !== 'flight' && launchPhase !== 'ascending' && launchPhase !== 'cockpit' && (
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
      )}
      {launchPhase === 'idle' && !panel && !conversation && (
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
      {miniMap && launchPhase === 'idle' && !panel && !conversation && !landing && (
        <aside className="small-map">
          <CampusMap
            position={position}
            visited={visited}
            active={!offworld && guideEnabled ? next.sector : undefined}
          />
        </aside>
      )}
      {lifeSupport && launchPhase === 'idle' && !landing && !panel && !conversation && (
        <aside className="lunar-eva-hud" aria-label="Soporte vital simulado">
          <div className="lunar-eva-head">
            <label htmlFor="lunar-oxygen">Oxígeno del traje · simulación</label>
            <strong>{Math.ceil(lifeSupport.oxygen * 100)} %</strong>
          </div>
          <progress
            id="lunar-oxygen"
            value={lifeSupport.oxygen}
            max={1}
            className={lifeSupport.oxygen <= LUNAR_LOW_RESERVE ? 'reserve-low' : ''}
          />
          <div className="lunar-eva-secondary">
            <span>Batería {Math.ceil(lifeSupport.battery * 100)} %</span>
            <span>Carga térmica y de CO₂ {lifeSupport.workload > 0.6 ? 'alta' : 'normal'}</span>
          </div>
          <small>
            {lifeSupport.recovered
              ? 'Rescate simulado · regreso a HAB-L01'
              : lifeSupport.sealed
                ? 'Cabina presurizada · recarga'
                : position.room
                  ? 'Cierra las escotillas para presurizar'
                  : 'EVA · traje presurizado'}
          </small>
          {!lifeSupport.sealed &&
            Math.min(lifeSupport.oxygen, lifeSupport.battery) <= LUNAR_LOW_RESERVE && (
              <small className="lunar-reserve-warning" role="status">
                Reserva baja. Regresa a la base.
              </small>
            )}
        </aside>
      )}
      {moon &&
        launchPhase === 'idle' &&
        mode === 'walk' &&
        position.workstation &&
        !panel &&
        !conversation &&
        !landing && (
          <button
            className="station-prompt lunar-hatch-prompt"
            type="button"
            onClick={() => input.current.actions.push('workstation')}
          >
            <kbd>E</kbd> {position.workstation.name}
          </button>
        )}
      {hatch &&
        launchPhase === 'idle' &&
        !position.workstation &&
        !panel &&
        !conversation &&
        !landing && (
          <button
            className="station-prompt lunar-hatch-prompt"
            type="button"
            disabled={hatch.moving || hatch.blocked}
            onClick={() => input.current.actions.push('hatch')}
          >
            <kbd>E</kbd>{' '}
            {hatch.moving
              ? 'Escotilla en movimiento'
              : hatch.blocked
                ? 'Despeja el umbral'
                : `${hatch.open ? 'Cerrar' : 'Abrir'} escotilla ${hatch.label}`}
          </button>
        )}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        !position.vehicle &&
        !panel &&
        !conversation &&
        !landing &&
        Math.hypot(position.x + 14, position.z - 36) < 4.8 && (
          <button className="station-prompt" onClick={() => setPanel('authors')}>
            <kbd>E</kbd> Equipo creador y créditos
          </button>
        )}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        !position.vehicle &&
        !panel &&
        !conversation &&
        !landing &&
        canUseWardrobe(position.x, position.z, world.id) && (
          <button className="station-prompt" onClick={() => setPanel('wardrobe')}>
            <kbd>E</kbd> Cambiar de ropa
          </button>
        )}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        nearby &&
        !hatch &&
        !position.workstation &&
        !position.vehicle &&
        !panel &&
        !conversation &&
        !landing &&
        !canUseWardrobe(position.x, position.z, world.id) && (
          <button className="station-prompt" onClick={() => onInteract(nearby.id)}>
            <kbd>E</kbd>{' '}
            {!offworld && nearby.id === 'research' ? 'Hablar con la Dra. Vega' : 'Usar estación'}{' '}
            <span>▶</span>
          </button>
        )}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        position.vehicle === 'driving' &&
        !panel &&
        !conversation &&
        (moon ? (
          <LunarRoverHud
            speed={position.speed ?? 0}
            exitBlocked={position.exitBlocked}
            onExit={() => input.current.actions.push('interact')}
          />
        ) : (
          <VehicleDashboard
            exitBlocked={position.exitBlocked}
            onExit={() => input.current.actions.push('interact')}
          />
        ))}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        position.vehicle === 'near' &&
        !panel &&
        !conversation &&
        (moon ? (
          <button
            className="lunar-rover-prompt"
            onClick={() => input.current.actions.push('interact')}
          >
            <kbd>E</kbd> Subir al rover
          </button>
        ) : (
          <div className="vehicle-controls">
            <button
              className="station-prompt"
              onClick={() => input.current.actions.push('interact')}
            >
              <kbd>E</kbd> Conducir buggy <span>▶</span>
            </button>
          </div>
        ))}
      {launchPhase === 'idle' &&
        mode === 'walk' &&
        !nearby &&
        !position.vehicle &&
        !panel &&
        !conversation &&
        Math.hypot(position.x - -14, position.z - 36) < 4.8 && (
          <button className="station-prompt" onClick={() => setPanel('authors')}>
            <kbd>E</kbd> Ver Equipo Creador & Créditos <span>👥</span>
          </button>
        )}
      {launchPhase === 'idle' && mode === 'walk' && position.room && !panel && !conversation && (
        <div className="interior-caption">
          {moon ? position.room : roomLabel(position.room)}{' '}
          <small>Primera persona · arrastra para mirar</small>
        </div>
      )}
      {launchPhase === 'idle' && mode !== 'walk' && !panel && !conversation && (
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
      {!panel &&
        !conversation &&
        launchPhase !== 'flight' &&
        launchPhase !== 'ascending' &&
        launchPhase !== 'cockpit' &&
        mode === 'walk' && (
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
                aria-label={
                  position.vehicle === 'driving'
                    ? 'Frenar, mantener pulsado'
                    : 'Correr, mantener pulsado'
                }
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.currentTarget.setPointerCapture(e.pointerId)
                  input.current.keys.add(position.vehicle === 'driving' ? 'Space' : 'ShiftLeft')
                }}
                onPointerUp={() => {
                  input.current.keys.delete('ShiftLeft')
                  input.current.keys.delete('Space')
                }}
                onPointerCancel={() => {
                  input.current.keys.delete('ShiftLeft')
                  input.current.keys.delete('Space')
                }}
                onLostPointerCapture={() => {
                  input.current.keys.delete('ShiftLeft')
                  input.current.keys.delete('Space')
                }}
              >
                {position.vehicle === 'driving' ? 'Frenar' : 'Correr'}
              </button>
              {(!offworld || moon) && position.vehicle !== 'driving' && !position.room && (
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
      {panel === 'authors' && <AuthorsPanel onClose={() => setPanel(null)} />}
      {panel && panel !== 'authors' && (
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
          guideEnabled={guideEnabled}
          setGuideEnabled={setGuideEnabled}
          onClose={() => setPanel(null)}
          onPanel={setPanel}
          onMode={chooseMode}
          onWorld={onWorld}
          onLanding={() => {
            chooseMode('walk')
            onWorld('moon', true)
          }}
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

export default function Worlds({ arrivalOnMount = false }: { arrivalOnMount?: boolean } = {}) {
  const [id, setId] = useState<WorldId>(
    () =>
      (['earth', 'mars', 'moon'].includes(
        new URLSearchParams(window.location.search).get('world') ?? '',
      )
        ? new URLSearchParams(window.location.search).get('world')
        : 'earth') as WorldId,
  )
  const [landing, setLanding] = useState(arrivalOnMount && id === 'moon')
  const finishLanding = useCallback(() => setLanding(false), [])
  const change = (next: WorldId, withLanding = false) => {
    setLanding(next === 'moon' && withLanding)
    setId(next)
    window.history.replaceState(null, '', worldLocation(window.location.href, next))
  }
  return (
    <WorldContext.Provider value={WORLDS[id]}>
      <WorldExperience
        key={id}
        onWorld={change}
        landing={landing}
        onLandingComplete={finishLanding}
      />
    </WorldContext.Provider>
  )
}
