import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Box3, BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CHARACTERS } from '../../world/characters'
import { wardrobeVisible } from '../../world/wardrobe'
import { HUMAN_SCALE } from '../../world/physicalScale'
import { framePreview, visiblePreviewBounds } from './previewFraming'

describe('complete character preview framing', () => {
  it.each(CHARACTERS)(
    'keeps $name fully in frame across outfits and preview sizes',
    async ({ model }) => {
      const bytes = readFileSync(new URL(`../../../public/${model.split('?')[0]}`, import.meta.url))
      const gltf = await new GLTFLoader().parseAsync(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        '',
      )
      const actor = gltf.scene
      actor.traverse((object) => {
        if (object.userData.wardrobe)
          object.visible = wardrobeVisible(object.userData.wardrobe, 'original', false)
      })
      const civil = visiblePreviewBounds(actor)
      const scale = HUMAN_SCALE.stature / civil.getSize(new Vector3()).y
      const root = new Group()
      root.add(actor)
      root.scale.setScalar(scale)
      const center = civil.getCenter(new Vector3())
      root.position.set(-center.x * scale, -civil.min.y * scale, -center.z * scale)
      root.rotation.y = 0.15
      for (const outfit of ['original', 'formal', 'eva'] as const) {
        for (const helmet of [false, true]) {
          actor.traverse((object) => {
            if (object.userData.wardrobe)
              object.visible = wardrobeVisible(object.userData.wardrobe, outfit, helmet)
          })
          const bounds = visiblePreviewBounds(root)
          expect(bounds.isEmpty()).toBe(false)
          for (const [width, height] of [
            [492, 410],
            [240, 290],
            [320, 220],
            [960, 450],
            [180, 400],
          ]) {
            const camera = new PerspectiveCamera(32)
            framePreview(camera, bounds, width / height)
            for (const x of [bounds.min.x, bounds.max.x]) {
              for (const y of [bounds.min.y, bounds.max.y]) {
                for (const z of [bounds.min.z, bounds.max.z]) {
                  const screen = new Vector3(x, y, z).project(camera)
                  expect(Math.abs(screen.x)).toBeLessThanOrEqual(0.863)
                  expect(Math.abs(screen.y)).toBeLessThanOrEqual(0.863)
                  expect(Math.abs(screen.z)).toBeLessThan(1)
                }
              }
            }
          }
        }
      }
    },
  )
  it('ignores hidden geometry so other outfits cannot shift the framing', () => {
    const root = new Group()
    const body = new Mesh(new BoxGeometry(0.5, 1.8, 0.4))
    body.position.y = 0.9
    root.add(body)
    const hiddenOutfit = new Group()
    hiddenOutfit.visible = false
    hiddenOutfit.position.y = 200
    hiddenOutfit.add(new Mesh(new BoxGeometry(100, 100, 100)))
    root.add(hiddenOutfit)
    const visible = visiblePreviewBounds(root)
    expect(visible.getSize(new Vector3()).y).toBeCloseTo(1.8)
    expect(visible.getCenter(new Vector3()).y).toBeCloseTo(0.9)
    const camera = new PerspectiveCamera(32)
    const before = camera.position.clone()
    framePreview(camera, new Box3(), 1)
    expect(camera.position.equals(before)).toBe(true)
  })
})
