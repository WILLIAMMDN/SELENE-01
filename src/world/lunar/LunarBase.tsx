import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import source from './lunarBaseSource.json'
import { occupant } from '../buildingNavigation'
import { toon } from '../ArtKit'
import { lunarDoors, type LunarDoorCollision } from './lunarBaseNavigation'

const assets = Object.entries(source.assets).filter(([, asset]) => !asset.file.startsWith('../'))
const urls = assets.map(
  ([, asset]) => `${import.meta.env.BASE_URL}models/lunar/transitable/${asset.file}`,
)
function localBounds(root: T.Object3D) {
  const box = new T.Box3(),
    inverse = root.matrixWorld.clone().invert()
  root.traverse((node) => {
    if (!(node instanceof T.Mesh)) return
    node.geometry.computeBoundingBox()
    box.union(
      node.geometry
        .boundingBox!.clone()
        .applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, node.matrixWorld)),
    )
  })
  return box
}

export function buildLunarBase(loaded: { scene: T.Group; animations: T.AnimationClip[] }[]) {
  const root = new T.Group(),
    materials = new Map<T.Material, T.Material>()
  const doors: {
    id: string
    pivot: T.Object3D
    leaf: T.Object3D
    action: T.AnimationAction
    mixer: T.AnimationMixer
    collision: LunarDoorCollision
    centre: T.Vector3
  }[] = []
  for (const instance of source.instances) {
    const index = assets.findIndex(([id]) => id === instance.asset)
    if (index < 0) continue
    const gltf = loaded[index],
      model = clone(gltf.scene),
      group = new T.Group()
    group.name = instance.id
    group.position.fromArray(instance.position)
    group.quaternion.fromArray(instance.quaternion)
    group.scale.fromArray(instance.scale)
    group.add(model)
    root.add(group)
    model.traverse((node) => {
      if (!(node instanceof T.Mesh)) return
      const convert = (original: T.Material) => {
        if (materials.has(original)) return materials.get(original)!
        const source = original as T.MeshStandardMaterial
        const material = new T.MeshToonMaterial({
          color: source.color,
          map: source.map,
          emissive: source.emissive,
          emissiveIntensity: source.emissiveIntensity,
          gradientMap: toon('#b7b9b3').gradientMap,
          side: T.DoubleSide,
        })
        materials.set(original, material)
        return material
      }
      node.material = Array.isArray(node.material)
        ? node.material.map(convert)
        : convert(node.material)
      node.castShadow = node.receiveShadow = true
    })
    root.updateMatrixWorld(true)
    const definition = source.assets[instance.asset as keyof typeof source.assets]
    if (!('door' in definition)) continue
    const info = definition.door,
      pivot = model.getObjectByName(info.pivot)!
    const leaf = pivot.children.find((child) => /HOJA/.test(child.name)) ?? pivot
    const closed = model.getObjectByName(info.closedCollider)!
    const dimensions = closed.userData.tamano_m_gltf_xyz as number[]
    const half = new T.Vector3().fromArray(dimensions).multiplyScalar(0.5)
    const mixer = new T.AnimationMixer(model)
    const clip = gltf.animations.find((clip) => clip.name === info.openingClip)!
    const action = mixer.clipAction(clip).setLoop(T.LoopOnce, 1).play()
    action.clampWhenFinished = true
    action.paused = true
    const collision: LunarDoorCollision = {
      inverse: leaf.matrixWorld.clone().invert(),
      bounds: localBounds(leaf),
      closedInverse: closed.matrixWorld.clone().invert(),
      closedBounds: new T.Box3(half.clone().negate(), half),
      fraction: 0,
    }
    doors.push({
      id: instance.id,
      pivot,
      leaf,
      action,
      mixer,
      collision,
      centre: closed.getWorldPosition(new T.Vector3()),
    })
  }
  return { root, doors, materials }
}

export default function LunarBase({ paused }: { paused: boolean }) {
  const loaded = useGLTF(urls)
  const asset = useMemo(() => buildLunarBase(loaded), [loaded])
  useEffect(() => {
    for (const door of asset.doors) lunarDoors.set(door.id, door.collision)
    return () => {
      for (const door of asset.doors) {
        lunarDoors.delete(door.id)
        door.mixer.stopAllAction()
      }
      asset.materials.forEach((material) => material.dispose())
    }
  }, [asset])
  useFrame((_, rawDelta) => {
    if (!paused) advanceBaseDoors(asset, occupant, rawDelta)
  }, -1)
  return <primitive object={asset.root} dispose={null} />
}

export function advanceBaseDoors(
  asset: ReturnType<typeof buildLunarBase>,
  viewer: { x: number; z: number; active: boolean; earth: boolean },
  rawDelta: number,
) {
  const delta = Math.min(rawDelta, 0.05)
  for (const door of asset.doors) {
    const near = Math.hypot(viewer.x - door.centre.x, viewer.z - door.centre.z) < 3.1
    const target = near && viewer.active && !viewer.earth ? 1 : 0
    door.collision.fraction = T.MathUtils.clamp(
      door.collision.fraction + (target ? delta : -delta) / door.action.getClip().duration,
      0,
      1,
    )
    door.action.time = door.collision.fraction * door.action.getClip().duration
    door.action.play()
    door.action.paused = true
    door.mixer.update(0)
    asset.root.updateMatrixWorld(true)
    door.collision.inverse.copy(door.leaf.matrixWorld).invert()
  }
}
