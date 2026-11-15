import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { LauncherId } from '../game/missionDesign'
import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'

export type LaunchClock = { current: number }

export function getCameraShot(seconds: number): { index: number; name: string } {
  if (seconds < 3.0) return { index: 1, name: 'CÁM 01 · PRIMER PLANO ODYSSEY' }
  if (seconds < 5.0) return { index: 2, name: 'CÁM 02 · TORRE DE LANZAMIENTO' }
  if (seconds < 8.5) return { index: 3, name: 'CÁM 03 · TOBERAS E IGNICIÓN' }
  if (seconds < 14.5) return { index: 4, name: 'CÁM 04 · SEGUIMIENTO DE DESPEGUE' }
  if (seconds < 18.5) return { index: 5, name: 'CÁM 05 · SEPARACIÓN AUXILIARES' }
  if (seconds < 22.5) return { index: 6, name: 'CÁM 06 · ETAPA CENTRAL' }
  if (seconds < 26.5) return { index: 7, name: 'CÁM 07 · APERTURA DE COFIA' }
  if (seconds < 30.0) return { index: 8, name: 'CÁM 08 · LIBERACIÓN DE ODYSSEY' }
  return { index: 9, name: 'CÁM 09 · INSERCIÓN ORBITAL' }
}

/**
 * Cinematic multi-camera director with close-ups, dynamic cuts, liftoff camera rumble,
 * and heroic perspectives of the spacecraft modules and stage separations.
 */
