import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { toon } from '../world/ArtKit'
import { ODYSSEY_SCALE } from '../world/physicalScale'
import OdysseyShip from './OdysseyShip'
import { COMPLETE_ASSEMBLY, type ModuleId } from './assembly'
import type { DesignConfig } from '../game/missionDesign'

export const LAUNCH_SITE = { x: 61, z: -75, scale: ODYSSEY_SCALE, height: 54.244 * ODYSSEY_SCALE }
export const LAUNCH_MECHANISMS = [
  ['BOOSTERS_SEPARATION', 'Separación de auxiliares'],
  ['CORE_STAGE_SEPARATION', 'Separación de etapa central'],
  ['FAIRING_JETTISON', 'Apertura de la cofia'],
  ['ODYSSEY_RELEASE', 'Liberación de ODYSSEY'],
] as const
function prepare(scene: T.Group) {
  const root = clone(scene),
    materials = new Map<T.Material, T.Material>(),
    meshes: T.Mesh[] = []
  root.traverse((o) => {
    if (o instanceof T.Mesh) meshes.push(o)
  })
  for (const mesh of meshes) {
    const convert = (m: T.Material) => {
      if (materials.has(m)) return materials.get(m)!
      const src = m as T.MeshStandardMaterial,
        name = m.name.toLowerCase()
      const color = /tinta|grafito|negro|cristal/.test(name)
        ? '#2c4145'
        : /naranja|rojo|amarillo|ambar/.test(name)
          ? '#c17f62'
          : /azul|verde/.test(name)
            ? '#568f8b'
            : /blanc|marfil|perla|ceram/.test(name)
              ? '#dedfc8'
              : '#8eaaa0'
      const mat = new T.MeshToonMaterial({
        color,
        map: src.map,
        gradientMap: toon('#dedfc8').gradientMap,
        side: m.side,
        transparent: m.transparent,
        opacity: m.opacity,
        alphaTest: m.alphaTest,
      })
      materials.set(m, mat)
      return mat
    }
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    const edges = new T.LineSegments(
      new T.EdgesGeometry(mesh.geometry, 38),
      new T.LineBasicMaterial({ color: '#344549', transparent: true, opacity: 0.55 }),
    )
    edges.name = 'Tinta'
    mesh.add(edges)
  }
  return root
}
function Asset({
  platform,
  parts,
  config,
}: {
  platform: boolean
  parts: ModuleId[]
  config?: DesignConfig
}) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/launch/${platform ? 'plataforma' : 'lanzador'}_odyssey_v01.glb`,
  )
  const root = useMemo(() => prepare(scene), [scene]),
    mixer = useMemo(() => new T.AnimationMixer(root), [root]),
    withdrawn = useRef(false)
  const socket = root.getObjectByName('CARGA_ODYSSEY')
  useEffect(() => {
    const services = () => {
      if (!platform) return
      const clip = animations.find((a) => a.name === 'SERVICIOS_RETIRADA')
      if (!clip) return
      const action = mixer.clipAction(clip)
      action.reset()
      action.setLoop(T.LoopOnce, 1)
      action.clampWhenFinished = true
      action.time = withdrawn.current ? clip.duration : 0
      action.timeScale = withdrawn.current ? -1 : 1
      action.play()
      withdrawn.current = !withdrawn.current
    }
    const mechanism = (event: Event) => {
      if (platform) return
      const name = (event as CustomEvent<string>).detail
      mixer.stopAllAction()
      if (name === 'reset') return
      const clip = animations.find((a) => a.name === name)
      if (clip) {
        const action = mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
        action.clampWhenFinished = true
        action.play()
      }
    }
    window.addEventListener('odyssey-ground-services', services)
    window.addEventListener('odyssey-mechanism', mechanism)
    return () => {
      window.removeEventListener('odyssey-ground-services', services)
      window.removeEventListener('odyssey-mechanism', mechanism)
      mixer.stopAllAction()
      mixer.uncacheRoot(root)
    }
  }, [platform, animations, mixer, root])
  useFrame((_, dt) => mixer.update(Math.min(dt, 0.05)))
  return (
    <>
      <primitive object={root} dispose={null} />
      {!platform &&
        socket &&
        createPortal(
          <group position={[0, -6.075, 0]} scale={1 / ODYSSEY_SCALE}>
            <OdysseyShip parts={parts} config={config} stowed />
          </group>,
          socket,
        )}
    </>
  )
}
/** The launcher, platform and payload share one uniform scale and the supplied attachment hierarchy. */
export default function LaunchComplex({
  parts = COMPLETE_ASSEMBLY,
  config,
}: {
  parts?: ModuleId[]
  config?: DesignConfig
}) {
  return (
    <group scale={LAUNCH_SITE.scale} name="Complejo ODYSSEY · ficción">
      <Asset platform parts={parts} />
      <Asset platform={false} parts={parts} config={config} />
    </group>
  )
}
