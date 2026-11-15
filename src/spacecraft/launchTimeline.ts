import type { LauncherId } from '../game/missionDesign'

/**
 * Cinematic timings are fictional and deliberately separated from mission physics.
 * The scene reuses one ODYSSEY launch-vehicle model for both selectable profiles.
 */
export const LAUNCH_DURATION = 34
export type LaunchClock = { current: number }
export type LaunchBeat =
  | 'countdown'
  | 'ignition'
  | 'ascent'
  | 'boosters'
  | 'core'
  | 'fairing'
  | 'release'
  | 'orbital'

export type LaunchFrame = {
  time: number
  progress: number
  beat: LaunchBeat
  title: string
  narration: string
  mechanism: string | null
  countdown: number | null
  altitudeMeters: number
  exhaust: number
  spaceBlend: number
}

export function getLaunchFrame(seconds: number, launcher: LauncherId): LaunchFrame {
  const time = Math.max(0, Math.min(LAUNCH_DURATION, Number.isFinite(seconds) ? seconds : 0))
  const acceleration = launcher === 'atlas' ? 1.12 : 1
  const ascentSeconds = Math.max(0, time - 9)
  const altitudeMeters = 11 * Math.pow(ascentSeconds, 1.55) * acceleration
  const spaceBlend = Math.max(0, Math.min(1, (time - 21) / 9))
  const exhaust = time < 5 || time > 29 ? 0 : Math.min(1, (time - 5) / 1.5) * (time > 25 ? 0.35 : 1)
  let beat: LaunchBeat = 'countdown'
  let title = 'Preparación del lanzamiento'
  let narration = 'TARS: Secuencia de comprobación completada. Esperando ignición.'
  let mechanism: string | null = null

  if (time >= 30) {
    beat = 'orbital'
    title = 'Trayectoria de salida'
    narration = 'TARS: ODYSSEY se separó del lanzador. Comienza la fase de operaciones simuladas.'
    mechanism = 'ODYSSEY_RELEASE'
  } else if (time >= 27) {
    beat = 'release'
    title = 'Liberación de ODYSSEY'
    narration = 'TARS: Se libera el vehículo diseñado por nuestro equipo.'
    mechanism = 'ODYSSEY_RELEASE'
  } else if (time >= 23) {
    beat = 'fairing'
    title = 'Separación de la cofia'
    narration = 'TARS: La protección de la carga útil se desprende durante el ascenso.'
    mechanism = 'FAIRING_JETTISON'
  } else if (time >= 19) {
    beat = 'core'
    title = 'Separación de la etapa central'
    narration = 'TARS: Etapa central separada. Continúa la trayectoria ficticia de inserción.'
    mechanism = 'CORE_STAGE_SEPARATION'
  } else if (time >= 15) {
    beat = 'boosters'
    title = 'Separación de propulsores'
    narration = 'TARS: Los auxiliares se separan del vehículo principal.'
    mechanism = 'BOOSTERS_SEPARATION'
  } else if (time >= 9) {
    beat = 'ascent'
    title = 'Despegue confirmado'
    narration = 'TARS: Tenemos ascenso. Mantén la atención en las fases de la misión.'
  } else if (time >= 5) {
    beat = 'ignition'
    title = 'Ignición de motores'
    narration = 'TARS: Encendido confirmado. La secuencia es una representación educativa.'
  }

  return {
    time,
    progress: time / LAUNCH_DURATION,
    beat,
    title,
    narration,
    mechanism,
    countdown: time < 5 ? Math.ceil(5 - time) : null,
    altitudeMeters,
    exhaust,
    spaceBlend,
  }
}
