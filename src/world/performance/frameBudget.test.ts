import { expect, it } from 'vitest'
import { FrameBudget } from './frameBudget'
it('ignores warmup, isolates tab suspension and bounds resolution under sustained load', () => {
  const budget = new FrameBudget()
  let dpr = 1.5
  for (let i = 0; i < 100; i++) expect(budget.sample(0.05, dpr, 1.5)).toBeNull()
  expect(budget.sample(3, dpr, 1.5)).toBeNull()
  for (let i = 0; i < 400; i++) dpr = budget.sample(0.05, dpr, 1.5) ?? dpr
  expect(dpr).toBe(1)
  for (let i = 0; i < 540; i++) dpr = budget.sample(1 / 60, dpr, 1.5) ?? dpr
  expect(dpr).toBe(1)
  for (let i = 0; i < 2000; i++) dpr = budget.sample(1 / 60, dpr, 1.5) ?? dpr
  expect(dpr).toBeGreaterThan(1)
  expect(dpr).toBeLessThanOrEqual(1.5)
})
