import { useFrame } from '@react-three/fiber'
import { buildingAt, occupant, foundation } from './buildingNavigation'
import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { CAMPUS_BUILDINGS } from './campusLayout'
import { toon, Solid, Sign } from './ArtKit'

const palette = (name: string) =>
  /Marfil/.test(name)
    ? '#e3e2c9'
    : /Ambar|Baliza/.test(name)
      ? '#be775d'
      : /Azul|Cable|Sustrato/.test(name)
        ? '#30434a'
        : /Pantalla|Indicador/.test(name)
          ? '#79b5ac'
          : /Luz|Luminaria|Faro/.test(name)
            ? '#e9dcb5'
            : /Feuillage/.test(name)
              ? '#3e825c'
              : /Hojas/.test(name)
                ? '#6ba876'
                : /Regolito|Roca/.test(name)
                  ? '#a79d86'
                  : /Cristal|solares/.test(name)
                    ? '#4f888c'
                    : '#7d9690'
const prepared = new WeakMap<T.Object3D, T.Object3D>()
function template(scene: T.Object3D) {
  const existing = prepared.get(scene)
  if (existing) return existing
  const root = scene.clone(true),
    materials = new Map<T.Material, T.Material>(),
    meshes: T.Mesh[] = []
  root.traverse((n) => {
    if (n instanceof T.Mesh) meshes.push(n)
  })
  for (const mesh of meshes) {
    const convert = (source: T.Material) => {
      if (materials.has(source)) return materials.get(source)!
      const original = source as T.MeshStandardMaterial
      const result = new T.MeshToonMaterial({
        color: palette(source.name),
        gradientMap: toon('#e3e2c9').gradientMap,
        map: original.map,
        side: T.DoubleSide,
      })
      result.name = source.name
      materials.set(source, result)
      return result
    }
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    // Silhouette shell follows bevel normals; no wireframe across wall triangles.
    const inkMaterial = new T.MeshBasicMaterial({ color: '#344145', side: T.BackSide })
    inkMaterial.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed += normal * 0.012;',
      )
    }
    const ink = new T.Mesh(mesh.geometry, inkMaterial)
    ink.name = 'Ink'
    mesh.add(ink)
  }
  prepared.set(scene, root)
  return root
}
type Building = (typeof CAMPUS_BUILDINGS)[number]
function Model({ building }: { building: Building }) {
  const { scene } = useGLTF(
    `${import.meta.env.BASE_URL}models/artemisa/${building.id}.glb?v=basepri-interiors-2`,
  )
  const actor = useMemo(() => template(scene).clone(true), [scene])
  const cover = useMemo(() => actor.getObjectByName('Cover'), [actor])
  const doors = useMemo(
    () => building.doors.map((door) => ({ door, object: actor.getObjectByName(door.name) })),
    [actor, building],
  )
  useFrame((_, dt) => {
    if (cover)
      cover.visible = !(
        occupant.active && buildingAt(occupant.x, occupant.z, occupant.earth) === building.id
      )
    for (const { door, object } of doors) {
      if (!object) continue
      if (building.id === 'airlock' && door.z < 0) {
        object.visible = false
        continue
      }
      const near =
        occupant.active &&
        Math.hypot(occupant.x - building.x - door.x, occupant.z - building.z - door.z) < 2.7
      object.position.y = T.MathUtils.damp(
        object.position.y,
        near ? 2.65 : 0,
        10,
        Math.min(dt, 0.05),
      )
    }
  })
  return <primitive object={actor} dispose={null} />
}
class BuildingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <Sign text="MÓDULO NO DISPONIBLE" position={[0, 1.5, 0]} scale={[3, 0.75, 1]} />
    ) : (
      this.props.children
    )
  }
}
export default function ArtemisaBuildings({
  height,
}: {
  height: (x: number, z: number) => number
}) {
  return (
    <>
      {CAMPUS_BUILDINGS.map((b) => {
        const levels = [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
          [0, 0],
        ].map(([x, z]) => height(b.x + (x * b.width) / 2, b.z + (z * b.depth) / 2))
        const base = Math.min(...levels),
          top = foundation(b, height),
          thickness = top - base
        return (
          <group key={b.id} position={[b.x, base, b.z]}>
            <Solid
              position={[0, thickness / 2, 0]}
              scale={[b.width + 0.6, thickness, b.depth + 0.6]}
              color="#c8c8af"
            />
            <group position={[0, thickness, 0]}>
              <BuildingBoundary>
                <Suspense fallback={null}>
                  <Model building={b} />
                </Suspense>
              </BuildingBoundary>
            </group>
            {b.doors
              .filter((d) => d.hx > 0.3 && b.id !== 'habitat' && !(b.id === 'airlock' && d.z < 0))
              .map((d) => {
                const floor = b.floors[0]
                if (!floor) return null
                const sign = d.z > floor.z ? 1 : -1
                const rise = top + floor.top + 0.015 - height(b.x + d.x, b.z + d.z + sign * 2)
                return (
                  <mesh key={d.name} position={[d.x, 0, 0]} receiveShadow>
                    <bufferGeometry>
                      <bufferAttribute
                        attach="attributes-position"
                        args={[
                          new Float32Array([
                            -d.hx - 0.15,
                            top + floor.top + 0.015 - base,
                            d.z,
                            d.hx + 0.15,
                            top + floor.top + 0.015 - base,
                            d.z,
                            -d.hx - 0.15,
                            top + floor.top + 0.015 - base - rise,
                            d.z + sign * 2,
                            d.hx + 0.15,
                            top + floor.top + 0.015 - base - rise,
                            d.z + sign * 2,
                          ]),
                          3,
                        ]}
                      />
                      <bufferAttribute
                        attach="index"
                        args={[new Uint16Array([0, 2, 1, 1, 2, 3]), 1]}
                      />
                    </bufferGeometry>
                    <meshBasicMaterial color="#c8c8af" side={T.DoubleSide} />
                  </mesh>
                )
              })}
            <Sign
              text={b.label}
              sub="ENTRADA · PUERTA AUTOMÁTICA"
              position={[b.width / 2 + 1, 1.25 + thickness, b.depth / 2 + 0.45]}
              scale={[2.4, 0.6, 1]}
            />
          </group>
        )
      })}
    </>
  )
}
