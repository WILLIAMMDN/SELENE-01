import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import * as T from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { LandingSequence, landingShot } from './LandingSequence'
import { RoverLunarController } from './RoverLunarController'
import {
  canBoardLunarRover,
  LUNAR_ROVER_HOME,
  lunarRoverExit,
  lunarRoverFits,
  outsideLunarRover,
  toggleLunarRover,
} from './lunarRoverAccess'
import { LUNAR_BASE_LAYOUT, lunarBaseFloor, lunarRoomAt, lunarDoors } from './lunarBaseNavigation'
import { buildLunarBase, advanceBaseDoors } from './LunarBase'
import baseSource from './lunarBaseSource.json'
import { lunarCanWalk, lunarHeight } from './lunarNavigation'
import { alignSeatedPose } from '../player/seatPose'
import { CHARACTERS } from '../characters'

async function loadAsset(path: string) {
  const bytes = readFileSync(new URL(`../../../${path}`, import.meta.url))
  // Scene/animation checks need texture references, without decoding images in Node.
  const loader = new GLTFLoader().register(() => ({
    name: 'TEST_TEXTURE_REFERENCES',
    loadTexture: () => Promise.resolve(new T.Texture()),
  }))
  return loader.parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    '',
  )
}
let roverModel: GLTF, cameras: GLTF, effects: GLTF, lander: GLTF
let baseModels: GLTF[]
beforeAll(async () => {
  ;[roverModel, cameras, effects, lander] = await Promise.all(
    [
      'public/models/lunar/Rover_Lunar_Animado.glb',
      'public/models/lunar/landing/cinematica_aterrizaje_camaras.glb',
      'public/models/lunar/landing/cinematica_aterrizaje_fx.glb',
      'public/models/lander/lander_l01_v01.glb',
    ].map(loadAsset),
  )
  baseModels = await Promise.all(
    Object.values(baseSource.assets)
      .filter((asset) => !asset.file.startsWith('../'))
      .map((asset) => loadAsset(`public/models/lunar/transitable/${asset.file}`)),
  )
})
function rover() {
  return new RoverLunarController(roverModel.scene.clone(true), {
    position: new T.Vector3(...LUNAR_ROVER_HOME),
    heightAt: lunarHeight,
    canMove: lunarRoverFits,
  })
}

describe('boarding and driving the authored lunar rover', () => {
  it('turns toward the pressed side of the chase camera', () => {
    const right = rover()
    const left = rover()
    right.setInput({ throttle: 1, steer: 1 })
    left.setInput({ throttle: 1, steer: -1 })
    for (let i = 0; i < 45; i++) {
      right.update(1 / 60)
      left.update(1 / 60)
    }
    expect(right.vehicle.position.x).toBeLessThan(LUNAR_ROVER_HOME[0])
    expect(left.vehicle.position.x).toBeGreaterThan(LUNAR_ROVER_HOME[0])
    right.dispose()
    left.dispose()
  })
  it('boards nearby, drives with animated wheels and dust, and dismounts beside its current position', () => {
    const controller = rover(),
      player = new T.Vector3(55, lunarHeight(55, 63), 63)
    const mount = { controller, driving: false, exitBlocked: false }
    expect(toggleLunarRover(mount, player)).toBe(true)
    expect(mount.driving).toBe(true)
    controller.setInput({ throttle: 1, steer: 1 })
    for (let i = 0; i < 120; i++) controller.update(1 / 60)
    expect(controller.distance).toBeGreaterThan(2)
    expect(controller.vehicle.getObjectByName('Wheel_FL')!.rotation.x).not.toBe(0)
    expect(controller.vehicle.getObjectByName('Steering_FL')!.rotation.y).toBeLessThan(0)
    expect(controller.vehicle.position.x).toBeLessThan(LUNAR_ROVER_HOME[0])
    expect(controller.particleCount).toBeGreaterThan(0)
    expect(toggleLunarRover(mount, player)).toBe(true)
    expect(mount.driving).toBe(false)
    expect(controller.speed).toBe(0)
    expect(outsideLunarRover(controller, player.x, player.z)).toBe(true)
    expect(lunarCanWalk(player.x, player.z)).toBe(true)
    expect(player.distanceTo(controller.vehicle.position)).toBeLessThan(3)
    controller.dispose()
  })
  it('cannot board through a wall or from a distance, or place the driver in a blocked exit', () => {
    const controller = rover()
    expect(canBoardLunarRover(controller, 70, 63)).toBe(false)
    expect(canBoardLunarRover(controller, 55, 63, (x) => Math.abs(x - 54) > 0.1)).toBe(false)
    expect(lunarRoverExit(controller, () => false)).toBeNull()
    expect(lunarRoverFits(new T.Vector3(53, 0, 63), 0)).toBe(true)
    expect(lunarRoverFits(new T.Vector3(63.52, 0.732, 78.82), 0)).toBe(false)
    controller.dispose()
  })
})

