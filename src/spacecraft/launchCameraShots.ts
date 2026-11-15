import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'
import type { LauncherId } from '../game/missionDesign'

export type LaunchShotId =
  | 'establish'
  | 'capsule'
  | 'services'
  | 'ignition'
  | 'liftoff'
  | 'atmosphere'
  | 'boosters'
  | 'fairing'
  | 'core'
  | 'release'
  | 'odyssey'

export type LaunchShot = {
  id: LaunchShotId
  label: string
  start: number
  end: number
  distance: number
  focusHeight: number
  altitudeOffset: number
  azimuth: number
  fov: number
}

/**
 * Camera offsets are in campus metres, NOT arbitrary model units.
 * The full launch stack is approximately 90 m tall and needs a substantial
 * minimum stand-off distance to stay in frame at vertical aspect ratios.
 */
export const LAUNCH_SHOTS: readonly LaunchShot[] = [
  {
    id: 'establish',
    label: 'ODYSSEY Y LC-01',
    start: 0,
    end: 4,
    distance: 205,
    focusHeight: 51,
    altitudeOffset: 40,
    azimuth: 0.95,
    fov: 45,
  },
  {
    id: 'capsule',
    label: 'CARGA ASEGURADA',
    start: 4,
    end: 8,
    distance: 105,
    focusHeight: 80,
    altitudeOffset: 13,
    azimuth: 1.25,
    fov: 41,
  },
  {
    id: 'services',
    label: 'RETRACCIÓN DE SERVICIOS',
    start: 8,
    end: 12,
    distance: 205,
    focusHeight: 48,
    altitudeOffset: 33,
    azimuth: 0.55,
    fov: 45,
  },
  {
    id: 'ignition',
    label: 'IGNICIÓN',
    start: 12,
    end: 18,
    distance: 147,
    focusHeight: 31,
    altitudeOffset: 23,
    azimuth: 0.89,
    fov: 43,
  },
  {
    id: 'liftoff',
    label: 'DESPEGUE',
    start: 18,
    end: 24,
    distance: 218,
    focusHeight: 49,
    altitudeOffset: 34,
    azimuth: 1.12,
    fov: 45,
  },
  {
    id: 'atmosphere',
    label: 'ASCENSO',
    start: 24,
    end: 28,
    distance: 196,
    focusHeight: 48,
    altitudeOffset: 25,
    azimuth: 1.72,
    fov: 44,
  },
  {
    id: 'boosters',
    label: 'DESACOPLE DE AUXILIARES',
    start: 28,
    end: 32,
    distance: 180,
    focusHeight: 44,
    altitudeOffset: 26,
    azimuth: 0.75,
    fov: 44,
  },
  {
    id: 'fairing',
    label: 'APERTURA DE COFIA',
    start: 32,
    end: 35,
    distance: 104,
    focusHeight: 79,
    altitudeOffset: 12,
    azimuth: 1.36,
    fov: 41,
  },
  {
    id: 'core',
    label: 'DESACOPLE CENTRAL',
    start: 35,
    end: 38,
    distance: 190,
    focusHeight: 45,
    altitudeOffset: 32,
    azimuth: 0.98,
    fov: 45,
  },
  {
    id: 'release',
    label: 'LIBERACIÓN DE ODYSSEY',
    start: 38,
    end: 41,
    distance: 125,
    focusHeight: 81,
    altitudeOffset: 21,
    azimuth: 1.38,
    fov: 39,
  },
  {
    id: 'odyssey',
    label: 'NAVE EN TRAYECTORIA',
    start: 41,
    end: LAUNCH_DURATION + 1,
    distance: 98,
    focusHeight: 105,
    altitudeOffset: 17,
    azimuth: 1.34,
    fov: 38,
  },
]

export function getLaunchShot(seconds: number): LaunchShot {
  const t = Math.max(0, Math.min(LAUNCH_DURATION, Number.isFinite(seconds) ? seconds : 0))
  return (
    LAUNCH_SHOTS.find((shot) => t >= shot.start && t < shot.end) ??
    LAUNCH_SHOTS[LAUNCH_SHOTS.length - 1]
  )
}

export type LaunchCameraPose = {
  shot: LaunchShot
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

/** Every shot dynamically tracks the same vehicle, even after the stack ascends. */
export function getLaunchCameraPose(
  time: number,
  launcher: LauncherId,
  origin: [number, number, number],
  rocketHeight: number,
): LaunchCameraPose {
  const shot = getLaunchShot(time)
  const frame = getLaunchFrame(time, launcher)
  const shotLength = shot.end - shot.start
  const progress = Math.min(1, Math.max(0, (time - shot.start) / shotLength))
  const azimuth = shot.azimuth + (progress - 0.5) * (shot.id === 'odyssey' ? 0.32 : 0.16)
  const dist = shot.distance * (1 + (shot.id === 'liftoff' ? progress * 0.12 : -progress * 0.045))
  const stageScale = rocketHeight / 90.4
  const relativeFocus = shot.focusHeight * stageScale
  const y = origin[1] + frame.altitudeMeters + relativeFocus
  return {
    shot,
    position: [
      origin[0] + Math.cos(azimuth) * dist,
      y + shot.altitudeOffset,
      origin[2] + Math.sin(azimuth) * dist,
    ],
    target: [origin[0], y, origin[2]],
    fov: shot.fov,
  }
}
