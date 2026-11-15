import type { SamplingPose } from './lunar/lunarSampling'
import { moveWithCollisions } from './navigation/collision'
import { MOTION_SCALE } from './physicalScale'

export const CLIP_SECONDS = {
  Blink: 0.2,
  Carry_Idle: 2.033,
  Celebrate: 2.433,
  Crouch_Idle: 2.433,
  Crouch_Walk: 1.233,
  Fall: 1.133,
  Get_Up: 1.433,
  Idle: 2.433,
  Interact: 1.233,
  Jump_Air: 0.733,
  Jump_Land: 0.3,
  Jump_Start: 0.2,
  Open_Door: 1.533,
  Pick_Up: 1.633,
  Point: 2.033,
  Run: 0.633,
  Run_Stop: 0.633,
  Sit_Down: 0.933,
  Sit_Idle: 2.433,
  Stand_Up: 0.933,
  Strafe_Left: 1.033,
  Strafe_Right: 1.033,
  Surprise: 1.533,
  Talk: 3.033,
  Turn_Left: 0.833,
  Turn_Right: 0.833,
  Use_Panel: 2.033,
  Walk: 1.033,
  Walk_Back: 1.033,
  Wave: 2.033,
  Worry: 2.533,
} as const
export type CharacterClip = Exclude<keyof typeof CLIP_SECONDS, 'Blink'>
export type GestureClip =
  | 'Wave'
  | 'Talk'
  | 'Interact'
  | 'Point'
  | 'Pick_Up'
  | 'Carry_Idle'
  | 'Use_Panel'
  | 'Open_Door'
  | 'Surprise'
  | 'Celebrate'
  | 'Worry'
  | 'Fall'
  | 'Get_Up'
  | 'Run_Stop'
  | 'Turn_Left'
  | 'Turn_Right'
export type CharacterCommand =
  | 'jump'
  | 'crouch'
  | 'wave'
  | 'talk'
  | 'interact'
  | 'hatch'
  | 'workstation'
  | 'blink'
  | 'sit'
  | `perform:${GestureClip}`
export const LOOP_CLIPS = new Set<string>([
  'Idle',
  'Walk',
  'Run',
  'Jump_Air',
  'Talk',
  'Crouch_Idle',
  'Crouch_Walk',
  'Sit_Idle',
  'Carry_Idle',
  'Strafe_Left',
  'Strafe_Right',
  'Walk_Back',
])
export type CharacterMotion = {
  samplingPose?: { pose: SamplingPose; progress: number; crouch: number }
  clip: CharacterClip
  serial: number
  speed: number
  crouched: boolean
  phase: 'ground' | 'takeoff' | 'air' | 'land'
  timer: number
  airY: number
  verticalSpeed: number
  gesture: GestureClip | null
  gestureTime: number
  blinkSerial: number
  seat: 'down' | 'idle' | 'up' | null
  seatTimer: number
  seatHeight: number
  facing: number
}
export type CharacterControls = { keys: Set<string>; actions: CharacterCommand[] }
export const CHARACTER_KEYS: Record<string, CharacterCommand> = {
  Space: 'jump',
  KeyE: 'interact',
  ControlLeft: 'sit',
  ControlRight: 'sit',
}
export const MOVEMENT_KEYS = [
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ShiftLeft',
  'ShiftRight',
  'AltLeft',
  'AltRight',
]
export const EXPLORER_MOVEMENT = {
  run: 6.5,
  crouch: 0.65,
  jumpSpeed: 4.4,
  gravity: 9.81,
  takeoffTime: 0.2,
  landTime: 0.3,
} as const
// Bench centres match the Earth environment; never sit in mid-air.
const SEATS = [
  { x: -8, z: 23, y: 0, yaw: 0.35 },
  { x: 12, z: 22, y: 0, yaw: -0.35 },
  { x: -55, z: 43, y: 0.12, yaw: 0.6 },
  { x: -47, z: 43, y: 0.12, yaw: -0.6 },
]
export function createCharacterMotion(): CharacterMotion {
  return {
    clip: 'Idle',
    serial: 0,
    speed: 0,
    crouched: false,
    phase: 'ground',
    timer: 0,
    airY: 0,
    verticalSpeed: 0,
    gesture: null,
    gestureTime: 0,
    blinkSerial: 0,
    seat: null,
    seatTimer: 0,
    seatHeight: 0,
    facing: Math.PI,
  }
}

