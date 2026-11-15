import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import * as T from 'three'
import { toon } from './ArtKit'
import { HUMAN_SCALE } from './physicalScale'
import type { CharacterMotion } from './characterMotion'

export default function ExplorerCharacter({motion,paused=false,reduced=false}:{motion:RefObject<CharacterMotion>;paused?:boolean;reduced?:boolean}){
 const {scene,animations}=useGLTF(`${import.meta.env.BASE_URL}models/characters/quaternius/explorer.glb`)
 const asset=useMemo(()=>{
  const actor=clone(scene),meshes:T.Mesh[]=[]
  actor.traverse(n=>{if(n instanceof T.Mesh)meshes.push(n)})
  for(const mesh of meshes){
   const geometry=mesh.geometry.clone();geometry.deleteAttribute('normal');mesh.geometry=mergeVertices(geometry,.0001);mesh.geometry.computeVertexNormals();geometry.dispose()
   const convert=(source:T.Material)=>{const old=source as T.MeshStandardMaterial;const color=source.name==='Shirt'?'#e6e5d0':source.name==='Pants'?'#a95b60':source.name==='Hair'?'#454554':source.name==='Belt'?'#477f7f':old.color;return new T.MeshToonMaterial({color,map:old.map,gradientMap:toon('#e6e5d0').gradientMap,side:T.DoubleSide})}
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false
   const mat=new T.MeshBasicMaterial({color:'#303d43',side:T.BackSide});mat.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * .009;')}
   const ink=mesh instanceof T.SkinnedMesh?new T.SkinnedMesh(mesh.geometry,mat):new T.Mesh(mesh.geometry,mat)
   if(ink instanceof T.SkinnedMesh&&mesh instanceof T.SkinnedMesh){ink.bind(mesh.skeleton,mesh.bindMatrix);ink.bindMatrixInverse.copy(mesh.bindMatrixInverse)}
   ink.position.copy(mesh.position);ink.quaternion.copy(mesh.quaternion);ink.scale.copy(mesh.scale);ink.frustumCulled=false;mesh.parent?.add(ink)
  }
  actor.updateMatrixWorld(true);actor.traverse(n=>{if(n instanceof T.SkinnedMesh)n.skeleton.update()})
  const bounds=new T.Box3().setFromObject(actor),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=HUMAN_SCALE.stature/size.y
  const root=new T.Group();root.add(actor);root.scale.setScalar(scale);root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)
  const mixer=new T.AnimationMixer(actor),actions:Record<string,T.AnimationAction>={}
  for(const source of animations){const clip=source.clone();const action=mixer.clipAction(clip);if(!['Idle','Walk','Run'].includes(clip.name)){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true}actions[clip.name]=action}
  return {root,mixer,actions}
 },[scene,animations])
 const active=useRef<T.AnimationAction|null>(null),phase=useRef(''),preview=useRef<string|null>(null)
 useEffect(()=>{
  const perform=(event:Event)=>{const name=(event as CustomEvent<string>).detail;if(['PickUp','Punch','RecieveHit'].includes(name)){preview.current=name;phase.current=''}}
  window.addEventListener('selene-avatar-preview',perform)
  return()=>{window.removeEventListener('selene-avatar-preview',perform);asset.mixer.stopAllAction();active.current=null;phase.current=''}
 },[asset])
 useFrame((_,rawDelta)=>{
  if(paused)return
  const dt=Math.min(rawDelta,.05),state=motion.current
  if(state.speed>.08||state.phase!=='ground')preview.current=null
  const seated=['Sit_Down','Sit_Idle','Stand_Up'].includes(state.clip)
  const name=preview.current??(seated?'SitDown':state.clip==='Interact'||state.clip==='Pick_Up'||state.clip==='Use_Panel'?'PickUp':state.speed>2.5?'Run':state.speed>.08?'Walk':'Idle')
  const action=asset.actions[name]??asset.actions.Idle,key=seated?state.clip:preview.current??name
  if(action&&(active.current!==action||phase.current!==key)){
   active.current?.fadeOut(.15);action.reset().fadeIn(.15).play()
   if(state.clip==='Sit_Idle'){action.time=action.getClip().duration;action.paused=true}
   if(state.clip==='Stand_Up')action.time=action.getClip().duration
   active.current=action;phase.current=key
  }
  if(action){action.paused=state.clip==='Sit_Idle'||(reduced&&name==='Idle');action.setEffectiveTimeScale(state.clip==='Stand_Up'?-action.getClip().duration/.933:name==='SitDown'?action.getClip().duration/.933:name==='Run'?state.speed/3.5:name==='Walk'?(state.clip==='Walk_Back'?-1:1)*state.speed/1.4:1)}
  asset.mixer.update(dt)
  if(preview.current&&action.time>=action.getClip().duration){preview.current=null;phase.current=''}
 })
 return <primitive object={asset.root} dispose={null}/>
}
