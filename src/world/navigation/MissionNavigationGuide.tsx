import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { SECTORS, groundHeight, type SectorId } from '../worldData'
import { occupant } from '../buildingNavigation'

type Props = {
  targetSector: SectorId
  reduced?: boolean
  indoor?: boolean
}

/**
 * Professional in-world ground navigation system.
 * Designed to lie strictly flat on the ground surface without protruding or looking like traffic cones:
 * 1. Flat 2D animated chevrons flowing along the ground towards the target entrance.
 * 2. Flat minimalist ground compass ring at the player's feet indicating heading.
 * 3. Sleek destination arrival pad with concentric ground rings and gentle floating diamond pin.
 */
export default function MissionNavigationGuide({
  targetSector,
  reduced = false,
  indoor = false,
}: Props) {
  const sector = useMemo(() => SECTORS.find((s) => s.id === targetSector), [targetSector])
  const compassRef = useRef<T.Group>(null)
  const chevronsRef = useRef<T.Group>(null)
  const rippleRef = useRef<T.Mesh>(null)
  const arrivalRingsRef = useRef<T.Group>(null)
  const diamondRef = useRef<T.Group>(null)

  const targetEntry = sector?.entry ?? [0, 0]
  const sectorColor = sector?.color ?? '#457d80'

  // Flat 2D Chevron Shape: pointing forward (+Z in world when rotated -PI/2 on X)
  const { chevronGeom, innerChevronGeom } = useMemo(() => {
    // Outer chevron
    const sOuter = new T.Shape()
    sOuter.moveTo(0, -0.65)
    sOuter.lineTo(-0.46, 0.28)
    sOuter.lineTo(-0.26, 0.28)
    sOuter.lineTo(0, -0.16)
    sOuter.lineTo(0.26, 0.28)
    sOuter.lineTo(0.46, 0.28)
    sOuter.closePath()

    // Inner highlight chevron
    const sInner = new T.Shape()
    sInner.moveTo(0, -0.52)
    sInner.lineTo(-0.34, 0.20)
    sInner.lineTo(-0.20, 0.20)
    sInner.lineTo(0, -0.10)
    sInner.lineTo(0.20, 0.20)
    sInner.lineTo(0.34, 0.20)
    sInner.closePath()

    return {
      chevronGeom: new T.ShapeGeometry(sOuter),
      innerChevronGeom: new T.ShapeGeometry(sInner),
    }
  }, [])

  // Flat Compass Arrow (sleek 2D needle lying flat on ground)
  const compassNeedleGeom = useMemo(() => {
    const s = new T.Shape()
    s.moveTo(0, -0.42)
    s.lineTo(-0.18, 0.12)
    s.lineTo(0, 0.02)
    s.lineTo(0.18, 0.12)
    s.closePath()
    return new T.ShapeGeometry(s)
  }, [])

  const maxChevrons = 10
  const chevrons = useMemo(() => {
    return Array.from({ length: maxChevrons }, (_, i) => ({ id: i }))
  }, [])

  useFrame((state) => {
    if (!sector || indoor) return
    const time = state.clock.elapsedTime
    const px = occupant.x
    const pz = occupant.z
    const tx = targetEntry[0]
    const tz = targetEntry[1]
    const dx = tx - px
    const dz = tz - pz
    const dist = Math.hypot(dx, dz)
    const angle = Math.atan2(dx, dz)

    // 1. Compass ring and flat needle at player feet
    if (compassRef.current) {
      const py = groundHeight(px, pz)
      compassRef.current.position.set(px, py + 0.025, pz)
      compassRef.current.rotation.y = angle
      compassRef.current.visible = dist > 2.8
    }

    // 2. Animated ground chevron trail strictly flat on terrain
    if (chevronsRef.current && dist > 4.2) {
      chevronsRef.current.visible = true
      const children = chevronsRef.current.children
      const spacing = 3.6
      const animSpeed = reduced ? 0 : 3.8
      const flowOffset = (time * animSpeed) % spacing

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as T.Group
        const stepDist = 1.8 + i * spacing + flowOffset

        if (stepDist >= dist - 2.2) {
          child.visible = false
          continue
        }

        child.visible = true
        const cx = px + (dx / dist) * stepDist
        const cz = pz + (dz / dist) * stepDist
        const cy = groundHeight(cx, cz) + 0.028

        child.position.set(cx, cy, cz)
        child.rotation.y = angle

        // Smooth fade at the edges of the path
        const edgeFade = Math.min(1, Math.min(stepDist / 4, (dist - stepDist) / 4))
        const pulse = reduced ? 1 : 0.88 + Math.sin(time * 4 - i * 0.6) * 0.12
        child.scale.setScalar(edgeFade * pulse)
      }
    } else if (chevronsRef.current) {
      chevronsRef.current.visible = false
    }

    // 3. Destination arrival pad animations
    if (rippleRef.current && !reduced) {
      const ripplePhase = (time * 0.9) % 1
      const rippleRadius = 0.6 + ripplePhase * 1.5
      rippleRef.current.scale.set(rippleRadius, rippleRadius, 1)
      const mat = rippleRef.current.material as T.MeshBasicMaterial
      if (mat) {
        mat.opacity = (1 - ripplePhase) * 0.55
      }
    }

    if (arrivalRingsRef.current && !reduced) {
      arrivalRingsRef.current.rotation.z = time * 0.5
    }

    if (diamondRef.current) {
      diamondRef.current.rotation.y = time * 1.6
      diamondRef.current.position.y = 2.6 + Math.sin(time * 2.4) * 0.14
    }
  })

  if (!sector || indoor) return null

  const [tx, tz] = targetEntry
  const ty = groundHeight(tx, tz)

  return (
    <group name="MissionNavigationGuide">
      {/* 1. Flat compass ring & directional needle at player feet */}
      <group ref={compassRef} visible={false}>
        {/* Flat circular ground ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.08, 1.14, 48]} />
          <meshBasicMaterial
            color="#26343a"
            transparent
            opacity={0.35}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
        {/* Subtle inner accent dots */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.76, 24]} />
          <meshBasicMaterial
            color={sectorColor}
            transparent
            opacity={0.25}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
        {/* Flat needle pointing towards target */}
        <mesh
          geometry={compassNeedleGeom}
          position={[0, 0.003, 1.05]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={sectorColor}
            transparent
            opacity={0.85}
            side={T.DoubleSide}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      </group>

      {/* 2. Flat ground chevrons path trail */}
      <group ref={chevronsRef} visible={false}>
        {chevrons.map((c) => (
          <group key={c.id}>
            {/* Outer dark/colored chevron: completely flat against ground */}
            <mesh geometry={chevronGeom} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial
                color={sectorColor}
                transparent
                opacity={0.85}
                side={T.DoubleSide}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </mesh>
            {/* Inner cream highlight chevron: crisp stylized paper accent */}
            <mesh
              geometry={innerChevronGeom}
              position={[0, 0.002, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshBasicMaterial
                color="#f6f6ec"
                transparent
                opacity={0.92}
                side={T.DoubleSide}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-3}
                polygonOffsetUnits={-3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Destination Arrival Zone at Doorway (Flat ground target + delicate floating diamond) */}
      <group position={[tx, ty, tz]}>
        {/* Concentric rings flat on the ground */}
        <group ref={arrivalRingsRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
          {/* Outer arrival ring */}
          <mesh>
            <ringGeometry args={[1.45, 1.54, 48]} />
            <meshBasicMaterial
              color={sectorColor}
              transparent
              opacity={0.75}
              side={T.DoubleSide}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </mesh>
          {/* Inner ring */}
          <mesh>
            <ringGeometry args={[0.88, 0.94, 32]} />
            <meshBasicMaterial
              color="#26343a"
              transparent
              opacity={0.65}
              side={T.DoubleSide}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </mesh>
        </group>

        {/* Dynamic expanding pulse ring flat on ground */}
        <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]}>
          <ringGeometry args={[0.96, 1.04, 36]} />
          <meshBasicMaterial
            color={sectorColor}
            transparent
            opacity={0.45}
            side={T.DoubleSide}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>

        {/* Small, discreet hovering diamond pin above door threshold */}
        <group ref={diamondRef} position={[0, 2.6, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.26, 0]} />
            <meshBasicMaterial color="#ba6061" />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new T.OctahedronGeometry(0.265, 0)]} />
            <lineBasicMaterial color="#26343a" />
          </lineSegments>
        </group>
      </group>
    </group>
  )
}
