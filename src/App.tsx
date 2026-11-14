import { useCallback, useState } from 'react'
import GameWorld, { type Station } from './scene/GameWorld'
import Orbi from './robot/Orbi'
import {
  INSTRUMENTS, ORBITS, LAUNCHERS, INITIAL_DESIGN,
  evaluateDesign, OPERATION_EVENTS, startOperations, applyOperation,
  missionScore, type InstrumentId, type DesignConfig, type OperationChoice,
} from './game/missionDesign'
import './styles.css'

type Stage = 'briefing'|'design'|'launch'|'operations'|'report'
const STAGES:{id:Stage;label:string}[]=[
  {id:'briefing',label:'01 · Historia'},
  {id:'design',label:'02 · Ingeniería'},
  {id:'launch',label:'03 · Lanzamiento'},
  {id:'operations',label:'04 · Operaciones'},
  {id:'report',label:'05 · Informe'},
]
const TIPS:Record<Stage,string>={
  briefing:'Antes de construir, define qué quieres investigar y qué necesitarás medir.',
  design:'Una carga científica más compleja mejora el valor de la misión, pero requiere más masa, energía, dinero y transmisión.',
  launch:'Comprueba que el lanzador pueda transportar tu nave y que el presupuesto no se exceda.',
  operations:'Equilibra energía de reserva, memoria a bordo y ventanas de comunicación.',
  report:'El resultado es una oportunidad para ajustar el diseño, no solamente una calificación.',
}

