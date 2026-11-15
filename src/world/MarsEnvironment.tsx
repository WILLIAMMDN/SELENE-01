import OdysseyLander from '../spacecraft/OdysseyLander'
import { roadTexture, ROAD_GLSL } from './IllustratedTerrain'
import { INTERIOR_STATIONS } from './buildingNavigation'
import { insideBuilding } from './campusLayout'
import ArtemisaBuildings from './ArtemisaBuildings'
import Rober from './Rober'
import { OdysseyDisplay } from '../spacecraft/OdysseyShip'
import { memo, useMemo } from 'react'
import * as T from 'three'
import { Solid, Sign, Stroke, toon } from './ArtKit'
import { marsHeight as height, marsCanWalk, MARS_SECTORS } from './worldConfig'

// Original illustrated palette: paper highlights, dry ochre, burgundy and graphite.
const C={sand:'#c49576',light:'#ddbd91',rust:'#a96d56',dark:'#79575a',ink:'#554747',paper:'#e0d9be',red:'#974f58',teal:'#527c7d'}
function inkTexture(){
 const c=document.createElement('canvas');c.width=c.height=2048;const ctx=c.getContext('2d')!;ctx.fillStyle=C.sand;ctx.fillRect(0,0,2048,2048)
 let seed=913;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
 for(let i=0;i<330;i++){
  const x=rand()*2048,y=rand()*2048,r=10+rand()*45;ctx.beginPath()
  for(let j=0;j<13;j++){const a=j/12*Math.PI*2,rr=r*(.65+rand()*.5),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.5;j?ctx.lineTo(px,py):ctx.moveTo(px,py)}
  ctx.closePath();ctx.fillStyle=i%5===0?C.rust:C.light;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.3;ctx.stroke()
  if(i%2===0){ctx.beginPath();ctx.moveTo(x-r*.4,y);ctx.lineTo(x-r*.1,y+r*.15);ctx.lineTo(x+r*.3,y-r*.1);ctx.stroke()}
 }
 for(let i=0;i<430;i++){const x=rand()*2048,y=rand()*2048;ctx.strokeStyle='#886657';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4+rand()*12,y-2-rand()*3);ctx.stroke()}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(7,7);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t
}
function MarsGround(){
 const map=useMemo(inkTexture,[])
 const geo=useMemo(()=>{const g=new T.PlaneGeometry(650,650,240,240);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));g.computeVertexNormals();return g},[])
 const material=useMemo(()=>{const m=new T.MeshToonMaterial({map,color:'white',gradientMap:toon(C.sand).gradientMap}),roads=roadTexture(650,true)
 m.onBeforeCompile=shader=>{shader.uniforms.roadMap={value:roads};shader.vertexShader='varying vec2 landXZ;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nlandXZ=(modelMatrix*vec4(position,1.)).xz;');shader.fragmentShader=ROAD_GLSL+'varying vec2 landXZ;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=drawRoad(landXZ,diffuseColor.rgb,vec3(.61,.43,.28),vec3(.72,.53,.33));')};return m},[map])
 return <mesh geometry={geo} material={material} receiveShadow/>
}

function Rock({x,z,s=1,index=0}:{x:number;z:number;s?:number;index?:number}){
 const g=useMemo(()=>{const geo=new T.SphereGeometry(1,12,8);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),q=1+.12*Math.sin(x*6+y*4+z*5+index);p.setXYZ(i,x*q,y*(1+.08*Math.cos(x*4+z*3)),z*q)}geo.computeVertexNormals();return geo},[index])
 return <group position={[x,height(x,z)+s*.35,z]} scale={[s,s*.65,s*.8]}><mesh geometry={g} material={toon(index%3?C.light:C.rust)} castShadow receiveShadow/>
 <Stroke points={[[-.8,.15,.5],[-.25,.55,.73],[.1,.3,.9],[.48,.4,.7]]} color={C.ink} width={.016}/>
 <Stroke points={[[.1,.3,.9],[.16,-.2,.91],[.4,-.4,.76]]} color={C.ink} width={.013}/>
 </group>
}
function Mesa({x,z,r,h,index=0}:{x:number;z:number;r:number;h:number;index?:number}){
 const rings=useMemo(()=>Array.from({length:6},(_,j)=>Array.from({length:33},(_,i)=>{const a=i/32*Math.PI*2;const radius=r*(1-j*.075)*(1+.06*Math.sin(a*5+index));return [Math.cos(a)*radius,j*h/5+Math.sin(a*3+j)*.25,Math.sin(a)*radius] as [number,number,number]})),[r,h,index])
 const geo=useMemo(()=>{const vertices:number[]=[],indices:number[]=[];rings.forEach(row=>row.forEach(p=>vertices.push(...p)));for(let j=0;j<5;j++)for(let i=0;i<32;i++){const a=j*33+i,b=a+33;indices.push(a,b,a+1,a+1,b,b+1)}vertices.push(0,h,0);const center=vertices.length/3-1;for(let i=0;i<32;i++)indices.push(center,5*33+i+1,5*33+i);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g},[rings,h])
 return <group position={[x,height(x,z)-1,z]}><mesh geometry={geo} material={toon(index%2?C.rust:C.light)} castShadow receiveShadow/>{rings.filter((_,i)=>i%2===1).map((points,i)=><Stroke key={i} points={points} color={C.ink} width={.035}/>)}
 {[.5,2,3.8,5.3].map(a=><Stroke key={a} points={[[Math.cos(a)*r*.9,h*.2,Math.sin(a)*r*.9],[Math.cos(a+.04)*r*.8,h*.45,Math.sin(a+.04)*r*.8],[Math.cos(a)*r*.68,h*.8,Math.sin(a)*r*.68]]} color={C.ink} width={.025}/>)}
 </group>
}

