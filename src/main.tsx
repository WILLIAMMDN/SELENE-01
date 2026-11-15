import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import './styles.css'

const LaunchPreview = lazy(() => import('./spacecraft/LaunchPreview'))
const preview = new URLSearchParams(window.location.search).get('preview') === 'launch'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {preview ? (
      <Suspense fallback={<p role="status">Preparando la vista previa de ODYSSEY…</p>}>
        <LaunchPreview />
      </Suspense>
    ) : (
      <WorldExperience />
    )}
  </StrictMode>,
)
