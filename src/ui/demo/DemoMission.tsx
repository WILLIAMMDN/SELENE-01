import { useEffect, useState } from 'react'
import GameWorld from '../../scene/GameWorld'
import { LUNAR_RESOURCES } from '../../world/lunar/lunarResources'
import {
  DEMO_CONFIG,
  DEMO_EVALUATION,
  DEMO_OPERATIONS,
  DEMO_PARTS,
  DEMO_SCORE,
} from './demoSequence'
import './demoMission.css'

const BEATS = [
  { stage: '01 · Historia', title: 'La pregunta', mode: 'workshop' },
  { stage: '02 · Ingeniería', title: 'Un diseño viable', mode: 'workshop' },
  { stage: '03 · Lanzamiento', title: 'Revisión y vuelo', mode: 'launch' },
  { stage: '04 · Operaciones', title: 'Primera observación', mode: 'orbit' },
  { stage: '04 · Operaciones', title: 'Enlace con la Tierra', mode: 'orbit' },
  { stage: '04 · Operaciones', title: 'Eclipse polar', mode: 'orbit' },
  { stage: '05 · Informe', title: 'Lo que realmente sabemos', mode: 'orbit' },
  { stage: '06 · Luna', title: 'Trabajo de superficie', mode: 'field' },
  { stage: '07 · Marte', title: 'Reconocimiento marciano', mode: 'field' },
  { stage: '08 · Cierre', title: 'Tres ejercicios, tres límites', mode: 'field' },
] as const

