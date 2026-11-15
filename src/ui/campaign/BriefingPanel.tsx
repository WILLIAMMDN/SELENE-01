import type { MissionController } from '../../game/hooks/useMissionController'
export default function BriefingPanel({ controller }: { controller: MissionController }) {
  const { go } = controller
  return (
    <>
      <span className="eyebrow">CUADERNO DE MISIÓN / 01 · ENCARGO</span>
      <h1>
        Primero, una pregunta.
        <br />
        <em>Después, la nave.</em>
      </h1>
      <p>
        La Dra. Vega dirige una misión de entrenamiento en el centro ficticio SELENE. Diseñarás
        ODYSSEY, un orbitador no tripulado para estudiar el polo sur lunar. Antes de escoger piezas,
        define qué necesitas observar y qué datos tendrás que devolver a la Tierra.
      </p>
      <p className="simulation-note">
        El reto Space Mission Design Game de NASA Space Apps invita a diseñar, gestionar y simular
        una misión completa, tomando decisiones de ingeniería con recursos limitados y examinando
        sus consecuencias. Esta es la versión educativa de SELENE de ese desafío.{' '}
        <a
          href="https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Leer el reto ↗
        </a>
      </p>
      <div className="evidence-card">
        <span className="evidence-label">BASE CIENTÍFICA · NASA</span>
        <p>
          La misión Lunar Reconnaissance Orbiter (LRO) usa distintos instrumentos para estudiar el
          terreno, la iluminación y las regiones polares. NASA explica que el diseño de una misión
          parte de objetivos, requisitos y decisiones entre alternativas.
        </p>
        <a
          href="https://science.nasa.gov/mission/lro/spacecraft-and-instruments/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instrumentos de LRO ↗
        </a>
        <a
          href="https://www.nasa.gov/reference/4-0-system-design-processes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Diseño de sistemas NASA ↗
        </a>
      </div>
      <h2>Tu recorrido</h2>
      <div className="story-steps">
        <p>
          <b>01</b> Elige la pregunta científica en el laboratorio.
        </p>
        <p>
          <b>02</b> Diseña la nave y compara masa, potencia, datos y costo.
        </p>
        <p>
          <b>03</b> Revisa órbita, lanzador y comunicaciones antes del vuelo.
        </p>
        <p>
          <b>04</b> Opera la misión, recupera datos y explica el resultado.
        </p>
      </div>
      <p className="simulation-note">
        Los hechos sobre la Luna tienen fuentes NASA. ODYSSEY, sus costos y sus capacidades son
        supuestos educativos del juego.
      </p>
      <button className="action-primary" onClick={() => go('design')}>
        Abrir el diseño de la misión →
      </button>
    </>
  )
}
