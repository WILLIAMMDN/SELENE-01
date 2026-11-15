import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'terrain',
    title: '¿Qué formas del terreno conviene cartografiar?',
    instrument: 'hirise',
    reason: 'HiRISE obtiene imágenes de alta resolución para estudiar rasgos de la superficie.',
  },
  {
    id: 'minerals',
    title: '¿Qué minerales podrían registrar agua antigua?',
    instrument: 'crism',
    reason: 'CRISM estudia la composición mineral mediante espectros.',
  },
  {
    id: 'layers',
    title: '¿Qué estructura podría existir bajo la superficie?',
    instrument: 'sharad',
    reason: 'SHARAD examina capas del subsuelo mediante radar.',
  },
] as const

const INSTRUMENTS = [
  { id: 'hirise', title: 'HiRISE · imágenes' },
  { id: 'crism', title: 'CRISM · espectros' },
  { id: 'sharad', title: 'SHARAD · radar' },
] as const

export default function MarsFieldJournal() {
  const [question, setQuestion] = useState<(typeof QUESTIONS)[number]['id']>('terrain')
  const [instrument, setInstrument] = useState<(typeof INSTRUMENTS)[number]['id'] | ''>('')
  const selected = QUESTIONS.find((item) => item.id === question)!
  const matched = instrument === selected.instrument

  return (
    <div className="mars-field-journal">
      <span className="paper-kicker">CUADERNO DE CAMPO / ARES</span>
      <h2 id="dialog-title">Reconocimiento marciano.</h2>
      <p>
        Este es un ejercicio independiente de la campaña lunar. Desde la Tierra defines una pregunta
        y eliges qué tipo de observación orbital pedirías; en Ares exploras un paisaje ficticio para
        formular el siguiente estudio. No se muestran datos reales del sitio ni una misión tripulada
        de NASA.
      </p>
      <div className="lunar-science-brief" aria-label="Secuencia de reconocimiento">
        <div>
          <span>01 · TIERRA</span>
          <strong>Elige la pregunta científica.</strong>
        </div>
        <div>
          <span>02 · ÓRBITA</span>
          <strong>Escoge un instrumento de referencia.</strong>
        </div>
        <div>
          <span>03 · ARES</span>
          <strong>Observa el terreno y limita tu conclusión.</strong>
        </div>
      </div>
      <fieldset>
        <legend>1. ¿Qué quieres investigar?</legend>
        {QUESTIONS.map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="mars-question"
              checked={question === item.id}
              onChange={() => {
                setQuestion(item.id)
                setInstrument('')
              }}
            />
            {item.title}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>2. ¿Qué instrumento pedirías?</legend>
        {INSTRUMENTS.map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="mars-instrument"
              checked={instrument === item.id}
              onChange={() => setInstrument(item.id)}
            />
            {item.title}
          </label>
        ))}
      </fieldset>
      {instrument && (
        <div className="mars-study-result" role="status">
          <strong>
            {matched
              ? 'Observación adecuada para la pregunta'
              : 'Revisa la relación entre pregunta e instrumento'}
          </strong>
          <p>{selected.reason}</p>
          <p>
            Una imagen, un espectro o una señal de radar requiere interpretación y, en muchos casos,
            observaciones complementarias. Este ejercicio no confirma agua ni minerales en Ares.
          </p>
        </div>
      )}
      <div className="lunar-source-note">
        <strong>Base científica.</strong> Mars Reconnaissance Orbiter estudia la superficie,
        minerales y subsuelo marcianos con instrumentos distintos.{' '}
        <a
          href="https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/"
          target="_blank"
          rel="noreferrer"
        >
          Instrumentos de MRO · NASA ↗
        </a>{' '}
        <a
          href="https://science.nasa.gov/mission/mars-reconnaissance-orbiter/"
          target="_blank"
          rel="noreferrer"
        >
          Misión MRO · NASA ↗
        </a>
      </div>
    </div>
  )
}
