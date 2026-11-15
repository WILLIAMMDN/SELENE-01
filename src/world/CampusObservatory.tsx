import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { toon } from './ArtKit'
import { OBSERVATORY, OBSERVATORY_ACTIONS } from './observatoryLayout'
import { groundHeight } from './worldData'

export default function CampusObservatory({
  paused,
  reduced,
}: {
  paused: boolean
  reduced: boolean
}) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/observatory/observatory.glb`,
  )
  const asset = useMemo(() => {
    const root = clone(scene)
    const materials = new Map<T.Material, T.Material>()
    root.traverse((n) => {
      if (!(n instanceof T.Mesh)) return
      const convert = (source: T.Material) => {
        if (materials.has(source)) return materials.get(source)!
        const original = source as T.MeshStandardMaterial
        const result = new T.MeshToonMaterial({
          color: original.color,
          map: original.map,
          gradientMap: toon('#e2e1cb').gradientMap,
          side: source.side,
          transparent: source.transparent,
          opacity: source.opacity,
        })
        materials.set(source, result)
        return result
      }
      n.material = Array.isArray(n.material) ? n.material.map(convert) : convert(n.material)
      n.castShadow = true
      n.receiveShadow = true
    })
    return { root, mixer: new T.AnimationMixer(root), materials }
  }, [scene])
  useEffect(() => {
    const play = (id: string, finish = false) => {
      const clip = animations.find((a) => a.name === id)
      if (!clip) return
      asset.mixer.stopAllAction()
      const action = asset.mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
      action.clampWhenFinished = true
      action.play()
      if (finish) {
        action.time = clip.duration
        asset.mixer.update(0)
        action.paused = true
      }
    }
    play('Obs_Close_Park', true)
    const command = (event: Event) => {
      const id = (event as CustomEvent<string>).detail
      if (OBSERVATORY_ACTIONS.some(([name]) => name === id)) play(id, reduced)
    }
    window.addEventListener('selene-observatory-action', command)
    return () => {
      window.removeEventListener('selene-observatory-action', command)
      asset.mixer.stopAllAction()
      // Keep actions bound through React StrictMode's effect replay.
    }
  }, [asset, animations, reduced])
  useEffect(
    () => () => {
      asset.materials.forEach((m) => m.dispose())
    },
    [asset],
  )
  useFrame((_, dt) => {
    if (!paused && !reduced) asset.mixer.update(Math.min(dt, 0.05))
  })
  return (
    <group
      position={[
        OBSERVATORY.x,
        groundHeight(OBSERVATORY.x, OBSERVATORY.z) + OBSERVATORY.groundOffset,
        OBSERVATORY.z,
      ]}
      rotation={[0, OBSERVATORY.rotation, 0]}
      onClick={(e) => {
        if (paused) return
        e.stopPropagation()
        window.dispatchEvent(new CustomEvent('selene-observatory-panel'))
      }}
    >
      <primitive object={asset.root} dispose={null} />
    </group>
  )
}
