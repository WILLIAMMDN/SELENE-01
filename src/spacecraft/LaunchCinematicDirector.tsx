import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { LauncherId } from '../game/missionDesign'
import { LAUNCH_SITE } from './LaunchComplex'
import { getLaunchFrame, LAUNCH_DURATION, type LaunchClock } from './launchTimeline'

/** Shots remain grounded in LC-01 world coordinates and in the GLB's real 90 m scale. */
export function getCameraShot(time: number): { index: number; name: string } {
  if (time < 4) return { index: 1, name: 'CONFIRMACIÓN DE CABINA' }
  if (time < 8) return { index: 2, name: 'CABINA Y TORRE' }
  if (time < 12) return { index: 3, name: 'PLATAFORMA LC-01' }
  if (time < 18) return { index: 4, name: 'IGNICIÓN' }
  if (time < 24) return { index: 5, name: 'ASCENSO SOBRE ARTEMISA' }
  if (time < 28) return { index: 6, name: 'ATMÓSFERA' }
  if (time < 32) return { index: 7, name: 'SEPARACIÓN DE PROPULSORES' }
  if (time < 35) return { index: 8, name: 'APERTURA DE COFIA' }
  if (time < 38) return { index: 9, name: 'ETAPA PRINCIPAL' }
  if (time < 41) return { index: 10, name: 'LIBERACIÓN DE ODYSSEY' }
  return { index: 11, name: 'TRANSICIÓN A OPERACIONES' }
}

export default function LaunchCinematicDirector({
  clock,
  launcher,
  habitat,
  origin = [LAUNCH_SITE.x, 0, LAUNCH_SITE.z],
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
  const lastShot = useRef(-1)
  const completed = useRef(false)
  const cameraGoal = useMemo(() => new THREE.Vector3(), [])
  const targetGoal = useMemo(() => new THREE.Vector3(), [])
  const daylight = useMemo(() => new THREE.Color('#a7ccc6'), [])
  const deepSpace = useMemo(() => new THREE.Color('#111b2b'), [])
  const background = useMemo(() => new THREE.Color(), [])
  const onElapsedRef = useRef(onElapsed)
  const onCompleteRef = useRef(onComplete)
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    onElapsedRef.current = onElapsed
    onCompleteRef.current = onComplete
  }, [onElapsed, onComplete])

  useEffect(() => {
    clock.current = 0
    completed.current = false
    lastPublished.current = -1
    lastShot.current = -1
    camera.position.set(origin[0] + 14, origin[1] + 71, origin[2] - 24)
    camera.lookAt(origin[0], origin[1] + 70, origin[2] - 8)
    return () => {
      scene.background = daylight.clone()
    }
  }, [camera, clock, daylight, origin[0], origin[1], origin[2], scene])

  useFrame((_, rawDelta) => {
    if (completed.current) return
    const delta = Math.min(rawDelta, 0.08)
    clock.current = Math.min(LAUNCH_DURATION, clock.current + delta)
    const t = clock.current
    const frame = getLaunchFrame(t, launcher, habitat)
    const shot = getCameraShot(t)
    const [ox, oy, oz] = origin
    const altitude = frame.altitudeMeters
    const capsule = LAUNCH_SITE.height - 11 + (habitat ? 1 : 0) + altitude
    const stage = LAUNCH_SITE.height * 0.48 + altitude
    let fov = 46
    let shake = 0

    if (shot.index === 1) {
      // Boarding was performed interactively; do not show a second imaginary astronaut.
      cameraGoal.set(ox + 19, oy + 83, oz + 22)
      targetGoal.set(ox, oy + LAUNCH_SITE.height - 10, oz)
      fov = 40
    } else if (shot.index === 2) {
      cameraGoal.set(ox + 16, oy + 80, oz + 18)
      targetGoal.set(ox, oy + LAUNCH_SITE.height - 11, oz)
      fov = 43
    } else if (shot.index === 3) {
      // The campus, its hills and buildings remain visible behind the launch tower.
      cameraGoal.set(ox + 97, oy + 83, oz + 110)
      targetGoal.set(ox, oy + 48, oz)
      fov = 45
    } else if (shot.index === 4) {
      cameraGoal.set(ox + 17, oy + 9, oz + 21)
      targetGoal.set(ox, oy + 15, oz)
      fov = 57
      shake = Math.min(1, (t - 12) / 2) * 0.12
    } else if (shot.index === 5) {
      cameraGoal.set(ox + 51, oy + altitude + 45, oz + 65)
      targetGoal.set(ox, oy + stage, oz)
      fov = 46
      shake = 0.09
    } else if (shot.index === 6) {
      cameraGoal.set(ox + 39, oy + altitude + 53, oz + 42)
      targetGoal.set(ox, oy + stage, oz)
      fov = 43
    } else if (shot.index === 7) {
      cameraGoal.set(ox + 20, oy + altitude + 41, oz + 22)
      targetGoal.set(ox, oy + stage, oz)
      fov = 45
      shake = t < 28.6 ? 0.08 : 0
    } else if (shot.index === 8) {
      cameraGoal.set(ox + 13, oy + capsule + 2, oz + 16)
      targetGoal.set(ox, oy + capsule, oz)
      fov = 37
    } else if (shot.index === 9) {
      cameraGoal.set(ox + 25, oy + altitude + 65, oz + 32)
      targetGoal.set(ox, oy + altitude + 62, oz)
      fov = 43
    } else if (shot.index === 10) {
      cameraGoal.set(ox + 13, oy + capsule + 3, oz + 15)
      targetGoal.set(ox, oy + capsule, oz)
      fov = 40
    } else {
      const progress = (t - 41) / 4
      cameraGoal.set(
        ox + Math.sin(progress * 1.2 + 0.9) * 24,
        oy + capsule + 6,
        oz + Math.cos(progress * 1.2 + 0.9) * 24,
      )
      targetGoal.set(ox, oy + capsule, oz)
      fov = 42
    }

    // Actual camera cuts between beats; smooth dolly within each beat.
    if (shot.index !== lastShot.current) {
      camera.position.copy(cameraGoal)
      lastShot.current = shot.index
    } else {
      camera.position.lerp(cameraGoal, 1 - Math.exp(-delta * 4))
    }
    if (!reducedMotion && shake) {
      camera.position.x += Math.sin(t * 42) * shake
      camera.position.y += Math.cos(t * 38) * shake * 0.45
    }
    camera.lookAt(targetGoal)
    if (camera instanceof THREE.PerspectiveCamera) {
      const next = THREE.MathUtils.lerp(camera.fov, fov, 1 - Math.exp(-delta * 5))
      if (Math.abs(camera.fov - next) > 0.01) {
        camera.fov = next
        camera.updateProjectionMatrix()
      }
    }

    // Avoid presenting an atmospheric flythrough as a real NASA trajectory.
    background.copy(daylight).lerp(deepSpace, frame.spaceBlend)
    if (scene.background instanceof THREE.Color) scene.background.copy(background)
    if (t - lastPublished.current >= 0.12 || t >= LAUNCH_DURATION) {
      lastPublished.current = t
      onElapsedRef.current(t)
    }
    if (t >= LAUNCH_DURATION) {
      completed.current = true
      onCompleteRef.current()
    }
  })
  return null
}
