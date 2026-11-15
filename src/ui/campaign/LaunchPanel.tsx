import type { MissionController } from '../../game/hooks/useMissionController'
import { assemblyReady } from '../../spacecraft/assembly'
import { LAUNCH_DESTINATIONS } from '../../game/launchJourney'
import DestinationPicker from './DestinationPicker'
export default function LaunchPanel({ controller }: { controller: MissionController }) {
  const {
    operateReady,
    launchProblems,
    assembly,
    evaluation,
    destination,
    setDestination,
    guidance,
    fly,
    campus,
    onReturnToCampus,
    go,
  } = controller
  const target = LAUNCH_DESTINATIONS.find((item) => item.id === destination)!
  return (
    <>
      <span className="eyebrow">CUADERNO DE MISIÓN / 03 · REVISIÓN</span>
      <h1>
        Antes del <em>lanzamiento.</em>
      </h1>
      <p>
        Compara el diseño con el encargo aceptado. Comprueba que la masa, la energía, los datos y el
        costo estén dentro de los límites de este escenario antes de autorizar el vuelo simulado.
      </p>
      <div className={operateReady ? 'verdict success' : 'verdict danger'}>
        <strong>{operateReady ? '✓ Diseño compatible' : '⚠ La misión necesita cambios'}</strong>
        <p>
          {operateReady
            ? 'El diseño cumple las restricciones educativas y tiene una revisión vigente.'
            : 'Hay incompatibilidades que resolver antes de lanzar.'}
        </p>
      </div>
      <div className="evidence-card">
        <span className="evidence-label">MÉTODO · NASA</span>
        <p>
          En ingeniería de sistemas, objetivos y requisitos guían la comparación entre alternativas.
          Aquí se aplica esa idea a un escenario simplificado; AURORA-S, ATLAS-T y sus capacidades
          son ficticios.
        </p>
        <a
          href="https://www.nasa.gov/reference/4-0-system-design-processes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA · Procesos de diseño de sistemas ↗
        </a>
      </div>
      {launchProblems.length > 0 && (
        <ul className="warnings">
          {launchProblems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <DestinationPicker value={destination} onChange={setDestination} />
      <div className="flight-brief">
        <h2>Revisión de ODYSSEY</h2>
        <p>
          <b>Mapa de exploración tras el lanzamiento:</b> {target.name} · {target.place}
        </p>
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
        {operateReady
          ? `Simular campaña lunar y abrir ${target.name} →`
          : 'Corrige los problemas para lanzar'}
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
