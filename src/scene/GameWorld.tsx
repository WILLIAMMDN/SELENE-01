import { useWardrobe } from '../world/wardrobe'
import CampusSky from '../world/sky/CampusSky'
import AdaptiveResolution from '../world/performance/AdaptiveResolution'
import { bindCharacterKeyboard } from '../world/controls/keyboard'
import { LAUNCH_SITE } from '../spacecraft/LaunchComplex'
import LaunchCinematicDirector from '../spacecraft/LaunchCinematicDirector'
import LaunchBoarding from '../spacecraft/LaunchBoarding'
import LaunchCloudLayers from '../spacecraft/LaunchCloudLayers'
import { walkingHeight, stationAt, occupant, buildingAt } from '../world/buildingNavigation'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, OrbitControls, Stars } from '@react-three/drei'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import TarsCompanions from '../robot/TarsCompanion'
import OdysseyShip from '../spacecraft/OdysseyShip'
import { COMPLETE_ASSEMBLY, type ModuleId } from '../spacecraft/assembly'
import type { DesignConfig } from '../game/missionDesign'
import ExplorerCharacter from '../world/ExplorerCharacter'
import CharacterActions from '../world/CharacterActions'
import {
  createCharacterMotion,
  stepCharacter,
  type CharacterControls,
} from '../world/characterMotion'
import Environment from '../world/Environment'
import { roberRemote } from '../world/roberControl'
import { canWalk, groundHeight as terrainHeight } from '../world/worldData'
import { MOTION_SCALE, ODYSSEY_SIZE } from '../world/physicalScale'
const groundHeight = (x: number, z: number) => walkingHeight(x, z, terrainHeight)
import type { Station } from '../game/missionTypes'
export type { Station } from '../game/missionTypes'
function Campus({
  onInteract,
  controls,
}: {
  onInteract: (id: Station) => void
  controls: RefObject<CharacterControls>
}) {
  const wardrobe = useWardrobe()
  const player = useRef<THREE.Group>(null)
  const motion = useRef(createCharacterMotion())
  const activate = useCallback(() => {
    const p = player.current?.position
    if (!p) return
    const station = stationAt(p.x, p.z)
    if (station && station.sector !== 'observatory')
      onInteract(station.sector === 'research' ? 'briefing' : station.sector)
  }, [onInteract])
  useEffect(
    () =>
      bindCharacterKeyboard({ controls: controls.current, enabled: () => !roberRemote.current }),
    [controls],
  )
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05),
      p = player.current
    if (!p) return
    if (roberRemote.current) {
      controls.current.keys.clear()
      controls.current.actions.length = 0
    }
    const result = stepCharacter(
      motion.current,
      controls.current,
      p.position,
      0,
      delta,
      groundHeight,
      canWalk,
    )
    if (result.desiredYaw !== null) {
      const difference = Math.atan2(
        Math.sin(result.desiredYaw - p.rotation.y),
        Math.cos(result.desiredYaw - p.rotation.y),
      )
      p.rotation.y += difference * Math.min(1, delta * 14)
    }
    occupant.x = p.position.x
    occupant.z = p.position.z
    occupant.active = true
    if (result.interact) activate()
    if (roberRemote.current) {
      const rover = roberRemote.current
      const follow = new THREE.Vector3(0, 4.5, -8)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), rover.rotation.y)
        .add(rover.position)
      state.camera.position.lerp(follow, 1 - Math.exp(-delta * 5))
      state.camera.lookAt(rover.position.x, rover.position.y + 1, rover.position.z)
      return
    }
    state.camera.position.lerp(
      new THREE.Vector3(
        p.position.x + 3,
        p.position.y + 2.8,
        p.position.z + (buildingAt(p.position.x, p.position.z) ? 2.8 : MOTION_SCALE.zoom),
      ),
      1 - Math.exp(-delta * 7),
    )
    state.camera.lookAt(p.position.x, p.position.y + MOTION_SCALE.cameraTarget, p.position.z)
  })
  return (
    <>
      <color attach="background" args={['#68babc']} />
      <fog attach="fog" args={['#68babc', 300, 580]} />
      <CampusSky reduced={false} paused={false} quality="standard" />
      <Environment />
      <group ref={player} position={[0, 0, 37]}>
        <ExplorerCharacter
          motion={motion}
          character={wardrobe.character}
          outfit={wardrobe.earth}
          helmet={wardrobe.helmet}
        />
      </group>
      <TarsCompanions
        targets={[{ id: 'crew-1', body: player, motion }]}
        height={groundHeight}
        canWalk={(x, z) => canWalk(x, z) && !buildingAt(x, z, true)}
      />
    </>
  )
}

