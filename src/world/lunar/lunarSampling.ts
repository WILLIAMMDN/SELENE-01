import { Vector3 } from 'three'
import type { LunarResource } from './lunarResources'

export const SAMPLING = {
  hielo: {
    tool: 'pick',
    contact: 0.94,
    lift: 1.53,
    record: 2.32,
    end: 2.78,
    length: 0.48,
    windup: 0.39,
    drop: 0.2,
    strikes: true,
  },
  regolito: {
    tool: 'scoop',
    contact: 0.86,
    lift: 1.32,
    record: 2.18,
    end: 2.55,
    length: 0.47,
    windup: 0.08,
    drop: 0.16,
    strikes: false,
  },
  helio: {
    tool: 'probe',
    contact: 0.72,
    lift: 1.65,
    record: 1.65,
    end: 2.19,
    length: 0.34,
    windup: 0.12,
    drop: 0.15,
    strikes: false,
  },
  titanio: {
    tool: 'hammer',
    contact: 0.86,
    lift: 1.38,
    record: 2.17,
    end: 2.62,
    length: 0.38,
    windup: 0.25,
    drop: 0.16,
    strikes: true,
  },
  hierro: {
    tool: 'hammer',
    contact: 1.09,
    lift: 1.62,
    record: 2.44,
    end: 2.86,
    length: 0.39,
    windup: 0.35,
    drop: 0.26,
    strikes: true,
  },
  roca: {
    tool: 'tongs',
    contact: 0.78,
    lift: 1.2,
    record: 2.15,
    end: 2.6,
    length: 0.28,
    windup: 0.06,
    drop: 0.13,
    strikes: false,
  },
} as const satisfies Record<
  LunarResource['id'],
  {
    tool: string
    contact: number
    lift: number
    record: number
    end: number
    length: number
    windup: number
    drop: number
    strikes: boolean
  }
>

export type LunarSampling = {
  resource: LunarResource
  elapsed: number
  approaching: boolean
  replay: boolean
}

export function samplingEvents(id: LunarResource['id'], before: number, elapsed: number) {
  const { record, end } = SAMPLING[id]
  return { record: before < record && elapsed >= record, finished: elapsed >= end }
}

const ease = (n: number) => {
  const t = Math.min(1, Math.max(0, n))
  return t * t * (3 - 2 * t)
}

export function createSamplingPose() {
  return {
    grip: new Vector3(),
    direction: new Vector3(),
    contact: new Vector3(),
    payload: new Vector3(),
    caseBase: new Vector3(),
    rest: new Vector3(),
    toolTip: new Vector3(),
    forward: new Vector3(),
    right: new Vector3(),
    transfer: new Vector3(),
    raised: new Vector3(),
    pulse: 0,
    carry: false,
    lid: 0,
  }
}
export type SamplingPose = ReturnType<typeof createSamplingPose>

/** Same authored hand path drives avatar, tool and transfer. Space is world metres. */
export function sampleLunarPose(pose: SamplingPose, action: LunarSampling, player: Vector3) {
  const { resource, elapsed: t } = action
  const profile = SAMPLING[resource.id]
  const {
    grip,
    direction,
    contact,
    payload,
    caseBase,
    rest,
    toolTip,
    forward,
    right,
    transfer,
    raised,
  } = pose
  forward.set(resource.position[0] - player.x, 0, resource.position[1] - player.z)
  const distance = forward.length()
  forward.normalize()
  right.set(forward.z, 0, -forward.x)
  const reach = Math.max(0.53, Math.min(1.04, distance - 0.87))
  contact.copy(player).addScaledVector(forward, reach).addScaledVector(right, 0.16)
  contact.y += 0.48 - profile.drop
  caseBase.copy(player).addScaledVector(forward, 0.47).addScaledVector(right, 0.62)
  caseBase.y += 0.38
  transfer.copy(caseBase)
  transfer.y += 0.15
  rest.copy(player).addScaledVector(forward, 0.26).addScaledVector(right, 0.34)
  rest.y += 1.09
  raised.copy(rest).addScaledVector(forward, 0.26)
  raised.y += profile.windup
  const toContact = ease((t - profile.contact * 0.38) / (profile.contact * 0.62))
  const lift = ease((t - profile.contact) / (profile.lift - profile.contact))
  const deposit =
    profile.tool === 'probe' ? 0 : ease((t - profile.lift) / (profile.record - profile.lift))
  const recover = ease((t - profile.record) / (profile.end - profile.record))
  grip.copy(rest).lerp(raised, ease(t / (profile.contact * 0.38)))
  toolTip.copy(contact)
  if (t <= profile.contact) {
    direction.copy(contact).sub(grip).normalize()
    grip.lerp(toolTip.addScaledVector(direction, -profile.length), toContact)
  } else {
    toolTip.copy(contact)
    if (profile.strikes) toolTip.addScaledVector(forward, -0.09 * lift)
    toolTip.addScaledVector(forward, -0.28 * lift)
    toolTip.y += 0.62 * lift
    if (profile.tool === 'probe') {
      toolTip.copy(contact).lerp(rest, recover * 0.7)
    } else {
      toolTip.lerp(transfer, deposit)
    }
    direction.copy(toolTip).sub(rest).normalize()
    grip.copy(toolTip).addScaledVector(direction, -profile.length)
    grip.lerp(rest, recover)
  }
  if (t <= profile.contact) {
    direction.copy(contact).sub(grip).normalize()
    direction.y += 0.95 * (1 - toContact)
    direction.normalize()
  } else {
    direction.copy(toolTip).sub(grip).normalize()
  }
  payload.copy(t < profile.contact ? contact : toolTip)
  if (t >= profile.record && profile.tool !== 'probe') payload.copy(transfer)
  pose.carry = profile.tool !== 'probe' && (t >= profile.contact || !profile.strikes)
  pose.pulse = profile.tool === 'probe' ? ease((t - profile.contact) / 0.15) * (1 - recover) : 0
  pose.lid = 1 - recover
  return pose
}
