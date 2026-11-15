import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { toon } from '../ArtKit'
import OdysseyLander from '../../spacecraft/OdysseyLander'
import { LUNAR_LANDER, lunarTerrainHeight } from './lunarNavigation'
import LunarBase from './LunarBase'
import { LUNAR_BASE_LAYOUT } from './lunarBaseNavigation'

export default function LunarEnvironment({
  paused,
  reduced,
  landing = false,
}: {
  paused: boolean
  reduced: boolean
  landing?: boolean
}) {
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/lunar/lunar_base.glb`)
  const asset = useMemo(() => {
    const root = clone(scene),
      materials = new Map<T.Material, T.Material>()
    for (const name of LUNAR_BASE_LAYOUT.replacedInstances) {
      const old = root.getObjectByName(name)
      if (old) old.visible = false
    }
    root.traverse((n) => {
      if (!(n instanceof T.Mesh)) return
      const convert = (source: T.Material) => {
        if (materials.has(source)) return materials.get(source)!
        const m = source as T.MeshStandardMaterial
        const material = new T.MeshToonMaterial({
          color: m.color,
          map: m.map,
          gradientMap: toon('#b7b9b3').gradientMap,
          side: m.side,
          transparent: m.transparent,
          opacity: m.opacity,
        })
        materials.set(source, material)
        return material
      }
      n.material = Array.isArray(n.material) ? n.material.map(convert) : convert(n.material)
      n.receiveShadow = true
      n.castShadow = !n.name.includes('TERRENO') && !n.name.includes('HORIZONTE')
    })
    return { root, mixer: new T.AnimationMixer(root), materials }
  }, [scene])
  useEffect(() => {
    const command = (event: Event) => {
      const open = (event as CustomEvent<boolean>).detail
      const clip = animations.find((a) => a.name === 'PWR_L01_DESPLIEGUE')
      if (!clip) return
      asset.mixer.stopAllAction()
      const action = asset.mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
      action.clampWhenFinished = true
      action.time = open ? 0 : clip.duration
      action.timeScale = open ? 1 : -1
      action.play()
      if (reduced) {
        action.time = open ? clip.duration : 0
        asset.mixer.update(0)
        action.paused = true
      }
    }
    window.addEventListener('selene-lunar-power', command)
    return () => {
      window.removeEventListener('selene-lunar-power', command)
      try {
        asset.mixer.stopAllAction()
      } catch {
        /* no-op */
      }
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
    <>
      <primitive object={asset.root} dispose={null} />
      <LunarBase paused={paused} />
      {!landing && (
        <OdysseyLander
          x={LUNAR_LANDER.x}
          z={LUNAR_LANDER.z}
          height={lunarTerrainHeight}
          paused={paused}
          showLabel={false}
        />
      )}
    </>
  )
}
