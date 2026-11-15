import { TOOL_COLLIDERS } from '../tools/toolLayout'
import { OBSERVATORY_COLLIDERS } from '../observatoryLayout'
import { createCollisionGrid, type BoxCollider } from './collision'

// Shared by renderers and navigation: changing an object location also moves its collision.
export const RAILS = [
  [-11, 40, -0.12],
  [-20, 43, -0.3],
  [-32, 47, -0.1],
  [6, 49, Math.PI / 2],
  [6, 55, Math.PI / 2],
]
export const CABINETS = [
  [8, 20],
  [-30, 15],
  [-57, -23],
  [30, 4],
]
export const BENCHES = [
  [-8, 23, 0.35],
  [12, 22, -0.35],
  [-73, 8, -Math.PI / 2],
]
export const CHAIRS = [
  [-30, 33, 0.2],
  [-28, 33, -0.2],
]
export const BINS = [
  [-10, 24],
  [10, 24],
  [41, 47],
  [-72, 12],
]
export const LAMPS = [
  [-4, 38],
  [4, 48],
  [-4, 16],
  [13, 9],
  [-32, 11],
  [-44, -9],
  [41, 4],
  [61, -23],
  [-26, 46],
  [-70, 16],
]
export const PROP_COLLIDERS: BoxCollider[] = [
  ...OBSERVATORY_COLLIDERS,
  ...TOOL_COLLIDERS,
  ...RAILS.map(([x, z, angle]) => ({ x, z, angle, hx: 2.2, hz: 0.08 })),
  ...CABINETS.map(([x, z], i) => ({ x, z, angle: i * 0.7, hx: 0.425, hz: 0.21 })),
  ...BENCHES.map(([x, z, angle]) => ({ x, z, angle, hx: 0.95, hz: 0.35 })),
  ...CHAIRS.map(([x, z, angle]) => ({ x, z, angle, hx: 0.3, hz: 0.3 })),
  ...BINS.map(([x, z]) => ({ x, z, hx: 0.3, hz: 0.3 })),
  ...LAMPS.map(([x, z]) => ({ x, z, hx: 0.22, hz: 0.22 })),
  // Existing procedural objects: gateway posts, telescope, consoles, service carts, NPC.
  ...[-7, 7].map((x) => ({ x, z: 57, hx: 0.2, hz: 0.2 })),
  { x: 6, z: 20, hx: 0.05, hz: 0.05 },
  { x: -51, z: 42, hx: 0.25, hz: 0.25 },
  { x: 18, z: -11, hx: 0.7, hz: 0.325 },
  { x: 61, z: -35, hx: 0.65, hz: 0.275 },
  ...[31, 34].map((x) => ({ x, z: -3, hx: 0.65, hz: 0.45 })),
  { x: -18.4, z: -3, hx: 0.28, hz: 0.2 },
  // Observatory benches; sitting is handled by the interaction controller.
  { x: -55, z: 43, hx: 0.9, hz: 0.3, angle: 0.6 },
  { x: -47, z: 43, hx: 0.9, hz: 0.3, angle: -0.6 },
]
export const propsClear = createCollisionGrid(PROP_COLLIDERS)
