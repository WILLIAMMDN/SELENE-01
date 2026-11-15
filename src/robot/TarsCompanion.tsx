import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { Solid, toon } from '../world/ArtKit'
import { HUMAN_SCALE, MOTION_SCALE } from '../world/physicalScale'

export const TARS_MODEL_URL=`${import.meta.env.BASE_URL}models/companions/tars_selene01.glb?v=tars01-2`
export type CrewId='crew-1'|'crew-2'|'crew-3'|'crew-4'
export type CrewTarget={id:CrewId;body:RefObject<T.Group|null>}

// Fallback used only while loading or if a replacement asset cannot be displayed.
type Motion='idle'|'walk'|'run'
function Proxy(){return <group position={[0,.55,0]} scale={.7}>
 <Solid kind="sphere" scale={[.6,.5,.47]} color="#ede7d3"/><Solid position={[0,.02,.39]} scale={[.8,.37,.16]} color="#26343a"/>
 {[-.19,.19].map(x=><Solid key={x} kind="sphere" position={[x,.03,.49]} scale={[.07,.1,.03]} color="#83ccc5" outline={false}/>)}
 <Solid kind="cylinder" position={[0,.65,0]} scale={[.04,.4,.04]} color="#457d80"/><Solid kind="sphere" position={[0,.88,0]} scale={.12} color="#c67a5f"/>
 </group>}
function Model({motion,reduced}:{motion:RefObject<Motion>;reduced:boolean}){
 const {scene,animations}=useGLTF(TARS_MODEL_URL)
 const model=useMemo(()=>{
  const object=clone(scene);let count=0
  object.traverse(child=>{if(child instanceof T.Mesh){count++;child.castShadow=true;child.receiveShadow=true
   const convert=(source:T.Material)=>{
    const m=source as T.MeshStandardMaterial
    const material=new T.MeshToonMaterial({color:m.color??new T.Color('#dce0d5'),map:m.map??null,vertexColors:m.vertexColors,gradientMap:toon('#dce0d5').gradientMap,transparent:source.transparent,opacity:source.opacity,side:source.side,alphaTest:source.alphaTest})
    if(m.emissive)material.emissive.copy(m.emissive)
    material.emissiveMap=m.emissiveMap??null;material.emissiveIntensity=m.emissiveIntensity??1
    return material
   }
   child.material=Array.isArray(child.material)?child.material.map(convert):convert(child.material)
  }})
  if(!count)return null
  const box=new T.Box3().setFromObject(object),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3())
  const scale=HUMAN_SCALE.tarsHeight/Math.max(size.y,.001)
  const normalized=new T.Group()
  normalized.add(object);normalized.scale.setScalar(scale)
  normalized.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale)
  return normalized
 },[scene])
 const playback=useMemo(()=>{
  if(!model)return null
  const mixer=new T.AnimationMixer(model)
  const actions:Partial<Record<Motion,T.AnimationAction>>={}
  for(const [motionName,clipName] of Object.entries({idle:'TARS_Idle',walk:'TARS_Walk',run:'TARS_Run_Wheel'})){
   const original=animations.find(clip=>clip.name===clipName);if(!original)continue
   const clip=original.clone()
   // World movement belongs to Follower; retain vertical motion and the wheel rotation.
   for(const track of clip.tracks){if(track.name==='Root.position'){
    const x=track.values[0],z=track.values[2]
    for(let i=0;i<track.values.length;i+=3){track.values[i]=x;track.values[i+2]=z}
   }}
   actions[motionName as Motion]=mixer.clipAction(clip)
  }
  return {mixer,actions}
 },[model,animations])
 const active=useRef<T.AnimationAction|null>(null)
 useEffect(()=>()=>{if(playback&&model){playback.mixer.stopAllAction();}active.current=null},[playback,model])
 useFrame((_,delta)=>{
  if(!playback)return
  const next=playback.actions[motion.current]??playback.actions.idle
  if(next&&active.current!==next){
   if(reduced&&motion.current==='idle'){active.current?.stop();next.reset().stopFading().setEffectiveWeight(1).play();playback.mixer.update(0)}
   else{active.current?.fadeOut(.18);next.reset().fadeIn(.18).play()}
   active.current=next
  }
  if(!(reduced&&motion.current==='idle'))playback.mixer.update(Math.min(delta,.05))
 })
 return model?<primitive object={model} dispose={null}/>:<Proxy/>
}
class ModelBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<Proxy/>:this.props.children}}

function Follower({target,height,canWalk,reduced}:{target:CrewTarget;height:(x:number,z:number)=>number;canWalk:(x:number,z:number)=>boolean;reduced:boolean}){
 const ref=useRef<T.Group>(null),next=useRef(new T.Vector3()),lastPlayer=useRef(new T.Vector3()),initialized=useRef(false),motion=useRef<Motion>('idle')
 useFrame((_,rawDelta)=>{
  const player=target.body.current,body=ref.current;if(!player||!body)return
  const delta=Math.min(rawDelta,.05),p=player.position,a=player.rotation.y
  const travelled=initialized.current?Math.hypot(p.x-lastPlayer.current.x,p.z-lastPlayer.current.z):0
  const speed=travelled/Math.max(delta,.001)
  motion.current=travelled>3?'idle':speed>(MOTION_SCALE.walk+MOTION_SCALE.run)/2?'run':speed>.12?'walk':'idle'
  lastPlayer.current.copy(p);initialized.current=true
  let x=p.x+Math.cos(a)*1.8-Math.sin(a)*.6,z=p.z-Math.sin(a)*1.8-Math.cos(a)*.6
  if(!canWalk(x,z)){x=p.x;z=p.z}
  const clearance=.015
  next.current.set(x,height(x,z)+clearance,z)
  if(body.position.distanceToSquared(next.current)>400)body.position.copy(next.current)
  else body.position.lerp(next.current,1-Math.exp(-delta*5))
  body.position.y=height(body.position.x,body.position.z)+clearance
  const diff=Math.atan2(Math.sin(a-body.rotation.y),Math.cos(a-body.rotation.y));body.rotation.y+=diff*Math.min(1,delta*7)
 })
 return <group ref={ref} name={`tars-${target.id}`} userData={{crewId:target.id}}><ModelBoundary><Suspense fallback={<Proxy/>}><Model motion={motion} reduced={reduced}/></Suspense></ModelBoundary></group>
}

/** Each actual crew avatar gets an independent clone and follower. Network avatars are supplied by the caller. */
export default function TarsCompanions({targets,height,canWalk,reduced=false}:{targets:CrewTarget[];height:(x:number,z:number)=>number;canWalk:(x:number,z:number)=>boolean;reduced?:boolean}){
 return <>{targets.slice(0,4).map(target=><Follower key={target.id} target={target} height={height} canWalk={canWalk} reduced={reduced}/>)}</>
}
