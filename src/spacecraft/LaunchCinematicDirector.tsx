import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { LauncherId } from '../game/missionDesign'
import { LAUNCH_SITE } from './LaunchComplex'
import { getLaunchCameraPose } from './launchCameraShots'
import { getLaunchFrame, LAUNCH_DURATION, type LaunchClock } from './launchTimeline'

/**
 * Film direction in the SAME Canvas as the campus.
 * Full-vehicle compositions for ignition/liftoff, safe close-ups for separations.
 * The perspective never starts inside the engine, fairing or boosters.
 */
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
  const lastShot = useRef('')
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
    lastShot.current = ''
    camera.up.set(0, 1, 0)
    const start = getLaunchCameraPose(0, launcher, origin, LAUNCH_SITE.height)
    camera.position.set(...start.position)
    camera.lookAt(...start.target)
    // The next scene owns its background and fog. Restoring the launch colors here
    // overrides the orbital scene during the same React commit.
  }, [camera, clock, launcher, origin[0], origin[1], origin[2], scene])

  useFrame((_, rawDelta) => {
    if (completed.current) return
    const delta = Math.min(rawDelta, 0.35)
    clock.current = Math.min(LAUNCH_DURATION, clock.current + delta)
    const t = clock.current
    const frame = getLaunchFrame(t, launcher, habitat)
    const pose = getLaunchCameraPose(t, launcher, origin, LAUNCH_SITE.height)
    cameraGoal.set(...pose.position)
    targetGoal.set(...pose.target)

    // An actual intentional film cut between scenes; smooth lateral tracking within one scene.
    if (lastShot.current !== pose.shot.id) {
      camera.position.copy(cameraGoal)
      lastShot.current = pose.shot.id
    } else {
      camera.position.lerp(cameraGoal, 1 - Math.exp(-delta * 3.3))
    }
    if (!reducedMotion && t >= 15 && t < 19) {
      const intensity = 0.025
      camera.position.x += Math.sin(t * 33) * intensity
      camera.position.y += Math.cos(t * 39) * intensity
    }
    camera.lookAt(targetGoal)
    if (camera instanceof THREE.PerspectiveCamera) {
      const nextFov = THREE.MathUtils.lerp(camera.fov, pose.fov, 1 - Math.exp(-delta * 6))
      if (Math.abs(camera.fov - nextFov) > 0.015) {
        camera.fov = nextFov
        camera.updateProjectionMatrix()
      }
    }

    // Space is a distant atmosphere transition, not a different 3D campus.
    background.copy(daylight).lerp(deepSpace, frame.spaceBlend)
    if (scene.background instanceof THREE.Color) scene.background.copy(background)
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 250 + frame.spaceBlend * 240
      scene.fog.far = 1000 + frame.spaceBlend * 2600
      scene.fog.color.copy(background)
    }

    if (t - lastPublished.current >= 0.12 || t >= LAUNCH_DURATION) {
      lastPublished.current = t
      onElapsedRef.current(t)
    }
    if (t >= LAUNCH_DURATION) {
      completed.current = true
      queueMicrotask(() => onCompleteRef.current())
    }
  })
  return null
}