function pathBetween(start: number[], end: number[], onlyDeck = false) {
  const grid = LUNAR_BASE_LAYOUT,
    n = grid.columns * grid.rows
  const index = (point: number[]) =>
    Math.round((point[2] - grid.minZ) / grid.step) * grid.columns +
    Math.round((point[0] - grid.minX) / grid.step)
  const from = index(start),
    to = index(end),
    queue = new Uint32Array(n),
    seen = new Uint8Array(n)
  queue[0] = from
  seen[from] = 1
  let count = 1
  for (let head = 0; head < count; head++) {
    const node = queue[head]
    if (node === to) return true
    const ix = node % grid.columns,
      iz = Math.floor(node / grid.columns)
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const xx = ix + dx,
        zz = iz + dz,
        next = zz * grid.columns + xx
      if (xx < 0 || zz < 0 || xx >= grid.columns || zz >= grid.rows || seen[next]) continue
      const x = grid.minX + xx * grid.step,
        z = grid.minZ + zz * grid.step
      if (!lunarCanWalk(x, z) || (onlyDeck && lunarBaseFloor(x, z) === null)) continue
      seen[next] = 1
      queue[count++] = next
    }
  }
  return false
}
describe('transitable lunar base', () => {
  const ref = (name: string) =>
    LUNAR_BASE_LAYOUT.refs.find((point) => point.name === name)!.position
  it('connects the habitat to both the warehouse and laboratory through the supplied corridors', () => {
    const start = ref('HAB_PUERTA_INTERACCION_INTERIOR')
    for (const goal of ['STO_PUERTA_INTERACCION_INTERIOR', 'LAB_PUERTA_INTERACCION_INTERIOR']) {
      expect(pathBetween(start, ref(goal), true), goal).toBe(true)
    }
  })
  it('provides a real exterior entry and deck elevation while retaining solid walls', () => {
    expect(pathBetween([63.52, 0, 83.5], ref('HAB_PUERTA_INTERACCION_INTERIOR'))).toBe(true)
    const interior = ref('HAB_PUERTA_INTERACCION_INTERIOR')
    expect(lunarHeight(interior[0], interior[2])).toBeCloseTo(0.732, 2)
    expect(lunarRoomAt(interior[0], interior[2])).toBe('lunar-habitat')
    expect(lunarRoomAt(53, 63)).toBeNull()
    expect(lunarCanWalk(63, 76.5)).toBe(false)
  })
  it('blocks all three closed doors, opens them before passage and leaves them open while occupied', () => {
    const base = buildLunarBase(baseModels)
    expect(base.doors).toHaveLength(3)
    try {
      for (const door of base.doors) lunarDoors.set(door.id, door.collision)
      for (const door of base.doors) {
        expect(lunarCanWalk(door.centre.x, door.centre.z), `${door.id} closed`).toBe(false)
        const viewer = { x: door.centre.x, z: door.centre.z, active: true, earth: false }
        advanceBaseDoors(base, viewer, 0.05)
        expect(lunarCanWalk(door.centre.x, door.centre.z), `${door.id} opening`).toBe(false)
        for (let i = 0; i < 180; i++) advanceBaseDoors(base, viewer, 1 / 60)
        expect(door.collision.fraction).toBe(1)
        expect(lunarCanWalk(door.centre.x, door.centre.z), `${door.id} open`).toBe(true)
        for (let i = 0; i < 180; i++) advanceBaseDoors(base, viewer, 1 / 60)
        expect(door.collision.fraction).toBe(1)
        for (let i = 0; i < 180; i++) advanceBaseDoors(base, { ...viewer, x: 0, z: 0 }, 1 / 60)
        expect(door.collision.fraction).toBe(0)
        expect(lunarCanWalk(door.centre.x, door.centre.z), `${door.id} closed again`).toBe(false)
      }
    } finally {
      lunarDoors.clear()
      base.materials.forEach((material) => material.dispose())
    }
  })
})

