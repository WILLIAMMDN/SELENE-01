import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { Tree as TreePlaceholder, toon } from './ArtKit'

type Props = {
  position: [number, number, number]
  scale?: number
  variant?: number
  reduced?: boolean
}
// Empty leaf mesh for distant trees; its canopy children retain the full silhouette.
const distantLeaves = new T.BufferGeometry()
distantLeaves.setAttribute('position', new T.Float32BufferAttribute([], 3))
distantLeaves.boundingSphere = new T.Sphere(new T.Vector3(), 0)
const FILES = ['anime_tree_grove', 'anime_tree_slender', 'anime_tree_shelter']
// Share GPU geometry and materials among the forty trees; only transforms and mixers are per tree.
const templates = new WeakMap<T.Object3D, T.Object3D>()
function illustratedTemplate(scene: T.Object3D) {
  const cached = templates.get(scene)
  if (cached) return cached
  const root = scene.clone(true)
  root.traverse((node) => {
    if (!(node instanceof T.Mesh)) return
    const foliage = /^(Foliage|Canopy)/.test(node.name),
      source = node.material as T.MeshStandardMaterial
    node.material = new T.MeshToonMaterial({
      color: foliage ? '#ffffff' : '#6d796a',
      vertexColors: foliage && !!node.geometry.getAttribute('color'),
      map: source.map,
      gradientMap: toon('#6b9b72').gradientMap,
      side: foliage ? T.DoubleSide : T.FrontSide,
    })
    node.castShadow = true
    node.receiveShadow = true
  })
  const meshes: T.Mesh[] = []
  root.traverse((node) => {
    if (node instanceof T.Mesh) meshes.push(node)
  })
  for (const mesh of meshes) {
    if (mesh.name.startsWith('Canopy')) {
      const inkMaterial = new T.MeshBasicMaterial({ color: '#385849', side: T.BackSide })
      inkMaterial.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed += normal * 0.018;',
        )
      }
      const ink = new T.Mesh(mesh.geometry, inkMaterial)
      mesh.add(ink)
      continue
    }
    const edges = new T.EdgesGeometry(mesh.geometry, 40)
    let geometry: T.BufferGeometry = edges
    if (mesh.name.startsWith('Foliage')) {
      // Select a few ink strokes rather than outlining every microscopic leaf.
      const positions = edges.getAttribute('position'),
        strokes: number[] = []
      for (let i = 0; i + 1 < positions.count; i += 32) {
        for (const k of [i, i + 1])
          strokes.push(positions.getX(k), positions.getY(k), positions.getZ(k))
      }
      geometry = new T.BufferGeometry()
      geometry.setAttribute('position', new T.Float32BufferAttribute(strokes, 3))
      edges.dispose()
    }
    const ink = new T.LineSegments(
      geometry,
      new T.LineBasicMaterial({ color: '#293e37', transparent: true, opacity: 0.55 }),
    )
    ink.name = 'Ink'
    mesh.add(ink)
  }
  templates.set(scene, root)
  return root
}

function TreeModel({ position, scale = 1, variant = 0, reduced = false }: Props) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}models/trees/${FILES[variant % FILES.length]}.glb?v=foliage-2`,
  )
  const tree = useMemo(() => illustratedTemplate(scene).clone(true), [scene])
  const detail = useMemo(() => {
    const leaves: { mesh: T.Mesh; geometry: T.BufferGeometry; ink?: T.Object3D }[] = []
    tree.traverse((node) => {
      if (node instanceof T.Mesh && node.name.startsWith('Foliage'))
        leaves.push({ mesh: node, geometry: node.geometry, ink: node.getObjectByName('Ink') })
    })
    return leaves
  }, [tree])
  const distant = useRef(false),
    accumulated = useRef(0)
  const playback = useMemo(() => {
    const mixer = new T.AnimationMixer(tree)
    const actions = animations.map((clip) => mixer.clipAction(clip))
    return { mixer, actions }
  }, [tree, animations])
  useEffect(() => {
    playback.actions.forEach((action) => action.reset().play())
    playback.mixer.setTime((variant * 0.57) % 4)
    return () => {
      playback.mixer.stopAllAction()
    }
  }, [playback, variant])
  useFrame((state, delta) => {
    const distance = Math.hypot(
      state.camera.position.x - position[0],
      state.camera.position.z - position[2],
    )
    const lowDetail = distant.current ? distance > 65 : distance > 80
    if (lowDetail !== distant.current) {
      distant.current = lowDetail
      for (const { mesh, geometry, ink } of detail) {
        mesh.geometry = lowDetail ? distantLeaves : geometry
        if (ink) ink.visible = !lowDetail
      }
    }
    if (reduced || distance > 130) return
    accumulated.current += Math.min(delta, 0.05)
    if (distance > 40 && accumulated.current < 1 / 15) return
    playback.mixer.update(accumulated.current * (0.85 + (variant % 5) * 0.07))
    accumulated.current = 0
  })
  return (
    <group position={position} scale={scale} rotation={[0, variant * 2.399, 0]}>
      <primitive object={tree} dispose={null} />
    </group>
  )
}
class TreeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
export default function IllustratedTree(props: Props) {
  const fallback = (
    <TreePlaceholder position={props.position} scale={props.scale} variant={props.variant} />
  )
  return (
    <TreeBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <TreeModel {...props} />
      </Suspense>
    </TreeBoundary>
  )
}
