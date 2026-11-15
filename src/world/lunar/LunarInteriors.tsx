import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { lunarDoors, lunarDoorSweepClear, lunarInteriorInstances } from './lunarInteriorNavigation'
import type { LunarSession } from './lunarRoverControl'

type Props = { lunar: LunarSession; paused: boolean; reduced: boolean }

function LunarModule({
  spec,
  lunar,
  paused,
  reduced,
}: Props & { spec: (typeof lunarInteriorInstances)[number] }) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/lunar/transitable/${spec.file}`,
  )
  const door = lunarDoors.find(({ id }) => id === spec.id)
  const asset = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((object) => {
      if (object instanceof T.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    const clip = animations.find(({ name }) => name === door?.clip)
    const mixer = new T.AnimationMixer(root)
    const action = clip ? mixer.clipAction(clip).setLoop(T.LoopOnce, 1) : null
    if (action) {
      action.play()
      action.paused = true
      mixer.update(0)
    }
    return { root, mixer, action }
  }, [scene, animations, door])
  useFrame((_, dt) => {
    if (!door || paused || !asset.action) return
    const state = lunar.doors.get(door.id)
    if (!state || state.progress === Number(state.open)) return
    const player = lunar.position
    if (!state.open && player && !lunarDoorSweepClear(door, player.x, player.z)) return
    const delta = reduced ? 1 : Math.min(dt, 0.05) / 0.95
    state.progress = state.open
      ? Math.min(1, state.progress + delta)
      : Math.max(0, state.progress - delta)
    asset.action.time = state.progress * asset.action.getClip().duration
    asset.mixer.update(0)
  })

  return (
    <group
      name={spec.id}
      position={spec.position as [number, number, number]}
      quaternion={spec.quaternion as [number, number, number, number]}
      scale={spec.scale as [number, number, number]}
    >
      <primitive object={asset.root} dispose={null} />
      {door && (
        <pointLight position={[0, 2.3, 0]} color="#fff3df" intensity={7} distance={6} decay={2} />
      )}
    </group>
  )
}

export default function LunarInteriors(props: Props) {
  return (
    <>
      {lunarInteriorInstances.map((spec) => (
        <LunarModule key={spec.id} spec={spec} {...props} />
      ))}
    </>
  )
}
