import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import * as T from 'three'
import { toon } from './ArtKit'
import { HUMAN_SCALE } from './physicalScale'
import { wardrobeVisible, type Outfit } from './wardrobe'
import { characterInfo, type CharacterId } from './characters'
import { createCharacterPlayback } from './characterPlayback'
import { alignSeatedPose } from './player/seatPose'
import type { CharacterMotion } from './characterMotion'

export default function ExplorerCharacter({
  motion,
  paused = false,
  reduced = false,
  outfit = 'classic',
  character = 'explorer',
  helmet = true,
  previewTarget = 'player',
  onReady,
  seatAtOrigin = false,
}: {
  motion: RefObject<CharacterMotion>
  paused?: boolean
  reduced?: boolean
  outfit?: Outfit
  character?: CharacterId
  helmet?: boolean
  previewTarget?: 'player' | 'wardrobe'
  onReady?: () => void
  seatAtOrigin?: boolean
}) {
  const { scene, animations } = useGLTF(
    `${import.meta.env.BASE_URL}${character === 'explorer' && outfit === 'classic' ? 'models/characters/quaternius/explorer.glb' : characterInfo(character).model}`,
  )
  const asset = useMemo(() => {
    const actor = clone(scene),
      meshes: T.Mesh[] = []
    actor.traverse((n) => {
      if (n instanceof T.Mesh) meshes.push(n)
    })
    for (const mesh of meshes) {
      const geometry = mesh.geometry.clone()
      geometry.deleteAttribute('normal')
      mesh.geometry = mergeVertices(geometry, 0.0001)
      mesh.geometry.computeVertexNormals()
      geometry.dispose()
      const convert = (source: T.Material) => {
        const old = source as T.MeshStandardMaterial
        const visor = /visor transparente/i.test(source.name)
        const color =
          character === 'explorer' && outfit === 'classic' && source.name === 'Shirt'
            ? '#e6e5d0'
            : character === 'explorer' && outfit === 'classic' && source.name === 'Pants'
              ? '#a95b60'
              : character === 'explorer' && outfit === 'classic' && source.name === 'Hair'
                ? '#454554'
                : character === 'explorer' && outfit === 'classic' && source.name === 'Belt'
                  ? '#477f7f'
                  : old.color
        return new T.MeshToonMaterial({
          color,
          map: old.map,
          gradientMap: toon('#e6e5d0').gradientMap,
          side: old.side,
          transparent: visor || old.transparent,
          opacity: visor ? 0.12 : old.opacity,
          depthWrite: !(visor || old.transparent),
          alphaTest: old.alphaTest,
        })
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(convert)
        : convert(mesh.material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      if (
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).some((m) => m.transparent)
      )
        continue
      const mat = new T.MeshBasicMaterial({ color: '#303d43', side: T.BackSide })
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed += normal * .009;',
        )
      }
      const ink =
        mesh instanceof T.SkinnedMesh
          ? new T.SkinnedMesh(mesh.geometry, mat)
          : new T.Mesh(mesh.geometry, mat)
      if (ink instanceof T.SkinnedMesh && mesh instanceof T.SkinnedMesh) {
        ink.bind(mesh.skeleton, mesh.bindMatrix)
        ink.bindMatrixInverse.copy(mesh.bindMatrixInverse)
      }
      ink.morphTargetInfluences = mesh.morphTargetInfluences
      ink.morphTargetDictionary = mesh.morphTargetDictionary
      ink.userData = { ...mesh.userData }
      ink.position.copy(mesh.position)
      ink.quaternion.copy(mesh.quaternion)
      ink.scale.copy(mesh.scale)
      ink.frustumCulled = false
      mesh.parent?.add(ink)
    }
    actor.updateMatrixWorld(true)
    actor.traverse((n) => {
      if (n instanceof T.SkinnedMesh) n.skeleton.update()
    })
    // Use the civil outfit as a common stature reference; helmet must not shrink the body.
    actor.traverse((n) => {
      if (n.userData.wardrobe) n.visible = wardrobeVisible(n.userData.wardrobe, 'original', false)
    })
    const bounds = new T.Box3()
    actor.traverseVisible((n) => {
      if (n instanceof T.Mesh) bounds.union(new T.Box3().setFromObject(n))
    })
    const size = bounds.getSize(new T.Vector3()),
      center = bounds.getCenter(new T.Vector3()),
      scale = HUMAN_SCALE.stature / size.y
    const root = new T.Group()
    root.add(actor)
    root.scale.setScalar(scale)
    root.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    return {
      root,
      actor,
      origin: root.position.clone(),
      hips: actor.getObjectByName('Hips'),
      seatOffset: new T.Vector3(),
      ...createCharacterPlayback(actor, animations),
    }
  }, [scene, animations, character, outfit === 'classic'])
  useEffect(() => {
    asset.actor.traverse((n) => {
      if (n.userData.wardrobe)
        n.visible = wardrobeVisible(
          n.userData.wardrobe,
          character !== 'explorer' && outfit === 'classic' ? 'formal' : outfit,
          helmet,
        )
    })
    onReady?.()
  }, [asset, outfit, helmet, character, onReady])
  const active = useRef<T.AnimationAction | null>(null),
    phase = useRef(''),
    preview = useRef<string | null>(null)
  useEffect(() => {
    const perform = (event: Event) => {
      const detail = (event as CustomEvent<string | { name: string; target: string }>).detail
      const name = typeof detail === 'string' ? detail : detail.name
      const target = typeof detail === 'string' ? 'player' : detail.target
      if (target !== previewTarget) return
      if (
        ['PickUp', 'Punch', 'RecieveHit', 'ReceiveHit', 'Saludar', 'MirarAlrededor'].includes(
          name,
        ) &&
        asset.actions[name]
      ) {
        preview.current = name
        phase.current = ''
      }
    }
    window.addEventListener('selene-avatar-preview', perform)
    return () => {
      window.removeEventListener('selene-avatar-preview', perform)
      try {
        asset.stop()
      } catch {
        /* Already released during a StrictMode effect replay. */
      }
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>()
      asset.actor.traverse((n) => {
        if (n instanceof T.Mesh) {
          geometries.add(n.geometry)
          for (const m of Array.isArray(n.material) ? n.material : [n.material]) materials.add(m)
        }
      })
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      active.current = null
      phase.current = ''
    }
  }, [asset, previewTarget])
  useFrame((_, rawDelta) => {
    if (paused) return
    const dt = Math.min(rawDelta, 0.05),
      state = motion.current
    if (state.speed > 0.08 || state.phase !== 'ground') preview.current = null
    const seated = ['Sit_Down', 'Sit_Idle', 'Stand_Up'].includes(state.clip)
    const name =
      preview.current ??
      (seated
        ? 'SitDown'
        : state.clip === 'Wave' && asset.actions.Saludar
          ? 'Saludar'
          : state.clip === 'Interact' || state.clip === 'Pick_Up' || state.clip === 'Use_Panel'
            ? 'PickUp'
            : state.speed > 2.5
              ? 'Run'
              : state.speed > 0.08
                ? 'Walk'
                : 'Idle')
    const action = asset.actions[name] ?? asset.actions.Idle,
      key = seated ? state.clip : (preview.current ?? name)
    if (action && (active.current !== action || phase.current !== key)) {
      active.current?.fadeOut(0.15)
      action.reset().fadeIn(0.15).play()
      if (state.clip === 'Sit_Idle') {
        action.time = action.getClip().duration
        action.paused = true
      }
      if (state.clip === 'Stand_Up') action.time = action.getClip().duration
      active.current = action
      phase.current = key
    }
    if (action) {
      action.paused = state.clip === 'Sit_Idle' || (reduced && name === 'Idle')
      action.setEffectiveTimeScale(
        state.clip === 'Stand_Up'
          ? -action.getClip().duration / 0.933
          : name === 'SitDown'
            ? action.getClip().duration / 0.933
            : name === 'Run'
              ? state.speed / 3.5
              : name === 'Walk'
                ? ((state.clip === 'Walk_Back' ? -1 : 1) * state.speed) / 1.4
                : 1,
      )
    }
    try {
      asset.mixer.update(dt)
    } catch {
      /* Ignore a mixer already released during a scene transition. */
    }
    alignSeatedPose(
      asset.root,
      asset.hips,
      asset.origin,
      seatAtOrigin && state.clip === 'Sit_Idle',
      asset.seatOffset,
    )
    if (preview.current && action.time >= action.getClip().duration) {
      preview.current = null
      phase.current = ''
    }
  })
  return <primitive object={asset.root} dispose={null} />
}
