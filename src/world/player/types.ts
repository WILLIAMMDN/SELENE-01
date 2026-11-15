import type { MutableRefObject } from 'react'
import type { CharacterControls } from '../characterMotion'
import type { SectorId, ViewMode } from '../worldData'
import type { BoardingMotion, BoardingPhase } from '../../spacecraft/boardingRoute'
import type { LaunchClock } from '../../spacecraft/launchTimeline'
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
  boardingSpot?: 'lift' | 'hatch' | null
}
export type SceneProps = {
  mode: ViewMode
  tourIndex: number
  travel: Travel
  input: MutableRefObject<InputState>
  paused: boolean
  reduced: boolean
  onPosition: (p: PositionReport) => void
  onInteract: (id: SectorId) => void
  launchPhase?: BoardingPhase
  boardingMotion?: MutableRefObject<BoardingMotion>
  flightClock?: MutableRefObject<LaunchClock>
  onLaunchPhase?: (phase: BoardingPhase) => void
  onCinematicProgress?: (seconds: number) => void
  onCinematicComplete?: () => void
}
