import { lazy, StrictMode, Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import CharacterGate from './ui/world/CharacterSelection'
import type { LaunchDestination } from './game/launchJourney'
import { worldLocation } from './world/worldLocation'
import { loadBlueprint } from './game/state/blueprintStore'
import { blueprintKey, getMission } from './game/campusMission'
import { makeMissionArrival, savePendingMissionArrival } from './game/missionArrival'
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
    : 'launch'

function GameEntry() {
  const [campaign, setCampaign] = useState(isCampaign)
  const [arrival, setArrival] = useState(false)
  const arrive = (destination: LaunchDestination) => {
    const draft = loadBlueprint()
    const arrival = makeMissionArrival(
      blueprintKey(draft.config, draft.parts),
      getMission().objective,
      destination,
    )
    savePendingMissionArrival(arrival)
    window.history.replaceState(null, '', worldLocation(window.location.href, destination))
    setArrival(destination === 'moon')
    setCampaign(false)
  }
  return campaign ? (
    <Suspense fallback={<p role="status">Preparando la misión…</p>}>
      <App initialStage={stage} onLaunchComplete={arrive} />
    </Suspense>
  ) : (
    <WorldExperience arrivalOnMount={arrival} />
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
