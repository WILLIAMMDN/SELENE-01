import * as T from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import plan from './landingPlan.json'
import { LUNAR_LANDER, lunarTerrainHeight } from './lunarNavigation'
import { landingPadHeight } from '../environmentLayout'

export const LANDING_DURATION = plan.durationSeconds
export const landingShot = (seconds: number) =>
  plan.shots.find((shot) => seconds < shot.end) ?? plan.shots[plan.shots.length - 1]
const clampTime = (seconds: number, start: number, duration: number) =>
  T.MathUtils.clamp(seconds - start, 0, duration)
function action(mixer: T.AnimationMixer, clips: T.AnimationClip[], name: string) {
  const clip = clips.find((clip) => clip.name === name)
  if (!clip) throw Error(`Falta la animación ${name}`)
  const result = mixer.clipAction(clip).setLoop(T.LoopOnce, 1).play()
  result.clampWhenFinished = true
  result.paused = true
  return result
}
function sample(action: T.AnimationAction, seconds: number) {
  action.play()
  action.paused = true
  action.time = seconds
}

/** Authored camera cuts, plume attachment and effects share the supplied 14-second timeline. */
export class LandingSequence {
  readonly root = new T.Group()
  readonly cameraScene: T.Object3D
  readonly lander: T.Object3D
  readonly effects: T.Object3D
  readonly plume: T.Object3D
  readonly dust: T.Object3D
  readonly light = new T.PointLight('#ff9b50', 0, 10, 2)
  private readonly cameraMixer: T.AnimationMixer
  private readonly landerMixer: T.AnimationMixer
  private readonly fxMixer: T.AnimationMixer
  private readonly cameras = new Map<string, T.PerspectiveCamera>()
  private readonly cameraActions = new Map<string, T.AnimationAction>()
  private readonly fxActions: { action: T.AnimationAction; start: number; duration: number }[]
  private readonly descent: T.AnimationAction
  private readonly materials = new Set<T.Material>()

  constructor(
    cameras: Pick<GLTF, 'scene' | 'animations'>,
    fx: Pick<GLTF, 'scene' | 'animations'>,
    lander: Pick<GLTF, 'scene' | 'animations'>,
  ) {
    this.cameraScene = clone(cameras.scene)
    this.effects = clone(fx.scene)
    this.lander = clone(lander.scene)
    const top = landingPadHeight(LUNAR_LANDER.x, LUNAR_LANDER.z, lunarTerrainHeight)
    const offset = top - plan.coordinates.originThree[1]
    this.cameraScene.position.y += offset
    this.effects.position.y += offset
    this.lander.position.set(LUNAR_LANDER.x, top, LUNAR_LANDER.z)
    this.root.add(this.cameraScene, this.effects, this.lander)
    this.root.traverse((node) => {
      if (!(node instanceof T.Mesh)) return
      const copy = (source: T.Material) => {
        const material = source.clone()
        for (let parent: T.Object3D | null = node; parent; parent = parent.parent) {
          if (parent.name === plan.fx.fixedToTerrain.stars && 'fog' in material) {
            material.fog = false
            material.depthWrite = false
          }
        }
        this.materials.add(material)
        return material
      }
      node.material = Array.isArray(node.material) ? node.material.map(copy) : copy(node.material)
      node.castShadow = !node.name.startsWith('FX_')
      node.receiveShadow = !node.name.startsWith('FX_')
    })
    this.plume = this.effects.getObjectByName(plan.fx.followsLander.node)!
    this.dust = this.effects.getObjectByName(plan.fx.fixedToTerrain.dustRoot)!
    const attachment = this.lander.getObjectByName(plan.fx.followsLander.parent)!
    if (!this.plume || !this.dust || !attachment)
      throw Error('El aterrizaje no contiene sus anclajes de efectos.')
    attachment.add(this.plume)
    this.light.position.fromArray(plan.runtime.lights[2].offset!)
    this.plume.add(this.light)
    this.cameraMixer = new T.AnimationMixer(this.cameraScene)
    this.landerMixer = new T.AnimationMixer(this.lander)
    // The common ancestor includes the nozzle after it has been reparented to the lander.
    this.fxMixer = new T.AnimationMixer(this.root)
    this.descent = action(this.landerMixer, lander.animations, plan.lander.clip)
    this.fxActions = plan.fx.tracks.map((track) => ({
      action: action(this.fxMixer, fx.animations, track.action),
      start: track.startSeconds,
      duration: track.durationSeconds,
    }))
    for (const shot of plan.shots) {
      const camera = this.cameraScene.getObjectByName(shot.camera)
      if (!(camera instanceof T.PerspectiveCamera)) throw Error(`Falta la cámara ${shot.camera}`)
      this.cameras.set(shot.camera, camera)
      this.cameraActions.set(shot.camera, action(this.cameraMixer, cameras.animations, shot.action))
    }
    this.sample(0)
  }

  sample(seconds: number) {
    const time = T.MathUtils.clamp(seconds, 0, LANDING_DURATION),
      shot = landingShot(time)
    sample(
      this.descent,
      clampTime(time, plan.lander.startSeconds, plan.lander.endSeconds - plan.lander.startSeconds),
    )
    this.landerMixer.update(0)
    for (const entry of this.fxActions)
      sample(entry.action, clampTime(time, entry.start, entry.duration))
    this.fxMixer.update(0)
    sample(this.cameraActions.get(shot.camera)!, clampTime(time, shot.start, shot.end - shot.start))
    this.cameraMixer.update(0)
    this.plume.visible = time < plan.fx.followsLander.offFromSeconds
    this.dust.visible =
      time >= plan.fx.fixedToTerrain.dustVisibleFromSeconds &&
      time < plan.fx.fixedToTerrain.dustOffFromSeconds
    const samples = plan.runtime.intensitySamples,
      position = Math.min(samples.length - 1, time * plan.fps)
    const index = Math.floor(position),
      first = samples[index],
      last = samples[Math.min(index + 1, samples.length - 1)]
    for (let i = 0; i < plan.runtime.intensitySampleOrder.length; i++) {
      const node = this.plume.getObjectByName(plan.runtime.intensitySampleOrder[i])
      node?.traverse((child) => {
        if (!(child instanceof T.Mesh)) return
        for (const material of Array.isArray(child.material) ? child.material : [child.material])
          if (material instanceof T.MeshStandardMaterial)
            material.emissiveIntensity = T.MathUtils.lerp(
              first.emissiveStrength[i],
              last.emissiveStrength[i],
              position - index,
            )
      })
    }
    this.light.intensity = this.plume.visible
      ? T.MathUtils.lerp(first.pointPowerWPreview, last.pointPowerWPreview, position - index) * 0.16
      : 0
    this.root.updateMatrixWorld(true)
    return this.cameras.get(shot.camera)!
  }
  dispose() {
    this.cameraMixer.stopAllAction()
    this.landerMixer.stopAllAction()
    this.fxMixer.stopAllAction()
    this.materials.forEach((material) => material.dispose())
  }
}
