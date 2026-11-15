import { walkingHeight, buildingAt, occupant, stationAt } from './buildingNavigation'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Component, memo, Suspense, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react'
import * as T from 'three'
import Environment from './Environment'
import { roberRemote } from './roberControl'
import { useWorld } from './worldConfig'
import MarsEnvironment from './MarsEnvironment'
import TarsCompanions from '../robot/TarsCompanion'
import Astronaut from './Astronaut'
import ExplorerCharacter from './ExplorerCharacter'
import { MOTION_SCALE } from './physicalScale'
import { CHARACTER_KEYS, MOVEMENT_KEYS, createCharacterMotion, stepCharacter, type CharacterControls } from './characterMotion'
import { type SectorId, type ViewMode } from './worldData'

export type Travel = { id: SectorId | 'start'; serial: number; point?:[number,number] }
export type InputState = CharacterControls & { yaw: number; pitch: number; zoom: number }
export type PositionReport = { x: number; z: number; nearby: SectorId|null; fps: number;room?:string|null }
type SceneProps = { mode:ViewMode; tourIndex:number; travel:Travel; input:MutableRefObject<InputState>; paused:boolean; reduced:boolean; onPosition:(p:PositionReport)=>void; onInteract:(id:SectorId)=>void }

const lookTarget=new T.Vector3(),camTarget=new T.Vector3(),mapTarget=new T.Vector3(0,22,-8)
function PlayerRig({mode,tourIndex,travel,input,paused,reduced,onPosition,onInteract}:SceneProps){
  const world=useWorld(),{sectors:SECTORS,start:START,height:terrainHeight,canWalk}=world
  const groundHeight=(x:number,z:number)=>walkingHeight(x,z,terrainHeight,world.id==='earth')

  const player=useRef<T.Group>(null),moving=useRef(0),phase=useRef(0),motion=useRef(createCharacterMotion()),report=useRef(0),frames=useRef(0),fpsTime=useRef(0),fps=useRef(0)
  const {camera,gl}=useThree();const modeRef=useRef(mode);modeRef.current=mode
  const location=useRef(new T.Vector3(START[0],0,START[1]));const lastMode=useRef<ViewMode>('walk')
  useEffect(()=>{const s=SECTORS.find(s=>s.id===travel.id);const p=travel.point??(s?s.entry:START);location.current.set(p[0],groundHeight(...p),p[1]);input.current.keys.clear();input.current.actions.length=0;motion.current=createCharacterMotion();input.current.yaw=0;if(player.current)player.current.position.copy(location.current);camera.position.set(p[0],groundHeight(...p)+2.7,p[1]+MOTION_SCALE.zoom)},[travel,camera,input])
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return
      if(e.code==='Space'&&e.target instanceof HTMLElement&&e.target.closest('button,summary'))return
      if(paused||modeRef.current!=='walk'||roberRemote.current)return
      if(MOVEMENT_KEYS.includes(e.code)){input.current.keys.add(e.code);e.preventDefault()}
      if(e.code==='Space'&&buildingAt(location.current.x,location.current.z,world.id==='earth'))return
      if(world.id==='earth'&&CHARACTER_KEYS[e.code]){e.preventDefault();if(!e.repeat)input.current.actions.push(CHARACTER_KEYS[e.code])}
      else if(e.code==='KeyE'&&!e.repeat){const station=stationAt(location.current.x,location.current.z,world.id==='earth');if(station)onInteract(station.sector)}
    }
    const up=(e:KeyboardEvent)=>input.current.keys.delete(e.code);const clear=()=>{input.current.keys.clear();input.current.actions.length=0}
    const canvas=gl.domElement;let dragging=false,lastX=0,lastY=0
    const pointerDown=(e:PointerEvent)=>{if(modeRef.current!=='walk')return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)}
    const pointerMove=(e:PointerEvent)=>{if(!dragging||modeRef.current!=='walk')return;input.current.yaw-=(e.clientX-lastX)*.005;input.current.pitch=T.MathUtils.clamp(input.current.pitch+(e.clientY-lastY)*.004,-.08,1.1);lastX=e.clientX;lastY=e.clientY}
    const pointerUp=()=>{dragging=false};const wheel=(e:WheelEvent)=>{if(modeRef.current!=='walk')return;e.preventDefault();input.current.zoom=T.MathUtils.clamp(input.current.zoom+e.deltaY*.006,4,15)}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear)
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false})
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel);clear()}
  },[input,gl,paused,onInteract])
  useFrame((state,rawDelta)=>{
    const delta=Math.min(rawDelta,.05),p=location.current,k=input.current.keys
    if(roberRemote.current){k.clear();input.current.actions.length=0}
    frames.current++;fpsTime.current+=rawDelta;if(fpsTime.current>1){fps.current=Math.round(frames.current/fpsTime.current);frames.current=0;fpsTime.current=0}
    if(mode!==lastMode.current){input.current.keys.clear();input.current.actions.length=0;motion.current=createCharacterMotion();p.y=groundHeight(p.x,p.z);if(mode==='map'){camera.position.set(140,190,170);camera.lookAt(mapTarget)}lastMode.current=mode}
    if(world.id==='earth'){
      if(mode==='walk'&&!paused){
        const result=stepCharacter(motion.current,input.current,p,input.current.yaw,delta,groundHeight,canWalk)
        if(player.current&&result.desiredYaw!==null){const difference=Math.atan2(Math.sin(result.desiredYaw-player.current.rotation.y),Math.cos(result.desiredYaw-player.current.rotation.y));player.current.rotation.y+=difference*Math.min(1,delta*14)}
        if(result.interact){const station=stationAt(p.x,p.z,world.id==='earth');if(station)onInteract(station.sector)}
      }else{input.current.actions.length=0;motion.current.speed=0}
    }else{
      let dx=0,dz=0
      if(mode==='walk'&&!paused){dx=(k.has('KeyD')||k.has('ArrowRight')?1:0)-(k.has('KeyA')||k.has('ArrowLeft')?1:0);dz=(k.has('KeyS')||k.has('ArrowDown')?1:0)-(k.has('KeyW')||k.has('ArrowUp')?1:0)}
      moving.current=Math.hypot(dx,dz)>0?1:0
      if(moving.current){const length=Math.hypot(dx,dz),distance=(k.has('ShiftLeft')||k.has('ShiftRight')?MOTION_SCALE.run:MOTION_SCALE.walk)*delta;dx/=length;dz/=length;const yaw=input.current.yaw,wx=dx*Math.cos(yaw)+dz*Math.sin(yaw),wz=-dx*Math.sin(yaw)+dz*Math.cos(yaw);if(canWalk(p.x+wx*distance,p.z))p.x+=wx*distance;if(canWalk(p.x,p.z+wz*distance))p.z+=wz*distance;p.y=groundHeight(p.x,p.z);phase.current+=delta*(k.has('ShiftLeft')||k.has('ShiftRight')?9:5.5);if(player.current){const desired=Math.atan2(wx,wz),difference=Math.atan2(Math.sin(desired-player.current.rotation.y),Math.cos(desired-player.current.rotation.y));player.current.rotation.y+=difference*Math.min(1,delta*14)}}
    }
    occupant.x=p.x;occupant.z=p.z;occupant.active=mode==='walk';occupant.earth=world.id==='earth'
    if(player.current)player.current.position.copy(p)
    if(mode==='walk'&&roberRemote.current){
      const rover=roberRemote.current;camTarget.set(0,4.5,-8).applyAxisAngle(new T.Vector3(0,1,0),rover.rotation.y).add(rover.position);camera.position.lerp(camTarget,1-Math.exp(-delta*5));camera.lookAt(rover.position.x,rover.position.y+1,rover.position.z)
    }else if(mode==='walk'){
      const {yaw,pitch,zoom}=input.current;const indoors=!!buildingAt(p.x,p.z,world.id==='earth');const h=Math.cos(pitch)*(indoors?2.6:zoom)
      camTarget.set(p.x+Math.sin(yaw)*h,p.y+MOTION_SCALE.cameraHeight+Math.sin(pitch)*(indoors?2.6:zoom),p.z+Math.cos(yaw)*h)
      // Pull the follow camera toward the player when a building blocks its line of sight.
      for(let i=1;i<=12;i++){const t=i/12;const x=T.MathUtils.lerp(p.x,camTarget.x,t),z=T.MathUtils.lerp(p.z,camTarget.z,t);if(!canWalk(x,z)){camTarget.lerpVectors(p,camTarget,Math.max(.12,(i-1)/12));camTarget.y=Math.max(camTarget.y,p.y+2.1);break}}
      camera.position.lerp(camTarget,1-Math.exp(-delta*7));camera.lookAt(lookTarget.set(p.x,p.y+MOTION_SCALE.cameraTarget,p.z))
    }else if(mode==='tour'){
      const s=SECTORS[tourIndex],drift=reduced?0:Math.sin(state.clock.elapsedTime*.12)*3
      const tall=world.id==='earth'&&s.id==='launch';const hangar=s.id==='hangar';camTarget.set(s.x+(tall?110:hangar?35:22)+drift,groundHeight(s.x,s.z)+(tall?65:hangar?22:15),s.z+(tall?135:hangar?50:32));lookTarget.set(s.x,groundHeight(s.x,s.z)+(tall?47:hangar?9:4),s.z);camera.position.lerp(camTarget,1-Math.exp(-delta*1.4));camera.lookAt(lookTarget)
    }
    report.current+=delta;if(report.current>.16){report.current=0;onPosition({x:p.x,z:p.z,nearby:stationAt(p.x,p.z,world.id==='earth')?.sector??null,fps:fps.current,room:buildingAt(p.x,p.z,world.id==='earth')})}
  })
  return <><group ref={player} position={[START[0],0,START[1]]} rotation={[0,Math.PI,0]}>{world.id==='earth'?<ExplorerCharacter motion={motion} reduced={reduced} paused={paused||mode!=='walk'}/>:<Astronaut moving={moving} phase={phase}/>}</group><TarsCompanions targets={[{id:'crew-1',body:player}]} height={groundHeight} canWalk={canWalk} reduced={reduced}/>{mode==='map'&&<OrbitControls makeDefault target={mapTarget} maxPolarAngle={Math.PI/2.4} minDistance={55} maxDistance={390}/>}</>
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<div className="world-fallback"><h2>No pudimos iniciar el mundo 3D.</h2><p>Activa la aceleración gráfica del navegador y recarga la página. El mapa y la información de los sectores siguen disponibles.</p><button onClick={()=>window.location.reload()}>Reintentar</button></div>:this.props.children}}
export default memo(function ExplorerScene(props:SceneProps&{quality:'standard'|'light';onReady:()=>void}){
  const world=useWorld(),mars=world.id==='mars'
  return <SceneBoundary><Canvas camera={{position:[0,2.7,44.5],fov:50,near:.15,far:650}} dpr={props.quality==='light'?1:[1,1.5]} shadows={props.quality==='standard'?'percentage':false} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.setClearColor(world.sky);props.onReady()}}>
    <color attach="background" args={[world.sky]}/><fog attach="fog" args={[world.sky,300,580]}/>
    <ambientLight intensity={1.25} color="#e1ebdf"/><directionalLight position={[-80,150,65]} intensity={2.1} color="#fff0d2" castShadow={props.quality==='standard'} shadow-mapSize={[2048,2048]} shadow-camera-left={-95} shadow-camera-right={95} shadow-camera-top={95} shadow-camera-bottom={-95} shadow-camera-far={420} shadow-normalBias={.025}/>
    <Suspense fallback={null}>{mars?<MarsEnvironment reduced={props.reduced} paused={props.paused||props.mode!=='walk'}/>:<Environment reduced={props.reduced} paused={props.paused||props.mode!=='walk'}/>}<PlayerRig {...props}/></Suspense>
  </Canvas></SceneBoundary>
})
