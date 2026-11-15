import { BENCHES, CHAIRS, BINS, LAMPS } from './navigation/propLayout'
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as T from 'three'
import { toon, Sign } from './ArtKit'
import { groundHeight } from './worldData'
const palette = (m: T.Material) => {
  const c = (m as T.MeshStandardMaterial).color?.clone() ?? new T.Color('#c7cdb7'),
    h = { h: 0, s: 0, l: 0 }
  c.getHSL(h)
  if (h.l < 0.12) return '#31434a'
  if (h.l > 0.78 && h.s < 0.25) return '#e1e3cb'
  if (h.s > 0.3 && h.h > 0.2 && h.h < 0.5) return h.l > 0.45 ? '#649e72' : '#3e7957'
  if (h.s > 0.35 && (h.h < 0.12 || h.h > 0.9)) return '#bd7760'
  return c.lerp(new T.Color('#95b4aa'), 0.18)
}
const preparedProps = new WeakMap<T.Object3D, T.Object3D>()
export function SceneryProp({
  name,
  position,
  rotation = 0,
  scale = 1,
}: {
  name: string
  position: [number, number, number]
  rotation?: number
  scale?: number
}) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/environment/elementos_entorno.glb`)
  const actor = useMemo(() => {
    const source = scene.getObjectByName(name)
    if (!source) return null
    const cached = preparedProps.get(source)
    if (cached) return cached.clone(true)
    const root = source.clone(true)
    root.position.set(0, 0, 0)
    const meshes: T.Mesh[] = []
    root.traverse((o) => {
      if (o instanceof T.Mesh) meshes.push(o)
    })
    for (const mesh of meshes) {
      const convert = (m: T.Material) =>
        new T.MeshToonMaterial({
          color: palette(m),
          map: (m as T.MeshStandardMaterial).map,
          gradientMap: toon('#dce0cf').gradientMap,
          side: m.side,
        })
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(convert)
        : convert(mesh.material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      const ink = new T.LineSegments(
        new T.EdgesGeometry(mesh.geometry, 40),
        new T.LineBasicMaterial({ color: '#3a5152', transparent: true, opacity: 0.6 }),
      )
      mesh.add(ink)
    }
    preparedProps.set(source, root)
    return root.clone(true)
  }, [scene, name])
  return actor ? (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={actor} dispose={null} />
    </group>
  ) : null
}
export default function EnvironmentProps() {
  return (
    <>
      <SceneryProp name="Env_Parking_Bloque_4Cajones" position={[33, 0, 43]} />
      <SceneryProp name="Env_Parking_Bloque_Acceso_Vial" position={[33, 0, 50.4]} />
      <SceneryProp name="Env_Parking_Bloque_2Cajones" position={[61, 0, 31]} />
      <SceneryProp name="Env_Parking_Bloque_Acceso_Vial" position={[61, 0, 38.4]} scale={0.55} />
      <SceneryProp name="Vehiculo_Van_Transporte" position={[30, 0.13, 43]} />
      <SceneryProp name="Vehiculo_Camion_Carga" position={[61, 0.13, 31]} />
      <SceneryProp name="Vehiculo_Buggy_Colonia" position={[30, 0, 20]} />
      <Sign text="TRANSPORTE / ARTEMISA" position={[42, 1.5, 48]} scale={[2.3, 0.575, 1]} />
      {BENCHES.map(([x, z, r], i) => (
        <SceneryProp
          key={`bench${i}`}
          name="Prop_Banca_Colonia"
          position={[x, groundHeight(x, z), z]}
          rotation={r}
        />
      ))}
      {CHAIRS.map(([x, z, r], i) => (
        <SceneryProp
          key={`chair${i}`}
          name="Prop_Silla_Colonia"
          position={[x, groundHeight(x, z), z]}
          rotation={r}
        />
      ))}
      {BINS.map(([x, z], i) => (
        <SceneryProp
          key={`bin${i}`}
          name="Prop_Tacho_Basura"
          position={[x, groundHeight(x, z), z]}
        />
      ))}
      {LAMPS.map(([x, z], i) => (
        <SceneryProp
          key={`lamp${i}`}
          name="Prop_Farola_Colonia"
          position={[x, groundHeight(x, z), z]}
          rotation={i % 2 ? Math.PI : 0}
        />
      ))}
      {[
        [-22, 3],
        [-12, 3],
        [18, 19],
        [29, 16],
        [-46, -28],
        [-56, -27],
        [-30, 29],
        [-19, 30],
        [-11, 29],
        [16, 32],
        [44, 40],
        [-70, 22],
        [-71, -1],
      ].map(([x, z], i) => (
        <SceneryProp
          key={`bush${i}`}
          name={['Prop_Arbusto_Flores', 'Prop_Arbusto_Grupo', 'Prop_Arbusto_Seto_Camino'][i % 3]}
          position={[x, groundHeight(x, z), z]}
          rotation={i * 0.9}
        />
      ))}
      {[
        [170, -115, 1.7, 0.3],
        [-155, -125, 1.4, -0.3],
        [30, -195, 2.1, 0],
        [-175, 130, 1.6, 1],
      ].map(([x, z, s, r], i) => (
        <SceneryProp
          key={`ridge${i}`}
          name={i % 2 ? 'Env_Montana_Pico_Grande' : 'Env_Montana_Cordillera_Grande'}
          position={[x, groundHeight(x, z) - 4, z]}
          rotation={r}
          scale={s}
        />
      ))}
    </>
  )
}
