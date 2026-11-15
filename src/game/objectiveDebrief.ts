import type { DesignConfig, InstrumentId, OperationState } from './missionDesign'
import { OBJECTIVES } from './objectives'

const REFLECTION: Record<InstrumentId, string> = {
  camera:
    '¿Conservarías la cobertura polar y reservarías otra transmisión antes de añadir más observaciones?',
  spectrometer:
    '¿Qué cambiarías en el enlace o la duración para recuperar más datos del instrumento sin exceder el presupuesto?',
  radar:
    '¿Cómo reservarías energía y una ventana de transmisión antes de pedir otra observación de radar?',
}

/** Educational interpretation of aggregate simulated data, never a scientific discovery. */
export function objectiveDebrief(
  objectiveId: InstrumentId | null,
  config: DesignConfig,
  state: OperationState,
) {
  const objective = OBJECTIVES.find((item) => item.id === objectiveId)
  if (!objective) return null
  const compatible = config.instruments.includes(objective.id) && config.orbit !== 'inclined'
  const outcome =
    state.status === 'running'
      ? 'pending'
      : !compatible
        ? 'incompatible'
        : state.delivered === 0
          ? 'no-data'
          : state.status === 'failed'
            ? 'partial'
            : 'returned'
  const labels = {
    pending: 'La operación sigue en curso',
    incompatible: 'El diseño no responde al encargo',
    'no-data': 'El encargo quedó sin datos recuperados',
    partial: 'Datos agregados recuperados antes de la interrupción',
    returned: 'Datos agregados recuperados; pregunta aún abierta',
  }
  const explanation =
    outcome === 'pending'
      ? 'Todavía faltan decisiones. El informe se cierra cuando termine la operación.'
      : outcome === 'incompatible'
        ? `Revisa el requisito del encargo: ${objective.requirement}`
        : outcome === 'no-data'
          ? 'Finalizar los turnos no basta: debes observar y transmitir. No hay datos recibidos con los que continuar este encargo.'
          : `ODYSSEY devolvió ${state.delivered} GB agregados. El juego no identifica qué instrumento produjo cada dato ni permite concluir que la pregunta científica esté resuelta. ${outcome === 'partial' ? 'La operación se interrumpió; analiza qué recurso falló.' : 'Compara el diseño y las decisiones que permitieron la transmisión.'}`
  const limit =
    'Los GB son datos agregados del juego, no mediciones por instrumento ni evidencia de una respuesta científica real.'
  return {
    objective,
    outcome,
    title: labels[outcome],
    explanation,
    limit,
    reflection: REFLECTION[objective.id],
  }
}
