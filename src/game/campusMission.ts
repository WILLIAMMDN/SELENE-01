import { useSyncExternalStore } from 'react'
import { evaluateDesign, missionDebrief, type InstrumentId, type DesignConfig, type OperationState } from './missionDesign'
import { assemblyProblems, type ModuleId } from '../spacecraft/assembly'
import { loadBlueprint } from '../spacecraft/blueprint'

export const OBJECTIVES:{id:InstrumentId;name:string;question:string;requirement:string;source:string}[]=[
 {id:'camera',name:'Cartografía del polo',question:'¿Cómo es el relieve que rodea las regiones polares?',requirement:'Cámara orbital y cobertura polar.',source:'https://science.nasa.gov/mission/lro/'},
 {id:'spectrometer',name:'Composición de la superficie',question:'¿Qué nos dice la luz reflejada sobre los materiales lunares?',requirement:'Espectrómetro y cobertura polar.',source:'https://science.nasa.gov/moon/moon-water-and-ices/'},
 {id:'radar',name:'Investigar señales del subsuelo',question:'¿Qué estructuras y posibles depósitos merecen investigarse?',requirement:'Radar y cobertura polar. Una señal por sí sola no confirma hielo.',source:'https://science.nasa.gov/missions/mini-rf/nasa-radar-finds-ice-deposits-at-moons-north-pole/'},
]
type Mission={objective:InstrumentId|null;verified:string|null;result:{status:'completed'|'failed';score:number;delivered:number;history:string[];lessons?:string[]}|null}
const EMPTY:Mission={objective:null,verified:null,result:null},KEY='selene-campus-mission-v1'
function read():Mission{try{const m=JSON.parse(localStorage.getItem(KEY)??'null');if(m&&OBJECTIVES.some(o=>o.id===m.objective))return {objective:m.objective,verified:typeof m.verified==='string'?m.verified:null,result:m.result&&['completed','failed'].includes(m.result.status)&&Number.isFinite(m.result.score)&&Number.isFinite(m.result.delivered)&&Array.isArray(m.result.history)&&m.result.history.every((x:unknown)=>typeof x==='string')?m.result:null}}catch{/* Continue in memory. */}return EMPTY}
let current=read()
const listeners=new Set<()=>void>()
function write(next:Mission){current=next;try{localStorage.setItem(KEY,JSON.stringify(next))}catch{/* Continue in memory. */}listeners.forEach(fn=>fn())}
export const getMission=()=>current
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}}
export const useCampusMission=()=>useSyncExternalStore(subscribe,getMission)
export function acceptObjective(objective:InstrumentId){write({objective,verified:null,result:null})}
export function resetCampusMission(){write({...EMPTY})}
export function blueprintKey(config:DesignConfig,parts:ModuleId[]){return JSON.stringify([current.objective,[...parts].sort(),[...config.instruments].sort(),config.orbit,config.launcher,config.durationDays??90,config.solarUpgrade,config.commUpgrade,!!config.habitat,!!config.supports])}
export function missionProblems(config:DesignConfig,parts:ModuleId[]){
 const issues=[...assemblyProblems(parts),...evaluateDesign(config).problems]
 if(!current.objective)issues.unshift('Acepta un objetivo en la mesa del laboratorio.')
 else if(!config.instruments.includes(current.objective))issues.push('Instala el instrumento que necesita tu objetivo científico.')
 if(config.orbit==='inclined')issues.push('El encargo polar necesita una de las órbitas polares del simulador.')
 return issues
}
export function missionVerified(config:DesignConfig,parts:ModuleId[]){return !missionProblems(config,parts).length&&current.verified===blueprintKey(config,parts)}
export function verifyMission(){const {config,parts}=loadBlueprint();if(missionProblems(config,parts).length)return false;write({...current,verified:blueprintKey(config,parts),result:null});return true}
export function recordMission(result:OperationState,score:number,config:DesignConfig,parts:ModuleId[]){if(result.status==='running'||!missionVerified(config,parts))return;write({...current,result:{status:result.status,score,delivered:result.delivered,history:result.history,lessons:missionDebrief(result,evaluateDesign(config))}})}
export function nextMissionStep(){
 const {config,parts}=loadBlueprint()
 if(!current.objective)return {sector:'research' as const,number:'01',title:'Define tu pregunta con la Dra. Vega'}
 if(missionProblems(config,parts).length)return {sector:'hangar' as const,number:'02',title:'Construye una nave que cumpla el objetivo'}
 if(!missionVerified(config,parts))return {sector:'control' as const,number:'03',title:'Revisa los recursos en comunicaciones'}
 if(!current.result)return {sector:'launch' as const,number:'04',title:'Autoriza tu misión en la plataforma'}
 return {sector:'observatory' as const,number:'05',title:'Consulta los resultados en el mirador'}
}
