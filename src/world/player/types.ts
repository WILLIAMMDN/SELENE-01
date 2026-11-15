import type { MutableRefObject } from 'react'
import type { CharacterControls } from '../characterMotion'
import type { SectorId, ViewMode } from '../worldData'
export type Travel = { id: SectorId | 'start'; serial: number; point?: [number, number] }
export type InputState = CharacterControls & { yaw: number; pitch: number; zoom: number }
export type PositionReport = {
  x: number
  z: number
  nearby: SectorId | null
  vehicle?: false | null | 'near' | 'driving'
  rover?: { x: number; z: number; distance: number }
  speed?: number
  exitBlocked?: boolean
  fps: number
  room?: string | null
  workstation?: { name: string }
  eva?: { oxygen: number; battery: number; workload: number; sealed: boolean; recovered: boolean }
  hatch?: { label: string; open: boolean; moving: boolean; blocked: boolean }
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
}
