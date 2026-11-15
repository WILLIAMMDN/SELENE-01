import { useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { toon } from '../ArtKit'
import type { Outfit } from '../wardrobe'
import { characterInfo, type CharacterId } from '../characters'
import type { CharacterMotion } from '../characterMotion'
import type { InputState } from './types'

type Props = {
  active: boolean
  motion: RefObject<CharacterMotion>
  input: MutableRefObject<InputState>
  reduced?: boolean
  outfit?: Outfit
  character?: CharacterId
}

function ArmMesh({
  side,
  outfit = 'classic',
  character = 'explorer',
  geometries,
}: {
  side: 'left' | 'right'
  outfit?: Outfit
  character?: CharacterId
  geometries: {
    sleeve: T.BufferGeometry
    cuff: T.BufferGeometry
    commBase: T.BufferGeometry
    commScreen: T.BufferGeometry
    palm: T.BufferGeometry
    thumbBase: T.BufferGeometry
    thumbTip: T.BufferGeometry
    fingerProximal: T.BufferGeometry
    fingerDistal: T.BufferGeometry
  }
}) {
  const isEva = outfit === 'eva'
  const isFormal = outfit === 'formal'

  // Dynamic colors matching project palette
  const sleeveColor = isEva ? '#eae8dc' : isFormal ? '#324349' : '#f0ecdd'
  const cuffColor = isEva ? '#c67a5f' : '#56878b'
  const handColor = isEva ? '#e6e6d9' : characterInfo(character).skin
  const inkColor = '#303d43'

  const sleeveMat = useMemo(() => toon(sleeveColor), [sleeveColor])
  const cuffMat = useMemo(() => toon(cuffColor), [cuffColor])
  const handMat = useMemo(() => toon(handColor), [handColor])
  const commScreenMat = useMemo(
    () =>
      new T.MeshBasicMaterial({
        color: '#65a5a5',
      }),
    [],
  )

  const inkMat = useMemo(
    () =>
      new T.MeshBasicMaterial({
        color: inkColor,
        side: T.BackSide,
      }),
    [inkColor],
  )

  const isLeft = side === 'left'
  const sign = isLeft ? -1 : 1

  // Finger layout data (x, y, length scale)
  const fingers = [
    { x: 0.022 * sign, y: 0.002, rotX: 0.28, rotY: 0.05 * sign, scale: 0.95 }, // Index
    { x: 0.007 * sign, y: 0.003, rotX: 0.32, rotY: 0.01 * sign, scale: 1.0 }, // Middle
    { x: -0.008 * sign, y: 0.002, rotX: 0.35, rotY: -0.03 * sign, scale: 0.92 }, // Ring
    { x: -0.023 * sign, y: 0.0, rotX: 0.4, rotY: -0.08 * sign, scale: 0.82 }, // Pinky
  ]

  return (
    <group>
      {/* Forearm / Sleeve */}
      <group position={[0, -0.05, 0.12]} rotation={[0.42, 0.22 * sign, -0.15 * sign]}>
        <mesh geometry={geometries.sleeve} material={sleeveMat} />
        <mesh geometry={geometries.sleeve} material={inkMat} scale={[1.04, 1.01, 1.04]} />

        {/* Cuff Ring */}
        <mesh position={[0, -0.11, 0]} geometry={geometries.cuff} material={cuffMat} />
        <mesh
          position={[0, -0.11, 0]}
          geometry={geometries.cuff}
          material={inkMat}
          scale={[1.05, 1.02, 1.05]}
        />

        {/* Wrist Communicator (only on left arm) */}
        {isLeft && (
          <group position={[0, -0.06, 0.048]} rotation={[-0.2, 0, 0]}>
            <mesh geometry={geometries.commBase} material={inkMat} />
            <mesh
              position={[0, 0.004, 0.006]}
              geometry={geometries.commScreen}
              material={commScreenMat}
            />
          </group>
        )}
      </group>

      {/* Hand & Palm */}
      <group position={[0, -0.02, -0.02]} rotation={[0.12, 0.15 * sign, -0.08 * sign]}>
        {/* Palm */}
        <mesh geometry={geometries.palm} material={handMat} />
        <mesh geometry={geometries.palm} material={inkMat} scale={[1.04, 1.08, 1.04]} />

        {/* Thumb */}
        <group position={[0.036 * sign, 0.002, 0.016]} rotation={[0.26, 0.55 * sign, -0.22 * sign]}>
          <mesh geometry={geometries.thumbBase} material={handMat} />
          <mesh geometry={geometries.thumbBase} material={inkMat} scale={[1.06, 1.04, 1.06]} />
          <mesh
            position={[0, -0.004, -0.024]}
            rotation={[0.32, 0, 0]}
            geometry={geometries.thumbTip}
            material={handMat}
          />
          <mesh
            position={[0, -0.004, -0.024]}
            rotation={[0.32, 0, 0]}
            geometry={geometries.thumbTip}
            material={inkMat}
            scale={[1.06, 1.04, 1.06]}
          />
        </group>

        {/* 4 Fingers with relaxed natural curl */}
        {fingers.map((f, i) => (
          <group
            key={i}
            position={[f.x, f.y, -0.036]}
            rotation={[f.rotX, f.rotY, 0]}
            scale={f.scale}
          >
            {/* Proximal phalanx */}
            <mesh
              position={[0, -0.008, -0.015]}
              geometry={geometries.fingerProximal}
              material={handMat}
            />
            <mesh
              position={[0, -0.008, -0.015]}
              geometry={geometries.fingerProximal}
              material={inkMat}
              scale={[1.08, 1.04, 1.08]}
            />

            {/* Distal phalanx curled inward */}
            <mesh
              position={[0, -0.018, -0.034]}
              rotation={[0.36, 0, 0]}
              geometry={geometries.fingerDistal}
              material={handMat}
            />
            <mesh
              position={[0, -0.018, -0.034]}
              rotation={[0.36, 0, 0]}
              geometry={geometries.fingerDistal}
              material={inkMat}
              scale={[1.08, 1.04, 1.08]}
            />
          </group>
        ))}
      </group>
    </group>
  )
}

export default function FirstPersonArms({
  active,
  motion,
  input,
  reduced = false,
  outfit = 'classic',
  character = 'explorer',
}: Props) {
  const { camera } = useThree()
  const rootRef = useRef<T.Group>(null)
  const leftArmRef = useRef<T.Group>(null)
  const rightArmRef = useRef<T.Group>(null)

  // Animation and kinematics states
  const stridePhase = useRef(0)
  const swayX = useRef(0)
  const swayY = useRef(0)
  const lastYaw = useRef(input.current.yaw)
  const lastPitch = useRef(input.current.pitch)

  // Shared geometry instances (memoized once for 60fps performance)
  const geometries = useMemo(() => {
    return {
      sleeve: new T.CylinderGeometry(0.046, 0.052, 0.24, 16),
      cuff: new T.CylinderGeometry(0.054, 0.054, 0.024, 16),
      commBase: new RoundedBoxGeometry(0.044, 0.014, 0.042, 2, 0.004),
      commScreen: new T.BoxGeometry(0.036, 0.003, 0.034),
      palm: new RoundedBoxGeometry(0.066, 0.024, 0.072, 3, 0.008),
      thumbBase: new T.CapsuleGeometry(0.011, 0.026, 4, 8),
      thumbTip: new T.CapsuleGeometry(0.009, 0.022, 4, 8),
      fingerProximal: new T.CapsuleGeometry(0.009, 0.028, 4, 8),
      fingerDistal: new T.CapsuleGeometry(0.008, 0.022, 4, 8),
    }
  }, [])

  useFrame((_state, delta) => {
    if (!rootRef.current || !active) return

    // Synchronize root with camera
    rootRef.current.position.copy(camera.position)
    rootRef.current.quaternion.copy(camera.quaternion)

    const dt = Math.min(0.05, delta)

    const speed = motion.current?.speed ?? 0
    const running = speed > 2.5
    const seated = !!motion.current?.seat
    const yaw = input.current.yaw
    const pitch = input.current.pitch

    // 1. Angular velocities for inertia lag (sway)
    const deltaYaw = yaw - lastYaw.current
    const deltaPitch = pitch - lastPitch.current
    lastYaw.current = yaw
    lastPitch.current = pitch

    // Tight, controlled micro-sway when turning the camera (keeps hands firmly anchored)
    const targetSwayX = reduced ? 0 : Math.max(-0.015, Math.min(0.015, -deltaYaw * 0.08))
    const targetSwayY = reduced ? 0 : Math.max(-0.01, Math.min(0.01, deltaPitch * 0.06))

    swayX.current += (targetSwayX - swayX.current) * Math.min(1, dt * 20)
    swayY.current += (targetSwayY - swayY.current) * Math.min(1, dt * 20)

    // Stride cadence - gentle, controlled arm motion while walking/running
    const isMoving = speed > 0.1 && !seated
    if (isMoving) {
      stridePhase.current += dt * (running ? 11 : 7.5)
    }

    const swingAmp = reduced ? 0.004 : running ? 0.022 : isMoving ? 0.012 : 0
    const bobAmp = reduced ? 0.002 : running ? 0.01 : isMoving ? 0.005 : 0

    const leftSwing = Math.sin(stridePhase.current) * swingAmp
    const rightSwing = -Math.sin(stridePhase.current) * swingAmp
    const verticalBob = Math.abs(Math.sin(stridePhase.current)) * bobAmp
    const seatOffset = seated ? -0.08 : 0

    // Position Left Arm firmly in lower corner
    if (leftArmRef.current) {
      leftArmRef.current.position.set(
        -0.2 + swayX.current,
        -0.22 + swayY.current + verticalBob + seatOffset,
        -0.36 + leftSwing,
      )
      leftArmRef.current.rotation.set(0.2 + leftSwing * 0.7, 0.14, -0.1)
    }

    // Position Right Arm firmly in lower corner
    if (rightArmRef.current) {
      rightArmRef.current.position.set(
        0.2 + swayX.current,
        -0.22 + swayY.current + verticalBob + seatOffset,
        -0.36 + rightSwing,
      )
      rightArmRef.current.rotation.set(0.2 + rightSwing * 0.7, -0.14, 0.1)
    }
  })

  if (!active) return null

  return (
    <group ref={rootRef}>
      <group ref={leftArmRef} position={[-0.21, -0.22, -0.38]}>
        <ArmMesh side="left" outfit={outfit} character={character} geometries={geometries} />
      </group>
      <group ref={rightArmRef} position={[0.21, -0.22, -0.38]}>
        <ArmMesh side="right" outfit={outfit} character={character} geometries={geometries} />
      </group>
    </group>
  )
}
