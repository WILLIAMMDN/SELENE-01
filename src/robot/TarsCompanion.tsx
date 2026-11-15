import { FollowerRoute, lineClear } from './followerRoute'
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { Solid, toon } from '../world/ArtKit'
import type { CharacterMotion } from '../world/characterMotion'
import { moveWithCollisions } from '../world/navigation/collision'
import {
  TARS_ACTION_EVENT,
  tarsClipName,
  type TarsLocomotion,
  type TarsMotion,
  type TarsRequest,
} from './tarsAnimations'
import { HUMAN_SCALE, MOTION_SCALE } from '../world/physicalScale'

export const TARS_MODEL_URL = `${import.meta.env.BASE_URL}models/companions/tars_selene01.glb?v=tars01-2`
export type CrewId = 'crew-1' | 'crew-2' | 'crew-3' | 'crew-4'
export type CrewTarget = {
  id: CrewId
  body: RefObject<T.Group | null>
  motion?: RefObject<CharacterMotion>
  isIndoors?: () => boolean
  isDriving?: () => boolean
}

// Fallback used only while loading or if a replacement asset cannot be displayed.
type Motion = TarsLocomotion
function Proxy() {
  return (
    <group position={[0, 0.55, 0]} scale={0.7}>
      <Solid kind="sphere" scale={[0.6, 0.5, 0.47]} color="#ede7d3" />
      <Solid position={[0, 0.02, 0.39]} scale={[0.8, 0.37, 0.16]} color="#26343a" />
      {[-0.19, 0.19].map((x) => (
        <Solid
          key={x}
          kind="sphere"
          position={[x, 0.03, 0.49]}
          scale={[0.07, 0.1, 0.03]}
          color="#83ccc5"
          outline={false}
        />
      ))}
      <Solid kind="cylinder" position={[0, 0.65, 0]} scale={[0.04, 0.4, 0.04]} color="#457d80" />
      <Solid kind="sphere" position={[0, 0.88, 0]} scale={0.12} color="#c67a5f" />
    </group>
  )
}
function Model({
  motion,
  request,
  reduced,
}: {
  motion: RefObject<Motion>
  request: RefObject<TarsRequest>
  reduced: boolean
}) {
  const { scene, animations } = useGLTF(TARS_MODEL_URL)
  const model = useMemo(() => {
    const object = clone(scene)
    let count = 0
    object.traverse((child) => {
      if (child instanceof T.Mesh) {
        count++
        child.castShadow = true
        child.receiveShadow = true
        const convert = (source: T.Material) => {
          const m = source as T.MeshStandardMaterial
          const material = new T.MeshToonMaterial({
            color: m.color ?? new T.Color('#dce0d5'),
            map: m.map ?? null,
            vertexColors: m.vertexColors,
            gradientMap: toon('#dce0d5').gradientMap,
            transparent: source.transparent,
            opacity: source.opacity,
            side: source.side,
            alphaTest: source.alphaTest,
          })
          if (m.emissive) material.emissive.copy(m.emissive)
          material.emissiveMap = m.emissiveMap ?? null
          material.emissiveIntensity = m.emissiveIntensity ?? 1
          return material
        }
        child.material = Array.isArray(child.material)
          ? child.material.map(convert)
          : convert(child.material)
      }
    })
    if (!count) return null
    const box = new T.Box3().setFromObject(object),
      size = box.getSize(new T.Vector3()),
      center = box.getCenter(new T.Vector3())
    const scale = HUMAN_SCALE.tarsHeight / Math.max(size.y, 0.001)
    const normalized = new T.Group()
    normalized.add(object)
    normalized.scale.setScalar(scale)
    normalized.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    return normalized
  }, [scene])
  const playback = useMemo(() => {
    if (!model) return null
    const mixer = new T.AnimationMixer(model)
    const actions: Partial<Record<TarsMotion, T.AnimationAction>> = {}
    for (const motionName of ['idle', 'walk', 'run', 'jump', 'action'] as const) {
      const clipName = tarsClipName(
        animations.map((clip) => clip.name),
        motionName,
      )
      const original = animations.find((clip) => clip.name === clipName)
      if (!original) continue
      const clip = original.clone()
      // World movement belongs to Follower; retain vertical motion and the wheel rotation.
      for (const track of clip.tracks) {
        if (track.name === 'Root.position') {
          const x = track.values[0],
            z = track.values[2]
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = x
            track.values[i + 2] = z
          }
        }
      }
      const action = mixer.clipAction(clip)
      if (motionName === 'jump' || motionName === 'action') {
        action.setLoop(T.LoopOnce, 1)
        action.clampWhenFinished = true
      }
      actions[motionName] = action
    }
    return { mixer, actions }
  }, [model, animations])
  const active = useRef<T.AnimationAction | null>(null),
    consumed = useRef(0),
    oneShot = useRef<T.AnimationAction | null>(null)
  useEffect(
    () => () => {
      if (playback && model) {
        playback.mixer.stopAllAction()
      }
      active.current = null
      oneShot.current = null
    },
    [playback, model],
  )
  useFrame((_, delta) => {
    if (!playback) return
    let restart = false
    if (request.current.serial !== consumed.current) {
      consumed.current = request.current.serial
      oneShot.current = playback.actions[request.current.kind] ?? null
      restart = !!oneShot.current
    } else if (oneShot.current && !oneShot.current.isRunning()) {
      oneShot.current = null
    }
    const next = oneShot.current ?? playback.actions[motion.current] ?? playback.actions.idle
    const freeze = reduced && motion.current === 'idle' && !oneShot.current
    if (next && (active.current !== next || restart)) {
      if (freeze) {
        active.current?.stop()
        next.reset().stopFading().setEffectiveWeight(1).play()
        playback.mixer.update(0)
      } else {
        active.current?.fadeOut(0.18)
        next.reset().fadeIn(0.18).play()
      }
      active.current = next
    }
    if (!freeze) playback.mixer.update(Math.min(delta, 0.05))
  })
  return model ? <primitive object={model} dispose={null} /> : <Proxy />
}
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Proxy /> : this.props.children
  }
}

