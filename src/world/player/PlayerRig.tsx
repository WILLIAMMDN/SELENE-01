import { buggy, buggyExit, driveBuggy, nearBuggy, outsideBuggy } from '../buggyControl'
import BuggyModel from '../BuggyModel'
import { lunarStationAt } from '../lunar/lunarNavigation'
import { lunarRoomAt } from '../lunar/lunarBaseNavigation'
import RoverLunar from '../lunar/RoverLunar'
import {
  canBoardLunarRover,
  outsideLunarRover,
  toggleLunarRover,
  type LunarRoverMount,
} from '../lunar/lunarRoverAccess'
import CharacterBoundary from './CharacterBoundary'
import { moveWithCollisions } from '../navigation/collision'
import FirstPersonArms from './FirstPersonArms'
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as T from 'three'
import { walkingHeight, buildingAt, occupant, stationAt } from '../buildingNavigation'
import { bindCharacterKeyboard } from '../controls/keyboard'
import { roberRemote } from '../roberControl'
import { useWorld } from '../worldConfig'
import TarsCompanions from '../../robot/TarsCompanion'
import Astronaut from '../Astronaut'
import { useWardrobe } from '../wardrobe'
import { canUseWardrobe, handleWardrobeKey } from '../wardrobeStation'
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
  landing = false,
  onPosition,
  onInteract,
  cinematic = false,
  onWardrobe,
}: SceneProps) {
  const wardrobe = useWardrobe()
  const world = useWorld(),
    { sectors: SECTORS, start: START, height: terrainHeight, canWalk: worldClear } = world
  const moon = world.id === 'moon'
  const lunarMount = useRef<LunarRoverMount>({
    controller: null,
    driving: false,
    exitBlocked: false,
  })
  const canWalk = (x: number, z: number) =>
    worldClear(x, z) &&
    (world.id !== 'earth' || outsideBuggy(x, z)) &&
    (!moon || outsideLunarRover(lunarMount.current.controller, x, z))
  const tarsCanWalk = (x: number, z: number) =>
    canWalk(x, z) && (world.id !== 'earth' || !buildingAt(x, z, true))
  const carClear = (x: number, z: number) => worldClear(x, z) && !buildingAt(x, z)
  const canBoard = (x: number, z: number) =>
    nearBuggy(x, z) &&
    !buildingAt(x, z) &&
    [0.2, 0.4, 0.6, 0.8].every((t) => worldClear(x + (buggy.x - x) * t, z + (buggy.z - z) * t))
  const groundHeight = (x: number, z: number) =>
    moon ? terrainHeight(x, z) : walkingHeight(x, z, terrainHeight, world.id === 'earth')
  const roomAt = (x: number, z: number) =>
    moon ? lunarRoomAt(x, z) : buildingAt(x, z, world.id === 'earth')
  const stationFor = (x: number, z: number) =>
    moon ? lunarStationAt(x, z) : stationAt(x, z, world.id === 'earth')

  const vehicle = useRef<T.Group>(null)
  const firstPerson = useRef(false)
  const [isFirstPerson, setIsFirstPerson] = useState(false)
  const exitBlocked = useRef(false)
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
    buggy.driving = false
    buggy.speed = 0
    lunarMount.current.driving = false
    lunarMount.current.exitBlocked = false
    firstPerson.current = false
    setIsFirstPerson(false)
    location.current.set(p[0], groundHeight(...p), p[1])
    if (world.id === 'earth' && !outsideBuggy(p[0], p[1])) {
      const exit = buggyExit(worldClear)
      if (exit) location.current.set(exit.x, groundHeight(exit.x, exit.z), exit.z)
    }
    input.current.keys.clear()
    input.current.actions.length = 0
    motion.current = createCharacterMotion()
    input.current.yaw = 0
    if (player.current) player.current.position.copy(location.current)
    camera.position.set(p[0], groundHeight(...p) + 2.7, p[1] + MOTION_SCALE.zoom)
  }, [travel, camera, input])
  useEffect(() => {
    const stop = () => {
      buggy.speed = 0
      if (lunarMount.current.controller) {
        lunarMount.current.controller.speed = 0
        lunarMount.current.controller.stop()
      }
      input.current.keys.clear()
    }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', stop)
    return () => {
      stop()
      buggy.driving = false
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', stop)
    }
  }, [input])
  const cinematicRef = useRef(cinematic)
  cinematicRef.current = cinematic
  useEffect(() => {
    const releaseKeyboard = bindCharacterKeyboard({
      controls: input.current,
      enabled: () =>
        !paused && !cinematicRef.current && modeRef.current === 'walk' && !roberRemote.current,
      onAction: (e) => {
        if (cinematicRef.current) return
        if (
          moon &&
          (lunarMount.current.driving ||
            canBoardLunarRover(
              lunarMount.current.controller,
              location.current.x,
              location.current.z,
            ))
        ) {
          if (e.code === 'KeyE' && !e.repeat) {
            e.preventDefault()
            input.current.actions.push('interact')
          }
          if (lunarMount.current.driving) {
            if (e.code === 'Space') {
              e.preventDefault()
              input.current.keys.add('Space')
            }
            return
          }
          if (e.code === 'KeyE') return
        }
        if (world.id === 'earth' && buggy.driving) {
          if (e.code === 'Space') {
            e.preventDefault()
            input.current.keys.add('Space')
          }
          if (e.code === 'KeyE' && !e.repeat) input.current.actions.push('interact')
          return
        }
        if (e.code === 'Space' && roomAt(location.current.x, location.current.z)) return
        if (handleWardrobeKey(e, location.current.x, location.current.z, world.id, onWardrobe))
          return
        if (world.id === 'earth' && CHARACTER_KEYS[e.code]) {
          e.preventDefault()
          if (!e.repeat) input.current.actions.push(CHARACTER_KEYS[e.code])
        } else if (e.code === 'KeyE' && !e.repeat) {
          if (Math.hypot(location.current.x - -14, location.current.z - 36) < 4.8) {
            window.dispatchEvent(new CustomEvent('selene-authors-panel'))
          } else {
            const station = stationFor(location.current.x, location.current.z)
            if (station) onInteract(station.sector)
          }
        }
      },
    })
    const canvas = gl.domElement
    let dragging = false,
      lastX = 0,
      lastY = 0
    const pointerDown = (e: PointerEvent) => {
      if (modeRef.current !== 'walk' || cinematicRef.current) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const pointerMove = (e: PointerEvent) => {
      if (!dragging || modeRef.current !== 'walk' || cinematicRef.current) return
      input.current.yaw -= (e.clientX - lastX) * 0.005
      input.current.pitch = T.MathUtils.clamp(
        input.current.pitch + (e.clientY - lastY) * 0.004,
        firstPerson.current ? -1.15 : -0.08,
        1.1,
      )
      lastX = e.clientX
      lastY = e.clientY
    }
    const pointerUp = () => {
      dragging = false
    }
    const wheel = (e: WheelEvent) => {
      if (modeRef.current !== 'walk' || firstPerson.current || cinematicRef.current) return
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
  }, [input, gl, paused, onInteract, onWardrobe])
  useFrame((state, rawDelta) => {
    if (cinematic) {
      if (player.current) player.current.visible = false
      return
    }
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
    if (
      world.id === 'earth' &&
      mode === 'walk' &&
      !paused &&
      !roberRemote.current &&
      input.current.actions.includes('interact') &&
      (buggy.driving || canBoard(p.x, p.z))
    ) {
      input.current.actions.length = 0
      if (buggy.driving) {
        buggy.speed = 0
        const exit = buggyExit(carClear)
        exitBlocked.current = !exit
        if (exit) {
          buggy.driving = false
          p.set(exit.x, groundHeight(exit.x, exit.z), exit.z)
        }
      } else if (motion.current.phase === 'ground' && !motion.current.seat) {
        buggy.driving = true
        exitBlocked.current = false
        input.current.yaw = buggy.yaw + Math.PI
        input.current.pitch = 0.22
      }
      input.current.keys.clear()
      motion.current = createCharacterMotion()
    }
    if (moon && mode === 'walk' && !paused && input.current.actions.includes('interact')) {
      input.current.actions.length = 0
      if (toggleLunarRover(lunarMount.current, p)) {
        input.current.keys.clear()
        motion.current = createCharacterMotion()
        const rover = lunarMount.current.controller!
        input.current.yaw = rover.yaw + Math.PI
        input.current.pitch = 0.22
      } else if (!lunarMount.current.driving) {
        const station = stationFor(p.x, p.z)
        if (station) onInteract(station.sector)
      }
    }
    if (moon && lunarMount.current.driving && lunarMount.current.controller) {
      const rover = lunarMount.current.controller
      p.copy(rover.vehicle.position)
      input.current.actions.length = 0
      moving.current = 0
      motion.current.speed = 0
      motion.current.clip = 'Sit_Idle'
    } else if (world.id === 'earth' && buggy.driving) {
      input.current.actions.length = 0
      if (mode === 'walk' && !paused && !roberRemote.current)
        input.current.yaw += driveBuggy(k, delta, carClear, terrainHeight)
      else buggy.speed = 0
      p.set(buggy.x, groundHeight(buggy.x, buggy.z), buggy.z)
      motion.current.speed = 0
      motion.current.clip = 'Sit_Idle'
    } else if (world.id === 'earth') {
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
          if (canUseWardrobe(p.x, p.z, world.id)) onWardrobe?.()
          else if (Math.hypot(p.x + 14, p.z - 36) < 4.8) {
            window.dispatchEvent(new CustomEvent('selene-authors-panel'))
          } else {
            const station = stationFor(p.x, p.z)
            if (station) onInteract(station.sector)
          }
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
    if (world.id !== 'earth' && !(moon && lunarMount.current.driving)) {
      motion.current.speed =
        moving.current *
        (k.has('ShiftLeft') || k.has('ShiftRight') ? MOTION_SCALE.run : MOTION_SCALE.walk)
      motion.current.clip = motion.current.speed > 2.5 ? 'Run' : moving.current ? 'Walk' : 'Idle'
    }
    occupant.x = p.x
    occupant.z = p.z
    occupant.active = mode === 'walk'
    occupant.earth = world.id === 'earth'
    const indoors = !!roomAt(p.x, p.z)
    if (player.current) {
      if (moon) player.current.rotation.set(0, player.current.rotation.y, 0)
      player.current.position.copy(p)
      player.current.visible = !(mode === 'walk' && indoors)
      if (world.id === 'earth' && buggy.driving) {
        player.current.position.x -= Math.cos(buggy.yaw) * 0.28
        player.current.position.z += Math.sin(buggy.yaw) * 0.28
        player.current.position.y += 0.18
        player.current.rotation.y = buggy.yaw
      }
      if (moon && lunarMount.current.driving && lunarMount.current.controller) {
        const rover = lunarMount.current.controller
        const seat = rover.vehicle.getObjectByName('Seat_L_Cushion')
        if (seat) seat.getWorldPosition(player.current.position)
        player.current.position.y += 0.12
        player.current.quaternion.copy(rover.vehicle.quaternion)
      }
    }
    if (vehicle.current) {
      vehicle.current.position.set(buggy.x, groundHeight(buggy.x, buggy.z) + 0.025, buggy.z)
      vehicle.current.rotation.y = buggy.yaw
    }
    if (indoors !== firstPerson.current) {
      input.current.pitch = indoors ? 0 : 0.14
      firstPerson.current = indoors
      setIsFirstPerson(indoors)
      if (!indoors) {
        camera.up.set(0, 1, 0)
      }
    }
    if (
      !landing &&
      mode === 'walk' &&
      moon &&
      lunarMount.current.driving &&
      lunarMount.current.controller
    ) {
      const rover = lunarMount.current.controller
      const { pitch, zoom } = input.current
      camTarget
        .set(0, 3 + Math.sin(pitch) * zoom, -zoom)
        .applyAxisAngle(upAxis, rover.yaw)
        .add(p)
      camTarget.y = Math.max(camTarget.y, groundHeight(camTarget.x, camTarget.z) + 1.2)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 5))
      camera.up.set(0, 1, 0)
      camera.lookAt(p.x, p.y + 1.2, p.z)
    } else if (!landing && mode === 'walk' && roberRemote.current) {
      const rover = roberRemote.current
      camTarget.set(0, 4.5, -8).applyAxisAngle(upAxis, rover.rotation.y).add(rover.position)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 5))
      camera.up.set(0, 1, 0)
      camera.lookAt(rover.position.x, rover.position.y + 1, rover.position.z)
    } else if (!landing && mode === 'walk') {
      const { yaw, pitch, zoom } = input.current
      if (indoors) {
        // Direct YXZ Euler rotation guarantees mathematically ZERO roll at any yaw and pitch
        camera.position.set(p.x, p.y + (motion.current.seat ? 1.1 : 1.62), p.z)
        camera.rotation.order = 'YXZ'
        camera.rotation.set(-pitch, yaw, 0)
      } else {
        const h = Math.cos(pitch) * (buggy.driving && world.id === 'earth' ? 8 : zoom)
        camTarget.set(
          p.x + Math.sin(yaw) * h,
          p.y +
            MOTION_SCALE.cameraHeight +
            Math.sin(pitch) * (buggy.driving && world.id === 'earth' ? 8 : zoom),
          p.z + Math.cos(yaw) * h,
        )
        // Pull the follow camera toward the player when a building blocks its line of sight.
        for (let i = 1; i <= 12; i++) {
          const t = i / 12
          const x = T.MathUtils.lerp(p.x, camTarget.x, t),
            z = T.MathUtils.lerp(p.z, camTarget.z, t)
          if (!worldClear(x, z)) {
            camTarget.lerpVectors(p, camTarget, Math.max(0.12, (i - 1) / 12))
            camTarget.y = Math.max(camTarget.y, p.y + 2.1)
            break
          }
        }
        camera.position.lerp(camTarget, 1 - Math.exp(-delta * 7))
        camera.up.set(0, 1, 0)
        camera.lookAt(lookTarget.set(p.x, p.y + MOTION_SCALE.cameraTarget, p.z))
      }
    } else if (!landing && mode === 'tour') {
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
      camera.up.set(0, 1, 0)
      camera.lookAt(lookTarget)
    }
    report.current += delta
    if (report.current > 0.16) {
      report.current = 0
      onPosition({
        x: p.x,
        z: p.z,
        nearby:
          (world.id === 'earth' && buggy.driving) || (moon && lunarMount.current.driving)
            ? null
            : (stationFor(p.x, p.z)?.sector ?? null),
        vehicle: moon
          ? lunarMount.current.driving
            ? 'driving'
            : canBoardLunarRover(lunarMount.current.controller, p.x, p.z)
              ? 'near'
              : null
          : world.id === 'earth' &&
            (buggy.driving ? 'driving' : canBoard(p.x, p.z) ? 'near' : null),
        speed: moon
          ? Math.abs(lunarMount.current.controller?.speed ?? 0) * 3.6
          : world.id === 'earth'
            ? Math.abs(buggy.speed) * 3.6
            : 0,
        exitBlocked: moon ? lunarMount.current.exitBlocked : buggy.driving && exitBlocked.current,
        fps: fps.current,
        room: roomAt(p.x, p.z),
      })
    }
  })
  return (
    <>
      {moon && <RoverLunar mount={lunarMount} input={input} paused={paused || mode !== 'walk'} />}
      {world.id === 'earth' && (
        <group
          ref={vehicle}
          position={[buggy.x, groundHeight(buggy.x, buggy.z) + 0.025, buggy.z]}
          rotation={[0, buggy.yaw, 0]}
        >
          <BuggyModel />
        </group>
      )}
      <group ref={player} position={[START[0], 0, START[1]]} rotation={[0, Math.PI, 0]}>
        <CharacterBoundary
          key={`${world.id}-${wardrobe.character}-${wardrobe[world.id]}`}
          fallback={
            world.id === 'earth' ? (
              <ExplorerCharacter
                motion={motion}
                reduced={reduced}
                paused={paused || mode !== 'walk'}
              />
            ) : (
              <Astronaut moving={moving} phase={phase} />
            )
          }
        >
          {world.id === 'earth' || wardrobe[world.id] === 'eva' ? (
            <ExplorerCharacter
              motion={motion}
              reduced={reduced}
              paused={paused || mode !== 'walk'}
              character={wardrobe.character}
              outfit={world.id === 'earth' ? wardrobe.earth : 'eva'}
              helmet={wardrobe.helmet}
              seatAtOrigin={moon}
            />
          ) : (
            <Astronaut moving={moving} phase={phase} />
          )}
        </CharacterBoundary>
      </group>
      <TarsCompanions
        targets={[
          {
            id: 'crew-1',
            body: player,
            motion,
            isIndoors: () => !!roomAt(location.current.x, location.current.z),
            isDriving: () =>
              (world.id === 'earth' && buggy.driving) || (moon && lunarMount.current.driving),
          },
        ]}
        height={groundHeight}
        canWalk={tarsCanWalk}
        reduced={reduced}
      />
      <FirstPersonArms
        active={mode === 'walk' && isFirstPerson}
        motion={motion}
        input={input}
        reduced={reduced}
        outfit={world.id === 'earth' ? wardrobe.earth : 'eva'}
        character={wardrobe.character}
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
