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
  velocityKmh: number
  maxQKpa: number
  gForce: number
  exhaust: number
  spaceBlend: number
}

export function getLaunchFrame(seconds: number, launcher: LauncherId): LaunchFrame {
  const time = Math.max(0, Math.min(LAUNCH_DURATION, Number.isFinite(seconds) ? seconds : 0))
  const acceleration = launcher === 'atlas' ? 1.12 : 1
  const ascentSeconds = Math.max(0, time - 8)
  const altitudeMeters = 14 * Math.pow(ascentSeconds, 1.58) * acceleration
  const velocityKmh =
    time < 8
      ? 0
      : Math.round(Math.min(28000, Math.pow(Math.max(0, time - 8), 1.95) * (launcher === 'atlas' ? 82 : 74)))
  const maxQKpa =
    time < 7
      ? 0
      : time > 22
        ? Math.max(0, Number((32.4 * Math.exp(-(time - 12) * 0.45)).toFixed(1)))
        : Math.min(32.4, Number((Math.sin(((time - 7) / 5) * (Math.PI / 2)) * 32.4).toFixed(1)))
  const gForce =
    time < 5
      ? 1.0
      : time < 8
        ? 1.2
        : time < 27
          ? Number((1.2 + Math.pow((time - 8) / 19, 1.4) * 2.6).toFixed(1))
          : 0.0
  const spaceBlend = Math.max(0, Math.min(1, (time - 20) / 9))
  const exhaust = time < 5 || time > 29 ? 0 : Math.min(1, (time - 5) / 1.5) * (time > 25 ? 0.35 : 1)
  let beat: LaunchBeat = 'countdown'
  let title = 'Secuencia Terminal e Ignición (T-5s)'
  let narration = 'TARS: Sistema de supresión de sonido por diluvio activo. Presurización criogénica LH2/LOX nominal.'
  let mechanism: string | null = null

  if (time >= 30) {
    beat = 'orbital'
    title = 'Inyección Translunar (TLI) Confirmada'
    narration = 'TARS: Telemetría de inserción orbital validada. ODYSSEY inicia operaciones rumbo al polo sur lunar.'
    mechanism = 'ODYSSEY_RELEASE'
  } else if (time >= 27) {
    beat = 'release'
    title = 'Liberación de ODYSSEY (Payload Jettison)'
    narration = 'TARS: ¡Desacople exitoso! ODYSSEY vuela de forma autónoma. Despliegue de paneles fotovoltaicos.'
    mechanism = 'ODYSSEY_RELEASE'
  } else if (time >= 23) {
    beat = 'fairing'
    title = 'Eyección de la Cofia Protectora'
    narration = 'TARS: Separación de cofia nominal. La nave ODYSSEY queda expuesta a la radiación solar en el espacio.'
    mechanism = 'FAIRING_JETTISON'
  } else if (time >= 19) {
    beat = 'core'
    title = 'Separación de Etapa Central (MECO)'
    narration = 'TARS: Apagado y separación de etapa central confirmado. La atmósfera se disipa; rumbo a inserción lunar.'
    mechanism = 'CORE_STAGE_SEPARATION'
  } else if (time >= 15) {
    beat = 'boosters'
    title = 'Separación de Propulsores Auxiliares (SRB)'
    narration = 'TARS: Separación de propulsores sólidos completada. Trayectoria de ascenso en régimen nominal.'
    mechanism = 'BOOSTERS_SEPARATION'
  } else if (time >= 8.5) {
    beat = 'ascent'
    title = '¡Despegue de la Plataforma LC-01!'
    narration =
      time >= 12
        ? 'TARS: Pasando Max-Q (Presión aerodinámica máxima: 32.4 kPa). Estructura del vehículo nominal.'
        : 'TARS: ¡Despegue confirmado! ODYSSEY ha librado la torre. Maniobra de cabeceo hacia el Este iniciada.'
  } else if (time >= 5) {
    beat = 'ignition'
    title = 'Ignición de Motores Principales'
    narration = 'TARS: ¡Ignición de etapa central! Cuatro motores en régimen nominal. Cuenta terminal de despegue.'
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
    velocityKmh,
    maxQKpa,
    gForce,
    exhaust,
    spaceBlend,
  }
}
