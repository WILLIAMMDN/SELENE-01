import { useState } from 'react'
import LunarBase from './scene/LunarBase'
import { EVENTS, LAST_SOL, RESOURCE_NAMES, type Resource } from './game/simulation'
import { useMissionStore } from './store/useMissionStore'

const ICONS: Record<Resource, string> = {
  energy: '⚡', oxygen: '◉', water: '◈', food: '✦', hull: '⬡',
}

function ResourceCard({ name, value, resource }: { name: string; value: number; resource: Resource }) {
  const level = value <= 20 ? 'danger' : value <= 40 ? 'warn' : 'good'
  return (
    <div className="resource-card">
      <div className="resource-top">
        <span className="resource-symbol" aria-hidden="true">{ICONS[resource]}</span>
        <span>{name}</span>
        <strong>{value}%</strong>
      </div>
      <div className="meter" role="progressbar" aria-label={name} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`meter-fill ${level}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function App() {
  const [showLog, setShowLog] = useState(false)
  const { sol, resources, selectedChoice, status, history, decide, advance, restart } = useMissionStore()
  const event = EVENTS[Math.min(sol, LAST_SOL) - 1]
  const choice = event.choices.find((option) => option.id === selectedChoice)

  return (
    <main className="shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">◐</div>
          <div><div className="brand-name">SELENE<span>—01</span></div><div className="brand-sub">JUNIOR MISSION TRAINER</div></div>
        </div>
        <div className="header-right">
          <span className="signal"><span className="pulse-dot" /> ENLACE ESTABLE</span>
          <span className="mission-chip">MISIÓN LUNAR · SIMULACIÓN</span>
        </div>
      </header>

      <section className="dashboard">
        <aside className="story-panel">
          <div className="eyebrow">CENTRO DE CONTROL / EXPEDICIÓN 01</div>
          <h1>Tu misión.<br /><em>Tu decisión.</em></h1>
          <p className="intro">Comanda una base en la Luna. Cada elección afecta los recursos que mantienen con vida a tu tripulación.</p>

          <div className="sol-header">
            <div><span className="field-label">PROGRESO DE MISIÓN</span><strong>SOL {String(sol).padStart(2, '0')} <small>/ {String(LAST_SOL).padStart(2, '0')}</small></strong></div>
            <span className="sol-progress">{Math.round(((sol - 1) / LAST_SOL) * 100)}%</span>
          </div>
          <div className="timeline" aria-label="Progreso de la misión">
            {Array.from({ length: LAST_SOL }, (_, index) => (
              <div key={index} className={`timeline-dot ${index + 1 < sol ? 'done' : index + 1 === sol ? 'current' : ''}`} />
            ))}
          </div>

          {status === 'active' ? (
            <div className="mission-event">
              <div className="event-kicker">{event.kicker}</div>
              <h2>{event.title}</h2>
              <p>{event.narrative}</p>
              <div className="learning-note"><span>◎</span><div><strong>APRENDE CON LA MISIÓN</strong><p>{event.learning}</p></div></div>
            </div>
          ) : (
            <div className="result-card" role="status">
              <div className="event-kicker">{status === 'won' ? 'MISIÓN COMPLETADA' : 'MISIÓN INTERRUMPIDA'}</div>
              <h2>{status === 'won' ? '¡Tripulación a salvo!' : 'La base necesita ayuda'}</h2>
              <p>{status === 'won' ? 'Lograste sostener los cinco soles de entrenamiento. Has equilibrado recursos y respondido a imprevistos.' : 'Un recurso esencial se agotó. Analiza las decisiones y vuelve a intentarlo.'}</p>
              <button className="primary-btn" onClick={restart}>Volver a entrenar ↻</button>
            </div>
          )}
          <button className="log-button" onClick={() => setShowLog((current) => !current)} aria-expanded={showLog}>
            <span>▤ Historial de decisiones</span><span>{showLog ? '−' : '+'}</span>
          </button>
          {showLog && <div className="log-list">{history.length ? history.map((line, index) => <p key={index}>{line}</p>) : <p>Todavía no hay decisiones registradas.</p>}</div>}
        </aside>

        <section className="world-panel">
          <LunarBase />
          <div className="world-heading"><span className="eyebrow">VISTA DE LA BASE · EXPLORACIÓN 3D</span><strong>Estación Artemisa</strong></div>
        </section>

        <aside className="status-panel">
          <div className="panel-title"><span className="eyebrow">TELEMETRÍA SIMULADA</span><h2>Estado de la base</h2><p>Indicadores educativos, escala 0–100.</p></div>
          <div className="resources">
            {(Object.keys(RESOURCE_NAMES) as Resource[]).map((key) => <ResourceCard key={key} name={RESOURCE_NAMES[key]} value={resources[key]} resource={key} />)}
          </div>
          <div className="status-footer"><span className="pulse-dot" /><span>5 SISTEMAS MONITOREADOS</span><strong>{status === 'active' ? 'ACTIVO' : status === 'won' ? 'COMPLETA' : 'CRÍTICO'}</strong></div>
        </aside>
      </section>

      {status === 'active' && (
        <section className="decision-area">
          <div className="decision-heading"><div><span className="eyebrow">PUESTO DE MANDO</span><h2>{selectedChoice ? 'Decisión registrada' : '¿Qué orden darás?'}</h2></div><span className="decision-count">ELIGE 1 DE 3 ACCIONES</span></div>
          <div className="choices">
            {event.choices.map((option, index) => (
              <button key={option.id} disabled={selectedChoice !== null} onClick={() => decide(option.id)} className={`choice-card ${selectedChoice === option.id ? 'selected' : ''}`}>
                <span className="choice-num">0{index + 1}</span>
                <strong>{option.title}</strong>
                <span className="choice-desc">{option.description}</span>
                <span className="choice-impacts">{(Object.entries(option.impact) as [Resource, number][]).map(([name, delta]) => <span key={name} className={delta >= 0 ? 'positive' : 'negative'}>{delta > 0 ? '+' : ''}{delta} {RESOURCE_NAMES[name].toLowerCase()}</span>)}</span>
              </button>
            ))}
          </div>
          {selectedChoice && <div className="choice-confirmation" role="status"><p><strong>Decisión: {choice?.title}.</strong> {choice?.explanation}</p><button className="primary-btn" onClick={advance}>{sol === LAST_SOL ? 'Finalizar misión' : 'Avanzar al siguiente sol'} →</button></div>}
        </section>
      )}
      <footer className="footer"><span>SELENE-01 · PROTOTIPO EDUCATIVO · V0.1</span><span>Proyecto independiente · No afiliado a NASA</span></footer>
    </main>
  )
}