type ShipProps = { parts: ModuleId[]; config: DesignConfig; exploded?: boolean }
function ShipStage({
  mode,
  parts,
  config,
  exploded = false,
  cinematic = false,
  elapsed = 0,
  onCinematicProgress,
  onCinematicComplete,
}: {
  mode: 'workshop' | 'launch' | 'orbit'
  cinematic?: boolean
  elapsed?: number
  onCinematicProgress?: (seconds: number) => void
  onCinematicComplete?: () => void
} & ShipProps) {
  const { camera } = useThree()
  const clock = useRef(0)
  const focus =
    mode === 'launch'
      ? LAUNCH_SITE.height / 2
      : (parts.includes('habitat') ? ODYSSEY_SIZE.habitatHeight : ODYSSEY_SIZE.compactHeight) / 2
  const originX = mode === 'launch' ? LAUNCH_SITE.x : 0
  const originZ = mode === 'launch' ? LAUNCH_SITE.z : 0
  useEffect(() => {
    camera.position.set(
      originX + (mode === 'launch' ? 96 : mode === 'workshop' ? 18 : 24),
      focus + 7,
      originZ + (mode === 'launch' ? 115 : mode === 'workshop' ? 24 : 30),
    )
    camera.lookAt(originX, focus, originZ)
  }, [camera, mode, focus, originX, originZ])
  return (
    <>
      <color attach="background" args={[mode === 'orbit' ? '#202f3d' : '#b8c8bd']} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-8, 18, 10]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={24}
        shadow-camera-bottom={-18}
        shadow-camera-far={80}
      />
      {mode === 'orbit' ? (
        <>
          <Stars radius={100} depth={50} count={800} factor={2} saturation={0} fade speed={0} />
          <mesh position={[-16, -17, -22]}>
            <sphereGeometry args={[16, 40, 28]} />
            <meshToonMaterial color="#a5aca4" />
          </mesh>
        </>
      ) : mode === 'workshop' ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshToonMaterial color="#9cab9c" />
          </mesh>
          <mesh position={[0, -0.12, 0]} receiveShadow>
            <cylinderGeometry args={[7, 7, 0.24, 48]} />
            <meshToonMaterial color="#e2dbc6" />
            <Edges color="#3a4c50" />
          </mesh>
          <gridHelper args={[30, 30, '#6c8581', '#97a496']} position={[0, 0.015, 0]} />
        </>
      ) : (
        <>
          <Environment
            paused={cinematic}
            reduced
            launchParts={parts}
            launchConfig={config}
            flightClock={cinematic ? clock : undefined}
          />
          {cinematic && parts.includes('habitat') && <LaunchBoarding clock={clock} />}
        </>
      )}
      {mode === 'workshop' && <OdysseyShip parts={parts} config={config} exploded={exploded} />}
      {mode === 'launch' && cinematic && (
        <>
          <CampusSky reduced={false} paused quality="standard" launchClock={clock} />
          <LaunchCloudLayers clock={clock} launcher={config.launcher} />
        </>
      )}
      {mode === 'launch' && cinematic && elapsed >= 33 && (
        <Stars radius={2800} depth={100} count={700} factor={4} saturation={0} fade speed={0} />
      )}
      {mode === 'launch' && cinematic && onCinematicProgress && onCinematicComplete && (
        <LaunchCinematicDirector
          clock={clock}
          launcher={config.launcher}
          habitat={parts.includes('habitat')}
          origin={[LAUNCH_SITE.x, 0, LAUNCH_SITE.z]}
          onElapsed={onCinematicProgress}
          onComplete={onCinematicComplete}
        />
      )}
      {!cinematic && (
        <OrbitControls
          makeDefault
          target={[originX, focus, originZ]}
          minDistance={12}
          maxDistance={mode === 'launch' ? 240 : 65}
          maxPolarAngle={mode === 'orbit' ? Math.PI : Math.PI / 2.05}
        />
      )}
    </>
  )
}
export default function GameWorld({
  mode,
  onInteract,
  parts = COMPLETE_ASSEMBLY,
  config,
  exploded = false,
  cinematic = false,
  cinematicElapsed = 0,
  onCinematicProgress,
  onCinematicComplete,
}: {
  mode: 'campus' | 'workshop' | 'launch' | 'orbit'
  onInteract: (id: Station) => void
  parts?: ModuleId[]
  config: DesignConfig
  exploded?: boolean
  cinematic?: boolean
  cinematicElapsed?: number
  onCinematicProgress?: (seconds: number) => void
  onCinematicComplete?: () => void
}) {
  const controls = useRef<CharacterControls>({ keys: new Set(), actions: [] })
  const label =
    mode === 'orbit'
      ? 'Operaciones de ODYSSEY'
      : mode === 'workshop'
        ? 'Construye ODYSSEY'
        : mode === 'launch'
          ? 'ODYSSEY lista para revisión'
          : 'Tú diseñas la misión'
  return (
    <div className="world-frame" aria-label="Mundo 3D de SELENE-01">
      <Canvas
        camera={{ position: [8, 9, 20], fov: 48, near: 0.1, far: 4000 }}
        shadows
        dpr={[1, 1.6]}
      >
        {mode === 'campus' ? (
          <Campus onInteract={onInteract} controls={controls} />
        ) : (
          <ShipStage
            key={mode}
            mode={mode}
            parts={parts}
            config={config}
            exploded={exploded}
            cinematic={cinematic}
            elapsed={cinematicElapsed}
            onCinematicProgress={onCinematicProgress}
            onCinematicComplete={onCinematicComplete}
          />
        )}
        <AdaptiveResolution maximum={1.6} />
      </Canvas>
      {mode === 'campus' && <CharacterActions controls={controls} />}
      {!cinematic && (
        <div className="world-overlay">
          <span className="eyebrow">
            {mode === 'campus'
              ? 'ACADEMIA SELENE · CAMPUS ARTEMISA'
              : mode === 'orbit'
                ? 'ÓRBITA LUNAR · SIMULACIÓN'
                : 'HANGAR ODYSSEY · DISEÑO MODULAR'}
          </span>
          <strong>{label}</strong>
        </div>
      )}
      {!cinematic && (
        <div className="world-help">
          {mode === 'campus'
            ? 'WASD: caminar · Shift: correr · Espacio: saltar · Ctrl: sentarse · E: interactuar'
            : 'Arrastra para girar la nave · Rueda para acercar'}
        </div>
      )}
    </div>
  )
}
