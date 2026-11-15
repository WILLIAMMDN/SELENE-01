import { buggy, buggyExit, driveBuggy, nearBuggy, outsideBuggy } from '../buggyControl'
import BuggyModel from '../BuggyModel'
import {
  canBoardLunarRover,
  lunarRoverExit,
  outsideLunarRover,
  type LunarSession,
} from '../lunar/lunarRoverControl'
import { completeLunarOperation, LUNAR_TRAVERSE_DISTANCE } from '../lunar/lunarMissionProgress'
import { lunarWorkstationAt } from '../lunar/lunarFieldwork'
import { createSamplingPose, SAMPLING, sampleLunarPose } from '../lunar/lunarSampling'
import { lunarPedestrianClear, lunarStationAt, lunarWalkingHeight } from '../lunar/lunarNavigation'
import {
  clearLunarDoors,
  LUNAR_HAB_CHECKPOINT,
  lunarCabinSealed,
  lunarDeckAt,
  lunarDoorSweepClear,
  nearbyLunarDoor,
} from '../lunar/lunarInteriorNavigation'
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
import ExplorerCharacter from '../ExplorerCharacter'
import { MOTION_SCALE } from '../physicalScale'
import { CHARACTER_KEYS, createCharacterMotion, stepCharacter } from '../characterMotion'
import {
  freshLunarSuit,
  LUNAR_INDOOR_SPEED,
  LUNAR_GRAVITY,
  lunarVelocity,
  stepLunarSuit,
  LUNAR_JUMP_SPEED,
  LUNAR_WALK_SPEED,
  LUNAR_RUN_SPEED,
  LUNAR_TAKEOFF_TIME,
  LUNAR_LAND_TIME,
} from '../lunar/lunarPhysics'
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
  lunar,
}: SceneProps & { lunar: LunarSession }) {
  const wardrobe = useWardrobe()
  const world = useWorld(),
    { sectors: SECTORS, start: START, height: terrainHeight, canWalk: worldClear } = world
  const moon = world.id === 'moon'
  const canWalk = (x: number, z: number) => {
    const rover = lunar.rover
    return (
      (moon
        ? lunarPedestrianClear(x, z) && clearLunarDoors(lunar.doors, x, z)
        : worldClear(x, z)) &&
      (world.id !== 'earth' || outsideBuggy(x, z)) &&
      (!moon || !rover || outsideLunarRover({ x, z }, rover.vehicle.position, rover.yaw))
    )
  }
  const tarsCanWalk = (x: number, z: number) =>
    canWalk(x, z) && (world.id !== 'earth' || !buildingAt(x, z, true))
  const carClear = (x: number, z: number) => worldClear(x, z) && !buildingAt(x, z)
  const canBoard = (x: number, z: number) =>
    nearBuggy(x, z) &&
    !buildingAt(x, z) &&
    [0.2, 0.4, 0.6, 0.8].every((t) => worldClear(x + (buggy.x - x) * t, z + (buggy.z - z) * t))
  const groundHeight = (x: number, z: number) =>
    moon ? lunarWalkingHeight(x, z) : walkingHeight(x, z, terrainHeight, world.id === 'earth')
  const roomAt = (x: number, z: number) =>
    moon ? (lunarDeckAt(x, z)?.room ?? null) : buildingAt(x, z, world.id === 'earth')
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

  // Estado del salto bajo gravedad lunar (solo activo en world === 'moon')
  const lunarJump = useRef<{
    phase: 'ground' | 'takeoff' | 'air' | 'land'
    timer: number
    airY: number
    verticalSpeed: number
  }>({ phase: 'ground', timer: 0, airY: 0, verticalSpeed: 0 })
  const { camera, gl } = useThree()
  const modeRef = useRef(mode)
  modeRef.current = mode
  const location = useRef(new T.Vector3(START[0], 0, START[1]))
  const lastMode = useRef<ViewMode>('walk')
  const seated = useRef(false)
  const samplingPose = useRef(createSamplingPose())
  const suit = useRef(freshLunarSuit())
  const recovered = useRef(false)
  const lunarDrift = useRef(new T.Vector2())
  const traverseStart = useRef(0)
  if (moon) lunar.position = location.current
  useEffect(() => {
    const s = SECTORS.find((s) => s.id === travel.id)
    const p = travel.point ?? (s ? s.entry : START)
    buggy.driving = false
    buggy.speed = 0
    lunar.boarded = false
    lunar.sampling = undefined
    lunarDrift.current.set(0, 0)
    exitBlocked.current = false
    const rover = lunar.rover
    if (rover) {
      rover.stop()
      rover.speed = 0
    }
    firstPerson.current = false
    setIsFirstPerson(false)
    location.current.set(p[0], groundHeight(...p), p[1])
    if (world.id === 'earth' && !outsideBuggy(p[0], p[1])) {
      const exit = buggyExit(worldClear)
      if (exit) location.current.set(exit.x, groundHeight(exit.x, exit.z), exit.z)
    }
    if (moon && rover && !outsideLunarRover(location.current, rover.vehicle.position, rover.yaw)) {
      const exit = lunarRoverExit(rover.vehicle.position, rover.yaw, worldClear)
      if (exit) location.current.set(exit.x, groundHeight(exit.x, exit.z), exit.z)
    }
    input.current.keys.clear()
    input.current.actions.length = 0
    motion.current = createCharacterMotion()
    lunarJump.current = { phase: 'ground', timer: 0, airY: 0, verticalSpeed: 0 }
    input.current.yaw = 0
    if (player.current) player.current.position.copy(location.current)
    camera.position.set(p[0], groundHeight(...p) + 2.7, p[1] + MOTION_SCALE.zoom)
  }, [travel, camera, input])
  useEffect(() => {
    const stop = () => {
      buggy.speed = 0
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
  useEffect(() => {
    const releaseKeyboard = bindCharacterKeyboard({
      controls: input.current,
      enabled: () => !paused && modeRef.current === 'walk' && !roberRemote.current,
      onAction: (e) => {
        if (moon && lunar.boarded) {
          if (e.code === 'Space') {
            e.preventDefault()
            input.current.keys.add('Space')
          } else if (e.code === 'KeyE' && !e.repeat) {
            e.preventDefault()
            input.current.actions.push('interact')
          } else if (e.code === 'KeyR' && !e.repeat) {
            lunar.rover?.reset()
            traverseStart.current = 0
            exitBlocked.current = false
          }
          return
        }
        if (moon && lunar.sampling) return
        if (moon && e.code === 'KeyE' && !e.repeat) {
          const { x, z } = location.current
          if (lunarWorkstationAt(x, z)) {
            e.preventDefault()
            input.current.actions.push('workstation')
            return
          }
          const door = nearbyLunarDoor(lunar.doors, x, z)
          if (door) {
            e.preventDefault()
            input.current.actions.push('hatch')
            return
          }
          if (lunar.interact?.()) {
            e.preventDefault()
            return
          }
          const rover = lunar.rover
          if (rover && canBoardLunarRover(location.current, rover.vehicle.position, worldClear)) {
            e.preventDefault()
            input.current.actions.push('interact')
            return
          }
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
        if (world.id === 'earth' && CHARACTER_KEYS[e.code]) {
          e.preventDefault()
          if (!e.repeat) input.current.actions.push(CHARACTER_KEYS[e.code])
        } else if (world.id === 'moon' && e.code === 'Space' && !e.repeat) {
          // Salto lunar: se activa solo si el jugador está en el suelo
          e.preventDefault()
          if (lunarJump.current.phase === 'ground') {
            lunarJump.current.phase = 'takeoff'
            lunarJump.current.timer = LUNAR_TAKEOFF_TIME
          }
        } else if (e.code === 'KeyE' && !e.repeat) {
          const station = stationFor(location.current.x, location.current.z)
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
      if (modeRef.current !== 'walk' || firstPerson.current) return
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
    const rover = moon ? lunar.rover : undefined
    const sampling = moon ? lunar.sampling : undefined
    motion.current.samplingPose = undefined
    if (
      moon &&
      mode === 'walk' &&
      !paused &&
      !lunar.boarded &&
      input.current.actions.includes('workstation')
    ) {
      input.current.actions.length = 0
      const station = lunarWorkstationAt(p.x, p.z)
      if (station)
        window.dispatchEvent(new CustomEvent('selene-lunar-workstation', { detail: station.id }))
    }
    if (
      moon &&
      mode === 'walk' &&
      !paused &&
      !lunar.boarded &&
      input.current.actions.includes('hatch')
    ) {
      input.current.actions.splice(input.current.actions.indexOf('hatch'), 1)
      const door = nearbyLunarDoor(lunar.doors, p.x, p.z)
      const state = door && lunar.doors.get(door.id)
      if (
        door &&
        state &&
        state.progress === Number(state.open) &&
        lunarDoorSweepClear(door, p.x, p.z)
      ) {
        state.open = !state.open
        report.current = 1
      }
    }
    if (rover && mode === 'walk' && !paused && input.current.actions.includes('interact')) {
      input.current.actions.length = 0
      if (lunar.boarded) {
        rover.stop()
        rover.speed = 0
        const exit = lunarRoverExit(rover.vehicle.position, rover.yaw, worldClear)
        exitBlocked.current = !exit
        if (exit) {
          lunar.boarded = false
          p.set(exit.x, groundHeight(exit.x, exit.z), exit.z)
          input.current.yaw = rover.yaw + Math.PI
          if (rover.distance - traverseStart.current >= LUNAR_TRAVERSE_DISTANCE)
            completeLunarOperation('traverse')
        }
      } else if (
        lunarJump.current.phase === 'ground' &&
        canBoardLunarRover(p, rover.vehicle.position, worldClear)
      ) {
        lunar.boarded = true
        lunarDrift.current.set(0, 0)
        traverseStart.current = rover.distance
        exitBlocked.current = false
        lunarJump.current = { phase: 'ground', timer: 0, airY: 0, verticalSpeed: 0 }
      }
      report.current = 1
      k.clear()
    }
    const lunarDriving = !!rover && lunar.boarded
    seated.current = lunarDriving
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
    if (sampling) {
      k.clear()
      input.current.actions.length = 0
      lunarDrift.current.set(0, 0)
      moving.current = 0
      motion.current.speed = 0
      motion.current.clip = 'Idle'
      const [x, z] = sampling.resource.position
      const dx = x - p.x,
        dz = z - p.z
      const distance = Math.hypot(dx, dz)
      if (!paused && mode === 'walk') {
        if (player.current) player.current.rotation.y = Math.atan2(dx, dz)
        if (sampling.approaching) {
          const step = Math.min(1.38 * delta, Math.max(0, distance - 1.57))
          const beforeX = p.x,
            beforeZ = p.z
          if (step > 0)
            moveWithCollisions(p, (dx / distance) * step, (dz / distance) * step, canWalk)
          p.y = groundHeight(p.x, p.z)
          const moved = Math.hypot(p.x - beforeX, p.z - beforeZ)
          if (moved > 0.0001) {
            moving.current = 1
            motion.current.speed = 1.38
            phase.current += delta * 4.5
          } else if (distance <= 2.08) {
            sampling.approaching = false
          } else {
            lunar.sampling = undefined
            window.dispatchEvent(
              new CustomEvent('selene-dialogue', {
                detail: {
                  speaker: sampling.resource.name,
                  lines: [
                    'El acceso está bloqueado. Rodea el obstáculo y vuelve a acercarte al depósito.',
                  ],
                  action: 'Volver al campo',
                },
              }),
            )
          }
        }
        if (!sampling.approaching) {
          const profile = SAMPLING[sampling.resource.id]
          const t = sampling.elapsed
          const crouch = Math.min(
            1,
            Math.max(0, t / profile.contact),
            Math.max(0, (profile.end - t) / 0.43),
          )
          motion.current.samplingPose = {
            pose: sampleLunarPose(samplingPose.current, sampling, p),
            progress: t / profile.end,
            crouch,
          }
        }
      }
    } else if (lunarDriving) {
      p.copy(rover.vehicle.position)
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
          const station = stationFor(p.x, p.z)
          if (station) onInteract(station.sector)
        }
      } else {
        input.current.actions.length = 0
        motion.current.speed = 0
      }
    } else {
      // Salto lunar desde botón táctil (action 'jump' enviado por WorldExperience)
      if (moon && mode === 'walk' && !paused) {
        const jumpIdx = input.current.actions.indexOf('jump')
        if (jumpIdx !== -1) {
          input.current.actions.splice(jumpIdx, 1)
          if (lunarJump.current.phase === 'ground') {
            lunarJump.current.phase = 'takeoff'
            lunarJump.current.timer = LUNAR_TAKEOFF_TIME
          }
        }
      }
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

      const isRunning = k.has('ShiftLeft') || k.has('ShiftRight')
      const indoors = moon && !!roomAt(p.x, p.z)
      const speed = moon
        ? indoors
          ? LUNAR_INDOOR_SPEED
          : isRunning
            ? LUNAR_RUN_SPEED
            : LUNAR_WALK_SPEED
        : isRunning
          ? MOTION_SCALE.run
          : MOTION_SCALE.walk
      const length = Math.hypot(dx, dz) || 1
      const yaw = input.current.yaw
      const wx = (dx * Math.cos(yaw) + dz * Math.sin(yaw)) / length
      const wz = (-dx * Math.sin(yaw) + dz * Math.cos(yaw)) / length
      const velocity = lunarDrift.current
      const lj = lunarJump.current
      if (moon) {
        if (paused || mode !== 'walk') velocity.set(0, 0)
        else {
          const speedFactor = lj.phase === 'land' ? 0.42 : lj.phase === 'takeoff' ? 0.65 : 1
          velocity.x = lunarVelocity(
            velocity.x,
            wx * speed * speedFactor,
            delta,
            lj.phase === 'air',
          )
          velocity.y = lunarVelocity(
            velocity.y,
            wz * speed * speedFactor,
            delta,
            lj.phase === 'air',
          )
        }
        // Steps are swept in small increments; a wall or floor edge cannot be skipped.
        const beforeX = p.x,
          beforeZ = p.z
        moveWithCollisions(p, velocity.x * delta, velocity.y * delta, (x, z) => {
          if (!canWalk(x, z)) return false
          const rise = groundHeight(x, z) - groundHeight(p.x, p.z)
          return rise <= 0.18 && (rise >= -0.22 || (!lunarDeckAt(p.x, p.z) && !lunarDeckAt(x, z)))
        })
        if (p.x === beforeX) velocity.x = 0
        if (p.z === beforeZ) velocity.y = 0
        moving.current = velocity.length() > 0.04 ? 1 : 0
      } else if (moving.current) {
        moveWithCollisions(p, wx * speed * delta, wz * speed * delta, canWalk)
        p.y = groundHeight(p.x, p.z)
      }
      if (moving.current) {
        phase.current += delta * (moon ? (isRunning && !indoors ? 7.2 : 4.5) : isRunning ? 9 : 5.5)
        if (player.current) {
          const desired = moon ? Math.atan2(velocity.x, velocity.y) : Math.atan2(wx, wz)
          const difference = Math.atan2(
            Math.sin(desired - player.current.rotation.y),
            Math.cos(desired - player.current.rotation.y),
          )
          player.current.rotation.y += difference * Math.min(1, delta * 14)
        }
      }

      // Jump follows the lunar ballistic trajectory. Inside, the suit stays on the deck.
      if (moon && !paused && mode === 'walk') {
        const ground = groundHeight(p.x, p.z)
        if (indoors || lunarDeckAt(p.x, p.z)) {
          lj.phase = 'ground'
          p.y = ground
        }

        if (lj.phase === 'takeoff' || lj.phase === 'land') {
          lj.timer -= delta
          if (lj.timer <= 0) {
            if (lj.phase === 'takeoff') {
              lj.phase = 'air'
              lj.airY = ground
              lj.verticalSpeed = LUNAR_JUMP_SPEED
            } else {
              lj.phase = 'ground'
            }
          }
        }

        if (lj.phase === 'air') {
          // Cinemática bajo gravedad lunar: Δy = v·Δt − ½·g·Δt²
          lj.airY += lj.verticalSpeed * delta - 0.5 * LUNAR_GRAVITY * delta * delta
          lj.verticalSpeed -= LUNAR_GRAVITY * delta
          if (lj.airY <= ground) {
            lj.airY = ground
            lj.verticalSpeed = 0
            lj.phase = 'land'
            lj.timer = LUNAR_LAND_TIME
          }
          p.y = lj.airY
        } else if (lj.phase === 'ground') {
          p.y = ground
        }

        // Animación: Jump_Air durante el vuelo, Jump_Land al caer
        if (lj.phase === 'takeoff') {
          motion.current.clip = 'Jump_Start'
        } else if (lj.phase === 'air') {
          motion.current.clip = 'Jump_Air'
        } else if (lj.phase === 'land') {
          motion.current.clip = 'Jump_Land'
        }
      }
    }
    if (world.id !== 'earth' && !lunarDriving && !sampling) {
      const isRunning = k.has('ShiftLeft') || k.has('ShiftRight')
      motion.current.speed = moon
        ? lunarDrift.current.length()
        : moving.current * (isRunning ? MOTION_SCALE.run : MOTION_SCALE.walk)
      if (!moon || lunarJump.current.phase === 'ground') {
        motion.current.clip =
          motion.current.speed > (moon ? 2.3 : 2.5) ? 'Run' : moving.current ? 'Walk' : 'Idle'
      }
    }
    if (moon && mode === 'walk' && !paused) {
      const sealed = !lunarDriving && !!roomAt(p.x, p.z) && lunarCabinSealed(lunar.doors)
      const effort = lunarDriving
        ? 0.12
        : Math.min(
            1,
            (lunarDrift.current.length() / LUNAR_RUN_SPEED) * 0.85 +
              (lunarJump.current.phase !== 'ground' ? 0.3 : 0),
          )
      if (stepLunarSuit(suit.current, delta, effort, sealed)) {
        recovered.current = true
        lunar.boarded = false
        lunar.sampling = undefined
        rover?.stop()
        if (rover) rover.speed = 0
        for (const state of lunar.doors.values()) state.open = false
        const [x, z] = LUNAR_HAB_CHECKPOINT
        p.set(x, lunarWalkingHeight(x, z), z)
        suit.current = { oxygen: 0.35, battery: 0.35, workload: 0 }
        k.clear()
        lunarDrift.current.set(0, 0)
        lunarJump.current = { phase: 'ground', timer: 0, airY: 0, verticalSpeed: 0 }
        report.current = 1
      } else if (recovered.current && suit.current.oxygen >= 0.98 && suit.current.battery >= 0.98) {
        recovered.current = false
      }
    }
    occupant.x = p.x
    occupant.z = p.z
    occupant.active = mode === 'walk' && !lunarDriving
    occupant.earth = world.id === 'earth'
    const indoors = !!roomAt(p.x, p.z)
    if (player.current) {
      player.current.position.copy(p)
      player.current.visible = !(mode === 'walk' && indoors)
      if (lunarDriving) {
        rover.driverSeat.getWorldPosition(player.current.position)
        // Sit_Idle pone la cadera por encima del origen del modelo.
        player.current.position.y -= 0.57
        player.current.rotation.y = rover.yaw
      } else if (world.id === 'earth' && buggy.driving) {
        player.current.position.x -= Math.cos(buggy.yaw) * 0.28
        player.current.position.z += Math.sin(buggy.yaw) * 0.28
        player.current.position.y += 0.18
        player.current.rotation.y = buggy.yaw
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
    }
    const cameraVehicle = lunarDriving ? rover.vehicle : roberRemote.current
    if (mode === 'walk' && sampling && !sampling.approaching && !reduced) {
      const [x, z] = sampling.resource.position
      const facing = Math.atan2(x - p.x, z - p.z)
      camTarget.set(3.5, 2.12, 0.84).applyAxisAngle(upAxis, facing).add(p)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 16))
      camera.up.set(0, 1, 0)
      camera.lookAt(lookTarget.set(p.x + (x - p.x) * 0.52, p.y + 0.92, p.z + (z - p.z) * 0.52))
    } else if (mode === 'walk' && cameraVehicle) {
      const yaw = lunarDriving ? rover.yaw : cameraVehicle.rotation.y
      camTarget.set(0, 4.5, -8).applyAxisAngle(upAxis, yaw).add(cameraVehicle.position)
      camera.position.lerp(camTarget, 1 - Math.exp(-delta * 5))
      camera.up.set(0, 1, 0)
      camera.lookAt(
        cameraVehicle.position.x,
        cameraVehicle.position.y + 1,
        cameraVehicle.position.z,
      )
    } else if (mode === 'walk') {
      const { yaw, pitch, zoom } = input.current
      if (indoors) {
        // Steady eye level and level horizon: camera.up ensures zero roll
        camera.position.set(p.x, p.y + (motion.current.seat ? 1.1 : 1.62), p.z)
        camera.up.set(0, 1, 0)
        camera.lookAt(
          lookTarget.set(
            p.x - Math.sin(yaw) * Math.cos(pitch),
            camera.position.y - Math.sin(pitch),
            p.z - Math.cos(yaw) * Math.cos(pitch),
          ),
        )
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
          if (!worldClear(x, z) || (moon && !clearLunarDoors(lunar.doors, x, z))) {
            camTarget.lerpVectors(p, camTarget, Math.max(0.12, (i - 1) / 12))
            camTarget.y = Math.max(camTarget.y, p.y + 2.1)
            break
          }
        }
        camera.position.lerp(camTarget, 1 - Math.exp(-delta * 7))
        camera.up.set(0, 1, 0)
        camera.lookAt(lookTarget.set(p.x, p.y + MOTION_SCALE.cameraTarget, p.z))
      }
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
      camera.up.set(0, 1, 0)
      camera.lookAt(lookTarget)
    }
    report.current += delta
    if (report.current > 0.16) {
      report.current = 0
      const door = moon && !lunarDriving ? nearbyLunarDoor(lunar.doors, p.x, p.z) : undefined
      const hatch = door && lunar.doors.get(door.id)
      onPosition({
        eva: moon
          ? {
              oxygen: suit.current.oxygen,
              battery: suit.current.battery,
              workload: suit.current.workload,
              sealed: indoors && lunarCabinSealed(lunar.doors),
              recovered: recovered.current,
            }
          : undefined,
        hatch:
          door && hatch
            ? {
                label: door.label,
                open: hatch.open,
                moving: hatch.progress !== Number(hatch.open),
                blocked: !lunarDoorSweepClear(door, p.x, p.z),
              }
            : undefined,
        x: p.x,
        z: p.z,
        nearby:
          lunarDriving || (world.id === 'earth' && buggy.driving)
            ? null
            : (stationFor(p.x, p.z)?.sector ?? null),
        vehicle: rover
          ? lunarDriving
            ? 'driving'
            : canBoardLunarRover(p, rover.vehicle.position, worldClear)
              ? 'near'
              : null
          : world.id === 'earth' &&
            (buggy.driving ? 'driving' : canBoard(p.x, p.z) ? 'near' : null),
        rover: rover
          ? { x: rover.vehicle.position.x, z: rover.vehicle.position.z, distance: rover.distance }
          : undefined,
        speed: Math.abs(rover?.speed ?? (world.id === 'earth' ? buggy.speed : 0)) * 3.6,
        exitBlocked: (lunarDriving || buggy.driving) && exitBlocked.current,
        fps: fps.current,
        room: roomAt(p.x, p.z),
        workstation: moon && !lunarDriving && !sampling ? lunarWorkstationAt(p.x, p.z) : undefined,
      })
    }
  })
  return (
    <>
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
              <Astronaut moving={moving} phase={phase} seated={seated} motion={motion} />
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
            />
          ) : (
            <Astronaut moving={moving} phase={phase} seated={seated} motion={motion} />
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
            isDriving: () => buggy.driving || lunar.boarded,
            isCinematic: () => moon && !reduced && !!lunar.sampling && !lunar.sampling.approaching,
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
