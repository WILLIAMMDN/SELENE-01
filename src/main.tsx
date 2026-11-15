import { lazy, StrictMode, Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import CharacterGate from './ui/world/CharacterSelection'
import type { LaunchDestination } from './game/launchJourney'
import { worldLocation } from './world/worldLocation'
import './styles.css'

const App = lazy(() => import('./App'))

const params = new URLSearchParams(window.location.search)
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
    window.history.replaceState(null, '', worldLocation(window.location.href, destination))
    setArrival(destination === 'moon')
    setCampaign(false)
  }
  return campaign ? (
    <Suspense fallback={null}>
      <App initialStage={stage} onLaunchComplete={arrive} />
    </Suspense>
  ) : (
    <WorldExperience arrivalOnMount={arrival} />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CharacterGate>
      <GameEntry />
    </CharacterGate>
  </StrictMode>,
)
