import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import type { LunarSession } from './lunarRoverControl'
import { lunarDeckAt } from './lunarInteriorNavigation'
import { lunarTerrainHeight } from './lunarNavigation'

export default function LunarFootDust({ lunar, paused }: { lunar: LunarSession; paused: boolean }) {
  const state = useMemo(() => {
    const positions = new Float32Array(48 * 3).fill(-1000)
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    return {
      geometry,
      positions,
      last: new Vector3(),
      distance: 0,
      index: 0,
      grains: Array.from({ length: 48 }, () => ({ age: 1, vx: 0, vz: 0, vy: 0 })),
    }
  }, [])
  useFrame((_, raw) => {
    const p = lunar.position
    if (!p) return
    const dt = Math.min(raw, 0.05)
    const distance = Math.hypot(p.x - state.last.x, p.z - state.last.z)
    state.last.copy(p)
    if (paused) return
    const ground = lunarTerrainHeight(p.x, p.z)
    if (!lunar.boarded && distance < 0.35 && p.y - ground < 0.11 && !lunarDeckAt(p.x, p.z)) {
      state.distance += distance
      if (state.distance >= 0.46) {
        state.distance = 0
        for (let k = 0; k < 8; k++) {
          const i = state.index++ % state.grains.length
          const grain = state.grains[i]
          grain.age = 0
          grain.vx = (Math.random() - 0.5) * 0.9
          grain.vz = (Math.random() - 0.5) * 0.9
          grain.vy = 0.31 + Math.random() * 0.4
          state.positions.set([p.x + grain.vx * 0.32, ground + 0.055, p.z + grain.vz * 0.32], i * 3)
        }
      }
    } else state.distance = 0
    state.grains.forEach((grain, i) => {
      if (grain.age >= 0.67) return
      grain.age += dt
      const j = i * 3
      grain.vy -= 1.62 * dt
      state.positions[j] += grain.vx * dt
      state.positions[j + 1] += grain.vy * dt
      state.positions[j + 2] += grain.vz * dt
      if (
        grain.age >= 0.67 ||
        state.positions[j + 1] < lunarTerrainHeight(state.positions[j], state.positions[j + 2])
      )
        state.positions[j + 1] = -1000
    })
    state.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points geometry={state.geometry} frustumCulled={false}>
      <pointsMaterial color="#958f83" size={0.058} transparent opacity={0.45} depthWrite={false} />
    </points>
  )
}