export default function LaunchCinematicDirector({
  clock,
  launcher,
  habitat,
  origin = [0, 0, 0],
  onElapsed,
  onComplete,
}: {
  clock: LaunchClock
  launcher: LauncherId
  habitat: boolean
  origin?: [number, number, number]
  onElapsed: (seconds: number) => void
  onComplete: () => void
}) {
  const { camera, scene } = useThree()
  const lastPublished = useRef(-1)
  const lastShotId = useRef(-1)
  const completed = useRef(false)
  const cameraGoal = useMemo(() => new THREE.Vector3(), [])
  const lookGoal = useMemo(() => new THREE.Vector3(), [])
  const day = useMemo(() => new THREE.Color('#b8c8bd'), [])
  const space = useMemo(() => new THREE.Color('#0a101d'), [])
  const background = useMemo(() => new THREE.Color(), [])
  const onElapsedRef = useRef(onElapsed)
  const onCompleteRef = useRef(onComplete)

  const [ox, oy, oz] = origin

  useEffect(() => {
    onElapsedRef.current = onElapsed
    onCompleteRef.current = onComplete
  }, [onElapsed, onComplete])

  useEffect(() => {
    clock.current = 0
    completed.current = false
    lastPublished.current = -1
    lastShotId.current = -1
    const topY = oy + 56 + (habitat ? 4 : 0)
    camera.position.set(ox + 4.2, topY - 0.2, oz + 5.8)
    camera.lookAt(ox, topY - 0.8, oz)
    return () => {
      scene.background = day.clone()
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 50
        camera.updateProjectionMatrix()
      }
    }
  }, [clock, camera, scene, day, habitat, ox, oy, oz])

  useFrame((state, rawDelta) => {
    if (completed.current) return
    const delta = Math.min(rawDelta, 0.08)
    clock.current = Math.min(LAUNCH_DURATION, clock.current + delta)
    const t = clock.current
    const frame = getLaunchFrame(t, launcher)
    const altitude = frame.altitudeMeters
    const [ox, oy, oz] = origin
    const top = oy + 56 + (habitat ? 4 : 0) + altitude

    let targetFov = 42
    let shake = 0
    let currentShotId = 1

    if (t < 3.0) {
      // SHOT 1: Primer plano heroico de la nave ODYSSEY (Carga útil construida en hangar)
      currentShotId = 1
      const progress = t / 3.0
      const angle = 0.85 + progress * 0.35
      const radius = 5.8 - progress * 0.6
      cameraGoal.set(
        ox + Math.sin(angle) * radius,
        top - 0.2 + progress * 0.2,
        oz + Math.cos(angle) * radius,
      )
      lookGoal.set(ox, top - 0.8, oz)
      targetFov = 34
    } else if (t < 5.0) {
      // SHOT 2: Plano contra-picado desde la torre de lanzamiento
      currentShotId = 2
      const progress = (t - 3.0) / 2.0
      cameraGoal.set(ox + 16 - progress * 2, oy + 2.5 + progress * 1.5, oz + 15 - progress * 2)
      lookGoal.set(ox, oy + 42 + progress * 8, oz)
      targetFov = 54
    } else if (t < 8.5) {
      // SHOT 3: Primer plano de toberas e ignición de motores con temblor de cámara
      currentShotId = 3
      const progress = (t - 5.0) / 3.5
      const angle = 0.72 + progress * 0.22
      const radius = 8.5
      cameraGoal.set(
        ox + Math.sin(angle) * radius,
        oy + altitude + 1.2 + progress * 1.0,
        oz + Math.cos(angle) * radius,
      )
      lookGoal.set(ox, oy + altitude + 2.5, oz)
      targetFov = 46
      shake = Math.min(1, (t - 5.0) / 1.2) * 0.38
    } else if (t < 14.5) {
      // SHOT 4: Plano lateral de ascenso y seguimiento de despegue
      currentShotId = 4
      const progress = (t - 8.5) / 6.0
      cameraGoal.set(
        ox + 24 + Math.sin(t * 0.3) * 4,
        oy + altitude * 0.68 + 16,
        oz + 26 + Math.cos(t * 0.3) * 4,
      )
      lookGoal.set(ox, oy + altitude + 16, oz)
      targetFov = 44
      shake = Math.max(0, 0.26 - progress * 0.2)
    } else if (t < 18.5) {
      // SHOT 5: Primer plano: separación de aceleradores auxiliares
      currentShotId = 5
      const progress = (t - 14.5) / 4.0
      const angle = 0.95 + progress * 0.3
      const radius = 11.5 - progress * 1.5
      cameraGoal.set(
        ox + Math.sin(angle) * radius,
        oy + altitude + 22,
        oz + Math.cos(angle) * radius,
      )
      lookGoal.set(ox, oy + altitude + 20, oz)
      targetFov = 38
      shake = t >= 15.0 && t <= 15.8 ? 0.22 : 0.04
    } else if (t < 22.5) {
      // SHOT 6: Primer plano: separación de la etapa central
      currentShotId = 6
      const progress = (t - 18.5) / 4.0
      cameraGoal.set(
        ox + 7.5 + Math.sin(progress * 0.5) * 2,
        oy + altitude + 34,
        oz - 8.0 + progress * 2,
      )
      lookGoal.set(ox, oy + altitude + 30, oz)
      targetFov = 42
      shake = t >= 19.0 && t <= 19.7 ? 0.18 : 0.03
    } else if (t < 26.5) {
      // SHOT 7: Primer plano heroico: apertura y eyección de la cofia
      currentShotId = 7
      const progress = (t - 22.5) / 4.0
      const angle = 0.6 + progress * 0.45
      const radius = 5.8 - progress * 0.6
      cameraGoal.set(
        ox + Math.sin(angle) * radius,
        oy + altitude + 54,
        oz + Math.cos(angle) * radius,
      )
      lookGoal.set(ox, oy + altitude + 53, oz)
      targetFov = 35
      shake = t >= 23.0 && t <= 23.6 ? 0.12 : 0
    } else if (t < 30.0) {
      // SHOT 8: Primer plano: liberación y despliegue de ODYSSEY en el espacio
      currentShotId = 8
      const progress = (t - 26.5) / 3.5
      const angle = 1.2 + progress * 0.5
      const radius = 4.8 + progress * 0.8
      cameraGoal.set(
        ox + Math.sin(angle) * radius,
        oy + altitude + 54.5,
        oz + Math.cos(angle) * radius,
      )
      lookGoal.set(ox, oy + altitude + 53.5, oz)
      targetFov = 34
    } else {
      // SHOT 9: Órbita final: panorámica de ODYSSEY en órbita lunar entre las estrellas
      currentShotId = 9
      const progress = (t - 30.0) / 4.0
      const orbitAngle = 0.5 + progress * 1.6
      const orbitRadius = 9.5
      cameraGoal.set(
        ox + Math.sin(orbitAngle) * orbitRadius,
        oy + altitude + 54 + Math.sin(progress * Math.PI) * 1.2,
        oz + Math.cos(orbitAngle) * orbitRadius,
      )
      lookGoal.set(ox, oy + altitude + 53.5, oz)
      targetFov = 38
    }

    // Dynamic camera cut detection: snap on cut to avoid awkward 100m slides
    if (currentShotId !== lastShotId.current) {
      lastShotId.current = currentShotId
      state.camera.position.copy(cameraGoal)
      state.camera.lookAt(lookGoal)
    } else {
      const damping = 1 - Math.exp(-delta * 5.5)
      state.camera.position.lerp(cameraGoal, damping)
      state.camera.lookAt(lookGoal)
    }

    // High-frequency rumble / camera shake
    if (shake > 0) {
      const shakeTime = t * 50
      state.camera.position.x += Math.sin(shakeTime) * shake
      state.camera.position.y += Math.cos(shakeTime * 1.1) * shake * 0.7
      state.camera.position.z += Math.sin(shakeTime * 0.85) * shake
    }

    // Smooth FOV zoom
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const dampingFov = 1 - Math.exp(-delta * 4)
      if (Math.abs(state.camera.fov - targetFov) > 0.05) {
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, dampingFov)
        state.camera.updateProjectionMatrix()
      }
    }

    // Atmospheric transition from daylight to deep space
    background.copy(day).lerp(space, frame.spaceBlend)
    if (scene.background instanceof THREE.Color) scene.background.copy(background)

    if (frame.time - lastPublished.current > 0.12 || frame.time >= LAUNCH_DURATION) {
      lastPublished.current = frame.time
      onElapsedRef.current(frame.time)
    }

    if (frame.time >= LAUNCH_DURATION) {
      completed.current = true
      onCompleteRef.current()
    }
  })

  return null
}
