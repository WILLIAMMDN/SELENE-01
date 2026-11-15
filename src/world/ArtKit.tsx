import { HUMAN_SCALE } from './physicalScale'
import { useMemo } from 'react'
import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE as P } from './worldData'

const gradient=new T.DataTexture(new Uint8Array([105,105,105,255,181,181,181,255,255,255,255,255]),3,1,T.RGBAFormat)
gradient.minFilter=gradient.magFilter=T.NearestFilter;gradient.needsUpdate=true
const materials=new Map<string,T.MeshToonMaterial>()
export function toon(color:string) { if(!materials.has(color))materials.set(color,new T.MeshToonMaterial({color,gradientMap:gradient}));return materials.get(color)! }
const ink=new T.ShaderMaterial({side:T.BackSide,uniforms:{ink:{value:new T.Color(P.ink)},thickness:{value:.026}},vertexShader:'uniform float thickness; void main(){ vec4 p=modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal); p.xyz+=n*thickness; gl_Position=projectionMatrix*p; }',fragmentShader:'uniform vec3 ink; void main(){gl_FragColor=vec4(ink,1.); #include <colorspace_fragment> }'.replace('; #include',';\n#include')})
const geo={box:new T.BoxGeometry(1,1,1),round:new RoundedBoxGeometry(1,1,1,3,.14),sphere:new T.SphereGeometry(1,20,14),cylinder:new T.CylinderGeometry(1,1,1,24),cone:new T.ConeGeometry(1,1,24),capsule:new T.CapsuleGeometry(.5,1,6,16),torus:new T.TorusGeometry(1,.055,8,48)}
type Vec=[number,number,number]
type SolidProps={kind?:keyof typeof geo;color?:string;position?:Vec;scale?:Vec|number;rotation?:Vec;outline?:boolean;shadow?:boolean}
export function Solid({kind='round',color=P.paper,position,scale,rotation,outline=true,shadow=true}:SolidProps){return <group position={position} rotation={rotation} scale={scale}><mesh geometry={geo[kind]} material={toon(color)} castShadow={shadow} receiveShadow/>{outline&&<mesh geometry={geo[kind]} material={ink}/>}</group>}
export function Stroke({points,color=P.ink,width=.026}:{points:Vec[];color?:string;width?:number}){
  const geometry=useMemo(()=>new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(2,points.length*3),width,4,false),[points,width])
  return <mesh geometry={geometry} material={toon(color)}/>
}
const labels=new Map<string,T.CanvasTexture>()
function labelTexture(text:string,sub:string,bg:string,fg:string){
  const key=[text,sub,bg,fg].join('|');if(labels.has(key))return labels.get(key)!
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!
  const draw=()=>{
   ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.strokeStyle=fg;ctx.lineWidth=5;ctx.strokeRect(13,13,998,230)
   ctx.textAlign='center';ctx.fillStyle=fg;ctx.font='76px "Patrick Hand", "Trebuchet MS", sans-serif';ctx.fillText(text,512,sub?113:151,940)
   if(sub){ctx.font='32px "Patrick Hand", "Trebuchet MS", sans-serif';ctx.fillText(sub,512,184,940)}
   ctx.lineWidth=2;for(let i=0;i<8;i++){const x=30+i*133;ctx.beginPath();ctx.moveTo(x,233);ctx.lineTo(x+23,231);ctx.stroke()}
  }
  draw();const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8
  void document.fonts.load('24px "Patrick Hand"').then(()=>{draw();tex.needsUpdate=true}).catch(()=>{})
  labels.set(key,tex);return tex
}
export function Sign({text,sub='',position,rotation,scale=[5,1.25,1],bg=P.cream,fg=P.ink}:{text:string;sub?:string;position:Vec;rotation?:Vec;scale?:Vec;bg?:string;fg?:string}){
  const map=labelTexture(text,sub,bg,fg)
  return <mesh position={position} rotation={rotation} scale={scale}><planeGeometry/><meshBasicMaterial map={map} side={T.DoubleSide} transparent={false}/></mesh>
}
export function Window({position,scale=[1.4,1.8,.14]}:{position:Vec;scale?:Vec}){return <group position={position}>
  <Solid scale={[scale[0]+.18,scale[1]+.18,scale[2]]} color={P.ink}/><Solid position={[0,0,.09]} scale={scale} color={P.teal} outline={false}/>
  <Solid position={[-scale[0]*.2,scale[1]*.15,.18]} scale={[scale[0]*.14,scale[1]*.65,.02]} color="#a9cbc0" outline={false} shadow={false}/>
  <Solid position={[0,-scale[1]*.3,.19]} scale={[scale[0],.06,.03]} color={P.ink} outline={false} shadow={false}/>
</group>}
export function Door({position,color=P.coral}:{position:Vec;color?:string}){return <group position={position} scale={[HUMAN_SCALE.doorWidth/2.24,HUMAN_SCALE.doorHeight/3.5,.7]}>
  <Solid scale={[3.15,4.35,.42]} color={color}/><Solid position={[0,-.08,.24]} scale={[2.55,3.8,.2]} color={P.ink}/>
  <Solid position={[0,-.08,.38]} scale={[2.24,3.5,.12]} color={P.teal}/><Solid position={[0,0,.48]} scale={[.065,3.4,.04]} color={P.ink} outline={false}/>
  <Solid position={[.9,.2,.5]} scale={[.1,.6,.08]} color={P.aqua}/><Solid position={[0,2.5,.05]} scale={[3.7,.3,1.4]} color={P.cream}/>
</group>}
export function Solar({position=[0,0,0],rotation=0}:{position?:Vec;rotation?:number}){return <group position={position} rotation={[0,rotation,0]}>
  <Solid kind="cylinder" position={[0,1.4,0]} scale={[.16,2.8,.16]} color={P.ink}/>
  <group position={[0,2.9,0]} rotation={[-.3,0,0]}><Solid scale={[6,.18,3.3]} color={P.cream}/><Solid position={[0,.12,0]} scale={[5.7,.05,3]} color={P.teal}/>
  {[-2.2,-1.1,0,1.1,2.2].map(x=><Solid key={x} position={[x,.16,0]} scale={[.045,.025,3]} color="#92bdb7" outline={false} shadow={false}/>)}
  {[-.5,.5].map(z=><Solid key={z} position={[0,.16,z]} scale={[5.7,.025,.035]} color="#92bdb7" outline={false} shadow={false}/>)}</group>
</group>}
export function Tree({position,scale=1,variant=0}:{position:Vec;scale?:number;variant?:number}){return <group position={position} scale={scale}>
  <Solid kind="cylinder" position={[0,2.6,0]} scale={[.3,5.2,.3]} color="#75654f" outline={false}/>
  <Solid kind="sphere" position={[0,5.5,0]} scale={[2.3,3.2,2.1]} color={variant%2?'#66866f':'#7e9b7c'} outline={false}/>
  <Solid kind="sphere" position={[-1.2,4.7,.3]} scale={[1.7,2.2,1.6]} color="#86a083" outline={false}/>
  <Solid kind="sphere" position={[1.25,4.9,-.2]} scale={[1.3,2.15,1.4]} color="#769475" outline={false}/>
  <Stroke points={[[0,1,0],[.1,3,.1],[-.8,4.4,.5]]} color="#514e42" width={.05}/>
</group>}
export function Bench({position,rotation=0}:{position:Vec;rotation?:number}){return <group position={position} rotation={[0,rotation,0]}>
  <Solid position={[0,HUMAN_SCALE.benchSeatHeight-.045,0]} scale={[1.8,.09,.46]} color="#b29070"/>
  <Solid position={[0,.74,-.21]} scale={[1.8,.62,.08]} color="#b29070"/>
  {[-.65,.65].map(x=><Solid key={x} position={[x,.2,0]} scale={[.08,.4,.42]} color={P.ink}/>)}
</group>}
export function Lamp({position}:{position:Vec}){return <group position={position}>
  <Solid kind="cylinder" position={[0,1.9,0]} scale={[.07,3.8,.07]} color={P.ink} outline={false}/><Solid position={[.28,3.8,0]} scale={[.9,.16,.45]} color={P.ink}/><Solid position={[.28,3.69,0]} scale={[.65,.08,.3]} color="#f2dfaa" outline={false}/>
</group>}