function SurfaceMarks(){return <>
 {Array.from({length:28},(_,i)=>{const z=11+i*.85,x=1.4+Math.sin(i*.15)*.2;return [-1,1].map(s=><Solid key={`${i}${s}`} position={[x+s*.3,height(x+s*.3,z)+.13,z]} rotation={[-Math.PI/2,0,s*.12]} scale={[.13,.3,.018]} color="#a77b62" outline={false} shadow={false}/>)})}
 {[[-7,27],[5,18],[-30,10],[43,-8],[-42,-9],[57,-22],[-26,46]].map(([x,z],i)=><group key={i} position={[x,height(x,z),z]}><Solid kind="cylinder" position={[0,1.5,0]} scale={[.07,3,.07]} color={C.ink}/><Sign text={i%2?'ARES →':'← ARES'} position={[0,2.7,0]} scale={[2.4,.6,1]} bg={i%2?C.teal:C.paper} fg={i%2?C.paper:C.ink}/></group>)}
 </>}
export default memo(function MarsEnvironment({reduced=false,paused=false}:{reduced?:boolean;paused?:boolean}){return <>
 <MarsGround/>
 <ArtemisaBuildings height={height}/>{INTERIOR_STATIONS.filter(st=>st.room!=='hangar').map(st=><Sign key={st.room} text="E / ESTACIÓN" position={[st.x,height(st.x,st.z)+2,st.z]} scale={[1.2,.3,1]}/>)}<OdysseyLander x={61} z={-57} height={height} paused={paused}/><Rober position={[35,height(35,9),9]} height={height} canWalk={marsCanWalk} reduced={reduced} paused={paused}/><OdysseyDisplay position={[49,height(49,-16),-16]}/>
 <group position={[-51,height(-51,42),42]}><Solid kind="cylinder" position={[0,0,0]} scale={[7,.2,7]} color={C.paper} outline={false}/><Solid kind="cylinder" position={[0,1.2,0]} scale={[.15,2.4,.15]} color={C.teal}/><Solid position={[0,2.5,0]} scale={[2,.25,1]} rotation={[.3,0,0]} color={C.teal}/><Sign text="05 / ESTRATOS" sub="OBSERVAR · COMPARAR · APRENDER" position={[0,3.5,0]} scale={[5,1.25,1]}/></group>
 <SurfaceMarks/>
 {[[ -35,28,7,5],[ -60,58,12,10],[-73,39,10,8],[70,54,11,5],[92,35,14,9],[76,1,9,6],[-22,-68,17,12],[25,-83,12,8]].filter(([x,z,r])=>!insideBuilding(x,z,r+1)).map(([x,z,r,h],i)=><Mesa key={i} x={x} z={z} r={r} h={h} index={i}/>)}
 {Array.from({length:18},(_,i)=>{const a=i*Math.PI*2/18,r=198+i%3*21;return <Mesa key={i} x={Math.sin(a)*r} z={Math.cos(a)*r} r={22+i%4*7} h={18+i%5*6} index={i}/>})}
 {Array.from({length:90},(_,i)=>{const a=i*2.399,r=36+(i%11)*10,x=Math.sin(a)*r,z=Math.cos(a)*r;const clear=insideBuilding(x,z,3)||MARS_SECTORS.some(s=>Math.hypot(x-s.x,z-s.z)<19);return clear?null:<Rock key={i} x={x} z={z} s={.4+(i%5)*.45} index={i}/>})}
 </>})
