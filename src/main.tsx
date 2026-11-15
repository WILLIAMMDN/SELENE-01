import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WorldExperience from './world/WorldExperience'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorldExperience />
  </StrictMode>,
)
