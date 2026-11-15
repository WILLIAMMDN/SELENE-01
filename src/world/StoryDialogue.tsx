import { loadBlueprint } from '../spacecraft/blueprint'
import { useEffect, useRef, useState } from 'react'
import { getMission, OBJECTIVES, missionVerified } from '../game/campusMission'
import type { SectorId } from './worldData'

export type Conversation={speaker:string;lines:string[];action:string;sector?:SectorId;kind?:'lander'}
export const ARRIVAL:Conversation={speaker:'TARS',lines:['Bienvenida a Artemisa. Hoy empieza tu primera misión: enviar ODYSSEY a estudiar el polo sur de la Luna.','La Dra. Vega te espera en el laboratorio. Tú decides qué investigar; yo te ayudaré a entender lo que cuesta cada elección.'],action:'Vamos al laboratorio'}
export function stationConversation(sector:SectorId):Conversation{
 const draft=loadBlueprint(),reviewed=missionVerified(draft.config,draft.parts)
 const mission=getMission(),objective=OBJECTIVES.find(o=>o.id===mission.objective)?.name??'tu pregunta científica'
 const stories:Record<SectorId,Conversation>={
  research:{speaker:'DRA. VEGA',lines:mission.objective?[`Nuestro encargo sigue siendo: ${objective}. Puedes mantenerlo o empezar de nuevo con otra pregunta.`]:['La Luna todavía guarda preguntas. Antes de construir una nave, necesitamos decidir qué queremos aprender.','Podemos estudiar el relieve, la composición de la superficie o señales del subsuelo. Cada pregunta necesita instrumentos distintos.'],action:'Elegir el objetivo',sector},
  hangar:{speaker:'TARS · INGENIERÍA',lines:mission.objective?[`Vamos a construir ODYSSEY para ${objective.toLowerCase()}. Elige sus piezas y el instrumento que realmente necesitas.`,'Más instrumentos también significan más masa, consumo, datos y coste. Decide cuánto durará la misión; después llevaremos el diseño a comunicaciones.']:['Aún no tenemos un encargo. La Dra. Vega te ayudará a elegirlo en el laboratorio; después sabremos qué necesita la nave.'],action:mission.objective?'Abrir mesa de diseño':'Ver el encargo pendiente',sector},
  control:{speaker:'TARS · COMUNICACIONES',lines:['Una nave que observa, pero no devuelve sus datos, no termina su trabajo. Revisemos el enlace y los demás recursos.','Esta revisión corresponde a tu configuración actual. Si cambias la nave, la órbita o la duración, tendremos que revisarla otra vez.'],action:'Revisar la misión',sector},
  launch:{speaker:'TARS · LANZAMIENTO',lines:reviewed?['El siguiente paso es autorizar el vuelo. Durante la misión tendrás que elegir cuándo observar, cuándo transmitir y cuándo proteger los sistemas.','No hace falta una misión perfecta a la primera. Conservaremos tus decisiones para comprender qué funcionó y qué cambiar.']:['Todavía falta la revisión de comunicaciones. Podemos observar el lanzador, pero la misión necesita un diseño revisado antes de despegar.'],action:'Abrir puesto de vuelo',sector},
  observatory: {
   speaker: 'DRA. VEGA · BITÁCORA',
   lines: mission.result
    ? [
       mission.result.status === 'failed'
        ? 'La operación se interrumpió. Eso también nos enseña: revisemos qué decisión agotó nuestros recursos.'
        : mission.result.delivered > 0
         ? 'Los datos ya llegaron. Ahora podemos comparar lo que esperábamos con lo que realmente conseguimos.'
         : 'La nave terminó sus operaciones, pero no devolvió datos. La próxima vez, reserva una ventana para transmitir.',
       'Una buena misión responde a su pregunta y sabe explicar sus decisiones. ¿Qué conservarías de este diseño?',
      ]
    : ['Desde aquí se ve el camino que has recorrido. Cuando termine la operación lunar, traeremos aquí los resultados para decidir cómo mejorar.'],
   action: mission.result ? 'Leer el informe' : 'Abrir la bitácora',
   sector,
  },
 }
 return stories[sector]
}
export default function StoryDialogue({conversation,onFinish,onClose}:{conversation:Conversation;onFinish:()=>void;onClose:()=>void}){
 const [page,setPage]=useState(0),ref=useRef<HTMLDivElement>(null),last=page===conversation.lines.length-1
 useEffect(()=>{const before=document.activeElement as HTMLElement;ref.current?.focus();return()=>before?.focus()},[])
 return <div className="story-layer"><div className="story-dialogue" role="dialog" aria-modal="true" aria-labelledby="story-speaker" aria-describedby="story-line" tabIndex={-1} ref={ref} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose()}if((e.key==='Enter'||e.key===' ')&&e.target===ref.current){e.preventDefault();if(last)onFinish();else setPage(p=>p+1)}if(e.key==='Tab'){const buttons=ref.current?.querySelectorAll<HTMLButtonElement>('button');if(!buttons?.length)return;const first=buttons[0],end=buttons[buttons.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();end.focus()}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus()}}}}>
  <strong id="story-speaker" className="speaker-tab">{conversation.speaker}</strong><button className="story-close" onClick={onClose} aria-label="Cerrar conversación">×</button>
  <p id="story-line" key={page}>{conversation.lines[page]}</p>
  <div className="story-bottom"><span aria-label={`Página ${page+1} de ${conversation.lines.length}`}>{conversation.lines.map((_,i)=><i key={i} className={i===page?'current':''}/>)}</span><button onClick={()=>last?onFinish():setPage(p=>p+1)}>{last?conversation.action:'Continuar'} <b aria-hidden="true">▶</b></button></div>
 </div></div>
}
