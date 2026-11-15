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
  const [isNear, setIsNear] = useState(false)
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
        event.isComposing ||
        (event.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return

      // Toggle entrar / salir con tecla E
      if (event.code === 'KeyE' && !event.repeat && enabled === undefined) {
        if (active) {
          event.preventDefault()
          clear()
          setDriving(false)
          return
        } else if (isNear && !paused) {
          event.preventDefault()
          setDriving(true)
          return
        }
      }

      if (!active) return

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
  }, [active, isNear, paused, controller, enabled])

  useEffect(() => () => controller.dispose(), [controller])

  useFrame((_, delta) => {
    if (paused) return
    const dist = camera.position.distanceTo(controller.vehicle.position)
    const near = dist < 16
    if (near !== isNear) setIsNear(near)

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
        {enabled === undefined && !paused && (active || isNear) && (
          <Html position={[0, active ? 3.4 : 2.4, 0]} center distanceFactor={22}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'auto',
                userSelect: 'none',
              }}
            >
              {!active ? (
                <button
                  type="button"
                  style={{
                    background: '#fdfdf6',
                    color: '#26343a',
                    border: '2.5px solid #26343a',
                    borderRadius: 8,
                    padding: '8px 16px',
                    font: "700 13px 'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    boxShadow: '3px 4px 0 #26343a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setDriving(true)}
                >
                  <span
                    style={{
                      background: '#ba6061',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      letterSpacing: '0.05em',
                    }}
                  >
                    ROVER
                  </span>
                  <kbd
                    style={{
                      background: '#26343a',
                      color: '#fdfdf6',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    E
                  </kbd>
                  <span>Conducir Rover Lunar</span>
                  <span style={{ color: '#ba6061', fontSize: 13, fontWeight: 900 }}>▶</span>
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: '#ba6061',
                      color: '#fffdf6',
                      border: '2.5px solid #26343a',
                      borderRadius: 8,
                      padding: '7px 15px',
                      font: "700 12px 'Space Grotesk', sans-serif",
                      cursor: 'pointer',
                      boxShadow: '3px 4px 0 #26343a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      keys.current.clear()
                      controller.stop()
                      setDriving(false)
                    }}
                  >
                    <kbd style={{ background: '#26343a', color: '#fff', padding: '1px 5px', borderRadius: 3 }}>
                      E / Esc
                    </kbd>
                    <span>Salir del rover</span>
                    <span style={{ color: '#fff', fontSize: 11 }}>▶</span>
                  </button>
                  <div
                    style={{
                      background: '#fdfdf6',
                      color: '#26343a',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '2px solid #26343a',
                      boxShadow: '2px 3px 0 #26343a',
                      whiteSpace: 'nowrap',
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    WASD: Conducir · Espacio: Freno · Shift: Turbo · R: Reiniciar
                  </div>
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
