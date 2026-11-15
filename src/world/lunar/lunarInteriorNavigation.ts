import data from './lunarInteriors.json'

type Door = (typeof data.doors)[number]
export type LunarDoorState = { progress: number; open: boolean }
export type LunarDoors = Map<string, LunarDoorState>

export const lunarInteriorInstances = data.instances
export const lunarDoors = data.doors
export const lunarExteriorObjects = data.exteriorObjects
const zoneNames = ['', '', 'HAB-L01', 'LAB-L01', 'STO-L01', 'Pasillo presurizable']
const heights = new DataView(Uint8Array.from(atob(data.deck), (c) => c.charCodeAt(0)).buffer)
const zones = Uint8Array.from(atob(data.zones), (c) => c.charCodeAt(0))
export const LUNAR_HAB_CHECKPOINT: [number, number] = [63.52, 78.9]

export function lunarDeckAt(x: number, z: number) {
  const gx = (x - data.minX) / data.step
  const gz = (z - data.minZ) / data.step
  const i = Math.round(gx)
  const j = Math.round(gz)
  if (i < 0 || i >= data.columns || j < 0 || j >= data.rows) return null
  const index = j * data.columns + i
  if (!zones[index]) return null
  let height = heights.getInt16(index * 2, true) / 1000
  const left = Math.floor(gx),
    top = Math.floor(gz)
  if (left >= 0 && left < data.columns - 1 && top >= 0 && top < data.rows - 1) {
    const k = top * data.columns + left
    const samples = [k, k + 1, k + data.columns, k + data.columns + 1]
    if (samples.every((n) => zones[n])) {
      const [a, b, c, d] = samples.map((n) => heights.getInt16(n * 2, true) / 1000)
      const u = gx - left,
        v = gz - top
      height = (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
    }
  }
  return { height, room: zoneNames[zones[index]] || null }
}

function doorContains(door: Door, progress: number, x: number, z: number, margin = 0.285) {
  const [px, , pz] = door.pivot
  const rotation = progress * door.rotation
  const c = Math.cos(rotation),
    s = Math.sin(rotation)
  const u = px + (x - px) * c - (z - pz) * s - door.center[0]
  const v = pz + (x - px) * s + (z - pz) * c - door.center[2]
  const vX = door.center[0] - px,
    vZ = door.center[2] - pz
  const length = Math.hypot(vX, vZ)
  return (
    Math.abs((u * vX + v * vZ) / length) < door.width / 2 + margin &&
    Math.abs((v * vX - u * vZ) / length) < door.depth / 2 + margin
  )
}

export function clearLunarDoors(doors: LunarDoors, x: number, z: number) {
  return lunarDoors.every((door) => {
    const progress = doors.get(door.id)?.progress ?? 0
    return (
      (progress === 1 || !doorContains(door, 0, x, z)) &&
      (progress === 0 || !doorContains(door, progress, x, z))
    )
  })
}

export function nearbyLunarDoor(doors: LunarDoors, x: number, z: number) {
  return lunarDoors.find(
    (door) =>
      doors.has(door.id) &&
      (Math.hypot(x - door.outside[0], z - door.outside[2]) <
        (door.label === 'HAB-L01' ? 2.25 : 1.72) ||
        Math.hypot(x - door.inside[0], z - door.inside[2]) < 1.56 ||
        Math.hypot(x - door.center[0], z - door.center[2]) < 1.35),
  )
}

export function lunarDoorSweepClear(door: Door, x: number, z: number, padding = 0.285) {
  return [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].every(
    (progress) => !doorContains(door, progress, x, z, padding),
  )
}

export function lunarCabinSealed(doors: LunarDoors) {
  return (
    doors.size === lunarDoors.length &&
    [...doors.values()].every((door) => door.progress === 0 && !door.open)
  )
}
