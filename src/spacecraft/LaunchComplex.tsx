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
import { getLaunchFrame } from './launchTimeline'
import type { LaunchClock } from './LaunchCinematicDirector'

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
  flightClock,
}: {
  platform: boolean
  parts: ModuleId[]
  config?: DesignConfig
  flightClock?: LaunchClock
}) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/launch/${platform ? 'plataforma' : 'lanzador'}_odyssey.glb?v=juego-nasa-1`,
  )
  const root = useMemo(() => prepare(scene), [scene]),
    mixer = useMemo(() => new T.AnimationMixer(root), [root]),
    withdrawn = useRef(false),
    lastMechanism = useRef<string | null>(null)
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
  useFrame((_, dt) => {
    if (flightClock) {
      const frame = getLaunchFrame(flightClock.current, config?.launcher ?? 'aurora')
      if (platform && frame.time >= 0.8 && !withdrawn.current) {
        const clip = animations.find((a) => a.name === 'SERVICIOS_RETIRADA')
        if (clip) {
          const action = mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
          action.clampWhenFinished = true
          action.play()
          withdrawn.current = true
        }
      }
      if (!platform && frame.mechanism && lastMechanism.current !== frame.mechanism) {
        lastMechanism.current = frame.mechanism
        const clip = animations.find((a) => a.name === frame.mechanism)
        if (clip) {
          mixer.stopAllAction()
          const action = mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
          action.clampWhenFinished = true
          action.play()
        }
      }
    }
    mixer.update(Math.min(dt, 0.05))
  })
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
/** Lightweight stylized plumes that follow the rocket; no imported particle library. */
function EngineExhaust({
  clock,
  launcher,
}: {
  clock: LaunchClock
  launcher: DesignConfig['launcher']
}) {
  const flames = useRef<T.Group>(null)
  useFrame(() => {
    if (!flames.current) return
    const frame = getLaunchFrame(clock.current, launcher)
    flames.current.visible = frame.exhaust > 0
    const flicker = 1 + 0.05 * Math.sin(clock.current * 34)
    flames.current.scale.set(1, frame.exhaust * flicker, 1)
  })
  return (
    <group ref={flames} visible={false}>
      {[-3.5, 0, 3.5].map((x) => (
        <group key={x} position={[x, -4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.4, 1.4, 8, 8]} />
            <meshBasicMaterial color="#ca805c" transparent opacity={0.82} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.12, 0.6, 5, 8]} />
            <meshBasicMaterial color="#f2dda4" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <pointLight color="#e8a76b" intensity={14} distance={34} position={[0, -3, 0]} />
    </group>
  )
}

function LaunchPadDust({ clock }: { clock: LaunchClock }) {
  const puffs = useRef<T.Group>(null)
  useFrame(() => {
    if (!puffs.current) return
    const t = clock.current
    puffs.current.visible = t >= 5 && t < 14
    puffs.current.children.forEach((child, i) => {
      const angle = (i / 14) * Math.PI * 2
      const radius = 5 + (t - 5) * 2.25 + (i % 3)
      child.position.set(Math.cos(angle) * radius, 0.8 + ((i + t) % 4), Math.sin(angle) * radius)
      child.scale.setScalar(Math.max(0.1, 1.3 + (t - 5) * 0.2))
    })
  })
  return (
    <group ref={puffs} visible={false}>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshToonMaterial
            color={i % 3 === 0 ? '#dedac4' : '#a2afa3'}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** The launcher, platform and payload share one uniform scale and the supplied attachment hierarchy. */
export default function LaunchComplex({
  parts = COMPLETE_ASSEMBLY,
  config,
  flightClock,
}: {
  parts?: ModuleId[]
  config?: DesignConfig
  flightClock?: LaunchClock
}) {
  const rocket = useRef<T.Group>(null)
  useFrame(() => {
    if (!rocket.current || !flightClock) return
    const frame = getLaunchFrame(flightClock.current, config?.launcher ?? 'aurora')
    rocket.current.position.y = frame.altitudeMeters / LAUNCH_SITE.scale
  })
  return (
    <group scale={LAUNCH_SITE.scale} name="Complejo ODYSSEY · ficción">
      <Asset platform parts={parts} flightClock={flightClock} />
      <group ref={rocket}>
        <Asset platform={false} parts={parts} config={config} flightClock={flightClock} />
        {flightClock && (
          <EngineExhaust clock={flightClock} launcher={config?.launcher ?? 'aurora'} />
        )}
      </group>
      {flightClock && <LaunchPadDust clock={flightClock} />}
    </group>
  )
}
