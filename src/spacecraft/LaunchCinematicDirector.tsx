import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { LauncherId } from '../game/missionDesign'
import { getLaunchFrame, LAUNCH_DURATION } from './launchTimeline'

export type LaunchClock = { current: number }

/**
 * Takes ownership of the scene camera only while a launch cinematic is playing.
 * The clock is shared with the 3D launcher so movement and GLB clips cannot drift.
 */
export default function LaunchCinematicDirector({
  clock,
  launcher,
  habitat,
  onElapsed,
  onComplete,
}: {
  clock: LaunchClock
  launcher: LauncherId
  habitat: boolean
  onElapsed: (seconds: number) => void
  onComplete: () => void
}) {
  const { camera, scene } = useThree()
  const lastPublished = useRef(-1)
  const completed = useRef(false)
  const cameraGoal = useMemo(() => new THREE.Vector3(), [])
  const lookGoal = useMemo(() => new THREE.Vector3(), [])
  const day = useMemo(() => new THREE.Color('#b8c8bd'), [])
  const space = useMemo(() => new THREE.Color('#101b2c'), [])
  const background = useMemo(() => new THREE.Color(), [])
  const onElapsedRef = useRef(onElapsed)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onElapsedRef.current = onElapsed
    onCompleteRef.current = onComplete
  }, [onElapsed, onComplete])
  useEffect(() => {
    clock.current = 0
    completed.current = false
    lastPublished.current = -1
    camera.position.set(116, 70, 128)
    camera.lookAt(0, 44, 0)
    return () => {
      scene.background = day.clone()
    }
  }, [clock, camera, scene, day])

  useFrame((state, rawDelta) => {
    if (completed.current) return
    const delta = Math.min(rawDelta, 0.08)
    clock.current = Math.min(LAUNCH_DURATION, clock.current + delta)
    const frame = getLaunchFrame(clock.current, launcher)
    const altitude = frame.altitudeMeters
    const top = 42 + (habitat ? 3 : 0) + altitude

    if (frame.time < 5) {
      cameraGoal.set(115 + Math.sin(frame.time * 0.3) * 9, 70, 126)
      lookGoal.set(0, 43, 0)
    } else if (frame.time < 9) {
      cameraGoal.set(72, 41, 100)
      lookGoal.set(0, 42, 0)
    } else if (frame.time < 19) {
      cameraGoal.set(89 + Math.sin(frame.time * 0.25) * 18, altitude + 58, 114)
      lookGoal.set(0, top, 0)
    } else {
      cameraGoal.set(65 + Math.sin(frame.time * 0.19) * 34, altitude + 48, 96)
      lookGoal.set(0, top, 0)
    }
    const damping = 1 - Math.exp(-delta * 2.7)
    state.camera.position.lerp(cameraGoal, damping)
    state.camera.lookAt(lookGoal)
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const fov = frame.time < 9 ? 47 : frame.time < 23 ? 43 : 49
      if (Math.abs(state.camera.fov - fov) > 0.1) {
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, fov, damping)
        state.camera.updateProjectionMatrix()
      }
    }
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
