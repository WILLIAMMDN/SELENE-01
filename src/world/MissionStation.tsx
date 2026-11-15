import { missionGuidance } from '../game/missionGuidance'
import MissionChecklist from '../ui/campaign/MissionChecklist'
import { loadOperationSession } from '../game/state/operationStore'
import { blueprintKey } from '../game/campusMission'
import { useState } from 'react'
import {
  OBJECTIVES,
  acceptObjective,
  useCampusMission,
  missionProblems,
  missionVerified,
  verifyMission,
  resetCampusMission,
} from '../game/campusMission'
import { evaluateDesign } from '../game/missionDesign'
import { useBlueprint } from '../game/state/blueprintStore'
import type { SectorId } from './worldData'

export default function MissionStation({
  sector,
  present,
  mars,
  onCampaign,
}: {
  sector: SectorId
  present: boolean
  mars: boolean
  onCampaign: (id: SectorId) => void
}) {
  const mission = useCampusMission(),
    [message, setMessage] = useState('')
  const { config, parts } = useBlueprint(),
    problems = missionProblems(config, parts),
    verified = missionVerified(config, parts),
    evaluation = evaluateDesign(config)
  const guidance = missionGuidance(mission, config, parts)
  const savedFlight = verified ? loadOperationSession(blueprintKey(config, parts)) : null
  const objective = OBJECTIVES.find((o) => o.id === mission.objective)
  if (mars)
    return (
      <div className="mission-station">
        <p>
          Este interior se puede recorrer. La secuencia de diseño y operaciones de esta entrega se
          desarrolla en la Tierra y estudia la Luna.
        </p>
      </div>
    )
  return (
    <section className="mission-station" aria-label="Actividad de la estación">
      {!present && (
        <p className="station-notice">
          Entra al edificio y acércate a su mesa o consola para realizar esta actividad. En la
          plataforma y el mirador, utiliza el puesto señalizado.
        </p>
      )}
      {(sector === 'hangar' || sector === 'control' || sector === 'launch') && (
        <>
          <p>{guidance.explanation}</p>
          <MissionChecklist requirements={guidance.requirements} />
        </>
      )}
      {sector === 'research' && (
        <>
          <h3>01 · Primero, una pregunta</h3>
          <p>
            La Dra. Vega propone tres encargos. Elige uno: determinará qué instrumento necesitas y
            qué cobertura debe tener tu misión.
          </p>
          <div className="mission-objectives">
            {OBJECTIVES.map((o) => (
              <article key={o.id}>
                <strong>{o.name}</strong>
                <p>{o.question}</p>
                <small>{o.requirement}</small>
                <a href={o.source} target="_blank" rel="noreferrer">
                  Contexto científico · NASA ↗
                </a>
                <button
                  className="secondary-world"
                  disabled={!present || mission.objective === o.id}
                  onClick={() => {
                    acceptObjective(o.id)
                    setMessage(
                      'Objetivo guardado. Ve a la consola del hangar o al banco del taller para ensamblar ODYSSEY.',
                    )
                  }}
                >
                  {mission.objective === o.id ? '✓ Objetivo elegido' : 'Aceptar este encargo'}
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {sector === 'hangar' && (
        <>
          <h3>02 · Del objetivo al diseño</h3>
          <p>
            {objective
              ? `Encargo: ${objective.name}. ${objective.requirement}`
              : 'Primero debes aceptar un encargo en el laboratorio.'}
          </p>
          <p>
            Ensambla la nave y configura instrumentos, órbita, lanzador y duración. Después visita
            comunicaciones.
          </p>
          <button
            className="primary-world"
            disabled={!present || !mission.objective}
            onClick={() => onCampaign('hangar')}
          >
            Abrir mesa de ensamblaje →
          </button>
        </>
      )}
      {sector === 'control' && (
        <>
          <h3>03 · Revisión de misión</h3>
          <p>Comprueba los recursos para {evaluation.durationDays} días de misión.</p>
          <dl className="mission-resources">
            {[
              ['Masa', evaluation.total.mass, evaluation.capacity.mass, 'kg'],
              ['Potencia', evaluation.total.power, evaluation.capacity.power, 'W'],
              ['Datos', evaluation.total.data, evaluation.capacity.data, 'GB/día'],
              ['Presupuesto', evaluation.total.cost, evaluation.capacity.budget, 'M USD'],
              ['Duración', evaluation.durationDays, evaluation.serviceLife, 'días'],
            ].map(([label, value, max, unit]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  {value} / {max} {unit}
                </dd>
              </div>
            ))}
          </dl>
          {problems.length ? (
            <ul>
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p>
              {verified
                ? '✓ Esta configuración ya tiene su revisión registrada.'
                : 'El diseño cumple las reglas educativas. Registra la revisión para continuar.'}
            </p>
          )}
          <button
            className="primary-world"
            disabled={!present || !!problems.length || verified}
            onClick={() => {
              if (verifyMission())
                setMessage(
                  'Revisión registrada. Dirígete al puesto de autorización de lanzamiento.',
                )
            }}
          >
            {verified ? '✓ Revisión registrada' : 'Registrar revisión'}
          </button>
          <small>Capacidades y presupuesto hipotéticos, definidos para el juego.</small>
          <a
            href="https://www.nasa.gov/reference/4-0-system-design-processes/"
            target="_blank"
            rel="noreferrer"
          >
            Diseñar a partir de requisitos · NASA ↗
          </a>
        </>
      )}
      {sector === 'launch' && (
        <>
          <h3>04 · Preparar y autorizar</h3>
          <p>
            ODYSSEY está preparada. Acércate al ascensor, sube a la pasarela y entra a la cabina.
            TARS te acompañará hasta que autorices el despegue.
          </p>
          <button
            className="primary-world"
            disabled={!present || !verified}
            onClick={() => onCampaign('launch')}
          >
            {savedFlight
              ? savedFlight.ops.status === 'running'
                ? 'Continuar operación guardada →'
                : 'Abrir informe del vuelo →'
              : 'Acceder a la pasarela de embarque →'}
          </button>
          {!verified && (
            <p>Necesitas un objetivo aceptado y una revisión vigente en comunicaciones.</p>
          )}
        </>
      )}
      {sector === 'observatory' && (
        <>
          <h3>05 · Aprender del resultado</h3>
          {mission.result ? (
            <>
              <p>
                {mission.result.status === 'completed'
                  ? 'Operaciones completadas'
                  : 'La simulación terminó con un fallo'}{' '}
                · {mission.result.score} puntos · {mission.result.delivered} GB recuperados.
              </p>
              <ol>
                {mission.result.history.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ol>
              <ul>
                {(mission.result.lessons ?? []).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <button
                className="secondary-world"
                disabled={!present}
                onClick={() => {
                  resetCampusMission()
                  setMessage(
                    'Nueva misión. Regresa al laboratorio para elegir el siguiente encargo.',
                  )
                }}
              >
                Preparar otra misión
              </button>
            </>
          ) : (
            <p>
              Este cuaderno guardará el resultado cuando completes las decisiones de operaciones.
              Por ahora, continúa con tu siguiente estación.
            </p>
          )}
        </>
      )}
      {message && (
        <p role="status" className="station-notice">
          {message}
        </p>
      )}
    </section>
  )
}
