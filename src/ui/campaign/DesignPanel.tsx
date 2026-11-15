import { useState } from 'react'
import type { MissionController } from '../../game/hooks/useMissionController'
import { MODULES, COMPLETE_ASSEMBLY } from '../../spacecraft/assembly'
import {
  INSTRUMENTS,
  ORBITS,
  LAUNCHERS,
  MISSION_DURATIONS,
  type DesignConfig,
  type InstrumentId,
} from '../../game/missionDesign'

function InstrumentGlyph({ id }: { id: InstrumentId }) {
  return (
    <span className="instrument-glyph" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {id === 'camera' ? (
          <>
            <path d="M4 8h16v12H4zM8 8l2-3h4l2 3" />
            <circle cx="12" cy="14" r="3" />
          </>
        ) : id === 'spectrometer' ? (
          <>
            <path d="M4 19h16M5 16l4-11 4 11 4-11 3 11" />
            <path d="M7 12h10" />
          </>
        ) : (
          <>
            <path d="M4 20V9M4 9h4M9 19c3-2 3-6 0-8M13 21c5-4 5-10 0-14M17 22c6-5 6-13 0-18" />
          </>
        )}
      </svg>
    </span>
  )
}

export default function DesignPanel({ controller }: { controller: MissionController }) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
  const {
    assembly,
    guidance,
    exploded,
    setExploded,
    config,
    evaluation,
    toggleInstrument,
    assemble,
    updateConfig,
    campus,
    onReturnToCampus,
    go,
  } = controller
  return (
    <>
      <div className="design-intro">
        <span className="eyebrow">CUADERNO DE MISIÓN / 02 · DISEÑO</span>
        <h1>
          Diseña <em>ODYSSEY.</em>
        </h1>
        <p>
          Prepara un orbitador lunar no tripulado. Monta sus sistemas, elige instrumentos para tu
          pregunta y comprueba los recursos antes del lanzamiento.
        </p>
        <ol className="design-route" aria-label="Vistas de diseño">
          <li>
            <button type="button" aria-pressed={activeStep === 1} onClick={() => setActiveStep(1)}>
              <span>01</span> Monta la nave
            </button>
          </li>
          <li>
            <button type="button" aria-pressed={activeStep === 2} onClick={() => setActiveStep(2)}>
              <span>02</span> Elige instrumentos
            </button>
          </li>
          <li>
            <button type="button" aria-pressed={activeStep === 3} onClick={() => setActiveStep(3)}>
              <span>03</span> Ajusta la misión
            </button>
          </li>
        </ol>
      </div>
      <div className="design-metrics" aria-label="Recursos del diseño">
        {[
          {
            label: 'Masa',
            used: evaluation.total.mass,
            limit: evaluation.capacity.mass,
            unit: 'kg',
          },
          {
            label: 'Potencia',
            used: evaluation.total.power,
            limit: evaluation.capacity.power,
            unit: 'W',
          },
          {
            label: 'Datos',
            used: evaluation.total.data,
            limit: evaluation.capacity.data,
            unit: 'GB/día',
          },
          {
            label: 'Costo',
            used: evaluation.total.cost,
            limit: evaluation.capacity.budget,
            unit: 'M USD',
          },
        ].map((metric) => (
          <div className={metric.used > metric.limit ? 'is-over' : ''} key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.used} / {metric.limit} <small>{metric.unit}</small>
            </strong>
            <i aria-hidden="true">
              <b style={{ width: `${Math.min(100, (metric.used / metric.limit) * 100)}%` }} />
            </i>
          </div>
        ))}
      </div>
      {guidance.objective && (
        <section className="design-brief" aria-label="Encargo científico elegido">
          <span className="evidence-label">ENCARGO CIENTÍFICO · {guidance.objective.name}</span>
          <strong className="design-question">{guidance.objective.question}</strong>
          <p className="design-requirement">
            <strong>Para avanzar:</strong> {guidance.objective.requirement}
          </p>
          <details>
            <summary>Ver fundamento NASA y límites del juego</summary>
            <p>{guidance.objective.nasaContext}</p>
            <p className="simulation-note">{guidance.objective.interpretation}</p>
            <a href={guidance.objective.source} target="_blank" rel="noopener noreferrer">
              {guidance.objective.sourceLabel} ↗
            </a>
          </details>
        </section>
      )}
      {activeStep === 1 && (
        <div className="odyssey-assembly" id="design-assembly">
          <div className="assembly-heading">
            <div className="design-step-heading">
              <span>01</span>
              <h2>Ensamblaje de la nave</h2>
            </div>
            <span>
              {assembly.length} / {COMPLETE_ASSEMBLY.length} conjuntos
            </span>
          </div>
          <p className="small-note">
            Ensambla los sistemas de la nave. Elige depósitos grandes o pequeños; la antena se monta
            sobre el hábitat.
          </p>
          <div className="assembly-parts">
            {MODULES.map((part) => {
              const installed = assembly.includes(part.id)
              const blocked =
                (part.id !== 'fuselage' && !assembly.includes('fuselage')) ||
                (part.id !== 'fuselage' &&
                  part.id !== 'connectors' &&
                  !assembly.includes('connectors')) ||
                (part.id === 'antenna' && !assembly.includes('habitat'))
              return (
                <button
                  key={part.id}
                  type="button"
                  aria-pressed={installed}
                  disabled={blocked}
                  onClick={() => assemble(part.id)}
                >
                  <span className="assembly-check">{installed ? '✓' : '+'}</span>
                  <span>
                    <strong>
                      {part.name} <small>{part.required ? 'Necesario' : 'Opcional'}</small>
                    </strong>
                    <span>{part.description}</span>
                  </span>
                  <b>{installed ? 'Retirar' : 'Montar'}</b>
                </button>
              )
            })}
          </div>
          <label className="option-small">
            <input
              type="checkbox"
              checked={exploded}
              onChange={(e) => setExploded(e.target.checked)}
            />{' '}
            Separar las piezas para ver los acoplamientos
          </label>
          <details className="assembly-facts">
            <summary>Supuestos y límites de estas piezas</summary>
            <p className="small-note">
              Hábitat: +90 kg, +55 W, +14 M USD. Soportes: +12 kg, +2 M USD. Valores ficticios para
              aprender; los sistemas básicos están incluidos en el presupuesto base. No se simula
              soporte vital ni combustible real. El módulo habitable es una pieza opcional del
              modelo; instalarlo no convierte este encargo orbital en una misión tripulada.
            </p>
          </details>
        </div>
      )}
      {activeStep === 2 && (
        <section
          className="design-step"
          id="design-instruments"
          aria-labelledby="design-instruments-title"
        >
          <div className="design-step-heading">
            <span>02</span>
            <h2 id="design-instruments-title">Instrumentos científicos</h2>
          </div>
          <p className="small-note">
            Instrumentos simplificados de ODYSSEY. Las cifras siguientes son valores del juego, no
            especificaciones de los instrumentos NASA citados.
          </p>
          <div className="select-list">
            {INSTRUMENTS.map((item) => (
              <label className="select-card" key={item.id}>
                <InstrumentGlyph id={item.id} />
                <input
                  type="checkbox"
                  checked={config.instruments.includes(item.id)}
                  onChange={() => toggleInstrument(item.id)}
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.benefit}</small>
                  <span className="instrument-specs">
                    <b>{item.massKg} kg</b>
                    <b>{item.watts} W</b>
                    <b>{item.dataGb} GB/día</b>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}
      {activeStep === 3 && (
        <section
          className="design-step"
          id="design-parameters"
          aria-labelledby="design-parameters-title"
        >
          <div className="design-step-heading">
            <span>03</span>
            <h2 id="design-parameters-title">Perfil de la misión</h2>
          </div>
          <p className="small-note">
            Define la órbita, el lanzador y el tiempo de operación de este modelo educativo.
          </p>
          <h3>Órbita prevista</h3>
          <select
            value={config.orbit}
            onChange={(e) => updateConfig({ orbit: e.target.value as DesignConfig['orbit'] })}
            aria-label="Tipo de órbita"
          >
            {ORBITS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="field-help">{ORBITS.find((o) => o.id === config.orbit)?.description}</p>
          <p className="small-note">
            Estas opciones representan cobertura y enlace de forma cualitativa; no calculan
            trayectorias orbitales.
          </p>
          <h3>Vehículo de lanzamiento</h3>
          <select
            aria-label="Vehículo de lanzamiento"
            value={config.launcher}
            onChange={(e) => updateConfig({ launcher: e.target.value as DesignConfig['launcher'] })}
          >
            {LAUNCHERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} · {option.maxMass} kg
              </option>
            ))}
          </select>
          <h3>Duración de la misión</h3>
          <select
            aria-label="Duración de la misión"
            value={config.durationDays ?? 90}
            onChange={(e) =>
              updateConfig({ durationDays: Number(e.target.value) as 30 | 90 | 180 })
            }
          >
            {MISSION_DURATIONS.map((d) => (
              <option key={d.days} value={d.days}>
                {d.name} · operaciones +{d.cost} M USD
              </option>
            ))}
          </select>
          <p className="field-help">
            Una campaña larga amplía la oportunidad científica y consume más presupuesto y reservas.
            180 días requiere paneles adicionales. Parámetros educativos.
          </p>
          <h3>Mejoras de ingeniería</h3>
          <label className="option-small">
            <input
              type="checkbox"
              checked={config.solarUpgrade}
              disabled={!assembly.includes('connectors')}
              onChange={() => assemble('solar')}
            />{' '}
            Paneles solares adicionales (+170 W)
          </label>
          <label className="option-small">
            <input
              type="checkbox"
              checked={config.commUpgrade}
              disabled={!assembly.includes('habitat')}
              onChange={() => assemble('antenna')}
            />{' '}
            Antena mejorada (+14 GB/día)
          </label>
        </section>
      )}
      {activeStep < 3 && (
        <button
          className="action-primary design-next"
          type="button"
          onClick={() => setActiveStep(activeStep === 1 ? 2 : 3)}
        >
          {activeStep === 1 ? 'Elegir instrumentos →' : 'Ajustar perfil de misión →'}
        </button>
      )}
      {activeStep === 3 && (
        <button
          className="action-primary"
          onClick={() => (campus ? onReturnToCampus?.() : go('launch'))}
        >
          {campus ? 'Guardar y volver al campus →' : 'Verificar para lanzamiento →'}
        </button>
      )}
    </>
  )
}
