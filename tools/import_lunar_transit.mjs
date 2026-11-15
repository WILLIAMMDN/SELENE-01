import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import * as T from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const folder = resolve(root, 'public/models/lunar/transitable')
const layout = JSON.parse(
  readFileSync(resolve(folder, 'base_lunar_layout_transitable.json'), 'utf8'),
)
const oldLayout = JSON.parse(
  readFileSync(resolve(root, 'src/world/lunar/lunarLayout.json'), 'utf8'),
)
const load = async (path) => {
  const data = readFileSync(path)
  return new GLTFLoader().parseAsync(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    '',
  )
}
const scene = new T.Group(),
  instances = [],
  doors = [],
  refs = []
for (const item of layout.instances) {
  const asset = layout.assets[item.asset]
  if (asset.file.startsWith('../')) continue // The existing scene already supplies PWR-L01.
  const gltf = await load(resolve(folder, asset.file))
  const group = new T.Group()
  group.name = item.id
  group.position.fromArray(item.position)
  group.quaternion.fromArray(item.quaternion)
  group.scale.fromArray(item.scale)
  group.add(gltf.scene)
  scene.add(group)
  instances.push({ item, group })
  scene.updateMatrixWorld(true)
  for (const name of [
    ...(asset.referenceNodes ?? []),
    ...(asset.interactionNodes ?? []),
    ...asset.ports,
  ]) {
    const node = group.getObjectByName(name)
    if (node)
      refs.push({
        instance: item.id,
        name,
        position: node
          .getWorldPosition(new T.Vector3())
          .toArray()
          .map((n) => +n.toFixed(5)),
      })
  }
  if (asset.door) doors.push({ instance: item.id, ...asset.door })
}

const old = await load(resolve(root, 'public/models/lunar/lunar_base.glb'))
old.scene.updateMatrixWorld(true)
const replacedColliderIndices = []
for (const { item } of instances) {
  const node = old.scene.getObjectByName(item.id)
  if (!node) throw Error(`Missing previous instance ${item.id}`)
  const box = new T.Box3().setFromObject(node),
    centre = box.getCenter(new T.Vector3()),
    size = box.getSize(new T.Vector3())
  const index = oldLayout.colliders.findIndex(
    (c) =>
      Math.abs(c.x - centre.x) < 0.05 &&
      Math.abs(c.z - centre.z) < 0.05 &&
      Math.abs(c.hx - size.x / 2) < 0.08 &&
      Math.abs(c.hz - size.z / 2) < 0.08,
  )
  if (index < 0)
    throw Error(
      `Missing old collider for ${item.id}: ${JSON.stringify({ centre: centre.toArray(), size: size.toArray(), nearby: oldLayout.colliders.filter((c) => Math.hypot(c.x - centre.x, c.z - centre.z) < 3) })}`,
    )
  replacedColliderIndices.push(index)
}

const allBounds = new T.Box3().setFromObject(scene)
const minX = Math.floor(allBounds.min.x - 1),
  minZ = Math.floor(allBounds.min.z - 1),
  step = 0.08
const columns = Math.ceil((allBounds.max.x + 1 - minX) / step) + 1
const rows = Math.ceil((allBounds.max.z + 1 - minZ) / step) + 1
const obstacles = new Map(),
  floors = []
const a = new T.Vector3(),
  b = new T.Vector3(),
  c = new T.Vector3()
const roomCode = { 'HAB-L01': 'h', 'LAB-L01': 'l', 'STO-L01': 's' }
for (const { item, group } of instances) {
  group.traverse((node) => {
    if (!node.isMesh) return
    // Door leaves are checked from their animated transforms at runtime.
    for (let parent = node; parent && parent !== group; parent = parent.parent)
      if (/HOJA/.test(parent.name)) return
    let name = node.name
    for (let parent = node.parent; parent && parent !== group; parent = parent.parent)
      name += ` ${parent.name}`
    const floor = /PISO|SUELO_CONTINUO|HUELLA_CONTINUA|RAMPA_ACCESO|ESCALERA_ORIGINAL/.test(name)
    const geometry = node.geometry,
      positions = geometry.getAttribute('position'),
      index = geometry.index
    const count = index ? index.count : positions.count
    for (let i = 0; i < count; i += 3) {
      a.fromBufferAttribute(positions, index ? index.getX(i) : i).applyMatrix4(node.matrixWorld)
      b.fromBufferAttribute(positions, index ? index.getX(i + 1) : i + 1).applyMatrix4(
        node.matrixWorld,
      )
      c.fromBufferAttribute(positions, index ? index.getX(i + 2) : i + 2).applyMatrix4(
        node.matrixWorld,
      )
      const triangle = new T.Triangle(a.clone(), b.clone(), c.clone())
      const box = new T.Box3().setFromPoints([a, b, c])
      const entry = {
        triangle,
        box,
        room: /RAMPA|ESCALERA|HUELLA/.test(name) ? '.' : (roomCode[item.asset] ?? 'c'),
      }
      if (floor) {
        if (triangle.getNormal(new T.Vector3()).y > 0.45) floors.push(entry)
      } else {
        for (let x = Math.floor(box.min.x); x <= Math.floor(box.max.x); x++)
          for (let z = Math.floor(box.min.z); z <= Math.floor(box.max.z); z++) {
            const key = `${x},${z}`,
              bucket = obstacles.get(key)
            if (bucket) bucket.push(entry)
            else obstacles.set(key, [entry])
          }
      }
    }
  })
}

