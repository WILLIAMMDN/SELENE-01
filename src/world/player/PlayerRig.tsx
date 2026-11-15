import { moveWithCollisions } from '../navigation/collision'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as T from 'three'
import { walkingHeight, buildingAt, occupant, stationAt } from '../buildingNavigation'
import { bindCharacterKeyboard } from '../controls/keyboard'
import { roberRemote } from '../roberControl'
import { useWorld } from '../worldConfig'
import TarsCompanions from '../../robot/TarsCompanion'
import Astronaut from '../Astronaut'
import ExplorerCharacter from '../ExplorerCharacter'
import { MOTION_SCALE } from '../physicalScale'
import { CHARACTER_KEYS, createCharacterMotion, stepCharacter } from '../characterMotion'
import type { ViewMode } from '../worldData'
import type { SceneProps } from './types'

const upAxis = new T.Vector3(0, 1, 0),
  lookTarget = new T.Vector3(),
  camTarget = new T.Vector3(),
  mapTarget = new T.Vector3(0, 22, -8)
export default function PlayerRig({
  mode,
  tourIndex,
  travel,
  input,
  paused,
  reduced,
  onPosition,
  onInteract,
}: SceneProps) {
  const world = useWorld(),
    { sectors: SECTORS, start: START, height: terrainHeight, canWalk } = world
  const groundHeight = (x: number, z: number) =>
    walkingHeight(x, z, terrainHeight, world.id === 'earth')

  const player = useRef<T.Group>(null),
    moving = useRef(0),
    phase = useRef(0),
    motion = useRef(createCharacterMotion()),
    report = useRef(0),
    frames = useRef(0),
    fpsTime = useRef(0),
    fps = useRef(0)
  const { camera, gl } = useThree()
  const modeRef = useRef(mode)
  modeRef.current = mode
  const location = useRef(new T.Vector3(START[0], 0, START[1]))
  const lastMode = useRef<ViewMode>('walk')
  useEffect(() => {
    const s = SECTORS.find((s) => s.id === travel.id)
    const p = travel.point ?? (s ? s.entry : START)
    location.current.set(p[0], groundHeight(...p), p[1])
    input.current.keys.clear()
    input.current.actions.length = 0
    motion.current = createCharacterMotion()
    input.current.yaw = 0
    if (player.current) player.current.position.copy(location.current)
    camera.position.set(p[0], groundHeight(...p) + 2.7, p[1] + MOTION_SCALE.zoom)
  }, [travel, camera, input])
  useEffect(() => {
    const releaseKeyboard = bindCharacterKeyboard({
      controls: input.current,
      enabled: () => !paused && modeRef.current === 'walk' && !roberRemote.current,
      onAction: (e) => {
        if (
          e.code === 'Space' &&
          buildingAt(location.current.x, location.current.z, world.id === 'earth')
        )
          return
        if (world.id === 'earth' && CHARACTER_KEYS[e.code]) {
          e.preventDefault()
          if (!e.repeat) input.current.actions.push(CHARACTER_KEYS[e.code])
        } else if (e.code === 'KeyE' && !e.repeat) {
          const station = stationAt(location.current.x, location.current.z, world.id === 'earth')
          if (station) onInteract(station.sector)
        }
      },
    })
    const canvas = gl.domElement
    let dragging = false,
      lastX = 0,
      lastY = 0
    const pointerDown = (e: PointerEvent) => {
      if (modeRef.current !== 'walk') return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const pointerMove = (e: PointerEvent) => {
      if (!dragging || modeRef.current !== 'walk') return
      input.current.yaw -= (e.clientX - lastX) * 0.005
      input.current.pitch = T.MathUtils.clamp(
        input.current.pitch + (e.clientY - lastY) * 0.004,
        -0.08,
        1.1,
      )
      lastX = e.clientX
      lastY = e.clientY
    }
    const pointerUp = () => {
      dragging = false
    }
    const wheel = (e: WheelEvent) => {
      if (modeRef.current !== 'walk') return
      e.preventDefault()
      input.current.zoom = T.MathUtils.clamp(input.current.zoom + e.deltaY * 0.006, 4, 15)
    }
    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('pointermove', pointerMove)
    canvas.addEventListener('pointerup', pointerUp)
    canvas.addEventListener('pointercancel', pointerUp)
    canvas.addEventListener('wheel', wheel, { passive: false })
    return () => {
      releaseKeyboard()
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerUp)
      canvas.removeEventListener('wheel', wheel)
    }
  }, [input, gl, paused, onInteract])
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05),
      p = location.current,
      k = input.current.keys
    if (roberRemote.current) {
      k.clear()
      input.current.actions.length = 0
    }
    frames.current++
    fpsTime.current += rawDelta
    if (fpsTime.current > 1) {
      fps.current = Math.round(frames.current / fpsTime.current)
      frames.current = 0
      fpsTime.current = 0
    }
    if (mode !== lastMode.current) {
      input.current.keys.clear()
      input.current.actions.length = 0
      motion.current = createCharacterMotion()
      p.y = groundHeight(p.x, p.z)
      if (mode === 'map') {
        camera.position.set(140, 190, 170)
        camera.lookAt(mapTarget)
      }
      lastMode.current = mode
    }
    if (world.id === 'earth') {
      if (mode === 'walk' && !paused) {
        const result = stepCharacter(
          motion.current,
          input.current,
          p,
          input.current.yaw,
          delta,
          groundHeight,
          canWalk,
        )
        if (player.current && result.desiredYaw !== null) {
          const difference = Math.atan2(
            Math.sin(result.desiredYaw - player.current.rotation.y),
            Math.cos(result.desiredYaw - player.current.rotation.y),
          )
          player.current.rotation.y += difference * Math.min(1, delta * 14)
        }
        if (result.interact) {
          const station = stationAt(p.x, p.z, world.id === 'earth')
          if (station) onInteract(station.sector)
        }
      } else {
        input.current.actions.length = 0
        motion.current.speed = 0
      }
    } else {
      let dx = 0,
        dz = 0
      if (mode === 'walk' && !paused) {
        dx =
          (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) -
          (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0)
        dz =
          (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) -
          (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0)
      }
      moving.current = Math.hypot(dx, dz) > 0 ? 1 : 0
      if (moving.current) {
        const length = Math.hypot(dx, dz),
          distance =
            (k.has('ShiftLeft') || k.has('ShiftRight') ? MOTION_SCALE.run : MOTION_SCALE.walk) *
            delta
        dx /= length
        dz /= length
        const yaw = input.current.yaw,
          wx = dx * Math.cos(yaw) + dz * Math.sin(yaw),
          wz = -dx * Math.sin(yaw) + dz * Math.cos(yaw)
        moveWithCollisions(p, wx * distance, wz * distance, canWalk)
        p.y = groundHeight(p.x, p.z)
        phase.current += delta * (k.has('ShiftLeft') || k.has('ShiftRight') ? 9 : 5.5)
        if (player.current) {
          const desired = Math.atan2(wx, wz),
            difference = Math.atan2(
              Math.sin(desired - player.current.rotation.y),
              Math.cos(desired - player.current.rotation.y),
            )
          player.current.rotation.y += difference * Math.min(1, delta * 14)
        }
      }
    }
    occupant.x = p.x
    occupant.z = p.z
    occupant.active = mode === 'walk'
    occupant.earth = world.id === 'earth'
    if (player.current) player.current.position.copy(p)
    if (mode === 'walk' && roberRemote.current) {
      const rover = roberRemote.current
      camTarget.set(0, 4.5, -8).applyAxisAngle(upAxis, rover.rotation.y).add(rover.position)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 5))
      camera.lookAt(rover.position.x, rover.position.y + 1, rover.position.z)
    } else if (mode === 'walk') {
      const { yaw, pitch, zoom } = input.current
      const indoors = !!buildingAt(p.x, p.z, world.id === 'earth')
      const h = Math.cos(pitch) * (indoors ? 2.6 : zoom)
      camTarget.set(
        p.x + Math.sin(yaw) * h,
        p.y + MOTION_SCALE.cameraHeight + Math.sin(pitch) * (indoors ? 2.6 : zoom),
        p.z + Math.cos(yaw) * h,
      )
      // Pull the follow camera toward the player when a building blocks its line of sight.
      for (let i = 1; i <= 12; i++) {
        const t = i / 12
        const x = T.MathUtils.lerp(p.x, camTarget.x, t),
          z = T.MathUtils.lerp(p.z, camTarget.z, t)
        if (!canWalk(x, z)) {
          camTarget.lerpVectors(p, camTarget, Math.max(0.12, (i - 1) / 12))
          camTarget.y = Math.max(camTarget.y, p.y + 2.1)
          break
        }
      }
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 7))
      camera.lookAt(lookTarget.set(p.x, p.y + MOTION_SCALE.cameraTarget, p.z))
    } else if (mode === 'tour') {
      const s = SECTORS[tourIndex],
        drift = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 3
      const tall = world.id === 'earth' && s.id === 'launch'
      const hangar = s.id === 'hangar'
      camTarget.set(
        s.x + (tall ? 110 : hangar ? 35 : 22) + drift,
        groundHeight(s.x, s.z) + (tall ? 65 : hangar ? 22 : 15),
        s.z + (tall ? 135 : hangar ? 50 : 32),
      )
      lookTarget.set(s.x, groundHeight(s.x, s.z) + (tall ? 47 : hangar ? 9 : 4), s.z)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 1.4))
      camera.lookAt(lookTarget)
    }
    report.current += delta
    if (report.current > 0.16) {
      report.current = 0
      onPosition({
        x: p.x,
        z: p.z,
        nearby: stationAt(p.x, p.z, world.id === 'earth')?.sector ?? null,
        fps: fps.current,
        room: buildingAt(p.x, p.z, world.id === 'earth'),
      })
    }
  })
  return (
    <>
      <group ref={player} position={[START[0], 0, START[1]]} rotation={[0, Math.PI, 0]}>
        {world.id === 'earth' ? (
          <ExplorerCharacter motion={motion} reduced={reduced} paused={paused || mode !== 'walk'} />
        ) : (
          <Astronaut moving={moving} phase={phase} />
        )}
      </group>
      <TarsCompanions
        targets={[{ id: 'crew-1', body: player, motion }]}
        height={groundHeight}
        canWalk={canWalk}
        reduced={reduced}
      />
      {mode === 'map' && (
        <OrbitControls
          makeDefault
          target={mapTarget}
          maxPolarAngle={Math.PI / 2.4}
          minDistance={55}
          maxDistance={390}
        />
      )}
    </>
  )
}
