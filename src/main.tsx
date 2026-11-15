import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import './styles.css'

const App = lazy(() => import('./App'))

const params = new URLSearchParams(window.location.search)
const stageParam = params.get('stage')
const isCampaign =
  params.get('campaign') === 'true' ||
  params.get('mode') === 'campaign' ||
  Boolean(stageParam)

const stage: 'briefing' | 'design' | 'launch' =
  stageParam === 'briefing' || stageParam === 'design' || stageParam === 'launch'
    ? stageParam
    : 'launch'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCampaign ? (
      <Suspense fallback={null}>
        <App initialStage={stage} />
      </Suspense>
    ) : (
      <WorldExperience />
    )}
  </StrictMode>,
)
