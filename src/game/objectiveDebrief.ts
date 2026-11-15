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
    partial: 'Datos recuperados antes de la interrupción',
    returned: 'Datos recuperados para el encargo',
  }
  const explanation =
    outcome === 'pending'
      ? 'Todavía faltan decisiones. El informe se cierra cuando termine la operación.'
      : outcome === 'incompatible'
        ? `Revisa el requisito del encargo: ${objective.requirement}`
        : outcome === 'no-data'
          ? 'Finalizar los turnos no basta: debes observar y transmitir. No hay datos recibidos con los que continuar este encargo.'
          : `En esta simulación devolviste ${state.delivered} GB con el instrumento solicitado y cobertura polar. ${outcome === 'partial' ? 'La operación se interrumpió; analiza también qué recurso falló.' : 'Puedes analizar las decisiones que hicieron posible recuperar datos.'}`
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
