import { useCampusMission, missionProblems, missionVerified, recordMission, resetCampusMission } from './game/campusMission'
import { useCallback, useEffect, useState } from 'react'
import GameWorld, { type Station } from './scene/GameWorld'
import Orbi from './robot/Orbi'
import {
  INSTRUMENTS, ORBITS, LAUNCHERS, INITIAL_DESIGN, MISSION_DURATIONS, missionDebrief,
  evaluateDesign, OPERATION_EVENTS, startOperations, applyOperation,
  missionScore, type InstrumentId, type DesignConfig, type OperationChoice,
} from './game/missionDesign'
import './styles.css'
import { MODULES, INITIAL_ASSEMBLY, COMPLETE_ASSEMBLY, assemblyProblems, assemblyReady, toggleModule, type ModuleId } from './spacecraft/assembly'
import { loadBlueprint } from './spacecraft/blueprint'

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

export default function App({initialStage='briefing',campus=false,launchAccess=false,onReturnToCampus}:{initialStage?:'briefing'|'design'|'launch';campus?:boolean;launchAccess?:boolean;onReturnToCampus?:()=>void}) {
  useCampusMission()
  const [stage,setStage]=useState<Stage>(initialStage)
  const [blueprint]=useState(loadBlueprint)
  const [config,setConfig]=useState<DesignConfig>(blueprint.config)
  const [assembly,setAssembly]=useState<ModuleId[]>(blueprint.parts)
  const [exploded,setExploded]=useState(false)
  useEffect(()=>{try{localStorage.setItem('selene-odyssey-blueprint-v1',JSON.stringify({config,parts:assembly}))}catch{/* Keep the design in memory when storage is unavailable. */}},[config,assembly])
  const [ops,setOps]=useState(startOperations)
  const [notification,setNotification]=useState('')
  const [launched,setLaunched]=useState(false)
  const evaluation=evaluateDesign(config)
  const launchProblems=campus?[...missionProblems(config,assembly),...(!missionVerified(config,assembly)?['Regresa a comunicaciones para registrar la revisión de esta configuración.']:[]),...(!launchAccess?['Regresa al campus y utiliza el puesto de autorización de la plataforma.']:[])]:[...evaluation.problems,...assemblyProblems(assembly)]
  const engineeringProblems=campus?missionProblems(config,assembly):[...evaluation.problems,...assemblyProblems(assembly)]
  const stageIndex=STAGES.findIndex(x=>x.id===stage)
  const operateReady=evaluation.ready&&assemblyReady(assembly)&&(!campus||(launchAccess&&missionVerified(config,assembly)))
  useEffect(()=>{if(campus&&launched&&ops.status!=='running')recordMission(ops,missionScore(ops,evaluateDesign(config)),config,assembly)},[campus,launched,ops,config,assembly])
  const go=(value:Stage)=>{
    if(value==='operations' && (!operateReady || !launched)){setNotification('Autoriza primero un lanzamiento con un diseño válido.');setStage('launch');return}
    if(value==='report' && (!launched || ops.status==='running')){setNotification('Completa las tres decisiones de operaciones antes del informe.');return}
    setNotification('');setStage(value)
  }
  const interact=useCallback((station:Station)=>{
    if(station==='briefing'){setStage('briefing');setNotification('La Dra. Vega te espera con las instrucciones.')}
    if(station==='hangar'){setStage('design');setNotification('Has entrado al hangar de ingeniería.')}
    if(station==='launch'){setStage('launch');setNotification('Verifica la misión antes de lanzar.')}
    if(station==='control'){setStage(launched?'operations':'launch');setNotification(launched?'Has entrado al centro de control.':'Autoriza el lanzamiento antes de operar la misión.')}
  },[launched])
  const toggleInstrument=(id:InstrumentId)=>{
    setLaunched(false);setOps(startOperations())
    setConfig(previous=>({...previous,instruments:previous.instruments.includes(id)?previous.instruments.filter(x=>x!==id):[...previous.instruments,id]}))
  }
  const assemble=(id:ModuleId)=>{
    const next=toggleModule(assembly,id);setAssembly(next);setLaunched(false);setOps(startOperations());setConfig(previous=>({...previous,habitat:next.includes('habitat'),supports:next.includes('supports'),solarUpgrade:next.includes('solar'),commUpgrade:next.includes('antenna')}))
  }
  const fly=()=>{
    if(!operateReady){go('design');return}
    setOps(startOperations());setLaunched(true);setStage('operations');setNotification('¡Lanzamiento simulado! El orbitador está en la fase de operaciones.')
  }
  const operate=(choice:OperationChoice)=>{
    setOps(previous=>applyOperation(previous,choice,evaluation))
  }
  const restart=()=>{
    if(campus)resetCampusMission()
    setConfig(INITIAL_DESIGN);setAssembly(INITIAL_ASSEMBLY);setExploded(false);setOps(startOperations());setLaunched(false);setStage('briefing');setNotification('')
  }
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-symbol">◐</span><span><strong>SELENE—01</strong><small>ARQUITECTOS DEL ESPACIO</small></span></div>
      <div className="topbar-note">Un juego sobre decisiones de ingeniería, no una misión real</div>
      <span className="topbar-status">PROTOTIPO EDUCATIVO · V0.2</span>
    </header>
    <nav className="stage-nav" aria-label="Etapas de la misión">
      {STAGES.map((item,index)=><button key={item.id} type="button" className={stage===item.id?'current':''} aria-current={stage===item.id?'step':undefined} onClick={()=>go(item.id)} disabled={(item.id==='report'&&ops.status==='running')||(item.id==='operations'&&(!operateReady || !launched))}>{index<stageIndex?'✓ ':''}{item.label}</button>)}
    </nav>
    <main className="game-layout">
      <section className="world-column">
        <GameWorld mode={stage==='operations'||stage==='report'?'orbit':stage==='design'?'workshop':stage==='launch'?'launch':'campus'} onInteract={interact} parts={assembly} config={config} exploded={exploded}/>
        <div className="exploration-story"><strong>La historia</strong><span>Formas parte del equipo SELENE. En este capítulo prepararás un orbitador desde la Tierra. La Dra. Vega presenta el objetivo lunar; en el hangar, construyes ODYSSEY con la ayuda de TARS antes de configurar su misión científica.</span></div>
      </section>
      <section className="campaign-panel" aria-live="polite">
        {notification&&<p className="notification" role="status">{notification}</p>}
        {stage==='briefing'&&<>
          <span className="eyebrow">CAPÍTULO 01 · LA CONVOCATORIA</span><h1>Una misión.<br/><em>Mil decisiones.</em></h1>
          <p>La Dra. Vega te invita al programa SELENE-01: estudiar el entorno del polo sur lunar. Tu primer encargo es ensamblar la nave modular ODYSSEY y preparar una misión orbital capaz de recolectar y devolver información científica.</p>
          <blockquote>«No gana quien carga más instrumentos, sino quien construye un sistema que puede cumplir su objetivo». — Dra. Vega, personaje ficticio</blockquote>
          <h2>Tu desafío</h2>
          <div className="story-steps"><p>① Ensambla ODYSSEY y define sus instrumentos.</p><p>② Equilibra masa, energía, datos y presupuesto.</p><p>③ Elige órbita y lanzador.</p><p>④ Simula el vuelo, responde a imprevistos y mejora.</p></div>
          <a className="source-link" href="https://science.nasa.gov/moon/moon-water-and-ices/" rel="noopener noreferrer" target="_blank">¿Por qué explorar el polo lunar? · Fuente NASA ↗</a>
          <button className="action-primary" onClick={()=>go('design')}>Ir al laboratorio de ingeniería →</button>
        </>}
        {stage==='design'&&<>
          <span className="eyebrow">CAPÍTULO 02 · EL HANGAR</span><h1>Construye <em>ODYSSEY.</em></h1>
          <p>Selecciona instrumentos, lanzador y órbita. TARS te recordará los compromisos de cada decisión.</p>
          <div className="odyssey-assembly">
            <div className="assembly-heading"><h2>Ensamblaje de la nave</h2><span>{assembly.length} / {COMPLETE_ASSEMBLY.length} conjuntos</span></div>
            <p className="small-note">Ensambla los sistemas de la nave. Elige depósitos grandes o pequeños; la antena se monta sobre el hábitat.</p>
            <div className="assembly-parts">{MODULES.map(part=>{const installed=assembly.includes(part.id);const blocked=part.id!=='fuselage'&&!assembly.includes('fuselage')||part.id!=='fuselage'&&part.id!=='connectors'&&!assembly.includes('connectors')||part.id==='antenna'&&!assembly.includes('habitat');return <button key={part.id} type="button" aria-pressed={installed} disabled={blocked} onClick={()=>assemble(part.id)}><span className="assembly-check">{installed?'✓':'+'}</span><span><strong>{part.name} <small>{part.required?'Necesario':'Opcional'}</small></strong><span>{part.description}</span></span><b>{installed?'Retirar':'Montar'}</b></button>})}</div>
            <label className="option-small"><input type="checkbox" checked={exploded} onChange={e=>setExploded(e.target.checked)}/> Separar las piezas para ver los acoplamientos</label>
            <p className="small-note">Hábitat: +90 kg, +55 W, +14 M USD. Soportes: +12 kg, +2 M USD. Valores ficticios para aprender; los sistemas básicos están incluidos en el presupuesto base. No se simula soporte vital ni combustible real.</p>
          </div>
          <h2>Instrumentos científicos</h2>
          <div className="select-list">{INSTRUMENTS.map(item=><label className="select-card" key={item.id}><input type="checkbox" checked={config.instruments.includes(item.id)} onChange={()=>toggleInstrument(item.id)}/><span><strong>{item.name}</strong><small>{item.benefit} · {item.massKg} kg · {item.watts} W · {item.dataGb} GB/día</small></span></label>)}</div>
          <h2>Órbita prevista</h2>
          <select value={config.orbit} onChange={e=>{setLaunched(false);setOps(startOperations());setConfig(previous=>({...previous,orbit:e.target.value as DesignConfig['orbit']}))}} aria-label="Tipo de órbita">{ORBITS.map(option=><option key={option.id} value={option.id}>{option.name}</option>)}</select>
          <p className="field-help">{ORBITS.find(o=>o.id===config.orbit)?.description}</p>
          <h2>Vehículo de lanzamiento</h2>
          <select aria-label="Vehículo de lanzamiento" value={config.launcher} onChange={e=>{setLaunched(false);setOps(startOperations());setConfig(previous=>({...previous,launcher:e.target.value as DesignConfig['launcher']}))}}>{LAUNCHERS.map(option=><option key={option.id} value={option.id}>{option.name} · {option.maxMass} kg</option>)}</select>
          <h2>Duración de la misión</h2>
          <select aria-label="Duración de la misión" value={config.durationDays??90} onChange={e=>{setLaunched(false);setOps(startOperations());setConfig(c=>({...c,durationDays:Number(e.target.value) as 30|90|180}))}}>{MISSION_DURATIONS.map(d=><option key={d.days} value={d.days}>{d.name} · operaciones +{d.cost} M USD</option>)}</select>
          <p className="field-help">Una campaña larga amplía la oportunidad científica y consume más presupuesto y reservas. 180 días requiere paneles adicionales. Parámetros educativos.</p>
          <h2>Mejoras de ingeniería</h2>
          <label className="option-small"><input type="checkbox" checked={config.solarUpgrade} disabled={!assembly.includes('connectors')} onChange={()=>assemble('solar')}/> Paneles solares adicionales (+170 W)</label>
          <label className="option-small"><input type="checkbox" checked={config.commUpgrade} disabled={!assembly.includes('habitat')} onChange={()=>assemble('antenna')}/> Antena mejorada (+14 GB/día)</label>
          <button className="action-primary" onClick={()=>campus?onReturnToCampus?.():go('launch')}>{campus?'Guardar y volver al campus →':'Verificar para lanzamiento →'}</button>
        </>}
        {stage==='launch'&&<>
          <span className="eyebrow">CAPÍTULO 03 · COMPROBACIÓN</span><h1>Cuenta <em>regresiva.</em></h1>
          <p>Antes del despegue, todas las restricciones deben ser compatibles. Una gran misión no puede despegar con una nave que supera la capacidad del lanzador o el presupuesto.</p>
          <div className={operateReady?'verdict success':'verdict danger'}><strong>{operateReady?'✓ Diseño compatible':'⚠ La misión necesita cambios'}</strong><p>{operateReady?'Tu configuración supera las comprobaciones educativas de esta versión.':'Hay incompatibilidades que resolver antes de lanzar.'}</p></div>
          {launchProblems.length>0&&<ul className="warnings">{launchProblems.map(p=><li key={p}>{p}</li>)}</ul>}
          <div className="flight-brief"><h2>Plan de vuelo de ODYSSEY</h2><p><b>Ensamblaje:</b> {assemblyReady(assembly)?'Módulos obligatorios instalados':'Incompleto'} · {assembly.includes('habitat')?'Con hábitat':'Configuración compacta'}</p><p><b>Lanzador:</b> {evaluation.launcherName}</p><p><b>Órbita:</b> {evaluation.orbitName}</p><p><b>Duración:</b> {evaluation.durationDays} días</p><p><b>Objetivo:</b> cartografía y estudio del polo sur lunar</p></div>
          <button className="action-primary" onClick={fly} disabled={!operateReady}>{operateReady?'Autorizar lanzamiento simulado →':'Corrige los problemas para lanzar'}</button>
          {campus&&<button className="action-secondary" onClick={onReturnToCampus}>Volver a las estaciones del campus</button>}
          {!operateReady&&<button className="action-secondary" onClick={()=>go('design')}>Volver al hangar</button>}
        </>}
        {stage==='operations'&&<>
          <span className="eyebrow">CAPÍTULO 04 · CONTROL DE MISIÓN</span><h1>Operación <em>lunar.</em></h1>
          <p>ODYSSEY debe producir datos sin agotar la energía ni saturar la memoria. Tu estrategia influye en el resultado.</p>
          <div className="telemetry">
            <div><span>Batería</span><strong>{ops.battery}%</strong></div>
            <div><span>Almacenados</span><strong>{ops.stored} / 36 GB</strong></div>
            <div><span>Enviados</span><strong>{ops.delivered} GB</strong></div>
            <div><span>Tiempo de misión</span><strong>{Math.round(ops.step*evaluation.durationDays/OPERATION_EVENTS.length)} / {evaluation.durationDays} días</strong></div>
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
          <ul className="debrief-notes">{missionDebrief(ops,evaluation).map(line=><li key={line}>{line}</li>)}</ul><p><strong>Reflexión:</strong> ¿qué instrumento cambiarías para equilibrar valor científico, masa, potencia y capacidad de transmisión?</p>
          <button className="action-primary" onClick={()=>{setOps(startOperations());setLaunched(false);go('design')}}>Rediseñar la misión ↻</button>
          <button className="action-secondary" onClick={restart}>Comenzar otra historia</button>
        </>}
      </section>
      <aside className="engineering-panel">
        <span className="eyebrow">TABLERO DE INGENIERÍA</span>
        <h2>Recursos de ODYSSEY</h2>
        <p className="small-note">Cifras ficticias de entrenamiento. No representan especificaciones oficiales NASA.</p>
        {([
          {name:'Masa',used:evaluation.total.mass,limit:evaluation.capacity.mass,unit:'kg'},
          {name:'Potencia',used:evaluation.total.power,limit:evaluation.capacity.power,unit:'W'},
          {name:'Datos diarios',used:evaluation.total.data,limit:evaluation.capacity.data,unit:'GB'},
          {name:'Presupuesto',used:evaluation.total.cost,limit:evaluation.capacity.budget,unit:'M USD'},
        ]).map(m=><div className="metric" key={m.name}><div><span>{m.name}</span><strong className={m.used>m.limit?'over':''}>{m.used} / {m.limit} {m.unit}</strong></div><div className="metric-track"><div className={m.used>m.limit?'over':''} style={{width:Math.min(100,m.used/m.limit*100)+'%'}}/></div></div>)}
        <p className="science-value">Duración: {evaluation.durationDays} días · soporte energético previsto: {evaluation.serviceLife} días · Valor científico estimado <strong>{evaluation.total.science} pts</strong></p>
        <div className={!engineeringProblems.length?'system-message valid':'system-message invalid'} role="status">{!engineeringProblems.length?'✓ Diseño compatible · guarda y continúa en comunicaciones':engineeringProblems.slice(0,2).join(' · ')+(engineeringProblems.length>2?` · ${engineeringProblems.length-2} requisitos más por resolver`:'')}</div>
        <div className="mission-links"><a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noopener noreferrer">Datos científicos de NASA ↗</a><a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noopener noreferrer">Modelos y referencias NASA ↗</a></div>
      </aside>
    </main>
    <Orbi hint={TIPS[stage]}/>
    <footer>SELENE-01 · SPACE MISSION DESIGN GAME · Proyecto independiente, no afiliado ni avalado por NASA</footer>
  </div>
}