export default function DemoMission() {
  const [beat, setBeat] = useState(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('beat') ?? 0)
    return Number.isInteger(requested) && requested >= 0 && requested < BEATS.length ? requested : 0
  })
  const [playing, setPlaying] = useState(true)
  const [fast, setFast] = useState(true)
  useEffect(() => {
    if (!playing || beat === BEATS.length - 1) return
    const timer = window.setTimeout(() => setBeat((current) => current + 1), fast ? 2200 : 4200)
    return () => window.clearTimeout(timer)
  }, [beat, fast, playing])
  const current = BEATS[beat]
  const operation = DEMO_OPERATIONS[Math.max(0, Math.min(3, beat - 2))]

  return (
    <div className="demo-mission">
      <header className="demo-header">
        <a href="/" className="demo-logo">
          ◐ <strong>SELENE—01</strong>
        </a>
        <span>DEMOSTRACIÓN RÁPIDA · RECORRIDO INDEPENDIENTE</span>
        <a href="/" className="demo-exit">
          Volver al juego ↗
        </a>
      </header>
      <div className="demo-toolbar">
        <div>
          <small>RECORRIDO</small>
          <strong>{current.stage}</strong>
        </div>
        <progress value={beat + 1} max={BEATS.length} aria-label="Progreso de la demostración" />
        <div className="demo-actions">
          <button type="button" onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Pausar' : 'Continuar'}
          </button>
          <button type="button" onClick={() => setFast((value) => !value)}>
            {fast ? 'Velocidad 2×' : 'Velocidad 1×'}
          </button>
          <button
            type="button"
            onClick={() => {
              setBeat(0)
              setPlaying(true)
            }}
          >
            Repetir
          </button>
        </div>
      </div>
      <main className="demo-grid">
        <section className="demo-scene" aria-label="Vista de ODYSSEY">
          {current.mode === 'field' ? (
            <div className="demo-field-plate">
              <span className="demo-plate-kicker">
                {beat === 7
                  ? 'LUNA / CUADERNO DE CAMPO'
                  : beat === 8
                    ? 'MARTE / PLAN DE OBSERVACIÓN'
                    : 'SELENE—01 / RESUMEN'}
              </span>
              <h2>
                {beat === 7
                  ? 'Superficie lunar'
                  : beat === 8
                    ? 'Ares, Marte'
                    : 'Recorrido completo'}
              </h2>
              {beat === 7 ? (
                <>
                  <p>
                    Secuencia abreviada del ejercicio de campo. Seis muestras ficticias, cada una
                    con herramienta y registro propios.
                  </p>
                  <div className="demo-plate-list">
                    {LUNAR_RESOURCES.map((resource) => (
                      <div key={resource.id}>
                        <b>{resource.number}</b>
                        <span>{resource.name}</span>
                        <small>{resource.tool}</small>
                      </div>
                    ))}
                  </div>
                  <div className="demo-plate-foot">
                    ENERGÍA → TRAVESÍA → ANÁLISIS → TELEMETRÍA → RETORNO
                  </div>
                </>
              ) : beat === 8 ? (
                <>
                  <p>Pregunta elegida: ¿qué minerales podrían registrar agua antigua?</p>
                  <div className="demo-instrument-pair">
                    <span>Pregunta científica</span>
                    <strong>Minerales</strong>
                    <span>Instrumento de referencia</span>
                    <strong>CRISM · espectros</strong>
                  </div>
                  <div className="demo-plate-foot">
                    TIERRA → OBSERVACIÓN ORBITAL → INTERPRETACIÓN
                  </div>
                </>
              ) : (
                <div className="demo-summary-list">
                  <span>
                    01 <b>ODYSSEY</b> Datos recuperados
                  </span>
                  <span>
                    02 <b>LUNA</b> Ruta de campo explicada
                  </span>
                  <span>
                    03 <b>MARTE</b> Instrumento relacionado con la pregunta
                  </span>
                </div>
              )}
            </div>
          ) : (
            <GameWorld
              mode={current.mode}
              onInteract={() => {}}
              parts={DEMO_PARTS}
              config={DEMO_CONFIG}
            />
          )}
          <div className="demo-scene-caption">
            Recorrido educativo abreviado. No modifica la partida ni representa una misión real.
          </div>
        </section>
        <section className="demo-story" aria-live="polite">
          <span className="demo-kicker">
            {current.stage} / {String(beat + 1).padStart(2, '0')} DE {BEATS.length}
          </span>
          <h1>{current.title}</h1>
          {beat === 0 && (
            <>
              <p>
                Desde la Tierra elegimos una pregunta: ¿qué señales de radar merecen estudio
                adicional en los cráteres polares de la Luna?
              </p>
              <p>
                Mini-RF, a bordo de Lunar Reconnaissance Orbiter, inspira el tipo de observación.
                Una señal aislada no confirma hielo.
              </p>
              <a
                href="https://science.nasa.gov/mission/lro/mini-rf/"
                target="_blank"
                rel="noreferrer"
              >
                Fuente: Mini-RF · NASA ↗
              </a>
            </>
          )}
          {beat === 1 && (
            <>
              <p>
                Montamos los sistemas obligatorios, radar y paneles solares. La órbita polar baja y
                el lanzador ficticio AURORA-S dejan márgenes dentro de las reglas educativas.
              </p>
              <div className="demo-readouts">
                <span>
                  Masa{' '}
                  <b>
                    {DEMO_EVALUATION.total.mass} / {DEMO_EVALUATION.capacity.mass} kg
                  </b>
                </span>
                <span>
                  Potencia{' '}
                  <b>
                    {DEMO_EVALUATION.total.power} / {DEMO_EVALUATION.capacity.power} W
                  </b>
                </span>
                <span>
                  Datos{' '}
                  <b>
                    {DEMO_EVALUATION.total.data} / {DEMO_EVALUATION.capacity.data} GB/día
                  </b>
                </span>
                <span>
                  Costo{' '}
                  <b>
                    {DEMO_EVALUATION.total.cost} / {DEMO_EVALUATION.capacity.budget} M USD
                  </b>
                </span>
              </div>
            </>
          )}
          {beat === 2 && (
            <>
              <p>
                La revisión compara el objetivo con masa, potencia, enlace y presupuesto. En esta
                demostración el diseño cumple las restricciones del juego y el lanzamiento se resume
                para avanzar rápido.
              </p>
              <p className="demo-caution">
                No es una certificación de vuelo ni un cálculo de trayectoria real.
              </p>
            </>
          )}
          {beat >= 3 && beat <= 5 && (
            <>
              <p>
                {beat === 3
                  ? 'ODYSSEY observa y guarda datos. Aumenta el valor científico, pero consume energía.'
                  : beat === 4
                    ? 'Se abre una ventana de comunicación. Enviamos a la Tierra los datos guardados antes de ocupar toda la memoria.'
                    : 'Durante el eclipse activamos el modo seguro. Protegemos la reserva y suspendemos nuevas observaciones.'}
              </p>
              <div className="demo-readouts">
                <span>
                  Batería <b>{operation.battery}%</b>
                </span>
                <span>
                  Enviados <b>{operation.delivered} GB</b>
                </span>
                <span>
                  Almacenados <b>{operation.stored} GB</b>
                </span>
                <span>
                  Hitos <b>{operation.step} / 3</b>
                </span>
              </div>
              <p className="demo-caution">
                Los días, la energía y los GB son parámetros simplificados del juego.
              </p>
            </>
          )}
          {beat === 6 && (
            <>
              <p>
                La campaña simulada terminó con {DEMO_OPERATIONS[3].delivered} GB enviados y una
                puntuación educativa de <strong>{DEMO_SCORE}/100</strong>. El resultado documenta
                decisiones de observación y transmisión.
              </p>
              <p>
                Ni el radar del juego ni este informe demuestran que exista un depósito de hielo
                real en un lugar concreto.
              </p>
              <a
                href="https://science.nasa.gov/moon/moon-water-and-ices/"
                target="_blank"
                rel="noreferrer"
              >
                Contexto: agua y hielos lunares · NASA ↗
              </a>
            </>
          )}
          {beat === 7 && (
            <>
              <p>
                En el escenario lunar independiente, una ruta válida despliega energía, recorre el
                área de trabajo, registra las seis muestras del juego, analiza el hielo simulado y
                envía el resultado antes de preparar el retorno de la roca.
              </p>
              <p className="demo-caution">
                La ruta es una demostración condensada. La presencia de hielo en esta escena
                ficticia no identifica un depósito lunar real.
              </p>
              <a
                href="https://science.nasa.gov/moon/moon-water-and-ices/"
                target="_blank"
                rel="noreferrer"
              >
                Referencia: agua y hielos lunares · NASA ↗
              </a>
            </>
          )}
          {beat === 8 && (
            <>
              <p>
                El ejercicio marciano empieza de nuevo en la Tierra. Para estudiar minerales
                asociados con agua antigua, escogemos datos históricos de CRISM, instrumento de Mars
                Reconnaissance Orbiter retirado en 2022.
              </p>
              <p>
                En Ares se plantea un estudio; este recorrido no presenta espectros reales del lugar
                ni confirma minerales en el terreno ficticio.
              </p>
              <a
                href="https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/"
                target="_blank"
                rel="noreferrer"
              >
                Instrumentos de MRO · NASA ↗
              </a>
            </>
          )}
          {beat === 9 && (
            <>
              <p>
                Has visto el cierre de la campaña orbital y el camino de los dos ejercicios
                independientes. La demo resume decisiones y resultados en unos 20 segundos.
              </p>
              <div className="demo-followups">
                <strong>Jugar cada escenario completo</strong>
                <a href="/?stage=briefing">Campaña ODYSSEY ↗</a>
                <a href="/?world=moon">Superficie lunar ↗</a>
                <a href="/?world=mars">Reconocimiento marciano ↗</a>
              </div>
            </>
          )}
          <div className="demo-note">
            Esta reproducción usa las reglas de SELENE y no modifica tu partida guardada.
          </div>
        </section>
      </main>
      <nav className="demo-timeline" aria-label="Momentos de la demostración">
        {BEATS.map((item, index) => (
          <button
            type="button"
            key={`${item.stage}-${index}`}
            aria-current={beat === index ? 'step' : undefined}
            onClick={() => {
              setBeat(index)
              setPlaying(false)
            }}
            title={item.title}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.title}
          </button>
        ))}
      </nav>
    </div>
  )
}
