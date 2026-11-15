import { useEffect } from 'react'
import GameWorld from './scene/GameWorld'
import TarsCampaignAssistant from './robot/TarsCampaignAssistant'
import { useMissionController, type CampaignProps } from './game/hooks/useMissionController'
import { STAGES, TIPS } from './game/campaignContent'
import './styles.css'
import './campaignPaper.css'
import './designPaper.css'
import BriefingPanel from './ui/campaign/BriefingPanel'
import DesignPanel from './ui/campaign/DesignPanel'
import LaunchPanel from './ui/campaign/LaunchPanel'
import LaunchCinematicOverlay from './spacecraft/LaunchCinematicOverlay'
import './spacecraft/launchCinematic.css'
import OperationsPanel from './ui/campaign/OperationsPanel'
import ReportPanel from './ui/campaign/ReportPanel'
import EngineeringPanel from './ui/campaign/EngineeringPanel'

export default function App(props: CampaignProps) {
  const controller = useMissionController(props)
  const {
    stage,
    guidance,
    engineeringProblems,
    go,
    ops,
    operateReady,
    launched,
    launching,
    launchElapsed,
    setLaunchElapsed,
    finishLaunch,
    interact,
    assembly,
    config,
    exploded,
    notification,
  } = controller
  useEffect(() => {
    if (!launching) return
    const handleSkip = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      finishLaunch()
    }
    window.addEventListener('keydown', handleSkip)
    return () => window.removeEventListener('keydown', handleSkip)
  }, [launching, finishLaunch])
  useEffect(() => {
    document.body.classList.toggle('selene-film-active', launching)
    return () => document.body.classList.remove('selene-film-active')
  }, [launching])
  return (
    <div className={`app-shell stage-${stage}${launching ? ' cinematic-active' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">◐</span>
          <span>
            <strong>SELENE—01</strong>
            <small>ARQUITECTOS DEL ESPACIO</small>
          </span>
        </div>
        <div className="topbar-note">
          Un juego sobre decisiones de ingeniería, no una misión real
        </div>
        <span className="topbar-status">PROTOTIPO EDUCATIVO · V0.2</span>
      </header>
      <nav className="stage-nav" aria-label="Etapas de la misión">
        {STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={stage === item.id ? 'current' : ''}
            aria-current={stage === item.id ? 'step' : undefined}
            onClick={() => go(item.id)}
            disabled={
              (item.id === 'report' && ops.status === 'running') ||
              (item.id === 'operations' && (!operateReady || !launched))
            }
          >
            {(item.id === 'briefing' && guidance.objective) ||
            (item.id === 'design' && engineeringProblems.length === 0) ||
            (item.id === 'launch' && launched) ||
            (item.id === 'operations' && ops.status !== 'running')
              ? '✓ '
              : ''}
            {item.label}
          </button>
        ))}
        <a className="demo-entry" href="/?demo=1">
          ▶ Demo rápida · 15 s
        </a>
      </nav>
      <main className="game-layout">
        <section className="world-column">
          <GameWorld
            mode={
              stage === 'operations' || stage === 'report'
                ? 'orbit'
                : stage === 'design'
                  ? 'workshop'
                  : stage === 'launch'
                    ? 'launch'
                    : 'campus'
            }
            onInteract={interact}
            parts={assembly}
            config={config}
            exploded={exploded}
            cinematic={launching}
            cinematicElapsed={launchElapsed}
            onCinematicProgress={setLaunchElapsed}
            onCinematicComplete={finishLaunch}
          />
          {launching && (
            <LaunchCinematicOverlay seconds={launchElapsed} config={config} onSkip={finishLaunch} />
          )}
          <div className="exploration-story">
            <strong>El encargo</strong>
            <span>
              Diseña un orbitador no tripulado para una pregunta sobre el polo sur lunar. La Dra.
              Vega define el encargo; tú eliges un sistema viable, diriges tres hitos de operación y
              evalúas los datos recuperados.
            </span>
          </div>
        </section>
        <section className="campaign-panel" aria-live="polite">
          {notification && (
            <p className="notification" role="status">
              {notification}
            </p>
          )}
          {stage === 'briefing' && <BriefingPanel controller={controller} />}
          {stage === 'design' && <DesignPanel controller={controller} />}
          {stage === 'launch' && <LaunchPanel controller={controller} />}
          {stage === 'operations' && <OperationsPanel controller={controller} />}
          {stage === 'report' && <ReportPanel controller={controller} />}
        </section>
        <EngineeringPanel controller={controller} />
      </main>
      <TarsCampaignAssistant hint={TIPS[stage]} />
      <footer>
        SELENE-01 · SPACE MISSION DESIGN GAME · Proyecto independiente, no afiliado ni avalado por
        NASA
      </footer>
    </div>
  )
}
