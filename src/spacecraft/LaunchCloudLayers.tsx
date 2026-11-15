import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAUNCH_SITE } from './LaunchComplex'
import type { LauncherId } from '../game/missionDesign'
import { getLaunchFrame, type LaunchClock } from './launchTimeline'

/** Three airy illustrated cloud decks, in the launch site's world coordinates. */
const DECKS = [350, 660, 1040] as const
const PUFF_COUNT = 48

function CloudDeck({
  altitude,
  index,
  clock,
  launcher,
}: {
  altitude: number
  index: number
  clock: LaunchClock
  launcher: LauncherId
}) {
  const instances = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: index === 0 ? '#e9eee4' : index === 1 ? '#f6f5e9' : '#d5e0e3',
        transparent: true,
        depthWrite: false,
        opacity: 0,
        fog: false,
      }),
    [index],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = instances.current
    if (!mesh) return
    for (let i = 0; i < PUFF_COUNT; i++) {
      const cluster = Math.floor(i / 3)
      const puff = i % 3
      const angle = cluster * 2.39996 + index * 0.9
      const radius = 65 + ((cluster * 37 + index * 41) % 110)
      const x = LAUNCH_SITE.x + Math.cos(angle) * radius + (puff - 1) * 19
      const z = LAUNCH_SITE.z + Math.sin(angle) * radius + Math.sin(puff * 2 + cluster) * 10
      dummy.position.set(x, altitude + ((cluster * 13) % 37) - 18, z)
      dummy.rotation.set(0, angle, (puff - 1) * 0.045)
      dummy.scale.set(
        22 + (cluster % 5) * 6,
        10 + ((cluster + puff) % 4) * 3.2,
        19 + ((cluster + index) % 5) * 5,
      )
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
    return () => {
      // Geometry and material are owned by this component, not by useGLTF.
      geometry.dispose()
      material.dispose()
    }
  }, [altitude, dummy, geometry, index, material])

  useFrame(() => {
    const frame = getLaunchFrame(clock.current, launcher)
    const rising = Math.min(1, Math.max(0, (frame.time - 16) / 4))
    const thinning = Math.min(1, Math.max(0, (frame.time - 36) / 8))
    const proximity = Math.abs(frame.altitudeMeters - altitude)
    // Clouds remain visible at a distance, become denser near the flight path.
    material.opacity = rising * (1 - thinning) * (0.22 + 0.38 * Math.max(0, 1 - proximity / 350))
    if (instances.current) instances.current.visible = material.opacity > 0.015
  })
  return (
    <instancedMesh
      ref={instances}
      args={[geometry, material, PUFF_COUNT]}
      frustumCulled={false}
      visible={false}
      renderOrder={3}
    />
  )
}

export default function LaunchCloudLayers({
  clock,
  launcher,
}: {
  clock: LaunchClock
  launcher: LauncherId
}) {
  return (
    <>
      {DECKS.map((altitude, index) => (
        <CloudDeck
          key={altitude}
          clock={clock}
          launcher={launcher}
          altitude={altitude}
          index={index}
        />
      ))}
    </>
  )
}
