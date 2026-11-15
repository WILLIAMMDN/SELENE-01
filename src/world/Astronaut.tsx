import type { CharacterMotion } from './characterMotion'
import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Solid, Sign } from './ArtKit'
import { PALETTE as P } from './worldData'

/** 1.95 m including helmet. Root at the soles; articulated adult limb proportions. */
export default function Astronaut({
  moving,
  phase,
  seated,
  motion,
}: {
  moving?: MutableRefObject<number>
  phase?: MutableRefObject<number>
  seated?: MutableRefObject<boolean>
  motion?: MutableRefObject<CharacterMotion>
}) {
  const body = useRef<Group>(null),
    leftShin = useRef<Group>(null),
    rightShin = useRef<Group>(null),
    leftLeg = useRef<Group>(null),
    rightLeg = useRef<Group>(null),
    leftArm = useRef<Group>(null),
    rightArm = useRef<Group>(null)
  useFrame(() => {
    const stride = Math.sin(phase?.current ?? 0) * (moving?.current ?? 0) * 0.35
    const sitting = seated?.current ?? false
    const sample = motion?.current.samplingPose
    const bend = sample?.crouch ?? 0
    if (body.current) {
      body.current.position.y = sitting ? -0.37 : -0.32 * bend
      body.current.rotation.x = 0.22 * bend
    }
    if (leftLeg.current) leftLeg.current.rotation.x = sitting ? -1.48 : stride
    if (rightLeg.current) rightLeg.current.rotation.x = sitting ? -1.48 : -stride
    if (leftShin.current) leftShin.current.rotation.x = sitting ? 1.4 : 0
    if (rightShin.current) rightShin.current.rotation.x = sitting ? 1.4 : 0
    if (leftArm.current) leftArm.current.rotation.x = sitting ? -0.54 : -stride * 0.7
    if (rightArm.current)
      rightArm.current.rotation.x = sitting ? -0.54 : sample ? -0.75 - bend * 0.4 : stride * 0.7
  })
  return (
    <group ref={body} name="Tripulante / 1.95 m">
      <Solid kind="capsule" position={[0, 1.24, 0]} scale={[0.52, 0.29, 0.36]} color={P.paper} />
      <Solid position={[0, 1.22, -0.25]} scale={[0.42, 0.56, 0.22]} color={P.coral} />
      <Solid position={[0, 1.23, -0.38]} scale={[0.3, 0.36, 0.04]} color={P.cream} />
      <Sign
        text="S—01"
        position={[0, 1.31, -0.405]}
        rotation={[0, Math.PI, 0]}
        scale={[0.25, 0.08, 1]}
        bg={P.cream}
      />
      <Solid kind="sphere" position={[0, 1.74, 0]} scale={[0.22, 0.21, 0.23]} color={P.cream} />
      <Solid kind="sphere" position={[0, 1.75, 0.14]} scale={[0.18, 0.14, 0.14]} color={P.teal} />
      <Solid
        kind="sphere"
        position={[-0.07, 1.8, 0.26]}
        scale={[0.045, 0.025, 0.012]}
        color={P.aqua}
        outline={false}
      />
      <Solid
        kind="torus"
        position={[0, 1.53, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.18}
        color={P.ink}
      />
      {[-1, 1].map((side) => (
        <group
          key={`arm${side}`}
          ref={side < 0 ? leftArm : rightArm}
          position={[side * 0.31, 1.43, 0]}
        >
          <Solid
            kind="capsule"
            position={[side * 0.02, -0.15, 0]}
            scale={[0.19, 0.19, 0.21]}
            color={P.paper}
          />
          <Solid
            kind="capsule"
            position={[side * 0.035, -0.43, 0.035]}
            scale={[0.17, 0.16, 0.18]}
            color={P.paper}
          />
          <Solid
            position={[side * 0.035, -0.53, 0.035]}
            scale={[0.18, 0.055, 0.19]}
            color={P.coral}
          />
          <Solid
            kind="sphere"
            position={[side * 0.035, -0.64, 0.05]}
            scale={[0.095, 0.12, 0.1]}
            color={P.teal}
          />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group
          key={`leg${side}`}
          ref={side < 0 ? leftLeg : rightLeg}
          position={[side * 0.15, 0.94, 0]}
        >
          <Solid
            kind="capsule"
            position={[0, -0.2, 0]}
            scale={[0.25, 0.22, 0.27]}
            color={P.paper}
          />
          <Solid
            kind="sphere"
            position={[0, -0.43, 0.025]}
            scale={[0.115, 0.12, 0.13]}
            color={P.cream}
          />
          <group ref={side < 0 ? leftShin : rightShin} position={[0, -0.43, 0]}>
            <Solid
              kind="capsule"
              position={[0, -0.18, 0]}
              scale={[0.21, 0.18, 0.23]}
              color={P.paper}
            />
            <Solid position={[0, -0.39, 0.07]} scale={[0.24, 0.19, 0.35]} color={P.teal} />
            <Solid position={[0, -0.485, 0.07]} scale={[0.245, 0.05, 0.36]} color={P.ink} />
          </group>
        </group>
      ))}
    </group>
  )
}
