import type { MissionController } from '../../game/hooks/useMissionController'
import { MODULES, COMPLETE_ASSEMBLY } from '../../spacecraft/assembly'
import {
  INSTRUMENTS,
  ORBITS,
  LAUNCHERS,
  MISSION_DURATIONS,
  type DesignConfig,
} from '../../game/missionDesign'
export default function DesignPanel({ controller }: { controller: MissionController }) {
  const {
    assembly,
    guidance,
    exploded,
    setExploded,
    config,
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
        <ol className="design-route" aria-label="Pasos de diseño">
          <li>
            <span>01</span> Monta la nave
          </li>
          <li>
            <span>02</span> Elige instrumentos
          </li>
          <li>
            <span>03</span> Ajusta la misión
          </li>
        </ol>
      </div>
      {guidance.objective && (
        <div className="evidence-card">
          <span className="evidence-label">PREGUNTA ELEGIDA · {guidance.objective.name}</span>
          <p>
            <strong>{guidance.objective.question}</strong>
          </p>
          <p>{guidance.objective.nasaContext}</p>
          <p className="simulation-note">{guidance.objective.interpretation}</p>
          <p className="design-requirement">
            <strong>Necesitas:</strong> {guidance.objective.requirement}
          </p>
          <a href={guidance.objective.source} target="_blank" rel="noopener noreferrer">
            {guidance.objective.sourceLabel} ↗
          </a>
        </div>
      )}
      <div className="odyssey-assembly">
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
        <p className="small-note">
          Hábitat: +90 kg, +55 W, +14 M USD. Soportes: +12 kg, +2 M USD. Valores ficticios para
          aprender; los sistemas básicos están incluidos en el presupuesto base. No se simula
          soporte vital ni combustible real. El módulo habitable es una pieza opcional del modelo;
          instalarlo no convierte este encargo orbital en una misión tripulada.
        </p>
      </div>
      <section className="design-step" aria-labelledby="design-instruments-title">
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
              <input
                type="checkbox"
                checked={config.instruments.includes(item.id)}
                onChange={() => toggleInstrument(item.id)}
              />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.benefit} · {item.massKg} kg · {item.watts} W · {item.dataGb} GB/día
                </small>
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className="design-step" aria-labelledby="design-parameters-title">
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
          onChange={(e) => updateConfig({ durationDays: Number(e.target.value) as 30 | 90 | 180 })}
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
      <button
        className="action-primary"
        onClick={() => (campus ? onReturnToCampus?.() : go('launch'))}
      >
        {campus ? 'Guardar y volver al campus →' : 'Verificar para lanzamiento →'}
      </button>
    </>
  )
}
