import {
  AnimationMixer,
  LoopOnce,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from 'three'

export function createCharacterPlayback(actor: Object3D, animations: AnimationClip[]) {
  const mixer = new AnimationMixer(actor)
  const actions: Record<string, AnimationAction> = {}
  for (const source of animations) {
    const clip = source.clone()
    const action = mixer.clipAction(clip)
    if (!['Idle', 'Walk', 'Run'].includes(clip.name)) {
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = true
    }
    actions[clip.name] = action
  }
  return {
    mixer,
    actions,
    // Strict Mode replays effects with the same memoized actions. Uncaching the
    // root invalidates their bindings. The mixer is collected with its actor.
    stop: () => mixer.stopAllAction(),
  }
}