function Follower({
  target,
  height,
  canWalk,
  reduced,
}: {
  target: CrewTarget
  height: (x: number, z: number) => number
  canWalk: (x: number, z: number) => boolean
  reduced: boolean
}) {
  const ref = useRef<T.Group>(null),
    next = useRef(new T.Vector3()),
    lastPlayer = useRef(new T.Vector3()),
    lastOutsidePlayer = useRef(new T.Vector3()),
    wasDriving = useRef(false),
    wasIndoors = useRef(false),
    initialized = useRef(false),
    motion = useRef<Motion>('idle'),
    request = useRef<TarsRequest>({ serial: 0, kind: 'jump' }),
    jumping = useRef(false),
    route = useRef(new FollowerRoute())
  useEffect(() => {
    const command = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail?.crewId === target.id && (detail.kind === 'jump' || detail.kind === 'action')) {
        request.current = { serial: request.current.serial + 1, kind: detail.kind }
      }
    }
    window.addEventListener(TARS_ACTION_EVENT, command)
    return () => window.removeEventListener(TARS_ACTION_EVENT, command)
  }, [target.id])
  useFrame((_, rawDelta) => {
    const player = target.body.current,
      body = ref.current
    if (!player || !body) return
    const delta = Math.min(rawDelta, 0.05),
      p = player.position,
      a = player.rotation.y
    const clearance = 0.015

    const isIndoors = target.isIndoors?.() ?? false
    const isDriving = target.isDriving?.() ?? false

    if (!isIndoors) {
      lastOutsidePlayer.current.copy(p)
    }

    if (wasDriving.current && !isDriving) {
      const dist = Math.hypot(p.x - body.position.x, p.z - body.position.z)
      if (dist > 8) {
        const angle = a + Math.PI
        const rx = p.x + Math.sin(angle) * 2.5
        const rz = p.z + Math.cos(angle) * 2.5
        if (canWalk(rx, rz)) {
          body.position.set(rx, height(rx, rz) + clearance, rz)
          body.rotation.y = a
          route.current.reset(p)
        }
      }
    }
    wasDriving.current = isDriving

    if (wasIndoors.current && !isIndoors) {
      lastPlayer.current.copy(p)
      route.current.reset(p)
    }
    wasIndoors.current = isIndoors

    if (isIndoors || isDriving) {
      // TARS stays waiting outside in idle state, not entering rooms or vehicles
      motion.current = 'idle'
      body.position.y = height(body.position.x, body.position.z) + clearance
      const lookTarget =
        isIndoors && lastOutsidePlayer.current.lengthSq() > 0 ? lastOutsidePlayer.current : p
      const angle = Math.atan2(lookTarget.x - body.position.x, lookTarget.z - body.position.z)
      const diff = Math.atan2(Math.sin(angle - body.rotation.y), Math.cos(angle - body.rotation.y))
      body.rotation.y += diff * Math.min(1, delta * 4)
      return
    }

    const travelled = initialized.current
      ? Math.hypot(p.x - lastPlayer.current.x, p.z - lastPlayer.current.z)
      : 0
    const inJump =
      target.motion?.current.phase === 'takeoff' || target.motion?.current.phase === 'air'
    if (inJump && !jumping.current)
      request.current = { serial: request.current.serial + 1, kind: 'jump' }
    jumping.current = inJump
    lastPlayer.current.copy(p)
    let x = p.x + Math.cos(a) * 1.8 - Math.sin(a) * 0.6,
      z = p.z - Math.sin(a) * 1.8 - Math.cos(a) * 0.6
    if (
      !canWalk(x, z) ||
      ((!initialized.current || travelled > 3) && !lineClear(p, { x, z }, canWalk))
    ) {
      x = p.x
      z = p.z
    }
    next.current.set(x, height(x, z) + clearance, z)
    const beforeX = body.position.x,
      beforeZ = body.position.z
    // Only fast-travel may relocate the companion. Normal following sweeps walls and furniture.
    const relocated = !initialized.current || travelled > 3
    if (relocated && canWalk(x, z)) {
      body.position.copy(next.current)
      route.current.reset(p)
    } else {
      const goal = route.current.target(body.position, p, next.current, canWalk)
      const distance = Math.hypot(goal.x - body.position.x, goal.z - body.position.z)
      const blend = Math.min(1 - Math.exp(-delta * 5), (9 * delta) / Math.max(distance, 0.001))
      moveWithCollisions(
        body.position,
        (goal.x - body.position.x) * blend,
        (goal.z - body.position.z) * blend,
        canWalk,
      )
    }
    initialized.current = true
    const speed = relocated
      ? 0
      : Math.hypot(body.position.x - beforeX, body.position.z - beforeZ) / Math.max(delta, 0.001)
    motion.current =
      speed > (MOTION_SCALE.walk + MOTION_SCALE.run) / 2 ? 'run' : speed > 0.12 ? 'walk' : 'idle'
    body.position.y = height(body.position.x, body.position.z) + clearance
    const diff = Math.atan2(Math.sin(a - body.rotation.y), Math.cos(a - body.rotation.y))
    body.rotation.y += diff * Math.min(1, delta * 7)
  })
  return (
    <group ref={ref} name={`tars-${target.id}`} userData={{ crewId: target.id }}>
      <ModelBoundary>
        <Suspense fallback={<Proxy />}>
          <Model motion={motion} request={request} reduced={reduced} />
        </Suspense>
      </ModelBoundary>
    </group>
  )
}

/** Each actual crew avatar gets an independent clone and follower. Network avatars are supplied by the caller. */
export default function TarsCompanions({
  targets,
  height,
  canWalk,
  reduced = false,
}: {
  targets: CrewTarget[]
  height: (x: number, z: number) => number
  canWalk: (x: number, z: number) => boolean
  reduced?: boolean
}) {
  return (
    <>
      {targets.slice(0, 4).map((target) => (
        <Follower
          key={target.id}
          target={target}
          height={height}
          canWalk={canWalk}
          reduced={reduced}
        />
      ))}
    </>
  )
}
