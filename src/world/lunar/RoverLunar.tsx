import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as T from 'three'
import { RoverLunarController } from './RoverLunarController'

type Props = {
  url?: string
  position?: [number, number, number]
  heightAt?: (x: number, z: number) => number
  canMove?: (position: T.Vector3, yaw: number) => boolean
  enabled?: boolean
  paused?: boolean
  onControlChange?: (vehicle: T.Group | null) => void
}

/** Interactive and animated Lunar Rover with independent physics, dust emission, and anime NPR aesthetic. */
export default function RoverLunar({
  url = `${import.meta.env.BASE_URL}models/lunar/Rover_Lunar_Animado.glb`,
  position = [0, 0, 0],
  heightAt,
  canMove,
  enabled,
  paused = false,
  onControlChange,
}: Props) {
  const gltf = useGLTF(url)
  const callbacks = useRef({ heightAt, canMove })
  callbacks.current = { heightAt, canMove }
  const controller = useMemo(
    () =>
      new RoverLunarController(gltf.scene.clone(true), {
        position: new T.Vector3(...position),
        heightAt: (x, z) => callbacks.current.heightAt?.(x, z) ?? position[1],
        canMove: (p, yaw) => callbacks.current.canMove?.(p, yaw) ?? true,
      }),
    [gltf.scene, position],
  )
  const [driving, setDriving] = useState(false)
  const active = (enabled ?? driving) && !paused
  const keys = useRef(new Set<string>())
  const { gl, size, camera } = useThree()

  useEffect(() => {
    controller.setViewport(
      size.height,
      gl.getPixelRatio(),
      (camera as T.PerspectiveCamera).fov || 50,
    )
  }, [controller, gl, size.height, camera])

  useEffect(() => {
    onControlChange?.(active ? controller.vehicle : null)
    if (!active) {
      keys.current.clear()
      controller.stop()
    }
    return () => onControlChange?.(null)
  }, [active, controller, onControlChange])

  useEffect(() => {
    const clear = () => {
      keys.current.clear()
      controller.stop()
    }
    const down = (event: KeyboardEvent) => {
      if (
        !active ||
        event.isComposing ||
        (event.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return
      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space',
          'ShiftLeft',
          'ShiftRight',
        ].includes(event.code)
      ) {
        event.preventDefault()
        event.stopPropagation()
        keys.current.add(event.code)
      }
      if (event.code === 'Escape' && enabled === undefined) {
        clear()
        setDriving(false)
      }
      if (event.code === 'KeyR') controller.reset()
    }
    const release = (event: KeyboardEvent) => keys.current.delete(event.code)
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', release, true)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => {
      clear()
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', release, true)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [active, controller, enabled])

  useEffect(() => () => controller.dispose(), [controller])

  useFrame((_, delta) => {
    if (paused) return
    const has = (...codes: string[]) => codes.some((code) => keys.current.has(code))
    if (active)
      controller.setInput({
        throttle: Number(has('KeyW', 'ArrowUp')) - Number(has('KeyS', 'ArrowDown')),
        steer: Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft')),
        brake: has('Space'),
        boost: has('ShiftLeft', 'ShiftRight'),
      })
    controller.update(delta)
  })

  return (
    <group>
      <primitive object={controller.vehicle} dispose={null}>
        {enabled === undefined && (
          <Html position={[0, 2.6, 0]} center distanceFactor={28}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  background: active ? '#ba6061' : '#26343a',
                  color: '#f6f6ec',
                  border: '2px solid #56878b',
                  borderRadius: 6,
                  padding: '7px 14px',
                  font: "700 12px 'Space Grotesk', sans-serif",
                  cursor: 'pointer',
                  boxShadow: '0 3px 0 #1b2529',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setDriving((value) => !value)}
              >
                {active ? 'SALIR DEL ROVER · [Esc]' : 'CONDUCIR ROVER LUNAR'}
              </button>
              {active && (
                <div
                  style={{
                    background: 'rgba(38, 52, 58, 0.92)',
                    color: '#f6f6ec',
                    padding: '5px 10px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    fontSize: 11,
                    marginTop: 6,
                    border: '1px solid #56878b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                  }}
                >
                  WASD / Flechas: conducir · Espacio: freno · Shift: turbo · R: reiniciar
                </div>
              )}
            </div>
          </Html>
        )}
      </primitive>
      <primitive object={controller.effects} dispose={null} />
    </group>
  )
}
