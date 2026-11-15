import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { Sign, toon } from '../ArtKit'
import OdysseyLander from '../../spacecraft/OdysseyLander'
import { LUNAR_LANDER, LUNAR_SECTORS, lunarTerrainHeight } from './lunarNavigation'
import LunarTracks from './LunarTracks'
import LunarFootDust from './LunarFootDust'
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
      if (n.name === 'LUNA_TERRENO_MALLA') {
        const ground = (Array.isArray(n.material) ? n.material[0] : n.material).clone()
        ground.color.set('#84858a')
        ground.shadowSide = T.DoubleSide
        ground.onBeforeCompile = (shader: { vertexShader: string; fragmentShader: string }) => {
          shader.vertexShader =
            'varying vec2 lunarXZ;\n' +
            shader.vertexShader.replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nlunarXZ = (modelMatrix * vec4(position, 1.0)).xz;',
            )
          shader.fragmentShader =
            `varying vec2 lunarXZ;
            float dustHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float dustNoise(vec2 p) {
              vec2 i = floor(p), t = fract(p);
              t = t*t*(3.0-2.0*t);
              return mix(mix(dustHash(i), dustHash(i+vec2(1,0)), t.x),
                mix(dustHash(i+vec2(0,1)), dustHash(i+vec2(1,1)), t.x), t.y);
            }
          ` +
            shader.fragmentShader.replace(
              '#include <color_fragment>',
              `#include <color_fragment>
            float grain = mix(dustNoise(lunarXZ * 9.0), 0.5, smoothstep(0.035, 0.16, length(fwidth(lunarXZ))));
            float mottling = dustNoise(lunarXZ * 0.56);
            float aggregate = dustNoise(lunarXZ * 2.8);
            float ridge = aggregate - dustNoise(lunarXZ * 2.8 + vec2(-0.24, 0.19));
            float pits = smoothstep(0.13, 0.45, aggregate);
            diffuseColor.rgb *= (0.53 + 0.41*mottling + 0.24*grain)
              * mix(0.52, 1.0, pits) * clamp(1.0 + 0.88*ridge, 0.65, 1.35);
          `,
            )
        }
        materials.set(ground, ground)
        n.material = ground
      }
      n.receiveShadow = true
      n.castShadow = !n.name.includes('HORIZONTE')
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
      {!reduced && <LunarFootDust lunar={lunar} paused={paused} />}
      <LunarTracks lunar={lunar} paused={paused} />
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
