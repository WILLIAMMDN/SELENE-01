export type ModuleId='fuselage'|'connectors'|'supports'|'habitat'|'cabin'|'engine'|'fuel'|'fuelSmall'|'energy'|'oxygen'|'rcs'|'solar'|'antenna'
export const MODULES:{id:ModuleId;name:string;file:string;sourceId:string;required:boolean;description:string}[]=[
 {id:'fuselage',sourceId:'FC-01',name:'Fuselaje central',file:'fuselaje_central',required:true,description:'Estructura principal y puertos de montaje.'},
 {id:'connectors',sourceId:'CONECTORES_MODULARES',name:'Conectores modulares',file:'conectores_modulares',required:true,description:'Interfaces de unión del conjunto.'},
 {id:'supports',sourceId:'SOPORTES_ESTRUCTURALES',name:'Soportes estructurales',file:'soportes_estructurales',required:false,description:'Anclajes del modelo; sin cálculo de cargas.'},
 {id:'habitat',sourceId:'HAB-01',name:'Módulo habitable',file:'modulo_habitable',required:false,description:'Extiende la nave y permite instalar la antena del hábitat.'},
 {id:'cabin',sourceId:'CM-01',name:'Cabina de mando',file:'cabina_mando',required:true,description:'Se acopla al fuselaje o encima del hábitat.'},
 {id:'engine',sourceId:'MP-01',name:'Motor principal',file:'motor_principal',required:true,description:'Propulsión principal en el acoplamiento inferior.'},
 {id:'fuel',sourceId:'TANQUE-G01',name:'Dos depósitos grandes',file:'tanque_combustible_g01',required:false,description:'Combustible en los puertos 02 y 04. Sustituye a los pequeños.'},
 {id:'fuelSmall',sourceId:'TANQUE-P01',name:'Dos depósitos pequeños',file:'tanque_combustible_p01',required:false,description:'Alternativa compacta en los mismos puertos; no se superponen.'},
 {id:'energy',sourceId:'ENERGIA_P01',name:'Módulo de energía',file:'energia_p01',required:true,description:'Sistema eléctrico en el puerto 01.'},
 {id:'oxygen',sourceId:'OXIGENO_P01',name:'Módulo de oxígeno',file:'oxigeno_p01',required:false,description:'Puerto 03. Necesario al instalar el hábitat.'},
 {id:'rcs',sourceId:'RCS_P01',name:'Cuatro propulsores RCS',file:'rcs_p01',required:true,description:'Conjunto de control de orientación en sus cuatro sockets.'},
 {id:'solar',sourceId:'SOLAR_P01',name:'Dos paneles solares',file:'solar_p01',required:false,description:'Paneles del archivo final, desplegados en ambos acoplamientos.'},
 {id:'antenna',sourceId:'ANTENA_C01',name:'Antena del hábitat',file:'antena_c01',required:false,description:'Enlace de comunicaciones. Requiere el módulo habitable.'},
]
export const INITIAL_ASSEMBLY:ModuleId[]=['fuselage']
export const COMPLETE_ASSEMBLY:ModuleId[]=MODULES.filter(m=>m.id!=='fuelSmall').map(m=>m.id)
export function assemblyProblems(parts:ModuleId[]){
 const problems=MODULES.filter(m=>m.required&&!parts.includes(m.id)).map(m=>`Falta ensamblar: ${m.name}.`)
 if(!parts.includes('fuel')&&!parts.includes('fuelSmall'))problems.push('Instala un conjunto de depósitos de combustible.')
 if(parts.includes('habitat')&&!parts.includes('oxygen'))problems.push('El hábitat necesita el módulo de oxígeno.')
 return problems
}
export const assemblyReady=(parts:ModuleId[])=>assemblyProblems(parts).length===0
export function toggleModule(parts:ModuleId[],id:ModuleId):ModuleId[]{
 if(parts.includes(id)){
  if(id==='fuselage')return []
  if(id==='connectors')return parts.filter(p=>p==='fuselage')
  return parts.filter(p=>p!==id&&(id!=='habitat'||p!=='antenna'))
 }
 if(id!=='fuselage'&&!parts.includes('fuselage'))return parts
 if(id!=='fuselage'&&id!=='connectors'&&!parts.includes('connectors'))return parts
 if(id==='antenna'&&!parts.includes('habitat'))return parts
 return [...parts.filter(p=>!(id==='fuel'&&p==='fuelSmall')&&!(id==='fuelSmall'&&p==='fuel')),id]
}
