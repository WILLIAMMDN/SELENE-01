import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { FrameBudget } from './frameBudget'

/** Changes only render resolution, never geometry, authored colors, UI or movement. */
export default function AdaptiveResolution({
  enabled = true,
  maximum = 1.5,
}: {
  enabled?: boolean
  maximum?: number
}) {
  const budget = useRef(new FrameBudget())
  const setDpr = useThree((state) => state.setDpr)
  useEffect(() => {
    budget.current = new FrameBudget()
  }, [enabled, maximum])
  useFrame((state, delta) => {
    if (!enabled || document.hidden) return
    const next = budget.current.sample(
      delta,
      state.viewport.dpr,
      Math.min(maximum, window.devicePixelRatio || 1),
    )
    if (next !== null) setDpr(next)
  })
  return null
}
