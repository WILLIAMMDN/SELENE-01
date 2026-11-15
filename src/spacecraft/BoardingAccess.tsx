import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import {
  DECK_HEIGHT,
  HATCH,
  LIFT,
  SUIT_POINT,
  STAIR_COUNT,
  STAIR_RISE,
  STAIR_START,
  STAIR_TOTAL_HEIGHT,
  type BoardingMotion,
} from './boardingRoute'
import { Solid, Sign } from '../world/ArtKit'

/**
 * These pieces occupy the same coordinate system as the campus, player and launch GLB.
 * The raised footbridge joins the access lift to the modeled tower's crew-arm height.
 */
export default function BoardingAccess({ motion }: { motion: RefObject<BoardingMotion> }) {
  const platform = useRef<Group>(null)
  useFrame(() => {
    if (platform.current)
      platform.current.position.y =
        STAIR_TOTAL_HEIGHT + motion.current.lift * (DECK_HEIGHT - STAIR_TOTAL_HEIGHT)
  })
  return (
    <group name="LC-01 · pasarela de simulación">
      <Solid position={[70, 0.1, -35]} scale={[24, 0.2, 5]} color="#9daaa2" />
      <Solid position={[80, 0.1, -60]} scale={[5, 0.2, 52]} color="#9daaa2" />
      {Array.from({ length: STAIR_COUNT }, (_, index) => {
        const rise = (index + 1) * STAIR_RISE
        return (
          <Solid
            key={index}
            position={[LIFT.x, rise / 2, STAIR_START - index - 0.5]}
            scale={[4.25, rise, 0.98]}
            color={index % 2 === 0 ? '#d4d8c9' : '#e7e5d6'}
          />
        )
      })}
      <group position={[SUIT_POINT.x, 0, SUIT_POINT.z]}>
        <Solid position={[0, 1.1, -2]} scale={[2.5, 2.2, 1.3]} color="#47686a" />
        <Solid position={[0, 1.25, -1.3]} scale={[1.7, 1.4, 0.08]} color="#e9e9dc" />
        <Sign
          text="VESTUARIO · SIMULACIÓN"
          sub="E · EQUIPAR TRAJE"
          position={[0, 2.9, -2.0]}
          scale={[2.9, 0.95, 1]}
        />
      </group>
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
        text="ESCALERA DE ACCESO"
        sub="SUBE Y SIGUE AL ASCENSOR"
        position={[LIFT.x + 3.1, 1.9, STAIR_START + 2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.8, 0.85, 1]}
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
