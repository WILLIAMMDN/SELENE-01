import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { lunarDeckAt } from './lunarInteriorNavigation'
import { lunarTerrainHeight } from './lunarNavigation'
import type { LunarSession } from './lunarRoverControl'

function treadTexture(tire: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.roundRect(tire ? 5 : 10, 3, tire ? 54 : 44, 58, tire ? 3 : 16)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = tire ? 5 : 4
  for (let y = 10; y < 58; y += 11) {
    ctx.beginPath()
    ctx.moveTo(2, y)
    ctx.lineTo(32, y + (tire ? 7 : 2))
    ctx.lineTo(62, y)
    ctx.stroke()
  }
  return new T.CanvasTexture(canvas)
}

export default function LunarTracks({ lunar, paused }: { lunar: LunarSession; paused: boolean }) {
  const state = useMemo(
    () => ({
      maps: [treadTexture(false), treadTexture(true)],
      marks: Array.from({ length: 144 }, () => ({ age: 31 })),
      last: new T.Vector3(),
      driving: false,
      ready: false,
      distance: 0,
      next: 0,
      foot: 1,
    }),
    [],
  )
  const meshes = useRef<(T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial> | null)[]>([])
  useFrame((_, dt) => {
    const driving = lunar.boarded && !!lunar.rover
    const p = driving ? lunar.rover!.vehicle.position : lunar.position
    if (!p) return
    const dx = p.x - state.last.x,
      dz = p.z - state.last.z
    const distance = Math.hypot(dx, dz)
    const continuous = state.ready && state.driving === driving && distance < 1 && !paused
    state.last.copy(p)
    state.ready = true
    state.driving = driving
    if (paused) return
    const ground = lunarTerrainHeight(p.x, p.z)
    const valid =
      continuous && (driving || (Math.abs(p.y - ground) < 0.14 && !lunarDeckAt(p.x, p.z)))
    state.distance = valid ? state.distance + distance : 0
    const spacing = driving ? 0.35 : 0.52
    if (state.distance >= spacing) {
      state.distance %= spacing
      const yaw = driving ? lunar.rover!.yaw : Math.atan2(dx, dz)
      const c = Math.cos(yaw),
        s = Math.sin(yaw)
      state.foot *= -1
      for (const offset of driving ? [-1.04, 1.04] : [state.foot * 0.135]) {
        const index = state.next++ % state.marks.length
        const mesh = meshes.current[index]
        if (!mesh) continue
        const back = driving ? -1.15 : -0.14
        const x = p.x + c * offset + s * back,
          z = p.z - s * offset + c * back
        const width = driving ? 0.27 : 0.17,
          length = driving ? 0.38 : 0.31
        const vertices = mesh.geometry.attributes.position
        for (let i = 0; i < vertices.count; i++) {
          const across = (((i % 3) - 1) * width) / 2
          const along = ((1 - Math.floor(i / 3)) * length) / 2
          const px = x + c * across + s * along,
            pz = z - s * across + c * along
          vertices.setXYZ(i, px, lunarTerrainHeight(px, pz) + 0.022, pz)
        }
        vertices.needsUpdate = true
        mesh.material.map = state.maps[Number(driving)]
        mesh.material.opacity = 0.58
        mesh.visible = true
        state.marks[index].age = 0
      }
    }
    state.marks.forEach((mark, i) => {
      const mesh = meshes.current[i]
      if (!mesh?.visible) return
      mark.age += dt
      mesh.material.opacity = 0.58 * Math.min(1, Math.max(0, (30 - mark.age) / 9))
      mesh.visible = mark.age < 30
    })
  })
  return (
    <>
      {state.marks.map((_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh as T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial> | null
          }}
          visible={false}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1, 2, 2]} />
          <meshBasicMaterial
            map={state.maps[0]}
            color="#625c50"
            transparent
            depthWrite={false}
            side={T.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </>
  )
}
