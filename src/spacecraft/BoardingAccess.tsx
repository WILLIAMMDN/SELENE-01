import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { DECK_HEIGHT, HATCH, LIFT, type BoardingMotion } from './boardingRoute'
import { Solid, Sign } from '../world/ArtKit'

/**
 * These pieces occupy the same coordinate system as the campus, player and launch GLB.
 * The raised footbridge joins the access lift to the modeled tower's crew-arm height.
 */
export default function BoardingAccess({ motion }: { motion: RefObject<BoardingMotion> }) {
  const platform = useRef<Group>(null)
  useFrame(() => {
    if (platform.current) platform.current.position.y = motion.current.lift * DECK_HEIGHT
  })
  return (
    <group name="LC-01 · acceso físico a tripulación">
      <Solid position={[70, 0.1, -35]} scale={[24, 0.2, 5]} color="#9daaa2" />
      <Solid position={[80, 0.1, -60]} scale={[5, 0.2, 52]} color="#9daaa2" />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            position={[80 + side * 2.8, DECK_HEIGHT / 2, LIFT.z]}
            scale={[0.18, DECK_HEIGHT, 0.18]}
            color="#31454a"
          />
          <Solid
            position={[80 + side * 1.45, DECK_HEIGHT / 2, LIFT.z + 2]}
            scale={[0.12, DECK_HEIGHT, 0.12]}
            color="#56878b"
          />
          <Solid
            position={[70.5, DECK_HEIGHT + 1.0, -84 + side * 1.68]}
            scale={[19, 0.09, 0.1]}
            color="#31454a"
          />
          <Solid
            position={[70.5, DECK_HEIGHT + 0.42, -84 + side * 1.68]}
            scale={[19, 0.09, 0.1]}
            color="#56878b"
          />
        </group>
      ))}
      <group ref={platform} position={[LIFT.x, 0, LIFT.z]}>
        <Solid position={[0, 0, 0]} scale={[3.9, 0.35, 3.9]} color="#d7b47f" />
        <Solid position={[0, -0.3, 0]} scale={[3.6, 0.25, 3.6]} color="#31454a" />
      </group>
      <Solid position={[70.5, DECK_HEIGHT - 0.16, -84]} scale={[19.6, 0.32, 3.4]} color="#d9dcca" />
      <Solid
        position={[HATCH.x, DECK_HEIGHT + 0.65, HATCH.z]}
        scale={[0.25, 1.3, 2.6]}
        color="#56878b"
      />
      <Sign
        text="LC-01 · ACCESO"
        sub="SIGUE LA VÍA HASTA EL ASCENSOR"
        position={[80, 2.1, -44]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3.6, 1, 1]}
      />
      <Sign
        text="ASCENSOR"
        sub="E · ASCENDER"
        position={[LIFT.x + 2.4, 1.6, LIFT.z + 1.4]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1.8, 0.8, 1]}
      />
    </group>
  )
}
