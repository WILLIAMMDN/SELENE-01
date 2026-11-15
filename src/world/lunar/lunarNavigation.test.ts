import { expect, it } from 'vitest'
import { lunarCanDrive, lunarCanWalk } from './lunarNavigation'
import { LUNAR_RESOURCES } from './lunarResources'
import layout from './lunarLayout.json'

it('lets the rover cross small rocks and the crater floor while blocking modules', () => {
  const rock = layout.colliders[10]
  expect(lunarCanWalk(rock.x, rock.z)).toBe(false)
  expect(lunarCanDrive(rock.x, rock.z, 0)).toBe(true)
  for (let z = -46; z >= -56; z--) expect(lunarCanDrive(26, z, 0)).toBe(true)
  expect(lunarCanDrive(63, 78, 0)).toBe(false)
})

it('keeps the journal arrival points within walking range and outside obstacles', () => {
  for (const { name, position: [x, z] } of LUNAR_RESOURCES)
    expect(lunarCanWalk(x, z - 2.15), name).toBe(true)
})
