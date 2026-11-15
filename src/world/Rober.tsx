import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Html, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { NASA_DIMENSIONS } from './physicalScale'
import { toon, Sign } from './ArtKit'
import { roberRemote } from './roberControl'

type Mode='scan'|'drive'|'rough'|'turn'|'drill'|'stop'
type Props={position:[number,number,number];height:(x:number,z:number)=>number;canWalk:(x:number,z:number)=>boolean;reduced?:boolean;paused?:boolean}
const CLIPS={scan:'Rover_Idle_Scan',drive:'Rover_Drive_Forward',rough:'Rover_Rough_Terrain',turn:'Rover_Steer_Turn',drill:'Rover_Arm_Drill'} as const
const LABELS:{id:Mode;label:string}[]=[{id:'scan',label:'Escanear con el mástil'},{id:'drive',label:'Conducción'},{id:'rough',label:'Terreno irregular'},{id:'turn',label:'Demostrar giro'},{id:'drill',label:'Brazo y perforación'},{id:'stop',label:'Detener'}]
const tint=(name:string)=>/Oscuro/.test(name)?'#344348':/Naranja/.test(name)?'#c67a5f':/Cian/.test(name)?'#83ccc5':/Medio/.test(name)?'#78918a':'#dce0d5'

function RoberModel({position,height,canWalk,reduced=false,paused=false}:Props){
 const {scene,animations}=useGLTF(`${import.meta.env.BASE_URL}models/rober/ROBER.glb?v=rober-1`)
 const body=useRef<T.Group>(null),panel=useRef<HTMLDivElement>(null),keys=useRef(new Set<string>())
 const [open,setOpen]=useState(false),[mode,setMode]=useState<Mode>('scan'),[cycles,setCycles]=useState(0)
 const modeRef=useRef<Mode>('scan'),drillTime=useRef(0),active=useRef<T.AnimationAction|null>(null),location=useRef({x:position[0],z:position[2],yaw:-.4})
 const asset=useMemo(()=>{
  const actor=clone(scene),materials=new Map<T.Material,T.Material>(),meshes:T.Mesh[]=[]
  actor.traverse(node=>{if(node instanceof T.Mesh)meshes.push(node)})
  for(const mesh of meshes){
   const convert=(source:T.Material)=>{
    if(materials.has(source))return materials.get(source)!
    const original=source as T.MeshStandardMaterial
    const material=new T.MeshToonMaterial({color:tint(source.name),map:original.map??null,gradientMap:toon('#dce0d5').gradientMap,side:original.side,alphaTest:original.alphaTest,transparent:original.transparent,opacity:original.opacity})
    materials.set(source,material);return material
   }
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material)
   mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false
   const inkMaterial=new T.MeshBasicMaterial({color:'#26343a',side:T.BackSide})
   inkMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * 0.006;')}
   let ink:T.Mesh
   if(mesh instanceof T.SkinnedMesh){const skinned=new T.SkinnedMesh(mesh.geometry,inkMaterial);skinned.bind(mesh.skeleton,mesh.bindMatrix);skinned.bindMatrixInverse.copy(mesh.bindMatrixInverse);ink=skinned}
   else ink=new T.Mesh(mesh.geometry,inkMaterial)
   ink.position.copy(mesh.position);ink.quaternion.copy(mesh.quaternion);ink.scale.copy(mesh.scale);ink.frustumCulled=false;ink.name=`${mesh.name}_Ink`;mesh.parent?.add(ink)
  }
  actor.updateMatrixWorld(true);actor.traverse(n=>{if(n instanceof T.SkinnedMesh)n.skeleton.update()})
  // Determine the authored forward axis from the wheel rig, preserving the original proportions.
  const worldPosition=(name:string)=>actor.getObjectByName(name)?.getWorldPosition(new T.Vector3())??new T.Vector3()
  const front=worldPosition('Wheel_FL').add(worldPosition('Wheel_FR')).multiplyScalar(.5)
  const rear=worldPosition('Wheel_RL').add(worldPosition('Wheel_RR')).multiplyScalar(.5)
  const direction=front.sub(rear)
  const oriented=new T.Group();oriented.add(actor);oriented.rotation.y=-Math.atan2(direction.x,direction.z);oriented.updateMatrixWorld(true)
  const bounds=new T.Box3().setFromObject(oriented),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3())
  const scale=NASA_DIMENSIONS.perseverance.length/Math.max(size.z,.001)
  const normalized=new T.Group();normalized.add(oriented);normalized.scale.setScalar(scale);normalized.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)
  return {actor,normalized,radius:Math.max(size.x,size.z)*scale*.52}
 },[scene])
 const playback=useMemo(()=>{
  const mixer=new T.AnimationMixer(asset.actor),actions:Record<string,T.AnimationAction>={}
  const idle=animations.find(a=>a.name===CLIPS.scan)
  for(const original of animations){
   const clip=original.clone()
   for(const track of clip.tracks){
    if(track.name==='Root.position'||(track.name==='Root.quaternion'&&clip.name!==CLIPS.rough)){
     const base=idle?.tracks.find(t=>t.name===track.name),stride=track.getValueSize()
     if(base)for(let i=0;i<track.values.length;i++)track.values[i]=base.values[i%stride]
    }
   }
   const action=mixer.clipAction(clip)
   if(clip.name===CLIPS.drill){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true}
   actions[clip.name]=action
  }
  return {mixer,actions}
 },[asset,animations])
 const choose=(next:Mode)=>{keys.current.clear();modeRef.current=next;setMode(next);drillTime.current=0;if(next==='drill'){playback.actions[CLIPS.drill]?.reset();active.current=null}}
 useEffect(()=>{
  const target=body.current
  if(open&&!paused)roberRemote.current=target
  keys.current.clear()
  return()=>{if(roberRemote.current===target)roberRemote.current=null}
 },[open,paused])
 useEffect(()=>{
  const clear=()=>keys.current.clear()
  window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear)
  return()=>{clear();window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);playback.mixer.stopAllAction();active.current=null}
 },[playback])
 useFrame((_,rawDelta)=>{
  const group=body.current;if(!group)return
  const dt=Math.min(rawDelta,.05),p=location.current,current=modeRef.current
  const controlled=open&&!paused&&(current==='drive'||current==='rough')
  const forward=controlled?Number(keys.current.has('KeyW'))-Number(keys.current.has('KeyS')):0
  const steer=controlled?Number(keys.current.has('KeyA'))-Number(keys.current.has('KeyD')):0
  const turning=!paused&&current==='turn'
  if(!paused)p.yaw+=(turning?.5:steer*.8)*dt
  const velocity=current==='rough'?.55:1.1
  const nx=p.x+Math.sin(p.yaw)*forward*velocity*dt,nz=p.z+Math.cos(p.yaw)*forward*velocity*dt
  const clear=(x:number,z:number)=>[0,Math.PI/2,Math.PI,Math.PI*1.5].every(a=>canWalk(x+Math.sin(a)*asset.radius,z+Math.cos(a)*asset.radius))&&canWalk(x,z)
  const moving=!!forward&&clear(nx,nz)
  if(moving){p.x=nx;p.z=nz}
  const ground=height(p.x,p.z),s=Math.sin(p.yaw),c=Math.cos(p.yaw)
  const pitch=Math.atan2(height(p.x+s,p.z+c)-height(p.x-s,p.z-c),2)
  const roll=Math.atan2(height(p.x+c,p.z-s)-height(p.x-c,p.z+s),2)
  group.position.set(p.x,ground,p.z);group.rotation.set(0,p.yaw,0)
  group.rotateX(-T.MathUtils.clamp(pitch,-.3,.3));group.rotateZ(T.MathUtils.clamp(roll,-.3,.3))
  const clip=current==='stop'&&active.current?active.current.getClip().name:current==='drill'?CLIPS.drill:turning?CLIPS.turn:moving?current==='rough'?CLIPS.rough:steer?CLIPS.turn:CLIPS.drive:CLIPS.scan
  const action=playback.actions[clip]
  if(action&&active.current!==action){active.current?.fadeOut(.18);action.reset().fadeIn(.18).play();active.current=action}
  if(action){action.paused=paused||current==='stop'||(reduced&&clip===CLIPS.scan);action.setEffectiveTimeScale(moving&&forward<0?-1:1)}
  if(!paused){
   playback.mixer.update(dt)
   if(current==='drill'){
    drillTime.current+=dt
    if(drillTime.current>=(action?.getClip().duration??2.017)){setCycles(n=>n+1);choose('scan')}
   }
  }
 })
 const close=()=>{keys.current.clear();setOpen(false);choose('stop')}
 return <group ref={body} position={position}>
  <primitive object={asset.normalized} dispose={null} onClick={(e:{stopPropagation:()=>void})=>{e.stopPropagation();setOpen(true);requestAnimationFrame(()=>panel.current?.focus())}}/>
  <Html center position={[0,2.8,0]} zIndexRange={[8,4]}>
   <div className="rober-controls" onPointerDown={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>
    {!open?<button type="button" className="rober-open" onClick={()=>{setOpen(true);requestAnimationFrame(()=>panel.current?.focus())}}>ROBER · Control remoto</button>:<div ref={panel} role="dialog" aria-label="Control remoto de ROBER" tabIndex={0}
     onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))keys.current.clear()}}
     onKeyDown={e=>{const key=({ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'} as Record<string,string>)[e.code]??e.code;if(['KeyW','KeyA','KeyS','KeyD'].includes(key)){e.preventDefault();e.stopPropagation();keys.current.add(key)}if(e.code==='Escape'){e.stopPropagation();close()}}}
     onKeyUp={e=>{const key=({ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'} as Record<string,string>)[e.code]??e.code;keys.current.delete(key);e.stopPropagation()}}>
     <header><strong>ROBER</strong><button type="button" aria-label="Cerrar control de ROBER" onClick={close}>×</button></header>
     <p>Seis ruedas, mástil y brazo articulado. Elige conducción o terreno irregular y usa WASD aquí.</p>
     <div className="rober-modes">{LABELS.map(item=><button type="button" key={item.id} aria-pressed={mode===item.id} onClick={()=>choose(item.id)}>{item.label}</button>)}</div>
     {(mode==='drive'||mode==='rough')&&<div className="rober-pad">{[{key:'KeyW',label:'Avanzar'},{key:'KeyS',label:'Retroceder'},{key:'KeyA',label:'Izquierda'},{key:'KeyD',label:'Derecha'}].map(item=><button type="button" key={item.key} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(item.key)}} onPointerUp={()=>keys.current.delete(item.key)} onPointerCancel={()=>keys.current.delete(item.key)} onLostPointerCapture={()=>keys.current.delete(item.key)}>{item.label}</button>)}</div>}
     <small>Perforaciones animadas: {cycles}. Escaneo y perforación son demostraciones; no producen mediciones científicas.</small>
     <button type="button" onClick={()=>{location.current={x:position[0],z:position[2],yaw:-.4};choose('scan')}}>Volver al punto de inicio</button>
    </div>}
   </div>
  </Html>
 </group>
}
class RoberBoundary extends Component<{children:ReactNode;position:[number,number,number]},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<Sign text="ROBER / CARGA NO DISPONIBLE" position={this.props.position} scale={[3,.75,1]}/>:this.props.children}}
export default function Rober(props:Props){return <RoberBoundary position={props.position}><Suspense fallback={null}><RoberModel {...props}/></Suspense></RoberBoundary>}
