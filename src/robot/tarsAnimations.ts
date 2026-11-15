export type TarsLocomotion = 'idle' | 'walk' | 'run'
export type TarsAction = 'jump' | 'action'
export type TarsMotion = TarsLocomotion | TarsAction
export type TarsRequest = { serial: number; kind: TarsAction }
export const TARS_ACTION_EVENT = 'selene:tars-action'
export function tarsClipName(names: string[], motion: TarsMotion) {
  const exact = { idle: 'TARS_Idle', walk: 'TARS_Walk', run: 'TARS_Run_Wheel', jump: 'TARS_Jump' }
  return motion === 'action'
    ? names.find((name) => name.startsWith('TARS_Armature_'))
    : names.find((name) => name === exact[motion])
}
export function requestTarsAction(kind: TarsAction, crewId = 'crew-1') {
  window.dispatchEvent(new CustomEvent(TARS_ACTION_EVENT, { detail: { kind, crewId } }))
}
