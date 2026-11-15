import MissionChecklist from './MissionChecklist'
import type { MissionController } from '../../game/hooks/useMissionController'
export default function EngineeringPanel({ controller }: { controller: MissionController }) {
  const { evaluation, engineeringProblems, guidance, campus } = controller
  return (
    <aside className="engineering-panel">
      <span className="eyebrow">TABLERO DE INGENIERÍA</span>
      <h2>Recursos de ODYSSEY</h2>
      <p className="small-note">
        Cifras ficticias de entrenamiento. No representan especificaciones oficiales NASA.
      </p>
      {[
        { name: 'Masa', used: evaluation.total.mass, limit: evaluation.capacity.mass, unit: 'kg' },
        {
          name: 'Potencia',
          used: evaluation.total.power,
          limit: evaluation.capacity.power,
          unit: 'W',
        },
        {
          name: 'Datos diarios',
          used: evaluation.total.data,
          limit: evaluation.capacity.data,
          unit: 'GB',
        },
        {
          name: 'Presupuesto',
          used: evaluation.total.cost,
          limit: evaluation.capacity.budget,
          unit: 'M USD',
        },
      ].map((m) => (
        <div className="metric" key={m.name}>
          <div>
            <span>{m.name}</span>
            <strong className={m.used > m.limit ? 'over' : ''}>
              {m.used} / {m.limit} {m.unit}
            </strong>
          </div>
          <div className="metric-track">
            <div
              className={m.used > m.limit ? 'over' : ''}
              style={{ width: Math.min(100, (m.used / m.limit) * 100) + '%' }}
            />
          </div>
        </div>
      ))}
      <p className="science-value">
        Duración: {evaluation.durationDays} días · soporte energético previsto:{' '}
        {evaluation.serviceLife} días · Valor científico estimado{' '}
        <strong>{evaluation.total.science} pts</strong>
      </p>
      <div
        className={!engineeringProblems.length ? 'system-message valid' : 'system-message invalid'}
        role="status"
      >
        {!engineeringProblems.length
          ? '✓ Diseño compatible · guarda y continúa en comunicaciones'
          : engineeringProblems.slice(0, 2).join(' · ') +
            (engineeringProblems.length > 2
              ? ` · ${engineeringProblems.length - 2} requisitos más por resolver`
              : '')}
      </div>
      {campus && <MissionChecklist requirements={guidance.requirements} />}
      <div className="mission-links">
        <a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noopener noreferrer">
          Datos científicos de NASA ↗
        </a>
        <a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noopener noreferrer">
          Modelos y referencias NASA ↗
        </a>
      </div>
    </aside>
  )
}
