import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { LUNAR_RESOURCES, type LunarResource } from './lunarResources'
import { createSamplingPose, SAMPLING, sampleLunarPose } from './lunarSampling'
import type { LunarSession } from './lunarRoverControl'

function SamplingProps({ lunar, resource }: { lunar: LunarSession; resource: LunarResource }) {
  const root = useRef<Group>(null)
  const tool = useRef<Group>(null)
  const pad = useRef<Group>(null)
  const stand = useRef<Group>(null)
  const specimen = useRef<Group>(null)
  const box = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const effect = useRef<Group>(null)
  const jaws = useRef<Group>(null)
  const pose = useMemo(createSamplingPose, [])
  const axis = useMemo(() => new Vector3(0, 0, 1), [])
  const profile = SAMPLING[resource.id]
  const { length, tool: kind } = profile

  useFrame(() => {
    const action = lunar.sampling
    const player = lunar.position
    const active = !!action && !action.approaching && action.resource.id === resource.id && !!player
    if (!root.current) return
    root.current.visible = active
    if (
      !active ||
      !tool.current ||
      !pad.current ||
      !box.current ||
      !specimen.current ||
      !lid.current ||
      !effect.current
    )
      return
    sampleLunarPose(pose, action, player)
    tool.current.position.copy(pose.grip)
    tool.current.quaternion.setFromUnitVectors(axis, pose.direction)
    pad.current.position.copy(pose.contact)
    pad.current.position.y -= 0.085
    if (stand.current) stand.current.scale.y = Math.max(0.08, pad.current.position.y - player.y)
    box.current.position.copy(pose.caseBase)
    lid.current.rotation.x = -1.38 * pose.lid
    box.current.visible = kind !== 'probe'
    specimen.current.visible = pose.carry
    specimen.current.position.copy(pose.payload)
    specimen.current.rotation.y = action.elapsed * 1.2
    if (jaws.current) {
      const closing = action.elapsed >= profile.contact && action.elapsed < profile.record
      jaws.current.children[0].rotation.y = closing ? -0.11 : -0.45
      jaws.current.children[1].rotation.y = closing ? 0.11 : 0.45
    }
    const time = action.elapsed - profile.contact
    effect.current.visible =
      kind === 'probe' ? pose.pulse > 0.05 : profile.strikes && time >= 0 && time < 0.61
    effect.current.position.copy(pose.contact)
    if (kind === 'probe') {
      effect.current.scale.setScalar(0.45 + pose.pulse * (0.5 + Math.sin(time * 12) * 0.07))
    } else {
      effect.current.children.forEach((chip, i) => {
        const angle = i * 2.39996
        chip.position.set(
          Math.cos(angle) * time * (0.68 + i * 0.075),
          Math.max(0, time * (0.7 + i * 0.11) - 0.81 * time * time),
          Math.sin(angle) * time * (0.68 + i * 0.075),
        )
        chip.rotation.set(time * 7, i, time * 11)
        chip.scale.setScalar(Math.max(0, 1 - time * 1.55))
      })
    }
  })

  return (
    <group ref={root} visible={false}>
      <group ref={tool}>
        <mesh position={[0, 0, length * 0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.031, 0.04, length * 0.78, 8]} />
          <meshToonMaterial color="#33464e" />
        </mesh>
        {(kind === 'pick' || kind === 'hammer') && (
          <mesh
            position={[0, 0, length - 0.053]}
            rotation={[0, kind === 'pick' ? -0.32 : 0, 0]}
            castShadow
          >
            <boxGeometry args={[kind === 'pick' ? 0.3 : 0.23, 0.1, 0.11]} />
            <meshToonMaterial color="#b9c4c6" />
          </mesh>
        )}
        {kind === 'scoop' && (
          <group position={[0, 0, length]}>
            <mesh position={[0, 0, -0.075]}>
              <boxGeometry args={[0.25, 0.038, 0.19]} />
              <meshToonMaterial color="#4c938c" />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.114, 0.042, -0.071]}>
                <boxGeometry args={[0.035, 0.09, 0.175]} />
                <meshToonMaterial color="#4c938c" />
              </mesh>
            ))}
          </group>
        )}
        {kind === 'probe' && (
          <group position={[0, 0, length - 0.1]}>
            <mesh>
              <boxGeometry args={[0.18, 0.137, 0.21]} />
              <meshToonMaterial color="#426d6b" />
            </mesh>
            <mesh position={[0, 0.072, -0.01]}>
              <boxGeometry args={[0.115, 0.018, 0.11]} />
              <meshBasicMaterial color={resource.color} />
            </mesh>
          </group>
        )}
        {kind === 'tongs' && (
          <group ref={jaws} position={[0, 0, length - 0.12]}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.065, 0, 0]}>
                <mesh position={[0, 0, 0.072]}>
                  <boxGeometry args={[0.043, 0.062, 0.16]} />
                  <meshToonMaterial color="#d88f4e" />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </group>
      <group ref={pad}>
        <group ref={stand}>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.067, 0.096, 1, 8]} />
            <meshToonMaterial color="#38484e" />
          </mesh>
        </group>
        <mesh>
          <cylinderGeometry args={[0.22, 0.26, 0.12, 9]} />
          <meshToonMaterial color="#4c565b" />
        </mesh>
        <mesh position={[0.11, 0.082, -0.1]} rotation={[0.35, 0.6, 0.3]}>
          <dodecahedronGeometry args={[0.14, 0]} />
          <meshToonMaterial color={resource.color} />
        </mesh>
      </group>
      <group ref={specimen}>
        <mesh>
          <dodecahedronGeometry args={[kind === 'scoop' ? 0.064 : 0.12, 0]} />
          <meshToonMaterial color={resource.color} />
        </mesh>
      </group>
      <group ref={box}>
        <mesh position={[0, -0.244, 0]}>
          <boxGeometry args={[0.18, 0.31, 0.16]} />
          <meshToonMaterial color="#37474c" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.36, 0.18, 0.3]} />
          <meshToonMaterial color="#3f646a" />
        </mesh>
        <mesh position={[0, 0.096, 0]}>
          <boxGeometry args={[0.3, 0.016, 0.235]} />
          <meshToonMaterial color="#26343d" />
        </mesh>
        <group ref={lid} position={[0, 0.106, -0.14]}>
          <mesh position={[0, 0, 0.143]}>
            <boxGeometry args={[0.37, 0.036, 0.307]} />
            <meshToonMaterial color="#e5d9af" />
          </mesh>
        </group>
      </group>
      <group ref={effect}>
        {kind === 'probe' ? (
          <>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.045, 0.21, 0.18, 12]} />
              <meshBasicMaterial
                color={resource.color}
                transparent
                opacity={0.37}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.18, 0.21, 24]} />
              <meshBasicMaterial color={resource.color} />
            </mesh>
          </>
        ) : (
          Array.from({ length: 9 }, (_, i) => (
            <mesh key={i}>
              <icosahedronGeometry args={[0.032 + (i % 3) * 0.014, 0]} />
              <meshToonMaterial color={resource.color} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}

export default function LunarSamplingTools({ lunar }: { lunar: LunarSession }) {
  return (
    <>
      {LUNAR_RESOURCES.map((resource) => (
        <SamplingProps key={resource.id} lunar={lunar} resource={resource} />
      ))}
    </>
  )
}
