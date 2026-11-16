import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import CharacterGate from './ui/world/CharacterSelection'
import './styles.css'

const App = lazy(() => import('./App'))
const LaunchPreview = lazy(() => import('./spacecraft/LaunchPreview'))
const DemoMission = lazy(() => import('./ui/demo/DemoMission'))

const params = new URLSearchParams(window.location.search)
const preview = params.get('preview') === 'launch'
const demo = params.get('demo') === '1'
const stageParam = params.get('stage')
const isCampaign =
  params.get('campaign') === 'true' || params.get('mode') === 'campaign' || Boolean(stageParam)
const stage: 'briefing' | 'design' | 'launch' =
  stageParam === 'briefing' || stageParam === 'design' || stageParam === 'launch'
    ? stageParam
    : 'briefing'

function GameEntry() {
  return isCampaign ? (
    <Suspense fallback={<p role="status">Preparando la misión…</p>}>
      <App initialStage={stage} />
    </Suspense>
  ) : (
    <WorldExperience />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {demo ? (
      <Suspense fallback={<p role="status">Preparando la demostración…</p>}>
        <DemoMission />
      </Suspense>
    ) : preview ? (
      <Suspense fallback={<p role="status">Preparando la vista previa de ODYSSEY…</p>}>
        <LaunchPreview />
      </Suspense>
    ) : (
      <CharacterGate>
        <GameEntry />
      </CharacterGate>
    )}
  </StrictMode>,
)
