import { lineClear } from '../../robot/followerRoute'

export type RoutePoint = { x: number; z: number }
type Clear = (x: number, z: number) => boolean
const STEP = 0.5,
  LIMIT = 120,
  HALF = LIMIT / STEP,
  WIDTH = HALF * 2 + 1
const key = (x: number, z: number) => (z + HALF) * WIDTH + x + HALF
const point = (id: number): RoutePoint => ({
  x: ((id % WIDTH) - HALF) * STEP,
  z: (Math.floor(id / WIDTH) - HALF) * STEP,
})

class OpenNodes {
  private items: { id: number; score: number }[] = []
  get size() {
    return this.items.length
  }
  push(id: number, score: number) {
    const item = { id, score }
    let index = this.items.length
    this.items.push(item)
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.items[parent].score <= score) break
      this.items[index] = this.items[parent]
      index = parent
    }
    this.items[index] = item
  }
  pop() {
    const result = this.items[0]
    const last = this.items.pop()!
    if (this.items.length) {
      let index = 0
      while (index * 2 + 1 < this.items.length) {
        let next = index * 2 + 1
        if (next + 1 < this.items.length && this.items[next + 1].score < this.items[next].score)
          next++
        if (this.items[next].score >= last.score) break
        this.items[index] = this.items[next]
        index = next
      }
      this.items[index] = last
    }
    return result.id
  }
}

/** Cached walkability uses the same walls, furniture and trees as the player. */
export function createMissionRouter(
  clear: Clear,
  onRoad: (x: number, z: number) => boolean = () => false,
) {
  const cells = new Map<number, boolean>()
  const roads = new Map<number, boolean>()
  const edges = new Map<string, boolean>()
  const walkable = (x: number, z: number) => {
    if (Math.abs(x) > HALF || Math.abs(z) > HALF) return false
    const id = key(x, z)
    let result = cells.get(id)
    if (result === undefined) {
      result = clear(x * STEP, z * STEP)
      cells.set(id, result)
    }
    return result
  }
  const anchor = (p: RoutePoint) => {
    const x = Math.round(p.x / STEP),
      z = Math.round(p.z / STEP)
    const candidates: { id: number; distance: number }[] = []
    for (let dz = -2; dz <= 2; dz++)
      for (let dx = -2; dx <= 2; dx++) {
        if (!walkable(x + dx, z + dz)) continue
        const id = key(x + dx, z + dz),
          node = point(id)
        if (lineClear(p, node, clear))
          candidates.push({ id, distance: Math.hypot(p.x - node.x, p.z - node.z) })
      }
    return candidates.sort((a, b) => a.distance - b.distance)[0]?.id
  }
  return (from: RoutePoint, to: RoutePoint): RoutePoint[] => {
    if (!clear(from.x, from.z) || !clear(to.x, to.z)) return []
    if (Math.hypot(from.x - to.x, from.z - to.z) < 5 && lineClear(from, to, clear))
      return [{ ...from }, { ...to }]
    const start = anchor(from),
      end = anchor(to)
    if (start === undefined || end === undefined) return []
    const open = new OpenNodes(),
      previous = new Map<number, number>(),
      costs = new Map([[start, 0]]),
      closed = new Set<number>()
    const heuristic = (p: RoutePoint) => Math.hypot(p.x - to.x, p.z - to.z)
    open.push(start, 1.6 * heuristic(point(start)))
    let searched = 0
    while (open.size && searched++ < 20000) {
      const id = open.pop()
      if (closed.has(id)) continue
      if (id === end) {
        const result: RoutePoint[] = [point(end)]
        let cursor = end
        while (previous.has(cursor)) {
          cursor = previous.get(cursor)!
          result.push(point(cursor))
        }
        result.reverse()
        return [{ ...from }, ...result, { ...to }].filter(
          (p, i, a) => !i || Math.hypot(p.x - a[i - 1].x, p.z - a[i - 1].z) > 0.001,
        )
      }
      closed.add(id)
      const at = point(id),
        x = Math.round(at.x / STEP),
        z = Math.round(at.z / STEP)
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if ((!dx && !dz) || !walkable(x + dx, z + dz)) continue
          if (dx && dz && (!walkable(x + dx, z) || !walkable(x, z + dz))) continue
          const nextId = key(x + dx, z + dz),
            next = point(nextId)
          if (closed.has(nextId)) continue
          const edgeKey = id < nextId ? `${id}:${nextId}` : `${nextId}:${id}`
          let edge = edges.get(edgeKey)
          if (edge === undefined) {
            edge = lineClear(at, next, clear)
            edges.set(edgeKey, edge)
          }
          if (!edge) continue
          let road = roads.get(nextId)
          if (road === undefined) {
            road = onRoad(next.x, next.z)
            roads.set(nextId, road)
          }
          const score = costs.get(id)! + STEP * Math.hypot(dx, dz) * (road ? 1 : 1.3)
          if (score >= (costs.get(nextId) ?? Infinity)) continue
          costs.set(nextId, score)
          previous.set(nextId, id)
          open.push(nextId, score + 1.6 * heuristic(next))
        }
    }
    // Never draw a direct shortcut through an obstacle when a route cannot be found.
    return []
  }
}

export function projectOnRoute(path: RoutePoint[], p: RoutePoint) {
  let best = { along: 0, distance: Infinity, remaining: 0 }
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i],
      dx = b.x - a.x,
      dz = b.z - a.z,
      length = Math.hypot(dx, dz)
    const t = length
      ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (length * length)))
      : 0
    const distance = Math.hypot(p.x - a.x - t * dx, p.z - a.z - t * dz)
    if (distance < best.distance) best = { along: total + t * length, distance, remaining: 0 }
    total += length
  }
  best.remaining = Math.max(0, total - best.along)
  return best
}

export function sampleRoute(path: RoutePoint[], distance: number) {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i],
      length = Math.hypot(b.x - a.x, b.z - a.z)
    if (distance <= length) {
      const t = length ? Math.max(0, distance) / length : 0
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }
    }
    distance -= length
  }
  return path.at(-1)
}

export function relativeGuideAngle(
  from: RoutePoint,
  to: RoutePoint,
  forward: RoutePoint,
  previous = 0,
) {
  const desired = Math.atan2(to.x - from.x, -(to.z - from.z)) - Math.atan2(forward.x, -forward.z)
  return previous + Math.atan2(Math.sin(desired - previous), Math.cos(desired - previous))
}
