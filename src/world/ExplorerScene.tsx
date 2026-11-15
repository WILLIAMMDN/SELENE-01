import { Canvas } from '@react-three/fiber'
import { Component, memo, Suspense, useEffect, type ReactNode } from 'react'
import Environment from './Environment'
import MarsEnvironment from './MarsEnvironment'
import { useWorld } from './worldConfig'
import PlayerRig from './player/PlayerRig'
import type { SceneProps } from './player/types'
export type { Travel, InputState, PositionReport } from './player/types'

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{componentDidCatch(){this.props.onFailure()}state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<div className="world-fallback"><h2>No pudimos iniciar el mundo 3D.</h2><p>Activa la aceleración gráfica del navegador y recarga la página. El mapa y la información de los sectores siguen disponibles.</p><button onClick={()=>window.location.reload()}>Reintentar</button></div>:this.props.children}}
function SceneReady({onReady}:{onReady:()=>void}){useEffect(onReady,[onReady]);return null}
export default memo(function ExplorerScene(props:SceneProps&{quality:'standard'|'light';onReady:()=>void}){
  const world=useWorld(),mars=world.id==='mars'
  return <SceneBoundary onFailure={props.onReady}><Canvas camera={{position:[0,2.7,44.5],fov:50,near:.15,far:650}} dpr={props.quality==='light'?1:[1,1.5]} shadows={props.quality==='standard'?'percentage':false} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.setClearColor(world.sky)}}>
    <color attach="background" args={[world.sky]}/><fog attach="fog" args={[world.sky,300,580]}/>
    <ambientLight intensity={1.25} color="#e1ebdf"/><directionalLight position={[-80,150,65]} intensity={2.1} color="#fff0d2" castShadow={props.quality==='standard'} shadow-mapSize={[2048,2048]} shadow-camera-left={-95} shadow-camera-right={95} shadow-camera-top={95} shadow-camera-bottom={-95} shadow-camera-far={420} shadow-normalBias={.025}/>
    <Suspense fallback={null}>{mars?<MarsEnvironment reduced={props.reduced} paused={props.paused||props.mode!=='walk'}/>:<Environment reduced={props.reduced} paused={props.paused||props.mode!=='walk'}/>}<PlayerRig {...props}/><SceneReady onReady={props.onReady}/></Suspense>
  </Canvas></SceneBoundary>
})
