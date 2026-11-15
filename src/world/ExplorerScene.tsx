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
import { LAUNCH_SITE } from '../spacecraft/LaunchComplex'
import { useBlueprint } from '../game/state/blueprintStore'
import type { SceneProps } from './player/types'
import { Stars } from '@react-three/drei'
import type { LaunchClock } from '../spacecraft/launchTimeline'
import MissionNavigationGuide from './navigation/MissionNavigationGuide'
import { nextMissionStep, useCampusMission } from '../game/campusMission'
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
const LAUNCH_ORIGIN: [number, number, number] = [LAUNCH_SITE.x, 0, LAUNCH_SITE.z]

export default memo(function ExplorerScene(
  props: SceneProps & {
    quality: 'standard' | 'light'
    onReady: () => void
    cinematic?: boolean
    launchClock?: React.MutableRefObject<LaunchClock>
    launchElapsed?: number
    onCinematicProgress?: (seconds: number) => void
    onCinematicComplete?: () => void
  },
) {
  const world = useWorld(),
    blueprint = useBlueprint(),
    mars = world.id === 'mars',
    moon = world.id === 'moon'
  useCampusMission()
  const next = nextMissionStep()

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
        <fog
          attach="fog"
          args={[world.sky, props.cinematic ? 2000 : 300, props.cinematic ? 6000 : 580]}
        />
        {!mars && !moon ? (
          <CampusSky
            quality={props.quality}
            reduced={props.reduced}
            paused={props.paused || props.mode !== 'walk' || !!props.cinematic}
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
            />
          ) : mars ? (
            <MarsEnvironment
              reduced={props.reduced}
              paused={props.paused || props.mode !== 'walk'}
            />
          ) : (
            <Environment
              reduced={props.reduced}
              paused={props.paused || props.mode !== 'walk' || props.launchPhase === 'flight' || !!props.cinematic}
              boardingMotion={props.boardingMotion}
              flightClock={props.launchPhase === 'flight' ? props.flightClock?.current : props.launchClock?.current}
            />
          )}
          <PlayerRig {...props} cinematic={props.cinematic || props.launchPhase === 'flight'} />
          {!mars && !moon && !props.cinematic && props.launchPhase === 'idle' && next.sector && (
            <MissionNavigationGuide
              targetSector={next.sector}
              reduced={props.reduced}
              indoor={props.mode !== 'walk'}
            />
          )}
          {!mars &&
            !moon &&
            (props.launchPhase === 'flight' || props.cinematic) &&
            (props.flightClock || props.launchClock) && (
              <LaunchCinematicDirector
                clock={(props.flightClock ?? props.launchClock)!.current}
                launcher={blueprint.config.launcher}
                habitat={blueprint.parts.includes('habitat')}
                origin={LAUNCH_ORIGIN}
                onElapsed={props.onCinematicProgress ?? (() => {})}
                onComplete={props.onCinematicComplete ?? (() => {})}
              />
            )}
          {(props.cinematic || props.launchPhase === 'flight') && (props.launchElapsed ?? 0) >= 18 && (
            <Stars radius={2800} depth={100} count={800} factor={4} saturation={0} fade speed={0} />
          )}
          <SceneReady onReady={props.onReady} />
          <AdaptiveResolution enabled={props.quality === 'standard'} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  )
})
