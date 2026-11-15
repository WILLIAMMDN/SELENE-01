import { useMemo } from 'react'
import * as T from 'three'

function Cloud({ index }: { index: number }) {
  const { geometry, edge } = useMemo(() => {
    const shape = new T.Shape(),
      width = 48 + (index % 3) * 14
    shape.moveTo(-width / 2, 0)
    for (let i = 1; i <= 12; i++) {
      const x = -width / 2 + (i * width) / 12,
        previous = x - width / 12
      const y = 2.5 + Math.sin(i * 1.7 + index) * 2 + (i > 3 && i < 9 ? 3 : 0)
      shape.bezierCurveTo(previous + width / 36, y - 1, x - width / 36, y + 2, x, y)
    }
    for (let i = 12; i >= 0; i--) {
      const x = -width / 2 + (i * width) / 12
      shape.lineTo(x + 0.7 * Math.sin(i * 3), -1.5 + Math.sin(i * 2.1 + index) * 1.1)
    }
    shape.closePath()
    const edge = new T.BufferGeometry().setFromPoints(
      shape.getPoints(7).map((p) => new T.Vector3(p.x, p.y, 0.015)),
    )
    return { geometry: new T.ShapeGeometry(shape, 7), edge }
  }, [index])
  const angle = (index * Math.PI) / 4 + 0.17
  return (
    <group
      position={[Math.sin(angle) * 210, 53 + (index % 3) * 19, Math.cos(angle) * 210]}
      rotation={[0, angle + Math.PI, -0.08 + (index % 3) * 0.06]}
    >
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#a4ded0" side={T.DoubleSide} />
      </mesh>
      <lineLoop geometry={edge}>
        <lineBasicMaterial color="#559b98" transparent opacity={0.65} />
      </lineLoop>
    </group>
  )
}
export default function PaintedClouds() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <Cloud key={i} index={i} />
      ))}
    </>
  )
}
