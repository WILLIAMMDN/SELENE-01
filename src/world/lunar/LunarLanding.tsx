import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { LANDING_DURATION, LandingSequence } from './LandingSequence'

const urls = [
  'models/lunar/landing/cinematica_aterrizaje_camaras.glb',
  'models/lunar/landing/cinematica_aterrizaje_fx.glb',
  'models/lander/lander_l01_v01.glb',
].map((path) => `${import.meta.env.BASE_URL}${path}`)
export default function LunarLanding({ onComplete }: { onComplete: () => void }) {
  const loaded = useGLTF(urls)
  const sequence = useMemo(() => new LandingSequence(loaded[0], loaded[1], loaded[2]), [loaded])
  const { camera, scene } = useThree()
  const elapsed = useRef(0),
    completed = useRef(false),
    finish = useRef(onComplete)
  finish.current = onComplete
  useEffect(() => {
    elapsed.current = 0
    completed.current = false
    if (!(camera instanceof T.PerspectiveCamera)) return
    const { fov, far, near } = camera
    const background = scene.background,
      fog = scene.fog
    scene.background = new T.Color('#000000')
    scene.fog = null
    camera.far = 1400
    camera.near = 0.05
    return () => {
      camera.fov = fov
      camera.far = far
      camera.near = near
      camera.updateProjectionMatrix()
      scene.background = background
      scene.fog = fog
      sequence.dispose()
    }
  }, [camera, scene, sequence])
  useFrame((_, rawDelta) => {
    if (completed.current || !(camera instanceof T.PerspectiveCamera)) return
    elapsed.current = Math.min(LANDING_DURATION, elapsed.current + Math.min(rawDelta, 0.08))
    const source = sequence.sample(elapsed.current)
    source.getWorldPosition(camera.position)
    source.getWorldQuaternion(camera.quaternion)
    camera.fov = source.fov
    camera.updateProjectionMatrix()
    if (elapsed.current >= LANDING_DURATION) {
      completed.current = true
      finish.current()
    }
  })
  return <primitive object={sequence.root} dispose={null} />
}
