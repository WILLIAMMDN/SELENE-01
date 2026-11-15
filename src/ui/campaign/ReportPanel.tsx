import type { MissionController } from '../../game/hooks/useMissionController'
import { missionScore, missionDebrief } from '../../game/missionDesign'
export default function ReportPanel({controller}:{controller:MissionController}){
 const {ops,evaluation,redesign,restart}=controller
 return <>

          <span className="eyebrow">CAPÍTULO 05 · DESPUÉS DEL VUELO</span><h1>Aprender de <em>la misión.</em></h1>
          <div className="score"><strong>{missionScore(ops,evaluation)} / 100</strong><span>PUNTUACIÓN EDUCATIVA</span></div>
          <p>Resultado: <b>{ops.status==='completed'?'Operación completada':'Operación interrumpida'}</b>. Datos enviados: <b>{ops.delivered} GB</b>. Reserva final: <b>{ops.battery}%</b>.</p>
          <h2>Bitácora de decisiones</h2><div className="mission-log">{ops.history.map((entry,index)=><p key={index}>{index+1}. {entry}</p>)}</div>
          <ul className="debrief-notes">{missionDebrief(ops,evaluation).map(line=><li key={line}>{line}</li>)}</ul><p><strong>Reflexión:</strong> ¿qué instrumento cambiarías para equilibrar valor científico, masa, potencia y capacidad de transmisión?</p>
          <button className="action-primary" onClick={redesign}>Rediseñar la misión ↻</button>
          <button className="action-secondary" onClick={restart}>Comenzar otra historia</button>
        
 </>
}
