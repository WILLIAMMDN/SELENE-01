import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Solid, Sign, toon } from '../world/ArtKit'
import { COMPLETE_ASSEMBLY, MODULES, type ModuleId } from './assembly'
import poses from './odysseyFinalPoses.json'
import { ODYSSEY_SCALE, ODYSSEY_SIZE } from '../world/physicalScale'
import type { DesignConfig } from '../game/missionDesign'

function illustratedColor(material: T.Material) {
  const name = material.name.toLowerCase()
  if (/tinta|grafito|junta|cristal/.test(name)) return '#293d43'
  if (/naranja/.test(name)) return '#bd7862'
  if (/azul de señal/.test(name)) return '#4d8989'
  if (/cerámica blanca/.test(name)) return '#eae5d1'
  if (/perla/.test(name)) return '#cac9b8'
  if (/titanio|aleación/.test(name)) return '#758e8a'
  return (material as T.MeshStandardMaterial).color ?? '#d5d7c6'
}
function ModuleModel({ file }: { file: string }) {
  const { scene } = useGLTF(
    `${import.meta.env.BASE_URL}models/odyssey/${file}.glb?v=odyssey-final-1`,
  )
  const object = useMemo(() => {
    const copy = clone(scene)
    copy.traverse((child) => {
      if (child instanceof T.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        const convert = (source: T.Material) => {
          const original = source as T.MeshStandardMaterial
          return new T.MeshToonMaterial({
            name: source.name,
            color: illustratedColor(source),
            map: original.map ?? null,
            gradientMap: toon('#d5d7c6').gradientMap,
            side: source.side,
            transparent: source.transparent,
            opacity: source.opacity,
            alphaTest: source.alphaTest,
          })
        }
        child.material = Array.isArray(child.material)
          ? child.material.map(convert)
          : convert(child.material)
      }
    })
    copy.updateMatrixWorld(true)
    const edgeParts: T.BufferGeometry[] = []
    copy.traverse((child) => {
      if (child instanceof T.Mesh && !(child instanceof T.SkinnedMesh)) {
        const edges = new T.EdgesGeometry(child.geometry, 38)
        edges.applyMatrix4(child.matrixWorld)
        edgeParts.push(edges)
      }
    })
    if (edgeParts.length) {
      const merged = mergeGeometries(edgeParts)
      if (merged) {
        const lines = new T.LineSegments(
          merged,
          new T.LineBasicMaterial({ color: '#35474a', transparent: true, opacity: 0.65 }),
        )
        lines.name = 'Contornos de tinta'
        copy.add(lines)
      }
      edgeParts.forEach((g) => g.dispose())
    }
    return copy
  }, [scene])
  return <primitive object={object} dispose={null} />
}
class AssetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <Sign text="MODELO NO DISPONIBLE" position={[0, 3, 0]} scale={[4, 1, 1]} />
    ) : (
      this.props.children
    )
  }
}

/** Preserve supplied mating poses; apply one uniform project scale to the whole assembled craft. */
export default function OdysseyShip({
  parts = COMPLETE_ASSEMBLY,
  exploded = false,
  config,
  stowed = false,
}: {
  parts?: ModuleId[]
  exploded?: boolean
  config?: DesignConfig
  stowed?: boolean
}) {
  const installed = poses.nave_completa.filter((instance) => {
    if (stowed && instance.module === 'SOLAR_P01') return false
    if (instance.module === 'TANQUE-G01')
      return parts.includes('fuel') || parts.includes('fuelSmall')
    const module = MODULES.find((m) => m.sourceId === instance.module)
    return (
      module && parts.includes(module.id) && (module.id !== 'antenna' || parts.includes('habitat'))
    )
  })
  return (
    <group name="ODYSSEY" scale={ODYSSEY_SCALE}>
      <group position={[0, 6.075, 0]}>
        {installed.map((instance, i) => {
          const pose =
            instance.module === 'CM-01' && !parts.includes('habitat')
              ? poses.nave_basica.find((p) => p.module === 'CM-01')!
              : instance
          const p = pose.traslacion_m,
            q = pose.rotacion_xyzw,
            s = pose.escala
          const spread = exploded ? 1.75 : 1
          const up = exploded
            ? instance.module === 'CM-01'
              ? 3
              : instance.module === 'HAB-01'
                ? 1.5
                : instance.module === 'MP-01'
                  ? -1.5
                  : 0
            : 0
          const side = exploded
            ? instance.module === 'CONECTORES_MODULARES'
              ? 4
              : instance.module === 'SOPORTES_ESTRUCTURALES'
                ? -4
                : 0
            : 0
          const file =
            instance.module === 'TANQUE-G01' && parts.includes('fuelSmall')
              ? 'tanque_combustible_p01'
              : instance.file
          return (
            <group
              key={instance.name}
              name={instance.name}
              position={[p[0] * spread + side, p[1] + up, p[2] * spread]}
              quaternion={new T.Quaternion(q[0], q[1], q[2], q[3])}
              scale={[s[0], s[1], s[2]]}
            >
              <AssetBoundary>
                <Suspense
                  fallback={
                    <Solid position={[0, -i * 0.015, 0]} scale={[0.2, 0.2, 0.2]} color="#bd7862" />
                  }
                >
                  <ModuleModel file={file} />
                </Suspense>
              </AssetBoundary>
            </group>
          )
        })}
      </group>
      {stowed &&
        parts.includes('solar') &&
        [-1, 1].map((side) => (
          <Solid
            key={side}
            position={[side * 2.38, 6.8, 0]}
            scale={[0.12, 2.6, 1.5]}
            color="#45646a"
          />
        ))}
      {parts.includes('fuselage') && config && (
        <group name="Carga educativa">
          {config.instruments.map((instrument, i) => (
            <group key={instrument} position={[i === 1 ? -1.75 : 1.75, 6.7, i === 2 ? -1 : 1]}>
              <Solid
                scale={[0.6, 0.65, 0.7]}
                color={
                  instrument === 'camera'
                    ? '#4d8989'
                    : instrument === 'radar'
                      ? '#bd7862'
                      : '#cac9b8'
                }
              />
              <Solid
                kind="cylinder"
                position={[0, 0, 0.4]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.19, 0.18, 0.19]}
                color="#293d43"
              />
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

export function OdysseyDisplay({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Solid
        kind="cylinder"
        position={[0, 0.15, 0]}
        scale={[ODYSSEY_SIZE.padRadius, 0.3, ODYSSEY_SIZE.padRadius]}
        color="#c8c4ac"
      />
      <group position={[0, 0.3, 0]}>
        <OdysseyShip />
      </group>
      <Sign
        text="ODYSSEY / PROTOTIPO"
        sub="CONSTRUYE TU VERSIÓN EN EL HANGAR"
        position={[0, 1.3, ODYSSEY_SIZE.padRadius + 0.2]}
        scale={[3.5, 0.875, 1]}
      />
    </group>
  )
}
