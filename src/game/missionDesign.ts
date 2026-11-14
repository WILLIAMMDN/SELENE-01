/**
 * Space Mission Design Game: parámetros HIPOTÉTICOS para aprendizaje.
 * No reproducen capacidades, lanzadores ni telemetría reales de NASA.
 */
export type InstrumentId = 'camera' | 'spectrometer' | 'radar'
export type OrbitId = 'polar-low' | 'polar-high' | 'inclined'
export type LauncherId = 'aurora' | 'atlas'
export interface Instrument {
  id:InstrumentId; name:string; benefit:string
  massKg:number; watts:number; dataGb:number; costM:number; science:number
}
export const INSTRUMENTS: readonly Instrument[] = [
  {id:'camera',name:'Cámara orbital',benefit:'Cartografía del relieve',massKg:35,watts:45,dataGb:8,costM:8,science:25},
  {id:'spectrometer',name:'Espectrómetro',benefit:'Estudio de minerales',massKg:45,watts:55,dataGb:6,costM:11,science:26},
  {id:'radar',name:'Radar de exploración',benefit:'Investigación del subsuelo',massKg:95,watts:110,dataGb:16,costM:23,science:43},
]
export const ORBITS = [
  {id:'polar-low',name:'Polar baja',reach:1,rate:18,description:'Buen detalle del polo; ventanas de comunicación limitadas.'},
  {id:'polar-high',name:'Polar alta',reach:0.82,rate:22,description:'Menor detalle; mayor tiempo de comunicación.'},
  {id:'inclined',name:'Inclinada',reach:0.48,rate:27,description:'Más acceso a otras regiones, menor cobertura del polo.'},
] as const
export const LAUNCHERS = [
  {id:'aurora',name:'AURORA-S',maxMass:520,costM:26},
  {id:'atlas',name:'ATLAS-T',maxMass:740,costM:45},
] as const
export interface DesignConfig {
  instruments:InstrumentId[]; orbit:OrbitId; launcher:LauncherId
  solarUpgrade:boolean; commUpgrade:boolean
}
export const INITIAL_DESIGN:DesignConfig = {
  instruments:['camera'],orbit:'polar-low',launcher:'aurora',solarUpgrade:false,commUpgrade:false
}
export interface DesignEvaluation {
  total:{mass:number;power:number;data:number;cost:number;science:number}
  capacity:{mass:number;power:number;data:number;budget:number}
  orbitName:string;launcherName:string;problems:string[];ready:boolean
}
export function evaluateDesign(config:DesignConfig):DesignEvaluation {
  const selected=INSTRUMENTS.filter(x=>config.instruments.includes(x.id))
  const orbit=ORBITS.find(x=>x.id===config.orbit)??ORBITS[0]
  const launch=LAUNCHERS.find(x=>x.id===config.launcher)??LAUNCHERS[0]
  const total={
    mass:225+selected.reduce((s,x)=>s+x.massKg,0)+(config.solarUpgrade?30:0)+(config.commUpgrade?25:0),
    power:128+selected.reduce((s,x)=>s+x.watts,0),
    data:2+selected.reduce((s,x)=>s+x.dataGb,0),
    cost:28+launch.costM+selected.reduce((s,x)=>s+x.costM,0)+(config.solarUpgrade?11:0)+(config.commUpgrade?12:0),
    science:Math.round(selected.reduce((s,x)=>s+x.science,0)*orbit.reach),
  }
  const capacity={
    mass:launch.maxMass,power:310+(config.solarUpgrade?170:0),
    data:orbit.rate+(config.commUpgrade?14:0),budget:105
  }
  const problems:string[]=[]
  if(!selected.length)problems.push('Falta un instrumento científico.')
  if(total.mass>capacity.mass)problems.push('La masa excede la capacidad del lanzador.')
  if(total.power>capacity.power)problems.push('El consumo supera la potencia disponible.')
  if(total.data>capacity.data)problems.push('Se generan más datos de los que puede transmitir el enlace.')
  if(total.cost>capacity.budget)problems.push('La misión supera el presupuesto.')
  return {total,capacity,orbitName:orbit.name,launcherName:launch.name,problems,ready:problems.length===0}
}
export type OperationChoice = 'observe'|'calibrate'|'conserve'|'downlink'|'relay'|'prioritize'|'safemode'|'emergency'|'science'
export interface OperationOption {
  id:OperationChoice;name:string;effect:string
  battery:number;generated:number;transmit:boolean;science:number
}
export interface OperationEvent {
  name:string;message:string;options:OperationOption[]
}
export const OPERATION_EVENTS:readonly OperationEvent[]=[
  {name:'Primera observación',message:'El satélite llegó a la órbita planeada. Debes decidir cómo iniciar la campaña científica.',options:[
    {id:'observe',name:'Observación intensa',effect:'Más datos, mayor consumo.',battery:-18,generated:14,transmit:false,science:15},
    {id:'calibrate',name:'Calibrar instrumentos',effect:'Reduce riesgos y genera un ensayo menor.',battery:-7,generated:5,transmit:false,science:7},
    {id:'conserve',name:'Conservar energía',effect:'Recarga baterías; obtienes menos ciencia.',battery:12,generated:0,transmit:false,science:0},
  ]},
  {name:'Ventana de comunicaciones',message:'Se abre una ventana de transmisión con la Tierra. Tu almacenamiento no es infinito.',options:[
    {id:'downlink',name:'Enviar datos',effect:'Descarga datos científicos antes de llenar memoria.',battery:-10,generated:0,transmit:true,science:6},
    {id:'relay',name:'Adquirir más observaciones',effect:'Más información, pero aumenta el almacenamiento.',battery:-19,generated:16,transmit:false,science:16},
    {id:'prioritize',name:'Preparar el próximo pase',effect:'Mejora la reserva para una operación posterior.',battery:7,generated:0,transmit:false,science:2},
  ]},
  {name:'Eclipse sobre el polo',message:'Una fase sin iluminación solar reduce la energía disponible. Hay que priorizar.',options:[
    {id:'safemode',name:'Modo seguro',effect:'Protege baterías; suspende observaciones.',battery:18,generated:0,transmit:false,science:0},
    {id:'emergency',name:'Transmitir antes del eclipse',effect:'Baja la batería, recupera datos valiosos.',battery:-15,generated:0,transmit:true,science:9},
    {id:'science',name:'Último barrido',effect:'Aumenta ciencia, arriesga batería y memoria.',battery:-29,generated:12,transmit:false,science:18},
  ]},
]
export interface OperationState {
  step:number;battery:number;stored:number;delivered:number;science:number
  status:'running'|'completed'|'failed';history:string[]
}
export function startOperations():OperationState {
  return {step:0,battery:63,stored:0,delivered:0,science:0,status:'running',history:[]}
}
export function applyOperation(state:OperationState,choice:OperationChoice,design:DesignEvaluation):OperationState {
  if(!design.ready || state.status!=='running')return state
  const event=OPERATION_EVENTS[state.step]
  const action=event?.options.find(o=>o.id===choice)
  if(!event||!action)return state
  const generated=Math.min(action.generated,design.total.data)
  const sent=action.transmit?Math.min(state.stored,design.capacity.data):0
  const stored=state.stored+generated-sent
  const battery=Math.max(0,Math.min(100,state.battery+action.battery))
  const failed=battery===0||stored>36
  const step=state.step+1
  return {step,battery,stored,delivered:state.delivered+sent,
    science:state.science+action.science,status:failed?'failed':step>=OPERATION_EVENTS.length?'completed':'running',
    history:[...state.history,event.name+': '+action.name+'. '+action.effect]}
}
export function missionScore(state:OperationState,design:DesignEvaluation):number {
  if(!design.ready)return 0
  const possibleScience=Math.min(100,design.total.science)
  const communication=Math.min(100,state.delivered*4)
  const exploration=Math.min(100,state.science*2)
  const result=0.35*possibleScience+0.25*communication+0.25*exploration+0.15*state.battery
  return Math.max(0,Math.round(result*(state.status==='failed'?0.35:1)))
}
