/** Copy the six supplied models and bake a fine navigation grid from their actual geometry.
 * Usage: node tools/import_lunar_interiors.mjs <ODYSSEY_BASE_TRANSITABLE_FINAL directory>
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Box3, Group, Raycaster, Triangle, Vector3 } from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { Octree } from 'three/addons/math/Octree.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const project = fileURLToPath(new URL('../', import.meta.url))
if (!process.argv[2]) throw new Error('Indica la carpeta de los modelos transitables.')
const source = resolve(process.argv[2])
const layoutName = 'base_lunar_layout_transitable.json'
const layout = JSON.parse(await readFile(join(source, layoutName), 'utf8'))
const instances = layout.instances.filter(({ asset }) => asset !== 'PWR-L01')
const target = join(project, 'public', 'models', 'lunar', 'interiors')
await mkdir(target, { recursive: true })
const loader = new GLTFLoader()
const models = new Map()
for (const key of new Set(instances.map(({ asset }) => asset))) {
  const file = layout.assets[key].file
  const buffer = await readFile(join(source, file))
  const { scene } = await loader.parseAsync(Uint8Array.from(buffer).buffer, '')
  models.set(key, scene)
  await copyFile(join(source, file), join(target, file))
}

const floors = []
const doors = []
const octree = new Octree()
const exteriorObjects = []
const navigationBounds = new Box3()
const worldVector = new Vector3()
const round = (n) => +n.toFixed(5)
function markPosition(node) {
  return node.getWorldPosition(worldVector).toArray().map(round)
}

for (const placement of instances) {
  const spec = layout.assets[placement.asset]
  const instance = new Group()
  instance.position.fromArray(placement.position)
  instance.quaternion.fromArray(placement.quaternion)
  instance.scale.fromArray(placement.scale)
  const model = models.get(placement.asset).clone(true)
  instance.add(model)
  instance.updateMatrixWorld(true)
  const prefix = placement.asset.split('-')[0]
  if (spec.door) {
    const { door } = spec
    const left = model.getObjectByName(door.closedCollider)
    const pivot = model.getObjectByName(door.pivot)
    const exterior = model.getObjectByName(door.outside)
    const interior = model.getObjectByName(door.inside)
    const length = left.userData[door.colliderDimensionsExtra][0]
    doors.push({
      id: placement.id,
      label: placement.asset,
      clip: door.openingClip,
      center: markPosition(left),
      pivot: markPosition(pivot),
      outside: markPosition(exterior),
      inside: markPosition(interior),
      width: round(length),
      depth: round(left.userData[door.colliderDimensionsExtra][2]),
      rotation: pivot.userData.apertura_z_local_grados > 0 ? Math.PI / 2 : -Math.PI / 2,
    })
  }

  instance.traverse((object) => {
    if (!object.isMesh) return
    const name = object.name
    const isFloor = /PISO|SUELO_CONTINUO|RAMPA_ACCESO|HUELLA_CONTINUA/.test(name)
    const isExterior = /CONTENEDOR_0[123]_CHASIS|ZAPATA_0[1234]/.test(name)
    const isShell = /CASCO|CUELLO|TRANSICIONES|JAMBAS|DINTEL|TESTERO|BARANDILLAS/.test(name)
    const equipment = /_INTERIOR_(EQUIPO|CONTENEDOR|LITERA)|ESTACION_ESTRUCTURA/.test(name)
    if (isFloor) {
      floors.push({ mesh: object, module: prefix, ramp: /RAMPA|HUELLA/.test(name), placement })
      navigationBounds.union(new Box3().setFromObject(object))
    }
    if (isExterior && !name.includes('_INTERIOR_')) {
      const b = new Box3().setFromObject(object)
      if (b.max.y - b.min.y > 0.4) {
        const c = b.getCenter(new Vector3())
        const size = b.getSize(new Vector3())
        exteriorObjects.push({ x: round(c.x), z: round(c.z), hx: round(size.x / 2), hz: round(size.z / 2) })
      }
    }
    if (!isShell && !equipment) return
    const geometry = object.geometry
    const vertices = geometry.getAttribute('position')
    const index = geometry.getIndex()
    const vertex = (i) => new Vector3().fromBufferAttribute(vertices, index ? index.getX(i) : i).applyMatrix4(object.matrixWorld)
    for (let i = 0; i < (index?.count ?? vertices.count); i += 3) {
      const triangle = new Triangle(vertex(i), vertex(i + 1), vertex(i + 2))
      if (triangle.getArea() > 1e-8) octree.addTriangle(triangle)
    }
  })
}
octree.build()

const step = 0.06
const minX = round(Math.floor((navigationBounds.min.x - step) / step) * step)
const minZ = round(Math.floor((navigationBounds.min.z - step) / step) * step)
const columns = Math.ceil((navigationBounds.max.x - minX) / step) + 2
const rows = Math.ceil((navigationBounds.max.z - minZ) / step) + 2
const heights = new Int16Array(columns * rows).fill(-32768)
const zones = new Uint8Array(columns * rows)
const ray = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 4)
const radius = .285
const capsule = new Capsule(new Vector3(), new Vector3(), radius)
const modules = ['HAB', 'LAB', 'STO', 'COR']
for (let j = 0; j < rows; j++) {
  for (let i = 0; i < columns; i++) {
    const x = minX + i * step
    const z = minZ + j * step
    let floor
    let height = -Infinity
    ray.ray.origin.set(x, 2.5, z)
    for (const surface of floors) {
      const hit = ray.intersectObject(surface.mesh, false)[0]
      if (!hit || hit.point.y <= height) continue
      floor = surface
      height = hit.point.y
    }
    // The original HAB stair continues into a landing above the separately modeled ramp.
    const localX = x - 63
    const localZ = z - 78
    if (!floor && Math.abs(localX - .52) < .55 && localZ >= 2.33 && localZ <= 3.49) {
      floor = floors.find(({ module, ramp }) => module === 'HAB' && ramp)
      height = floor.placement.position[1] + layout.walkability.deckLocalY
    }
    if (!floor) continue
    capsule.start.set(x, height + radius + .026, z)
    capsule.end.set(x, height + 1.9 - radius, z)
    const overlap = octree.capsuleIntersect(capsule)
    if (overlap && overlap.depth > .03) continue
    const k = j * columns + i
    heights[k] = Math.round(height * 1000)
    zones[k] = floor.ramp ? 1 : modules.indexOf(floor.module) + 2
    if (!floor.ramp && floor.module !== 'COR') {
      const door = doors.find(({ id }) => id === floor.placement.id)
      const dx = door.outside[0] - door.inside[0], dz = door.outside[2] - door.inside[2]
      if ((x - door.center[0]) * dx + (z - door.center[2]) * dz > 0) zones[k] = 1
    }
  }
}
const grid = {
  minX, minZ, step, columns, rows,
  deck: Buffer.from(heights.buffer).toString('base64'),
  zones: Buffer.from(zones.buffer).toString('base64'),
  doors,
  exteriorObjects,
  instances: instances.map((instance) => ({
    ...instance,
    file: layout.assets[instance.asset].file,
  })),
}
const output = join(project, 'src', 'world', 'lunar', 'lunarInteriors.json')
await writeFile(output, JSON.stringify(grid) + '\n')
console.log(`Importados ${models.size} GLB, ${instances.length} instancias y ${zones.filter(Boolean).length} celdas transitables.`)
