import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { tarsClipName, type TarsMotion } from './tarsAnimations'
import { FollowerRoute } from './followerRoute'
import { createCollisionGrid, moveWithCollisions } from '../world/navigation/collision'
it('connects all five clips actually shipped in the TARS GLB', () => {
  const data = readFileSync(
    new URL('../../public/models/companions/tars_selene01.glb', import.meta.url),
  )
  const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString())
  const names = gltf.animations.map((a: { name: string }) => a.name)
  const selected = (['idle', 'walk', 'run', 'jump', 'action'] as TarsMotion[]).map((m) =>
    tarsClipName(names, m),
  )
  expect(selected).toHaveLength(5)
  expect(selected.every(Boolean)).toBe(true)
  expect(new Set(selected)).toEqual(new Set(names))
  expect(tarsClipName([], 'jump')).toBeUndefined()
})
it('follows the crew around a corner instead of crossing its wall', () => {
  const clear = createCollisionGrid([{ x: 0, z: 0, hx: 2, hz: 0.1 }])
  const route = new FollowerRoute(),
    body = { x: -3, z: 1 },
    player = { x: -3, z: 1 }
  route.reset(player)
  const destinations = [
    { x: -3, z: -1 },
    { x: 3, z: -1 },
  ]
  for (const destination of destinations) {
    for (let i = 0; i < 240; i++) {
      const dx = destination.x - player.x,
        dz = destination.z - player.z,
        d = Math.hypot(dx, dz)
      if (d > 0.01) {
        player.x += (dx / Math.max(d, 1)) * 0.04
        player.z += (dz / Math.max(d, 1)) * 0.04
      }
      const goal = route.target(body, player, player, clear)
      moveWithCollisions(body, (goal.x - body.x) * 0.08, (goal.z - body.z) * 0.08, clear)
      expect(clear(body.x, body.z)).toBe(true)
    }
  }
  expect(Math.hypot(body.x - player.x, body.z - player.z)).toBeLessThan(0.3)
})
