import type { MissionController } from '../../game/hooks/useMissionController'
import { OPERATION_EVENTS } from '../../game/missionDesign'
export default function OperationsPanel({ controller }: { controller: MissionController }) {
  const { ops, evaluation, operate, go } = controller
  return (
    <>
      <span className="eyebrow">CAPÍTULO 04 · CONTROL DE MISIÓN</span>
      <h1>
        Operación <em>lunar.</em>
      </h1>
      <p>
        ODYSSEY debe producir datos sin agotar la energía ni saturar la memoria. Tu estrategia
        influye en el resultado.
      </p>
      <div className="telemetry">
        <div>
          <span>Batería</span>
          <strong>{ops.battery}%</strong>
        </div>
        <div>
          <span>Almacenados</span>
          <strong>{ops.stored} / 36 GB</strong>
        </div>
        <div>
          <span>Enviados</span>
          <strong>{ops.delivered} GB</strong>
        </div>
        <div>
          <span>Tiempo de misión</span>
          <strong>
            {Math.round((ops.step * evaluation.durationDays) / OPERATION_EVENTS.length)} /{' '}
            {evaluation.durationDays} días
          </strong>
        </div>
      </div>
      {ops.status === 'running' ? (
        <>
          <span className="eyebrow">
            EVENTO {ops.step + 1} / {OPERATION_EVENTS.length}
          </span>
          <h2>{OPERATION_EVENTS[ops.step].name}</h2>
          <p>{OPERATION_EVENTS[ops.step].message}</p>
          <div className="actions">
            {OPERATION_EVENTS[ops.step].options.map((option) => (
              <button key={option.id} type="button" onClick={() => operate(option.id)}>
                <strong>{option.name}</strong>
                <small>{option.effect}</small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={ops.status === 'failed' ? 'verdict danger' : 'verdict success'}>
            <strong>
              {ops.status === 'failed'
                ? 'La misión encontró una falla'
                : 'Secuencia de operaciones finalizada'}
            </strong>
            <p>Revisa los eventos y la puntuación para entender las consecuencias.</p>
          </div>
          <button className="action-primary" onClick={() => go('report')}>
            Leer informe de misión →
          </button>
        </>
      )}
    </>
  )
}
