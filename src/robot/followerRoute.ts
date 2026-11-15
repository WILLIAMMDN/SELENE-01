type Point = { x: number; z: number }
type Clear = (x: number, z: number) => boolean
export function lineClear(from: Point, to: Point, clear: Clear) {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / 0.08))
  for (let i = 1; i <= steps; i++)
    if (!clear(from.x + ((to.x - from.x) * i) / steps, from.z + ((to.z - from.z) * i) / steps))
      return false
  return true
}
/** Follow the crew's traversed route when a wall hides the preferred side offset. */
export class FollowerRoute {
  private trail: Point[] = []
  reset(player: Point) {
    const first = this.trail[0] ?? { x: player.x, z: player.z }
    first.x = player.x
    first.z = player.z
    this.trail[0] = first
    this.trail.length = 1
  }
  target(body: Point, player: Point, preferred: Point, clear: Clear): Point {
    const last = this.trail.at(-1)
    if (!last || Math.hypot(player.x - last.x, player.z - last.z) > 0.35) {
      // Bound memory even when the crew leaves a stationary companion far behind.
      if (this.trail.length < 512 && clear(player.x, player.z))
        this.trail.push({ x: player.x, z: player.z })
    }
    if (lineClear(body, preferred, clear)) {
      if (lineClear(body, player, clear)) this.reset(player)
      return preferred
    }
    while (
      this.trail.length > 1 &&
      Math.hypot(body.x - this.trail[0].x, body.z - this.trail[0].z) < 0.2
    )
      this.trail.shift()
    return this.trail[0] ?? player
  }
}
