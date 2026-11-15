import type { MissionController } from '../../game/hooks/useMissionController'
import { missionScore, missionDebrief } from '../../game/missionDesign'
export default function ReportPanel({ controller }: { controller: MissionController }) {
  const { ops, evaluation, debrief, redesign, restart, campus, onReturnToCampus } = controller
  return (
    <>
      <span className="eyebrow">CAPÍTULO 05 · DESPUÉS DEL VUELO</span>
      <h1>
        Aprender de <em>la misión.</em>
      </h1>
      <div className="score">
        <strong>{missionScore(ops, evaluation)} / 100</strong>
        <span>PUNTUACIÓN EDUCATIVA</span>
      </div>
      <p>
        Resultado:{' '}
        <b>{ops.status === 'completed' ? 'Operación completada' : 'Operación interrumpida'}</b>.
        Datos enviados: <b>{ops.delivered} GB</b>. Reserva final: <b>{ops.battery}%</b>.
      </p>
      {debrief && (
        <section className="flight-brief" aria-label="Resultado del encargo">
          <h2>{debrief.objective.name}</h2>
          <p>{debrief.objective.question}</p>
          <strong>{debrief.title}</strong>
          <p>{debrief.explanation}</p>
          <small>{debrief.limit}</small>
          <p>
            <a
              className="source-link"
              href={debrief.objective.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contexto del encargo · NASA ↗
            </a>
          </p>
        </section>
      )}
      <h2>Bitácora de decisiones</h2>
      <div className="mission-log">
        {ops.history.map((entry, index) => (
          <p key={index}>
            {index + 1}. {entry}
          </p>
        ))}
      </div>
      <ul className="debrief-notes">
        {missionDebrief(ops, evaluation).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p>
        <strong>Reflexión:</strong>{' '}
        {debrief?.reflection ??
          '¿Qué instrumento cambiarías para equilibrar valor científico, masa, potencia y capacidad de transmisión?'}
      </p>
      {campus && (
        <button className="action-secondary" onClick={onReturnToCampus}>
          Volver al campus · el informe te espera en el mirador →
        </button>
      )}
      <button className="action-primary" onClick={redesign}>
        Rediseñar la misión ↻
      </button>
      <button className="action-secondary" onClick={restart}>
        Comenzar otra historia
      </button>
    </>
  )
}
