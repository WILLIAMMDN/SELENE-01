import type { LauncherId } from '../game/missionDesign'

/**
 * SELENE uses a condensed educational storyboard, NOT an SLS flight trajectory.
 * Real Artemis sequences take minutes/hours; this cutscene lasts 45 seconds.
 * All altitude and speed-like values here are hypothetical visual cues.
 */
export const LAUNCH_DURATION = 45
export const LIFTOFF_AT = 18
export type LaunchClock = { current: number }
export type LaunchBeat =
  | 'boarding'
  | 'cabin'
  | 'countdown'
  | 'ignition'
  | 'ascent'
  | 'maxq'
  | 'boosters'
  | 'fairing'
  | 'core'
  | 'release'
  | 'orbital'

export type LaunchFrame = {
  time: number
  progress: number
  beat: LaunchBeat
  title: string
  narration: string
  speaker: 'TARS' | 'DRA. VEGA'
  mechanism: string | null
  countdown: number | null
  altitudeMeters: number
  exhaust: number
  spaceBlend: number
  milestone: string
}

/** One chronology drives GLB events, subtitles, HUD and camera beats. */
export function getLaunchFrame(
  seconds: number,
  launcher: LauncherId,
  withHabitat = false,
): LaunchFrame {
  const time = Math.max(0, Math.min(LAUNCH_DURATION, Number.isFinite(seconds) ? seconds : 0))
  const ascentSeconds = Math.max(0, time - LIFTOFF_AT)
  const acceleration = launcher === 'atlas' ? 1.12 : 1
  const altitudeMeters = 9 * Math.pow(ascentSeconds, 1.65) * acceleration
  const spaceBlend = Math.max(0, Math.min(1, (time - 29) / 13))
  const exhaust =
    time < 12 || time > 38 ? 0 : Math.min(1, (time - 12) / 1.8) * (time > 35 ? 0.5 : 1)
  let beat: LaunchBeat
  let title: string
  let narration: string
  let speaker: 'TARS' | 'DRA. VEGA' = 'TARS'
  let mechanism: string | null = null
  let milestone: string

  if (time < 4) {
    beat = 'boarding'
    title = 'La última comprobación'
    speaker = 'DRA. VEGA'
    narration = withHabitat
      ? 'La cabina y el módulo habitable están listos. Las decisiones que tomaste nos trajeron hasta aquí.'
      : 'Tu nave compacta está lista. Cada módulo que elegiste tendrá un propósito durante el vuelo.'
    milestone = 'Cabina de ODYSSEY · LC-01'
  } else if (time < 8) {
    beat = 'cabin'
    title = 'Escotilla asegurada'
    narration = withHabitat
      ? 'TARS: Escotilla cerrada. Oxígeno, energía y comunicación de la cabina comprobados.'
      : 'TARS: Escotilla cerrada. Energía y comunicaciones de la cabina comprobadas.'
    milestone = 'Preparación de cabina'
  } else if (time < 12) {
    beat = 'countdown'
    title = 'La plataforma se despeja'
    narration = 'TARS: Brazos de servicio en retirada. Todos los equipos confirman disponibilidad.'
    milestone = 'Retirada de servicios'
  } else if (time < 18) {
    beat = 'ignition'
    title = 'Encendido de motores'
    narration = 'TARS: Iniciando ignición. Monitorizamos la secuencia final de despegue.'
    milestone = 'Secuencia terminal'
  } else if (time < 24) {
    beat = 'ascent'
    title = 'ODYSSEY despega'
    speaker = 'DRA. VEGA'
    narration = 'Ha llegado el momento. Nuestra misión ya no está en los planos.'
    milestone = 'Ascenso sobre Artemisa'
  } else if (time < 28) {
    beat = 'maxq'
    title = 'Cruce de la atmósfera'
    narration =
      'TARS: Max-Q significa máxima presión dinámica. Protegemos el vehículo reduciendo cargas.'
    milestone = 'Concepto: presión dinámica'
  } else if (time < 32) {
    beat = 'boosters'
    title = 'Separamos los propulsores'
    narration = 'TARS: Auxiliares liberados. Cada separación reduce masa, pero exige precisión.'
    mechanism = 'BOOSTERS_SEPARATION'
    milestone = 'Etapas · auxiliares'
  } else if (time < 35) {
    beat = 'fairing'
    title = 'La nave queda al descubierto'
    narration = 'TARS: Se retira la cofia. Los instrumentos viajan protegidos hasta esta fase.'
    mechanism = 'FAIRING_JETTISON'
    milestone = 'Protección de carga'
  } else if (time < 38) {
    beat = 'core'
    title = 'La etapa central se separa'
    narration = 'TARS: Separación de etapa principal. Continuamos en una trayectoria ficticia.'
    mechanism = 'CORE_STAGE_SEPARATION'
    milestone = 'Etapas · núcleo'
  } else if (time < 41) {
    beat = 'release'
    title = 'ODYSSEY está libre'
    speaker = 'DRA. VEGA'
    narration = 'La nave que diseñaste ya navega por sí misma. Su misión apenas empieza.'
    mechanism = 'ODYSSEY_RELEASE'
    milestone = 'Separación de carga útil'
  } else {
    beat = 'orbital'
    title = 'Una misión construida por ti'
    narration = 'TARS: Elige ahora cómo observar, conservar energía y enviar datos a la Tierra.'
    mechanism = 'ODYSSEY_RELEASE'
    milestone = 'Comienzan las operaciones'
  }

  return {
    time,
    progress: time / LAUNCH_DURATION,
    beat,
    title,
    narration,
    speaker,
    mechanism,
    countdown: time >= 8 && time < 18 ? Math.ceil(18 - time) : null,
    altitudeMeters,
    exhaust,
    spaceBlend,
    milestone,
  }
}
