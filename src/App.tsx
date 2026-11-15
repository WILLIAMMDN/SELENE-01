import GameWorld from './scene/GameWorld'
import TarsCampaignAssistant from './robot/TarsCampaignAssistant'
import { useMissionController, type CampaignProps } from './game/hooks/useMissionController'
import { STAGES, TIPS } from './game/campaignContent'
import './styles.css'
import BriefingPanel from './ui/campaign/BriefingPanel'
import DesignPanel from './ui/campaign/DesignPanel'
import LaunchPanel from './ui/campaign/LaunchPanel'
import OperationsPanel from './ui/campaign/OperationsPanel'
import ReportPanel from './ui/campaign/ReportPanel'
import EngineeringPanel from './ui/campaign/EngineeringPanel'

export default function App(props: CampaignProps) {
  const controller = useMissionController(props)
  const {
    stage,
    stageIndex,
    go,
    ops,
    operateReady,
    launched,
    interact,
    assembly,
    config,
    exploded,
    notification,
  } = controller
  return (
    <div className="app-shell">
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
        {STAGES.map((item, index) => (
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
            {index < stageIndex ? '✓ ' : ''}
            {item.label}
          </button>
        ))}
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
          />
          <div className="exploration-story">
            <strong>La historia</strong>
            <span>
              Formas parte del equipo SELENE. En este capítulo prepararás un orbitador desde la
              Tierra. La Dra. Vega presenta el objetivo lunar; en el hangar, construyes ODYSSEY con
              la ayuda de TARS antes de configurar su misión científica.
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
