import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Mesh, SkinnedMesh } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CHARACTERS } from './characters'
import { wardrobeVisible } from './wardrobe'
import { createCharacterPlayback } from './characterPlayback'

describe('four delivered character assets', () => {
  it.each(CHARACTERS)(
    'loads $name with real skin weights, wardrobe groups and animations',
    async ({ model }) => {
      const bytes = readFileSync(new URL(`../../public/${model.split('?')[0]}`, import.meta.url))
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer
      const gltf = await new GLTFLoader().parseAsync(buffer, '')
      expect(gltf.animations.map((a) => a.name).sort()).toEqual([
        'Idle',
        'MirarAlrededor',
        'PickUp',
        'Punch',
        'ReceiveHit',
        'Run',
        'Saludar',
        'SitDown',
        'Walk',
      ])
      const groups = new Set<string>()
      let skins = 0
      gltf.scene.traverse((object) => {
        if (object.userData.wardrobe) groups.add(object.userData.wardrobe)
        if (object instanceof SkinnedMesh) {
          skins++
          expect(object.geometry.getAttribute('skinIndex').count).toBe(
            object.geometry.getAttribute('position').count,
          )
          expect(object.geometry.getAttribute('skinWeight').count).toBe(
            object.geometry.getAttribute('position').count,
          )
        }
      })
      expect(skins).toBeGreaterThan(50)
      for (const group of ['body', 'formal', 'eva', 'helmet', 'original'])
        expect(groups.has(group)).toBe(true)
      const playback = createCharacterPlayback(gltf.scene, gltf.animations)
      for (const clip of gltf.animations) {
        playback.stop()
        playback.actions[clip.name].reset().play()
        // Replay setup after cleanup with the same cached action, as in Strict Mode.
        playback.stop()
        expect(() => playback.actions[clip.name].reset().play()).not.toThrow()
        playback.mixer.update(clip.duration * 0.5)
        gltf.scene.updateMatrixWorld(true)
        gltf.scene.traverse((object) =>
          expect(object.matrixWorld.elements.every(Number.isFinite)).toBe(true),
        )
      }
      for (const outfit of ['formal', 'eva'] as const) {
        gltf.scene.traverse((object) => {
          if (object.userData.wardrobe)
            object.visible = wardrobeVisible(object.userData.wardrobe, outfit, true)
        })
        let visible = 0
        gltf.scene.traverseVisible((object) => {
          if (object instanceof Mesh) visible++
        })
        expect(visible).toBeGreaterThan(20)
      }
      playback.stop()
    },
  )
})
