import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import Astronaut from '../world/Astronaut'
import { ODYSSEY_SCALE } from '../world/physicalScale'
import { LAUNCH_SITE } from './LaunchComplex'
import type { LaunchClock } from './launchTimeline'

/**
 * Short, diegetic boarding beat on the actual crew arm of the launch GLB.
 * The player is represented by the established illustrated astronaut.
 * This is a staged cutscene, not a replacement for full first-person traversal.
 */
export default function LaunchBoarding({ clock }: { clock: LaunchClock }) {
  const actor = useRef<Group>(null)
  const moving = useRef(1)
  const phase = useRef(0)
  const deckHeight = 40.3 * ODYSSEY_SCALE
  useFrame((_, delta) => {
    const actorGroup = actor.current
    if (!actorGroup) return
    const elapsed = clock.current
    const walk = Math.min(1, Math.max(0, elapsed / 4))
    actorGroup.visible = elapsed < 4.5
    // The crew access pivot in plataforma_odyssey_v01.glb is at y=40.3.
    actorGroup.position.set(LAUNCH_SITE.x, deckHeight + 0.15, LAUNCH_SITE.z - 14 + 10 * walk)
    moving.current = elapsed < 3.9 ? 1 : 0
    phase.current += delta * 7
  })
  return (
    <group ref={actor} visible={false}>
      <Astronaut moving={moving} phase={phase} />
    </group>
  )
}