export default function App() {
  const [stage,setStage]=useState<Stage>('briefing')
  const [config,setConfig]=useState<DesignConfig>(INITIAL_DESIGN)
  const [ops,setOps]=useState(startOperations)
  const [notification,setNotification]=useState('')
  const evaluation=evaluateDesign(config)
  const stageIndex=STAGES.findIndex(x=>x.id===stage)
  const operateReady=evaluation.ready
  const go=(value:Stage)=>{
    if(value==='operations' && !operateReady){setNotification('Corrige la configuración antes de iniciar operaciones.');setStage('design');return}
    if(value==='report' && ops.status==='running'){setNotification('Completa las tres decisiones de operaciones antes del informe.');return}
    setNotification('');setStage(value)
  }
  const interact=useCallback((station:Station)=>{
    if(station==='briefing'){setStage('briefing');setNotification('La Dra. Vega te espera con las instrucciones.')}
    if(station==='hangar'){setStage('design');setNotification('Has entrado al hangar de ingeniería.')}
    if(station==='launch'){setStage('launch');setNotification('Verifica la misión antes de lanzar.')}
    if(station==='control'){setStage('operations');setNotification('Has entrado al centro de control.')}
  },[])
  const toggleInstrument=(id:InstrumentId)=>{
    setConfig(previous=>({...previous,instruments:previous.instruments.includes(id)?previous.instruments.filter(x=>x!==id):[...previous.instruments,id]}))
  }
  const fly=()=>{
    if(!evaluation.ready){go('design');return}
    setOps(startOperations());setStage('operations');setNotification('¡Lanzamiento simulado! El orbitador está en la fase de operaciones.')
  }
  const operate=(choice:OperationChoice)=>{
    setOps(previous=>applyOperation(previous,choice,evaluation))
  }
  const restart=()=>{
    setConfig(INITIAL_DESIGN);setOps(startOperations());setStage('briefing');setNotification('')
  }
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-symbol">◐</span><span><strong>SELENE—01</strong><small>ARQUITECTOS DEL ESPACIO</small></span></div>
      <div className="topbar-note">Un juego sobre decisiones de ingeniería, no una misión real</div>
      <span className="topbar-status">PROTOTIPO EDUCATIVO · V0.2</span>
    </header>
    <nav className="stage-nav" aria-label="Etapas de la misión">
      {STAGES.map((item,index)=><button key={item.id} type="button" className={stage===item.id?'current':''} aria-current={stage===item.id?'step':undefined} onClick={()=>go(item.id)} disabled={(item.id==='report'&&ops.status==='running')||(item.id==='operations'&&!operateReady)}>{index<stageIndex?'✓ ':''}{item.label}</button>)}
    </nav>
    <main className="game-layout">
      <section className="world-column">
        <GameWorld mode={stage==='operations'||stage==='report'?'orbit':'campus'} onInteract={interact}/>
        <div className="exploration-story"><strong>La historia</strong><span>Has sido seleccionado para diseñar un orbitador científico del polo sur lunar. Conoce a la Dra. Vega y trabaja con ORBI para convertir una idea en una misión factible.</span></div>
      </section>
      <section className="campaign-panel" aria-live="polite">
        {notification&&<p className="notification" role="status">{notification}</p>}
        {stage==='briefing'&&<>
          <span className="eyebrow">CAPÍTULO 01 · LA CONVOCATORIA</span><h1>Una misión.<br/><em>Mil decisiones.</em></h1>
          <p>La Dra. Vega te invita al programa SELENE-01: estudiar el entorno del polo sur lunar. Tu objetivo es construir un orbitador capaz de recolectar y devolver información científica.</p>
          <blockquote>«No gana quien carga más instrumentos, sino quien construye un sistema que puede cumplir su objetivo». — Dra. Vega, personaje ficticio</blockquote>
          <h2>Tu desafío</h2>
          <div className="story-steps"><p>① Define qué instrumentos necesitas.</p><p>② Equilibra masa, energía, datos y presupuesto.</p><p>③ Elige órbita y lanzador.</p><p>④ Simula el vuelo, responde a imprevistos y mejora.</p></div>
          <a className="source-link" href="https://science.nasa.gov/moon/moon-water-and-ices/" rel="noopener noreferrer" target="_blank">¿Por qué explorar el polo lunar? · Fuente NASA ↗</a>
          <button className="action-primary" onClick={()=>go('design')}>Ir al laboratorio de ingeniería →</button>
        </>}
        {stage==='design'&&<>
          <span className="eyebrow">CAPÍTULO 02 · EL HANGAR</span><h1>Diseña tu <em>orbitador.</em></h1>
          <p>Selecciona instrumentos, lanzador y órbita. ORBI te recordará los compromisos de cada decisión.</p>
          <h2>Instrumentos científicos</h2>
          <div className="select-list">{INSTRUMENTS.map(item=><label className="select-card" key={item.id}><input type="checkbox" checked={config.instruments.includes(item.id)} onChange={()=>toggleInstrument(item.id)}/><span><strong>{item.name}</strong><small>{item.benefit} · {item.massKg} kg · {item.watts} W · {item.dataGb} GB/día</small></span></label>)}</div>
          <h2>Órbita prevista</h2>
          <select value={config.orbit} onChange={e=>setConfig(previous=>({...previous,orbit:e.target.value as DesignConfig['orbit']}))} aria-label="Tipo de órbita">{ORBITS.map(option=><option key={option.id} value={option.id}>{option.name}</option>)}</select>
          <p className="field-help">{ORBITS.find(o=>o.id===config.orbit)?.description}</p>
          <h2>Vehículo de lanzamiento</h2>
          <select aria-label="Vehículo de lanzamiento" value={config.launcher} onChange={e=>setConfig(previous=>({...previous,launcher:e.target.value as DesignConfig['launcher']}))}>{LAUNCHERS.map(option=><option key={option.id} value={option.id}>{option.name} · {option.maxMass} kg</option>)}</select>
          <h2>Mejoras de ingeniería</h2>
          <label className="option-small"><input type="checkbox" checked={config.solarUpgrade} onChange={e=>setConfig(previous=>({...previous,solarUpgrade:e.target.checked}))}/> Paneles solares adicionales (+170 W)</label>
          <label className="option-small"><input type="checkbox" checked={config.commUpgrade} onChange={e=>setConfig(previous=>({...previous,commUpgrade:e.target.checked}))}/> Antena mejorada (+14 GB/día)</label>
          <button className="action-primary" onClick={()=>go('launch')}>Verificar para lanzamiento →</button>
        </>}
        {stage==='launch'&&<>
          <span className="eyebrow">CAPÍTULO 03 · COMPROBACIÓN</span><h1>Cuenta <em>regresiva.</em></h1>
          <p>Antes del despegue, todas las restricciones deben ser compatibles. Una gran misión no puede despegar con una nave que supera la capacidad del lanzador o el presupuesto.</p>
          <div className={evaluation.ready?'verdict success':'verdict danger'}><strong>{evaluation.ready?'✓ Diseño compatible':'⚠ La misión necesita cambios'}</strong><p>{evaluation.ready?'Tu configuración supera las comprobaciones educativas de esta versión.':'Hay incompatibilidades que resolver antes de lanzar.'}</p></div>
          {evaluation.problems.length>0&&<ul className="warnings">{evaluation.problems.map(p=><li key={p}>{p}</li>)}</ul>}
          <div className="flight-brief"><h2>Plan de vuelo</h2><p><b>Lanzador:</b> {evaluation.launcherName}</p><p><b>Órbita:</b> {evaluation.orbitName}</p><p><b>Objetivo:</b> cartografía y estudio del polo sur lunar</p></div>
          <button className="action-primary" onClick={fly} disabled={!evaluation.ready}>{evaluation.ready?'Autorizar lanzamiento simulado →':'Corrige los problemas para lanzar'}</button>
          {!evaluation.ready&&<button className="action-secondary" onClick={()=>go('design')}>Volver al hangar</button>}
        </>}
        {stage==='operations'&&<>
          <span className="eyebrow">CAPÍTULO 04 · CONTROL DE MISIÓN</span><h1>Operación <em>lunar.</em></h1>
          <p>El satélite debe producir datos sin agotar la energía ni saturar la memoria. Tu estrategia influye en el resultado.</p>
          <div className="telemetry">
            <div><span>Batería</span><strong>{ops.battery}%</strong></div>
            <div><span>Almacenados</span><strong>{ops.stored} / 36 GB</strong></div>
            <div><span>Enviados</span><strong>{ops.delivered} GB</strong></div>
            <div><span>Ciencia operativa</span><strong>{ops.science} pts</strong></div>
          </div>
          {ops.status==='running'?<>
            <span className="eyebrow">EVENTO {ops.step+1} / {OPERATION_EVENTS.length}</span>
            <h2>{OPERATION_EVENTS[ops.step].name}</h2><p>{OPERATION_EVENTS[ops.step].message}</p>
            <div className="actions">{OPERATION_EVENTS[ops.step].options.map(option=><button key={option.id} type="button" onClick={()=>operate(option.id)}><strong>{option.name}</strong><small>{option.effect}</small></button>)}</div>
          </>:<><div className={ops.status==='failed'?'verdict danger':'verdict success'}><strong>{ops.status==='failed'?'La misión encontró una falla':'Secuencia de operaciones finalizada'}</strong><p>Revisa los eventos y la puntuación para entender las consecuencias.</p></div><button className="action-primary" onClick={()=>go('report')}>Leer informe de misión →</button></>}
        </>}
        {stage==='report'&&<>
          <span className="eyebrow">CAPÍTULO 05 · DESPUÉS DEL VUELO</span><h1>Aprender de <em>la misión.</em></h1>
          <div className="score"><strong>{missionScore(ops,evaluation)} / 100</strong><span>PUNTUACIÓN EDUCATIVA</span></div>
          <p>Resultado: <b>{ops.status==='completed'?'Operación completada':'Operación interrumpida'}</b>. Datos enviados: <b>{ops.delivered} GB</b>. Reserva final: <b>{ops.battery}%</b>.</p>
          <h2>Bitácora de decisiones</h2><div className="mission-log">{ops.history.map((entry,index)=><p key={index}>{index+1}. {entry}</p>)}</div>
          <p><strong>Reflexión:</strong> ¿qué instrumento cambiarías para equilibrar valor científico, masa, potencia y capacidad de transmisión?</p>
          <button className="action-primary" onClick={()=>{setOps(startOperations());go('design')}}>Rediseñar la misión ↻</button>
          <button className="action-secondary" onClick={restart}>Comenzar otra historia</button>
        </>}
      </section>
      <aside className="engineering-panel">
        <span className="eyebrow">TABLERO DE INGENIERÍA</span>
        <h2>Recursos de SELENE-01</h2>
        <p className="small-note">Cifras ficticias de entrenamiento. No representan especificaciones oficiales NASA.</p>
        {([
          {name:'Masa',used:evaluation.total.mass,limit:evaluation.capacity.mass,unit:'kg'},
          {name:'Potencia',used:evaluation.total.power,limit:evaluation.capacity.power,unit:'W'},
          {name:'Datos diarios',used:evaluation.total.data,limit:evaluation.capacity.data,unit:'GB'},
          {name:'Presupuesto',used:evaluation.total.cost,limit:evaluation.capacity.budget,unit:'M USD'},
        ]).map(m=><div className="metric" key={m.name}><div><span>{m.name}</span><strong className={m.used>m.limit?'over':''}>{m.used} / {m.limit} {m.unit}</strong></div><div className="metric-track"><div className={m.used>m.limit?'over':''} style={{width:Math.min(100,m.used/m.limit*100)+'%'}}/></div></div>)}
        <p className="science-value">Valor científico estimado <strong>{evaluation.total.science} pts</strong></p>
        <div className={evaluation.ready?'system-message valid':'system-message invalid'} role="status">{evaluation.ready?'✓ Requisitos de diseño compatibles':evaluation.problems.join(' · ')}</div>
        <div className="mission-links"><a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noopener noreferrer">Datos científicos de NASA ↗</a><a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noopener noreferrer">Modelos y referencias NASA ↗</a></div>
      </aside>
    </main>
    <Orbi hint={TIPS[stage]}/>
    <footer>SELENE-01 · SPACE MISSION DESIGN GAME · Proyecto independiente, no afiliado ni avalado por NASA</footer>
  </div>
}
