import { evaluateDesign, type InstrumentId, type DesignConfig } from './missionDesign'
import { assemblyProblems, type ModuleId } from '../spacecraft/assembly'

export type Mission={objective:InstrumentId|null;verified:string|null;result:{status:'completed'|'failed';score:number;delivered:number;history:string[];lessons?:string[]}|null}

// Pure progression rules: no React, storage, scene or browser dependencies.
export function blueprintKey(mission:Mission,config:DesignConfig,parts:ModuleId[]){return JSON.stringify([mission.objective,[...parts].sort(),[...config.instruments].sort(),config.orbit,config.launcher,config.durationDays??90,config.solarUpgrade,config.commUpgrade,!!config.habitat,!!config.supports])}
export function missionProblems(mission:Mission,config:DesignConfig,parts:ModuleId[]){
 const issues=[...assemblyProblems(parts),...evaluateDesign(config).problems]
 if(!mission.objective)issues.unshift('Acepta un objetivo en la mesa del laboratorio.')
 else if(!config.instruments.includes(mission.objective))issues.push('Instala el instrumento que necesita tu objetivo científico.')
 if(config.orbit==='inclined')issues.push('El encargo polar necesita una de las órbitas polares del simulador.')
 return issues
}
export function missionVerified(mission:Mission,config:DesignConfig,parts:ModuleId[]){return !missionProblems(mission,config,parts).length&&mission.verified===blueprintKey(mission,config,parts)}

export function nextMissionStep(mission:Mission,config:DesignConfig,parts:ModuleId[]){
 if(!mission.objective)return {sector:'research' as const,number:'01',title:'Define tu pregunta con la Dra. Vega'}
 if(missionProblems(mission,config,parts).length)return {sector:'hangar' as const,number:'02',title:'Construye una nave que cumpla el objetivo'}
 if(!missionVerified(mission,config,parts))return {sector:'control' as const,number:'03',title:'Revisa los recursos en comunicaciones'}
 if(!mission.result)return {sector:'launch' as const,number:'04',title:'Autoriza tu misión en la plataforma'}
 return {sector:'observatory' as const,number:'05',title:'Consulta los resultados en el mirador'}
}
