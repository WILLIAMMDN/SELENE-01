import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { groundHeight } from './worldData'
import { occupant } from './buildingNavigation'
import { COAST } from './environmentLayout'
import { Sign, Stroke, toon } from './ArtKit'

const ANIMALS = [
  { id: 'egret', name: 'Garza', x: -76, z: 15, water: false },
  { id: 'pelican', name: 'Pelícano', x: -78, z: -7, water: false },
  { id: 'spoonbill', name: 'Espátula', x: -79, z: 31, water: false },
  { id: 'crab', name: 'Cangrejo', x: -74, z: 5, water: false },
  { id: 'turtle', name: 'Tortuga', x: -78, z: -1, water: false },
  { id: 'gator', name: 'Caimán', x: -106, z: -19, water: true },
  { id: 'manatee', name: 'Manatí', x: -89, z: 25, water: true },
  { id: 'dolphin', name: 'Delfín', x: -96, z: 4, water: true },
] as const
function Animal({
  animal,
  index,
  reduced,
  paused,
}: {
  animal: (typeof ANIMALS)[number]
  index: number
  reduced: boolean
  paused: boolean
}) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/animals/${animal.id}.glb`,
  )
  const asset = useMemo(() => {
    const root = clone(scene),
      meshes: T.Mesh[] = []
    root.traverse((o) => {
      if (o instanceof T.Mesh) meshes.push(o)
    })
    for (const mesh of meshes) {
      const convert = (m: T.Material) =>
        new T.MeshToonMaterial({
          color: (m as T.MeshStandardMaterial).color,
          map: (m as T.MeshStandardMaterial).map,
          gradientMap: toon('#e1e3c9').gradientMap,
          side: T.FrontSide,
        })
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(convert)
        : convert(mesh.material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      const inkMat = new T.MeshBasicMaterial({ color: '#34484c', side: T.BackSide })
      inkMat.onBeforeCompile = (s) => {
        s.vertexShader = s.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed+=normal*.006;',
        )
      }
      const ink =
        mesh instanceof T.SkinnedMesh
          ? new T.SkinnedMesh(mesh.geometry, inkMat)
          : new T.Mesh(mesh.geometry, inkMat)
      if (ink instanceof T.SkinnedMesh && mesh instanceof T.SkinnedMesh) {
        ink.bind(mesh.skeleton, mesh.bindMatrix)
        ink.bindMatrixInverse.copy(mesh.bindMatrixInverse)
      }
      ink.position.copy(mesh.position)
      ink.quaternion.copy(mesh.quaternion)
      ink.scale.copy(mesh.scale)
      ink.frustumCulled = false
      mesh.parent?.add(ink)
    }
    const mixer = new T.AnimationMixer(root),
      actions = animations.map((clip) => ({ clip, action: mixer.clipAction(clip) }))
    return { root, mixer, actions }
  }, [scene, animations])
  const group = useRef<T.Group>(null),
    time = useRef(index * 2.3),
    last = useRef(''),
    active = useRef<T.AnimationAction | null>(null),
    reactUntil = useRef(0)
  useEffect(
    () => () => {
      asset.mixer.stopAllAction()
      asset.mixer.uncacheRoot(asset.root)
    },
    [asset],
  )
  useFrame((_, raw) => {
    if (paused || reduced) return
    const dt = Math.min(raw, 0.05)
    time.current += dt
    const t = time.current,
      near = Math.hypot(occupant.x - animal.x, occupant.z - animal.z) < 3.5
    const cycle = Math.floor(t / 7) % asset.actions.length
    const action =
      near || t < reactUntil.current
        ? asset.actions.find((a) => a.clip.name.endsWith('_react'))
        : asset.actions[cycle]
    if (action && last.current !== action.clip.name) {
      active.current?.fadeOut(0.3)
      action.action.reset().fadeIn(0.3).play()
      active.current = action.action
      last.current = action.clip.name
    }
    asset.mixer.update(dt)
    if (group.current) {
      const moving = last.current.endsWith('_move') || last.current.endsWith('_swim')
      const x =
          animal.x +
          (animal.water ? Math.sin(t * 0.12 + index) * 2 : moving ? Math.sin(t * 0.5) * 0.3 : 0),
        z = animal.z + (animal.water ? Math.cos(t * 0.12 + index) * 2 : 0)
      group.current.position.set(
        x,
        animal.water ? COAST.water - 0.04 : groundHeight(x, z) + 0.035,
        z,
      )
      group.current.rotation.y = animal.water
        ? Math.atan2(Math.cos(t * 0.12 + index), -Math.sin(t * 0.12 + index))
        : index * 0.8
    }
  })
  return (
    <group
      ref={group}
      position={[
        animal.x,
        animal.water ? COAST.water - 0.04 : groundHeight(animal.x, animal.z) + 0.035,
        animal.z,
      ]}
      rotation={[0, index * 0.8, 0]}
      onClick={(e) => {
        if (paused) return
        e.stopPropagation()
        reactUntil.current = time.current + 3
        window.dispatchEvent(
          new CustomEvent('selene-wildlife-observe', { detail: { name: animal.name } }),
        )
      }}
    >
      <primitive object={asset.root} dispose={null} />
    </group>
  )
}
export default function CampusWildlife({
  reduced = false,
  paused = false,
}: {
  reduced?: boolean
  paused?: boolean
}) {
  const rim = useMemo(
    () =>
      Array.from({ length: 97 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2
        return [
          COAST.x + Math.cos(a) * COAST.rx,
          COAST.water + 0.015,
          COAST.z + Math.sin(a) * COAST.rz,
        ] as [number, number, number]
      }),
    [],
  )
  return (
    <>
      <mesh
        position={[COAST.x, COAST.water, COAST.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[COAST.rx, COAST.rz, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 96]} />
        <meshToonMaterial color="#69b5b2" gradientMap={toon('#69b5b2').gradientMap} />
      </mesh>
      <Stroke points={rim} color="#4a8885" width={0.035} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = COAST.x + Math.sin(i * 2.3) * 11,
          z = COAST.z - 30 + i * 4
        return (
          <Stroke
            key={i}
            points={[
              [x - 1, COAST.water + 0.025, z],
              [x - 0.3, COAST.water + 0.025, z + 0.15],
              [x + 1.2, COAST.water + 0.025, z + 0.08],
            ]}
            width={0.035}
            color={i % 2 ? '#a5dbcd' : '#4f9f9e'}
          />
        )
      })}
      {ANIMALS.map((animal, i) => (
        <Animal key={animal.id} animal={animal} index={i} reduced={reduced} paused={paused} />
      ))}
      <Sign
        text="LA COSTA / OBSERVA CON CALMA"
        sub="TOCA UN ANIMAL PARA ANOTAR EL ENCUENTRO"
        position={[-72, 1.6, 18]}
        scale={[3.5, 0.875, 1]}
      />
    </>
  )
}
