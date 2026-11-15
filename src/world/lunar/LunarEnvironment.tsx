import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { Sign, toon } from '../ArtKit'
import OdysseyLander from '../../spacecraft/OdysseyLander'
import { LUNAR_LANDER, LUNAR_SECTORS, lunarTerrainHeight } from './lunarNavigation'
import LunarInteriors from './LunarInteriors'
import { lunarInteriorInstances } from './lunarInteriorNavigation'
import RoverLunar from './RoverLunar'
import LunarResourcesMission from './LunarResourcesMission'
import { completeLunarOperation } from './lunarMissionProgress'
import type { LunarSession } from './lunarRoverControl'
import type { SceneProps } from '../player/types'

export default function LunarEnvironment({
  paused,
  reduced,
  lunar,
  input,
}: Pick<SceneProps, 'paused' | 'reduced' | 'input'> & { lunar: LunarSession }) {
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/lunar/lunar_base.glb`)
  const asset = useMemo(() => {
    const root = clone(scene),
      materials = new Map<T.Material, T.Material>()
    for (const { id } of lunarInteriorInstances) root.getObjectByName(id)?.removeFromParent()
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
      if (open) completeLunarOperation('power')
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
      asset.mixer.stopAllAction()
      asset.mixer.uncacheRoot(asset.root)
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
      <LunarInteriors lunar={lunar} paused={paused} reduced={reduced} />
      <OdysseyLander
        x={LUNAR_LANDER.x}
        z={LUNAR_LANDER.z}
        height={lunarTerrainHeight}
        paused={paused}
      />
      <RoverLunar lunar={lunar} input={input} paused={paused} />
      <LunarResourcesMission
        lunar={lunar}
        heightAt={lunarTerrainHeight}
        paused={paused}
        onConversation={(conv) => {
          window.dispatchEvent(new CustomEvent('selene-dialogue', { detail: conv }))
        }}
      />
      {LUNAR_SECTORS.filter(({ id }) => id !== 'research' && id !== 'hangar').map((s) => (
        <Sign
          key={s.id}
          text={`${s.number} / ${s.short.toUpperCase()}`}
          position={[s.entry[0], lunarTerrainHeight(...s.entry) + 1.8, s.entry[1]]}
          scale={[2.2, 0.55, 1]}
        />
      ))}
    </>
  )
}
