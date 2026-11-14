import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'

function MoonGround() {
  const craters: [number, number, number][] = [
    [-13, -11, 2.8], [-10, 5, 1.8], [11, -10, 2.9], [13, 8, 1.9],
    [-5, -16, 3.2], [17, -3, 1.5], [-17, 1, 2.5],
  ]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#777d86" roughness={1} />
      </mesh>
      {craters.map(([x, z, r], index) => (
        <group key={index} position={[x, 0.018, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[r * 0.85, 40]} />
            <meshStandardMaterial color="#606773" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[r * 0.83, r, 40]} />
            <meshStandardMaterial color="#a5a8ad" roughness={1} />
          </mesh>
        </group>
      ))}
      {[[-14, 9, 1.8], [9, 14, 2.6], [-18, -17, 3.6]].map(([x, z, scale], index) => (
        <mesh key={index} position={[x, scale * 0.24, z]} scale={[scale * 1.6, scale * 0.4, scale]} receiveShadow>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#8d9094" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function Habitat() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.15, 3.35, 0.7, 36]} />
        <meshStandardMaterial color="#d7dee6" metalness={0.14} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[3.1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cbd7e0" metalness={0.2} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.12, 0.09, 10, 64]} />
        <meshStandardMaterial color="#e6a469" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.9, 2.2]} castShadow>
        <boxGeometry args={[2.3, 1.45, 2.4]} />
        <meshStandardMaterial color="#e7edf3" />
      </mesh>
      <mesh position={[0, 1.85, 3.43]}>
        <boxGeometry args={[1, 1.05, 0.04]} />
        <meshStandardMaterial color="#324a61" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[0, 2.45, 3.47]}>
        <boxGeometry args={[1.4, 0.1, 0.06]} />
        <meshStandardMaterial color="#f0b572" emissive="#c16b26" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 3.65, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 12]} />
        <meshStandardMaterial color="#c9d4da" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#f5b96c" emissive="#f5a341" emissiveIntensity={1.7} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.1, 1.55, 0]}>
          <mesh rotation={[0, side * 0.35, 0]}>
            <boxGeometry args={[0.75, 0.8, 0.12]} />
            <meshStandardMaterial color="#6aaac5" metalness={0.35} roughness={0.22} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SolarArray({ position, angle = 0 }: { position: [number, number, number]; angle?: number }) {
  return (
    <group position={position} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.4, 12]} />
        <meshStandardMaterial color="#c6d0d9" metalness={0.7} />
      </mesh>
      <group rotation={[-0.23, 0, 0]} position={[0, 1.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[5, 0.08, 2.3]} />
          <meshStandardMaterial color="#a3c1d2" metalness={0.65} />
        </mesh>
        {[-1.8, -0.6, 0.6, 1.8].map((x) =>
          [-0.52, 0.52].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.06, z]}>
              <boxGeometry args={[1.06, 0.04, 0.94]} />
              <meshStandardMaterial color="#153d66" metalness={0.38} roughness={0.25} />
            </mesh>
          )),
        )}
      </group>
    </group>
  )
}

function Rover() {
  return (
    <group position={[7, 0.7, 2]} rotation={[0, -0.35, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 0.65, 1.4]} />
        <meshStandardMaterial color="#e5e8dd" metalness={0.2} />
      </mesh>
      <mesh position={[-0.4, 0.55, 0]} castShadow>
        <boxGeometry args={[1.1, 0.68, 1.12]} />
        <meshStandardMaterial color="#304f62" metalness={0.5} />
      </mesh>
      {[-0.93, 0.93].map((x) => [-0.82, 0.82].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, -0.35, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.24, 16]} />
          <meshStandardMaterial color="#273443" roughness={0.9} />
        </mesh>
      )))}
      <mesh position={[0.85, 0.77, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
        <meshStandardMaterial color="#eff3ef" />
      </mesh>
      <mesh position={[0.85, 1.3, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#ffc381" emissive="#df8738" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}

function Astronaut() {
  return (
    <Float speed={1.4} rotationIntensity={0.05} floatIntensity={0.08}>
      <group position={[-4.2, 0.95, 3]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.67, 0.85, 0.49]} />
          <meshStandardMaterial color="#e6ebed" />
        </mesh>
        <mesh position={[0, 1.04, 0]} castShadow>
          <sphereGeometry args={[0.47, 24, 16]} />
          <meshStandardMaterial color="#e5edf2" />
        </mesh>
        <mesh position={[0, 1.08, 0.24]}>
          <sphereGeometry args={[0.33, 20, 12]} />
          <meshStandardMaterial color="#254962" metalness={0.55} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.36, -0.35]}>
          <boxGeometry args={[0.55, 0.7, 0.35]} />
          <meshStandardMaterial color="#d0a87a" />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.48, 0.28, 0]} rotation={[0, 0, side * 0.13]} castShadow>
              <capsuleGeometry args={[0.13, 0.55, 4, 12]} />
              <meshStandardMaterial color="#dce4ea" />
            </mesh>
            <mesh position={[side * 0.22, -0.36, 0]} castShadow>
              <capsuleGeometry args={[0.18, 0.48, 4, 12]} />
              <meshStandardMaterial color="#f0f2f2" />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  )
}

function Earth() {
  return (
    <group position={[-27, 19, -49]}>
      <mesh>
        <sphereGeometry args={[4.3, 32, 24]} />
        <meshStandardMaterial color="#3673a8" emissive="#14375a" emissiveIntensity={0.3} roughness={1} />
      </mesh>
      <mesh position={[1, 0.4, 0.7]} scale={[0.8, 0.4, 0.25]}>
        <sphereGeometry args={[3.3, 20, 16]} />
        <meshStandardMaterial color="#b4cfcb" roughness={1} />
      </mesh>
      <mesh position={[-1.3, -1.2, 1.4]} scale={[0.55, 0.6, 0.3]}>
        <sphereGeometry args={[2.1, 18, 12]} />
        <meshStandardMaterial color="#95c7ac" />
      </mesh>
    </group>
  )
}

function BaseScene() {
  return (
    <>
      <color attach="background" args={['#0a1525']} />
      <fog attach="fog" args={['#0a1525', 33, 92]} />
      <ambientLight intensity={1.25} color="#afc4db" />
      <hemisphereLight args={['#91b2d8', '#6c625a', 1.5]} />
      <directionalLight position={[12, 21, 7]} intensity={2.8} color="#ffe8c7" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} />
      <Stars radius={90} depth={55} count={1900} factor={3.4} saturation={0} fade speed={0} />
      <Earth />
      <MoonGround />
      <Habitat />
      <SolarArray position={[-7.4, 0, -2.7]} angle={-0.18} />
      <SolarArray position={[7.4, 0, -4.4]} angle={0.3} />
      <Rover />
      <Astronaut />
      <OrbitControls makeDefault target={[0, 1.2, 0]} enablePan={false} enableDamping minDistance={9} maxDistance={29} minPolarAngle={0.25} maxPolarAngle={Math.PI / 2.3} />
    </>
  )
}

export default function LunarBase() {
  return (
    <div className="scene-canvas" aria-label="Vista 3D interactiva de la base lunar">
      <Canvas camera={{ position: [12, 9, 16], fov: 45, near: 0.1, far: 250 }} shadows dpr={[1, 1.8]} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <BaseScene />
        </Suspense>
      </Canvas>
      <div className="scene-label"><span className="pulse-dot" /> SECTOR HABITABLE · POLO SUR LUNAR</div>
      <div className="scene-hint">Arrastra para explorar · Rueda para acercarte</div>
    </div>
  )
}
