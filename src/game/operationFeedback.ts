import {
  applyOperation,
  type OperationState,
  type OperationChoice,
  type DesignEvaluation,
} from './missionDesign'

/** Preview and feedback use the same transition as gameplay, without mutating the save. */
export function operationPreview(
  state: OperationState,
  choice: OperationChoice,
  design: DesignEvaluation,
) {
  const next = applyOperation(state, choice, design)
  if (next === state) return null
  const battery = next.battery - state.battery,
    delivered = next.delivered - state.delivered
  const summary = `Batería ${next.battery}% (${battery >= 0 ? '+' : ''}${battery}) · memoria ${next.stored}/36 GB · enviados +${delivered} GB.`
  const warning =
    next.status === 'failed'
      ? next.battery === 0
        ? 'Esta decisión agota la batería y termina la operación.'
        : 'Esta decisión supera la memoria disponible y termina la operación.'
      : next.status === 'completed' && next.delivered === 0
        ? 'La operación terminaría sin devolver datos.'
        : delivered === 0 && (choice === 'downlink' || choice === 'emergency')
          ? 'No hay datos almacenados que transmitir.'
          : null
  return { next, summary, warning }
}
