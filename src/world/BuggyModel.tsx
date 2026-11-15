import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { cloneScenery } from './EnvironmentProps'
import { buggy } from './buggyControl'

export default function BuggyModel() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/environment/buggy_drivable.glb`)
  const actor = useMemo(() => cloneScenery(scene), [scene])
  const wheels = useMemo(
    () =>
      ['LF', 'RF', 'LB', 'RB'].map((id) => ({
        wheel: actor.getObjectByName(`Wheel_${id}`),
        steering: actor.getObjectByName(`Steer_Wheel_${id}`),
        front: id.endsWith('F'),
      })),
    [actor],
  )
  useFrame(() => {
    for (const { wheel, steering, front } of wheels) {
      if (wheel) wheel.rotation.x = (buggy.distance / 0.38) % (Math.PI * 2)
      if (steering && front) steering.rotation.y = -buggy.steer
    }
  })
  return <primitive object={actor} dispose={null} />
}
