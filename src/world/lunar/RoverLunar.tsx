import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { RoverLunarController } from './RoverLunarController'
import { lunarCanDrive, lunarHeight } from './lunarNavigation'
import { LUNAR_ROVER_START, type LunarSession } from './lunarRoverControl'
import type { SceneProps } from '../player/types'

export default function RoverLunar({
  lunar,
  input,
  paused,
}: Pick<SceneProps, 'input' | 'paused'> & { lunar: LunarSession }) {
  const gltf = useGLTF(`${import.meta.env.BASE_URL}models/lunar/Rover_Lunar_Animado.glb`)
  const controller = useMemo(
    () =>
      new RoverLunarController(gltf.scene.clone(true), {
        position: new T.Vector3(LUNAR_ROVER_START[0], 0, LUNAR_ROVER_START[1]),
        heightAt: lunarHeight,
        canMove: (p, yaw) => lunarCanDrive(p.x, p.z, yaw),
      }),
    [gltf.scene],
  )
  const { gl, size, camera } = useThree()

  useEffect(() => {
    controller.setViewport(
      size.height,
      gl.getPixelRatio(),
      (camera as T.PerspectiveCamera).fov || 50,
    )
  }, [controller, gl, size.height, camera])

  useEffect(() => {
    lunar.rover = controller
    return () => {
      lunar.rover = undefined
      lunar.boarded = false
    }
  }, [controller, lunar])
  useEffect(() => () => controller.dispose(), [controller])

  useFrame((_, delta) => {
    if (paused) {
      controller.stop()
      controller.speed = 0
      return
    }
    if (lunar.boarded) {
      const keys = input.current.keys
      const has = (...codes: string[]) => codes.some((code) => keys.has(code))
      controller.setInput({
        throttle: Number(has('KeyW', 'ArrowUp')) - Number(has('KeyS', 'ArrowDown')),
        steer: Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft')),
        brake: has('Space'),
        boost: has('ShiftLeft', 'ShiftRight'),
      })
    } else controller.stop()
    controller.update(delta)
  })

  return (
    <group>
      <primitive object={controller.vehicle} dispose={null} />
      <primitive object={controller.effects} dispose={null} />
    </group>
  )
}
