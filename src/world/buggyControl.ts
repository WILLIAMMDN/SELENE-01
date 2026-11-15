// Authored buggy: 2.04 m wide, 3.33 m long; heading faces local +Z.
// A campus speed limit, not a simulation of a particular production vehicle.
export const BUGGY_HOME = { x: 4.5, z: 34, yaw: Math.PI }
export const buggy = { ...BUGGY_HOME, speed: 0, driving: false, distance: 0, steer: 0 }
export const BUGGY_HALF = { x: 1.05, z: 1.8 }
type Clear = (x: number, z: number) => boolean
type Height = (x: number, z: number) => number

export function outsideBuggy(x: number, z: number, margin = 0.24) {
  const dx = x - buggy.x,
    dz = z - buggy.z
  const c = Math.cos(buggy.yaw),
    s = Math.sin(buggy.yaw)
  return (
    Math.abs(c * dx - s * dz) >= BUGGY_HALF.x + margin ||
    Math.abs(s * dx + c * dz) >= BUGGY_HALF.z + margin
  )
}
export function nearBuggy(x: number, z: number) {
  return Math.hypot(x - buggy.x, z - buggy.z) < 3.1
}

// Sample the entire body, not just its centre. The existing pedestrian clearance
// adds a small buffer. Short sweeps stop the vehicle at walls without sideways sliding.
function fits(x: number, z: number, yaw: number, clear: Clear, height: Height) {
  const c = Math.cos(yaw),
    s = Math.sin(yaw),
    base = height(x, z)
  for (let ix = -3; ix <= 3; ix++)
    for (let iz = -5; iz <= 5; iz++) {
      const lx = (ix * BUGGY_HALF.x) / 3,
        lz = (iz * BUGGY_HALF.z) / 5
      const px = x + c * lx + s * lz,
        pz = z - s * lx + c * lz
      if (!clear(px, pz) || Math.abs(height(px, pz) - base) > 0.4) return false
    }
  return true
}
export function driveBuggy(keys: Set<string>, dt: number, clear: Clear, height: Height) {
  const forward = keys.has('KeyW') || keys.has('ArrowUp')
  const reverse = keys.has('KeyS') || keys.has('ArrowDown')
  const boost = keys.has('ShiftLeft') || keys.has('ShiftRight')
  const brake = keys.has('Space') || (forward && reverse)
  // Higher velocity on Earth campus roads: standard 16.5 m/s (59.4 km/h), boost 26.0 m/s (93.6 km/h)
  const topSpeed = boost ? 26.0 : 16.5
  const target = brake ? 0 : forward ? topSpeed : reverse ? -7.5 : 0
  const decelerating = target === 0 || target * buggy.speed < 0
  const change = (brake ? 18 : decelerating ? 11 : boost ? 11.5 : 8.5) * dt
  buggy.speed += Math.max(-change, Math.min(change, target - buggy.speed))
  const steer =
    Number(keys.has('KeyD') || keys.has('ArrowRight')) -
    Number(keys.has('KeyA') || keys.has('ArrowLeft'))
  const speedFactor = Math.max(0.48, 1 - Math.abs(buggy.speed) / 36)
  const maxSteerAngle = 0.52 * speedFactor
  buggy.steer += (steer * maxSteerAngle - buggy.steer) * Math.min(1, dt * 9)
  if (Math.abs(buggy.speed) < 0.0001) {
    buggy.speed = 0
    return 0
  }
  const turn = -((Math.tan(buggy.steer) * buggy.speed) / 2.1) * dt
  const steps = Math.max(1, Math.ceil(Math.abs(buggy.speed * dt) / 0.08))
  const before = buggy.yaw
  for (let i = 0; i < steps; i++) {
    const yaw = buggy.yaw + turn / steps
    const dx = (Math.sin(yaw) * buggy.speed * dt) / steps
    const dz = (Math.cos(yaw) * buggy.speed * dt) / steps
    if (!fits(buggy.x + dx, buggy.z + dz, yaw, clear, height)) {
      buggy.speed = 0
      break
    }
    buggy.x += dx
    buggy.z += dz
    buggy.yaw = yaw
    buggy.distance += (buggy.speed * dt) / steps
  }
  return buggy.yaw - before
}
export function buggyExit(clear: Clear) {
  for (const radius of [2.1, 2.7, 3.3])
    for (const angle of [Math.PI / 2, -Math.PI / 2, Math.PI, 0, 2.4, -2.4]) {
      const x = buggy.x + Math.sin(buggy.yaw + angle) * radius
      const z = buggy.z + Math.cos(buggy.yaw + angle) * radius
      if (!outsideBuggy(x, z, 0.4) || !clear(x, z)) continue
      let pathClear = true
      const samples = Math.ceil(radius / 0.12)
      for (let i = 1; i <= samples; i++) {
        if (
          !clear(buggy.x + ((x - buggy.x) * i) / samples, buggy.z + ((z - buggy.z) * i) / samples)
        ) {
          pathClear = false
          break
        }
      }
      if (!pathClear) continue
      // Keep space around the dismount point, including behind the player.
      if (
        [
          [0.2, 0],
          [-0.2, 0],
          [0, 0.2],
          [0, -0.2],
        ].every(([dx, dz]) => clear(x + dx, z + dz))
      )
        return { x, z }
    }
  return null
}
