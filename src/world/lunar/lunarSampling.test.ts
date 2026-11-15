import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { LUNAR_RESOURCES } from './lunarResources'
import { createSamplingPose, SAMPLING, sampleLunarPose, samplingEvents } from './lunarSampling'

describe('lunar field animation', () => {
  for (const resource of LUNAR_RESOURCES) {
    it(`synchronizes ${resource.name} with tool contact and registers once at completion of the work`, () => {
      const profile = SAMPLING[resource.id]
      const [x, z] = resource.position
      const player = new Vector3(x, 2, z - 1.57)
      const action = {
        resource,
        elapsed: Number(profile.contact),
        approaching: false,
        replay: false,
      }
      const pose = createSamplingPose()
      sampleLunarPose(pose, action, player)
      const tip = pose.grip.clone().addScaledVector(pose.direction, profile.length)
      expect(tip.distanceTo(pose.contact)).toBeLessThan(0.001)
      expect(samplingEvents(resource.id, 0, profile.contact).record).toBe(false)
      expect(samplingEvents(resource.id, profile.record - 0.01, profile.record).record).toBe(true)
      expect(samplingEvents(resource.id, profile.record, profile.end)).toEqual({
        record: false,
        finished: true,
      })
      if (profile.tool === 'probe') {
        action.elapsed = profile.contact + 0.3
        expect(sampleLunarPose(pose, action, player).pulse).toBeGreaterThan(0.8)
        expect(pose.carry).toBe(false)
      } else {
        action.elapsed = profile.lift
        sampleLunarPose(pose, action, player)
        expect(pose.payload.y).toBeGreaterThan(pose.contact.y + 0.5)
        action.elapsed = profile.record
        sampleLunarPose(pose, action, player)
        expect(pose.payload.distanceTo(pose.caseBase)).toBeCloseTo(0.15)
        action.elapsed = profile.end
        expect(sampleLunarPose(pose, action, player).lid).toBe(0)
      }
    })
  }
})