/** Clips own poses; the shared Earth controller owns translation and collisions. */
export function stepCharacter(
  state: CharacterMotion,
  controls: CharacterControls,
  p: { x: number; y: number; z: number },
  yaw: number,
  delta: number,
  height: (x: number, z: number) => number,
  canWalk: (x: number, z: number) => boolean,
) {
  const keys = controls.keys
  let dx =
    (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
    (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
  let dz =
    (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) -
    (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0)
  let interact = false,
    restart = false,
    desiredYaw: number | null = null
  const previousSpeed = state.speed
  const stand = () => {
    state.seat = 'up'
    state.seatTimer = CLIP_SECONDS.Stand_Up
  }
  for (const command of controls.actions.splice(0)) {
    if (['blink', 'crouch', 'wave', 'talk'].includes(command)) continue
    if (command === 'blink') {
      state.blinkSerial++
      continue
    }
    if (state.phase !== 'ground') continue
    if (state.seat) {
      if (command === 'sit' && state.seat === 'idle') stand()
      continue
    }
    if (command === 'sit') {
      const seat = SEATS.find((s) => Math.hypot(p.x - s.x, p.z - s.z) < 2.1)
      if (seat && canWalk(seat.x + Math.sin(seat.yaw) * 0.9, seat.z + Math.cos(seat.yaw) * 0.9)) {
        p.x = seat.x + Math.sin(seat.yaw) * 0.08
        p.z = seat.z + Math.cos(seat.yaw) * 0.08
        state.seat = 'down'
        state.seatTimer = CLIP_SECONDS.Sit_Down
        state.seatHeight = seat.y
        state.facing = seat.yaw
        state.gesture = null
        state.crouched = false
      }
    }
    if (command === 'crouch') {
      state.crouched = !state.crouched
      state.gesture = null
    }
    if (command === 'jump') {
      state.crouched = false
      state.gesture = null
      state.phase = 'takeoff'
      state.timer = EXPLORER_MOVEMENT.takeoffTime
    }
    const gesture: GestureClip | null =
      command === 'wave'
        ? 'Wave'
        : command === 'talk'
          ? 'Talk'
          : command === 'interact'
            ? 'Interact'
            : command.startsWith('perform:')
              ? (command.slice(8) as GestureClip)
              : null
    if (gesture) {
      state.crouched = false
      state.gesture = LOOP_CLIPS.has(gesture) && state.gesture === gesture ? null : gesture
      state.gestureTime = LOOP_CLIPS.has(gesture) ? Infinity : CLIP_SECONDS[gesture]
      restart = true
    }
  }
  if (state.seat) {
    desiredYaw = state.facing
    if ((dx || dz) && state.seat === 'idle') stand()
    if (state.seat !== 'idle') {
      state.seatTimer -= delta
      if (state.seatTimer <= 0) {
        if (state.seat === 'down') state.seat = 'idle'
        else {
          const exitX = p.x + Math.sin(state.facing) * 0.9,
            exitZ = p.z + Math.cos(state.facing) * 0.9
          if (canWalk(exitX, exitZ)) {
            p.x = exitX
            p.z = exitZ
          }
          state.seat = null
          state.seatHeight = 0
        }
      }
    }
    dx = 0
    dz = 0
  }
  if ((dx || dz) && state.gesture) {
    if (state.gesture === 'Fall') {
      state.gesture = 'Get_Up'
      state.gestureTime = CLIP_SECONDS.Get_Up
      restart = true
    } else if (state.gesture !== 'Get_Up') state.gesture = null
  }
  if (state.gesture) {
    if (state.gesture === 'Turn_Left' || state.gesture === 'Turn_Right') {
      state.facing +=
        ((state.gesture === 'Turn_Left' ? 1 : -1) * Math.PI * 0.5 * delta) /
        CLIP_SECONDS[state.gesture]
      desiredYaw = state.facing
    }
    state.gestureTime -= delta
    if (state.gestureTime <= 0) {
      interact = state.gesture === 'Interact' || state.gesture === 'Use_Panel'
      if (state.gesture === 'Fall') {
        state.gesture = 'Get_Up'
        state.gestureTime = CLIP_SECONDS.Get_Up
      } else state.gesture = null
    }
  }
  if (
    !dx &&
    !dz &&
    !state.gesture &&
    !state.seat &&
    state.phase === 'ground' &&
    previousSpeed > 2.5
  ) {
    state.gesture = 'Run_Stop'
    state.gestureTime = CLIP_SECONDS.Run_Stop
  }
  if (state.phase === 'takeoff' || state.phase === 'land') {
    state.timer -= delta
    if (state.timer <= 0) {
      if (state.phase === 'takeoff') {
        state.phase = 'air'
        state.airY = height(p.x, p.z)
        state.verticalSpeed = EXPLORER_MOVEMENT.jumpSpeed
      } else state.phase = 'ground'
    }
  }
  if (state.phase === 'takeoff' || state.phase === 'land' || state.gesture || state.seat) {
    dx = 0
    dz = 0
  }
  const beforeX = p.x,
    beforeZ = p.z,
    length = Math.hypot(dx, dz),
    directional = keys.has('AltLeft') || keys.has('AltRight')
  if (length) {
    dx /= length
    dz /= length
    const wx = dx * Math.cos(yaw) + dz * Math.sin(yaw),
      wz = -dx * Math.sin(yaw) + dz * Math.cos(yaw)
    const velocity = state.crouched
      ? EXPLORER_MOVEMENT.crouch
      : !directional && (keys.has('ShiftLeft') || keys.has('ShiftRight'))
        ? EXPLORER_MOVEMENT.run
        : MOTION_SCALE.walk
    moveWithCollisions(p, wx * velocity * delta, wz * velocity * delta, canWalk)
    desiredYaw = directional ? yaw + Math.PI : Math.atan2(wx, wz)
    state.facing = desiredYaw
  }
  state.speed = Math.hypot(p.x - beforeX, p.z - beforeZ) / Math.max(delta, 0.001)
  const ground = height(p.x, p.z)
  if (state.phase === 'air') {
    state.airY += state.verticalSpeed * delta - 0.5 * EXPLORER_MOVEMENT.gravity * delta * delta
    state.verticalSpeed -= EXPLORER_MOVEMENT.gravity * delta
    if (state.airY <= ground) {
      state.airY = ground
      state.verticalSpeed = 0
      state.phase = 'land'
      state.timer = EXPLORER_MOVEMENT.landTime
    }
    p.y = state.airY
  } else p.y = ground + (state.seat ? state.seatHeight : 0)
  let locomotion: CharacterClip =
    state.speed < 0.08
      ? 'Idle'
      : state.speed > (MOTION_SCALE.walk + EXPLORER_MOVEMENT.run) / 2
        ? 'Run'
        : 'Walk'
  if (state.crouched) locomotion = state.speed > 0.08 ? 'Crouch_Walk' : 'Crouch_Idle'
  else if (directional && state.speed > 0.08)
    locomotion =
      Math.abs(dx) > Math.abs(dz)
        ? dx < 0
          ? 'Strafe_Left'
          : 'Strafe_Right'
        : dz > 0
          ? 'Walk_Back'
          : 'Walk'
  const clip: CharacterClip = state.seat
    ? state.seat === 'down'
      ? 'Sit_Down'
      : state.seat === 'up'
        ? 'Stand_Up'
        : 'Sit_Idle'
    : state.phase === 'takeoff'
      ? 'Jump_Start'
      : state.phase === 'air'
        ? 'Jump_Air'
        : state.phase === 'land'
          ? 'Jump_Land'
          : (state.gesture ?? locomotion)
  if (clip !== state.clip || restart) {
    state.clip = clip
    state.serial++
  }
  return { desiredYaw, interact }
}
