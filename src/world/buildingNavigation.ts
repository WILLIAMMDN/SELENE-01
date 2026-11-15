import { PARKING, LANDER_SITES, landingPadHeight } from './environmentLayout'
import { CAMPUS_BUILDINGS } from './campusLayout'
type Height=(x:number,z:number)=>number
export const occupant={x:0,z:37,active:true,earth:true}
export function foundation(b:typeof CAMPUS_BUILDINGS[number],height:Height){return Math.max(...[[-1,-1],[-1,1],[1,-1],[1,1],[0,0]].map(([x,z])=>height(b.x+x*b.width/2,b.z+z*b.depth/2)))+.16}
export function buildingAt(x:number,z:number,earth=true){
 if(earth&&Math.abs(x-24)<11.2&&z>-25.7&&z<-5.9)return 'hangar'
 return CAMPUS_BUILDINGS.find(b=>b.floors.some(f=>(b.id!=='habitat'||Math.hypot(x-b.x-f.x,z-b.z-f.z)<4.9)&&Math.abs(x-b.x-f.x)<f.hx&&Math.abs(z-b.z-f.z)<f.hz))?.id??null
}
export function buildingClear(x:number,z:number,radius=.22,earth=true){
 for(const b of CAMPUS_BUILDINGS){
  if(Math.abs(x-b.x)>b.width/2+1||Math.abs(z-b.z)>b.depth/2+1)continue
  if(b.id==='habitat'){const dx=x-b.x,dz=z-b.z+.3125,r=Math.hypot(dx,dz);if(r>4.65-radius&&r<5.15+radius&&!(dz>4&&Math.abs(dx)<.58-radius))return false}
  const floor=b.floors[0]?.top??.3
  if(b.blockers.some(o=>o.top>floor+.36&&o.bottom<floor+1.65&&Math.abs(x-b.x-o.x)<o.hx+radius&&Math.abs(z-b.z-o.z)<o.hz+radius))return false
 }
 // Industrial hangar: open central entrance, real wall shell, central spacecraft work area.
 if(earth&&Math.abs(x-24)<11.8&&z>-26.4&&z<-5.6){
  if(Math.abs(x-24)>11.15||z<-25.65||(z>-6.25&&Math.abs(x-24)>7))return false
  if(Math.hypot(x-24,z+18)<4)return false
 }
 return true
}
export function walkingHeight(x:number,z:number,terrain:Height,earth=true){
 const site=earth?LANDER_SITES.earth:LANDER_SITES.mars,d=Math.hypot(x-site.x,z-site.z)
 if(d<8.5){const pad=landingPadHeight(site.x,site.z,terrain),t=Math.max(0,Math.min(1,(8.5-d)/2.5));return terrain(x,z)+(pad-terrain(x,z))*t}
 if(earth&&PARKING.some(b=>Math.abs(x-b.x)<b.hx&&Math.abs(z-b.z)<b.hz))return terrain(x,z)+.13
 if(earth&&Math.abs(x-24)<12&&z>-27&&z<-4){
  const t=Math.max(0,Math.min(1,(-4-z)/2));return terrain(x,z)+.31*t
 }
 for(const b of CAMPUS_BUILDINGS){
  if(Math.abs(x-b.x)>b.width/2+2||Math.abs(z-b.z)>b.depth/2+3)continue
  const base=foundation(b,terrain)
  for(const floor of b.floors){
   if((b.id!=='habitat'||Math.hypot(x-b.x-floor.x,z-b.z-floor.z)<4.9)&&Math.abs(x-b.x-floor.x)<=floor.hx+.14&&Math.abs(z-b.z-floor.z)<=floor.hz+.14)return base+floor.top+.015
  }
  for(const door of b.doors){
   const floor=b.floors[0];if(!floor)continue
   const sign=door.z>floor.z?1:-1,dist=(z-b.z-door.z)*sign
   if(Math.abs(x-b.x-door.x)<Math.max(.8,door.hx+.2)&&dist>=-.3&&dist<2){const t=Math.max(0,Math.min(1,1-dist/2));return terrain(x,z)+(base+floor.top+.015-terrain(x,z))*t}
  }
 }
 return terrain(x,z)
}
export const INTERIOR_STATIONS=[
 {room:'laboratory',sector:'research' as const,x:-17,z:-2.2,label:'Mesa científica · Dra. Vega'},
 {room:'hangar',sector:'hangar' as const,x:18,z:-11,label:'Consola de ensamblaje ODYSSEY'},
 {room:'workshop',sector:'hangar' as const,x:23,z:13,label:'Banco de robótica y diseño'},
 {room:'communications',sector:'control' as const,x:-53,z:-31.5,label:'Terminal de enlace'},
 {room:'launch',sector:'launch' as const,x:61,z:-35,label:'Autorización de lanzamiento'},
 {room:'observatory',sector:'observatory' as const,x:-43,z:43,label:'Cuaderno de observación'},
]
export function stationAt(x:number,z:number,earth=true){const room=buildingAt(x,z,earth);return INTERIOR_STATIONS.find(s=>(s.room===room||s.room==='launch'||s.room==='observatory')&&Math.hypot(x-s.x,z-s.z)<2.6)}
