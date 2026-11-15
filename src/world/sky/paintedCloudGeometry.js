import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// Original contour recipes: overlapping lobes form a single painted silhouette,
// rather than stacking transparent cards or rendering dozens of shaded spheres.
const recipes = [
  [
    [-0.75, 0, 0.42, 0.22],
    [-0.42, 0.18, 0.4, 0.42],
    [0, 0.42, 0.43, 0.67],
    [0.42, 0.21, 0.39, 0.46],
    [0.77, 0, 0.34, 0.24],
    [0, -0.07, 0.87, 0.19],
  ],
  [
    [-0.8, 0, 0.32, 0.18],
    [-0.52, 0.06, 0.36, 0.24],
    [-0.16, 0.18, 0.42, 0.35],
    [0.25, 0.08, 0.44, 0.26],
    [0.68, 0.02, 0.38, 0.2],
    [0, -0.07, 0.9, 0.15],
  ],
  [
    [-0.68, 0, 0.43, 0.27],
    [-0.34, 0.28, 0.42, 0.58],
    [0.05, 0.65, 0.36, 0.87],
    [0.3, 0.34, 0.45, 0.53],
    [0.68, 0.06, 0.35, 0.29],
    [0, -0.04, 0.84, 0.25],
  ],
  [
    [-0.82, 0, 0.28, 0.13],
    [-0.54, 0.05, 0.35, 0.19],
    [-0.14, 0.05, 0.46, 0.2],
    [0.31, 0.02, 0.4, 0.16],
    [0.73, 0.01, 0.35, 0.13],
    [0, -0.04, 0.9, 0.12],
  ],
]
function shapeFromPoints(points) {
  const shape = new THREE.Shape()
  shape.moveTo(...points[0])
  // Catmull-Rom-to-Bezier: smoothly varying hand-painted contours without polygon edges.
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length],
      p1 = points[i],
      p2 = points[(i + 1) % points.length],
      p3 = points[(i + 2) % points.length]
    shape.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
      p2[0],
      p2[1],
    )
  }
  shape.closePath()
  return shape
}
export function paintedCloudGeometry(variant) {
  const lobes = recipes[variant]
  const min = Math.min(...lobes.map((l) => l[0] - l[2])),
    max = Math.max(...lobes.map((l) => l[0] + l[2]))
  const upper = [],
    lower = []
  for (let i = 0; i <= 72; i++) {
    const x = min + ((max - min) * i) / 72
    const spans = lobes
      .filter((l) => Math.abs(x - l[0]) <= l[2] + 0.0001)
      .map((l) => {
        const y = Math.sqrt(Math.max(0, 1 - ((x - l[0]) / l[2]) ** 2)) * l[3]
        return [l[1] - y, l[1] + y]
      })
    lower.push([x, Math.min(...spans.map((s) => s[0]))])
    upper.push([x, Math.max(...spans.map((s) => s[1]))])
  }
  const outline = shapeFromPoints([...upper, ...lower.slice().reverse()])
  const band = lower.map(([x, y], i) => [
    x,
    y + (upper[i][1] - y) * (0.24 + 0.12 * Math.sin(x * 7 + variant) + 0.08 * Math.sin(x * 16)),
  ])
  const shade = shapeFromPoints([...band, ...lower.slice().reverse()])
  const high = upper.slice(13, 53).map(([x, y]) => [x, y - 0.035])
  const rim = shapeFromPoints([
    ...high,
    ...high
      .slice()
      .reverse()
      .map(([x, y]) => [x, y - 0.045 - 0.025 * Math.sin(x * 12)]),
  ])
  const layer = (shape, scale, z, value) => {
    const g = new THREE.ShapeGeometry(shape, 2)
    g.scale(scale, scale, 1)
    g.translate(0, 0, z)
    g.setAttribute(
      'shadeBand',
      new THREE.Float32BufferAttribute(
        new Float32Array(g.attributes.position.count).fill(value),
        1,
      ),
    )
    return g
  }
  // The muted rim is narrow; it reads as paint, not a thick sticker outline.
  const layers = [
    layer(outline, 1.004, 0, -1),
    layer(outline, 1, 0.4, 1),
    layer(shade, 1, 0.8, 0),
    layer(rim, 1, 1.2, 2),
  ]
  const geometry = mergeGeometries(layers)
  layers.forEach((g) => g.dispose())
  return geometry
}
