export type BoxCollider = { x: number; z: number; hx: number; hz: number; angle?: number }
export const PLAYER_RADIUS = 0.24

/** Broad phase: test only obstacles in the current spatial cell, never scene triangles. */
export function createCollisionGrid(boxes: BoxCollider[], radius = PLAYER_RADIUS, cellSize = 8) {
  const cells = new Map<string, { box: BoxCollider; c: number; s: number }[]>()
  for (const box of boxes) {
    const c = Math.cos(box.angle ?? 0),
      s = Math.sin(box.angle ?? 0)
    const hx = Math.abs(c) * (box.hx + radius) + Math.abs(s) * (box.hz + radius)
    const hz = Math.abs(s) * (box.hx + radius) + Math.abs(c) * (box.hz + radius)
    const item = { box, c, s }
    for (
      let x = Math.floor((box.x - hx) / cellSize);
      x <= Math.floor((box.x + hx) / cellSize);
      x++
    ) {
      for (
        let z = Math.floor((box.z - hz) / cellSize);
        z <= Math.floor((box.z + hz) / cellSize);
        z++
      ) {
        const key = `${x},${z}`
        const bucket = cells.get(key)
        if (bucket) bucket.push(item)
        else cells.set(key, [item])
      }
    }
  }
  return (x: number, z: number) => {
    const nearby = cells.get(`${Math.floor(x / cellSize)},${Math.floor(z / cellSize)}`)
    if (!nearby) return true
    for (const { box, c, s } of nearby) {
      const dx = x - box.x,
        dz = z - box.z
      if (
        Math.abs(c * dx - s * dz) < box.hx + radius &&
        Math.abs(s * dx + c * dz) < box.hz + radius
      )
        return false
    }
    return true
  }
}

/** Sweep short segments with axis sliding; a slow frame cannot skip a thin wall. */
export function moveWithCollisions(
  p: { x: number; z: number },
  dx: number,
  dz: number,
  clear: (x: number, z: number) => boolean,
) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08))
  const sx = dx / steps,
    sz = dz / steps
  for (let i = 0; i < steps; i++) {
    if (clear(p.x + sx, p.z)) p.x += sx
    if (clear(p.x, p.z + sz)) p.z += sz
  }
}

/** Sampled road clearance indexed once for grass placement. Keeps the same authored margins. */
export function createRoadClearance(
  routes: { points: { x: number; z: number }[]; margin: number }[],
) {
  const cells = new Map<string, { x: number; z: number; radiusSquared: number }[]>()
  const cellSize = 8
  for (const { points, margin } of routes)
    for (const p of points) {
      const item = { x: p.x, z: p.z, radiusSquared: margin * margin }
      for (
        let x = Math.floor((p.x - margin) / cellSize);
        x <= Math.floor((p.x + margin) / cellSize);
        x++
      ) {
        for (
          let z = Math.floor((p.z - margin) / cellSize);
          z <= Math.floor((p.z + margin) / cellSize);
          z++
        ) {
          const key = `${x},${z}`,
            bucket = cells.get(key)
          if (bucket) bucket.push(item)
          else cells.set(key, [item])
        }
      }
    }
  return (x: number, z: number) =>
    !(cells.get(`${Math.floor(x / cellSize)},${Math.floor(z / cellSize)}`) ?? []).some(
      (p) => (p.x - x) ** 2 + (p.z - z) ** 2 < p.radiusSquared,
    )
}
