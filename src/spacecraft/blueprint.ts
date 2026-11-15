import { INITIAL_DESIGN, INSTRUMENTS, ORBITS, LAUNCHERS, type DesignConfig } from '../game/missionDesign'
import { INITIAL_ASSEMBLY, MODULES, type ModuleId } from './assembly'
export function loadBlueprint():{config:DesignConfig;parts:ModuleId[]}{
 try{
  const saved=JSON.parse(localStorage.getItem('selene-odyssey-blueprint-v1')??sessionStorage.getItem('selene-odyssey-blueprint-v1')??'null')
  if(saved&&Array.isArray(saved.parts)&&saved.config){
   const c=saved.config
   if(Array.isArray(c.instruments)&&c.instruments.every((id:unknown)=>INSTRUMENTS.some(i=>i.id===id))&&ORBITS.some(o=>o.id===c.orbit)&&LAUNCHERS.some(l=>l.id===c.launcher)&&typeof c.solarUpgrade==='boolean'&&typeof c.commUpgrade==='boolean'){
    let parts=MODULES.filter(m=>saved.parts.includes(m.id)).map(m=>m.id)
    if(!parts.includes('fuselage'))parts=[]
    else if(!parts.includes('connectors'))parts=['fuselage']
    if(!parts.includes('habitat'))parts=parts.filter(id=>id!=='antenna')
    if(parts.includes('fuel'))parts=parts.filter(id=>id!=='fuelSmall')
    return {parts,config:{instruments:c.instruments,durationDays:[30,90,180].includes(c.durationDays)?c.durationDays:90,orbit:c.orbit,launcher:c.launcher,solarUpgrade:parts.includes('solar'),commUpgrade:parts.includes('antenna'),habitat:parts.includes('habitat'),supports:parts.includes('supports')}}
   }
  }
 }catch{/* An absent or invalid local draft starts a new blueprint. */}
 return {config:INITIAL_DESIGN,parts:INITIAL_ASSEMBLY}
}