describe('supplied landing cinematic', () => {
  it('uses all four authored camera cuts and attaches the plume to the descending lander', () => {
    const film = new LandingSequence(cameras, effects, lander)
    expect(film.plume.parent?.name).toBe('LANDER_DESCENSO_ROOT')
    for (const time of [0, 3, 8, 10, 14]) {
      const camera = film.sample(time)
      expect(camera.name).toBe(landingShot(time).camera)
      expect(camera.getWorldPosition(new T.Vector3()).toArray().every(Number.isFinite)).toBe(true)
      const subject = new T.Box3()
        .setFromObject(film.lander)
        .getCenter(new T.Vector3())
        .project(camera)
      expect(Math.abs(subject.x), `shot at ${time}s horizontal framing`).toBeLessThan(1.2)
      expect(Math.abs(subject.y), `shot at ${time}s vertical framing`).toBeLessThan(1.2)
      expect(subject.z).toBeLessThan(1)
    }
    film.sample(3)
    const before = film.lander
      .getObjectByName('LANDER_DESCENSO_ROOT')!
      .getWorldPosition(new T.Vector3()).y
    film.sample(8)
    expect(
      before -
        film.lander.getObjectByName('LANDER_DESCENSO_ROOT')!.getWorldPosition(new T.Vector3()).y,
    ).toBeGreaterThan(5)
    film.dispose()
  })
  it('turns the plume off at contact, times the dust and holds the landed pose', () => {
    const film = new LandingSequence(cameras, effects, lander)
    film.sample(6.5)
    expect(film.plume.visible).toBe(true)
    expect(film.dust.visible).toBe(true)
    film.sample(7.375)
    expect(film.plume.visible).toBe(false)
    expect(film.light.intensity).toBe(0)
    film.sample(10)
    expect(film.dust.visible).toBe(false)
    const settled = film.lander.getObjectByName('LANDER_DESCENSO_ROOT')!.matrixWorld.clone()
    film.sample(14)
    expect(film.lander.getObjectByName('LANDER_DESCENSO_ROOT')!.matrixWorld.equals(settled)).toBe(
      true,
    )
    film.dispose()
  })
})

describe('the four crew members in the rover seat', () => {
  it.each(CHARACTERS)(
    'keeps the pelvis of $name on a tilted seat and restores the standing offset',
    async ({ model }) => {
      const gltf = await loadAsset(`public/${model.split('?')[0]}`),
        actor = clone(gltf.scene)
      const anchor = new T.Group(),
        root = new T.Group(),
        origin = new T.Vector3(0.1, 0.08, -0.2)
      anchor.position.set(10, 2, 4)
      anchor.rotation.set(0.15, 0.7, -0.1)
      anchor.add(root)
      root.add(actor)
      root.scale.setScalar(0.9)
      const mixer = new T.AnimationMixer(actor),
        clip = gltf.animations.find((clip) => clip.name === 'SitDown')!
      const action = mixer.clipAction(clip).setLoop(T.LoopOnce, 1)
      action.clampWhenFinished = true
      action.play()
      mixer.update(clip.duration)
      anchor.updateMatrixWorld(true)
      const hips = actor.getObjectByName('Hips')!
      alignSeatedPose(root, hips, origin, true, new T.Vector3())
      anchor.updateMatrixWorld(true)
      expect(hips.getWorldPosition(new T.Vector3()).distanceTo(anchor.position)).toBeLessThan(
        0.00001,
      )
      alignSeatedPose(root, hips, origin, false, new T.Vector3())
      expect(root.position.equals(origin)).toBe(true)
    },
  )
})
