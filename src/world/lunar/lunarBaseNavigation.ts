import * as T from 'three'
import layout from './lunarBaseLayout.json'

export const LUNAR_BASE_LAYOUT = layout
export type LunarDoorCollision = {
  inverse: T.Matrix4
  bounds: T.Box3
  closedInverse: T.Matrix4
  closedBounds: T.Box3
  fraction: number
}
export const lunarDoors = new Map<string, LunarDoorCollision>()
const probe = new T.Vector3()
function cell(x: number, z: number) {
  const ix = Math.round((x - layout.minX) / layout.step),
    iz = Math.round((z - layout.minZ) / layout.step)
  return ix < 0 || iz < 0 || ix >= layout.columns || iz >= layout.rows ? null : { ix, iz }
}
export function lunarBaseFloor(x: number, z: number) {
  const point = cell(x, z)
  if (!point) return null
  const height = layout.heights[point.iz * layout.columns + point.ix]
  return height === -9999 ? null : height / 1000
}
export function lunarRoomAt(x: number, z: number) {
  const point = cell(x, z)
  if (!point) return null
  const code = layout.rooms[point.iz][point.ix]
  return code === 'h'
    ? 'lunar-habitat'
    : code === 'l'
      ? 'lunar-lab'
      : code === 's'
        ? 'lunar-storage'
        : code === 'c'
          ? 'lunar-corridor'
          : null
}
function hitsDoor(x: number, y: number, z: number, inverse: T.Matrix4, box: T.Box3) {
  probe.set(x, y, z).applyMatrix4(inverse)
  return (
    probe.x > box.min.x - layout.radius &&
    probe.x < box.max.x + layout.radius &&
    probe.z > box.min.z - layout.radius &&
    probe.z < box.max.z + layout.radius
  )
}
export function lunarBaseClear(x: number, z: number) {
  const point = cell(x, z)
  if (!point) return true
  if (layout.blocked[point.iz][point.ix] === '1') return false
  const y = (lunarBaseFloor(x, z) ?? -0.1) + 1
  for (const door of lunarDoors.values()) {
    if (door.fraction < 0.999 && hitsDoor(x, y, z, door.closedInverse, door.closedBounds))
      return false
    if (hitsDoor(x, y, z, door.inverse, door.bounds)) return false
  }
  return true
}
