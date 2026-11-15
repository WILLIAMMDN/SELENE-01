import type { MutableRefObject } from 'react'
import type { CharacterControls } from '../characterMotion'
import type { SectorId, ViewMode } from '../worldData'
import type { MissionGuideReport } from '../navigation/missionDestination'
export type Travel = { id: SectorId | 'start'; serial: number; point?: [number, number] }
export type InputState = CharacterControls & { yaw: number; pitch: number; zoom: number }
export type PositionReport = {
  x: number
  z: number
  nearby: SectorId | null
  vehicle?: false | null | 'near' | 'driving'
  speed?: number
  exitBlocked?: boolean
  fps: number
  room?: string | null
}
export type SceneProps = {
  mode: ViewMode
  tourIndex: number
  travel: Travel
  input: MutableRefObject<InputState>
  paused: boolean
  reduced: boolean
  landing?: boolean
  onLandingComplete?: () => void
  onPosition: (p: PositionReport) => void
  onInteract: (id: SectorId) => void
  cinematic?: boolean
  onWardrobe?: () => void
  guideSector?: SectorId
  onGuide?: (report: MissionGuideReport) => void
}
