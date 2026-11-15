import EarthTools from './tools/EarthTools'
import OdysseyLander from '../spacecraft/OdysseyLander'
import EnvironmentProps from './EnvironmentProps'
import CampusWildlife from './CampusWildlife'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import OdysseyShip from '../spacecraft/OdysseyShip'
import { occupant, buildingAt, INTERIOR_STATIONS } from './buildingNavigation'
import CampusObservatory from './CampusObservatory'
import CampusAtmosphere from './CampusAtmosphere'
import ArtemisaBuildings from './ArtemisaBuildings'
import { IllustratedGround, CampusRoads } from './IllustratedTerrain'
import { CAMPUS_TREES } from './campusLayout'
import Tree from './IllustratedTrees'
import Rober from './Rober'
import LaunchComplex, { LAUNCH_SITE } from '../spacecraft/LaunchComplex'
import { OdysseyDisplay } from '../spacecraft/OdysseyShip'
import { memo, useRef } from 'react'
import { Solid, Sign, Window, Door, Solar, Bench, Stroke } from './ArtKit'
import { canWalk, groundHeight, PALETTE as P } from './worldData'

function Hangar() {
  const roof = useRef<Group>(null)
  useFrame(() => {
    if (roof.current) roof.current.visible = buildingAt(occupant.x, occupant.z) !== 'hangar'
  })
  return (
    <group position={[24, 0, -16]}>
      <Solid position={[0, 0.15, 0]} scale={[25, 0.3, 23]} color="#afb2a0" />
      <Solid position={[-11.35, 12.3, 0]} scale={[0.3, 24, 20]} color={P.paper} />
      <Solid position={[11.35, 12.3, 0]} scale={[0.3, 24, 20]} color={P.paper} />
      <Solid position={[0, 12.3, -9.85]} scale={[23, 24, 0.3]} color={P.paper} />
      {[-1, 1].map((side) => (
        <Solid
          key={side}
          position={[side * 9.4, 12.3, 9.85]}
          scale={[4.2, 24, 0.3]}
          color={P.paper}
        />
      ))}
      <Solid position={[0, 23.3, 9.85]} scale={[15, 2, 0.3]} color={P.teal} />
      <group ref={roof}>
        <Solid position={[0, 24.55, 0]} scale={[24, 0.5, 21]} color={P.teal} />
        <Solar position={[-5, 24.8, 0]} />
        <Solar position={[4, 24.8, 0]} />
      </group>
      <group position={[0, 0.31, -2]}>
        <OdysseyShip parts={['fuselage', 'connectors', 'engine', 'cabin']} />
      </group>
      <group position={[-6, 0.31, 5]}>
        <Solid position={[0, 0.5, 0]} scale={[1.4, 1, 0.65]} color={P.teal} />
        <Solid
          position={[0, 1.08, 0]}
          rotation={[-0.25, 0, 0]}
          scale={[1.3, 0.12, 0.65]}
          color={P.aqua}
        />
      </group>
      <Sign
        text="02 / INGENIERÍA"
        sub="ODYSSEY · HANGAR DE ENSAMBLAJE"
        position={[0, 23.4, 10.4]}
        scale={[8, 1.1, 1]}
        bg={P.teal}
        fg={P.cream}
      />
      <Door position={[-8.8, 1.46, 10.15]} color={P.teal} />
      {[3.3, 7.1, 10.9, 14.7].map((y) => (
        <Window key={y} position={[9, y, 10.2]} scale={[1.4, 1.3, 0.14]} />
      ))}
      <Solid position={[-10, 25.3, -6]} scale={[1.6, 1, 2]} color={P.paper} />
      <mesh rotation={[Math.atan2(0.31, 2), 0, 0]} position={[0, 0.155, 11]} receiveShadow>
        <boxGeometry args={[14, 0.04, 2]} />
        <meshToonMaterial color="#c8c8af" />
      </mesh>
      {[7, 10].map((x) => (
        <group key={x} position={[x, 0, 13]}>
          <Solid
            position={[0, 0.4, 0]}
            scale={[1.2, 0.8, 0.8]}
            color={x === 7 ? P.coral : P.teal}
          />
          <Solid position={[0, 0.83, 0]} scale={[1.25, 0.06, 0.85]} color={P.cream} />
          <Sign text="S—01" position={[0, 0.5, 0.42]} scale={[0.65, 0.16, 1]} />
        </group>
      ))}
      <Stroke
        points={[
          [12, 0.18, 11],
          [15, 0.18, 9],
          [16, 0.18, 3],
          [14, 0.18, -1],
        ]}
        width={0.06}
      />
    </group>
  )
}
function Launch() {
  return (
    <>
      <group position={[LAUNCH_SITE.x, 0, LAUNCH_SITE.z]}>
        <LaunchComplex />
      </group>
      <Sign
        text="04 / LANZAMIENTO ODYSSEY"
        sub="VEHÍCULO FICTICIO · AUTORIZACIÓN EN ESTE PUESTO"
        position={[64, 1.6, -35]}
        scale={[4.5, 1.12, 1]}
      />
      <group position={[61, 0, -35]}>
        <Solid position={[0, 0.55, 0]} scale={[1.3, 1.1, 0.55]} color={P.teal} />
        <Solid
          position={[0, 1.15, 0]}
          rotation={[-0.2, 0, 0]}
          scale={[1.2, 0.1, 0.65]}
          color={P.aqua}
        />
      </group>
    </>
  )
}

