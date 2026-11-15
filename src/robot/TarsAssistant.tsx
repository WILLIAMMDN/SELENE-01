import { requestTarsAction } from './tarsAnimations'
import { missionGuidance } from '../game/missionGuidance'
import MissionChecklist from '../ui/campaign/MissionChecklist'
import { useBlueprint } from '../game/state/blueprintStore'
import { useCampusMission, nextMissionStep, OBJECTIVES } from '../game/campusMission'
import { useEffect, useState, type FormEvent } from 'react'
import { NASA_FACTS, findFact } from './nasaKnowledge'
import { mediaSearchUrl } from './nasaMedia'
import { useWorld } from '../world/worldConfig'
import type { PositionReport } from '../world/ExplorerScene'
import type { CrewId } from './TarsCompanion'

type Note = { question: string; answer: string; url?: string; source?: string }
type CrewSession = { question: string; note: Note | null; history: Note[] }
const fresh = (): CrewSession => ({ question: '', note: null, history: [] })
export default function TarsAssistant({
  position,
  onVisit,
}: {
  position: PositionReport
  onVisit: (id: 'research' | 'hangar' | 'control' | 'launch' | 'observatory') => void
}) {
  const { config, parts } = useBlueprint()
  const mission = useCampusMission(),
    next = nextMissionStep()
  const guidance = missionGuidance(mission, config, parts)
  const world = useWorld(),
    [crew, setCrew] = useState<CrewId>('crew-1')
  const [sessions, setSessions] = useState<Record<CrewId, CrewSession>>(() => {
    const initial = { 'crew-1': fresh(), 'crew-2': fresh(), 'crew-3': fresh(), 'crew-4': fresh() }
    try {
      const saved = JSON.parse(sessionStorage.getItem('selene-tars-notebooks-v1') ?? 'null')
      if (saved)
        for (const id of Object.keys(initial) as CrewId[]) {
          const entry = saved[id]
          if (entry && typeof entry.question === 'string' && Array.isArray(entry.history))
            initial[id] = entry
        }
    } catch {
      /* Use empty notebooks when storage is unavailable. */
    }
    return initial
  })
  useEffect(() => {
    try {
      sessionStorage.setItem('selene-tars-notebooks-v1', JSON.stringify(sessions))
    } catch {
      /* The notebooks remain usable in memory. */
    }
  }, [sessions])
  const current = sessions[crew],
    nearest = world.sectors
      .map((s) => ({
        sector: s,
        distance: Math.hypot(position.x - s.entry[0], position.z - s.entry[1]),
      }))
      .sort((a, b) => a.distance - b.distance)[0]
  const ask = (question: string) => {
    const fact = findFact(question)
    const note: Note = fact
      ? { question, answer: fact.answer, url: fact.url, source: fact.source }
      : {
          question,
          answer:
            'No tengo una ficha documentada para esa pregunta. Puedes consultar NASA Science o revisar los datos de la misión; no voy a inventar una respuesta.',
          url: 'https://science.nasa.gov/',
          source: 'NASA Science',
        }
    setSessions((all) => ({
      ...all,
      [crew]: { question, note, history: [note, ...all[crew].history].slice(0, 8) },
    }))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (current.question.trim()) ask(current.question.trim())
  }
  return (
    <div className="tars-help">
      <span className="chapter-kicker">TARS / COMPAÑERO CIENTÍFICO</span>
      <h2 id="dialog-title">Exploremos con datos.</h2>
      <div className="crew-tabs" aria-label="Cuadernos de práctica">
        {([1, 2, 3, 4] as const).map((n) => (
          <button key={n} aria-pressed={crew === `crew-${n}`} onClick={() => setCrew(`crew-${n}`)}>
            Cuaderno {n}
          </button>
        ))}
      </div>
      <p className="tars-status">
        Cuadernos locales independientes. El juego actual tiene un avatar; estos puestos no son una
        sesión multijugador conectada.
      </p>
      <div className="tars-location">
        <strong>
          {world.name} · {world.place}
        </strong>
        <span>
          Destino más cercano: {nearest.sector.name} · {Math.round(nearest.distance)} m
        </span>
        <button className="text-button" onClick={() => onVisit(nearest.sector.id)}>
          Acompáñame a la entrada →
        </button>
      </div>
      {world.id === 'earth' && (
        <div className="tars-location">
          <strong>Tu siguiente paso · {next.number}</strong>
          <span>{next.title}</span>
          <p>
            {OBJECTIVES.find((o) => o.id === mission.objective)?.requirement ??
              'Entra al laboratorio y elige una pregunta científica antes de construir.'}
          </p>
          <p>{guidance.explanation}</p>
          <MissionChecklist requirements={guidance.requirements} />
          <button className="text-button" onClick={() => onVisit(next.sector)}>
            Llévame a la entrada de esta estación →
          </button>
        </div>
      )}
      <details>
        <summary>Movimientos de tu compañero</summary>
        <div className="tars-topics">
          <button onClick={() => requestTarsAction('jump')}>Saltar</button>
          <button onClick={() => requestTarsAction('action')}>Movimiento adicional</button>
        </div>
      </details>
      <form onSubmit={submit}>
        <label htmlFor="tars-question">¿Qué quieres saber?</label>
        <div className="tars-input">
          <input
            id="tars-question"
            value={current.question}
            maxLength={240}
            placeholder="Pregunta sobre la Luna o Marte"
            onChange={(e) =>
              setSessions((all) => ({ ...all, [crew]: { ...all[crew], question: e.target.value } }))
            }
          />
          <button className="primary-world" type="submit">
            Preguntar
          </button>
        </div>
      </form>
      <div className="tars-topics">
        {NASA_FACTS.filter((f) =>
          world.id === 'mars' ? f.id.startsWith('mars') : !f.id.startsWith('mars'),
        )
          .slice(0, 4)
          .map((f) => (
            <button key={f.id} onClick={() => ask(f.question)}>
              {f.question}
            </button>
          ))}
      </div>
      {current.note && (
        <div className="tars-answer" role="status">
          <strong>{current.note.question}</strong>
          <p>{current.note.answer}</p>
          {current.note.url && (
            <a href={current.note.url} target="_blank" rel="noopener noreferrer">
              {current.note.source} ↗
            </a>
          )}
        </div>
      )}
      <p className="tars-status">
        Respuestas de fichas documentadas, no de una IA conectada. Las distancias provienen del
        mundo del juego; sus escenarios son ficticios.
      </p>
      <a
        className="text-button"
        href={mediaSearchUrl(world.id === 'mars' ? 'Mars surface' : 'Moon south pole')}
        target="_blank"
        rel="noopener noreferrer"
      >
        Consultar imágenes en NASA Images ↗
      </a>
      {current.history.length > 1 && (
        <details>
          <summary>Historial de este cuaderno · {current.history.length} consultas</summary>
          {current.history.map((n, i) => (
            <button
              className="tars-history"
              key={i}
              onClick={() =>
                setSessions((all) => ({
                  ...all,
                  [crew]: { ...all[crew], note: n, question: n.question },
                }))
              }
            >
              {n.question}
            </button>
          ))}
        </details>
      )}
    </div>
  )
}
