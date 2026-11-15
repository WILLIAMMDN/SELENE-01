import { AIRLOCK_MODULE, AIRLOCK_WARDROBE } from './wardrobeStation'
import { foundation } from './buildingNavigation'
import { Sign } from './ArtKit'

export default function AirlockWardrobe({ height }: { height: (x: number, z: number) => number }) {
  const base = foundation(AIRLOCK_MODULE, height)
  const floor = base + AIRLOCK_MODULE.floors[0].top
  return (
    <group>
      <mesh position={[AIRLOCK_MODULE.x + 0.835, base + 1.64, AIRLOCK_WARDROBE.z]}>
        <boxGeometry args={[0.018, 0.3, 0.62]} />
        <meshToonMaterial color="#457d80" />
      </mesh>
      <Sign
        text="VESTUARIO"
        sub="E / CAMBIAR ROPA"
        position={[AIRLOCK_MODULE.x + 0.822, base + 1.64, AIRLOCK_WARDROBE.z]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[0.59, 0.25, 1]}
        bg="#457d80"
        fg="#f4efda"
      />
      <mesh
        position={[AIRLOCK_WARDROBE.x, floor + 0.019, AIRLOCK_WARDROBE.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.37, 0.41, 40]} />
        <meshBasicMaterial color="#83b9a5" transparent opacity={0.65} depthWrite={false} />
      </mesh>
    </group>
  )
}
