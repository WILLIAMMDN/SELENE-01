import LunarLanding from './lunar/LunarLanding'
import MissionGuide from './MissionGuide'
import LunarEnvironment from './lunar/LunarEnvironment'
import CampusSky from './sky/CampusSky'
import AdaptiveResolution from './performance/AdaptiveResolution'
import { Canvas } from '@react-three/fiber'
import { Component, memo, Suspense, useEffect, type ReactNode } from 'react'
import Environment from './Environment'
import MarsEnvironment from './MarsEnvironment'
import { useWorld } from './worldConfig'
import PlayerRig from './player/PlayerRig'
import LaunchCinematicDirector from '../spacecraft/LaunchCinematicDirector'
import LaunchCloudLayers from '../spacecraft/LaunchCloudLayers'
import { LAUNCH_SITE } from '../spacecraft/LaunchComplex'
import { useBlueprint } from '../game/state/blueprintStore'
import type { SceneProps } from './player/types'
export type { Travel, InputState, PositionReport } from './player/types'

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  componentDidCatch(error: Error) {
    console.error('Error de escena 3D:', error)
    this.props.onFailure()
  }
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <div className="world-recovery">
        <button onClick={() => this.setState({ failed: false })}>Recuperar vista 3D</button>
      </div>
    ) : (
      this.props.children
    )
  }
}
function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}
export default memo(function ExplorerScene(
  props: SceneProps & { quality: 'standard' | 'light'; onReady: () => void },
) {
  const world = useWorld(),
    blueprint = useBlueprint(),
    mars = world.id === 'mars',
    moon = world.id === 'moon'
  return (
    <SceneBoundary onFailure={props.onReady}>
      <Canvas
        camera={{ position: [0, 2.7, 44.5], fov: 50, near: 0.15, far: 8000 }}
        dpr={props.quality === 'light' ? 1 : [1, 1.5]}
        shadows={props.quality === 'standard' ? 'percentage' : false}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(world.sky)
        }}
      >
        <color attach="background" args={[world.sky]} />
        <fog attach="fog" args={[world.sky, 300, 580]} />
        {!mars && !moon ? (
          <CampusSky
            quality={props.quality}
            reduced={props.reduced}
            paused={props.paused || props.mode !== 'walk'}
            launchClock={props.launchPhase === 'flight' ? props.flightClock?.current : undefined}
          />
        ) : (
          <>
            <ambientLight intensity={1.25} color="#e1ebdf" />
            <directionalLight
              position={[-80, 150, 65]}
              intensity={2.1}
              color="#fff0d2"
              castShadow={props.quality === 'standard'}
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-95}
              shadow-camera-right={95}
              shadow-camera-top={95}
              shadow-camera-bottom={-95}
              shadow-camera-far={420}
              shadow-normalBias={0.025}
            />
          </>
        )}
        <Suspense fallback={null}>
          {moon ? (
            <LunarEnvironment
              paused={props.paused || props.mode !== 'walk'}
              reduced={props.reduced}
              landing={props.landing}
            />
          ) : mars ? (
            <MarsEnvironment
              reduced={props.reduced}
              paused={props.paused || props.mode !== 'walk'}
            />
          ) : (
            <Environment
              reduced={props.reduced}
              paused={props.paused || props.mode !== 'walk' || props.launchPhase === 'flight'}
              boardingMotion={props.boardingMotion}
              flightClock={props.launchPhase === 'flight' ? props.flightClock?.current : undefined}
            />
          )}
          <PlayerRig {...props} />
          {moon && props.landing && props.onLandingComplete && (
            <LunarLanding onComplete={props.onLandingComplete} />
          )}
          {!mars && !moon && props.guideSector && (
            <MissionGuide
              sector={props.guideSector}
              enabled={!props.paused && props.launchPhase === 'idle' && props.mode === 'walk'}
              reduced={props.reduced}
              onUpdate={props.onGuide}
            />
          )}
          {!mars && !moon && props.launchPhase === 'flight' && props.flightClock && (
            <LaunchCloudLayers
              clock={props.flightClock.current}
              launcher={blueprint.config.launcher}
            />
          )}
          {!mars &&
            !moon &&
            props.launchPhase === 'flight' &&
            props.flightClock &&
            props.onCinematicProgress &&
            props.onCinematicComplete && (
              <LaunchCinematicDirector
                clock={props.flightClock.current}
                launcher={blueprint.config.launcher}
                habitat={blueprint.parts.includes('habitat')}
                origin={[LAUNCH_SITE.x, 0, LAUNCH_SITE.z]}
                onElapsed={props.onCinematicProgress}
                onComplete={props.onCinematicComplete}
              />
            )}
          <SceneReady onReady={props.onReady} />
          <AdaptiveResolution enabled={props.quality === 'standard'} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  )
})
