import { coastDistance, PARKING } from './environmentLayout'
import modules from './artemisaModules.json'
export const CAMPUS_BUILDINGS = [
  { id: 'laboratory', x: -17, z: -3, label: '01 / INVESTIGACIÓN' },
  { id: 'workshop', x: 23, z: 14, label: 'TALLER / ROBÓTICA' },
  { id: 'communications', x: -51.29135, z: -32, label: '03 / COMUNICACIONES' },
  { id: 'habitat', x: -36, z: 20, label: 'HÁBITAT / TRIPULACIÓN' },
  { id: 'airlock', x: -36, z: 28.45, label: 'ESCLUSA' },
  { id: 'greenhouse', x: -25, z: 23, label: 'INVERNADERO' },
  { id: 'life_support', x: -27, z: -22, label: 'SOPORTE VITAL' },
  { id: 'shelter', x: -45, z: 4, label: 'REFUGIO' },
  { id: 'energy', x: 10, z: -38, label: 'ENERGÍA' },
  { id: 'logistics', x: 78, z: 22, label: 'LOGÍSTICA / DESCENSO' },
].map((p) => ({ ...p, ...modules.find((m) => m.id === p.id)! }))
export const CAMPUS_ROADS: { points: [number, number][]; width: number; main?: boolean }[] = [
  {
    points: [
      [0, 68],
      [0, 40],
      [-1, 22],
      [0, 7],
      [-17, 5],
    ],
    width: 6,
    main: true,
  },
  {
    points: [
      [-17, 5],
      [0, 7],
      [15, 5],
      [24, 1],
    ],
    width: 5.5,
    main: true,
  },
  {
    points: [
      [0, 7],
      [-29, 13],
      [-41, -4],
      [-53, -25],
    ],
    width: 4.5,
  },
  {
    points: [
      [24, 1],
      [43, 4],
      [60, -5],
      [63, -23],
      [61, -35],
    ],
    width: 5,
    main: true,
  },
  {
    points: [
      [0, 34],
      [-17, 38],
      [-29, 43],
      [-43, 43],
    ],
    width: 4,
  },
  {
    points: [
      [-53, -25],
      [-61, -12],
      [-66, 17],
      [-56, 36],
      [-43, 43],
    ],
    width: 3,
  },
  {
    points: [
      [12, 25],
      [23, 23],
      [23, 20],
    ],
    width: 3,
  },
  {
    points: [
      [-17, 38],
      [-25, 34],
      [-36, 35],
    ],
    width: 3,
  },
  {
    points: [
      [-25, 34],
      [-25, 28],
    ],
    width: 2.5,
  },
  {
    points: [
      [-17, 5],
      [-8, -10],
      [-15, -18],
      [-27, -17],
    ],
    width: 3,
  },
  {
    points: [
      [24, 1],
      [7, 4],
      [6, -15],
      [5, -31],
      [10, -32],
    ],
    width: 3,
  },
  {
    points: [
      [43, 4],
      [60, 6],
      [67, 22],
    ],
    width: 4,
  },
  {
    points: [
      [-17, 5],
      [-17, -0.5],
    ],
    width: 1.6,
  },
  {
    points: [
      [-53, -25],
      [-53, -30.1],
    ],
    width: 1.6,
  },
  {
    points: [
      [24, 1],
      [24, -5],
    ],
    width: 6,
  },
  {
    points: [
      [23, 20],
      [23, 16],
    ],
    width: 2.6,
  },
  {
    points: [
      [-36, 35],
      [-36, 29.72],
    ],
    width: 1.3,
  },
  {
    points: [
      [-66, 17],
      [-72, 12],
      [-76, 8],
    ],
    width: 2,
  },
  {
    points: [
      [0, 52],
      [18, 53],
      [33, 52],
    ],
    width: 4.8,
    main: true,
  },
  {
    points: [
      [60, 6],
      [59, 18],
      [61, 38],
    ],
    width: 3.6,
  },
  {
    points: [
      [60, 6],
      [72, 4],
      [82, -3],
      [87, -5],
    ],
    width: 3,
  },
]
export function insideBuilding(x: number, z: number, margin = 0) {
  return CAMPUS_BUILDINGS.some(
    (b) => Math.abs(x - b.x) < b.width / 2 + margin && Math.abs(z - b.z) < b.depth / 2 + margin,
  )
}
const nearTrees: [number, number][] = [
  [-9, 32],
  [12, 32],
  [-13, 19],
  [14, 15],
  [-31, 10],
  [-36, -8],
  [40, 12],
  [47, 22],
  [-32, 43],
  [-65, 51],
]
export const CAMPUS_TREES = [
  ...Array.from({ length: 30 }, (_, i) => {
    const a = i * 2.399,
      r = 65 + (i % 5) * 8
    return [Math.sin(a) * r, Math.cos(a) * r] as [number, number]
  }),
  ...nearTrees,
].filter(
  ([x, z]) =>
    coastDistance(x, z) > 1.2 &&
    Math.hypot(x - 87, z + 13) > 11 &&
    !PARKING.some((b) => Math.abs(x - b.x) < b.hx + 3 && Math.abs(z - b.z) < b.hz + 3) &&
    !insideBuilding(x, z, 4) &&
    Math.hypot(x - 49, z + 16) > 16 &&
    (Math.abs(x - 61) > 37 || Math.abs(z + 78.333) > 40),
)