function Observatory() {
  return (
    <group position={[-51, 0, 42]}>
      <Solid kind="cylinder" position={[0, 0.06, 0]} scale={[8, 0.12, 8]} color={P.cream} />
      <Solid
        kind="torus"
        position={[0, 0.14, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[7, 7, 7]}
        color={P.teal}
      />
      <Solid kind="cylinder" position={[0, 1.8, 0]} scale={[0.25, 3, 0.25]} color={P.teal} />
      <Solid
        kind="cylinder"
        position={[0, 3.4, 0]}
        scale={[0.65, 3.9, 0.65]}
        rotation={[0.8, 0, 0.4]}
        color={P.cream}
      />
      <Sign
        text="05 / HORIZONTE"
        sub="OBSERVAR ES EL PRIMER PASO"
        position={[0, 1.7, 6.6]}
        scale={[5, 1.25, 1]}
      />
      <Bench position={[-4, 0.12, 1]} rotation={0.6} />
      <Bench position={[4, 0.12, 1]} rotation={-0.6} />
    </group>
  )
}
function Wayfinding() {
  return (
    <group position={[6, 0, 20]}>
      <Solid kind="cylinder" position={[0, 2, 0]} scale={[0.1, 4, 0.1]} color={P.ink} />
      <Sign text="← INVESTIGACIÓN" position={[0, 3.7, 0.1]} scale={[4.3, 1.07, 1]} bg={P.cream} />
      <Sign
        text="INGENIERÍA →"
        position={[0.3, 2.7, 0.12]}
        scale={[4, 1, 1]}
        bg={P.teal}
        fg={P.cream}
      />
      <Sign text="MIRADOR ↙" position={[-0.2, 1.7, 0.13]} scale={[3.6, 0.9, 1]} />
    </group>
  )
}
function Vega() {
  return (
    <group position={[-18.4, 0.475, -3]} rotation={[0, 0.4, 0]}>
      <Solid kind="capsule" position={[0, 1.1, 0]} scale={[0.44, 0.28, 0.28]} color={P.cream} />
      <Solid kind="sphere" position={[0, 1.58, 0]} scale={[0.13, 0.16, 0.14]} color="#c39c7d" />
      <Solid kind="sphere" position={[0, 1.64, -0.04]} scale={[0.145, 0.135, 0.12]} color={P.ink} />
      <Solid kind="sphere" position={[0, 1.64, -0.15]} scale={0.075} color={P.ink} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            kind="capsule"
            position={[side * 0.13, 0.49, 0]}
            scale={[0.18, 0.39, 0.2]}
            color={P.teal}
          />
          <Solid position={[side * 0.13, 0.065, 0.06]} scale={[0.18, 0.13, 0.29]} color={P.ink} />
          <Solid
            kind="capsule"
            position={[side * 0.26, 1.03, 0.03]}
            rotation={[0, 0, -side * 0.1]}
            scale={[0.14, 0.3, 0.15]}
            color={P.cream}
          />
        </group>
      ))}
      <Solid
        position={[0.2, 1, 0.18]}
        rotation={[0.12, 0, -0.16]}
        scale={[0.23, 0.31, 0.035]}
        color={P.coral}
      />
      <Sign text="DRA. VEGA" position={[0, 2.02, 0]} scale={[0.9, 0.225, 1]} />
    </group>
  )
}
function Landscape({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      {CAMPUS_TREES.map(([x, z], i) => (
        <Tree
          reduced={reduced}
          key={i}
          position={[x, groundHeight(x, z), z]}
          scale={0.85 + (i % 4) * 0.12}
          variant={i}
        />
      ))}
    </>
  )
}
export default memo(function Environment({
  reduced = false,
  paused = false,
}: {
  reduced?: boolean
  paused?: boolean
}) {
  return (
    <>
      <IllustratedGround />
      <CampusRoads />
      <EnvironmentProps />
      <EarthTools paused={paused} reduced={reduced} />
      <OdysseyLander x={87} z={-13} height={groundHeight} paused={paused} training />
      <CampusWildlife reduced={reduced} paused={paused} />
      <CampusAtmosphere reduced={reduced} />
      <Landscape reduced={reduced} />
      <ArtemisaBuildings height={groundHeight} />
      {INTERIOR_STATIONS.map((st) => (
        <Sign
          key={st.room}
          text="E / USAR ESTACIÓN"
          position={[st.x, 1.9, st.z]}
          scale={[1.2, 0.3, 1]}
        />
      ))}
      <Hangar />
      <OdysseyDisplay position={[49, groundHeight(49, -16), -16]} />
      <Launch />
      <Observatory />
      <CampusObservatory paused={paused} reduced={reduced} />
      <Rober
        position={[34, groundHeight(34, 8), 8]}
        height={groundHeight}
        canWalk={canWalk}
        reduced={reduced}
        paused={paused}
      />
      <Wayfinding />
      <Vega />
      {[0, 1, 2, 3, 4].map((i) => (
        <Solid
          key={`crossing${i}`}
          position={[0, groundHeight(0, 49 + i * 0.65) + 0.085, 49 + i * 0.65]}
          scale={[3.8, 0.012, 0.32]}
          color="#e2e3cb"
          outline={false}
          shadow={false}
        />
      ))}

      <group position={[0, 0, 57]}>
        <Solid position={[-7, 2.4, 0]} scale={[0.4, 4.8, 0.4]} color={P.teal} />
        <Solid position={[7, 2.4, 0]} scale={[0.4, 4.8, 0.4]} color={P.teal} />
        <Sign
          text="LA AVENTURA EMPIEZA AQUÍ"
          sub="SELENE—01 / CAMPUS DE EXPLORACIÓN"
          position={[0, 4.9, 0]}
          scale={[13, 3.25, 1]}
        />
      </group>
    </>
  )
})
