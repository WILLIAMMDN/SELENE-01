import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { RoverLunarController } from './RoverLunarController'
import { LUNAR_ROVER_HOME, lunarRoverFits, type LunarRoverMount } from './lunarRoverAccess'
import { lunarHeight } from './lunarNavigation'
import type { InputState } from '../player/types'

/** The lunar rover shares the player's controls; boarding belongs to PlayerRig. */
export default function RoverLunar({
  mount,
  input,
  paused,
}: {
  mount: MutableRefObject<LunarRoverMount>
  input: MutableRefObject<InputState>
  paused: boolean
}) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/lunar/Rover_Lunar_Animado.glb`)
  const controller = useMemo(
    () =>
      new RoverLunarController(scene.clone(true), {
        position: new T.Vector3(...LUNAR_ROVER_HOME),
        heightAt: lunarHeight,
        canMove: lunarRoverFits,
      }),
    [scene],
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
    mount.current.controller = controller
    return () => {
      if (mount.current.controller === controller) {
        mount.current.controller = null
        mount.current.driving = false
      }
      controller.dispose()
    }
  }, [controller, mount])
  useFrame((_, delta) => {
    if (paused || !mount.current.driving) {
      controller.speed = 0
      controller.stop()
    } else {
      const has = (...codes: string[]) => codes.some((code) => input.current.keys.has(code))
      controller.setInput({
        throttle: Number(has('KeyW', 'ArrowUp')) - Number(has('KeyS', 'ArrowDown')),
        steer: Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft')),
        brake: has('Space'),
        boost: has('ShiftLeft', 'ShiftRight'),
      })
    }
    if (!paused) controller.update(delta)
  }, -1)
  return (
    <group>
      <primitive object={controller.vehicle} dispose={null} />
      <primitive object={controller.effects} dispose={null} />
    </group>
  )
}
