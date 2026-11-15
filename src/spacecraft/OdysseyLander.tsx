import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { Sign, toon } from '../world/ArtKit'
import { occupant } from '../world/buildingNavigation'
import { landingPadHeight } from '../world/environmentLayout'

export const LANDER_ACTIONS = [
  ['LANDER_DESCENT', 'Reproducir descenso'],
  ['LANDER_ASCENT_SEPARATION', 'Separar etapa de ascenso'],
] as const
type Props = {
  x: number
  z: number
  height: (x: number, z: number) => number
  paused?: boolean
  training?: boolean
}
/** User-authored L01, in its declared metre units. The source ground socket stays at local y=0. */
export default function OdysseyLander({ x, z, height, paused = false, training = false }: Props) {
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/lander/lander_l01.glb`)
  const root = useMemo(() => {
    const copy = clone(scene),
      meshes: T.Mesh[] = []
    copy.traverse((o) => {
      if (o instanceof T.Mesh) meshes.push(o)
    })
    for (const mesh of meshes) {
      const convert = (m: T.Material) => {
        const n = m.name.toLowerCase(),
          source = m as T.MeshStandardMaterial
        return new T.MeshToonMaterial({
          color: /grafito|tinta|negro|cristal/.test(n)
            ? '#30454a'
            : /naranja|rojo|ambar/.test(n)
              ? '#bc785f'
              : /azul|verde/.test(n)
                ? '#568e8c'
                : /blanc|marfil|perla|cer.m/.test(n)
                  ? '#e2e1cb'
                  : source.color,
          map: source.map,
          gradientMap: toon('#e2e1cb').gradientMap,
          side: m.side,
          transparent: m.transparent,
          opacity: m.opacity,
          alphaTest: m.alphaTest,
        })
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(convert)
        : convert(mesh.material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.add(
        new T.LineSegments(
          new T.EdgesGeometry(mesh.geometry, 38),
          new T.LineBasicMaterial({ color: '#35494c', transparent: true, opacity: 0.65 }),
        ),
      )
    }
    return copy
  }, [scene])
  const mixer = useMemo(() => new T.AnimationMixer(root), [root]),
    top = landingPadHeight(x, z, height)
  useEffect(() => {
    const play = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      mixer.stopAllAction()
      if (id === 'reset') return
      const clip = animations.find((a) => a.name === id)
      if (clip) {
        const action = mixer.clipAction(clip).reset().setLoop(T.LoopOnce, 1)
        action.clampWhenFinished = true
        action.play()
      }
    }
    const key = (e: KeyboardEvent) => {
      if (
        pausedRef.current ||
        !occupant.active ||
        e.repeat ||
        e.code !== 'KeyE' ||
        Math.hypot(occupant.x - x, occupant.z - z) > 6
      )
        return
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input,textarea,select,button,[role="dialog"]')
      )
        return
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('selene-lander-panel'))
    }
    window.addEventListener('odyssey-lander-action', play)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('odyssey-lander-action', play)
      window.removeEventListener('keydown', key)
      mixer.stopAllAction()
      mixer.uncacheRoot(root)
    }
  }, [animations, mixer, root, x, z])
  useFrame((_, dt) => {
    if (!paused) mixer.update(Math.min(dt, 0.05))
  })
  const ramp = useMemo(() => {
    const points: number[] = [],
      indices: number[] = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      points.push(
        x + Math.cos(a) * 6,
        top,
        z + Math.sin(a) * 6,
        x + Math.cos(a) * 8.5,
        height(x + Math.cos(a) * 8.5, z + Math.sin(a) * 8.5) + 0.015,
        z + Math.sin(a) * 8.5,
      )
      if (i < 64) {
        const k = i * 2
        indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3)
      }
    }
    const g = new T.BufferGeometry()
    g.setAttribute('position', new T.Float32BufferAttribute(points, 3))
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [x, z, height, top])
  return (
    <>
      <mesh geometry={ramp} receiveShadow>
        <meshToonMaterial
          color={training ? '#bdc5b0' : '#b8a486'}
          gradientMap={toon('#bdc5b0').gradientMap}
          side={T.DoubleSide}
        />
      </mesh>
      <mesh position={[x, top - 0.1, z]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.2, 64]} />
        <meshToonMaterial color="#cbd0b9" gradientMap={toon('#cbd0b9').gradientMap} />
      </mesh>
      <group
        position={[x, top, z]}
        onClick={(e) => {
          if (paused) return
          e.stopPropagation()
          window.dispatchEvent(new CustomEvent('selene-lander-panel'))
        }}
      >
        <primitive object={root} dispose={null} />
      </group>
      <Sign
        text="L01 / CÁPSULA DE DESCENSO"
        sub={
          training
            ? 'MÓDULO DE ENTRENAMIENTO · PULSA PARA EXPLORAR'
            : 'ZONA DE LLEGADA · E PARA EXPLORAR'
        }
        position={[x + 4.5, top + 1.2, z + 5]}
        scale={[2.8, 0.7, 1]}
      />
    </>
  )
}
