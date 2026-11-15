import type { MissionController } from '../../game/hooks/useMissionController'
import { assemblyReady } from '../../spacecraft/assembly'
export default function LaunchPanel({ controller }: { controller: MissionController }) {
  const {
    operateReady,
    launchProblems,
    assembly,
    evaluation,
    guidance,
    fly,
    campus,
    onReturnToCampus,
    go,
  } = controller
  return (
    <>
      <span className="eyebrow">CAPÍTULO 03 · COMPROBACIÓN</span>
      <h1>
        Cuenta <em>regresiva.</em>
      </h1>
      <p>
        Antes del despegue, todas las restricciones deben ser compatibles. Una gran misión no puede
        despegar con una nave que supera la capacidad del lanzador o el presupuesto.
      </p>
      <div className={operateReady ? 'verdict success' : 'verdict danger'}>
        <strong>{operateReady ? '✓ Diseño compatible' : '⚠ La misión necesita cambios'}</strong>
        <p>
          {operateReady
            ? 'Tu configuración supera las comprobaciones educativas de esta versión.'
            : 'Hay incompatibilidades que resolver antes de lanzar.'}
        </p>
      </div>
      {launchProblems.length > 0 && (
        <ul className="warnings">
          {launchProblems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <div className="flight-brief">
        <h2>Plan de vuelo de ODYSSEY</h2>
        <p>
          <b>Ensamblaje:</b>{' '}
          {assemblyReady(assembly) ? 'Módulos obligatorios instalados' : 'Incompleto'} ·{' '}
          {assembly.includes('habitat') ? 'Con hábitat' : 'Configuración compacta'}
        </p>
        <p>
          <b>Lanzador:</b> {evaluation.launcherName}
        </p>
        <p>
          <b>Órbita:</b> {evaluation.orbitName}
        </p>
        <p>
          <b>Duración:</b> {evaluation.durationDays} días
        </p>
        <p>
          <b>Objetivo:</b> {guidance.objective?.name ?? 'Estudio del polo sur lunar'}
        </p>
      </div>
      <button className="action-primary" onClick={fly} disabled={!operateReady}>
        {operateReady ? 'Autorizar lanzamiento simulado →' : 'Corrige los problemas para lanzar'}
      </button>
      {campus && (
        <button className="action-secondary" onClick={onReturnToCampus}>
          Volver a las estaciones del campus
        </button>
      )}
      {!operateReady && (
        <button className="action-secondary" onClick={() => go('design')}>
          Volver al hangar
        </button>
      )}
    </>
  )
}