const grid = oldLayout.terrain
function ground(x, z) {
  const gx = Math.max(0, Math.min(grid.columns - 1.001, (x - grid.minX) / grid.step))
  const gz = Math.max(0, Math.min(grid.rows - 1.001, (z - grid.minZ) / grid.step))
  const ix = Math.floor(gx),
    iz = Math.floor(gz),
    tx = gx - ix,
    tz = gz - iz
  const h = (dx, dz) => grid.heights[(iz + dz) * grid.columns + ix + dx]
  return (h(0, 0) * (1 - tx) + h(1, 0) * tx) * (1 - tz) + (h(0, 1) * (1 - tx) + h(1, 1) * tx) * tz
}
// Closest distance between two finite line segments, including parallel edges.
function segmentDistance(p1, q1, p2, q2) {
  const d1 = q1.clone().sub(p1),
    d2 = q2.clone().sub(p2),
    r = p1.clone().sub(p2)
  const aa = d1.lengthSq(),
    ee = d2.lengthSq(),
    ff = d2.dot(r)
  let s = 0,
    t = 0
  if (aa <= 1e-12 && ee <= 1e-12) return r.lengthSq()
  if (aa <= 1e-12) t = T.MathUtils.clamp(ff / ee, 0, 1)
  else {
    const cc = d1.dot(r)
    if (ee <= 1e-12) s = T.MathUtils.clamp(-cc / aa, 0, 1)
    else {
      const bb = d1.dot(d2),
        denominator = aa * ee - bb * bb
      if (denominator) s = T.MathUtils.clamp((bb * ff - cc * ee) / denominator, 0, 1)
      t = (bb * s + ff) / ee
      if (t < 0) {
        t = 0
        s = T.MathUtils.clamp(-cc / aa, 0, 1)
      } else if (t > 1) {
        t = 1
        s = T.MathUtils.clamp((bb - cc) / aa, 0, 1)
      }
    }
  }
  return r.addScaledVector(d1, s).addScaledVector(d2, -t).lengthSq()
}
const radius = layout.walkability.capsuleMeters.diameter / 2
const capsuleHeight = layout.walkability.capsuleMeters.height
const ray = new T.Ray(),
  hit = new T.Vector3(),
  closest = new T.Vector3()
const down = new T.Vector3(0, -1, 0),
  up = new T.Vector3(0, 1, 0)
const low = new T.Vector3(),
  high = new T.Vector3()
const heights = [],
  blocked = [],
  rooms = []
for (let iz = 0; iz < rows; iz++) {
  let blockedRow = '',
    roomRow = ''
  for (let ix = 0; ix < columns; ix++) {
    const x = minX + ix * step,
      z = minZ + iz * step
    let y = ground(x, z),
      floorY = null,
      room = '.'
    ray.set(new T.Vector3(x, 4, z), down)
    for (const entry of floors) {
      if (x < entry.box.min.x || x > entry.box.max.x || z < entry.box.min.z || z > entry.box.max.z)
        continue
      if (
        ray.intersectTriangle(entry.triangle.a, entry.triangle.b, entry.triangle.c, false, hit) &&
        hit.y >= y - 0.08 &&
        hit.y < y + 1.4 &&
        (floorY === null || hit.y > floorY)
      ) {
        floorY = hit.y
        room = entry.room
      }
    }
    if (floorY !== null) y = floorY
    heights.push(floorY === null ? -9999 : Math.round(floorY * 1000))
    low.set(x, y + radius + 0.015, z)
    high.set(x, y + capsuleHeight - radius, z)
    ray.set(low, up)
    let collision = false
    const checked = new Set()
    for (let cx = Math.floor(x - radius); cx <= Math.floor(x + radius) && !collision; cx++)
      for (let cz = Math.floor(z - radius); cz <= Math.floor(z + radius) && !collision; cz++)
        for (const entry of obstacles.get(`${cx},${cz}`) ?? []) {
          if (checked.has(entry)) continue
          checked.add(entry)
          const box = entry.box,
            tri = entry.triangle
          if (
            box.max.y < y + 0.02 ||
            box.min.y > y + capsuleHeight ||
            box.max.x < x - radius ||
            box.min.x > x + radius ||
            box.max.z < z - radius ||
            box.min.z > z + radius
          )
            continue
          if (
            (ray.intersectTriangle(tri.a, tri.b, tri.c, false, hit) && hit.y <= high.y) ||
            tri.closestPointToPoint(low, closest).distanceToSquared(low) < radius ** 2 ||
            tri.closestPointToPoint(high, closest).distanceToSquared(high) < radius ** 2 ||
            segmentDistance(low, high, tri.a, tri.b) < radius ** 2 ||
            segmentDistance(low, high, tri.b, tri.c) < radius ** 2 ||
            segmentDistance(low, high, tri.c, tri.a) < radius ** 2
          ) {
            collision = true
            break
          }
        }
    blockedRow += collision ? '1' : '0'
    roomRow += room
  }
  blocked.push(blockedRow)
  rooms.push(roomRow)
}
const data = {
  minX,
  minZ,
  step,
  columns,
  rows,
  radius,
  capsuleHeight,
  heights,
  blocked,
  rooms,
  refs,
  replacedInstances: instances.map(({ item }) => item.id),
  replacedColliderIndices,
  doors,
}
writeFileSync(resolve(root, 'src/world/lunar/lunarBaseLayout.json'), JSON.stringify(data))
console.log(
  JSON.stringify({
    columns,
    rows,
    triangles: floors.length,
    replacedColliderIndices,
    refs: refs.length,
    bytes: JSON.stringify(data).length,
  }),
)
